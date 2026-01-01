# 🚀 DEVELOPMENT STEP BY STEP - FASE 3: REVIEW SYSTEM

**Referensi**: RANCANGAN-FASE-3-REVIEW-SYSTEM.md  
**Prerequisites**: Fase 1-2 complete (Auth, Naskah management)  
**Target**: Implementasi Review System lengkap dengan assignment, feedback, dan rekomendasi  
**Durasi**: 12 hari kerja (~84 jam)

> ⚠️ **PENTING**: Dokumen ini adalah RANCANGAN/BLUEPRINT untuk pembuatan laporan development actual berdasarkan code yang sudah ada di project.

---

## 📋 STRUKTUR LAPORAN DEVELOPMENT

Laporan development actual akan menjelaskan implementasi Review System yang sudah ada dengan detail step-by-step berdasarkan code actual.

---

## 1. PRISMA SCHEMA - REVIEW MODELS

### 1.1 Model ReviewNaskah

**Yang akan dijelaskan**: Model utama untuk review dengan 4 status

**Code dari `schema.prisma` (already exists)**:

```prisma
model ReviewNaskah {
  id             String        @id @default(uuid())
  idNaskah       String
  idEditor       String
  status         StatusReview  @default(ditugaskan)
  rekomendasi    Rekomendasi?  // setujui, revisi, tolak
  ringkasanReview String?      @db.Text
  catatan        String?       @db.Text
  ditugaskanPada DateTime      @default(now())
  mulaiPada      DateTime?
  selesaiPada    DateTime?
  dibuatPada     DateTime      @default(now())
  diperbaruiPada DateTime      @updatedAt

  // Relations
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
  ditugaskan      // Assigned to editor, not started yet
  dalam_proses    // Editor is working on it
  selesai         // Review completed
  dibatalkan      // Cancelled

  @@map("status_review")
}

enum Rekomendasi {
  setujui  // Approve for publication
  revisi   // Need revision
  tolak    // Reject

  @@map("rekomendasi")
}
```

**Field Explanation**:

- `status`: 4-stage review lifecycle
- `rekomendasi`: Final decision (only filled when status=selesai)
- `ringkasanReview`: Overall summary of the review
- `ditugaskanPada`: Auto-set when admin assigns
- `mulaiPada`: Set when editor starts reviewing (status → dalam_proses)
- `selesaiPada`: Set when editor submits final review

### 1.2 Model FeedbackReview

**Yang akan dijelaskan**: Model untuk feedback detail per aspek

```prisma
model FeedbackReview {
  id       String   @id @default(uuid())
  idReview String
  aspek    String   // "plot", "karakter", "gaya_bahasa", "tata_bahasa", "kreativitas"
  komentar String   @db.Text
  rating   Int?     @default(0) @db.SmallInt  // 1-5
  dibuatPada DateTime @default(now())

  review ReviewNaskah @relation(fields: [idReview], references: [id], onDelete: Cascade)

  @@map("feedback_review")
}
```

**Aspek Review**:

- plot: Alur cerita
- karakter: Pengembangan karakter
- gaya_bahasa: Writing style
- tata_bahasa: Grammar & spelling
- kreativitas: Originality

### 1.3 Migration

**Commands yang sudah dijalankan**:

```bash
cd backend
bunx prisma migrate dev --name add_review_system

# Verify
bunx prisma studio
# Check: review_naskah, feedback_review tables
```

---

## 2. BACKEND - REVIEW MODULE STRUCTURE

### 2.1 Module Files (Already Implemented)

```
modules/review/
├── review.module.ts
├── review.controller.ts
├── review.service.ts          # Core business logic (740 lines)
└── dto/
    ├── tugaskan-review.dto.ts
    ├── tambah-feedback.dto.ts
    ├── submit-review.dto.ts
    ├── filter-review.dto.ts
    └── index.ts
```

---

## 3. REVIEW SERVICE IMPLEMENTATION

### 3.1 Method: tugaskanReview() - Admin Assigns Review to Editor

**File**: `backend/src/modules/review/review.service.ts` (lines 24-127)

**Yang akan dijelaskan**:

```typescript
async tugaskanReview(dto: TugaskanReviewDto, idPenugasAdmin: string) {
  // 1. Validate naskah exists and status = diajukan
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
    throw new NotFoundException('Naskah tidak ditemukan');
  }

  if (naskah.status !== StatusNaskah.diajukan) {
    throw new BadRequestException(
      'Naskah hanya bisa direview jika statusnya diajukan'
    );
  }

  // 2. Validate editor exists and has 'editor' role
  const editor = await this.prisma.pengguna.findUnique({
    where: { id: dto.idEditor },
    include: {
      peranPengguna: {
        where: {
          jenisPeran: 'editor',
          aktif: true,
        },
      },
    },
  });

  if (!editor || editor.peranPengguna.length === 0) {
    throw new BadRequestException(
      'Editor tidak ditemukan atau tidak memiliki role editor'
    );
  }

  // 3. Check no active review exists
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
      'Naskah ini sudah memiliki review yang sedang berjalan'
    );
  }

  // 4. Create review & update naskah status
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
            penulis: { select: { id: true, email: true } },
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

    // Update naskah status to 'dalam_review'
    await prisma.naskah.update({
      where: { id: dto.idNaskah },
      data: { status: StatusNaskah.dalam_review },
    });

    return newReview;
  });

  // 5. Send notification to editor
  await this.prisma.notifikasi.create({
    data: {
      idPengguna: dto.idEditor,
      judul: 'Review Baru Ditugaskan',
      pesan: `Anda ditugaskan untuk mereview naskah "${naskah.judul}"`,
      tipe: 'info',
    },
  });

  // 6. Log activity
  await this.prisma.logAktivitas.create({
    data: {
      idPengguna: idPenugasAdmin,
      jenis: 'tugaskan_review',
      aksi: 'Tugaskan Review',
      entitas: 'ReviewNaskah',
      idEntitas: review.id,
      deskripsi: `Review naskah "${naskah.judul}" ditugaskan ke editor`,
      platform: 'web',
    },
  });

  return {
    sukses: true,
    pesan: 'Review berhasil ditugaskan',
    data: review,
  };
}
```

**Workflow Steps**:

1. Validate naskah (must be status=diajukan)
2. Validate editor (must have 'editor' role)
3. Check no duplicate active review
4. Transaction: Create review + Update naskah status
5. Notify editor
6. Log admin action

---

### 3.2 Method: mulaiReview() - Editor Starts Reviewing

**File**: `review.service.ts` (lines 129-180)

**Yang akan dijelaskan**:

```typescript
async mulaiReview(idReview: string, idEditor: string) {
  // 1. Get review
  const review = await this.prisma.reviewNaskah.findUnique({
    where: { id: idReview },
    include: {
      naskah: { select: { id: true, judul: true, idPenulis: true } },
    },
  });

  if (!review) {
    throw new NotFoundException('Review tidak ditemukan');
  }

  // 2. Check ownership
  if (review.idEditor !== idEditor) {
    throw new ForbiddenException('Anda tidak memiliki akses ke review ini');
  }

  // 3. Validate status
  if (review.status !== StatusReview.ditugaskan) {
    throw new BadRequestException(
      'Review hanya bisa dimulai jika statusnya ditugaskan'
    );
  }

  // 4. Update status to 'dalam_proses'
  const updated = await this.prisma.reviewNaskah.update({
    where: { id: idReview },
    data: {
      status: StatusReview.dalam_proses,
      mulaiPada: new Date(),
    },
    include: {
      naskah: true,
      editor: {
        select: {
          profilPengguna: true,
        },
      },
    },
  });

  // 5. Notify penulis (optional)
  await this.prisma.notifikasi.create({
    data: {
      idPengguna: review.naskah.idPenulis,
      judul: 'Review Sedang Berlangsung',
      pesan: `Naskah "${review.naskah.judul}" sedang direview`,
      tipe: 'info',
    },
  });

  return {
    sukses: true,
    pesan: 'Review berhasil dimulai',
    data: updated,
  };
}
```

---

### 3.3 Method: tambahFeedback() - Editor Adds Feedback

**File**: `review.service.ts` (lines 182-240)

**Yang akan dijelaskan**:

```typescript
async tambahFeedback(idReview: string, idEditor: string, dto: TambahFeedbackDto) {
  // 1. Validate review
  const review = await this.prisma.reviewNaskah.findUnique({
    where: { id: idReview },
  });

  if (!review) {
    throw new NotFoundException('Review tidak ditemukan');
  }

  // 2. Check ownership
  if (review.idEditor !== idEditor) {
    throw new ForbiddenException('Anda tidak memiliki akses ke review ini');
  }

  // 3. Check status
  if (review.status !== StatusReview.dalam_proses) {
    throw new BadRequestException(
      'Feedback hanya bisa ditambahkan saat review dalam proses'
    );
  }

  // 4. Validate rating (1-5)
  if (dto.rating && (dto.rating < 1 || dto.rating > 5)) {
    throw new BadRequestException('Rating harus antara 1-5');
  }

  // 5. Create feedback
  const feedback = await this.prisma.feedbackReview.create({
    data: {
      idReview,
      aspek: dto.aspek,
      komentar: dto.komentar,
      rating: dto.rating,
    },
  });

  return {
    sukses: true,
    pesan: 'Feedback berhasil ditambahkan',
    data: feedback,
  };
}
```

