# LAPORAN DEVELOPMENT STEP BY STEP FASE 4

## SISTEM PERCETAKAN DAN MANAJEMEN PESANAN PUBLISHIFY

**PART 3: IMPLEMENTASI BACKEND STEP BY STEP**

---

## D. IMPLEMENTASI BACKEND

### D.1 Setup Environment dan Dependencies

Sebelum memulai coding implementasi, kami perlu memastikan development environment sudah properly configured dengan semua dependencies yang diperlukan.

#### D.1.1 Instalasi Dependencies

Langkah pertama adalah menginstall dependencies yang spesifik untuk module percetakan. Kami menggunakan Bun sebagai package manager yang significantly faster dibanding npm atau yarn.

```bash
cd backend
bun add @nestjs/common @nestjs/core @nestjs/platform-express
bun add @prisma/client
bun add class-validator class-transformer
bun add date-fns
```

Dependencies ini sudah terinstall dari fase-fase sebelumnya, namun kami verify version compatibility untuk ensure no breaking changes.

#### D.1.2 Environment Variables Configuration

Kami menambahkan environment variables yang diperlukan untuk module percetakan di file `.env`:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/publishify"
DIRECT_URL="postgresql://user:password@localhost:5432/publishify"

# JWT
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"

# Email Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Redis (untuk caching dan queue)
REDIS_HOST="localhost"
REDIS_PORT=6379
```

Environment variables ini kami load menggunakan `@nestjs/config` module yang sudah configured di `app.module.ts`.

### D.2 Database Schema Implementation

#### D.2.1 Membuat Prisma Schema

Langkah pertama dalam backend implementation adalah mendefinisikan database schema. Kami membuka file `backend/prisma/schema.prisma` dan menambahkan models untuk sistem percetakan.

**Lokasi File**: `backend/prisma/schema.prisma` (lines 408-536)

Kami menambahkan lima enum types terlebih dahulu:

```prisma
enum StatusPesanan {
  tertunda
  diterima
  dalam_produksi
  kontrol_kualitas
  siap
  dikirim
  terkirim
  selesai
  dibatalkan

  @@map("status_pesanan")
}

enum FormatBuku {
  A4
  A5
  B5

  @@map("format_buku")
}

enum JenisKertas {
  HVS
  BOOKPAPER
  ART_PAPER

  @@map("jenis_kertas")
}

enum JenisCover {
  SOFTCOVER
  HARDCOVER

  @@map("jenis_cover")
}

enum StatusPengiriman {
  diproses
  dalam_perjalanan
  terkirim
  gagal

