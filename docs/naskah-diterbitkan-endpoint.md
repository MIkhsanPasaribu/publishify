# Dokumentasi Endpoint Naskah Diterbitkan

## 📝 Overview

Endpoint baru untuk mengambil daftar naskah yang sudah **diterbitkan** dan **siap dicetak**. Endpoint ini digunakan oleh penulis untuk melihat naskah-naskah yang lolos review dan dapat dipesan percetakannya.

## 🔗 Endpoint Details

### Backend API

**URL:** `GET /api/naskah/penulis/diterbitkan`

**Authentication:** Required (JWT Bearer Token)

**Authorization:** Role `penulis` only

**Response Format:**
```json
{
  "sukses": true,
  "pesan": "Daftar naskah diterbitkan berhasil diambil",
  "data": [
    {
      "id": "uuid",
      "judul": "string",
      "subJudul": "string | null",
      "sinopsis": "string",
      "isbn": "string | null",
      "jumlahHalaman": "number | null",
      "jumlahKata": "number | null",
      "urlSampul": "string | null",
      "status": "disetujui",
      "dibuatPada": "timestamp",
      "diperbaruiPada": "timestamp",
      "penulis": {
        "id": "uuid",
        "email": "string",
        "profilPengguna": {
          "namaDepan": "string",
          "namaBelakang": "string",
          "namaTampilan": "string"
        }
      },
      "kategori": {
        "id": "uuid",
        "nama": "string",
        "slug": "string"
      },
      "genre": {
        "id": "uuid",
        "nama": "string",
        "slug": "string"
      },
      "reviewNaskah": [
        {
          "id": "uuid",
          "status": "selesai",
          "rekomendasi": "setujui",
          "dibuatPada": "timestamp",
          "editor": {
            "id": "uuid",
            "email": "string",
            "profilPengguna": {
              "namaDepan": "string",
              "namaBelakang": "string"
            }
          }
        }
      ]
    }
  ],
  "metadata": {
    "total": 5
  }
}
```

## 🔍 Filter Criteria

Endpoint ini menggunakan **3 filter utama** untuk memastikan hanya naskah yang benar-benar siap cetak yang ditampilkan:

### 1. Status Naskah = `disetujui`
```prisma
status: StatusNaskah.disetujui
```
Naskah harus sudah disetujui oleh admin/editor.

### 2. Review Status = `selesai`
```prisma
reviewNaskah: {
  some: {
    status: StatusReview.selesai,
    rekomendasi: Rekomendasi.setujui,
  }
}
```
Naskah harus memiliki review yang sudah selesai.

### 3. Rekomendasi = `setujui`
Review harus memberikan rekomendasi "setujui" (bukan "perbaiki" atau "tolak").

## 💻 Implementation

### Backend (NestJS)

#### Controller (`naskah.controller.ts`)
```typescript
/**
 * GET /naskah/penulis/diterbitkan - Ambil naskah yang sudah diterbitkan (siap cetak)
 * Role: penulis
 * Filter: status = 'disetujui' & review.status = 'selesai' & review.rekomendasi = 'setujui'
 */
@Get('penulis/diterbitkan')
@ApiBearerAuth()
@Peran('penulis')
@ApiOperation({
  summary: 'Ambil naskah yang sudah diterbitkan dan siap dicetak',
  description: 'Penulis mengambil daftar naskah yang sudah disetujui dan selesai direview dengan rekomendasi setujui. Naskah ini siap untuk dicetak.',
})
@ApiResponse({
  status: 200,
  description: 'Daftar naskah diterbitkan berhasil diambil',
})
async ambilNaskahDiterbitkan(
  @PenggunaSaatIni('id') idPenulis: string,
) {
  return await this.naskahService.ambilNaskahDiterbitkan(idPenulis);
}
```

#### Service (`naskah.service.ts`)
```typescript
/**
 * Ambil naskah yang sudah diterbitkan dan siap cetak
 * Role: penulis
 * Filter: status = 'disetujui' & review.status = 'selesai' & review.rekomendasi = 'setujui'
 */
async ambilNaskahDiterbitkan(idPenulis: string) {
  const naskah = await this.prisma.naskah.findMany({
    where: {
      idPenulis,
      status: StatusNaskah.disetujui,
      reviewNaskah: {
        some: {
          status: StatusReview.selesai,
          rekomendasi: Rekomendasi.setujui,
        },
      },
    },
    include: {
      penulis: {
        select: {
          id: true,
          email: true,
          profilPengguna: {
            select: {
              namaDepan: true,
              namaBelakang: true,
              namaTampilan: true,
            },
          },
        },
      },
      kategori: {
        select: {
          id: true,
          nama: true,
          slug: true,
        },
      },
      genre: {
        select: {
          id: true,
          nama: true,
          slug: true,
        },
      },
      reviewNaskah: {
        where: {
          status: StatusReview.selesai,
          rekomendasi: Rekomendasi.setujui,
        },
        include: {
          editor: {
            select: {
              id: true,
              email: true,
              profilPengguna: {
                select: {
                  namaDepan: true,
                  namaBelakang: true,
                },
              },
            },
          },
        },
        orderBy: {
          dibuatPada: 'desc',
        },
        take: 1, // Ambil review terakhir saja
      },
    },
    orderBy: {
      diperbaruiPada: 'desc',
    },
  });

  return {
    sukses: true,
    pesan: 'Daftar naskah diterbitkan berhasil diambil',
    data: naskah,
    metadata: {
      total: naskah.length,
    },
  };
}
```

