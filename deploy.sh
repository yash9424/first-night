#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting deployment process for TechnovaTechnologies.in..."

# Create log directory
sudo mkdir -p /var/log/pm2
sudo chown -R $USER:$USER /var/log/pm2

# Update system (non-interactive)
echo "📦 Updating system packages..."
sudo DEBIAN_FRONTEND=noninteractive apt-get update -y
sudo DEBIAN_FRONTEND=noninteractive apt-get upgrade -yq

# Install required packages
echo "📦 Installing required packages..."
sudo apt-get install -y curl git nginx certbot python3-certbot-nginx mongodb-org

# Configure MongoDB for minimal resources
echo "⚙️ Configuring MongoDB..."
sudo tee /etc/mongod.conf << EOF
systemLog:
  destination: file
  path: /var/log/mongodb/mongod.log
  logAppend: true
storage:
  dbPath: /var/lib/mongodb
  journal:
    enabled: true
  wiredTiger:
    engineConfig:
      cacheSizeGB: 0.25
      journalCompressor: snappy
      directoryForIndexes: false
    collectionConfig:
      blockCompressor: snappy
    indexConfig:
      prefixCompression: true
processManagement:
  fork: true
  pidFilePath: /var/run/mongodb/mongod.pid
net:
  port: 27017
  bindIp: 127.0.0.1
operationProfiling:
  slowOpThresholdMs: 100
  mode: slowOp
setParameter:
  internalQueryExecMaxBlockingSortBytes: 33554432
  maxInMemorySort: 33554432
EOF

# Configure system limits
echo "⚙️ Configuring system limits..."
sudo tee /etc/security/limits.d/mongodb.conf << EOF
mongodb soft nofile 64000
mongodb hard nofile 64000
mongodb soft nproc 32000
mongodb hard nproc 32000
EOF

# Install Node.js 18.x (LTS)
echo "📦 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
echo "📦 Installing PM2..."
sudo npm install -g pm2

# Start MongoDB and enable on boot
echo "🔄 Starting MongoDB service..."
sudo systemctl restart mongod
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

# Configure Nginx worker processes for minimal memory
echo "⚙️ Optimizing Nginx configuration..."
sudo tee /etc/nginx/nginx.conf << EOF
user www-data;
worker_processes 1;
worker_rlimit_nofile 65535;
pid /run/nginx.pid;

events {
    worker_connections 1024;
    multi_accept on;
    use epoll;
}

http {
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    server_tokens off;
    client_max_body_size 10M;
    
    # Buffer size optimizations
    client_body_buffer_size 128k;
    client_header_buffer_size 1k;
    large_client_header_buffers 4 4k;
    
    # Timeouts
    client_body_timeout 12;
    client_header_timeout 12;
    send_timeout 10;
    
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;
    
    gzip on;
    gzip_disable "msie6";
    gzip_comp_level 2;
    gzip_min_length 1000;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    include /etc/nginx/conf.d/*.conf;
    include /etc/nginx/sites-enabled/*;
}
EOF

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

# Set up log rotation
echo "📝 Setting up log rotation..."
sudo tee /etc/logrotate.d/pm2-user << EOF
/var/log/pm2/*.log {
    daily
    rotate 7
    compress
    delaycompress
    notifempty
    create 0640 $USER $USER
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}
EOF

# Set up system monitoring
echo "📊 Setting up system monitoring..."
sudo apt-get install -y htop
sudo tee /etc/systemd/system/monitor.service << EOF
[Unit]
Description=System Monitor
After=network.target

[Service]
Type=simple
User=root
ExecStart=/usr/bin/htop
Restart=always

[Install]
WantedBy=multi-user.target
EOF

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

# Configure system swap
echo "⚙️ Configuring swap..."
if [ ! -f /swapfile ]; then
    sudo fallocate -l 1G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
fi

# Configure system for low memory usage
echo "⚙️ Optimizing system for low memory usage..."
sudo tee /etc/sysctl.d/99-low-memory.conf << EOF
vm.swappiness = 10
vm.vfs_cache_pressure = 50
vm.dirty_ratio = 10
vm.dirty_background_ratio = 5
EOF

sudo sysctl -p /etc/sysctl.d/99-low-memory.conf

# Restart services with new configurations
echo "🔄 Restarting services with new configurations..."
sudo systemctl restart mongod
sudo systemctl restart nginx

echo "🎉 All done! Your MERN stack application is now deployed at https://technovatechnologies.in"