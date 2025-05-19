#!/bin/bash

# Deployment configuration
DOMAIN="technovatechnologies.in"
EXPECTED_IP="69.62.80.180"
APP_DIR="/var/www/first-night"
REPO_URL="https://github.com/yash9424/first-night.git"
BACKEND_PORT=5000
NODE_VERSION="20"
MONGODB_VERSION="7.0"

# Logging configuration
LOG_FILE="/var/log/deployment.log"
ERROR_LOG="/var/log/deployment_error.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Initialize log files
sudo touch $LOG_FILE $ERROR_LOG
sudo chmod 644 $LOG_FILE $ERROR_LOG

# Logging functions
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" >> $LOG_FILE
}

log_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1" >> $ERROR_LOG
}

log_warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1" >> $LOG_FILE
}

# Error handling
set -e
trap 'last_command=$current_command; current_command=$BASH_COMMAND' DEBUG
trap 'if [ $? -ne 0 ]; then log_error "The command \"${last_command}\" failed with exit code $?"; fi' EXIT

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check system requirements
check_system_requirements() {
    log "Checking system requirements..."
    
    # Check if running as root
    if [[ $EUID -ne 0 ]]; then
        log_error "This script must be run as root"
        exit 1
    }

    # Check minimum system resources
    MEMORY=$(free -m | awk '/^Mem:/{print $2}')
    DISK_SPACE=$(df -m / | awk 'NR==2 {print $4}')
    
    if [ $MEMORY -lt 1024 ]; then
        log_warning "Less than 1GB of RAM available ($MEMORY MB)"
    fi
    
    if [ $DISK_SPACE -lt 5120 ]; then
        log_warning "Less than 5GB of free disk space available ($DISK_SPACE MB)"
    fi
}

# Function to check DNS settings
check_dns() {
    log "Checking DNS settings..."
    local dns_servers=("8.8.8.8" "1.1.1.1" "9.9.9.9")
    local success=false
    
    for dns in "${dns_servers[@]}"; do
        log "Querying DNS server $dns..."
        CURRENT_IP=$(dig @$dns +short $DOMAIN A | grep -v "\.$" | head -n 1)
        
        if [ "$CURRENT_IP" = "$EXPECTED_IP" ]; then
            log "✓ DNS check passed with server $dns"
            success=true
            break
        else
            log_warning "DNS server $dns returned IP: $CURRENT_IP (expected: $EXPECTED_IP)"
        fi
    done
    
    if [ "$success" = false ]; then
        log_error "DNS verification failed for all servers"
        return 1
    fi
    return 0
}

# Function to verify service status
verify_service() {
    local service_name=$1
    local max_attempts=${2:-3}
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        log "Checking $service_name status (attempt $attempt/$max_attempts)..."
        
        if systemctl is-active --quiet $service_name; then
            log "✓ $service_name is running"
            return 0
        else
            if [ $attempt -eq $max_attempts ]; then
                log_error "$service_name is not running"
                return 1
            fi
            log_warning "$service_name is not running, attempting to restart..."
            systemctl restart $service_name
            sleep 5
        fi
        attempt=$((attempt + 1))
    done
}

# Function to setup Node.js
setup_nodejs() {
    log "Setting up Node.js..."
    
    # Remove existing Node.js installations
    if command_exists nodejs || command_exists npm; then
        log "Removing existing Node.js installations..."
        apt remove -y nodejs npm || true
        apt autoremove -y
    fi
    
    # Install Node.js from NodeSource
    log "Installing Node.js ${NODE_VERSION}..."
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
    apt-get install -y nodejs
    
    # Verify installation
    if ! command_exists node || ! command_exists npm; then
        log_error "Node.js installation failed"
        exit 1
    fi
    
    log "Node.js $(node --version) and npm $(npm --version) installed successfully"
}

# Function to setup MongoDB
setup_mongodb() {
    log "Setting up MongoDB..."
    
    # Import MongoDB public key
    curl -fsSL https://pgp.mongodb.com/server-${MONGODB_VERSION}.asc | \
        gpg -o /usr/share/keyrings/mongodb-server-${MONGODB_VERSION}.gpg \
        --dearmor
    
    # Add MongoDB repository
    echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-${MONGODB_VERSION}.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/${MONGODB_VERSION} multiverse" | \
        tee /etc/apt/sources.list.d/mongodb-org-${MONGODB_VERSION}.list
    
    apt update
    apt install -y mongodb-org
    
    # Start and enable MongoDB
    systemctl start mongod
    systemctl enable mongod
    
    # Verify MongoDB installation
    if ! verify_service mongod; then
        log_error "MongoDB installation failed"
        exit 1
    fi
}

