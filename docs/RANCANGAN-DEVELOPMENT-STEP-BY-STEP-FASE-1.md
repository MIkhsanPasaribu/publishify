# 🚀 DEVELOPMENT STEP BY STEP - FASE 1: FOUNDATION & CORE INFRASTRUCTURE

**Referensi**: RANCANGAN-5-LAPORAN-PROGRESS-DAN-DEVELOPMENT.md (Fase 1)  
**Target**: Implementasi foundation lengkap untuk project Publishify  
**Durasi**: 14 hari kerja (~98 jam)

> ⚠️ **PENTING**: Dokumen ini adalah RANCANGAN/BLUEPRINT untuk pembuatan laporan development actual. Berisi outline detail tentang apa saja yang akan dijelaskan dalam laporan development step-by-step nantinya.

---

## 📋 STRUKTUR LAPORAN DEVELOPMENT

Laporan development actual nanti akan berisi tutorial step-by-step yang sangat detail untuk mengimplementasikan Fase 1 dari nol hingga selesai. Berikut outline lengkapnya:

---

## 1. PERSIAPAN ENVIRONMENT & TOOLS

### 1.1 Install Bun Runtime

**Yang akan dijelaskan**:

- Download dan install Bun untuk Windows
- Verifikasi instalasi dengan command `bun --version`
- Setup PATH environment variable
- Troubleshooting common issues

**Command yang akan dijalankan**:

```bash
# Windows (PowerShell as Admin)
irm bun.sh/install.ps1 | iex

# Verifikasi
bun --version
```

### 1.2 Install Tools Development

**Yang akan dijelaskan**:

- Install VS Code + Extensions (Prisma, ESLint, Prettier, REST Client)
- Install Git untuk version control
- Setup Supabase account (free tier)
- Install Redis (untuk caching & sessions)
- Setup Postman/Thunder Client untuk API testing

**Extensions VS Code yang diperlukan**:

- Prisma (`Prisma.prisma`)
- ESLint (`dbaeumer.vscode-eslint`)
- Prettier (`esbenp.prettier-vscode`)
- REST Client (`humao.rest-client`)

### 1.3 Setup GitHub Repository

**Yang akan dijelaskan**:

- Buat repository baru di GitHub
- Clone ke local machine
- Buat branch structure (main, develop)
- Setup .gitignore untuk Node/Next.js/Prisma
- First commit & push

**Commands**:

```bash
git init
git remote add origin https://github.com/username/publishify.git
git add .
git commit -m "Initial commit: Project structure"
git push -u origin main
```

---

## 2. INISIALISASI PROJECT

### 2.1 Backend: NestJS dengan Bun

**Step-by-step yang akan dijelaskan**:

**Step 1: Create NestJS Project**

```bash
# Install NestJS CLI globally
bun add -g @nestjs/cli

# Create new project
nest new backend
cd backend

# Pilih "bun" sebagai package manager
```

**Step 2: Install Dependencies Utama**

```bash
# Core dependencies
bun add @nestjs/config @nestjs/jwt @nestjs/passport
bun add passport passport-jwt passport-local
bun add @prisma/client
bun add bcryptjs uuid zod class-validator class-transformer

# Dev dependencies
bun add -D @types/passport-jwt @types/passport-local
bun add -D @types/bcryptjs @types/uuid
bun add -D prisma
```

**Step 3: Install Additional Packages**

```bash
# Swagger untuk API documentation
bun add @nestjs/swagger

# Redis untuk caching
bun add @nestjs/cache-manager cache-manager ioredis

# File upload
bun add multer @types/multer sharp

# WebSocket
bun add @nestjs/websockets @nestjs/platform-socket.io socket.io

# Security
bun add helmet @nestjs/throttler
```

**Step 4: Project Structure**
Penjelasan detail tentang struktur folder yang akan dibuat:

