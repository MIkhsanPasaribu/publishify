# Dokumentasi Revisi Panel Percetakan - Publishify

## 📋 Overview

Dokumentasi ini mencakup revisi total untuk panel percetakan dengan struktur sidebar baru, sistem tarif dinamis, dan snapshot pattern untuk pesanan.

---

## ✅ Progress Implementation

### 1. Database Schema (✅ COMPLETED)

#### A. Enum Baru
```prisma
enum JenisKertas {
  HVS
  BOOKPAPER
  ART_PAPER
}

enum JenisCover {
  SOFTCOVER
  HARDCOVER
}
```

#### B. Model Baru: `TarifPercetakan`
Katalog harga yang diatur oleh masing-masing percetakan:
- `id` - Primary key (UUID)
- `idPercetakan` - Relasi ke `Pengguna` (percetakan)
- `formatBuku` - Format buku (A4, A5, B5)
- `jenisKertas` - Jenis kertas (HVS, BOOKPAPER, ART_PAPER)
- `jenisCover` - Jenis cover (SOFTCOVER, HARDCOVER)
- `hargaPerHalaman` - Harga cetak per halaman
- `biayaJilid` - Biaya finishing per buku
- `minimumPesanan` - Minimum jumlah order
- `aktif` - Status aktif tarif
- **Unique Constraint**: `[idPercetakan, formatBuku, jenisKertas, jenisCover]`

#### C. Update Model: `PesananCetak`
Menerapkan **SNAPSHOT PATTERN**:
- `judulSnapshot` - Copy dari `Naskah.judul`
- `formatSnapshot` - Copy dari `Naskah.formatBuku`
- `jumlahHalamanSnapshot` - Copy dari `Naskah.jumlahHalaman`
- `idPercetakan` - Relasi ke percetakan yang dipilih
- **Index Baru**: `@@index([idPercetakan, status])`

#### D. Update Model: `Pengguna`
- `pesananPercetakan` - Relasi untuk pesanan yang ditangani percetakan

---

### 2. Backend API (✅ COMPLETED)

#### A. DTO (Data Transfer Objects)
Location: `backend/src/modules/percetakan/dto/`

**Files Created:**
- `buat-tarif.dto.ts` - Validasi untuk buat tarif
- `perbarui-tarif.dto.ts` - Validasi untuk update tarif
- `kalkulasi-harga.dto.ts` - Input untuk kalkulasi harga
- `buat-pesanan-baru.dto.ts` - Input untuk buat pesanan dengan snapshot

#### B. Service Methods
Location: `backend/src/modules/percetakan/percetakan.service.ts`

**CRUD Tarif Percetakan:**
```typescript
✅ buatTarif(idPercetakan, dto)
✅ ambilSemuaTarif(idPercetakan?, aktif?)
✅ ambilTarifById(id)
✅ perbaruiTarif(id, idPercetakan, dto)
✅ hapusTarif(id, idPercetakan)
```

**Kalkulasi & Pesanan:**
```typescript
✅ kalkulasiOpsiHarga(dto)
   - Input: naskahId, jenisKertas, jenisCover
   - Output: Array opsi harga dari berbagai percetakan
   - Logic: Query tarif yang cocok, hitung estimasi per percetakan

✅ buatPesananBaru(idPenulis, dto)
   - Input: naskahId, percetakanId, jenisKertas, jenisCover, jumlahOrder
   - SNAPSHOT: Copy data naskah ke pesanan
   - Generate nomor pesanan unik (PO-YYYYMMDD-XXXX)
   - Hitung total harga dari tarif

✅ ambilPesananPercetakan(idPercetakan, status?)
   - Filter: baru, produksi, pengiriman, selesai
   - Include: naskah, pemesan, pengiriman, pembayaran
```

#### C. Controller Endpoints
Location: `backend/src/modules/percetakan/percetakan.controller.ts`

**Tarif Endpoints:**
```
✅ POST   /api/percetakan/tarif
✅ GET    /api/percetakan/tarif
✅ GET    /api/percetakan/tarif/:id
✅ PUT    /api/percetakan/tarif/:id
✅ PUT    /api/percetakan/tarif/:id/hapus
```

**Kalkulasi & Pesanan:**
```
✅ POST   /api/percetakan/kalkulasi-harga
✅ POST   /api/percetakan/pesanan/baru
✅ GET    /api/percetakan/pesanan/percetakan?status=baru|produksi|pengiriman|selesai
```

---

### 3. Frontend Types (✅ COMPLETED)

Location: `frontend/types/percetakan.ts`

**Types Added:**
```typescript
✅ JenisKertas = 'HVS' | 'BOOKPAPER' | 'ART_PAPER'
✅ JenisCover = 'SOFTCOVER' | 'HARDCOVER'
✅ TarifPercetakan - Interface untuk tarif
✅ BuatTarifDto, PerbaruiTarifDto
✅ KalkulasiHargaDto, OpsiHarga, KalkulasiHargaResponse
✅ BuatPesananBaruDto
✅ StatistikDashboardPercetakan
✅ LaporanKeuangan, SaldoPercetakan
```

---

