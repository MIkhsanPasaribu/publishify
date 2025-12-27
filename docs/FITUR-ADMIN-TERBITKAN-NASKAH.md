# 📚 Dokumentasi Fitur: Admin Menerbitkan Naskah

## 🎯 Overview

Fitur ini memungkinkan admin untuk menerbitkan naskah yang sudah mendapat rekomendasi "setujui" dari editor. Proses ini mengubah status naskah dari `disetujui` menjadi `diterbitkan`, dan baru setelah itu naskah akan muncul di halaman "Buku Terbit" milik penulis.

---

## 🔄 Workflow Penerbitan Naskah

### Flow Lengkap:

```
1. PENULIS: Buat naskah (status: draft)
   ↓
2. PENULIS: Ajukan naskah (status: diajukan)
   ↓
3. ADMIN: Tugaskan editor
   ↓
4. EDITOR: Review naskah (status: dalam_review)
   ↓
5. EDITOR: Selesai review dengan rekomendasi "setujui" (status: disetujui)
   ↓
6. ⭐ ADMIN: Terbitkan naskah dengan ISBN (status: diterbitkan) ← FITUR BARU
   ↓
7. PENULIS: Naskah muncul di halaman "Buku Terbit"
   ↓
8. PENULIS: Atur harga jual (opsional)
   ↓
9. PENULIS: Pesan cetak fisik
```

---

## 🛠️ Implementasi Frontend

### 1. **Halaman Admin: Naskah Siap Terbit**

**Path:** `/dashboard/admin/naskah-siap-terbit`

**File:** `frontend/app/(dashboard)/dashboard/admin/naskah-siap-terbit/page.tsx`

#### Features:

✅ **Fetch Data dengan React Query**
```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ["naskah-siap-terbit"],
  queryFn: async () => {
    return await naskahApi.ambilSemuaNaskahAdmin({ status: "disetujui" });
  },
});
```

✅ **Stats Cards (3 Cards)**
- Menunggu Penerbitan: Jumlah naskah dengan status "disetujui"
- Status: Badge "Disetujui" 
- Aksi Diperlukan: Input ISBN & biaya produksi

✅ **Search Functionality**
- Real-time search berdasarkan judul dan sub-judul
- Debounced input untuk performa

✅ **Naskah Card List**
Setiap card menampilkan:
- Cover image (atau placeholder)
- Judul & sub-judul
- Badge status "Disetujui"
- Sinopsis (max 2 baris)
- Metadata: Halaman, Kata, Bahasa, Tanggal disetujui
- Review info terakhir (catatan editor)
- ISBN (jika sudah ada)
- Action buttons: "Terbitkan Naskah" & "Lihat Detail"

✅ **Loading State**
```tsx
{isLoading && (
  <Loader2 className="h-12 w-12 animate-spin" />
)}
```

✅ **Error Handling**
```tsx
{error && (
  <Card className="border-red-200 bg-red-50">
    <p className="text-red-900">Gagal memuat data</p>
    <p className="text-red-700">{error.message}</p>
  </Card>
)}
```

✅ **Empty State**
```tsx
{filteredNaskah.length === 0 && (
  <div>
    <BookCheck className="text-slate-400" />
    <p>Tidak ada naskah siap terbit</p>
  </div>
)}
```

---

### 2. **Modal Terbitkan Naskah**

**Component:** Dialog dari shadcn/ui

#### Form Fields:

**1. ISBN (Required)**
- Type: Text input
- Placeholder: "978-602-xxxxx-x-x"
- Validation: Wajib diisi, min 1 karakter
- Hint: "Nomor ISBN yang sudah terdaftar di Perpusnas"

**2. Biaya Produksi (Required)**
- Type: Number input
- Placeholder: "50000"
- Validation: Wajib diisi, harus > 0
- Hint: "Estimasi biaya cetak per eksemplar"
- Format: Rupiah

#### Validation:

