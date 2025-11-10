# ✅ Redis Cloud Setup Checklist

## 📝 Step-by-Step Instructions

### ✅ Step 1: Create Redis Cloud Account & Database

1. [ ] Visit: https://redis.com/try-free/
2. [ ] Sign up dengan Google/GitHub/Email
3. [ ] Verify email (jika perlu)
4. [ ] Login ke dashboard

### ✅ Step 2: Create Database

Di Redis Cloud dashboard:

1. [ ] Klik **"Create database"** atau **"New Database"**
2. [ ] Database settings:
   - Name: `publishify-cache`
   - Region: **Asia Pacific (Singapore)** atau **ap-southeast-1**
   - Plan: **Free** (30MB)
   - Type: Subscription
3. [ ] Klik **"Create"**
4. [ ] Tunggu 1-2 menit sampai database ready

### ✅ Step 3: Get Connection Details

Di database dashboard (publishify-cache):

1. [ ] Copy **Public endpoint**:

   ```
   Contoh: redis-12345.c123.ap-southeast-1-1.ec2.cloud.redislabs.com
   ```

2. [ ] Copy **Port**:

   ```
   Contoh: 12345
   ```

3. [ ] Copy **Default user password**:
   - Klik icon "eye" untuk show password
   - Copy full password (biasanya random string)
   ```
   Contoh: AbCdEf123456XyZ...
   ```

### ✅ Step 4: Update .env File

1. [ ] Buka file: `backend/.env`

2. [ ] Temukan section Redis (line ~31-45)

3. [ ] Update 3 nilai ini dengan connection details dari Redis Cloud:

   ```env
   REDIS_HOST=your-endpoint-here.cloud.redislabs.com
   REDIS_PORT=your-port-here
   REDIS_PASSWORD=your-password-here
   REDIS_DB=0
   ```

   **Contoh setelah diisi**:

   ```env
   REDIS_HOST=redis-12345.c123.ap-southeast-1-1.ec2.cloud.redislabs.com
   REDIS_PORT=12345
   REDIS_PASSWORD=AbCdEf123456XyZ789...
   REDIS_DB=0
   ```

4. [ ] Save file

### ✅ Step 5: Test Connection

Di terminal PowerShell:

```powershell
cd backend
bun run test:redis
```

**Expected output**:

```
✅ Redis connected successfully!
✅ PING: PONG
✅ SET test-key = "Hello from Publishify Backend!"
✅ GET test-key = "Hello from Publishify Backend!"
✅ SETEX ttl-key with TTL = 60 seconds
✅ INCR counter = 1
✅ HGET user:1 name = "Ahmad Surya"
✅ Total keys in DB: 4
✅ Cleanup: Test keys deleted

🎉 All Redis tests passed!

📊 Redis is ready for caching in Publishify Backend!

Redis Version: 7.x.x
```

**If error**: Check connection details di `.env` lagi

### ✅ Step 6: Start Backend

```powershell
bun run start:dev
```

**Expected dalam logs**:

```
[Nest] INFO [CacheModule] Redis cache initialized
[Nest] INFO [CacheModule] Cache store: redis
```

### ✅ Step 7: Test Cache Endpoint

Di terminal baru (PowerShell):

```powershell
# First request (cache MISS)
curl http://localhost:4000/api/kategori/aktif

# Second request (cache HIT - should be faster!)
curl http://localhost:4000/api/kategori/aktif
```

**Check logs** di terminal backend:

```
[CacheInterceptor] Cache MISS for key: GET:/api/kategori/aktif
[CacheInterceptor] Cache HIT for key: GET:/api/kategori/aktif  ← Second request
```

### ✅ Step 8: Verify in Redis Cloud Dashboard

1. [ ] Buka Redis Cloud dashboard
2. [ ] Klik database **publishify-cache**
3. [ ] Lihat **Metrics** tab:
   - Commands/sec > 0
   - Memory usage > 0 KB
   - Connected clients: 1

---

## 🎉 SUCCESS! Redis Cloud is Ready!

Cache system sekarang menggunakan Redis Cloud:

- ✅ Response time lebih cepat (cache HIT)
- ✅ Database load berkurang
- ✅ Ready untuk production deployment

---

## 📊 Monitoring

### Via Redis Cloud Dashboard

1. **Commands/sec**: Monitor request rate
2. **Memory usage**: Track cache size (max 30MB free)
3. **Connected clients**: Should show 1 connection
4. **Latency**: Average response time

### Via Backend Logs

Watch untuk:

- Cache HIT/MISS ratio
- Target: >80% HIT rate
- If MISS rate tinggi, consider increase TTL

---

## 🔧 Troubleshooting

### ❌ Error: "Connection timeout"

**Solutions**:

1. Check internet connection
2. Verify endpoint & port di .env
3. Check Redis Cloud dashboard - database status should be "Active"

### ❌ Error: "Authentication failed"

**Solutions**:

1. Check password di .env (pastikan tidak ada spasi extra)
2. Copy password lagi dari Redis Cloud dashboard
3. Pastikan quote marks correct (jangan pakai smart quotes)

### ❌ Error: "Connection refused"

**Solutions**:

1. Check Redis Cloud dashboard - database should be "Active"
2. Verify region pilih yang dekat (Singapore)
3. Try recreate database jika masih error

### ❌ Cache tidak kerja (always MISS)

**Solutions**:

1. Restart backend: `Ctrl+C` then `bun run start:dev`
2. Check logs untuk "Redis cache initialized"
3. Verify test:redis passed

---

## 💡 Tips

1. **Free tier limits**: 30MB storage, unlimited requests
2. **Upgrade jika perlu**: $5/month untuk 100MB
3. **Monitor usage**: Set alert di dashboard jika memory >80%
4. **Backup**: Redis Cloud auto-backup daily (free tier)
5. **SSL/TLS**: Automatically enabled di Redis Cloud

---

## 📞 Need Help?

- Full guide: `backend/docs/REDIS-SETUP-GUIDE.md`
- Quick troubleshooting: Check error messages di `test:redis`
- Redis Cloud support: https://redis.com/company/support/

**Happy caching!** 🚀