```
backend/
├── src/
│   ├── main.ts              # Entry point
│   ├── app.module.ts        # Root module
│   ├── config/              # Configuration files
│   │   ├── database.config.ts
│   │   ├── jwt.config.ts
│   │   └── redis.config.ts
│   ├── common/              # Shared resources
│   │   ├── decorators/      # Custom decorators
│   │   ├── filters/         # Exception filters
│   │   ├── guards/          # Guards (JWT, roles)
│   │   ├── interceptors/    # Interceptors (logging, transform)
│   │   ├── pipes/           # Validation pipes
│   │   └── interfaces/      # Shared interfaces
│   ├── modules/             # Feature modules
│   │   ├── auth/           # Authentication module
│   │   ├── pengguna/       # User management
│   │   └── ...             # Other modules
│   ├── prisma/             # Prisma service
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   └── utils/              # Utility functions
│       ├── hash.util.ts
│       └── validation.util.ts
├── prisma/
│   ├── schema.prisma       # Database schema
│   ├── seed.ts            # Seed data
│   └── migrations/        # Migration files
├── test/                  # Test files
├── .env                   # Environment variables
├── .env.example          # Env template
├── nest-cli.json         # NestJS config
├── tsconfig.json         # TypeScript config
└── package.json          # Dependencies
```

### 2.2 Frontend: Next.js 14 dengan Bun

**Step-by-step yang akan dijelaskan**:

**Step 1: Create Next.js Project**

```bash
# Gunakan Bun untuk create next app
bunx create-next-app@latest frontend

# Options yang dipilih:
# ✅ TypeScript
# ✅ ESLint
# ✅ Tailwind CSS
# ✅ App Router (bukan Pages Router)
# ❌ src/ directory (tidak perlu)
# ✅ import alias (@/*)
```

**Step 2: Install Dependencies**

```bash
cd frontend

# UI Components (shadcn/ui)
bunx shadcn@latest init

# State management & data fetching
bun add zustand @tanstack/react-query axios

# Form handling
bun add react-hook-form zod @hookform/resolvers

# UI utilities
bun add clsx tailwind-merge class-variance-authority
bun add lucide-react date-fns

# Notifications
bun add sonner
```

**Step 3: Install shadcn/ui Components**

```bash
# Install komponen yang sering digunakan
bunx shadcn@latest add button
bunx shadcn@latest add input
bunx shadcn@latest add card
bunx shadcn@latest add dialog
bunx shadcn@latest add select
bunx shadcn@latest add table
bunx shadcn@latest add badge
bunx shadcn@latest add tabs
bunx shadcn@latest add dropdown-menu
```

**Step 4: Project Structure**

```
frontend/
├── app/                    # Next.js App Router
│   ├── (auth)/           # Auth routes (login, register)
│   ├── (dashboard)/      # Dashboard routes
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Homepage
│   └── globals.css       # Global styles
├── components/           # React components
│   ├── ui/              # shadcn/ui components
│   ├── forms/           # Form components
│   ├── layouts/         # Layout components
│   ├── modules/         # Feature components
│   └── shared/          # Shared components
├── lib/                 # Libraries
│   ├── api/            # API clients
│   ├── utils.ts        # Utility functions
│   └── constants/      # Constants
├── hooks/              # Custom hooks
├── stores/             # Zustand stores
├── types/              # TypeScript types
├── public/             # Static assets
├── .env.local          # Environment variables
├── next.config.js      # Next.js config
├── tailwind.config.ts  # Tailwind config
└── tsconfig.json       # TypeScript config
```

---

## 3. DATABASE SETUP DENGAN PRISMA

### 3.1 Setup Supabase PostgreSQL

**Yang akan dijelaskan**:

**Step 1: Create Supabase Project**

- Login ke https://supabase.com
- Click "New Project"
- Pilih organization & nama project: "publishify"
- Pilih region terdekat (Singapore/Jakarta)
- Generate secure password
- Wait for project to be created (~2 menit)

**Step 2: Get Connection Strings**

- Go to Settings → Database
- Copy "Connection String" (Transaction mode)
- Copy "Direct URL" (Session mode)
- Format URL:

  ```
  DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres?pgbouncer=true"

  DIRECT_URL="postgresql://postgres.[project-ref]:[password]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"
  ```

**Step 3: Setup Environment Variables**

```env
# backend/.env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
JWT_EXPIRES_IN="7d"
JWT_REFRESH_EXPIRES_IN="30d"

REDIS_HOST="localhost"
REDIS_PORT=6379

PORT=3000
NODE_ENV=development
```

### 3.2 Prisma Schema - User Management Models

**Yang akan dijelaskan**: Implementasi step-by-step model User Management

**Step 1: Initialize Prisma**

```bash
cd backend
bunx prisma init
```

**Step 2: Edit schema.prisma - Generator & Datasource**

