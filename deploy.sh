#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting deployment process..."

# Clean up any existing locks
echo "🔓 Cleaning up package locks..."
sudo rm -f /var/lib/dpkg/lock-frontend
sudo rm -f /var/lib/apt/lists/lock
sudo rm -f /var/cache/apt/archives/lock
sudo rm -f /var/lib/dpkg/lock

# Stop automatic updates
echo "🛑 Stopping automatic updates..."
sudo systemctl stop apt-daily.service || true
sudo systemctl stop apt-daily.timer || true
sudo systemctl stop apt-daily-upgrade.service || true
sudo systemctl stop apt-daily-upgrade.timer || true

# Reconfigure package system
echo "⚙️ Reconfiguring package system..."
sudo dpkg --configure -a

# Update system (non-interactive)
echo "📦 Updating system packages..."
sudo DEBIAN_FRONTEND=noninteractive apt-get update -y
sudo DEBIAN_FRONTEND=noninteractive apt-get upgrade -yq

# Check for kernel updates
echo "🔍 Checking for kernel updates..."
CURRENT_KERNEL=$(uname -r)
LATEST_KERNEL=$(dpkg -l | grep linux-image-generic | awk '{print $3}' | cut -d'-' -f1-3 | sort -V | tail -n1)
if [ "$CURRENT_KERNEL" != "$LATEST_KERNEL-generic" ]; then
    echo "⚠️ Kernel update available: $LATEST_KERNEL-generic"
    echo "⚠️ Current kernel: $CURRENT_KERNEL"
    echo "⚠️ A system reboot will be required after deployment"
    REBOOT_NEEDED=true
else
    REBOOT_NEEDED=false
fi

# Install required packages
echo "📦 Installing required packages..."
sudo apt-get install -y curl git nginx

# Install Node.js 18.x (official way)
echo "📦 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
echo "📦 Installing PM2..."
sudo npm install -g pm2

# Create necessary directories
echo "📁 Creating directories..."
sudo mkdir -p /var/www/client
sudo mkdir -p /var/www/uploads
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
npm install
npm run build:prod
sudo cp -r build/* /var/www/client/

# Setup server
echo "🏗️ Setting up server..."
cd ../server
npm install

# Create uploads directory if not exists
sudo mkdir -p /var/www/uploads
sudo chmod 755 /var/www/uploads

# Setup Nginx - HTTP only (no SSL)
echo "🌐 Configuring Nginx..."
sudo tee /etc/nginx/sites-available/technovatechnologies.in > /dev/null << 'EOL'
server {
    listen 80;
    server_name technovatechnologies.in www.technovatechnologies.in;

    location / {
        root /var/www/client;
        try_files $uri $uri/ /index.html;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /uploads {
        alias /var/www/uploads;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 10240;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml application/javascript;
    gzip_disable "MSIE [1-6]\\.";
}
EOL

# Enable site
sudo ln -sf /etc/nginx/sites-available/technovatechnologies.in /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Start/Restart services
echo "🔄 Starting services..."
cd /root/first-night/server
pm2 start server.js --name technovatechnologies-api || true
pm2 save

# Re-enable automatic updates
echo "🔄 Re-enabling automatic updates..."
sudo systemctl start apt-daily.service || true
sudo systemctl start apt-daily.timer || true
sudo systemctl start apt-daily-upgrade.service || true
sudo systemctl start apt-daily-upgrade.timer || true

echo "✅ Deployment completed successfully!"
echo "🌐 Your site should be live at http://technovatechnologies.in"

if [ "$REBOOT_NEEDED" = true ]; then
    echo '⚠️  A system reboot is required to load the new kernel. Please run: sudo reboot'
fi

dig +short technovatechnologies.in
dig +short www.technovatechnologies.in

sudo systemctl status nginx  