# 🔧 Fix: Frontend Feedback API Mismatch

## 📌 Masalah
Error 500 (Internal Server Error) terjadi saat:
1. **Tambah Feedback** → `POST /review/:id/feedback`
2. **Set Rekomendasi** → `PUT /review/:id`

## 🔍 Root Cause
**Frontend mengirim data yang tidak sesuai dengan backend schema:**

### Backend Schema (database):
```prisma
model FeedbackReview {
  id             String   @id @default(uuid())
  idReview       String
  bab            String?      // ← Field ini
  halaman        Int?         // ← Field ini
  komentar       String       // ← Field ini
  dibuatPada     DateTime @default(now())
}
```

### Frontend (sebelum fix):
```typescript
// ❌ SALAH - Field tidak ada di backend
{
  aspek: "Alur Cerita",    // Field tidak ada
  komentar: "...",
  skor: 5                  // Field tidak ada
}
```

## ✅ Solusi Applied

### 1. Update Type Definitions (`frontend/lib/api/review.ts`)
```typescript
// BEFORE
export interface FeedbackReview {
  id: string;
  idReview: string;
  aspek: string;        // ❌ Tidak ada di backend
  komentar: string;
  skor?: number;        // ❌ Tidak ada di backend
  dibuatPada: string;
}

export interface TambahFeedbackDto {
  aspek: string;        // ❌ Tidak ada di backend
  komentar: string;
  skor?: number;        // ❌ Tidak ada di backend
}

// AFTER
export interface FeedbackReview {
  id: string;
  idReview: string;
  bab?: string;         // ✅ Sesuai backend
  halaman?: number;     // ✅ Sesuai backend
  komentar: string;     // ✅ Sesuai backend
  dibuatPada: string;
}

export interface TambahFeedbackDto {
  bab?: string;         // ✅ Sesuai backend
  halaman?: number;     // ✅ Sesuai backend
  komentar: string;     // ✅ Sesuai backend
}
```

### 2. Update State Variables (`page.tsx`)
```typescript
// BEFORE
const [aspek, setAspek] = useState("");
const [komentar, setKomentar] = useState("");
const [skor, setSkor] = useState<number>(3);

// AFTER
const [bab, setBab] = useState("");
const [halaman, setHalaman] = useState<number | undefined>(undefined);
const [komentar, setKomentar] = useState("");
```

### 3. Update `handleTambahFeedback()`
```typescript
// BEFORE
await reviewApi.tambahFeedback(idReview, {
  aspek: aspek.trim(),
  komentar: komentar.trim(),
  skor,
});

// AFTER
await reviewApi.tambahFeedback(idReview, {
  bab: bab.trim() || undefined,
  halaman: halaman || undefined,
  komentar: komentar.trim(),
});
```

### 4. Update `handleSetRekomendasi()`
```typescript
// BEFORE - Menggunakan perbaruiReview + tambahFeedback dengan aspek/skor
await reviewApi.perbaruiReview(idReview, {
  catatanUmum: catatanRekomendasi.trim(),
});

await reviewApi.tambahFeedback(idReview, {
  aspek: `REKOMENDASI: ${rekomendasi.toUpperCase()}`,
  komentar: catatanRekomendasi.trim(),
  skor: rekomendasi === "setujui" ? 5 : rekomendasi === "revisi" ? 3 : 1,
});

// AFTER - Hanya tambahFeedback dengan field yang benar
await reviewApi.tambahFeedback(idReview, {
  bab: `Rekomendasi: ${rekomendasi.toUpperCase()}`,
  komentar: catatanRekomendasi.trim(),
});
```

### 5. Update UI Form Modal
```typescript
// BEFORE - 3 fields: aspek, komentar, skor (star rating)
<input type="text" value={aspek} onChange={(e) => setAspek(e.target.value)} />
<textarea value={komentar} onChange={(e) => setKomentar(e.target.value)} />
<StarRating value={skor} onChange={setSkor} />

// AFTER - 3 fields: bab (optional), halaman (optional), komentar (required)
<input 
  type="text" 
  value={bab} 
  onChange={(e) => setBab(e.target.value)}
  placeholder="Contoh: Bab 1, Pembukaan" 
/>
<input 
  type="number" 
  value={halaman} 
  onChange={(e) => setHalaman(parseInt(e.target.value))}
  placeholder="Nomor halaman" 
/>
<textarea 
  value={komentar} 
  onChange={(e) => setKomentar(e.target.value)}
  placeholder="Minimal 10 karakter" 
/>
```

### 6. Update Feedback Display
```typescript
// BEFORE - Menampilkan aspek dan skor
{review.feedback.map((fb) => (
  <div>
    <h4>{fb.aspek}</h4>
    {fb.skor && <StarRating value={fb.skor} />}
    <p>{fb.komentar}</p>
  </div>
))}

// AFTER - Menampilkan bab dan halaman
{review.feedback.map((fb) => (
  <div>
    {fb.bab && (
      <span className="badge">{fb.bab}</span>
    )}
    {fb.halaman && (
      <span>Halaman {fb.halaman}</span>
    )}
    <p>{fb.komentar}</p>
  </div>
))}
```

### 7. Removed Unused Function
```typescript
// REMOVED - Fungsi skorStars tidak dipakai lagi
const skorStars = (nilai: number) => { ... }
```

## 📝 Validation Rules

### Backend (TambahFeedbackDto):
```typescript
bab: z.string().max(100).optional().nullable()
halaman: z.number().int().min(1).optional().nullable()
komentar: z.string().min(10).max(2000).trim()
```

### Frontend Validation:
```typescript
// Komentar wajib minimal 10 karakter
if (komentar.trim().length < 10) {
  toast.error("Komentar minimal 10 karakter");
  return;
}

// Bab dan halaman optional
bab: bab.trim() || undefined,
halaman: halaman || undefined,
```

## 🧪 Testing Checklist

- [x] ✅ Tambah feedback tanpa bab/halaman (hanya komentar)
- [x] ✅ Tambah feedback dengan bab saja
- [x] ✅ Tambah feedback dengan halaman saja
- [x] ✅ Tambah feedback dengan bab + halaman
- [x] ✅ Validasi komentar minimal 10 karakter
- [x] ✅ Set rekomendasi dengan catatan
- [x] ✅ Display feedback dengan bab/halaman yang benar
- [x] ✅ No TypeScript errors

## 📂 Files Changed

1. **`frontend/lib/api/review.ts`**
   - Updated `FeedbackReview` interface
   - Updated `TambahFeedbackDto` interface

2. **`frontend/app/(dashboard)/dashboard/editor/review/[id]/page.tsx`**
   - Updated state variables (bab, halaman, komentar)
   - Updated `handleTambahFeedback()`
   - Updated `handleSetRekomendasi()`
   - Updated feedback form modal UI
   - Updated feedback display component
   - Removed `skorStars()` function

## 🚀 Result

✅ **No more 500 errors**
✅ **Feedback dapat ditambahkan**
✅ **Rekomendasi dapat ditetapkan**
✅ **UI sesuai dengan backend schema**

---

**Date:** November 13, 2025  
**Issue:** Frontend-Backend API mismatch  
**Fix:** Update frontend to match backend schema
