# 📋 Dokumentasi: Manajemen Status Review Editor

## 📌 Overview

Fitur manajemen status review memungkinkan editor untuk mengelola workflow review naskah dengan lengkap, mulai dari menerima tugas, memberikan feedback, menetapkan rekomendasi, hingga menyelesaikan review.

**File:** `frontend/app/(dashboard)/dashboard/editor/review/[id]/page.tsx`

---

## 🔄 Status Review Workflow

```
┌──────────────┐
│  ditugaskan  │ ← Status awal ketika admin menugaskan review
└──────┬───────┘
       │
       ├─────→ [Terima Tugas] ────────────┐
       │                                   ▼
       │                          ┌────────────────┐
       │                          │ dalam_proses   │
       │                          └────────┬───────┘
       │                                   │
       │                                   ├─→ [Tambah Feedback]
       │                                   │
       │                                   ├─→ [Tetapkan Rekomendasi]
       │                                   │    • setujui
       │                                   │    • revisi
       │                                   │    • tolak
       │                                   │
       │                                   ├─→ [Selesaikan Review]
       │                                   ▼
       │                          ┌────────────────┐
       │                          │    selesai     │
       │                          └────────────────┘
       │
       └─────→ [Tolak Tugas] ─────────────┐
                                          ▼
                                 ┌────────────────┐
                                 │  dibatalkan    │
                                 └────────────────┘
```

---

## 🎯 Fitur Utama

### 1. **Terima Tugas Review** (ditugaskan → dalam_proses)

**Kondisi:**
- Status review = `ditugaskan`
- Editor belum memulai review

**Aksi:**
```typescript
handleTerimaTugas() {
  reviewApi.perbaruiReview(idReview, {
    status: 'dalam_proses'
  })
}
```

**UI:**
- Button "Terima Tugas Review" (hijau dengan icon ✓)
- Modal konfirmasi sebelum menerima
- Auto-set timestamp `dimulaiPada`

**Response:**
- Status berubah ke `dalam_proses`
- Toast notification sukses
- UI di-refresh untuk menampilkan tombol feedback

---

### 2. **Tolak Tugas Review** (→ dibatalkan)

**Kondisi:**
- Status review = `ditugaskan` (sebelum diterima)
- Editor tidak bersedia mereview naskah

**Aksi:**
```typescript
handleTolakTugas(alasan: string) {
  reviewApi.batalkanReview(idReview, alasan)
}
```

**UI:**
- Button "Tolak Tugas" (merah outline dengan icon ✕)
- Modal dengan textarea untuk alasan penolakan
- Validasi: alasan wajib diisi

**Response:**
- Status berubah ke `dibatalkan`
- Redirect ke halaman daftar review
- Toast notification

---

### 3. **Tambah Feedback**

**Kondisi:**
- Status review = `ditugaskan` atau `dalam_proses`
- Editor sudah menerima tugas

**Aksi:**
```typescript
handleTambahFeedback({
  aspek: string,
  komentar: string,
  skor: number (1-5)
})
```

**UI:**
- Button "Tambah Feedback" (biru dengan icon +)
- Modal form dengan fields:
  - Aspek (text input)
  - Komentar (textarea)
  - Skor (star rating 1-5)
- Feedback list dengan card styling

**Response:**
- Feedback baru ditambahkan ke list
- Modal ditutup dan form di-reset
- UI di-refresh untuk menampilkan feedback baru

---

### 4. **Tetapkan Rekomendasi**

**Kondisi:**
- Status review = `dalam_proses`
- Belum ada rekomendasi (`rekomendasi === null`)
- Minimal sudah ada 1 feedback (opsional, bisa disesuaikan)

**Aksi:**
```typescript
handleSetRekomendasi({
  rekomendasi: 'setujui' | 'revisi' | 'tolak',
  catatanRekomendasi: string
})
```

**UI:**
- Button "Tetapkan Rekomendasi" (ungu/pink dengan icon ✓)
- Modal dengan:
  - 3 pilihan card interaktif:
    - ✅ **Setujui** - Naskah layak terbit
    - ✏️ **Revisi** - Perlu perbaikan
    - ❌ **Tolak** - Tidak layak terbit
  - Textarea untuk catatan rekomendasi (wajib)
- Badge rekomendasi di header setelah ditetapkan

**Response:**
- Rekomendasi tersimpan
- Badge rekomendasi muncul di header
- Button "Tetapkan Rekomendasi" hilang
- Button "Selesaikan Review" muncul

---

### 5. **Selesaikan Review** (dalam_proses → selesai)

**Kondisi:**
- Status review = `dalam_proses`
- Rekomendasi sudah ditetapkan
- Editor sudah selesai memberikan semua feedback

