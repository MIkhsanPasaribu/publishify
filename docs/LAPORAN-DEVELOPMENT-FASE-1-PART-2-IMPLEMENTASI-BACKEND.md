# LAPORAN DEVELOPMENT STEP BY STEP SISTEM PUBLISHIFY

# FASE 1: PART 2 - IMPLEMENTASI BACKEND

**Dokumen**: Part 2 dari 4  
**Fokus**: Tutorial Implementasi Backend Step by Step  
**Tech Stack**: NestJS 10.3+ + Bun + Prisma 6.18+ + PostgreSQL (Supabase)

---

## D. IMPLEMENTASI BACKEND (STEP BY STEP)

Bagian ini mendokumentasikan proses implementasi backend secara detail dan kronologis. Kami akan menjelaskan setiap langkah dengan reasoning di balik keputusan teknis yang kami ambil.

### D.1 Persiapan Environment

#### D.1.1 Instalasi Bun Runtime

Langkah pertama adalah menginstal Bun sebagai runtime environment kami.

**Mengapa Bun?**
Seperti dijelaskan di analisis, kami memilih Bun karena performance yang superior, built-in TypeScript support, dan developer experience yang excellent.

**Langkah Instalasi:**

💻 **Windows (PowerShell):**

```powershell
# Download dan install Bun
irm bun.sh/install.ps1 | iex

# Verifikasi instalasi
bun --version
```

💻 **macOS/Linux:**

```bash
# Install via curl
curl -fsSL https://bun.sh/install | bash

# Verifikasi instalasi
bun --version
```

> ⚠️ **Catatan**: Pastikan Bun version minimal 1.0.0 atau lebih baru. Kami menggunakan Bun 1.1.38 saat development.

#### D.1.2 Instalasi Database (PostgreSQL via Supabase)

Kami menggunakan Supabase untuk managed PostgreSQL karena:

- Managed database dengan automated backups
- Built-in authentication features (bonus untuk future)
- Real-time subscriptions (untuk future features)
- Storage bucket untuk file uploads
- Free tier yang generous untuk development

**Setup Supabase Project:**

1. **Buat Account di Supabase**

   - Kunjungi https://supabase.com
   - Sign up dengan GitHub/Google
   - Verifikasi email

2. **Create New Project**

   - Klik "New Project"
   - Isi detail:
     - Project Name: `publishify-dev`
     - Database Password: (generate strong password)
     - Region: Southeast Asia (Singapore)
   - Tunggu provisioning (~2 menit)

3. **Get Connection String**
   - Navigate ke Settings > Database
   - Copy connection string format:
     ```
     postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
     ```
   - Simpan untuk `.env` file

> 📸 **Screenshot**: `docs/screenshots/development/supabase-project-setup.png`

#### D.1.3 Instalasi Redis

Redis kami gunakan untuk caching dan session management.

💻 **Development (Docker):**

```bash
# Pull Redis image
docker pull redis:7-alpine

# Run Redis container
docker run -d \
  --name publishify-redis \
  -p 6379:6379 \
  redis:7-alpine

# Verifikasi Redis berjalan
docker ps | grep redis
```

💻 **Alternative (Local Installation):**
Windows: Download dari https://github.com/tporadowski/redis/releases
macOS: `brew install redis && brew services start redis`
Linux: `sudo apt-get install redis-server`

**Test Koneksi Redis:**

```bash
# Masuk ke Redis CLI
docker exec -it publishify-redis redis-cli

# Test PING command
127.0.0.1:6379> PING
# Response: PONG

# Exit
127.0.0.1:6379> exit
```

### D.2 Inisialisasi Project NestJS

#### D.2.1 Setup Project Backend

💻 **Buat Project NestJS:**

```bash
# Install Nest CLI global
bun add -g @nestjs/cli

# Create new project
nest new backend --package-manager bun

# Navigasi ke folder backend
cd backend
```

Saat prompted "Which package manager would you like to use?", pilih **bun**.

NestJS CLI akan generate struktur folder dasar:

