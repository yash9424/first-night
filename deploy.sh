#!/bin/bash

# Update system
echo "Updating system..."
apt update && apt upgrade -y

# Install Node.js
echo "Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt install -y nodejs

# Install MongoDB
echo "Installing MongoDB..."
apt install -y mongodb
systemctl start mongodb
systemctl enable mongodb

# Install Nginx
echo "Installing Nginx..."
apt install -y nginx

# Install certbot for SSL
apt install -y certbot python3-certbot-nginx

# Create directory for the application
mkdir -p /var/www/first-night
cd /var/www/first-night

# Clone the repository
echo "Cloning repository..."
git clone https://github.com/yash9424/first-night.git .

# Setup backend
cd server
npm install
echo "Creating .env file for backend..."
cat > .env << EOL
PORT=5000
MONGODB_URI=mongodb://localhost:27017/jewelry_shop
JWT_SECRET=your_jwt_secret_here
EOL

# Setup frontend
cd ../client
npm install
npm run build

# Configure Nginx
echo "Configuring Nginx..."
cat > /etc/nginx/sites-available/first-night << EOL
server {
    listen 80;
    server_name technovatechnologies.in;

    location / {
        root /var/www/first-night/client/build;
        index index.html;
        try_files \$uri \$uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOL

# Enable the site
ln -s /etc/nginx/sites-available/first-night /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default

# Install PM2 for process management
npm install -g pm2

# Start the applications
cd /var/www/first-night/server
pm2 start server.js --name "first-night-backend"

# Test Nginx configuration
nginx -t

# Restart Nginx
systemctl restart nginx

# Setup SSL
echo "Setting up SSL..."
certbot --nginx -d technovatechnologies.in --non-interactive --agree-tos --email your-email@example.com

echo "Deployment completed!" 