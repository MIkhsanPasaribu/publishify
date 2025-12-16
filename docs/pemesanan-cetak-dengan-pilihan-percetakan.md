# 📝 Dokumentasi Fitur Pemesanan Cetak dengan Pilihan Percetakan

## 🎯 Overview

Fitur ini memungkinkan penulis untuk:
1. **Melihat daftar percetakan** yang tersedia beserta tarif aktifnya
2. **Memilih percetakan** untuk mencetak naskah yang sudah diterbitkan
3. **Kalkulasi harga otomatis** berdasarkan tarif yang ditetapkan percetakan
4. **Validasi minimum pesanan** sesuai ketentuan percetakan

## 🏗️ Arsitektur

### Database Schema

```sql
-- Tabel Percetakan (menggunakan tabel pengguna dengan role percetakan)
CREATE TABLE pengguna (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  aktif BOOLEAN DEFAULT TRUE
);

CREATE TABLE peran_pengguna (
  id TEXT PRIMARY KEY,
  idPengguna TEXT NOT NULL REFERENCES pengguna(id),
  jenisPeran TEXT NOT NULL, -- 'percetakan'
  aktif BOOLEAN DEFAULT TRUE
);

-- Tabel Parameter Harga Percetakan (tarif)
CREATE TABLE parameter_harga_percetakan (
  id TEXT PRIMARY KEY,
  idPercetakan TEXT NOT NULL REFERENCES pengguna(id),
  namaKombinasi TEXT NOT NULL DEFAULT 'Tarif Default',
  deskripsi TEXT,
  
  -- Harga format kertas (per lembar)
  hargaKertasA4 DECIMAL(10,2) NOT NULL,
  hargaKertasA5 DECIMAL(10,2) NOT NULL,
  hargaKertasB5 DECIMAL(10,2) DEFAULT 0,
  
  -- Harga cover (per unit)
  hargaSoftcover DECIMAL(10,2) NOT NULL,
  hargaHardcover DECIMAL(10,2) NOT NULL,
  
  -- Biaya tambahan
  biayaJilid DECIMAL(10,2) NOT NULL,
  minimumPesanan INTEGER DEFAULT 1,
  
  -- Status - hanya 1 yang aktif per percetakan
  aktif BOOLEAN DEFAULT FALSE,
  
  UNIQUE(idPercetakan, namaKombinasi)
);

-- Tabel Pesanan Cetak
CREATE TABLE pesanan_cetak (
  id TEXT PRIMARY KEY,
  idNaskah TEXT NOT NULL REFERENCES naskah(id),
  idPemesan TEXT NOT NULL REFERENCES pengguna(id),
  idPercetakan TEXT REFERENCES pengguna(id), -- Percetakan yang dipilih
  
  nomorPesanan TEXT NOT NULL UNIQUE,
  jumlah INTEGER NOT NULL,
  
  -- Spesifikasi pesanan
  formatKertas TEXT NOT NULL, -- 'A4', 'A5', 'B5'
  jenisKertas TEXT NOT NULL, -- 'HVS', 'BOOKPAPER', 'ART_PAPER'
  jenisCover TEXT NOT NULL, -- 'SOFTCOVER', 'HARDCOVER'
  
  -- Harga (dikalkulasi otomatis)
  hargaTotal DECIMAL(10,2) NOT NULL,
  
  status TEXT DEFAULT 'tertunda',
  
  -- Snapshot data
  judulSnapshot TEXT NOT NULL,
  formatSnapshot TEXT NOT NULL,
  jumlahHalamanSnapshot INTEGER NOT NULL
);
```

### API Endpoints

#### 1. GET `/percetakan/daftar` - List Percetakan dengan Tarif

**Deskripsi**: Mengambil daftar semua percetakan aktif beserta tarif aktifnya.

**Auth**: Bearer Token (Role: `penulis`, `admin`)

