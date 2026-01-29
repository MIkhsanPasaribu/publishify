# LAPORAN AKHIR PENGEMBANGAN APLIKASI MOBILE

## PUBLISHIFY: SISTEM MANAJEMEN PENERBITAN NASKAH BERBASIS MOBILE

---

<div align="center">

### LAPORAN AKHIR PROYEK

**PUBLISHIFY**
**Aplikasi Mobile Sistem Manajemen Penerbitan Naskah**

---

**Disusun Oleh:**

Tim Pengembang Publishify

---

**TAHUN 2026**

</div>

---

## KATA PENGANTAR

Puji syukur kami panjatkan kehadirat Tuhan Yang Maha Esa atas segala rahmat dan karunia-Nya sehingga kami dapat menyelesaikan laporan akhir proyek pengembangan aplikasi mobile Publishify ini dengan baik. Laporan ini disusun sebagai dokumentasi komprehensif dari proses pengembangan aplikasi mobile untuk sistem manajemen penerbitan naskah yang telah kami kerjakan.

Aplikasi mobile Publishify dikembangkan sebagai komplemen dari sistem web yang telah ada sebelumnya. Dengan hadirnya aplikasi mobile, pengguna sistem Publishify dapat mengakses dan mengelola aktivitas penerbitan mereka kapan saja dan di mana saja melalui perangkat genggam. Pengembangan aplikasi ini merupakan respons terhadap kebutuhan mobilitas yang semakin tinggi dalam industri kreatif dan penerbitan.

Kami menyadari bahwa laporan ini masih memiliki keterbatasan dan kekurangan. Oleh karena itu, kami sangat mengharapkan kritik dan saran yang membangun dari semua pihak untuk perbaikan dan pengembangan aplikasi ini di masa yang akan datang. Kami berharap laporan ini dapat memberikan gambaran yang jelas mengenai proses pengembangan, arsitektur aplikasi, serta hasil yang telah dicapai dalam proyek aplikasi mobile Publishify.

Akhir kata, kami mengucapkan terima kasih kepada semua pihak yang telah berkontribusi dalam penyelesaian proyek dan laporan ini. Semoga laporan ini dapat bermanfaat bagi pembaca dan menjadi referensi yang berguna bagi pengembangan aplikasi mobile serupa di masa depan.

---

Tim Pengembang Publishify
Januari 2026

---

## DAFTAR ISI

| No          | Judul                                     | Halaman |
| ----------- | ----------------------------------------- | ------- |
|             | Cover                                     | i       |
|             | Kata Pengantar                            | ii      |
|             | Daftar Isi                                | iii     |
|             | Daftar Gambar                             | v       |
|             | Daftar Tabel                              | vi      |
|             | Daftar Lampiran                           | vii     |
| **BAB I**   | **PENDAHULUAN**                           | **1**   |
| A           | Latar Belakang Proyek                     | 1       |
| B           | Identifikasi Masalah                      | 3       |
| C           | Batasan Masalah                           | 4       |
| D           | Rumusan Masalah                           | 5       |
| E           | Tujuan Proyek                             | 5       |
| F           | Manfaat Proyek                            | 6       |
| **BAB II**  | **KAJIAN TEORI**                          | **8**   |
| A           | Konsep Dasar Pengembangan Aplikasi Mobile | 8       |
| B           | Pemodelan Sistem                          | 12      |
| C           | Interaksi Manusia dan Sistem Mobile       | 18      |
| D           | Kerangka Pengembangan Aplikasi Mobile     | 22      |
| **BAB III** | **PERANCANGAN APLIKASI**                  | **25**  |
| A           | Perancangan Aplikasi Mobile               | 25      |
|             | 1. Perancangan Arsitektur Aplikasi        | 25      |
|             | 2. Perancangan Model Data                 | 28      |
|             | 3. Perancangan Antarmuka Pengguna         | 32      |
|             | 4. Perancangan Interaksi Pengguna         | 38      |
| **BAB IV**  | **HASIL DAN PEMBAHASAN**                  | **42**  |
| A           | Hasil Pengembangan Aplikasi               | 42      |
|             | 1. Hasil Aplikasi Mobile                  | 42      |
| B           | Pengujian Aplikasi                        | 48      |
|             | 1. Pengujian Aplikasi Mobile              | 48      |
| C           | Pembahasan                                | 54      |
| **BAB V**   | **PENUTUP**                               | **58**  |
| A           | Simpulan                                  | 58      |
| B           | Saran                                     | 59      |
|             | Daftar Pustaka                            | 61      |
|             | Lampiran                                  | 64      |

