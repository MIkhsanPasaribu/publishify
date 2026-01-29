# 📱 Analisis Fitur Mobile Publishify per Role

**Tanggal Analisis**: 12 Januari 2026
**Versi**: 1.0

---

## 📊 Ringkasan Eksekutif

| Role               | Jumlah Halaman | Fitur Lengkap | Fitur Partial | Placeholder |
| ------------------ | -------------- | ------------- | ------------- | ----------- |
| **Penulis/Writer** | 13             | 11            | 2             | 0           |
| **Editor**         | 12             | 10            | 2             | 0           |
| **Admin**          | 5              | 5             | 0             | 0           |
| **Percetakan**     | 6              | 4             | 2             | 0           |

---

## 1️⃣ PENULIS/WRITER

### Struktur Folder

```
mobile/lib/pages/writer/
├── home/
│   └── home_page.dart
├── naskah/
│   ├── detail_naskah_page.dart
│   ├── naskah_form_page.dart
│   └── naskah_list_page.dart
├── notifications/
│   └── notifications_page.dart
├── percetakan/
│   └── pilih_percetakan_page.dart
├── print/
│   └── print_page.dart
├── profile/V
│   ├── edit_profile_page.dart
│   └── profile_page.dart
├── review/
│   ├── review_detail_page.dart
│   └── review_page.dart
├── statistics/
│   └── statistics_page.dart
└── upload/
    ├── upload_book_page.dart
    └── upload_file_page.dart
```

### Daftar Fitur

| #   | Nama Fitur                    | File/Path                               | Status     | Fungsi Utama                                                                                                                                       |
| --- | ----------------------------- | --------------------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Dashboard Home**            | `home/home_page.dart`                   | ✅ Lengkap | Dashboard utama penulis dengan statistik naskah (draft, review, revisi, published), menampilkan buku terbaru, menu navigasi cepat                  |
| 2   | **Daftar Naskah**             | `naskah/naskah_list_page.dart`          | ✅ Lengkap | List semua naskah milik penulis dengan pagination, sorting (dibuatPada, judul), search, infinite scroll                                            |
| 3   | **Detail Naskah**             | `naskah/detail_naskah_page.dart`        | ✅ Lengkap | Menampilkan detail lengkap naskah (judul, sinopsis, kategori, genre, status), info penulis, riwayat revisi                                         |
| 4   | **Form Naskah (Create/Edit)** | `naskah/naskah_form_page.dart`          | ✅ Lengkap | Form untuk membuat naskah baru atau mengedit naskah existing. Field: judul, subJudul, sinopsis, ISBN, kategori, genre, jumlah halaman/kata, publik |
| 5   | **Upload Buku (Metadata)**    | `upload/upload_book_page.dart`          | ✅ Lengkap | Form submit buku baru - input metadata (judul, ISBN, sinopsis, kategori, genre), lalu redirect ke upload file                                      |
| 6   | **Upload File Naskah**        | `upload/upload_file_page.dart`          | ✅ Lengkap | Upload file naskah (.doc, .docx), max 50MB, validasi format, progress indicator, integrasi dengan API                                              |
| 7   | **Daftar Review**             | `review/review_page.dart`               | ✅ Lengkap | List semua review untuk naskah penulis, filter by status (semua, ditugaskan, sedang_review, selesai), card dengan info rekomendasi                 |
| 8   | **Detail Review**             | `review/review_detail_page.dart`        | ✅ Lengkap | Detail review dari editor: info naskah, status review, rekomendasi, feedback list dari editor                                                      |
| 9   | **Notifikasi**                | `notifications/notifications_page.dart` | ✅ Lengkap | Notifikasi real-time via WebSocket, filter by tipe dan status dibaca, pagination, mark all as read, auto-refresh                                   |
| 10  | **Profil Penulis**            | `profile/profile_page.dart`             | ✅ Lengkap | Halaman profil dengan avatar, bio, role, statistik naskah, portfolio naskah terbit                                                                 |
| 11  | **Edit Profil**               | `profile/edit_profile_page.dart`        | ✅ Lengkap | Edit profil lengkap: nama depan/belakang, nama tampilan, bio, tanggal lahir, jenis kelamin, alamat, kota, provinsi, kode pos, telepon              |
| 12  | **Statistik Penulis**         | `statistics/statistics_page.dart`       | ✅ Lengkap | Dashboard statistik: total naskah, review selesai, naskah diterbitkan, rata-rata rating, chart visualisasi                                         |
| 13  | **Pilih Percetakan**          | `percetakan/pilih_percetakan_page.dart` | ⚠️ Partial | Grid view percetakan, detail dialog - **MENGGUNAKAN DUMMY DATA** (tidak terintegrasi API)                                                          |
| 14  | **Form Cetak**                | `print/print_page.dart`                 | ⚠️ Partial | Form order cetak buku: pilih naskah terbit, format kertas, jenis kertas, cover, finishing - **BELUM FULLY INTEGRATED dengan payment gateway**      |

