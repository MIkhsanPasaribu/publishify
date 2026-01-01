# LAPORAN DEVELOPMENT FASE 3

## SISTEM REVIEW DAN EDITOR PUBLISHIFY

**Bagian 3 dari 5: Implementasi Backend**

---

## D. IMPLEMENTASI BACKEND (STEP BY STEP)

### D.1 Persiapan Module Review

Langkah pertama dalam implementasi backend adalah mempersiapkan struktur module untuk sistem review. Kami menggunakan arsitektur modular NestJS yang memisahkan concerns dengan jelas antara controller, service, dan data transfer objects.

#### D.1.1 Membuat Struktur Folder Module

Kami mulai dengan membuat struktur folder di dalam direktori modules. Buka terminal dan pastikan berada di direktori `backend/src/modules/`, kemudian jalankan perintah untuk membuat folder review beserta subfoldernya:

```bash
mkdir review
cd review
mkdir dto guards interfaces
```

Struktur folder yang terbentuk akan seperti ini:

```
backend/src/modules/review/
├── dto/
│   ├── index.ts
│   ├── tugaskan-review.dto.ts
│   ├── tambah-feedback.dto.ts
│   ├── submit-review.dto.ts
│   └── filter-review.dto.ts
├── guards/
│   └── review-ownership.guard.ts
├── interfaces/
│   └── review.interface.ts
├── review.module.ts
├── review.controller.ts
└── review.service.ts
```

Lokasi file lengkap: `backend/src/modules/review/` dengan semua subfolder dan file yang diperlukan.

#### D.1.2 Definisi Data Transfer Objects (DTOs)

Data Transfer Objects berfungsi sebagai contract untuk data yang dikirim dan diterima oleh API endpoints. Kami menggunakan class-validator untuk runtime validation dan decorators dari NestJS untuk dokumentasi Swagger.

**File pertama: TugaskanReviewDto**

Buat file `dto/tugaskan-review.dto.ts` yang akan menerima data untuk assignment review dari admin ke editor. DTO ini harus memvalidasi bahwa id naskah dan id editor adalah UUID yang valid, serta catatan bersifat opsional.

```typescript
// Lokasi: backend/src/modules/review/dto/tugaskan-review.dto.ts
import { IsUUID, IsString, IsOptional, MaxLength } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class TugaskanReviewDto {
  @ApiProperty({
    description: "ID naskah yang akan direview",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsUUID("4", { message: "ID naskah harus berupa UUID yang valid" })
  idNaskah: string;

  @ApiProperty({
    description: "ID editor yang ditugaskan",
    example: "123e4567-e89b-12d3-a456-426614174001",
  })
  @IsUUID("4", { message: "ID editor harus berupa UUID yang valid" })
  idEditor: string;

  @ApiPropertyOptional({
    description: "Catatan tambahan untuk editor",
    example: "Prioritas tinggi, perlu review dalam 3 hari",
  })
  @IsOptional()
  @IsString({ message: "Catatan harus berupa text" })
  @MaxLength(1000, { message: "Catatan maksimal 1000 karakter" })
  catatan?: string;
}
```

Penjelasan kode: Decorator IsUUID memvalidasi format UUID versi empat, ApiProperty menambahkan dokumentasi untuk Swagger, MaxLength membatasi panjang catatan untuk prevent abuse, dan semua error messages dalam bahasa Indonesia untuk consistency.

**File kedua: TambahFeedbackDto**

Buat file `dto/tambah-feedback.dto.ts` untuk menerima data feedback yang diberikan editor. Feedback terdiri dari aspek yang dinilai, rating numerik, dan komentar detail.