# Function to setup application
setup_application() {
    log "Setting up application..."
    
    # Backup existing application if it exists
    if [ -d "$APP_DIR" ]; then
        local backup_dir="${APP_DIR}_backup_$(date +%Y%m%d_%H%M%S)"
        log "Creating backup of existing application at $backup_dir"
        mv "$APP_DIR" "$backup_dir"
    fi
    
    # Create application directory
    mkdir -p "$APP_DIR"
    cd "$APP_DIR" || exit 1
    
    # Clone repository
    log "Cloning repository..."
    git clone "$REPO_URL" .
    
    # Setup backend
    log "Setting up backend..."
    cd server || exit 1
    npm install
    
    # Create .env file
    log "Creating backend .env file..."
    cat > .env << EOL
PORT=$BACKEND_PORT
MONGODB_URI=mongodb://localhost:27017/jewelry_shop
JWT_SECRET=$(openssl rand -base64 32)
EOL
    
    # Setup frontend
    log "Setting up frontend..."
    cd ../client || exit 1
    npm install
    npm run build
}

# Function to setup Nginx
setup_nginx() {
    log "Setting up Nginx..."
    
    # Install Nginx if not present
    if ! command_exists nginx; then
        apt install -y nginx
    fi
    
    # Configure Nginx
    cat > /etc/nginx/sites-available/first-night << EOL
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN;

    root $APP_DIR/client/build;
    index index.html;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    location / {
        try_files \$uri \$uri/ /index.html;
        expires 1y;
        add_header Cache-Control "public, no-transform";
    }

    location /api {
        proxy_pass http://localhost:$BACKEND_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # Security headers for API
        add_header X-Frame-Options "DENY" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
    }

    # Deny access to hidden files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}
EOL

    # Enable site and remove default
    ln -sf /etc/nginx/sites-available/first-night /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    
    # Test Nginx configuration
    if ! nginx -t; then
        log_error "Nginx configuration test failed"
        exit 1
    fi
}

# Function to setup SSL
setup_ssl() {
    log "Setting up SSL..."
    
    # Install certbot
    apt install -y certbot python3-certbot-nginx
    
    # Obtain SSL certificate
    if ! certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --email vivekvora3226@gmail.com; then
        log_error "SSL certificate installation failed"
        exit 1
    fi
    
    # Verify SSL certificate
    if [ ! -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
        log_error "SSL certificate not found"
        exit 1
    fi
    
    log "SSL certificate installed successfully"
}

# Function to setup firewall
setup_firewall() {
    log "Setting up firewall..."
    
    # Install UFW if not present
    if ! command_exists ufw; then
        apt install -y ufw
    fi
    
    # Configure UFW
    ufw default deny incoming
    ufw default allow outgoing
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw allow 22/tcp
    
    # Enable UFW
    if ! ufw --force enable; then
        log_warning "Failed to enable UFW"
    fi
}

# Main deployment function
main() {
    log "Starting deployment process..."
    
    # Update system
    log "Updating system packages..."
    apt update && apt upgrade -y
    
    # Install basic requirements
    apt install -y curl git gnupg2 dnsutils
    
    # Run deployment steps
    check_system_requirements
    setup_firewall
    setup_nodejs
    setup_mongodb
    setup_application
    setup_nginx
    
    # Check DNS before SSL setup
    local dns_attempts=0
    local max_dns_attempts=10
    
    while [ $dns_attempts -lt $max_dns_attempts ]; do
        if check_dns; then
            setup_ssl
            break
        fi
        dns_attempts=$((dns_attempts + 1))
        if [ $dns_attempts -lt $max_dns_attempts ]; then
            log "Waiting 30 seconds for DNS propagation... (Attempt $dns_attempts/$max_dns_attempts)"
            sleep 30
        fi
    done
    
    if [ $dns_attempts -eq $max_dns_attempts ]; then
        log_error "DNS propagation check timed out"
        exit 1
    fi
    
    # Start services
    log "Starting services..."
    systemctl restart mongod
    cd "$APP_DIR/server" && pm2 start server.js --name "first-night-backend"
    systemctl restart nginx
    
    # Verify all services
    verify_service nginx
    verify_service mongod
    
    # Final checks
    log "Performing final checks..."
    curl -sSf "https://$DOMAIN" > /dev/null || log_error "Website is not accessible"
    curl -sSf "https://$DOMAIN/api/health" > /dev/null || log_warning "API health check failed"
    
    log "Deployment completed successfully!"
    log "Website URL: https://$DOMAIN"
    
    # Display service status
    log "Service Status Summary:"
    systemctl status nginx --no-pager
    systemctl status mongod --no-pager
    pm2 list
    ufw status
}

# Start deployment
main 