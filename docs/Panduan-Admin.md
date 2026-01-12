# Panduan Admin - Publishify

**Website:** https://publishify.me  
**Aplikasi Mobile:** Android & iOS  
**Role:** Administrator  
**Update:** Januari 2026

---

## Daftar Isi

1. [Login & Dashboard Admin](#1-login--dashboard-admin)
2. [Manajemen Pengguna](#2-manajemen-pengguna)
3. [Manajemen Naskah](#3-manajemen-naskah)
4. [Manajemen Review & Editor](#4-manajemen-review--editor)
5. [Manajemen Kategori & Genre](#5-manajemen-kategori--genre)
6. [Manajemen Percetakan](#6-manajemen-percetakan)
7. [Manajemen Pesanan Cetak](#7-manajemen-pesanan-cetak)
8. [Penerbitan Naskah](#8-penerbitan-naskah)
9. [Statistik & Laporan](#9-statistik--laporan)
10. [Notifikasi & Komunikasi](#10-notifikasi--komunikasi)
11. [Pengaturan Sistem](#11-pengaturan-sistem)
12. [FAQ Admin](#12-faq-admin)

---

# 1. Login & Dashboard Admin

## Website

### Login Admin
1. Buka **https://publishify.me/admin**
2. Masukkan **Email Admin** & **Password**
3. (Opsional) Centang "Ingat Saya"
4. Klik **"Masuk sebagai Admin"**

### Dashboard Overview
Setelah login, dashboard menampilkan:

**Statistik Realtime:**
- **Total Pengguna** (Penulis, Editor, Percetakan)
- **Total Naskah** (Draft, Review, Disetujui, Diterbitkan)
- **Review Aktif** (sedang berjalan)
- **Pesanan Cetak** (pending, produksi, selesai)
- **Revenue Bulan Ini**

**Quick Actions:**
- Tambah Pengguna Baru
- Assign Review Manual
- Approve Naskah
- Terbitkan Naskah
- Lihat Laporan

**Recent Activities:**
- Log aktivitas terbaru (10 terakhir)
- Timestamp realtime

---

## Mobile App

### Login Admin
1. Buka aplikasi **Publishify**
2. Tap **"Masuk"**
3. Login dengan akun admin
4. (Opsional) Aktifkan Face ID/Fingerprint

### Dashboard Mobile
- Tab **"Admin"** (khusus role admin)
- Widget statistik ringkas
- Quick action buttons
- Notifikasi badge

---

# 2. Manajemen Pengguna

## Website

### Lihat Daftar Pengguna

1. **Sidebar Menu** → **"Pengguna"**
2. Lihat tabel semua pengguna

**Kolom Tabel:**
- Nama Lengkap
- Email
- Role (Penulis/Editor/Percetakan/Admin)
- Status (Aktif/Nonaktif)
- Terverifikasi (Ya/Tidak)
- Tanggal Daftar
- Login Terakhir
- Aksi

### Filter & Cari Pengguna

**Filter:**
1. Klik **icon filter** (atas kanan tabel)
2. Pilih kriteria:
   - **Role:** Semua / Penulis / Editor / Percetakan / Admin
   - **Status:** Aktif / Nonaktif
   - **Terverifikasi:** Ya / Tidak
   - **Tanggal Daftar:** Range tanggal
3. Klik **"Terapkan Filter"**

**Cari:**
1. Ketik **nama/email** di search bar
2. Tekan Enter
3. Hasil muncul instant

---

### Tambah Pengguna Baru

1. Klik **"+ Tambah Pengguna"** (atas kanan)
2. Isi form:
   - **Email** (required, unique)
   - **Password** (min. 8 karakter)
   - **Nama Depan** (required)
   - **Nama Belakang** (required)
   - **Nomor HP** (opsional)
   - **Role** (pilih: Penulis/Editor/Percetakan/Admin)
   - **Status Aktif** (toggle on/off)
   - **Verifikasi Email Otomatis** (toggle on/off)
3. Klik **"Simpan"**

**Notifikasi:**
- Email welcome otomatis ke user
- Berisi kredensial login (jika auto-verify)

---

### Edit Pengguna

1. Klik **icon pensil** di baris pengguna
2. Modal edit muncul
3. Ubah data yang diperlukan:
   - Profile data (nama, HP, dll)
   - Email (hati-hati!)
   - Role
   - Status aktif
4. Klik **"Update"**

---

### Assign/Ubah Role Pengguna

1. Buka detail pengguna
2. Tab **"Role & Permissions"**
3. **Tambah Role Baru:**
   - Klik **"+ Tambah Role"**
   - Pilih role dari dropdown
   - Toggle **"Aktif"**
   - Klik **"Assign"**
4. **Nonaktifkan Role:**
   - Toggle off role yang ingin dinonaktifkan
   - Konfirmasi

**Catatan:**
- User bisa punya multiple roles
- Minimal 1 role harus aktif
- Role "Admin" hanya bisa ditambah oleh Super Admin

---

### Verifikasi Email Manual

Jika user tidak dapat email verifikasi:

1. Buka detail pengguna
2. Tab **"Status Akun"**
3. Klik **"Verifikasi Email Manual"**
4. Konfirmasi popup
5. Status berubah: **Terverifikasi** ✅

---

### Nonaktifkan/Aktifkan Akun

**Nonaktifkan (Suspend):**
1. Buka detail pengguna
2. Toggle **"Status Aktif"** → OFF
3. Isi **alasan penonaktifan** (opsional)
4. Klik **"Nonaktifkan"**

**Efek:**
- User tidak bisa login
- Sesi aktif langsung logout
- Notifikasi email ke user

**Aktifkan Kembali:**
1. Toggle **"Status Aktif"** → ON
2. Klik **"Aktifkan"**

---

### Hapus Pengguna (Soft Delete)

1. Klik **icon hapus** (merah)
2. Konfirmasi **"Yakin ingin menghapus?"**
3. Isi **alasan penghapusan**
4. Klik **"Hapus Permanen"**

**Perhatian:**
- Data terhapus dari sistem
- Naskah & review tetap tersimpan (anonymized)
- Tidak bisa di-restore (permanent!)

---

### Reset Password Pengguna

Jika user lupa password:

1. Buka detail pengguna
2. Tab **"Keamanan"**
3. Klik **"Reset Password"**
4. **Opsi:**
   - **Kirim Link Reset via Email** (recommended)
   - **Set Password Baru Manual** (isi password baru)
5. Klik **"Reset"**

---

## Mobile App

### Manajemen Pengguna Mobile:
1. Tab **"Admin"** → **"Pengguna"**
2. Tap card pengguna untuk detail
3. Edit/verifikasi/suspend via detail page

---

# 3. Manajemen Naskah

## Website

### Lihat Semua Naskah

1. **Sidebar Menu** → **"Naskah"**
2. Lihat tabel semua naskah di sistem

**Kolom Tabel:**
- Judul
- Penulis
- Kategori & Genre
- Status (Draft, Diajukan, Review, dll)
- Tanggal Submit
- Editor (jika sedang review)
- Rating Review (jika ada)
- Aksi

---

### Filter Naskah

**Filter Advanced:**
1. Klik **icon filter**
2. Pilih kriteria:
   - **Status:** Semua / Draft / Diajukan / Dalam Review / Perlu Revisi / Disetujui / Ditolak / Diterbitkan
   - **Kategori:** Fiksi / Non-Fiksi / dll
   - **Genre:** Romansa / Thriller / dll
   - **Tanggal Submit:** Range
   - **Penulis:** Cari nama
   - **Editor:** Cari nama editor
   - **Rating Review:** >= 3 / >= 4 / 5 bintang
3. Klik **"Terapkan"**

---

### Lihat Detail Naskah

1. Klik **judul naskah** di tabel
2. Detail page terbuka dengan tab:

**Tab "Informasi":**
- Metadata lengkap (judul, sinopsis, kategori, genre, dll)
- Data penulis
- File naskah (preview & download)
- Cover image
- Statistik (views, downloads)

**Tab "Status & Timeline":**
- Timeline perubahan status
- Timestamp setiap perubahan
- User yang melakukan aksi

**Tab "Review" (jika ada):**
- Data editor yang review
- Rating per aspek
- Feedback lengkap
- Rekomendasi (Setujui/Revisi/Tolak)
- Tanggal review

**Tab "Revisi" (jika ada):**
- History revisi (versi 1, 2, 3)
- File tiap revisi
- Catatan revisi
- Compare changes

**Tab "Pesanan Cetak" (jika ada):**
- Daftar pesanan cetak naskah ini
- Status pesanan
- Percetakan yang handle

---

### Ubah Status Naskah Manual

Jika perlu intervensi admin:

1. Buka detail naskah
2. Klik **"Ubah Status"** (atas kanan)
3. Pilih status baru dari dropdown
4. Isi **alasan perubahan status** (required)
5. (Opsional) **Notifikasi penulis** (toggle on/off)
6. Klik **"Update Status"**

**Status yang bisa diubah:**
- Draft → Diajukan
- Diajukan → Dalam Review (manual assign editor)
- Dalam Review → Perlu Revisi / Disetujui / Ditolak
- Disetujui → Diterbitkan

---

### Hapus Naskah (Soft Delete)

Jika naskah melanggar aturan:

1. Buka detail naskah
2. Klik **"Hapus Naskah"** (atas kanan, merah)
3. Pilih **alasan penghapusan:**
   - Konten melanggar aturan
   - Plagiasi
   - Spam
   - Permintaan penulis
   - Lainnya (tulis alasan)
4. Klik **"Hapus Permanen"**

**Notifikasi:**
- Email ke penulis (alasan penghapusan)

---

## Mobile App

### Manajemen Naskah Mobile:
1. Tab **"Admin"** → **"Naskah"**
2. Filter & cari naskah
3. Tap untuk detail & aksi

---

# 4. Manajemen Review & Editor

## Website

### Monitor Antrian Review

1. **Sidebar Menu** → **"Review"** → **"Antrian"**
2. Lihat naskah yang **menunggu editor**

**Informasi Ditampilkan:**
- Judul naskah
- Penulis
- Tanggal diajukan
- Lama menunggu (hari)
- Kategori & Genre
- Status: **Menunggu Editor**

**Alert:**
- Merah: Menunggu > 7 hari (urgent!)
- Kuning: Menunggu 4-7 hari
- Hijau: Menunggu < 4 hari

---

### Assign Editor Manual

Jika naskah terlalu lama di antrian:

1. Buka detail naskah di antrian
2. Klik **"Assign Editor Manual"**
3. **Pilih Editor:**
   - Lihat daftar editor tersedia
   - Filter by: spesialisasi, rating, workload
   - Pilih 1 editor
4. (Opsional) **Tulis catatan untuk editor**
5. Klik **"Assign"**

**Notifikasi:**
- Email ke editor terpilih
- Push notification
- Muncul di "Review Saya" editor

---

### Monitor Review Aktif

1. **Sidebar Menu** → **"Review"** → **"Sedang Berjalan"**
2. Lihat review yang **sedang dikerjakan editor**

**Informasi:**
- Judul naskah
- Editor yang handle
- Tanggal ambil review
- Deadline (7 hari dari ambil)
- Progress (%)
- Sisa waktu

**Alert:**
- Deadline < 1 hari (follow up!)
- Deadline 1-3 hari
- Deadline > 3 hari

---

### Perpanjang Deadline Review

Jika editor minta ekstensi:

1. Buka detail review
2. Klik **"Perpanjang Deadline"**
3. Pilih **tambahan hari:** 3 / 5 / 7 hari
4. Isi **alasan perpanjangan**
5. Klik **"Perpanjang"**

**Notifikasi:**
- Email ke editor (deadline baru)
- Email ke penulis (info delay)

---

### Batalkan Review & Reassign

Jika editor tidak responsif:

1. Buka detail review yang bermasalah
2. Klik **"Batalkan Review"**
3. Pilih alasan:
   - Editor tidak responsif
   - Editor minta batalkan
   - Quality issue
4. **Reassign ke editor lain** (otomatis suggest editor)
5. Klik **"Batalkan & Reassign"**

---

### Monitor Performa Editor

1. **Sidebar Menu** → **"Editor"** → **"Performance"**
2. Lihat statistik semua editor

**Metrik per Editor:**
- Total review selesai
- Rata-rata waktu review (hari)
- Rating kualitas review (1-5)
- On-time rate (%)
- Acceptance rate dari penulis (%)
- Kategori spesialisasi

**Aksi:**
- **Promote:** Editor terbaik → badge
- **Warning:** Editor lambat → email peringatan
- **Suspend:** Editor tidak qualified → nonaktifkan

---

## Mobile App

### Monitor Review Mobile:
1. Tab **"Admin"** → **"Review"**
2. Lihat antrian & active reviews
3. Assign/reassign via mobile

---

# 5. Manajemen Kategori & Genre

## Website

### Manajemen Kategori

1. **Sidebar Menu** → **"Konten"** → **"Kategori"**
2. Lihat tree struktur kategori

---

### Tambah Kategori Baru

1. Klik **"+ Tambah Kategori"**
2. Isi form:
   - **Nama Kategori** (required)
   - **Slug** (auto-generate dari nama)
   - **Deskripsi** (opsional)
   - **Kategori Induk** (opsional, untuk sub-kategori)
   - **Aktif** (toggle on/off)
3. Klik **"Simpan"**

**Contoh Struktur:**
```
Fiksi (parent)
├── Novel (child)
├── Cerpen (child)
└── Puisi (child)

Non-Fiksi (parent)
├── Biografi (child)
├── Essai (child)
└── Panduan (child)
```

---

### Edit Kategori

1. Klik **icon pensil** di kategori
2. Ubah data
3. Klik **"Update"**

---

### Hapus Kategori

1. Klik **icon hapus** (merah)
2. **Perhatian:** Jika ada naskah dengan kategori ini:
   - **Opsi 1:** Pindahkan ke kategori lain (pilih kategori baru)
   - **Opsi 2:** Hapus kategori, naskah jadi "Uncategorized"
3. Konfirmasi hapus

---

### Manajemen Genre

1. **Sidebar Menu** → **"Konten"** → **"Genre"**
2. Lihat daftar genre

---

### Tambah Genre Baru

1. Klik **"+ Tambah Genre"**
2. Isi form:
   - **Nama Genre** (required)
   - **Slug** (auto-generate)
   - **Deskripsi** (opsional)
   - **Aktif** (toggle on/off)
3. Klik **"Simpan"**

**Genre Populer:**
- Romansa
- Thriller
- Misteri
- Horror
- Sci-Fi
- Fantasy
- Historical
- Comedy
- Drama
- dll.

---

### Edit/Hapus Genre

- Edit: Klik icon pensil
- Hapus: Klik icon hapus (sama seperti kategori)

---

## Mobile App

### Manajemen Kategori & Genre Mobile:
1. Tab **"Admin"** → **"Konten"**
2. Toggle antara Kategori / Genre
3. Tambah/edit/hapus via mobile

---

# 6. Manajemen Percetakan

## Website

### Lihat Daftar Percetakan

1. **Sidebar Menu** → **"Percetakan"**
2. Lihat card/tabel percetakan terdaftar

**Informasi per Percetakan:**
- Nama percetakan
- Kontak (email, HP)
- Alamat lengkap
- Status (Aktif/Pending/Suspend)
- Rating rata-rata (dari review penulis)
- Total pesanan selesai
- Revenue total
- Tanggal daftar

---

### Approve Percetakan Baru

Jika ada percetakan daftar baru:

1. **Tab "Pending Approval"**
2. Klik card percetakan **status: Pending**
3. **Review data percetakan:**
   - Profil lengkap
   - Dokumen (NPWP, SIUP, portfolio)
   - Sample cetak (foto)
4. **Verifikasi:**
   - Semua dokumen valid
   - Sample cetak berkualitas
   - Kontak valid (test call/email)
5. **Approve atau Reject:**

**Approve:**
1. Klik **"Approve Percetakan"**
2. Isi **catatan approval** (opsional)
3. Klik **"Approve"**

**Notifikasi:**
- Email ke percetakan: "Akun Anda disetujui!"
- Percetakan bisa mulai terima pesanan

**Reject:**
1. Klik **"Reject"**
2. Isi **alasan penolakan** (required)
3. Klik **"Reject"**

**Notifikasi:**
- Email ke percetakan dengan alasan

---

### Setting Harga Percetakan

Setiap percetakan bisa set pricing sendiri:

1. Buka detail percetakan
2. Tab **"Pricing"**
3. Lihat/edit tabel harga

**Tabel Harga (per eksemplar):**

| Spesifikasi | Harga Base |
|-------------|------------|
| **Ukuran:** | |
| - A4 | Rp 0 (default) |
| - A5 | + Rp 2,000 |
| - B5 | + Rp 1,500 |
| **Kertas Isi:** | |
| - HVS 70gr | Rp 0 (default) |
| - HVS 80gr | + Rp 500/sheet |
| - Art Paper | + Rp 1,500/sheet |
| **Kertas Cover:** | |
| - Art Carton 260gr | Rp 5,000 |
| - Art Carton 310gr | Rp 7,000 |
| **Jilid:** | |
| - Perfect Binding | Rp 8,000 |
| - Hardcover | Rp 25,000 |
| - Spiral | Rp 5,000 |

**Edit Harga:**
1. Klik **"Edit Pricing"**
2. Ubah nilai (dalam Rupiah)
3. Klik **"Simpan"**

**Kalkulasi Auto:**
- Total harga = (harga per hal × jumlah hal) + harga cover + harga jilid
- Sistem otomatis hitung saat penulis pesan

---

### Suspend Percetakan

Jika percetakan bermasalah (komplain banyak, quality buruk):

1. Buka detail percetakan
2. Klik **"Suspend Akun"**
3. Isi **alasan suspend** (required)
4. Pilih **durasi:** Sementara (7/14/30 hari) / Permanen
5. Klik **"Suspend"**

**Efek:**
- Percetakan tidak bisa login
- Tidak muncul di list pilihan penulis
- Pesanan aktif tetap jalan (harus diselesaikan!)

**Notifikasi:**
- Email ke percetakan dengan alasan

---

### Reaktivasi Percetakan

1. Buka detail percetakan (status: Suspend)
2. Klik **"Reaktivasi"**
3. Isi catatan (opsional)
4. Klik **"Aktifkan"**

---

### Monitor Pesanan Percetakan

1. Buka detail percetakan
2. Tab **"Pesanan"**
3. Lihat semua pesanan (semua status)

**Filter:**
- Status pesanan
- Tanggal
- Penulis

---

## Mobile App

### Manajemen Percetakan Mobile:
1. Tab **"Admin"** → **"Percetakan"**
2. Approve/suspend/edit via mobile

---

# 7. Manajemen Pesanan Cetak

## Website

### Monitor Semua Pesanan

1. **Sidebar Menu** → **"Pesanan Cetak"**
2. Lihat dashboard pesanan

**Tab Status:**
- **Semua** (all orders)
- **Tertunda** (pending konfirmasi)
- **Diterima** (konfirmasi oleh percetakan)
- **Dalam Produksi**
- **Kontrol Kualitas**
- **Siap Kirim**
- **Dikirim**
- **Terkirim** (selesai)
- **Dibatalkan**

---

### Lihat Detail Pesanan

1. Klik card pesanan
2. Detail page dengan tab:

**Tab "Informasi Pesanan":**
- ID Pesanan
- Tanggal order
- Penulis (nama, kontak)
- Naskah (judul, file)
- Spesifikasi cetak
- Jumlah eksemplar
- Harga detail
- Total + ongkir

**Tab "Percetakan":**
- Nama percetakan
- Kontak
- Status konfirmasi
- Estimasi selesai

**Tab "Status Timeline":**
- Timeline perubahan status
- Foto progress upload (dari percetakan)
- Timestamp setiap tahap

**Tab "Pengiriman":**
- Kurir
- Nomor resi
- Tracking link
- Alamat pengiriman
- Status pengiriman

**Tab "Pembayaran":**
- Metode bayar
- Bukti transfer
- Status bayar (Pending/Lunas)
- Tanggal bayar

---

### Intervensi Admin pada Pesanan

#### 1. Batalkan Pesanan Manual

Jika ada komplain/masalah:

1. Buka detail pesanan
2. Klik **"Batalkan Pesanan"**
3. Isi **alasan pembatalan** (required)
4. Pilih **jenis refund:**
   - Full Refund (100%)
   - Partial Refund (input %)
   - No Refund
5. Klik **"Batalkan"**

**Notifikasi:**
- Email ke penulis (alasan + info refund)
- Email ke percetakan

---

#### 2. Ubah Status Manual

Jika percetakan lupa update:

1. Buka detail pesanan
2. Klik **"Ubah Status Manual"**
3. Pilih status baru
4. Isi catatan
5. Klik **"Update"**

---

#### 3. Mediasi Komplain

Jika penulis komplain ke admin:

1. Buka detail pesanan
2. Tab **"Komunikasi"**
3. Lihat chat history penulis ↔ percetakan
4. **Tambah Catatan Admin:**
   - Tulis solusi/keputusan
   - Tag: @penulis @percetakan
   - Klik **"Kirim"**

**Opsi Mediasi:**
- Order ulang (free)
- Partial refund
- Diskon next order
- dll.

---

### Ekspor Laporan Pesanan

1. Klik **"Ekspor Laporan"** (atas kanan)
2. Pilih kriteria:
   - **Periode:** Bulan ini / Custom range
   - **Status:** Semua / Terkirim / Dibatalkan
   - **Percetakan:** Semua / Pilih spesifik
3. Pilih **format:** Excel / PDF / CSV
4. Klik **"Ekspor"**
5. Download file

**Isi Laporan:**
- List semua pesanan
- Detail transaksi
- Revenue summary
- Percetakan performance
- Grafik trend

---

## Mobile App

### Monitor Pesanan Mobile:
1. Tab **"Admin"** → **"Pesanan"**
2. Filter by status
3. Intervensi via detail page

---

# 8. Penerbitan Naskah

## Website

### Proses Terbitkan Naskah

Setelah naskah **DISETUJUI** dari review:

1. **Sidebar Menu** → **"Naskah"** → Filter: **"Disetujui"**
2. Klik naskah yang akan diterbitkan
3. Klik **"Terbitkan Naskah"** (atas kanan)

---

### Form Penerbitan:

**Data Penerbitan:**
1. **Tanggal Terbit** (pilih tanggal, default: hari ini)
2. **ISBN** (input manual, atau klik "Generate ISBN Auto")
3. **Harga Jual Ebook** (Rp, opsional jika ada fitur ebook)
4. **Publik** (toggle on/off):
   - ON: Naskah muncul di galeri publik
   - OFF: Private, hanya penulis & admin lihat
5. **Featured** (toggle on/off):
   - ON: Tampil di homepage / banner
   - OFF: Normal listing
6. **Catatan Penerbitan** (opsional)

**Preview Publikasi:**
- Preview card naskah di galeri
- Cek cover, judul, sinopsis

**Submit:**
1. Review semua data
2. Klik **"Terbitkan"**
3. Konfirmasi popup

---

### Setelah Diterbitkan:

**Status Berubah:** DISETUJUI → DITERBITKAN

**Notifikasi Otomatis:**
- Email ke penulis: "Selamat! Naskah Anda telah diterbitkan!"
- Push notification
- Badge "Penulis Terbit" (jika first book)

**Naskah Tampil:**
- Galeri publik (jika publik = ON)
- Profil penulis
- Search results
- Kategori & genre page

**Opsi Cetak:**
- Tombol "Cetak Buku" aktif di dashboard penulis

---

### Edit Data Terbit

Jika perlu edit setelah terbit:

1. Buka detail naskah (status: Diterbitkan)
2. Tab **"Data Penerbitan"**
3. Klik **"Edit"**
4. Ubah data (ISBN, harga, status publik, dll)
5. Klik **"Update"**

---

### Unpublish Naskah

Jika naskah perlu diturunkan:

1. Buka detail naskah (status: Diterbitkan)
2. Klik **"Unpublish"**
3. Isi **alasan unpublish** (required)
4. Klik **"Unpublish"**

**Efek:**
- Status: DITERBITKAN → DISETUJUI
- Hilang dari galeri publik
- Pesanan cetak tetap jalan (sudah ada)

**Notifikasi:**
- Email ke penulis dengan alasan

---

## Mobile App

### Penerbitan Naskah Mobile:
1. Tab **"Admin"** → **"Naskah"** → Filter: Disetujui
2. Tap naskah → **"Terbitkan"**
3. Isi form penerbitan
4. Tap **"Terbitkan"**

---

# 9. Statistik & Laporan

## Website

### Dashboard Statistik

1. **Sidebar Menu** → **"Laporan"** → **"Dashboard"**

**Widget Statistik:**

#### 1. Overview Pengguna
- Total pengguna (all time)
- Pengguna baru (bulan ini)
- Breakdown by role (chart pie)
- User growth trend (chart line)

#### 2. Statistik Naskah
- Total naskah di sistem
- Naskah baru (bulan ini)
- Breakdown by status (chart bar)
- Breakdown by kategori (chart pie)
- Naskah populer (top 10)

#### 3. Statistik Review
- Total review selesai
- Review aktif (sedang berjalan)
- Rata-rata waktu review (hari)
- Editor paling produktif (top 5)
- Rating quality review (rata-rata)

#### 4. Statistik Pesanan Cetak
- Total pesanan (all time)
- Pesanan bulan ini
- Revenue bulan ini (Rp)
- Breakdown by status (chart)
- Percetakan paling banyak order (top 5)

#### 5. Revenue & Financial
- Total revenue (all time)
- Revenue bulan ini
- Revenue per bulan (chart line, 12 bulan terakhir)
- Proyeksi revenue bulan depan
- Commission detail (platform fee)

---

### Laporan Custom

1. Klik **"Buat Laporan Custom"**
2. Pilih kriteria:
   - **Jenis Laporan:**
     - Pengguna
     - Naskah
     - Review
     - Pesanan
     - Revenue
   - **Periode:** Custom range
   - **Filter:** (sesuai jenis laporan)
   - **Grouping:** By bulan / minggu / hari
3. Klik **"Generate"**

**Preview Laporan:**
- Tabel data
- Chart visual
- Summary statistics

**Ekspor:**
- Excel (.xlsx)
- PDF (printable)
- CSV (raw data)

---

### Laporan Terjadwal

Setup laporan otomatis:

1. **Menu "Laporan"** → **"Laporan Terjadwal"**
2. Klik **"+ Buat Jadwal Baru"**
3. Isi form:
   - **Nama Laporan** (misal: "Laporan Bulanan")
   - **Jenis Laporan:** (pilih)
   - **Periode:** Bulan ini / Minggu ini / Custom
   - **Jadwal Kirim:**
     - Frekuensi: Harian / Mingguan / Bulanan
     - Hari: (pilih hari)
     - Jam: (pilih jam)
   - **Penerima Email:** (admin, owner, dll)
   - **Format:** Excel / PDF
4. Klik **"Simpan Jadwal"**

**Laporan otomatis dikirim ke email sesuai jadwal!**

---

## Mobile App

### Statistik Mobile:
1. Tab **"Admin"** → **"Laporan"**
2. Lihat dashboard statistik (widget responsif)
3. Tap widget untuk detail

---

# 10. Notifikasi & Komunikasi

## Website

### Kirim Notifikasi Broadcast

Untuk pengumuman penting:

1. **Sidebar Menu** → **"Komunikasi"** → **"Broadcast"**
2. Klik **"+ Kirim Broadcast Baru"**
3. Isi form:
   - **Judul Notifikasi** (required)
   - **Pesan** (required, support markdown)
   - **Target Penerima:**
     - Semua pengguna
     - Role tertentu (Penulis/Editor/Percetakan)
     - User spesifik (pilih manual)
   - **Channel:**
     - Email
     - Push Notification (mobile)
     - In-App Notification (website)
   - **Jadwal Kirim:**
     - Kirim sekarang
     - Jadwal nanti (pilih tanggal & jam)
4. **Preview** notifikasi
5. Klik **"Kirim"**

**Log Broadcast:**
- History broadcast tersimpan
- Status delivered/read
- Analytics (berapa % baca)

---

### Balas Ticket Support

Jika user kirim ticket:

1. **Menu "Support"** → **"Ticket"**
2. Lihat daftar ticket:
   - **Status:** Open / In Progress / Resolved / Closed
   - **Priority:** High / Medium / Low
3. Klik ticket untuk buka
4. Baca konten ticket
5. **Balas:**
   - Tulis balasan
   - Upload attachment (jika perlu)
   - Ubah status ticket
   - Assign ke admin lain (jika perlu)
   - Klik **"Kirim Balasan"**

**Notifikasi:**
- Email ke user (ada balasan)

---

### Chat dengan User

Untuk komunikasi real-time:

1. Buka profil user / detail naskah / detail pesanan
2. Klik **"Chat"** (icon chat bubble)
3. Chat window terbuka
4. Ketik pesan → Enter
5. Realtime chat (seperti WhatsApp)

**Fitur:**
- Text message
- Upload file/image
- Emoji
- Timestamp
- Read receipt

---

## Mobile App

### Notifikasi & Chat Mobile:
1. Tab **"Admin"** → **"Komunikasi"**
2. Sub-tab: Broadcast / Ticket / Chat
3. Kirim broadcast/balas ticket/chat via mobile

---

# 11. Pengaturan Sistem

## Website

### Pengaturan Umum

1. **Sidebar Menu** → **"Pengaturan"** → **"Umum"**

**Setting:**
- **Nama Aplikasi:** Publishify (editable)
- **Logo:** Upload logo (header, favicon)
- **Tagline:** "Platform Digital Publishing untuk Penulis Indonesia"
- **Kontak Support:**
  - Email support
  - WhatsApp
  - Alamat kantor
- **Sosial Media:** (link Instagram, Twitter, Facebook, dll)
- **Timezone:** Asia/Jakarta
- **Bahasa Default:** Indonesia / English

---

### Pengaturan Review

1. **Menu "Pengaturan"** → **"Review"**

**Setting:**
- **Auto-assign Review:** ON / OFF
  - ON: Sistem auto assign ke editor tersedia
  - OFF: Admin assign manual
- **Max Review per Editor:** 5 (editable)
- **Deadline Review (hari):** 7 (editable)
- **Auto-reminder:**
  - ON: Email reminder H-2 sebelum deadline
  - OFF: Tidak ada reminder
- **Minimum Rating untuk Setujui:** 3.0 (editable)

---

### Pengaturan Cetak

1. **Menu "Pengaturan"** → **"Cetak"**

**Setting:**
- **Minimum Order:** 10 eksemplar (editable)
- **Maximum Order:** 1000 eksemplar (editable)
- **Platform Fee (%):** 10% (dari setiap pesanan)
- **Auto-approve Percetakan:** ON / OFF
  - ON: Percetakan langsung aktif setelah daftar
  - OFF: Butuh approve admin
- **Kurir Tersedia:** (checklist)
  - JNE
  - J&T Express
  - SiCepat
  - Anteraja

---

### Pengaturan Pembayaran

1. **Menu "Pengaturan"** → **"Pembayaran"**

**Setting:**
- **Payment Gateway:**
  - Midtrans (API Key)
  - Xendit (API Key)
  - Manual Transfer
- **Rekening Bank:** (untuk manual transfer)
  - Bank BCA: 1234567890 a.n. PT Publishify
  - Bank Mandiri: 9876543210 a.n. PT Publishify
- **Auto-verify Payment:** ON / OFF
  - ON: Verifikasi otomatis via API
  - OFF: Admin verifikasi manual

---

### Pengaturan Email

1. **Menu "Pengaturan"** → **"Email"**

**SMTP Config:**
- **SMTP Host:** smtp.gmail.com
- **SMTP Port:** 587
- **Username:** noreply@publishify.me
- **Password:** ******** (hidden)
- **From Name:** Publishify
- **From Email:** noreply@publishify.me

**Template Email:**
- Klik **"Kelola Template"**
- Edit template:
  - Welcome email
  - Verification email
  - Reset password
  - Review feedback
  - Naskah diterbitkan
  - Order confirmation
  - dll.

---

### Backup & Restore

1. **Menu "Pengaturan"** → **"Backup"**

**Auto Backup:**
- **Status:** ON / OFF
- **Frekuensi:** Harian / Mingguan
- **Jam:** 02:00 WIB (editable)
- **Backup Lokasi:** Cloud Storage / Local
- **Retention:** 30 hari (hapus backup lama)

**Manual Backup:**
1. Klik **"Backup Sekarang"**
2. Pilih **jenis backup:**
   - Full (database + files)
   - Database only
   - Files only
3. Klik **"Backup"**
4. Tunggu proses (notifikasi selesai)
5. Download backup file

**Restore:**
1. Klik **"Restore dari Backup"**
2. Pilih **file backup** (upload atau pilih dari list)
3. Konfirmasi **"Restore akan overwrite data saat ini!"**
4. Klik **"Restore"**
5. Tunggu proses
6. Sistem restart otomatis

---

### Activity Log

1. **Menu "Pengaturan"** → **"Activity Log"**

**Melihat Log Aktivitas Sistem:**
- Filter by:
  - **User:** Admin / User spesifik
  - **Action:** Login, Create, Update, Delete, dll
  - **Module:** Pengguna, Naskah, Review, Pesanan, dll
  - **Tanggal:** Range
- Lihat tabel log:
  - Timestamp
  - User
  - Action
  - Module
  - Detail (JSON)
  - IP Address

**Ekspor Log:**
- Klik **"Ekspor"** → CSV / Excel
- Untuk audit trail

---

### Maintenance Mode

Untuk update/maintenance:

1. **Menu "Pengaturan"** → **"Maintenance"**
2. Toggle **"Maintenance Mode"** → ON
3. Isi **pesan maintenance:**
   ```
   Sistem sedang dalam maintenance.
   Estimasi selesai: 2 jam
   Mohon maaf atas ketidaknyamanannya.
   ```
4. Pilih **akses exception:**
   - Admin bisa tetap akses
   - Editor bisa tetap akses
   - Semua user bisa akses
5. Klik **"Aktifkan Maintenance Mode"**

**Efek:**
- User non-exception lihat halaman maintenance
- Tidak bisa login/akses fitur
- API return status 503

**Matikan Maintenance:**
- Toggle OFF → Sistem normal kembali

---

## Mobile App

### Pengaturan Mobile:
1. Tab **"Admin"** → **"Pengaturan"**
2. Edit setting via mobile (UI responsif)

---

# 12. FAQ Admin

## Bagaimana cara menambah admin baru?
1. Buka **"Pengguna"** → **"+ Tambah Pengguna"**
2. Pilih **Role: Admin**
3. Simpan → Email welcome dikirim otomatis

## Apa yang harus dilakukan jika review naskah terlalu lama?
1. Cek **"Review"** → **"Antrian"**
2. Jika menunggu > 7 hari, **assign editor manual**
3. Follow up editor via email/chat

## Bagaimana cara mengatasi komplain penulis tentang hasil cetak?
1. Buka detail **pesanan** yang dikomplain
2. Tab **"Komunikasi"** → Mediasi
3. Opsi:
   - Order ulang (percetakan tanggung)
   - Partial refund
   - Diskon next order

## Bisa hapus naskah/user secara permanen?
Ya, tapi **hati-hati!** Data terhapus tidak bisa restore.
Pastikan sudah backup sebelum hapus.

## Bagaimana cara melihat revenue?
1. **"Laporan"** → **"Dashboard"**
2. Widget **"Revenue & Financial"**
3. Atau buat **laporan custom** untuk detail

## Kapan sebaiknya unpublish naskah?
- Konten melanggar aturan
- Plagiasi terdeteksi
- Permintaan penulis
- Quality issue serius

## Bagaimana cara monitoring performa editor?
1. **"Editor"** → **"Performance"**
2. Lihat metrik: waktu review, rating, on-time rate
3. Jika performa buruk → warning atau suspend

## Bisa kirim notifikasi ke user tertentu?
Ya! **"Komunikasi"** → **"Broadcast"**
Pilih target: Semua / Role / User spesifik

## Bagaimana restore data jika ada kesalahan?
1. **"Pengaturan"** → **"Backup"**
2. Pilih backup file terakhir
3. Klik **"Restore"**
4. Sistem rollback ke state backup

## Apa itu Maintenance Mode?
Mode khusus untuk update sistem.
User tidak bisa akses, admin tetap bisa.
Aktifkan di **"Pengaturan"** → **"Maintenance"**

---

# Checklist Harian Admin

**Pagi (09:00 WIB):**
- [ ] Cek dashboard overview
- [ ] Review antrian review (naskah menunggu > 7 hari?)
- [ ] Approve percetakan baru (jika ada)
- [ ] Cek ticket support open

**Siang (13:00 WIB):**
- [ ] Monitor pesanan cetak bermasalah
- [ ] Follow up editor lambat
- [ ] Balas ticket support

**Sore (17:00 WIB):**
- [ ] Review laporan harian
- [ ] Terbitkan naskah yang sudah disetujui
- [ ] Close ticket support resolved

**Mingguan (Senin):**
- [ ] Review performa editor
- [ ] Ekspor laporan mingguan
- [ ] Meeting tim (jika ada)

**Bulanan (Tanggal 1):**
- [ ] Generate laporan bulanan
- [ ] Review & update pricing percetakan
- [ ] Audit user suspend/inactive
- [ ] Backup manual full

---

**Selamat mengelola Publishify!**  
**Sebagai Admin, Anda adalah tulang punggung sistem ini.**

---

**Support Teknis:**
- Email: tech@publishify.me  
- WhatsApp: +62 812-3456-7890  
- Dokumentasi: https://publishify.me/docs/admin

---

_Update: Januari 2026_