**Aksi:**
```typescript
handleSelesaikanReview({
  rekomendasi: Rekomendasi, // dari state review
  catatanUmum: string
})
```

**UI:**
- Button "Selesaikan Review" (hijau/teal dengan icon ✓)
- Modal konfirmasi dengan:
  - Info rekomendasi yang dipilih
  - Warning bahwa status tidak bisa diubah lagi
  - Textarea untuk catatan umum (opsional)

**Response:**
- Status berubah ke `selesai`
- Timestamp `selesaiPada` di-set
- Redirect ke halaman daftar review
- Toast notification sukses

---

## 🧩 Komponen UI

### Action Buttons Section

```tsx
<div className="bg-white rounded-xl border p-6 mb-6">
  <h3>Aksi Review</h3>
  <div className="flex flex-wrap gap-3">
    {/* Conditional buttons based on status */}
    {isDitugaskan && (
      <>
        <Button onClick={handleTerima}>Terima Tugas Review</Button>
        <Button onClick={handleTolak}>Tolak Tugas</Button>
      </>
    )}
    
    {canAddFeedback && (
      <Button onClick={handleFeedback}>Tambah Feedback</Button>
    )}
    
    {canSetRekomendasi && (
      <Button onClick={handleRekomendasi}>Tetapkan Rekomendasi</Button>
    )}
    
    {canSelesaikan && (
      <Button onClick={handleSelesaikan}>Selesaikan Review</Button>
    )}
  </div>
  
  {/* Workflow helper info */}
  <div className="mt-4 p-4 bg-blue-50">
    <p>Workflow: {workflowText}</p>
  </div>
</div>
```

### Status Badge

```tsx
const statusBadge = (status: string) => {
  const badges = {
    ditugaskan: { label: 'Ditugaskan', className: 'bg-blue-100 text-blue-800' },
    dalam_proses: { label: 'Dalam Proses', className: 'bg-amber-100 text-amber-800' },
    selesai: { label: 'Selesai', className: 'bg-green-100 text-green-800' },
    dibatalkan: { label: 'Dibatalkan', className: 'bg-gray-100 text-gray-800' }
  };
  return badges[status];
};
```

### Rekomendasi Badge

```tsx
const rekomendasiBadge = (rek?: Rekomendasi) => {
  if (!rek) return null;
  const badges = {
    setujui: { label: 'Disetujui', className: 'bg-green-100 text-green-800' },
    revisi: { label: 'Perlu Revisi', className: 'bg-amber-100 text-amber-800' },
    tolak: { label: 'Ditolak', className: 'bg-red-100 text-red-800' }
  };
  return <span className={badges[rek].className}>{badges[rek].label}</span>;
};
```

---

## 🔐 Validasi & Business Rules

### 1. Status Transitions

| Status Awal | Aksi | Status Akhir | Kondisi |
|-------------|------|--------------|---------|
| ditugaskan | Terima Tugas | dalam_proses | - |
| ditugaskan | Tolak Tugas | dibatalkan | Alasan harus diisi |
| dalam_proses | Selesaikan Review | selesai | Rekomendasi harus sudah ditetapkan |
| dalam_proses | Tolak Tugas | dibatalkan | Alasan harus diisi (jarang) |

### 2. Button Visibility Logic

```typescript
const isDitugaskan = review.status === 'ditugaskan';
const isDalamProses = review.status === 'dalam_proses';
const isSelesai = review.status === 'selesai';
const isDibatalkan = review.status === 'dibatalkan';

// Tombol yang ditampilkan
const canAddFeedback = isDitugaskan || isDalamProses;
const canSetRekomendasi = isDalamProses && !review.rekomendasi;
const canSelesaikan = isDalamProses && !!review.rekomendasi;
```

### 3. Form Validation

- **Terima Tugas**: Tidak ada validasi form, langsung update status
- **Tolak Tugas**: `alasanTolak.trim()` harus diisi (min 1 karakter)
- **Tambah Feedback**: `aspek.trim()` dan `komentar.trim()` wajib diisi
- **Set Rekomendasi**: `catatanRekomendasi.trim()` wajib diisi
- **Selesaikan Review**: `catatanUmum.trim()` wajib diisi

---

## 📊 State Management

### State Variables

