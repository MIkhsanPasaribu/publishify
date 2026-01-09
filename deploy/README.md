# Publishify Deployment Guide

## Prerequisites
- Clean Ubuntu 22.04 VM
- SSH access: sumatrans@135.235.165.131
- Minimum 2GB RAM, 20GB disk

## Step 1: Upload Files to VM

### Option A: Using SCP (Recommended)
```powershell
# From local machine (Windows)
scp -r d:\Website\publishify sumatrans@135.235.165.131:~/publishify
```

### Option B: Using Git
```bash
# On VM
cd ~
git clone <your-git-repo-url> publishify
```

### Option C: Using PSCP (PuTTY)
```powershell
# From local machine (Windows)
pscp -r d:\Website\publishify sumatrans@135.235.165.131:~/publishify
```

## Step 2: Setup VM Dependencies

```bash
# SSH to VM
ssh sumatrans@135.235.165.131

# Make script executable
chmod +x ~/publishify/deploy/setup-vm.sh

# Run setup script
cd ~/publishify/deploy
./setup-vm.sh
```

This will install:
- ✅ Nginx (web server & reverse proxy)
- ✅ PostgreSQL (database)
- ✅ Redis (caching)
- ✅ Bun (JavaScript runtime)
- ✅ PM2 (process manager)

## Step 3: Deploy Application

```bash
# Make deploy script executable
chmod +x ~/publishify/deploy/deploy-app.sh

# Run deployment
./deploy-app.sh
```

This will:
1. Install dependencies (frontend & backend)
2. Setup environment variables
3. Run database migrations
4. Build applications
5. Configure Nginx reverse proxy
6. Start services with PM2

## Step 4: Access Website

Open browser and go to:
```
http://135.235.165.131
```

## Management Commands

### View Application Status
```bash
pm2 list
```

### View Logs
```bash
# All logs
pm2 logs

# Backend only
pm2 logs publishify-backend

# Frontend only
pm2 logs publishify-frontend
```

### Restart Applications
```bash
# Restart all
pm2 restart all

# Restart specific service
pm2 restart publishify-backend
pm2 restart publishify-frontend
```

### Stop Applications
```bash
pm2 stop all
```

### Monitor Resources
```bash
pm2 monit
```

## Troubleshooting

### Check Nginx Status
```bash
sudo systemctl status nginx
sudo nginx -t  # Test configuration
```

### Check PostgreSQL
```bash
sudo systemctl status postgresql
psql -U publishify -d publishify_prod -h localhost
```

### Check Redis
```bash
sudo systemctl status redis-server
redis-cli ping
```

### View Nginx Logs
```bash
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### Rebuild Application
```bash
cd ~/publishify/backend
bun run build

cd ~/publishify/frontend
bun run build

pm2 restart all
```

## Database Management

### Access Database
```bash
psql -U publishify -d publishify_prod -h localhost
# Password: Publishify2026!
```

### Run Migrations
```bash
cd ~/publishify/backend
bun prisma migrate deploy
```

### Reset Database (CAUTION!)
```bash
cd ~/publishify/backend
bun prisma migrate reset
```

## Firewall Rules

Current ports open:
- 22 (SSH)
- 80 (HTTP)
- 443 (HTTPS - for future SSL)

To check:
```bash
sudo ufw status
```

## Performance Monitoring

### CPU & Memory Usage
```bash
htop
```

### Disk Usage
```bash
df -h
du -sh ~/publishify/*
```

### Network Connections
```bash
sudo netstat -tulpn | grep -E '3000|4000|80'
```

## Update Application

```bash
# Pull latest code
cd ~/publishify
git pull

# Redeploy
./deploy/deploy-app.sh
```

## Environment Variables

### Backend (.env)
Location: `~/publishify/backend/.env`

Key variables:
- DATABASE_URL
- JWT_SECRET
- PORT
- REDIS_HOST

### Frontend (.env.production)
Location: `~/publishify/frontend/.env.production`

Key variables:
- NEXT_PUBLIC_API_URL
- NEXT_PUBLIC_SOCKET_URL

## Security Notes

1. Change default PostgreSQL password
2. Setup SSL/HTTPS with Let's Encrypt
3. Configure firewall properly
4. Use strong JWT secrets
5. Regularly update system packages

## Next Steps (Optional)

### Setup SSL/HTTPS
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

### Setup Monitoring
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### Setup Auto-backup Database
Add to crontab:
```bash
0 2 * * * pg_dump -U publishify publishify_prod > ~/backups/db-$(date +\%Y\%m\%d).sql
```
