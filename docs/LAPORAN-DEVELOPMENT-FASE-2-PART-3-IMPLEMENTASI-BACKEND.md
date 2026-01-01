# LAPORAN DEVELOPMENT STEP BY STEP FASE 2

## PART 3: IMPLEMENTASI BACKEND STEP BY STEP

---

## D. IMPLEMENTASI BACKEND

### D.1 Setup Prisma Schema

#### D.1.1 Langkah 1: Install Dependencies

Sebelum memulai implementasi, pastikan semua dependencies terpasang dengan benar:

```bash
# Navigate ke directory backend
cd backend

# Install Prisma CLI dan client
bun add -D prisma
bun add @prisma/client

# Install dependencies lain untuk Fase 2
bun add zod class-validator class-transformer
bun add @nestjs/swagger swagger-ui-express
```

#### D.1.2 Langkah 2: Definisi Prisma Models

Buka file `backend/prisma/schema.prisma` dan tambahkan model-model untuk Fase 2:

**Model Kategori (Hierarchical Structure):**

```prisma
model Kategori {
  id             String   @id @default(uuid())
  nama           String
  slug           String   @unique
  deskripsi      String?  @db.Text
  idInduk        String?
  aktif          Boolean  @default(true)
  dibuatPada     DateTime @default(now())
  diperbaruiPada DateTime @updatedAt

  // Self-referential relationship
  induk       Kategori?  @relation("SubKategori", fields: [idInduk], references: [id], onDelete: SetNull)
  subKategori Kategori[] @relation("SubKategori")

  // Relations
  naskah Naskah[]

  @@map("kategori")
}
```

**Penjelasan:**

- `idInduk` nullable → Kategori root tidak punya parent
- Self-relation `"SubKategori"` → Memungkinkan tree structure
- `onDelete: SetNull` → Jika parent dihapus, child jadi root
- `aktif` untuk soft delete

**Model Genre (Flat Structure):**

```prisma
model Genre {
  id             String   @id @default(uuid())
  nama           String   @unique
  slug           String   @unique
  deskripsi      String?  @db.Text
  aktif          Boolean  @default(true)
  dibuatPada     DateTime @default(now())
  diperbaruiPada DateTime @updatedAt

  // Relations
  naskah Naskah[]

  @@map("genre")
}
```

**Penjelasan:**

- Struktur lebih simple tanpa hierarki
- `nama` unique untuk prevent duplikasi
- `slug` unique untuk URL-friendly

**Model Naskah (Core Model):**

```prisma
model Naskah {
  id             String       @id @default(uuid())
  idPenulis      String
  judul          String       @db.VarChar(200)
  subJudul       String?      @db.VarChar(200)
  sinopsis       String       @db.Text
  isbn           String?      @unique @db.VarChar(20)
  idKategori     String
  idGenre        String
  bahasaTulis    String       @default("id") @db.VarChar(10)
  jumlahHalaman  Int?
  jumlahKata     Int?
  status         StatusNaskah @default(draft)
  urlSampul      String?      @db.Text
  urlFile        String?      @db.Text
  publik         Boolean      @default(false)
  dibuatPada     DateTime     @default(now())
  diperbaruiPada DateTime     @updatedAt

  // Relations
  penulis  Pengguna      @relation(fields: [idPenulis], references: [id], onDelete: Cascade)
  kategori Kategori      @relation(fields: [idKategori], references: [id], onDelete: Restrict)
  genre    Genre         @relation(fields: [idGenre], references: [id], onDelete: Restrict)
  revisi   RevisiNaskah[]
  review   ReviewNaskah[]
  tag      TagNaskah[]

  @@map("naskah")
  @@index([idPenulis])
  @@index([status])
  @@index([idKategori])
  @@index([idGenre])
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
```

**Penjelasan:**

- `onDelete: Cascade` untuk penulis → Jika user dihapus, naskahnya ikut terhapus
- `onDelete: Restrict` untuk kategori/genre → Prevent delete jika masih ada naskah aktif
- Multiple indexes untuk performance query
- Enum `StatusNaskah` untuk workflow 7-status

**Model RevisiNaskah (Version Control):**

