# 📁 FASE 3: REVIEW WORKFLOW & EDITOR SYSTEM

**Periode**: Minggu 5-6  
**Focus**: Membangun sistem review editorial lengkap dengan assignment, feedback, dan decision workflow  
**Output**: Editor dashboard functional, Review assignment system, Feedback mechanism, Admin approval workflow

---

## 📋 LAPORAN PROGRESS FASE 3

### **File**: `LAPORAN-PROGRESS-FASE-3-REVIEW-SYSTEM.md`

#### **Konten yang Harus Dibahas:**

---

### 1. REVIEW SYSTEM ARCHITECTURE

#### 1.1 Review Workflow Overview

**Flow Diagram**:

```
Penulis Upload → Admin Assign Editor → Editor Review →
Editor Submit Feedback → Admin Decision →
Status Update (Disetujui/Revisi/Tolak)
```

**Actors & Responsibilities**:

1. **Penulis**:

   - Upload naskah
   - Ajukan untuk review (status: diajukan)
   - View review progress
   - Respond to revision requests

2. **Admin**:

   - View antrian review (naskah status: diajukan)
   - Assign editor ke naskah
   - Monitor review progress
   - Make final decision (approve/reject/need revision)
   - Terbitkan naskah after approval

3. **Editor**:
   - View assigned reviews
   - Self-assign dari available pool (optional feature)
   - Read naskah
   - Provide detailed feedback per aspek
   - Submit rekomendasi (setujui/revisi/tolak)

**3 Database Tables**:

- `review_naskah`: Main review entity
- `feedback_review`: Detailed feedback items
- `pengguna` (role: editor): Editor accounts

---

### 2. REVIEW NASKAH MODULE (Backend)

#### 2.1 Review Model & Schema

**Table**: `review_naskah`

```prisma
model ReviewNaskah {
  id             String        @id @default(uuid())
  idNaskah       String
  idEditor       String
  status         StatusReview  @default(ditugaskan)
  rekomendasi    Rekomendasi?
  catatan        String?       @db.Text
  ditugaskanPada DateTime      @default(now())
  dimulaiPada    DateTime?
  selesaiPada    DateTime?
  diperbaruiPada DateTime      @updatedAt

  naskah   Naskah           @relation(fields: [idNaskah], references: [id], onDelete: Cascade)
  editor   Pengguna         @relation(fields: [idEditor], references: [id])
  feedback FeedbackReview[]

  @@index([idNaskah])
  @@index([idEditor])
  @@index([status])
  @@index([idEditor, status])
  @@map("review_naskah")
}

enum StatusReview {
  ditugaskan    // Editor assigned but not started
  dalam_proses  // Editor started reviewing
  selesai       // Editor submitted recommendation
  dibatalkan    // Review cancelled

  @@map("status_review")
}

enum Rekomendasi {
  setujui  // Approve for publishing
  revisi   // Needs revision
  tolak    // Reject

  @@map("rekomendasi")
}
```

**Business Rules**:

- 1 naskah can have multiple reviews (if revision requested)
- Only 1 active review per naskah at a time
- Cannot assign review if naskah status != 'diajukan'
- Auto-update naskah status when review assigned

#### 2.2 Feedback Model

**Table**: `feedback_review`

```prisma
model FeedbackReview {
  id        String   @id @default(uuid())
  idReview  String
  aspek     String   // Aspect being reviewed (e.g., "Plot", "Karakter")
  komentar  String   @db.Text
  skor      Int?     // Optional: 1-5 rating
  dibuatPada DateTime @default(now())

  review ReviewNaskah @relation(fields: [idReview], references: [id], onDelete: Cascade)

  @@index([idReview])
  @@map("feedback_review")
}
```

**Feedback Aspects** (common):

- Originalitas Cerita
- Kualitas Penulisan (grammar, style)
- Plot & Alur Cerita
- Pengembangan Karakter
- Dialog & Interaksi
- Tema & Pesan
- Pacing (tempo cerita)
- Ending & Resolusi
- Potensi Komersial
- Technical Issues (typo, formatting)

#### 2.3 Review Service Implementation

**Module**: `modules/review/`

**File Structure**:

```
modules/review/
├── review.module.ts
├── review.controller.ts
├── review.service.ts
├── dto/
│   ├── assign-review.dto.ts
│   ├── tambah-feedback.dto.ts
│   └── submit-review.dto.ts
└── interfaces/
    └── review.interface.ts
```

**Core Methods**:

##### A. Assign Editor (Admin Only)

