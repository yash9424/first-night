#!/bin/bash

# Update system
sudo apt-get update
sudo apt-get upgrade -y

# Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install Nginx
sudo apt-get install -y nginx

# Install Certbot for SSL
sudo apt-get install -y certbot python3-certbot-nginx

# Create necessary directories
sudo mkdir -p /var/www/client
sudo mkdir -p /var/www/uploads
sudo chown -R $USER:$USER /var/www

# Copy Nginx configuration
sudo cp nginx.conf /etc/nginx/sites-available/datartechnologies.com
sudo ln -s /etc/nginx/sites-available/datartechnologies.com /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Install SSL certificate
sudo certbot --nginx -d datartechnologies.com -d www.datartechnologies.com

# Build client
cd client
npm install
npm run build:prod
cp -r build/* /var/www/client/

# Setup server
cd ../server
npm install
pm2 start server.js --name "datartechnologies-api"

# Restart Nginx
sudo systemctl restart nginx

echo "Deployment completed successfully!" 