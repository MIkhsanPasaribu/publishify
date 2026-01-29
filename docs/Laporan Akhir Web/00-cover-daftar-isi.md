# LAPORAN AKHIR PENGEMBANGAN SISTEM WEB

## PUBLISHIFY: SISTEM MANAJEMEN PENERBITAN NASKAH BERBASIS WEB

---

<div align="center">

### LAPORAN AKHIR PROYEK

**PUBLISHIFY**
**Sistem Manajemen Penerbitan Naskah Berbasis Web**

---

**Disusun Oleh:**

Tim Pengembang Publishify

---

**TAHUN 2026**

</div>

---

## KATA PENGANTAR

Puji syukur kami panjatkan kehadirat Tuhan Yang Maha Esa atas rahmat dan hidayah-Nya sehingga kami dapat menyelesaikan laporan akhir proyek pengembangan sistem web Publishify ini dengan baik. Laporan ini disusun sebagai dokumentasi komprehensif dari proses pengembangan sistem manajemen penerbitan naskah yang telah kami kerjakan.

Publishify merupakan sebuah platform digital yang dirancang untuk mengelola seluruh proses penerbitan buku secara terintegrasi. Sistem ini dikembangkan dengan tujuan untuk menjembatani kesenjangan antara penulis, editor, dan penerbit dalam ekosistem penerbitan modern. Melalui pengembangan sistem berbasis web ini, kami berharap dapat memberikan kontribusi nyata dalam digitalisasi industri penerbitan di Indonesia.

Kami menyadari bahwa laporan ini masih jauh dari sempurna. Oleh karena itu, kami sangat mengharapkan kritik dan saran yang membangun dari semua pihak demi perbaikan dan pengembangan sistem ini di masa yang akan datang. Kami berharap laporan ini dapat memberikan gambaran yang jelas mengenai proses pengembangan, arsitektur sistem, serta hasil yang telah dicapai dalam proyek Publishify.

Akhir kata, kami mengucapkan terima kasih kepada semua pihak yang telah berkontribusi dalam penyelesaian proyek dan laporan ini. Semoga laporan ini dapat bermanfaat bagi pembaca dan menjadi referensi yang berguna bagi pengembangan sistem serupa di masa depan.

---

Tim Pengembang Publishify
Januari 2026

---

## DAFTAR ISI

| No          | Judul                             | Halaman |
| ----------- | --------------------------------- | ------- |
|             | Cover                             | i       |
|             | Kata Pengantar                    | ii      |
|             | Daftar Isi                        | iii     |
|             | Daftar Gambar                     | v       |
|             | Daftar Tabel                      | vi      |
|             | Daftar Lampiran                   | vii     |
| **BAB I**   | **PENDAHULUAN**                   | **1**   |
| A           | Latar Belakang Proyek             | 1       |
| B           | Identifikasi Masalah              | 3       |
| C           | Batasan Masalah                   | 4       |
| D           | Rumusan Masalah                   | 5       |
| E           | Tujuan Proyek                     | 5       |
| F           | Manfaat Proyek                    | 6       |
| **BAB II**  | **KAJIAN TEORI**                  | **8**   |
| A           | Konsep Dasar Pengembangan Sistem  | 8       |
| B           | Pemodelan Sistem                  | 12      |
| C           | Interaksi Manusia dan Sistem      | 18      |
| D           | Kerangka Pengembangan Sistem      | 22      |
| **BAB III** | **PERANCANGAN SISTEM**            | **25**  |
| A           | Perancangan Sistem Web            | 25      |
|             | 1. Perancangan Arsitektur Sistem  | 25      |
|             | 2. Perancangan Basis Data         | 28      |
|             | 3. Perancangan Antarmuka Pengguna | 32      |
|             | 4. Perancangan Interaksi Pengguna | 38      |
| **BAB IV**  | **HASIL DAN PEMBAHASAN**          | **42**  |
| A           | Hasil Pengembangan Sistem         | 42      |
|             | 1. Hasil Sistem Web               | 42      |
| B           | Pengujian Sistem                  | 48      |
|             | 1. Pengujian Sistem Web           | 48      |
| C           | Pembahasan                        | 54      |
| **BAB V**   | **PENUTUP**                       | **58**  |
| A           | Simpulan                          | 58      |
| B           | Saran                             | 59      |
|             | Daftar Pustaka                    | 61      |
|             | Lampiran                          | 64      |

---

## DAFTAR GAMBAR

