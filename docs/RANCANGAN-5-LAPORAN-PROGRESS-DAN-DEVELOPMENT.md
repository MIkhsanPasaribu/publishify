# 📋 RANCANGAN 5 LAPORAN PROGRESS & 5 LAPORAN DEVELOPMENT STEP BY STEP

**Project**: Publishify - Sistem Penerbitan Naskah Digital  
**Tanggal Pembuatan Rancangan**: 30 Desember 2025  
**Status**: Draft Rancangan Lengkap  
**Tujuan**: Dokumentasi bertahap dan menyeluruh pengembangan Publishify dari awal hingga selesai

---

## 🎯 STRATEGI PEMBAGIAN 5 FASE

Berdasarkan analisis mendalam terhadap struktur project, database schema, backend API, frontend pages, dan dokumentasi yang ada, berikut adalah pembagian 5 fase development yang logis dan sistematis:

### **FASE 1: FOUNDATION & CORE INFRASTRUCTURE** (Minggu 1-2)

Membangun fondasi teknis, arsitektur sistem, database, dan autentikasi dasar.

### **FASE 2: USER MANAGEMENT & CONTENT SYSTEM** (Minggu 3-4)

Implementasi manajemen pengguna, profil, dan sistem manajemen naskah (CRUD).

### **FASE 3: REVIEW WORKFLOW & EDITOR SYSTEM** (Minggu 5-6)

Membangun sistem review editorial lengkap dengan assignment dan feedback mechanism.

### **FASE 4: PRINTING & ORDER MANAGEMENT** (Minggu 7-8)

Implementasi sistem percetakan, tarif dinamis, tracking produksi, dan pengiriman.

### **FASE 5: INTEGRATION, OPTIMIZATION & DEPLOYMENT** (Minggu 9-10)

Integrasi seluruh modul, optimasi performa, testing menyeluruh, dan deployment production.

---

## 📊 OVERVIEW KONTEN SETIAP LAPORAN

| Fase  | Laporan Progress                                               | Laporan Development Step by Step                                         |
| ----- | -------------------------------------------------------------- | ------------------------------------------------------------------------ |
| **1** | Arsitektur, Tech Stack, Database Design, Auth Basic            | Setup Project, Konfigurasi Tools, Schema Prisma, JWT Auth Implementation |
| **2** | CRUD Naskah, User Profiles, Kategori/Genre, File Upload        | API Naskah, Upload Service, Frontend Form, State Management              |
| **3** | Review Assignment, Feedback System, Editor Dashboard           | Review Service, Assignment Logic, Timeline, Feedback API                 |
| **4** | Pesanan Cetak, Tarif Percetakan, Tracking Produksi, Pengiriman | Percetakan Module, Kalkulasi Harga, Status Workflow, Shipping            |
| **5** | Testing E2E, Performance Optimization, Security, Deployment    | Redis Cache, Query Optimization, RLS, Docker, Production Deploy          |

---

# 📁 FASE 1: FOUNDATION & CORE INFRASTRUCTURE

**Periode**: Minggu 1-2  
**Focus**: Membangun fondasi teknis yang solid untuk seluruh aplikasi  
**Output**: Backend API dasar berjalan, Frontend layout ready, Database schema complete

---

## 📋 LAPORAN PROGRESS FASE 1

### **File**: `LAPORAN-PROGRESS-FASE-1-FOUNDATION.md`

#### **Konten yang Harus Dibahas:**

### 1. SETUP PROJECT & ENVIRONMENT

#### 1.1 Inisialisasi Monorepo

- **Struktur Folder**:
  ```
  publishify/
  ├── frontend/          # Next.js 14 App
  ├── backend/           # NestJS API
  ├── docs/              # Dokumentasi
  ├── .github/           # CI/CD workflows
  └── README.md
  ```
- **Git Repository**: Setup GitHub repository dengan branch strategy (main, development)
- **Node Version**: Bun v1.0+ sebagai runtime & package manager
- **Package Managers**: Mengapa pilih Bun vs npm/yarn/pnpm

#### 1.2 Backend Setup (NestJS)

- **Tech Stack Decision**:
  - Framework: NestJS 10+ (TypeScript-first, modular architecture)
  - Runtime: Bun (faster than Node.js)
  - API Type: REST API + WebSocket
- **Dependencies Installed** (15+ packages):
  - Core: `@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express`
  - Database: `@prisma/client`, `prisma`
  - Auth: `@nestjs/jwt`, `@nestjs/passport`, `passport-jwt`, `bcryptjs`
  - Validation: `class-validator`, `class-transformer`, `zod`
  - Real-time: `@nestjs/websockets`, `@nestjs/platform-socket.io`
  - File Upload: `multer`, `sharp`
  - Cache: `cache-manager`, `cache-manager-redis-yet`, `ioredis`
  - Documentation: `@nestjs/swagger`
  - Security: `helmet`, `cors`, `@nestjs/throttler`
- **Folder Structure**:
  ```
  backend/src/
  ├── modules/          # Feature modules
  ├── common/           # Shared resources
  ├── config/           # Configuration files
  ├── prisma/           # Database service
  └── utils/            # Helper functions
  ```
- **Environment Variables**: 15+ env vars (DATABASE_URL, JWT_SECRET, REDIS_URL, dll)

#### 1.3 Frontend Setup (Next.js)

- **Tech Stack Decision**:
  - Framework: Next.js 14+ (App Router, Server Components)
  - UI Library: React 19
  - Styling: Tailwind CSS 4 + shadcn/ui
  - Type Safety: TypeScript 5+
- **Dependencies Installed** (20+ packages):
  - Core: `next`, `react`, `react-dom`
  - UI Components: `@radix-ui/*` (10+ komponen), `lucide-react`, `recharts`
  - Data Fetching: `@tanstack/react-query`, `axios`
  - State: `zustand`
  - Forms: `react-hook-form`, `zod`, `@hookform/resolvers`
  - Real-time: `socket.io-client`
  - File Upload: `react-dropzone`
  - Rich Text: `@tiptap/react`, `@tiptap/starter-kit`
  - Notifications: `sonner`
- **Folder Structure**:
  ```
  frontend/
  ├── app/              # Pages (App Router)
  ├── components/       # UI Components
  ├── lib/              # Utilities & API clients
  ├── stores/           # Zustand stores
  ├── types/            # TypeScript types
  └── public/           # Static assets
  ```

---

### 2. DATABASE DESIGN & ARCHITECTURE

#### 2.1 Database Selection

- **Pilihan**: PostgreSQL 14+ via Supabase
- **Alasan**:
  - Relational database yang powerful
  - Support untuk full-text search
  - JSONB untuk flexible data
  - Row Level Security (RLS) built-in
  - Real-time subscriptions via Supabase
  - Free tier yang generous untuk development

