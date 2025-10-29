# Copilot Instructions - Sistem Penerbitan Naskah Publishify

## 🎯 Ringkasan Project

**Publishify** adalah sistem manajemen lengkap untuk penerbitan buku dan naskah yang mencakup proses dari penulisan, review, percetakan hingga distribusi. Sistem ini menggunakan arsitektur **monorepo** dengan **frontend (Next.js)** dan **backend (NestJS)** yang terpisah.

## 🏗️ Arsitektur Project

### Struktur Folder Utama

```
Publishify/
├── frontend/              # Next.js Application
├── backend/               # NestJS API
├── docs/                  # Documentation & Workflows
├── scripts/               # Build & deployment scripts
└── .github/               # GitHub workflows & configs
```

### PENTING: Bahasa Indonesia untuk Konten User-Facing

- **Variabel, Function, Class**: Bahasa Indonesia (camelCase/PascalCase)
- **String/Pesan User**: WAJIB Bahasa Indonesia
- **Komentar Kode**: Bahasa Indonesia
- **Response API**: Bahasa Indonesia
- **Nama File**: Bahasa Indonesia (kebab-case)
- **Database**: Nama tabel & kolom dalam Bahasa Indonesia (snake_case)

## 🛠️ Tech Stack

### Runtime & Package Manager

- **Runtime**: Bun (v1.0+)
- **Package Manager**: Bun
- **TypeScript**: v5.0+

### Frontend Stack (Next.js)

- **Framework**: Next.js 14+ (App Router)
- **API**: REST API
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Form Handling**: React Hook Form + Zod
- **HTTP Client**: Axios
- **Real-time**: Socket.io-client
- **Date Handling**: date-fns
- **File Upload**: react-dropzone
- **Rich Text Editor**: TipTap atau Lexical
- **Charts**: Recharts
- **Icons**: Lucide React
- **Notifications**: Sonner

### Backend Stack (NestJS)

- **Framework**: NestJS 10+
- **Arsitektur**: REST API + WebSocket (Socket.io)
- **Language**: TypeScript
- **Database**: PostgreSQL 14+ (dengan Supabase)
- **ORM**: Prisma
- **Authentication**: JWT + Passport
- **Validation**: Zod + class-validator
- **File Upload**: Multer + Sharp
- **Email**: Nodemailer
- **Real-time**: Socket.io
- **Job Queue**: Bull + Redis
- **Caching**: Redis
- **Documentation**: Swagger/OpenAPI
- **Logging**: Winston
- **Security**: Helmet, CORS, Throttler

### Database & Storage

- **Primary DB**: PostgreSQL 14+
- **ORM**: Prisma
- **Features**: Row Level Security (RLS), Full-text Search, JSONB
- **File Storage**: Supabase Storage
- **Cache**: Redis
- **Search**: PostgreSQL Full-text Search

## 📋 Konvensi Penamaan & Bahasa

### PENTING: Bahasa Indonesia untuk Konten User-Facing

- **Variabel, Function, Class**: Bahasa Indonesia (camelCase/PascalCase)
- **String/Pesan User**: WAJIB Bahasa Indonesia
- **Komentar Kode**: Bahasa Indonesia
- **Response API**: Bahasa Indonesia
- **Nama File**: Bahasa Indonesia (kebab-case)
- **Database**: Nama tabel & kolom dalam Bahasa Indonesia (snake_case)

### Contoh Penamaan yang Benar

```typescript
// ✅ BENAR
const ambilDataNaskah = async (idNaskah: string) => {
  const naskah = await prisma.naskah.findUnique({
    where: { id: idNaskah },
  });

  if (!naskah) {
    throw new Error("Naskah tidak ditemukan");
  }

  return naskah;
};

interface DataPengguna {
  id: string;
  email: string;
  namaLengkap: string;
}

// ❌ SALAH
const getManuscriptData = async (manuscriptId: string) => {
  // Jangan gunakan bahasa Inggris
};
```

## 📁 Struktur Frontend (Next.js 14+)

### Direktori `frontend/`