### Services Writer

```
mobile/lib/services/writer/
├── genre_service.dart           # CRUD genre
├── kategori_service.dart        # CRUD kategori
├── naskah_service.dart          # CRUD naskah, submit, status
├── notifikasi_service.dart      # REST API notifikasi
├── notifikasi_socket_service.dart # WebSocket real-time
├── percetakan_service.dart      # API percetakan
├── profile_service.dart         # CRUD profil penulis
├── review_service.dart          # Ambil review naskah
├── statistik_service.dart       # Statistik penulis
└── upload_service.dart          # Upload file naskah
```

---

## 2️⃣ EDITOR

### Struktur Folder

```
mobile/lib/pages/editor/
├── editor_main_page.dart
├── feedback/
│   └── editor_feedback_page.dart
├── home/
│   └── editor_dashboard_page.dart
├── naskah/
│   └── naskah_masuk_page.dart
├── notifications/
│   └── editor_notifications_page.dart
├── profile/
│   ├── editor_profile_page.dart
│   └── edit_profile_page.dart
├── review/
│   ├── detail_review_naskah_page.dart
│   ├── review_collection_page.dart
│   ├── review_detail_page.dart
│   └── review_naskah_page.dart
└── statistics/
    └── editor_statistics_page.dart
```

### Daftar Fitur

| #   | Nama Fitur                 | File/Path                                      | Status     | Fungsi Utama                                                                                                                |
| --- | -------------------------- | ---------------------------------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Dashboard Editor**       | `home/editor_dashboard_page.dart`              | ✅ Lengkap | Dashboard utama editor dengan statistik review, menu navigasi (Naskah Masuk, Review, Statistik, Feedback), recent reviews   |
| 2   | **Naskah Masuk**           | `naskah/naskah_masuk_page.dart`                | ✅ Lengkap | List naskah baru yang perlu direview, filter by status (ditugaskan, sedang_review), info penulis dan judul                  |
| 3   | **Review Naskah**          | `review/review_naskah_page.dart`               | ✅ Lengkap | List semua naskah submission, filter by status, count per status, aksi terima review, tugaskan editor lain                  |
| 4   | **Detail Review Naskah**   | `review/detail_review_naskah_page.dart`        | ✅ Lengkap | Detail naskah untuk review: info lengkap naskah, sampul, penulis, tombol download & preview (TODO), navigasi ke form review |
| 5   | **Review Collection**      | `review/review_collection_page.dart`           | ✅ Lengkap | Pengumpulan review dengan filter dropdown, list buku masuk, aksi terima/tugaskan/lihat detail, submit review                |
| 6   | **Review Detail & Submit** | `review/review_detail_page.dart`               | ✅ Lengkap | Form submit review: detail buku, input catatan, pilih rekomendasi (setujui/revisi/tolak), rating 1-5, feedback list         |
| 7   | **Feedback Editor**        | `feedback/editor_feedback_page.dart`           | ⚠️ Partial | Halaman feedback yang diberikan ke penulis - **MENGGUNAKAN DUMMY DATA**, tab view (semua/positif/perlu perbaikan)           |
| 8   | **Notifikasi Editor**      | `notifications/editor_notifications_page.dart` | ✅ Lengkap | Notifikasi terintegrasi backend, filter by dibaca/tipe, pagination, mark all as read                                        |
| 9   | **Profil Editor**          | `profile/editor_profile_page.dart`             | ✅ Lengkap | Halaman profil editor dengan avatar, bio, role, statistik review                                                            |
| 10  | **Edit Profil**            | `profile/edit_profile_page.dart`               | ✅ Lengkap | Edit profil lengkap sama seperti writer                                                                                     |
| 11  | **Statistik Review**       | `statistics/editor_statistics_page.dart`       | ✅ Lengkap | Dashboard statistik real dari API: total review, review selesai, rata-rata rating, chart distribusi rekomendasi             |
| 12  | **Main Navigation**        | `editor_main_page.dart`                        | ✅ Lengkap | Bottom navigation untuk editor: Home, Review, Statistik, Notifikasi, Profile                                                |

### Services Editor

