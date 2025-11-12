# 📝 Dokumentasi Fitur Review Editor - Publishify

## ✅ Fitur yang Sudah Diimplementasikan

### 1. Dashboard Editor (`/dashboard/editor`)
**File:** `frontend/app/(dashboard)/dashboard/editor/page.tsx`

**Fitur:**
- ✅ Tampil 4 kartu statistik gradient (Total Review, Dalam Proses, Selesai, Ditugaskan)
- ✅ Daftar 5 review terbaru
- ✅ 3 kartu aksi cepat (filter by status)
- ✅ Terintegrasi dengan backend: `GET /api/review/statistik` dan `GET /api/review/editor/saya`

**Backend API:**
```typescript
GET /api/review/statistik
// Response: { totalReview, dalamProses, selesai, ditugaskan }

GET /api/review/editor/saya?limit=5
// Response: Array<Review>
```

---

### 2. Daftar Review (`/dashboard/editor/review`)
**File:** `frontend/app/(dashboard)/dashboard/editor/review/page.tsx`

**Fitur:**
- ✅ Filter tab: Semua, Ditugaskan, Dalam Proses, Selesai
- ✅ Kartu review dengan info lengkap (judul, penulis, kategori, status, timeline)
- ✅ Badge status dan rekomendasi
- ✅ Jumlah feedback dan halaman
- ✅ Button "Mulai Review" atau "Lihat Detail"
- ✅ Terintegrasi dengan backend: `GET /api/review/editor/saya?status={filter}`

**Backend API:**
```typescript
GET /api/review/editor/saya?status=ditugaskan
GET /api/review/editor/saya?status=dalam_proses
GET /api/review/editor/saya?status=selesai
// Response: Array<Review>
```

---

### 3. Detail Review & Submit (`/dashboard/editor/review/[id]`)
**File:** `frontend/app/(dashboard)/dashboard/editor/review/[id]/page.tsx`

**Fitur Utama:**

#### A. Lihat Detail Naskah
- ✅ Cover naskah
- ✅ Judul & subjudul
- ✅ Penulis (nama depan & belakang)
- ✅ Kategori & genre badges
- ✅ Jumlah halaman & kata
- ✅ Sinopsis lengkap
- ✅ Link "Buka File Naskah" untuk download PDF
- ✅ Timeline review (ditugaskan → dimulai → selesai)

#### B. Daftar Feedback
- ✅ Tampil semua feedback yang sudah diberikan
- ✅ Setiap feedback menampilkan: Aspek, Komentar, Skor (bintang)
- ✅ Button "Tambah Feedback"

#### C. Modal Tambah Feedback
- ✅ Input: Aspek yang direview (text)
- ✅ Input: Skor 1-5 (star rating interactive)
- ✅ Input: Komentar detail (textarea)
- ✅ Validasi: Aspek & komentar wajib diisi
- ✅ Terintegrasi dengan backend: `POST /api/review/:id/feedback`

**Backend API:**
```typescript
POST /api/review/:id/feedback
Body: {
  aspek: string;
  komentar: string;
  skor: number; // 1-5
}
// Response: FeedbackReview
```

#### D. Modal Submit Review & Keputusan
- ✅ 3 pilihan rekomendasi dengan visual card:
  - **Setujui** (✅ Green) - Naskah layak terbit
  - **Revisi** (📝 Amber) - Perlu perbaikan
  - **Tolak** (❌ Red) - Tidak layak terbit
- ✅ Input: Catatan umum (textarea, wajib diisi)
- ✅ Validasi: Minimal 1 feedback sebelum submit
- ✅ Warning: Keputusan tidak dapat diubah setelah submit
- ✅ Terintegrasi dengan backend: `PUT /api/review/:id/submit`

**Backend API:**
```typescript
PUT /api/review/:id/submit
Body: {
  rekomendasi: "setujui" | "revisi" | "tolak";
  catatanUmum: string;
}
// Response: Review dengan status "selesai"
```

---

## 🔄 Flow Lengkap Editor Review Naskah

### 1. Login sebagai Editor
```
POST /api/auth/login
Body: { email: "editor@publishify.com", kataSandi: "password" }
Response: { accessToken, refreshToken, pengguna: { peran: ["editor"] } }
```

### 2. Redirect ke Dashboard Editor
```
GET /dashboard/editor
↓
Fetch: GET /api/review/statistik
Fetch: GET /api/review/editor/saya?limit=5
```

