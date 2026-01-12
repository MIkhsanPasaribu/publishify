# Deploy Fix Upload Naskah ke VM

## Langkah Deploy Manual

Karena SSH dengan password tidak berhasil, lakukan deploy manual dengan langkah berikut:

### 1. Login ke VM via Terminal/PuTTY
```bash
ssh root@103.127.134.84
# Masukkan password saat diminta
```

### 2. Jalankan Deploy Script

Copy script berikut dan paste di terminal VM:

```bash
cd /root/publishify

# Set git remote to fork
git remote set-url origin https://github.com/daffarobbani18/publishify.git || git remote add origin https://github.com/daffarobbani18/publishify.git

# Pull from fork
git fetch origin
git checkout feature/deployment-scripts
git pull origin feature/deployment-scripts

# Backend rebuild
cd /root/publishify/backend
bun install
bun run build

# Frontend rebuild
cd /root/publishify/frontend
bun install
bun run build

# Restart services
pm2 restart publishify-backend
pm2 restart publishify-frontend

# Check status
pm2 status
pm2 logs --lines 50
```

### 3. Verifikasi

Setelah restart, test upload naskah:
- URL: https://publishify.me/penulis/ajukan-draf
- Upload file .docx atau .doc
- Pastikan tidak ada error "URL file tidak valid"

### 4. Monitor Logs

Jika masih ada error, cek logs:
```bash
# Backend logs
pm2 logs publishify-backend --lines 100

# Frontend logs
pm2 logs publishify-frontend --lines 100
```

## Perubahan yang Di-deploy

### Backend Files:
1. `backend/src/modules/naskah/dto/buat-naskah.dto.ts`
   - Ubah validasi `urlFile` dan `urlSampul` dari strict `.url()` ke `.refine()`
   - Sekarang menerima: path relatif (`/uploads/...`) atau URL lengkap

2. `backend/src/modules/naskah/dto/perbarui-naskah.dto.ts`
   - Same fix untuk update naskah

### Frontend Files:
1. `frontend/app/(penulis)/penulis/ajukan-draf/page.tsx`
   - Hapus double concatenation URL dengan `backendUrl`
   - Langsung gunakan path dari upload API response

## Testing Checklist

- [ ] Upload naskah .docx (file < 10MB)
- [ ] Upload naskah .doc (file < 10MB)
- [ ] Upload dengan cover image
- [ ] Upload tanpa cover
- [ ] Check error di console browser (F12)
- [ ] Check error di backend logs

## Rollback (jika diperlukan)

Jika ada masalah:
```bash
cd /root/publishify
git checkout main
git pull origin main

# Rebuild & restart
cd backend && bun run build && cd ../frontend && bun run build
pm2 restart all
```

**Note:** Origin sekarang mengarah ke fork: `https://github.com/daffarobbani18/publishify.git`

## Git Commit Info

```
commit ec744f3
Author: Your Name
Date: Jan 10, 2026

fix: perbaiki error 'URL file tidak valid' saat upload naskah

- Backend: Ubah validasi urlFile & urlSampul dari strict .url() 
  ke .refine() yang menerima path relatif atau URL lengkap
- Frontend: Hapus double concatenation URL dengan backendUrl
- Fixes upload naskah gagal dengan error 400 Bad Request
```