```
backend/
├── src/
│   ├── main.ts              # Entry point
│   ├── app.module.ts        # Root module
│   ├── app.controller.ts    # Default controller
│   ├── app.service.ts       # Default service
│   └── app.controller.spec.ts # Default test
├── test/
├── nest-cli.json
├── package.json
├── tsconfig.json
└── tsconfig.build.json
```

#### D.2.2 Instalasi Dependencies

**Core Dependencies:**

💻 **Install Core Packages:**

```bash
# NestJS Core & Platform
bun add @nestjs/common @nestjs/core @nestjs/platform-express

# Configuration & Validation
bun add @nestjs/config class-validator class-transformer zod

# Database & ORM
bun add @nestjs/prisma prisma @prisma/client

# Authentication & Security
bun add @nestjs/jwt @nestjs/passport passport passport-jwt \
  passport-local bcrypt @types/bcrypt

# OAuth
bun add @nestjs/passport passport-google-oauth20 \
  @types/passport-google-oauth20

# Caching & Queue
bun add @nestjs/cache-manager cache-manager \
  @nestjs/bull bull ioredis

# WebSocket & Real-time
bun add @nestjs/websockets @nestjs/platform-socket.io socket.io

# API Documentation
bun add @nestjs/swagger swagger-ui-express

# Utility Libraries
bun add uuid date-fns @types/uuid

# HTTP Client
bun add axios

# Logging
bun add winston nest-winston

# Security
bun add helmet @nestjs/throttler
```

**Development Dependencies:**

💻 **Install Dev Packages:**

```bash
# Testing
bun add -d @nestjs/testing jest @types/jest ts-jest \
  supertest @types/supertest

# TypeScript & Types
bun add -d typescript @types/node @types/express

# Linting & Formatting
bun add -d eslint @typescript-eslint/eslint-plugin \
  @typescript-eslint/parser prettier eslint-config-prettier \
  eslint-plugin-prettier

# Build Tools
bun add -d @nestjs/cli ts-loader
```

> 📁 **Referensi**: Lihat `backend/package.json` untuk version lengkap semua dependencies

#### D.2.3 Konfigurasi TypeScript

Kami update `tsconfig.json` untuk type safety maksimal:

> 📁 **File**: `backend/tsconfig.json`

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2021",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strict": true,
    "strictNullChecks": true,
    "noImplicitAny": true,
    "strictBindCallApply": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

**Key Configuration:**

- `strict: true` → Type safety maksimal
- `paths` → Alias `@/` untuk import yang clean
- `experimentalDecorators: true` → Required untuk NestJS decorators
- `target: ES2021` → Modern JavaScript features

### D.3 Setup Prisma ORM

#### D.3.1 Inisialisasi Prisma

💻 **Initialize Prisma:**

```bash
# Initialize Prisma dengan PostgreSQL provider
bunx prisma init --datasource-provider postgresql
```

Command ini akan membuat:

- `prisma/` folder
- `prisma/schema.prisma` file
- `.env` file dengan `DATABASE_URL` placeholder

#### D.3.2 Konfigurasi Environment Variables

> 📁 **File**: `backend/.env`

```bash
# Database Connection
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# JWT Configuration
JWT_SECRET="[GENERATE-STRONG-SECRET-KEY]"
JWT_ACCESS_TOKEN_EXPIRATION="15m"
JWT_REFRESH_TOKEN_EXPIRATION="7d"

# OAuth Google
GOOGLE_CLIENT_ID="[YOUR-GOOGLE-CLIENT-ID]"
GOOGLE_CLIENT_SECRET="[YOUR-GOOGLE-CLIENT-SECRET]"
GOOGLE_CALLBACK_URL="http://localhost:4000/api/auth/google/callback"

# Redis Configuration
REDIS_HOST="localhost"
REDIS_PORT="6379"
REDIS_PASSWORD=""

# Application Configuration
NODE_ENV="development"
PORT="4000"
FRONTEND_URL="http://localhost:3000"

# CORS Origins
CORS_ORIGINS="http://localhost:3000,http://localhost:4000"
```

