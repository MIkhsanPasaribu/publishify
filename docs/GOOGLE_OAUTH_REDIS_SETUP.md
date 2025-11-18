# Setup Guide - Google OAuth & Redis

## 📋 Daftar Isi

1. [Google OAuth 2.0 Setup](#google-oauth-20-setup)
2. [Redis Setup](#redis-setup)
3. [Environment Variables](#environment-variables)
4. [Testing OAuth Flow](#testing-oauth-flow)
5. [Troubleshooting](#troubleshooting)

---

## 🔐 Google OAuth 2.0 Setup

### Langkah 1: Buat Project di Google Cloud Console

1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Klik **"Select a project"** → **"New Project"**
3. Nama project: **Publishify**
4. Klik **"Create"**

### Langkah 2: Enable Google+ API

1. Di sidebar, pilih **"APIs & Services"** → **"Library"**
2. Cari **"Google+ API"**
3. Klik **"Enable"**

### Langkah 3: Buat OAuth 2.0 Client ID

1. Di sidebar, pilih **"APIs & Services"** → **"Credentials"**
2. Klik **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
3. Pilih **"Web application"**
4. Konfigurasi:
   - **Name**: `Publishify Web Client`
   - **Authorized JavaScript origins**:
     - `http://localhost:3000` (frontend)
     - `http://localhost:4000` (backend)
   - **Authorized redirect URIs**:
     - `http://localhost:4000/api/auth/google/callback` ✅ **PENTING!**
5. Klik **"Create"**
6. **Simpan** Client ID dan Client Secret yang muncul

### Langkah 4: Configure OAuth Consent Screen

1. Di sidebar, pilih **"OAuth consent screen"**
2. Pilih **"External"** → **"CREATE"**
3. Isi form:
   - **App name**: `Publishify`
   - **User support email**: Email Anda
   - **Developer contact**: Email Anda
4. Klik **"Save and Continue"**
5. **Scopes**: Tambahkan:
   - `userinfo.email`
   - `userinfo.profile`
6. Klik **"Save and Continue"**
7. **Test users**: Tambahkan email untuk testing (optional di development mode)
8. Klik **"Save and Continue"**

---

## 🗄️ Redis Setup

### Option 1: Redis Cloud (Recommended untuk Development)

✅ **Sudah terkonfigurasi di backend!**

Credentials yang sudah disetup:
```env
REDIS_HOST=redis-10660.c292.ap-southeast-1-1.ec2.redns.redis-cloud.com
REDIS_PORT=10660
REDIS_USERNAME=default
REDIS_PASSWORD=MUZe6TplPCMYMTmYZ8abtFm5YbYsHf0Z
REDIS_DB=0
```

**Tidak perlu install apapun!** Redis Cloud sudah aktif dan siap digunakan.

### Option 2: Local Redis (Docker)

Jika ingin menggunakan Redis lokal:

```powershell
# Pull Redis image
docker pull redis:latest

# Run Redis container
docker run -d `
  --name publishify-redis `
  -p 6379:6379 `
  redis:latest

# Test connection
docker exec -it publishify-redis redis-cli ping
# Should return: PONG
```

Update `.env`:
```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

### Option 3: WSL Redis

Jika menggunakan WSL:

```bash
# Install Redis
sudo apt update
sudo apt install redis-server

# Start Redis
sudo service redis-server start

# Test
redis-cli ping
# Should return: PONG
```

---

## ⚙️ Environment Variables

### Backend (`backend/.env` atau `backend/.env.local`)

```env
# Google OAuth 2.0
GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE
GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET_HERE
GOOGLE_CALLBACK_URL=http://localhost:4000/api/auth/google/callback
FRONTEND_AUTH_CALLBACK=http://localhost:3000/auth/callback
OAUTH_STATE_EXPIRY=300

# Redis (Option 1: Redis Cloud - Already Configured)
REDIS_HOST=redis-10660.c292.ap-southeast-1-1.ec2.redns.redis-cloud.com
REDIS_PORT=10660
REDIS_USERNAME=default
REDIS_PASSWORD=MUZe6TplPCMYMTmYZ8abtFm5YbYsHf0Z
REDIS_DB=0

# Redis (Option 2: Local Redis)
# REDIS_HOST=localhost
# REDIS_PORT=6379
# REDIS_PASSWORD=
# REDIS_DB=0
```

### Frontend (`frontend/.env`)

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:4000

# Frontend URL (untuk OAuth callback)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🧪 Testing OAuth Flow

### 1. Start Backend

```powershell
cd backend
bun run start:dev
```

**Cek log:**
- ✅ Backend running di `http://localhost:4000`
- ✅ Tidak ada error Google OAuth
- ✅ Tidak ada error Redis connection
- ⚠️ Jika ada warning "Google OAuth disabled" → cek `GOOGLE_CLIENT_ID` di `.env`
- ⚠️ Jika ada warning "Redis unavailable, falling back to in-memory cache" → Redis optional, app tetap jalan

### 2. Start Frontend

```powershell
cd frontend
npm run dev
```

**Cek log:**
- ✅ Frontend running di `http://localhost:3000`

### 3. Test Login Flow

#### A. Login Page (`http://localhost:3000/login`)

1. Klik tombol **"Continue with Google"**
2. Redirect ke Google OAuth consent screen
3. Pilih akun Google Anda
4. Klik **"Allow"** (grant permissions)
5. Redirect kembali ke `http://localhost:3000/auth/callback`
6. Loading → Success → Redirect ke Dashboard

**Expected URL Flow:**
```
1. http://localhost:3000/login
2. http://localhost:4000/api/auth/google
3. https://accounts.google.com/o/oauth2/v2/auth?...
4. http://localhost:4000/api/auth/google/callback?code=xxx&state=xxx
5. http://localhost:3000/auth/callback?token=xxx&refresh=xxx&success=true
6. http://localhost:3000/dashboard
```

#### B. Register Page (`http://localhost:3000/register`)

Flow sama seperti login. Jika akun belum ada, akan dibuat otomatis.

### 4. Verify Tokens

Buka **Developer Tools** → **Application** → **Local Storage**:

```json
{
  "publishify-auth": {
    "state": {
      "pengguna": { ... },
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

---

## 🔧 Troubleshooting

### ❌ Error: "OAuth2Strategy requires a clientID option"

**Cause:** `GOOGLE_CLIENT_ID` tidak ada di `.env`

**Solution:**
1. Check `backend/.env` atau `backend/.env.local`
2. Pastikan ada:
   ```env
   GOOGLE_CLIENT_ID=your-client-id-here
   GOOGLE_CLIENT_SECRET=your-client-secret-here
   ```
3. Restart backend: `bun run start:dev`

---

### ❌ Error: "ECONNREFUSED ::1:6379" (Redis)

**Cause:** Redis tidak running / tidak tersedia

**Solution A** - Gunakan Redis Cloud (Recommended):
- Redis Cloud sudah dikonfigurasi di `.env`
- Pastikan env vars Redis Cloud tidak di-comment
- Restart backend

**Solution B** - Disable Redis (Development Only):
- Backend sudah auto-fallback ke in-memory cache
- Lihat warning di log: "Redis unavailable, falling back to in-memory cache"
- App tetap jalan, tapi cache tidak persistent

**Solution C** - Install Redis Local:
```powershell
# Option 1: Docker
docker run -d --name publishify-redis -p 6379:6379 redis:latest

# Option 2: WSL
wsl
sudo service redis-server start
```

---

### ❌ Error: "redirect_uri_mismatch"

**Cause:** Redirect URI di Google Console tidak match dengan backend

**Solution:**
1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. **APIs & Services** → **Credentials**
3. Edit OAuth 2.0 Client
4. **Authorized redirect URIs** harus **EXACT**:
   ```
   http://localhost:4000/api/auth/google/callback
   ```
5. Save & tunggu 1-2 menit untuk propagasi
6. Clear browser cache & try again

---

### ❌ Error: "Access blocked: Publishify has not completed the Google verification process"

**Cause:** OAuth consent screen belum di-approve (untuk production)

**Solution for Development:**
1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. **OAuth consent screen** → **Test users**
3. Tambahkan email Anda sebagai test user
4. Try login lagi dengan email tersebut

**Solution for Production:**
- Submit app untuk Google verification
- Proses review 3-7 hari

---

### ❌ Frontend: "Google OAuth belum dikonfigurasi pada server"

**Cause:** Backend credentials tidak ada atau salah

**Check Backend:**
```powershell
cd backend
bun run start:dev
```

Lihat log:
- ⚠️ `[AuthModule] Google OAuth disabled - GOOGLE_CLIENT_ID/SECRET tidak diset`

**Solution:**
1. Add credentials ke `backend/.env`:
   ```env
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret
   ```
2. Restart backend

---

### ❌ Frontend: "Terjadi kesalahan saat memproses login"

**Cause:** Backend OAuth callback gagal

**Debug Steps:**
1. **Check Backend Log:**
   ```
   [GoogleOAuthCallback] Error: ...
   ```

2. **Check Browser URL:**
   ```
   http://localhost:3000/auth/callback?error=oauth_callback_failed&message=...
   ```

3. **Common Causes:**
   - State token expired (5 minutes)
   - Email tidak verified di Google
   - Scope permissions tidak granted

**Solution:**
- Try login lagi
- Check email verified di Google account
- Clear cookies & try again

---

### ✅ Success Indicators

**Backend Log:**
```
[Nest] INFO [NestApplication] Nest application successfully started
[Nest] INFO [AuthModule] Google OAuth Strategy initialized
[Nest] INFO [CacheModule] Redis connected successfully
```

**Frontend:**
- Button "Continue with Google" ada dan enabled
- Klik button → redirect ke Google (bukan error)
- Setelah Google login → redirect ke callback page
- Callback page → success animation → redirect ke dashboard
- LocalStorage → ada tokens

---

## 📝 Quick Reference

### Backend Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/google` | Initiate OAuth flow |
| GET | `/api/auth/google/callback` | Google callback (handle code) |
| POST | `/api/auth/google/link` | Link Google to existing account |
| DELETE | `/api/auth/google/unlink` | Unlink Google account |

### Frontend Routes

| Route | Description |
|-------|-------------|
| `/login` | Login page with Google button |
| `/register` | Register page with Google button |
| `/auth/callback` | OAuth callback handler |
| `/dashboard` | Protected dashboard |

### Environment Variables Check

```powershell
# Backend
cd backend
cat .env | grep GOOGLE
cat .env | grep REDIS

# Frontend
cd frontend
cat .env | grep NEXT_PUBLIC
```

---

## 🚀 Production Deployment

### Google OAuth

1. Update redirect URIs di Google Console:
   ```
   https://yourdomain.com/api/auth/google/callback
   ```

2. Update environment variables:
   ```env
   GOOGLE_CALLBACK_URL=https://yourdomain.com/api/auth/google/callback
   FRONTEND_AUTH_CALLBACK=https://yourdomain.com/auth/callback
   ```

3. Submit app untuk Google verification

### Redis

1. **Recommended:** Redis Cloud Pro
   - Persistent storage
   - Auto-backup
   - High availability

2. **Alternative:** Self-hosted Redis
   - Use Redis Sentinel for HA
   - Enable AOF persistence
   - Setup replication

3. Update production env vars:
   ```env
   REDIS_HOST=your-production-redis-host
   REDIS_PORT=6379
   REDIS_PASSWORD=strong-password-here
   REDIS_DB=0
   ```

---

## 📞 Support

Jika masih ada issue:

1. Check log backend & frontend
2. Verify environment variables
3. Test dengan akun Google berbeda
4. Clear browser cache & cookies
5. Restart backend & frontend

**Common Issues Fix Rate:**
- 80% → Missing/wrong env vars
- 15% → Google Console config salah
- 5% → Network/firewall issues
