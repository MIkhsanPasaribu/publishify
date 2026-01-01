# 🚀 DEVELOPMENT STEP BY STEP - FASE 2: USER & CONTENT MANAGEMENT

**Referensi**: RANCANGAN-FASE-2-USER-CONTENT-MANAGEMENT.md  
**Prerequisites**: Fase 1 complete (Auth system, Database setup)  
**Target**: Implementasi User Management + Content Management (Kategori, Genre, Naskah)  
**Durasi**: 14 hari kerja (~98 jam)

> ⚠️ **PENTING**: Dokumen ini adalah RANCANGAN/BLUEPRINT untuk pembuatan laporan development actual. Berisi outline detail tentang langkah-langkah implementasi yang sudah dilakukan.

---

## 📋 STRUKTUR LAPORAN DEVELOPMENT

Laporan development actual akan berisi tutorial step-by-step implementasi fitur User Management dan Content Management dengan code actual yang sudah ada di project.

---

## 1. PRISMA SCHEMA - CONTENT MANAGEMENT MODELS

### 1.1 Model Kategori (Hierarchical)

**Yang akan dijelaskan**: Implementasi kategori dengan self-relation untuk hierarki

**Step 1: Tambah Model ke schema.prisma**

```prisma
model Kategori {
  id             String      @id @default(uuid())
  nama           String
  slug           String      @unique
  deskripsi      String?
  idInduk        String?     // Parent category ID (nullable)
  aktif          Boolean     @default(true)
  dibuatPada     DateTime    @default(now())
  diperbaruiPada DateTime    @updatedAt

  // Self-relation (Parent-Child)
  induk       Kategori?  @relation("SubKategori", fields: [idInduk], references: [id])
  subKategori Kategori[] @relation("SubKategori")

  // Relation ke Naskah
  naskah      Naskah[]

  @@map("kategori")
}
```

**Explanation**:

- `idInduk`: Nullable untuk kategori root (top-level)
- Self-relation: Kategori bisa punya parent & children
- `slug`: URL-friendly version dari nama (e.g., "fiksi-romance")
- `aktif`: Soft delete mechanism

**Example Data Structure**:

```
Fiksi (idInduk: null)
├── Romance (idInduk: id_fiksi)
├── Thriller (idInduk: id_fiksi)
└── Fantasi (idInduk: id_fiksi)

Non-Fiksi (idInduk: null)
├── Biografi (idInduk: id_nonfiksi)
└── Self-Help (idInduk: id_nonfiksi)
```

### 1.2 Model Genre (Flat Structure)

**Yang akan dijelaskan**: Genre tanpa hierarki

```prisma
model Genre {
  id             String   @id @default(uuid())
  nama           String   @unique
  slug           String   @unique
  deskripsi      String?
  aktif          Boolean  @default(true)
  dibuatPada     DateTime @default(now())
  diperbaruiPada DateTime @updatedAt

  naskah Naskah[]

  @@map("genre")
}
```

**Difference dengan Kategori**:

- Tidak ada hierarki (flat list)
- 1 naskah = 1 genre (M:1 relation)
- 1 naskah = 1 kategori (M:1 relation)

### 1.3 Model Naskah (Manuscript)

**Yang akan dijelaskan**: Model utama untuk naskah dengan 7 status workflow

```prisma
model Naskah {
  id             String       @id @default(uuid())
  idPenulis      String
  judul          String
  subJudul       String?
  sinopsis       String       @db.Text
  isbn           String?      @unique
  idKategori     String
  idGenre        String
  formatBuku     FormatBuku   @default(A5)
  bahasaTulis    String       @default("id")
  jumlahHalaman  Int?
  jumlahKata     Int?
  status         StatusNaskah @default(draft)
  urlSampul      String?
  urlFile        String?
  publik         Boolean      @default(false)
  biayaProduksi  Decimal?     @db.Decimal(10, 2)
  hargaJual      Decimal?     @db.Decimal(10, 2)
  diterbitkanPada DateTime?
  dibuatPada     DateTime     @default(now())
  diperbaruiPada DateTime     @updatedAt

  // Relations
  penulis      Pengguna       @relation(fields: [idPenulis], references: [id])
  kategori     Kategori       @relation(fields: [idKategori], references: [id])
  genre        Genre          @relation(fields: [idGenre], references: [id])
  revisi       RevisiNaskah[]
  review       ReviewNaskah[]
  pesananCetak PesananCetak[]
  tags         TagNaskah[]

  // Indexes for performance
  @@index([idPenulis])
  @@index([status])
  @@index([idKategori])
  @@index([idGenre])
  @@index([idPenulis, status])
  @@index([status, dibuatPada])
  @@index([idKategori, status])
  @@index([publik, diterbitkanPada])
  @@index([dibuatPada])
  @@map("naskah")
}
```