```typescript
// review.service.ts
async assignEditor(dto: AssignReviewDto) {
  const { idNaskah, idEditor, catatan } = dto;

  // Validate naskah exists & status is 'diajukan'
  const naskah = await this.prisma.naskah.findUnique({
    where: { id: idNaskah },
  });

  if (!naskah) {
    throw new NotFoundException('Naskah tidak ditemukan');
  }

  if (naskah.status !== 'diajukan') {
    throw new BadRequestException(
      'Naskah harus berstatus "diajukan" untuk ditugaskan'
    );
  }

  // Validate editor exists & has editor role
  const editor = await this.prisma.pengguna.findFirst({
    where: {
      id: idEditor,
      peranPengguna: {
        some: {
          jenisPeran: 'editor',
          aktif: true,
        },
      },
    },
  });

  if (!editor) {
    throw new NotFoundException('Editor tidak ditemukan');
  }

  // Check if already has active review
  const existingReview = await this.prisma.reviewNaskah.findFirst({
    where: {
      idNaskah,
      status: { in: ['ditugaskan', 'dalam_proses'] },
    },
  });

  if (existingReview) {
    throw new ConflictException('Naskah sudah memiliki review aktif');
  }

  // Create review & update naskah status
  const review = await this.prisma.$transaction(async (prisma) => {
    // Create review
    const newReview = await prisma.reviewNaskah.create({
      data: {
        idNaskah,
        idEditor,
        status: 'ditugaskan',
        catatan,
      },
      include: {
        editor: {
          include: { profilPengguna: true },
        },
        naskah: {
          include: {
            penulis: {
              include: { profilPengguna: true },
            },
          },
        },
      },
    });

    // Update naskah status
    await prisma.naskah.update({
      where: { id: idNaskah },
      data: { status: 'dalam_review' },
    });

    // Send notification to editor
    await this.notifikasiService.kirimNotifikasi({
      idPengguna: idEditor,
      judul: 'Review Naskah Baru',
      pesan: `Anda ditugaskan untuk mereview naskah "${newReview.naskah.judul}"`,
      tipe: 'info',
      urlTujuan: `/dashboard/editor/review/${newReview.id}`,
    });

    // Send notification to penulis
    await this.notifikasiService.kirimNotifikasi({
      idPengguna: newReview.naskah.idPenulis,
      judul: 'Naskah Sedang Direview',
      pesan: `Naskah "${newReview.naskah.judul}" sedang direview oleh editor`,
      tipe: 'info',
    });

    return newReview;
  });

  return {
    sukses: true,
    pesan: 'Editor berhasil ditugaskan',
    data: review,
  };
}
```

##### B. Mulai Review (Editor)

```typescript
async mulaiReview(idReview: string, idEditor: string) {
  const review = await this.prisma.reviewNaskah.findUnique({
    where: { id: idReview },
  });

  if (!review) {
    throw new NotFoundException('Review tidak ditemukan');
  }

  if (review.idEditor !== idEditor) {
    throw new ForbiddenException('Anda tidak memiliki akses ke review ini');
  }

  if (review.status !== 'ditugaskan') {
    throw new BadRequestException('Review sudah dimulai atau selesai');
  }

  const updated = await this.prisma.reviewNaskah.update({
    where: { id: idReview },
    data: {
      status: 'dalam_proses',
      dimulaiPada: new Date(),
    },
  });

  return {
    sukses: true,
    pesan: 'Review dimulai',
    data: updated,
  };
}
```

##### C. Tambah Feedback (Editor)

```typescript
async tambahFeedback(idReview: string, dto: TambahFeedbackDto) {
  const { aspek, komentar, skor } = dto;

  // Validate review exists & belongs to current editor
  const review = await this.prisma.reviewNaskah.findUnique({
    where: { id: idReview },
  });

  if (!review) {
    throw new NotFoundException('Review tidak ditemukan');
  }

  // Auto start review if status is still 'ditugaskan'
  if (review.status === 'ditugaskan') {
    await this.prisma.reviewNaskah.update({
      where: { id: idReview },
      data: {
        status: 'dalam_proses',
        dimulaiPada: new Date(),
      },
    });
  }

  // Create feedback
  const feedback = await this.prisma.feedbackReview.create({
    data: {
      idReview,
      aspek,
      komentar,
      skor,
    },
  });

  return {
    sukses: true,
    pesan: 'Feedback berhasil ditambahkan',
    data: feedback,
  };
}
```

##### D. Submit Review (Editor)