```typescript
const handleSubmitTerbitkan = () => {
  if (!formData.isbn.trim()) {
    toast.error("ISBN wajib diisi");
    return;
  }

  const biaya = parseFloat(formData.biayaProduksi);
  if (isNaN(biaya) || biaya <= 0) {
    toast.error("Biaya produksi harus lebih dari 0");
    return;
  }

  // Submit...
};
```

#### Mutation dengan React Query:

```typescript
const terbitkanMutation = useMutation({
  mutationFn: async ({ id, payload }) => {
    console.log("🚀 Menerbitkan naskah:", { id, payload });
    return await naskahApi.terbitkanNaskah(id, payload);
  },
  onSuccess: (data) => {
    console.log("✅ Success:", data);
    toast.success("Naskah berhasil diterbitkan!");
    queryClient.invalidateQueries({ queryKey: ["naskah-siap-terbit"] });
    setModalTerbitkan(false);
  },
  onError: (error) => {
    console.error("❌ Error:", error);
    toast.error("Gagal menerbitkan naskah");
  },
});
```

#### Loading State:

```tsx
<Button disabled={terbitkanMutation.isPending}>
  {terbitkanMutation.isPending ? (
    <>
      <Loader2 className="animate-spin" />
      Menerbitkan...
    </>
  ) : (
    <>
      <BookCheck />
      Terbitkan Sekarang
    </>
  )}
</Button>
```

#### Warning Notice:

```tsx
<div className="bg-amber-50 border-amber-200">
  ⚠️ Setelah diterbitkan, naskah akan muncul di halaman 
  "Buku Terbit" penulis dan tidak dapat dikembalikan ke 
  status disetujui.
</div>
```

---

### 3. **API Integration**

**File:** `frontend/lib/api/naskah.ts`

**New Function:**

```typescript
/**
 * PUT /naskah/:id/terbitkan - Admin terbitkan naskah
 * Role: admin, editor
 */
async terbitkanNaskah(
  id: string, 
  payload: { 
    isbn: string; 
    biayaProduksi: number 
  }
): Promise<ResponseSukses<Naskah>> {
  const { data } = await api.put<ResponseSukses<Naskah>>(
    `/naskah/${id}/terbitkan`, 
    payload
  );
  return data;
}
```

---

### 4. **Update Halaman Buku Terbit (Penulis)**

**Path:** `/dashboard/buku-terbit`

**File:** `frontend/app/(dashboard)/dashboard/buku-terbit/page.tsx`

**Perubahan:** Sudah benar, fetch hanya naskah dengan status `"diterbitkan"`

```typescript
// ✅ SUDAH BENAR - Line 58
const res = await naskahApi.ambilNaskahSaya({ status: "diterbitkan" });
```

**Sebelumnya (SALAH):**
```typescript
// ❌ SALAH - Akan menampilkan naskah yang belum diterbitkan
const res = await naskahApi.ambilNaskahSaya({ status: "disetujui" });
```

---

## 🎨 Design System

### Color Scheme:

**Admin Pages (Slate/Gray Theme):**
- Primary: `from-slate-700 to-gray-700`
- Cards: `from-slate-50 to-gray-50`
- Borders: `border-slate-200`
- Accents: Green untuk success, Amber untuk pending

**Penulis Pages (Teal Theme):**
- Primary: `from-teal-700 to-cyan-700`
- Cards: `from-teal-50 to-cyan-50`
- Borders: `border-teal-200`

### Component Patterns:

**1. Stats Cards:**
```tsx
<Card className="border-2 border-slate-200 hover:shadow-xl transition-all">
  <CardContent className="pt-6">
    <div className="p-3 bg-slate-100 rounded-lg">
      <Icon className="h-6 w-6 text-slate-600" />
    </div>
    <p className="text-sm text-slate-700 font-medium">Label</p>
    <p className="text-3xl font-bold text-slate-900">{value}</p>
  </CardContent>
</Card>
```