---

## DAFTAR GAMBAR

| No   | Judul Gambar                                | Halaman |
| ---- | ------------------------------------------- | ------- |
| 2.1  | Diagram Arsitektur Flutter                  | 10      |
| 2.2  | Diagram Use Case Aplikasi Mobile Publishify | 13      |
| 2.3  | Diagram Aktivitas Proses Review pada Mobile | 14      |
| 2.4  | Diagram Sekuens Notifikasi Real-time        | 15      |
| 2.5  | Diagram Kelas Model Aplikasi Mobile         | 16      |
| 2.6  | Diagram State Machine Navigasi Aplikasi     | 17      |
| 2.7  | Struktur Widget Tree Flutter                | 18      |
| 2.8  | Diagram Komponen Arsitektur Mobile          | 19      |
| 2.9  | Prinsip-prinsip Desain Mobile First         | 20      |
| 2.10 | Panduan Material Design                     | 21      |
| 2.11 | Diagram Alir Pengembangan Aplikasi Mobile   | 24      |
| 3.1  | Arsitektur Aplikasi Flutter                 | 26      |
| 3.2  | Struktur Folder Aplikasi                    | 27      |
| 3.3  | Wireframe Halaman Login Mobile              | 33      |
| 3.4  | Wireframe Dasbor Penulis Mobile             | 34      |
| 3.5  | Wireframe Dasbor Editor Mobile              | 35      |
| 3.6  | Wireframe Halaman Notifikasi                | 36      |
| 3.7  | Mockup Antarmuka Aplikasi                   | 37      |
| 4.1  | Tampilan Halaman Login Aplikasi             | 43      |
| 4.2  | Tampilan Dasbor Penulis Mobile              | 44      |
| 4.3  | Tampilan Manajemen Naskah Mobile            | 45      |
| 4.4  | Tampilan Dasbor Editor Mobile               | 46      |
| 4.5  | Hasil Pengujian PageSpeed Insights Mobile   | 49      |
| 4.6  | Grafik Perbandingan Metrik Kinerja Mobile   | 52      |

---

## DAFTAR TABEL

| No  | Judul Tabel                                | Halaman |
| --- | ------------------------------------------ | ------- |
| 2.1 | Perbandingan Framework Pengembangan Mobile | 11      |
| 2.2 | Prinsip-prinsip Desain Mobile              | 22      |
| 3.1 | Daftar Dependensi Aplikasi Mobile          | 25      |
| 3.2 | Struktur Model Data Aplikasi               | 29      |
| 3.3 | Spesifikasi Kebutuhan Fungsional Mobile    | 31      |
| 3.4 | Panduan Warna dan Tipografi Mobile         | 38      |
| 4.1 | Hasil Pengujian Fungsional                 | 48      |
| 4.2 | Hasil Pengujian Kinerja Mobile             | 50      |
| 4.3 | Hasil Pengujian Responsivitas              | 51      |
| 4.4 | Hasil Pengujian Kompatibilitas Perangkat   | 52      |
| 4.5 | Hasil Pengujian Usability                  | 53      |

---

## DAFTAR LAMPIRAN

| No  | Judul Lampiran            | Halaman |
| --- | ------------------------- | ------- |
| A   | Kode Sumber Halaman Utama | L-1     |
| B   | Kode Sumber Service API   | L-5     |
| C   | Kode Sumber Model Data    | L-10    |
| D   | Kode Sumber Widget Kustom | L-15    |
| E   | Kode Sumber Controller    | L-20    |
| F   | Hasil Pengujian Lengkap   | L-25    |

---

**Catatan untuk Penyusunan Laporan:**

Untuk setiap lampiran di atas, silakan merujuk ke file-file berikut dalam proyek:

- **Lampiran A (Halaman Utama):**
  - File: `mobile/lib/main.dart`
  - File: `mobile/lib/pages/main_layout.dart`

- **Lampiran B (Service API):**
  - Folder: `mobile/lib/services/`
  - File: `mobile/lib/services/http_client_service.dart`

- **Lampiran C (Model Data):**
  - Folder: `mobile/lib/models/`
  - Sub-folder: `general/`, `writer/`, `editor/`

- **Lampiran D (Widget Kustom):**
  - Folder: `mobile/lib/widgets/`
  - Folder: `mobile/lib/components/`

- **Lampiran E (Controller):**
  - Folder: `mobile/lib/controllers/`

- **Lampiran F (Hasil Pengujian):**
  - Tangkapan layar dari PageSpeed Insights Mobile
  - Folder: `mobile/test/`