> ⚠️ **Security**: File `.env` harus di-add ke `.gitignore`!

💻 **Generate JWT Secret:**

```bash
# Generate secure random string
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

#### D.3.3 Pembuatan Database Schema

Ini adalah bagian paling krusial. Kami merancang 28 tabel dengan relationships yang kompleks.

> 📁 **File**: `backend/prisma/schema.prisma`

Berikut struktur schema kami (excerpt untuk Domain User Management):

```prisma
// Prisma Schema untuk Publishify
generator client {
  provider = "prisma-client-js"
  binaryTargets = ["native"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// =====================================================
// DOMAIN 1: USER MANAGEMENT
// =====================================================

model Pengguna {
  id                    String    @id @default(uuid())
  email                 String    @unique
  kataSandi             String?   // Nullable untuk OAuth users
  telepon               String?

  // OAuth Fields
  googleId              String?   @unique
  facebookId            String?   @unique
  provider              String?   // 'google' | 'facebook' | 'local'
  avatarUrl             String?

  // Status & Verification
  aktif                 Boolean   @default(true)
  terverifikasi         Boolean   @default(false)
  emailDiverifikasiPada DateTime?
  loginTerakhir         DateTime?

  // Timestamps
  dibuatPada            DateTime  @default(now())
  diperbaruiPada        DateTime  @updatedAt

  // Relations
  profilPengguna        ProfilPengguna?
  peranPengguna         PeranPengguna[]
  profilPenulis         ProfilPenulis?
  naskah                Naskah[]
  reviewNaskah          ReviewNaskah[]
  tokenRefresh          TokenRefresh[]
  notifikasi            Notifikasi[]
  aktivitasPengguna     AktivitasPengguna[]

  @@index([email])
  @@index([googleId])
  @@index([aktif, terverifikasi])
  @@map("pengguna")
}

model ProfilPengguna {
  id             String    @id @default(uuid())
  idPengguna     String    @unique
  namaDepan      String?
  namaBelakang   String?
  namaTampilan   String?
  bio            String?   @db.Text
  urlAvatar      String?
  tanggalLahir   DateTime?
  jenisKelamin   String?
  alamat         String?
  kota           String?
  provinsi       String?
  kodePos        String?
  dibuatPada     DateTime  @default(now())
  diperbaruiPada DateTime  @updatedAt

  pengguna       Pengguna  @relation(fields: [idPengguna], references: [id], onDelete: Cascade)

  @@index([namaTampilan])
  @@map("profil_pengguna")
}

model PeranPengguna {
  id              String      @id @default(uuid())
  idPengguna      String
  jenisPeran      JenisPeran
  aktif           Boolean     @default(true)
  ditugaskanPada  DateTime    @default(now())
  ditugaskanOleh  String?

  pengguna        Pengguna    @relation(fields: [idPengguna], references: [id], onDelete: Cascade)

  @@unique([idPengguna, jenisPeran])
  @@index([jenisPeran, aktif])
  @@map("peran_pengguna")
}

model ProfilPenulis {
  id                  String   @id @default(uuid())
  idPengguna          String   @unique
  namaPena            String?
  biografi            String?  @db.Text
  spesialisasi        String[] // Array of strings
  totalBuku           Int      @default(0)
  totalDibaca         Int      @default(0)
  ratingRataRata      Decimal  @default(0) @db.Decimal(3,2)

  // Banking Info
  namaRekeningBank    String?
  namaBank            String?
  nomorRekeningBank   String?
  npwp                String?

  dibuatPada          DateTime @default(now())
  diperbaruiPada      DateTime @updatedAt

  pengguna            Pengguna @relation(fields: [idPengguna], references: [id], onDelete: Cascade)

  @@index([idPengguna])
  @@map("profil_penulis")
}

// =====================================================
// ENUMS
// =====================================================

enum JenisPeran {
  penulis
  editor
  percetakan
  admin

  @@map("jenis_peran")
}

// ... (26 tabel lainnya untuk domain Content, Review, Printing, dll)
```

> 📁 **Full Schema**: Lihat `backend/prisma/schema.prisma` untuk 28 tabel lengkap (2000+ baris)

**Penjelasan Design Decisions:**

1. **UUID untuk Primary Keys:**

   - Security: Unpredictable, tidak bisa di-enumerate
   - Distribution: Uniform distribution tanpa hotspot
   - Scalability: Bisa generate di client-side untuk offline-first apps

2. **Nullable Password (kataSandi?):**

   - Support OAuth users yang tidak perlu password
   - Users dari Google OAuth tidak memiliki password

3. **Soft Delete dengan Field `aktif`:**

   - Tidak langsung hapus data untuk audit trail
   - Bisa restore jika diperlukan

4. **Timestamps Standar:**

   - `dibuatPada` → Auto-set saat create
   - `diperbaruiPada` → Auto-update saat modify
   - Format: ISO 8601 UTC

5. **Cascading Deletes:**
   - `onDelete: Cascade` → Otomatis hapus related records
   - Contoh: Hapus Pengguna → Otomatis hapus ProfilPengguna

#### D.3.4 Generate dan Migrate Database

💻 **Generate Prisma Client:**

```bash
# Generate TypeScript client dari schema
bunx prisma generate
```

Ini akan membuat type-safe Prisma Client di `node_modules/@prisma/client`.

💻 **Create dan Run Migration:**

```bash
# Create migration untuk initial schema
bunx prisma migrate dev --name init_database_schema

# Prisma akan:
# 1. Create migration file di prisma/migrations/
# 2. Execute SQL ke database
# 3. Re-generate Prisma Client
```

> 📸 **Screenshot**: `docs/screenshots/development/prisma-migration-success.png`

💻 **Verify Database:**

```bash
# Open Prisma Studio untuk visualisasi database
bunx prisma studio
```

Prisma Studio akan terbuka di browser (http://localhost:5555) dan menampilkan semua tabel.

> 📸 **Screenshot**: `docs/screenshots/development/prisma-studio-tables.png`

#### D.3.5 Create Prisma Module

Kami buat Prisma module yang reusable untuk dependency injection.

> 📁 **File**: `backend/src/prisma/prisma.module.ts`

```typescript
import { Global, Module } from "@nestjs/common";
import { PrismaService } from "./prisma.service";

@Global() // Global module agar bisa di-inject di semua module
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // Export untuk digunakan module lain
})
export class PrismaModule {}
```

> 📁 **File**: `backend/src/prisma/prisma.service.ts`

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
      log:
        process.env.NODE_ENV === "development"
          ? ["query", "error", "warn"]
          : ["error"],
      errorFormat: "pretty",
    });
  }

  async onModuleInit() {
    await this.$connect();
    console.log("✅ Prisma connected to database");
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log("🔴 Prisma disconnected from database");
  }
}
```

