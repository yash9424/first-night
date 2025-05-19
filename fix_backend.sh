#!/bin/bash

# Exit on error
set -e

echo "🔄 Restarting backend services..."

# Navigate to project directory
cd /root/first-night

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin main

# Setup environment variables if not exists
if [ ! -f "server/.env" ]; then
    echo "📝 Creating environment file..."
    cat > server/.env << EOL
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb://localhost:27017/technovatech
JWT_SECRET=technovatech_secure_jwt_key_2024
CLIENT_URL=http://technovatechnologies.in
API_URL=http://technovatechnologies.in/api
EOL
fi

# Ensure MongoDB is running
echo "🔄 Checking MongoDB status..."
if ! systemctl is-active --quiet mongod; then
    echo "Starting MongoDB..."
    systemctl start mongod
    systemctl enable mongod
fi

# Install server dependencies
echo "📦 Installing server dependencies..."
cd server
npm ci --production

# Setup PM2 if not already setup
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    npm install -g pm2
fi

# Restart PM2 process
echo "🔄 Restarting PM2 processes..."
pm2 delete all || true
pm2 start server.js --name technovatech
pm2 save

# Create uploads directory if not exists
echo "📁 Setting up uploads directory..."
sudo mkdir -p /var/www/uploads
sudo chown -R www-data:www-data /var/www/uploads

# Test backend connection
echo "🔍 Testing backend connection..."
for i in {1..5}; do
    if curl -s http://localhost:5000/api/health; then
        echo "✅ Backend is responding!"
        break
    fi
    if [ $i -eq 5 ]; then
        echo "❌ Backend failed to respond after 5 attempts"
        exit 1
    fi
    echo "⏳ Waiting for backend to start... (attempt $i/5)"
    sleep 5
done

echo "✅ Backend restart completed!"
pm2 status 