```typescript
async submitReview(idReview: string, dto: SubmitReviewDto, idEditor: string) {
  const { rekomendasi, catatanUmum } = dto;

  // Validate review
  const review = await this.prisma.reviewNaskah.findUnique({
    where: { id: idReview },
    include: {
      feedback: true,
      naskah: {
        include: {
          penulis: true,
        },
      },
    },
  });

  if (!review) {
    throw new NotFoundException('Review tidak ditemukan');
  }

  if (review.idEditor !== idEditor) {
    throw new ForbiddenException('Anda tidak memiliki akses ke review ini');
  }

  if (review.status === 'selesai') {
    throw new BadRequestException('Review sudah diselesaikan');
  }

  // Require at least 1 feedback
  if (review.feedback.length === 0) {
    throw new BadRequestException(
      'Minimal harus ada 1 feedback sebelum submit review'
    );
  }

  // Update review
  const updated = await this.prisma.reviewNaskah.update({
    where: { id: idReview },
    data: {
      status: 'selesai',
      rekomendasi,
      catatan: catatanUmum,
      selesaiPada: new Date(),
    },
  });

  // Send notification to admin
  await this.notifikasiService.kirimNotifikasi({
    tipe: 'admin_broadcast',
    judul: 'Review Selesai',
    pesan: `Review naskah "${review.naskah.judul}" telah selesai dengan rekomendasi: ${rekomendasi}`,
    urlTujuan: `/dashboard/admin/monitoring/${idReview}`,
  });

  // Send notification to penulis
  await this.notifikasiService.kirimNotifikasi({
    idPengguna: review.naskah.idPenulis,
    judul: 'Review Naskah Selesai',
    pesan: `Review untuk naskah "${review.naskah.judul}" telah selesai`,
    tipe: 'sukses',
  });

  return {
    sukses: true,
    pesan: 'Review berhasil disubmit',
    data: updated,
  };
}
```

##### E. Admin Decision (Admin Only)

```typescript
async adminDecision(
  idReview: string,
  decision: 'setujui' | 'revisi' | 'tolak',
  catatan?: string
) {
  const review = await this.prisma.reviewNaskah.findUnique({
    where: { id: idReview },
    include: {
      naskah: {
        include: { penulis: true },
      },
    },
  });

  if (!review) {
    throw new NotFoundException('Review tidak ditemukan');
  }

  if (review.status !== 'selesai') {
    throw new BadRequestException('Review belum selesai');
  }

  // Map decision to naskah status
  const statusMap = {
    setujui: 'disetujui',
    revisi: 'perlu_revisi',
    tolak: 'ditolak',
  };

  const newStatus = statusMap[decision];

  // Update naskah status
  await this.prisma.$transaction(async (prisma) => {
    await prisma.naskah.update({
      where: { id: review.idNaskah },
      data: { status: newStatus as StatusNaskah },
    });

    // Log activity
    await prisma.logAktivitas.create({
      data: {
        idPengguna: review.naskah.idPenulis,
        aksi: `naskah_${decision}`,
        deskripsi: `Naskah "${review.naskah.judul}" ${decision === 'setujui' ? 'disetujui' : decision === 'revisi' ? 'perlu revisi' : 'ditolak'}`,
        ipAddress: '',
        userAgent: '',
      },
    });
  });

  // Send notification to penulis
  const notifMessages = {
    setujui: `Selamat! Naskah "${review.naskah.judul}" telah disetujui untuk diterbitkan`,
    revisi: `Naskah "${review.naskah.judul}" memerlukan revisi. Silakan cek feedback dari editor`,
    tolak: `Maaf, naskah "${review.naskah.judul}" tidak dapat diterbitkan`,
  };

  await this.notifikasiService.kirimNotifikasi({
    idPengguna: review.naskah.idPenulis,
    judul: `Keputusan Review: ${decision}`,
    pesan: notifMessages[decision],
    tipe: decision === 'setujui' ? 'sukses' : decision === 'tolak' ? 'error' : 'peringatan',
  });

  return {
    sukses: true,
    pesan: `Naskah ${decision}`,
  };
}
```

#### 2.4 Review Controller Endpoints

**File**: `review.controller.ts`

