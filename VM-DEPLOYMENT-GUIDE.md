# Panduan Deployment ke VM Production

## Informasi VM
- **Host:** 103.127.134.84
- **User:** root
- **Project Path:** /root/publishify
- **Git Repo:** https://github.com/daffarobbani18/publishify.git (fork)
- **Branch:** feature/deployment-scripts

---

## Langkah 1: Login ke VM

```bash
ssh root@103.127.134.84
# Masukkan password saat diminta
```

---

## Langkah 2: Setup Git Remote ke Fork

Pertama kali, ubah remote origin ke fork:

```bash
cd /root/publishify

# Cek remote saat ini
git remote -v

# Ubah origin ke fork
git remote set-url origin https://github.com/daffarobbani18/publishify.git

# Verify
git remote -v
# Output expected:
# origin  https://github.com/daffarobbani18/publishify.git (fetch)
# origin  https://github.com/daffarobbani18/publishify.git (push)
```

**Note:** Jika sudah pernah setup, skip langkah ini.

---

## Langkah 3: Deploy Latest Changes

### Cara 1: Manual Step-by-Step

```bash
cd /root/publishify

# Pull dari fork
git fetch origin
git checkout feature/deployment-scripts
git pull origin feature/deployment-scripts

# Build Backend
cd /root/publishify/backend
bun install
bun run build

# Build Frontend
cd /root/publishify/frontend
bun install
bun run build

# Restart Services
pm2 restart publishify-backend
pm2 restart publishify-frontend

# Check Status
pm2 status
pm2 logs --lines 20
```

### Cara 2: Gunakan Deploy Script

Upload file `deploy-fix-upload.sh` ke VM, lalu:

```bash
cd /root/publishify
bash deploy-fix-upload.sh
```

---

## Langkah 4: Verifikasi

1. **Cek Service Status:**
   ```bash
   pm2 status
   ```
   Pastikan status `online` untuk backend & frontend

2. **Cek Logs:**
   ```bash
   # Backend logs
   pm2 logs publishify-backend --lines 50
   
   # Frontend logs
   pm2 logs publishify-frontend --lines 50
   ```

3. **Test Website:**
   - Buka: https://publishify.me
   - Test upload naskah: https://publishify.me/penulis/ajukan-draf
   - Test login/register

---

## Troubleshooting

### Service Tidak Mau Start

```bash
# Cek error detail
pm2 logs publishify-backend --err
pm2 logs publishify-frontend --err

# Restart paksa
pm2 delete all
cd /root/publishify/backend && pm2 start ecosystem.config.js
cd /root/publishify/frontend && pm2 start ecosystem.config.js
```

### Build Error

```bash
# Clear cache
rm -rf node_modules .next dist
bun install
bun run build
```

### Git Pull Error

```bash
# Reset ke remote state
git fetch origin
git reset --hard origin/feature/deployment-scripts
```

---

## Rollback ke Versi Sebelumnya

Jika ada masalah serius:

```bash
cd /root/publishify

# Lihat commit terakhir yang stable
git log --oneline -10

# Rollback ke commit tertentu
git reset --hard <commit-hash>

# Rebuild
cd backend && bun run build
cd ../frontend && bun run build

# Restart
pm2 restart all
```

---

## Update Berkala

Untuk deploy update terbaru dari development:

1. **Di Local (Developer):**
   ```bash
   # Commit changes
   git add .
   git commit -m "feat: deskripsi perubahan"
   
   # Push ke fork
   git push origin feature/deployment-scripts
   ```

2. **Di VM:**
   ```bash
   cd /root/publishify
   git pull origin feature/deployment-scripts
   cd backend && bun run build
   cd ../frontend && bun run build
   pm2 restart all
   ```

---

## Monitoring

```bash
# Monitor realtime
pm2 monit

# Logs streaming
pm2 logs

# CPU & Memory usage
pm2 list
```

---

## Catatan Penting

- **Selalu backup** sebelum deploy major changes
- **Test di local** sebelum push ke production
- **Monitor logs** setelah deployment
- **Keep credentials secure** (jangan commit password/API keys)

---

**Last Updated:** 13 Januari 2026