```prisma
generator client {
  provider = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
  extensions = [pgcrypto]
}
```

**Step 3: Tambahkan Enums**
Penjelasan setiap enum dan kegunaannya:

```prisma
enum JenisPeran {
  penulis       // Penulis naskah
  editor        // Editor review
  percetakan    // Mitra percetakan
  admin         // Administrator

  @@map("jenis_peran")
}

enum StatusNaskah {
  draft           // Draft pertama
  diajukan        // Sudah diajukan untuk review
  dalam_review    // Sedang direview editor
  perlu_revisi    // Editor minta revisi
  disetujui       // Disetujui, siap terbit
  ditolak         // Ditolak editor
  diterbitkan     // Sudah terbit

  @@map("status_naskah")
}

// ... enum lainnya
```

**Step 4: Model Pengguna (User)**
Penjelasan field-by-field dengan reasoning:

```prisma
model Pengguna {
  id                    String    @id @default(uuid())
  email                 String    @unique
  kataSandi             String?   // Optional untuk OAuth users
  telepon               String?

  // OAuth Fields (Google, Facebook, Apple)
  googleId              String?   @unique @map("google_id")
  facebookId            String?   @unique @map("facebook_id")
  appleId               String?   @unique @map("apple_id")
  provider              String?   // "google", "facebook", "apple", "local"
  avatarUrl             String?   @map("avatar_url")
  emailVerifiedByProvider Boolean @default(false) @map("email_verified_by_provider")

  aktif                 Boolean   @default(true)
  terverifikasi         Boolean   @default(false)
  emailDiverifikasiPada DateTime?
  loginTerakhir         DateTime?
  dibuatPada            DateTime  @default(now())
  diperbaruiPada        DateTime  @updatedAt

  // Relations (akan dijelaskan satu-persatu)
  profilPengguna   ProfilPengguna?
  peranPengguna    PeranPengguna[]
  // ... relations lainnya

  @@index([googleId], map: "idx_pengguna_google_id")
  @@index([provider], map: "idx_pengguna_provider")
  @@map("pengguna")
}
```

**Reasoning setiap field**:

- `id`: UUID untuk unique identifier (lebih aman dari auto-increment)
- `email`: Unique, untuk login & komunikasi
- `kataSandi`: Optional karena OAuth users tidak perlu password
- `googleId`: Untuk OAuth Google login
- `provider`: Track dari mana user register (google/local/etc)
- `aktif`: Soft delete, bisa disable tanpa hapus data
- `terverifikasi`: Email verification status
- `loginTerakhir`: Track user activity

**Step 5: Model ProfilPengguna**

```prisma
model ProfilPengguna {
  id             String    @id @default(uuid())
  idPengguna     String    @unique  // One-to-one dengan Pengguna
  namaDepan      String?
  namaBelakang   String?
  namaTampilan   String?   // Display name (bisa beda dari nama asli)
  bio            String?   // About me
  urlAvatar      String?   // Avatar image URL
  tanggalLahir   DateTime?
  jenisKelamin   String?   // "L", "P", atau "Lainnya"

  // Alamat
  alamat         String?
  kota           String?
  provinsi       String?
  kodePos        String?

  dibuatPada     DateTime  @default(now())
  diperbaruiPada DateTime  @updatedAt

  // Relation ke Pengguna
  pengguna Pengguna @relation(fields: [idPengguna], references: [id], onDelete: Cascade)

  @@map("profil_pengguna")
}
```

**Step 6: Model PeranPengguna (Role System)**

```prisma
model PeranPengguna {
  id             String     @id @default(uuid())
  idPengguna     String
  jenisPeran     JenisPeran  // penulis, editor, percetakan, admin
  aktif          Boolean    @default(true)
  ditugaskanPada DateTime   @default(now())
  ditugaskanOleh String?    // ID admin yang assign role

  pengguna Pengguna @relation(fields: [idPengguna], references: [id], onDelete: Cascade)

  // Unique constraint: 1 user tidak bisa punya role yang sama 2x
  @@unique([idPengguna, jenisPeran])
  @@map("peran_pengguna")
}
```

**Reasoning**:

- Flexible role system: 1 user bisa punya multiple roles
- `aktif`: Bisa disable role tanpa delete
- Unique constraint `[idPengguna, jenisPeran]`: Prevent duplicate roles