#### 2.2 Schema Design - 28 Tabel

**Grouped by Domain:**

##### A. User Management (4 tabel)

- `pengguna`: Core user authentication & data
  - Fields: id, email, kataSandi, telepon, googleId, provider, aktif, terverifikasi
  - OAuth support: Google, Facebook, Apple
  - Timestamps: loginTerakhir, emailDiverifikasiPada, dibuatPada, diperbaruiPada
- `profil_pengguna`: User profile details (1-to-1)
  - Fields: namaDepan, namaBelakang, bio, urlAvatar, tanggalLahir, alamat, kota, provinsi
- `peran_pengguna`: RBAC roles (1-to-many)
  - Enum: `penulis`, `editor`, `percetakan`, `admin`
  - Support multiple roles per user
- `profil_penulis`: Extended profile for authors (1-to-1 optional)
  - Fields: namaPena, biografi, spesialisasi, totalBuku, ratingRataRata
  - Bank info: namaRekeningBank, namaBank, nomorRekeningBank, npwp

##### B. Content Management (8 tabel)

- `naskah`: Manuscript core data
  - 17+ fields: judul, sinopsis, isbn, kategori, genre, formatBuku, status, urlSampul, urlFile
  - Enum StatusNaskah (7 states): draft → diajukan → dalam_review → perlu_revisi → disetujui → ditolak → diterbitkan
  - Financial: biayaProduksi, hargaJual
  - Indexes: 6 composite indexes untuk query optimization
- `kategori`: Hierarchical categories (self-referential)
  - Support parent-child relationship (idInduk)
  - Slug untuk URL-friendly
- `genre`: Book genres
  - Flat structure (non-hierarchical)
- `tag`: Flexible tagging
- `tag_naskah`: Many-to-many junction table
- `revisi_naskah`: Version control untuk naskah
  - Fields: versi (int), catatan, urlFile
  - Unique constraint: (idNaskah, versi)

##### C. Review System (3 tabel)

- `review_naskah`: Editorial review assignments
  - Enum StatusReview: ditugaskan → dalam_proses → selesai → dibatalkan
  - Enum Rekomendasi: setujui | revisi | tolak
  - Timeline: ditugaskanPada, dimulaiPada, selesaiPada
- `feedback_review`: Per-aspect feedback
  - Fields: aspek, komentar, skor (1-5)
  - Many feedback items per review

##### D. Printing System (5 tabel)

- `pesanan_cetak`: Print orders
  - Enum StatusPesanan (9 states): tertunda → diterima → dalam_produksi → kontrol_kualitas → siap → dikirim → terkirim → selesai → dibatalkan
  - Spec fields: formatBuku, jenisKertas, jenisCover, cetakWarna, jumlah
  - Financial: totalBiaya, biayaProduksi, biayaPengiriman
- `log_produksi`: Production tracking logs
  - Auto-generated logs untuk setiap perubahan status
- `pengiriman`: Shipping information
  - Fields: ekspedisi, nomorResi, estimasiTiba, tanggalKirim
  - Enum StatusPengiriman: diproses → dalam_perjalanan → terkirim → gagal
- `tracking_log`: Shipping status history
- `parameter_harga_percetakan`: Dynamic pricing schema
  - JSON field: komponenHarga (flexible pricing components)
  - Versioning: aktif boolean, berlakuMulai, berlakuHingga

##### E. Payment System (2 tabel)

- `pembayaran`: Payment transactions
  - Enum StatusPembayaran: tertunda → diproses → berhasil → gagal → dibatalkan → dikembalikan
  - Enum MetodePembayaran: transfer_bank | kartu_kredit | e_wallet | virtual_account | cod
  - Fields: buktiPembayaran (URL), nomor referensi

##### F. Notification & Auth (4 tabel)

- `notifikasi`: In-app notifications
  - Enum TipeNotifikasi: info | sukses | peringatan | error
  - Boolean: dibaca, dilihat
- `token_refresh`: JWT refresh tokens
  - Token management untuk session handling
- `log_aktivitas`: Activity audit logs
  - Fields: aksi, deskripsi, ipAddress, userAgent
  - Enum Platform: web | mobile
- `oauth_state`: OAuth flow state management
  - CSRF protection untuk OAuth

##### G. Analytics & Files (3 tabel)

- `statistik_naskah`: Manuscript analytics
  - Metrics: totalDilihat, totalDiunduh, totalDibeli
- `rating_review`: User ratings untuk naskah
  - 1-5 star rating system
- `file`: File storage metadata
  - Track all uploaded files (naskah, sampul, gambar, dokumen)
  - Fields: namaFile, jenisFile, ukuran, mimetype, urlFile

#### 2.3 Prisma ORM Configuration

- **Generator**: `prisma-client-js` dengan preview features
- **Extensions**: `pgcrypto` untuk UUID generation
- **Naming Convention**:
  - Model names: PascalCase dalam bahasa Indonesia
  - Table names: snake_case via `@@map`
  - Enum: PascalCase dengan `@@map` ke snake_case
- **Relations**: Proper cascade delete, indexes, unique constraints
- **Migrations Strategy**:
  - Migration files dengan timestamp
  - Rollback capability
  - Seed data untuk testing

#### 2.4 ERD (Entity Relationship Diagram)

- **7 Domain-Specific ERDs** sudah dibuat:
  - `erd-1-user-management.md`
  - `erd-2-content-management.md`
  - `erd-3-review-system.md`
  - `erd-4-printing-shipping.md`
  - `erd-5-payment-system.md`
  - `erd-6-auth-notification.md`
  - `erd-7-analytics-files.md`
- **Dokumentasi**: `database-schema.md` dengan penjelasan detail setiap tabel

---

### 3. AUTHENTICATION & AUTHORIZATION

#### 3.1 Authentication Strategy

- **Primary**: JWT (JSON Web Tokens)
  - Access Token: 1 hour expiry
  - Refresh Token: 7 days expiry (stored in DB)
- **Secondary**: OAuth 2.0 (Google Sign-In)
  - Provider: Google OAuth via `passport-google-oauth20`
  - Callback flow: `/auth/google/callback`
  - State management untuk CSRF protection

#### 3.2 Backend Auth Implementation

- **Module**: `modules/auth/`
- **Services**:
  - `auth.service.ts`:
    - `register()`: Hash password dengan bcrypt, create user + profile
    - `login()`: Validate credentials, generate JWT tokens
    - `refreshToken()`: Issue new access token dari refresh token
    - `googleAuth()`: Handle OAuth callback, create/link account