```typescript
// Lokasi: backend/src/modules/review/dto/tambah-feedback.dto.ts
import {
  IsString,
  IsInt,
  Min,
  Max,
  MinLength,
  MaxLength,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class TambahFeedbackDto {
  @ApiProperty({
    description: "Aspek yang dinilai (misal: Plot, Karakter, Gaya Bahasa)",
    example: "Pengembangan Karakter",
  })
  @IsString({ message: "Aspek harus berupa text" })
  @MinLength(3, { message: "Aspek minimal 3 karakter" })
  @MaxLength(100, { message: "Aspek maksimal 100 karakter" })
  aspek: string;

  @ApiProperty({
    description: "Rating dari 1-5",
    example: 4,
    minimum: 1,
    maximum: 5,
  })
  @IsInt({ message: "Rating harus berupa angka bulat" })
  @Min(1, { message: "Rating minimal 1" })
  @Max(5, { message: "Rating maksimal 5" })
  rating: number;

  @ApiProperty({
    description: "Komentar detail untuk aspek ini",
    example:
      "Pengembangan karakter cukup baik namun beberapa karakter pendukung kurang depth",
  })
  @IsString({ message: "Komentar harus berupa text" })
  @MinLength(10, { message: "Komentar minimal 10 karakter" })
  @MaxLength(2000, { message: "Komentar maksimal 2000 karakter" })
  komentar: string;
}
```

Penjelasan kode: Validator IsInt dan Min/Max ensure rating is valid integer between satu dan lima, MinLength pada komentar encourage editor untuk give meaningful feedback, semua constraints di-tune berdasarkan business requirements dari analysis phase.

**File ketiga: SubmitReviewDto**

Buat file `dto/submit-review.dto.ts` untuk final submission dari editor yang berisi rekomendasi dan catatan umum.

```typescript
// Lokasi: backend/src/modules/review/dto/submit-review.dto.ts
import { IsEnum, IsString, MinLength, MaxLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Rekomendasi } from "@prisma/client";

export class SubmitReviewDto {
  @ApiProperty({
    description: "Rekomendasi editor",
    enum: Rekomendasi,
    example: Rekomendasi.revisi,
  })
  @IsEnum(Rekomendasi, {
    message: "Rekomendasi harus berupa: setujui, revisi, atau tolak",
  })
  rekomendasi: Rekomendasi;

  @ApiProperty({
    description: "Catatan umum dan kesimpulan review",
    example:
      "Naskah memiliki potensi bagus namun perlu perbaikan di beberapa aspek...",
  })
  @IsString({ message: "Catatan umum harus berupa text" })
  @MinLength(50, { message: "Catatan umum minimal 50 karakter" })
  @MaxLength(5000, { message: "Catatan umum maksimal 5000 karakter" })
  catatanUmum: string;
}
```

Penjelasan kode: Enum Rekomendasi imported dari Prisma client ensure type safety, MinLength lima puluh karakter ensure editor provide substantial reasoning untuk recommendation, semua validation rules align dengan business rules yang didefinisikan di analysis phase.

**File keempat: Export index**

Buat file `dto/index.ts` untuk export semua DTOs dari single location untuk cleaner imports:

```typescript
// Lokasi: backend/src/modules/review/dto/index.ts
export * from "./tugaskan-review.dto";
export * from "./tambah-feedback.dto";
export * from "./submit-review.dto";
export * from "./filter-review.dto";
export * from "./perbarui-review.dto";
```

#### D.1.3 Setup Module Configuration

Buat file `review.module.ts` yang mendefinisikan dependencies dan exports dari review module. Module ini akan diimport di app module nanti.

```typescript
// Lokasi: backend/src/modules/review/review.module.ts
import { Module } from "@nestjs/common";
import { ReviewController } from "./review.controller";
import { ReviewService } from "./review.service";
import { PrismaModule } from "@/prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [ReviewController],
  providers: [ReviewService],
  exports: [ReviewService],
})
export class ReviewModule {}
```

Penjelasan kode: Import PrismaModule untuk database access, register controller dan service, export service untuk potential use di modules lain, decorator Module from NestJS core.

Kemudian register module ini di `app.module.ts`:

```typescript
// Lokasi: backend/src/app.module.ts (tambahkan di imports array)
import { ReviewModule } from "./modules/review/review.module";

@Module({
  imports: [
    // ... existing imports
    ReviewModule,
  ],
})
export class AppModule {}
```

---

### D.2 Implementasi Review Service Layer

Service layer berisi business logic dan data access logic. Semua validasi business rules, database transactions, dan complex operations diimplementasikan di layer ini.

#### D.2.1 Method Tugaskan Review (Admin Assignment)

Method pertama yang kami implementasikan adalah tugaskanReview yang digunakan oleh admin untuk assign review ke editor. Method ini melakukan multiple validations dan menggunakan transaction untuk ensure atomicity.

Buat file `review.service.ts` dan mulai dengan implementasi method tugaskanReview:

```typescript
// Lokasi: backend/src/modules/review/review.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { TugaskanReviewDto } from "./dto";
import { StatusReview, StatusNaskah } from "@prisma/client";

@Injectable()
export class ReviewService {
  constructor(private readonly prisma: PrismaService) {}

  async tugaskanReview(dto: TugaskanReviewDto, idPenugasAdmin: string) {
    // Langkah 1: Validasi naskah exists dan status correct
    const naskah = await this.prisma.naskah.findUnique({
      where: { id: dto.idNaskah },
      select: {
        id: true,
        judul: true,
        status: true,
        idPenulis: true,
      },
    });

    if (!naskah) {
      throw new NotFoundException("Naskah tidak ditemukan");
    }

    if (naskah.status !== StatusNaskah.diajukan) {
      throw new BadRequestException(
        "Naskah hanya bisa direview jika statusnya diajukan"
      );
    }

    // Langkah 2: Validasi editor exists dan has editor role
    const editor = await this.prisma.pengguna.findUnique({
      where: { id: dto.idEditor },
      include: {
        peranPengguna: {
          where: {
            jenisPeran: "editor",
            aktif: true,
          },
        },
      },
    });

    if (!editor || editor.peranPengguna.length === 0) {
      throw new BadRequestException(
        "Editor tidak ditemukan atau tidak memiliki role editor"
      );
    }

    // Langkah 3: Check existing active review
    const existingReview = await this.prisma.reviewNaskah.findFirst({
      where: {
        idNaskah: dto.idNaskah,
        status: {
          in: [StatusReview.ditugaskan, StatusReview.dalam_proses],
        },
      },
    });

    if (existingReview) {
      throw new ConflictException(
        "Naskah ini sudah memiliki review yang sedang berjalan"
      );
    }

    // Langkah 4: Create review dengan transaction
    const review = await this.prisma.$transaction(async (prisma) => {
      const newReview = await prisma.reviewNaskah.create({
        data: {
          idNaskah: dto.idNaskah,
          idEditor: dto.idEditor,
          status: StatusReview.ditugaskan,
          catatan: dto.catatan,
        },
        include: {
          naskah: {
            select: {
              id: true,
              judul: true,
              status: true,
            },
          },
          editor: {
            select: {
              id: true,
              email: true,
              profilPengguna: true,
            },
          },
        },
      });

      // Update naskah status
      await prisma.naskah.update({
        where: { id: dto.idNaskah },
        data: {
          status: StatusNaskah.dalam_review,
        },
      });

      return newReview;
    });

    // Langkah 5: Log activity untuk audit trail
    await this.prisma.logAktivitas.create({
      data: {
        idPengguna: idPenugasAdmin,
        jenis: "tugaskan_review",
        aksi: "Tugaskan Review",
        entitas: "ReviewNaskah",
        idEntitas: review.id,
        deskripsi: `Review naskah "${naskah.judul}" ditugaskan ke editor ${editor.email}`,
      },
    });

    return {
      sukses: true,
      pesan: "Review berhasil ditugaskan ke editor",
      data: review,
    };
  }
}
```

Penjelasan step by step:

- **Langkah satu**: Query naskah untuk validate existence dan check status. Menggunakan select untuk optimize query dengan only fetch needed fields.
- **Langkah dua**: Query editor dengan include peran untuk validate user has active editor role. Nested where clause filter only active editor roles.
- **Langkah tiga**: Check conflict dengan query existing reviews yang still active. Using status in array untuk check multiple statuses efficiently.
- **Langkah empat**: Wrap create review dan update naskah dalam transaction untuk ensure atomicity. Jika salah satu operation fails, semua rolled back.
- **Langkah lima**: Create activity log untuk audit purposes. Ini dilakukan di luar transaction karena failure di logging tidak should rollback main operation.

Lokasi file lengkap: `backend/src/modules/review/review.service.ts` baris satu hingga seratus tiga puluh.

#### D.2.2 Method Mulai Review (Editor Start)

Method kedua adalah mulaiReview yang dipanggil ketika editor siap mulai mengerjakan review yang assigned ke mereka. Method ini update status review dari ditugaskan ke dalam proses.

Tambahkan method ini di review service:

```typescript
// Lokasi: backend/src/modules/review/review.service.ts (lanjutan)
async mulaiReview(idReview: string, idEditor: string) {
  // Langkah 1: Find review dan validate
  const review = await this.prisma.reviewNaskah.findUnique({
    where: { id: idReview },
    include: {
      naskah: {
        select: {
          id: true,
          judul: true,
        },
      },
    },
  });

  if (!review) {
    throw new NotFoundException('Review tidak ditemukan');
  }

  // Langkah 2: Validate ownership
  if (review.idEditor !== idEditor) {
    throw new ForbiddenException(
      'Anda tidak memiliki akses untuk review ini'
    );
  }

  // Langkah 3: Validate status
  if (review.status !== StatusReview.ditugaskan) {
    throw new BadRequestException(
      'Review hanya bisa dimulai jika statusnya ditugaskan'
    );
  }

  // Langkah 4: Update status
  const updatedReview = await this.prisma.reviewNaskah.update({
    where: { id: idReview },
    data: {
      status: StatusReview.dalam_proses,
    },
    include: {
      naskah: true,
      editor: {
        select: {
          id: true,
          email: true,
          profilPengguna: true,
        },
      },
    },
  });

  // Langkah 5: Log activity
  await this.prisma.logAktivitas.create({
    data: {
      idPengguna: idEditor,
      jenis: 'mulai_review',
      aksi: 'Mulai Review',
      entitas: 'ReviewNaskah',
      idEntitas: idReview,
      deskripsi: `Editor mulai review untuk naskah "${review.naskah.judul}"`,
    },
  });

  return {
    sukses: true,
    pesan: 'Review berhasil dimulai',
    data: updatedReview,
  };
}
```

Penjelasan step by step:

- **Langkah satu**: Query review dengan include naskah untuk get context information.
- **Langkah dua**: Validate bahwa authenticated user adalah editor yang assigned. Ini additional security layer beyond guards.
- **Langkah tiga**: Validate current status adalah ditugaskan untuk enforce valid state transitions.
- **Langkah empat**: Update status to dalam proses dengan include untuk return complete data.
- **Langkah lima**: Log activity with context information untuk audit trail.

#### D.2.3 Method Tambah Feedback (Editor Feedback)

Method ketiga adalah tambahFeedback yang digunakan editor untuk menambahkan feedback items. Editor bisa menambahkan multiple feedback untuk berbagai aspek penilaian.

Tambahkan method ini:

```typescript
// Lokasi: backend/src/modules/review/review.service.ts (lanjutan)
async tambahFeedback(idReview: string, dto: TambahFeedbackDto, idEditor: string) {
  // Langkah 1: Validate review exists dan ownership
  const review = await this.prisma.reviewNaskah.findUnique({
    where: { id: idReview },
  });

  if (!review) {
    throw new NotFoundException('Review tidak ditemukan');
  }

  if (review.idEditor !== idEditor) {
    throw new ForbiddenException(
      'Anda tidak memiliki akses untuk review ini'
    );
  }

  // Langkah 2: Validate review status
  if (review.status !== StatusReview.dalam_proses) {
    throw new BadRequestException(
      'Feedback hanya bisa ditambahkan saat review dalam proses'
    );
  }

  // Langkah 3: Create feedback
  const feedback = await this.prisma.feedbackReview.create({
    data: {
      idReview: idReview,
      aspek: dto.aspek,
      rating: dto.rating,
      komentar: dto.komentar,
    },
  });

  return {
    sukses: true,
    pesan: 'Feedback berhasil ditambahkan',
    data: feedback,
  };
}
```

Penjelasan: Method ini lebih simple karena hanya create single record. Validasi fokus pada ownership dan status. Tidak perlu transaction karena hanya single operation.

#### D.2.4 Method Submit Review (Editor Final Submission)

Method keempat adalah submitReview yang dipanggil ketika editor selesai dan ready to submit final recommendation. Method ini validate bahwa sufficient feedback sudah diberikan.

Tambahkan method ini:

```typescript
// Lokasi: backend/src/modules/review/review.service.ts (lanjutan)
async submitReview(idReview: string, dto: SubmitReviewDto, idEditor: string) {
  // Langkah 1: Validate review
  const review = await this.prisma.reviewNaskah.findUnique({
    where: { id: idReview },
    include: {
      feedback: true,
      naskah: {
        select: {
          id: true,
          judul: true,
        },
      },
    },
  });

  if (!review) {
    throw new NotFoundException('Review tidak ditemukan');
  }

  if (review.idEditor !== idEditor) {
    throw new ForbiddenException(
      'Anda tidak memiliki akses untuk review ini'
    );
  }

  if (review.status !== StatusReview.dalam_proses) {
    throw new BadRequestException(
      'Review hanya bisa disubmit jika statusnya dalam proses'
    );
  }

  // Langkah 2: Validate minimum feedback
  if (review.feedback.length < 3) {
    throw new BadRequestException(
      'Minimal 3 feedback diperlukan sebelum submit review'
    );
  }

  // Langkah 3: Update review dengan final recommendation
  const updatedReview = await this.prisma.reviewNaskah.update({
    where: { id: idReview },
    data: {
      status: StatusReview.selesai,
      rekomendasi: dto.rekomendasi,
      catatanRekomendasi: dto.catatanUmum,
      diselesaikanPada: new Date(),
    },
    include: {
      feedback: true,
      naskah: true,
      editor: {
        select: {
          id: true,
          email: true,
          profilPengguna: true,
        },
      },
    },
  });

  // Langkah 4: Create notification untuk admin
  await this.prisma.notifikasi.create({
    data: {
      judulNotifikasi: 'Review Selesai',
      isiNotifikasi: `Editor telah menyelesaikan review untuk naskah "${review.naskah.judul}"`,
      tipeNotifikasi: 'info',
      // idPenerima akan diset ke admin via RLS atau query admin users
    },
  });

  return {
    sukses: true,
    pesan: 'Review berhasil disubmit',
    data: updatedReview,
  };
}
```

Penjelasan: Method ini enforce business rule bahwa minimum tiga feedback items required. Timestamp diselesaikanPada di-set untuk tracking completion time. Notification created untuk inform admin.

#### D.2.5 Method Keputusan Admin (Admin Decision)

Method kelima dan terakhir adalah adminKeputusan yang digunakan admin untuk membuat final decision berdasarkan recommendation dari editor. Method ini update naskah status accordingly.

