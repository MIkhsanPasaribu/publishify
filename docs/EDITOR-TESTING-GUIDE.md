# 🧪 Testing Guide - Fitur Review Editor

## 📋 Pre-requisites

### Backend Requirements
1. ✅ Backend running di `http://localhost:4000`
2. ✅ Database PostgreSQL running dengan schema lengkap
3. ✅ Akun editor sudah dibuat: `editor@publishify.com`
4. ✅ Ada minimal 1 naskah dengan status `diajukan`
5. ✅ Ada minimal 1 review yang ditugaskan ke editor

### Frontend Requirements
1. ✅ Frontend running di `http://localhost:3000`
2. ✅ File `.env` sudah benar: `NEXT_PUBLIC_API_URL=http://localhost:4000/api`
3. ✅ File `client.ts` sudah ada (axios instance)
4. ✅ File `review.ts` sudah ada (API methods)

---

## 🚀 Test Scenario 1: Login & Redirect Editor

### Steps:
1. Buka browser: `http://localhost:3000/login`
2. Login dengan:
   - Email: `editor@publishify.com`
   - Password: (sesuai database)
3. Klik "Login"

### Expected Results:
- ✅ Toast success: "Login berhasil"
- ✅ Console log: `Login response: { pengguna: {...}, peran: ["editor"] }`
- ✅ Console log: `Redirecting editor to /dashboard/editor`
- ✅ Loading screen muncul: "Mengarahkan ke Dashboard Editor..."
- ✅ Redirect ke `/dashboard/editor`
- ✅ Dashboard Editor muncul dengan 4 kartu statistik

### Network Tab (Check):
```
✅ POST http://localhost:4000/api/auth/login
   Status: 200 OK
   Response: { sukses: true, data: { accessToken, refreshToken, pengguna } }
   
✅ GET http://localhost:4000/api/review/statistik
   Status: 200 OK
   Response: { sukses: true, data: { totalReview, dalamProses, selesai, ditugaskan } }
   
✅ GET http://localhost:4000/api/review/editor/saya?limit=5
   Status: 200 OK
   Response: { sukses: true, data: Array<Review> }
```

---

## 🔍 Test Scenario 2: Lihat Daftar Review

### Steps:
1. Dari Dashboard Editor, klik "Lihat Semua Review"
2. Atau navigate ke: `http://localhost:3000/dashboard/editor/review`

### Expected Results:
- ✅ Halaman "Daftar Review" muncul
- ✅ Tab filter ada: Semua, Baru (Ditugaskan), Proses, Selesai
- ✅ Kartu review ditampilkan dengan info:
  - Judul naskah
  - Nama penulis
  - Kategori badge
  - Status badge (biru/amber/hijau)
  - Timeline (ditugaskan, dimulai, selesai)
  - Jumlah feedback
  - Button "Mulai Review" atau "Lihat Detail"

### Test Filter:
1. Klik tab "Baru" → Tampil review status `ditugaskan`
2. Klik tab "Proses" → Tampil review status `dalam_proses`
3. Klik tab "Selesai" → Tampil review status `selesai`
4. Klik tab "Semua" → Tampil semua review

### Network Tab (Check):
```
✅ GET http://localhost:4000/api/review/editor/saya
   Status: 200 OK
   Response: { sukses: true, data: Array<Review> }

✅ GET http://localhost:4000/api/review/editor/saya?status=ditugaskan
   Status: 200 OK
   
✅ GET http://localhost:4000/api/review/editor/saya?status=dalam_proses
   Status: 200 OK
```

---

## 📝 Test Scenario 3: Detail Review & Lihat Naskah

### Steps:
1. Dari daftar review, klik salah satu kartu review
2. Halaman detail review terbuka

### Expected Results:

#### Left Column (Detail Naskah):
- ✅ Cover naskah ditampilkan (jika ada urlSampul)
- ✅ Judul naskah (font besar, bold)
- ✅ Subjudul (jika ada)
- ✅ Nama penulis lengkap
- ✅ Badge kategori (rounded)
- ✅ Badge genre (rounded)
- ✅ Jumlah halaman (misal: "250 halaman")
- ✅ Jumlah kata (misal: "75,000 kata")
- ✅ Sinopsis lengkap
- ✅ Button "Buka File Naskah" (primary button)
- ✅ Section "Feedback yang Diberikan" (list)
- ✅ Button "Tambah Feedback" (ungu)

#### Right Sidebar:
- ✅ Timeline progress vertical:
  - Ditugaskan (tanggal)
  - Dimulai (tanggal/pending)
  - Selesai (tanggal/pending)
- ✅ Catatan Umum (jika status selesai)
- ✅ Button "Submit Review & Keputusan" (gradient, jika belum selesai)
- ✅ Status completion indicator

### Test Download Naskah:
1. Klik button "Buka File Naskah"
2. File PDF terbuka di tab baru atau download

### Network Tab (Check):
```
✅ GET http://localhost:4000/api/review/[id]
   Status: 200 OK
   Response: {
     sukses: true,
     data: {
       id, idNaskah, idEditor, status, rekomendasi,
       naskah: { judul, sinopsis, urlFile, urlSampul, ... },
       feedback: Array<FeedbackReview>,
       ...
     }
   }
```

---

## ⭐ Test Scenario 4: Tambah Feedback

### Steps:
1. Dari halaman detail review, klik "Tambah Feedback"
2. Modal "Tambah Feedback" muncul

### Modal Content Check:
- ✅ Input: Aspek yang Direview (placeholder: "Contoh: Alur Cerita...")
- ✅ Star rating: 5 bintang interaktif (default 3)
- ✅ Textarea: Komentar Detail (6 rows)
- ✅ Button: "Batal" (outline)
- ✅ Button: "Tambah Feedback" (purple solid)

### Test Add Feedback (Valid):
1. Isi aspek: "Alur Cerita"
2. Pilih skor: 4 bintang (klik bintang ke-4)
3. Isi komentar: "Alur cerita menarik dengan plot twist yang baik. Namun di bagian tengah terasa agak lambat."
4. Klik "Tambah Feedback"

### Expected Results:
- ✅ Toast success: "Feedback berhasil ditambahkan"
- ✅ Modal tertutup
- ✅ Feedback muncul di list bawah info naskah
- ✅ Feedback menampilkan:
  - Aspek: "Alur Cerita"
  - 4 bintang kuning filled
  - Komentar lengkap

### Test Add Multiple Feedback:
Ulangi untuk aspek lain:
- "Karakter" (skor 5) - "Karakter utama sangat berkembang..."
- "Gaya Bahasa" (skor 3) - "Bahasa cukup baik, namun ada beberapa typo..."
- "Tata Bahasa" (skor 4) - "Grammar overall bagus..."

### Test Validation:
1. Klik "Tambah Feedback" lagi
2. Submit tanpa isi aspek → ❌ Toast error: "Aspek dan komentar harus diisi"
3. Isi aspek saja, submit → ❌ Toast error: "Aspek dan komentar harus diisi"
4. Isi keduanya → ✅ Success

### Network Tab (Check):
```
✅ POST http://localhost:4000/api/review/[id]/feedback
   Status: 201 Created
   Body: {
     aspek: "Alur Cerita",
     komentar: "Alur cerita menarik...",
     skor: 4
   }
   Response: {
     sukses: true,
     pesan: "Feedback berhasil ditambahkan",
     data: { id, idReview, aspek, komentar, skor, dibuatPada }
   }

✅ GET http://localhost:4000/api/review/[id]  (refresh data)
   Status: 200 OK
```

---

## ✅ Test Scenario 5: Submit Review & Keputusan

### Pre-condition:
- ✅ Minimal 1 feedback sudah ditambahkan

### Steps:
1. Dari halaman detail review, klik "Submit Review & Keputusan"
2. Modal "Submit Review & Keputusan" muncul

