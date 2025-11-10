# 🔐 Google OAuth 2.0 Setup Guide - Publishify

Panduan lengkap untuk setup Google OAuth 2.0 credentials untuk Publishify.

---

## 📋 Prerequisites

- ✅ Akun Google (Gmail)
- ✅ Browser (Chrome/Firefox/Edge)
- ✅ Akses ke backend project Publishify
- ✅ Backend sudah running di `http://localhost:4000`

---

## 🚀 Step-by-Step Setup

### **STEP 1: Buka Google Cloud Console**

1. **Buka browser** dan kunjungi:

   ```
   https://console.cloud.google.com/
   ```

2. **Login** dengan akun Google Anda

3. Jika pertama kali, accept **Terms of Service**

---

### **STEP 2: Create New Project**

#### Option A: Create New Project (Recommended)

1. Klik **dropdown "Select a project"** di bagian atas navbar (sebelah logo Google Cloud)

2. Klik tombol **"NEW PROJECT"**

3. Isi form:

   - **Project name**: `Publishify`
   - **Project ID**: (auto-generate, contoh: `publishify-123456`)
   - **Organization**: (kosongkan jika personal account)
   - **Location**: (biarkan default)

4. Klik **"CREATE"**

5. Tunggu 10-30 detik sampai project dibuat

6. **Pilih project** yang baru dibuat dari dropdown "Select a project"

#### Option B: Use Existing Project

1. Klik dropdown **"Select a project"**
2. Pilih project yang sudah ada
3. Klik **"OPEN"**

---

### **STEP 3: Enable Google+ API** ⚠️ **REQUIRED**

Google+ API diperlukan untuk OAuth berfungsi.

1. **Navigate ke API Library**:

   ```
   Sidebar → APIs & Services → Library
   ```

   Atau langsung: https://console.cloud.google.com/apis/library

2. **Search API**:

   - Ketik: `Google+ API` di search bar
   - Atau: `People API`

3. **Enable API**:

   - Klik **"Google+ API"** dari hasil
   - Klik tombol **"ENABLE"**
   - Tunggu beberapa detik

4. **Verify**:
   - Lihat status "API enabled"
   - Atau check di: APIs & Services → Enabled APIs & services

---

### **STEP 4: Configure OAuth Consent Screen**

OAuth Consent Screen adalah halaman yang user lihat saat diminta authorize app.

1. **Navigate ke OAuth consent screen**:

   ```
   Sidebar → APIs & Services → OAuth consent screen
   ```

   Atau langsung: https://console.cloud.google.com/apis/credentials/consent

2. **Pilih User Type**:

   **Development (Recommended)**:

   ```
   ○ Internal (hanya untuk Google Workspace org)
   ● External ← PILIH INI
   ```

   Klik **"CREATE"**

3. **App Information** (Page 1/4):

   | Field                        | Value                                      |
   | ---------------------------- | ------------------------------------------ |
   | App name                     | `Publishify`                               |
   | User support email           | `your-email@gmail.com`                     |
   | App logo                     | (optional) Upload logo 120x120px           |
   | Application home page        | `http://localhost:3000` (optional)         |
   | Application privacy policy   | `http://localhost:3000/privacy` (optional) |
   | Application terms of service | `http://localhost:3000/terms` (optional)   |

   **Authorized domains**:

   ```
   localhost
   ```

   **Developer contact information**:

   ```
   Email addresses: your-email@gmail.com
   ```

   Klik **"SAVE AND CONTINUE"**

4. **Scopes** (Page 2/4):

   Klik **"ADD OR REMOVE SCOPES"**

   **Pilih scopes berikut**:

   ✅ `.../auth/userinfo.email`

   - See your primary Google Account email address

   ✅ `.../auth/userinfo.profile`

   - See your personal info, including any personal info you've made publicly available

   **Cara memilih**:

   - Scroll atau search `userinfo.email`
   - Check checkbox untuk kedua scopes
   - Klik **"UPDATE"**

   **Verify scopes**:

   ```
   ✓ .../auth/userinfo.email
   ✓ .../auth/userinfo.profile
   ```

   Klik **"SAVE AND CONTINUE"**

5. **Test Users** (Page 3/4):

   ⚠️ **PENTING untuk External apps**: Hanya email yang didaftarkan di sini yang bisa login selama app masih "Testing" (belum published).

   Klik **"+ ADD USERS"**

   **Tambahkan email untuk testing**:

   ```
   your-test-email@gmail.com
   another-test@gmail.com
   team-member@gmail.com
   ```

   Klik **"ADD"**

   Klik **"SAVE AND CONTINUE"**