**Field Explanation**:

- `formatBuku`: A4, A5, atau B5 (untuk percetakan)
- `status`: 7-stage workflow (draft → diajukan → dalam_review → perlu_revisi → disetujui → ditolak → diterbitkan)
- `publik`: Show/hide from public listing
- `biayaProduksi`: Cost to produce
- `hargaJual`: Selling price
- `isbn`: International Standard Book Number (optional, assigned when published)

**Status Workflow**:

```
draft (penulis tulis)
  ↓
diajukan (penulis submit)
  ↓
dalam_review (editor review)
  ↓
[Branch 1] perlu_revisi → (back to draft)
[Branch 2] ditolak → (end)
[Branch 3] disetujui → diterbitkan (admin publish)
```

### 1.4 Model RevisiNaskah (Version Control)

```prisma
model RevisiNaskah {
  id             String   @id @default(uuid())
  idNaskah       String
  versi          Int
  catatan        String?  @db.Text
  urlFile        String
  dibuatPada     DateTime @default(now())

  naskah Naskah @relation(fields: [idNaskah], references: [id], onDelete: Cascade)

  @@unique([idNaskah, versi])  // Prevent duplicate versions
  @@map("revisi_naskah")
}
```

**Usage**:

- Track manuscript file changes
- Version 1, 2, 3, ... (sequential)
- Each revision has file URL + notes

### 1.5 Model Tag & TagNaskah (Many-to-Many)

```prisma
model Tag {
  id         String      @id @default(uuid())
  nama       String      @unique
  slug       String      @unique
  dibuatPada DateTime    @default(now())

  naskah TagNaskah[]

  @@map("tag")
}

model TagNaskah {
  id         String   @id @default(uuid())
  idNaskah   String
  idTag      String
  dibuatPada DateTime @default(now())

  naskah Naskah @relation(fields: [idNaskah], references: [id], onDelete: Cascade)
  tag    Tag    @relation(fields: [idTag], references: [id], onDelete: Cascade)

  @@unique([idNaskah, idTag])
  @@map("tag_naskah")
}
```

**Purpose**:

- Flexible tagging system
- Many-to-many: 1 naskah = multiple tags
- Example: ["romance", "young-adult", "fantasy"]

### 1.6 Run Migration

**Commands**:

```bash
cd backend
bunx prisma migrate dev --name add_content_management

# Verify
bunx prisma studio
# Check tables: kategori, genre, naskah, revisi_naskah, tag, tag_naskah
```

---

## 2. BACKEND - KATEGORI MODULE

### 2.1 Struktur Module

```
modules/kategori/
├── kategori.module.ts
├── kategori.controller.ts
├── kategori.service.ts
└── dto/
    ├── buat-kategori.dto.ts
    ├── perbarui-kategori.dto.ts
    └── index.ts
```

### 2.2 DTOs Implementation

**File: `dto/buat-kategori.dto.ts`**

```typescript
import { z } from "zod";

export const BuatKategoriSchema = z.object({
  nama: z.string().min(2, "Nama kategori minimal 2 karakter").max(100),

  deskripsi: z.string().max(500, "Deskripsi maksimal 500 karakter").optional(),

  idInduk: z.string().uuid("ID induk harus UUID valid").optional(), // Nullable for root categories
});

export type BuatKategoriDto = z.infer<typeof BuatKategoriSchema>;
```

### 2.3 Service Methods (CRUD + Hierarchy)

**File: `kategori.service.ts`**

**Method 1: buatKategori()**