  @@map("status_pengiriman")
}
```

Enums ini provide type safety dan ensure hanya valid values yang dapat disimpan di database. Decorator `@@map` kami gunakan untuk specify nama table di database yang menggunakan snake_case convention.

Kemudian kami define model `PesananCetak`:

```prisma
model PesananCetak {
  id                String         @id @default(uuid())
  nomorPesanan      String         @unique @default(dbgenerated("concat('PCT-', to_char(now(), 'YYYY'), '-', lpad((SELECT count(*) + 1 FROM pesanan_cetak)::text, 5, '0'))"))
  idNaskah          String
  idPemesan         String
  idPercetakan      String?
  jumlah            Int
  formatBuku        FormatBuku
  jenisKertas       JenisKertas
  jenisCover        JenisCover
  laminating        Boolean        @default(false)
  hargaSatuan       Decimal        @db.Decimal(10,2)
  totalHarga        Decimal        @db.Decimal(12,2)
  status            StatusPesanan  @default(tertunda)
  alamatPengiriman  Json
  catatanKhusus     String?        @db.Text
  alasanDitolak     String?        @db.Text
  dibuatPada        DateTime       @default(now())
  diperbaruiPada    DateTime       @updatedAt

  // Relations
  naskah            Naskah         @relation(fields: [idNaskah], references: [id], onDelete: Restrict)
  pemesan           Pengguna       @relation("PesananPemesan", fields: [idPemesan], references: [id], onDelete: Restrict)
  percetakan        Pengguna?      @relation("PesananPercetakan", fields: [idPercetakan], references: [id], onDelete: Restrict)
  logProduksi       LogProduksi[]
  pengiriman        Pengiriman?

  @@index([idNaskah])
  @@index([idPemesan])
  @@index([idPercetakan])
  @@index([status])
  @@index([nomorPesanan])
  @@map("pesanan_cetak")
}
```

Beberapa hal penting dalam model ini:

- `nomorPesanan` menggunakan `dbgenerated()` untuk automatically generate nomor unique dengan format PCT-YYYY-XXXXX. Ini provide human-readable identifier yang easier untuk reference di communications.
- `hargaSatuan` dan `totalHarga` menggunakan `Decimal` type dengan precision 10,2 dan 12,2 untuk accurate monetary calculations.
- `alamatPengiriman` menggunakan `Json` type untuk flexibility dalam storing address structure yang might vary.
- Foreign key relations dengan `onDelete: Restrict` untuk prevent accidental deletion dari referenced records.
- Comprehensive indexing pada frequently queried columns untuk performance optimization.

Selanjutnya model `ParameterHargaPercetakan`:

```prisma
model ParameterHargaPercetakan {
  id                    String   @id @default(uuid())
  idPercetakan          String
  namaKombinasi         String
  deskripsi             String?  @db.Text
  hargaKertasA4         Decimal  @default(0) @db.Decimal(10,2)
  hargaKertasA5         Decimal  @default(0) @db.Decimal(10,2)
  hargaKertasB5         Decimal  @default(0) @db.Decimal(10,2)
  hargaSoftcover        Decimal  @default(0) @db.Decimal(10,2)
  hargaHardcover        Decimal  @default(0) @db.Decimal(10,2)
  biayaJilid            Decimal  @default(0) @db.Decimal(10,2)
  biayaLaminating       Decimal  @default(0) @db.Decimal(10,2)
  biayaPengirimanPerKg  Decimal  @default(0) @db.Decimal(10,2)
  minimumPesanan        Int      @default(10)
  diskonTier            Json?
  aktif                 Boolean  @default(true)
  dibuatPada            DateTime @default(now())
  diperbaruiPada        DateTime @updatedAt

  percetakan            Pengguna @relation(fields: [idPercetakan], references: [id], onDelete: Cascade)

  @@index([idPercetakan])
  @@index([aktif])
  @@map("parameter_harga_percetakan")
}
```

Model ini store pricing configuration dengan separate columns untuk each pricing component. Field `diskonTier` menggunakan `Json` type untuk allow flexible discount tier definitions.

Model `LogProduksi`, `Pengiriman`, dan `TrackingLog`:

```prisma
model LogProduksi {
  id         String        @id @default(uuid())
  idPesanan  String
  tahapan    String
  status     String
  catatan    String?       @db.Text
  waktu      DateTime      @default(now())
  dibuatPada DateTime      @default(now())

  pesanan    PesananCetak  @relation(fields: [idPesanan], references: [id], onDelete: Cascade)

  @@index([idPesanan])
  @@index([waktu])
  @@map("log_produksi")
}

model Pengiriman {
  id              String            @id @default(uuid())
  idPesanan       String            @unique
  namaEkspedisi   String
  nomorResi       String
  estimasiSampai  DateTime?
  biayaKirim      Decimal           @db.Decimal(10,2)
  status          StatusPengiriman  @default(diproses)
  tanggalKirim    DateTime
  tanggalTerima   DateTime?
  catatanPenerima String?           @db.Text
  dibuatPada      DateTime          @default(now())
  diperbaruiPada  DateTime          @updatedAt

  pesanan         PesananCetak      @relation(fields: [idPesanan], references: [id], onDelete: Cascade)
  trackingLog     TrackingLog[]

  @@index([idPesanan])
  @@index([nomorResi])
  @@index([status])
  @@map("pengiriman")
}