```typescript
@Controller("review")
@ApiTags("review")
@UseGuards(JwtAuthGuard, PeranGuard)
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  // ==================== ADMIN ENDPOINTS ====================

  @Post("assign")
  @Peran("admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Assign editor ke naskah (Admin)" })
  async assignEditor(@Body() dto: AssignReviewDto) {
    return this.reviewService.assignEditor(dto);
  }

  @Get("antrian")
  @Peran("admin")
  @ApiOperation({ summary: "Antrian review (naskah yang belum di-assign)" })
  async antrianReview() {
    return this.reviewService.getAntrianReview();
  }

  @Get("monitoring")
  @Peran("admin")
  @ApiOperation({ summary: "Monitoring semua review aktif" })
  async monitoringReview(@Query("status") status?: StatusReview) {
    return this.reviewService.getMonitoringReview(status);
  }

  @Post(":id/decision")
  @Peran("admin")
  @ApiOperation({ summary: "Admin final decision setelah review selesai" })
  async adminDecision(@Param("id") id: string, @Body() dto: AdminDecisionDto) {
    return this.reviewService.adminDecision(id, dto.decision, dto.catatan);
  }

  // ==================== EDITOR ENDPOINTS ====================

  @Get("editor/saya")
  @Peran("editor")
  @ApiOperation({ summary: "Daftar review saya (Editor)" })
  async daftarReviewSaya(
    @PenggunaSaatIni("id") idEditor: string,
    @Query("status") status?: StatusReview,
    @Query("limit") limit: number = 20
  ) {
    return this.reviewService.getDaftarReviewEditor(idEditor, status, limit);
  }

  @Get("editor/available")
  @Peran("editor")
  @ApiOperation({ summary: "Daftar naskah available untuk self-assign" })
  async availableForSelfAssign() {
    return this.reviewService.getAvailableForSelfAssign();
  }

  @Post("self-assign/:idNaskah")
  @Peran("editor")
  @ApiOperation({ summary: "Self-assign naskah (Editor)" })
  async selfAssign(
    @Param("idNaskah") idNaskah: string,
    @PenggunaSaatIni("id") idEditor: string
  ) {
    return this.reviewService.selfAssignEditor(idNaskah, idEditor);
  }

  @Get(":id")
  @Peran("editor", "admin")
  @ApiOperation({ summary: "Detail review" })
  async detailReview(@Param("id") id: string) {
    return this.reviewService.getDetailReview(id);
  }

  @Post(":id/mulai")
  @Peran("editor")
  @ApiOperation({ summary: "Mulai review (Editor)" })
  async mulaiReview(
    @Param("id") id: string,
    @PenggunaSaatIni("id") idEditor: string
  ) {
    return this.reviewService.mulaiReview(id, idEditor);
  }

  @Post(":id/feedback")
  @Peran("editor")
  @ApiOperation({ summary: "Tambah feedback (Editor)" })
  async tambahFeedback(
    @Param("id") id: string,
    @Body() dto: TambahFeedbackDto
  ) {
    return this.reviewService.tambahFeedback(id, dto);
  }

  @Get(":id/feedback")
  @Peran("editor", "admin", "penulis")
  @ApiOperation({ summary: "Daftar feedback review" })
  async daftarFeedback(@Param("id") id: string) {
    return this.reviewService.getDaftarFeedback(id);
  }

  @Put(":id/submit")
  @Peran("editor")
  @ApiOperation({ summary: "Submit review dengan rekomendasi (Editor)" })
  async submitReview(
    @Param("id") id: string,
    @Body() dto: SubmitReviewDto,
    @PenggunaSaatIni("id") idEditor: string
  ) {
    return this.reviewService.submitReview(id, dto, idEditor);
  }

  // ==================== STATISTIK ====================

  @Get("statistik/editor")
  @Peran("editor")
  @ApiOperation({ summary: "Statistik review editor" })
  async statistikEditor(@PenggunaSaatIni("id") idEditor: string) {
    return this.reviewService.getStatistikEditor(idEditor);
  }
}
```

**DTOs**:

```typescript
// dto/assign-review.dto.ts
export class AssignReviewDto {
  @IsUUID()
  @ApiProperty()
  idNaskah: string;

  @IsUUID()
  @ApiProperty()
  idEditor: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  catatan?: string;
}

// dto/tambah-feedback.dto.ts
export class TambahFeedbackDto {
  @IsString()
  @MinLength(3)
  @ApiProperty({ example: "Originalitas Cerita" })
  aspek: string;

  @IsString()
  @MinLength(10)
  @ApiProperty({ example: "Cerita cukup original dengan twist menarik..." })
  komentar: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  @ApiProperty({ minimum: 1, maximum: 5, required: false })
  skor?: number;
}

// dto/submit-review.dto.ts
export class SubmitReviewDto {
  @IsEnum(Rekomendasi)
  @ApiProperty({ enum: Rekomendasi })
  rekomendasi: Rekomendasi;

  @IsString()
  @MinLength(20)
  @ApiProperty({ example: "Secara keseluruhan naskah ini..." })
  catatanUmum: string;
}

// dto/admin-decision.dto.ts
export class AdminDecisionDto {
  @IsEnum(["setujui", "revisi", "tolak"])
  @ApiProperty({ enum: ["setujui", "revisi", "tolak"] })
  decision: "setujui" | "revisi" | "tolak";

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  catatan?: string;
}
```

