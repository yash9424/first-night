#!/bin/bash

# Exit on error
set -e

echo "Starting backend configuration..."

# Create backend environment file
cat > server/.env << EOL
PORT=5000
MONGODB_URI=mongodb://localhost:27017/technovatech
NODE_ENV=production
JWT_SECRET=$(openssl rand -base64 32)
CLIENT_URL=https://technovatechnologies.in
EOL

# Ensure proper permissions
chmod 600 server/.env

# Install backend dependencies
cd server
npm install

# Ensure MongoDB is running
if systemctl is-active --quiet mongod; then
    echo "MongoDB is running"
else
    echo "Starting MongoDB..."
    sudo systemctl start mongod
    sudo systemctl enable mongod
fi

# Install PM2 globally if not installed
if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2..."
    sudo npm install -g pm2
fi

# Create PM2 log directory if it doesn't exist
sudo mkdir -p /var/log/pm2
sudo chown -R $USER:$USER /var/log/pm2

# Restart the application
echo "Restarting application..."
pm2 delete all || true
pm2 start ecosystem.config.js
pm2 save

echo "Backend configuration completed successfully!"
echo "API should be accessible at https://technovatechnologies.in/api" 