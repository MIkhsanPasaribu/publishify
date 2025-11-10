# 🔧 Redis Setup Guide untuk Publishify Backend

## 📋 Pilihan Setup Redis

Ada 3 pilihan utama untuk setup Redis:

---

## ✅ Option 1: Local Redis (Recommended untuk Development)

### Untuk Windows (Paling Mudah)

#### A. Menggunakan Docker (Recommended)

1. **Install Docker Desktop**:
   - Download dari: https://www.docker.com/products/docker-desktop/
   - Install dan jalankan Docker Desktop

2. **Run Redis Container**:

   ```powershell
   docker run -d --name publishify-redis -p 6379:6379 redis:7-alpine
   ```

3. **Verifikasi Redis berjalan**:

   ```powershell
   docker ps
   # Should show publishify-redis container
   ```

4. **Test koneksi**:

   ```powershell
   docker exec -it publishify-redis redis-cli ping
   # Should return: PONG
   ```

5. **Configuration di .env**:

   ```env
   REDIS_HOST=localhost
   REDIS_PORT=6379
   REDIS_PASSWORD=
   REDIS_DB=0
   ```

6. **Commands berguna**:

   ```powershell
   # Stop Redis
   docker stop publishify-redis

   # Start Redis
   docker start publishify-redis

   # View logs
   docker logs publishify-redis

   # Remove container
   docker rm -f publishify-redis
   ```

#### B. Menggunakan Windows Subsystem for Linux (WSL)

1. **Install WSL2**:

   ```powershell
   wsl --install
   ```

2. **Install Redis di WSL**:

   ```bash
   sudo apt update
   sudo apt install redis-server
   ```

3. **Start Redis**:

   ```bash
   sudo service redis-server start
   ```

4. **Test**:

   ```bash
   redis-cli ping
   # Should return: PONG
   ```

5. **Configuration di .env**: Same as Docker option

#### C. Menggunakan Memurai (Native Windows Redis)

1. **Download Memurai**:
   - Visit: https://www.memurai.com/get-memurai
   - Free untuk development (Redis-compatible)

2. **Install dan Start**:
   - Run installer
   - Service akan auto-start

3. **Configuration di .env**: Same as Docker option

---

## ☁️ Option 2: Redis Cloud (Free 30MB) - Recommended untuk Production

### Setup Redis Cloud (Free Tier)

1. **Daftar akun**:
   - Visit: https://redis.com/try-free/
   - Sign up (Google/GitHub/Email)

2. **Create database**:
   - Click "New Database"
   - Choose region: **Asia Pacific (Singapore)** atau terdekat
   - Database name: `publishify-cache`
   - Select **Free 30MB plan**

3. **Get connection details**:
   - Public endpoint: `redis-12345.c123.ap-southeast-1-1.ec2.cloud.redislabs.com`
   - Port: `12345`
   - Password: Copy dari dashboard

4. **Update .env**:

   ```env
   REDIS_HOST=redis-12345.c123.ap-southeast-1-1.ec2.cloud.redislabs.com
   REDIS_PORT=12345
   REDIS_PASSWORD=your-redis-cloud-password-here
   REDIS_DB=0
   ```

5. **Test koneksi** (dari backend folder):

   ```powershell
   # Install redis-cli (via npm)
   npm install -g redis-cli

   # Test connection
   redis-cli -h redis-12345.c123.ap-southeast-1-1.ec2.cloud.redislabs.com -p 12345 -a your-password ping
   ```

**Pros**:

- ✅ Free 30MB (cukup untuk 50K+ keys)
- ✅ Managed service (no maintenance)
- ✅ Auto backup
- ✅ SSL/TLS support
- ✅ Monitoring dashboard

**Cons**:

- ⚠️ 30MB limit (upgrade ke $5/month untuk 100MB)
- ⚠️ Shared cluster (bisa slower sedikit)

---

## 🚀 Option 3: Upstash Redis (Serverless) - Best untuk Serverless Deployment

### Setup Upstash Redis

1. **Daftar akun**:
   - Visit: https://upstash.com/
   - Sign up (Google/GitHub/Email)