---

### 3. FRONTEND - ADMIN REVIEW MANAGEMENT

#### 3.1 Admin Dashboard

**Route**: `/dashboard/admin` atau `/admin`

**Components**:

##### A. Statistik Cards (4 cards)

```typescript
const stats = {
  totalNaskah: 125,
  menungguReview: 8, // status: diajukan
  reviewAktif: 15, // status: dalam_review
  totalEditor: 12,
};
```

##### B. Quick Actions (4 buttons)

- "Antrian Review" → `/admin/antrian`
- "Semua Naskah" → `/admin/naskah`
- "Monitoring Review" → `/admin/monitoring`
- "Kelola Pengguna" → `/admin/pengguna`

#### 3.2 Antrian Review Page

**Route**: `/admin/antrian` atau `/admin/antrian-review`

**Purpose**: Menampilkan naskah yang sudah diajukan tapi belum di-assign editor

**Features**:

##### A. Filter & Sort

- Search by judul naskah atau nama penulis
- Filter by kategori
- Sort: Terbaru, Terlama, Prioritas (based on waiting time)

##### B. Kartu Naskah Layout

Grid layout dengan cards:

- Cover image (thumbnail)
- Judul naskah
- Penulis name
- Kategori & Genre badges
- Tanggal diajukan
- Waiting time indicator (e.g., "3 hari yang lalu")
- Button: "Tugaskan ke Editor"

##### C. Modal Assign Editor

Ketika klik "Tugaskan ke Editor":

- **Dropdown Editor**: Pilih dari daftar editor aktif
  - Show: Nama editor, Foto, Current workload (X review aktif)
  - Sort: Least workload first
- **Textarea Catatan**: Optional note untuk editor
- **Buttons**: "Tugaskan" & "Batal"

**API Integration**:

```typescript
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/admin";

export default function AntrianReviewPage() {
  const queryClient = useQueryClient();
  const [selectedNaskah, setSelectedNaskah] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch antrian
  const { data, isLoading } = useQuery({
    queryKey: ["review", "antrian"],
    queryFn: () => adminApi.getAntrianReview(),
  });

  // Fetch editors
  const { data: editors } = useQuery({
    queryKey: ["editors"],
    queryFn: () => adminApi.getDaftarEditor(),
  });

  // Assign mutation
  const { mutate: assignEditor, isLoading: isAssigning } = useMutation({
    mutationFn: adminApi.assignEditor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["review", "antrian"] });
      setIsModalOpen(false);
      toast.success("Editor berhasil ditugaskan");
    },
  });

  const handleAssign = (data) => {
    assignEditor({
      idNaskah: selectedNaskah.id,
      idEditor: data.idEditor,
      catatan: data.catatan,
    });
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <h1>Antrian Review</h1>
      <p>Ada {data?.data.length} naskah menunggu editor</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.data.map((naskah) => (
          <KartuNaskahAntrian
            key={naskah.id}
            naskah={naskah}
            onAssign={() => {
              setSelectedNaskah(naskah);
              setIsModalOpen(true);
            }}
          />
        ))}
      </div>

      <ModalAssignEditor
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        naskah={selectedNaskah}
        editors={editors?.data || []}
        onSubmit={handleAssign}
        isLoading={isAssigning}
      />
    </div>
  );
}
```

#### 3.3 Monitoring Review Page

**Route**: `/admin/monitoring`

**Purpose**: Monitor progress semua review aktif

**Table Columns**:

1. Judul Naskah (sortable)
2. Penulis
3. Editor (with avatar)
4. Status Review (badge: ditugaskan, dalam_proses, selesai)
5. Rekomendasi (if selesai)
6. Tanggal Ditugaskan
7. Deadline / Days elapsed
8. Progress (jumlah feedback)
9. Actions (Lihat Detail, Approve/Reject if selesai)

**Tab Filter**:

- Semua
- Ditugaskan (belum dimulai)
- Dalam Proses
- Selesai (pending admin decision)
- Terlambat (>7 hari)

**Row Actions**:

- **Status: Selesai** → Show "Lihat Detail & Buat Keputusan" button
- **Status: Dalam Proses** → Show "Lihat Progress" button
- **Status: Ditugaskan** → Show "Reassign Editor" option (if needed)

##### Modal Admin Decision

