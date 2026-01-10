# BAB V

# PENUTUP

---

## A. Kesimpulan

Berdasarkan hasil analisis, perancangan, pengembangan, implementasi, dan evaluasi sistem informasi penerbitan naskah Publishify yang telah dilakukan, kami menyimpulkan beberapa hal sebagai berikut:

### 1. Pencapaian Tujuan Proyek

**a. Tujuan Utama**

Proyek Publishify telah berhasil mencapai tujuan utamanya yaitu mengembangkan sistem informasi penerbitan naskah yang terintegrasi, menghubungkan penulis, editor, percetakan, dan administrator dalam satu platform digital. Sistem ini menyediakan solusi komprehensif untuk mendigitalisasi proses penerbitan yang sebelumnya dilakukan secara manual dan terpisah-pisah.

**b. Tujuan Spesifik**

Pencapaian tujuan-tujuan spesifik proyek dapat dirangkum sebagai berikut:

| No  | Tujuan                                      | Status     | Keterangan                                  |
| --- | ------------------------------------------- | ---------- | ------------------------------------------- |
| 1   | Membangun sistem manajemen naskah digital   | ✓ Tercapai | 8 fitur pengelolaan naskah terimplementasi  |
| 2   | Mengimplementasikan sistem review editorial | ✓ Tercapai | Alur review lengkap dengan feedback per bab |
| 3   | Menyediakan fitur pemesanan cetak           | ✓ Tercapai | Sistem pesanan dan tracking tersedia        |
| 4   | Mengembangkan notifikasi real-time          | ✓ Tercapai | WebSocket terimplementasi di web dan mobile |
| 5   | Menyediakan akses multi-platform            | ✓ Tercapai | Aplikasi web dan Android tersedia           |
| 6   | Mengimplementasikan keamanan sistem         | ✓ Tercapai | JWT auth, role-based access control         |

_Tabel 5.1 Pencapaian Tujuan Proyek_

### 2. Hasil Pengembangan

Pengembangan sistem Publishify menghasilkan produk-produk berikut:

**a. Aplikasi Backend (REST API)**

- 66+ endpoint API yang terdokumentasi dengan Swagger
- 10 modul bisnis yang terintegrasi
- Basis data PostgreSQL dengan 28 tabel
- WebSocket server untuk notifikasi real-time

**b. Aplikasi Frontend Web**

- 25+ halaman responsif dengan Next.js 14
- 4 dashboard berbeda untuk setiap role pengguna
- Antarmuka modern dengan shadcn/ui
- State management dengan Zustand dan TanStack Query

**c. Aplikasi Seluler Android**

- 41+ halaman native dengan Flutter
- Integrasi penuh dengan backend API
- Notifikasi real-time via Socket.io
- Material Design UI yang konsisten

### 3. Efektivitas Metode ADDIE

Penggunaan metode ADDIE (_Analysis, Design, Development, Implementation, Evaluation_) terbukti efektif dalam pengembangan sistem Publishify. Pendekatan sistematis yang ditawarkan oleh ADDIE membantu kami untuk:

- **Tahap Analisis**: Mengidentifikasi kebutuhan secara komprehensif sebelum memulai pengembangan
- **Tahap Perancangan**: Merancang arsitektur dan antarmuka yang terstruktur dengan dokumentasi yang baik
- **Tahap Pengembangan**: Mengimplementasikan sistem sesuai spesifikasi dengan kode yang terorganisir
- **Tahap Implementasi**: Menyebarkan sistem dengan konfigurasi yang tepat
- **Tahap Evaluasi**: Menvalidasi hasil melalui pengujian sistematis dengan tingkat keberhasilan 100%

### 4. Kontribusi Proyek

Proyek Publishify memberikan kontribusi pada beberapa aspek:

**a. Kontribusi Praktis**

- Menyediakan platform yang dapat digunakan oleh penerbit independen dan self-publisher
- Mempercepat dan mengotomatisasi proses penerbitan yang sebelumnya manual
- Meningkatkan transparansi dan akuntabilitas dalam proses editorial

**b. Kontribusi Teknis**

- Implementasi arsitektur modern dengan Next.js 14 App Router dan NestJS
- Contoh integrasi multi-platform dengan API yang konsisten
- Dokumentasi teknis yang dapat menjadi referensi pengembangan sistem serupa

---

## B. Saran

Berdasarkan pengalaman pengembangan dan hasil evaluasi sistem Publishify, kami memberikan saran-saran berikut untuk pengembangan dan penelitian selanjutnya:

### 1. Pengembangan Fitur Lanjutan

**a. Integrasi Payment Gateway**
Kami menyarankan untuk mengintegrasikan payment gateway seperti Midtrans, Xendit, atau DANA agar proses pembayaran dapat dilakukan secara otomatis tanpa perlu verifikasi manual oleh admin. Hal ini akan meningkatkan efisiensi dan memberikan pengalaman yang lebih baik bagi pengguna.

