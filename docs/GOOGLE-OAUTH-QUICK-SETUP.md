# ⚡ Google OAuth Setup - Quick Reference

Panduan singkat untuk setup Google OAuth credentials.

---

## 🚀 Steps (5 Minutes)

### 1️⃣ Google Cloud Console

**URL**: https://console.cloud.google.com/

1. **Create Project**: "Publishify"
2. **Enable API**: Google+ API
3. **OAuth Consent**: External, add test users
4. **Create Credentials**: OAuth 2.0 Client ID (Web app)

---

### 2️⃣ OAuth Client Configuration

**Authorized redirect URIs**:

```
http://localhost:4000/api/auth/google/callback
```

⚠️ Must be **exact match** - no trailing slash!

---

### 3️⃣ Copy Credentials

**Client ID** (example):

```
1234567890-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com
```

**Client Secret** (example):

```
GOCSPX-abcdefghijklmnopqrstuvwxyz
```

---

### 4️⃣ Update .env

File: `backend/.env`

```env
GOOGLE_CLIENT_ID=YOUR_ACTUAL_CLIENT_ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=YOUR_ACTUAL_CLIENT_SECRET
GOOGLE_CALLBACK_URL=http://localhost:4000/api/auth/google/callback
FRONTEND_AUTH_CALLBACK=http://localhost:3000/auth/callback
```

---

### 5️⃣ Restart Server

```bash
cd backend
bun run start:dev
```

---

### 6️⃣ Test

**Browser**: http://localhost:4000/api/auth/google

**Expected**: Redirect to Google login page

---

## 🔧 Troubleshooting

| Error                   | Solution                         |
| ----------------------- | -------------------------------- |
| `redirect_uri_mismatch` | Check URI exact match in console |
| `access_denied`         | Add email as test user           |
| `API not enabled`       | Enable Google+ API               |
| `.env not loaded`       | Restart server                   |

---

## 📚 Full Guide

See: `docs/GOOGLE-OAUTH-SETUP-GUIDE.md`

---

**Setup Time**: ~5 minutes  
**Last Updated**: 2025-01-11
