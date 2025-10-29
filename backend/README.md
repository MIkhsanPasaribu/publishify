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

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@publishify.com | Password123! |
| Editor | editor@publishify.com | Password123! |
| Penulis | penulis@publishify.com | Password123! |
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