### 3. Lihat Semua Review
```
Klik: "Lihat Semua" atau tab filter
↓
GET /dashboard/editor/review?status=ditugaskan
↓
Fetch: GET /api/review/editor/saya?status=ditugaskan
```

### 4. Buka Detail Review
```
Klik: Kartu review
↓
GET /dashboard/editor/review/[id]
↓
Fetch: GET /api/review/[id]
```

### 5. Baca Naskah
```
Klik: "Buka File Naskah"
↓
Download: naskah.urlFile (PDF dari backend/storage)
```

### 6. Tambah Feedback (Multiple)
```
Klik: "Tambah Feedback"
↓
Modal: Input aspek, skor (1-5 bintang), komentar
↓
Submit: POST /api/review/[id]/feedback
Response: { sukses: true, data: FeedbackReview }
↓
Refresh review data
↓
Ulangi untuk aspek lain (Alur, Karakter, Bahasa, dll)
```

### 7. Submit Review & Keputusan
```
Klik: "Submit Review & Keputusan"
↓
Modal: Pilih rekomendasi (Setujui/Revisi/Tolak)
↓
Input: Catatan umum (kesimpulan)
↓
Validasi: Cek minimal 1 feedback
↓
Submit: PUT /api/review/[id]/submit
Body: { rekomendasi, catatanUmum }
↓
Response: { sukses: true, data: Review(status="selesai") }
↓
Toast: "Review berhasil disubmit"
↓
Redirect: /dashboard/editor/review
```

---

## 🎨 Design System

### Status Badge Colors
```typescript
ditugaskan   → Blue   (bg-blue-100 text-blue-800)
dalam_proses → Amber  (bg-amber-100 text-amber-800)
selesai      → Green  (bg-green-100 text-green-800)
dibatalkan   → Gray   (bg-gray-100 text-gray-800)
```

### Rekomendasi Badge Colors
```typescript
setujui → Emerald (bg-emerald-100 text-emerald-800)
revisi  → Amber   (bg-amber-100 text-amber-800)
tolak   → Rose    (bg-rose-100 text-rose-800)
```

### Interactive Elements
- **Star Rating**: 5 bintang interaktif (hover scale-110)
- **Modal Overlay**: bg-black/50 backdrop
- **Cards**: rounded-xl dengan hover:shadow-lg transition
- **Buttons**: 
  - Primary: bg-purple-600 hover:bg-purple-700
  - Success: bg-green-600 hover:bg-green-700
  - Danger: bg-red-600 hover:bg-red-700

---

## 🔒 Role-Based Access

### Sidebar Menu (Editor Only)
```typescript
// components/dashboard/sidebar.tsx
const hasRole = (role) => {
  return pengguna?.peran?.includes(role);
};

// Menu hanya muncul jika hasRole("editor") === true
- Dashboard Editor
- Daftar Review
```

### Protected Routes
```typescript
// Jika user bukan editor, redirect atau 403
useEffect(() => {
  if (!hasRole("editor")) {
    router.push("/dashboard");
  }
}, [pengguna]);
```

---

## 📊 Database Schema (Backend)

### Tabel: review_naskah
```sql
id                UUID PRIMARY KEY
id_naskah         UUID FOREIGN KEY → naskah(id)
id_editor         UUID FOREIGN KEY → pengguna(id)
status            ENUM('ditugaskan', 'dalam_proses', 'selesai', 'dibatalkan')
rekomendasi       ENUM('setujui', 'revisi', 'tolak')
catatan_umum      TEXT
ditugaskan_pada   TIMESTAMP
dimulai_pada      TIMESTAMP
selesai_pada      TIMESTAMP
```

### Tabel: feedback_review
```sql
id                UUID PRIMARY KEY
id_review         UUID FOREIGN KEY → review_naskah(id)
aspek             VARCHAR(255) -- "Alur Cerita", "Karakter", "Bahasa"
komentar          TEXT
skor              INTEGER (1-5)
dibuat_pada       TIMESTAMP
```

---

## 🧪 Testing Checklist

### Test Case 1: Dashboard Editor
- [ ] Login dengan editor@publishify.com
- [ ] Redirect otomatis ke /dashboard/editor
- [ ] Statistik muncul (Total, Proses, Selesai, Ditugaskan)
- [ ] Review terbaru ditampilkan (max 5)

### Test Case 2: Filter Review
- [ ] Klik tab "Ditugaskan" → Tampil review status ditugaskan
- [ ] Klik tab "Proses" → Tampil review dalam_proses
- [ ] Klik tab "Selesai" → Tampil review selesai
- [ ] Klik tab "Semua" → Tampil semua review

