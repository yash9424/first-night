#!/bin/bash

# Exit on error
set -e

echo "Starting deployment process..."

# 1. Update system
echo "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# 2. Install dependencies if not already installed
echo "Installing dependencies..."
if ! command -v nginx &> /dev/null; then
    sudo apt install -y nginx
fi
if ! command -v certbot &> /dev/null; then
    sudo apt install -y certbot python3-certbot-nginx
fi

# 3. Create necessary directories
echo "Creating necessary directories..."
sudo mkdir -p /var/www/client/build
sudo mkdir -p /var/www/uploads
sudo mkdir -p /var/log/pm2

# 4. Set proper permissions
echo "Setting permissions..."
sudo chown -R $USER:$USER /var/www/client
sudo chown -R $USER:$USER /var/www/uploads
sudo chown -R $USER:$USER /var/log/pm2

# 5. Install Node.js dependencies and build client
echo "Building client..."
cd client
npm install
npm run build
sudo cp -r build/* /var/www/client/build/

# 6. Setup server
echo "Setting up server..."
cd ../server
npm install

# 7. Copy nginx configuration
echo "Configuring nginx..."
sudo cp ../nginx.conf /etc/nginx/sites-available/technovatechnologies.in
sudo ln -sf /etc/nginx/sites-available/technovatechnologies.in /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# 8. Test nginx configuration
echo "Testing nginx configuration..."
sudo nginx -t

# 9. Setup SSL certificate
echo "Setting up SSL certificate..."
sudo certbot --nginx -d technovatechnologies.in -d www.technovatechnologies.in --non-interactive --agree-tos --email admin@technovatechnologies.in

# 10. Start/Restart services
echo "Starting services..."
sudo systemctl restart nginx
pm2 delete all || true
pm2 start ecosystem.config.js
pm2 save

# 11. Setup PM2 to start on boot
echo "Setting up PM2 startup..."
pm2 startup

echo "Deployment completed successfully!"
echo "Please ensure your DNS is properly configured to point to your server's IP address."
echo "Your website should now be accessible at https://technovatechnologies.in"