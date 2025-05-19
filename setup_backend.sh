#!/bin/bash

# Exit on error
set -e

echo "Starting backend setup..."

# Install Node.js and npm if not present
if ! command -v node &> /dev/null; then
    echo "Installing Node.js and npm..."
    sudo apt-get install -y ca-certificates curl gnupg
    sudo mkdir -p /etc/apt/keyrings
    curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | sudo gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
    echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x nodistro main" | sudo tee /etc/apt/sources.list.d/nodesource.list
    sudo apt-get update
    sudo apt-get install -y nodejs
    # Verify installation
    node --version
    npm --version
fi

# Install MongoDB if not present
if ! command -v mongod &> /dev/null; then
    echo "Installing MongoDB..."
    sudo apt-get install -y gnupg curl
    curl -fsSL https://pgp.mongodb.com/server-7.0.asc | \
        sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg \
        --dearmor
    echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
        sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
    sudo apt-get update
    sudo apt-get install -y mongodb-org
fi

# Configure MongoDB to match local development setup
echo "Configuring MongoDB for local development..."
sudo tee /etc/mongod.conf > /dev/null << EOF
storage:
  dbPath: /var/lib/mongodb
systemLog:
  destination: file
  logAppend: true
  path: /var/log/mongodb/mongod.log
net:
  port: 27017
  bindIp: 127.0.0.1
security:
  authorization: disabled
processManagement:
  timeZoneInfo: /usr/share/zoneinfo
EOF

# Ensure MongoDB directories exist with proper permissions
sudo mkdir -p /var/lib/mongodb
sudo mkdir -p /var/log/mongodb
sudo chown -R mongodb:mongodb /var/lib/mongodb
sudo chown -R mongodb:mongodb /var/log/mongodb
sudo chmod 755 /var/lib/mongodb
sudo chmod 755 /var/log/mongodb

# Restart MongoDB service
echo "Starting MongoDB service..."
sudo systemctl daemon-reload
sudo systemctl restart mongod
sudo systemctl enable mongod

# Wait for MongoDB to be ready
echo "Waiting for MongoDB to be ready..."
max_attempts=30
attempt=1
while ! mongosh --eval "db.adminCommand('ping')" --quiet >/dev/null 2>&1; do
    if [ $attempt -gt $max_attempts ]; then
        echo "Error: MongoDB failed to start after $max_attempts attempts"
        echo "Checking MongoDB status..."
        sudo systemctl status mongod
        echo "Checking MongoDB logs..."
        sudo tail -n 50 /var/log/mongodb/mongod.log
        exit 1
    fi
    echo "Attempt $attempt of $max_attempts: Waiting for MongoDB to be ready..."
    sleep 2
    attempt=$((attempt + 1))
done

echo "MongoDB is ready!"

# Create data directories if they don't exist
echo "Setting up data directories..."
sudo mkdir -p /var/www/uploads
sudo chown -R $USER:$USER /var/www/uploads
sudo chmod 755 /var/www/uploads

# Setup backend environment
echo "Setting up backend environment..."
if [ ! -d "server" ]; then
    echo "Error: server directory not found!"
    exit 1
fi

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

# Email Configuration (if needed)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password

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
echo "Installing backend dependencies..."
cd server
if [ ! -f "package.json" ]; then
    echo "Error: package.json not found in server directory!"
    exit 1
fi

# Install dependencies
npm ci --production

# Create MongoDB indexes and initial data
echo "Setting up database..."
if [ -f "scripts/setup-db.js" ]; then
    mongosh technovatech scripts/setup-db.js
else
    echo "Warning: setup-db.js not found in scripts directory"
fi

# Setup PM2
echo "Setting up PM2..."
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
fi

# Create PM2 log directory
sudo mkdir -p /var/log/pm2
sudo chown -R $USER:$USER /var/log/pm2

# Start the application with PM2
echo "Starting application with PM2..."
cd ..
pm2 delete all 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save

# Setup PM2 startup script
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp /home/$USER
sudo systemctl enable pm2-$USER

echo "Backend setup completed successfully!"
echo "API should be accessible at https://technovatechnologies.in/api"

# Verify backend is running
echo "Verifying backend status..."
sleep 5
if curl -s http://localhost:5000/api/health >/dev/null; then
    echo "Backend is running successfully!"
else
    echo "Warning: Backend health check failed. Please check the logs:"
    pm2 logs --lines 50
fi

# Create client environment file
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