- **Guards**:
  - `jwt-auth.guard.ts`: Protect routes, extract user dari token
  - `roles.guard.ts`: RBAC implementation, check user roles
- **Strategies**:
  - `jwt.strategy.ts`: Passport JWT strategy
  - `local.strategy.ts`: Username/password validation
  - `google.strategy.ts`: Google OAuth strategy (jika diimplementasi)
- **DTOs**:
  - `register.dto.ts`: Email, password validation dengan class-validator
  - `login.dto.ts`: Email, password required
  - `refresh-token.dto.ts`: refreshToken required
- **Decorators**:
  - `@Public()`: Mark routes as public (skip auth)
  - `@PenggunaSaatIni()`: Extract current user dari request
  - `@Peran()`: Define required roles untuk access control

#### 3.3 RBAC (Role-Based Access Control)

- **4 Roles**:

  1. **Penulis** (Author):
     - Upload & manage own naskah
     - View review feedback
     - Order printing
     - View own statistics
  2. **Editor**:
     - View assigned reviews
     - Self-assign from queue
     - Submit review & feedback
     - View editor dashboard
  3. **Percetakan** (Printing Partner):
     - Manage print orders
     - Update production status
     - Manage shipping
     - View financial reports
  4. **Admin**:
     - Full system access
     - Assign editors to reviews
     - Manage users & roles
     - Approve/reject naskah
     - System monitoring

- **Implementation**:
  - Multiple roles per user via `peran_pengguna` table
  - Guard decorator: `@UseGuards(JwtAuthGuard, PeranGuard)`
  - Role check: `@Peran('penulis', 'admin')`

#### 3.4 Frontend Auth Implementation

- **Auth Store** (Zustand): `stores/use-auth-store.ts`
  - State: `pengguna`, `token`, `isAuthenticated`
  - Actions: `login()`, `logout()`, `refreshToken()`, `setPengguna()`
- **Auth Pages**:
  - `/login`: Email/password form + Google OAuth button
  - `/register`: Registration form dengan validasi kompleks
  - `/lupa-password`: Email untuk reset link (planned)
- **Protected Routes**:
  - Middleware: `middleware.ts` check auth status
  - Auto redirect ke `/login` jika belum authenticated
- **Token Storage**: localStorage dengan key `publishify_token`
- **API Client**: Axios interceptor untuk attach Bearer token

#### 3.5 Password Security

- **Hashing**: bcrypt dengan salt rounds 10
- **Requirements**:
  - Minimum 8 characters
  - At least 1 uppercase letter
  - At least 1 number
  - At least 1 special character
- **Frontend Validation**: Real-time indicator di register form

#### 3.6 Session Management

- **Token Refresh Flow**:
  1. Access token expire (1 hour)
  2. Frontend detects 401 Unauthorized
  3. Call `/auth/refresh` dengan refresh token
  4. Get new access token
  5. Retry failed request
- **Logout**:
  - Delete refresh token dari DB
  - Clear localStorage
  - Redirect ke `/login`

---

### 4. BACKEND CORE ARCHITECTURE

#### 4.1 Module Structure

- **Feature Modules** (10 modules):

  1. `auth`: Authentication & authorization
  2. `pengguna`: User management
  3. `naskah`: Manuscript CRUD
  4. `kategori`: Category management
  5. `genre`: Genre management
  6. `review`: Review system
  7. `percetakan`: Printing management
  8. `pembayaran`: Payment handling
  9. `notifikasi`: Notifications & WebSocket
  10. `upload`: File upload service

- **Common Module**: Shared resources

  - `cache/`: Redis caching service & decorator
  - `decorators/`: Custom decorators (@Public, @PenggunaSaatIni, dll)
  - `dto/`: Base DTOs (pagination, cursor)
  - `filters/`: Exception filters (HTTP, Prisma)
  - `guards/`: Auth guards
  - `interceptors/`: Logging, timeout, transform
  - `interfaces/`: TypeScript interfaces
  - `logger/`: Async logger service dengan Winston
  - `middlewares/`: Prisma RLS middleware
  - `pipes/`: Validation pipes (Zod, UUID)

- **Config Module**: Configuration management

  - `database.config.ts`: PostgreSQL connection
  - `jwt.config.ts`: JWT secrets & expiry
  - `redis.config.ts`: Redis connection
  - `email.config.ts`: SMTP settings (planned)
  - `google-oauth.config.ts`: OAuth credentials

- **Prisma Module**: Database service
  - `prisma.service.ts`: Singleton PrismaClient dengan logging

#### 4.2 Request/Response Pattern

- **Success Response**:

  ```typescript
  {
    sukses: true,
    pesan: "Operasi berhasil",
    data: {...},
    metadata?: {
      total: 100,
      halaman: 1,
      limit: 20,
      totalHalaman: 5
    }
  }
  ```

- **Error Response**:
  ```typescript
  {
    sukses: false,
    pesan: "Error message",
    error: {
      kode: "ERROR_CODE",
      detail: "Detailed error info",
      field: "fieldName" (for validation),
      timestamp: "2025-12-30T10:00:00Z"
    }
  }
  ```

#### 4.3 Validation Strategy

- **DTO Validation**: class-validator decorators
- **Zod Validation**: Custom pipe `ValidasiZodPipe`
- **UUID Validation**: Custom pipe `ParseUUIDPipe`
- **Example**:
  ```typescript
  @Post()
  async create(@Body(new ValidasiZodPipe(schema)) dto: CreateDto) {
    // dto is validated against Zod schema
  }
  ```

#### 4.4 Error Handling

- **Global Exception Filter**: `HttpExceptionFilter`
  - Catch all exceptions
  - Format error response
  - Log errors dengan Winston
- **Prisma Exception Filter**: `PrismaExceptionFilter`
  - Handle Prisma-specific errors (unique constraint, FK violation, dll)
  - Convert ke user-friendly messages dalam bahasa Indonesia

#### 4.5 Logging System

- **Service**: `AsyncLoggerService` dengan Winston
- **Features**:
  - Async logging (non-blocking)
  - Multiple transports: console, file, remote (planned)
  - Log levels: error, warn, info, debug
  - Structured logging dengan metadata
- **Interceptor**: `LoggingInterceptor`
  - Log semua request/response
  - Include: method, URL, status, duration, user ID

#### 4.6 Security Middleware