**Step 7: Model ProfilPenulis (Extended Profile)**

```prisma
model ProfilPenulis {
  id                String   @id @default(uuid())
  idPengguna        String   @unique  // One-to-one

  // Author-specific fields
  namaPena          String?   // Pen name
  biografi          String?   // Author bio
  spesialisasi      String[]  // Array: ["fiksi", "non-fiksi", "puisi"]

  // Statistics
  totalBuku         Int      @default(0)
  totalDibaca       Int      @default(0)
  ratingRataRata    Decimal  @default(0) @db.Decimal(3, 2)  // 0.00-5.00

  // Financial info (untuk royalti)
  namaRekeningBank  String?
  namaBank          String?
  nomorRekeningBank String?
  npwp              String?   // Tax ID

  dibuatPada        DateTime @default(now())
  diperbaruiPada    DateTime @updatedAt

  pengguna Pengguna @relation(fields: [idPengguna], references: [id], onDelete: Cascade)

  @@map("profil_penulis")
}
```

### 3.3 Prisma Migration - Run First Migration

**Yang akan dijelaskan**:

**Step 1: Generate Migration**

```bash
bunx prisma migrate dev --name init_user_management

# Output akan menampilkan:
# - SQL yang akan dijalankan
# - Tabel yang dibuat
# - Indexes yang dibuat
```

**Step 2: Verify Migration**

```bash
# Check migration files
ls prisma/migrations/

# Output:
# 20250130123456_init_user_management/
#   └── migration.sql
```

**Step 3: Check Database**

- Buka Supabase Dashboard
- Go to Table Editor
- Verify tables: pengguna, profil_pengguna, peran_pengguna, profil_penulis
- Check columns & data types

**Step 4: Generate Prisma Client**

```bash
bunx prisma generate

# Output: ✔ Generated Prisma Client to ./node_modules/.prisma/client
```

### 3.4 Prisma Service Setup

**Yang akan dijelaskan**: Implementasi PrismaService untuk NestJS

**File: `backend/src/prisma/prisma.service.ts`**

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
      log: ["query", "error", "warn"], // Enable query logging
      errorFormat: "pretty",
    });
  }

  async onModuleInit() {
    await this.$connect();
    console.log("✅ Prisma connected to database");
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log("👋 Prisma disconnected from database");
  }

  // Helper: Soft delete
  async softDelete(model: string, id: string) {
    return this[model].update({
      where: { id },
      data: { aktif: false },
    });
  }
}
```

**File: `backend/src/prisma/prisma.module.ts`**

```typescript
import { Global, Module } from "@nestjs/common";
import { PrismaService } from "./prisma.service";

@Global() // Make PrismaService available globally
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

**Explanation**:

- `@Global()`: Tidak perlu import PrismaModule di setiap feature module
- `OnModuleInit`: Auto-connect saat app start
- `OnModuleDestroy`: Graceful disconnect saat app shutdown
- Query logging: Berguna untuk debugging

---

## 4. AUTHENTICATION SYSTEM

### 4.1 Setup JWT Configuration

**Yang akan dijelaskan**:

**File: `backend/src/config/jwt.config.ts`**

```typescript
import { registerAs } from "@nestjs/config";

export default registerAs("jwt", () => ({
  secret: process.env.JWT_SECRET || "fallback-secret-key-min-32-chars",
  expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  refreshSecret: process.env.JWT_REFRESH_SECRET || "refresh-secret-key",
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
}));
```

### 4.2 Hash Utility Functions

**File: `backend/src/utils/hash.util.ts`**

```typescript
import * as bcrypt from "bcryptjs";

/**
 * Hash password dengan bcrypt
 * Salt rounds: 10 (balance antara security & performance)
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Verify password terhadap hash
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}
```

**Explanation**:

- Salt rounds 10: Standard untuk production (2^10 = 1024 iterations)
- bcrypt: Slow by design, resistant to brute force
- Async functions: Non-blocking

### 4.3 Auth Module Structure

**Yang akan dijelaskan**: Struktur lengkap Auth module