model TrackingLog {
  id            String      @id @default(uuid())
  idPengiriman  String
  lokasi        String
  keterangan    String
  waktu         DateTime    @default(now())
  dibuatPada    DateTime    @default(now())

  pengiriman    Pengiriman  @relation(fields: [idPengiriman], references: [id], onDelete: Cascade)

  @@index([idPengiriman])
  @@index([waktu])
  @@map("tracking_log")
}
```

#### D.2.2 Menjalankan Migration

Setelah schema defined, kami generate migration file dan apply ke database:

```bash
cd backend
bunx prisma migrate dev --name add_printing_system
```

Command ini akan:

1. Generate SQL migration file di folder `prisma/migrations/`
2. Apply migration ke development database
3. Regenerate Prisma Client dengan updated types

Output yang expected:

```
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "publishify", schema "public"

Applying migration `20260123000000_add_printing_system`

The following migrations have been created and applied from new schema changes:

migrations/
  └─ 20260123000000_add_printing_system/
    └─ migration.sql

Your database is now in sync with your schema.

✔ Generated Prisma Client (5.8.0) to ./node_modules/@prisma/client
```

Kami verify migration success dengan membuka Prisma Studio:

```bash
bunx prisma studio
```

Di Prisma Studio, kami check bahwa tables baru (pesanan_cetak, parameter_harga_percetakan, log_produksi, pengiriman, tracking_log) sudah created dengan correct columns dan relations.

#### D.2.3 Seeding Test Data

Untuk facilitate development dan testing, kami create seed script yang populate database dengan sample data. Kami edit file `backend/prisma/seed.ts` dan add seeding logic untuk percetakan module.

**Lokasi File**: `backend/prisma/seed.ts`

Kami add function untuk create sample percetakan users dengan pricing parameters:

```typescript
async function seedPercetakan() {
  console.log("🏭 Seeding Percetakan...");

  // Create 3 percetakan users
  const percetakan1 = await prisma.pengguna.create({
    data: {
      email: "percetakan1@publishify.com",
      kataSandi: await hash("password123", 10),
      aktif: true,
      terverifikasi: true,
      profilPengguna: {
        create: {
          namaDepan: "Percetakan",
          namaBelakang: "Prima",
          namaTampilan: "Prima Printing",
          kota: "Jakarta",
          provinsi: "DKI Jakarta",
        },
      },
      peranPengguna: {
        create: {
          jenisPeran: "percetakan",
          aktif: true,
        },
      },
    },
  });

  // Create pricing parameters untuk percetakan1
  await prisma.parameterHargaPercetakan.create({
    data: {
      idPercetakan: percetakan1.id,
      namaKombinasi: "Tarif Standar 2026",
      deskripsi: "Tarif standar untuk semua jenis cetak",
      hargaKertasA4: new Decimal("60"),
      hargaKertasA5: new Decimal("50"),
      hargaKertasB5: new Decimal("55"),
      hargaSoftcover: new Decimal("5000"),
      hargaHardcover: new Decimal("15000"),
      biayaJilid: new Decimal("3000"),
      biayaLaminating: new Decimal("2000"),
      biayaPengirimanPerKg: new Decimal("15000"),
      minimumPesanan: 10,
      diskonTier: [
        { minQty: 50, diskonPersen: 5 },
        { minQty: 100, diskonPersen: 10 },
        { minQty: 500, diskonPersen: 15 },
      ],
      aktif: true,
    },
  });

  console.log("✅ Percetakan seeded successfully");
}
```

Jalankan seeding:

```bash
bunx prisma db seed
```

### D.3 Implementasi DTO (Data Transfer Objects)

DTOs define structure dari data yang ditransfer between client dan server. Kami create DTOs untuk various operations di percetakan module.

#### D.3.1 BuatPesananDto

**Lokasi File**: `backend/src/modules/percetakan/dto/buat-pesanan.dto.ts`

```typescript
import {
  IsString,
  IsUUID,
  IsInt,
  Min,
  IsEnum,
  IsBoolean,
  IsObject,
  ValidateNested,
  IsOptional,
} from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

class AlamatPengirimanDto {
  @ApiProperty({ description: "Nama penerima" })
  @IsString()
  nama!: string;

  @ApiProperty({ description: "Nomor telepon penerima" })
  @IsString()
  telepon!: string;

  @ApiProperty({ description: "Alamat lengkap" })
  @IsString()
  alamat!: string;

  @ApiProperty({ description: "Kota" })
  @IsString()
  kota!: string;