```
mobile/lib/services/editor/
├── editor_api_service.dart        # Base API service
├── editor_exports.dart            # Export barrel
├── editor_review_service.dart     # Review operations
├── editor_service.dart            # General editor service
├── notifikasi_service.dart        # Notifikasi editor
├── profile_service.dart           # Profil editor
├── review_collection_service.dart # Review collection
├── review_naskah_service.dart     # Review naskah detail
└── statistik_service.dart         # Statistik review
```

---

## 3️⃣ ADMIN

### Struktur Folder

```
mobile/lib/pages/admin/
├── home/
│   └── admin_dashboard_page.dart
├── naskah/
│   └── admin_naskah_page.dart
├── pengguna/
│   └── admin_pengguna_page.dart
├── review/
│   └── admin_review_page.dart
└── statistik/
    └── admin_statistik_page.dart
```

### Daftar Fitur

| #   | Nama Fitur           | File/Path                             | Status     | Fungsi Utama                                                                                                                     |
| --- | -------------------- | ------------------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Dashboard Admin**  | `home/admin_dashboard_page.dart`      | ✅ Lengkap | Dashboard utama admin dengan statistik pengguna (total, per role), menu navigasi cepat (Pengguna, Naskah, Review, Statistik)     |
| 2   | **Kelola Naskah**    | `naskah/admin_naskah_page.dart`       | ✅ Lengkap | List semua naskah sistem dengan filter status (draft, diajukan, dalam_review, disetujui, diterbitkan), pagination, search dialog |
| 3   | **Kelola Pengguna**  | `pengguna/admin_pengguna_page.dart`   | ✅ Lengkap | List semua pengguna dengan filter role (penulis, editor, percetakan, admin), pagination, card dengan info pengguna               |
| 4   | **Kelola Review**    | `review/admin_review_page.dart`       | ✅ Lengkap | Manajemen review: Tab "Naskah Diajukan" (belum direview) dan "Review Aktif", tugaskan editor ke naskah, monitor progress review  |
| 5   | **Statistik Sistem** | `statistik/admin_statistik_page.dart` | ✅ Lengkap | Dashboard statistik keseluruhan: total pengguna, distribusi per role (pie chart fl_chart), detail per kategori                   |

### Services Admin

```
mobile/lib/services/admin/
└── admin_service.dart    # All admin operations:
                          # - ambilStatistikPengguna()
                          # - ambilDaftarPengguna()
                          # - ambilSemuaNaskah()
                          # - ambilSemuaReview()
                          # - tugaskanReview()
```

---

## 4️⃣ PERCETAKAN

### Struktur Folder

```
mobile/lib/pages/percetakan/
├── percetakan_main_page.dart
├── home/
│   └── percetakan_dashboard_page.dart
├── notifications/
│   └── percetakan_notifications_page.dart
├── payments/
│   └── percetakan_payments_page.dart
├── profile/
│   ├── edit_percetakan_profile_page.dart
│   └── percetakan_profile_page.dart
└── statistics/
    └── percetakan_statistics_page.dart
```

### Daftar Fitur

| #   | Nama Fitur               | File/Path                                          | Status     | Fungsi Utama                                                                                                          |
| --- | ------------------------ | -------------------------------------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------- |
| 1   | **Dashboard Percetakan** | `home/percetakan_dashboard_page.dart`              | ✅ Lengkap | Dashboard utama percetakan: statistik pesanan, recent orders, menu navigasi, fallback ke dummy data jika API gagal    |
| 2   | **Pembayaran**           | `payments/percetakan_payments_page.dart`           | ⚠️ Partial | Halaman pembayaran - **MENGGUNAKAN DUMMY DATA**, list pembayaran dengan filter (pending/completed), detail pembayaran |
| 3   | **Statistik**            | `statistics/percetakan_statistics_page.dart`       | ✅ Lengkap | Statistik pesanan dan revenue dari backend: total pesanan, revenue, distribusi status                                 |
| 4   | **Profil Percetakan**    | `profile/percetakan_profile_page.dart`             | ✅ Lengkap | Halaman profil dengan avatar, bio, role, portofolio                                                                   |
| 5   | **Edit Profil**          | `profile/edit_percetakan_profile_page.dart`        | ✅ Lengkap | Edit profil sama seperti role lain                                                                                    |
| 6   | **Notifikasi**           | `notifications/percetakan_notifications_page.dart` | ⚠️ Partial | Notifikasi - **MENGGUNAKAN SERVICE EDITOR** (EditorNotifikasiService), perlu dedicated service                        |
| 7   | **Main Navigation**      | `percetakan_main_page.dart`                        | ✅ Lengkap | Bottom navigation: Home, Pembayaran, Statistik, Profile                                                               |