**Penjelasan:**

- `@Global()` → Prisma service available di semua modules tanpa perlu import
- `onModuleInit` → Connect ke database saat app startup
- `onModuleDestroy` → Disconnect gracefully saat app shutdown
- Conditional logging → Query logs hanya di development

### D.4 Implementasi Authentication System

#### D.4.1 Setup Configuration Module

> 📁 **File**: `backend/src/config/configuration.ts`

```typescript
export default () => ({
  port: parseInt(process.env.PORT, 10) || 4000,
  database: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    accessTokenExpiration: process.env.JWT_ACCESS_TOKEN_EXPIRATION || "15m",
    refreshTokenExpiration: process.env.JWT_REFRESH_TOKEN_EXPIRATION || "7d",
  },
  oauth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackUrl: process.env.GOOGLE_CALLBACK_URL,
    },
  },
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
  },
  cors: {
    origins: process.env.CORS_ORIGINS?.split(",") || ["http://localhost:3000"],
  },
});
```

#### D.4.2 Create Auth Module Structure

💻 **Generate Auth Module:**

```bash
# Generate module, controller, service sekaligus
nest g module modules/auth
nest g controller modules/auth
nest g service modules/auth
```

Struktur yang terbentuk:

```
src/modules/auth/
├── auth.module.ts
├── auth.controller.ts
├── auth.service.ts
├── strategies/
│   ├── jwt.strategy.ts
│   ├── local.strategy.ts
│   └── google.strategy.ts
├── guards/
│   ├── jwt-auth.guard.ts
│   ├── local-auth.guard.ts
│   └── roles.guard.ts
├── decorators/
│   ├── pengguna-saat-ini.decorator.ts
│   └── peran.decorator.ts
└── dto/
    ├── register.dto.ts
    ├── login.dto.ts
    └── refresh-token.dto.ts
```