**Response Success (200)**:
```json
{
  "sukses": true,
  "pesan": "Daftar percetakan berhasil diambil",
  "data": [
    {
      "id": "uuid-percetakan-1",
      "email": "percetakan.abc@example.com",
      "nama": "Percetakan ABC",
      "alamat": "Jl. Printing No. 123",
      "kota": "Jakarta",
      "provinsi": "DKI Jakarta",
      "tarifAktif": {
        "id": "uuid-tarif-1",
        "namaKombinasi": "Tarif Standar",
        "deskripsi": "Tarif standar untuk pesanan reguler",
        "hargaKertasA4": 500,
        "hargaKertasA5": 350,
        "hargaKertasB5": 400,
        "hargaSoftcover": 5000,
        "hargaHardcover": 15000,
        "biayaJilid": 3000,
        "minimumPesanan": 10
      }
    },
    {
      "id": "uuid-percetakan-2",
      "email": "percetakan.xyz@example.com",
      "nama": "Percetakan XYZ",
      "alamat": "Jl. Cetak No. 456",
      "kota": "Bandung",
      "provinsi": "Jawa Barat",
      "tarifAktif": {
        "id": "uuid-tarif-2",
        "namaKombinasi": "Tarif Premium",
        "deskripsi": "Tarif untuk kualitas premium",
        "hargaKertasA4": 600,
        "hargaKertasA5": 450,
        "hargaKertasB5": 500,
        "hargaSoftcover": 7000,
        "hargaHardcover": 20000,
        "biayaJilid": 4000,
        "minimumPesanan": 20
      }
    }
  ],
  "total": 2
}
```

**Use Case**:
```typescript
// Frontend - Ambil daftar percetakan
const response = await fetch('/api/percetakan/daftar', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const { data: percetakanList } = await response.json();

// Tampilkan dalam dropdown/card selection
percetakanList.forEach(percetakan => {
  console.log(`${percetakan.nama} - Min. ${percetakan.tarifAktif?.minimumPesanan} buku`);
});
```

---

#### 2. GET `/percetakan/tarif/:id` - Detail Tarif Percetakan

**Deskripsi**: Mengambil detail tarif aktif dari percetakan tertentu untuk kalkulasi harga.

**Auth**: Bearer Token (Role: `penulis`, `admin`)

**Parameters**:
- `id` (path): ID percetakan (UUID)

**Response Success (200)**:
```json
{
  "sukses": true,
  "pesan": "Tarif percetakan berhasil diambil",
  "data": {
    "percetakan": {
      "id": "uuid-percetakan",
      "nama": "Percetakan ABC"
    },
    "tarif": {
      "id": "uuid-tarif",
      "namaKombinasi": "Tarif Standar",
      "deskripsi": "Tarif standar untuk pesanan reguler",
      "hargaKertasA4": 500,
      "hargaKertasA5": 350,
      "hargaKertasB5": 400,
      "hargaSoftcover": 5000,
      "hargaHardcover": 15000,
      "biayaJilid": 3000,
      "minimumPesanan": 10
    }
  }
}
```

**Response Error (404)**:
```json
{
  "sukses": false,
  "pesan": "Percetakan tidak ditemukan atau tidak aktif",
  "error": {
    "timestamp": "2024-01-29T10:00:00Z"
  }
}
```