```
frontend/
├── public/                    # Static assets
│   ├── images/               # Gambar statis
│   ├── icons/                # Icon files
│   └── fonts/                # Custom fonts
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── (auth)/          # Auth group routes
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── lupa-password/
│   │   ├── (dashboard)/     # Dashboard group routes
│   │   │   ├── penulis/
│   │   │   ├── editor/
│   │   │   ├── percetakan/
│   │   │   └── admin/
│   │   ├── (publik)/        # Public routes
│   │   │   ├── naskah/
│   │   │   └── penulis/
│   │   ├── layout.tsx       # Root layout
│   │   ├── page.tsx         # Homepage
│   │   └── error.tsx        # Error page
│   ├── components/          # React components
│   │   ├── ui/             # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── ...
│   │   ├── forms/          # Form components
│   │   │   ├── form-naskah.tsx
│   │   │   ├── form-review.tsx
│   │   │   └── form-pesanan-cetak.tsx
│   │   ├── layouts/        # Layout components
│   │   │   ├── header-dashboard.tsx
│   │   │   ├── sidebar-navigasi.tsx
│   │   │   └── footer.tsx
│   │   ├── modules/        # Feature-specific components
│   │   │   ├── naskah/
│   │   │   ├── review/
│   │   │   ├── percetakan/
│   │   │   └── pembayaran/
│   │   └── shared/         # Shared components
│   │       ├── tabel-data.tsx
│   │       ├── modal-konfirmasi.tsx
│   │       └── kartu-statistik.tsx
│   ├── hooks/              # Custom React hooks
│   │   ├── use-pengguna.ts
│   │   ├── use-naskah.ts
│   │   ├── use-notifikasi.ts
│   │   └── use-upload-file.ts
│   ├── lib/                # Utility libraries
│   │   ├── api/           # API clients
│   │   │   ├── client.ts
│   │   │   ├── naskah.ts
│   │   │   └── auth.ts
│   │   ├── utils/         # Utility functions
│   │   │   ├── format.ts
│   │   │   ├── validasi.ts
│   │   │   └── konversi.ts
│   │   └── constants/     # Constants
│   │       ├── status.ts
│   │       └── peran.ts
│   ├── stores/            # Zustand stores
│   │   ├── use-auth-store.ts
│   │   ├── use-naskah-store.ts
│   │   └── use-ui-store.ts
│   ├── types/             # TypeScript types
│   │   ├── pengguna.ts
│   │   ├── naskah.ts
│   │   ├── review.ts
│   │   └── api.ts
│   ├── styles/            # Global styles
│   │   └── globals.css
│   └── middleware.ts      # Next.js middleware
├── .env.local             # Environment variables
├── next.config.js         # Next.js config
├── tailwind.config.ts     # Tailwind config
├── tsconfig.json          # TypeScript config
├── components.json        # shadcn/ui config
└── package.json           # Dependencies
```

### Contoh Component Pattern (Bahasa Indonesia)

```typescript
// components/modules/naskah/kartu-naskah.tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Naskah } from "@/types/naskah";

interface KartuNaskahProps {
  naskah: Naskah;
  padaKlik?: (id: string) => void;
}

export function KartuNaskah({ naskah, padaKlik }: KartuNaskahProps) {
  const labelStatus = {
    draft: "Draft",
    diajukan: "Diajukan",
    dalam_review: "Dalam Review",
    disetujui: "Disetujui",
    diterbitkan: "Diterbitkan",
  };

  return (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex justify-between items-start">
          <span>{naskah.judul}</span>
          <Badge
            variant={naskah.status === "diterbitkan" ? "success" : "default"}
          >
            {labelStatus[naskah.status]}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {naskah.sinopsis}
        </p>
        <Button onClick={() => padaKlik?.(naskah.id)} className="mt-4 w-full">
          Lihat Detail
        </Button>
      </CardContent>
    </Card>
  );
}
```

### Frontend Dependencies (package.json)

```json
{
  "name": "@publishify/frontend",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "next": "^14.1.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@tanstack/react-query": "^5.17.19",
    "@tanstack/react-query-devtools": "^5.17.19",
    "zustand": "^4.5.0",
    "axios": "^1.6.5",
    "socket.io-client": "^4.6.1",
    "react-hook-form": "^7.49.3",
    "zod": "^3.22.4",
    "@hookform/resolvers": "^3.3.4",
    "date-fns": "^3.2.0",
    "react-dropzone": "^14.2.3",
    "@tiptap/react": "^2.1.16",
    "@tiptap/starter-kit": "^2.1.16",
    "recharts": "^2.10.4",
    "lucide-react": "^0.312.0",
    "sonner": "^1.3.1",
    "tailwindcss": "^3.4.1",
    "tailwind-merge": "^2.2.0",
    "clsx": "^2.1.0",
    "class-variance-authority": "^0.7.0",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-toast": "^1.1.5"
  },
  "devDependencies": {
    "@types/node": "^20.11.5",
    "@types/react": "^18.2.48",
    "@types/react-dom": "^18.2.18",
    "typescript": "^5.3.3",
    "eslint": "^8.56.0",
    "eslint-config-next": "^14.1.0",
    "prettier": "^3.2.4",
    "prettier-plugin-tailwindcss": "^0.5.11",
    "autoprefixer": "^10.4.17",
    "postcss": "^8.4.33"
  }
}
```

