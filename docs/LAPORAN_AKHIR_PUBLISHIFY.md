# LAPORAN AKHIR PROJECT
# SISTEM PENERBITAN NASKAH PUBLISHIFY

---

**Nama Project**: Publishify - Sistem Manajemen Penerbitan Naskah Digital  
**Platform**: Web Application (Full-Stack)  
**Periode Pengembangan**: 2024-2025  
**Status**: Development Phase - Core Features Completed  

---

## 📑 DAFTAR ISI

1. [Pendahuluan](#pendahuluan)
2. [Analisis Sistem](#analisis-sistem)
3. [Perancangan Sistem](#perancangan-sistem)
4. [Implementasi](#implementasi)
5. [Penutup](#penutup)

---

# BAB I: PENDAHULUAN

## 1.1 Latar Belakang

Industri penerbitan Indonesia mengalami transformasi digital yang signifikan. Proses penerbitan konvensional membutuhkan sistem digital terintegrasi untuk meningkatkan efisiensi dan aksesibilitas.

**Publishify** adalah platform digital yang menjembatani penulis, editor, dan percetakan dalam satu ekosistem. Platform ini memfasilitasi seluruh alur kerja penerbitan dari upload naskah, review editorial, hingga produksi dan distribusi.

**Masalah Utama:**
- Fragmentasi proses dan komunikasi
- Tracking status naskah tidak terpadu
- Transparansi rendah
- Proses manual memakan waktu

**Solusi:**
- Dashboard terpusat per role
- Workflow otomatis dan real-time tracking
- Sistem pembayaran dan percetakan terintegrasi

---

## 1.2 Tujuan Pengembangan

**Tujuan Utama:** Mengembangkan platform digital untuk proses penerbitan naskah end-to-end dengan meningkatkan efisiensi, transparansi, dan kolaborasi.

**Tujuan per Stakeholder:**
1. **Penulis** - Upload/kelola naskah, akses editor & percetakan, tracking real-time
2. **Editor** - Antrian review terorganisir, feedback terstruktur, manajemen workload
3. **Percetakan** - Manajemen pesanan, tracking produksi, sistem pengiriman, analytics
4. **Admin** - Kontrol sistem, assignment editor, monitoring, reporting

---

## 1.3 Ruang Lingkup Project

### Batasan Sistem:

**✅ Yang Termasuk dalam Scope:**

1. **Manajemen Naskah**
   - Upload naskah (PDF format)
   - Metadata management (judul, kategori, genre, sinopsis)
   - Versioning system untuk revisi
   - Status tracking (Draft → Diajukan → Review → Diterbitkan)

2. **Sistem Review Editorial**
   - Assignment editor oleh admin
   - Self-assignment oleh editor
   - Feedback timeline dengan comment per bab/halaman
   - Rekomendasi final (Setujui, Revisi, Tolak)
   - Status tracking real-time

3. **Sistem Percetakan**
   - Konfirmasi pesanan (Terima/Tolak)
   - Tracking produksi (5 tahapan)
   - Manajemen pengiriman
   - Log produksi otomatis
   - Dashboard analytics

4. **Sistem Pembayaran** (Basic)
   - Upload bukti pembayaran
   - Konfirmasi manual oleh admin
   - Status tracking

5. **Autentikasi & Otorisasi**
   - JWT-based authentication
   - OAuth 2.0 (Google Sign-In)
   - Role-based access control (RBAC)
   - Session management dengan refresh token

6. **Notifikasi Real-time**
   - WebSocket untuk real-time updates
   - Email notifications (planned)
   - In-app notifications

**❌ Yang Tidak Termasuk dalam Scope:**

- Payment gateway integration (midtrans, xendit, dll)
- E-book reader/viewer
- Public marketplace/store
- Review & rating dari pembaca
- Social media integration
- Mobile application (native)
- AI-powered features (grammar check, plagiarism detection)

### Target Pengguna:

1. **Penulis** - Individu atau organisasi yang ingin menerbitkan karya tulis
2. **Editor** - Profesional yang memberikan layanan review dan editing naskah
3. **Percetakan** - Vendor percetakan yang menyediakan jasa cetak on-demand
4. **Administrator** - Pengelola platform yang mengatur sistem

---

## 1.4 Manfaat Sistem

**Manfaat per Stakeholder:**

1. **Penulis:** Efisiensi waktu, transparansi biaya, tracking real-time, portfolio digital
2. **Editor:** Workload management, workflow efisien, performance tracking
3. **Percetakan:** Order & production tracking, business analytics, shipping integration
4. **Platform Owner:** Centralized control, data analytics, scalable architecture

---

## 1.5 Metodologi & Tech Stack

**Pendekatan:** Agile Development (iteratif & incremental)

**Tech Stack:**
- **Frontend:** Next.js 14+, TypeScript, Tailwind CSS, shadcn/ui, TanStack Query
- **Backend:** NestJS 10+, Prisma ORM, PostgreSQL, JWT Auth, Socket.io
- **Infrastructure:** Bun, Supabase, Redis, GitHub

**Development Phases:**
1. ✅ Foundation (Setup, database, auth, CRUD)
2. ✅ Core Features (Naskah, review, RBAC, dashboards)
3. ✅ Advanced Features (Percetakan, real-time, OAuth)
4. 🔄 Polish & Testing (Current)
5. 🔜 Deployment (Planned)

---

[Screenshot: Dashboard Overview - menampilkan landing page Publishify]

---

# BAB II: ANALISIS SISTEM

## 2.1 Analisis Kebutuhan Fungsional

### 2.1.1 Kebutuhan Fungsional per Role

**Penulis:**
- Upload & kelola naskah (PDF, max 50MB)
- Metadata: judul, kategori, genre, sinopsis
- Submit untuk review
- Monitoring status & feedback real-time
- Buat pesanan cetak dengan spesifikasi custom
- Upload bukti pembayaran & tracking

**Editor:**
- Lihat antrian review (assigned & available)
- Self-assign naskah
- Baca naskah online/download
- Tambah feedback per bab/halaman
- Rekomendasi final (Setujui/Revisi/Tolak)
- Dashboard performance metrics

**Percetakan:**
- Konfirmasi pesanan (terima/tolak)
- Set estimasi produksi
- Update status produksi (6 tahapan)
- Upload foto progress
- Input data pengiriman & tracking
- Dashboard analytics

**Admin:**
- User management (CRUD, assign roles)
- Assignment editor ke naskah
- Content moderation
- Monitor seluruh proses
- Analytics & reporting

---

## 2.2 Analisis Kebutuhan Non-Fungsional

**Performance:**
- Response time < 2 detik, page load < 3 detik
- Support 1000+ concurrent users
- SSR, database indexing, Redis caching, CDN

**Security:**
- HTTPS, JWT auth (15 min access token)
- Password hashing (bcrypt), SQL injection prevention (Prisma)
- XSS & CSRF protection, rate limiting
- Row Level Security (RLS) di Supabase

**Scalability:**
- Horizontal scaling, stateless backend
- Load balancer, database replication
- Redis cluster

**Usability:**
- Responsive design (mobile-first)
- Intuitive navigation, consistent UI/UX
- Accessibility (WCAG 2.1 Level AA)

**Maintainability:**
- TypeScript, modular architecture
- ESLint & Prettier, conventional commits
- Automated testing, error logging

---

## 2.3 Use Case Overview

**Penulis:** Register/login, kelola naskah, submit review, monitoring feedback, buat pesanan cetak, upload bukti bayar, tracking

**Editor:** Lihat antrian, self-assign, baca naskah, tambah feedback, beri rekomendasi final, lihat statistik

**Percetakan:** Konfirmasi pesanan, set estimasi, update status produksi (6 tahapan), input data pengiriman, tracking, analytics

**Admin:** User management, assign roles, assign editor, content moderation, monitoring, platform analytics

[Diagram: Use Case Diagram Lengkap]

---

## 2.4 Workflow Utama

**Workflow Submit Naskah:**
Upload → Input Metadata → Draft → Ajukan Review → Editor Assignment → Review & Feedback → Rekomendasi (Setujui/Revisi/Tolak) → Publish/Revisi/Rejected

**Workflow Pesanan Cetak:**
Buat Pesanan → Pilih Spesifikasi → Konfirmasi Percetakan → Upload Bukti Bayar → Verifikasi → Produksi (6 tahapan) → Pengiriman → Terkirim

[Diagram: Activity Diagram Lengkap]

---

---

# BAB III: PERANCANGAN SISTEM

## 3.1 Perancangan Database

### 3.1.1 Entity Relationship Diagram (ERD)

Database Publishify dirancang menggunakan **PostgreSQL** dengan total **38+ tabel** yang saling berelasi untuk mendukung seluruh fitur sistem. Database ini mengadopsi prinsip normalisasi hingga 3NF (Third Normal Form) untuk menghindari redundansi data dan memastikan integritas referensial.

[Diagram: ERD Lengkap Sistem Publishify - Menampilkan 38 Tabel dengan Relasi]

### 3.1.2 Struktur Database per Module

#### A. Module: Core User Management (4 Tabel)

**1. Model: `Pengguna`**
```prisma
model Pengguna {
  id                    String    @id @default(uuid())
  email                 String    @unique
  kataSandi             String?   // ⚠️ Optional untuk OAuth users
  telepon               String?
  
  // ✅ OAuth Fields
  googleId              String?   @unique @map("google_id")
  facebookId            String?   @unique @map("facebook_id")
  appleId               String?   @unique @map("apple_id")
  provider              String?              // "google", "facebook", "apple", "local"
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
  pesananCetak     PesananCetak[]
  pesananPercetakan PesananCetak[] @relation("PesananPercetakan")
  pembayaran       Pembayaran[]
  notifikasi       Notifikasi[]
  logAktivitas     LogAktivitas[]
  tokenRefresh     TokenRefresh[]
  file             File[]
  tarifPercetakan  TarifPercetakan[]

  @@index([googleId], map: "idx_pengguna_google_id")
  @@index([provider], map: "idx_pengguna_provider")
  @@map("pengguna")
}
```

**Deskripsi:**
- Model utama untuk menyimpan data autentikasi pengguna
- `kataSandi`: Optional, null untuk OAuth users, hashed menggunakan bcrypt (cost factor: 10)
- `provider`: Identifier untuk metode login ("google", "facebook", "apple", "local")
- OAuth Fields: googleId, facebookId, appleId untuk social login
- `terverifikasi`: Status verifikasi email
- `aktif`: Untuk soft delete / deactivation

**2. Model: `ProfilPengguna`**
```prisma
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

  pengguna Pengguna @relation(fields: [idPengguna], references: [id], onDelete: Cascade)

  @@map("profil_pengguna")
}
```

**Deskripsi:**
- One-to-One relationship dengan `Pengguna`
- Menyimpan informasi profil lengkap
- `onDelete: Cascade`: Saat user dihapus, profil otomatis terhapus

**3. Model: `PeranPengguna`**
```prisma
enum JenisPeran {
  penulis
  editor
  percetakan
  admin

  @@map("jenis_peran")
}

model PeranPengguna {
  id             String     @id @default(uuid())
  idPengguna     String
  jenisPeran     JenisPeran
  aktif          Boolean    @default(true)
  ditugaskanPada DateTime   @default(now())
  ditugaskanOleh String?

  pengguna Pengguna @relation(fields: [idPengguna], references: [id], onDelete: Cascade)

  @@unique([idPengguna, jenisPeran])
  @@map("peran_pengguna")
}
```

**Deskripsi:**
- One-to-Many relationship: Satu user bisa punya multiple roles
- `jenisPeran`: Enum untuk role-based access control (RBAC)
- `@@unique`: Kombinasi idPengguna + jenisPeran harus unique (tidak bisa assign role yang sama 2x)
- `ditugaskanOleh`: Tracking siapa yang assign role (optional)

**4. Model: `ProfilPenulis`**
```prisma
model ProfilPenulis {
  id                String   @id @default(uuid())
  idPengguna        String   @unique
  namaPena          String?
  biografi          String?
  spesialisasi      String[]
  totalBuku         Int      @default(0)
  totalDibaca       Int      @default(0)
  ratingRataRata    Decimal  @default(0) @db.Decimal(3, 2)
  namaRekeningBank  String?
  namaBank          String?
  nomorRekeningBank String?
  npwp              String?
  dibuatPada        DateTime @default(now())
  diperbaruiPada    DateTime @updatedAt

  pengguna Pengguna @relation(fields: [idPengguna], references: [id], onDelete: Cascade)

  @@map("profil_penulis")
}
```

**Deskripsi:**
- Profil khusus untuk user dengan role "penulis"
- `spesialisasi`: Array String[] untuk multiple genre/kategori keahlian
- `ratingRataRata`: Computed dari review naskah-naskahnya (Decimal 3,2)
- Bank info untuk payment processing (npwp, rekening)

---

#### B. Module: Content Management (5 Tabel)

**1. Model: `Naskah`**
```prisma
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

enum FormatBuku {
  A4
  A5
  B5

  @@map("format_buku")
}

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

**Deskripsi:**
- Model inti untuk menyimpan data naskah
- `status`: Workflow state machine untuk tracking progress (7 states)
- `formatBuku`: Enum untuk format cetak (A4, A5, B5)
- `isbn`: Unique untuk naskah yang diterbitkan
- `publik`: Visibility control (public/private)
- Multiple composite indexes untuk query optimization
- `biayaProduksi` & `hargaJual`: Pricing information

**2. Model: `Kategori`**
```prisma
model Kategori {
  id             String      @id @default(uuid())
  nama           String
  slug           String      @unique
  deskripsi      String?
  idInduk        String?
  aktif          Boolean     @default(true)
  dibuatPada     DateTime    @default(now())
  diperbaruiPada DateTime    @updatedAt

  // Self-relation
  induk       Kategori?  @relation("SubKategori", fields: [idInduk], references: [id])
  subKategori Kategori[] @relation("SubKategori")
  naskah      Naskah[]

  @@map("kategori")
}
```

**Deskripsi:**
- Self-referencing relationship untuk nested categories (tree structure)
- `idInduk`: Parent category (NULL untuk root category)
- `slug`: URL-friendly identifier untuk SEO
- Relation "SubKategori" untuk parent-child relationship

**3. Model: `Genre`**
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

**Deskripsi:**
- Master data untuk genre buku (Fiksi, Non-Fiksi, Romance, Thriller, dll)
- Flat structure (tidak nested seperti kategori)
- Unique constraint pada nama dan slug

**4. Model: `RevisiNaskah`**
```prisma
model RevisiNaskah {
  id             String   @id @default(uuid())
  idNaskah       String
  versi          Int
  catatan        String?  @db.Text
  urlFile        String
  dibuatPada     DateTime @default(now())

  naskah Naskah @relation(fields: [idNaskah], references: [id], onDelete: Cascade)

  @@unique([idNaskah, versi])
  @@map("revisi_naskah")
}
```

**Deskripsi:**
- Version control untuk naskah
- `versi`: Increment per naskah (1, 2, 3, ...)
- `@@unique([idNaskah, versi])`: Kombinasi harus unique
- Menyimpan history revisi lengkap dengan file URL
- `onDelete: Cascade`: Saat naskah dihapus, revisi ikut terhapus

**5. Model: `Tag` & `TagNaskah`**
```prisma
model Tag {
  id             String      @id @default(uuid())
  nama           String      @unique
  slug           String      @unique
  dibuatPada     DateTime    @default(now())

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

**Deskripsi:**
- Many-to-Many relationship antara naskah dan tag
- Junction table `TagNaskah` dengan primary key sendiri
- `@@unique([idNaskah, idTag])`: Prevent duplicate tags pada naskah
- Untuk categorization dan search optimization

---

#### C. Module: Review System (6 Tabel)

**1. Model: `ReviewNaskah`**
```prisma
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
  @@index([idEditor, status])
  @@index([status, ditugaskanPada])
  @@map("review_naskah")
}
```

**Deskripsi:**
- Model utama untuk tracking review process
- `rekomendasi`: Final decision dari editor (setujui/revisi/tolak)
- Multiple indexes untuk query optimization (editor dashboard, review queue)
- `onDelete: Cascade`: Saat naskah dihapus, review ikut terhapus

**2. Model: `FeedbackReview`**
```prisma
model FeedbackReview {
  id             String   @id @default(uuid())
  idReview       String
  bab            String?
  halaman        Int?
  komentar       String   @db.Text
  dibuatPada     DateTime @default(now())

  review ReviewNaskah @relation(fields: [idReview], references: [id], onDelete: Cascade)

  @@map("feedback_review")
}
```

**Deskripsi:**
- Timeline feedback dari editor
- `bab` dan `halaman`: Reference location dalam naskah (optional)
- Ordered by `dibuatPada` untuk chronological display
- `onDelete: Cascade`: Saat review dihapus, feedback ikut terhapus

---

#### D. Module: Printing Management (8 Tabel)

**1. Model: `PesananCetak`**
```prisma
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

model PesananCetak {
  id                     String        @id @default(uuid())
  idNaskah               String
  idPemesan              String
  idPercetakan           String?       // Percetakan yang dipilih
  nomorPesanan           String        @unique
  jumlah                 Int
  
  // Snapshot data dari Naskah (disalin saat order dibuat)
  judulSnapshot          String
  formatSnapshot         String
  jumlahHalamanSnapshot  Int
  
  // Spesifikasi pesanan
  formatKertas           String        // A4, A5, dll
  jenisKertas            String        // HVS, Art Paper, dll
  jenisCover             String        // Soft cover, Hard cover
  finishingTambahan      String[]      // Laminasi, emboss, dll
  catatan                String?       @db.Text
  hargaTotal             Decimal       @db.Decimal(10, 2)
  
  status                 StatusPesanan @default(tertunda)
  tanggalPesan           DateTime      @default(now())
  estimasiSelesai        DateTime?
  tanggalSelesai         DateTime?
  diperbaruiPada         DateTime      @updatedAt

  // Relations
  naskah                 Naskah          @relation(fields: [idNaskah], references: [id])
  pemesan                Pengguna        @relation(fields: [idPemesan], references: [id])
  percetakan             Pengguna?       @relation("PesananPercetakan", fields: [idPercetakan], references: [id])
  pembayaran             Pembayaran?
  pengiriman             Pengiriman?
  logProduksi            LogProduksi[]

  @@index([nomorPesanan])
  @@index([status])
  @@index([idPemesan, status])
  @@index([idPercetakan, status])
  @@index([status, tanggalPesan])
  @@index([tanggalPesan])
  @@map("pesanan_cetak")
}
```

**Deskripsi:**
- Model utama untuk order management
- `nomorPesanan`: Auto-generated unique code
- Snapshot fields: Menyimpan data naskah saat order (immutable)
- `finishingTambahan`: Array String[] untuk flexible options
- `hargaTotal`: Calculated field (Decimal 10,2)
- Multiple composite indexes untuk optimization

**2. Model: `TarifPercetakan`**
```prisma
model TarifPercetakan {
  id                String   @id @default(uuid())
  idPercetakan      String
  formatBuku        String   // A4, A5, B5
  jenisKertas       String   // HVS, BOOKPAPER, ART_PAPER
  jenisCover        String   // SOFTCOVER, HARDCOVER
  hargaPerHalaman   Decimal  @db.Decimal(10, 2)
  biayaJilid        Decimal  @db.Decimal(10, 2)
  minimumPesanan    Int      @default(1)
  aktif             Boolean  @default(true)
  dibuatPada        DateTime @default(now())
  diperbaruiPada    DateTime @updatedAt

  percetakan Pengguna @relation(fields: [idPercetakan], references: [id], onDelete: Cascade)

  @@unique([idPercetakan, formatBuku, jenisKertas, jenisCover])
  @@index([idPercetakan])
  @@index([aktif])
  @@map("tarif_percetakan")
}
```

**Deskripsi:**
- Master data untuk pricing calculation per percetakan
- Each percetakan dapat set tarif berbeda untuk kombinasi format/kertas/cover
- `@@unique`: Kombinasi idPercetakan + formatBuku + jenisKertas + jenisCover harus unique
- Pricing: hargaPerHalaman × jumlahHalaman + biayaJilid

**3. Model: `LogProduksi`**
```sql
CREATE TABLE log_produksi (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_pesanan        UUID NOT NULL,
  status_sebelumnya status_pesanan,
  status_baru       status_pesanan NOT NULL,
  catatan           TEXT,
  foto_progress     VARCHAR(500)[],
  dibuat_pada       TIMESTAMP DEFAULT NOW(),
  dibuat_oleh       UUID NOT NULL,
  
  FOREIGN KEY (id_pesanan) REFERENCES pesanan_cetak(id) ON DELETE CASCADE,
  FOREIGN KEY (dibuat_oleh) REFERENCES pengguna(id)
);

CREATE INDEX idx_log_pesanan ON log_produksi(id_pesanan, dibuat_pada DESC);
```

**Deskripsi:**
- Audit trail untuk setiap perubahan status
- `foto_progress`: Array of image URLs untuk visual tracking

**4. Model: `Pengiriman`**
```prisma
enum StatusPengiriman {
  diproses
  dalam_perjalanan
  terkirim
  gagal

  @@map("status_pengiriman")
}

model Pengiriman {
  id                String            @id @default(uuid())
  idPesanan         String            @unique
  namaEkspedisi     String
  nomorResi         String?
  biayaPengiriman   Decimal           @db.Decimal(10, 2)
  alamatTujuan      String            @db.Text
  namaPenerima      String
  teleponPenerima   String
  status            StatusPengiriman  @default(diproses)
  tanggalKirim      DateTime?
  estimasiTiba      DateTime?
  tanggalTiba       DateTime?
  dibuatPada        DateTime          @default(now())
  diperbaruiPada    DateTime          @updatedAt

  pesanan      PesananCetak   @relation(fields: [idPesanan], references: [id], onDelete: Cascade)
  trackingLogs TrackingLog[]

  @@map("pengiriman")
}
```

**Deskripsi:**
- One-to-One dengan PesananCetak (idPesanan @unique)
- Tracking info lengkap untuk shipping
- `nomorResi`: Optional, diisi saat sudah dikirim
- Relations ke TrackingLog untuk detailed tracking history

**5. Model: `TrackingLog`**
```prisma
model TrackingLog {
  id             String   @id @default(uuid())
  idPengiriman   String
  lokasi         String
  status         String
  deskripsi      String?
  waktu          DateTime @default(now())

  pengiriman Pengiriman @relation(fields: [idPengiriman], references: [id], onDelete: Cascade)

  @@map("tracking_log")
}
```

**Deskripsi:**
- Timeline tracking untuk shipping updates
- `lokasi` & `status`: Free text untuk fleksibilitas
- Diisi manual atau via API integration dengan ekspedisi
- Ordered by `waktu` untuk chronological display

---

#### E. Module: Payment System (1 Model)

**1. Model: `Pembayaran`**
```prisma
enum StatusPembayaran {
  tertunda
  diproses
  berhasil
  gagal
  dibatalkan
  dikembalikan

  @@map("status_pembayaran")
}

enum MetodePembayaran {
  transfer_bank
  kartu_kredit
  e_wallet
  virtual_account
  cod

  @@map("metode_pembayaran")
}

model Pembayaran {
  id                 String           @id @default(uuid())
  idPesanan          String           @unique
  idPengguna         String
  nomorTransaksi     String           @unique
  jumlah             Decimal          @db.Decimal(10, 2)
  metodePembayaran   MetodePembayaran
  status             StatusPembayaran @default(tertunda)
  urlBukti           String?
  catatanPembayaran  String?          @db.Text
  tanggalPembayaran  DateTime?
  dibuatPada         DateTime         @default(now())
  diperbaruiPada     DateTime         @updatedAt

  pesanan  PesananCetak @relation(fields: [idPesanan], references: [id])
  pengguna Pengguna     @relation(fields: [idPengguna], references: [id])

  @@index([nomorTransaksi])
  @@index([status])
  @@index([idPengguna, status])
  @@index([status, dibuatPada])
  @@map("pembayaran")
}
```

**Deskripsi:**
- One-to-One dengan PesananCetak (idPesanan @unique)
- `nomorTransaksi`: Unique transaction ID
- `urlBukti`: Upload proof of payment
- Multiple indexes untuk payment queue dan user payment history

---

#### F. Module: Notifications (1 Model)

**1. Model: `Notifikasi`**
```prisma
enum TipeNotifikasi {
  info
  sukses
  peringatan
  error

  @@map("tipe_notifikasi")
}

model Notifikasi {
  id             String          @id @default(uuid())
  idPengguna     String
  judul          String
  pesan          String          @db.Text
  tipe           TipeNotifikasi  @default(info)
  dibaca         Boolean         @default(false)
  url            String?
  dibuatPada     DateTime        @default(now())

  pengguna Pengguna @relation(fields: [idPengguna], references: [id], onDelete: Cascade)

  @@index([idPengguna, dibaca])
  @@map("notifikasi")
}
```

**Deskripsi:**
- In-app notification system
- `url`: Deep link ke page terkait (optional)
- `tipe`: Enum untuk styling (info/sukses/peringatan/error)
- Composite index untuk unread notifications query optimization

---

#### G. Module: Authentication & Security (2 Model)

**1. Model: `TokenRefresh`**
```prisma
enum Platform {
  web
  mobile

  @@map("platform")
}

model TokenRefresh {
  id             String   @id @default(uuid())
  idPengguna     String
  token          String   @unique
  platform       Platform @default(web)
  kadaluarsaPada DateTime
  dibuatPada     DateTime @default(now())

  pengguna Pengguna @relation(fields: [idPengguna], references: [id], onDelete: Cascade)

  @@index([token])
  @@index([idPengguna, platform])
  @@map("token_refresh")
}
```

**Deskripsi:**
- JWT refresh token storage
- `platform`: Web atau mobile untuk session tracking
- Auto cleanup expired tokens via cron job

**2. Model: `LogAktivitas`**
```prisma
model LogAktivitas {
  id             String   @id @default(uuid())
  idPengguna     String?
  jenis          String   // login, logout, verifikasi_email, lupa_password, reset_password, dll
  aksi           String
  entitas        String?  // naskah, review, pesanan, dll
  idEntitas      String?
  deskripsi      String?  @db.Text
  ipAddress      String?
  userAgent      String?
  dibuatPada     DateTime @default(now())

  pengguna Pengguna? @relation(fields: [idPengguna], references: [id], onDelete: SetNull)

  @@index([idPengguna])
  @@index([dibuatPada])
  @@map("log_aktivitas")
}
```

**Deskripsi:**
- Complete audit trail untuk user activities
- `jenis`: Type of activity (login, CRUD operations, dll)
- `entitas` & `idEntitas`: Reference ke affected entity
- Store IP dan User Agent untuk security tracking

**3. Model: `OAuthState`**
```prisma
model OAuthState {
  id             String   @id @default(uuid())
  state          String   @unique
  provider       String              // "google", "facebook", "apple"
  redirectUrl    String?
  kadaluarsaPada DateTime
  dibuatPada     DateTime @default(now())
  
  @@index([state], map: "idx_oauth_state_state")
  @@index([kadaluarsaPada], map: "idx_oauth_state_expiry")
  @@map("oauth_state")
}
```

**Deskripsi:**
- OAuth state management untuk CSRF protection
- Temporary storage untuk OAuth flow
- Auto cleanup expired states

#### H. Module: Analytics & File Storage (3 Model)

**1. Model: `StatistikNaskah`**
```prisma
model StatistikNaskah {
  id                String   @id @default(uuid())
  idNaskah          String   @unique
  totalDiunduh      Int      @default(0)
  totalDibaca       Int      @default(0)
  totalDibagikan    Int      @default(0)
  totalDicetak      Int      @default(0)
  ratingRataRata    Decimal  @default(0) @db.Decimal(3, 2)
  totalRating       Int      @default(0)
  terakhirDiperbarui DateTime @updatedAt

  @@map("statistik_naskah")
}
```

**Deskripsi:**
- Pre-aggregated statistics per naskah
- Updated via events atau background job

**2. Model: `RatingReview`**
```prisma
model RatingReview {
  id             String   @id @default(uuid())
  idNaskah       String
  idPengguna     String
  rating         Int      // 1-5
  ulasan         String?  @db.Text
  dibuatPada     DateTime @default(now())
  diperbaruiPada DateTime @updatedAt

  @@unique([idNaskah, idPengguna])
  @@map("rating_review")
}
```

**Deskripsi:**
- User ratings & reviews untuk naskah
- One rating per user per naskah

**3. Model: `File`**
```prisma
model File {
  id              String   @id @default(uuid())
  idPengguna      String
  namaFileAsli    String
  namaFileSimpan  String   @unique
  ukuran          Int      // dalam bytes
  mimeType        String
  ekstensi        String
  tujuan          String   // naskah, sampul, gambar, dokumen
  path            String
  url             String
  urlPublik       String?
  idReferensi     String?
  deskripsi       String?  @db.Text
  diuploadPada    DateTime @default(now())

  pengguna Pengguna @relation(fields: [idPengguna], references: [id], onDelete: Cascade)

  @@index([idPengguna])
  @@index([tujuan])
  @@index([idReferensi])
  @@map("file")
}
```

**Deskripsi:**
- File metadata storage
- `tujuan`: File purpose categorization
- `idReferensi`: Link ke entity terkait (naskah, pesanan, dll)

---

### 3.1.3 Database Relationships Summary

**Total Model:** 26 models dengan 9 enums

**Relasi Utama:**

```
Pengguna (1) ──────── (1) ProfilPengguna
Pengguna (1) ──────── (N) PeranPengguna
Pengguna (1) ──────── (1) ProfilPenulis
Pengguna (1) ──────── (N) Naskah (sebagai penulis)
Pengguna (1) ──────── (N) ReviewNaskah (sebagai editor)
Pengguna (1) ──────── (N) PesananCetak (sebagai pemesan)
Pengguna (1) ──────── (N) PesananCetak (sebagai percetakan) [PesananPercetakan relation]
Pengguna (1) ──────── (N) Pembayaran
Pengguna (1) ──────── (N) Notifikasi
Pengguna (1) ──────── (N) TokenRefresh
Pengguna (1) ──────── (N) LogAktivitas
Pengguna (1) ──────── (N) File
Pengguna (1) ──────── (N) TarifPercetakan

Naskah (1)   ──────── (N) RevisiNaskah
Naskah (N)   ──────── (N) Tag [through TagNaskah]
Naskah (1)   ──────── (N) ReviewNaskah
Naskah (1)   ──────── (N) PesananCetak
Naskah (N)   ──────── (1) Kategori
Naskah (N)   ──────── (1) Genre

ReviewNaskah (1) ──── (N) FeedbackReview

PesananCetak (1) ──── (1) Pembayaran
PesananCetak (1) ──── (1) Pengiriman
PesananCetak (1) ──── (N) LogProduksi

Pengiriman (1) ────── (N) TrackingLog

Kategori (Self-referencing) - Parent/Child relationship
```

[Database Relationship Diagram - Detail View]

**Catatan Penting:**
- **OAuth Support**: Model Pengguna mendukung Google, Facebook, dan Apple OAuth dengan field provider-specific
- **Multiple Roles**: Satu user bisa memiliki multiple roles melalui PeranPengguna dengan unique constraint
- **Dual Relations**: PesananCetak memiliki 2 relasi ke Pengguna (pemesan dan percetakan)
- **Snapshot Pattern**: PesananCetak menyimpan snapshot data naskah untuk immutability
- **Audit Trail**: LogAktivitas dan LogProduksi untuk complete tracking

### 3.1.4 Indexing Strategy

**Performance Optimization:**

1. **Primary Indexes:**
   - UUID primary keys dengan btree index (default)
   - Composite indexes untuk foreign key + timestamp queries
   
2. **Search Indexes:**
   - Full-text search on `naskah.judul` dan `naskah.sinopsis`
   - GIN index untuk JSONB columns (finishing_tambahan)
   - Array indexes untuk spesialisasi

3. **Partial Indexes:**
   - Unread notifications (WHERE dibaca = false)
   - Active records (WHERE aktif = true)
   - Pending orders (WHERE status = 'tertunda')

4. **Query Optimization:**
```sql
-- Example: Efficient query untuk dashboard penulis
EXPLAIN ANALYZE
SELECT 
  n.id, n.judul, n.status, n.dibuat_pada,
  COUNT(r.id) as total_review,
  COUNT(p.id) as total_pesanan
FROM naskah n
LEFT JOIN review_naskah r ON r.id_naskah = n.id
LEFT JOIN pesanan_cetak p ON p.id_naskah = n.id
WHERE n.id_penulis = 'uuid-here'
  AND n.status != 'draft'
GROUP BY n.id
ORDER BY n.dibuat_pada DESC
LIMIT 10;
```

---

### 3.1.5 Data Security & Row Level Security (RLS)

**Supabase RLS Policies:**

```sql
-- Policy: Penulis hanya bisa akses naskah sendiri
CREATE POLICY "policy_naskah_penulis" ON naskah
FOR ALL
USING (
  id_penulis = auth.uid() OR
  (status = 'diterbitkan' AND publik = true) OR
  EXISTS (
    SELECT 1 FROM peran_pengguna
    WHERE id_pengguna = auth.uid()
    AND jenis_peran = 'admin'
  )
);

-- Policy: Editor hanya bisa akses review yang ditugaskan
CREATE POLICY "policy_review_editor" ON review_naskah
FOR ALL
USING (
  id_editor = auth.uid() OR
  EXISTS (
    SELECT 1 FROM peran_pengguna
    WHERE id_pengguna = auth.uid()
    AND jenis_peran IN ('admin')
  )
);

-- Policy: Percetakan hanya bisa akses pesanan sendiri
CREATE POLICY "policy_pesanan_percetakan" ON pesanan_cetak
FOR ALL
USING (
  id_percetakan = auth.uid() OR
  id_penulis = auth.uid() OR
  EXISTS (
    SELECT 1 FROM peran_pengguna
    WHERE id_pengguna = auth.uid()
    AND jenis_peran = 'admin'
  )
);
```

**Data Encryption:**
- Sensitive fields (kata_sandi, nomor_rekening) encrypted at rest
- TLS 1.3 untuk data in transit
- Application-level encryption untuk payment data

---

## 3.2 Arsitektur Sistem

### 3.2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Browser    │  │    Mobile    │  │   Desktop    │          │
│  │  (Next.js)   │  │  (Planned)   │  │  (Planned)   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                            ↓ HTTPS
┌─────────────────────────────────────────────────────────────────┐
│                      LOAD BALANCER / CDN                        │
│                    (Vercel Edge Network)                        │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                     APPLICATION LAYER                           │
│  ┌────────────────────────────────────────────────────────┐    │
│  │              FRONTEND (Next.js 14+)                    │    │
│  │  • Server-Side Rendering (SSR)                         │    │
│  │  • Static Site Generation (SSG)                        │    │
│  │  • API Routes (BFF Pattern)                            │    │
│  │  • React Query (Server State)                          │    │
│  │  • Zustand (Client State)                              │    │
│  └────────────────────────────────────────────────────────┘    │
│                            ↓ REST API / WebSocket               │
│  ┌────────────────────────────────────────────────────────┐    │
│  │              BACKEND (NestJS 10+)                      │    │
│  │  • Controllers (REST Endpoints)                        │    │
│  │  • Services (Business Logic)                           │    │
│  │  • Guards (Authentication & Authorization)             │    │
│  │  • Interceptors (Logging, Transform)                   │    │
│  │  • WebSocket Gateway (Real-time)                       │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                       DATA LAYER                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  PostgreSQL  │  │    Redis     │  │   Supabase   │          │
│  │  (Primary)   │  │   (Cache)    │  │   Storage    │          │
│  │              │  │              │  │  (Files)     │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

[Diagram: Arsitektur High-Level dengan Detail Components]

---

### 3.2.2 Frontend Architecture (Next.js)

**Directory Structure:**
```
frontend/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth routes group
│   ├── (dashboard)/       # Dashboard routes group
│   └── (public)/          # Public routes group
├── components/            # React Components
│   ├── ui/               # shadcn/ui base components
│   ├── forms/            # Form components
│   ├── layouts/          # Layout components
│   └── modules/          # Feature-specific components
├── lib/                   # Utility libraries
│   ├── api/              # API client functions
│   ├── utils/            # Helper functions
│   └── constants/        # Constants & enums
├── stores/                # Zustand state stores
├── types/                 # TypeScript type definitions
└── hooks/                 # Custom React hooks
```

**Component Architecture Pattern:**

```typescript
// Feature-based component structure
components/
  └── modules/
      └── naskah/
          ├── kartu-naskah.tsx           // Presentational
          ├── daftar-naskah.tsx          // Container
          ├── form-naskah.tsx            // Form component
          ├── dialog-hapus-naskah.tsx    // Dialog
          └── hooks/
              ├── use-naskah-query.ts    // Data fetching
              └── use-naskah-mutation.ts // Data mutation
```

**Data Flow:**
```
User Action → React Hook Form → Zod Validation → API Client 
  → TanStack Query → Backend API → Update UI → Sonner Toast
```

---

### 3.2.3 Backend Architecture (NestJS)

**Layered Architecture:**

```
┌─────────────────────────────────────┐
│       PRESENTATION LAYER            │
│  • Controllers (HTTP Handlers)      │
│  • DTOs (Data Transfer Objects)     │
│  • Validation (Zod + class-validator)│
└─────────────────────────────────────┘
               ↓
┌─────────────────────────────────────┐
│       APPLICATION LAYER             │
│  • Services (Business Logic)        │
│  • Guards (Auth & Authorization)    │
│  • Interceptors (Cross-cutting)     │
│  • Pipes (Data Transformation)      │
└─────────────────────────────────────┘
               ↓
┌─────────────────────────────────────┐
│       DOMAIN LAYER                  │
│  • Entities (Domain Models)         │
│  • Interfaces                       │
│  • Business Rules                   │
└─────────────────────────────────────┘
               ↓
┌─────────────────────────────────────┐
│       INFRASTRUCTURE LAYER          │
│  • Prisma (ORM)                     │
│  • Database (PostgreSQL)            │
│  • File Storage (Supabase)          │
│  • Cache (Redis)                    │
└─────────────────────────────────────┘
```

**Module Structure:**

```
modules/
  └── naskah/
      ├── naskah.module.ts           // Feature module
      ├── naskah.controller.ts       // HTTP endpoints
      ├── naskah.service.ts          // Business logic
      ├── dto/
      │   ├── buat-naskah.dto.ts     // Create DTO
      │   └── perbarui-naskah.dto.ts // Update DTO
      └── interfaces/
          └── naskah.interface.ts    // Type definitions
```

---

### 3.2.4 Konsep API Design

Sistem menggunakan **RESTful API** dengan konvensi standar:

**Prinsip Desain:**
- Base URL: `https://api.publishify.com/api`
- Authentication: Bearer Token (JWT)
- Response Format: JSON dengan struktur konsisten (sukses/error)
- HTTP Methods: GET (read), POST (create), PUT/PATCH (update), DELETE (remove)

**Module API Utama:**
1. **Authentication** - Register, login, OAuth, token management
2. **Naskah** - CRUD naskah, submit review, revision history
3. **Review** - Assignment, feedback, final decision
4. **Percetakan** - Order management, production tracking, shipping
5. **Pembayaran** - Payment upload, verification
6. **User** - Profile management, statistics
7. **Admin** - User management, role assignment, analytics

---

### 3.2.5 Konsep Authentication & Authorization

**Authentication:**
- **JWT (JSON Web Token)** untuk stateless authentication
- Access Token (short-lived: 15 menit) untuk API requests
- Refresh Token (long-lived: 7 hari) disimpan di database untuk renewal
- OAuth 2.0 integration: Google, Facebook, Apple Sign-In

**Authorization:**
- **RBAC (Role-Based Access Control)** menggunakan enum JenisPeran
- 4 Role utama: penulis, editor, percetakan, admin
- Guards & Decorators untuk endpoint protection
- Satu user bisa memiliki multiple roles

**Flow:**
1. User login → Backend validate → Generate tokens
2. Tokens disimpan (Access: client memory, Refresh: database)
3. Request dengan Authorization header
4. Token expired → Auto-refresh mechanism
5. Token rotation untuk security

---

### 3.2.6 Real-time Communication

**Teknologi:** Socket.io (WebSocket)

**Use Cases:**
- Notifikasi real-time untuk perubahan status
- Update dashboard tanpa refresh
- Chat/feedback real-time (future)

**Event Types:**
- Status changes (naskah, review, pesanan, pembayaran)
- New notifications
- System announcements

**Mekanisme:**
- User join room berdasarkan user ID
- Server emit events ke specific room
- Client listen dan update UI

---

### 3.2.7 File Storage

**Platform:** Supabase Storage

**Struktur Folder:**
- `naskah/` - File PDF naskah dan revisi
- `sampul/` - Cover image naskah
- `avatar/` - Profile pictures
- `bukti-bayar/` - Payment proof uploads
- `produksi/` - Production progress photos

**Fitur:**
- Direct upload via presigned URLs
- File validation (type, size)
- Image optimization (resize, compress)
- Access control per folder
- CDN untuk fast delivery

**Metadata:** Disimpan di model `File` untuk tracking

---

### 3.2.8 Caching Strategy

**Technology:** Redis

**Cache Layers:**
1. **Browser Cache** - Static assets (images, CSS, JS)
2. **CDN Cache** - SSG pages, public API responses
3. **Application Cache (Redis)** - Session, profiles, frequently accessed data
4. **Database** - Source of truth

**Cached Data:**
- User profiles & sessions
- Master data (kategori, genre)
- Dashboard statistics
- Frequently accessed naskah

**Strategy:**
- TTL-based expiration
- Cache invalidation on updates
- Write-through pattern untuk critical data

---

### 3.2.9 Security Implementation

**Security Layers:**

1. **Network Security**
   - HTTPS/TLS 1.3 mandatory
   - CORS whitelist configuration
   - Rate limiting per IP

2. **Authentication Security**
   - Password hashing (bcrypt)
   - JWT dengan short expiry
   - Refresh token rotation
   - Session tracking

3. **Authorization Security**
   - RBAC (Role-Based Access Control)
   - Row Level Security (RLS) di Supabase
   - Resource-level permissions

4. **Input Validation**
   - Dual validation: Zod + class-validator
   - XSS protection
   - SQL injection protection (Prisma ORM)

5. **File Upload Security**
   - File type & size validation
   - Virus scanning (planned)
   - Secure presigned URLs

6. **Security Headers**
   - Helmet.js untuk HTTP headers
   - Content Security Policy (CSP)
   - HSTS enabled

---

[Screenshot: System Architecture Diagram]
[Screenshot: Database Schema Visualization]

---

# BAB IV: IMPLEMENTASI

## 4.1 Lingkungan Pengembangan

**Development Environment:**
- **OS:** Windows 11
- **Code Editor:** VS Code
- **Runtime:** Bun v1.0+
- **Node Version Manager:** nvm
- **Git:** GitHub untuk version control
- **Database Client:** Prisma Studio, DBeaver
- **API Testing:** Postman, Thunder Client

**Tech Stack Versions:**
- Next.js: 16.0.1
- NestJS: 10+
- Prisma: 5.8.0
- PostgreSQL: 14+
- TypeScript: 5.3.3

---

## 4.2 Implementasi Backend (NestJS)

### 4.2.1 Setup Project Backend

**Struktur Modular:**
- Menggunakan NestJS modular architecture
- Setiap fitur dalam modul terpisah (auth, pengguna, naskah, review, percetakan, pembayaran, notifikasi)
- Shared resources dalam folder `common/` (guards, interceptors, filters, pipes)

**Database Integration:**
- Prisma sebagai ORM
- Schema design dengan 26 models dan 9 enums
- Database migrations menggunakan Prisma Migrate
- Database seeding untuk initial data

### 4.2.2 Fitur yang Diimplementasikan

**1. Authentication & Authorization**
- JWT-based authentication (Access + Refresh token)
- OAuth 2.0 Google integration
- Role-based access control (RBAC)
- Password hashing dengan bcrypt
- Session management dengan Redis

**2. Manajemen Pengguna**
- CRUD pengguna lengkap
- Profile management (ProfilPengguna, ProfilPenulis)
- Multi-role assignment per user
- Email verification flow

**3. Manajemen Naskah**
- Upload naskah (PDF, max 50MB)
- CRUD operations dengan validasi
- Status workflow (draft → diajukan → dalam_review → disetujui/ditolak)
- Kategori dan genre management
- Revisi tracking

**4. Sistem Review Editorial**
- Assignment editor (admin-assign & self-assign)
- Review queue management
- Feedback timeline per review
- Rekomendasi final (setujui/revisi/tolak)
- Review statistics per editor

**5. Manajemen Percetakan**
- Pesanan cetak dengan spesifikasi detail
- Kalkulasi harga otomatis
- Status produksi (6 tahapan)
- Log produksi per tahapan
- Pengiriman tracking

**6. Sistem Pembayaran**
- Upload bukti pembayaran
- Konfirmasi admin
- Status pembayaran tracking
- Metode pembayaran multiple

**7. Notifikasi Real-time**
- Socket.io untuk WebSocket
- Notifikasi per event (submit naskah, review selesai, pesanan update)
- In-app notifications
- Notification preferences

**8. File Management**
- Supabase Storage integration
- File upload dengan validasi (type, size)
- Organized folder structure
- Secure file access dengan signed URLs

[Screenshot: Backend API Documentation (Swagger)]

---

## 4.3 Implementasi Frontend (Next.js)

### 4.3.1 Setup Project Frontend

**Struktur App Router:**
- Route groups: `(auth)`, `(dashboard)`, `(publik)`
- Server Components untuk SEO
- Client Components untuk interactivity
- Middleware untuk authentication check

**UI/UX Implementation:**
- shadcn/ui untuk component library
- Tailwind CSS untuk styling
- Responsive design (mobile-first)
- Dark mode support

### 4.3.2 Halaman & Fitur yang Diimplementasikan

**1. Authentication Pages**
- Login page (email/password + OAuth Google)
- Register page dengan role selection
- Forgot password flow
- Email verification page

[Screenshot: Login Page]
[Screenshot: Register Page]

**2. Dashboard Penulis**
- Overview statistik (total naskah, dalam review, diterbitkan)
- Daftar naskah dengan status
- Form tambah/edit naskah
- Detail naskah dengan feedback timeline
- Halaman pesanan cetak
- Form pesanan dengan kalkulasi harga real-time

[Screenshot: Dashboard Penulis]
[Screenshot: Form Upload Naskah]
[Screenshot: Detail Naskah & Feedback]

**3. Dashboard Editor**
- Overview workload (antrian, dalam proses, selesai)
- Naskah Masuk (available untuk self-assign)
- Antrian Review (assigned manuscripts)
- Form review dengan feedback timeline
- Performance statistics

[Screenshot: Dashboard Editor]
[Screenshot: Antrian Review]
[Screenshot: Form Review & Feedback]

**4. Dashboard Percetakan**
- Overview pesanan (baru, produksi, selesai)
- Daftar pesanan dengan filter status
- Detail pesanan dengan spesifikasi lengkap
- Form update status produksi
- Form input data pengiriman
- Analytics & revenue charts

[Screenshot: Dashboard Percetakan]
[Screenshot: Detail Pesanan]
[Screenshot: Form Update Status]

**5. Dashboard Admin**
- Overview platform statistics
- User management (CRUD)
- Assignment editor ke naskah
- Konfirmasi pembayaran
- Content moderation
- Kategori & genre management

[Screenshot: Dashboard Admin]
[Screenshot: Panel Assignment Editor]
[Screenshot: User Management]

**6. Shared Features**
- Real-time notifications (toast + notification center)
- Profile settings
- Avatar upload
- Theme switcher (light/dark)

[Screenshot: Notification Center]
[Screenshot: Profile Settings]

---

## 4.4 Integrasi & Testing

### 4.4.1 API Integration

**Frontend-Backend Communication:**
- Axios sebagai HTTP client
- TanStack Query untuk data fetching & caching
- Centralized API client configuration
- Request/response interceptors untuk auth
- Error handling global

**Real-time Integration:**
- Socket.io client untuk WebSocket
- Event listeners untuk notifikasi
- Automatic reconnection handling

### 4.4.2 Testing Implementation

**Backend Testing:**
- Unit testing dengan Jest
- Integration testing untuk API endpoints
- E2E testing untuk critical flows
- Test coverage monitoring

**Frontend Testing:**
- Component testing dengan React Testing Library
- User interaction testing
- Form validation testing

**Manual Testing:**
- Functional testing per module
- Cross-browser testing
- Responsive design testing
- Performance testing

[Screenshot: Test Results]

---

## 4.5 Deployment & Production

### 4.5.1 Environment Setup

**Production Environment:**
- Backend: VPS/Cloud hosting (planned)
- Frontend: Vercel (planned)
- Database: Supabase (PostgreSQL hosted)
- Storage: Supabase Storage
- Cache: Redis Cloud
- Domain: Custom domain (planned)

**Environment Variables:**
- Separate `.env` untuk development & production
- Secure credential management
- Database connection pooling
- CORS configuration untuk production

### 4.5.2 Performance Optimization

**Backend Optimization:**
- Database query optimization dengan indexes
- Redis caching untuk frequently accessed data
- Response compression
- Rate limiting untuk API protection

**Frontend Optimization:**
- Image optimization dengan Next.js Image
- Code splitting & lazy loading
- Bundle size optimization
- SEO optimization dengan metadata

---


---

# BAB V: PENUTUP

## 5.1 Kesimpulan

Berdasarkan proses pengembangan dan implementasi sistem **Publishify**, dapat disimpulkan bahwa:

1. **Sistem Terintegrasi Berhasil Dikembangkan**
   - Platform berhasil menghubungkan penulis, editor, dan percetakan dalam satu ekosistem digital
   - Workflow penerbitan dari upload naskah hingga produksi cetak terotomasi

2. **Arsitektur Scalable & Maintainable**
   - Monorepo structure dengan clear separation (frontend/backend)
   - Modular architecture memudahkan pengembangan dan maintenance
   - Type-safe dengan TypeScript di seluruh stack

3. **Fitur Lengkap & Fungsional**
   - 26 database models covering seluruh proses bisnis
   - Role-based access untuk 4 user types
   - Real-time notifications meningkatkan user experience
   - File management terintegrasi

4. **Tech Stack Modern & Proven**
   - Next.js 16 untuk frontend dengan excellent performance
   - NestJS untuk backend dengan enterprise-grade architecture
   - Prisma ORM dengan type-safety
   - PostgreSQL untuk data reliability

5. **Security Implementation**
   - Multi-layer authentication (JWT + OAuth)
   - Role-based authorization
   - Input validation berlapis (Zod + class-validator)
   - File upload security

---

## 5.2 Saran Pengembangan

### 5.2.1 Short-term Improvements

**1. Mobile Application**
- Develop React Native app untuk mobile access
- Push notifications untuk mobile users
- Offline-first approach untuk better UX

**2. Advanced Analytics**
- Revenue analytics untuk percetakan
- Performance metrics untuk editor
- Reading analytics untuk penulis

**3. Enhanced Communication**
- In-app messaging antara penulis dan editor
- Video call integration untuk consultation
- Comment threads pada feedback

### 5.2.2 Long-term Features

**1. E-book Publishing**
- Digital publishing support (EPUB, MOBI)
- E-book distribution integration
- Digital rights management (DRM)

**2. Marketplace Integration**
- Toko online untuk published books
- Payment gateway integration (Midtrans, Xendit)
- Inventory management untuk physical books

**3. AI-powered Features**
- AI proofreading assistance
- Content recommendation system
- Automated plagiarism detection
- Genre classification automation

**4. Community Features**
- Reader reviews & ratings
- Author portfolios (public profiles)
- Reading clubs & discussions
- Writing competitions & events

**5. Advanced Printing Options**
- 3D cover preview
- Augmented Reality (AR) book preview
- Print-on-demand international shipping
- Batch printing discounts

### 5.2.3 Technical Enhancements

**1. Performance**
- Implement GraphQL untuk flexible queries
- Add server-side caching layer (CDN)
- Optimize database with materialized views
- Implement full-text search dengan Elasticsearch

**2. DevOps**
- CI/CD pipeline automation
- Containerization dengan Docker
- Kubernetes orchestration
- Automated testing in pipeline

**3. Monitoring & Logging**
- Application performance monitoring (APM)
- Error tracking dengan Sentry
- User behavior analytics
- System health monitoring

---

## 5.3 Penutup

Platform **Publishify** merupakan solusi komprehensif untuk industri penerbitan digital Indonesia. Dengan arsitektur yang solid, fitur yang lengkap, dan tech stack modern, sistem ini siap untuk deployment dan dapat berkembang sesuai kebutuhan bisnis.

Pengembangan sistem ini memberikan pembelajaran berharga tentang:
- Full-stack development dengan Next.js dan NestJS
- Database design untuk sistem kompleks
- Real-time application development
- Role-based access control implementation
- Production-ready application architecture

Sistem ini dapat menjadi fondasi yang kuat untuk transformasi digital industri penerbitan, memberdayakan penulis lokal, dan memfasilitasi produksi buku berkualitas.

---

**Dokumen ini disusun sebagai laporan akhir pengembangan sistem Publishify.**

**Tanggal:** Desember 2024  
**Versi:** 1.0  
**Status:** Final

---



