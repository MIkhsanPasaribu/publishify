#!/bin/bash
# Deploy script untuk fix upload naskah error
# Run this on VM: bash deploy-fix-upload.sh

set -e  # Exit on error

echo "🚀 Deploying fix untuk upload naskah error..."

# Navigate to project directory
cd /root/publishify

# Set remote to fork if not already
echo "🔧 Setting git remote to fork..."
git remote set-url origin https://github.com/daffarobbani18/publishify.git || git remote add origin https://github.com/daffarobbani18/publishify.git

# Pull latest changes
echo "📥 Pulling latest changes from fork..."
git fetch origin
git checkout feature/deployment-scripts
git pull origin feature/deployment-scripts

# Backend - Rebuild
echo "🔨 Building backend..."
cd /root/publishify/backend
bun install
bun run build

# Frontend - Rebuild
echo "🔨 Building frontend..."
cd /root/publishify/frontend
bun install
bun run build

# Restart services
echo "♻️ Restarting services..."
pm2 restart publishify-backend
pm2 restart publishify-frontend

# Check status
echo "✅ Checking service status..."
pm2 status

echo ""
echo "🎉 Deploy selesai!"
echo "📝 Perubahan yang di-deploy:"
echo "   - Backend: Fix validasi URL file & sampul (terima path relatif)"
echo "   - Frontend: Hapus double concatenation URL"
echo ""
echo "🧪 Test upload naskah di: https://publishify.me/penulis/ajukan-draf"