2. **Create database**:
   - Click "Create Database"
   - Name: `publishify-cache`
   - Region: **Asia Pacific (ap-southeast-1)** atau terdekat
   - Type: **Regional** (Free)
   - TLS: **Enabled**

3. **Get connection details**:
   - Endpoint: `nearby-dolphin-12345.upstash.io`
   - Port: `6379` (with TLS) atau `6380` (without TLS)
   - Password: Copy dari dashboard

4. **Update .env**:

   ```env
   REDIS_HOST=nearby-dolphin-12345.upstash.io
   REDIS_PORT=6379
   REDIS_PASSWORD=your-upstash-password-here
   REDIS_DB=0
   ```

5. **Update CacheModule** (jika pakai TLS):

   Edit `src/common/cache/cache.module.ts`:

   ```typescript
   // Add TLS config for Upstash
   {
     store: redisStore,
     socket: {
       host: process.env.REDIS_HOST,
       port: parseInt(process.env.REDIS_PORT || '6379'),
       tls: process.env.NODE_ENV === 'production', // TLS for production
     },
     password: process.env.REDIS_PASSWORD,
     database: parseInt(process.env.REDIS_DB || '0'),
   }
   ```

**Pros**:

- ✅ Free 10K commands/day (reset harian)
- ✅ Pay-per-request (no idle cost)
- ✅ Global replicas
- ✅ Auto-scaling
- ✅ Perfect untuk Vercel/Netlify deployment

**Cons**:

- ⚠️ 10K commands/day limit (upgrade ke $0.20 per 100K)
- ⚠️ Per-request billing (bisa mahal jika traffic tinggi)

---

## 🧪 Testing Redis Connection

### Test dari Backend Code

Create file `backend/test-redis.ts`:

```typescript
import { createClient } from 'redis';

async function testRedis() {
  const client = createClient({
    socket: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
    },
    password: process.env.REDIS_PASSWORD || undefined,
    database: parseInt(process.env.REDIS_DB || '0'),
  });

  try {
    await client.connect();
    console.log('✅ Redis connected successfully!');

    // Test SET
    await client.set('test-key', 'Hello Redis!');
    console.log('✅ SET test-key = "Hello Redis!"');

    // Test GET
    const value = await client.get('test-key');
    console.log(`✅ GET test-key = "${value}"`);

    // Test TTL
    await client.setEx('ttl-key', 60, 'Expires in 60s');
    const ttl = await client.ttl('ttl-key');
    console.log(`✅ TTL ttl-key = ${ttl} seconds`);

    // Test DELETE
    await client.del('test-key', 'ttl-key');
    console.log('✅ DELETE keys successful');

    console.log('\n🎉 All Redis tests passed!');
  } catch (error) {
    console.error('❌ Redis connection failed:', error);
  } finally {
    await client.disconnect();
  }
}

testRedis();
```

Run test:

```powershell
cd backend
bun run test-redis.ts
```

### Test dari NestJS App

Start backend dan cek logs:

```powershell
cd backend
bun run start:dev
```

Should see:

```
[Nest] INFO [CacheModule] Redis cache initialized
[Nest] INFO [CacheModule] Cache store: redis
```

Test endpoint dengan cache:

```powershell
# First request (cache MISS)
curl http://localhost:4000/api/kategori/aktif

# Second request (cache HIT - should be faster)
curl http://localhost:4000/api/kategori/aktif
```

Check logs untuk cache HIT/MISS messages.

---

## 📊 Monitoring Redis Usage

### Redis Cloud Dashboard

- Visit dashboard: https://app.redislabs.com/
- View metrics: Commands/sec, Memory usage, Connections
- Set alerts untuk memory usage

### Upstash Dashboard

- Visit dashboard: https://console.upstash.com/
- View daily commands count
- Monitor request latency

### Local Redis (Docker)

```powershell
# Monitor commands in real-time
docker exec -it publishify-redis redis-cli monitor

# Get stats
docker exec -it publishify-redis redis-cli info stats

# Get memory usage
docker exec -it publishify-redis redis-cli info memory

# Count keys
docker exec -it publishify-redis redis-cli dbsize
```

