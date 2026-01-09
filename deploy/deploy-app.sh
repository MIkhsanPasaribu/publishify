#!/bin/bash
set -e

echo "========================================="
echo " PUBLISHIFY - Application Deployment"
echo "========================================="

# Navigate to app directory
cd ~/publishify

# Load Bun environment
export BUN_INSTALL="$HOME/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"

# Stop existing PM2 processes
echo "[1/8] Stopping existing processes..."
~/.bun/bin/pm2 stop all 2>/dev/null || true
~/.bun/bin/pm2 delete all 2>/dev/null || true

# Setup Backend
echo "[2/8] Setting up Backend..."
cd ~/publishify/backend

# Install dependencies
echo "  - Installing backend dependencies..."
bun install

# Setup environment variables
echo "  - Configuring environment..."
cat > .env << 'EOF'
# Database
DATABASE_URL="postgresql://publishify:Publishify2026!@localhost:5432/publishify_prod"

# JWT
JWT_SECRET="publishify-secret-key-production-2026"
JWT_EXPIRES_IN="7d"
JWT_REFRESH_SECRET="publishify-refresh-secret-2026"
JWT_REFRESH_EXPIRES_IN="30d"

# Server
PORT=4000
NODE_ENV=production

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Upload
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760

# Frontend URL
FRONTEND_URL=http://135.235.165.131
EOF

# Run Prisma migrations
echo "  - Running database migrations..."
bun prisma generate
bun prisma migrate deploy

# Build backend
echo "  - Building backend..."
bun run build

echo "✓ Backend setup complete"

# Setup Frontend
echo "[3/8] Setting up Frontend..."
cd ~/publishify/frontend

# Install dependencies
echo "  - Installing frontend dependencies..."
bun install

# Setup environment variables
echo "  - Configuring environment..."
cat > .env.production << 'EOF'
NEXT_PUBLIC_API_URL=http://135.235.165.131/api
NEXT_PUBLIC_SOCKET_URL=http://135.235.165.131
NODE_ENV=production
EOF

# Build frontend
echo "  - Building frontend (this may take a few minutes)..."
bun run build

echo "✓ Frontend setup complete"

# Configure Nginx
echo "[4/8] Configuring Nginx..."
sudo tee /etc/nginx/sites-available/publishify > /dev/null << 'EOF'
# Publishify - Nginx Configuration

# Rate limiting
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=general_limit:10m rate=30r/s;

upstream backend {
    server 127.0.0.1:4000;
    keepalive 32;
}

upstream frontend {
    server 127.0.0.1:3000;
    keepalive 32;
}

server {
    listen 80;
    server_name _;
    
    client_max_body_size 10M;
    
    # API requests to backend
    location /api {
        limit_req zone=api_limit burst=20 nodelay;
        
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Socket.IO
    location /socket.io {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Backend uploads
    location /uploads {
        alias /home/sumatrans/publishify/backend/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
    
    # Frontend static files
    location /_next/static {
        proxy_pass http://frontend;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # All other requests to frontend
    location / {
        limit_req zone=general_limit burst=50 nodelay;
        
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Enable site
sudo ln -sf /etc/nginx/sites-available/publishify /etc/nginx/sites-enabled/publishify
sudo rm -f /etc/nginx/sites-enabled/default

# Test nginx config
echo "  - Testing Nginx configuration..."
sudo nginx -t

# Reload nginx
echo "  - Reloading Nginx..."
sudo systemctl reload nginx

echo "✓ Nginx configured"

# Start Backend with PM2
echo "[5/8] Starting Backend..."
cd ~/publishify/backend
~/.bun/bin/pm2 start dist/main.js \
    --name "publishify-backend" \
    --interpreter bun \
    --time \
    --log ~/pm2-logs/backend.log \
    --error ~/pm2-logs/backend-error.log

echo "✓ Backend started"

# Start Frontend with PM2
echo "[6/8] Starting Frontend..."
cd ~/publishify/frontend
~/.bun/bin/pm2 start bun \
    --name "publishify-frontend" \
    -- run start \
    --time \
    --log ~/pm2-logs/frontend.log \
    --error ~/pm2-logs/frontend-error.log

echo "✓ Frontend started"

# Save PM2 configuration
echo "[7/8] Saving PM2 configuration..."
~/.bun/bin/pm2 save
~/.bun/bin/pm2 startup systemd -u sumatrans --hp /home/sumatrans | grep 'sudo' | bash || true

echo "✓ PM2 configured for auto-start"

# Display status
echo "[8/8] Deployment complete!"
echo ""
echo "========================================="
echo " Status Check"
echo "========================================="
~/.bun/bin/pm2 list

echo ""
echo "========================================="
echo " Access Information"
echo "========================================="
echo "Website URL: http://135.235.165.131"
echo "API URL: http://135.235.165.131/api"
echo ""
echo "Useful commands:"
echo "  pm2 list          - List all processes"
echo "  pm2 logs          - View logs"
echo "  pm2 restart all   - Restart all processes"
echo "  pm2 stop all      - Stop all processes"
echo ""
echo "Logs location:"
echo "  ~/pm2-logs/backend.log"
echo "  ~/pm2-logs/frontend.log"
echo ""
