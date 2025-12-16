# 📊 Laporan Progress: Sistem Penerbitan Naskah Publishify

**Tanggal**: 10 Desember 2025  
**Branch**: `fitur/admin-terbitkan-naskah`  
**Tech Stack**: Next.js 14 (Frontend) + NestJS 10 (Backend) + PostgreSQL + Prisma

---

## 📋 Daftar Isi

1. [Ringkasan Alur Penerbitan](#-ringkasan-alur-penerbitan)
2. [Penulis Mengajukan Draft](#1--penulis-mengajukan-draft)
3. [Editor Review Naskah](#2--editor-review-naskah)
4. [Admin Menerbitkan Naskah](#3--admin-menerbitkan-naskah)
5. [Penulis Melihat Buku Terbit](#4--penulis-melihat-buku-terbit)
6. [Percetakan Menentukan Harga](#5--percetakan-menentukan-harga)
7. [Progress Keseluruhan](#-progress-keseluruhan)

---

## 🎯 Ringkasan Alur Penerbitan

Sistem penerbitan naskah Publishify menggunakan alur kerja multi-aktor yang melibatkan **Penulis**, **Editor**, **Admin**, dan **Percetakan**. Setiap aktor memiliki peran dan tanggung jawab masing-masing dalam proses penerbitan buku.

### Diagram Alur Utama:
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   PENULIS   │───▶│   EDITOR    │───▶│    ADMIN    │───▶│ PERCETAKAN  │
│ Ajukan Draft│    │   Review    │    │  Terbitkan  │    │ Harga Cetak │
│     ✅      │    │     ✅      │    │     ✅      │    │     🚧      │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

### Penjelasan Singkat Tiap Tahap:

| Tahap | Aktor | Deskripsi |
|-------|-------|-----------|
| 1. Ajukan Draft | Penulis | Penulis mengupload naskah lengkap dengan format kertas yang diinginkan |
| 2. Review | Editor | Editor menilai kualitas naskah dan memberi rekomendasi |
| 3. Terbitkan | Admin | Admin memfinalisasi naskah menjadi buku resmi dengan ISBN |
| 4. Harga Cetak | Percetakan | Percetakan menentukan biaya produksi dan cetak |

### Status Naskah dalam Database:

Naskah memiliki beberapa status yang menunjukkan posisinya dalam alur penerbitan:

```
┌────────┐    ┌──────────┐    ┌───────────┐    ┌────────────┐    ┌─────────────┐
│  draf  │───▶│ diajukan │───▶│ direview  │───▶│ disetujui  │───▶│ diterbitkan │
└────────┘    └──────────┘    └───────────┘    └────────────┘    └─────────────┘
                                    │
                                    ▼
                            ┌────────────┐
                            │  revisi /  │
                            │  ditolak   │
                            └────────────┘
```

| Status | Keterangan | Siapa yang Mengubah |
|--------|------------|---------------------|
| `draf` | Naskah masih ditulis penulis | Penulis |
| `diajukan` | Penulis sudah submit untuk review | Penulis |
| `direview` | Sedang dalam proses review editor | Editor |
| `revisi` | Penulis perlu melakukan perbaikan | Editor |
| `disetujui` | Editor merekomendasikan untuk terbit | Editor |
| `ditolak` | Naskah tidak layak terbit | Editor |
| `diterbitkan` | Sudah resmi terbit dengan ISBN | Admin |

---

## 1. 📝 Penulis Mengajukan Draft

**Status**: ✅ **SELESAI**

### Deskripsi

Tahap pertama dalam proses penerbitan adalah penulis mengajukan naskahnya melalui form pengajuan. Pada tahap ini, penulis **wajib menentukan format kertas** (A4, A5, atau B5) yang akan digunakan untuk bukunya. Pemilihan format kertas di awal penting karena akan mempengaruhi:

- Layout dan tata letak konten
- Estimasi jumlah halaman
- Biaya produksi di percetakan nantinya

### Fitur yang Tersedia:

| Fitur | Keterangan | Wajib/Opsional |
|-------|------------|----------------|
| Judul buku | Nama utama buku | Wajib |
| Sub judul | Judul tambahan/penjelas | Opsional |
| Sinopsis | Ringkasan isi buku (min. 100 karakter) | Wajib |
| Upload file naskah | Format .doc, .docx, .pdf (max 50MB) | Wajib |
| Upload gambar cover | Format .jpg, .png, .webp (max 5MB) | Wajib |
| **Pilihan format kertas** | A4 (21×29.7cm), A5 (14.8×21cm), B5 (17.6×25cm) | **Wajib** |
| Estimasi jumlah halaman | Perkiraan total halaman | Wajib |
| Kategori | Jenis buku (Fiksi, Non-Fiksi, dll) | Wajib |
| Genre | Sub-kategori buku | Wajib |

### Ukuran Format Kertas:

| Format | Ukuran | Cocok Untuk |
|--------|--------|-------------|
| **A4** | 21 × 29.7 cm | Buku teks, modul, laporan |
| **A5** | 14.8 × 21 cm | Novel, buku saku, fiksi populer |
| **B5** | 17.6 × 25 cm | Buku akademik, jurnal |

### Teknis:
- **Halaman Frontend**: `/dashboard/naskah/baru`
- **API Endpoint**: `POST /api/naskah`
- **File Storage**: Upload ke folder `/uploads/naskah/` dan `/uploads/cover/`
- **Validasi**: Menggunakan Zod schema validation di frontend dan backend

### Alur Penulis Ajukan Naskah:

```
┌─────────────────────────────────────────────────────────────┐
│                   FORM PENGAJUAN NASKAH                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📖 Informasi Dasar                                         │
│  ├── Judul: [________________________]                      │
│  ├── Sub Judul: [____________________] (opsional)           │
│  └── Sinopsis: [________________________]                   │
│                [________________________]                   │
│                                                             │
│  📁 Upload File                                             │
│  ├── File Naskah: [📎 Pilih File] .doc/.docx/.pdf          │
│  └── Gambar Cover: [🖼️ Pilih Gambar] .jpg/.png             │
│                                                             │
│  📐 Spesifikasi Buku                                        │
│  ├── Format Kertas: [A5 ▼] ← WAJIB DIPILIH                 │
│  ├── Estimasi Halaman: [___] halaman                        │
│  ├── Kategori: [Fiksi ▼]                                   │
│  └── Genre: [Novel ▼]                                      │
│                                                             │
│  [AJUKAN NASKAH]                                            │
└─────────────────────────────────────────────────────────────┘
```

### Setelah Pengajuan:
- Status naskah berubah dari `draf` menjadi `diajukan`
- Naskah masuk ke antrian review editor
- Penulis mendapat notifikasi konfirmasi pengajuan
- Penulis bisa melihat status naskahnya di dashboard

[Screenshot: Halaman Dashboard Penulis - Menu Naskah]

[Screenshot: Form Pengajuan Naskah Penulis - Bagian Atas]

[Screenshot: Form Pengajuan Naskah Penulis - Bagian Format Kertas]

---

## 2. 👨‍💼 Editor Review Naskah

**Status**: ✅ **SELESAI**

### Deskripsi

Setelah penulis mengajukan naskah, naskah tersebut akan masuk ke **antrian review**. Editor dapat mengambil naskah dari antrian untuk direview (sistem self-assign). Proses review meliputi:

- Membaca keseluruhan naskah
- Menilai kualitas penulisan, konten, dan kelayakan terbit
- Memberikan feedback konstruktif untuk penulis
- Memberikan rekomendasi final (setujui/revisi/tolak)

### Fitur yang Tersedia:

| Fitur | Keterangan |
|-------|------------|
| Daftar antrian naskah | Melihat naskah yang menunggu review |
| Self-assign review | Editor mengambil naskah untuk direview |
| Download naskah | Download file original untuk dibaca offline |
| Info detail naskah | Judul, penulis, kategori, genre, format |
| Form feedback | Komentar dan saran untuk penulis |
| Rating aspek | Nilai untuk berbagai aspek (konten, penulisan, dll) |
| Checklist review | Item-item yang harus diperiksa |
| Submit rekomendasi | Pilihan final: setujui / revisi / tolak |

### Kriteria Penilaian Editor:

| Aspek | Deskripsi | Bobot |
|-------|-----------|-------|
| Kualitas Konten | Isi, kedalaman materi, originalitas | 30% |
| Kualitas Penulisan | Tata bahasa, EYD, gaya penulisan | 25% |
| Struktur | Alur cerita, sistematika, organisasi | 20% |
| Kesesuaian Target | Relevansi dengan target pembaca | 15% |
| Potensi Pasar | Perkiraan minat pembaca | 10% |

### Teknis:
- **Halaman Antrian**: `/editor/antrian-review`
- **Halaman Review**: `/editor/review/[id]`
- **API Ambil Review**: `POST /api/review/:naskahId/ambil`
- **API Submit Review**: `PUT /api/review/:id/submit`
- **Tabel Database**: `review_naskah`

### Alur Review Editor:

```
┌──────────────────────────────────────────────────────────────────┐
│                      ANTRIAN NASKAH                              │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │ Judul              │ Penulis     │ Kategori │ Tanggal │ Aksi │ │
│ ├────────────────────┼─────────────┼──────────┼─────────┼──────┤ │
│ │ Kisah Cinta...     │ John Doe    │ Fiksi    │ 5 Des   │[Ambil]│ │
│ │ Panduan Investasi  │ Jane Smith  │ Non-Fiksi│ 3 Des   │[Ambil]│ │
│ └──────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼ Klik [Ambil]
┌──────────────────────────────────────────────────────────────────┐
│                     HALAMAN REVIEW                               │
├──────────────────────────────────────────────────────────────────┤
│  📖 INFO NASKAH                                                  │
│  Judul: Kisah Cinta di Ujung Senja                              │
│  Penulis: John Doe                                               │
│  Kategori: Fiksi > Novel                                         │
│  Format: A5 | Halaman: ~250                                      │
│  [📥 Download Naskah]                                            │
├──────────────────────────────────────────────────────────────────┤
│  📝 FORM FEEDBACK                                                │
│                                                                  │
│  Rating:                                                         │
│  Kualitas Konten:    [⭐⭐⭐⭐☆] 4/5                             │
│  Kualitas Penulisan: [⭐⭐⭐⭐⭐] 5/5                             │
│  Struktur:           [⭐⭐⭐⭐☆] 4/5                             │
│                                                                  │
│  Komentar untuk Penulis:                                         │
│  [Cerita sangat menarik dengan alur yang...]                    │
│                                                                  │
│  Checklist:                                                      │
│  [✓] Tidak ada plagiarisme                                      │
│  [✓] Tata bahasa baik                                           │
│  [✓] Alur cerita jelas                                          │
│  [✓] Tidak mengandung SARA                                      │
├──────────────────────────────────────────────────────────────────┤
│  🎯 REKOMENDASI FINAL                                            │
│                                                                  │
│  (●) SETUJUI  - Naskah layak untuk diterbitkan                  │
│  ( ) REVISI   - Perlu perbaikan minor/mayor                     │
│  ( ) TOLAK    - Tidak layak terbit                              │
│                                                                  │
│  [SUBMIT REVIEW]                                                 │
└──────────────────────────────────────────────────────────────────┘
```

### Hasil Rekomendasi:

| Rekomendasi | Efek | Notifikasi |
|-------------|------|------------|
| **Setujui** | Status → `disetujui`, masuk antrian admin | Penulis: "Naskah Anda disetujui untuk terbit!" |
| **Revisi** | Status → `revisi`, penulis perlu perbaikan | Penulis: "Naskah perlu diperbaiki" + feedback |
| **Tolak** | Status → `ditolak`, proses berhenti | Penulis: "Maaf, naskah tidak dapat diterbitkan" |

[Screenshot: Halaman Antrian Review Editor]

[Screenshot: Halaman Form Review Editor - Info Naskah]

[Screenshot: Halaman Form Review Editor - Form Feedback]

[Screenshot: Halaman Form Review Editor - Submit Rekomendasi]

---

## 3. 🏛️ Admin Menerbitkan Naskah

**Status**: ✅ **SELESAI**

### Deskripsi

Setelah editor memberikan rekomendasi **"setujui"**, naskah akan masuk ke halaman **Admin - Naskah Siap Terbit**. Admin bertugas untuk:

- Memverifikasi hasil review editor
- Menyiapkan file PDF final untuk dicetak
- Mengisi data penerbitan resmi (ISBN, jumlah halaman final)
- Menerbitkan naskah secara resmi

Proses penerbitan oleh admin terdiri dari beberapa tahap yang harus dilalui secara berurutan.

### Fitur yang Tersedia:

| Fitur | Keterangan | Wajib |
|-------|------------|-------|
| Daftar naskah disetujui | Filter otomatis status "disetujui" | - |
| Download naskah original | File .docx/.doc dari penulis | - |
| **Konversi ke PDF** | Otomatis dari DOCX ke PDF via LibreOffice | - |
| **Upload PDF manual** | Alternatif jika konversi gagal | - |
| Preview PDF | Lihat hasil dalam browser | - |
| Kunci PDF | Konfirmasi file final sebelum terbit | Wajib |
| **Input ISBN** | Nomor ISBN resmi | Wajib |
| **Jumlah halaman** | Total halaman final | Wajib |
| Update format buku | Bisa ubah dari pilihan penulis | Opsional |
| Update cover | Bisa ganti cover baru | Opsional |

### Teknis:

| Komponen | Detail |
|----------|--------|
| **Halaman Frontend** | `/admin/naskah-siap-terbit` |
| **API Daftar Naskah** | `GET /api/naskah/admin/semua?status=disetujui` |
| **API Terbitkan** | `PUT /api/naskah/:id/terbitkan` |
| **API Konversi PDF** | `POST /api/upload/konversi-pdf-url` |
| **Library Konversi** | `libreoffice-convert` (perlu LibreOffice di server) |
| **State Management** | React useState untuk workflow multi-step |

### Alur Penerbitan Admin (4 Step):

#### **STEP 1: Siapkan PDF Final**

Admin harus menyiapkan file PDF yang akan menjadi master cetak. Ada dua opsi:

| Opsi | Cara Kerja | Kapan Digunakan |
|------|------------|-----------------|
| **Konversi Otomatis** | Sistem mengkonversi DOCX → PDF via LibreOffice | Server memiliki LibreOffice terinstall |
| **Upload Manual** | Admin upload file PDF yang sudah disiapkan | LibreOffice tidak tersedia, atau perlu layout khusus |

```
┌────────────────────────────────────────────────────────────────┐
│                  STEP 1: SIAPKAN PDF FINAL                     │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌─────────────────────────┐  ┌─────────────────────────┐     │
│  │    TAB: KONVERSI        │  │    TAB: UPLOAD          │     │
│  │    OTOMATIS             │  │    MANUAL               │     │
│  │                         │  │                         │     │
│  │  File: dokumen.docx     │  │  [📁 Pilih File PDF]   │     │
│  │                         │  │                         │     │
│  │  [🔄 Konversi ke PDF]   │  │  Format: .pdf only     │     │
│  │                         │  │  Max: 100MB            │     │
│  │  Proses: ~30-60 detik   │  │                         │     │
│  └─────────────────────────┘  └─────────────────────────┘     │
│                                                                │
│  📋 Catatan:                                                   │
│  - Konversi otomatis memerlukan LibreOffice di server         │
│  - Jika gagal, gunakan opsi Upload Manual                      │
└────────────────────────────────────────────────────────────────┘
```

#### **STEP 2: Preview & Kunci PDF**

Setelah PDF tersedia, admin wajib memeriksa hasilnya dan mengunci file. File yang sudah dikunci tidak dapat diubah lagi.

```
┌────────────────────────────────────────────────────────────────┐
│                  STEP 2: PREVIEW & KUNCI PDF                   │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ✅ File PDF tersedia: hasil-konversi.pdf                      │
│                                                                │
│  [👁️ Preview PDF] → Buka di modal/tab baru                    │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ [✓] Saya sudah memeriksa file PDF ini dan memastikan    │ │
│  │     layout, font, dan konten sudah benar                │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  [🔒 Kunci File PDF]                                           │
│                                                                │
│  ⚠️ Setelah dikunci, file tidak dapat diubah!                 │
└────────────────────────────────────────────────────────────────┘
```

#### **STEP 3: Isi Data Penerbitan**

Setelah PDF dikunci, admin mengisi data penerbitan resmi:

```
┌────────────────────────────────────────────────────────────────┐
│                  STEP 3: DATA PENERBITAN                       │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  📚 Data Buku Resmi                                            │
│                                                                │
│  ISBN: *                                                       │
│  [978-623-XXXXX-X-X_______________________]                   │
│  Format: 978-XXXX-XXXXX-X-X (13 digit)                        │
│                                                                │
│  Format Buku:                                                  │
│  [A5 (14.8 × 21 cm) ▼]                                        │
│  ℹ️ Default dari pilihan penulis, bisa diubah                 │
│                                                                │
│  Jumlah Halaman Final: *                                       │
│  [248_____] halaman                                            │
│                                                                │
│  Update Cover: (opsional)                                      │
│  [🖼️ Upload Cover Baru]                                       │
│  ℹ️ Kosongkan jika tetap menggunakan cover dari penulis       │
│                                                                │
│  * Wajib diisi                                                 │
└────────────────────────────────────────────────────────────────┘
```

| Field | Validasi | Keterangan |
|-------|----------|------------|
| ISBN | Wajib, format valid | Nomor ISBN resmi dari penerbit |
| Format Buku | Wajib, pilihan A4/A5/B5 | Default dari pilihan penulis |
| Jumlah Halaman | Wajib, angka > 0 | Jumlah halaman final di PDF |
| Cover | Opsional | Bisa update dengan cover versi final |

#### **STEP 4: Terbitkan**

Langkah terakhir adalah klik tombol Terbitkan untuk memfinalisasi:

```
┌────────────────────────────────────────────────────────────────┐
│                  STEP 4: TERBITKAN                             │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  📋 Ringkasan:                                                 │
│  ├── Judul: Kisah Cinta di Ujung Senja                        │
│  ├── Penulis: John Doe                                         │
│  ├── ISBN: 978-623-12345-6-7                                   │
│  ├── Format: A5 (14.8 × 21 cm)                                │
│  ├── Halaman: 248                                              │
│  └── PDF: hasil-konversi.pdf ✅ (Terkunci)                    │
│                                                                │
│  ┌────────────────────────────────────────────────────────┐   │
│  │              [🚀 TERBITKAN NASKAH]                      │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                │
│  Setelah diterbitkan:                                          │
│  ✅ Status berubah: disetujui → diterbitkan                   │
│  ✅ Tanggal terbit dicatat (diterbitkanPada)                  │
│  ✅ Muncul di halaman penulis /buku-terbit                    │
│  ✅ Tersedia untuk percetakan                                  │
│  ✅ Penulis mendapat notifikasi                                │
└────────────────────────────────────────────────────────────────┘
```

### Request & Response API Terbitkan:

**Request:**
```http
PUT /api/naskah/:id/terbitkan
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "isbn": "978-623-12345-6-7",
  "formatBuku": "A5",
  "jumlahHalaman": 248
}
```

**Response (Success):**
```json
{
  "sukses": true,
  "pesan": "Naskah berhasil diterbitkan",
  "data": {
    "id": "uuid-naskah",
    "judul": "Kisah Cinta di Ujung Senja",
    "status": "diterbitkan",
    "isbn": "978-623-12345-6-7",
    "formatBuku": "A5",
    "jumlahHalaman": 248,
    "diterbitkanPada": "2025-12-10T10:30:00.000Z"
  }
}
```

[Screenshot: Halaman Admin - Daftar Naskah Siap Terbit]

[Screenshot: Modal Terbitkan - Step 1 Siapkan PDF]

[Screenshot: Modal Terbitkan - Step 2 Preview PDF]

[Screenshot: Modal Terbitkan - Step 3 Data Penerbitan]

[Screenshot: Modal Terbitkan - Step 4 Konfirmasi Terbit]

[Screenshot: Notifikasi Sukses Terbit]

---

## 4. 📚 Penulis Melihat Buku Terbit

**Status**: ✅ **SELESAI**

### Deskripsi

Setelah admin menerbitkan naskah, penulis dapat melihat buku yang sudah diterbitkan di menu **"Buku Terbit"** pada dashboard mereka. Halaman ini menampilkan semua buku milik penulis yang sudah berstatus `diterbitkan`.

### Informasi yang Ditampilkan:

| Data | Keterangan | Sumber |
|------|------------|--------|
| Cover buku | Gambar sampul | Dari upload penulis/admin |
| Judul & sub judul | Informasi buku | Dari form pengajuan |
| ISBN | Nomor ISBN resmi | Diisi admin saat terbitkan |
| Format | A4/A5/B5 | Dari pengajuan (bisa diubah admin) |
| Jumlah halaman | Total halaman final | Diisi admin saat terbitkan |
| Kategori & Genre | Klasifikasi buku | Dari form pengajuan |
| Tanggal terbit | Kapan diterbitkan admin | Otomatis saat admin klik terbitkan |
| Download PDF | Link file PDF final | Hasil konversi/upload admin |

### Teknis:
- **Halaman Frontend**: `/dashboard/buku-terbit`
- **API Endpoint**: `GET /api/naskah/penulis/saya?status=diterbitkan`
- **Filter**: Hanya naskah milik penulis login dengan status `diterbitkan`
- **Sorting**: Default berdasarkan tanggal terbit terbaru

### Tampilan Halaman:

```
┌──────────────────────────────────────────────────────────────────┐
│  📚 BUKU TERBIT                                                  │
│  Daftar buku Anda yang sudah diterbitkan                        │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ ┌───────┐                                                   │ │
│  │ │       │  📖 Kisah Cinta di Ujung Senja                   │ │
│  │ │ COVER │  ───────────────────────────────                 │ │
│  │ │       │  ISBN: 978-623-12345-6-7                         │ │
│  │ │       │  Format: A5 | 248 halaman                        │ │
│  │ └───────┘  Kategori: Fiksi > Novel                         │ │
│  │            Terbit: 10 Desember 2025                         │ │
│  │                                                             │ │
│  │            [📥 Download PDF] [👁️ Lihat Detail]             │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ ┌───────┐                                                   │ │
│  │ │       │  📖 Panduan Investasi Pemula                     │ │
│  │ │ COVER │  ───────────────────────────────                 │ │
│  │ │       │  ISBN: 978-623-98765-4-3                         │ │
│  │ │       │  Format: B5 | 180 halaman                        │ │
│  │ └───────┘  Kategori: Non-Fiksi > Bisnis                    │ │
│  │            Terbit: 5 Desember 2025                          │ │
│  │                                                             │ │
│  │            [📥 Download PDF] [👁️ Lihat Detail]             │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Response API:

```json
{
  "sukses": true,
  "data": [
    {
      "id": "uuid-1",
      "judul": "Kisah Cinta di Ujung Senja",
      "subJudul": null,
      "isbn": "978-623-12345-6-7",
      "formatBuku": "A5",
      "jumlahHalaman": 248,
      "urlSampul": "/uploads/cover/cover-1.jpg",
      "urlFilePdf": "/uploads/pdf/buku-1.pdf",
      "status": "diterbitkan",
      "diterbitkanPada": "2025-12-10T10:30:00.000Z",
      "kategori": { "id": "...", "nama": "Fiksi" },
      "genre": { "id": "...", "nama": "Novel" }
    }
  ],
  "metadata": {
    "total": 2,
    "halaman": 1,
    "limit": 10
  }
}
```

[Screenshot: Halaman Buku Terbit Penulis - Daftar Buku]

[Screenshot: Halaman Buku Terbit Penulis - Detail Buku]

[Screenshot: Modal Download PDF]

---

## 5. 🏭 Percetakan Menentukan Harga

**Status**: 🚧 **DALAM PENGEMBANGAN (20%)**

### Deskripsi

Tahap terakhir dalam alur penerbitan adalah **percetakan menentukan harga cetak**. Setiap percetakan dapat melihat daftar buku yang sudah diterbitkan dan membuat penawaran harga berdasarkan komponen-komponen yang mereka tentukan sendiri.

### Rencana Fitur:

| Fitur | Status | Prioritas |
|-------|--------|-----------|
| Dashboard percetakan | ❌ Belum dibuat | Tinggi |
| Daftar buku siap cetak | ❌ Belum dibuat | Tinggi |
| Form penentuan harga kertas | ❌ Belum dibuat | Tinggi |
| Form penentuan harga cover | ❌ Belum dibuat | Tinggi |
| Form biaya cetak & finishing | ❌ Belum dibuat | Tinggi |
| Kalkulator harga otomatis | ❌ Belum dibuat | Tinggi |
| Kirim penawaran ke penulis | ❌ Belum dibuat | Medium |
| Penulis terima/tolak penawaran | ❌ Belum dibuat | Medium |
| Tracking produksi | ❌ Belum dibuat | Medium |
| Riwayat pesanan | ❌ Belum dibuat | Rendah |

### Komponen Harga yang Akan Tersedia:

| Komponen | Pilihan/Variasi | Satuan Harga |
|----------|-----------------|--------------|
| **Jenis Kertas** | HVS 70gsm, HVS 80gsm, Bookpaper 57gsm, Art Paper, dll | Per lembar |
| **Jenis Cover** | Soft Cover, Hard Cover | Per unit |
| **Finishing Cover** | Laminasi Glossy, Laminasi Doff, UV Spot | Per unit |
| **Jilid** | Perfect Binding, Saddle Stitch, Case Binding | Per unit |
| **Biaya Cetak** | Berdasarkan jumlah halaman | Per lembar |

### Rencana Database Schema:

```prisma
model HargaKomponenPercetakan {
  id              String     @id @default(uuid())
  idPercetakan    String
  namaKomponen    String     // "Kertas Bookpaper 57gsm"
  jenisKomponen   String     // "kertas" | "cover" | "finishing" | "jilid"
  hargaSatuan     Decimal
  satuan          String     // "lembar" | "unit" | "buku"
  aktif           Boolean    @default(true)
  
  percetakan      Percetakan @relation(...)
}

model PenawaranCetak {
  id              String     @id @default(uuid())
  idNaskah        String
  idPercetakan    String
  jenisKertas     String
  hargaKertas     Decimal
  jenisCover      String
  hargaCover      Decimal
  biayaCetak      Decimal
  biayaFinishing  Decimal
  totalPerBuku    Decimal
  minimalCetak    Int
  status          String     // "menunggu" | "diterima" | "ditolak"
  
  naskah          Naskah     @relation(...)
  percetakan      Percetakan @relation(...)
}
```

### Rencana Alur Percetakan:

```
┌──────────────────────────────────────────────────────────────────┐
│                    DASHBOARD PERCETAKAN                          │
│                    (Belum Dibuat)                                │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│              DAFTAR BUKU SIAP CETAK                              │
│              (Belum Dibuat)                                      │
├──────────────────────────────────────────────────────────────────┤
│  Judul         │ Format │ Halaman │ Penulis    │ Aksi           │
│  ──────────────┼────────┼─────────┼────────────┼────────────    │
│  Buku A        │ A5     │ 248     │ John Doe   │ [Buat Harga]   │
│  Buku B        │ B5     │ 180     │ Jane Doe   │ [Buat Harga]   │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                   FORM PENENTUAN HARGA                           │
│                   (Belum Dibuat)                                 │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  📖 Info Buku:                                                   │
│  • Judul: Kisah Cinta di Ujung Senja                            │
│  • Format: A5 (14.8 × 21 cm)                                    │
│  • Jumlah Halaman: 248 (= 124 lembar)                           │
│                                                                  │
│  💰 KOMPONEN HARGA:                                              │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                                                            │ │
│  │  Jenis Kertas:    [Bookpaper 57gsm ▼]                     │ │
│  │  Harga/Lembar:    Rp [150______]                          │ │
│  │                                                            │ │
│  │  Jenis Cover:     [Soft Cover ▼]                          │ │
│  │  Harga Cover:     Rp [8.000____]                          │ │
│  │                                                            │ │
│  │  Finishing:       [Laminasi Doff ▼]                       │ │
│  │  Harga Finishing: Rp [3.000____]                          │ │
│  │                                                            │ │
│  │  Biaya Cetak:     Rp [400______] /lembar                  │ │
│  │                                                            │ │
│  │  Biaya Lainnya:   Rp [5.000____]                          │ │
│  │                                                            │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  📊 KALKULASI OTOMATIS:                                          │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Kertas:    124 lembar × Rp 150    = Rp  18.600            │ │
│  │ Cetak:     124 lembar × Rp 400    = Rp  49.600            │ │
│  │ Cover:     1 unit × Rp 8.000      = Rp   8.000            │ │
│  │ Finishing: 1 unit × Rp 3.000      = Rp   3.000            │ │
│  │ Lainnya:                          = Rp   5.000            │ │
│  │ ──────────────────────────────────────────────            │ │
│  │ TOTAL PER BUKU:                   = Rp  84.200            │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  Minimal Cetak: [100___] buku                                    │
│                                                                  │
│  [💾 Simpan Draft] [📤 Kirim Penawaran ke Penulis]              │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Rencana Teknis:
- **Halaman Dashboard**: `/percetakan/dashboard` (❌ belum dibuat)
- **Halaman Daftar Buku**: `/percetakan/buku-tersedia` (❌ belum dibuat)
- **Halaman Form Harga**: `/percetakan/harga/[naskahId]` (❌ belum dibuat)
- **API Komponen Harga**: `GET/POST /api/percetakan/komponen-harga` (❌ perlu dibuat)
- **API Penawaran**: `POST /api/penawaran-cetak` (❌ perlu dibuat)

[Screenshot: Dashboard Percetakan - Coming Soon]

[Screenshot: Form Penentuan Harga - Coming Soon]

---

## 📈 Progress Keseluruhan

| No | Modul | Fitur | Progress | Status |
|----|-------|-------|----------|--------|
| 1 | Penulis Ajukan Draft | Form pengajuan + format kertas | 100% | ✅ Selesai |
| 2 | Editor Review | Antrian, form review, rekomendasi | 100% | ✅ Selesai |
| 3 | Admin Terbitkan | Konversi PDF, ISBN, terbitkan | 100% | ✅ Selesai |
| 4 | Penulis Buku Terbit | Daftar buku, download PDF | 100% | ✅ Selesai |
| 5 | Percetakan Harga | Dashboard, form harga, penawaran | 20% | 🚧 Dalam Pengembangan |

### Progress Bar:

```
Penulis Ajukan     [████████████████████] 100%
Editor Review      [████████████████████] 100%
Admin Terbitkan    [████████████████████] 100%
Penulis Buku Terbit[████████████████████] 100%
Percetakan Harga   [████░░░░░░░░░░░░░░░░]  20%
─────────────────────────────────────────────
TOTAL              [████████████████░░░░]  84%
```

---

## 📁 Daftar File Terkait

### Frontend (Next.js 14):

```
frontend/
├── app/
│   ├── (dashboard)/dashboard/
│   │   ├── naskah/
│   │   │   ├── page.tsx              ← Daftar naskah penulis
│   │   │   └── baru/page.tsx         ← Form ajukan naskah ✅
│   │   └── buku-terbit/page.tsx      ← Daftar buku terbit penulis ✅
│   │
│   ├── (editor)/editor/
│   │   ├── antrian-review/page.tsx   ← Antrian naskah untuk review ✅
│   │   └── review/[id]/page.tsx      ← Form review editor ✅
│   │
│   ├── (admin)/admin/
│   │   ├── naskah/page.tsx           ← Kelola semua naskah
│   │   └── naskah-siap-terbit/page.tsx ← Halaman admin terbitkan ✅
│   │
│   └── (percetakan)/percetakan/      ← 🚧 BELUM DIBUAT
│       ├── dashboard/page.tsx        ← ❌ Belum ada
│       ├── buku-tersedia/page.tsx    ← ❌ Belum ada
│       └── harga/[id]/page.tsx       ← ❌ Belum ada
│
├── lib/api/
│   ├── naskah.ts                     ← API client naskah ✅
│   ├── review.ts                     ← API client review ✅
│   └── upload.ts                     ← API client upload ✅
│
└── components/
    └── modules/
        ├── naskah/                   ← Komponen naskah
        ├── review/                   ← Komponen review
        └── percetakan/               ← 🚧 Belum lengkap
```

### Backend (NestJS 10):

```
backend/
├── src/
│   ├── modules/
│   │   ├── naskah/
│   │   │   ├── naskah.module.ts
│   │   │   ├── naskah.controller.ts  ← Endpoint naskah ✅
│   │   │   ├── naskah.service.ts     ← Logic terbitkanNaskah() ✅
│   │   │   └── dto/
│   │   │       └── terbitkan-naskah.dto.ts ✅
│   │   │
│   │   ├── review/
│   │   │   ├── review.controller.ts  ← Endpoint review ✅
│   │   │   └── review.service.ts     ← Logic review ✅
│   │   │
│   │   ├── upload/
│   │   │   ├── upload.controller.ts  ← Endpoint upload & konversi ✅
│   │   │   └── upload.service.ts     ← Logic konversi PDF ✅
│   │   │
│   │   └── percetakan/               ← 🚧 PERLU DIKEMBANGKAN
│   │       ├── percetakan.controller.ts ← Endpoint dasar ada
│   │       └── percetakan.service.ts    ← Perlu ditambah fitur harga
│   │
│   └── prisma/
│       └── schema.prisma             ← Database schema
│
└── uploads/
    ├── naskah/                       ← File naskah (.docx, .doc)
    ├── cover/                        ← File cover (.jpg, .png)
    └── pdf/                          ← File PDF hasil konversi
```

### Database (Prisma Schema):

```prisma
// Status naskah
enum StatusNaskah {
  draf         // Penulis masih menulis
  diajukan     // Penulis submit untuk review
  direview     // Sedang direview editor
  revisi       // Perlu perbaikan
  disetujui    // Lolos review, siap terbit
  ditolak      // Tidak layak terbit
  diterbitkan  // Sudah resmi terbit ← TARGET AKHIR
}

// Model utama naskah
model Naskah {
  id              String        @id @default(uuid())
  judul           String
  subJudul        String?
  sinopsis        String
  
  // File
  urlFile         String?       // File naskah original (.docx)
  urlFilePdf      String?       // File PDF final (hasil konversi)
  urlSampul       String?       // Cover buku
  
  // Spesifikasi buku
  formatBuku      String?       // A4, A5, B5 ← DIPILIH PENULIS
  jumlahHalaman   Int?          // ← DIISI ADMIN SAAT TERBITKAN
  isbn            String?       // ← DIISI ADMIN SAAT TERBITKAN
  
  // Status & tanggal
  status          StatusNaskah  @default(draf)
  diterbitkanPada DateTime?     // ← OTOMATIS SAAT ADMIN TERBITKAN
  
  // Relasi
  idPenulis       String
  idKategori      String
  idGenre         String
  
  penulis         Pengguna      @relation(...)
  kategori        Kategori      @relation(...)
  genre           Genre         @relation(...)
  reviewNaskah    ReviewNaskah[]
}

// Model review
model ReviewNaskah {
  id              String        @id @default(uuid())
  idNaskah        String
  idEditor        String
  
  status          StatusReview  // ditugaskan, dalam_proses, selesai
  rekomendasi     Rekomendasi?  // setujui, revisi, tolak
  komentar        String?
  rating          Int?
  
  naskah          Naskah        @relation(...)
  editor          Pengguna      @relation(...)
}
```

---

## 🔜 Yang Perlu Dikerjakan Selanjutnya

### Prioritas Tinggi (Sprint Berikutnya):

| No | Task | Estimasi | Assignee |
|----|------|----------|----------|
| 1 | Buat halaman `/percetakan/dashboard` | 2 hari | - |
| 2 | Buat halaman `/percetakan/buku-tersedia` | 2 hari | - |
| 3 | Buat form penentuan harga komponen | 3 hari | - |
| 4 | Implementasi kalkulator harga otomatis | 1 hari | - |
| 5 | API endpoint komponen harga percetakan | 2 hari | - |

### Prioritas Medium:

| No | Task | Estimasi |
|----|------|----------|
| 6 | Sistem penawaran ke penulis | 3 hari |
| 7 | Halaman penulis lihat penawaran | 2 hari |
| 8 | Konfirmasi pesanan cetak | 2 hari |
| 9 | Tracking status produksi | 3 hari |

### Prioritas Rendah:

| No | Task | Estimasi |
|----|------|----------|
| 10 | Riwayat pesanan percetakan | 2 hari |
| 11 | Laporan dan analytics | 3 hari |
| 12 | Multi-percetakan comparison | 4 hari |

---

## 🐛 Known Issues & Catatan

### Issues:

| No | Issue | Severity | Workaround |
|----|-------|----------|------------|
| 1 | Konversi PDF gagal jika LibreOffice tidak terinstall | Medium | Gunakan "Upload PDF Manual" |
| 2 | Upload file > 50MB mungkin timeout | Low | Compress file sebelum upload |
| 3 | Preview PDF tidak support semua browser lama | Low | Gunakan Chrome/Firefox terbaru |

### Catatan Teknis:

1. **LibreOffice di Server**: Untuk fitur konversi otomatis DOCX → PDF, server harus memiliki LibreOffice terinstall. Jika menggunakan Docker, perlu menambahkan LibreOffice ke image.

2. **ISBN**: Admin bertanggung jawab untuk mendaftarkan ISBN ke lembaga resmi (Perpusnas). Sistem hanya menyimpan nomor ISBN yang sudah valid.

3. **Format Kertas**: Pilihan format kertas (A4/A5/B5) dari penulis bersifat preferensi. Admin dan percetakan dapat menyesuaikan jika diperlukan.

---

## 📞 Kontak & Kontributor

- **Repository**: [github.com/daffarobbani18/publishify](https://github.com/daffarobbani18/publishify)
- **Branch**: `fitur/admin-terbitkan-naskah`

---

## 📸 Daftar Screenshot

Berikut adalah daftar screenshot yang perlu ditambahkan untuk melengkapi dokumentasi ini:

### 1. Penulis - Pengajuan Naskah

| No | Nama Screenshot | Deskripsi | Status |
|----|-----------------|-----------|--------|
| 1.1 | `ss-penulis-dashboard.png` | Halaman dashboard penulis dengan menu naskah | ⬜ Belum |
| 1.2 | `ss-penulis-form-ajukan-atas.png` | Form pengajuan naskah bagian atas (judul, sinopsis) | ⬜ Belum |
| 1.3 | `ss-penulis-form-ajukan-format.png` | Form pengajuan naskah bagian format kertas (A4/A5/B5) | ⬜ Belum |
| 1.4 | `ss-penulis-form-ajukan-upload.png` | Form pengajuan naskah bagian upload file & cover | ⬜ Belum |
| 1.5 | `ss-penulis-notifikasi-berhasil.png` | Notifikasi sukses setelah ajukan naskah | ⬜ Belum |

### 2. Editor - Review Naskah

| No | Nama Screenshot | Deskripsi | Status |
|----|-----------------|-----------|--------|
| 2.1 | `ss-editor-antrian-review.png` | Halaman antrian naskah untuk direview | ⬜ Belum |
| 2.2 | `ss-editor-form-review-info.png` | Form review - bagian info naskah | ⬜ Belum |
| 2.3 | `ss-editor-form-review-feedback.png` | Form review - bagian feedback & rating | ⬜ Belum |
| 2.4 | `ss-editor-form-review-rekomendasi.png` | Form review - bagian submit rekomendasi | ⬜ Belum |
| 2.5 | `ss-editor-notifikasi-submit.png` | Notifikasi sukses submit review | ⬜ Belum |

### 3. Admin - Terbitkan Naskah

| No | Nama Screenshot | Deskripsi | Status |
|----|-----------------|-----------|--------|
| 3.1 | `ss-admin-daftar-siap-terbit.png` | Halaman daftar naskah siap terbit (status: disetujui) | ⬜ Belum |
| 3.2 | `ss-admin-modal-step1-konversi.png` | Modal terbitkan - Step 1: Tab konversi otomatis | ⬜ Belum |
| 3.3 | `ss-admin-modal-step1-upload.png` | Modal terbitkan - Step 1: Tab upload manual | ⬜ Belum |
| 3.4 | `ss-admin-modal-step2-preview.png` | Modal terbitkan - Step 2: Preview PDF | ⬜ Belum |
| 3.5 | `ss-admin-modal-step2-kunci.png` | Modal terbitkan - Step 2: Kunci PDF (checkbox & tombol) | ⬜ Belum |
| 3.6 | `ss-admin-modal-step3-data.png` | Modal terbitkan - Step 3: Form data penerbitan (ISBN, dll) | ⬜ Belum |
| 3.7 | `ss-admin-modal-step4-terbitkan.png` | Modal terbitkan - Step 4: Tombol terbitkan | ⬜ Belum |
| 3.8 | `ss-admin-notifikasi-sukses.png` | Notifikasi sukses naskah diterbitkan | ⬜ Belum |
| 3.9 | `ss-admin-preview-pdf-fullscreen.png` | Preview PDF dalam modal fullscreen | ⬜ Belum |

### 4. Penulis - Buku Terbit

| No | Nama Screenshot | Deskripsi | Status |
|----|-----------------|-----------|--------|
| 4.1 | `ss-penulis-buku-terbit-daftar.png` | Halaman daftar buku yang sudah terbit | ⬜ Belum |
| 4.2 | `ss-penulis-buku-terbit-detail.png` | Detail buku terbit (ISBN, halaman, dll) | ⬜ Belum |
| 4.3 | `ss-penulis-buku-terbit-download.png` | Modal/tombol download PDF | ⬜ Belum |

### 5. Percetakan - Penentuan Harga (Coming Soon)

| No | Nama Screenshot | Deskripsi | Status |
|----|-----------------|-----------|--------|
| 5.1 | `ss-percetakan-dashboard.png` | Dashboard percetakan | 🚧 Coming Soon |
| 5.2 | `ss-percetakan-daftar-buku.png` | Daftar buku yang bisa dicetak | 🚧 Coming Soon |
| 5.3 | `ss-percetakan-form-harga.png` | Form penentuan harga komponen | 🚧 Coming Soon |
| 5.4 | `ss-percetakan-kalkulator.png` | Kalkulator harga otomatis | 🚧 Coming Soon |

---

### Cara Menambahkan Screenshot:

1. **Ambil screenshot** dari aplikasi yang sedang berjalan
2. **Simpan file** dengan nama sesuai tabel di atas
3. **Taruh di folder**: `docs/screenshots/` atau `docs/images/`
4. **Update status** di tabel menjadi ✅ Sudah
5. **Tambahkan referensi** di markdown:

```markdown
![Deskripsi](./screenshots/ss-nama-file.png)
```

### Contoh Struktur Folder:

```
docs/
├── LAPORAN-PROGRESS-PENERBITAN-NASKAH.md
└── screenshots/
    ├── ss-penulis-dashboard.png
    ├── ss-penulis-form-ajukan-atas.png
    ├── ss-editor-antrian-review.png
    ├── ss-admin-daftar-siap-terbit.png
    └── ...
```

---

*Dokumen ini dibuat sebagai laporan progress pengembangan fitur penerbitan naskah di Publishify.*  
*Terakhir diperbarui: 10 Desember 2025*