6. **Summary** (Page 4/4):

   Review semua settings, lalu klik **"BACK TO DASHBOARD"**

---

### **STEP 5: Create OAuth 2.0 Client ID**

1. **Navigate ke Credentials**:

   ```
   Sidebar → APIs & Services → Credentials
   ```

   Atau langsung: https://console.cloud.google.com/apis/credentials

2. **Create Credentials**:

   Klik **"+ CREATE CREDENTIALS"** di bagian atas

   Pilih **"OAuth client ID"**

3. **Select Application Type**:

   ```
   Application type: Web application
   ```

4. **Configure OAuth Client**:

   **Name**:

   ```
   Publishify Web Client
   ```

   **Authorized JavaScript origins** (Optional):

   ```
   http://localhost:3000
   http://localhost:4000
   ```

   ⚠️ **Authorized redirect URIs** (REQUIRED):

   ```
   http://localhost:4000/api/auth/google/callback
   ```

   ⚠️ **CRITICAL**: URI ini harus **PERSIS SAMA** dengan backend config!

   **Format checklist**:

   - ✅ Protocol: `http://` (bukan `https://` untuk localhost)
   - ✅ Host: `localhost` (bukan `127.0.0.1`)
   - ✅ Port: `4000` (sesuai backend)
   - ✅ Path: `/api/auth/google/callback` (exact match)
   - ❌ No trailing slash

   Click **"CREATE"**

5. **OAuth client created** popup akan muncul dengan credentials

---

### **STEP 6: Copy Client ID & Client Secret** ⚠️

Popup "OAuth client created" menampilkan credentials Anda:

**Client ID**: (format)

```
1234567890-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com
```

**Client secret**: (format)

```
GOCSPX-abcdefghijklmnopqrstuvwxyz
```

**Actions**:

1. ✅ **Copy Client ID** → Paste ke notepad
2. ✅ **Copy Client Secret** → Paste ke notepad
3. ✅ **Download JSON** (optional - untuk backup)
4. ✅ Click **"OK"**

⚠️ **SECURITY WARNING**:

- **JANGAN** commit Client Secret ke Git
- **JANGAN** share Client Secret ke orang lain
- **JANGAN** hardcode di code
- **GUNAKAN** environment variables (.env)

---

### **STEP 7: Update Backend .env File**

1. **Buka file `.env`**:

   ```
   c:\Users\mikhs\OneDrive\Documents\publishify\backend\.env
   ```

2. **Find Google OAuth section** (around line 50):

   ```env
   # Google OAuth 2.0 Configuration
   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-client-secret
   ```

3. **Replace with your actual credentials**:

   ```env
   GOOGLE_CLIENT_ID=1234567890-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnopqrstuvwxyz
   ```

4. **Verify other OAuth settings**:

   ```env
   GOOGLE_CALLBACK_URL=http://localhost:4000/api/auth/google/callback
   FRONTEND_AUTH_CALLBACK=http://localhost:3000/auth/callback
   OAUTH_STATE_EXPIRY=300
   ```

5. **Save file** (Ctrl+S)

---

### **STEP 8: Restart Backend Server**

OAuth config di-load saat startup, jadi perlu restart:

```bash
# Stop server (Ctrl+C di terminal)

# Start server
cd backend
bun run start:dev

# Or
cd backend
bun run start
```

**Expected output**:

```
[Nest] LOG [NestFactory] Starting Nest application...
[Nest] LOG [InstanceLoader] ConfigHostModule dependencies initialized
[Nest] LOG [InstanceLoader] GoogleOAuthConfig loaded successfully ← Look for this
...
[Nest] LOG [NestApplication] Nest application successfully started
```

---

### **STEP 9: Test OAuth Flow**

#### Manual Test (Browser)

1. **Open browser** dengan Incognito/Private mode (untuk clean test)

2. **Navigate to**:

   ```
   http://localhost:4000/api/auth/google
   ```

