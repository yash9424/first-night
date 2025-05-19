#!/bin/bash

# Exit on error
set -e

echo "Starting backend configuration..."

# Create backend environment file only if it doesn't exist
if [ ! -f "server/.env" ]; then
    echo "Creating new backend .env file..."
    cat > server/.env << EOL
PORT=5000
MONGODB_URI=mongodb://localhost:27017/technovatech
NODE_ENV=production
JWT_SECRET=$(openssl rand -base64 32)
CLIENT_URL=https://technovatechnologies.in
EOL
else
    echo "Using existing backend .env file"
fi

# Ensure proper permissions
chmod 600 server/.env

# Install backend dependencies
cd server
npm ci --production

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
pm2 delete all 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save

# Verify backend is running
echo "Verifying backend status..."
sleep 5
if curl -s http://localhost:5000/api/health >/dev/null; then
    echo "✓ Backend is running successfully!"
else
    echo "⚠ Backend check failed. Checking logs..."
    pm2 logs --lines 20
fi

echo "Backend configuration completed successfully!"
echo "API should be accessible at https://technovatechnologies.in/api" 