### 4. Frontend API Client (✅ COMPLETED)

Location: `frontend/lib/api/percetakan.ts`

**Functions Added:**
```typescript
✅ buatTarif(dto)
✅ ambilSemuaTarif(params?)
✅ ambilTarifById(id)
✅ perbaruiTarif(id, dto)
✅ hapusTarif(id)
✅ kalkulasiOpsiHarga(dto)
✅ buatPesananBaru(dto)
✅ ambilPesananPercetakan(status?)
```

---

## 🎯 Struktur Sidebar Baru

### GROUP 1: UTAMA (Overview)
**Route:** `/dashboard/percetakan`
- Sekilas pandang performa toko percetakan
- Cards: Total Pesanan, Pesanan Aktif, Revenue
- Chart: Trend pesanan per bulan

### GROUP 2: FULFILLMENT (Pesanan)

#### 1. 📥 Pesanan Baru
**Route:** `/dashboard/percetakan/pesanan/baru`
- Status: `tertunda` atau `diterima`
- **Notification Badge**: Tampilkan jumlah pesanan baru
- Aksi: Terima, Tolak, Download PDF, Cetak Label

#### 2. ⚙️ Dalam Produksi
**Route:** `/dashboard/percetakan/pesanan/produksi`
- Status: `dalam_produksi` atau `kontrol_kualitas`
- Aksi: Update progress, Upload foto progress

#### 3. 📦 Pengiriman
**Route:** `/dashboard/percetakan/pesanan/pengiriman`
- Status: `siap` atau `dikirim`
- Aksi: Input Nomor Resi, Cetak Label, Request Pickup

#### 4. ✅ Riwayat Selesai
**Route:** `/dashboard/percetakan/pesanan/riwayat`
- Status: `terkirim` atau `dibatalkan`
- Filter: Tanggal, Status

### GROUP 3: LAYANAN & HARGA (Configuration)

#### 5. 🏷️ Kelola Tarif
**Route:** `/dashboard/percetakan/tarif`
- CRUD Tarif: Tambah, Edit, Hapus
- Tabel: Format, Jenis Kertas, Cover, Harga/Halaman, Biaya Jilid
- Filter: Aktif/Nonaktif

### GROUP 4: KEUANGAN (Finance)

#### 6. 💰 Saldo & Penarikan
**Route:** `/dashboard/percetakan/keuangan/saldo`
- Saldo Aktif, Total Pendapatan
- Form Penarikan ke Rekening Bank
- Riwayat Penarikan

#### 7. 📄 Laporan Penghasilan
**Route:** `/dashboard/percetakan/keuangan/laporan`
- Mutasi Transaksi Per Pesanan
- Filter: Periode, Status
- Export PDF/Excel

### GROUP 5: PENGATURAN (Settings)

#### 8. Store Profile
**Route:** `/dashboard/percetakan/settings/profile`
- Logo Percetakan
- Alamat Workshop
- No HP Admin
- Jam Operasional

---

## 📝 Database Migration Guide

### Step 1: Ensure Database Connection
```bash
# Check .env file
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
```

### Step 2: Generate Prisma Client
```bash
cd backend
npx prisma generate
```

### Step 3: Push Schema to Database
```bash
npx prisma db push
```

Jika ada error shadow database, gunakan:
```bash
npx prisma db push --accept-data-loss
```

### Step 4: Verify Migration
```bash
npx prisma studio
# Check tables: tarif_percetakan, pesanan_cetak (updated)
```

---

## 🔧 Backend Testing dengan Swagger

### 1. Start Backend Server
```bash
cd backend
bun run start:dev
# atau
npm run start:dev
```

### 2. Open Swagger UI
```
http://localhost:3000/api
```

### 3. Test Endpoints

**Buat Tarif:**
```http
POST /api/percetakan/tarif
Authorization: Bearer {token_percetakan}

{
  "formatBuku": "A5",
  "jenisKertas": "BOOKPAPER",
  "jenisCover": "SOFTCOVER",
  "hargaPerHalaman": 500,
  "biayaJilid": 5000,
  "minimumPesanan": 10
}
```

**Kalkulasi Harga:**
```http
POST /api/percetakan/kalkulasi-harga
Authorization: Bearer {token_penulis}

{
  "naskahId": "uuid-naskah",
  "jenisKertas": "BOOKPAPER",
  "jenisCover": "SOFTCOVER"
}
```

**Buat Pesanan:**
```http
POST /api/percetakan/pesanan/baru
Authorization: Bearer {token_penulis}

{
  "naskahId": "uuid-naskah",
  "percetakanId": "uuid-percetakan",
  "jenisKertas": "BOOKPAPER",
  "jenisCover": "SOFTCOVER",
  "jumlahOrder": 100,
  "catatan": "Kirim ke alamat toko"
}
```

---

## 📱 Frontend Development Guide

### Priority Order untuk Development:

#### ✅ Phase 1: Foundation (COMPLETED)
- [x] Database schema
- [x] Backend DTOs
- [x] Backend services
- [x] Backend controllers
- [x] Frontend types
- [x] Frontend API client

