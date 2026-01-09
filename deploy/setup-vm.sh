#!/bin/bash
set -e

echo "========================================="
echo " PUBLISHIFY - VM Setup Script"
echo "========================================="

# Update system
echo "[1/9] Updating system packages..."
sudo apt update
sudo DEBIAN_FRONTEND=noninteractive apt upgrade -y

# Install basic tools
echo "[2/9] Installing basic tools..."
sudo DEBIAN_FRONTEND=noninteractive apt install -y \
    unzip curl git build-essential software-properties-common

# Install Nginx
echo "[3/9] Installing Nginx..."
sudo DEBIAN_FRONTEND=noninteractive apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
echo "✓ Nginx installed"

# Install PostgreSQL
echo "[4/9] Installing PostgreSQL..."
sudo DEBIAN_FRONTEND=noninteractive apt install -y postgresql postgresql-contrib
sudo systemctl enable postgresql
sudo systemctl start postgresql
echo "✓ PostgreSQL installed"

# Install Redis
echo "[5/9] Installing Redis..."
sudo DEBIAN_FRONTEND=noninteractive apt install -y redis-server
sudo systemctl enable redis-server
sudo systemctl start redis-server
echo "✓ Redis installed"

# Install Bun
echo "[6/9] Installing Bun runtime..."
if [ ! -d "$HOME/.bun" ]; then
    curl -fsSL https://bun.sh/install | bash
fi
export BUN_INSTALL="$HOME/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"

# Add Bun to PATH permanently
if ! grep -q 'BUN_INSTALL' ~/.bashrc; then
    echo 'export BUN_INSTALL="$HOME/.bun"' >> ~/.bashrc
    echo 'export PATH="$BUN_INSTALL/bin:$PATH"' >> ~/.bashrc
fi
echo "✓ Bun runtime installed"

# Install PM2
echo "[7/9] Installing PM2..."
~/.bun/bin/bun install -g pm2
echo "✓ PM2 installed"

# Configure PostgreSQL
echo "[8/9] Configuring PostgreSQL..."
sudo -u postgres psql -c "CREATE DATABASE publishify_prod;" 2>/dev/null || echo "Database already exists"
sudo -u postgres psql -c "CREATE USER publishify WITH PASSWORD 'Publishify2026!';" 2>/dev/null || echo "User already exists"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE publishify_prod TO publishify;" 2>/dev/null || true
sudo -u postgres psql -c "ALTER DATABASE publishify_prod OWNER TO publishify;" 2>/dev/null || true
echo "✓ PostgreSQL configured"

# Configure firewall
echo "[9/9] Configuring firewall..."
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw --force enable
echo "✓ Firewall configured"

# Display versions
echo ""
echo "========================================="
echo " Installation Complete!"
echo "========================================="
echo "Software versions:"
nginx -v 2>&1
psql --version
redis-server --version
~/.bun/bin/bun --version
~/.bun/bin/pm2 --version

echo ""
echo "Next steps:"
echo "1. Upload Publishify source code to ~/publishify"
echo "2. Run: cd ~/publishify && ./deploy/deploy-app.sh"
