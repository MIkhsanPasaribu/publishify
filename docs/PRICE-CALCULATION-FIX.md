# Fix Perhitungan Harga Pesanan Cetak

## 🐛 Masalah yang Ditemukan

**Screenshot User**: Menunjukkan Total Harga **Rp 432.004.800.672.000** (432 triliun) yang jelas tidak masuk akal.

Breakdown yang ditampilkan:
- Kertas: Rp 45.000
- Cover: Rp 5.000  
- Jilid: Rp 7.000
- **Total: Rp 432 TRILIUN** ❌

## 🔍 Root Cause Analysis

### 1. **Prisma Decimal to JSON Serialization**

Backend menggunakan PostgreSQL `Decimal` type untuk harga, yang di-serialize Prisma sebagai **string dalam JSON**, bukan number.

```typescript
// Database: Decimal(10, 2)
hargaKertasA4: Decimal

// JSON Response dari Prisma (PROBLEM!):
{
  "hargaKertasA4": "150.00" // String!
}
```

### 2. **Frontend String Multiplication**

Saat frontend melakukan perhitungan dengan string yang terlihat seperti number:

```typescript
// BUG: String multiplication!
const biayaKertas = "150" * 100; // JavaScript coercion
// Result: 15000 (masih OK)

// Tapi operasi berikutnya:
const total = biayaKertas * jumlahBuku;
// Jika tipe tidak konsisten → hasil astronomis
```

### 3. **Type Confusion**

Variable naming di `useKalkulasiHarga` juga ambigu:

```typescript
// SEBELUM (CONFUSING):
const biayaKertas = hargaKertasPerLembar * jumlahHalaman;
// ^ Ini sebenarnya per-unit, tapi namanya seperti total

breakdown: [
  { label: "Kertas", nilai: biayaKertas } // Misleading
]
```

## ✅ Solusi yang Diterapkan

### 1. **Backend: Convert Decimal to Number**

File: `backend/src/modules/percetakan/percetakan.service.ts`

#### Endpoint: `ambilTarifPercetakan()`

```typescript
// Transform Decimal to number untuk frontend
return {
  sukses: true,
  pesan: 'Tarif percetakan berhasil diambil',
  data: {
    percetakan: { id, nama },
    tarif: {
      ...tarifAktif,
      hargaKertasA4: tarifAktif.hargaKertasA4 ? Number(tarifAktif.hargaKertasA4) : 0,
      hargaKertasA5: tarifAktif.hargaKertasA5 ? Number(tarifAktif.hargaKertasA5) : 0,
      hargaKertasB5: tarifAktif.hargaKertasB5 ? Number(tarifAktif.hargaKertasB5) : 0,
      hargaSoftcover: tarifAktif.hargaSoftcover ? Number(tarifAktif.hargaSoftcover) : 0,
      hargaHardcover: tarifAktif.hargaHardcover ? Number(tarifAktif.hargaHardcover) : 0,
      biayaJilid: tarifAktif.biayaJilid ? Number(tarifAktif.biayaJilid) : 0,
    },
  },
};
```

#### Endpoint: `ambilDaftarPercetakan()`

```typescript
data: daftarPercetakan.map((p) => {
  const tarif = p.parameterHarga[0];
  return {
    // ...other fields
    tarifAktif: tarif ? {
      ...tarif,
      hargaKertasA4: tarif.hargaKertasA4 ? Number(tarif.hargaKertasA4) : 0,
      hargaKertasA5: tarif.hargaKertasA5 ? Number(tarif.hargaKertasA5) : 0,
      hargaKertasB5: tarif.hargaKertasB5 ? Number(tarif.hargaKertasB5) : 0,
      hargaSoftcover: tarif.hargaSoftcover ? Number(tarif.hargaSoftcover) : 0,
      hargaHardcover: tarif.hargaHardcover ? Number(tarif.hargaHardcover) : 0,
      biayaJilid: tarif.biayaJilid ? Number(tarif.biayaJilid) : 0,
    } : null,
  };
}),
```

### 2. **Frontend: Explicit Number Conversion**