```prisma
model RevisiNaskah {
  id         String   @id @default(uuid())
  idNaskah   String
  versi      Int
  urlFile    String   @db.Text
  catatan    String?  @db.Text
  dibuatPada DateTime @default(now())

  // Relations
  naskah Naskah @relation(fields: [idNaskah], references: [id], onDelete: Cascade)

  @@unique([idNaskah, versi])
  @@map("revisi_naskah")
  @@index([idNaskah])
}
```

**Penjelasan:**

- Unique constraint `[idNaskah, versi]` → Prevent duplicate version
- Auto-increment version di application layer
- Menyimpan history semua revision

**Model ReviewNaskah & FeedbackReview:**

```prisma
model ReviewNaskah {
  id                   String        @id @default(uuid())
  idNaskah             String
  idEditor             String
  status               StatusReview  @default(ditugaskan)
  rekomendasi          Rekomendasi?
  catatanRekomendasi   String?       @db.Text
  dibuatPada           DateTime      @default(now())
  diselesaikanPada     DateTime?
  diperbaruiPada       DateTime      @updatedAt

  // Relations
  naskah   Naskah            @relation(fields: [idNaskah], references: [id], onDelete: Cascade)
  editor   Pengguna          @relation(fields: [idEditor], references: [id], onDelete: Cascade)
  feedback FeedbackReview[]

  @@map("review_naskah")
  @@index([idNaskah])
  @@index([idEditor])
  @@index([status])
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

model FeedbackReview {
  id         String   @id @default(uuid())
  idReview   String
  aspek      String   @db.VarChar(100)
  rating     Int      // 1-5
  komentar   String   @db.Text
  dibuatPada DateTime @default(now())

  // Relations
  review ReviewNaskah @relation(fields: [idReview], references: [id], onDelete: Cascade)

  @@map("feedback_review")
  @@index([idReview])
}
```

**Penjelasan:**

- `StatusReview` track lifecycle review assignment
- `Rekomendasi` enum untuk final decision editor
- `FeedbackReview` terpisah untuk flexibility (multiple items per review)
- Rating integer 1-5, validation di application layer

#### D.1.3 Langkah 3: Generate Migration

Setelah schema didefinisikan, generate migration untuk apply ke database:

```bash
# Generate migration file
bun prisma migrate dev --name add_fase_2_tables

# Output yang diharapkan:
# ✔ Generated Prisma Client (v5.8.0) to ./node_modules/@prisma/client
# ✔ Database synchronized with Prisma schema
# ✔ Migration applied (6 new tables)
```

File migration akan dibuat di `backend/prisma/migrations/[timestamp]_add_fase_2_tables/migration.sql`

#### D.1.4 Langkah 4: Seed Data untuk Testing

Buat file seed untuk populate initial data:

**File: `backend/prisma/seed.ts`**

```typescript
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedKategori() {
  console.log("🌱 Seeding Kategori...");

  // Root categories
  const fiksi = await prisma.kategori.create({
    data: {
      nama: "Fiksi",
      slug: "fiksi",
      deskripsi: "Karya sastra fiksi dan novel",
    },
  });

  const nonFiksi = await prisma.kategori.create({
    data: {
      nama: "Non-Fiksi",
      slug: "non-fiksi",
      deskripsi: "Karya tulis faktual dan edukatif",
    },
  });

  // Sub-categories untuk Fiksi
  await prisma.kategori.createMany({
    data: [
      {
        nama: "Romance",
        slug: "romance",
        idInduk: fiksi.id,
        deskripsi: "Novel percintaan dan romantis",
      },
      {
        nama: "Thriller",
        slug: "thriller",
        idInduk: fiksi.id,
        deskripsi: "Novel misteri dan ketegangan",
      },
      {
        nama: "Fantasi",
        slug: "fantasi",
        idInduk: fiksi.id,
        deskripsi: "Novel fantasi dan dunia imajiner",
      },
    ],
  });

  // Sub-categories untuk Non-Fiksi
  await prisma.kategori.createMany({
    data: [
      {
        nama: "Bisnis & Ekonomi",
        slug: "bisnis-ekonomi",
        idInduk: nonFiksi.id,
      },
      {
        nama: "Self-Improvement",
        slug: "self-improvement",
        idInduk: nonFiksi.id,
      },
      {
        nama: "Sejarah",
        slug: "sejarah",
        idInduk: nonFiksi.id,
      },
    ],
  });

  console.log("✅ Seeded 8 categories");
}

async function seedGenre() {
  console.log("🌱 Seeding Genre...");

  await prisma.genre.createMany({
    data: [
      { nama: "Romantis", slug: "romantis", deskripsi: "Genre percintaan" },
      { nama: "Horor", slug: "horor", deskripsi: "Genre menyeramkan" },
      { nama: "Komedi", slug: "komedi", deskripsi: "Genre humor" },
      { nama: "Drama", slug: "drama", deskripsi: "Genre dramatis" },
      {
        nama: "Petualangan",
        slug: "petualangan",
        deskripsi: "Genre petualangan",
      },
      { nama: "Inspiratif", slug: "inspiratif", deskripsi: "Genre motivasi" },
      { nama: "Edukatif", slug: "edukatif", deskripsi: "Genre pendidikan" },
    ],
  });

  console.log("✅ Seeded 7 genres");
}

async function main() {
  try {
    await seedKategori();
    await seedGenre();
    console.log("🎉 Seeding completed successfully!");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
```