**Aspek Values** (validated in DTO):

- `plot`
- `karakter`
- `gaya_bahasa`
- `tata_bahasa`
- `kreativitas`

---

### 3.4 Method: submitReview() - Editor Submits Final Review

**File**: `review.service.ts` (lines 242-330)

**Yang akan dijelaskan**:

```typescript
async submitReview(idReview: string, idEditor: string, dto: SubmitReviewDto) {
  // 1. Validate review
  const review = await this.prisma.reviewNaskah.findUnique({
    where: { id: idReview },
    include: {
      naskah: { select: { id: true, judul: true, idPenulis: true } },
      feedback: true,
    },
  });

  if (!review) {
    throw new NotFoundException('Review tidak ditemukan');
  }

  // 2. Check ownership
  if (review.idEditor !== idEditor) {
    throw new ForbiddenException('Anda tidak memiliki akses ke review ini');
  }

  // 3. Validate status
  if (review.status !== StatusReview.dalam_proses) {
    throw new BadRequestException(
      'Review hanya bisa disubmit jika statusnya dalam_proses'
    );
  }

  // 4. Validate has feedback
  if (review.feedback.length === 0) {
    throw new BadRequestException(
      'Review harus memiliki minimal 1 feedback sebelum disubmit'
    );
  }

  // 5. Update review + naskah status based on rekomendasi
  const updated = await this.prisma.$transaction(async (prisma) => {
    // Update review
    const updatedReview = await prisma.reviewNaskah.update({
      where: { id: idReview },
      data: {
        status: StatusReview.selesai,
        rekomendasi: dto.rekomendasi,
        ringkasanReview: dto.ringkasanReview,
        selesaiPada: new Date(),
      },
      include: {
        naskah: true,
        editor: {
          select: {
            profilPengguna: true,
          },
        },
        feedback: true,
      },
    });

    // Update naskah status based on rekomendasi
    let naskahStatus: StatusNaskah;
    switch (dto.rekomendasi) {
      case Rekomendasi.setujui:
        naskahStatus = StatusNaskah.disetujui;
        break;
      case Rekomendasi.revisi:
        naskahStatus = StatusNaskah.perlu_revisi;
        break;
      case Rekomendasi.tolak:
        naskahStatus = StatusNaskah.ditolak;
        break;
    }

    await prisma.naskah.update({
      where: { id: review.naskah.id },
      data: { status: naskahStatus },
    });

    return updatedReview;
  });

  // 6. Notify penulis
  const notifTitle = {
    setujui: 'Naskah Disetujui!',
    revisi: 'Naskah Perlu Revisi',
    tolak: 'Naskah Ditolak',
  }[dto.rekomendasi];

  await this.prisma.notifikasi.create({
    data: {
      idPengguna: review.naskah.idPenulis,
      judul: notifTitle,
      pesan: dto.ringkasanReview,
      tipe: dto.rekomendasi === 'setujui' ? 'sukses' : 'peringatan',
    },
  });

  return {
    sukses: true,
    pesan: 'Review berhasil disubmit',
    data: updated,
  };
}
```

**Status Transition Logic**:

- rekomendasi=`setujui` → naskah.status=`disetujui`
- rekomendasi=`revisi` → naskah.status=`perlu_revisi`
- rekomendasi=`tolak` → naskah.status=`ditolak`

---

## 4. REVIEW CONTROLLER ENDPOINTS

### 4.1 Controller Implementation

**File**: `review.controller.ts` (Already exists)

**Endpoints**:

**1. POST /api/review/assign - Admin assigns review**

```typescript
@Post('assign')
@Peran('admin')
@ApiOperation({ summary: 'Tugaskan review ke editor' })
async tugaskanReview(
  @Body() dto: TugaskanReviewDto,
  @PenggunaSaatIni('id') idAdmin: string,
) {
  return this.reviewService.tugaskanReview(dto, idAdmin);
}
```

**2. PUT /api/review/:id/mulai - Editor starts review**

