#!/bin/bash

# Exit on error
set -e

# Configuration
APP_NAME="technovatechnologies"
DEPLOY_USER="$USER"
APP_DIR="/var/www"
NODE_VERSION="20.11.1"
PM2_SERVICE_NAME="pm2-$DEPLOY_USER"

echo "Starting deployment process..."

# Update system
echo "Updating system packages..."
sudo apt-get update
sudo apt-get upgrade -y

# Install required packages
echo "Installing required packages..."
sudo apt-get install -y curl build-essential git nginx certbot python3-certbot-nginx

# Install Node.js if not present
if ! command -v node &> /dev/null; then
    echo "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Create necessary directories
echo "Setting up directories..."
sudo mkdir -p $APP_DIR/client/build
sudo mkdir -p $APP_DIR/uploads
sudo mkdir -p /var/log/pm2

# Set proper permissions
echo "Setting permissions..."
sudo chown -R $DEPLOY_USER:$DEPLOY_USER $APP_DIR
sudo chown -R $DEPLOY_USER:$DEPLOY_USER /var/log/pm2

# Setup backend first
echo "Setting up backend..."
chmod +x setup_backend.sh
./setup_backend.sh

# Install dependencies and build client
echo "Building client..."
cd client
npm ci --production
npm run build
sudo cp -r build/* $APP_DIR/client/build/

# Configure Nginx
echo "Configuring Nginx..."
sudo cp ../nginx.conf /etc/nginx/sites-available/$APP_NAME
sudo ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
echo "Testing Nginx configuration..."
sudo nginx -t

# Setup SSL with Let's Encrypt
echo "Setting up SSL..."
sudo certbot --nginx -d technovatechnologies.in -d www.technovatechnologies.in --non-interactive --agree-tos --email admin@technovatechnologies.in

# Restart Nginx
echo "Restarting Nginx..."
sudo systemctl restart nginx

# Setup log rotation
echo "Setting up log rotation..."
sudo tee /etc/logrotate.d/$APP_NAME << EOF
/var/log/pm2/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 0640 $DEPLOY_USER $DEPLOY_USER
}
EOF

# Setup system optimizations
echo "Optimizing system settings..."
sudo tee /etc/sysctl.d/99-app-optimizations.conf << EOF
# Increase system file descriptor limit
fs.file-max = 65535

# Increase TCP max buffer size
net.core.rmem_max = 16777216
net.core.wmem_max = 16777216

# Increase TCP auto-tuning buffer limits
net.ipv4.tcp_rmem = 4096 87380 16777216
net.ipv4.tcp_wmem = 4096 65536 16777216

# Enable TCP Fast Open
net.ipv4.tcp_fastopen = 3

# Optimize network security
net.ipv4.tcp_syncookies = 1
net.ipv4.tcp_max_syn_backlog = 4096
EOF

# Apply sysctl settings
sudo sysctl --system

# Final verification
echo "Performing final verification..."
echo "Checking backend status..."
if curl -s http://localhost:5000/api/health >/dev/null; then
    echo "✓ Backend is running"
else
    echo "⚠ Backend check failed"
    pm2 logs --lines 20
fi

echo "Checking frontend status..."
if curl -s -o /dev/null -w "%{http_code}" https://technovatechnologies.in | grep -q "200\|301\|302"; then
    echo "✓ Frontend is accessible"
else
    echo "⚠ Frontend check failed"
    sudo nginx -t
fi

echo "Deployment completed successfully!"
echo "Your website should now be running at https://technovatechnologies.in"