### Services Percetakan

```
mobile/lib/services/percetakan/
├── notifikasi_service.dart         # Notifikasi percetakan (alias ke editor)
├── percetakan_profile_service.dart # Profil percetakan
└── percetakan_service.dart         # Operasi pesanan:
                                    # - ambilDaftarPesanan()
                                    # - ambilStatistik()
                                    # - updateStatusPesanan()
```

---

## 🔧 General Services

### Struktur

```
mobile/lib/services/general/
├── auth_service.dart      # Authentication, login, logout, token management
├── notifikasi_service.dart # Base notifikasi service
└── pembayaran_service.dart # Service pembayaran (belum fully implemented)
```

### HTTP Client

```
mobile/lib/services/
└── http_client_service.dart # Base HTTP client dengan interceptors
```

---

## 📋 Catatan Implementasi

### ✅ Fitur Lengkap (Total: 30)

Fitur dengan integrasi API backend penuh, validasi, error handling, dan UI responsif.

### ⚠️ Fitur Partial (Total: 6)

1. **Writer - Pilih Percetakan**: Menggunakan dummy data
2. **Writer - Form Cetak**: Belum integrasi payment
3. **Editor - Feedback**: Menggunakan dummy data
4. **Percetakan - Pembayaran**: Menggunakan dummy data
5. **Percetakan - Notifikasi**: Menggunakan service editor

### 🔴 Fitur Belum Ada (Rekomendasi)

1. **Admin - Notifikasi**: Belum ada halaman notifikasi admin
2. **Admin - Profile**: Belum ada halaman profile khusus admin
3. **Percetakan - Kelola Pesanan**: Halaman detail untuk manage pesanan individual
4. **Writer - Tracking Pengiriman**: Tracking status pengiriman buku fisik

---

## 📊 JSON Summary