```typescript
@Put(':id/mulai')
@Peran('editor')
@ApiOperation({ summary: 'Mulai review (editor)' })
async mulaiReview(
  @Param('id') idReview: string,
  @PenggunaSaatIni('id') idEditor: string,
) {
  return this.reviewService.mulaiReview(idReview, idEditor);
}
```

**3. POST /api/review/:id/feedback - Editor adds feedback**

```typescript
@Post(':id/feedback')
@Peran('editor')
@ApiOperation({ summary: 'Tambah feedback review' })
async tambahFeedback(
  @Param('id') idReview: string,
  @PenggunaSaatIni('id') idEditor: string,
  @Body() dto: TambahFeedbackDto,
) {
  return this.reviewService.tambahFeedback(idReview, idEditor, dto);
}
```

**4. PUT /api/review/:id/submit - Editor submits final review**

```typescript
@Put(':id/submit')
@Peran('editor')
@ApiOperation({ summary: 'Submit review final (editor)' })
async submitReview(
  @Param('id') idReview: string,
  @PenggunaSaatIni('id') idEditor: string,
  @Body() dto: SubmitReviewDto,
) {
  return this.reviewService.submitReview(idReview, idEditor, dto);
}
```

**5. GET /api/review/saya - Editor gets assigned reviews**

```typescript
@Get('saya')
@Peran('editor')
@ApiOperation({ summary: 'Ambil review yang ditugaskan (editor)' })
async ambilReviewSaya(
  @PenggunaSaatIni('id') idEditor: string,
  @Query('status') status?: StatusReview,
) {
  return this.reviewService.ambilReviewByEditor(idEditor, status);
}
```

---

## 5. FRONTEND - ADMIN REVIEW PANEL

### 5.1 Admin Page - Antrian Review

**File**: `frontend/app/(admin)/admin/antrian-review/page.tsx` (Already exists)

**Features yang sudah diimplementasikan**:

- List naskah dengan status=diajukan
- Button "Tugaskan" untuk assign ke editor
- Dialog assign review dengan dropdown editor
- Filter by status
- Pagination

**Yang akan dijelaskan dalam laporan**:

- Component structure
- useQuery untuk fetch naskah diajukan
- useMutation untuk assign review
- Dialog component dengan React Hook Form

---

## 6. FRONTEND - EDITOR DASHBOARD

### 6.1 Editor Page - Review Saya

**File**: `frontend/app/(editor)/editor/review/page.tsx` (Already exists)

**Features**:

- Tab: Ditugaskan, Dalam Proses, Selesai
- Kartu review dengan info naskah
- Button "Mulai Review" (status=ditugaskan)
- Button "Lihat Detail" (semua status)

### 6.2 Editor Page - Detail Review

**File**: `frontend/app/(editor)/editor/review/[id]/page.tsx` (Already exists)

**Features**:

- Info naskah lengkap
- Form tambah feedback (per aspek)
- List feedback yang sudah dibuat
- Form submit review final (rekomendasi + ringkasan)
- Button actions based on status

**Yang akan dijelaskan**:

- Conditional rendering based on review.status
- Form feedback dengan aspek dropdown
- Rating component (1-5 stars)
- Submit review dialog dengan validation

---

## 7. API INTEGRATION - FRONTEND

### 7.1 Review API Client

**File**: `frontend/lib/api/review.ts` (Already exists)

```typescript
export const reviewApi = {
  // Admin endpoints
  tugaskan: async (payload: TugaskanReviewPayload) => {
    const { data } = await api.post("/review/assign", payload);
    return data;
  },

  ambilAntrianReview: async () => {
    const { data } = await api.get("/naskah", {
      params: { status: "diajukan" },
    });
    return data;
  },

  // Editor endpoints
  ambilReviewSaya: async (status?: string) => {
    const { data } = await api.get("/review/saya", {
      params: status ? { status } : {},
    });
    return data;
  },

  mulaiReview: async (idReview: string) => {
    const { data } = await api.put(`/review/${idReview}/mulai`);
    return data;
  },

  tambahFeedback: async (idReview: string, payload: TambahFeedbackPayload) => {
    const { data } = await api.post(`/review/${idReview}/feedback`, payload);
    return data;
  },

  submitReview: async (idReview: string, payload: SubmitReviewPayload) => {
    const { data } = await api.put(`/review/${idReview}/submit`, payload);
    return data;
  },

  ambilDetailReview: async (idReview: string) => {
    const { data } = await api.get(`/review/${idReview}`);
    return data;
  },
};
```