Ketika admin klik untuk buat keputusan:

- Display: Review summary, Rekomendasi editor, All feedback list
- 3 Action Cards dengan icon:
  - ✅ **Setujui** (Green): Approve untuk diterbitkan
  - 📝 **Perlu Revisi** (Amber): Kirim kembali ke penulis
  - ❌ **Tolak** (Red): Reject naskah
- Textarea: Catatan tambahan (optional)
- Confirmation: "Keputusan tidak dapat diubah"

---

### 4. FRONTEND - EDITOR DASHBOARD & REVIEW

#### 4.1 Editor Dashboard

**Route**: `/editor` atau `/dashboard/editor`

**Components**:

##### A. Statistik Cards (3 cards dengan gradients)

```typescript
const stats = {
  reviewDitugaskan: 3, // status: ditugaskan
  dalamProses: 5, // status: dalam_proses
  selesai: 27, // status: selesai (lifetime)
};
```

##### B. Recent Reviews Timeline (5 terbaru)

- Judul naskah
- Status dengan icon
- Tanggal ditugaskan/selesai
- Link ke detail

##### C. Quick Filter Cards (3 cards clickable)

- "Review Baru" → Filter by status: ditugaskan
- "Sedang Dikerjakan" → Filter by status: dalam_proses
- "Selesai" → Filter by status: selesai

#### 4.2 Daftar Review Page

**Route**: `/editor/review`

**Tab Filter**:

- Semua
- Ditugaskan (belum dimulai)
- Dalam Proses
- Selesai

**Card Layout** (grid):
Each card shows:

- **Cover image** (naskah)
- **Judul naskah** (bold, large)
- **Penulis**: Nama lengkap
- **Kategori & Genre**: Badges
- **Status Review**: Badge dengan warna (ditugaskan: yellow, dalam_proses: blue, selesai: green)
- **Ditugaskan pada**: Timestamp
- **Deadline/Days elapsed**: "3 hari lalu"
- **Progress**: "5 feedback diberikan"
- **Action Button**:
  - If ditugaskan: "Mulai Review"
  - If dalam_proses: "Lanjut Review"
  - If selesai: "Lihat Detail"

#### 4.3 Detail & Review Naskah Page

**Route**: `/editor/review/:id`

**This is the MAIN review interface**

**Layout**: 2 columns

##### LEFT COLUMN: Naskah Information

**Section 1: Cover & Basic Info**

- Large cover image
- Judul & subjudul
- Author: Nama + avatar
- Kategori & Genre badges
- Status naskah
- Jumlah halaman, jumlah kata
- Sinopsis (full text, collapsible if long)

**Section 2: Download Naskah**

- Button: "Download PDF Naskah" (opens in new tab or download)
- File size display
- Last updated timestamp

**Section 3: Review Timeline**

- Ditugaskan pada: {date}
- Dimulai pada: {date} (if started)
- Target selesai: {date} (suggested, e.g., 7 days from assign)
- Status: Current review status

##### RIGHT COLUMN: Review Form & Feedback

**Section 1: Daftar Feedback (if any)**

- List all feedback yang sudah ditambahkan
- Each feedback item shows:
  - Aspek (bold)
  - Skor (stars, if applicable)
  - Komentar (full text)
  - Timestamp
  - Button: "Edit" (for editor to modify)

**Section 2: Form Tambah Feedback**

- Input: Aspek yang direview (text or dropdown dari preset aspects)
- Star Rating: 1-5 bintang (interactive, optional)
- Textarea: Komentar detail (required, min 10 karakter)
- Button: "Tambah Feedback"

**Preset Aspects Dropdown**:

- Originalitas Cerita
- Kualitas Penulisan
- Plot & Alur
- Pengembangan Karakter
- Dialog
- Pacing
- Tema & Pesan
- Potensi Komersial
- Custom (user can type custom aspect)

**Section 3: Submit Review (Bottom)**

- Disabled jika belum ada feedback
- Button: "Submit Review & Rekomendasi"
- Opens modal

##### Modal Submit Review

**3 Rekomendasi Cards** (radio select):

1. **Setujui** (Green card)

   - Icon: ✅
   - Label: "Setujui untuk Diterbitkan"
   - Description: "Naskah ini layak diterbitkan tanpa revisi besar"

2. **Perlu Revisi** (Amber card)

   - Icon: 📝
   - Label: "Perlu Revisi"
   - Description: "Naskah memerlukan perbaikan sebelum diterbitkan"

3. **Tolak** (Red card)
   - Icon: ❌
   - Label: "Tolak"
   - Description: "Naskah tidak memenuhi standar penerbitan"