- **Helmet**: HTTP security headers
- **CORS**: Cross-origin resource sharing
  - Allow frontend origin (http://localhost:3000)
  - Credentials: true
- **Throttler**: Rate limiting
  - 10 requests per 60 seconds default
  - Different limits per endpoint (planned)

#### 4.7 API Documentation

- **Swagger UI**: http://localhost:4000/api/docs
- **Features**:
  - Auto-generated dari decorators (@ApiOperation, @ApiResponse, dll)
  - Try-it-out functionality
  - Schema definitions
  - Bearer auth testing
- **Custom Tags**:
  - @ApiTags('auth'), @ApiTags('naskah'), dll
  - Grouping endpoints by feature

---

### 5. FRONTEND CORE ARCHITECTURE

#### 5.1 Routing Structure (App Router)

- **Route Groups**:
  - `(auth)`: Public auth pages (login, register)
  - `(dashboard)`: Protected dashboard routes
  - `(admin)`: Admin-specific routes
  - `(editor)`: Editor-specific routes
  - `(penulis)`: Penulis-specific routes
  - `(percetakan)`: Percetakan-specific routes
- **Layouts**:
  - Root layout: `app/layout.tsx`
  - Auth layout: `app/(auth)/layout.tsx` (centered, no sidebar)
  - Dashboard layout: `app/(dashboard)/dashboard/layout.tsx` (sidebar + header)
  - Role-specific layouts untuk admin, editor, dll

#### 5.2 Component Architecture

- **UI Components** (shadcn/ui): 15+ base components
  - `button.tsx`, `input.tsx`, `card.tsx`, `dialog.tsx`, `table.tsx`, dll
  - Atomic design principles
  - Tailwind + CVA (Class Variance Authority)
- **Layout Components**:
  - `sidebar.tsx`: Main navigation untuk penulis
  - `sidebar-admin.tsx`: Admin navigation
  - `user-header.tsx`: User info + notifications
- **Feature Components**:

  - `naskah/`: Kartu naskah, form naskah, grid naskah
  - `review/`: Kartu review, form feedback
  - `percetakan/`: Status badges, tracking timeline

- **Shared Components**:
  - `loading.tsx`: Loading states
  - `error.tsx`: Error boundaries
  - `not-found.tsx`: 404 pages

#### 5.3 State Management

- **Global State** (Zustand):
  - `use-auth-store.ts`: Authentication state
  - `use-ui-store.ts`: UI state (sidebar open, modal state)
- **Server State** (React Query):
  - Caching strategy
  - Stale time: 5 minutes
  - Cache time: 30 minutes
  - Auto refetch on window focus
  - Query keys: `['naskah', id]`, `['review', 'list']`, dll

#### 5.4 API Integration

- **API Client**: `lib/api/client.ts`
  - Axios instance dengan base URL
  - Request interceptor: Attach bearer token
  - Response interceptor: Handle errors, refresh token
- **API Modules** (8 modules):
  - `auth.ts`: login, register, logout, refresh
  - `naskah.ts`: CRUD naskah, ajukan, terbitkan
  - `review.ts`: Daftar review, submit feedback, keputusan
  - `pengguna.ts`: Profil, update, delete
  - `percetakan.ts`: Pesanan, status update, tarif
  - `pembayaran.ts`: Bayar, upload bukti, konfirmasi
  - `upload.ts`: Upload file (naskah, sampul)
  - `admin.ts`: Admin operations (assign editor, dll)

#### 5.5 Form Handling

- **Library**: React Hook Form + Zod
- **Pattern**:

  ```typescript
  const schema = z.object({
    judul: z.string().min(3, "Min 3 karakter"),
    sinopsis: z.string().min(50, "Min 50 kata"),
  });

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {...}
  });
  ```

- **Features**:
  - Real-time validation
  - Error messages dalam bahasa Indonesia
  - Submit state management
  - Loading indicators

#### 5.6 File Upload System

- **Library**: react-dropzone
- **Features**:
  - Drag & drop
  - File type validation
  - File size limit
  - Preview (images)
  - Upload progress bar
- **Endpoints**:
  - POST `/api/upload` with multipart/form-data
  - Return: { url, namaFile, ukuran, mimetype }

---

### 6. DEVELOPMENT ENVIRONMENT

#### 6.1 Development Tools

- **IDE**: VS Code
  - Extensions: ESLint, Prettier, Prisma, Tailwind IntelliSense
- **Database Tools**:
  - Prisma Studio: `bun prisma studio`
  - Supabase Dashboard: https://app.supabase.com
- **API Testing**:
  - Swagger UI: http://localhost:4000/api/docs
  - Postman collection (optional)
- **Git Client**: GitHub Desktop / Git CLI

#### 6.2 Scripts & Commands

**Backend**:

```bash
bun install                 # Install dependencies
bun prisma generate         # Generate Prisma Client
bun prisma migrate dev      # Run migrations
bun prisma db seed          # Seed database
bun run start:dev           # Start dev server (watch mode)
bun run build               # Build production
bun run start:prod          # Start production server
bun run test                # Run unit tests
bun run test:e2e            # Run E2E tests
```

**Frontend**:

```bash
bun install                 # Install dependencies
bun run dev                 # Start dev server (http://localhost:3000)
bun run build               # Build production
bun run start               # Start production server
bun run lint                # ESLint
bun run type-check          # TypeScript check
```

#### 6.3 Environment Variables

**Backend** (.env):

```bash
# Database
DATABASE_URL="postgresql://user:pass@host:5432/db"
DIRECT_URL="postgresql://user:pass@host:5432/db"

# JWT
JWT_SECRET="random-secret-key"
JWT_REFRESH_SECRET="random-refresh-secret"
JWT_EXPIRATION="1h"
JWT_REFRESH_EXPIRATION="7d"

# Redis
REDIS_HOST="localhost"
REDIS_PORT=6379
REDIS_PASSWORD=""
REDIS_URL="redis://localhost:6379"

# Supabase (untuk file storage)
SUPABASE_URL="https://xxx.supabase.co"
SUPABASE_KEY="eyJxxx..."

# Google OAuth
GOOGLE_CLIENT_ID="xxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPXxxx"
GOOGLE_REDIRECT_URI="http://localhost:4000/api/auth/google/callback"

# App
PORT=4000
NODE_ENV="development"
```

**Frontend** (.env.local):

```bash
NEXT_PUBLIC_API_URL="http://localhost:4000/api"
NEXT_PUBLIC_WS_URL="ws://localhost:4000"
NEXT_PUBLIC_GOOGLE_CLIENT_ID="xxx.apps.googleusercontent.com"
```

---

### 7. HASIL & DELIVERABLES FASE 1

#### 7.1 Backend Deliverables

✅ **Project Structure**: Folder structure lengkap dengan modules, common, config  
✅ **Database Schema**: 28 tabel dengan relations, indexes, migrations  
✅ **Prisma Client**: Generated & ready to use  
✅ **Auth Module**: JWT + OAuth implementation complete  
✅ **RBAC System**: 4 roles dengan guards & decorators  
✅ **Core Services**: PrismaService, LoggerService, CacheService  
✅ **API Docs**: Swagger UI accessible  
✅ **Environment Config**: .env setup dengan semua variables

#### 7.2 Frontend Deliverables

✅ **Project Structure**: App Router dengan route groups  
✅ **UI Foundation**: 15+ shadcn/ui components installed  
✅ **Auth Pages**: Login & Register pages functional  
✅ **Protected Routes**: Middleware untuk authentication  
✅ **API Client**: Axios setup dengan interceptors  
✅ **State Management**: Zustand store untuk auth  
✅ **Layout Components**: Sidebar, Header, Footer  
✅ **Type Safety**: TypeScript interfaces untuk API responses

#### 7.3 Development Environment

✅ **Git Repository**: Initialized dengan .gitignore  
✅ **Database**: PostgreSQL running via Supabase  
✅ **Redis**: Running (local/cloud) untuk caching  
✅ **Dev Servers**: Backend (4000), Frontend (3000) running  
✅ **Code Quality**: ESLint, Prettier configured  
✅ **Documentation**: ERD, Schema docs, API docs

#### 7.4 Testing & Validation

✅ **Database Migrations**: All migrations applied successfully  
✅ **Auth Flow**: Login → JWT token → Protected routes working  
✅ **OAuth**: Google Sign-In functional (if implemented)  
✅ **API Health**: `/health` endpoint returning 200  
✅ **CORS**: Frontend can call backend APIs  
✅ **Seed Data**: Initial data for categories, genres seeded

---

### 8. CHALLENGES & SOLUTIONS FASE 1

#### 8.1 Challenge: Database Design Complexity

**Issue**: 28 tabel dengan banyak relations bisa menyebabkan query complexity  
**Solution**:

- Careful planning dengan ERD per domain
- Strategic indexes pada foreign keys & frequently queried columns
- Composite indexes untuk common query patterns
- Documentation lengkap untuk setiap tabel

#### 8.2 Challenge: OAuth Integration

**Issue**: OAuth flow requires callback URL, state management, CSRF protection  
**Solution**:

- Separate table `oauth_state` untuk state verification
- Callback handler yang robust dengan error handling
- Account linking: Google ID → existing email atau create new
- Session token generation setelah OAuth success

#### 8.3 Challenge: Bun Runtime Compatibility

**Issue**: Beberapa packages might not fully support Bun  
**Solution**:

- Test all critical packages (NestJS, Prisma, Socket.io)
- Use `bun --bun` flag untuk full Bun mode
- Fallback ke Node.js compatibility mode jika needed
- Document any compatibility issues di README

#### 8.4 Challenge: Type Safety Frontend-Backend

**Issue**: API response types harus match di frontend & backend  
**Solution**:

- Shared types via documentation (manual sync)
- Generate types dari Swagger (future: tRPC/GraphQL alternative)
- Strict TypeScript config (`strict: true`)
- API response validation dengan Zod di frontend

---

### 9. METRICS & STATISTICS FASE 1

#### 9.1 Lines of Code

- **Backend**: ~3,000 LOC
  - Auth module: 500 LOC
  - Common utilities: 800 LOC
  - Config files: 300 LOC
  - Prisma schema: 800 LOC
- **Frontend**: ~1,500 LOC
  - Auth pages: 400 LOC
  - Layout components: 300 LOC
  - API client: 200 LOC
  - Store: 150 LOC

#### 9.2 Dependencies

- **Backend**: 45 packages (30 prod, 15 dev)
- **Frontend**: 50 packages (35 prod, 15 dev)

#### 9.3 Database

- **Tables**: 28 tabel
- **Relations**: 40+ foreign key relations
- **Indexes**: 15+ indexes untuk optimization
- **Enums**: 9 enum types

#### 9.4 Time Estimation

- **Setup & Config**: 8 jam
- **Database Design**: 16 jam
- **Auth Implementation**: 12 jam
- **Frontend Layout**: 8 jam
- **Testing & Debugging**: 8 jam
- **Documentation**: 6 jam
- **Total**: ~58 jam (7-8 hari kerja)

---

### 10. NEXT STEPS → FASE 2

Setelah foundation selesai, Fase 2 akan fokus pada:

1. **User Management**: CRUD pengguna, profil penulis, role management
2. **Content System**: CRUD naskah lengkap dengan file upload
3. **Kategori & Genre**: Management kategori hierarchical & genre
4. **Dashboard Pages**: Landing page, dashboard statistik

---

## 📋 LAPORAN DEVELOPMENT STEP BY STEP FASE 1

### **File**: `LAPORAN-DEVELOPMENT-FASE-1-FOUNDATION.md`

#### **Konten yang Harus Dibahas:**

Laporan ini menjelaskan secara **TEKNIS DETAIL** dan **STEP BY STEP** bagaimana setiap fitur di Fase 1 diimplementasikan, termasuk code snippets, command yang dijalankan, file yang dibuat, dan troubleshooting.

---

### 1. PROJECT INITIALIZATION

#### STEP 1.1: Setup Monorepo Structure

```bash
# Buat folder root
mkdir publishify
cd publishify

# Initialize Git
git init
echo "node_modules/" > .gitignore
echo ".env" >> .gitignore
echo "dist/" >> .gitignore
echo ".next/" >> .gitignore

# Buat struktur folder
mkdir -p backend frontend docs .github/workflows

# Create root README
echo "# Publishify - Sistem Penerbitan Naskah" > README.md
```

#### STEP 1.2: Initialize Backend (NestJS + Bun)

```bash
cd backend

# Install Bun (jika belum)
curl -fsSL https://bun.sh/install | bash

# Initialize package.json
bun init -y

# Install NestJS CLI
bun add -g @nestjs/cli

# Generate NestJS app (manual setup karena CLI untuk npm)
bun add @nestjs/common @nestjs/core @nestjs/platform-express reflect-metadata rxjs
bun add -d @nestjs/cli @nestjs/testing typescript @types/node
```

**File Created**: `backend/package.json`

```json
{
  "name": "@publishify/backend",
  "version": "1.0.0",
  "scripts": {
    "start:dev": "nest start --watch",
    "build": "nest build",
    "start:prod": "node dist/main"
  }
}
```

#### STEP 1.3: Install Backend Dependencies

```bash
# Core NestJS modules
bun add @nestjs/common @nestjs/core @nestjs/platform-express
bun add @nestjs/config @nestjs/swagger @nestjs/mapped-types

# Database & Prisma
bun add @prisma/client
bun add -d prisma

# Authentication
bun add @nestjs/jwt @nestjs/passport passport passport-jwt bcryptjs
bun add -d @types/passport-jwt @types/bcryptjs

# Validation
bun add class-validator class-transformer zod

# File Upload
bun add multer sharp
bun add -d @types/multer

# Real-time
bun add @nestjs/websockets @nestjs/platform-socket.io socket.io

# Caching
bun add cache-manager cache-manager-redis-yet ioredis
bun add -d @types/cache-manager

# Utilities
bun add date-fns uuid
bun add -d @types/uuid

# Security
bun add helmet cors @nestjs/throttler

# Logging
bun add winston
```

**Total Dependencies**: 45+ packages

#### STEP 1.4: Create Backend Folder Structure

```bash
mkdir -p src/{modules,common,config,prisma,utils}
mkdir -p src/modules/{auth,pengguna,naskah,kategori,genre,review,percetakan,pembayaran,notifikasi,upload}
mkdir -p src/common/{decorators,dto,filters,guards,interceptors,interfaces,logger,middlewares,pipes,cache}
mkdir -p test/{unit,integration,e2e,helpers}
```

#### STEP 1.5: Create Main Files

**File**: `src/main.ts`

```typescript
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import helmet from "helmet";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security
  app.use(helmet());
  app.enableCors({
    origin: "http://localhost:3000",
    credentials: true,
  });

  // Global prefix
  app.setGlobalPrefix("api");

  // Validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    })
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle("Publishify API")
    .setDescription("API untuk Sistem Penerbitan Naskah Publishify")
    .setVersion("1.0")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  await app.listen(4000);
  console.log(`🚀 Publishify Backend running on http://localhost:4000`);
  console.log(`📚 API Docs: http://localhost:4000/api/docs`);
}
bootstrap();
```

**File**: `src/app.module.ts`

```typescript
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./modules/auth/auth.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    // ... other modules akan ditambahkan
  ],
  controllers: [AppController],
})
export class AppModule {}
```

#### STEP 1.6: Initialize Frontend (Next.js + React)

```bash
cd ../frontend