## 📁 Struktur Backend (NestJS 10+)

### Direktori `backend/`

```
backend/
├── src/
│   ├── main.ts                    # Entry point
│   ├── app.module.ts              # Root module
│   ├── modules/                   # Feature modules
│   │   ├── auth/                  # Authentication module
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── strategies/
│   │   │   │   ├── jwt.strategy.ts
│   │   │   │   └── local.strategy.ts
│   │   │   ├── guards/
│   │   │   │   ├── jwt-auth.guard.ts
│   │   │   │   └── roles.guard.ts
│   │   │   ├── decorators/
│   │   │   │   ├── pengguna-saat-ini.decorator.ts
│   │   │   │   └── peran.decorator.ts
│   │   │   └── dto/
│   │   │       ├── register.dto.ts
│   │   │       └── login.dto.ts
│   │   ├── pengguna/              # User management
│   │   │   ├── pengguna.module.ts
│   │   │   ├── pengguna.controller.ts
│   │   │   ├── pengguna.service.ts
│   │   │   └── dto/
│   │   │       ├── buat-pengguna.dto.ts
│   │   │       └── perbarui-pengguna.dto.ts
│   │   ├── naskah/                # Manuscript management
│   │   │   ├── naskah.module.ts
│   │   │   ├── naskah.controller.ts
│   │   │   ├── naskah.service.ts
│   │   │   └── dto/
│   │   │       ├── buat-naskah.dto.ts
│   │   │       └── perbarui-naskah.dto.ts
│   │   ├── review/                # Review system
│   │   │   ├── review.module.ts
│   │   │   ├── review.controller.ts
│   │   │   ├── review.service.ts
│   │   │   └── dto/
│   │   │       ├── buat-review.dto.ts
│   │   │       └── submit-review.dto.ts
│   │   ├── percetakan/            # Printing management
│   │   │   ├── percetakan.module.ts
│   │   │   ├── percetakan.controller.ts
│   │   │   ├── percetakan.service.ts
│   │   │   └── dto/
│   │   │       └── buat-pesanan.dto.ts
│   │   ├── pembayaran/            # Payment system
│   │   │   ├── pembayaran.module.ts
│   │   │   ├── pembayaran.controller.ts
│   │   │   ├── pembayaran.service.ts
│   │   │   └── dto/
│   │   │       └── proses-pembayaran.dto.ts
│   │   ├── notifikasi/            # Notification system
│   │   │   ├── notifikasi.module.ts
│   │   │   ├── notifikasi.gateway.ts
│   │   │   ├── notifikasi.service.ts
│   │   │   └── dto/
│   │   │       └── kirim-notifikasi.dto.ts
│   │   └── upload/                # File upload
│   │       ├── upload.module.ts
│   │       ├── upload.controller.ts
│   │       ├── upload.service.ts
│   │       └── dto/
│   │           └── upload-file.dto.ts
│   ├── common/                    # Shared resources
│   │   ├── decorators/           # Custom decorators
│   │   │   ├── api-paginated-response.decorator.ts
│   │   │   └── public.decorator.ts
│   │   ├── filters/              # Exception filters
│   │   │   ├── http-exception.filter.ts
│   │   │   └── prisma-exception.filter.ts
│   │   ├── guards/               # Global guards
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── throttler.guard.ts
│   │   ├── interceptors/         # Interceptors
│   │   │   ├── logging.interceptor.ts
│   │   │   ├── transform.interceptor.ts
│   │   │   └── timeout.interceptor.ts
│   │   ├── middlewares/          # Middlewares
│   │   │   ├── logger.middleware.ts
│   │   │   └── cors.middleware.ts
│   │   ├── pipes/                # Validation pipes
│   │   │   ├── validasi-zod.pipe.ts
│   │   │   └── parse-uuid.pipe.ts
│   │   └── interfaces/           # Shared interfaces
│   │       ├── response.interface.ts
│   │       └── paginated.interface.ts
│   ├── config/                    # Configuration
│   │   ├── database.config.ts
│   │   ├── jwt.config.ts
│   │   ├── redis.config.ts
│   │   └── email.config.ts
│   ├── prisma/                    # Prisma service
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   └── utils/                     # Utility functions
│       ├── hash.util.ts
│       ├── format.util.ts
│       └── validation.util.ts
├── test/                          # Test files
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── prisma/                        # Prisma files
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── .env                           # Environment variables
├── .env.example                   # Env template
├── nest-cli.json                  # Nest CLI config
├── tsconfig.json                  # TypeScript config
└── package.json                   # Dependencies
```