  @ApiProperty({ description: "Provinsi" })
  @IsString()
  provinsi!: string;

  @ApiProperty({ description: "Kode pos" })
  @IsString()
  kodePos!: string;
}

export class BuatPesananDto {
  @ApiProperty({ description: "ID Naskah yang akan dicetak" })
  @IsUUID()
  idNaskah!: string;

  @ApiProperty({ description: "ID Percetakan yang dipilih" })
  @IsUUID()
  idPercetakan!: string;

  @ApiProperty({ description: "Jumlah eksemplar", minimum: 1 })
  @IsInt()
  @Min(1)
  jumlah!: number;

  @ApiProperty({ description: "Format/ukuran buku", enum: ["A4", "A5", "B5"] })
  @IsEnum(["A4", "A5", "B5"])
  formatKertas!: string;

  @ApiProperty({
    description: "Jenis kertas",
    enum: ["HVS", "BOOKPAPER", "ART_PAPER"],
  })
  @IsEnum(["HVS", "BOOKPAPER", "ART_PAPER"])
  jenisKertas!: string;

  @ApiProperty({ description: "Jenis cover", enum: ["SOFTCOVER", "HARDCOVER"] })
  @IsEnum(["SOFTCOVER", "HARDCOVER"])
  jenisCover!: string;

  @ApiProperty({ description: "Apakah menggunakan laminating", default: false })
  @IsBoolean()
  laminating!: boolean;

  @ApiProperty({ description: "Alamat pengiriman", type: AlamatPengirimanDto })
  @IsObject()
  @ValidateNested()
  @Type(() => AlamatPengirimanDto)
  alamatPengiriman!: AlamatPengirimanDto;

  @ApiProperty({
    description: "Catatan khusus untuk percetakan",
    required: false,
  })
  @IsOptional()
  @IsString()
  catatanKhusus?: string;
}
```

Class-validator decorators automatically validate incoming request body. Jika validation fails, NestJS automatically return 400 Bad Request dengan error details.

#### D.3.2 DTOs Lainnya

Kami create additional DTOs untuk operations lain:

- `UpdateStatusDto`: Untuk update status pesanan
- `KonfirmasiPesananDto`: Untuk percetakan confirm/reject pesanan
- `BuatPengirimanDto`: Untuk create shipment record
- `KonfirmasiPenerimaanDto`: Untuk penulis confirm delivery
- `FilterPesananDto`: Untuk filter dan search pesanan
- `BuatTarifDto`: Untuk create pricing parameters
- `PerbaruiTarifDto`: Untuk update pricing parameters

**Lokasi Files**: `backend/src/modules/percetakan/dto/` (14 files total)

### D.4 Implementasi Service Layer

Service layer berisi core business logic dari aplikasi. Ini adalah heart dari sistem dimana semua business rules di-enforce.

#### D.4.1 Setup PercetakanService Class

**Lokasi File**: `backend/src/modules/percetakan/percetakan.service.ts` (1,962 lines)

Kami create service class dengan necessary dependencies injected:

```typescript
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { NotifikasiService } from "@/modules/notifikasi/notifikasi.service";
import { NotifikasiGateway } from "@/modules/notifikasi/notifikasi.gateway";
import { EmailService } from "@/modules/notifikasi/email.service";
import { Decimal } from "@prisma/client/runtime/library";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

@Injectable()
export class PercetakanService {
  private readonly logger = new Logger(PercetakanService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifikasiService: NotifikasiService,
    private readonly notifikasiGateway: NotifikasiGateway,
    private readonly emailService: EmailService
  ) {}