3. **Expected behavior**:

   **Step 1**: Backend redirects to Google OAuth page

   ```
   https://accounts.google.com/o/oauth2/v2/auth?
     client_id=YOUR_CLIENT_ID&
     redirect_uri=http://localhost:4000/api/auth/google/callback&
     response_type=code&
     scope=profile email&
     state=RANDOM_STATE_TOKEN&
     access_type=offline&
     prompt=consent
   ```

   **Step 2**: Google login page muncul

   - Login dengan email yang sudah di-add sebagai Test User
   - Grant permissions (email & profile)

   **Step 3**: Redirect ke callback

   ```
   http://localhost:4000/api/auth/google/callback?
     code=AUTHORIZATION_CODE&
     state=SAME_STATE_TOKEN
   ```

   **Step 4**: Backend processes OAuth

   - Validate state token
   - Exchange code for tokens
   - Create/login user
   - Generate JWT tokens

   **Step 5**: Redirect to frontend dengan tokens

   ```
   http://localhost:3000/auth/callback?
     token=JWT_ACCESS_TOKEN&
     refresh=JWT_REFRESH_TOKEN&
     success=true
   ```

4. **Check database**:

   ```sql
   SELECT id, email, google_id, provider, terverifikasi, avatar_url
   FROM pengguna
   WHERE email = 'your-test-email@gmail.com';
   ```

   **Expected result**:

   ```
   id: uuid
   email: your-test-email@gmail.com
   google_id: 123456789012345678901
   provider: google
   terverifikasi: true
   avatar_url: https://lh3.googleusercontent.com/...
   ```

#### Test with cURL

```bash
# Step 1: Get redirect URL
curl -v http://localhost:4000/api/auth/google

# Expected: 302 redirect to Google OAuth page
# Copy the Location header URL and open in browser
```

---

### **STEP 10: Troubleshooting Common Issues**

#### Issue 1: "Error 400: redirect_uri_mismatch"

**Error message**:

```
Error 400: redirect_uri_mismatch
The redirect URI in the request: http://localhost:4000/api/auth/google/callback
does not match the ones authorized for the OAuth client.
```

**Solution**:

1. Go to Google Cloud Console → Credentials
2. Click your OAuth client
3. Check "Authorized redirect URIs"
4. Add **exact** URI: `http://localhost:4000/api/auth/google/callback`
5. Save and retry

**Common mistakes**:

- ❌ `https://` instead of `http://` for localhost
- ❌ `127.0.0.1` instead of `localhost`
- ❌ Wrong port number
- ❌ Trailing slash: `/callback/`
- ❌ Wrong path: `/google/callback` (missing `/api/auth`)

---

#### Issue 2: "Error 403: access_denied"

**Error message**:

```
Error 403: access_denied
The developer hasn't given you access to this app.
```

**Solution**:

1. Go to Google Cloud Console → OAuth consent screen
2. Scroll to "Test users"
3. Add your email as test user
4. Save and retry

---

#### Issue 3: "State tidak valid atau sudah kadaluarsa"

**Error message** (from backend):

```json
{
  "sukses": false,
  "pesan": "State tidak valid atau sudah kadaluarsa"
}
```

**Causes**:

- User took >5 minutes to login (state expired)
- State token already used (replay attack)
- Database issue (state not stored)

**Solution**:

1. Try again (fresh OAuth flow)
2. Check `OAUTH_STATE_EXPIRY` in .env (increase if needed)
3. Check database: `SELECT * FROM oauth_state;`
4. Check backend logs for state validation errors

---

#### Issue 4: Backend can't read .env

**Symptom**:

```
ConfigService error: GOOGLE_CLIENT_ID is undefined
```

**Solution**:

1. Verify `.env` file exists in `backend/` folder
2. Check file is named exactly `.env` (not `.env.txt`)
3. Verify no spaces in variable names:
   ```env
   GOOGLE_CLIENT_ID=...  ✅ Correct
   GOOGLE_CLIENT_ID =... ❌ Wrong (space before =)
   ```
4. Restart backend server
5. Check logs:
   ```typescript
   console.log(process.env.GOOGLE_CLIENT_ID); // Should print your client ID
   ```

---

#### Issue 5: "API Google+ not enabled"

**Error message**:

```
Error 403: Google+ API has not been used in project X before or it is disabled.
```

**Solution**:

1. Go to: https://console.cloud.google.com/apis/library
2. Search: "Google+ API" or "People API"
3. Click API from results
4. Click "ENABLE"
5. Wait 1-2 minutes for propagation
6. Retry OAuth flow

---

### **STEP 11: Production Setup** (Future)

When deploying to production:

1. **Update Authorized redirect URIs** in Google Cloud Console:

   ```
   https://api.publishify.com/api/auth/google/callback
   ```