**Use Case**:
```typescript
// Frontend - Kalkulasi estimasi harga sebelum order
async function hitungEstimasiHarga(
  idPercetakan: string,
  formatKertas: string,
  jenisCover: string,
  jumlahHalaman: number,
  jumlahBuku: number
) {
  const response = await fetch(`/api/percetakan/tarif/${idPercetakan}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const { data } = await response.json();
  const tarif = data.tarif;
  
  // Hitung harga kertas
  let hargaKertas = 0;
  if (formatKertas === 'A4') hargaKertas = tarif.hargaKertasA4;
  else if (formatKertas === 'A5') hargaKertas = tarif.hargaKertasA5;
  else if (formatKertas === 'B5') hargaKertas = tarif.hargaKertasB5;
  
  // Hitung harga cover
  let hargaCover = 0;
  if (jenisCover === 'SOFTCOVER') hargaCover = tarif.hargaSoftcover;
  else if (jenisCover === 'HARDCOVER') hargaCover = tarif.hargaHardcover;
  
  // Rumus: (Harga Kertas * Jumlah Halaman + Harga Cover + Biaya Jilid) * Jumlah Buku
  const biayaPerUnit = hargaKertas * jumlahHalaman + hargaCover + tarif.biayaJilid;
  const totalHarga = biayaPerUnit * jumlahBuku;
  
  return {
    biayaPerUnit,
    totalHarga,
    minimumPesanan: tarif.minimumPesanan
  };
}
```

---

#### 3. POST `/percetakan/pesanan` - Buat Pesanan Cetak

**Deskripsi**: Membuat pesanan cetak baru dengan validasi percetakan dan kalkulasi harga otomatis.

**Auth**: Bearer Token (Role: `penulis`)

**Request Body**:
```json
{
  "idNaskah": "uuid-naskah",
  "idPercetakan": "uuid-percetakan",
  "jumlah": 100,
  "formatKertas": "A5",
  "jenisKertas": "HVS",
  "jenisCover": "SOFTCOVER",
  "finishingTambahan": ["Laminasi Glossy"],
  "catatan": "Mohon diproses dengan hati-hati",
  "alamatPengiriman": "Jl. Penulis No. 789, Jakarta Selatan 12345",
  "namaPenerima": "John Doe",
  "teleponPenerima": "081234567890"
}
```

**Validation Rules**:
```typescript
{
  idNaskah: UUID (required),
  idPercetakan: UUID (required),
  jumlah: integer > 0, max 10000 (required),
  formatKertas: 'A4' | 'A5' | 'B5' (required),
  jenisKertas: 'HVS' | 'BOOKPAPER' | 'ART_PAPER' (required),
  jenisCover: 'SOFTCOVER' | 'HARDCOVER' (required),
  finishingTambahan: array (optional),
  catatan: string max 1000 chars (optional),
  alamatPengiriman: string min 10 chars (required),
  namaPenerima: string min 3 chars (required),
  teleponPenerima: string min 8 chars (required)
}
```

**Response Success (201)**:
```json
{
  "sukses": true,
  "pesan": "Pesanan cetak berhasil dibuat",
  "data": {
    "id": "uuid-pesanan",
    "nomorPesanan": "PO-20240129-1234",
    "idNaskah": "uuid-naskah",
    "idPemesan": "uuid-penulis",
    "idPercetakan": "uuid-percetakan",
    "jumlah": 100,
    "formatKertas": "A5",
    "jenisKertas": "HVS",
    "jenisCover": "SOFTCOVER",
    "hargaTotal": "3850000",
    "status": "tertunda",
    "tanggalPesan": "2024-01-29T10:00:00Z",
    "naskah": {
      "id": "uuid-naskah",
      "judul": "Judul Naskah",
      "jumlahHalaman": 200
    },
    "pemesan": {
      "id": "uuid-penulis",
      "email": "penulis@example.com",
      "profilPengguna": {
        "namaDepan": "John",
        "namaBelakang": "Doe"
      }
    },
    "pengiriman": {
      "id": "uuid-pengiriman",
      "alamatTujuan": "Jl. Penulis No. 789, Jakarta Selatan 12345",
      "namaPenerima": "John Doe",
      "teleponPenerima": "081234567890",
      "status": "diproses"
    }
  }
}
```

**Response Error (400) - Validation Failed**:
```json
{
  "sukses": false,
  "pesan": "Jumlah pesanan minimal 10 eksemplar",
  "error": {
    "timestamp": "2024-01-29T10:00:00Z"
  }
}
```

**Response Error (403) - Forbidden**:
```json
{
  "sukses": false,
  "pesan": "Anda hanya dapat memesan cetak untuk naskah Anda sendiri",
  "error": {
    "timestamp": "2024-01-29T10:00:00Z"
  }
}
```

**Response Error (404) - Not Found**:
```json
{
  "sukses": false,
  "pesan": "Naskah tidak ditemukan",
  "error": {
    "timestamp": "2024-01-29T10:00:00Z"
  }
}
```

---

## 📊 Business Logic

### Validasi Pesanan

Backend akan melakukan validasi berikut secara berurutan:

1. **Validasi Naskah**
   - Naskah harus exists di database
   - Status naskah harus `diterbitkan`
   - Pemesan harus pemilik naskah (validasi ownership)

2. **Validasi Percetakan**
   - Percetakan harus exists dan aktif
   - Percetakan harus memiliki role `percetakan`
   - Percetakan harus memiliki tarif aktif

3. **Validasi Jumlah Pesanan**
   - Jumlah harus >= minimum pesanan yang ditetapkan percetakan
   - Contoh: Jika min. 10 buku, tidak boleh order 5 buku

### Kalkulasi Harga Otomatis

```typescript
// Pseudocode kalkulasi harga
function hitungHargaTotal(
  tarif: Tarif,
  formatKertas: string,
  jenisCover: string,
  jumlahHalaman: number,
  jumlahBuku: number
): number {
  // 1. Tentukan harga kertas per lembar berdasarkan format
  let hargaKertasPerLembar = 0;
  switch (formatKertas) {
    case 'A4': hargaKertasPerLembar = tarif.hargaKertasA4; break;
    case 'A5': hargaKertasPerLembar = tarif.hargaKertasA5; break;
    case 'B5': hargaKertasPerLembar = tarif.hargaKertasB5; break;
  }
  
  // 2. Tentukan harga cover berdasarkan jenis
  let hargaCoverPerUnit = 0;
  switch (jenisCover) {
    case 'SOFTCOVER': hargaCoverPerUnit = tarif.hargaSoftcover; break;
    case 'HARDCOVER': hargaCoverPerUnit = tarif.hargaHardcover; break;
  }
  
  // 3. Ambil biaya jilid
  const hargaJilid = tarif.biayaJilid;
  
  // 4. Hitung biaya per unit buku
  const biayaPerUnit = (hargaKertasPerLembar * jumlahHalaman) + hargaCoverPerUnit + hargaJilid;
  
  // 5. Kalikan dengan jumlah buku yang dipesan
  const totalHarga = biayaPerUnit * jumlahBuku;
  
  return totalHarga;
}
```

**Contoh Kalkulasi Riil**:

```
Tarif Percetakan ABC:
- Harga Kertas A5: Rp 350/lembar
- Harga Softcover: Rp 5.000/unit
- Biaya Jilid: Rp 3.000/unit
- Minimum Pesanan: 10 buku