**b. Pengembangan Fitur Royalti**
Sistem manajemen royalti untuk penulis perlu dikembangkan untuk mendukung model bisnis yang lebih lengkap. Fitur ini mencakup perhitungan royalti otomatis, pelaporan penjualan, dan mekanisme pencairan.

**c. Fitur Collaborative Editing**
Penambahan fitur collaborative editing memungkinkan penulis dan editor bekerja sama secara real-time pada satu naskah. Ini dapat meningkatkan efisiensi proses revisi dan komunikasi.

**d. E-book Distribution**
Pengembangan fitur distribusi e-book ke berbagai platform seperti Google Play Books, Amazon Kindle, dan Gramedia Digital akan memperluas jangkauan distribusi naskah yang telah diterbitkan.

### 2. Peningkatan Teknis

**a. Implementasi Offline Mode**
Untuk aplikasi seluler, implementasi offline mode yang lebih komprehensif dengan sinkronisasi data background sangat disarankan. Hal ini akan meningkatkan kegunaan aplikasi dalam kondisi koneksi yang tidak stabil.

**b. Optimasi Kinerja**
Implementasi teknik-teknik optimasi seperti lazy loading yang lebih agresif, penggunaan CDN untuk asset statis, dan caching yang lebih efisien dapat meningkatkan kinerja sistem secara keseluruhan.

**c. Pengembangan iOS App**
Untuk menjangkau pengguna yang lebih luas, pengembangan aplikasi iOS menggunakan codebase Flutter yang sama sangat disarankan.

### 3. Rekomendasi Penelitian Selanjutnya

**a. Studi Evaluasi Penggunaan**
Penelitian selanjutnya dapat melakukan studi evaluasi penggunaan (_usability study_) yang lebih mendalam dengan melibatkan pengguna nyata untuk mengidentifikasi area perbaikan antarmuka pengguna.

**b. Analisis Dampak Digitalisasi**
Penelitian mengenai dampak digitalisasi proses penerbitan terhadap efisiensi, biaya, dan kualitas output dapat memberikan wawasan berharga untuk pengembangan sistem penerbitan digital.

**c. Eksplorasi Teknologi AI**
Eksplorasi penggunaan kecerdasan buatan untuk fitur-fitur seperti pengecekan plagiarisme otomatis, rekomendasi genre/kategori, dan analisis kualitas tulisan dapat menjadi pengembangan yang menarik.

### 4. Saran Implementasi

**a. Pilot Testing**
Sebelum peluncuran penuh, disarankan untuk melakukan pilot testing dengan sejumlah penerbit atau penulis terbatas untuk mengumpulkan umpan balik nyata dari pengguna.

**b. Dokumentasi Pengguna**
Penyusunan dokumentasi pengguna (_user manual_) dan video tutorial akan membantu proses adopsi sistem oleh pengguna baru.

**c. Program Pelatihan**
Penyelenggaraan program pelatihan untuk pengguna, terutama untuk role editor dan percetakan, akan memastikan pemanfaatan sistem yang optimal.

---

## C. Kata Penutup

Pengembangan sistem informasi penerbitan naskah Publishify merupakan proyek yang kompleks dan menantang namun memberikan pengalaman belajar yang sangat berharga. Melalui proyek ini, kami berhasil mengaplikasikan berbagai konsep dan teknologi modern dalam pengembangan perangkat lunak, mulai dari perancangan arsitektur sistem hingga implementasi multi-platform.

Kami menyadari bahwa sistem yang telah dikembangkan masih jauh dari sempurna dan terdapat banyak ruang untuk perbaikan dan pengembangan lebih lanjut. Namun demikian, fondasi yang telah dibangun cukup kuat untuk dijadikan dasar pengembangan selanjutnya.

Kami berharap sistem Publishify dapat memberikan manfaat nyata bagi industri penerbitan Indonesia, khususnya dalam mendukung penulis-penulis lokal untuk menerbitkan karya mereka dengan lebih mudah dan efisien. Digitalisasi proses penerbitan yang kami upayakan melalui sistem ini diharapkan dapat berkontribusi pada pertumbuhan literasi dan industri kreatif di Indonesia.

Akhir kata, kami mengucapkan terima kasih kepada semua pihak yang telah mendukung penyelesaian proyek ini. Semoga laporan ini dapat menjadi referensi yang bermanfaat bagi pembaca dan peneliti selanjutnya yang tertarik mengembangkan sistem serupa.

---

_"Teknologi terbaik adalah teknologi yang tidak terlihat - ia menyatu dengan kehidupan sehari-hari hingga kita tidak menyadari kehadirannya."_

_— Mark Weiser_
