

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
    if systemctl is-active --quiet $1; then
        echo "✓ $1 is running"
        return 0
    else
        echo "✗ $1 is not running"
        return 1
    fi
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
    pm2 start server.js --name "first-night-backend"
    
    echo "Starting Nginx..."
    nginx -t || exit 1
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

# Install certbot
apt install -y certbot python3-certbot-nginx

# Configure firewall
echo "Configuring firewall..."
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 22/tcp
ufw --force enable

# Stop services
systemctl stop nginx || true
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

# Configure Nginx
echo "Configuring Nginx..."
cat > /etc/nginx/sites-available/first-night << EOL
server {
    listen 80;
    listen [::]:80;
    server_name technovatechnologies.in;

    root /var/www/first-night/client/build;
    index index.html;

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
    }

    # Add security headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-XSS-Protection "1; mode=block";
    add_header X-Content-Type-Options "nosniff";
}
EOL

# Verify Nginx config
nginx -t || exit 1

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
        
        # Verify SSL certificate
        if [ -f "/etc/letsencrypt/live/technovatechnologies.in/fullchain.pem" ]; then
            echo "✓ SSL certificate installed successfully"
        else
            echo "✗ SSL certificate installation failed"
            exit 1
        fi
        
        # Restart Nginx one final time
        systemctl restart nginx
        
        echo "Deployment completed successfully!"
        echo "Your site should be accessible at: https://technovatechnologies.in"
        
        # Show service status
        echo -e "\nService Status:"
        echo "---------------"
        echo "Nginx status:"
        systemctl status nginx --no-pager
        echo -e "\nMongoDB status:"
        systemctl status mongod --no-pager
        echo -e "\nPM2 processes:"
        pm2 list
        echo -e "\nOpen ports:"
        netstat -tulpn | grep -E ':80|:443'
        
        # Final verification
        echo -e "\nFinal Checks:"
        echo "-------------"
        verify_service nginx && \
        verify_service mongod && \
        pm2 list | grep "online" > /dev/null && \
        echo "✓ All services are running properly" || \
        echo "✗ Some services are not running properly"
        
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