# Create Next.js app dengan Bun
bunx create-next-app@latest . --typescript --tailwind --app --src-dir=false

# Pilih opsi:
# ✔ TypeScript: Yes
# ✔ ESLint: Yes
# ✔ Tailwind CSS: Yes
# ✔ src/ directory: No
# ✔ App Router: Yes
# ✔ Import alias: Yes (@/*)
```

#### STEP 1.7: Install Frontend Dependencies

```bash
# UI Components (shadcn/ui)
bunx shadcn-ui@latest init

# State Management
bun add zustand

# Data Fetching
bun add @tanstack/react-query axios
bun add -d @tanstack/react-query-devtools

# Forms
bun add react-hook-form zod @hookform/resolvers

# Real-time
bun add socket.io-client

# UI Libraries
bun add lucide-react recharts
bun add react-dropzone

# Date utilities
bun add date-fns

# Rich Text Editor
bun add @tiptap/react @tiptap/starter-kit

# Notifications
bun add sonner

# Radix UI components (via shadcn)
bunx shadcn-ui@latest add button input card dialog table select dropdown-menu toast badge skeleton
```

**Total Dependencies**: 50+ packages

---

### 2. DATABASE SETUP & SCHEMA DESIGN

#### STEP 2.1: Initialize Prisma

```bash
cd backend

