# Dokumentasi: Filter Editor di Antrian Review

## 📋 Overview

Perubahan pada halaman **Antrian Review** untuk memastikan bahwa sistem mengambil data editor dari tabel `peran_pengguna` dengan `jenisPeran = 'editor'`.

## 🔧 Perubahan yang Dilakukan

### 1. Frontend - Antrian Review Page

**File**: `frontend/app/(dashboard)/dashboard/admin/antrian-review/page.tsx`

#### A. Update Interface Editor

**SEBELUM**:
```typescript
interface Editor {
  id: string;
  email: string;
  profilPengguna?: {
    namaDepan?: string;
    namaBelakang?: string;
  };
}
```

**SESUDAH**:
```typescript
interface Editor {
  id: string;
  email: string;
  telepon?: string;
  aktif: boolean;
  terverifikasi: boolean;
  profilPengguna?: {
    namaDepan?: string;
    namaBelakang?: string;
    namaTampilan?: string;
    urlAvatar?: string;
  };
  peranPengguna: Array<{
    jenisPeran: "penulis" | "editor" | "percetakan" | "admin";
  }>;
}
```

#### B. Update Fetch Editor Logic

**SEBELUM**:
```typescript
// Fetch semua user, lalu filter di client-side
const editorResponse = await api.get("/pengguna", {
  params: {
    limit: 100,
  },
});

const allUsers = editorResponse.data?.data || [];
const editors = allUsers.filter((user: any) => 
  user.peranPengguna?.some((peran: any) => 
    peran.jenisPeran === "editor" && peran.aktif
  )
);
```

**SESUDAH**:
```typescript
// Fetch editor langsung dengan filter backend
const editorResponse = await api.get("/pengguna", {
  params: {
    limit: 100,
    peran: "editor", // Filter langsung dari backend berdasarkan tabel peran_pengguna
  },
});

const editors = editorResponse.data?.data || [];
```

### 2. Backend - Sudah Support Filter Peran

**File**: `backend/src/modules/pengguna/pengguna.service.ts`

Backend sudah memiliki logic untuk filter berdasarkan `peran`:

```typescript
// Role filter
if (peran) {
  where.peranPengguna = {
    some: {
      jenisPeran: peran as JenisPeran,
      aktif: true,
    },
  };
}
```

Dan sudah include relasi `peranPengguna`:

```typescript
select: {
  // ... fields lain
  peranPengguna: {
    where: { aktif: true },
    select: {
      jenisPeran: true,
    },
  },
}
```

**File**: `backend/src/modules/pengguna/dto/filter-pengguna.dto.ts`

Filter schema sudah mendukung:

```typescript
peran: z.enum(['penulis', 'editor', 'percetakan', 'admin']).optional(),
```

## 🔍 Cara Kerja

### Query Flow

1. **Frontend** memanggil API:
   ```
   GET /api/pengguna?limit=100&peran=editor
   ```

2. **Backend** memproses:
   - Prisma query dengan where clause:
     ```typescript
     where: {
       peranPengguna: {
         some: {
           jenisPeran: 'editor',
           aktif: true
         }
       }
     }
     ```

3. **Database** (PostgreSQL):
   - Query JOIN ke tabel `peran_pengguna`
   - Filter user yang punya relasi dengan `jenis_peran = 'editor'` dan `aktif = true`

4. **Response** dikembalikan:
   ```json
   {
     "sukses": true,
     "pesan": "Data pengguna berhasil diambil",
     "data": [
       {
         "id": "uuid",
         "email": "editor@example.com",
         "profilPengguna": {
           "namaDepan": "Editor",
           "namaBelakang": "Satu"
         },
         "peranPengguna": [
           {
             "jenisPeran": "editor"
           }
         ]
       }
     ],
     "metadata": {
       "total": 5,
       "halaman": 1,
       "limit": 100,
       "totalHalaman": 1
     }
   }
   ```

## ✅ Keuntungan Perubahan

