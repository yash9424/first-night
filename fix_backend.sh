#!/bin/bash

# Exit on error
set -e

echo "🔄 Restarting backend services..."

# Navigate to project directory
cd /root/first-night

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin main

# Install server dependencies
echo "📦 Installing server dependencies..."
cd server
npm ci --production

# Restart PM2 process
echo "🔄 Restarting PM2 processes..."
pm2 reload technovatechnologies-api || pm2 start ecosystem.config.js
pm2 save

# Test backend connection
echo "🔍 Testing backend connection..."
curl -s http://localhost:5000/ || echo "⚠️ Backend not responding"

echo "✅ Backend restart completed!"
pm2 status 