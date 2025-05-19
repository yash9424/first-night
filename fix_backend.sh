#!/bin/bash

# Exit on error
set -e

echo "Starting backend configuration..."

# Create backend environment file only if it doesn't exist
if [ ! -f "server/.env" ]; then
    echo "Creating new backend .env file..."
    cat > server/.env << EOL
# Server Configuration
PORT=5000
NODE_ENV=production

# Database Configuration
MONGO_URI=mongodb://localhost:27017/jewelry_shop

# Security
JWT_SECRET=$(openssl rand -base64 32)
JWT_EXPIRES_IN=7d
COOKIE_SECRET=$(openssl rand -base64 32)

# CORS and Domain Configuration
CLIENT_URL=https://technovatechnologies.in
ALLOWED_ORIGINS=https://technovatechnologies.in,http://localhost:3000

# File Upload Configuration
UPLOAD_PATH=/var/www/uploads
MAX_FILE_SIZE=5242880

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100

# Cache Configuration
CACHE_TTL=3600

# Logging
LOG_LEVEL=error
LOG_FORMAT=combined

# Session Configuration
SESSION_SECRET=$(openssl rand -base64 32)
SESSION_EXPIRES=24h
EOL
else
    echo "Updating existing backend .env file..."
    
    # Update MongoDB URI
    sed -i 's|mongodb://localhost:27017/[^/]*|mongodb://localhost:27017/jewelry_shop|g' server/.env
    
    # Ensure all required variables are present
    declare -A env_vars=(
        ["PORT"]="5000"
        ["NODE_ENV"]="production"
        ["JWT_SECRET"]="$(openssl rand -base64 32)"
        ["JWT_EXPIRES_IN"]="7d"
        ["COOKIE_SECRET"]="$(openssl rand -base64 32)"
        ["CLIENT_URL"]="https://technovatechnologies.in"
        ["ALLOWED_ORIGINS"]="https://technovatechnologies.in,http://localhost:3000"
        ["UPLOAD_PATH"]="/var/www/uploads"
        ["MAX_FILE_SIZE"]="5242880"
        ["RATE_LIMIT_WINDOW"]="15"
        ["RATE_LIMIT_MAX_REQUESTS"]="100"
        ["CACHE_TTL"]="3600"
        ["LOG_LEVEL"]="error"
        ["LOG_FORMAT"]="combined"
        ["SESSION_SECRET"]="$(openssl rand -base64 32)"
        ["SESSION_EXPIRES"]="24h"
    )

    # Add missing variables
    for key in "${!env_vars[@]}"; do
        if ! grep -q "^${key}=" server/.env; then
            echo "${key}=${env_vars[$key]}" >> server/.env
        fi
    done
fi

# Set proper permissions for .env
chmod 600 server/.env

echo "Environment configuration completed successfully!"

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

# Stop any existing PM2 processes
echo "Stopping existing PM2 processes..."
pm2 delete all 2>/dev/null || true

# Clear PM2 logs
echo "Clearing PM2 logs..."
sudo rm -f /var/log/pm2/*.log

# Start the application with PM2
echo "Starting application with PM2..."
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

# Create client environment file if it doesn't exist
echo "Setting up client environment..."
if [ ! -f "client/.env" ]; then
    echo "Creating new client .env file..."
    cat > client/.env << EOL
# API Configuration
REACT_APP_API_URL=https://technovatechnologies.in/api
REACT_APP_API_TIMEOUT=30000

# Feature Flags
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_CACHE=true

# App Configuration
REACT_APP_NAME="Jewelry Shop"
REACT_APP_DESCRIPTION="Luxury Jewelry Store"
REACT_APP_VERSION=1.0.0

# Image Upload
REACT_APP_MAX_IMAGE_SIZE=5242880
REACT_APP_ALLOWED_IMAGE_TYPES=".jpg,.jpeg,.png,.webp"

# Payment Gateway (if needed)
REACT_APP_STRIPE_PUBLIC_KEY=your_stripe_public_key
REACT_APP_RAZORPAY_KEY_ID=your_razorpay_key_id

# Social Media Links
REACT_APP_FACEBOOK_URL=https://facebook.com/your-page
REACT_APP_INSTAGRAM_URL=https://instagram.com/your-page
REACT_APP_TWITTER_URL=https://twitter.com/your-page

# Contact Information
REACT_APP_CONTACT_EMAIL=contact@technovatechnologies.in
REACT_APP_CONTACT_PHONE="+1234567890"
REACT_APP_CONTACT_ADDRESS="Your Store Address"

# Google Maps (if needed)
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Cache Configuration
REACT_APP_CACHE_DURATION=3600
EOL
else
    echo "Updating existing client .env file..."
    
    # Ensure all required variables are present
    declare -A client_env_vars=(
        ["REACT_APP_API_URL"]="https://technovatechnologies.in/api"
        ["REACT_APP_API_TIMEOUT"]="30000"
        ["REACT_APP_ENABLE_ANALYTICS"]="true"
        ["REACT_APP_ENABLE_CACHE"]="true"
        ["REACT_APP_NAME"]="Jewelry Shop"
        ["REACT_APP_DESCRIPTION"]="Luxury Jewelry Store"
        ["REACT_APP_VERSION"]="1.0.0"
        ["REACT_APP_MAX_IMAGE_SIZE"]="5242880"
        ["REACT_APP_ALLOWED_IMAGE_TYPES"]=".jpg,.jpeg,.png,.webp"
        ["REACT_APP_CACHE_DURATION"]="3600"
    )

    # Add missing variables
    for key in "${!client_env_vars[@]}"; do
        if ! grep -q "^${key}=" client/.env; then
            echo "${key}=${client_env_vars[$key]}" >> client/.env
        fi
    done
fi

# Set proper permissions for client .env
chmod 600 client/.env

echo "Client environment configuration completed successfully!" 