# Initialize Prisma
bunx prisma init --datasource-provider postgresql

# Ini akan create:
# - prisma/schema.prisma
# - .env (dengan DATABASE_URL template)
```

**File**: `.env`

```bash
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
```

#### STEP 2.2: Design Database Schema

**File**: `prisma/schema.prisma` (excerpt - tidak semua ditampilkan)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
  extensions = [pgcrypto]
}

generator client {
  provider = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions"]
}

// ============================================
// ENUMS
// ============================================

enum JenisPeran {
  penulis
  editor
  percetakan
  admin

  @@map("jenis_peran")
}

enum StatusNaskah {
  draft
  diajukan
  dalam_review
  perlu_revisi
  disetujui
  ditolak
  diterbitkan

  @@map("status_naskah")
}

// ============================================
// USER MANAGEMENT
// ============================================

model Pengguna {
  id                    String    @id @default(uuid())
  email                 String    @unique
  kataSandi             String?
  telepon               String?

  // OAuth Fields
  googleId              String?   @unique @map("google_id")
  facebookId            String?   @unique @map("facebook_id")
  appleId               String?   @unique @map("apple_id")
  provider              String?
  avatarUrl             String?   @map("avatar_url")
  emailVerifiedByProvider Boolean @default(false) @map("email_verified_by_provider")

  aktif                 Boolean   @default(true)
  terverifikasi         Boolean   @default(false)
  emailDiverifikasiPada DateTime?
  loginTerakhir         DateTime?
  dibuatPada            DateTime  @default(now())
  diperbaruiPada        DateTime  @updatedAt

  // Relations
  profilPengguna   ProfilPengguna?
  peranPengguna    PeranPengguna[]
  profilPenulis    ProfilPenulis?
  naskah           Naskah[]
  review           ReviewNaskah[]

  @@index([googleId], map: "idx_pengguna_google_id")
  @@index([provider], map: "idx_pengguna_provider")
  @@map("pengguna")
}

// ... (28 models total - tidak semua ditampilkan di sini)
```

**Note**: File schema lengkap ada di `backend/prisma/schema.prisma` (800+ lines)

#### STEP 2.3: Generate Prisma Client

```bash
bun prisma generate

# Output:
# ✔ Generated Prisma Client (5.8.0) to ./node_modules/@prisma/client
```

#### STEP 2.4: Create Migration

```bash
bun prisma migrate dev --name init_database

# Output:
# Applying migration `20250101000000_init_database`
# ✔ Migration applied successfully
```

#### STEP 2.5: Create Seed File

**File**: `prisma/seed.ts`