Pesanan:
- Format: A5
- Cover: Softcover
- Jumlah Halaman: 200
- Jumlah Buku: 100

Kalkulasi:
1. Biaya Kertas = 350 × 200 = Rp 70.000
2. Biaya Cover = Rp 5.000
3. Biaya Jilid = Rp 3.000
4. Biaya Per Unit = 70.000 + 5.000 + 3.000 = Rp 78.000
5. Total Harga = 78.000 × 100 = Rp 7.800.000
```

---

## 🔐 Authorization & Access Control

### Role-Based Access

| Endpoint | Penulis | Percetakan | Admin |
|----------|---------|------------|-------|
| GET `/percetakan/daftar` | ✅ | ❌ | ✅ |
| GET `/percetakan/tarif/:id` | ✅ | ❌ | ✅ |
| POST `/percetakan/pesanan` | ✅ | ❌ | ❌ |

### Ownership Validation

- Penulis hanya bisa membuat pesanan untuk **naskahnya sendiri**
- Validasi dilakukan dengan mencocokkan `naskah.idPenulis === user.id`
- Jika tidak cocok, return `403 Forbidden`

---

## 🎨 Frontend Implementation Guide

### 1. Komponen Pilihan Percetakan

```tsx
// components/forms/pilih-percetakan.tsx
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Percetakan {
  id: string;
  nama: string;
  alamat: string;
  kota: string;
  tarifAktif: {
    namaKombinasi: string;
    minimumPesanan: number;
    hargaKertasA5: number;
    hargaSoftcover: number;
  } | null;
}