#### D.4.3 Implementasi DTO dengan Zod Validation

> 📁 **File**: `backend/src/modules/auth/dto/register.dto.ts`

```typescript
import { z } from "zod";

export const RegisterDtoSchema = z
  .object({
    email: z
      .string()
      .email("Format email tidak valid")
      .min(5, "Email minimal 5 karakter")
      .max(100, "Email maksimal 100 karakter"),

    kataSandi: z
      .string()
      .min(8, "Kata sandi minimal 8 karakter")
      .max(128, "Kata sandi maksimal 128 karakter")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        "Kata sandi harus mengandung huruf besar, huruf kecil, angka, dan karakter khusus"
      ),

    konfirmasiKataSandi: z.string(),

    namaDepan: z.string().min(2).max(50).optional(),
    namaBelakang: z.string().min(2).max(50).optional(),
    telepon: z
      .string()
      .regex(/^(\+62|0)[0-9]{9,12}$/)
      .optional(),
  })
  .refine((data) => data.kataSandi === data.konfirmasiKataSandi, {
    message: "Konfirmasi kata sandi tidak cocok",
    path: ["konfirmasiKataSandi"],
  });

export type RegisterDto = z.infer<typeof RegisterDtoSchema>;
```

**Validasi yang Diterapkan:**

- Email format validation
- Strong password policy (min 8 char, uppercase, lowercase, number, special char)
- Password confirmation match
- Indonesian phone number format

#### D.4.4 Implementasi Auth Service

> 📁 **File**: `backend/src/modules/auth/auth.service.ts`

```typescript
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "@/prisma/prisma.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import * as bcrypt from "bcrypt";

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  async register(dto: RegisterDto) {
    // Check email sudah terdaftar
    const existingUser = await this.prisma.pengguna.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException("Email sudah terdaftar");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.kataSandi, 12);

    // Create user dengan transaction
    const pengguna = await this.prisma.$transaction(async (tx) => {
      // Buat pengguna
      const newUser = await tx.pengguna.create({
        data: {
          email: dto.email,
          kataSandi: hashedPassword,
          telepon: dto.telepon,
          provider: "local",
        },
      });

      // Buat profil pengguna
      await tx.profilPengguna.create({
        data: {
          idPengguna: newUser.id,
          namaDepan: dto.namaDepan,
          namaBelakang: dto.namaBelakang,
        },
      });

      // Assign default role: penulis
      await tx.peranPengguna.create({
        data: {
          idPengguna: newUser.id,
          jenisPeran: "penulis",
        },
      });

      return newUser;
    });

    // Generate tokens
    const tokens = await this.generateTokens(pengguna.id, pengguna.email);

    return {
      sukses: true,
      pesan: "Registrasi berhasil. Silakan verifikasi email Anda.",
      data: {
        pengguna: this.sanitizeUser(pengguna),
        ...tokens,
      },
    };
  }

  async login(dto: LoginDto) {
    // Validate user credentials
    const pengguna = await this.validateUser(dto.email, dto.kataSandi);

    if (!pengguna) {
      throw new UnauthorizedException("Email atau kata sandi salah");
    }

    // Update last login
    await this.prisma.pengguna.update({
      where: { id: pengguna.id },
      data: { loginTerakhir: new Date() },
    });

    // Generate tokens
    const tokens = await this.generateTokens(pengguna.id, pengguna.email);

    return {
      sukses: true,
      pesan: "Login berhasil",
      data: {
        pengguna: this.sanitizeUser(pengguna),
        ...tokens,
      },
    };
  }

  private async validateUser(email: string, kataSandi: string) {
    const pengguna = await this.prisma.pengguna.findUnique({
      where: { email },
      include: {
        profilPengguna: true,
        peranPengguna: true,
      },
    });

    if (!pengguna || !pengguna.kataSandi) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(kataSandi, pengguna.kataSandi);

    if (!isPasswordValid) {
      return null;
    }

    return pengguna;
  }

  private async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, { expiresIn: "15m" }),
      this.jwtService.signAsync(payload, { expiresIn: "7d" }),
    ]);

    // Store refresh token in database
    await this.prisma.tokenRefresh.create({
      data: {
        idPengguna: userId,
        token: refreshToken,
        kadaluarsaPada: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    return { accessToken, refreshToken };
  }

  private sanitizeUser(pengguna: any) {
    const { kataSandi, ...result } = pengguna;
    return result;
  }
}
```