```
modules/auth/
├── auth.module.ts           # Module definition
├── auth.controller.ts       # HTTP endpoints
├── auth.service.ts          # Business logic
├── dto/                     # Data Transfer Objects
│   ├── index.ts
│   ├── daftar.dto.ts       # Registration DTO
│   ├── login.dto.ts        # Login DTO
│   ├── refresh-token.dto.ts
│   ├── lupa-password.dto.ts
│   └── reset-password.dto.ts
├── guards/                  # Route guards
│   ├── jwt-auth.guard.ts   # Protect routes with JWT
│   └── roles.guard.ts      # Role-based access control
├── strategies/              # Passport strategies
│   ├── jwt.strategy.ts     # JWT validation
│   └── local.strategy.ts   # Username/password
└── decorators/              # Custom decorators
    ├── public.decorator.ts      # Mark route as public
    ├── pengguna-saat-ini.decorator.ts  # Get current user
    └── peran.decorator.ts       # Require specific role
```

### 4.4 Auth DTOs dengan Zod

**File: `backend/src/modules/auth/dto/daftar.dto.ts`**

```typescript
import { z } from "zod";

export const DaftarSchema = z.object({
  email: z.string().email("Format email tidak valid").toLowerCase().trim(),

  kataSandi: z
    .string()
    .min(8, "Kata sandi minimal 8 karakter")
    .regex(/[A-Z]/, "Harus ada huruf besar")
    .regex(/[a-z]/, "Harus ada huruf kecil")
    .regex(/[0-9]/, "Harus ada angka"),

  namaDepan: z.string().min(2, "Nama depan minimal 2 karakter").max(50).trim(),

  namaBelakang: z
    .string()
    .min(2, "Nama belakang minimal 2 karakter")
    .max(50)
    .trim()
    .optional(),

  telepon: z
    .string()
    .regex(/^(\+62|62|0)[0-9]{9,13}$/, "Format telepon tidak valid")
    .optional(),

  peran: z.enum(["penulis", "editor", "percetakan"]).default("penulis"),
});

export type DaftarDto = z.infer<typeof DaftarSchema>;
```

**Validation Rules Explanation**:

- Email: Lowercase & trimmed untuk consistency
- Password: Strong password requirements
- Telepon: Indonesia phone format (+62/62/0)
- Peran: Default 'penulis', admin cannot self-register

### 4.5 Auth Service Implementation

**File: `backend/src/modules/auth/auth.service.ts`**

**Method 1: daftar() - Registration**

```typescript
async daftar(dto: DaftarDto) {
  // 1. Check email exists
  const emailExists = await this.prisma.pengguna.findUnique({
    where: { email: dto.email },
  });

  if (emailExists) {
    throw new ConflictException('Email sudah terdaftar');
  }

  // 2. Hash password
  const hashedPassword = await hashPassword(dto.kataSandi);

  // 3. Generate email verification token
  const tokenVerifikasi = crypto.randomBytes(32).toString('hex');

  // 4. Create user with transaction
  const pengguna = await this.prisma.$transaction(async (prisma) => {
    // Create user
    const newPengguna = await prisma.pengguna.create({
      data: {
        email: dto.email,
        kataSandi: hashedPassword,
        telepon: dto.telepon,
        terverifikasi: false,
      },
    });

    // Create profile
    await prisma.profilPengguna.create({
      data: {
        idPengguna: newPengguna.id,
        namaDepan: dto.namaDepan,
        namaBelakang: dto.namaBelakang,
      },
    });

    // Assign role
    await prisma.peranPengguna.create({
      data: {
        idPengguna: newPengguna.id,
        jenisPeran: dto.peran,
        aktif: true,
      },
    });

    // For penulis, create profil penulis
    if (dto.peran === 'penulis') {
      await prisma.profilPenulis.create({
        data: {
          idPengguna: newPengguna.id,
        },
      });
    }

    return newPengguna;
  });

  // 5. Send verification email (TODO: implement)
  // await this.emailService.sendVerificationEmail(pengguna.email, tokenVerifikasi);

  return {
    sukses: true,
    pesan: 'Registrasi berhasil. Silakan cek email untuk verifikasi.',
    data: {
      id: pengguna.id,
      email: pengguna.email,
    },
  };
}
```

**Explanation**:

- Transaction: Ensure atomic operation (all or nothing)
- Auto-create related records: Profile, Role, ProfilPenulis
- Email verification token: For future email verification feature

**Method 2: login() - Authentication**