File: `frontend/lib/hooks/use-kalkulasi-harga.ts`

#### Safety Number Conversion

```typescript
// 1. Hitung biaya kertas per lembar (convert ke number untuk safety)
let hargaKertasPerLembar = 0;
switch (formatKertas) {
  case "A4":
    hargaKertasPerLembar = Number(tarif.hargaKertasA4) || 0;
    break;
  case "A5":
    hargaKertasPerLembar = Number(tarif.hargaKertasA5) || 0;
    break;
  case "B5":
    hargaKertasPerLembar = Number(tarif.hargaKertasB5) || 0;
    break;
}

// 2. Hitung biaya cover per unit (convert ke number untuk safety)
let hargaCoverPerUnit = 0;
switch (jenisCover) {
  case "SOFTCOVER":
    hargaCoverPerUnit = Number(tarif.hargaSoftcover) || 0;
    break;
  case "HARDCOVER":
    hargaCoverPerUnit = Number(tarif.hargaHardcover) || 0;
    break;
}

// 3. Biaya jilid (convert ke number untuk safety)
const hargaJilid = Number(tarif.biayaJilid) || 0;
```

#### Clear Variable Naming

```typescript
// 4. Hitung total per unit
const biayaKertasPerUnit = hargaKertasPerLembar * jumlahHalaman;
const biayaCoverPerUnit = hargaCoverPerUnit;
const biayaJilidPerUnit = hargaJilid;
const biayaPerUnit = biayaKertasPerUnit + biayaCoverPerUnit + biayaJilidPerUnit;

// 5. Hitung total untuk semua buku
const totalBiayaKertas = biayaKertasPerUnit * jumlahBuku;
const totalBiayaCover = biayaCoverPerUnit * jumlahBuku;
const totalBiayaJilid = biayaJilidPerUnit * jumlahBuku;
const totalHarga = biayaPerUnit * jumlahBuku;

setEstimasi({
  biayaKertas: totalBiayaKertas,
  biayaCover: totalBiayaCover,
  biayaJilid: totalBiayaJilid,
  biayaPerUnit,
  totalHarga,
  breakdown: [
    { 
      label: `Kertas (${jumlahHalaman} hal × ${jumlahBuku} buku)`, 
      nilai: totalBiayaKertas 
    },
    { 
      label: `Cover (${jumlahBuku} buku)`, 
      nilai: totalBiayaCover 
    },
    { 
      label: `Jilid (${jumlahBuku} buku)`, 
      nilai: totalBiayaJilid 
    },
  ],
});
```

## 🧪 Testing Checklist

### Test Case 1: Basic Calculation

**Input:**
- Percetakan: CV Maju Jaya Printing
- Format: A5 (Rp 150/lembar)
- Cover: Softcover (Rp 5.000)
- Jilid: Rp 7.000
- Jumlah Halaman: 100
- Jumlah Buku: 10

**Expected Output:**
```
Kertas (100 hal × 10 buku): Rp 150.000
  Calculation: 150 × 100 × 10 = 150.000

Cover (10 buku): Rp 50.000
  Calculation: 5.000 × 10 = 50.000

Jilid (10 buku): Rp 70.000
  Calculation: 7.000 × 10 = 70.000

TOTAL: Rp 270.000 ✅
```

### Test Case 2: Large Order

**Input:**
- Format: A4 (Rp 200/lembar)
- Cover: Hardcover (Rp 15.000)
- Jilid: Rp 10.000
- Jumlah Halaman: 200
- Jumlah Buku: 100

**Expected Output:**
```
Kertas: Rp 4.000.000 (200 × 200 × 100)
Cover: Rp 1.500.000 (15.000 × 100)
Jilid: Rp 1.000.000 (10.000 × 100)

TOTAL: Rp 6.500.000 ✅
```

### Test Case 3: Minimum Order

**Input:**
- Format: A5
- Cover: Softcover
- Jumlah Buku: 4 (kurang dari minimum 5)

**Expected Behavior:**
- Show alert: "Jumlah minimal pesanan adalah 5 buku"
- Disable submit button
- Calculate price correctly anyway