### Contoh Service Pattern (Bahasa Indonesia)

```typescript
// modules/naskah/naskah.service.ts
import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { BuatNaskahDto } from "./dto/buat-naskah.dto";
import { PerbaruiNaskahDto } from "./dto/perbarui-naskah.dto";

@Injectable()
export class NaskahService {
  constructor(private readonly prisma: PrismaService) {}

  async buatNaskah(idPenulis: string, dto: BuatNaskahDto) {
    const naskah = await this.prisma.naskah.create({
      data: {
        ...dto,
        idPenulis,
        status: "draft",
      },
      include: {
        penulis: {
          select: {
            id: true,
            email: true,
            profilPengguna: true,
          },
        },
        kategori: true,
        genre: true,
      },
    });

    return {
      sukses: true,
      pesan: "Naskah berhasil dibuat",
      data: naskah,
    };
  }

  async ambilSemuaNaskah(idPenulis?: string) {
    const where = idPenulis ? { idPenulis } : {};

    const naskah = await this.prisma.naskah.findMany({
      where,
      include: {
        penulis: true,
        kategori: true,
        genre: true,
      },
      orderBy: {
        dibuatPada: "desc",
      },
    });

    return {
      sukses: true,
      data: naskah,
      total: naskah.length,
    };
  }

  async ambilNaskahById(id: string) {
    const naskah = await this.prisma.naskah.findUnique({
      where: { id },
      include: {
        penulis: true,
        kategori: true,
        genre: true,
        revisi: {
          orderBy: { versi: "desc" },
        },
      },
    });

    if (!naskah) {
      throw new NotFoundException("Naskah tidak ditemukan");
    }

    return {
      sukses: true,
      data: naskah,
    };
  }

  async perbaruiNaskah(id: string, dto: PerbaruiNaskahDto) {
    await this.ambilNaskahById(id); // Validasi exists

    const naskah = await this.prisma.naskah.update({
      where: { id },
      data: dto,
      include: {
        penulis: true,
        kategori: true,
        genre: true,
      },
    });

    return {
      sukses: true,
      pesan: "Naskah berhasil diperbarui",
      data: naskah,
    };
  }

  async hapusNaskah(id: string) {
    await this.ambilNaskahById(id); // Validasi exists

    await this.prisma.naskah.delete({
      where: { id },
    });

    return {
      sukses: true,
      pesan: "Naskah berhasil dihapus",
    };
  }
}
```

### Contoh Controller Pattern (Bahasa Indonesia)