```typescript
async login(dto: LoginDto): Promise<ResponseLogin> {
  // 1. Find user by email
  const pengguna = await this.prisma.pengguna.findUnique({
    where: { email: dto.email },
    include: {
      profilPengguna: true,
      peranPengguna: {
        where: { aktif: true },
        select: { jenisPeran: true },
      },
    },
  });

  if (!pengguna) {
    throw new UnauthorizedException('Email atau kata sandi salah');
  }

  // 2. Check if account is active
  if (!pengguna.aktif) {
    throw new UnauthorizedException('Akun Anda telah dinonaktifkan');
  }

  // 3. Verify password
  const passwordValid = await verifyPassword(dto.kataSandi, pengguna.kataSandi);
  if (!passwordValid) {
    throw new UnauthorizedException('Email atau kata sandi salah');
  }

  // 4. Extract roles
  const peran = pengguna.peranPengguna.map(p => p.jenisPeran);

  // 5. Generate tokens
  const payload: JwtPayload = {
    sub: pengguna.id,
    email: pengguna.email,
    peran,
  };

  const accessToken = this.jwtService.sign(payload);
  const refreshToken = this.jwtService.sign(payload, {
    expiresIn: this.configService.get('jwt.refreshExpiresIn'),
  });

  // 6. Save refresh token to database
  await this.prisma.tokenRefresh.create({
    data: {
      idPengguna: pengguna.id,
      token: refreshToken,
      platform: detectPlatform(dto.userAgent),
      berakhirPada: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  });

  // 7. Update last login
  await this.prisma.pengguna.update({
    where: { id: pengguna.id },
    data: { loginTerakhir: new Date() },
  });

  // 8. Return response
  return {
    accessToken,
    refreshToken,
    pengguna: {
      id: pengguna.id,
      email: pengguna.email,
      peran,
      terverifikasi: pengguna.terverifikasi,
      profilPengguna: pengguna.profilPengguna,
    },
  };
}
```

**Security Measures**:

- Generic error message untuk email/password salah (prevent enumeration)
- Check account active status
- Save refresh token to database (dapat di-revoke)
- Track login activity (loginTerakhir)

### 4.6 JWT Strategy

**File: `backend/src/modules/auth/strategies/jwt.strategy.ts`**

```typescript
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "@/prisma/prisma.service";
import { JwtPayload } from "../auth.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get("jwt.secret"),
    });
  }

  async validate(payload: JwtPayload) {
    // Verify user still exists and is active
    const pengguna = await this.prisma.pengguna.findUnique({
      where: { id: payload.sub },
      include: {
        peranPengguna: {
          where: { aktif: true },
          select: { jenisPeran: true },
        },
      },
    });

    if (!pengguna || !pengguna.aktif) {
      throw new UnauthorizedException("Token tidak valid");
    }

    // Return user object (will be attached to request)
    return {
      id: pengguna.id,
      email: pengguna.email,
      peran: pengguna.peranPengguna.map((p) => p.jenisPeran),
    };
  }
}
```

**Explanation**:

- Validate token signature & expiration
- Check if user still active (handle deleted/disabled users)
- Return user object → attached to `request.user`

### 4.7 Guards Implementation

**File: `backend/src/modules/auth/guards/jwt-auth.guard.ts`**

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
    // Check if route is marked as @Public()
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true; // Skip JWT validation
    }

    return super.canActivate(context);
  }
}
```

**File: `backend/src/modules/auth/guards/roles.guard.ts`**

```typescript
import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "../decorators/peran.decorator";
import { JenisPeran } from "@prisma/client";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Get required roles from decorator
    const requiredRoles = this.reflector.getAllAndOverride<JenisPeran[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (!requiredRoles) {
      return true; // No role requirement
    }

    // Get user from request
    const { user } = context.switchToHttp().getRequest();

    // Check if user has at least one of the required roles
    return requiredRoles.some((role) => user.peran?.includes(role));
  }
}
```

### 4.8 Custom Decorators

**File: `backend/src/modules/auth/decorators/public.decorator.ts`**

```typescript
import { SetMetadata } from "@nestjs/common";

export const IS_PUBLIC_KEY = "isPublic";
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

**Usage**:

```typescript
@Public()  // Skip JWT authentication
@Post('login')
async login(@Body() dto: LoginDto) {
  return this.authService.login(dto);
}
```

**File: `backend/src/modules/auth/decorators/pengguna-saat-ini.decorator.ts`**