```typescript
import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Seed Kategori
  const kategoriData = [
    { nama: "Fiksi", slug: "fiksi", deskripsi: "Karya fiksi dan imajinatif" },
    {
      nama: "Non-Fiksi",
      slug: "non-fiksi",
      deskripsi: "Karya faktual dan informatif",
    },
    { nama: "Pendidikan", slug: "pendidikan", deskripsi: "Buku pendidikan" },
    {
      nama: "Teknologi",
      slug: "teknologi",
      deskripsi: "Buku teknologi dan komputer",
    },
  ];

  for (const kategori of kategoriData) {
    await prisma.kategori.upsert({
      where: { slug: kategori.slug },
      update: {},
      create: kategori,
    });
  }
  console.log("✓ Kategori seeded");

  // Seed Genre
  const genreData = [
    { nama: "Roman", slug: "roman", deskripsi: "Cerita percintaan" },
    { nama: "Thriller", slug: "thriller", deskripsi: "Cerita menegangkan" },
    { nama: "Fantasi", slug: "fantasi", deskripsi: "Dunia fantasi" },
    { nama: "Biografi", slug: "biografi", deskripsi: "Kisah hidup nyata" },
    { nama: "Sains", slug: "sains", deskripsi: "Buku sains dan penelitian" },
  ];

  for (const genre of genreData) {
    await prisma.genre.upsert({
      where: { slug: genre.slug },
      update: {},
      create: genre,
    });
  }
  console.log("✓ Genre seeded");

  // Seed Admin User
  const hashedPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.pengguna.upsert({
    where: { email: "admin@publishify.com" },
    update: {},
    create: {
      email: "admin@publishify.com",
      kataSandi: hashedPassword,
      aktif: true,
      terverifikasi: true,
      profilPengguna: {
        create: {
          namaDepan: "Admin",
          namaBelakang: "Publishify",
          namaTampilan: "Administrator",
        },
      },
      peranPengguna: {
        create: {
          jenisPeran: "admin",
          aktif: true,
        },
      },
    },
  });
  console.log("✓ Admin user seeded:", admin.email);

  console.log("✅ Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

**Run Seed**:

```bash
bun prisma db seed

# Output:
# 🌱 Starting database seed...
# ✓ Kategori seeded
# ✓ Genre seeded
# ✓ Admin user seeded: admin@publishify.com
# ✅ Database seeded successfully!
```

#### STEP 2.6: Create Prisma Service

**File**: `src/prisma/prisma.service.ts`

```typescript
import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      log: ["query", "error", "warn"],
    });
  }

  async onModuleInit() {
    await this.$connect();
    console.log("✅ Prisma connected to database");
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log("🔌 Prisma disconnected from database");
  }
}
```

**File**: `src/prisma/prisma.module.ts`

```typescript
import { Module, Global } from "@nestjs/common";
import { PrismaService } from "./prisma.service";

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

---

### 3. AUTHENTICATION IMPLEMENTATION

#### STEP 3.1: Create Auth Module Structure

```bash
cd src/modules/auth
touch auth.module.ts auth.controller.ts auth.service.ts
mkdir -p strategies guards decorators dto
touch strategies/jwt.strategy.ts strategies/local.strategy.ts
touch guards/jwt-auth.guard.ts guards/roles.guard.ts
touch decorators/public.decorator.ts decorators/pengguna-saat-ini.decorator.ts decorators/peran.decorator.ts
touch dto/register.dto.ts dto/login.dto.ts dto/refresh-token.dto.ts
```

#### STEP 3.2: Create JWT Configuration

**File**: `src/config/jwt.config.ts`

```typescript
import { registerAs } from "@nestjs/config";

export default registerAs("jwt", () => ({
  secret: process.env.JWT_SECRET || "your-secret-key",
  refreshSecret: process.env.JWT_REFRESH_SECRET || "your-refresh-secret",
  expiresIn: process.env.JWT_EXPIRATION || "1h",
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRATION || "7d",
}));
```

**Update .env**:

```bash
JWT_SECRET="publishify_jwt_secret_key_2025"
JWT_REFRESH_SECRET="publishify_refresh_secret_key_2025"
JWT_EXPIRATION="1h"
JWT_REFRESH_EXPIRATION="7d"
```

#### STEP 3.3: Implement JWT Strategy

**File**: `src/modules/auth/strategies/jwt.strategy.ts`

```typescript
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "@/prisma/prisma.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get("jwt.secret"),
      ignoreExpiration: false,
    });
  }

  async validate(payload: any) {
    const pengguna = await this.prisma.pengguna.findUnique({
      where: { id: payload.sub },
      include: {
        profilPengguna: true,
        peranPengguna: {
          where: { aktif: true },
        },
      },
    });

    if (!pengguna || !pengguna.aktif) {
      throw new UnauthorizedException(
        "Pengguna tidak ditemukan atau tidak aktif"
      );
    }

    return {
      id: pengguna.id,
      email: pengguna.email,
      peran: pengguna.peranPengguna.map((p) => p.jenisPeran),
      profil: pengguna.profilPengguna,
    };
  }
}
```

#### STEP 3.4: Create Auth Service

**File**: `src/modules/auth/auth.service.ts`

```typescript
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcryptjs";
import { PrismaService } from "@/prisma/prisma.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async register(dto: RegisterDto) {
    // Check existing user
    const existing = await this.prisma.pengguna.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException("Email sudah terdaftar");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Create user dengan profil & role
    const pengguna = await this.prisma.pengguna.create({
      data: {
        email: dto.email,
        kataSandi: hashedPassword,
        telepon: dto.telepon,
        profilPengguna: {
          create: {
            namaDepan: dto.namaDepan,
            namaBelakang: dto.namaBelakang,
          },
        },
        peranPengguna: {
          create: {
            jenisPeran: "penulis", // Default role
            aktif: true,
          },
        },
      },
      include: {
        profilPengguna: true,
        peranPengguna: true,
      },
    });

    // Generate tokens
    const tokens = await this.generateTokens(pengguna.id);

    return {
      sukses: true,
      pesan: "Registrasi berhasil",
      data: {
        pengguna: {
          id: pengguna.id,
          email: pengguna.email,
          profil: pengguna.profilPengguna,
          peran: pengguna.peranPengguna.map((p) => p.jenisPeran),
        },
        ...tokens,
      },
    };
  }

  async login(dto: LoginDto) {
    // Find user
    const pengguna = await this.prisma.pengguna.findUnique({
      where: { email: dto.email },
      include: {
        profilPengguna: true,
        peranPengguna: {
          where: { aktif: true },
        },
      },
    });

    if (!pengguna) {
      throw new UnauthorizedException("Email atau password salah");
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      dto.password,
      pengguna.kataSandi
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException("Email atau password salah");
    }

    // Check if user is active
    if (!pengguna.aktif) {
      throw new UnauthorizedException("Akun Anda tidak aktif");
    }

    // Update last login
    await this.prisma.pengguna.update({
      where: { id: pengguna.id },
      data: { loginTerakhir: new Date() },
    });

    // Generate tokens
    const tokens = await this.generateTokens(pengguna.id);

    return {
      sukses: true,
      pesan: "Login berhasil",
      data: {
        pengguna: {
          id: pengguna.id,
          email: pengguna.email,
          profil: pengguna.profilPengguna,
          peran: pengguna.peranPengguna.map((p) => p.jenisPeran),
        },
        ...tokens,
      },
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get("jwt.refreshSecret"),
      });

      // Check if refresh token exists in DB
      const tokenRecord = await this.prisma.tokenRefresh.findFirst({
        where: {
          idPengguna: payload.sub,
          token: refreshToken,
          kadaluarsaPada: { gt: new Date() },
        },
      });

      if (!tokenRecord) {
        throw new UnauthorizedException("Invalid refresh token");
      }

      // Generate new tokens
      const tokens = await this.generateTokens(payload.sub);

      // Delete old refresh token
      await this.prisma.tokenRefresh.delete({
        where: { id: tokenRecord.id },
      });

      return {
        sukses: true,
        pesan: "Token berhasil diperbarui",
        data: tokens,
      };
    } catch (error) {
      throw new UnauthorizedException("Refresh token tidak valid");
    }
  }

  async logout(idPengguna: string, refreshToken: string) {
    // Delete refresh token
    await this.prisma.tokenRefresh.deleteMany({
      where: {
        idPengguna,
        token: refreshToken,
      },
    });

    return {
      sukses: true,
      pesan: "Logout berhasil",
    };
  }

  private async generateTokens(idPengguna: string) {
    const payload = { sub: idPengguna };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get("jwt.secret"),
        expiresIn: this.configService.get("jwt.expiresIn"),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get("jwt.refreshSecret"),
        expiresIn: this.configService.get("jwt.refreshExpiresIn"),
      }),
    ]);

    // Store refresh token in DB
    const expiresIn = 7 * 24 * 60 * 60 * 1000; // 7 days
    await this.prisma.tokenRefresh.create({
      data: {
        idPengguna,
        token: refreshToken,
        kadaluarsaPada: new Date(Date.now() + expiresIn),
      },
    });

    return { accessToken, refreshToken };
  }
}
```