```typescript
// modules/naskah/naskah.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags, ApiOperation } from "@nestjs/swagger";
import { NaskahService } from "./naskah.service";
import { BuatNaskahDto } from "./dto/buat-naskah.dto";
import { PerbaruiNaskahDto } from "./dto/perbarui-naskah.dto";
import { JwtAuthGuard } from "@/modules/auth/guards/jwt-auth.guard";
import { PeranGuard } from "@/modules/auth/guards/roles.guard";
import { Peran } from "@/modules/auth/decorators/peran.decorator";
import { PenggunaSaatIni } from "@/modules/auth/decorators/pengguna-saat-ini.decorator";

@ApiTags("naskah")
@ApiBearerAuth()
@Controller("naskah")
@UseGuards(JwtAuthGuard, PeranGuard)
export class NaskahController {
  constructor(private readonly naskahService: NaskahService) {}

  @Post()
  @Peran("penulis")
  @ApiOperation({ summary: "Buat naskah baru" })
  async buatNaskah(
    @PenggunaSaatIni("id") idPenulis: string,
    @Body() dto: BuatNaskahDto
  ) {
    return this.naskahService.buatNaskah(idPenulis, dto);
  }

  @Get()
  @ApiOperation({ summary: "Ambil semua naskah" })
  async ambilSemuaNaskah(@Query("idPenulis") idPenulis?: string) {
    return this.naskahService.ambilSemuaNaskah(idPenulis);
  }

  @Get(":id")
  @ApiOperation({ summary: "Ambil detail naskah" })
  async ambilNaskahById(@Param("id") id: string) {
    return this.naskahService.ambilNaskahById(id);
  }

  @Put(":id")
  @Peran("penulis")
  @ApiOperation({ summary: "Perbarui naskah" })
  async perbaruiNaskah(
    @Param("id") id: string,
    @Body() dto: PerbaruiNaskahDto
  ) {
    return this.naskahService.perbaruiNaskah(id, dto);
  }

  @Delete(":id")
  @Peran("penulis", "admin")
  @ApiOperation({ summary: "Hapus naskah" })
  async hapusNaskah(@Param("id") id: string) {
    return this.naskahService.hapusNaskah(id);
  }
}
```

### Backend Dependencies (package.json)

```json
{
  "name": "@publishify/backend",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "build": "nest build",
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:prod": "node dist/main",
    "lint": "eslint \"{src,test}/**/*.ts\" --fix",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:e2e": "jest --config ./test/jest-e2e.json"
  },
  "dependencies": {
    "@nestjs/common": "^10.3.0",
    "@nestjs/core": "^10.3.0",
    "@nestjs/platform-express": "^10.3.0",
    "@nestjs/swagger": "^7.2.0",
    "@nestjs/jwt": "^10.2.0",
    "@nestjs/passport": "^10.0.3",
    "@nestjs/schedule": "^4.0.0",
    "@nestjs/event-emitter": "^2.0.4",
    "@nestjs/throttler": "^5.1.1",
    "@nestjs/websockets": "^10.3.0",
    "@nestjs/platform-socket.io": "^10.3.0",
    "@nestjs/config": "^3.1.1",
    "@nestjs/mapped-types": "^2.0.4",
    "@prisma/client": "^5.8.0",
    "prisma": "^5.8.0",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.1",
    "passport-local": "^1.0.0",
    "zod": "^3.22.4",
    "axios": "^1.6.5",
    "nodemailer": "^6.9.8",
    "bcrypt": "^5.1.1",
    "socket.io": "^4.6.1",
    "bull": "^4.12.0",
    "ioredis": "^5.3.2",
    "class-validator": "^0.14.1",
    "class-transformer": "^0.5.1",
    "uuid": "^9.0.1",
    "date-fns": "^3.2.0",
    "multer": "^1.4.5-lts.1",
    "sharp": "^0.33.2",
    "winston": "^3.11.0",
    "helmet": "^7.1.0",
    "cors": "^2.8.5",
    "dotenv": "^16.4.0"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.3.0",
    "@nestjs/schematics": "^10.1.0",
    "@nestjs/testing": "^10.3.0",
    "@types/node": "^20.11.5",
    "@types/express": "^4.17.21",
    "@types/bcrypt": "^5.0.2",
    "@types/multer": "^1.4.11",
    "@types/uuid": "^9.0.7",
    "@types/nodemailer": "^6.4.14",
    "typescript": "^5.3.3",
    "eslint": "^8.56.0",
    "@typescript-eslint/eslint-plugin": "^6.19.0",
    "@typescript-eslint/parser": "^6.19.0",
    "prettier": "^3.2.4",
    "jest": "^29.7.0",
    "@types/jest": "^29.5.11",
    "ts-jest": "^29.1.1",
    "ts-node": "^10.9.2",
    "supertest": "^6.3.4"
  }
}
```

## 🗄️ Database Schema & Prisma Conventions

### Overview Database (38 Tabel Utama)

#### 1. Core User Management (4 tabel)

