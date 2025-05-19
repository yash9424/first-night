#!/bin/bash

# Exit on any error
set -e

# Function to check if domain points to correct IP
check_dns() {
    echo "Checking DNS settings..."
    DOMAIN="technovatechnologies.in"
    EXPECTED_IP="69.62.80.180"
    
    echo "Fetching DNS records from multiple sources..."
    # Try different DNS servers
    for DNS in "8.8.8.8" "1.1.1.1" "9.9.9.9"; do
        echo "Checking with DNS server $DNS..."
        CURRENT_IP=$(dig @$DNS +short $DOMAIN | grep -v "\.$" | head -n 1)
        if [ "$CURRENT_IP" = "$EXPECTED_IP" ]; then
            echo "✓ DNS check passed with server $DNS"
            return 0
        fi
        echo "✗ Got IP: $CURRENT_IP (expected: $EXPECTED_IP)"
    done
    return 1
}

# Function to verify service is running
verify_service() {
    if ! systemctl is-active --quiet $1; then
        echo "Error: $1 is not running!"
        return 1
    fi
    echo "✓ $1 is running"
    return 0
}

# Function to restart all services
restart_services() {
    echo "Stopping all services..."
    systemctl stop nginx || true
    pm2 delete all || true
    
    echo "Starting MongoDB..."
    systemctl restart mongod
    verify_service mongod || exit 1
    
    echo "Starting backend..."
    cd /var/www/first-night/server || exit 1
    pm2 start server.js --name "first-night-backend" || exit 1
    
    echo "Starting Nginx..."
    nginx -t || exit 1  # Test configuration before starting
    systemctl start nginx
    verify_service nginx || exit 1
}

# Update system
echo "Updating system..."
apt update && apt upgrade -y

# Install required packages
echo "Installing required packages..."
apt install -y curl
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs npm nginx dnsutils

# Install MongoDB
echo "Installing MongoDB..."
curl -fsSL https://pgp.mongodb.com/server-7.0.asc | \
   gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg \
   --dearmor
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list
apt update
apt install -y mongodb-org
systemctl start mongod
systemctl enable mongod

# Install Certbot
apt install -y certbot python3-certbot-nginx

# Configure firewall
echo "Configuring firewall..."
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 22/tcp
ufw --force enable

# Stop services
systemctl stop nginx
pm2 delete all || true

# Setup application
echo "Setting up application..."
rm -rf /var/www/first-night
mkdir -p /var/www/first-night
cd /var/www/first-night || exit 1

# Clone repository
echo "Cloning repository..."
git clone https://github.com/yash9424/first-night.git . || exit 1

# Install PM2 globally
npm install -g pm2

# Setup backend
cd server || exit 1
npm install
echo "Creating .env file..."
cat > .env << EOL
PORT=5000
MONGODB_URI=mongodb://localhost:27017/jewelry_shop
JWT_SECRET=$(openssl rand -base64 32)
EOL

# Setup frontend
cd ../client || exit 1
npm install
npm run build

# Verify build directory exists
if [ ! -d "build" ]; then
    echo "Error: Frontend build failed! Build directory not found."
    exit 1
fi

# Configure Nginx
echo "Configuring Nginx..."
cat > /etc/nginx/sites-available/first-night << EOL
server {
    listen 80;
    listen [::]:80;
    server_name technovatechnologies.in;

    root /var/www/first-night/client/build;
    index index.html;

    # Increase max body size for file uploads
    client_max_body_size 10M;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # Increase timeouts for long-running requests
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
EOL

# Enable site
ln -sf /etc/nginx/sites-available/first-night /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Start all services
restart_services

# Wait for DNS propagation
echo "Waiting for DNS propagation (checking every 30 seconds)..."
ATTEMPTS=0
MAX_ATTEMPTS=10

while [ $ATTEMPTS -lt $MAX_ATTEMPTS ]; do
    if check_dns; then
        echo "DNS propagation complete! Proceeding with SSL setup..."
        # Setup SSL
        certbot --nginx -d technovatechnologies.in --non-interactive --agree-tos --email vivekvora3226@gmail.com
        
        # Restart Nginx one final time
        systemctl restart nginx
        verify_service nginx || exit 1
        
        echo "Deployment completed successfully!"
        echo "Your site should be accessible at: https://technovatechnologies.in"
        
        # Show service status
        echo -e "\nService Status:"
        echo "---------------"
        systemctl status nginx --no-pager
        systemctl status mongod --no-pager
        pm2 list
        echo -e "\nOpen ports:"
        netstat -tulpn | grep -E ':80|:443'
        
        # Final verification
        echo -e "\nVerifying all services..."
        verify_service nginx
        verify_service mongod
        pm2 list | grep "online" || echo "Warning: Backend service may not be running properly"
        
        exit 0
    fi
    
    ATTEMPTS=$((ATTEMPTS + 1))
    if [ $ATTEMPTS -lt $MAX_ATTEMPTS ]; then
        echo "DNS not propagated yet. Waiting 30 seconds... (Attempt $ATTEMPTS of $MAX_ATTEMPTS)"
        sleep 30
    fi
done

echo "DNS propagation check timed out after 5 minutes."
echo "Please verify your DNS settings and try again."
exit 1 