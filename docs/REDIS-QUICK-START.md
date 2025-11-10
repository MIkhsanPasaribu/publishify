# 🚀 Quick Start - Setup Redis untuk Publishify

## 🎯 Pilihan Tercepat untuk Development

### Option 1: Docker (Recommended - Paling Mudah!)

**Prerequisites**: Install Docker Desktop dari <https://www.docker.com/products/docker-desktop/>

#### Step-by-step:

1. **Jalankan Redis dengan Docker**:

   ```powershell
   docker run -d --name publishify-redis -p 6379:6379 redis:7-alpine
   ```

2. **Verifikasi Redis berjalan**:

   ```powershell
   docker ps
   ```

   Seharusnya muncul container `publishify-redis`

3. **Configuration sudah OK!**
   File `.env` sudah configured dengan nilai default:

   ```env
   REDIS_HOST=localhost
   REDIS_PORT=6379
   REDIS_PASSWORD=
   REDIS_DB=0
   ```

4. **Test koneksi Redis**:

   ```powershell
   cd backend
   bun run test:redis
   ```

   Expected output:

   ```
   ✅ Redis connected successfully!
   ✅ PING: PONG
   ✅ SET test-key = "Hello from Publishify Backend!"
   ✅ GET test-key = "Hello from Publishify Backend!"
   ...
   🎉 All Redis tests passed!
   ```

5. **Start backend**:

   ```powershell
   bun run start:dev
   ```

   Cek log, seharusnya ada:

   ```
   [CacheModule] Redis cache initialized
   ```

6. **Test cache endpoint**:

   ```powershell
   # First request (cache MISS - slower)
   curl http://localhost:4000/api/kategori/aktif

   # Second request (cache HIT - faster!)
   curl http://localhost:4000/api/kategori/aktif
   ```

   Cek terminal backend, seharusnya muncul log cache HIT/MISS

**✅ DONE! Redis siap digunakan!**

---

## 🛠️ Docker Commands Berguna

```powershell
# Stop Redis
docker stop publishify-redis

# Start Redis (setelah di-stop)
docker start publishify-redis

# View logs
docker logs publishify-redis

# Interactive Redis CLI
docker exec -it publishify-redis redis-cli

# Remove container (jika ingin reset)
docker rm -f publishify-redis
```

---

## 🔧 Alternative: Redis Cloud (Jika tidak bisa install Docker)

### Setup Redis Cloud Free (30MB)

1. **Sign up**: <https://redis.com/try-free/>
2. **Create database**:
   - Name: `publishify-cache`
   - Region: **Asia Pacific (Singapore)**
   - Plan: **Free 30MB**
3. **Copy connection details** dari dashboard:
   - Endpoint: `redis-xxxxx.c123.ap-southeast-1-1.ec2.cloud.redislabs.com`
   - Port: `xxxxx`
   - Password: `your-password`
4. **Update `.env`**:

   ```env
   REDIS_HOST=redis-xxxxx.c123.ap-southeast-1-1.ec2.cloud.redislabs.com
   REDIS_PORT=xxxxx
   REDIS_PASSWORD=your-password-here
   REDIS_DB=0
   ```

5. **Test**: `bun run test:redis`
6. **Start backend**: `bun run start:dev`

---

## 🐛 Troubleshooting

### ❌ Error: "Connection refused"

**Problem**: Redis tidak berjalan

**Solution**:

```powershell
# Check Redis container
docker ps

# If not running, start it
docker start publishify-redis

# Or create new container
docker run -d --name publishify-redis -p 6379:6379 redis:7-alpine
```

### ❌ Error: "Cannot find module 'redis'"

**Problem**: Package `redis` belum terinstall

**Solution**:

```powershell
cd backend
bun install redis
```

### ❌ Cache tidak berfungsi (selalu MISS)

**Solution**:

1. Check Redis connection:

   ```powershell
   bun run test:redis
   ```

2. Check logs saat start backend, pastikan ada:

   ```
   [CacheModule] Redis cache initialized
   ```

3. Verify decorator di controller:

   ```typescript
   @Get('aktif')
   @CacheTTL(3600)  // ← Must have this!
   async ambilKategoriAktif() { ... }
   ```

---

## 📊 Monitoring Cache Performance

### Via Logs (Console)

Saat request API, lihat logs backend:

```
[CacheInterceptor] Cache MISS for key: GET:/api/kategori/aktif
[CacheInterceptor] Cache HIT for key: GET:/api/kategori/aktif  ← Should see this on 2nd request
```

### Via Redis CLI

```powershell
# Enter Redis CLI
docker exec -it publishify-redis redis-cli

# Inside redis-cli:
> KEYS *
> GET "GET:/api/kategori/aktif"
> TTL "GET:/api/kategori/aktif"
> DBSIZE
> FLUSHDB  # Clear all cache (for testing)
```

### Via Code

Di controller/service, tambahkan:

```typescript
const stats = await this.cacheService.getStats();
console.log('Cache Stats:', stats);
```

---

## ✅ Quick Verification Checklist

Pastikan semua ini ✅:

- [ ] Redis berjalan: `docker ps` shows `publishify-redis`
- [ ] Test pass: `bun run test:redis` shows "All tests passed"
- [ ] Backend start: `bun run start:dev` shows "Redis cache initialized"
- [ ] Cache works: Request API 2x, second request faster + log shows "Cache HIT"

**Jika semua ✅, Redis setup berhasil!** 🎉

---

## 📚 Next Steps

1. ✅ Redis running locally
2. Read: `backend/docs/REDIS-SETUP-GUIDE.md` untuk production setup
3. Read: `backend/docs/cache-implementation.md` untuk custom cache strategy
4. Monitor cache hit rate di production (target >80%)

---

## 🆘 Need Help?

- Full guide: `backend/docs/REDIS-SETUP-GUIDE.md`
- Cache docs: `backend/docs/cache-implementation.md`
- Performance: `backend/docs/performance-optimization-summary.md`

**Happy caching!** 🚀