```typescript
// Modal states
const [showTerimaModal, setShowTerimaModal] = useState(false);
const [showTolakModal, setShowTolakModal] = useState(false);
const [showRekomendasiModal, setShowRekomendasiModal] = useState(false);
const [showSelesaikanModal, setShowSelesaikanModal] = useState(false);
const [showFeedbackModal, setShowFeedbackModal] = useState(false);

// Form states
const [alasanTolak, setAlasanTolak] = useState('');
const [rekomendasi, setRekomendasi] = useState<Rekomendasi>('revisi');
const [catatanRekomendasi, setCatatanRekomendasi] = useState('');
const [catatanUmum, setCatatanUmum] = useState('');

// Feedback form
const [aspek, setAspek] = useState('');
const [komentar, setKomentar] = useState('');
const [skor, setSkor] = useState<number>(3);

// Loading states
const [loading, setLoading] = useState(true);
const [submitting, setSubmitting] = useState(false);

// Data
const [review, setReview] = useState<Review | null>(null);
```

---

## 🌐 API Calls

### 1. Perbarui Review (Update Status/Notes)

```typescript
PUT /api/review/:id

Body:
{
  status?: 'ditugaskan' | 'dalam_proses' | 'selesai' | 'dibatalkan',
  catatanUmum?: string,
  dimulaiPada?: string (ISO datetime)
}

Response:
{
  sukses: true,
  pesan: "Review berhasil diperbarui",
  data: Review
}
```

### 2. Batalkan Review

```typescript
PUT /api/review/:id/batal

Body:
{
  alasan: string
}

Response:
{
  sukses: true,
  pesan: "Review berhasil dibatalkan",
  data: Review
}
```

### 3. Submit Review (Selesaikan)

```typescript
PUT /api/review/:id/submit

Body:
{
  rekomendasi: 'setujui' | 'revisi' | 'tolak',
  catatanUmum: string
}

Response:
{
  sukses: true,
  pesan: "Review berhasil diselesaikan",
  data: Review
}
```

### 4. Tambah Feedback

```typescript
POST /api/review/:id/feedback

Body:
{
  aspek: string,
  komentar: string,
  skor: number (1-5)
}

Response:
{
  sukses: true,
  pesan: "Feedback berhasil ditambahkan",
  data: FeedbackReview
}
```

---

## 🎨 UX Flow

### Scenario 1: Editor Menerima dan Menyelesaikan Review

1. **Editor melihat daftar tugas** → Status badge "Ditugaskan"
2. **Klik detail review** → Melihat info naskah
3. **Klik "Terima Tugas Review"** → Modal konfirmasi muncul
4. **Konfirmasi terima** → Status berubah "Dalam Proses"
5. **Klik "Tambah Feedback"** → Modal form feedback
6. **Isi aspek, komentar, skor** → Submit feedback
7. **Ulangi tambah feedback** (sesuai kebutuhan)
8. **Klik "Tetapkan Rekomendasi"** → Modal pilih rekomendasi
9. **Pilih salah satu** (setujui/revisi/tolak) + isi catatan
10. **Konfirmasi** → Badge rekomendasi muncul
11. **Klik "Selesaikan Review"** → Modal konfirmasi final
12. **Isi catatan umum** → Submit
13. **Status "Selesai"** → Redirect ke daftar review

### Scenario 2: Editor Menolak Tugas

1. **Editor melihat tugas** → Status "Ditugaskan"
2. **Klik detail** → Lihat naskah
3. **Klik "Tolak Tugas"** → Modal alasan muncul
4. **Isi alasan penolakan** → Submit
5. **Status "Dibatalkan"** → Redirect ke daftar

---

## 🧪 Testing Checklist

### Manual Testing

- [ ] **Terima Tugas**
  - [ ] Button muncul saat status = ditugaskan
  - [ ] Modal konfirmasi tampil
  - [ ] Status berubah ke dalam_proses setelah konfirmasi
  - [ ] Button hilang setelah diterima
  - [ ] Toast sukses muncul

- [ ] **Tolak Tugas**
  - [ ] Button muncul saat status = ditugaskan
  - [ ] Modal alasan tampil
  - [ ] Validasi alasan wajib diisi
  - [ ] Status berubah ke dibatalkan
  - [ ] Redirect ke halaman daftar

- [ ] **Tambah Feedback**
  - [ ] Button muncul saat status = ditugaskan/dalam_proses
  - [ ] Modal form tampil
  - [ ] Validasi aspek dan komentar
  - [ ] Star rating berfungsi
  - [ ] Feedback baru muncul di list
  - [ ] Form di-reset setelah submit

- [ ] **Tetapkan Rekomendasi**
  - [ ] Button muncul hanya saat dalam_proses dan belum ada rekomendasi
  - [ ] 3 pilihan card interaktif
  - [ ] Validasi catatan wajib diisi
  - [ ] Badge rekomendasi muncul setelah ditetapkan
  - [ ] Button "Tetapkan Rekomendasi" hilang
  - [ ] Button "Selesaikan Review" muncul