**Key Implementation Points:**

1. **Password Hashing dengan bcrypt:**

   - Salt rounds: 12 (balance antara security dan performance)
   - Async hashing untuk non-blocking

2. **Transaction untuk Atomicity:**

   - Buat user + profile + role dalam 1 transaction
   - Rollback otomatis jika ada error

3. **Token Generation:**

   - Access token: 15 menit (short-lived)
   - Refresh token: 7 hari (long-lived)
   - Payload minimal (hanya userId dan email)

4. **Security Best Practices:**
   - Never return password in response
   - Check email uniqueness before insert
   - Validate password strength
   - Log last login for audit

#### D.4.5 Implementasi JWT Strategy

> 📁 **File**: `backend/src/modules/auth/strategies/jwt.strategy.ts`

```typescript
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "@/prisma/prisma.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>("jwt.secret"),
    });
  }

  async validate(payload: any) {
    // Payload dari JWT: { sub: userId, email }
    const pengguna = await this.prisma.pengguna.findUnique({
      where: { id: payload.sub },
      include: {
        profilPengguna: true,
        peranPengguna: {
          where: { aktif: true },
          select: { jenisPeran: true },
        },
      },
    });

    if (!pengguna || !pengguna.aktif) {
      throw new UnauthorizedException("Pengguna tidak valid atau tidak aktif");
    }

    // Attach user ke request object
    return {
      id: pengguna.id,
      email: pengguna.email,
      roles: pengguna.peranPengguna.map((p) => p.jenisPeran),
      profil: pengguna.profilPengguna,
    };
  }
}
```

**Cara Kerja JWT Strategy:**

1. Extract token dari header `Authorization: Bearer <token>`
2. Verify token signature dengan secret key
3. Decode payload
4. Validate user masih exist dan aktif di database
5. Attach user data ke request object untuk digunakan di controller

#### D.4.6 Implementasi OAuth Google Strategy

> 📁 **File**: `backend/src/modules/auth/strategies/google.strategy.ts`

