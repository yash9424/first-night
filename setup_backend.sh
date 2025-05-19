#!/bin/bash

# Exit on error
set -e

echo "Starting backend setup..."

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

# Configure MongoDB to listen on all interfaces
echo "Configuring MongoDB..."
sudo tee /etc/mongod.conf > /dev/null << EOF
storage:
  dbPath: /var/lib/mongodb
systemLog:
  destination: file
  logAppend: true
  path: /var/log/mongodb/mongod.log
net:
  port: 27017
  bindIp: 0.0.0.0
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

# Wait for MongoDB to be ready with timeout
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

# Create backend environment file
echo "Creating .env file..."
cat > server/.env << EOL
PORT=5000
MONGODB_URI=mongodb://localhost:27017/technovatech
NODE_ENV=production
JWT_SECRET=$(openssl rand -base64 32)
CLIENT_URL=https://technovatechnologies.in
UPLOAD_PATH=/var/www/uploads
EOL

# Set proper permissions for .env
chmod 600 server/.env

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