#### STEP 3.5: Create Auth Controller

**File**: `src/modules/auth/auth.controller.ts`

```typescript
import { Controller, Post, Body, UseGuards, Req } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { Public } from "./decorators/public.decorator";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { PenggunaSaatIni } from "./decorators/pengguna-saat-ini.decorator";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post("register")
  @ApiOperation({ summary: "Registrasi pengguna baru" })
  @ApiResponse({ status: 201, description: "Registrasi berhasil" })
  @ApiResponse({ status: 409, description: "Email sudah terdaftar" })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post("login")
  @ApiOperation({ summary: "Login pengguna" })
  @ApiResponse({ status: 200, description: "Login berhasil" })
  @ApiResponse({ status: 401, description: "Email atau password salah" })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Public()
  @Post("refresh")
  @ApiOperation({ summary: "Refresh access token" })
  async refresh(@Body("refreshToken") refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post("logout")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Logout pengguna" })
  async logout(
    @PenggunaSaatIni("id") idPengguna: string,
    @Body("refreshToken") refreshToken: string
  ) {
    return this.authService.logout(idPengguna, refreshToken);
  }
}
```

#### STEP 3.6: Create Guards & Decorators

**File**: `src/modules/auth/guards/jwt-auth.guard.ts`

```typescript
import { Injectable, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }
}
```

**File**: `src/modules/auth/decorators/public.decorator.ts`

```typescript
import { SetMetadata } from "@nestjs/common";

export const IS_PUBLIC_KEY = "isPublic";
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

**File**: `src/modules/auth/decorators/pengguna-saat-ini.decorator.ts`

```typescript
import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const PenggunaSaatIni = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    return data ? user?.[data] : user;
  }
);
```

---

### 4. FRONTEND AUTH IMPLEMENTATION

#### STEP 4.1: Create Auth Store (Zustand)

**File**: `stores/use-auth-store.ts`

```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Pengguna {
  id: string;
  email: string;
  profil: {
    namaDepan: string;
    namaBelakang: string;
  };
  peran: string[];
}

interface AuthState {
  pengguna: Pengguna | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;

  setPengguna: (pengguna: Pengguna) => void;
  setToken: (token: string, refreshToken: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      pengguna: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,

      setPengguna: (pengguna) => set({ pengguna, isAuthenticated: true }),

      setToken: (token, refreshToken) => set({ token, refreshToken }),

      logout: () =>
        set({
          pengguna: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: "publishify-auth",
    }
  )
);
```

#### STEP 4.2: Create API Client

**File**: `lib/api/client.ts`

```typescript
import axios from "axios";
import { useAuthStore } from "@/stores/use-auth-store";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: Attach token
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle errors & refresh token
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = useAuthStore.getState().refreshToken;
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
          { refreshToken }
        );

        const { accessToken, refreshToken: newRefreshToken } =
          response.data.data;
        useAuthStore.getState().setToken(accessToken, newRefreshToken);

        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout
        useAuthStore.getState().logout();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
```

**File**: `lib/api/auth.ts`

```typescript
import apiClient from "./client";

interface RegisterData {
  email: string;
  password: string;
  namaDepan: string;
  namaBelakang: string;
  telepon?: string;
}

interface LoginData {
  email: string;
  password: string;
}

export const authApi = {
  register: async (data: RegisterData) => {
    const response = await apiClient.post("/auth/register", data);
    return response.data;
  },

  login: async (data: LoginData) => {
    const response = await apiClient.post("/auth/login", data);
    return response.data;
  },

  logout: async (refreshToken: string) => {
    const response = await apiClient.post("/auth/logout", { refreshToken });
    return response.data;
  },

  refreshToken: async (refreshToken: string) => {
    const response = await apiClient.post("/auth/refresh", { refreshToken });
    return response.data;
  },
};
```

#### STEP 4.3: Create Login Page

**File**: `app/(auth)/login/page.tsx`

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { authApi } from "@/lib/api/auth";
import { useAuthStore } from "@/stores/use-auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { setPengguna, setToken } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await authApi.login(data);

      if (response.sukses) {
        const { pengguna, accessToken, refreshToken } = response.data;

        setPengguna(pengguna);
        setToken(accessToken, refreshToken);

        toast.success("Login berhasil!");
        router.push("/dashboard");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.pesan || "Login gagal");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            Login Publishify
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                {...register("email")}
                error={errors.email?.message}
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="********"
                  {...register("password")}
                  error={errors.password?.message}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Loading..." : "Login"}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            Belum punya akun?{" "}
            <a href="/register" className="text-blue-600 hover:underline">
              Daftar sekarang
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

(CONTINUED IN NEXT SECTION DUE TO LENGTH...)

**Total Estimasi Laporan Development Fase 1**: 100+ halaman dengan code snippets lengkap

---