```typescript
import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const PenggunaSaatIni = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    return data ? user?.[data] : user;
  }
);
```

**Usage**:

```typescript
@Get('profile')
async getProfile(@PenggunaSaatIni() user) {
  // user contains { id, email, peran }
  return user;
}

@Get('my-naskah')
async getMyNaskah(@PenggunaSaatIni('id') userId: string) {
  // Extract only userId
  return this.naskahService.getByAuthor(userId);
}
```

**File: `backend/src/modules/auth/decorators/peran.decorator.ts`**

```typescript
import { SetMetadata } from "@nestjs/common";
import { JenisPeran } from "@prisma/client";

export const ROLES_KEY = "roles";
export const Peran = (...roles: JenisPeran[]) => SetMetadata(ROLES_KEY, roles);
```

**Usage**:

```typescript
@Peran('admin')  // Only admin
@Delete(':id')
async deleteUser(@Param('id') id: string) {
  return this.userService.delete(id);
}

@Peran('penulis', 'editor')  // Penulis OR editor
@Get('dashboard')
async getDashboard() {
  return this.dashboardService.getData();
}
```

### 4.9 Auth Controller

**File: `backend/src/modules/auth/auth.controller.ts`**

```typescript
import { Controller, Post, Body, Get, UseGuards } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { DaftarDto, LoginDto, RefreshTokenDto } from "./dto";
import { Public } from "./decorators/public.decorator";
import { PenggunaSaatIni } from "./decorators/pengguna-saat-ini.decorator";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post("daftar")
  @ApiOperation({ summary: "Registrasi pengguna baru" })
  @ApiResponse({ status: 201, description: "Registrasi berhasil" })
  @ApiResponse({ status: 409, description: "Email sudah terdaftar" })
  async daftar(@Body() dto: DaftarDto) {
    return this.authService.daftar(dto);
  }

  @Public()
  @Post("login")
  @ApiOperation({ summary: "Login pengguna" })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Public()
  @Post("refresh")
  @ApiOperation({ summary: "Refresh access token" })
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto);
  }

  @ApiBearerAuth()
  @Get("profile")
  @ApiOperation({ summary: "Get current user profile" })
  async getProfile(@PenggunaSaatIni("id") userId: string) {
    return this.authService.getProfile(userId);
  }

  @ApiBearerAuth()
  @Post("logout")
  @ApiOperation({ summary: "Logout pengguna" })
  async logout(
    @PenggunaSaatIni("id") userId: string,
    @Body("refreshToken") refreshToken: string
  ) {
    return this.authService.logout(userId, refreshToken);
  }
}
```

---

## 5. BACKEND CORE SETUP

### 5.1 Main.ts Configuration

**Yang akan dijelaskan**: Setup entry point dengan semua middleware

**File: `backend/src/main.ts`**

```typescript
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import helmet from "helmet";
import * as compression from "compression";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security headers
  app.use(helmet());

  // Compression
  app.use(compression());

  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || "http://localhost:3001",
    credentials: true,
  });

  // Global prefix
  app.setGlobalPrefix("api");

  // Validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip unknown properties
      forbidNonWhitelisted: true, // Throw error if unknown props
      transform: true, // Auto transform types
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle("Publishify API")
    .setDescription("API untuk Sistem Penerbitan Naskah")
    .setVersion("1.0")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Backend running on http://localhost:${port}`);
  console.log(`📚 Swagger docs: http://localhost:${port}/api/docs`);
}

bootstrap();
```

---

## 6. FRONTEND CORE SETUP

### 6.1 API Client Configuration

**File: `frontend/lib/api/client.ts`**

```typescript
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try refresh token
        const refreshToken = localStorage.getItem("refreshToken");
        const { data } = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        });

        // Save new tokens
        localStorage.setItem("accessToken", data.accessToken);

        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
```

### 6.2 Auth Store dengan Zustand

**File: `frontend/stores/use-auth-store.ts`**

```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  email: string;
  peran: string[];
  terverifikasi: boolean;
  profilPengguna?: any;
}

interface AuthStore {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;

  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,

      setAuth: (user, accessToken, refreshToken) => {
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        set({ user, accessToken, refreshToken });
      },