```typescript
async buatKategori(dto: BuatKategoriDto) {
  // Generate slug from nama
  const slug = dto.nama
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  // Check slug uniqueness
  const existingSlug = await this.prisma.kategori.findUnique({
    where: { slug },
  });

  if (existingSlug) {
    throw new ConflictException('Slug kategori sudah ada');
  }

  // If idInduk provided, verify parent exists
  if (dto.idInduk) {
    const parent = await this.prisma.kategori.findUnique({
      where: { id: dto.idInduk },
    });

    if (!parent) {
      throw new NotFoundException('Kategori induk tidak ditemukan');
    }
  }

  // Create kategori
  const kategori = await this.prisma.kategori.create({
    data: {
      nama: dto.nama,
      slug,
      deskripsi: dto.deskripsi,
      idInduk: dto.idInduk,
    },
  });

  return {
    sukses: true,
    pesan: 'Kategori berhasil dibuat',
    data: kategori,
  };
}
```

**Method 2: ambilSemuaKategori() - With Hierarchy**

```typescript
async ambilSemuaKategori() {
  // Get all root categories (idInduk = null)
  const rootKategori = await this.prisma.kategori.findMany({
    where: {
      idInduk: null,
      aktif: true,
    },
    include: {
      subKategori: {
        where: { aktif: true },
        include: {
          subKategori: true,  // Max 3 levels deep
        },
      },
    },
    orderBy: { nama: 'asc' },
  });

  return {
    sukses: true,
    data: rootKategori,
    total: rootKategori.length,
  };
}
```

**Method 3: ambilKategoriById()**

```typescript
async ambilKategoriById(id: string) {
  const kategori = await this.prisma.kategori.findUnique({
    where: { id },
    include: {
      induk: true,         // Parent category
      subKategori: true,   // Child categories
      _count: {
        select: { naskah: true },  // Count naskah in this category
      },
    },
  });

  if (!kategori) {
    throw new NotFoundException('Kategori tidak ditemukan');
  }

  return {
    sukses: true,
    data: kategori,
  };
}
```

### 2.4 Controller Endpoints

```typescript
@ApiTags("kategori")
@Controller("kategori")
export class KategoriController {
  constructor(private readonly kategoriService: KategoriService) {}

  @Post()
  @Peran("admin")
  @ApiOperation({ summary: "Buat kategori baru" })
  async buatKategori(@Body() dto: BuatKategoriDto) {
    return this.kategoriService.buatKategori(dto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: "Ambil semua kategori (hierarchical)" })
  async ambilSemuaKategori() {
    return this.kategoriService.ambilSemuaKategori();
  }

  @Get(":id")
  @Public()
  @ApiOperation({ summary: "Ambil detail kategori" })
  async ambilKategoriById(@Param("id") id: string) {
    return this.kategoriService.ambilKategoriById(id);
  }

  @Put(":id")
  @Peran("admin")
  @ApiOperation({ summary: "Perbarui kategori" })
  async perbaruiKategori(
    @Param("id") id: string,
    @Body() dto: PerbaruiKategoriDto
  ) {
    return this.kategoriService.perbaruiKategori(id, dto);
  }

  @Delete(":id")
  @Peran("admin")
  @ApiOperation({ summary: "Hapus kategori (soft delete)" })
  async hapusKategori(@Param("id") id: string) {
    return this.kategoriService.hapusKategori(id);
  }
}
```

---

## 3. BACKEND - GENRE MODULE

### 3.1 Service Implementation (Similar to Kategori, but flat)

**File: `genre.service.ts`**

```typescript
async buatGenre(dto: BuatGenreDto) {
  const slug = dto.nama
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const existingSlug = await this.prisma.genre.findUnique({
    where: { slug },
  });

  if (existingSlug) {
    throw new ConflictException('Slug genre sudah ada');
  }

  const genre = await this.prisma.genre.create({
    data: {
      nama: dto.nama,
      slug,
      deskripsi: dto.deskripsi,
    },
  });

  return {
    sukses: true,
    pesan: 'Genre berhasil dibuat',
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
    orderBy: { nama: 'asc' },
  });

  return {
    sukses: true,
    data: genre,
    total: genre.length,
  };
}
```

