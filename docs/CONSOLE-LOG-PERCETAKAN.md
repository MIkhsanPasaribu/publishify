# Console Log Modul Percetakan - Detail & Lengkap

## 📋 Overview

Dokumentasi lengkap console log yang telah ditambahkan pada modul percetakan untuk memudahkan debugging dan monitoring.

## 🎯 Console Log Methods

### 1. **buatPesanan** - Membuat Pesanan Baru

```
🎯 [PERCETAKAN] Membuat Pesanan Baru
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 ID Pemesan: <UUID>
📝 DTO: <JSON Object>
📖 Naskah: <Judul> (<Status>)

✅ Pesanan berhasil dibuat!
  - ID Pesanan: <UUID>
  - Nomor Pesanan: PO-YYYYMMDD-XXXX
  - Total Harga: <Decimal>
  - Status: tertunda
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Informasi yang di-log:**
- ID Pemesan (pengguna yang membuat pesanan)
- DTO lengkap (semua data yang dikirim)
- Info naskah (judul & status)
- ID Pesanan yang baru dibuat
- Nomor pesanan yang di-generate
- Total harga hasil kalkulasi
- Status awal (tertunda)

---

### 2. **ambilSemuaPesanan** - Mengambil Daftar Pesanan

```
📋 [PERCETAKAN] Mengambil Daftar Pesanan
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 ID Pengguna: <UUID | N/A>
🎭 Peran: <penulis | percetakan | admin | N/A>
🔍 Filter: <JSON Filter Object>
🔎 Where Clause (before filters): <JSON Where Object>

✅ Query berhasil!
  - Total data: <Number>
  - Data diambil: <Number>
  - Halaman: <Current> / <Total>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Informasi yang di-log:**
- ID Pengguna yang mengakses
- Peran pengguna (penulis/percetakan/admin)
- Filter yang digunakan (halaman, limit, status, dll)
- Where clause yang terbentuk
- Total data di database
- Jumlah data yang diambil
- Info pagination

---

### 3. **ambilPesananById** - Detail Pesanan

```
🔍 [PERCETAKAN] Mengambil Detail Pesanan
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏷️  ID Pesanan: <UUID>
👤 ID Pengguna: <UUID | N/A>
🎭 Peran: <penulis | percetakan | admin | N/A>
```

**Informasi yang di-log:**
- ID Pesanan yang diminta
- ID Pengguna yang mengakses
- Peran pengguna untuk validasi akses

---

### 4. **perbaruiPesanan** - Update Pesanan

```
✏️  [PERCETAKAN] Memperbarui Pesanan
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏷️  ID Pesanan: <UUID>
👤 ID Pemesan: <UUID>
📝 Update Data: <JSON Object>
📦 Pesanan Lama: Status: <status>, Total: <hargaTotal>
```

**Informasi yang di-log:**
- ID Pesanan yang akan diupdate
- ID Pemesan untuk validasi
- Data yang akan diupdate
- Status dan harga pesanan lama

---

### 5. **konfirmasiPesanan** - Terima/Tolak Pesanan (Percetakan)

```
✅ Konfirmasi pesanan berhasil!
  - Pesanan: <Nomor Pesanan>
  - Keputusan: DITERIMA | DITOLAK
  - Status Baru: <status>
  - Estimasi: <estimasiSelesai | ->
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Informasi yang di-log:**
- Nomor pesanan
- Keputusan (diterima/ditolak)
- Status baru setelah konfirmasi
- Estimasi selesai (jika ada)

---

### 6. **batalkanPesanan** - Batalkan Pesanan

```
❌ [PERCETAKAN] Membatalkan Pesanan
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏷️  ID Pesanan: <UUID>
👤 ID Pemesan: <UUID>
📝 Alasan: <alasan | Tidak ada>
📦 Pesanan: <Nomor Pesanan> - Status: <status>

✅ Pesanan berhasil dibatalkan
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Informasi yang di-log:**
- ID Pesanan yang dibatalkan
- ID Pemesan
- Alasan pembatalan
- Info pesanan (nomor & status)

---

### 7. **buatPengiriman** - Membuat Data Pengiriman