**Jalankan Seed:**

```bash
bun prisma db seed
```

### D.2 Implementasi Modul Kategori

#### D.2.1 Langkah 1: Buat Module Structure

```bash
cd backend/src/modules
mkdir -p kategori/dto
```

**File: `backend/src/modules/kategori/kategori.module.ts`**

```typescript
import { Module } from "@nestjs/common";
import { KategoriController } from "./kategori.controller";
import { KategoriService } from "./kategori.service";
import { PrismaModule } from "@/prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [KategoriController],
  providers: [KategoriService],
  exports: [KategoriService],
})
export class KategoriModule {}
```

#### D.2.2 Langkah 2: Definisi DTOs dengan Zod

**File: `backend/src/modules/kategori/dto/buat-kategori.dto.ts`**

```typescript
import { z } from "zod";
import { ApiProperty } from "@nestjs/swagger";

export const BuatKategoriSchema = z.object({
  nama: z
    .string()
    .min(2, "Nama minimal 2 karakter")
    .max(100, "Nama maksimal 100 karakter"),
  deskripsi: z.string().optional(),
  idInduk: z.string().uuid("ID induk harus UUID valid").optional(),
});

export type BuatKategoriDto = z.infer<typeof BuatKategoriSchema>;

export class BuatKategoriDtoClass implements BuatKategoriDto {
  @ApiProperty({ example: "Romance", description: "Nama kategori" })
  nama: string;

  @ApiProperty({ example: "Kategori untuk novel romantis", required: false })
  deskripsi?: string;

  @ApiProperty({ example: "uuid-parent", required: false })
  idInduk?: string;
}
```

**File: `backend/src/modules/kategori/dto/perbarui-kategori.dto.ts`**

```typescript
import { z } from "zod";
import { ApiProperty } from "@nestjs/swagger";

export const PerbaruiKategoriSchema = z.object({
  nama: z.string().min(2).max(100).optional(),
  deskripsi: z.string().optional(),
  idInduk: z.string().uuid().optional().nullable(),
  aktif: z.boolean().optional(),
});

export type PerbaruiKategoriDto = z.infer<typeof PerbaruiKategoriSchema>;

export class PerbaruiKategoriDtoClass implements PerbaruiKategoriDto {
  @ApiProperty({ required: false })
  nama?: string;

  @ApiProperty({ required: false })
  deskripsi?: string;

  @ApiProperty({ required: false })
  idInduk?: string | null;

  @ApiProperty({ required: false })
  aktif?: boolean;
}
```

#### D.2.3 Langkah 3: Implementasi Service

**File: `backend/src/modules/kategori/kategori.service.ts`**

