# Testing Checklist - Editor Self-Assign Review

## 📋 Pre-Testing Requirements

### Backend Requirements:
- ✅ Backend server running (`bun run start:dev`)
- ✅ Database connected (PostgreSQL/Supabase)
- ✅ Endpoint `/api/review/tugaskan` available
- ✅ JWT authentication working

### Frontend Requirements:
- ✅ Frontend server running (`bun run dev`)
- ✅ Login system working
- ✅ localStorage storing user data with `id` field

### Test Data Required:
- ✅ User dengan role `editor` (untuk login)
- ✅ Minimal 1 naskah dengan status `diajukan`
- ✅ User data tersimpan di localStorage dengan format:
  ```json
  {
    "id": "uuid-editor",
    "email": "editor@example.com",
    "role": "editor",
    ...
  }
  ```

---

## 🧪 Test Cases

### Test Case 1: Successful Self-Assign (Happy Path) ✅

**Preconditions:**
- Login sebagai Editor
- Ada naskah dengan status `diajukan`
- Belum ada review aktif untuk naskah tersebut

**Steps:**
1. Buka dashboard editor
2. Klik button "📥 Naskah Masuk" (hijau)
3. Verify: List page muncul dengan naskah status `diajukan`
4. Klik "Lihat Detail" pada salah satu naskah
5. Verify: Detail page muncul dengan info lengkap
6. Klik button "📥 Ambil Review Naskah Ini"
7. Verify: Button berubah jadi loading state ("Memproses...")
8. Wait for API response

**Expected Results:**
- ✅ Toast success: "Berhasil mengambil review naskah!"
- ✅ Auto redirect ke `/dashboard/editor/review/{reviewId}`
- ✅ Record baru di tabel `review_naskah`:
  ```sql
  SELECT * FROM review_naskah 
  WHERE id_naskah = 'uuid-naskah' 
  AND id_editor = 'uuid-editor';
  ```
- ✅ Status naskah berubah dari `diajukan` → `dalam_review`
- ✅ Review muncul di "Daftar Review" dengan status `ditugaskan`

---

### Test Case 2: Duplicate Review Prevention ⚠️

**Preconditions:**
- Naskah X sudah memiliki review aktif (status: `ditugaskan` atau `dalam_proses`)

**Steps:**
1. Login sebagai Editor A
2. Ambil review untuk naskah X (follow Test Case 1)
3. Verify: Review created successfully
4. Logout, login sebagai Editor B
5. Buka "Naskah Masuk"
6. Naskah X seharusnya **tidak muncul** (karena status sudah `dalam_review`)
7. Jika somehow bisa akses, coba klik "Ambil Review"

**Expected Results:**
- ✅ Naskah X **tidak muncul** di list (karena status bukan `diajukan`)
- ✅ Jika dipaksa call API: Error 409
- ✅ Toast error: "Naskah ini sudah memiliki review yang sedang berjalan"

---

### Test Case 3: Invalid Naskah Status ⚠️

**Preconditions:**
- Naskah Y dengan status bukan `diajukan` (misal: `draft`, `dalam_review`, `disetujui`)

**Steps:**
1. Manually akses detail page: `/dashboard/editor/naskah/{naskahId}`
2. Klik "Ambil Review"

**Expected Results:**
- ✅ Error 400
- ✅ Toast error: "Naskah tidak bisa direview saat ini"

**Note:** Seharusnya naskah ini tidak muncul di list karena ada filter `status=diajukan`

---

### Test Case 4: Authentication Issue 🔐

**Preconditions:**
- localStorage kosong atau tidak ada `userData`

**Steps:**
1. Clear localStorage: `localStorage.clear()`
2. Refresh page (tetap di dashboard editor - tidak logout)
3. Buka "Naskah Masuk" → Detail naskah
4. Klik "Ambil Review"

**Expected Results:**
- ✅ Toast error: "Sesi login tidak ditemukan. Silakan login kembali."
- ✅ Redirect ke `/login`

---

### Test Case 5: Invalid User Data Format ⚠️

**Preconditions:**
- localStorage `userData` ada tapi tidak punya field `id`

**Steps:**
1. Set invalid userData:
   ```javascript
   localStorage.setItem("userData", JSON.stringify({ email: "test@test.com" }));
   ```
2. Buka detail naskah
3. Klik "Ambil Review"

**Expected Results:**
- ✅ Toast error: "Data pengguna tidak valid. Silakan login kembali."
- ✅ Redirect ke `/login`

---

### Test Case 6: Editor Not Found (Backend Validation) ⚠️

**Preconditions:**
- User ID di localStorage tidak exist di database
- Atau user tidak punya role `editor`

**Steps:**
1. Set fake user ID:
   ```javascript
   localStorage.setItem("userData", JSON.stringify({ 
     id: "00000000-0000-0000-0000-000000000000" 
   }));
   ```
2. Klik "Ambil Review"

**Expected Results:**
- ✅ Error 404 atau 400
- ✅ Toast error: "Naskah atau data editor tidak ditemukan"

---

### Test Case 7: Naskah Not Found ⚠️

**Preconditions:**
- ID naskah tidak valid atau sudah dihapus

**Steps:**
1. Manually akses: `/dashboard/editor/naskah/fake-uuid-123`
2. Klik "Ambil Review"

**Expected Results:**
- ✅ Error 404
- ✅ Toast error: "Naskah atau data editor tidak ditemukan"

---

### Test Case 8: Network Error 🌐

**Preconditions:**
- Backend server down atau network error

**Steps:**
1. Stop backend server
2. Klik "Ambil Review"

**Expected Results:**
- ✅ Toast error: "Gagal mengambil review. Silakan coba lagi."
- ✅ Button kembali ke state normal (tidak loading forever)