---

## 4. BACKEND - NASKAH MODULE

### 4.1 Module Structure

```
modules/naskah/
├── naskah.module.ts
├── naskah.controller.ts
├── naskah.service.ts
└── dto/
    ├── buat-naskah.dto.ts
    ├── perbarui-naskah.dto.ts
    ├── ajukan-naskah.dto.ts
    ├── terbitkan-naskah.dto.ts
    ├── filter-naskah.dto.ts
    └── index.ts
```

### 4.2 DTOs dengan Validation

**File: `dto/buat-naskah.dto.ts`**

```typescript
import { z } from "zod";
import { FormatBuku } from "@prisma/client";

export const BuatNaskahSchema = z.object({
  judul: z
    .string()
    .min(3, "Judul minimal 3 karakter")
    .max(200, "Judul maksimal 200 karakter"),

  subJudul: z.string().max(200).optional(),

  sinopsis: z
    .string()
    .min(50, "Sinopsis minimal 50 karakter")
    .max(5000, "Sinopsis maksimal 5000 karakter"),

  idKategori: z.string().uuid("ID kategori harus UUID valid"),

  idGenre: z.string().uuid("ID genre harus UUID valid"),

  formatBuku: z.nativeEnum(FormatBuku).default("A5"),

  bahasaTulis: z.string().default("id"),

  jumlahHalaman: z.number().int().positive().optional(),

  jumlahKata: z.number().int().positive().optional(),

  urlSampul: z.string().url("Format URL sampul tidak valid").optional(),

  urlFile: z.string().url("Format URL file tidak valid").optional(),
});

export type BuatNaskahDto = z.infer<typeof BuatNaskahSchema>;
```

### 4.3 Service Implementation

**File: `naskah.service.ts`**

**Method 1: buatNaskah() - With Transaction**

```typescript
async buatNaskah(idPenulis: string, dto: BuatNaskahDto) {
  // Validate kategori exists
  const kategori = await this.prisma.kategori.findUnique({
    where: { id: dto.idKategori },
  });

  if (!kategori || !kategori.aktif) {
    throw new BadRequestException('Kategori tidak valid atau tidak aktif');
  }

  // Validate genre exists
  const genre = await this.prisma.genre.findUnique({
    where: { id: dto.idGenre },
  });

  if (!genre || !genre.aktif) {
    throw new BadRequestException('Genre tidak valid atau tidak aktif');
  }

  // Create naskah with transaction
  const naskah = await this.prisma.$transaction(async (prisma) => {
    // Create naskah
    const newNaskah = await prisma.naskah.create({
      data: {
        ...dto,
        idPenulis,
        status: 'draft',
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

    // Create first revision if file provided
    if (dto.urlFile) {
      await prisma.revisiNaskah.create({
        data: {
          idNaskah: newNaskah.id,
          versi: 1,
          catatan: 'Versi awal naskah',
          urlFile: dto.urlFile,
        },
      });
    }

    return newNaskah;
  });

  // Log activity
  await this.prisma.logAktivitas.create({
    data: {
      idPengguna: idPenulis,
      jenis: 'buat_naskah',
      aksi: 'Buat Naskah',
      entitas: 'Naskah',
      idEntitas: naskah.id,
      deskripsi: `Naskah "${naskah.judul}" berhasil dibuat`,
      platform: 'web',
    },
  });

  return {
    sukses: true,
    pesan: 'Naskah berhasil dibuat',
    data: naskah,
  };
}
```

**Method 2: ambilSemuaNaskah() - With Filters & Pagination**