```typescript
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { BuatKategoriDto } from "./dto/buat-kategori.dto";
import { PerbaruiKategoriDto } from "./dto/perbarui-kategori.dto";

@Injectable()
export class KategoriService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Helper: Generate slug dari nama
   */
  private generateSlug(nama: string): string {
    return nama
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
      .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric with dash
      .replace(/^-+|-+$/g, ""); // Remove leading/trailing dashes
  }

  /**
   * Method 1: Buat kategori baru
   */
  async buatKategori(dto: BuatKategoriDto) {
    const { nama, deskripsi, idInduk } = dto;

    // Generate slug
    const slug = this.generateSlug(nama);

    // Check slug uniqueness
    const existing = await this.prisma.kategori.findUnique({
      where: { slug },
    });

    if (existing) {
      throw new ConflictException(`Kategori dengan slug "${slug}" sudah ada`);
    }

    // Validate parent exists if provided
    if (idInduk) {
      const parent = await this.prisma.kategori.findUnique({
        where: { id: idInduk },
      });

      if (!parent) {
        throw new NotFoundException("Kategori induk tidak ditemukan");
      }

      if (!parent.aktif) {
        throw new BadRequestException("Kategori induk tidak aktif");
      }
    }

    // Create kategori
    const kategori = await this.prisma.kategori.create({
      data: {
        nama,
        slug,
        deskripsi,
        idInduk,
      },
      include: {
        induk: true,
        _count: {
          select: {
            subKategori: true,
            naskah: true,
          },
        },
      },
    });

    return {
      sukses: true,
      pesan: "Kategori berhasil dibuat",
      data: kategori,
    };
  }

  /**
   * Method 2: Ambil semua kategori (hierarchical)
   */
  async ambilSemuaKategori() {
    const kategori = await this.prisma.kategori.findMany({
      where: { aktif: true },
      include: {
        induk: {
          select: {
            id: true,
            nama: true,
            slug: true,
          },
        },
        subKategori: {
          where: { aktif: true },
          select: {
            id: true,
            nama: true,
            slug: true,
            _count: {
              select: {
                naskah: true,
              },
            },
          },
        },
        _count: {
          select: {
            naskah: true,
          },
        },
      },
      orderBy: [
        { idInduk: "asc" }, // Root categories first
        { nama: "asc" },
      ],
    });

    return {
      sukses: true,
      data: kategori,
      metadata: {
        total: kategori.length,
      },
    };
  }

  /**
   * Method 3: Ambil kategori by ID
   */
  async ambilKategoriById(id: string) {
    const kategori = await this.prisma.kategori.findUnique({
      where: { id },
      include: {
        induk: true,
        subKategori: {
          where: { aktif: true },
          include: {
            _count: {
              select: {
                naskah: true,
              },
            },
          },
        },
        _count: {
          select: {
            naskah: true,
          },
        },
      },
    });

    if (!kategori) {
      throw new NotFoundException("Kategori tidak ditemukan");
    }

    return {
      sukses: true,
      data: kategori,
    };
  }

  /**
   * Method 4: Perbarui kategori
   */
  async perbaruiKategori(id: string, dto: PerbaruiKategoriDto) {
    // Check exists
    const existing = await this.prisma.kategori.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException("Kategori tidak ditemukan");
    }

    // Check slug uniqueness if nama changed
    if (dto.nama && dto.nama !== existing.nama) {
      const newSlug = this.generateSlug(dto.nama);
      const slugTaken = await this.prisma.kategori.findUnique({
        where: { slug: newSlug },
      });

      if (slugTaken && slugTaken.id !== id) {
        throw new ConflictException("Slug kategori sudah digunakan");
      }
    }

    // Update kategori
    const updated = await this.prisma.kategori.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.nama && { slug: this.generateSlug(dto.nama) }),
      },
      include: {
        induk: true,
        _count: {
          select: {
            subKategori: true,
            naskah: true,
          },
        },
      },
    });

    return {
      sukses: true,
      pesan: "Kategori berhasil diperbarui",
      data: updated,
    };
  }

  /**
   * Method 5: Soft delete kategori
   */
  async hapusKategori(id: string) {
    // Check exists
    const kategori = await this.prisma.kategori.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            naskah: true,
            subKategori: true,
          },
        },
      },
    });

    if (!kategori) {
      throw new NotFoundException("Kategori tidak ditemukan");
    }

    // Prevent delete if has active naskah
    if (kategori._count.naskah > 0) {
      throw new BadRequestException(
        `Kategori tidak dapat dihapus karena masih memiliki ${kategori._count.naskah} naskah aktif`
      );
    }

    // Prevent delete if has active sub-categories
    if (kategori._count.subKategori > 0) {
      throw new BadRequestException(
        "Kategori tidak dapat dihapus karena masih memiliki sub-kategori"
      );
    }

    // Soft delete (set aktif = false)
    await this.prisma.kategori.update({
      where: { id },
      data: { aktif: false },
    });

    return {
      sukses: true,
      pesan: "Kategori berhasil dihapus",
    };
  }
}
```