```prisma
model Pengguna {
  id                    String   @id @default(uuid())
  email                 String   @unique
  kataSandi             String
  telepon               String?
  aktif                 Boolean  @default(true)
  terverifikasi         Boolean  @default(false)
  emailDiverifikasiPada DateTime?
  loginTerakhir         DateTime?
  dibuatPada            DateTime @default(now())
  diperbaruiPada        DateTime @updatedAt

  // Relations
  profilPengguna        ProfilPengguna?
  peranPengguna         PeranPengguna[]
  profilPenulis         ProfilPenulis?
  naskah                Naskah[]

  @@map("pengguna")
}

model ProfilPengguna {
  id             String    @id @default(uuid())
  idPengguna     String    @unique
  namaDepan      String?
  namaBelakang   String?
  namaTampilan   String?
  bio            String?
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

  @@map("peran_pengguna")
}

model ProfilPenulis {
  id                  String   @id @default(uuid())
  idPengguna          String   @unique
  namaPena            String?
  biografi            String?
  spesialisasi        String[]
  totalBuku           Int      @default(0)
  totalDibaca         Int      @default(0)
  ratingRataRata      Decimal  @default(0) @db.Decimal(3,2)
  namaRekeningBank    String?
  namaBank            String?
  nomorRekeningBank   String?
  npwp                String?
  dibuatPada          DateTime @default(now())
  diperbaruiPada      DateTime @updatedAt

  pengguna            Pengguna @relation(fields: [idPengguna], references: [id], onDelete: Cascade)

  @@map("profil_penulis")
}
```

#### 2. Content Management (5 tabel)

```prisma
model Naskah {
  id                String        @id @default(uuid())
  idPenulis         String
  judul             String
  subJudul          String?
  sinopsis          String
  isbn              String?       @unique
  idKategori        String
  idGenre           String
  bahasaTulis       String        @default("id")
  jumlahHalaman     Int?
  jumlahKata        Int?
  status            StatusNaskah  @default(draft)
  urlSampul         String?
  urlFile           String?
  publik            Boolean       @default(false)
  dibuatPada        DateTime      @default(now())
  diperbaruiPada    DateTime      @updatedAt

  // Relations
  penulis           Pengguna      @relation(fields: [idPenulis], references: [id])
  kategori          Kategori      @relation(fields: [idKategori], references: [id])
  genre             Genre         @relation(fields: [idGenre], references: [id])
  revisi            RevisiNaskah[]
  review            ReviewNaskah[]

  @@map("naskah")
}

model Kategori {
  id              String     @id @default(uuid())
  nama            String
  slug            String     @unique
  deskripsi       String?
  idInduk         String?
  aktif           Boolean    @default(true)
  dibuatPada      DateTime   @default(now())
  diperbaruiPada  DateTime   @updatedAt

  // Self-relation
  induk           Kategori?  @relation("SubKategori", fields: [idInduk], references: [id])
  subKategori     Kategori[] @relation("SubKategori")
  naskah          Naskah[]

  @@map("kategori")
}

model Genre {
  id              String    @id @default(uuid())
  nama            String    @unique
  slug            String    @unique
  deskripsi       String?
  aktif           Boolean   @default(true)
  dibuatPada      DateTime  @default(now())
  diperbaruiPada  DateTime  @updatedAt

  naskah          Naskah[]

  @@map("genre")
}
```

### Enum Types (Bahasa Indonesia)

```prisma
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

enum StatusReview {
  ditugaskan
  dalam_proses
  selesai
  dibatalkan

  @@map("status_review")
}

enum Rekomendasi {
  setujui
  revisi
  tolak

  @@map("rekomendasi")
}

enum StatusPesanan {
  tertunda
  diterima
  dalam_produksi
  kontrol_kualitas
  siap
  dikirim
  terkirim
  dibatalkan

  @@map("status_pesanan")
}

enum StatusPengiriman {
  diproses
  dalam_perjalanan
  terkirim
  gagal

  @@map("status_pengiriman")
}
```

### Prisma Best Practices dengan Bun

#### 1. Generate Prisma Client

```bash
# Gunakan Bun, bukan npm/npx
bun prisma generate
bun prisma db push
bun prisma migrate dev
bun prisma studio
```

#### 2. Query Optimization Patterns

```typescript
// ✅ BENAR: Include dengan select spesifik
const naskah = await prisma.naskah.findMany({
  include: {
    penulis: {
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
    kategori: true,
    genre: true,
  },
  take: 20,
  skip: 0,
});

// ❌ SALAH: Include semua relasi tanpa limit
const naskah = await prisma.naskah.findMany({
  include: {
    penulis: true,
    revisi: true,
    review: true,
  },
});
```