## 📝 Verification Steps

1. **Backend Logs Check**
   ```bash
   # Terminal output harus menunjukkan:
   🏭 [PERCETAKAN] Mengambil Tarif Percetakan
   ✅ Tarif ditemukan: [nama kombinasi]
   ```

2. **Frontend Console Check**
   ```javascript
   // Di browser DevTools Console
   // Periksa response dari API:
   console.log(typeof tarif.hargaKertasA4); // Harus: "number"
   console.log(tarif.hargaKertasA4); // Harus: 150 (bukan "150")
   ```

3. **UI Verification**
   - [ ] Total harga dalam range wajar (ribuan - jutaan, bukan triliun)
   - [ ] Breakdown labels jelas: "Kertas (100 hal × 10 buku)"
   - [ ] Changing jumlah buku → total updates correctly
   - [ ] Changing format → price recalculates
   - [ ] Minimum order validation works

## 🚀 Deployment Steps

1. **Backend Changes**
   ```bash
   cd backend
   npm run start:dev  # Test di development
   # Jika OK:
   npm run build
   npm run start:prod
   ```

2. **Frontend Changes**
   ```bash
   cd frontend
   npm run dev  # Test di development
   # Jika OK:
   npm run build
   npm start
   ```

3. **Database Migration** (Tidak diperlukan - tidak ada schema changes)

## 📊 Before vs After

### Before Fix ❌

```
Backend Response:
{
  "hargaKertasA5": "150.00",  // String!
  "hargaSoftcover": "5000.00"
}

Frontend Calculation:
"150.00" * 100 * 10 → Bug → 432 TRILIUN

UI Display:
Total Harga: Rp 432.004.800.672.000 ❌
```

### After Fix ✅

```
Backend Response:
{
  "hargaKertasA5": 150,  // Number!
  "hargaSoftcover": 5000
}

Frontend Calculation:
150 × 100 × 10 = 150.000
5.000 × 10 = 50.000
7.000 × 10 = 70.000
Total: 270.000 ✅

UI Display:
Kertas (100 hal × 10 buku): Rp 150.000
Cover (10 buku): Rp 50.000
Jilid (10 buku): Rp 70.000
Total Harga: Rp 270.000 ✅
```

## 🔒 Type Safety Improvements

### TypeScript Types

File: `frontend/types/tarif.ts`

```typescript
export interface ParameterHarga {
  id: string;
  namaKombinasi: string;
  deskripsi?: string;
  hargaKertasA4: number;  // Explicitly number
  hargaKertasA5: number;
  hargaKertasB5: number;
  hargaSoftcover: number;
  hargaHardcover: number;
  biayaJilid: number;
  minimumPesanan: number;
  aktif: boolean;
  dibuatPada?: string;
  diperbaruiPada?: string;
}
```

### Runtime Validation

```typescript
// Both backend transform AND frontend safety conversion
// Double protection against type issues
Number(value) || 0
```

## 📚 Lessons Learned

1. **Prisma Decimal Serialization**: Selalu convert Decimal ke Number di backend sebelum send ke frontend
2. **Type Safety**: TypeScript types saja tidak cukup - runtime validation tetap penting
3. **Explicit Conversion**: Jangan andalkan JavaScript type coercion - selalu explicit `Number()`
4. **Clear Naming**: Variable naming harus jelas (per-unit vs total)
5. **Descriptive Labels**: UI breakdown harus menunjukkan quantity untuk clarity

## 🎯 Status

- ✅ Backend: Transform Decimal → Number di 2 endpoints
- ✅ Frontend: Explicit Number() conversion di hook
- ✅ Frontend: Clear variable naming (per-unit vs total)
- ✅ Frontend: Descriptive breakdown labels
- ⏳ Testing: Pending verification di browser
- ⏳ Deployment: Ready for production after testing

## 📞 Next Steps

1. Test di browser dengan real data
2. Verify calculation dengan multiple scenarios
3. Check browser console for any warnings
4. Production deployment jika OK