```typescript
async ambilSemuaNaskah(
  filter: FilterNaskahDto,
  pagination: CursorPaginationDto,
) {
  const { status, idKategori, idGenre, cari } = filter;
  const { cursor, take = 20 } = pagination;

  // Build where clause
  const where: any = {};

  if (status) {
    where.status = status;
  }

  if (idKategori) {
    where.idKategori = idKategori;
  }

  if (idGenre) {
    where.idGenre = idGenre;
  }

  if (cari) {
    where.OR = [
      { judul: { contains: cari, mode: 'insensitive' } },
      { sinopsis: { contains: cari, mode: 'insensitive' } },
    ];
  }

  // Query with cursor pagination
  const naskah = await this.prisma.naskah.findMany({
    where,
    take: take + 1,  // +1 to check if there's next page
    ...(cursor && {
      cursor: { id: cursor },
      skip: 1,
    }),
    include: {
      penulis: {
        select: {
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
      _count: {
        select: {
          review: true,
          revisi: true,
        },
      },
    },
    orderBy: { dibuatPada: 'desc' },
  });

  const hasNextPage = naskah.length > take;
  const data = hasNextPage ? naskah.slice(0, -1) : naskah;
  const nextCursor = hasNextPage ? data[data.length - 1].id : null;

  return {
    sukses: true,
    data,
    metadata: {
      hasNextPage,
      nextCursor,
      count: data.length,
    },
  };
}
```

**Method 3: ajukanNaskah() - Status Transition**

```typescript
async ajukanNaskah(id: string, idPenulis: string, dto: AjukanNaskahDto) {
  // Get naskah
  const naskah = await this.prisma.naskah.findUnique({
    where: { id },
  });

  if (!naskah) {
    throw new NotFoundException('Naskah tidak ditemukan');
  }

  // Check ownership
  if (naskah.idPenulis !== idPenulis) {
    throw new ForbiddenException('Anda tidak memiliki akses ke naskah ini');
  }

  // Check current status
  if (naskah.status !== 'draft' && naskah.status !== 'perlu_revisi') {
    throw new BadRequestException(
      'Hanya naskah dengan status draft atau perlu_revisi yang bisa diajukan',
    );
  }

  // Validate required fields
  if (!naskah.urlFile) {
    throw new BadRequestException('Naskah harus memiliki file sebelum diajukan');
  }

  if (!naskah.urlSampul) {
    throw new BadRequestException('Naskah harus memiliki sampul sebelum diajukan');
  }

  // Update status
  const updated = await this.prisma.naskah.update({
    where: { id },
    data: {
      status: 'diajukan',
    },
    include: {
      penulis: true,
      kategori: true,
      genre: true,
    },
  });

  // Log activity
  await this.prisma.logAktivitas.create({
    data: {
      idPengguna: idPenulis,
      jenis: 'ajukan_naskah',
      aksi: 'Ajukan Naskah',
      entitas: 'Naskah',
      idEntitas: id,
      deskripsi: `Naskah "${naskah.judul}" diajukan untuk review`,
      platform: 'web',
    },
  });

  // Send notification to admins (optional)
  // await this.notifikasiService.kirimKeAdmin(...)

  return {
    sukses: true,
    pesan: 'Naskah berhasil diajukan untuk review',
    data: updated,
  };
}
```

### 4.4 Controller Endpoints

```typescript
@ApiTags("naskah")
@Controller("naskah")
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
  @Public()
  @ApiOperation({ summary: "Ambil semua naskah dengan filter" })
  async ambilSemuaNaskah(
    @Query() filter: FilterNaskahDto,
    @Query() pagination: CursorPaginationDto
  ) {
    return this.naskahService.ambilSemuaNaskah(filter, pagination);
  }

  @Get("saya")
  @Peran("penulis")
  @ApiOperation({ summary: "Ambil naskah milik penulis saat ini" })
  async ambilNaskahSaya(
    @PenggunaSaatIni("id") idPenulis: string,
    @Query() pagination: CursorPaginationDto
  ) {
    return this.naskahService.ambilNaskahByPenulis(idPenulis, pagination);
  }

  @Get(":id")
  @Public()
  @ApiOperation({ summary: "Ambil detail naskah" })
  async ambilNaskahById(@Param("id") id: string) {
    return this.naskahService.ambilNaskahById(id);
  }

  @Put(":id")
  @Peran("penulis")
  @ApiOperation({ summary: "Perbarui naskah" })
  async perbaruiNaskah(
    @Param("id") id: string,
    @PenggunaSaatIni("id") idPenulis: string,
    @Body() dto: PerbaruiNaskahDto
  ) {
    return this.naskahService.perbaruiNaskah(id, idPenulis, dto);
  }

  @Put(":id/ajukan")
  @Peran("penulis")
  @ApiOperation({ summary: "Ajukan naskah untuk review" })
  async ajukanNaskah(
    @Param("id") id: string,
    @PenggunaSaatIni("id") idPenulis: string,
    @Body() dto: AjukanNaskahDto
  ) {
    return this.naskahService.ajukanNaskah(id, idPenulis, dto);
  }

  @Delete(":id")
  @Peran("penulis", "admin")
  @ApiOperation({ summary: "Hapus naskah" })
  async hapusNaskah(
    @Param("id") id: string,
    @PenggunaSaatIni("id") idPengguna: string
  ) {
    return this.naskahService.hapusNaskah(id, idPengguna);
  }
}
```