#### 3. Transaction Patterns

```typescript
// ✅ BENAR: Gunakan transaction untuk operasi multiple
async buatNaskahDenganRevisi(data: BuatNaskahDto) {
  return await this.prisma.$transaction(async (prisma) => {
    const naskah = await prisma.naskah.create({
      data: {
        ...data,
        status: 'draft',
      },
    });

    const revisi = await prisma.revisiNaskah.create({
      data: {
        idNaskah: naskah.id,
        versi: 1,
        catatan: 'Versi awal',
        urlFile: data.urlFile,
      },
    });

    return { naskah, revisi };
  });
}
```

#### 4. Pagination Helper

```typescript
// Reusable pagination interface
interface OpsiPaginasi {
  halaman: number;
  limit: number;
  urutkan?: string;
  arah?: 'asc' | 'desc';
}

async ambilNaskahDenganPaginasi(opsi: OpsiPaginasi) {
  const { halaman, limit, urutkan = 'dibuatPada', arah = 'desc' } = opsi;
  const skip = (halaman - 1) * limit;

  const [data, total] = await Promise.all([
    this.prisma.naskah.findMany({
      skip,
      take: limit,
      orderBy: { [urutkan]: arah },
      include: {
        penulis: {
          select: {
            id: true,
            profilPengguna: {
              select: {
                namaDepan: true,
                namaBelakang: true,
              },
            },
          },
        },
      },
    }),
    this.prisma.naskah.count(),
  ]);

  return {
    data,
    metadata: {
      total,
      halaman,
      limit,
      totalHalaman: Math.ceil(total / limit),
    },
  };
}
```

### Row Level Security (RLS) Implementation

#### Policy Examples

```sql
-- Policy untuk naskah - penulis hanya bisa akses naskah sendiri
CREATE POLICY "policy_naskah_penulis" ON naskah
FOR ALL
USING (
  id_penulis = auth.uid() OR
  (status = 'diterbitkan' AND publik = true)
);

-- Policy untuk review - editor hanya bisa akses review yang ditugaskan
CREATE POLICY "policy_review_editor" ON review_naskah
FOR ALL
USING (
  id_editor = auth.uid() OR
  EXISTS (
    SELECT 1 FROM peran_pengguna
    WHERE id_pengguna = auth.uid()
    AND jenis_peran = 'admin'
  )
);
```

#### Prisma dengan RLS

```typescript
// Middleware untuk RLS di Prisma
prisma.$use(async (params, next) => {
  // Inject user context untuk RLS
  if (params.model && params.action === "findMany") {
    params.args.where = {
      ...params.args.where,
      // Add RLS conditions based on user context
    };
  }
  return next(params);
});
```

## 🌐 REST API Patterns & Endpoints

### API Response Format (Standar)

#### Success Response

```typescript
interface ResponseSukses<T> {
  sukses: true;
  pesan: string;
  data: T;
  metadata?: {
    total?: number;
    halaman?: number;
    limit?: number;
    totalHalaman?: number;
  };
}

// Contoh implementasi
return {
  sukses: true,
  pesan: "Data berhasil diambil",
  data: naskah,
  metadata: {
    total: 100,
    halaman: 1,
    limit: 20,
    totalHalaman: 5,
  },
};
```

#### Error Response

```typescript
interface ResponseError {
  sukses: false;
  pesan: string;
  error: {
    kode: string;
    detail?: string;
    field?: string;
    timestamp: string;
  };
}

// Contoh implementasi
throw new HttpException(
  {
    sukses: false,
    pesan: "Naskah tidak ditemukan",
    error: {
      kode: "NASKAH_TIDAK_DITEMUKAN",
      detail: "Naskah dengan ID tersebut tidak ada dalam sistem",
      timestamp: new Date().toISOString(),
    },
  },
  HttpStatus.NOT_FOUND
);
```

### REST API Endpoint Structure

#### 1. Authentication Endpoints

