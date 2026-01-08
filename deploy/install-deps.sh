#!/bin/bash

# Script untuk install dependencies di VM
echo "=== Installing Dependencies untuk Publishify ==="

# Update package list
echo "1. Update package list..."
sudo apt update

# Install basic tools
echo "2. Installing basic tools..."
sudo DEBIAN_FRONTEND=noninteractive apt install -y unzip curl git build-essential

# Install Nginx
echo "3. Installing Nginx..."
sudo DEBIAN_FRONTEND=noninteractive apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx

# Install PostgreSQL
echo "4. Installing PostgreSQL..."
sudo DEBIAN_FRONTEND=noninteractive apt install -y postgresql postgresql-contrib
sudo systemctl enable postgresql
sudo systemctl start postgresql

# Install Redis
echo "5. Installing Redis..."
sudo DEBIAN_FRONTEND=noninteractive apt install -y redis-server
sudo systemctl enable redis-server
sudo systemctl start redis-server

# Install Bun
echo "6. Installing Bun..."
curl -fsSL https://bun.sh/install | bash
export BUN_INSTALL="$HOME/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"
echo 'export BUN_INSTALL="$HOME/.bun"' >> ~/.bashrc
echo 'export PATH="$BUN_INSTALL/bin:$PATH"' >> ~/.bashrc

# Install PM2
echo "7. Installing PM2..."
~/.bun/bin/bun install -g pm2

# Verify installations
echo ""
echo "=== Verifying Installations ==="
nginx -v 2>&1
psql --version
redis-server --version
~/.bun/bin/bun --version
~/.bun/bin/pm2 --version

echo ""
echo "=== Installation Complete! ==="