**Textarea: Catatan Umum** (required, min 20 karakter)

- Placeholder: "Berikan ringkasan keseluruhan review Anda..."

**Warning Message**: "⚠️ Keputusan tidak dapat diubah setelah submit"

**Buttons**:

- "Submit Review" (primary, disabled jika belum pilih rekomendasi)
- "Batal"

**API Integration**:

```typescript
"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reviewApi } from "@/lib/api/review";

export default function ReviewDetailPage() {
  const params = useParams();
  const idReview = params.id as string;
  const queryClient = useQueryClient();
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  // Fetch review detail
  const { data: review, isLoading } = useQuery({
    queryKey: ["review", "detail", idReview],
    queryFn: () => reviewApi.getDetailReview(idReview),
  });

  // Fetch feedback list
  const { data: feedbackList } = useQuery({
    queryKey: ["review", "feedback", idReview],
    queryFn: () => reviewApi.getDaftarFeedback(idReview),
  });

  // Mulai review mutation
  const { mutate: mulaiReview } = useMutation({
    mutationFn: () => reviewApi.mulaiReview(idReview),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["review", "detail", idReview],
      });
      toast.success("Review dimulai");
    },
  });

  // Tambah feedback mutation
  const { mutate: tambahFeedback, isLoading: isAddingFeedback } = useMutation({
    mutationFn: (data) => reviewApi.tambahFeedback(idReview, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["review", "feedback", idReview],
      });
      form.reset();
      toast.success("Feedback ditambahkan");
    },
  });

  // Submit review mutation
  const { mutate: submitReview, isLoading: isSubmitting } = useMutation({
    mutationFn: (data) => reviewApi.submitReview(idReview, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["review"] });
      router.push("/editor/review");
      toast.success("Review berhasil disubmit");
    },
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* LEFT COLUMN */}
      <div>
        <NaskahInfoCard naskah={review.data.naskah} />
        <DownloadNaskahSection file={review.data.naskah.urlFile} />
        <ReviewTimelineCard review={review.data} />
      </div>

      {/* RIGHT COLUMN */}
      <div>
        {/* Daftar Feedback */}
        <div className="mb-6">
          <h3>Feedback Diberikan ({feedbackList?.data.length || 0})</h3>
          {feedbackList?.data.map((feedback) => (
            <FeedbackCard key={feedback.id} feedback={feedback} />
          ))}
        </div>

        {/* Form Tambah Feedback */}
        {review.data.status !== "selesai" && (
          <FormTambahFeedback
            onSubmit={tambahFeedback}
            isLoading={isAddingFeedback}
          />
        )}

        {/* Submit Button */}
        {review.data.status !== "selesai" && (
          <Button
            onClick={() => setIsSubmitModalOpen(true)}
            disabled={!feedbackList?.data.length}
            className="w-full mt-6"
          >
            Submit Review & Rekomendasi
          </Button>
        )}
      </div>

      {/* Modal Submit */}
      <ModalSubmitReview
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onSubmit={submitReview}
        isLoading={isSubmitting}
        feedbackCount={feedbackList?.data.length || 0}
      />
    </div>
  );
}
```

---

### 5. SELF-ASSIGN FEATURE (Optional Enhancement)

#### 5.1 Purpose

Allow editors to self-assign dari pool of available naskah, bukan hanya via admin assignment.

#### 5.2 Backend Implementation

**Endpoint**: `POST /api/review/self-assign/:idNaskah`

**Logic**:

- Similar to admin assign, but:
  - Check editor workload limit (max X active reviews)
  - First-come-first-served basis
  - Optional: Priority system (senior editors first)

#### 5.3 Frontend: Available Naskah Page

**Route**: `/editor/available` atau `/editor/ambil-review`

**Features**:

- Grid of naskah available untuk di-assign
- Show: Cover, Judul, Penulis, Kategori, Waiting time
- Button: "Ambil Review Ini"
- Confirmation modal sebelum assign

---

### 6. NOTIFIKASI REAL-TIME

#### 6.1 Notification Triggers

**For Penulis**:

- ✅ Naskah sedang direview (when editor assigned)
- ✅ Review selesai (when editor submits)
- ✅ Keputusan admin (setujui/revisi/tolak)
- ✅ Naskah diterbitkan

**For Editor**:

- ✅ Review baru ditugaskan
- ✅ Reminder: Review belum dimulai (after 2 days)
- ✅ Reminder: Deadline approaching (1 day before)

**For Admin**:

- ✅ Review selesai, pending decision
- ✅ Review overdue (>7 days)