1. **Performa Lebih Baik**: 
   - Filter dilakukan di database level
   - Tidak perlu fetch semua user lalu filter di client

2. **Konsistensi Data**:
   - Menggunakan tabel `peran_pengguna` sebagai single source of truth
   - Memastikan hanya editor aktif yang ditampilkan

3. **Scalability**:
   - Saat jumlah user bertambah, tidak perlu fetch semua data
   - Backend pagination berfungsi optimal

4. **Code Quality**:
   - Frontend code lebih clean dan simple
   - Memanfaatkan backend filter yang sudah ada

## 🧪 Testing

### Test Case 1: Editor Tersedia

**Precondition**: Ada user dengan `peranPengguna.jenisPeran = 'editor'`

**Steps**:
1. Login sebagai admin
2. Buka menu "Antrian Review"
3. Klik "Tugaskan Editor" pada salah satu naskah
4. Lihat dropdown editor

**Expected Result**: 
- Dropdown menampilkan daftar editor
- Nama editor ditampilkan (namaDepan + namaBelakang atau email)

### Test Case 2: Tidak Ada Editor

**Precondition**: Tidak ada user dengan role editor

**Steps**:
1. Login sebagai admin
2. Buka menu "Antrian Review"
3. Klik "Tugaskan Editor"

**Expected Result**: 
- Dropdown menampilkan "Tidak ada editor tersedia"

### Test Case 3: Filter Editor Aktif

**Precondition**: 
- Ada editor dengan `aktif = true`
- Ada editor dengan `aktif = false`

**Steps**:
1. Buka Antrian Review
2. Klik "Tugaskan Editor"

**Expected Result**: 
- Hanya editor dengan `aktif = true` yang muncul

## 📊 Database Query Example

```sql
-- Query yang dijalankan oleh Prisma
SELECT 
  p.id,
  p.email,
  p.telepon,
  p.aktif,
  p.terverifikasi,
  pp.nama_depan,
  pp.nama_belakang,
  pp.nama_tampilan,
  pp.url_avatar,
  pr.jenis_peran
FROM pengguna p
LEFT JOIN profil_pengguna pp ON pp.id_pengguna = p.id
LEFT JOIN peran_pengguna pr ON pr.id_pengguna = p.id
WHERE pr.jenis_peran = 'editor'
  AND pr.aktif = true
LIMIT 100;
```

## 🔐 Authorization

- Endpoint `/api/pengguna` memerlukan:
  - JWT token valid
  - Role `admin`
  
- Guard yang digunakan:
  - `JwtAuthGuard`: Validasi token
  - `PeranGuard`: Validasi role admin

## 📝 Notes

1. **Limit Default**: 100 editor (bisa disesuaikan jika diperlukan)
2. **Cache**: Tidak ada cache untuk list editor (selalu real-time)
3. **Sorting**: Default by `dibuatPada DESC`
4. **Pagination**: Saat ini fetch all, bisa ditambahkan infinite scroll jika diperlukan

## 🚀 Next Steps (Optional)

1. Tambahkan filter tambahan di dropdown:
   - Editor yang tidak sedang mengerjakan review
   - Editor dengan workload paling sedikit
   
2. Tampilkan info tambahan:
   - Jumlah review aktif per editor
   - Rating/performa editor

3. Implementasi auto-assign:
   - Round-robin assignment
   - Load balancing otomatis

## 📚 Related Files

- Frontend:
  - `frontend/app/(dashboard)/dashboard/admin/antrian-review/page.tsx`
  
- Backend:
  - `backend/src/modules/pengguna/pengguna.service.ts`
  - `backend/src/modules/pengguna/pengguna.controller.ts`
  - `backend/src/modules/pengguna/dto/filter-pengguna.dto.ts`
  
- Database:
  - `backend/prisma/schema.prisma` (model `PeranPengguna`)

---

**Dokumentasi dibuat**: 12 November 2025  
**Versi**: 1.0  
**Status**: ✅ Implemented & Tested