---

### Test Case 9: Pagination & Search 🔍

**Preconditions:**
- Ada 15+ naskah dengan status `diajukan`

**Steps:**
1. Buka "Naskah Masuk"
2. Verify: Hanya 10 naskah per page
3. Klik pagination (page 2)
4. Verify: Naskah 11-15 muncul
5. Test search: Ketik judul naskah
6. Verify: Filter bekerja (client-side)

**Expected Results:**
- ✅ Pagination bekerja
- ✅ Search filter naskah by title/synopsis
- ✅ Clear search button berfungsi

---

### Test Case 10: Complete Workflow (End-to-End) 🎯

**Steps:**
1. **Penulis**: Login, buat naskah, ajukan (status → `diajukan`)
2. **Editor**: Login, buka "Naskah Masuk"
3. **Editor**: Lihat detail naskah, download file
4. **Editor**: Klik "Ambil Review"
5. **Verify**: Redirect ke detail review page
6. **Editor**: Tambah feedback
7. **Editor**: Submit review dengan rekomendasi
8. **Verify**: Status review → `selesai`
9. **Verify**: Status naskah updated (misal: `disetujui` atau `perlu_revisi`)

**Expected Results:**
- ✅ Full workflow completed
- ✅ Data konsisten di database
- ✅ Notifikasi diterima penulis (jika ada sistem notifikasi)

---

## 🔍 Database Verification Queries

### Check Review Created:
```sql
SELECT 
  rn.id,
  rn.id_naskah,
  rn.id_editor,
  rn.status,
  rn.ditugaskan_pada,
  n.judul,
  n.status as status_naskah,
  p.email as email_editor
FROM review_naskah rn
JOIN naskah n ON rn.id_naskah = n.id
JOIN pengguna p ON rn.id_editor = p.id
WHERE rn.id_editor = 'uuid-editor'
ORDER BY rn.ditugaskan_pada DESC;
```

### Check Naskah Status Updated:
```sql
SELECT id, judul, status, diperbarui_pada
FROM naskah
WHERE id = 'uuid-naskah';
```

### Check No Duplicate Reviews:
```sql
SELECT COUNT(*) as total_review_aktif
FROM review_naskah
WHERE id_naskah = 'uuid-naskah'
AND status IN ('ditugaskan', 'dalam_proses');
-- Should return 0 or 1 max
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "Sesi login tidak ditemukan"
**Cause:** localStorage tidak ada `userData`
**Solution:** 
- Check login flow saves user data
- Format: `{ id, email, role, ... }`

### Issue 2: Button loading forever
**Cause:** API request tidak resolve (network error)
**Solution:**
- Check `finally` block executes
- Add timeout to axios request

### Issue 3: Naskah tidak muncul di list
**Cause:** Status naskah bukan `diajukan`
**Solution:**
- Check database: `SELECT id, judul, status FROM naskah`
- Update status: `UPDATE naskah SET status = 'diajukan' WHERE id = '...'`

### Issue 4: Error 400 "Naskah hanya bisa direview jika statusnya diajukan"
**Cause:** Naskah status != `diajukan`
**Solution:**
- Verify list page filter: `?status=diajukan`
- Check naskah tidak di-cache dengan status lama

### Issue 5: Error 409 "Sudah ada review aktif"
**Cause:** Naskah sudah punya review dengan status `ditugaskan` atau `dalam_proses`
**Solution:**
- Check database untuk review aktif
- Complete atau batalkan review existing dulu

---

## ✅ Success Criteria

All tests passed if:
- ✅ Editor bisa browse naskah dengan status `diajukan`
- ✅ Editor bisa ambil review (self-assign) tanpa error
- ✅ Record created di `review_naskah` dengan benar
- ✅ Status naskah updated ke `dalam_review`
- ✅ Tidak ada duplicate review untuk naskah yang sama
- ✅ Error handling bekerja untuk semua edge cases
- ✅ Toast notifications muncul dengan pesan yang jelas
- ✅ Redirect ke detail review page setelah sukses
- ✅ UI responsive dan user-friendly

---

## 📊 Test Execution Log Template

```
Date: ___________
Tester: ___________
Environment: Dev / Staging / Production

| Test Case | Status | Notes | Bug ID |
|-----------|--------|-------|--------|
| TC1: Happy Path | ⬜ Pass / ❌ Fail | | |
| TC2: Duplicate Prevention | ⬜ Pass / ❌ Fail | | |
| TC3: Invalid Status | ⬜ Pass / ❌ Fail | | |
| TC4: Auth Issue | ⬜ Pass / ❌ Fail | | |
| TC5: Invalid User Data | ⬜ Pass / ❌ Fail | | |
| TC6: Editor Not Found | ⬜ Pass / ❌ Fail | | |
| TC7: Naskah Not Found | ⬜ Pass / ❌ Fail | | |
| TC8: Network Error | ⬜ Pass / ❌ Fail | | |
| TC9: Pagination/Search | ⬜ Pass / ❌ Fail | | |
| TC10: E2E Workflow | ⬜ Pass / ❌ Fail | | |

Overall Result: ⬜ Pass / ❌ Fail
```

---

## 🚀 Ready to Test!

**Recommended Testing Order:**
1. TC1 (Happy Path) - Most important
2. TC2 (Duplicate Prevention)
3. TC9 (Pagination & Search)
4. TC10 (E2E Workflow)
5. TC3-TC8 (Error cases)

**Tools Needed:**
- Browser DevTools (Network tab, Console)
- Database client (untuk verify data)
- Multiple browser sessions (untuk test duplicate)

Good luck testing! 🎯
