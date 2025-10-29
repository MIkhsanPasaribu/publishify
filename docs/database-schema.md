# Database Schema - Publishify

## Overview

Publishify menggunakan PostgreSQL 14+ sebagai database utama dengan Prisma sebagai ORM. Total terdapat **28+ tabel** yang dikelompokkan menjadi beberapa domain.

## Database Design Principles

1. **Normalisasi**: Database mengikuti prinsip normalisasi 3NF
2. **UUID Primary Keys**: Semua tabel menggunakan UUID sebagai primary key
3. **Timestamps**: Semua tabel memiliki `dibuatPada` dan `diperbaruiPada` (jika applicable)
4. **Soft Delete**: Support untuk soft delete (planned untuk future)
5. **Indexes**: Index pada foreign keys dan kolom yang sering diquery
6. **Constraints**: Proper foreign key constraints dan unique constraints

## Domain Model

### 1. User Management Domain

#### Tabel: `pengguna`

**Deskripsi**: Core user authentication dan data pengguna

| Kolom                 | Tipe      | Deskripsi                       |
| --------------------- | --------- | ------------------------------- |
| id                    | UUID      | Primary key                     |
| email                 | String    | Email unik                      |
| kataSandi             | String    | Password (hashed dengan bcrypt) |
| telepon               | String?   | Nomor telepon                   |
| aktif                 | Boolean   | Status aktif user               |
| terverifikasi         | Boolean   | Status verifikasi email         |
| emailDiverifikasiPada | DateTime? | Waktu verifikasi email          |
| loginTerakhir         | DateTime? | Timestamp login terakhir        |
| dibuatPada            | DateTime  | Timestamp created               |
| diperbaruiPada        | DateTime  | Timestamp updated               |

**Relations**:

- Has one `ProfilPengguna`
- Has many `PeranPengguna`
- Has one `ProfilPenulis` (optional)
- Has many `Naskah`
- Has many `ReviewNaskah`
- Has many `PesananCetak`
- Has many `Pembayaran`
- Has many `Notifikasi`
- Has many `LogAktivitas`
- Has many `TokenRefresh`

#### Tabel: `profil_pengguna`

**Deskripsi**: Detail profil pengguna

| Kolom        | Tipe      | Deskripsi               |
| ------------ | --------- | ----------------------- |
| id           | UUID      | Primary key             |
| idPengguna   | UUID      | FK to pengguna (unique) |
| namaDepan    | String?   | Nama depan              |
| namaBelakang | String?   | Nama belakang           |
| namaTampilan | String?   | Display name            |
| bio          | String?   | Biografi singkat        |
| urlAvatar    | String?   | URL avatar/foto         |
| tanggalLahir | DateTime? | Tanggal lahir           |
| jenisKelamin | String?   | Jenis kelamin           |
| alamat       | String?   | Alamat lengkap          |
| kota         | String?   | Kota                    |
| provinsi     | String?   | Provinsi                |
| kodePos      | String?   | Kode pos                |

#### Tabel: `peran_pengguna`

**Deskripsi**: User roles (RBAC)

| Kolom          | Tipe       | Deskripsi                |
| -------------- | ---------- | ------------------------ |
| id             | UUID       | Primary key              |
| idPengguna     | UUID       | FK to pengguna           |
| jenisPeran     | JenisPeran | Role type enum           |
| aktif          | Boolean    | Status aktif             |
| ditugaskanPada | DateTime   | Timestamp assignment     |
| ditugaskanOleh | String?    | ID admin yang menugaskan |

**Enum JenisPeran**:

- `penulis`: Author/Penulis
- `editor`: Editor/Reviewer
- `percetakan`: Printing partner
- `admin`: System administrator

#### Tabel: `profil_penulis`

**Deskripsi**: Extended profile untuk penulis

