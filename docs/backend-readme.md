# Dokumentasi Backend Publishify

## 📋 Daftar Isi

1. [Pengenalan](#pengenalan)
2. [Setup & Installation](#setup--installation)
3. [Struktur Project](#struktur-project)
4. [Database Schema](#database-schema)
5. [API Documentation](#api-documentation)
6. [Development Guide](#development-guide)
7. [Testing](#testing)
8. [Deployment](#deployment)

## 🎯 Pengenalan

**Publishify Backend** adalah REST API yang dibangun dengan **NestJS 10+** untuk mendukung sistem manajemen penerbitan naskah. Backend ini menggunakan:

- **Runtime**: Bun (v1.0+)
- **Framework**: NestJS 10+
- **Database**: PostgreSQL 14+ dengan Prisma ORM
- **Authentication**: JWT + Passport
- **Real-time**: Socket.io
- **Queue**: Bull + Redis
- **Documentation**: Swagger/OpenAPI

## ⚙️ Setup & Installation

### Prerequisites

- [Bun](https://bun.sh/) v1.0+
- PostgreSQL 14+
- Redis 6+
- Node.js 18+ (optional, untuk compatibility)

### Installation Steps

1. **Clone repository**

   ```bash
   cd backend
   ```

2. **Install dependencies dengan Bun**

   ```bash
   bun install
   ```

3. **Setup Environment Variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` dan sesuaikan dengan konfigurasi Anda:

   - `DATABASE_URL`: PostgreSQL connection string
   - `JWT_SECRET`: Secret key untuk JWT
   - `REDIS_HOST`, `REDIS_PORT`: Redis configuration
   - dll.

4. **Generate Prisma Client**

   ```bash
   bun prisma generate
   ```

5. **Run Database Migrations**

   ```bash
   bun prisma migrate dev
   ```

6. **Seed Database (Optional)**

   ```bash
   bun prisma db seed
   ```

   Ini akan membuat:

   - Admin user: `admin@publishify.com / Password123!`
   - Editor user: `editor@publishify.com / Password123!`
   - Penulis user: `penulis@publishify.com / Password123!`
   - Percetakan user: `percetakan@publishify.com / Password123!`
   - Sample kategori, genre, dan tags

7. **Run Development Server**

   ```bash
   bun run start:dev
   ```

   Server akan berjalan di `http://localhost:4000`
   API Documentation (Swagger) tersedia di `http://localhost:4000/api/docs`

## 📁 Struktur Project

```
backend/
├── src/
│   ├── main.ts                 # Entry point aplikasi
│   ├── app.module.ts           # Root module
│   ├── modules/                # Feature modules
│   │   ├── auth/               # Authentication module
│   │   ├── pengguna/           # User management
│   │   ├── naskah/             # Manuscript management
│   │   ├── review/             # Review system
│   │   ├── percetakan/         # Printing management
│   │   ├── pembayaran/         # Payment system
│   │   ├── notifikasi/         # Notification (WebSocket)
│   │   └── upload/             # File upload
│   ├── common/                 # Shared resources
│   │   ├── decorators/         # Custom decorators
│   │   ├── filters/            # Exception filters
│   │   ├── guards/             # Guards
│   │   ├── interceptors/       # Interceptors
│   │   ├── pipes/              # Validation pipes
│   │   └── interfaces/         # TypeScript interfaces
│   ├── config/                 # Configuration files
│   ├── prisma/                 # Prisma service
│   └── utils/                  # Utility functions
├── prisma/
│   ├── schema.prisma           # Database schema
│   ├── migrations/             # Database migrations
│   └── seed.ts                 # Database seeder
├── test/                       # Test files
├── .env.example                # Environment template
├── package.json                # Dependencies
├── nest-cli.json               # NestJS CLI config
└── tsconfig.json               # TypeScript config
```

## 🗄️ Database Schema

### Core Tables (4 tabel)

#### 1. Pengguna

```prisma
model Pengguna {
  id                    String    @id @default(uuid())
  email                 String    @unique
  kataSandi             String
  telepon               String?
  aktif                 Boolean   @default(true)
  terverifikasi         Boolean   @default(false)
  // ... relations
}
```

Tabel utama untuk autentikasi dan manajemen pengguna.

#### 2. ProfilPengguna

Menyimpan informasi profil detail pengguna (nama, bio, avatar, alamat, dll).

#### 3. PeranPengguna

Manajemen role-based access control (RBAC):

- `penulis`: Penulis naskah
- `editor`: Editor/reviewer
- `percetakan`: Partner percetakan
- `admin`: Administrator sistem

#### 4. ProfilPenulis

Informasi tambahan khusus untuk penulis (nama pena, biografi, spesialisasi, rekening bank, dll).

### Content Tables (8 tabel)

#### 1. Naskah

```prisma
model Naskah {
  id             String       @id @default(uuid())
  judul          String
  sinopsis       String       @db.Text
  status         StatusNaskah @default(draft)
  // ... fields & relations
}
```

Status naskah:

- `draft`: Masih draft
- `diajukan`: Sudah diajukan untuk review
- `dalam_review`: Sedang direview
- `perlu_revisi`: Perlu revisi
- `disetujui`: Disetujui untuk diterbitkan
- `ditolak`: Ditolak
- `diterbitkan`: Sudah diterbitkan

#### 2-8. Supporting Tables

- `Kategori`: Kategori naskah (dengan support sub-kategori)
- `Genre`: Genre naskah
- `Tag`: Tags untuk naskah
- `TagNaskah`: Pivot table naskah-tag
- `RevisiNaskah`: History revisi naskah

### Review System (3 tabel)

- `ReviewNaskah`: Review assignment dan status
- `FeedbackReview`: Feedback detail dari editor

### Printing System (5 tabel)

- `PesananCetak`: Order percetakan
- `LogProduksi`: Tracking produksi
- `Pengiriman`: Informasi pengiriman
- `TrackingLog`: Tracking pengiriman

### Payment System (2 tabel)

- `Pembayaran`: Transaksi pembayaran
- Support berbagai metode: Transfer Bank, Kartu Kredit, E-Wallet, VA, COD

### Others

- `Notifikasi`: Sistem notifikasi
- `TokenRefresh`: JWT refresh tokens
- `LogAktivitas`: Audit log
- `StatistikNaskah`: Analytics naskah
- `RatingReview`: User rating & reviews

**Total: 28+ tabel dengan relasi lengkap**

Lihat file `prisma/schema.prisma` untuk schema lengkap.

## 📡 API Documentation

### Base URL

```
Development: http://localhost:4000/api
Production: https://api.publishify.com/api
```

### Authentication

Semua endpoint (kecuali public) memerlukan JWT Bearer token:

```
Authorization: Bearer <access_token>
```

### Response Format

#### Success Response

```json
{
  "sukses": true,
  "pesan": "Operasi berhasil",
  "data": { ... },
  "metadata": {
    "total": 100,
    "halaman": 1,
    "limit": 20,
    "totalHalaman": 5
  }
}
```

#### Error Response

```json
{
  "sukses": false,
  "pesan": "Error message",
  "error": {
    "kode": "ERROR_CODE",
    "detail": "Detailed error message",
    "timestamp": "2025-10-29T10:00:00.000Z"
  }
}
```

### Main Endpoints

#### Authentication

- `POST /api/auth/register` - Registrasi pengguna baru
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout
- `POST /api/auth/verify-email` - Verifikasi email
- `POST /api/auth/forgot-password` - Lupa password
- `POST /api/auth/reset-password` - Reset password

#### Pengguna

- `GET /api/pengguna` - List users (admin only)
- `GET /api/pengguna/:id` - Get user detail
- `PUT /api/pengguna/:id` - Update user
- `DELETE /api/pengguna/:id` - Delete user

#### Naskah

- `GET /api/naskah` - List naskah (dengan filter & pagination)
- `POST /api/naskah` - Buat naskah baru (penulis)
- `GET /api/naskah/:id` - Detail naskah
- `PUT /api/naskah/:id` - Update naskah
- `DELETE /api/naskah/:id` - Hapus naskah
- `POST /api/naskah/:id/submit` - Submit naskah untuk review
- `POST /api/naskah/:id/publish` - Publish naskah

#### Review

- `GET /api/review` - List review assignments
- `POST /api/review` - Assign review (admin)
- `GET /api/review/:id` - Detail review
- `POST /api/review/:id/feedback` - Tambah feedback
- `POST /api/review/:id/submit` - Submit review hasil

#### Dan lainnya...

Untuk dokumentasi API lengkap dengan contoh request/response, buka Swagger UI di:
**http://localhost:4000/api/docs**

## 🛠️ Development Guide

### Konvensi Penamaan (PENTING!)

**SEMUA kode menggunakan Bahasa Indonesia:**

```typescript
// ✅ BENAR
const ambilDataNaskah = async (idNaskah: string) => {
  const naskah = await prisma.naskah.findUnique({
    where: { id: idNaskah }
  });

  if (!naskah) {
    throw new NotFoundException('Naskah tidak ditemukan');
  }

  return {
    sukses: true,
    pesan: 'Data berhasil diambil',
    data: naskah,
  };
};

// ❌ SALAH - Jangan gunakan bahasa Inggris
const getManuscript = async (id: string) => { ... }
```

### Best Practices

1. **Gunakan Prisma untuk database queries**
2. **Selalu validasi input dengan Zod**
3. **Gunakan pagination untuk list endpoints**
4. **Log semua operasi penting**
5. **Handle errors dengan proper HTTP status codes**
6. **Gunakan transactions untuk operasi multiple**
7. **Implement caching untuk data yang sering diakses**

### Error Handling

```typescript
// Contoh error handling yang baik
try {
  const naskah = await this.prismaService.naskah.findUnique({
    where: { id },
  });

  if (!naskah) {
    throw new NotFoundException("Naskah tidak ditemukan");
  }

  return {
    sukses: true,
    data: naskah,
  };
} catch (error) {
  this.logger.error(`Error ambil naskah: ${error.message}`);
  throw error;
}
```

## 🧪 Testing

### Unit Tests

```bash
bun test
```

### E2E Tests

```bash
bun test:e2e
```

### Coverage

```bash
bun test:cov
```

## 🚀 Deployment

### Build for Production

```bash
bun run build
```

### Run Production

```bash
bun run start:prod
```

### Environment Variables

Pastikan semua environment variables sudah diset di production:

- `NODE_ENV=production`
- `DATABASE_URL` (production database)
- `JWT_SECRET` (strong secret key)
- `REDIS_HOST`, `REDIS_PORT`
- dll.

### Docker Deployment

(To be added)

### PM2 Deployment

```bash
pm2 start dist/main.js --name publishify-api
```

## 📚 Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Bun Documentation](https://bun.sh/docs)

## 📞 Support

Untuk pertanyaan atau bantuan, silakan hubungi tim development.

---

**Publishify Backend** - Sistem Penerbitan Naskah