```
🚚 [PERCETAKAN] Membuat Data Pengiriman
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏷️  ID Pesanan: <UUID>
🏭 ID Percetakan: <UUID>
📦 Ekspedisi: <Nama Ekspedisi>
📝 Nomor Resi: <Resi | Belum ada>
📦 Status Pesanan: <status>
📍 Pengiriman Existing: Sudah ada | Belum ada
```

**Informasi yang di-log:**
- ID Pesanan
- ID Percetakan yang membuat pengiriman
- Nama ekspedisi yang digunakan
- Nomor resi (jika ada)
- Status pesanan saat ini
- Apakah sudah ada data pengiriman

---

### 8. **ambilStatistikPesanan** - Statistik Dashboard

```
🖨️  [PERCETAKAN] Statistik Pesanan
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Filter Query: <JSON Where Object>
📅 Start of Month: <ISO Date>

📈 Hasil Query:
  - Total Pesanan: <Number>
  - Pesanan Tertunda: <Number>
  - Pesanan Dalam Produksi: <Number>
  - Pesanan Selesai: <Number>
  - Revenue Bulan Ini: <Decimal>
  - Pesanan Bulan Ini: <Number>
  - Tingkat Penyelesaian: <Percentage>%
  - Rata-rata Waktu Produksi: <Number> hari
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Informasi yang di-log:**
- Filter query yang digunakan
- Tanggal awal bulan (untuk filter revenue)
- Semua statistik yang dikembalikan ke frontend
- Tingkat penyelesaian dalam persen
- Rata-rata waktu produksi

---

## 🛠️ Cara Menggunakan Console Log untuk Debugging

### 1. **Monitor Backend Terminal**

Pastikan backend berjalan di terminal:
```bash
cd backend
npm run start:dev
```

### 2. **Buka Dashboard Percetakan**

```
http://localhost:3000/dashboard/percetakan
```

### 3. **Perhatikan Console Output**

Setiap aksi akan menampilkan log detail di terminal backend:
- Buka pesanan baru → Lihat log `buatPesanan`
- Akses dashboard → Lihat log `ambilStatistikPesanan`
- Klik detail pesanan → Lihat log `ambilPesananById`

### 4. **Analisis Error**

Jika terjadi error, console log akan menunjukkan:
- Data apa yang dikirim (DTO)
- Query apa yang dijalankan (where clause)
- Hasil query (jumlah data, dll)
- Point of failure

---

## 🐛 Troubleshooting Common Issues

### Error 1: **Invalid time value**

```
❌ RangeError: Invalid time value at format()
```

**Penyebab:**
- Field date adalah `null` atau `undefined`
- Field date bukan format ISO string yang valid

**Solusi:**
- Cek console log `ambilSemuaPesanan` → lihat data `tanggalPesan`
- Pastikan field `tanggalPesan` ada dan valid
- Di frontend, tambahkan null check:
  ```typescript
  {pesanan.tanggalPesan ? format(new Date(pesanan.tanggalPesan), "dd MMM yyyy") : "-"}
  ```

### Error 2: **500 Internal Server Error**

```
❌ [API Error] GET /percetakan/statistik 500
```

**Debugging Steps:**
1. Cek console log backend untuk error detail
2. Pastikan user login memiliki peran yang tepat
3. Cek database apakah ada data pesanan
4. Verify query where clause di console log

**Common Causes:**
- Field database tidak sesuai (misal: `dibuatPada` vs `tanggalPesan`)
- Aggregate query error (misal: sum pada field yang null)
- User tidak memiliki akses (peran tidak sesuai)

### Error 3: **NaN di Frontend**

```
❌ Dashboard menampilkan NaN
```

**Penyebab:**
- Backend mengembalikan `null` atau `undefined`
- Calculation error pada frontend

**Solusi:**
1. Cek console log `ambilStatistikPesanan`
2. Pastikan semua nilai numerik ada
3. Di frontend, gunakan `Number()` dan default value:
   ```typescript
   const pesananAktif = (Number(stats.pesananTertunda) || 0) + 
                        (Number(stats.pesananDalamProduksi) || 0);
   ```

---

## 📊 Monitoring Performance

Console log juga membantu monitoring performa:

```
📋 [PERCETAKAN] Mengambil Daftar Pesanan
...
✅ Query berhasil!
  - Total data: 1500
  - Data diambil: 20
  - Halaman: 1 / 75