**2. Status Badges:**
```tsx
<Badge className="bg-green-100 text-green-800 border-2 border-green-200">
  <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
  Disetujui
</Badge>
```

**3. Animated Loading:**
```tsx
<Loader2 className="h-12 w-12 animate-spin text-slate-400" />
```

**4. Hover Effects:**
```tsx
className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
```

---

## 📊 State Management

### React Query Keys:

```typescript
["naskah-siap-terbit"]  // List naskah dengan status "disetujui"
```

### Mutation Flow:

```
1. User klik "Terbitkan Naskah"
   ↓
2. Modal terbuka dengan form
   ↓
3. User input ISBN & biaya produksi
   ↓
4. Validasi client-side
   ↓
5. Mutation execute (loading state)
   ↓
6. Backend update status → "diterbitkan"
   ↓
7. onSuccess: invalidateQueries + toast + close modal
   ↓
8. List refresh otomatis (naskah hilang dari list)
```

---

## 🔐 Backend Integration

### Endpoint: `PUT /api/naskah/:id/terbitkan`

**Role:** admin, editor

**Request Body:**
```json
{
  "isbn": "978-602-xxxxx-x-x",
  "biayaProduksi": 50000
}
```

**Response Success (200):**
```json
{
  "sukses": true,
  "pesan": "Naskah berhasil diterbitkan",
  "data": {
    "id": "uuid",
    "judul": "Judul Naskah",
    "status": "diterbitkan",
    "isbn": "978-602-xxxxx-x-x",
    "biayaProduksi": 50000,
    "diterbitkanPada": "2025-12-09T10:30:00Z",
    ...
  }
}
```

**Response Error (400):**
```json
{
  "sukses": false,
  "pesan": "Naskah hanya bisa diterbitkan jika sudah disetujui",
  "error": {
    "kode": "INVALID_STATUS",
    "timestamp": "2025-12-09T10:30:00Z"
  }
}
```

**Response Error (400 - ISBN Duplicate):**
```json
{
  "sukses": false,
  "pesan": "ISBN sudah digunakan oleh naskah lain",
  ...
}
```

---

## 🧪 Testing Checklist

### Manual Testing:

- [ ] **Happy Path:**
  - [ ] Admin buka `/dashboard/admin/naskah-siap-terbit`
  - [ ] Tampil list naskah dengan status "disetujui"
  - [ ] Klik "Terbitkan Naskah" → Modal terbuka
  - [ ] Input ISBN valid & biaya produksi
  - [ ] Submit → Loading state muncul
  - [ ] Success toast muncul
  - [ ] Naskah hilang dari list
  - [ ] Penulis buka `/dashboard/buku-terbit` → Naskah muncul

- [ ] **Validation:**
  - [ ] ISBN kosong → Error toast
  - [ ] Biaya produksi 0 → Error toast
  - [ ] Biaya produksi negatif → Error toast
  - [ ] ISBN duplikat → Error dari backend

- [ ] **Error Handling:**
  - [ ] Network error → Error toast dengan pesan
  - [ ] Backend 400 → Error toast dengan pesan backend
  - [ ] Backend 404 → Error toast "Naskah tidak ditemukan"

- [ ] **UI States:**
  - [ ] Loading state saat fetch data
  - [ ] Empty state jika tidak ada naskah
  - [ ] Error state jika gagal fetch
  - [ ] Skeleton/loading saat submit mutation

### Console Logs:

```
✅ Logs yang harus muncul:
🔄 Fetching naskah dengan status 'disetujui'...
✅ Data naskah siap terbit: [...]
📖 Membuka modal terbitkan untuk naskah: {...}
📝 Submitting form: { isbn: "...", biayaProduksi: 50000 }
🚀 Menerbitkan naskah: { id: "...", payload: {...} }
✅ Naskah berhasil diterbitkan: {...}
✅ Mutation success, data: {...}

❌ Error logs (jika ada):
❌ Error menerbitkan naskah: Error object
```

---

## 📱 Responsive Design