### Modal Content Check:
- ✅ Warning box (amber): "Setelah submit, keputusan tidak dapat diubah..."
- ✅ 3 kartu rekomendasi:
  - **Setujui** (✅ hijau): "Terbitkan naskah"
  - **Revisi** (📝 kuning): "Perlu perbaikan" (default selected)
  - **Tolak** (❌ merah): "Tidak layak terbit"
- ✅ Textarea: Catatan Umum (required)
- ✅ Info: "Total feedback: X • Pastikan semua aspek..."
- ✅ Button: "Batal" (outline)
- ✅ Button: "Submit Review" (gradient purple-blue)

### Test Submit - Scenario A: SETUJUI
1. Klik kartu "Setujui" → Border hijau, background hijau muda
2. Isi catatan umum:
   ```
   Naskah ini sangat layak untuk diterbitkan. 
   Alur cerita menarik, karakter berkembang dengan baik, 
   dan gaya bahasa sudah sesuai target pembaca.
   Hanya ada beberapa typo minor yang perlu diperbaiki 
   sebelum cetak final.
   ```
3. Klik "Submit Review"

### Expected Results (Setujui):
- ✅ Toast success: "Review berhasil disubmit dengan rekomendasi: setujui"
- ✅ Modal tertutup
- ✅ Redirect ke `/dashboard/editor/review`
- ✅ Review tersebut status = "selesai", badge hijau
- ✅ Badge rekomendasi "Setujui" (emerald)

### Test Submit - Scenario B: REVISI
1. Klik kartu "Revisi" → Border amber, background amber muda
2. Isi catatan umum:
   ```
   Naskah memiliki potensi bagus namun perlu perbaikan 
   di beberapa aspek:
   1. Pacing di tengah cerita terlalu lambat
   2. Beberapa dialog terasa tidak natural
   3. Ada inkonsistensi pada setting waktu
   
   Silakan revisi dan submit ulang untuk review lebih lanjut.
   ```
3. Klik "Submit Review"

### Expected Results (Revisi):
- ✅ Toast success: "Review berhasil disubmit dengan rekomendasi: revisi"
- ✅ Redirect
- ✅ Review status = "selesai", badge hijau
- ✅ Badge rekomendasi "Revisi" (amber)
- ✅ Naskah status di database berubah ke `perlu_revisi`

### Test Submit - Scenario C: TOLAK
1. Klik kartu "Tolak" → Border merah, background merah muda
2. Isi catatan umum:
   ```
   Mohon maaf, naskah ini tidak dapat diterima untuk penerbitan 
   karena beberapa alasan:
   1. Alur cerita tidak koheren dan sulit diikuti
   2. Karakter tidak berkembang dengan baik
   3. Banyak kesalahan grammar yang fundamental
   4. Tema tidak sesuai dengan visi penerbit
   
   Kami menyarankan untuk belajar lebih lanjut tentang teknik 
   penulisan sebelum mengajukan naskah lagi.
   ```
3. Klik "Submit Review"

### Expected Results (Tolak):
- ✅ Toast success: "Review berhasil disubmit dengan rekomendasi: tolak"
- ✅ Redirect
- ✅ Review status = "selesai"
- ✅ Badge rekomendasi "Tolak" (rose)
- ✅ Naskah status di database berubah ke `ditolak`

### Test Validation:
1. Klik "Submit Review & Keputusan"
2. Submit tanpa isi catatan umum → ❌ Toast error: "Catatan umum harus diisi"
3. Isi catatan, klik submit → ✅ Success

### Test Without Feedback:
1. Hapus semua feedback (atau buat review baru tanpa feedback)
2. Klik "Submit Review & Keputusan"
3. Isi catatan, submit → ❌ Toast error: "Minimal harus ada 1 feedback sebelum submit review"

