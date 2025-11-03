# Publishify Backend

Backend API untuk Sistem Penerbitan Naskah Publishify menggunakan NestJS 10+ dan Bun runtime.

## 🚀 Quick Start

```bash
# Install dependencies
bun install

# Setup database
bun prisma generate
bun prisma migrate dev
bun prisma db seed

# Run development server
bun run start:dev
```

Server akan berjalan di: http://localhost:4000

API Documentation (Swagger): http://localhost:4000/api/docs

## 🌐 Available Endpoints

### Root & Health

- `GET /` - API information dan status
- `GET /health` - Health check endpoint
- `GET /api` - API info dengan daftar endpoint

### Authentication (`/api/auth`)

- `POST /api/auth/register` - Registrasi pengguna baru
- `POST /api/auth/login` - Login pengguna
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout pengguna
- `POST /api/auth/forgot-password` - Request reset password
- `POST /api/auth/reset-password` - Reset password dengan token
- `POST /api/auth/verify-email` - Verifikasi email

### Pengguna (`/api/pengguna`)

- `GET /api/pengguna` - Daftar pengguna
- `GET /api/pengguna/:id` - Detail pengguna
- `PUT /api/pengguna/:id` - Update pengguna
- `DELETE /api/pengguna/:id` - Hapus pengguna

### Naskah (`/api/naskah`)

- `GET /api/naskah` - Daftar naskah
- `POST /api/naskah` - Buat naskah baru
- `GET /api/naskah/:id` - Detail naskah
- `PUT /api/naskah/:id` - Update naskah
- `DELETE /api/naskah/:id` - Hapus naskah

### Review (`/api/review`)

- `GET /api/review` - Daftar review
- `POST /api/review` - Buat review
- `GET /api/review/:id` - Detail review
- `PUT /api/review/:id` - Update review
- `POST /api/review/:id/feedback` - Tambah feedback

### Percetakan (`/api/percetakan`)

- `GET /api/percetakan` - Daftar pesanan cetak
- `POST /api/percetakan` - Buat pesanan cetak
- `GET /api/percetakan/:id` - Detail pesanan
- `PUT /api/percetakan/:id` - Update status pesanan

### Pembayaran (`/api/pembayaran`)

- `GET /api/pembayaran` - Daftar pembayaran
- `POST /api/pembayaran` - Buat pembayaran
- `GET /api/pembayaran/:id` - Detail pembayaran
- `PUT /api/pembayaran/:id` - Update status pembayaran

### Notifikasi (`/api/notifikasi`)

- `GET /api/notifikasi` - Daftar notifikasi
- `PUT /api/notifikasi/:id/read` - Mark as read
- WebSocket: `ws://localhost:4000/notifikasi`

### Upload (`/api/upload`)

- `POST /api/upload` - Upload file (naskah, sampul, gambar, dokumen)

> 📝 **Note**: Semua endpoint (kecuali `/`, `/health`, `/api`, dan `/api/auth/*`) memerlukan **Authentication Bearer Token**

## 📚 Dokumentasi Lengkap

Lihat dokumentasi lengkap di folder `docs/`:

- [Backend README](../docs/backend-readme.md) - Setup & Development Guide
- [API Documentation](http://localhost:4000/api/docs) - Swagger UI (saat server running)
- [Database Schema](../docs/database-schema.md) - ERD dan penjelasan tabel

## 🛠️ Tech Stack

- **Runtime**: Bun v1.0+
- **Framework**: NestJS 10+
- **Database**: PostgreSQL 14+ dengan Prisma ORM
- **Authentication**: JWT + Passport
- **Real-time**: Socket.io
- **Queue**: Bull + Redis
- **Validation**: Zod + class-validator
- **Documentation**: Swagger/OpenAPI

## 📋 Available Scripts

```bash
# Development
bun run start          # Start in normal mode
bun run start:dev      # Start with watch mode
bun run start:debug    # Start with debug mode

# Build
bun run build          # Build for production

# Production
bun run start:prod     # Run production build

# Database
bun prisma generate    # Generate Prisma Client
bun prisma migrate dev # Run migrations
bun prisma studio      # Open Prisma Studio
bun prisma db seed     # Seed database

# Testing
bun test               # Run unit tests
bun test:watch         # Run tests in watch mode
bun test:cov           # Run tests with coverage
bun test:e2e           # Run e2e tests

# Code Quality
bun run lint           # Lint code
bun run format         # Format code
```

## 🔐 Default Users (After Seeding)

| Role       | Email                     | Password     |
| ---------- | ------------------------- | ------------ |
| Admin      | admin@publishify.com      | Password123! |
| Editor     | editor@publishify.com     | Password123! |
| Penulis    | penulis@publishify.com    | Password123! |
| Percetakan | percetakan@publishify.com | Password123! |

## 📁 Struktur Project

```
src/
├── main.ts                 # Entry point
├── app.module.ts           # Root module
├── modules/                # Feature modules
│   ├── auth/              # Authentication
│   ├── pengguna/          # User management
│   ├── naskah/            # Manuscript management
│   ├── review/            # Review system
│   ├── percetakan/        # Printing management
│   ├── pembayaran/        # Payment system
│   ├── notifikasi/        # Notifications (WebSocket)
│   └── upload/            # File upload
├── common/                # Shared resources
├── config/                # Configuration
├── prisma/                # Prisma service
└── utils/                 # Utilities
```

## 🌍 Environment Variables

Copy `.env.example` ke `.env` dan sesuaikan:

```env
NODE_ENV=development
PORT=4000
DATABASE_URL="postgresql://user:password@localhost:5432/publishify"
JWT_SECRET=your-secret-key
REDIS_HOST=localhost
REDIS_PORT=6379
# ... dan lainnya
```

## 📞 Support

Untuk informasi lebih lanjut, lihat dokumentasi lengkap di folder `docs/`.