---

## 8. COMPLETE WORKFLOW TESTING

### 8.1 Test Scenario 1: Admin Assigns Review

**Steps**:

1. Penulis ajukan naskah (status: draft → diajukan)
2. Admin login, go to /admin/antrian-review
3. See naskah in queue
4. Click "Tugaskan", select editor
5. Submit assignment
6. Verify: Naskah status → dalam_review
7. Verify: Review created with status=ditugaskan
8. Verify: Editor receives notification

**API Calls**:

```http
# 1. Penulis ajukan
PUT http://localhost:3000/api/naskah/{id}/ajukan

# 2. Admin assign
POST http://localhost:3000/api/review/assign
{
  "idNaskah": "uuid",
  "idEditor": "uuid-editor",
  "catatan": "Mohon review dalam 3 hari"
}
```

### 8.2 Test Scenario 2: Editor Reviews & Submits

**Steps**:

1. Editor login, go to /editor/review
2. See review in "Ditugaskan" tab
3. Click "Mulai Review"
4. Status changes to "Dalam Proses"
5. View naskah file (download/read)
6. Add feedback for each aspek (plot, karakter, gaya_bahasa, etc)
7. Fill rating 1-5 for each feedback
8. Click "Submit Review"
9. Fill rekomendasi (setujui/revisi/tolak) + ringkasan
10. Submit
11. Verify: Review status → selesai
12. Verify: Naskah status updated based on rekomendasi
13. Verify: Penulis receives notification

**API Calls**:

```http
# 1. Mulai review
PUT http://localhost:3000/api/review/{id}/mulai

# 2. Tambah feedback (multiple times)
POST http://localhost:3000/api/review/{id}/feedback
{
  "aspek": "plot",
  "komentar": "Alur cerita sangat menarik dan tidak terduga",
  "rating": 5
}

POST http://localhost:3000/api/review/{id}/feedback
{
  "aspek": "karakter",
  "komentar": "Pengembangan karakter bisa lebih mendalam",
  "rating": 3
}

# 3. Submit review
PUT http://localhost:3000/api/review/{id}/submit
{
  "rekomendasi": "setujui",
  "ringkasanReview": "Naskah sangat baik, siap untuk diterbitkan"
}
```

---

## 9. OPTIONAL FEATURES (Already Implemented)

### 9.1 Editor Self-Assign

**File**: `review.service.ts` - Method `editorSelfAssign()`

**Feature**: Editor bisa ambil naskah dari antrian tanpa perlu admin assign

**Usage**:

```typescript
@Post('self-assign/:idNaskah')
@Peran('editor')
async editorSelfAssign(
  @Param('idNaskah') idNaskah: string,
  @PenggunaSaatIni('id') idEditor: string,
) {
  return this.reviewService.editorSelfAssign(idNaskah, idEditor);
}
```

### 9.2 Review Statistics

**Features**:

- Total reviews per editor
- Average review time
- Review success rate (approved vs rejected)
- Editor performance metrics

**Endpoint**:

```typescript
@Get('statistik')
@Peran('admin', 'editor')
async ambilStatistikReview(@Query('idEditor') idEditor?: string) {
  return this.reviewService.ambilStatistikReview(idEditor);
}
```

---

## 10. METRICS FASE 3

**Total Time**: ~84 jam (12 hari kerja)  
**Backend LOC**: +3,500 (review.service.ts: 740 lines)  
**Frontend LOC**: +4,000  
**Database Tables Added**: 2 (review_naskah, feedback_review)  
**API Endpoints Added**: +15

**Deliverables**:
✅ Review assignment system (admin)  
✅ Review workflow (ditugaskan → dalam_proses → selesai)  
✅ Feedback system with multiple aspects  
✅ Rekomendasi logic (setujui/revisi/tolak)  
✅ Notification system integrated  
✅ Editor dashboard functional  
✅ Admin review panel complete  
✅ Self-assign feature (optional)  
✅ Statistics & analytics

---

## 11. NEXT STEPS → FASE 4

Fase 4 will implement:

- Printing System (Pesanan Cetak)
- Dynamic Pricing (Parameter Harga)
- Production Tracking (Log Produksi)
- Shipping Management (Pengiriman)
- Payment Integration

---

**END OF RANCANGAN FASE 3**

_Catatan: Ini adalah RANCANGAN untuk pembuatan laporan development actual. Laporan actual akan berisi penjelasan detail dari code yang sudah ada dengan screenshot dan flow diagram._