export function PilihPercetakan({ 
  onSelect 
}: { 
  onSelect: (id: string) => void 
}) {
  const [percetakanList, setPercetakanList] = useState<Percetakan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    ambilDaftarPercetakan();
  }, []);

  const ambilDaftarPercetakan = async () => {
    try {
      const res = await fetch('/api/percetakan/daftar', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const { data } = await res.json();
      setPercetakanList(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (id: string) => {
    setSelected(id);
    onSelect(id);
  };

  if (loading) return <div>Memuat percetakan...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {percetakanList.map((p) => (
        <Card 
          key={p.id}
          className={`cursor-pointer hover:shadow-lg transition-shadow ${
            selected === p.id ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => handleSelect(p.id)}
        >
          <CardHeader>
            <CardTitle className="flex justify-between items-start">
              <span>{p.nama}</span>
              {p.tarifAktif && (
                <Badge variant="secondary">
                  Min. {p.tarifAktif.minimumPesanan} buku
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {p.alamat}, {p.kota}
            </p>
            {p.tarifAktif && (
              <div className="mt-3 space-y-1 text-sm">
                <p><strong>Tarif:</strong> {p.tarifAktif.namaKombinasi}</p>
                <p><strong>Kertas A5:</strong> Rp {p.tarifAktif.hargaKertasA5.toLocaleString()}/lembar</p>
                <p><strong>Softcover:</strong> Rp {p.tarifAktif.hargaSoftcover.toLocaleString()}/unit</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

### 2. Form Pemesanan Cetak

```tsx
// components/forms/form-pesanan-cetak.tsx
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PilihPercetakan } from './pilih-percetakan';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const formSchema = z.object({
  idNaskah: z.string().uuid(),
  idPercetakan: z.string().uuid(),
  jumlah: z.number().min(1).max(10000),
  formatKertas: z.enum(['A4', 'A5', 'B5']),
  jenisKertas: z.enum(['HVS', 'BOOKPAPER', 'ART_PAPER']),
  jenisCover: z.enum(['SOFTCOVER', 'HARDCOVER']),
  alamatPengiriman: z.string().min(10),
  namaPenerima: z.string().min(3),
  teleponPenerima: z.string().min(8),
});

export function FormPesananCetak({ 
  idNaskah, 
  onSuccess 
}: { 
  idNaskah: string;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [estimasiHarga, setEstimasiHarga] = useState<number>(0);
  const [minimumPesanan, setMinimumPesanan] = useState<number>(1);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      idNaskah,
      idPercetakan: '',
      jumlah: 10,
      formatKertas: 'A5' as const,
      jenisKertas: 'HVS' as const,
      jenisCover: 'SOFTCOVER' as const,
    }
  });

  const watchedFields = form.watch();

  // Auto-kalkulasi estimasi harga saat ada perubahan
  useEffect(() => {
    if (watchedFields.idPercetakan) {
      hitungEstimasiHarga();
    }
  }, [
    watchedFields.idPercetakan,
    watchedFields.formatKertas,
    watchedFields.jenisCover,
    watchedFields.jumlah
  ]);

  const hitungEstimasiHarga = async () => {
    try {
      const res = await fetch(
        `/api/percetakan/tarif/${watchedFields.idPercetakan}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      const { data } = await res.json();
      const tarif = data.tarif;

      setMinimumPesanan(tarif.minimumPesanan);

      // Hitung estimasi (asumsi 200 halaman)
      let hargaKertas = 0;
      if (watchedFields.formatKertas === 'A4') hargaKertas = tarif.hargaKertasA4;
      else if (watchedFields.formatKertas === 'A5') hargaKertas = tarif.hargaKertasA5;
      else if (watchedFields.formatKertas === 'B5') hargaKertas = tarif.hargaKertasB5;

      let hargaCover = 0;
      if (watchedFields.jenisCover === 'SOFTCOVER') hargaCover = tarif.hargaSoftcover;
      else if (watchedFields.jenisCover === 'HARDCOVER') hargaCover = tarif.hargaHardcover;

      const biayaPerUnit = (hargaKertas * 200) + hargaCover + tarif.biayaJilid;
      const total = biayaPerUnit * watchedFields.jumlah;

      setEstimasiHarga(total);
    } catch (error) {
      console.error('Error kalkulasi:', error);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (values.jumlah < minimumPesanan) {
      toast.error(`Jumlah minimal pesanan ${minimumPesanan} buku`);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/percetakan/pesanan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(values)
      });

      const result = await res.json();

      if (result.sukses) {
        toast.success('Pesanan berhasil dibuat!');
        onSuccess();
      } else {
        toast.error(result.pesan);
      }
    } catch (error) {
      toast.error('Terjadi kesalahan saat membuat pesanan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h3 className="font-semibold mb-3">Pilih Percetakan</h3>
        <PilihPercetakan 
          onSelect={(id) => form.setValue('idPercetakan', id)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label>Format Kertas</label>
          <select {...form.register('formatKertas')} className="w-full">
            <option value="A4">A4</option>
            <option value="A5">A5</option>
            <option value="B5">B5</option>
          </select>
        </div>

        <div>
          <label>Jenis Cover</label>
          <select {...form.register('jenisCover')} className="w-full">
            <option value="SOFTCOVER">Softcover</option>
            <option value="HARDCOVER">Hardcover</option>
          </select>
        </div>
      </div>

      <div>
        <label>Jumlah Buku (Min. {minimumPesanan})</label>
        <Input 
          type="number" 
          min={minimumPesanan}
          {...form.register('jumlah', { valueAsNumber: true })}
        />
      </div>

      {estimasiHarga > 0 && (
        <div className="bg-muted p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">Estimasi Total</p>
          <p className="text-2xl font-bold">
            Rp {estimasiHarga.toLocaleString()}
          </p>
        </div>
      )}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Memproses...' : 'Buat Pesanan'}
      </Button>
    </form>
  );
}
```

---

## 🧪 Testing Guide

### Manual Testing Steps

**1. Test List Percetakan**
```bash
curl -X GET http://localhost:4000/api/percetakan/daftar \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected**: List semua percetakan dengan tarif aktif

**2. Test Get Tarif**
```bash
curl -X GET http://localhost:4000/api/percetakan/tarif/UUID_PERCETAKAN \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected**: Detail tarif percetakan tertentu

**3. Test Buat Pesanan - Success**
```bash
curl -X POST http://localhost:4000/api/percetakan/pesanan \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer PENULIS_TOKEN" \
  -d '{
    "idNaskah": "uuid-naskah-diterbitkan",
    "idPercetakan": "uuid-percetakan-aktif",
    "jumlah": 100,
    "formatKertas": "A5",
    "jenisKertas": "HVS",
    "jenisCover": "SOFTCOVER",
    "alamatPengiriman": "Jl. Test No. 123",
    "namaPenerima": "John Doe",
    "teleponPenerima": "081234567890"
  }'
```

**Expected**: Pesanan dibuat, harga dikalkulasi otomatis

**4. Test Validasi Minimum Pesanan - Error**
```bash
curl -X POST http://localhost:4000/api/percetakan/pesanan \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer PENULIS_TOKEN" \
  -d '{
    "idNaskah": "uuid-naskah",
    "idPercetakan": "uuid-percetakan",
    "jumlah": 5,
    ...
  }'
```

**Expected**: Error "Jumlah pesanan minimal X eksemplar"

**5. Test Validasi Ownership - Error**
```bash
# Login sebagai Penulis A
# Coba order naskah milik Penulis B
```

**Expected**: Error "Anda hanya dapat memesan cetak untuk naskah Anda sendiri"

---

## 📈 Performance Considerations

### Database Indexing

```sql
-- Index untuk query list percetakan
CREATE INDEX idx_peran_pengguna_jenis_aktif 
ON peran_pengguna(jenisPeran, aktif);

-- Index untuk query tarif aktif
CREATE INDEX idx_parameter_harga_percetakan_aktif 
ON parameter_harga_percetakan(idPercetakan, aktif);

-- Index untuk query pesanan per percetakan
CREATE INDEX idx_pesanan_cetak_percetakan_status 
ON pesanan_cetak(idPercetakan, status);
```

### Caching Strategy

```typescript
// Gunakan Redis untuk cache daftar percetakan (TTL: 5 menit)
const CACHE_KEY_PERCETAKAN = 'percetakan:daftar';
const CACHE_TTL = 300; // 5 menit

async function ambilDaftarPercetakan() {
  // Check cache first
  const cached = await redis.get(CACHE_KEY_PERCETAKAN);
  if (cached) return JSON.parse(cached);

  // Query database
  const percetakan = await prisma.pengguna.findMany({ ... });

  // Save to cache
  await redis.setex(CACHE_KEY_PERCETAKAN, CACHE_TTL, JSON.stringify(percetakan));

  return percetakan;
}
```

---

## 🔄 Workflow Diagram

```
┌─────────────┐
│   Penulis   │
└──────┬──────┘
       │
       │ 1. GET /percetakan/daftar
       ↓
┌─────────────────────────┐
│  List Percetakan +     │
│  Tarif Aktif           │
└──────┬──────────────────┘
       │
       │ 2. Pilih Percetakan
       │ 3. GET /percetakan/tarif/:id
       ↓
┌─────────────────────────┐
│  Detail Tarif          │
│  + Kalkulasi Estimasi  │
└──────┬──────────────────┘
       │
       │ 4. Isi form pesanan
       │ 5. POST /percetakan/pesanan
       ↓
┌─────────────────────────┐
│  Validasi Backend:     │
│  - Naskah diterbitkan? │
│  - Percetakan aktif?   │
│  - Jumlah >= minimum?  │
│  - Ownership valid?    │
└──────┬──────────────────┘
       │
       ├─ ✅ Valid
       │  └─> Kalkulasi Harga
       │      └─> Buat Pesanan
       │          └─> Return Success
       │
       └─ ❌ Invalid
          └─> Return Error
```

---

## 📝 Notes & Best Practices

### Backend
1. **Selalu validasi ownership** sebelum membuat pesanan
2. **Gunakan transaction** untuk create pesanan + pengiriman
3. **Log semua aktivitas** pemesanan untuk audit trail
4. **Validasi tarif aktif exists** sebelum kalkulasi harga

### Frontend
1. **Auto-kalkulasi estimasi** saat user mengubah spesifikasi
2. **Tampilkan minimum pesanan** secara jelas
3. **Disable submit button** jika jumlah < minimum
4. **Loading state** saat fetch percetakan dan tarif
5. **Error handling** yang user-friendly

### Security
1. **Bearer token** wajib untuk semua endpoint
2. **Role-based access control** di middleware
3. **Ownership validation** di service layer
4. **Input sanitization** untuk field text

---

## 🆕 Changelog

### Version 1.0.0 (2024-01-29)

**Added**:
- ✅ Endpoint GET `/percetakan/daftar` untuk list percetakan
- ✅ Endpoint GET `/percetakan/tarif/:id` untuk detail tarif
- ✅ Update endpoint POST `/percetakan/pesanan` dengan pilihan percetakan
- ✅ Kalkulasi harga otomatis berdasarkan tarif
- ✅ Validasi minimum pesanan
- ✅ Validasi ownership naskah

**Changed**:
- 🔄 BuatPesananDto: Tambah field `idPercetakan`, hapus `hargaTotal`
- 🔄 Enum formatKertas: Hanya A4, A5, B5 (hapus Letter, Custom)
- 🔄 Enum jenisKertas: Sesuai database (HVS, BOOKPAPER, ART_PAPER)
- 🔄 Enum jenisCover: Sesuai database (SOFTCOVER, HARDCOVER)

**Fixed**:
- 🐛 Type compatibility antara DTO dan Zod schema
- 🐛 Query profil pengguna di service percetakan

---

## 🤝 Contributing

Untuk menambahkan feature atau fix bug terkait pemesanan cetak:

1. Fork repository
2. Buat branch baru: `git checkout -b feature/nama-feature`
3. Commit changes: `git commit -m 'feat: tambah fitur X'`
4. Push ke branch: `git push origin feature/nama-feature`
5. Buat Pull Request

---

## 📞 Support

Jika ada pertanyaan atau issue:
- Email: support@publishify.com
- Slack: #team-backend
- Issue Tracker: GitHub Issues