### Network Tab (Check):
```
✅ PUT http://localhost:4000/api/review/[id]/submit
   Status: 200 OK
   Body: {
     rekomendasi: "setujui" | "revisi" | "tolak",
     catatanUmum: "..."
   }
   Response: {
     sukses: true,
     pesan: "Review berhasil disubmit",
     data: {
       id, status: "selesai", rekomendasi, catatanUmum, selesaiPada
     }
   }
```

---

## 🔄 Test Scenario 6: After Submit - View Completed Review

### Steps:
1. Setelah submit, cek daftar review
2. Klik review yang sudah selesai

### Expected Results:
- ✅ Status badge: "Selesai" (hijau)
- ✅ Rekomendasi badge muncul (Setujui/Revisi/Tolak)
- ✅ Timeline selesai terisi tanggal
- ✅ Catatan umum ditampilkan di sidebar
- ✅ All feedback tetap tampil
- ✅ Button "Tambah Feedback" DISABLED atau HIDDEN
- ✅ Button "Submit Review & Keputusan" HIDDEN
- ✅ Message: "Review Selesai - Keputusan telah diberikan"

---

## 🧩 Integration Test: Complete Flow

### Full Editor Journey (20 menit):

1. **Login** (1 min)
   - Login sebagai editor
   - Verify redirect ke dashboard

2. **View Statistics** (1 min)
   - Check statistik cards
   - Check review terbaru

3. **Browse Reviews** (2 min)
   - Filter by status
   - View different review cards

4. **Read Manuscript** (5 min)
   - Open detail review
   - Read naskah info
   - Download PDF naskah
   - Read manuscript content

5. **Add Multiple Feedbacks** (5 min)
   - Add feedback: Alur Cerita (skor 4)
   - Add feedback: Karakter (skor 5)
   - Add feedback: Gaya Bahasa (skor 3)
   - Add feedback: Tata Bahasa (skor 4)
   - Add feedback: Setting (skor 4)

6. **Make Decision** (3 min)
   - Open submit modal
   - Choose rekomendasi (Setujui/Revisi/Tolak)
   - Write comprehensive catatan umum
   - Submit review

7. **Verify** (3 min)
   - Check review status changed to "selesai"
   - Check rekomendasi badge
   - Open completed review detail
   - Verify catatan umum displayed
   - Verify cannot add more feedback

---

## 🐛 Common Issues & Solutions

### Issue 1: 404 pada /api/auth/login
**Symptom:** Error "Cannot POST /auth/login"  
**Check:** 
```bash
# 1. Cek .env
cat frontend/.env | grep NEXT_PUBLIC_API_URL
# Should be: http://localhost:4000/api (with /api)

# 2. Restart frontend
cd frontend && npm run dev
```

### Issue 2: Statistik kosong
**Symptom:** Kartu statistik menampilkan 0 semua  
**Check:**
```bash
# 1. Cek backend logs
cd backend && bun run start:dev

# 2. Cek database - pastikan ada review
psql -d publishify -c "SELECT COUNT(*) FROM review_naskah WHERE id_editor = 'xxx';"

# 3. Cek response di Network tab
# GET /api/review/statistik should return numbers
```

### Issue 3: Review list kosong
**Symptom:** "Belum ada review"  
**Check:**
```bash
# 1. Pastikan ada review yang ditugaskan ke editor
psql -d publishify -c "SELECT * FROM review_naskah WHERE id_editor = '[editor-id]';"

# 2. Cek API response
# GET /api/review/editor/saya should return array with items

# 3. Create test data jika perlu
npm run seed:editor-reviews
```

### Issue 4: Feedback tidak muncul
**Symptom:** Feedback di-submit tapi tidak muncul  
**Check:**
```bash
# 1. Cek Network tab - pastikan POST sukses (201)
# 2. Cek apakah GET /review/[id] dipanggil setelah POST
# 3. Cek response body - pastikan feedback ada di array
# 4. Check console logs untuk error
```