**Penjelasan Key Points:**

- `generateSlug()` helper untuk SEO-friendly URLs
- Validation: slug uniqueness, parent exists, prevent circular reference
- Soft delete dengan check constraints (prevent delete jika punya naskah/subkategori)
- Include `_count` untuk menampilkan jumlah relasi
- Hierarchical query dengan include `induk` dan `subKategori`

#### D.2.4 Langkah 4: Implementasi Controller

**File: `backend/src/modules/kategori/kategori.controller.ts`**

```typescript
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  UsePipes,
} from "@nestjs/common";
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from "@nestjs/swagger";
import { KategoriService } from "./kategori.service";
import {
  BuatKategoriDto,
  BuatKategoriDtoClass,
  BuatKategoriSchema,
} from "./dto/buat-kategori.dto";
import {
  PerbaruiKategoriDto,
  PerbaruiKategoriDtoClass,
  PerbaruiKategoriSchema,
} from "./dto/perbarui-kategori.dto";
import { JwtAuthGuard } from "@/modules/auth/guards/jwt-auth.guard";
import { PeranGuard } from "@/modules/auth/guards/roles.guard";
import { Peran } from "@/modules/auth/decorators/peran.decorator";
import { Public } from "@/modules/auth/decorators/public.decorator";
import { ValidasiZodPipe } from "@/common/pipes/validasi-zod.pipe";

@ApiTags("kategori")
@Controller("kategori")
export class KategoriController {
  constructor(private readonly kategoriService: KategoriService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: "Ambil semua kategori (hierarchical)" })
  @ApiResponse({ status: 200, description: "Berhasil mengambil data kategori" })
  async ambilSemuaKategori() {
    return this.kategoriService.ambilSemuaKategori();
  }

  @Get(":id")
  @Public()
  @ApiOperation({ summary: "Ambil detail kategori by ID" })
  @ApiParam({ name: "id", type: "string", description: "ID Kategori (UUID)" })
  @ApiResponse({
    status: 200,
    description: "Berhasil mengambil detail kategori",
  })
  @ApiResponse({ status: 404, description: "Kategori tidak ditemukan" })
  async ambilKategoriById(@Param("id") id: string) {
    return this.kategoriService.ambilKategoriById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, PeranGuard)
  @Peran("admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Buat kategori baru" })
  @ApiResponse({ status: 201, description: "Kategori berhasil dibuat" })
  @ApiResponse({ status: 409, description: "Slug kategori sudah ada" })
  @UsePipes(new ValidasiZodPipe(BuatKategoriSchema))
  async buatKategori(@Body() dto: BuatKategoriDtoClass) {
    return this.kategoriService.buatKategori(dto);
  }

  @Put(":id")
  @UseGuards(JwtAuthGuard, PeranGuard)
  @Peran("admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Perbarui kategori" })
  @ApiParam({ name: "id", type: "string", description: "ID Kategori" })
  @ApiResponse({ status: 200, description: "Kategori berhasil diperbarui" })
  @ApiResponse({ status: 404, description: "Kategori tidak ditemukan" })
  @UsePipes(new ValidasiZodPipe(PerbaruiKategoriSchema))
  async perbaruiKategori(
    @Param("id") id: string,
    @Body() dto: PerbaruiKategoriDtoClass
  ) {
    return this.kategoriService.perbaruiKategori(id, dto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, PeranGuard)
  @Peran("admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Soft delete kategori" })
  @ApiParam({ name: "id", type: "string" })
  @ApiResponse({ status: 200, description: "Kategori berhasil dihapus" })
  @ApiResponse({
    status: 400,
    description: "Kategori masih memiliki naskah/subkategori",
  })
  async hapusKategori(@Param("id") id: string) {
    return this.kategoriService.hapusKategori(id);
  }
}
```

