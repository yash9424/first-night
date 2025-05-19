#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting deployment process for TechnovaTechnologies.in..."

# Create log directory
sudo mkdir -p /var/log/pm2
sudo chown -R $USER:$USER /var/log/pm2

# Update system (non-interactive)
echo "📦 Updating system packages..."
sudo DEBIAN_FRONTEND=noninteractive apt-get update -y
sudo DEBIAN_FRONTEND=noninteractive apt-get upgrade -yq

# Install required packages
echo "📦 Installing required packages..."
sudo apt-get install -y curl git nginx certbot python3-certbot-nginx

# Install Node.js 18.x if not installed
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Install MongoDB if not installed
if ! command -v mongod &> /dev/null; then
    echo "📦 Installing MongoDB..."
    curl -fsSL https://pgp.mongodb.com/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
    echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
    sudo apt-get update
    sudo apt-get install -y mongodb-org
    sudo systemctl start mongod
    sudo systemctl enable mongod
fi

# Install PM2 globally
echo "📦 Installing PM2..."
sudo npm install -g pm2

# Create necessary directories
echo "📁 Creating directories..."
sudo mkdir -p /var/www/client/build
sudo mkdir -p /var/www/uploads
sudo mkdir -p /var/www/html/.well-known/acme-challenge
sudo chown -R $USER:$USER /var/www

# Clone repository if not exists
if [ ! -d "/root/first-night" ]; then
    echo "📥 Cloning repository..."
    git clone https://github.com/yash9424/first-night.git /root/first-night
fi

# Navigate to project directory
cd /root/first-night

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin main

# Setup client
echo "🏗️ Building client..."
cd client
npm ci
echo "REACT_APP_API_URL=http://technovatechnologies.in/api" > .env
npm run build
sudo cp -r build/* /var/www/client/build/

# Setup basic Nginx configuration first
echo "🌐 Setting up initial Nginx configuration..."
cat > /etc/nginx/sites-available/technovatechnologies.in << 'EOL'
server {
    listen 80;
    server_name technovatechnologies.in www.technovatechnologies.in;
    
    root /var/www/client/build;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /uploads {
        alias /var/www/uploads;
        client_max_body_size 10M;
    }
}
EOL

# Enable site and remove default
sudo ln -sf /etc/nginx/sites-available/technovatechnologies.in /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
echo "🔍 Testing Nginx configuration..."
sudo nginx -t

# Restart Nginx
echo "🔄 Restarting Nginx..."
sudo systemctl restart nginx

# Obtain SSL certificate
echo "🔒 Setting up SSL certificate..."
sudo certbot --nginx -d technovatechnologies.in -d www.technovatechnologies.in --agree-tos --email vivekvora3226@gmail.com --non-interactive || {
    echo "⚠️ SSL setup failed - will try again later"
    exit 1
}

# Run backend fix script
echo "🔧 Running backend fix script..."
bash fix_backend.sh

echo "✅ Deployment completed successfully!"
echo "🌐 Your site should now be accessible at https://technovatechnologies.in"