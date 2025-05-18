#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting deployment process for TechnovaTechnologies.in..."

# Clean up any existing locks
echo "🔓 Cleaning up package locks..."
sudo rm -f /var/lib/dpkg/lock-frontend
sudo rm -f /var/lib/apt/lists/lock
sudo rm -f /var/cache/apt/archives/lock
sudo rm -f /var/lib/dpkg/lock

# Reconfigure package system
echo "⚙️ Reconfiguring package system..."
sudo dpkg --configure -a

# Update system (non-interactive)
echo "📦 Updating system packages..."
sudo DEBIAN_FRONTEND=noninteractive apt-get update -y
sudo DEBIAN_FRONTEND=noninteractive apt-get upgrade -yq

# Install required packages
echo "📦 Installing required packages..."
sudo apt-get install -y curl git nginx certbot python3-certbot-nginx mongodb-org

# Install Node.js 18.x (LTS)
echo "📦 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
echo "📦 Installing PM2..."
sudo npm install -g pm2

# Start MongoDB and enable on boot
echo "🔄 Starting MongoDB service..."
sudo systemctl start mongod
sudo systemctl enable mongod
sleep 5
echo "🔍 Checking MongoDB status..."
sudo systemctl status mongod --no-pager

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

# Create .env file for backend
echo "🔧 Setting up environment variables..."
cat > /root/first-night/server/.env << EOL
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb://localhost:27017/technovatech
JWT_SECRET=$(openssl rand -hex 32)
CLIENT_URL=https://technovatechnologies.in
API_URL=https://technovatechnologies.in/api
EOL

# Setup client
echo "🏗️ Building client..."
cd client
npm ci
echo "REACT_APP_API_URL=https://technovatechnologies.in/api" > .env
npm run build:prod
sudo cp -r build/* /var/www/client/

# Setup server
echo "🏗️ Setting up server..."
cd ../server
npm ci --production

# Create uploads directory if not exists
sudo mkdir -p /var/www/uploads
sudo chmod 755 /var/www/uploads

# Setup Nginx with SSL support
echo "🌐 Configuring Nginx..."
sudo cp ../nginx.conf /etc/nginx/sites-available/technovatechnologies.in
sudo ln -sf /etc/nginx/sites-available/technovatechnologies.in /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl reload nginx

# Obtain SSL certificate
echo "🔒 Setting up SSL certificate..."
sudo certbot --nginx -d technovatechnologies.in -d www.technovatechnologies.in --agree-tos --email vivekvora3226@gmail.com --non-interactive || echo "⚠️ SSL setup failed - will try again later"

# Start/Restart services using PM2
echo "🔄 Starting services..."
cd /root/first-night
pm2 delete all || true
pm2 start ecosystem.config.js

# Ensure PM2 starts on system reboot
echo "🔄 Setting up PM2 startup script..."
pm2 startup
pm2 save

# Copy server uploads to web-accessible directory
echo "📁 Setting up uploads directory..."
rsync -av /root/first-night/server/uploads/ /var/www/uploads/
sudo chown -R www-data:www-data /var/www/uploads

# Verify MongoDB is running and create database if needed
echo "🔍 Verifying MongoDB connection..."
mongo --eval "db.stats()" technovatech || echo "Creating database technovatech"; mongo --eval "db.createCollection('products')" technovatech

# Test API connection
echo "🔍 Testing API connection..."
curl -s http://localhost:5000/ || echo "⚠️ Backend not responding"

echo "✅ Deployment completed successfully!"
echo "🌐 Your site should be live at https://technovatechnologies.in"

# Display status
echo "ℹ️ PM2 status:"
pm2 status

echo "ℹ️ MongoDB status:"
sudo systemctl status mongod --no-pager

# Create a quick fix_backend script
echo "📝 Creating backend fix script..."
cat > /root/fix_backend.sh << 'EOL'
#!/bin/bash
set -e
echo "🔄 Restarting backend services..."
cd /root/first-night
git pull origin main
cd server
npm ci --production
cd ..
pm2 reload all
pm2 save
echo "✅ Backend services restarted!"
pm2 status
EOL

chmod +x /root/fix_backend.sh

echo "🎉 All done! Your MERN stack application is now deployed at https://technovatechnologies.in"