---

## 5. FILE UPLOAD MODULE

### 5.1 Supabase Storage Setup

**Yang akan dijelaskan**: Setup buckets untuk file storage

**Buckets yang dibuat**:

- `naskah-files`: Manuscript PDF/DOCX files
- `sampul`: Cover images
- `avatar`: User avatars
- `dokumen`: Other documents

**Supabase Setup**:

1. Go to Supabase Dashboard → Storage
2. Create 4 buckets
3. Set policies:
   - `naskah-files`: Authenticated users can upload/read own files
   - `sampul`: Public read, authenticated write
   - `avatar`: Public read, authenticated write
   - `dokumen`: Authenticated users only

### 5.2 Upload Service Implementation

**File: `modules/upload/upload.service.ts`**

```typescript
import { createClient } from "@supabase/supabase-js";
import * as sharp from "sharp";

@Injectable()
export class UploadService {
  private supabase;

  constructor(private readonly configService: ConfigService) {
    this.supabase = createClient(
      this.configService.get("SUPABASE_URL"),
      this.configService.get("SUPABASE_KEY")
    );
  }

  async uploadNaskah(
    file: Express.Multer.File,
    idPenulis: string
  ): Promise<string> {
    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        "Tipe file tidak valid. Hanya PDF atau DOCX"
      );
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      throw new BadRequestException("Ukuran file maksimal 10MB");
    }

    // Generate unique filename
    const ext = file.originalname.split(".").pop();
    const filename = `${idPenulis}/${Date.now()}.${ext}`;

    // Upload to Supabase
    const { data, error } = await this.supabase.storage
      .from("naskah-files")
      .upload(filename, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      throw new InternalServerErrorException("Gagal upload file");
    }

    // Get public URL
    const { data: urlData } = this.supabase.storage
      .from("naskah-files")
      .getPublicUrl(filename);

    return urlData.publicUrl;
  }

  async uploadSampul(
    file: Express.Multer.File,
    idPenulis: string
  ): Promise<string> {
    // Validate file type (images only)
    if (!file.mimetype.startsWith("image/")) {
      throw new BadRequestException("Tipe file harus gambar");
    }

    // Resize & compress image using sharp
    const processedImage = await sharp(file.buffer)
      .resize(800, 1200, { fit: "cover" }) // Cover aspect ratio
      .jpeg({ quality: 85 })
      .toBuffer();

    // Generate filename
    const filename = `${idPenulis}/${Date.now()}.jpg`;

    // Upload
    const { data, error } = await this.supabase.storage
      .from("sampul")
      .upload(filename, processedImage, {
        contentType: "image/jpeg",
        upsert: false,
      });

    if (error) {
      throw new InternalServerErrorException("Gagal upload sampul");
    }

    // Get public URL
    const { data: urlData } = this.supabase.storage
      .from("sampul")
      .getPublicUrl(filename);

    return urlData.publicUrl;
  }
}
```

### 5.3 Upload Controller