```typescript
// POST /api/auth/register
@Post('register')
@ApiOperation({ summary: 'Registrasi pengguna baru' })
@ApiResponse({ status: 201, description: 'Registrasi berhasil' })
async register(@Body() dto: RegisterDto) {
  return {
    sukses: true,
    pesan: 'Registrasi berhasil. Silakan cek email untuk verifikasi.',
    data: await this.authService.register(dto),
  };
}

// POST /api/auth/login
@Post('login')
@ApiOperation({ summary: 'Login pengguna' })
async login(@Body() dto: LoginDto) {
  const result = await this.authService.login(dto);
  return {
    sukses: true,
    pesan: 'Login berhasil',
    data: {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      pengguna: result.pengguna,
    },
  };
}

// POST /api/auth/refresh
@Post('refresh')
@ApiOperation({ summary: 'Refresh access token' })
async refresh(@Body('refreshToken') refreshToken: string) {
  return {
    sukses: true,
    pesan: 'Token berhasil diperbarui',
    data: await this.authService.refreshToken(refreshToken),
  };
}
```

#### 2. Naskah (Manuscript) Endpoints

```typescript
// GET /api/naskah
@Get()
@ApiOperation({ summary: 'Ambil daftar naskah dengan filter' })
@ApiQuery({ name: 'halaman', required: false, type: Number })
@ApiQuery({ name: 'limit', required: false, type: Number })
@ApiQuery({ name: 'status', required: false, enum: StatusNaskah })
async ambilSemuaNaskah(
  @Query('halaman') halaman: number = 1,
  @Query('limit') limit: number = 20,
  @Query('status') status?: StatusNaskah,
  @Query('cari') cari?: string,
) {
  const filter = { status, cari };
  return await this.naskahService.ambilSemuaNaskah({ halaman, limit, filter });
}

// POST /api/naskah
@Post()
@UseGuards(JwtAuthGuard, PeranGuard)
@Peran('penulis')
@ApiBearerAuth()
@ApiOperation({ summary: 'Buat naskah baru' })
async buatNaskah(
  @PenggunaSaatIni('id') idPenulis: string,
  @Body() dto: BuatNaskahDto,
) {
  return await this.naskahService.buatNaskah(idPenulis, dto);
}

// PUT /api/naskah/:id
@Put(':id')
@UseGuards(JwtAuthGuard, PeranGuard)
@Peran('penulis')
@ApiBearerAuth()
@ApiOperation({ summary: 'Perbarui naskah' })
async perbaruiNaskah(
  @Param('id') id: string,
  @Body() dto: PerbaruiNaskahDto,
) {
  return await this.naskahService.perbaruiNaskah(id, dto);
}

// DELETE /api/naskah/:id
@Delete(':id')
@UseGuards(JwtAuthGuard, PeranGuard)
@Peran('penulis', 'admin')
@ApiBearerAuth()
@ApiOperation({ summary: 'Hapus naskah' })
async hapusNaskah(@Param('id') id: string) {
  return await this.naskahService.hapusNaskah(id);
}
```

#### 3. Review Endpoints

```typescript
// GET /api/review
@Get()
@UseGuards(JwtAuthGuard, PeranGuard)
@Peran('editor', 'admin')
@ApiBearerAuth()
@ApiOperation({ summary: 'Ambil daftar review' })
async ambilDaftarReview(
  @PenggunaSaatIni('id') idEditor: string,
  @Query('status') status?: StatusReview,
) {
  return await this.reviewService.ambilDaftarReview(idEditor, status);
}

// POST /api/review/:id/feedback
@Post(':id/feedback')
@UseGuards(JwtAuthGuard, PeranGuard)
@Peran('editor')
@ApiBearerAuth()
@ApiOperation({ summary: 'Tambah feedback review' })
async tambahFeedback(
  @Param('id') idReview: string,
  @Body() dto: TambahFeedbackDto,
) {
  return await this.reviewService.tambahFeedback(idReview, dto);
}
```

### Error Handling Pattern

```typescript
// common/filters/http-exception.filter.ts
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let pesan = "Terjadi kesalahan pada server";

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      pesan = exception.message;
    }

    response.status(status).json({
      sukses: false,
      pesan,
      error: {
        timestamp: new Date().toISOString(),
      },
    });
  }
}
```

### Validation with Zod

```typescript
// dto/buat-naskah.dto.ts
import { z } from "zod";

export const BuatNaskahSchema = z.object({
  judul: z.string().min(3, "Judul minimal 3 karakter"),
  sinopsis: z.string().min(50, "Sinopsis minimal 50 karakter"),
  idKategori: z.string().uuid("ID kategori harus berupa UUID"),
  idGenre: z.string().uuid("ID genre harus berupa UUID"),
});

export type BuatNaskahDto = z.infer<typeof BuatNaskahSchema>;
```