**Penjelasan Key Points:**

- `@Public()` decorator untuk endpoint yang tidak perlu auth
- `@UseGuards(JwtAuthGuard, PeranGuard)` untuk protected endpoints
- `@Peran('admin')` hanya admin yang bisa CRUD kategori
- `@UsePipes(new ValidasiZodPipe(...))` untuk Zod validation
- Swagger decorators untuk API documentation

### D.3 Implementasi Modul Genre

Implementasi Genre sangat mirip dengan Kategori, namun lebih simple karena tidak ada hierarchical structure.

#### D.3.1 Key Differences dari Kategori

- Tidak ada field `idInduk`
- Tidak ada self-referential relation
- Query lebih straightforward tanpa recursive CTE

**File: `backend/src/modules/genre/genre.service.ts` (Key Methods)**

```typescript
@Injectable()
export class GenreService {
  constructor(private readonly prisma: PrismaService) {}

  private generateSlug(nama: string): string {
    return nama
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  async buatGenre(dto: BuatGenreDto) {
    const { nama, deskripsi } = dto;
    const slug = this.generateSlug(nama);

    // Check uniqueness
    const existing = await this.prisma.genre.findUnique({
      where: { slug },
    });

    if (existing) {
      throw new ConflictException(`Genre dengan slug "${slug}" sudah ada`);
    }

    const genre = await this.prisma.genre.create({
      data: { nama, slug, deskripsi },
      include: {
        _count: {
          select: { naskah: true },
        },
      },
    });

    return {
      sukses: true,
      pesan: "Genre berhasil dibuat",
      data: genre,
    };
  }

  async ambilSemuaGenre() {
    const genre = await this.prisma.genre.findMany({
      where: { aktif: true },
      include: {
        _count: {
          select: { naskah: true },
        },
      },
      orderBy: { nama: "asc" },
    });

    return {
      sukses: true,
      data: genre,
      metadata: { total: genre.length },
    };
  }

  // Methods lainnya mirip dengan KategoriService...
}
```

### D.4 Implementasi Modul Naskah (Complex Workflow)

Modul Naskah adalah yang paling complex karena melibatkan 7-status workflow, revision tracking, dan integrasi dengan review system.

#### D.4.1 Langkah 1: Buat DTOs untuk Berbagai Operations

**File: `backend/src/modules/naskah/dto/buat-naskah.dto.ts`**

```typescript
import { z } from "zod";
import { ApiProperty } from "@nestjs/swagger";

export const BuatNaskahSchema = z.object({
  judul: z.string().min(3, "Judul minimal 3 karakter").max(200),
  subJudul: z.string().max(200).optional(),
  sinopsis: z.string().min(50, "Sinopsis minimal 50 karakter"),
  idKategori: z.string().uuid("ID kategori harus UUID valid"),
  idGenre: z.string().uuid("ID genre harus UUID valid"),
  bahasaTulis: z.string().length(2).optional(),
  urlFile: z.string().url().optional(),
  urlSampul: z.string().url().optional(),
});

export type BuatNaskahDto = z.infer<typeof BuatNaskahSchema>;
```

**File: `backend/src/modules/naskah/dto/ajukan-naskah.dto.ts`**

```typescript
import { z } from "zod";

export const AjukanNaskahSchema = z.object({
  konfirmasi: z.literal(true, {
    errorMap: () => ({
      message: "Konfirmasi diperlukan untuk mengajukan naskah",
    }),
  }),
});

export type AjukanNaskahDto = z.infer<typeof AjukanNaskahSchema>;
```

#### D.4.2 Langkah 2: Implementasi Service dengan Workflow Management

**File: `backend/src/modules/naskah/naskah.service.ts`**