### Breakpoints:

**Desktop (≥1024px):**
- Stats cards: 3 columns
- Naskah cards: Full width dengan flex layout
- Modal: max-w-[500px]

**Tablet (768px - 1023px):**
- Stats cards: 2 columns (3rd card wraps)
- Naskah cards: Full width, image + content stacked

**Mobile (<768px):**
- Stats cards: 1 column stacked
- Search bar: Full width
- Naskah cards: Vertical layout
- Modal: Full width dengan padding

---

## 🎯 User Experience

### Feedback Mechanisms:

**1. Toast Notifications:**
```typescript
// Success
toast.success("Naskah berhasil diterbitkan!", {
  description: '"Judul Naskah" sekarang berstatus diterbitkan',
});

// Error
toast.error("Gagal menerbitkan naskah", {
  description: error.message,
});
```

**2. Loading States:**
- Spinner saat fetch data
- Disabled button saat submit
- Animated Loader2 icon

**3. Visual Feedback:**
- Hover effects pada cards
- Badge animasi (pulse untuk pending)
- Smooth transitions

---

## 🔔 Notifikasi Backend

Ketika admin menerbitkan naskah, backend otomatis mengirim notifikasi ke penulis:

```typescript
await this.prisma.notifikasi.create({
  data: {
    idPengguna: naskah.idPenulis,
    judul: 'Naskah Anda Telah Diterbitkan!',
    pesan: `Selamat! Naskah "${naskah.judul}" telah diterbitkan dengan ISBN ${dto.isbn}. Modal cetak ditetapkan sebesar Rp ${dto.biayaProduksi.toLocaleString('id-ID')}. Silakan atur harga jual buku Anda.`,
    tipe: 'info',
    url: `/dashboard/penulis/atur-harga`,
  },
});
```

---

## 📈 Analytics & Logging

### Backend Log Activity:

```typescript
await this.prisma.logAktivitas.create({
  data: {
    idPengguna,  // Admin yang menerbitkan
    jenis: 'publikasi',
    aksi: 'terbitkan_naskah',
    entitas: 'naskah',
    idEntitas: id,
    deskripsi: `Admin menerbitkan naskah "${naskah.judul}" dengan ISBN ${dto.isbn}`,
  },
});
```

---

## 🚀 Next Steps

### Future Enhancements:

1. **Bulk Publish:**
   - Checkbox selection multiple naskah
   - Batch terbitkan dengan ISBN generator

2. **ISBN Validation:**
   - Check digit validation
   - Format validation (978/979 prefix)

3. **Preview Mode:**
   - Preview halaman buku terbit sebelum publish
   - Check metadata completeness

4. **Approval Workflow:**
   - Require 2-step approval (editor + admin)
   - Audit trail untuk setiap perubahan status

5. **Auto-notification:**
   - Email ke penulis saat naskah diterbitkan
   - Push notification (jika mobile app)

---

## 📝 Summary

✅ **Fitur Lengkap:**
- Halaman admin untuk naskah siap terbit
- Modal form terbitkan dengan validation
- React Query untuk data fetching & mutation
- Loading, error, dan empty states
- Console logs untuk debugging
- Responsive design
- Toast notifications
- Backend integration dengan endpoint `/api/naskah/:id/terbitkan`

✅ **Logika Benar:**
- Hanya naskah dengan status `"disetujui"` yang bisa diterbitkan
- Setelah diterbitkan, status berubah ke `"diterbitkan"`
- Halaman "Buku Terbit" penulis hanya menampilkan naskah `"diterbitkan"`
- ISBN validation (unique constraint)
- Biaya produksi required dan > 0

✅ **UX Terpenuhi:**
- Desain konsisten (slate/gray theme untuk admin)
- Rapi dan terorganisir
- Responsif di semua device
- Feedback yang jelas (toast, loading, error)
- Interaktif dengan hover effects

---

*Dokumentasi dibuat: 9 Desember 2025*  
*Version: 1.0*