#### 6.2 WebSocket Implementation

**Backend**: Already implemented di `modules/notifikasi/`

**Frontend**:

```typescript
// hooks/use-notifikasi.ts
import { useEffect } from "react";
import { io } from "socket.io-client";
import { useAuthStore } from "@/stores/use-auth-store";
import { toast } from "sonner";

export const useNotifikasi = () => {
  const pengguna = useAuthStore((state) => state.pengguna);

  useEffect(() => {
    if (!pengguna) return;

    const socket = io(process.env.NEXT_PUBLIC_WS_URL, {
      auth: {
        token: useAuthStore.getState().token,
      },
    });

    socket.on("connect", () => {
      console.log("✅ Connected to notification server");
      socket.emit("join", pengguna.id);
    });

    socket.on("notifikasi", (data) => {
      // Show toast notification
      toast[data.tipe](data.pesan, {
        action: data.urlTujuan
          ? {
              label: "Lihat",
              onClick: () => (window.location.href = data.urlTujuan),
            }
          : undefined,
      });

      // Update notification badge count
      // ... update UI state
    });

    return () => {
      socket.disconnect();
    };
  }, [pengguna]);
};
```

---

### 7. STATISTICS & ANALYTICS

#### 7.1 Editor Statistics

**Endpoint**: `GET /api/review/statistik/editor`

**Metrics**:

- Total reviews completed (lifetime)
- Average review time (days)
- Review breakdown by rekomendasi (setujui: X, revisi: Y, tolak: Z)
- Current active reviews
- Feedback quality score (future: based on author rating)

**Frontend Display**:

- Card stats di editor dashboard
- Charts: Pie chart rekomendasi distribution
- Timeline: Reviews completed per month (last 6 months)

#### 7.2 Admin Analytics

**Endpoint**: `GET /api/review/statistik/admin`

**Metrics**:

- Total naskah in review pipeline
- Average time from ajukan → diterbitkan
- Editor performance comparison
- Bottlenecks identification
- Acceptance rate (% disetujui vs ditolak)

---

### 8. DATABASE OPTIMIZATION FASE 3

#### 8.1 Additional Indexes

```prisma
model ReviewNaskah {
  // ... existing indexes

  @@index([idEditor, status])
  @@index([status, ditugaskanPada])
  @@index([selesaiPada])
}

model FeedbackReview {
  @@index([idReview, dibuatPada])
}
```

#### 8.2 Query Optimization

**Use transactions untuk atomic operations**:

- Assign editor + update naskah status
- Submit review + send notifications

**Batch queries dengan Promise.all**:

- Fetch review + feedback + naskah simultaneously

---

### 9. TESTING FASE 3

#### 9.1 Unit Tests

- Review service methods (assign, mulai, tambah feedback, submit)
- Status transition validation
- Notification triggers

#### 9.2 Integration Tests

- Full review workflow: assign → feedback → submit → admin decision
- Self-assign edge cases (workload limit, race condition)
- Notification delivery

#### 9.3 E2E Tests

- Admin assigns editor → Editor receives notif → Editor reviews → Editor submits → Admin decides

---

### 10. HASIL & DELIVERABLES FASE 3

#### 10.1 Backend

✅ Review Module complete (15+ endpoints)  
✅ Feedback system implemented  
✅ Admin decision workflow  
✅ Self-assign feature (optional)  
✅ Real-time notifications untuk review events  
✅ Statistics & analytics endpoints

#### 10.2 Frontend

✅ Admin: Antrian review page  
✅ Admin: Monitoring review page  
✅ Admin: Modal assign editor  
✅ Admin: Modal keputusan review  
✅ Editor: Dashboard dengan statistik  
✅ Editor: Daftar review dengan filter  
✅ Editor: Detail & review naskah page (main interface)  
✅ Editor: Form feedback dengan star rating  
✅ Editor: Modal submit review dengan 3 rekomendasi  
✅ Notification toast components

#### 10.3 Metrics

- **LOC Backend**: +3,500
- **LOC Frontend**: +4,000
- **API Endpoints**: +15
- **Time**: ~84 jam (10-11 hari kerja)

---

### 11. NEXT STEPS → FASE 4

Fase 4 akan fokus pada:

1. **Sistem Percetakan**: Pesanan cetak fisik buku
2. **Tarif Percetakan**: Dynamic pricing calculator
3. **Tracking Produksi**: 5 tahapan produksi
4. **Pengiriman**: Shipping management dengan tracking
5. **Dashboard Percetakan**: Complete printing partner dashboard

---