### Frontend (Next.js)

#### API Client (`lib/api/naskah.ts`)
```typescript
async ambilNaskahDiterbitkan(): Promise<ResponseSukses<Naskah[]>> {
  const { data } = await api.get<ResponseSukses<Naskah[]>>("/naskah/penulis/diterbitkan");
  return data;
}
```

#### Usage Example 1 - Dropdown Selector (`percetakan/buat/page.tsx`)
```typescript
import { naskahApi } from "@/lib/api/naskah";
import { toast } from "sonner";

async function ambilNaskahDiterbitkan() {
  try {
    const response = await naskahApi.ambilNaskahDiterbitkan();
    setNaskahList(response.data);
  } catch (error) {
    console.error("Error mengambil naskah diterbitkan:", error);
    toast.error("Gagal mengambil daftar naskah");
  }
}
```

#### Usage Example 2 - List Display (`percetakan/naskah/page.tsx`)
```typescript
import { naskahApi } from "@/lib/api/naskah";
import { toast } from "sonner";

async function ambilNaskahDiterbitkan() {
  try {
    const response = await naskahApi.ambilNaskahDiterbitkan();
    setNaskah(response.data);
  } catch (error) {
    console.error("Error mengambil naskah diterbitkan:", error);
    toast.error("Gagal mengambil daftar naskah");
  } finally {
    setLoading(false);
  }
}
```

## 🎯 Use Cases

### 1. Form Pesanan Cetak
**Page:** `/dashboard/penulis/percetakan/buat`

Penulis memilih naskah dari dropdown. Hanya naskah yang sudah lolos review yang akan muncul di dropdown.

### 2. Daftar Naskah Siap Cetak
**Page:** `/dashboard/penulis/percetakan/naskah`

Menampilkan grid card naskah-naskah yang siap dicetak dengan tombol "Cetak Sekarang".

## 🔐 Security & Authorization

- ✅ **Authentication Required:** JWT Bearer token wajib
- ✅ **Role-Based Access:** Hanya role `penulis` yang bisa akses
- ✅ **Data Isolation:** Penulis hanya bisa melihat naskah milik sendiri (`idPenulis`)
- ✅ **Status Validation:** Hanya naskah dengan status `disetujui` yang muncul
- ✅ **Review Validation:** Harus ada review dengan status `selesai` dan rekomendasi `setujui`

## 📊 Database Query Strategy

### Query Optimization
```prisma
// Menggunakan 'some' untuk filter relasi
reviewNaskah: {
  some: {
    status: StatusReview.selesai,
    rekomendasi: Rekomendasi.setujui,
  }
}

// Include dengan where untuk filter nested data
reviewNaskah: {
  where: {
    status: StatusReview.selesai,
    rekomendasi: Rekomendasi.setujui,
  },
  take: 1, // Ambil 1 review terakhir saja
}
```

### Indexes (Recommendation)
```sql
-- Index untuk performa query
CREATE INDEX idx_naskah_penulis_status ON naskah(id_penulis, status);
CREATE INDEX idx_review_status_rekomendasi ON review_naskah(id_naskah, status, rekomendasi);
```

## 🧪 Testing

### Manual Testing dengan cURL
```bash
# Login dulu untuk dapat token
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "penulis@example.com", "password": "password123"}'

# Ambil naskah diterbitkan
curl -X GET http://localhost:4000/api/naskah/penulis/diterbitkan \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Expected Test Data Setup
```typescript
// 1. Buat naskah dengan status 'disetujui'
// 2. Buat review dengan status 'selesai' dan rekomendasi 'setujui'
// 3. Call endpoint
// 4. Verify response contains the manuscript
```

## 📈 Performance Considerations

- **Response Time:** < 200ms (dengan index)
- **Data Size:** Lightweight response (hanya field penting)
- **Caching:** Dapat di-cache 5-10 menit (data jarang berubah)
- **Pagination:** Tidak diperlukan (biasanya penulis punya < 50 naskah diterbitkan)

## 🚀 Deployment Checklist

- [x] Backend endpoint created (`naskah.controller.ts`)
- [x] Service method implemented (`naskah.service.ts`)
- [x] Enum imports added (`StatusReview`, `Rekomendasi`)
- [x] Frontend API client function (`naskah.ts`)
- [x] Form page integration (`percetakan/buat/page.tsx`)
- [x] List page integration (`percetakan/naskah/page.tsx`)
- [x] Error handling with toast notifications
- [ ] Database indexes created (recommendation)
- [ ] E2E testing completed
- [ ] Swagger documentation verified

## 📝 Notes

- Endpoint ini **TIDAK menggunakan pagination** karena jumlah naskah diterbitkan per penulis biasanya sedikit
- Review yang diinclude hanya **1 review terakhir** yang selesai dengan rekomendasi setujui
- Response diurutkan berdasarkan `diperbaruiPada` descending (terbaru dulu)

## 🔗 Related Endpoints

- `POST /api/auth/login` - Login penulis
- `GET /api/naskah/penulis/saya` - Semua naskah penulis (tidak difilter)
- `POST /api/percetakan/buat` - Buat pesanan cetak

---

**Last Updated:** 2024-01-XX
**Author:** GitHub Copilot
**Status:** ✅ Implemented & Ready for Testing