```typescript
@ApiTags("upload")
@Controller("upload")
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post("naskah")
  @UseInterceptors(FileInterceptor("file"))
  @ApiOperation({ summary: "Upload file naskah (PDF/DOCX)" })
  async uploadNaskah(
    @UploadedFile() file: Express.Multer.File,
    @PenggunaSaatIni("id") idPenulis: string
  ) {
    const url = await this.uploadService.uploadNaskah(file, idPenulis);
    return {
      sukses: true,
      pesan: "File naskah berhasil diupload",
      data: { url },
    };
  }

  @Post("sampul")
  @UseInterceptors(FileInterceptor("file"))
  @ApiOperation({ summary: "Upload sampul buku (gambar)" })
  async uploadSampul(
    @UploadedFile() file: Express.Multer.File,
    @PenggunaSaatIni("id") idPenulis: string
  ) {
    const url = await this.uploadService.uploadSampul(file, idPenulis);
    return {
      sukses: true,
      pesan: "Sampul berhasil diupload",
      data: { url },
    };
  }
}
```

---

## 6. FRONTEND - KATEGORI & GENRE PAGES

### 6.1 API Client untuk Kategori

**File: `frontend/lib/api/kategori.ts`**

```typescript
import api from "./client";

export const kategoriApi = {
  ambilSemua: async () => {
    const { data } = await api.get("/kategori");
    return data;
  },

  ambilById: async (id: string) => {
    const { data } = await api.get(`/kategori/${id}`);
    return data;
  },

  buat: async (payload: any) => {
    const { data } = await api.post("/kategori", payload);
    return data;
  },

  perbarui: async (id: string, payload: any) => {
    const { data } = await api.put(`/kategori/${id}`, payload);
    return data;
  },

  hapus: async (id: string) => {
    const { data } = await api.delete(`/kategori/${id}`);
    return data;
  },
};
```

### 6.2 Admin Page - Kelola Kategori

**File: `frontend/app/(admin)/admin/master/kategori/page.tsx`**

```typescript
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { kategoriApi } from "@/lib/api/kategori";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { DialogBuatKategori } from "./dialog-buat-kategori";

export default function KelolayKategoriPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch kategori
  const { data, isLoading } = useQuery({
    queryKey: ["kategori"],
    queryFn: kategoriApi.ambilSemua,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: kategoriApi.hapus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kategori"] });
      toast.success("Kategori berhasil dihapus");
    },
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Kelola Kategori</h1>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Kategori
        </Button>
      </div>

      <div className="space-y-4">
        {data?.data?.map((kategori) => (
          <KategoriCard
            key={kategori.id}
            kategori={kategori}
            onDelete={() => deleteMutation.mutate(kategori.id)}
          />
        ))}
      </div>

      <DialogBuatKategori open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
```

---

## 7. FRONTEND - NASKAH MANAGEMENT

### 7.1 API Client untuk Naskah

**File: `frontend/lib/api/naskah.ts`** (Already exists in project)

### 7.2 Penulis Page - Draf Saya

**File: `frontend/app/(penulis)/penulis/draf/page.tsx`**

```typescript
"use client";

import { useQuery } from "@tanstack/react-query";
import { naskahApi } from "@/lib/api/naskah";
import { KartuNaskah } from "@/components/modules/naskah/kartu-naskah";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DrafSayaPage() {
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ["naskah-saya"],
    queryFn: () => naskahApi.ambilNaskahSaya(),
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Draf Saya</h1>
          <p className="text-muted-foreground">
            Total {data?.data?.length || 0} naskah
          </p>
        </div>
        <Button onClick={() => router.push("/penulis/draf/buat")}>
          <Plus className="w-4 h-4 mr-2" />
          Buat Naskah Baru
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.data?.map((naskah) => (
          <KartuNaskah
            key={naskah.id}
            naskah={naskah}
            onClick={() => router.push(`/penulis/draf/${naskah.id}`)}
          />
        ))}
      </div>

      {data?.data?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Belum ada naskah</p>
          <Button
            onClick={() => router.push("/penulis/draf/buat")}
            className="mt-4"
          >
            Buat Naskah Pertama
          </Button>
        </div>
      )}
    </div>
  );
}
```

### 7.3 Form Buat Naskah dengan React Hook Form

**File: `frontend/app/(penulis)/penulis/draf/buat/page.tsx`**