| Kolom             | Tipe     | Deskripsi                |
| ----------------- | -------- | ------------------------ |
| id                | UUID     | Primary key              |
| idPengguna        | UUID     | FK to pengguna (unique)  |
| namaPena          | String?  | Pen name                 |
| biografi          | String?  | Biografi penulis         |
| spesialisasi      | String[] | Array genre spesialisasi |
| totalBuku         | Int      | Total buku diterbitkan   |
| totalDibaca       | Int      | Total views/reads        |
| ratingRataRata    | Decimal  | Average rating           |
| namaRekeningBank  | String?  | Nama rekening            |
| namaBank          | String?  | Nama bank                |
| nomorRekeningBank | String?  | Nomor rekening           |
| npwp              | String?  | NPWP untuk royalti       |

### 2. Content Management Domain

#### Tabel: `naskah`

**Deskripsi**: Core manuscript/book data

| Kolom           | Tipe         | Deskripsi                     |
| --------------- | ------------ | ----------------------------- |
| id              | UUID         | Primary key                   |
| idPenulis       | UUID         | FK to pengguna                |
| judul           | String       | Judul naskah                  |
| subJudul        | String?      | Sub judul                     |
| sinopsis        | Text         | Sinopsis/deskripsi            |
| isbn            | String?      | ISBN (unique)                 |
| idKategori      | UUID         | FK to kategori                |
| idGenre         | UUID         | FK to genre                   |
| bahasaTulis     | String       | Language code (default: 'id') |
| jumlahHalaman   | Int?         | Total halaman                 |
| jumlahKata      | Int?         | Total kata                    |
| status          | StatusNaskah | Status enum                   |
| urlSampul       | String?      | Cover image URL               |
| urlFile         | String?      | File naskah URL               |
| publik          | Boolean      | Public visibility             |
| diterbitkanPada | DateTime?    | Published date                |

**Enum StatusNaskah**:

- `draft`: Draft awal
- `diajukan`: Submitted untuk review
- `dalam_review`: Sedang direview
- `perlu_revisi`: Butuh revisi
- `disetujui`: Approved
- `ditolak`: Rejected
- `diterbitkan`: Published

**Indexes**:

- `idPenulis`
- `status`
- `idKategori`
- `idGenre`

#### Tabel: `kategori`

**Deskripsi**: Hierarchical categories

| Kolom     | Tipe    | Deskripsi                  |
| --------- | ------- | -------------------------- |
| id        | UUID    | Primary key                |
| nama      | String  | Nama kategori              |
| slug      | String  | URL-friendly slug (unique) |
| deskripsi | String? | Deskripsi                  |
| idInduk   | UUID?   | FK to parent kategori      |
| aktif     | Boolean | Active status              |

**Self-referencing**: Support untuk sub-kategori

#### Tabel: `genre`

**Deskripsi**: Book genres

| Kolom     | Tipe    | Deskripsi                  |
| --------- | ------- | -------------------------- |
| id        | UUID    | Primary key                |
| nama      | String  | Nama genre (unique)        |
| slug      | String  | URL-friendly slug (unique) |
| deskripsi | String? | Deskripsi                  |
| aktif     | Boolean | Active status              |

#### Tabel: `tag`

**Deskripsi**: Tags untuk naskah

| Kolom | Tipe   | Deskripsi                  |
| ----- | ------ | -------------------------- |
| id    | UUID   | Primary key                |
| nama  | String | Nama tag (unique)          |
| slug  | String | URL-friendly slug (unique) |

#### Tabel: `tag_naskah`

**Deskripsi**: Many-to-many relationship naskah-tag

| Kolom    | Tipe | Deskripsi    |
| -------- | ---- | ------------ |
| id       | UUID | Primary key  |
| idNaskah | UUID | FK to naskah |
| idTag    | UUID | FK to tag    |

**Unique constraint**: (idNaskah, idTag)

#### Tabel: `revisi_naskah`

**Deskripsi**: Version history naskah