      clearAuth: () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        set({ user: null, accessToken: null, refreshToken: null });
      },

      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),
    }),
    {
      name: "auth-storage",
    }
  )
);
```

### 6.3 React Query Setup

**File: `frontend/components/providers/query-provider.tsx`**

```typescript
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

export function QueryProvider({ children }: { children: React.Node }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

**File: `frontend/app/layout.tsx`**

```typescript
import { QueryProvider } from "@/components/providers/query-provider";
import { Toaster } from "sonner";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>
        <QueryProvider>
          {children}
          <Toaster position="top-right" />
        </QueryProvider>
      </body>
    </html>
  );
}
```

---

## 7. TESTING & VERIFICATION

### 7.1 Backend API Testing

**Yang akan dijelaskan**: Test semua endpoints dengan Thunder Client/Postman

**Test 1: Register**

```http
POST http://localhost:3000/api/auth/daftar
Content-Type: application/json

{
  "email": "penulis@test.com",
  "kataSandi": "Password123",
  "namaDepan": "John",
  "namaBelakang": "Doe",
  "telepon": "081234567890",
  "peran": "penulis"
}

# Expected Response: 201
# {
#   "sukses": true,
#   "pesan": "Registrasi berhasil. Silakan cek email untuk verifikasi.",
#   "data": { "id": "uuid", "email": "penulis@test.com" }
# }
```

**Test 2: Login**

```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "penulis@test.com",
  "kataSandi": "Password123"
}

# Expected Response: 200
# {
#   "accessToken": "eyJhbGc...",
#   "refreshToken": "eyJhbGc...",
#   "pengguna": {
#     "id": "uuid",
#     "email": "penulis@test.com",
#     "peran": ["penulis"],
#     ...
#   }
# }
```

### 7.2 Frontend Login Page Testing

**Yang akan dijelaskan**: Test login flow end-to-end

**Steps**:

1. Navigate to http://localhost:3001/login
2. Input email & password
3. Submit form
4. Verify redirect to dashboard
5. Check localStorage for tokens
6. Verify user state in Zustand devtools

---

## 8. DEPLOYMENT CHECKLIST

### 8.1 Environment Variables

**Backend `.env.example`**:

```env
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# JWT
JWT_SECRET="min-32-characters-secret-key"
JWT_EXPIRES_IN="7d"
JWT_REFRESH_SECRET="refresh-secret-key"
JWT_REFRESH_EXPIRES_IN="30d"

# Redis
REDIS_HOST="localhost"
REDIS_PORT=6379

# App
PORT=3000
NODE_ENV=development
FRONTEND_URL="http://localhost:3001"
```

**Frontend `.env.local.example`**:

```env
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
```

### 8.2 Run Development Servers

```bash
# Terminal 1: Backend
cd backend
bun run start:dev

# Terminal 2: Frontend
cd frontend
bun run dev
```

---

## 9. TROUBLESHOOTING COMMON ISSUES

### Issue 1: Prisma Client Not Generated

```bash
# Solution
cd backend
bunx prisma generate
```

### Issue 2: Database Connection Failed

- Check DATABASE_URL format
- Verify Supabase project is active
- Check firewall/network settings

### Issue 3: CORS Error

- Verify FRONTEND_URL in backend .env
- Check CORS configuration in main.ts

---

## 10. NEXT STEPS

Setelah Fase 1 selesai, lanjut ke:

- **Fase 2**: User & Content Management (Kategori, Genre, Naskah CRUD)
- **Fase 3**: Review System (Assignment, Feedback, Recommendations)
- **Fase 4**: Printing System (Orders, Pricing, Shipping)
- **Fase 5**: Integration & Deployment

---

## 📊 METRICS FASE 1

**Total Time**: ~98 jam (14 hari kerja)
**Backend LOC**: ~3,500
**Frontend LOC**: ~2,000
**Database Tables**: 8 (User management)
**API Endpoints**: 6 (auth endpoints)

**Deliverables**:
✅ Project structure complete  
✅ Database setup with Prisma  
✅ Authentication system functional  
✅ JWT + Role-based access control  
✅ Backend API documented (Swagger)  
✅ Frontend routing & state management  
✅ API client configured

---

**END OF RANCANGAN FASE 1**

_Catatan: Ini adalah RANCANGAN untuk pembuatan laporan development actual. Laporan actual akan berisi penjelasan lebih detail, screenshot, dan troubleshooting lebih lengkap._