### NestJS CacheService Stats

```typescript
// In your controller/service
const stats = await this.cacheService.getStats();
console.log('Cache Stats:', stats);
```

---

## 🔒 Security Best Practices

### 1. Jangan commit password ke Git

```bash
# .gitignore should include:
.env
.env.local
.env.*.local
```

### 2. Gunakan strong password (Production)

```bash
# Generate random password
openssl rand -base64 32
```

### 3. Enable TLS (Production)

```env
REDIS_TLS_ENABLED=true
```

### 4. Restrict network access

- Redis Cloud: IP whitelist di dashboard
- Upstash: Auto-restricted, TLS enforced
- Local: Bind to 127.0.0.1 only

### 5. Set maxmemory policy

```bash
# Recommended untuk cache
CONFIG SET maxmemory-policy allkeys-lru
```

---

## 🎯 Rekomendasi Setup berdasarkan Skenario

### 👨‍💻 Development (Local Machine)

**Pilihan**: Docker Redis

- Fastest setup
- No external dependencies
- Free
- Full control

**Command**:

```powershell
docker run -d --name publishify-redis -p 6379:6379 redis:7-alpine
```

### 🧪 Staging/Testing

**Pilihan**: Redis Cloud Free

- 30MB storage
- Managed service
- Similar to production setup
- Auto backups

### 🚀 Production (Small-Medium Traffic)

**Pilihan**: Redis Cloud Paid ($5-10/month)

- 100MB-250MB storage
- High availability
- Auto scaling
- 24/7 support

### ☁️ Production (Serverless/Vercel)

**Pilihan**: Upstash Redis

- Pay-per-request
- Auto-scaling
- Global replicas
- Perfect for serverless

---

## 🐛 Troubleshooting

### Error: "Connection refused"

```
✅ Check Redis is running: docker ps
✅ Check port: telnet localhost 6379
✅ Check firewall: Temporarily disable
```

### Error: "NOAUTH Authentication required"

```
✅ Set REDIS_PASSWORD in .env
✅ Or remove password: REDIS_PASSWORD=
```

### Error: "Maximum number of clients reached"

```
✅ Check connection pool config in cache.module.ts
✅ Increase maxRetriesPerRequest
```

### Cache not working (always MISS)

```
✅ Check CacheInterceptor is registered
✅ Check @CacheTTL() decorator is present
✅ Verify Redis connection: bun run test-redis.ts
```

### Slow cache performance

```
✅ Use closer Redis region
✅ Enable TLS compression
✅ Reduce payload size (serialize only needed fields)
```

---

## 📚 Additional Resources

- [Redis Documentation](https://redis.io/docs/)
- [NestJS Caching](https://docs.nestjs.com/techniques/caching)
- [cache-manager v5 Docs](https://github.com/node-cache-manager/node-cache-manager)
- [Redis Cloud Pricing](https://redis.com/redis-enterprise-cloud/pricing/)
- [Upstash Pricing](https://upstash.com/pricing)

---

## ✅ Quick Start Checklist

### Local Development

- [ ] Install Docker Desktop
- [ ] Run Redis container: `docker run -d --name publishify-redis -p 6379:6379 redis:7-alpine`
- [ ] Verify: `docker ps`
- [ ] Update `.env`: `REDIS_HOST=localhost`
- [ ] Test: `bun run test-redis.ts`
- [ ] Start backend: `bun run start:dev`
- [ ] Test cache: curl API endpoint 2x, check logs

### Production (Redis Cloud)

- [ ] Sign up: https://redis.com/try-free/
- [ ] Create database (Singapore region)
- [ ] Copy connection details
- [ ] Update `.env` with production values
- [ ] Test connection: `redis-cli -h ... -p ... -a ... ping`
- [ ] Deploy backend with new env vars
- [ ] Monitor cache hit rate in dashboard

---

**Pilihan Rekomendasi**:

1. **Development**: Docker Redis (paling mudah)
2. **Production**: Redis Cloud $5/month (reliable & affordable)

Jika ada pertanyaan, silakan tanya! 🚀