```

Dari log ini, kita bisa:
- Memastikan pagination bekerja (hanya ambil 20 dari 1500)
- Cek apakah query terlalu lambat
- Monitor load database

---

## 🔐 Security & Privacy

**⚠️ PENTING untuk Production:**

Console log yang menampilkan data sensitif harus dimatikan di production:

```typescript
// Tambahkan check environment
if (process.env.NODE_ENV === 'development') {
  console.log('🎯 [PERCETAKAN] Membuat Pesanan Baru');
  // ... log lainnya
}
```

**Data Sensitif yang harus dilindungi:**
- ID Pengguna
- Email pengguna
- Password/Token
- Data pembayaran
- Alamat lengkap

---

## 📝 Field Database Reference

**Tabel: `pesanan_cetak`**

| Field | Type | Keterangan |
|-------|------|-----------|
| id | text (UUID) | Primary key |
| idNaskah | text (UUID) | Foreign key ke naskah |
| idPemesan | text (UUID) | Foreign key ke pengguna (penulis) |
| idPercetakan | text (UUID) | Foreign key ke pengguna (percetakan) |
| nomorPesanan | text | Format: PO-YYYYMMDD-XXXX |
| jumlah | integer | Jumlah buku yang dicetak |
| judulSnapshot | text | **REQUIRED** - Snapshot judul naskah |
| formatSnapshot | text | **REQUIRED** - Snapshot format buku |
| jumlahHalamanSnapshot | integer | **REQUIRED** - Snapshot jumlah halaman |
| formatKertas | text | A5, A4, dll |
| jenisKertas | text | HVS, Art Paper, dll |
| jenisCover | text | Soft Cover, Hard Cover |
| finishingTambahan | text[] | Array of finishing options |
| catatan | text | Catatan tambahan |
| hargaTotal | numeric (Decimal) | Total harga pesanan |
| status | enum | tertunda, diterima, dalam_produksi, dll |
| **tanggalPesan** | timestamp | **FIELD UTAMA** untuk created date |
| estimasiSelesai | timestamp | Estimasi selesai produksi |
| tanggalSelesai | timestamp | Tanggal aktual selesai |
| diperbaruiPada | timestamp | Last updated timestamp |

**⚠️ CATATAN PENTING:**
- Gunakan `tanggalPesan` BUKAN `dibuatPada`
- Snapshot fields (`judulSnapshot`, `formatSnapshot`, `jumlahHalamanSnapshot`) adalah **REQUIRED**
- `hargaTotal` adalah Decimal, bukan Float
- `finishingTambahan` adalah Array, bisa null

---

## 🎯 Next Steps

1. **Pastikan console log berfungsi:**
   ```bash
   # Restart backend
   cd backend
   npm run start:dev
   
   # Akses dashboard percetakan
   # Perhatikan terminal backend
   ```

2. **Test semua fitur:**
   - Buat pesanan → Cek log `buatPesanan`
   - Update pesanan → Cek log `perbaruiPesanan`
   - Konfirmasi → Cek log `konfirmasiPesanan`
   - Buat pengiriman → Cek log `buatPengiriman`
   - Lihat statistik → Cek log `ambilStatistikPesanan`

3. **Monitor production (future):**
   - Gunakan proper logging library (Winston)
   - Log ke file/external service (Sentry, LogRocket)
   - Disable sensitive data logging

---

## ✅ Checklist

- [x] Console log ditambahkan di semua method utama
- [x] Error 500 fixed (field `dibuatPada` → `tanggalPesan`)
- [x] Invalid time value fixed (null check di frontend)
- [x] Types updated sesuai schema database
- [x] Snapshot fields added to PesananCetak interface
- [x] Documentation lengkap

## 📚 Related Files

- Backend Service: `backend/src/modules/percetakan/percetakan.service.ts`
- Backend Controller: `backend/src/modules/percetakan/percetakan.controller.ts`
- Frontend Types: `frontend/types/percetakan.ts`
- Frontend Page: `frontend/app/(dashboard)/dashboard/percetakan/page.tsx`
- Database Schema: `backend/prisma/schema.prisma`

---

**Last Updated:** 16 December 2025