- [ ] **Selesaikan Review**
  - [ ] Button hanya muncul jika rekomendasi sudah ada
  - [ ] Modal konfirmasi tampil
  - [ ] Info rekomendasi ditampilkan
  - [ ] Validasi catatan umum
  - [ ] Status berubah ke selesai
  - [ ] Redirect ke daftar

- [ ] **UI/UX**
  - [ ] Badge status dengan warna yang tepat
  - [ ] Badge rekomendasi dengan warna yang tepat
  - [ ] Timeline review update otomatis
  - [ ] Loading state saat API call
  - [ ] Disable button saat submitting
  - [ ] Responsive di mobile

### Integration Testing

```typescript
describe('Editor Review Status Management', () => {
  it('should accept review task', async () => {
    // Arrange: ditugaskan status
    // Act: click terima tugas
    // Assert: status = dalam_proses
  });

  it('should reject review task with reason', async () => {
    // Arrange: ditugaskan status
    // Act: click tolak + isi alasan
    // Assert: status = dibatalkan
  });

  it('should add feedback', async () => {
    // Arrange: dalam_proses status
    // Act: tambah feedback
    // Assert: feedback added to list
  });

  it('should set recommendation', async () => {
    // Arrange: dalam_proses, no rekomendasi
    // Act: set rekomendasi
    // Assert: rekomendasi saved, badge shown
  });

  it('should complete review only after recommendation', async () => {
    // Arrange: dalam_proses, rekomendasi set
    // Act: selesaikan review
    // Assert: status = selesai
  });

  it('should not allow complete without recommendation', async () => {
    // Arrange: dalam_proses, no rekomendasi
    // Act: try to complete
    // Assert: validation error
  });
});
```

---

## 🚀 Deployment Notes

### Environment Variables

Tidak ada environment variables khusus untuk fitur ini.

### Database Migration

Tidak perlu migration baru, menggunakan schema yang sudah ada:

```prisma
model ReviewNaskah {
  // ...existing fields
  status          StatusReview      @default(ditugaskan)
  rekomendasi     Rekomendasi?
  catatanUmum     String?
  ditugaskanPada  DateTime          @default(now())
  dimulaiPada     DateTime?
  selesaiPada     DateTime?
  // ...
}

enum StatusReview {
  ditugaskan
  dalam_proses
  selesai
  dibatalkan
}

enum Rekomendasi {
  setujui
  revisi
  tolak
}
```

### Backend Support

Semua endpoint sudah tersedia:
- ✅ `PUT /api/review/:id` - perbaruiReview
- ✅ `PUT /api/review/:id/batal` - batalkanReview
- ✅ `PUT /api/review/:id/submit` - submitReview
- ✅ `POST /api/review/:id/feedback` - tambahFeedback

---

## 📝 Future Improvements

1. **Auto-save Draft Feedback**
   - Save feedback ke localStorage sebelum submit
   - Restore jika browser closed

2. **Bulk Feedback**
   - Tambah multiple feedback sekaligus
   - Template feedback untuk aspek umum

3. **Notification System**
   - Real-time notification ke penulis saat status berubah
   - Email notification untuk milestone review

4. **Review Analytics**
   - Dashboard statistik review per editor
   - Average time to complete
   - Recommendation distribution

5. **Collaboration**
   - Multiple editors untuk satu naskah
   - Comment thread per feedback
   - Mention system

6. **Revision Tracking**
   - History perubahan rekomendasi
   - Audit log untuk semua status changes

---

## 🐛 Troubleshooting

### Issue: Button tidak muncul

**Penyebab:**
- Status review tidak sesuai kondisi
- Role user bukan 'editor'

**Solusi:**
- Check `review.status` di console
- Pastikan JWT token valid
- Cek role di `peran_pengguna` table

### Issue: API call gagal

**Penyebab:**
- Token expired
- Validasi backend gagal
- Network error

**Solusi:**
- Refresh token
- Cek format request body
- Lihat console untuk error detail

### Issue: Rekomendasi tidak tersimpan

**Penyebab:**
- Catatan rekomendasi kosong
- API endpoint salah

**Solusi:**
- Validasi form input
- Cek network tab untuk request/response
- Pastikan endpoint `/api/review/:id` menerima `catatanUmum`

---

## 📚 References

- [Backend Review Module Documentation](./backend-readme.md)
- [Database Schema](./database-schema.md)
- [API Testing Guide](./api-testing-guide.md)
- [Frontend Components](./frontend-components.md)

---

**Last Updated:** 13 November 2025  
**Version:** 1.0.0  
**Author:** Publishify Development Team
