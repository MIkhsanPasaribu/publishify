# 📚 Publishify - Sistem Manajemen Penerbitan Naskah

![License](https://img.shields.io/badge/license-MIT-green)
![Next.js](https://img.shields.io/badge/Next.js-16.0.1-black)
![NestJS](https://img.shields.io/badge/NestJS-10.3.0-red)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)

**Publishify** adalah sistem manajemen lengkap untuk penerbitan buku dan naskah yang mencakup proses dari penulisan, review, percetakan hingga distribusi. Sistem ini dibangun dengan arsitektur **monorepo** menggunakan **Next.js 16** untuk frontend dan **NestJS 10+** untuk backend API.

## 🎯 Daftar Isi

- [Fitur Utama](#-fitur-utama)
- [Arsitektur Sistem](#-arsitektur-sistem)
- [Tech Stack](#-tech-stack)
- [Persiapan Development](#-persiapan-development)
- [Struktur Folder](#-struktur-folder)
- [Environment Variables](#-environment-variables)
- [Database Schema](#-database-schema)
- [API Endpoints](#-api-endpoints)
- [Optimasi Performance](#-optimasi-performance)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Kontribusi](#-kontribusi)
- [Lisensi](#-lisensi)

## 🚀 Fitur Utama

### Untuk Penulis

- ✍️ **Manajemen Naskah** - Buat, edit, dan kelola naskah dengan editor rich text
- 📤 **Submit untuk Review** - Ajukan naskah untuk proses review editorial
- 📊 **Dashboard Statistik** - Lihat status naskah, jumlah pembaca, dan rating
- 💼 **Profil Penulis** - Kelola biodata, spesialisasi, dan portofolio karya
- 📖 **Buku Terbit** - Akses ke semua buku yang sudah diterbitkan
- 🖨️ **Pesanan Cetak** - Pesan cetakan buku fisik dengan berbagai pilihan format

### Untuk Editor

- 📝 **Review Workflow** - Sistem review naskah yang terstruktur
- 💬 **Feedback Detail** - Berikan komentar per bab atau halaman
- ✅ **Rekomendasi** - Setujui, minta revisi, atau tolak naskah
- 📋 **Dashboard Review** - Kelola antrian review yang ditugaskan
- 🔔 **Notifikasi Real-time** - Update instant untuk tugas baru

### Untuk Percetakan

- 📦 **Manajemen Pesanan** - Terima dan proses pesanan cetakan
- 🏭 **Tracking Produksi** - Log progress produksi per tahapan
- 🚚 **Manajemen Pengiriman** - Integrasi dengan ekspedisi dan tracking
- 📊 **Laporan Produksi** - Statistik dan analitik pesanan

### Untuk Admin

- 👥 **Manajemen Pengguna** - Kelola user, role, dan permissions
- 📚 **Manajemen Konten** - Moderasi naskah dan kategori
- 💰 **Manajemen Pembayaran** - Konfirmasi dan tracking pembayaran
- 📈 **Analytics Dashboard** - Laporan lengkap sistem
- ⚙️ **System Configuration** - Pengaturan sistem dan maintenance

### Fitur Umum

- 🔐 **Authentication** - JWT dengan refresh token (platform-aware: web & mobile)
- 🔒 **Authorization** - Role-based access control (RBAC)
- 🔔 **Real-time Notifications** - WebSocket untuk notifikasi instant
- 📁 **File Upload** - Upload naskah, sampul, dan dokumen ke Supabase Storage
- 🔍 **Full-text Search** - Pencarian cepat dengan PostgreSQL
- 📱 **Responsive Design** - Optimized untuk desktop dan mobile
- 🌐 **Multi-language Support** - Siap untuk internasionalisasi

## 🏗️ Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────────┐
│                      USER INTERFACE                         │
├─────────────────────────────────────────────────────────────┤
│  Next.js 16 (App Router) + React 19 + Tailwind CSS v4     │
│  - Landing Pages                                            │
│  - Authentication (Login, Register, Verifikasi Email)       │
│  - Dashboard (Penulis, Editor, Percetakan, Admin)          │
│  - Zustand (State Management)                               │
│  - React Hook Form + Zod (Form & Validation)               │
│  - Axios (HTTP Client)                                      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ HTTP/HTTPS + WebSocket
                     │
┌────────────────────▼────────────────────────────────────────┐
│                    BACKEND API LAYER                        │
├─────────────────────────────────────────────────────────────┤
│  NestJS 10+ (REST API + WebSocket)                         │
│  - Authentication Module (JWT + Passport)                   │
│  - Naskah Module (CRUD + Cursor Pagination)                │
│  - Review Module (Workflow Management)                      │
│  - Percetakan Module (Order Processing)                    │
│  - Pembayaran Module (Payment Gateway)                      │
│  - Upload Module (Supabase Storage)                         │
│  - Notifikasi Gateway (Socket.io)                           │
│                                                              │
│  PERFORMANCE OPTIMIZATIONS:                                 │
│  ├─ Redis Cache (Redis Cloud, Singapore)                   │
│  ├─ Async Logger (Event-driven, Buffer 100)                │
│  ├─ Database Indexes (12 Composite Indexes)                │
│  └─ Cursor Pagination (ID-based)                            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Prisma ORM
                     │
┌────────────────────▼────────────────────────────────────────┐
│                    DATA PERSISTENCE                         │
├─────────────────────────────────────────────────────────────┤
│  PostgreSQL 14+ (Supabase)                                  │
│  - 12 Core Tables (Pengguna, Naskah, Review, Pesanan, dll) │
│  - Row Level Security (RLS)                                 │
│  - Real-time Subscriptions                                  │
│  - Full-text Search                                          │
│  - 30 Indexes (12 Composite for Performance)               │
│                                                              │
│  Redis Cloud (30MB, Singapore)                              │
│  - Session Cache                                             │
│  - API Response Cache                                        │
│  - Rate Limiting                                             │
│                                                              │
│  Supabase Storage                                            │
│  - File Uploads (Naskah, Sampul, Bukti Pembayaran)         │
│  - Public & Private Buckets                                 │
└─────────────────────────────────────────────────────────────┘
```

## 💻 Tech Stack

### Frontend

| Teknologi           | Versi   | Deskripsi                         |
| ------------------- | ------- | --------------------------------- |
| **Next.js**         | 16.0.1  | React framework dengan App Router |
| **React**           | 19.2.0  | UI library terbaru                |
| **TypeScript**      | 5.0+    | Type-safe development             |
| **Tailwind CSS**    | v4      | Utility-first CSS framework       |
| **Zustand**         | 5.0.8   | State management (lightweight)    |
| **React Hook Form** | 7.66.0  | Form handling & validation        |
| **Zod**             | 4.1.12  | Schema validation                 |
| **Axios**           | 1.13.1  | HTTP client dengan interceptors   |
| **Lucide React**    | 0.552.0 | Icon library                      |
| **Sonner**          | 2.0.7   | Toast notifications               |

### Backend

| Teknologi         | Versi  | Deskripsi                     |
| ----------------- | ------ | ----------------------------- |
| **NestJS**        | 10.3.0 | Progressive Node.js framework |
| **Bun**           | 1.0+   | Fast JavaScript runtime       |
| **TypeScript**    | 5.0+   | Type-safe development         |
| **Prisma**        | 6.18.0 | Next-generation ORM           |
| **Passport**      | 0.7.0  | Authentication middleware     |
| **JWT**           | 10.2.0 | JSON Web Token                |
| **Zod**           | 3.22.4 | Schema validation             |
| **Socket.io**     | 4.6.1  | Real-time WebSocket           |
| **Cache Manager** | 7.2.4  | Multi-store caching           |
| **Redis**         | 5.3.2  | In-memory cache (via ioredis) |
| **Multer**        | 1.4.5  | File upload handling          |
| **Sharp**         | 0.33.2 | Image processing              |
| **Nodemailer**    | 6.9.8  | Email service                 |
| **Winston**       | 3.11.0 | Logging library               |
| **Bcryptjs**      | 3.0.3  | Password hashing              |

### Database & Infrastructure

| Teknologi             | Versi | Deskripsi                               |
| --------------------- | ----- | --------------------------------------- |
| **PostgreSQL**        | 14+   | Primary database (Supabase)             |
| **Redis Cloud**       | 8.2.1 | Cache & session store (30MB, Singapore) |
| **Supabase Storage**  | -     | File storage solution                   |
| **Supabase Realtime** | -     | Real-time subscriptions                 |
| **pgcrypto**          | -     | PostgreSQL extension                    |

### Development Tools

| Tool         | Deskripsi                  |
| ------------ | -------------------------- |
| **ESLint**   | Code linting               |
| **Prettier** | Code formatting            |
| **Jest**     | Unit & integration testing |
| **Swagger**  | API documentation          |
| **Git**      | Version control            |

## 🔧 Persiapan Development

### Prerequisites

Pastikan sudah terinstall:

- **Bun** v1.0+ ([Install Bun](https://bun.sh))
- **Node.js** v20+ (optional, Bun sudah termasuk runtime)
- **PostgreSQL** 14+ (atau akun Supabase)
- **Git**

### 1. Clone Repository

```bash
git clone <repository-url>
cd publishify
```

### 2. Setup Backend

```bash
cd backend

# Install dependencies
bun install

# Setup environment variables
cp .env.example .env
# Edit .env dengan kredensial Anda

# Generate Prisma Client
bun prisma generate

# Jalankan migrations
bun prisma migrate dev

# (Optional) Seed database dengan data dummy
bun prisma db seed

# Jalankan development server
bun run start:dev
```

Backend akan berjalan di `http://localhost:4000`
API Documentation: `http://localhost:4000/api/docs`

### 3. Setup Frontend

```bash
cd frontend

# Install dependencies
bun install

# Setup environment variables
cp .env.local.example .env.local
# Edit .env.local dengan backend URL

# Jalankan development server
bun run dev
```

Frontend akan berjalan di `http://localhost:3000`

### 4. Test Redis Connection (Optional)

```bash
cd backend
bun run test:redis
```

Output yang diharapkan:

```
✅ Redis connected successfully!
✅ PING: PONG
✅ All Redis tests passed!
```

### 5. Akses Aplikasi

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **API Docs (Swagger)**: http://localhost:4000/api/docs
- **Prisma Studio**: Jalankan `bun prisma studio` (port 5555)

## 📁 Struktur Folder

### Frontend (`frontend/`)

```
frontend/
├── app/                          # Next.js 16 App Router
│   ├── (auth)/                  # Auth group routes
│   │   ├── login/               # Halaman login
│   │   └── register/            # Halaman registrasi
│   ├── (dashboard)/             # Dashboard group routes
│   │   └── dashboard/
│   │       ├── draf-saya/       # Draft penulis
│   │       ├── ajukan-draf/     # Submit draft
│   │       ├── draf/            # All drafts (editor/admin)
│   │       ├── buku-terbit/     # Published books
│   │       ├── pesanan-cetak/   # Print orders
│   │       ├── pengaturan/      # Settings
│   │       └── layout.tsx       # Dashboard layout
│   ├── verifikasi-email/        # Email verification
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Landing page
│   └── globals.css              # Global styles
├── components/
│   ├── landing/                 # Landing page components
│   │   ├── hero-section.tsx
│   │   ├── fitur-section.tsx
│   │   ├── proses-penerbitan-section.tsx
│   │   ├── buku-unggulan-section.tsx
│   │   ├── testimoni-section.tsx
│   │   ├── cta-section.tsx
│   │   ├── header-navigasi.tsx
│   │   └── footer.tsx
│   └── dashboard/               # Dashboard components
│       └── sidebar.tsx
├── lib/
│   ├── api/                     # API client layer
│   │   ├── client.ts            # Axios instance + interceptors
│   │   ├── auth.ts              # Auth API calls
│   │   ├── naskah.ts            # Naskah API calls
│   │   ├── percetakan.ts        # Percetakan API calls
│   │   └── upload.ts            # Upload API calls
│   └── constants/               # Constants
├── stores/
│   └── use-auth-store.ts        # Zustand auth store
├── .env.local                   # Environment variables (gitignored)
├── next.config.js               # Next.js configuration
├── tailwind.config.ts           # Tailwind configuration
├── tsconfig.json                # TypeScript config
└── package.json                 # Dependencies

```

### Backend (`backend/`)

```
backend/
├── src/
│   ├── main.ts                  # Entry point
│   ├── app.module.ts            # Root module
│   ├── common/                  # Shared utilities
│   │   ├── cache/               # 🚀 Redis caching system
│   │   │   ├── cache.module.ts
│   │   │   ├── cache.service.ts
│   │   │   ├── cache.decorator.ts
│   │   │   └── cache.interceptor.ts
│   │   ├── logger/              # 🚀 Async logging system
│   │   │   ├── async-logger.service.ts
│   │   │   └── logger.module.ts
│   │   ├── dto/                 # Shared DTOs
│   │   │   └── cursor-pagination.dto.ts  # 🚀 Cursor pagination
│   │   ├── decorators/          # Custom decorators
│   │   │   ├── public.decorator.ts
│   │   │   └── api-paginated-response.decorator.ts
│   │   ├── guards/              # Auth guards
│   │   │   └── jwt-auth.guard.ts
│   │   ├── interceptors/        # HTTP interceptors
│   │   │   ├── logging.interceptor.ts
│   │   │   ├── transform.interceptor.ts
│   │   │   └── timeout.interceptor.ts
│   │   ├── filters/             # Exception filters
│   │   │   ├── http-exception.filter.ts
│   │   │   └── prisma-exception.filter.ts
│   │   ├── pipes/               # Validation pipes
│   │   │   ├── validasi-zod.pipe.ts
│   │   │   └── parse-uuid.pipe.ts
│   │   ├── middlewares/         # Middlewares
│   │   │   └── prisma-rls.middleware.ts
│   │   └── interfaces/          # Shared interfaces
│   │       ├── response.interface.ts
│   │       └── paginated.interface.ts
│   ├── modules/                 # Business logic modules
│   │   ├── auth/                # Authentication & JWT
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── strategies/      # Passport strategies
│   │   │   ├── guards/          # Auth guards
│   │   │   └── dto/             # Auth DTOs
│   │   ├── pengguna/            # User management
│   │   ├── naskah/              # 🚀 Manuscript (cached + pagination)
│   │   ├── kategori/            # 🚀 Categories (cached)
│   │   ├── genre/               # 🚀 Genres (cached)
│   │   ├── review/              # Review workflow
│   │   ├── percetakan/          # Printing orders
│   │   ├── pembayaran/          # Payment processing
│   │   ├── notifikasi/          # Notifications & WebSocket
│   │   └── upload/              # File upload
│   ├── config/                  # Configuration
│   │   ├── database.config.ts
│   │   ├── jwt.config.ts
│   │   ├── redis.config.ts
│   │   └── email.config.ts
│   ├── prisma/                  # Prisma service
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   └── utils/                   # Utility functions
│       ├── hash.util.ts
│       ├── format.util.ts
│       ├── platform.util.ts
│       └── validation.util.ts
├── prisma/
│   ├── schema.prisma            # Database schema (589 lines)
│   ├── seed.ts                  # Seed data
│   └── migrations/              # Migration history
├── test/                        # Testing
│   ├── unit/                    # Unit tests
│   ├── integration/             # Integration tests
│   ├── e2e/                     # E2E tests
│   └── helpers/                 # Test helpers
├── .env                         # Environment variables (gitignored)
├── nest-cli.json                # NestJS CLI config
├── tsconfig.json                # TypeScript config
├── jest.config.ts               # Jest config
└── package.json                 # Dependencies
```

### Documentation (`docs/`)

```
docs/
├── api/                         # API documentation
├── performance/                 # Performance docs
│   ├── cache-implementation.md
│   ├── performance-optimization-summary.md
│   └── cursor-pagination.md
├── database/                    # Database documentation
└── workflows/                   # Business workflows
```

## 🔑 Environment Variables

### Backend (`.env`)

```bash
# Environment
NODE_ENV=development

# Server
PORT=4000
FRONTEND_URL=http://localhost:3000

# Database (Supabase PostgreSQL)
DATABASE_URL=postgresql://user:password@host:6543/database?pgbouncer=true
DIRECT_URL=postgresql://user:password@host:5432/database

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars

# JWT Expiry - Web platform
JWT_WEB_EXPIRES_IN=1h
JWT_WEB_REFRESH_EXPIRES_IN=7d

# JWT Expiry - Mobile platform (long-lived)
JWT_MOBILE_EXPIRES_IN=365d
JWT_MOBILE_REFRESH_EXPIRES_IN=365d

# Redis Configuration (Redis Cloud)
REDIS_HOST=your-redis-host.redis-cloud.com
REDIS_PORT=10660
REDIS_USERNAME=default
REDIS_PASSWORD=your-redis-password
REDIS_DB=0

# Supabase (untuk Storage)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@publishify.com
```

### Frontend (`.env.local`)

```bash
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:4000/api

# WebSocket URL
NEXT_PUBLIC_WS_URL=http://localhost:4000

# Supabase (untuk Storage)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 🗄️ Database Schema

### Tabel Utama (12 Core Tables)

#### 1. **pengguna** - User accounts

- `id` (UUID, PK)
- `email` (String, UNIQUE)
- `kataSandi` (String, hashed)
- `telepon` (String, optional)
- `aktif` (Boolean)
- `terverifikasi` (Boolean)
- `emailDiverifikasiPada` (DateTime)
- `loginTerakhir` (DateTime)
- `dibuatPada`, `diperbaruiPada` (DateTime)

**Relations**:

- 1:1 → ProfilPengguna, ProfilPenulis
- 1:many → PeranPengguna, Naskah, ReviewNaskah, PesananCetak, Pembayaran, Notifikasi, LogAktivitas, TokenRefresh, File

#### 2. **naskah** - Manuscripts

- `id` (UUID, PK)
- `idPenulis` (UUID, FK → pengguna)
- `judul`, `subJudul` (String)
- `sinopsis` (Text)
- `isbn` (String, UNIQUE)
- `idKategori` (UUID, FK → kategori)
- `idGenre` (UUID, FK → genre)
- `bahasaTulis` (String, default: "id")
- `jumlahHalaman`, `jumlahKata` (Integer)
- `status` (Enum: draft, diajukan, dalam_review, perlu_revisi, disetujui, ditolak, diterbitkan)
- `urlSampul`, `urlFile` (String)
- `publik` (Boolean)
- `diterbitkanPada` (DateTime)
- `dibuatPada`, `diperbaruiPada` (DateTime)

**Indexes** (🚀 Performance):

- `idPenulis + status` - Dashboard queries
- `status + dibuatPada` - List queries
- `idKategori + status` - Category pages
- `publik + diterbitkanPada` - Public listings
- `dibuatPada` - Cursor pagination

**Relations**:

- many:1 → Pengguna (penulis), Kategori, Genre
- 1:many → RevisiNaskah, ReviewNaskah, PesananCetak, TagNaskah

#### 3. **kategori** - Categories

- `id` (UUID, PK)
- `nama` (String)
- `slug` (String, UNIQUE)
- `deskripsi` (String)
- `idInduk` (UUID, FK → kategori, self-relation)
- `aktif` (Boolean)
- `dibuatPada`, `diperbaruiPada` (DateTime)

**Relations**:

- Self-relation: SubKategori
- 1:many → Naskah

#### 4. **genre** - Genres

- `id` (UUID, PK)
- `nama` (String, UNIQUE)
- `slug` (String, UNIQUE)
- `deskripsi` (String)
- `aktif` (Boolean)
- `dibuatPada`, `diperbaruiPada` (DateTime)

**Relations**:

- 1:many → Naskah

#### 5. **review_naskah** - Manuscript reviews

- `id` (UUID, PK)
- `idNaskah` (UUID, FK → naskah)
- `idEditor` (UUID, FK → pengguna)
- `status` (Enum: ditugaskan, dalam_proses, selesai, dibatalkan)
- `rekomendasi` (Enum: setujui, revisi, tolak)
- `catatan` (Text)
- `ditugaskanPada`, `dimulaiPada`, `selesaiPada` (DateTime)
- `diperbaruiPada` (DateTime)

**Indexes** (🚀 Performance):

- `idEditor + status` - Editor dashboard
- `status + ditugaskanPada` - Review queue

**Relations**:

- many:1 → Naskah, Pengguna (editor)
- 1:many → FeedbackReview

#### 6. **pesanan_cetak** - Print orders

- `id` (UUID, PK)
- `idNaskah` (UUID, FK → naskah)
- `idPemesan` (UUID, FK → pengguna)
- `nomorPesanan` (String, UNIQUE)
- `jumlah` (Integer)
- `formatKertas`, `jenisKertas`, `jenisCover` (String)
- `finishingTambahan` (String[])
- `catatan` (Text)
- `hargaTotal` (Decimal)
- `status` (Enum: tertunda, diterima, dalam_produksi, kontrol_kualitas, siap, dikirim, terkirim, dibatalkan)
- `tanggalPesan`, `estimasiSelesai`, `tanggalSelesai` (DateTime)
- `diperbaruiPada` (DateTime)

**Indexes** (🚀 Performance):

- `idPemesan + status` - User orders
- `status + tanggalPesan` - Production queue
- `tanggalPesan` - Order history

**Relations**:

- many:1 → Naskah, Pengguna (pemesan)
- 1:1 → Pembayaran, Pengiriman
- 1:many → LogProduksi

#### 7. **pembayaran** - Payments

- `id` (UUID, PK)
- `idPesanan` (UUID, FK → pesanan_cetak, UNIQUE)
- `idPengguna` (UUID, FK → pengguna)
- `nomorTransaksi` (String, UNIQUE)
- `jumlah` (Decimal)
- `metodePembayaran` (Enum: transfer_bank, kartu_kredit, e_wallet, virtual_account, cod)
- `status` (Enum: tertunda, diproses, berhasil, gagal, dibatalkan, dikembalikan)
- `urlBukti` (String)
- `catatanPembayaran` (Text)
- `tanggalPembayaran` (DateTime)
- `dibuatPada`, `diperbaruiPada` (DateTime)

**Indexes** (🚀 Performance):

- `idPengguna + status` - User payments
- `status + dibuatPada` - Payment queue

**Relations**:

- 1:1 → PesananCetak
- many:1 → Pengguna

#### 8. **notifikasi** - Notifications

- `id` (UUID, PK)
- `idPengguna` (UUID, FK → pengguna)
- `judul` (String)
- `pesan` (Text)
- `tipe` (Enum: info, sukses, peringatan, error)
- `dibaca` (Boolean)
- `url` (String)
- `dibuatPada` (DateTime)

**Indexes**:

- `idPengguna + dibaca` - Unread notifications

**Relations**:

- many:1 → Pengguna

#### 9. **token_refresh** - Refresh tokens

- `id` (UUID, PK)
- `idPengguna` (UUID, FK → pengguna)
- `token` (String, UNIQUE)
- `platform` (Enum: web, mobile)
- `kadaluarsaPada` (DateTime)
- `dibuatPada` (DateTime)

**Indexes**:

- `token` - Fast token lookup
- `idPengguna + platform` - Platform-specific tokens

**Relations**:

- many:1 → Pengguna

#### 10. **log_aktivitas** - Activity logs

- `id` (UUID, PK)
- `idPengguna` (UUID, FK → pengguna)
- `jenis` (String: login, logout, verifikasi_email, dll)
- `aksi` (String)
- `entitas`, `idEntitas` (String)
- `deskripsi` (Text)
- `ipAddress`, `userAgent` (String)
- `dibuatPada` (DateTime)

**Indexes**:

- `idPengguna` - User activity
- `dibuatPada` - Time-based queries

**Relations**:

- many:1 → Pengguna (onDelete: SetNull)

#### 11. **file** - File storage

- `id` (UUID, PK)
- `idPengguna` (UUID, FK → pengguna)
- `namaFileAsli`, `namaFileSimpan` (String)
- `ukuran` (Integer, bytes)
- `mimeType`, `ekstensi` (String)
- `tujuan` (String: naskah, sampul, gambar, dokumen)
- `path`, `url`, `urlPublik` (String)
- `idReferensi` (String)
- `deskripsi` (Text)
- `diuploadPada` (DateTime)

**Indexes**:

- `idPengguna` - User uploads
- `tujuan` - Filter by purpose
- `idReferensi` - Reference lookup

**Relations**:

- many:1 → Pengguna

#### 12. **pengiriman** - Shipments

- `id` (UUID, PK)
- `idPesanan` (UUID, FK → pesanan_cetak, UNIQUE)
- `namaEkspedisi`, `nomorResi` (String)
- `biayaPengiriman` (Decimal)
- `alamatTujuan`, `namaPenerima`, `teleponPenerima` (String)
- `status` (Enum: diproses, dalam_perjalanan, terkirim, gagal)
- `tanggalKirim`, `estimasiTiba`, `tanggalTiba` (DateTime)
- `dibuatPada`, `diperbaruiPada` (DateTime)

**Relations**:

- 1:1 → PesananCetak
- 1:many → TrackingLog

### Tabel Tambahan

- **profil_pengguna** - User profiles
- **peran_pengguna** - User roles (many-to-many)
- **profil_penulis** - Writer profiles
- **revisi_naskah** - Manuscript revisions
- **tag**, **tag_naskah** - Tags system
- **feedback_review** - Review feedback
- **log_produksi** - Production logs
- **tracking_log** - Shipment tracking
- **statistik_naskah** - Manuscript statistics
- **rating_review** - User ratings

### Total Database Objects

- **18 Tables**
- **8 Enums** (JenisPeran, StatusNaskah, StatusReview, Rekomendasi, StatusPesanan, StatusPengiriman, StatusPembayaran, MetodePembayaran, TipeNotifikasi, Platform)
- **30 Indexes** (12 composite untuk performance)
- **1 Extension** (pgcrypto)

## 🔌 API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint            | Deskripsi              | Auth   |
| ------ | ------------------- | ---------------------- | ------ |
| POST   | `/daftar`           | Registrasi user baru   | Public |
| POST   | `/login`            | Login user             | Public |
| POST   | `/refresh`          | Refresh access token   | Public |
| POST   | `/logout`           | Logout user            | Auth   |
| GET    | `/me`               | Get current user       | Auth   |
| POST   | `/verifikasi-email` | Verify email           | Public |
| POST   | `/lupa-password`    | Request password reset | Public |
| POST   | `/reset-password`   | Reset password         | Public |

### Pengguna (`/api/pengguna`)

| Method | Endpoint         | Deskripsi        | Auth  |
| ------ | ---------------- | ---------------- | ----- |
| GET    | `/`              | List users       | Admin |
| GET    | `/:id`           | Get user detail  | Auth  |
| POST   | `/`              | Create user      | Admin |
| PUT    | `/:id`           | Update user      | Auth  |
| DELETE | `/:id`           | Delete user      | Admin |
| GET    | `/:id/profil`    | Get user profile | Auth  |
| PUT    | `/:id/profil`    | Update profile   | Auth  |
| PUT    | `/:id/password`  | Change password  | Auth  |
| GET    | `/:id/statistik` | Get user stats   | Auth  |

### Naskah (`/api/naskah`) 🚀 **CACHED + PAGINATED**

| Method | Endpoint              | Deskripsi                     | Auth          | Cache TTL |
| ------ | --------------------- | ----------------------------- | ------------- | --------- |
| GET    | `/`                   | List naskah (paginated)       | Public        | 5 min     |
| GET    | `/cursor`             | List dengan cursor pagination | Public        | 3 min     |
| GET    | `/:id`                | Get naskah detail             | Public        | 10 min    |
| POST   | `/`                   | Create naskah                 | Penulis       | -         |
| PUT    | `/:id`                | Update naskah                 | Penulis       | -         |
| DELETE | `/:id`                | Delete naskah                 | Penulis/Admin | -         |
| GET    | `/penulis/:idPenulis` | List by penulis               | Public        | 5 min     |
| POST   | `/:id/submit`         | Submit untuk review           | Penulis       | -         |
| POST   | `/:id/publish`        | Publish naskah                | Admin         | -         |

### Kategori (`/api/kategori`) 🚀 **CACHED**

| Method | Endpoint | Deskripsi              | Auth   | Cache TTL |
| ------ | -------- | ---------------------- | ------ | --------- |
| GET    | `/aktif` | List active categories | Public | 1 hour    |
| GET    | `/`      | List all categories    | Public | 5 min     |
| GET    | `/:id`   | Get category detail    | Public | 10 min    |
| POST   | `/`      | Create category        | Admin  | -         |
| PUT    | `/:id`   | Update category        | Admin  | -         |
| DELETE | `/:id`   | Delete category        | Admin  | -         |

### Genre (`/api/genre`) 🚀 **CACHED**

| Method | Endpoint | Deskripsi          | Auth   | Cache TTL |
| ------ | -------- | ------------------ | ------ | --------- |
| GET    | `/aktif` | List active genres | Public | 1 hour    |
| GET    | `/`      | List all genres    | Public | 5 min     |
| GET    | `/:id`   | Get genre detail   | Public | 10 min    |
| POST   | `/`      | Create genre       | Admin  | -         |
| PUT    | `/:id`   | Update genre       | Admin  | -         |
| DELETE | `/:id`   | Delete genre       | Admin  | -         |

### Review (`/api/review`)

| Method | Endpoint        | Deskripsi         | Auth         |
| ------ | --------------- | ----------------- | ------------ |
| GET    | `/`             | List reviews      | Editor/Admin |
| GET    | `/:id`          | Get review detail | Editor/Admin |
| POST   | `/tugaskan`     | Assign editor     | Admin        |
| POST   | `/:id/feedback` | Add feedback      | Editor       |
| POST   | `/:id/submit`   | Submit review     | Editor       |
| POST   | `/:id/batal`    | Cancel review     | Admin        |

### Percetakan (`/api/percetakan`)

| Method | Endpoint          | Deskripsi        | Auth             |
| ------ | ----------------- | ---------------- | ---------------- |
| GET    | `/`               | List orders      | Percetakan/Admin |
| GET    | `/:id`            | Get order detail | Auth             |
| POST   | `/`               | Create order     | Auth             |
| PUT    | `/:id`            | Update order     | Auth             |
| DELETE | `/:id`            | Cancel order     | Auth             |
| POST   | `/:id/konfirmasi` | Confirm order    | Percetakan       |
| PUT    | `/:id/status`     | Update status    | Percetakan       |
| POST   | `/:id/pengiriman` | Create shipment  | Percetakan       |

### Pembayaran (`/api/pembayaran`)

| Method | Endpoint          | Deskripsi          | Auth   |
| ------ | ----------------- | ------------------ | ------ |
| GET    | `/`               | List payments      | Auth   |
| GET    | `/:id`            | Get payment detail | Auth   |
| POST   | `/`               | Create payment     | Auth   |
| POST   | `/:id/konfirmasi` | Confirm payment    | Admin  |
| POST   | `/webhook`        | Payment webhook    | Public |
| GET    | `/statistik`      | Payment stats      | Admin  |

### Upload (`/api/upload`)

| Method | Endpoint          | Deskripsi             | Auth   |
| ------ | ----------------- | --------------------- | ------ |
| POST   | `/single`         | Upload single file    | Auth   |
| POST   | `/multiple`       | Upload multiple files | Auth   |
| GET    | `/template/:type` | Download template     | Public |
| POST   | `/process`        | Process uploaded file | Auth   |

### Notifikasi (`/api/notifikasi`) + WebSocket

| Method | Endpoint    | Deskripsi           | Auth |
| ------ | ----------- | ------------------- | ---- |
| GET    | `/`         | List notifications  | Auth |
| GET    | `/unread`   | Count unread        | Auth |
| PUT    | `/:id/read` | Mark as read        | Auth |
| PUT    | `/read-all` | Mark all as read    | Auth |
| DELETE | `/:id`      | Delete notification | Auth |

**WebSocket Events**:

- `connect` - Client connect
- `notification:new` - New notification
- `notification:read` - Notification read
- `disconnect` - Client disconnect

## 🚀 Optimasi Performance

Publishify mengimplementasikan **4 optimasi performance** utama untuk meningkatkan kecepatan dan efisiensi sistem:

### 1. Redis Cloud Cache ⚡

**Status**: ✅ PRODUCTION READY

**Provider**: Redis Cloud (Free 30MB)  
**Region**: Asia Pacific (Singapore)  
**Version**: 8.2.1

**Implementasi**:

- Global `CacheModule` dengan username authentication
- `CacheService` dengan 7 methods (set, get, delete, wrap, reset, getStats)
- `CacheInterceptor` untuk automatic caching + invalidation
- TTL strategy berdasarkan data type:
  - Master data (kategori, genre): **1 jam**
  - Detail views: **10 menit**
  - List queries: **5 menit**
  - Cursor pagination: **3 menit**

**Endpoint yang Ter-cache**:

```typescript
// Kategori & Genre (TTL 1 jam)
GET /api/kategori/aktif
GET /api/genre/aktif

// Naskah (TTL 5-10 menit)
GET /api/naskah
GET /api/naskah/:id
GET /api/naskah/cursor  // TTL 3 menit
```

**Expected Impact**:

- ⚡ Response time: **-60% hingga -90%**
- 📉 Database load: **-60% hingga -90%**
- 🔥 Cache hit rate: **>80%** (target)

**Test**:

```bash
cd backend
bun run test:redis
```

### 2. Async Logging System 📝

**Status**: ✅ PRODUCTION READY

**Implementasi**:

- Event-driven architecture dengan `@nestjs/event-emitter`
- Buffer: **100 logs**
- Auto-flush: **Every 5 seconds**
- Batch write dengan Prisma `createMany`
- Graceful shutdown dengan flush on exit

**Components**:

```typescript
// AsyncLoggerService
- Buffer logs in memory (max 100)
- Auto-flush every 5 seconds
- Batch write to database

// LoggingInterceptor
- Intercept all HTTP requests
- Emit log events (non-blocking)
- Include timing, status, method, path

// app.module.ts
- Global LoggingInterceptor
- Graceful shutdown handler
```

**Expected Impact**:

- ⚡ Request latency: **-10ms average**
- 📈 Throughput: **+15% to +20%**
- 🔄 Database writes: **Batched (100 logs/5 sec)**

### 3. Database Composite Indexes 🗄️

**Status**: ✅ VERIFIED ACTIVE (12/12)

**Indexes**:

**Naskah (5 indexes)**:

```sql
- naskah_idPenulis_status_idx        -- Dashboard queries
- naskah_status_dibuatPada_idx       -- List dengan filter
- naskah_idKategori_status_idx       -- Category pages
- naskah_publik_diterbitkanPada_idx  -- Public listings
- naskah_dibuatPada_idx              -- Cursor pagination
```

**ReviewNaskah (2 indexes)**:

```sql
- review_naskah_idEditor_status_idx        -- Editor dashboard
- review_naskah_status_ditugaskanPada_idx  -- Review queue
```

**PesananCetak (3 indexes)**:

```sql
- pesanan_cetak_idPemesan_status_idx    -- User orders
- pesanan_cetak_status_tanggalPesan_idx -- Production queue
- pesanan_cetak_tanggalPesan_idx        -- Order history
```

**Pembayaran (2 indexes)**:

```sql
- pembayaran_idPengguna_status_idx  -- User payments
- pembayaran_status_dibuatPada_idx  -- Payment queue
```

**Verification**:

```bash
cd backend
bun run check-indexes.ts
# Expected: ✅ 12/12 composite indexes found
```

**Expected Impact**:

- ⚡ Query execution: **-40% hingga -60%**
- 📊 Complex queries: **-50% hingga -80%**
- 🔍 Index scans vs Seq scans: **95% index usage**

### 4. Cursor-Based Pagination 🔄

**Status**: ✅ PRODUCTION READY

**Implementation**:

- ID-based cursors (UUID)
- Endpoint: `GET /api/naskah/cursor`
- Max: **100 items** per request
- Returns: `nextCursor`, `prevCursor`, `hasMore`

**Usage**:

```typescript
// First request
GET /api/naskah/cursor?limit=20

// Response
{
  data: [...], // 20 items
  metadata: {
    nextCursor: "uuid-of-last-item",
    hasMore: true,
    total: 150
  }
}

// Next page
GET /api/naskah/cursor?cursor=uuid-of-last-item&limit=20
```

**Benefits**:

- ⚡ Deep pagination: **-95% latency**
- 📊 Performance: **Constant O(1)** regardless of offset
- 🎯 Use case: Infinite scroll, mobile apps

**Expected Impact**:

- ⚡ Page 1: **~10ms** (same as offset)
- ⚡ Page 100: **~10ms** (vs **~1000ms** with offset)
- 📱 Mobile: **Infinite scroll tanpa lag**

### Performance Monitoring

**Check Cache Stats**:

```bash
# Via API endpoint
GET /api/cache/stats

# Expected response
{
  hitRate: 85.5,
  totalHits: 1234,
  totalMisses: 210,
  keysCount: 45
}
```

**Check Log Buffer**:

```bash
# Logs in console
[AsyncLoggerService] Buffer: 47/100 logs
[AsyncLoggerService] Flushing 47 logs to database
[AsyncLoggerService] ✅ 47 logs persisted
```

**Check Database Indexes**:

```bash
cd backend
bun run check-indexes.ts
```

**Expected Overall Performance**:
| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Avg Response Time | 200ms | 50ms | **-75%** |
| Database Queries | 100/sec | 30/sec | **-70%** |
| Throughput | 100 req/sec | 180 req/sec | **+80%** |
| Cache Hit Rate | 0% | 85% | **+85%** |

## 🧪 Testing

### Unit Testing

```bash
cd backend

# Run all unit tests
bun test

# Watch mode
bun test:watch

# Coverage
bun test:cov
```

**Test Coverage Target**: >80%

### E2E Testing

```bash
cd backend

# Run E2E tests
bun test:e2e
```

**Test Suites**:

- Authentication flow (register, login, verify, logout)
- CRUD operations (naskah, kategori, genre)
- Review workflow
- Payment processing
- File upload

### Integration Testing

```bash
cd backend

# Run integration tests
bun test -- --testPathPattern=integration
```

**Integration Tests**:

- Database operations
- Cache integration
- Email sending
- File storage (Supabase)
- WebSocket connections

### Redis Testing

```bash
cd backend
bun run test:redis
```

**Expected Output**:

```
Configuration:
  Host: redis-10660.c292.ap-southeast-1-1.ec2.redns.redis-cloud.com
  Port: 10660
  Username: default

✅ Redis connected successfully!
✅ PING: PONG
✅ SET/GET operations passed
✅ TTL operations passed
✅ INCR operations passed
✅ HGET operations passed
✅ Total keys in DB: 4
🎉 All Redis tests passed!
Redis Version: 8.2.1
```

### Load Testing (Coming Soon)

```bash
# Install k6
bun add -g k6

# Run load test
k6 run tests/load/naskah-list.js
```

## 🚢 Deployment

### Production Checklist

- [ ] **Environment Variables**: Update semua `.env` dengan production values
- [ ] **Database**: Setup production PostgreSQL (Supabase recommended)
- [ ] **Redis**: Setup production Redis (Redis Cloud atau Upstash)
- [ ] **File Storage**: Configure Supabase Storage buckets
- [ ] **SMTP**: Setup email service (Gmail, SendGrid, Resend)
- [ ] **Domain**: Setup custom domain & DNS
- [ ] **SSL**: Configure SSL certificates (Let's Encrypt)
- [ ] **Monitoring**: Setup logging & monitoring (Sentry, LogRocket)
- [ ] **Backup**: Configure automated database backups
- [ ] **CI/CD**: Setup GitHub Actions atau GitLab CI

### Deployment Options

#### Option 1: Vercel (Frontend) + Railway (Backend)

**Frontend (Vercel)**:

```bash
cd frontend

# Install Vercel CLI
bun add -g vercel

# Deploy
vercel --prod
```

**Backend (Railway)**:

```bash
cd backend

# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Init project
railway init

# Deploy
railway up
```

#### Option 2: Docker Compose

```bash
# Build images
docker-compose build

# Run containers
docker-compose up -d

# Check logs
docker-compose logs -f
```

#### Option 3: VPS (Ubuntu/Debian)

**Backend**:

```bash
# Install Bun
curl -fsSL https://bun.sh/install | bash

# Clone repo
git clone <repo-url>
cd publishify/backend

# Install dependencies
bun install

# Build
bun run build

# Run with PM2
bun add -g pm2
pm2 start dist/main.js --name publishify-backend
pm2 save
pm2 startup
```

**Frontend**:

```bash
cd publishify/frontend

# Build
bun run build

# Serve with serve atau nginx
bun add -g serve
serve -s out -l 3000
```

**Nginx Configuration**:

```nginx
# Frontend
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Backend API
server {
    listen 80;
    server_name api.your-domain.com;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Database Migration

```bash
cd backend

# Production migration
bun prisma migrate deploy

# Generate Prisma Client
bun prisma generate

# Seed data (optional)
bun prisma db seed
```

### Environment Setup

**Backend Production `.env`**:

```bash
NODE_ENV=production
PORT=4000
FRONTEND_URL=https://your-domain.com

DATABASE_URL=<production-database-url>
DIRECT_URL=<production-direct-url>

JWT_SECRET=<strong-random-secret-64-chars>
JWT_REFRESH_SECRET=<strong-random-secret-64-chars>

REDIS_HOST=<production-redis-host>
REDIS_PORT=<production-redis-port>
REDIS_PASSWORD=<production-redis-password>

SUPABASE_URL=<production-supabase-url>
SUPABASE_KEY=<production-supabase-key>

SMTP_HOST=<production-smtp-host>
SMTP_USER=<production-smtp-user>
SMTP_PASS=<production-smtp-password>
```

**Frontend Production `.env.local`**:

```bash
NEXT_PUBLIC_API_URL=https://api.your-domain.com/api
NEXT_PUBLIC_WS_URL=https://api.your-domain.com
NEXT_PUBLIC_SUPABASE_URL=<production-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<production-anon-key>
```

### Monitoring & Logging

**Recommended Tools**:

- **Sentry**: Error tracking & monitoring
- **LogRocket**: Session replay & analytics
- **Uptime Robot**: Uptime monitoring
- **Grafana**: Metrics visualization
- **Prometheus**: Metrics collection

## 🤝 Kontribusi

Kami sangat terbuka untuk kontribusi dari komunitas! Berikut cara berkontribusi:

### 1. Fork Repository

```bash
# Fork via GitHub UI
# Clone fork Anda
git clone https://github.com/your-username/publishify.git
cd publishify
```

### 2. Buat Branch Baru

```bash
# Feature branch
git checkout -b fitur/nama-fitur

# Bug fix branch
git checkout -b perbaikan/nama-bug
```

### 3. Commit Changes

```bash
# Stage changes
git add .

# Commit dengan pesan yang jelas (Bahasa Indonesia)
git commit -m "feat: tambah fitur upload multiple files"
git commit -m "fix: perbaiki bug pagination di halaman naskah"
git commit -m "docs: perbarui dokumentasi API"
```

**Commit Message Convention**:

- `feat:` - Fitur baru
- `fix:` - Bug fix
- `docs:` - Perubahan dokumentasi
- `style:` - Formatting, missing semicolons, dll
- `refactor:` - Code refactoring
- `test:` - Menambah atau memperbaiki tests
- `chore:` - Maintenance tasks

### 4. Push & Create Pull Request

```bash
# Push ke fork Anda
git push origin fitur/nama-fitur

# Buat Pull Request via GitHub UI
```

### Code Style Guidelines

**TypeScript**:

- Gunakan **Bahasa Indonesia** untuk variabel, function, class names
- camelCase untuk variabel & functions: `ambilDataNaskah()`
- PascalCase untuk classes & interfaces: `BuatNaskahDto`
- SCREAMING_SNAKE_CASE untuk constants: `MAX_UPLOAD_SIZE`

**Penamaan**:

```typescript
// ✅ BENAR
const ambilSemuaNaskah = async () => { ... }
interface DataPengguna { ... }
const BATAS_UPLOAD_FILE = 10 * 1024 * 1024;

// ❌ SALAH
const getAllManuscripts = async () => { ... }
interface UserData { ... }
const MAX_FILE_SIZE = 10 * 1024 * 1024;
```

**String & Response**:

- WAJIB Bahasa Indonesia untuk semua pesan user-facing
- Error messages dalam Bahasa Indonesia
- Success messages dalam Bahasa Indonesia

```typescript
// ✅ BENAR
throw new Error("Naskah tidak ditemukan");
return { pesan: "Data berhasil disimpan" };

// ❌ SALAH
throw new Error("Manuscript not found");
return { message: "Data saved successfully" };
```

### Testing Requirements

- Semua fitur baru **HARUS** disertai unit tests
- Bug fixes **HARUS** disertai regression tests
- Test coverage minimal **80%**

```bash
# Run tests sebelum commit
bun test

# Check coverage
bun test:cov
```

### Documentation Requirements

- Update `README.md` jika ada perubahan arsitektur
- Update API docs di Swagger
- Tambah komentar untuk logic yang kompleks
- Update `CHANGELOG.md` (coming soon)

## 📄 Lisensi

Proyek ini dilisensikan di bawah **MIT License**.

```
MIT License

Copyright (c) 2025 M. Ikhsan Pasaribu

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

Lihat file [LICENSE](LICENSE) untuk detail lengkap.

## 📞 Kontak & Support

- **Email**: support@publishify.com (coming soon)
- **GitHub Issues**: [Create an issue](https://github.com/your-org/publishify/issues)
- **Documentation**: [Wiki](https://github.com/your-org/publishify/wiki) (coming soon)
- **Discord**: [Join our community](https://discord.gg/publishify) (coming soon)

## 🙏 Acknowledgments

Terima kasih kepada semua kontributor dan tools/libraries yang membuat proyek ini possible:

- [Next.js](https://nextjs.org/) - React framework
- [NestJS](https://nestjs.com/) - Node.js framework
- [Prisma](https://www.prisma.io/) - ORM
- [Supabase](https://supabase.com/) - Database & storage
- [Redis Cloud](https://redis.com/cloud/) - Cache
- [Bun](https://bun.sh/) - JavaScript runtime
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework

---

**Built with ❤️ by Publishify Team**

_Last updated: 2025-01-11_