### Test Case 3: Detail & Feedback
- [ ] Klik kartu review → Navigasi ke detail
- [ ] Detail naskah lengkap muncul
- [ ] Klik "Buka File Naskah" → Download PDF
- [ ] Klik "Tambah Feedback" → Modal muncul
- [ ] Isi aspek, pilih bintang, isi komentar → Submit
- [ ] Feedback muncul di list
- [ ] Ulangi untuk aspek lain

### Test Case 4: Submit Review
- [ ] Klik "Submit Review & Keputusan" → Modal muncul
- [ ] Pilih rekomendasi: Setujui
- [ ] Isi catatan umum
- [ ] Submit → Toast success
- [ ] Redirect ke /dashboard/editor/review
- [ ] Review tersebut status = "selesai"

### Test Case 5: Validasi
- [ ] Submit feedback tanpa aspek → Error "Aspek harus diisi"
- [ ] Submit feedback tanpa komentar → Error "Komentar harus diisi"
- [ ] Submit review tanpa catatan → Error "Catatan umum harus diisi"
- [ ] Submit review tanpa feedback → Error "Minimal 1 feedback"

---

## 🚀 Backend Requirements

### Endpoints yang Harus Tersedia
```typescript
✅ GET  /api/review/editor/saya         // Daftar review editor
✅ GET  /api/review/statistik           // Statistik editor
✅ GET  /api/review/:id                 // Detail review
✅ POST /api/review/:id/feedback        // Tambah feedback
✅ PUT  /api/review/:id/submit          // Submit keputusan
✅ PUT  /api/review/:id/batal           // Batalkan review (opsional)
```

### Response Format (Standar)
```typescript
{
  sukses: true,
  pesan: string,
  data: T,
  metadata?: {
    total?: number,
    halaman?: number,
    limit?: number,
    totalHalaman?: number
  }
}
```

---

## 📝 Environment Variables

### Frontend (.env)
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Backend (.env)
```env
PORT=4000
DATABASE_URL=postgresql://...
JWT_SECRET=...
JWT_EXPIRES_IN=1h
REFRESH_SECRET=...
REFRESH_EXPIRES_IN=7d
```

---

## 🐛 Known Issues & Solutions

### Issue 1: "Cannot POST /auth/login"
**Cause:** Environment variable tanpa `/api` prefix  
**Solution:** Update `.env` → `NEXT_PUBLIC_API_URL=http://localhost:4000/api`

### Issue 2: "Rendered fewer hooks than expected"
**Cause:** Conditional return sebelum semua hooks dipanggil  
**Solution:** Pindahkan semua `useEffect` ke atas, conditional return di bawah

### Issue 3: "api.get is not a function"
**Cause:** File `client.ts` kosong atau corrupt  
**Solution:** Recreate `client.ts` dengan axios instance + interceptors

---

## 📚 File Structure

```
frontend/
├── app/(dashboard)/dashboard/
│   ├── editor/
│   │   ├── page.tsx                    # Dashboard Editor
│   │   └── review/
│   │       ├── page.tsx                # Daftar Review
│   │       └── [id]/
│   │           └── page.tsx            # Detail Review & Submit
│   └── page.tsx                        # Dashboard Penulis (redirect logic)
├── components/dashboard/
│   └── sidebar.tsx                     # Navigation (role-based menu)
├── lib/api/
│   ├── client.ts                       # Axios instance + interceptors
│   ├── review.ts                       # Review API client
│   ├── auth.ts                         # Auth API client
│   └── naskah.ts                       # Naskah API client
└── stores/
    └── use-auth-store.ts               # Zustand auth state
```

---

## ✨ Next Steps (Future Enhancements)

1. **Notification System**
   - Real-time notifikasi saat dapat review baru
   - WebSocket/Socket.io integration

2. **Review History**
   - Halaman riwayat review yang sudah selesai
   - Export PDF review report

3. **Analytics Dashboard**
   - Chart review performance (waktu rata-rata, approval rate)
   - Top reviewed authors

4. **Collaborative Review**
   - Multiple editors untuk 1 naskah
   - Discussion thread antar editors

5. **Automated Checks**
   - Grammar checker integration
   - Plagiarism detection
   - Reading level analysis

---

**Status:** ✅ READY FOR TESTING  
**Last Updated:** November 12, 2025  
**Author:** AI Assistant  
**Project:** Publishify - Platform Penerbitan Naskah