### Issue 5: Submit button disabled
**Symptom:** Button "Submit Review & Keputusan" tidak bisa diklik  
**Check:**
```typescript
// 1. Pastikan status !== "selesai"
console.log("Review status:", review.status);

// 2. Pastikan ada feedback
console.log("Feedback count:", review.feedback?.length);

// 3. Check button disabled attribute
// Should be: disabled={review.status === "selesai"}
```

---

## ✅ Test Completion Checklist

### Functional Tests
- [ ] Login sebagai editor berhasil
- [ ] Redirect ke /dashboard/editor bekerja
- [ ] Statistik ditampilkan dengan benar
- [ ] Daftar review muncul
- [ ] Filter status bekerja (Semua, Ditugaskan, Proses, Selesai)
- [ ] Detail review ditampilkan lengkap
- [ ] Download PDF naskah berhasil
- [ ] Tambah feedback berhasil (multiple)
- [ ] Star rating interaktif
- [ ] Submit review dengan rekomendasi SETUJUI berhasil
- [ ] Submit review dengan rekomendasi REVISI berhasil
- [ ] Submit review dengan rekomendasi TOLAK berhasil
- [ ] Catatan umum ditampilkan setelah selesai
- [ ] Cannot add feedback setelah selesai
- [ ] Cannot submit review twice

### Validation Tests
- [ ] Error jika aspek kosong
- [ ] Error jika komentar kosong
- [ ] Error jika catatan umum kosong
- [ ] Error jika submit tanpa feedback
- [ ] Max length validation (jika ada)

### UI/UX Tests
- [ ] Loading states tampil
- [ ] Empty states tampil (jika tidak ada data)
- [ ] Toast notifications muncul
- [ ] Modal animations smooth
- [ ] Hover effects bekerja
- [ ] Button states (hover, active, disabled)
- [ ] Responsive layout (mobile, tablet, desktop)
- [ ] Color consistency (status badges, rekomendasi)

### Integration Tests
- [ ] API calls dengan Bearer token
- [ ] Auto-refresh data setelah POST/PUT
- [ ] Navigation flow logis
- [ ] Redirect after submit
- [ ] State persistence (tidak hilang saat refresh)

### Security Tests
- [ ] Cannot access editor pages sebagai penulis
- [ ] Cannot edit review orang lain
- [ ] Token expired → redirect login
- [ ] XSS protection (input sanitization)

---

## 📊 Test Report Template

```markdown
## Test Report - Editor Review System
**Date:** November 12, 2025
**Tester:** [Your Name]
**Environment:** Development
**Backend:** http://localhost:4000
**Frontend:** http://localhost:3000

### Test Results Summary
- Total Tests: 45
- Passed: 42 ✅
- Failed: 3 ❌
- Skipped: 0

### Failed Tests
1. **Submit without feedback** - ❌ Error message tidak muncul
   - Expected: Toast error "Minimal 1 feedback"
   - Actual: Submit berhasil tanpa validasi
   - Fix: Add validation check before submit API call

2. **Download PDF naskah** - ❌ 404 Not Found
   - Expected: PDF terbuka di tab baru
   - Actual: Error 404
   - Fix: Check urlFile path in database, verify storage setup

3. **Mobile responsive** - ❌ Layout broken pada 375px
   - Expected: Stack layout pada mobile
   - Actual: Horizontal overflow
   - Fix: Add responsive breakpoints in Tailwind classes

### Performance
- Page load: ~800ms ✅
- API response time: ~150ms ✅
- Modal open animation: Smooth ✅

### Browser Compatibility
- Chrome 120: ✅ All tests passed
- Firefox 121: ✅ All tests passed
- Safari 17: ⚠️ Minor CSS differences
- Edge 120: ✅ All tests passed

### Recommendations
1. Add loading skeleton for better UX
2. Implement pagination for large review lists
3. Add keyboard shortcuts (ESC to close modal)
4. Export review report as PDF
```

---

**Test Status:** 🟢 READY FOR QA  
**Last Updated:** November 12, 2025