#### 🔄 Phase 2: Core Pages (NEXT)
1. **Update Sidebar Component**
   - Location: `frontend/components/layouts/sidebar-navigasi.tsx`
   - Add 5 menu groups
   - Add notification badge for "Pesanan Baru"

2. **Overview Dashboard** (`/dashboard/percetakan`)
   - Remove hardcoded data
   - Fetch real stats from API
   - Add charts (Recharts)

3. **Kelola Tarif** (`/dashboard/percetakan/tarif`)
   - DataTable dengan CRUD
   - Modal Form (Create/Edit)
   - Toggle Aktif/Nonaktif

#### 🔄 Phase 3: Pesanan Management
4. **Pesanan Baru** (`/dashboard/percetakan/pesanan/baru`)
5. **Dalam Produksi** (`/dashboard/percetakan/pesanan/produksi`)
6. **Pengiriman** (`/dashboard/percetakan/pesanan/pengiriman`)
7. **Riwayat** (`/dashboard/percetakan/pesanan/riwayat`)

#### 🔄 Phase 4: Finance
8. **Saldo & Penarikan** (`/dashboard/percetakan/keuangan/saldo`)
9. **Laporan Penghasilan** (`/dashboard/percetakan/keuangan/laporan`)

#### 🔄 Phase 5: Settings
10. **Store Profile** (`/dashboard/percetakan/settings/profile`)

---

## 🎨 Design System

### Color Palette
```typescript
// Status Colors
tertunda: "bg-yellow-100 text-yellow-800"
diterima: "bg-blue-100 text-blue-800"
dalam_produksi: "bg-purple-100 text-purple-800"
siap: "bg-green-100 text-green-800"
terkirim: "bg-emerald-100 text-emerald-800"
dibatalkan: "bg-red-100 text-red-800"
```

### shadcn/ui Components to Use
- `<Card>` - For stats and content containers
- `<Table>` - For data tables
- `<Badge>` - For status indicators
- `<Button>` - For actions
- `<Dialog>` - For modals
- `<Select>` - For dropdowns
- `<Input>` - For forms
- `<Tabs>` - For tab navigation

---

## 🚀 Running the Project

### Backend
```bash
cd backend
bun install
bun run start:dev
```

### Frontend
```bash
cd frontend
bun install
bun run dev
```

### Access
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:3000/api`
- Swagger Docs: `http://localhost:3000/api`

---

## 📌 Important Notes

### 1. Snapshot Pattern
Saat buat pesanan, **WAJIB** copy data dari Naskah:
```typescript
judulSnapshot: naskah.judul,
formatSnapshot: naskah.formatBuku,
jumlahHalamanSnapshot: naskah.jumlahHalaman
```

**Alasan**: Jika penulis mengubah data naskah setelah pesanan dibuat, data pesanan tetap konsisten.

### 2. Status Filter Mapping
```typescript
status: 'baru' → where: { status: { in: ['tertunda', 'diterima'] } }
status: 'produksi' → where: { status: { in: ['dalam_produksi', 'kontrol_kualitas'] } }
status: 'pengiriman' → where: { status: { in: ['siap', 'dikirim'] } }
status: 'selesai' → where: { status: { in: ['terkirim', 'dibatalkan'] } }
```

### 3. Authorization Guards
```typescript
@Peran('percetakan') // Hanya percetakan
@Peran('penulis')    // Hanya penulis
@Public()            // Public endpoint
```

### 4. Notification Badge
Untuk "Pesanan Baru", hitung jumlah pesanan dengan:
```typescript
const { data } = await ambilPesananPercetakan('baru');
const count = data.length;
```

---

## 🐛 Common Issues & Solutions

### Issue 1: Prisma Client Error
```bash
Error: Cannot find module '@prisma/client'
```
**Solution:**
```bash
cd backend
npx prisma generate
```

### Issue 2: Database Connection Error
```bash
Error: Can't reach database server
```
**Solution:**
- Check `.env` file
- Verify Supabase connection
- Test with: `npx prisma studio`

### Issue 3: CORS Error di Frontend
**Solution:**
Check `backend/src/main.ts`:
```typescript
app.enableCors({
  origin: 'http://localhost:3000',
  credentials: true,
});
```

---

## 📚 Next Steps

1. **Database Migration**
   ```bash
   cd backend
   npx prisma db push
   npx prisma studio # verify
   ```

2. **Test Backend APIs**
   - Open Swagger: `http://localhost:3000/api`
   - Test POST /api/percetakan/tarif
   - Test POST /api/percetakan/kalkulasi-harga

3. **Start Frontend Development**
   - Update Sidebar (Priority #1)
   - Build Kelola Tarif page (Priority #2)
   - Build Overview Dashboard (Priority #3)

4. **Data Seeding** (Optional)
   - Buat script seed untuk tarif percetakan sample
   - Location: `backend/prisma/seed.ts`

---

## 📞 Support

Jika ada error atau pertanyaan:
1. Check logs: `backend/logs`
2. Check Swagger docs
3. Verify database dengan Prisma Studio
4. Review this documentation

---

**Last Updated:** December 10, 2025
**Version:** 1.0.0
**Status:** Backend ✅ | Frontend 🔄
