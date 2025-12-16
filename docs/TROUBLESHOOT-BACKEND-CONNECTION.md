# 🔧 Backend Connection Troubleshooting

## ❌ Error: Network Error

Jika Anda melihat error **"Network Error"** saat login atau mengakses fitur percetakan, artinya **frontend tidak bisa terhubung ke backend**.

---

## 🔍 Penyebab Umum

### 1. **Backend Tidak Running**
Backend harus berjalan di `http://localhost:4000`

**Cek Status:**
```bash
# Windows (PowerShell)
Test-NetConnection -ComputerName localhost -Port 4000

# Atau coba curl
curl http://localhost:4000/api/health
```

**Jika backend tidak running, jalankan:**
```bash
cd backend
npm run start:dev
```

Output yang benar:
```
[Nest] 12345  - 16/12/2025, 10:30:45     LOG [NestFactory] Starting Nest application...
[Nest] 12345  - 16/12/2025, 10:30:45     LOG [InstanceLoader] AppModule dependencies initialized
...
[Nest] 12345  - 16/12/2025, 10:30:46     LOG [NestApplication] Nest application successfully started
[Nest] 12345  - 16/12/2025, 10:30:46     LOG Application is running on: http://localhost:4000
```

---

### 2. **Backend Crash / Error**

Cek terminal backend untuk error. Common errors:

#### Error: Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::4000
```

**Solusi:**
```powershell
# Kill process yang menggunakan port 4000
Get-Process -Id (Get-NetTCPConnection -LocalPort 4000).OwningProcess | Stop-Process -Force

# Atau ganti port di .env
PORT=4001
```

#### Error: Database Connection
```
Error: P1001: Can't reach database server
```

**Solusi:**
1. Cek koneksi internet (Supabase adalah cloud database)
2. Verify `DATABASE_URL` di `backend/.env`
3. Test koneksi:
   ```bash
   cd backend
   npx prisma db pull
   ```

---

### 3. **CORS Error**

Jika error adalah **CORS** (bukan Network Error):
```
Access to XMLHttpRequest at 'http://localhost:4000/api/auth/login' from origin 'http://localhost:3000' has been blocked by CORS
```

**Solusi:**

Edit `backend/src/main.ts`:
```typescript
app.enableCors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
```

---

### 4. **Firewall / Antivirus**

Beberapa antivirus memblokir localhost connections.

**Solusi:**
1. Tambahkan exception untuk Node.js di antivirus
2. Sementara disable firewall untuk testing
3. Gunakan IP `127.0.0.1` sebagai ganti `localhost`

Update `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:4000/api
```

---

## ✅ Verifikasi Backend Berjalan

### 1. Test Health Endpoint

**PowerShell:**
```powershell
Invoke-WebRequest -Uri http://localhost:4000/api/health -Method GET
```

**Expected Response:**
```json
{
  "sukses": true,
  "pesan": "Server berjalan dengan baik",
  "data": {
    "timestamp": "2025-12-16T03:30:00.000Z",
    "uptime": 123.45,
    "environment": "development"
  }
}
```

### 2. Test Login Endpoint

**PowerShell:**
```powershell
$body = @{
  email = "percetakan@publishify.com"
  password = "Password123!"
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:4000/api/auth/login -Method POST -Body $body -ContentType "application/json"
```

**Expected Response:** Status 200 dengan access token

---

## 🚀 Quick Fix Checklist

Ikuti langkah ini secara berurutan:

```bash
# 1. Navigate ke backend
cd backend

# 2. Install dependencies (jika belum)
npm install

# 3. Generate Prisma Client
npx prisma generate

# 4. Push database schema (jika ada perubahan)
npx prisma db push

# 5. Seed database (jika perlu data dummy)
npx tsx prisma/seed.ts

# 6. Start backend
npm run start:dev

# Buka terminal baru untuk frontend
cd ../frontend

# 7. Start frontend
npm run dev
```

---

## 🔄 Restart Semua Service

Jika masih error, restart semua:

```powershell
# Stop semua Node.js process
Get-Process -Name node | Stop-Process -Force

# Bersihkan cache
cd backend
Remove-Item -Recurse -Force node_modules, dist
npm install
npx prisma generate

cd ../frontend
Remove-Item -Recurse -Force node_modules, .next
npm install

# Start backend
cd ../backend
npm run start:dev

# Terminal baru: Start frontend
cd ../frontend
npm run dev
```

---

## 📊 Monitoring Backend

### Real-time Logs

Terminal backend akan menampilkan log untuk setiap request:

```
🎯 [PERCETAKAN] Membuat Pesanan Baru
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 ID Pemesan: abc123
📝 DTO: {...}

✅ Pesanan berhasil dibuat!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Jika tidak ada log saat akses frontend, berarti request tidak sampai ke backend.

---

## 🆘 Masih Error?

Jika semua di atas sudah dicoba tapi masih error:

1. **Screenshot error lengkap** (frontend console + backend terminal)
2. **Cek versi Node.js**: `node --version` (harus >= 18.0.0)
3. **Cek versi npm**: `npm --version`
4. **Cek package.json backend**:
   - Port harus `4000`
   - Script `start:dev` harus ada

5. **Test dengan Postman/Insomnia**:
   - GET `http://localhost:4000/api/health`
   - POST `http://localhost:4000/api/auth/login`
   
   Jika Postman bisa connect tapi frontend tidak, berarti masalah di CORS.

---

## 📝 Environment Variables Checklist

### Backend `.env`

```env
PORT=4000
DATABASE_URL=postgresql://...
JWT_SECRET=...
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

### Frontend `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

---

## 🎯 Test Connectivity Script

Buat file `test-connection.js` di root:

```javascript
const axios = require('axios');

async function testConnection() {
  try {
    console.log('Testing backend connection...');
    const response = await axios.get('http://localhost:4000/api/health');
    console.log('✅ Backend is running!');
    console.log('Response:', response.data);
  } catch (error) {
    console.error('❌ Cannot connect to backend!');
    console.error('Error:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n🔧 Backend is not running. Start it with:');
      console.error('   cd backend && npm run start:dev');
    }
  }
}

testConnection();
```

Run:
```bash
node test-connection.js
```

---

**Last Updated:** 16 December 2025