| Kolom    | Tipe   | Deskripsi                 |
| -------- | ------ | ------------------------- |
| id       | UUID   | Primary key               |
| idNaskah | UUID   | FK to naskah              |
| versi    | Int    | Version number            |
| catatan  | Text?  | Revision notes            |
| urlFile  | String | File URL for this version |

**Unique constraint**: (idNaskah, versi)

### 3. Review System Domain

#### Tabel: `review_naskah`

**Deskripsi**: Review assignments

| Kolom          | Tipe         | Deskripsi               |
| -------------- | ------------ | ----------------------- |
| id             | UUID         | Primary key             |
| idNaskah       | UUID         | FK to naskah            |
| idEditor       | UUID         | FK to pengguna (editor) |
| status         | StatusReview | Status enum             |
| rekomendasi    | Rekomendasi? | Final recommendation    |
| catatan        | Text?        | Review notes            |
| ditugaskanPada | DateTime     | Assignment date         |
| dimulaiPada    | DateTime?    | Start date              |
| selesaiPada    | DateTime?    | Completion date         |

**Enum StatusReview**:

- `ditugaskan`: Assigned
- `dalam_proses`: In progress
- `selesai`: Completed
- `dibatalkan`: Cancelled

**Enum Rekomendasi**:

- `setujui`: Approve
- `revisi`: Request revision
- `tolak`: Reject

#### Tabel: `feedback_review`

**Deskripsi**: Detailed feedback dari editor

| Kolom    | Tipe    | Deskripsi           |
| -------- | ------- | ------------------- |
| id       | UUID    | Primary key         |
| idReview | UUID    | FK to review_naskah |
| bab      | String? | Chapter/section     |
| halaman  | Int?    | Page number         |
| komentar | Text    | Feedback comment    |

### 4. Printing System Domain

#### Tabel: `pesanan_cetak`

**Deskripsi**: Printing orders

| Kolom             | Tipe          | Deskripsi                  |
| ----------------- | ------------- | -------------------------- |
| id                | UUID          | Primary key                |
| idNaskah          | UUID          | FK to naskah               |
| idPemesan         | UUID          | FK to pengguna             |
| idPercetakan      | UUID?         | FK to percetakan           |
| nomorPesanan      | String        | Order number (unique)      |
| jumlah            | Int           | Quantity                   |
| formatKertas      | String        | Paper format (A4, A5, etc) |
| jenisKertas       | String        | Paper type                 |
| jenisCover        | String        | Cover type                 |
| finishingTambahan | String[]      | Additional finishing       |
| catatan           | Text?         | Order notes                |
| hargaTotal        | Decimal       | Total price                |
| status            | StatusPesanan | Status enum                |
| tanggalPesan      | DateTime      | Order date                 |
| estimasiSelesai   | DateTime?     | Estimated completion       |
| tanggalSelesai    | DateTime?     | Actual completion          |

**Enum StatusPesanan**:

- `tertunda`: Pending
- `diterima`: Accepted
- `dalam_produksi`: In production
- `kontrol_kualitas`: Quality control
- `siap`: Ready
- `dikirim`: Shipped
- `terkirim`: Delivered
- `dibatalkan`: Cancelled

#### Tabel: `log_produksi`

**Deskripsi**: Production tracking log

| Kolom     | Tipe   | Deskripsi           |
| --------- | ------ | ------------------- |
| id        | UUID   | Primary key         |
| idPesanan | UUID   | FK to pesanan_cetak |
| tahapan   | String | Production stage    |
| deskripsi | Text?  | Stage description   |

#### Tabel: `pengiriman`

**Deskripsi**: Shipping information

| Kolom           | Tipe             | Deskripsi                    |
| --------------- | ---------------- | ---------------------------- |
| id              | UUID             | Primary key                  |
| idPesanan       | UUID             | FK to pesanan_cetak (unique) |
| namaEkspedisi   | String           | Courier name                 |
| nomorResi       | String?          | Tracking number              |
| biayaPengiriman | Decimal          | Shipping cost                |
| alamatTujuan    | Text             | Destination address          |
| namaPenerima    | String           | Recipient name               |
| teleponPenerima | String           | Recipient phone              |
| status          | StatusPengiriman | Status enum                  |
| tanggalKirim    | DateTime?        | Shipping date                |
| estimasiTiba    | DateTime?        | ETA                          |
| tanggalTiba     | DateTime?        | Actual delivery date         |