```typescript
// Lokasi: backend/src/modules/review/review.service.ts (lanjutan)
async adminKeputusan(
  idReview: string,
  keputusan: 'setujui' | 'revisi' | 'tolak',
  catatan: string,
  idAdmin: string,
) {
  // Langkah 1: Validate review
  const review = await this.prisma.reviewNaskah.findUnique({
    where: { id: idReview },
    include: {
      naskah: {
        select: {
          id: true,
          judul: true,
          idPenulis: true,
        },
      },
      feedback: true,
    },
  });

  if (!review) {
    throw new NotFoundException('Review tidak ditemukan');
  }

  if (review.status !== StatusReview.selesai) {
    throw new BadRequestException(
      'Keputusan hanya bisa dibuat untuk review yang sudah selesai'
    );
  }

  // Langkah 2: Map keputusan to naskah status
  let statusNaskahBaru: StatusNaskah;
  switch (keputusan) {
    case 'setujui':
      statusNaskahBaru = StatusNaskah.disetujui;
      break;
    case 'revisi':
      statusNaskahBaru = StatusNaskah.perlu_revisi;
      break;
    case 'tolak':
      statusNaskahBaru = StatusNaskah.ditolak;
      break;
  }

  // Langkah 3: Update dengan transaction
  const result = await this.prisma.$transaction(async (prisma) => {
    // Update naskah status
    const naskahUpdated = await prisma.naskah.update({
      where: { id: review.naskah.id },
      data: {
        status: statusNaskahBaru,
      },
    });

    // Log admin decision di review
    await prisma.reviewNaskah.update({
      where: { id: idReview },
      data: {
        catatan: catatan,
      },
    });

    return { review, naskah: naskahUpdated };
  });

  // Langkah 4: Create notification untuk penulis
  const pesanNotifikasi =
    keputusan === 'setujui'
      ? `Naskah "${review.naskah.judul}" Anda telah disetujui untuk diterbitkan`
      : keputusan === 'revisi'
      ? `Naskah "${review.naskah.judul}" Anda memerlukan revisi`
      : `Naskah "${review.naskah.judul}" Anda ditolak`;

  await this.prisma.notifikasi.create({
    data: {
      idPenerima: review.naskah.idPenulis,
      judulNotifikasi: 'Status Review Naskah',
      isiNotifikasi: pesanNotifikasi,
      tipeNotifikasi: keputusan === 'setujui' ? 'sukses' : 'info',
    },
  });

  return {
    sukses: true,
    pesan: 'Keputusan berhasil disimpan',
    data: result,
  };
}
```

Penjelasan: Method ini map admin decision to appropriate naskah status. Transaction ensure naskah update dan review log happen atomically. Notification sent to penulis dengan appropriate message based on decision.

Lokasi file lengkap service: `backend/src/modules/review/review.service.ts` dengan total sekitar tujuh ratus empat puluh baris code.

---

### D.3 Implementasi Review Controller Layer

Controller layer adalah entry point dari HTTP requests. Controller bertanggung jawab untuk routing, request validation, authentication/authorization guards, dan response formatting.

#### D.3.1 Setup Controller dengan Decorators

Buat file `review.controller.ts` dengan basic structure dan global decorators:

```typescript
// Lokasi: backend/src/modules/review/review.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from "@nestjs/swagger";
import { ReviewService } from "./review.service";
import { JwtAuthGuard } from "@/modules/auth/guards/jwt-auth.guard";
import { PeranGuard } from "@/modules/auth/guards/roles.guard";
import { Peran } from "@/modules/auth/decorators/peran.decorator";
import { PenggunaSaatIni } from "@/modules/auth/decorators/pengguna-saat-ini.decorator";

@ApiTags("review")
@ApiBearerAuth()
@Controller("review")
@UseGuards(JwtAuthGuard, PeranGuard)
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  // Endpoints akan ditambahkan di sini
}
```

Penjelasan decorators:

- **ApiTags**: Grouping endpoints di Swagger documentation
- **ApiBearerAuth**: Indicate endpoints require JWT token
- **Controller**: Define base route path slash review
- **UseGuards**: Apply authentication dan authorization guards globally to all endpoints

#### D.3.2 Endpoint POST /review/tugaskan

Tambahkan endpoint pertama untuk admin assign review:

```typescript
// Lokasi: backend/src/modules/review/review.controller.ts (lanjutan)
@Post('tugaskan')
@Peran('admin')
@HttpCode(HttpStatus.CREATED)
@ApiOperation({
  summary: 'Tugaskan review naskah ke editor',
  description: 'Admin menugaskan review naskah kepada editor yang dipilih',
})
@ApiResponse({
  status: 201,
  description: 'Review berhasil ditugaskan',
})
@ApiResponse({
  status: 400,
  description: 'Validasi gagal atau naskah tidak dalam status yang valid',
})
async tugaskanReview(
  @Body() dto: TugaskanReviewDto,
  @PenggunaSaatIni('id') idAdmin: string,
) {
  return this.reviewService.tugaskanReview(dto, idAdmin);
}
```

Penjelasan: Decorator Peran restrict access to admin only. HttpCode set explicit status dua ratus satu for creation. Body decorator extract dan validate DTO. PenggunaSaatIni custom decorator extract user id from JWT token.

#### D.3.3 Endpoint PUT /review/:id/mulai

Tambahkan endpoint untuk editor mulai review:

```typescript
// Lokasi: backend/src/modules/review/review.controller.ts (lanjutan)
@Put(':id/mulai')
@Peran('editor')
@ApiOperation({
  summary: 'Mulai mengerjakan review',
  description: 'Editor memulai proses review untuk naskah yang ditugaskan',
})
async mulaiReview(
  @Param('id') idReview: string,
  @PenggunaSaatIni('id') idEditor: string,
) {
  return this.reviewService.mulaiReview(idReview, idEditor);
}
```

Penjelasan: Param decorator extract id from URL path. Peran restrict to editor only. Method call service dengan extracted parameters.

#### D.3.4 Endpoint POST /review/:id/feedback

Tambahkan endpoint untuk tambah feedback:

```typescript
// Lokasi: backend/src/modules/review/review.controller.ts (lanjutan)
@Post(':id/feedback')
@Peran('editor')
@HttpCode(HttpStatus.CREATED)
@ApiOperation({
  summary: 'Tambah feedback untuk review',
  description: 'Editor menambahkan penilaian untuk aspek tertentu dari naskah',
})
async tambahFeedback(
  @Param('id') idReview: string,
  @Body() dto: TambahFeedbackDto,
  @PenggunaSaatIni('id') idEditor: string,
) {
  return this.reviewService.tambahFeedback(idReview, dto, idEditor);
}
```

#### D.3.5 Endpoint POST /review/:id/submit

Tambahkan endpoint untuk submit final review:

```typescript
// Lokasi: backend/src/modules/review/review.controller.ts (lanjutan)
@Post(':id/submit')
@Peran('editor')
@ApiOperation({
  summary: 'Submit review final',
  description: 'Editor menyerahkan hasil review dengan rekomendasi',
})
async submitReview(
  @Param('id') idReview: string,
  @Body() dto: SubmitReviewDto,
  @PenggunaSaatIni('id') idEditor: string,
) {
  return this.reviewService.submitReview(idReview, dto, idEditor);
}
```

#### D.3.6 Endpoint POST /review/:id/keputusan

Tambahkan endpoint terakhir untuk admin decision:

```typescript
// Lokasi: backend/src/modules/review/review.controller.ts (lanjutan)
@Post(':id/keputusan')
@Peran('admin')
@ApiOperation({
  summary: 'Keputusan admin terhadap review',
  description: 'Admin membuat keputusan final: setujui, revisi, atau tolak',
})
async keputusanAdmin(
  @Param('id') idReview: string,
  @Body() body: { keputusan: 'setujui' | 'revisi' | 'tolak'; catatan: string },
  @PenggunaSaatIni('id') idAdmin: string,
) {
  return this.reviewService.adminKeputusan(
    idReview,
    body.keputusan,
    body.catatan,
    idAdmin,
  );
}
```