| No   | Judul Gambar                                          | Halaman |
| ---- | ----------------------------------------------------- | ------- |
| 2.1  | Diagram Arsitektur Model-View-Controller              | 10      |
| 2.2  | Diagram Use Case Sistem Publishify                    | 13      |
| 2.3  | Diagram Aktivitas Proses Pengajuan Naskah             | 14      |
| 2.4  | Diagram Sekuens Proses Review Naskah                  | 15      |
| 2.5  | Diagram Kelas Sistem Publishify                       | 16      |
| 2.6  | Diagram State Machine Status Naskah                   | 17      |
| 2.7  | Entity Relationship Diagram                           | 18      |
| 2.8  | Diagram Komponen Arsitektur Sistem                    | 19      |
| 2.9  | Diagram Deployment Sistem Web                         | 20      |
| 2.10 | Prinsip-prinsip Desain Interaksi Manusia dan Komputer | 21      |
| 2.11 | Diagram Alir Pengembangan Sistem Web                  | 24      |
| 3.1  | Arsitektur Sistem Frontend Next.js                    | 26      |
| 3.2  | Arsitektur Sistem Backend NestJS                      | 27      |
| 3.3  | Skema Basis Data Publishify                           | 30      |
| 3.4  | Wireframe Halaman Beranda                             | 33      |
| 3.5  | Wireframe Dasbor Penulis                              | 34      |
| 3.6  | Wireframe Dasbor Editor                               | 35      |
| 3.7  | Wireframe Dasbor Administrator                        | 36      |
| 3.8  | Mockup Antarmuka Pengguna                             | 37      |
| 4.1  | Tampilan Halaman Beranda Publishify                   | 43      |
| 4.2  | Tampilan Dasbor Penulis                               | 44      |
| 4.3  | Tampilan Manajemen Naskah                             | 45      |
| 4.4  | Tampilan Dasbor Editor                                | 46      |
| 4.5  | Hasil Pengujian PageSpeed Insights Desktop            | 49      |
| 4.6  | Grafik Perbandingan Metrik Kinerja                    | 52      |

---

## DAFTAR TABEL

| No  | Judul Tabel                             | Halaman |
| --- | --------------------------------------- | ------- |
| 2.1 | Perbandingan Metode Pengembangan Sistem | 11      |
| 2.2 | Prinsip-prinsip Desain Interaksi        | 22      |
| 3.1 | Daftar Teknologi yang Digunakan         | 25      |
| 3.2 | Struktur Tabel Basis Data               | 29      |
| 3.3 | Spesifikasi Kebutuhan Fungsional        | 31      |
| 3.4 | Panduan Warna dan Tipografi             | 38      |
| 4.1 | Hasil Pengujian Fungsional              | 48      |
| 4.2 | Hasil Pengujian PageSpeed Insights      | 50      |
| 4.3 | Hasil Pengujian Aksesibilitas           | 51      |
| 4.4 | Hasil Pengujian Praktik Terbaik         | 52      |
| 4.5 | Hasil Pengujian Optimasi Mesin Pencari  | 53      |

---

## DAFTAR LAMPIRAN

| No  | Judul Lampiran                     | Halaman |
| --- | ---------------------------------- | ------- |
| A   | Kode Sumber Modul Autentikasi      | L-1     |
| B   | Kode Sumber Modul Manajemen Naskah | L-5     |
| C   | Kode Sumber Modul Review           | L-10    |
| D   | Skema Basis Data Lengkap           | L-15    |
| E   | Dokumentasi API Endpoint           | L-20    |
| F   | Hasil Pengujian Lengkap            | L-25    |

---

**Catatan untuk Penyusunan Laporan:**

Untuk setiap lampiran di atas, silakan merujuk ke file-file berikut dalam proyek:

- **Lampiran A (Modul Autentikasi):**
  - File: `backend/src/modules/auth/auth.service.ts`
  - File: `backend/src/modules/auth/auth.controller.ts`
  - File: `frontend/lib/api/auth.ts`

- **Lampiran B (Modul Manajemen Naskah):**
  - File: `backend/src/modules/naskah/naskah.service.ts`
  - File: `backend/src/modules/naskah/naskah.controller.ts`
  - File: `frontend/lib/api/naskah.ts`

- **Lampiran C (Modul Review):**
  - File: `backend/src/modules/review/review.service.ts`
  - File: `backend/src/modules/review/review.controller.ts`
  - File: `frontend/lib/api/review.ts`

- **Lampiran D (Skema Basis Data):**
  - File: `backend/prisma/schema.prisma`

- **Lampiran E (Dokumentasi API):**
  - File: `backend/swagger-endpoints.json`

- **Lampiran F (Hasil Pengujian):**
  - Tangkapan layar dari PageSpeed Insights
  - File: `backend/test/` (folder pengujian)