**Enum StatusPengiriman**:

- `diproses`: Processing
- `dalam_perjalanan`: In transit
- `terkirim`: Delivered
- `gagal`: Failed

#### Tabel: `tracking_log`

**Deskripsi**: Shipping tracking history

| Kolom        | Tipe     | Deskripsi        |
| ------------ | -------- | ---------------- |
| id           | UUID     | Primary key      |
| idPengiriman | UUID     | FK to pengiriman |
| lokasi       | String   | Location         |
| status       | String   | Status           |
| deskripsi    | String?  | Description      |
| waktu        | DateTime | Timestamp        |

### 5. Payment System Domain

#### Tabel: `pembayaran`

**Deskripsi**: Payment transactions

| Kolom             | Tipe             | Deskripsi                    |
| ----------------- | ---------------- | ---------------------------- |
| id                | UUID             | Primary key                  |
| idPesanan         | UUID             | FK to pesanan_cetak (unique) |
| idPengguna        | UUID             | FK to pengguna               |
| nomorTransaksi    | String           | Transaction number (unique)  |
| jumlah            | Decimal          | Amount                       |
| metodePembayaran  | MetodePembayaran | Payment method enum          |
| status            | StatusPembayaran | Status enum                  |
| urlBukti          | String?          | Payment proof URL            |
| catatanPembayaran | Text?            | Payment notes                |
| tanggalPembayaran | DateTime?        | Payment date                 |

**Enum MetodePembayaran**:

- `transfer_bank`: Bank transfer
- `kartu_kredit`: Credit card
- `e_wallet`: E-wallet
- `virtual_account`: Virtual account
- `cod`: Cash on delivery

**Enum StatusPembayaran**:

- `tertunda`: Pending
- `diproses`: Processing
- `berhasil`: Success
- `gagal`: Failed
- `dibatalkan`: Cancelled
- `dikembalikan`: Refunded

### 6. Other Supporting Tables

#### Tabel: `notifikasi`

**Deskripsi**: User notifications

| Kolom      | Tipe           | Deskripsi            |
| ---------- | -------------- | -------------------- |
| id         | UUID           | Primary key          |
| idPengguna | UUID           | FK to pengguna       |
| judul      | String         | Notification title   |
| pesan      | Text           | Notification message |
| tipe       | TipeNotifikasi | Type enum            |
| dibaca     | Boolean        | Read status          |
| url        | String?        | Action URL           |

**Enum TipeNotifikasi**:

- `info`: Information
- `sukses`: Success
- `peringatan`: Warning
- `error`: Error

**Index**: (idPengguna, dibaca)

#### Tabel: `token_refresh`

**Deskripsi**: JWT refresh tokens

| Kolom          | Tipe     | Deskripsi              |
| -------------- | -------- | ---------------------- |
| id             | UUID     | Primary key            |
| idPengguna     | UUID     | FK to pengguna         |
| token          | String   | Refresh token (unique) |
| kadaluarsaPada | DateTime | Expiration date        |

#### Tabel: `log_aktivitas`

**Deskripsi**: Activity audit log

| Kolom      | Tipe    | Deskripsi        |
| ---------- | ------- | ---------------- |
| id         | UUID    | Primary key      |
| idPengguna | UUID?   | FK to pengguna   |
| aksi       | String  | Action performed |
| entitas    | String? | Entity type      |
| idEntitas  | UUID?   | Entity ID        |
| deskripsi  | Text?   | Description      |
| ipAddress  | String? | IP address       |
| userAgent  | String? | User agent       |

**Indexes**:

- `idPengguna`
- `dibuatPada`

#### Tabel: `statistik_naskah`