Lokasi file lengkap controller: `backend/src/modules/review/review.controller.ts` dengan total sekitar tiga ratus lima puluh sembilan baris code.

---

### D.4 Testing dan Debugging Backend

Setelah implementasi selesai, langkah penting adalah testing untuk ensure semua endpoints berfungsi correctly.

#### D.4.1 Manual Testing dengan Thunder Client / Postman

Langkah pertama adalah manual testing menggunakan HTTP client. Berikut flow testing yang kami lakukan:

**Test satu: Login sebagai Admin**

```
POST http://localhost:3000/auth/login
Body: {
  "email": "admin@publishify.com",
  "kataSandi": "password123"
}
```

Copy access token dari response untuk digunakan di request selanjutnya.

**Test dua: Assign Review**

```
POST http://localhost:3000/review/tugaskan
Headers: {
  "Authorization": "Bearer <access_token>"
}
Body: {
  "idNaskah": "<uuid_naskah_diajukan>",
  "idEditor": "<uuid_editor>",
  "catatan": "Prioritas tinggi"
}
```

Expected response: status dua ratus satu dengan data review baru.

**Test tiga: Login sebagai Editor**
Ulangi login dengan credentials editor untuk get editor token.

**Test empat: Mulai Review**

```
PUT http://localhost:3000/review/<id_review>/mulai
Headers: {
  "Authorization": "Bearer <editor_token>"
}
```

Expected response: status dua ratus dengan review status updated ke dalam proses.

**Test lima: Tambah Feedback**

```
POST http://localhost:3000/review/<id_review>/feedback
Headers: {
  "Authorization": "Bearer <editor_token>"
}
Body: {
  "aspek": "Pengembangan Karakter",
  "rating": 4,
  "komentar": "Karakter utama well developed..."
}
```

Repeat minimal tiga kali untuk different aspects.

**Test enam: Submit Review**

```
POST http://localhost:3000/review/<id_review>/submit
Headers: {
  "Authorization": "Bearer <editor_token>"
}
Body: {
  "rekomendasi": "revisi",
  "catatanUmum": "Naskah memiliki potensi..."
}
```

**Test tujuh: Admin Decision**

```
POST http://localhost:3000/review/<id_review>/keputusan
Headers: {
  "Authorization": "Bearer <admin_token>"
}
Body: {
  "keputusan": "revisi",
  "catatan": "Setuju dengan rekomendasi editor"
}
```

Dokumentasi testing lengkap: `backend/test/e2e/review.e2e-spec.ts` dengan automated test cases.

#### D.4.2 Validasi Database State

Setelah testing, validasi bahwa database state correct menggunakan query SQL atau Prisma Studio:

```sql
-- Check review records
SELECT * FROM review_naskah WHERE id = '<review_id>';

-- Check feedback items
SELECT * FROM feedback_review WHERE id_review = '<review_id>';

-- Check naskah status updated
SELECT status FROM naskah WHERE id = '<naskah_id>';

-- Check activity logs created
SELECT * FROM log_aktivitas WHERE id_entitas = '<review_id>';
```

Lokasi Prisma Studio: Jalankan `bun prisma studio` untuk GUI interface.

---

### Navigasi Dokumen

- **[← Kembali ke PART 2: Perancangan Sistem](./LAPORAN-DEVELOPMENT-FASE-3-PART-2-PERANCANGAN-SISTEM.md)**
- **[Lanjut ke PART 4: Implementasi Frontend →](./LAPORAN-DEVELOPMENT-FASE-3-PART-4-IMPLEMENTASI-FRONTEND.md)**
- **[Ke INDEX](./LAPORAN-DEVELOPMENT-FASE-3-INDEX.md)**

---

**Catatan**: Dokumen ini adalah bagian dari seri Laporan Development Fase 3 yang terdiri dari 5 bagian. Untuk pemahaman lengkap tentang implementasi, disarankan membaca semua bagian secara berurutan. Kode lengkap tersedia di repository pada path yang disebutkan di setiap section.