```typescript
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { naskahApi } from "@/lib/api/naskah";
import { kategoriApi } from "@/lib/api/kategori";
import { genreApi } from "@/lib/api/genre";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const buatNaskahSchema = z.object({
  judul: z.string().min(3, "Judul minimal 3 karakter"),
  subJudul: z.string().optional(),
  sinopsis: z.string().min(50, "Sinopsis minimal 50 karakter"),
  idKategori: z.string().uuid(),
  idGenre: z.string().uuid(),
  formatBuku: z.enum(["A4", "A5", "B5"]),
  bahasaTulis: z.string().default("id"),
  jumlahHalaman: z.number().int().positive().optional(),
  jumlahKata: z.number().int().positive().optional(),
});

export default function BuatNaskahPage() {
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(buatNaskahSchema),
    defaultValues: {
      formatBuku: "A5",
      bahasaTulis: "id",
    },
  });

  // Fetch kategori & genre for dropdowns
  const { data: kategori } = useQuery({
    queryKey: ["kategori"],
    queryFn: kategoriApi.ambilSemua,
  });

  const { data: genre } = useQuery({
    queryKey: ["genre"],
    queryFn: genreApi.ambilSemua,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: naskahApi.buat,
    onSuccess: (data) => {
      toast.success("Naskah berhasil dibuat!");
      router.push(`/penulis/draf/${data.data.id}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.pesan || "Gagal membuat naskah");
    },
  });

  const onSubmit = (values: any) => {
    createMutation.mutate(values);
  };

  return (
    <div className="container max-w-2xl py-8">
      <h1 className="text-3xl font-bold mb-6">Buat Naskah Baru</h1>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Form fields menggunakan shadcn/ui components */}
        {/* Input, Select, Textarea, Button */}
        {/* ... implementation details ... */}
      </form>
    </div>
  );
}
```

---

## 8. TESTING & VERIFICATION

### 8.1 API Testing dengan Thunder Client

**Test 1: Create Kategori**

```http
POST http://localhost:3000/api/kategori
Authorization: Bearer {{adminToken}}
Content-Type: application/json

{
  "nama": "Fiksi",
  "deskripsi": "Kategori untuk buku fiksi"
}
```

**Test 2: Create Sub-Kategori**

```http
POST http://localhost:3000/api/kategori
Authorization: Bearer {{adminToken}}
Content-Type: application/json

{
  "nama": "Romance",
  "deskripsi": "Sub-kategori romance",
  "idInduk": "{{id_kategori_fiksi}}"
}
```

**Test 3: Create Naskah**

```http
POST http://localhost:3000/api/naskah
Authorization: Bearer {{penulisToken}}
Content-Type: application/json

{
  "judul": "Kisah Cinta di Kota Hujan",
  "sinopsis": "Sebuah kisah cinta yang berlatar belakang kota yang selalu hujan...",
  "idKategori": "{{id_kategori}}",
  "idGenre": "{{id_genre}}",
  "formatBuku": "A5"
}
```

### 8.2 Frontend E2E Testing

**Flow 1: Penulis Buat Naskah Baru**

1. Login as penulis
2. Navigate to /penulis/draf
3. Click "Buat Naskah Baru"
4. Fill form (judul, sinopsis, kategori, genre)
5. Submit
6. Verify redirect to detail page
7. Check naskah appears in "Draf Saya"

**Flow 2: Admin Kelola Kategori**

1. Login as admin
2. Navigate to /admin/master/kategori
3. Click "Tambah Kategori"
4. Fill form & submit
5. Verify kategori appears in list
6. Test hierarchy (create sub-kategori)

---

## 9. METRICS FASE 2

**Total Time**: ~98 jam (14 hari kerja)  
**Backend LOC**: +4,000  
**Frontend LOC**: +3,500  
**Database Tables Added**: 6 (kategori, genre, naskah, revisi_naskah, tag, tag_naskah)  
**API Endpoints Added**: +25

**Deliverables**:
✅ Kategori management (hierarchical)  
✅ Genre management (flat)  
✅ Naskah CRUD complete  
✅ File upload system (Supabase)  
✅ Status workflow implemented  
✅ Frontend pages functional  
✅ Form validation dengan Zod  
✅ API integration complete

---

**END OF RANCANGAN FASE 2**

_Catatan: Ini adalah RANCANGAN untuk pembuatan laporan development actual. Laporan actual akan berisi code lengkap dari implementasi yang sudah ada di project._