  // Service methods akan di-implement di sini
}
```

Dependency injection ini allows service untuk access database via PrismaService, send notifications via NotifikasiService dan NotifikasiGateway, dan send emails via EmailService.

#### D.4.2 Method: ambilDaftarPercetakan()

Method ini retrieve list of available percetakan beserta pricing info untuk ditampilkan ketika penulis akan create pesanan.

```typescript
async ambilDaftarPercetakan() {
  console.log('\n🏭 [PERCETAKAN] Mengambil Daftar Percetakan');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Query semua user dengan role percetakan yang aktif
  const daftarPercetakan = await this.prisma.pengguna.findMany({
    where: {
      peranPengguna: {
        some: {
          jenisPeran: 'percetakan',
          aktif: true,
        },
      },
      aktif: true,
    },
    include: {
      profilPengguna: {
        select: {
          namaDepan: true,
          namaBelakang: true,
          namaTampilan: true,
          alamat: true,
          kota: true,
          provinsi: true,
        },
      },
      parameterHarga: {
        where: {
          aktif: true,
        },
        select: {
          id: true,
          namaKombinasi: true,
          deskripsi: true,
          hargaKertasA4: true,
          hargaKertasA5: true,
          hargaKertasB5: true,
          hargaSoftcover: true,
          hargaHardcover: true,
          biayaJilid: true,
          minimumPesanan: true,
        },
      },
    },
    orderBy: {
      dibuatPada: 'desc',
    },
  });

  console.log(`✅ Ditemukan ${daftarPercetakan.length} percetakan aktif`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Transform data untuk response
  return {
    sukses: true,
    pesan: 'Daftar percetakan berhasil diambil',
    data: daftarPercetakan.map((p) => {
      const tarif = p.parameterHarga[0];
      const profil = p.profilPengguna;

      // Construct nama dengan fallback logic
      let nama = 'Percetakan';
      if (profil?.namaTampilan) {
        nama = profil.namaTampilan;
      } else if (profil?.namaDepan || profil?.namaBelakang) {
        nama = `${profil.namaDepan || ''} ${profil.namaBelakang || ''}`.trim();
      }

      return {
        id: p.id,
        email: p.email,
        nama,
        alamat: profil?.alamat || null,
        kota: profil?.kota || null,
        provinsi: profil?.provinsi || null,
        tarifAktif: tarif ? {
          ...tarif,
          // Convert Decimal to number untuk JSON serialization
          hargaKertasA4: tarif.hargaKertasA4 ? Number(tarif.hargaKertasA4) : 0,
          hargaKertasA5: tarif.hargaKertasA5 ? Number(tarif.hargaKertasA5) : 0,
          hargaKertasB5: tarif.hargaKertasB5 ? Number(tarif.hargaKertasB5) : 0,
          hargaSoftcover: tarif.hargaSoftcover ? Number(tarif.hargaSoftcover) : 0,
          hargaHardcover: tarif.hargaHardcover ? Number(tarif.hargaHardcover) : 0,
          biayaJilid: tarif.biayaJilid ? Number(tarif.biayaJilid) : 0,
        } : null,
      };
    }),
    total: daftarPercetakan.length,
  };
}
```

Key points:

- Comprehensive `include` untuk get related data (profil dan tarif) in single query
- Filtering untuk only active percetakan dan active tarif
- Data transformation untuk convert Decimal types ke numbers
- Fallback logic untuk construct nama dari multiple sources
- Console logging untuk debugging purposes

#### D.4.3 Method: buatPesanan()

Method ini adalah core functionality untuk create new order. Ini involve complex validation dan calculation logic.

**Implementasi Step by Step**:

**Step 1: Validasi Naskah**

```typescript
async buatPesanan(idPemesan: string, dto: BuatPesananDto) {
  console.log('\n🎯 [PERCETAKAN] Membuat Pesanan Baru');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // 1. Validasi naskah exists dan status diterbitkan
  const naskah = await this.prisma.naskah.findUnique({
    where: { id: dto.idNaskah },
    include: {
      penulis: {
        select: {
          id: true,
          email: true,
        },
      },
    },
  });

  if (!naskah) {
    throw new NotFoundException('Naskah tidak ditemukan');
  }

  if (naskah.status !== 'diterbitkan') {
    throw new BadRequestException(
      'Hanya naskah dengan status "diterbitkan" yang dapat dicetak'
    );
  }

  // 2. Validasi pemesan adalah penulis naskah
  if (naskah.idPenulis !== idPemesan) {
    throw new ForbiddenException(
      'Anda hanya dapat memesan cetak untuk naskah Anda sendiri'
    );
  }
```

**Step 2: Validasi Percetakan dan Tarif**

```typescript
// 3. Validasi percetakan exists dan aktif
const percetakan = await this.prisma.pengguna.findFirst({
  where: {
    id: dto.idPercetakan,
    aktif: true,
    peranPengguna: {
      some: {
        jenisPeran: "percetakan",
        aktif: true,
      },
    },
  },
});

if (!percetakan) {
  throw new NotFoundException("Percetakan tidak ditemukan atau tidak aktif");
}

// 4. Ambil tarif aktif percetakan
const tarifAktif = await this.prisma.parameterHargaPercetakan.findFirst({
  where: {
    idPercetakan: dto.idPercetakan,
    aktif: true,
  },
});

if (!tarifAktif) {
  throw new NotFoundException("Percetakan belum memiliki tarif aktif");
}

// 5. Validasi jumlah pesanan terhadap minimum
if (dto.jumlah < tarifAktif.minimumPesanan) {
  throw new BadRequestException(
    `Jumlah pesanan minimal ${tarifAktif.minimumPesanan} eksemplar`
  );
}
```

**Step 3: Kalkulasi Harga**

```typescript
// 6. Kalkulasi harga otomatis berdasarkan tarif
let hargaKertasPerLembar = 0;
if (dto.formatKertas === "A4") {
  hargaKertasPerLembar = Number(tarifAktif.hargaKertasA4);
} else if (dto.formatKertas === "A5") {
  hargaKertasPerLembar = Number(tarifAktif.hargaKertasA5);
} else if (dto.formatKertas === "B5") {
  hargaKertasPerLembar = Number(tarifAktif.hargaKertasB5);
}

let hargaCoverPerUnit = 0;
if (dto.jenisCover === "SOFTCOVER") {
  hargaCoverPerUnit = Number(tarifAktif.hargaSoftcover);
} else if (dto.jenisCover === "HARDCOVER") {
  hargaCoverPerUnit = Number(tarifAktif.hargaHardcover);
}

const biayaJilid = Number(tarifAktif.biayaJilid);
const biayaLaminating = dto.laminating ? Number(tarifAktif.biayaLaminating) : 0;

// Assume jumlah halaman dari naskah, atau 100 jika belum diset
const jumlahHalaman = naskah.jumlahHalaman || 100;

// Hitung harga per unit (satuan)
let hargaSatuanBase =
  hargaKertasPerLembar * jumlahHalaman +
  hargaCoverPerUnit +
  biayaJilid +
  biayaLaminating;

// Apply diskon tier jika ada
let diskonPersen = 0;
if (tarifAktif.diskonTier && Array.isArray(tarifAktif.diskonTier)) {
  const tiers = tarifAktif.diskonTier as Array<{
    minQty: number;
    diskonPersen: number;
  }>;
  // Sort descending by minQty
  const sortedTiers = tiers.sort((a, b) => b.minQty - a.minQty);

  // Find applicable tier
  for (const tier of sortedTiers) {
    if (dto.jumlah >= tier.minQty) {
      diskonPersen = tier.diskonPersen;
      break;
    }
  }
}

// Apply diskon
const hargaSatuan = hargaSatuanBase * (1 - diskonPersen / 100);
const totalHarga = hargaSatuan * dto.jumlah;

console.log("💰 Kalkulasi Harga:");
console.log("   - Harga Kertas per Lembar:", hargaKertasPerLembar);
console.log("   - Jumlah Halaman:", jumlahHalaman);
console.log("   - Harga Cover:", hargaCoverPerUnit);
console.log("   - Biaya Jilid:", biayaJilid);
console.log("   - Biaya Laminating:", biayaLaminating);
console.log("   - Harga Base:", hargaSatuanBase);
console.log("   - Diskon:", diskonPersen, "%");
console.log("   - Harga Satuan:", hargaSatuan);
console.log("   - Total Harga:", totalHarga);
```

**Step 4: Create Pesanan Record**

```typescript
// 7. Buat pesanan di database
const pesanan = await this.prisma.pesananCetak.create({
  data: {
    idNaskah: dto.idNaskah,
    idPemesan,
    idPercetakan: dto.idPercetakan,
    jumlah: dto.jumlah,
    formatBuku: dto.formatKertas as any,
    jenisKertas: dto.jenisKertas as any,
    jenisCover: dto.jenisCover as any,
    laminating: dto.laminating,
    hargaSatuan: new Decimal(hargaSatuan),
    totalHarga: new Decimal(totalHarga),
    status: "tertunda",
    alamatPengiriman: dto.alamatPengiriman,
    catatanKhusus: dto.catatanKhusus || null,
  },
  include: {
    naskah: {
      select: {
        judul: true,
      },
    },
    pemesan: {
      select: {
        email: true,
        profilPengguna: {
          select: {
            namaDepan: true,
            namaBelakang: true,
          },
        },
      },
    },
    percetakan: {
      select: {
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
  },
});

console.log("✅ Pesanan berhasil dibuat dengan ID:", pesanan.id);
```

**Step 5: Send Notifications**

```typescript
  // 8. Kirim notifikasi ke percetakan
  await this.notifikasiService.buatNotifikasi({
    idPengguna: dto.idPercetakan,
    judul: 'Pesanan Baru Masuk',
    isi: `Anda menerima pesanan baru untuk naskah "${naskah.judul}" sebanyak ${dto.jumlah} eksemplar.`,
    tipe: 'info',
    link: `/percetakan/pesanan/${pesanan.id}`,
  });

  // Send WebSocket notification untuk real-time update
  this.notifikasiGateway.kirimNotifikasiKePengguna(
    dto.idPercetakan,
    {
      judul: 'Pesanan Baru Masuk',
      isi: `Pesanan baru untuk "${naskah.judul}"`,
      tipe: 'info',
    }
  );

  // Send email notification
  await this.emailService.kirimEmailPesananBaru(
    percetakan.email,
    {
      namaPenulis: `${pesanan.pemesan.profilPengguna?.namaDepan || ''} ${pesanan.pemesan.profilPengguna?.namaBelakang || ''}`.trim(),
      judulNaskah: naskah.judul,
      jumlah: dto.jumlah,
      totalHarga: totalHarga,
      nomorPesanan: pesanan.nomorPesanan,
      linkPesanan: `${process.env.FRONTEND_URL}/percetakan/pesanan/${pesanan.id}`,
    }
  );

  console.log('📧 Notifikasi terkirim ke percetakan');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  return {
    sukses: true,
    pesan: 'Pesanan berhasil dibuat',
    data: pesanan,
  };
}
```

Method ini demonstrate comprehensive business logic implementation dengan proper validation, calculation, transaction creation, dan notification sending.

#### D.4.4 Method: konfirmasiPesanan() - Percetakan Accept/Reject

```typescript
async konfirmasiPesanan(
  idPesanan: string,
  idPercetakan: string,
  dto: KonfirmasiPesananDto
) {
  console.log('\n✅ [PERCETAKAN] Konfirmasi Pesanan');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // 1. Ambil pesanan dengan validasi
  const pesanan = await this.prisma.pesananCetak.findUnique({
    where: { id: idPesanan },
    include: {
      naskah: {
        select: {
          judul: true,
          idPenulis: true,
        },
      },
      pemesan: {
        select: {
          email: true,
          profilPengguna: true,
        },
      },
    },
  });

  if (!pesanan) {
    throw new NotFoundException('Pesanan tidak ditemukan');
  }

  // 2. Validasi hanya percetakan yang ditugaskan yang bisa confirm
  if (pesanan.idPercetakan !== idPercetakan) {
    throw new ForbiddenException('Anda tidak memiliki akses ke pesanan ini');
  }

  // 3. Validasi status harus "tertunda"
  if (pesanan.status !== 'tertunda') {
    throw new BadRequestException(
      `Hanya pesanan dengan status "tertunda" yang dapat dikonfirmasi. Status saat ini: ${pesanan.status}`
    );
  }

  // 4. Update status berdasarkan keputusan
  const statusBaru = dto.diterima ? 'diterima' : 'ditolak';
  const alasanDitolak = dto.diterima ? null : dto.alasanPenolakan;

  const pesananUpdated = await this.prisma.pesananCetak.update({
    where: { id: idPesanan },
    data: {
      status: statusBaru,
      alasanDitolak: alasanDitolak,
    },
    include: {
      naskah: true,
      pemesan: true,
      percetakan: true,
    },
  });

  console.log(`✅ Pesanan ${dto.diterima ? 'diterima' : 'ditolak'}`);

  // 5. Send notifikasi ke penulis
  const pesanNotifikasi = dto.diterima
    ? `Pesanan Anda untuk naskah "${pesanan.naskah.judul}" telah diterima oleh percetakan dan akan segera diproses.`
    : `Pesanan Anda untuk naskah "${pesanan.naskah.judul}" ditolak. Alasan: ${alasanDitolak}`;

  await this.notifikasiService.buatNotifikasi({
    idPengguna: pesanan.idPemesan,
    judul: dto.diterima ? 'Pesanan Diterima' : 'Pesanan Ditolak',
    isi: pesanNotifikasi,
    tipe: dto.diterima ? 'sukses' : 'peringatan',
    link: `/penulis/pesanan-cetak/${pesanan.id}`,
  });

  // WebSocket notification
  this.notifikasiGateway.kirimNotifikasiKePengguna(
    pesanan.idPemesan,
    {
      judul: dto.diterima ? 'Pesanan Diterima' : 'Pesanan Ditolak',
      isi: pesanNotifikasi,
      tipe: dto.diterima ? 'sukses' : 'peringatan',
    }
  );

  // Email notification
  await this.emailService.kirimEmailKonfirmasiPesanan(
    pesanan.pemesan.email,
    {
      namaPenulis: `${pesananUpdated.pemesan.profilPengguna?.namaDepan || ''} ${pesananUpdated.pemesan.profilPengguna?.namaBelakang || ''}`.trim(),
      judulNaskah: pesanan.naskah.judul,
      nomorPesanan: pesanan.nomorPesanan,
      diterima: dto.diterima,
      alasanPenolakan: alasanDitolak || undefined,
      linkPesanan: `${process.env.FRONTEND_URL}/penulis/pesanan-cetak/${pesanan.id}`,
    }
  );

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  return {
    sukses: true,
    pesan: `Pesanan berhasil ${dto.diterima ? 'diterima' : 'ditolak'}`,
    data: pesananUpdated,
  };
}
```

#### D.4.5 Methods Lainnya

Kami implement additional service methods untuk complete functionality:

- `ambilPesananPercetakan()`: Get list pesanan untuk percetakan dengan filters
- `ambilDetailPesanan()`: Get detail lengkap satu pesanan
- `updateStatusPesanan()`: Update status pesanan ke tahap berikutnya
- `tambahLogProduksi()`: Add production log entry
- `buatPengiriman()`: Create shipment record
- `konfirmasiPenerimaan()`: Penulis confirm delivery
- `ambilStatistikPercetakan()`: Get business metrics untuk dashboard
- `buatTarif()`: Create pricing parameters
- `perbaruiTarif()`: Update pricing parameters
- `aktifkanTarif()`: Activate pricing scheme

**Total Lines**: Service file approximately 1,962 lines dengan comprehensive documentation.

---

**[REFERENSI FILE CODINGAN]**

Untuk implementasi backend lengkap, silakan lihat file-file berikut:

- Service Implementation: `backend/src/modules/percetakan/percetakan.service.ts` (1,962 lines)
- Controller Implementation: `backend/src/modules/percetakan/percetakan.controller.ts` (733 lines)
- DTOs: `backend/src/modules/percetakan/dto/` (14 files)
- Module Setup: `backend/src/modules/percetakan/percetakan.module.ts`
- Prisma Schema: `backend/prisma/schema.prisma` (lines 408-536)

---

**[TEMPAT UNTUK SCREENSHOT]**

Berikut adalah lokasi untuk screenshot implementasi backend:

1. **Screenshot Prisma Studio**: Menunjukkan tables yang created dengan sample data
2. **Screenshot Service Method Flow**: Diagram menunjukkan flow dari buatPesanan method
3. **Screenshot API Testing**: Postman/Insomnia screenshots testing endpoints
4. **Screenshot Console Logs**: Output logs dari service methods yang menunjukkan execution flow
5. **Screenshot Database Relations**: Visual dari foreign key relations di database tool