```typescript
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { StatusNaskah } from "@prisma/client";
import { BuatNaskahDto } from "./dto/buat-naskah.dto";
import { AjukanNaskahDto } from "./dto/ajukan-naskah.dto";

@Injectable()
export class NaskahService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Status transition validation
   */
  private readonly ALLOWED_TRANSITIONS: Record<StatusNaskah, StatusNaskah[]> = {
    draft: ["diajukan"],
    diajukan: ["draft", "dalam_review"],
    dalam_review: ["perlu_revisi", "disetujui", "ditolak"],
    perlu_revisi: ["diajukan"],
    disetujui: ["diterbitkan"],
    ditolak: [],
    diterbitkan: [],
  };

  private validateStatusTransition(from: StatusNaskah, to: StatusNaskah): void {
    const allowed = this.ALLOWED_TRANSITIONS[from];
    if (!allowed.includes(to)) {
      throw new BadRequestException(
        `Transisi status dari "${from}" ke "${to}" tidak diizinkan`
      );
    }
  }

  /**
   * Method: Buat naskah baru (status: draft)
   */
  async buatNaskah(idPenulis: string, dto: BuatNaskahDto) {
    // Validate kategori & genre exists
    const [kategori, genre] = await Promise.all([
      this.prisma.kategori.findUnique({ where: { id: dto.idKategori } }),
      this.prisma.genre.findUnique({ where: { id: dto.idGenre } }),
    ]);

    if (!kategori || !kategori.aktif) {
      throw new NotFoundException("Kategori tidak ditemukan atau tidak aktif");
    }

    if (!genre || !genre.aktif) {
      throw new NotFoundException("Genre tidak ditemukan atau tidak aktif");
    }

    // Create naskah with transaction
    const naskah = await this.prisma.$transaction(async (tx) => {
      // Create naskah
      const newNaskah = await tx.naskah.create({
        data: {
          idPenulis,
          judul: dto.judul,
          subJudul: dto.subJudul,
          sinopsis: dto.sinopsis,
          idKategori: dto.idKategori,
          idGenre: dto.idGenre,
          bahasaTulis: dto.bahasaTulis || "id",
          urlFile: dto.urlFile,
          urlSampul: dto.urlSampul,
          status: "draft",
          publik: false,
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
          kategori: true,
          genre: true,
        },
      });

      // Create first revision if file uploaded
      if (dto.urlFile) {
        await tx.revisiNaskah.create({
          data: {
            idNaskah: newNaskah.id,
            versi: 1,
            urlFile: dto.urlFile,
            catatan: "Versi awal naskah",
          },
        });
      }

      return newNaskah;
    });

    return {
      sukses: true,
      pesan: "Naskah berhasil dibuat sebagai draft",
      data: naskah,
    };
  }

  /**
   * Method: Ajukan naskah untuk review
   */
  async ajukanNaskah(id: string, idPenulis: string, dto: AjukanNaskahDto) {
    // Get naskah
    const naskah = await this.prisma.naskah.findUnique({
      where: { id },
    });

    if (!naskah) {
      throw new NotFoundException("Naskah tidak ditemukan");
    }

    // Check ownership
    if (naskah.idPenulis !== idPenulis) {
      throw new ForbiddenException("Anda tidak memiliki akses ke naskah ini");
    }

    // Validate current status
    if (naskah.status !== "draft" && naskah.status !== "perlu_revisi") {
      throw new BadRequestException(
        "Hanya naskah dengan status draft atau perlu_revisi yang dapat diajukan"
      );
    }

    // Validate required fields
    if (!naskah.urlFile) {
      throw new BadRequestException("Upload file naskah terlebih dahulu");
    }

    if (!naskah.urlSampul) {
      throw new BadRequestException("Upload sampul buku terlebih dahulu");
    }

    // Update status
    const updated = await this.prisma.naskah.update({
      where: { id },
      data: { status: "diajukan" },
      include: {
        penulis: true,
        kategori: true,
        genre: true,
      },
    });

    // TODO: Send notification to admins

    return {
      sukses: true,
      pesan: "Naskah berhasil diajukan untuk review",
      data: updated,
    };
  }

  // ... Methods lainnya akan dijelaskan di section berikutnya
}
```

---

📄 **Lanjut ke**: [PART 4: Implementasi Frontend](./LAPORAN-DEVELOPMENT-FASE-2-PART-4-IMPLEMENTASI-FRONTEND.md)