```typescript
import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, VerifyCallback } from "passport-google-oauth20";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "@/prisma/prisma.service";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService
  ) {
    super({
      clientID: configService.get<string>("oauth.google.clientId"),
      clientSecret: configService.get<string>("oauth.google.clientSecret"),
      callbackURL: configService.get<string>("oauth.google.callbackUrl"),
      scope: ["email", "profile"],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback
  ): Promise<any> {
    const { id, name, emails, photos } = profile;

    // Find or create user
    let pengguna = await this.prisma.pengguna.findUnique({
      where: { googleId: id },
      include: {
        profilPengguna: true,
        peranPengguna: true,
      },
    });

    if (!pengguna) {
      // Create new user dari Google OAuth
      pengguna = await this.prisma.$transaction(async (tx) => {
        const newUser = await tx.pengguna.create({
          data: {
            email: emails[0].value,
            googleId: id,
            provider: "google",
            avatarUrl: photos[0]?.value,
            terverifikasi: true, // Auto-verify untuk OAuth users
            emailDiverifikasiPada: new Date(),
          },
        });

        // Create profile
        await tx.profilPengguna.create({
          data: {
            idPengguna: newUser.id,
            namaDepan: name.givenName,
            namaBelakang: name.familyName,
            urlAvatar: photos[0]?.value,
          },
        });

        // Assign default role
        await tx.peranPengguna.create({
          data: {
            idPengguna: newUser.id,
            jenisPeran: "penulis",
          },
        });

        return tx.pengguna.findUnique({
          where: { id: newUser.id },
          include: {
            profilPengguna: true,
            peranPengguna: true,
          },
        });
      });
    }

    done(null, pengguna);
  }
}
```

**OAuth Flow:**

1. User klik "Login dengan Google"
2. Redirect ke Google consent screen
3. Google callback dengan authorization code
4. Exchange code untuk access token
5. Get user profile dari Google
6. Find or create user di database
7. Generate JWT tokens
8. Redirect ke frontend dengan tokens

> 📸 **Screenshot**: `docs/screenshots/development/google-oauth-flow.png`

### D.5 Implementasi Guards dan Decorators

#### D.5.1 JWT Auth Guard

> 📁 **File**: `backend/src/modules/auth/guards/jwt-auth.guard.ts`

```typescript
import { Injectable, ExecutionContext } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Reflector } from "@nestjs/core";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Check jika route adalah public
    const isPublic = this.reflector.getAllAndOverride<boolean>("isPublic", [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true; // Skip authentication
    }

    return super.canActivate(context);
  }
}
```

#### D.5.2 Roles Guard

> 📁 **File**: `backend/src/modules/auth/guards/roles.guard.ts`

```typescript
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JenisPeran } from "@prisma/client";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<JenisPeran[]>(
      "roles",
      [context.getHandler(), context.getClass()]
    );

    if (!requiredRoles) {
      return true; // No roles required
    }

    const { user } = context.switchToHttp().getRequest();

    const hasRole = requiredRoles.some((role) => user.roles?.includes(role));

    if (!hasRole) {
      throw new ForbiddenException("Anda tidak memiliki akses ke resource ini");
    }

    return true;
  }
}
```

#### D.5.3 Custom Decorators

> 📁 **File**: `backend/src/modules/auth/decorators/pengguna-saat-ini.decorator.ts`

```typescript
import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const PenggunaSaatIni = createParamDecorator(
  (field: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    return field ? user?.[field] : user;
  }
);
```

> 📁 **File**: `backend/src/modules/auth/decorators/peran.decorator.ts`

```typescript
import { SetMetadata } from "@nestjs/common";
import { JenisPeran } from "@prisma/client";

export const Peran = (...roles: JenisPeran[]) => SetMetadata("roles", roles);
```

**Usage Example:**

```typescript
@Get('admin-only')
@UseGuards(JwtAuthGuard, RolesGuard)
@Peran('admin')
async adminOnlyEndpoint(@PenggunaSaatIni() pengguna: any) {
  return { pengguna };
}
```

---

**Catatan:**

Dokumen ini adalah **Part 2** dari Laporan Development Step by Step Fase 1. Untuk implementasi frontend, lanjut ke **Part 3**. Untuk pengujian dan evaluasi, lanjut ke **Part 4**.

> 📸 **Screenshot Placeholders:**
>
> - Auth flow diagram: `docs/screenshots/development/auth-flow-complete.png`
> - Postman testing: `docs/screenshots/development/auth-endpoints-tested.png`
> - JWT token structure: `docs/screenshots/development/jwt-payload-example.png`

---

_Dokumen dilanjutkan ke Part 3: Implementasi Frontend Step by Step_