**Deskripsi**: Manuscript analytics

| Kolom          | Tipe    | Deskripsi             |
| -------------- | ------- | --------------------- |
| id             | UUID    | Primary key           |
| idNaskah       | UUID    | FK to naskah (unique) |
| totalDiunduh   | Int     | Download count        |
| totalDibaca    | Int     | Read count            |
| totalDibagikan | Int     | Share count           |
| totalDicetak   | Int     | Print count           |
| ratingRataRata | Decimal | Average rating        |
| totalRating    | Int     | Total ratings         |

#### Tabel: `rating_review`

**Deskripsi**: User ratings & reviews

| Kolom      | Tipe  | Deskripsi             |
| ---------- | ----- | --------------------- |
| id         | UUID  | Primary key           |
| idNaskah   | UUID  | Reference to naskah   |
| idPengguna | UUID  | Reference to pengguna |
| rating     | Int   | Rating (1-5)          |
| ulasan     | Text? | Review text           |

**Unique constraint**: (idNaskah, idPengguna)

## Entity Relationship Diagram

```
Pengguna (1) ----< (M) PeranPengguna
Pengguna (1) ---- (1) ProfilPengguna
Pengguna (1) ---- (1?) ProfilPenulis
Pengguna (1) ----< (M) Naskah
Pengguna (1) ----< (M) ReviewNaskah
Pengguna (1) ----< (M) PesananCetak

Naskah (M) >---- (1) Kategori
Naskah (M) >---- (1) Genre
Naskah (1) ----< (M) RevisiNaskah
Naskah (1) ----< (M) ReviewNaskah
Naskah (M) >----< (M) Tag (via TagNaskah)
Naskah (1) ----< (M) PesananCetak

ReviewNaskah (1) ----< (M) FeedbackReview

PesananCetak (1) ---- (1?) Pembayaran
PesananCetak (1) ---- (1?) Pengiriman
PesananCetak (1) ----< (M) LogProduksi

Pengiriman (1) ----< (M) TrackingLog
```

## Migrations

Migrations dikelola oleh Prisma. File migration ada di `prisma/migrations/`.

Untuk membuat migration baru:

```bash
bun prisma migrate dev --name nama_migration
```

## Seeding

Database seeding dilakukan melalui `prisma/seed.ts` yang mencakup:

- 4 default users (admin, editor, penulis, percetakan)
- Kategori dan sub-kategori
- Genre
- Tags
- Sample naskah

Run seeding:

```bash
bun prisma db seed
```

## Indexes & Performance

### Primary Indexes

- Semua tabel memiliki UUID primary key dengan index otomatis

### Foreign Key Indexes

- Semua foreign keys memiliki index untuk performance JOIN

### Custom Indexes

- `naskah`: (idPenulis), (status), (idKategori), (idGenre)
- `notifikasi`: (idPengguna, dibaca)
- `log_aktivitas`: (idPengguna), (dibuatPada)
- `token_refresh`: (token)
- `review_naskah`: (idNaskah), (idEditor)

## Row Level Security (RLS)

**Planned Implementation**:

- Penulis hanya bisa akses naskah sendiri
- Editor hanya bisa akses review yang ditugaskan
- Admin full access
- Public dapat akses naskah yang status = `diterbitkan` dan `publik` = true

RLS akan diimplementasikan di level Supabase atau custom middleware.

## Backup & Recovery

**Recommendation**:

- Daily automated backups
- Point-in-time recovery enabled
- Backup retention: 30 days minimum
- Test recovery procedures monthly

## Database Maintenance

### Regular Tasks

- Vacuum & Analyze (mingguan)
- Index rebuild (bulanan)
- Statistics update (otomatis)
- Old data cleanup:
  - Token refresh expired
  - Notifikasi lama yang sudah dibaca
  - Log aktivitas > 90 hari

Cleanup dapat dijalankan via PrismaService.cleanupOldData()

---

**Last Updated**: 2025-10-29