2. **Update .env** for production:

   ```env
   GOOGLE_CALLBACK_URL=https://api.publishify.com/api/auth/google/callback
   FRONTEND_AUTH_CALLBACK=https://publishify.com/auth/callback
   ```

3. **Publish OAuth consent screen**:

   - Go to: OAuth consent screen
   - Click "PUBLISH APP"
   - Submit for verification (if needed)

4. **Add production domains**:

   - Authorized domains: `publishify.com`
   - Authorized JavaScript origins: `https://publishify.com`

5. **Security checklist**:
   - ✅ Use HTTPS (not HTTP)
   - ✅ Keep Client Secret in secure vault (not in code)
   - ✅ Enable rate limiting
   - ✅ Monitor OAuth usage
   - ✅ Set up alerts for suspicious activity

---

## 📊 Verification Checklist

Before testing, verify:

- [ ] **Google Cloud Console**:

  - [ ] Project created
  - [ ] Google+ API enabled
  - [ ] OAuth consent screen configured
  - [ ] Scopes added: email + profile
  - [ ] Test users added
  - [ ] OAuth client created (Web application)
  - [ ] Redirect URI added: `http://localhost:4000/api/auth/google/callback`

- [ ] **Backend .env**:

  - [ ] GOOGLE_CLIENT_ID updated (not placeholder)
  - [ ] GOOGLE_CLIENT_SECRET updated (not placeholder)
  - [ ] GOOGLE_CALLBACK_URL correct
  - [ ] FRONTEND_AUTH_CALLBACK correct
  - [ ] No syntax errors in .env file

- [ ] **Backend Server**:

  - [ ] Server restarted after .env update
  - [ ] No errors in startup logs
  - [ ] Endpoint accessible: `http://localhost:4000/api/auth/google`

- [ ] **Database**:
  - [ ] Migration applied (oauth_state table exists)
  - [ ] Pengguna table has OAuth fields (google_id, provider, etc.)
  - [ ] Database connection working

---

## 🎯 Quick Test Commands

```bash
# 1. Check if OAuth endpoint exists
curl -I http://localhost:4000/api/auth/google
# Expected: 302 Found (redirect)

# 2. Check backend config loaded
# Add temporary log in backend code:
console.log('Google Client ID:', process.env.GOOGLE_CLIENT_ID?.substring(0, 20) + '...');
# Expected: "Google Client ID: 1234567890-abcdefgh..."

# 3. Check database has OAuth fields
# Run in PostgreSQL:
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'pengguna'
AND column_name LIKE '%google%';
# Expected: google_id column exists

# 4. Test OAuth flow (open in browser)
# Navigate to: http://localhost:4000/api/auth/google
# Expected: Redirect to Google login page
```

---

## 📚 Additional Resources

**Official Docs**:

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)
- [OAuth 2.0 Scopes](https://developers.google.com/identity/protocols/oauth2/scopes)

**Backend Implementation**:

- Analysis: `docs/OAUTH-GOOGLE-IMPLEMENTATION-ANALYSIS.md`
- Summary: `docs/OAUTH-GOOGLE-IMPLEMENTATION-SUMMARY.md`
- Code: `backend/src/modules/auth/strategies/google.strategy.ts`

**Support**:

- Google OAuth support: https://support.google.com/cloud/
- Publishify docs: (check README)

---

## 🔒 Security Best Practices

1. **Never commit secrets**:

   ```bash
   # Add to .gitignore
   .env
   .env.local
   .env.production
   ```

2. **Rotate credentials** regularly (every 90 days):

   - Generate new Client Secret
   - Update .env
   - Restart servers

3. **Monitor OAuth usage**:

   - Check Google Cloud Console → APIs & Services → Dashboard
   - Set up quota alerts
   - Monitor for unusual patterns

4. **Use environment-specific credentials**:

   - Development: Separate client ID/secret
   - Staging: Separate client ID/secret
   - Production: Separate client ID/secret

5. **Limit scopes** to minimum required:
   - ✅ Use: `email` + `profile` only
   - ❌ Don't request: Drive, Calendar, etc. (unless needed)

---

## ✅ Setup Complete!

Jika semua steps sudah diikuti, OAuth Google seharusnya sudah berfungsi! 🎉

**Next steps**:

1. Test OAuth flow manually (Step 9)
2. Implement frontend OAuth button
3. Create callback handler page
4. Add link/unlink functionality

**Need help?** Check troubleshooting section atau review backend logs.

---

**Last Updated**: 2025-01-11  
**Version**: 1.0.0  
**Author**: Publishify Team