```json
{
  "analisis": {
    "tanggal": "2026-01-12",
    "versi": "1.0"
  },
  "roles": {
    "writer": {
      "total_halaman": 14,
      "lengkap": 12,
      "partial": 2,
      "placeholder": 0,
      "fitur": [
        {
          "nama": "Dashboard Home",
          "file": "home/home_page.dart",
          "status": "lengkap"
        },
        {
          "nama": "Daftar Naskah",
          "file": "naskah/naskah_list_page.dart",
          "status": "lengkap"
        },
        {
          "nama": "Detail Naskah",
          "file": "naskah/detail_naskah_page.dart",
          "status": "lengkap"
        },
        {
          "nama": "Form Naskah",
          "file": "naskah/naskah_form_page.dart",
          "status": "lengkap"
        },
        {
          "nama": "Upload Buku",
          "file": "upload/upload_book_page.dart",
          "status": "lengkap"
        },
        {
          "nama": "Upload File",
          "file": "upload/upload_file_page.dart",
          "status": "lengkap"
        },
        {
          "nama": "Daftar Review",
          "file": "review/review_page.dart",
          "status": "lengkap"
        },
        {
          "nama": "Detail Review",
          "file": "review/review_detail_page.dart",
          "status": "lengkap"
        },
        {
          "nama": "Notifikasi",
          "file": "notifications/notifications_page.dart",
          "status": "lengkap"
        },
        {
          "nama": "Profil",
          "file": "profile/profile_page.dart",
          "status": "lengkap"
        },
        {
          "nama": "Edit Profil",
          "file": "profile/edit_profile_page.dart",
          "status": "lengkap"
        },
        {
          "nama": "Statistik",
          "file": "statistics/statistics_page.dart",
          "status": "lengkap"
        },
        {
          "nama": "Pilih Percetakan",
          "file": "percetakan/pilih_percetakan_page.dart",
          "status": "partial"
        },
        {
          "nama": "Form Cetak",
          "file": "print/print_page.dart",
          "status": "partial"
        }
      ]
    },
    "editor": {
      "total_halaman": 12,
      "lengkap": 11,
      "partial": 1,
      "placeholder": 0,
      "fitur": [
        {
          "nama": "Dashboard",
          "file": "home/editor_dashboard_page.dart",
          "status": "lengkap"
        },
        {
          "nama": "Naskah Masuk",
          "file": "naskah/naskah_masuk_page.dart",
          "status": "lengkap"
        },
        {
          "nama": "Review Naskah",
          "file": "review/review_naskah_page.dart",
          "status": "lengkap"
        },
        {
          "nama": "Detail Review Naskah",
          "file": "review/detail_review_naskah_page.dart",
          "status": "lengkap"
        },
        {
          "nama": "Review Collection",
          "file": "review/review_collection_page.dart",
          "status": "lengkap"
        },
        {
          "nama": "Review Detail Submit",
          "file": "review/review_detail_page.dart",
          "status": "lengkap"
        },
        {
          "nama": "Feedback",
          "file": "feedback/editor_feedback_page.dart",
          "status": "partial"
        },
        {
          "nama": "Notifikasi",
          "file": "notifications/editor_notifications_page.dart",
          "status": "lengkap"
        },
        {
          "nama": "Profil",
          "file": "profile/editor_profile_page.dart",
          "status": "lengkap"
        },
        {
          "nama": "Edit Profil",
          "file": "profile/edit_profile_page.dart",
          "status": "lengkap"
        },
        {
          "nama": "Statistik",
          "file": "statistics/editor_statistics_page.dart",
          "status": "lengkap"
        },
        {
          "nama": "Main Navigation",
          "file": "editor_main_page.dart",
          "status": "lengkap"
        }
      ]
    },
    "admin": {
      "total_halaman": 5,
      "lengkap": 5,
      "partial": 0,
      "placeholder": 0,
      "fitur": [
        {
          "nama": "Dashboard",
          "file": "home/admin_dashboard_page.dart",
          "status": "lengkap"
        },
        {
          "nama": "Kelola Naskah",
          "file": "naskah/admin_naskah_page.dart",
          "status": "lengkap"
        },
        {
          "nama": "Kelola Pengguna",
          "file": "pengguna/admin_pengguna_page.dart",
          "status": "lengkap"
        },
        {
          "nama": "Kelola Review",
          "file": "review/admin_review_page.dart",
          "status": "lengkap"
        },
        {
          "nama": "Statistik",
          "file": "statistik/admin_statistik_page.dart",
          "status": "lengkap"
        }
      ]
    },
    "percetakan": {
      "total_halaman": 7,
      "lengkap": 5,
      "partial": 2,
      "placeholder": 0,
      "fitur": [
        {
          "nama": "Dashboard",
          "file": "home/percetakan_dashboard_page.dart",
          "status": "lengkap"
        },
        {
          "nama": "Pembayaran",
          "file": "payments/percetakan_payments_page.dart",
          "status": "partial"
        },
        {
          "nama": "Statistik",
          "file": "statistics/percetakan_statistics_page.dart",
          "status": "lengkap"
        },
        {
          "nama": "Profil",
          "file": "profile/percetakan_profile_page.dart",
          "status": "lengkap"
        },
        {
          "nama": "Edit Profil",
          "file": "profile/edit_percetakan_profile_page.dart",
          "status": "lengkap"
        },
        {
          "nama": "Notifikasi",
          "file": "notifications/percetakan_notifications_page.dart",
          "status": "partial"
        },
        {
          "nama": "Main Navigation",
          "file": "percetakan_main_page.dart",
          "status": "lengkap"
        }
      ]
    }
  },
  "services": {
    "writer": [
      "genre_service",
      "kategori_service",
      "naskah_service",
      "notifikasi_service",
      "notifikasi_socket_service",
      "percetakan_service",
      "profile_service",
      "review_service",
      "statistik_service",
      "upload_service"
    ],
    "editor": [
      "editor_api_service",
      "editor_exports",
      "editor_review_service",
      "editor_service",
      "notifikasi_service",
      "profile_service",
      "review_collection_service",
      "review_naskah_service",
      "statistik_service"
    ],
    "admin": ["admin_service"],
    "percetakan": [
      "notifikasi_service",
      "percetakan_profile_service",
      "percetakan_service"
    ],
    "general": ["auth_service", "notifikasi_service", "pembayaran_service"]
  }
}
```

---

## 🎯 Prioritas Pengembangan Selanjutnya

### High Priority

1. Integrasi API untuk Pilih Percetakan (Writer)
2. Integrasi Payment Gateway untuk Form Cetak (Writer)
3. Dedicated Notifikasi Service untuk Percetakan

### Medium Priority

1. Integrasi API untuk Feedback Editor
2. Halaman Pembayaran Percetakan dengan API
3. Halaman Notifikasi Admin
4. Halaman Profile Admin

### Low Priority

1. Tracking Pengiriman untuk Writer
2. Kelola Pesanan Detail untuk Percetakan
3. Analytics Dashboard lebih detail untuk Admin
