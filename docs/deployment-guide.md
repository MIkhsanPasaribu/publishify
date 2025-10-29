# Deployment Guide - Publishify Backend

Panduan deployment untuk production environment.

## Table of Contents

- [Deployment Options](#deployment-options)
- [Docker Deployment](#docker-deployment)
- [PM2 Deployment](#pm2-deployment)
- [Cloud Deployment](#cloud-deployment)
- [Environment Configuration](#environment-configuration)
- [Post-Deployment](#post-deployment)

---

## Deployment Options

Ada beberapa cara untuk deploy Publishify backend:

1. **Docker** - Recommended untuk consistency
2. **PM2** - Untuk VPS/bare metal servers
3. **Cloud Services** - Railway, Render, Heroku, AWS, Azure, GCP

---

## Docker Deployment

### 1. Create Dockerfile

Sudah ada di `backend/Dockerfile`:

```dockerfile
FROM oven/bun:1 as builder

WORKDIR /app

COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

COPY . .
RUN bunx prisma generate
RUN bun run build

FROM oven/bun:1-slim

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./

ENV NODE_ENV=production

EXPOSE 4000

CMD ["bun", "run", "start:prod"]
```

### 2. Create docker-compose.yml

```yaml
version: "3.8"

services:
  postgres:
    image: postgres:14-alpine
    container_name: publishify-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: publishify
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    networks:
      - publishify-network

  redis:
    image: redis:7-alpine
    container_name: publishify-redis
    restart: unless-stopped
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    networks:
      - publishify-network

  backend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: publishify-backend
    restart: unless-stopped
    ports:
      - "4000:4000"
    environment:
      NODE_ENV: production
      PORT: 4000
      DATABASE_URL: postgresql://postgres:${DB_PASSWORD}@postgres:5432/publishify?schema=public
      DIRECT_URL: postgresql://postgres:${DB_PASSWORD}@postgres:5432/publishify?schema=public
      REDIS_HOST: redis
      REDIS_PORT: 6379
      REDIS_PASSWORD: ${REDIS_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
      JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET}
    depends_on:
      - postgres
      - redis
    networks:
      - publishify-network

volumes:
  postgres_data:
  redis_data:

networks:
  publishify-network:
    driver: bridge
```

### 3. Create .env.production

```env
# Database
DB_PASSWORD=strong-password-here

# Redis
REDIS_PASSWORD=redis-password-here

# JWT
JWT_SECRET=super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=super-secret-refresh-key-change-this

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

### 4. Deploy with Docker Compose

```bash
# Build and start all services
docker-compose --env-file .env.production up -d --build

# Check logs
docker-compose logs -f backend

# Run migrations
docker-compose exec backend bun prisma migrate deploy

# Seed database (optional)
docker-compose exec backend bun prisma db seed
```

### 5. Nginx Reverse Proxy (Optional)

Untuk SSL dan better performance:

```nginx
server {
    listen 80;
    server_name api.publishify.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.publishify.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/api.publishify.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.publishify.com/privkey.pem;

    # Proxy to backend
    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket support
    location /socket.io/ {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

---

## PM2 Deployment

### 1. Install PM2

```bash
bun add -g pm2
```

### 2. Create ecosystem.config.js

```javascript
module.exports = {
  apps: [
    {
      name: "publishify-backend",
      script: "dist/main.js",
      interpreter: "bun",
      instances: "max",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: 4000,
      },
      error_file: "./logs/err.log",
      out_file: "./logs/out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
    },
  ],
};
```

### 3. Deploy with PM2

```bash
# Build production
bun run build

# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup

# Monitor
pm2 monit

# Check status
pm2 status

# View logs
pm2 logs publishify-backend
```

### 4. PM2 Management Commands

```bash
# Restart
pm2 restart publishify-backend

# Stop
pm2 stop publishify-backend

# Delete
pm2 delete publishify-backend

# Reload (zero-downtime)
pm2 reload publishify-backend

# Reset restart count
pm2 reset publishify-backend
```

---

## Cloud Deployment

### Railway

1. Install Railway CLI:

```bash
npm i -g @railway/cli
```

2. Login and init:

```bash
railway login
railway init
```

3. Add PostgreSQL dan Redis:

```bash
railway add --plugin postgresql
railway add --plugin redis
```

4. Deploy:

```bash
railway up
```

### Render

1. Create `render.yaml`:

```yaml
services:
  - type: web
    name: publishify-backend
    env: node
    buildCommand: bun install && bun run build
    startCommand: bun run start:prod
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: publishify-db
          property: connectionString
```

2. Connect GitHub repo di dashboard Render

### Heroku

```bash
# Login
heroku login

# Create app
heroku create publishify-backend

# Add PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# Add Redis
heroku addons:create heroku-redis:hobby-dev

# Set buildpack
heroku buildpacks:set oven/bun

# Deploy
git push heroku main

# Run migrations
heroku run bun prisma migrate deploy
```

---

## Environment Configuration

### Production Environment Variables

Checklist yang WAJIB di-set untuk production:

```env
# Environment
NODE_ENV=production

# Server
PORT=4000
FRONTEND_URL=https://publishify.com

# Database (dari cloud provider)
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# JWT (GANTI dengan random string yang kuat!)
JWT_SECRET=use-openssl-rand-hex-64
JWT_REFRESH_SECRET=use-openssl-rand-hex-64
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Redis (dari cloud provider)
REDIS_HOST=redis-host
REDIS_PORT=6379
REDIS_PASSWORD=strong-password
REDIS_DB=0

# Email (production SMTP)
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=apikey
EMAIL_PASSWORD=your-sendgrid-api-key
EMAIL_FROM=noreply@publishify.com

# Optional: Monitoring
SENTRY_DSN=your-sentry-dsn
LOG_LEVEL=info
```

### Generate Secure Secrets

```bash
# Generate JWT secrets
openssl rand -hex 64

# Or dengan Bun
bun -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## Post-Deployment

### 1. Run Database Migrations

```bash
# Docker
docker-compose exec backend bun prisma migrate deploy

# PM2
bun prisma migrate deploy

# Heroku
heroku run bun prisma migrate deploy
```

### 2. Seed Initial Data

```bash
# Production seed (pastikan seed.ts di-adjust untuk production)
bun prisma db seed
```

### 3. Health Check

Test API endpoints:

```bash
# Health check
curl https://api.publishify.com/api

# Login test
curl -X POST https://api.publishify.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@publishify.com","kataSandi":"YourStrongPassword"}'
```

### 4. Setup Monitoring

Recommended tools:

- **Sentry** - Error tracking
- **DataDog** - APM & monitoring
- **Grafana** - Metrics visualization
- **Uptime Robot** - Uptime monitoring

### 5. Setup Backups

#### PostgreSQL Backups

```bash
# Manual backup
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Automated backup (cron)
0 2 * * * pg_dump $DATABASE_URL | gzip > /backups/publishify-$(date +\%Y\%m\%d).sql.gz
```

#### Database Backup to S3

```bash
#!/bin/bash
BACKUP_FILE="publishify-$(date +%Y%m%d-%H%M%S).sql.gz"
pg_dump $DATABASE_URL | gzip > /tmp/$BACKUP_FILE
aws s3 cp /tmp/$BACKUP_FILE s3://publishify-backups/$BACKUP_FILE
rm /tmp/$BACKUP_FILE
```

### 6. Setup SSL/HTTPS

#### Using Let's Encrypt

```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d api.publishify.com

# Auto-renewal (runs twice daily)
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

---

## Performance Optimization

### 1. Database Optimization

```sql
-- Add indexes untuk queries yang sering digunakan
CREATE INDEX idx_naskah_penulis ON naskah(id_penulis);
CREATE INDEX idx_naskah_status ON naskah(status);
CREATE INDEX idx_review_editor ON review_naskah(id_editor);

-- Enable query performance insights
ALTER DATABASE publishify SET track_activity_query_size = 16384;
```

### 2. Redis Caching

Sudah implemented di backend untuk:

- JWT token blacklist
- Session storage
- Rate limiting
- Job queues

### 3. Connection Pooling

Prisma default connection pool:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")

  // Connection pool configuration
  connection_limit = 20
}
```

### 4. Enable Compression

Sudah enabled di `main.ts`:

```typescript
app.use(compression());
```

---

## Security Checklist

- [ ] Environment variables tidak di-commit ke Git
- [ ] JWT secrets di-generate dengan secure random
- [ ] CORS configured dengan origin yang benar
- [ ] Rate limiting enabled (default: 10 req/sec)
- [ ] Helmet.js untuk security headers
- [ ] HTTPS/SSL certificate installed
- [ ] Database password yang kuat
- [ ] Redis password enabled
- [ ] Firewall rules configured (hanya port 80/443 exposed)
- [ ] Regular security updates
- [ ] Backup strategy di-setup
- [ ] Error messages tidak expose sensitive info
- [ ] SQL injection protection (Prisma ORM)
- [ ] XSS protection (input validation)

---

## Troubleshooting

### High Memory Usage

```bash
# Check PM2 memory
pm2 monit

# Restart if needed
pm2 restart publishify-backend

# Check for memory leaks
node --inspect dist/main.js
```

### Database Connection Issues

```bash
# Test connection
psql $DATABASE_URL

# Check active connections
SELECT count(*) FROM pg_stat_activity;

# Kill idle connections
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE state = 'idle' AND state_change < now() - interval '1 hour';
```

### Redis Connection Issues

```bash
# Test Redis
redis-cli -h $REDIS_HOST -p $REDIS_PORT -a $REDIS_PASSWORD ping

# Check memory
redis-cli info memory

# Clear cache if needed
redis-cli FLUSHDB
```

---

## Rollback Strategy

### Docker Rollback

```bash
# List images
docker images

# Run specific version
docker run -d publishify-backend:v1.0.0

# Or with docker-compose
docker-compose down
docker-compose up -d --build --force-recreate
```

### Database Rollback

```bash
# Prisma migrate rollback (1 migration)
bunx prisma migrate resolve --rolled-back <migration-name>

# Restore from backup
psql $DATABASE_URL < backup-20240120.sql
```

### PM2 Rollback

```bash
# Keep previous build
mv dist dist-backup
mv dist-previous dist

# Restart
pm2 restart publishify-backend
```

---

## Continuous Deployment (CI/CD)

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest

      - name: Install dependencies
        run: bun install

      - name: Run tests
        run: bun test

      - name: Build
        run: bun run build

      - name: Deploy to server
        uses: appleboy/scp-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          source: "dist/*"
          target: "/var/www/publishify/backend"

      - name: Restart PM2
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /var/www/publishify/backend
            pm2 restart publishify-backend
```

---

## Support & Monitoring

### Setup Logging

Logs sudah configured dengan Winston, check:

- Docker: `docker-compose logs -f backend`
- PM2: `pm2 logs publishify-backend`
- Files: `./logs/error.log` dan `./logs/combined.log`

### Monitoring Dashboards

Setup monitoring untuk track:

- API response times
- Error rates
- Database query performance
- Redis memory usage
- CPU & Memory usage
- Request rates

Recommended: Grafana + Prometheus

---

Selamat! Backend Publishify sudah production-ready! 🎉
