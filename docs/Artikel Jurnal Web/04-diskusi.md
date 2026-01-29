# DISKUSI

Bagian ini menyajikan analisis mendalam terhadap hasil penelitian serta perbandingan dengan penelitian terdahulu yang relevan.

## 4.1 Analisis Hasil Implementasi

Implementasi sistem Publishify berhasil menghasilkan platform penerbitan buku berbasis web yang komprehensif dengan arsitektur modern. Pemilihan Next.js sebagai framework frontend terbukti tepat dalam konteks kebutuhan sistem yang memerlukan performa tinggi dan SEO yang baik. Server-side rendering (SSR) dan static site generation (SSG) yang disediakan Next.js menghasilkan waktu muat halaman yang cepat dengan First Contentful Paint hanya 0,4 detik untuk mode desktop [20].

Arsitektur modular NestJS pada backend memberikan keuntungan signifikan dalam hal pemeliharaan dan pengembangan. Setiap modul dapat dikembangkan dan diuji secara independen tanpa mempengaruhi modul lainnya. Penggunaan dependency injection yang built-in pada NestJS memudahkan penulisan unit test dan integrasi test [21]. Struktur proyek yang mengikuti prinsip separation of concerns memungkinkan tim pengembang bekerja secara paralel pada modul yang berbeda.

Integrasi Prisma ORM dengan PostgreSQL memberikan keamanan tipe data (type safety) yang kuat selama pengembangan. Query yang dihasilkan Prisma secara otomatis teroptimasi dan aman dari SQL injection. Fitur migrasi Prisma memungkinkan pengelolaan perubahan skema basis data yang terstruktur dan dapat di-rollback jika diperlukan [22].

## 4.2 Analisis Hasil Pengujian

### 4.2.1 Analisis Pengujian Fungsional

Tingkat keberhasilan 100% pada pengujian fungsional menunjukkan bahwa sistem telah memenuhi seluruh kebutuhan fungsional yang didefinisikan pada tahap analisis. Hal ini mengindikasikan bahwa proses pengembangan yang mengikuti metodologi waterfall dengan dokumentasi kebutuhan yang jelas di awal memberikan hasil yang konsisten [23].

Keberhasilan pengujian modul autentikasi mengkonfirmasi bahwa implementasi keamanan sistem sudah memadai untuk skenario penggunaan normal. Sistem berhasil menangani berbagai kondisi error dengan pesan yang informatif, yang penting untuk pengalaman pengguna yang baik [24].

### 4.2.2 Analisis Pengujian Performa

Skor performa desktop 98/100 menempatkan sistem Publishify dalam kategori excellent menurut standar Google PageSpeed Insights. Nilai ini menunjukkan bahwa optimasi yang dilakukan, termasuk penggunaan React Server Components, image optimization bawaan Next.js, dan code splitting, berhasil memberikan dampak signifikan [25].

Skor performa mobile 88/100 menunjukkan ruang untuk perbaikan, terutama pada metrik Largest Contentful Paint (LCP) yang mencapai 3,1 detik. Analisis menunjukkan bahwa penyebab utama adalah waktu respon API backend dan ukuran JavaScript bundle yang perlu dioptimasi lebih lanjut. Rekomendasi perbaikan meliputi:

1. **Implementasi lazy loading** untuk komponen yang tidak kritis
2. **Optimasi gambar** dengan format WebP dan responsive images
3. **Caching API response** menggunakan stale-while-revalidate pattern
4. **Code splitting** yang lebih agresif untuk mengurangi initial bundle size

Total Blocking Time (TBT) yang sangat rendah (10 ms) menunjukkan bahwa eksekusi JavaScript tidak memblokir interaksi pengguna secara signifikan. Cumulative Layout Shift (CLS) bernilai 0 mengindikasikan tidak ada pergeseran layout yang mengganggu, yang merupakan hasil dari penggunaan dimensi eksplisit pada elemen-elemen seperti gambar dan placeholder loading [26].

## 4.3 Perbandingan dengan Penelitian Terdahulu

**Tabel 9.** Perbandingan dengan Penelitian Terdahulu

| Aspek                  | Rahman & Pratama (2022) [6] | Wijaya dkk. (2023) [27] | Publishify (2026) |
| ---------------------- | --------------------------- | ----------------------- | ----------------- |
| Teknologi Backend      | PHP Laravel                 | Node.js Express         | NestJS            |
| Teknologi Frontend     | Blade Template              | React                   | Next.js           |
| Database               | MySQL                       | MongoDB                 | PostgreSQL        |
| Real-time Notification | ✗                           | ✓ (Polling)             | ✓ (WebSocket)     |
| Multi-role Support     | 3 peran                     | 2 peran                 | 4 peran           |
| Skor PageSpeed         | Tidak diukur                | 75/100                  | 98/100 (Desktop)  |
| Pengujian Fungsional   | 85%                         | 92%                     | 100%              |
| Responsif Mobile       | Partial                     | ✓                       | ✓                 |
| Sistem Review          | Basic                       | ✗                       | Komprehensif      |
| Paket Penerbitan       | ✗                           | ✗                       | ✓                 |

Perbandingan menunjukkan bahwa sistem Publishify memiliki beberapa keunggulan dibandingkan penelitian terdahulu:

1. **Arsitektur Modern**: Penggunaan Next.js dan NestJS merepresentasikan state-of-the-art dalam pengembangan web modern dengan dukungan TypeScript penuh yang meningkatkan maintainability.

2. **Performa Superior**: Skor PageSpeed 98/100 jauh melampaui penelitian Wijaya dkk. (75/100), menunjukkan bahwa optimasi performa yang dilakukan memberikan hasil signifikan.

3. **Fitur Komprehensif**: Sistem mendukung empat peran pengguna dengan alur kerja yang lengkap dari pengajuan hingga penerbitan, termasuk manajemen paket penerbitan yang tidak tersedia pada penelitian terdahulu.

4. **Real-time Communication**: Implementasi WebSocket memberikan pengalaman pengguna yang lebih baik dibandingkan polling yang digunakan pada penelitian Wijaya dkk.

5. **Sistem Review Terstruktur**: Fitur feedback per bab dan halaman memberikan granularitas yang tidak tersedia pada sistem terdahulu.

## 4.4 Keterbatasan Penelitian

Meskipun sistem telah berhasil diimplementasikan dengan hasil pengujian yang baik, terdapat beberapa keterbatasan yang perlu dicatat:

1. **Pengujian Load**: Penelitian ini belum melakukan pengujian load untuk memvalidasi skalabilitas sistem dengan jumlah pengguna konkuren yang besar.

2. **Pengujian Usability**: Belum dilakukan pengujian usability formal dengan pengguna akhir menggunakan metodologi seperti System Usability Scale (SUS).

3. **Integrasi Pembayaran**: Sistem belum terintegrasi dengan payment gateway untuk proses pembayaran online yang sebenarnya.

4. **Modul Distribusi**: Fitur manajemen distribusi dan pengiriman buku fisik belum sepenuhnya diimplementasikan.

## 4.5 Implikasi Praktis

Hasil penelitian ini memiliki beberapa implikasi praktis bagi industri penerbitan:

1. **Efisiensi Operasional**: Platform digital terpusat dapat mengurangi waktu koordinasi yang sebelumnya memakan 40% dari total waktu penerbitan [4].

2. **Transparansi Proses**: Pelacakan status real-time meningkatkan transparansi dan mengurangi kebutuhan komunikasi manual antara penulis dan penerbit.

3. **Skalabilitas Bisnis**: Arsitektur modern memungkinkan penerbit untuk menangani volume naskah yang lebih besar tanpa peningkatan proporsional pada staf administrasi.

4. **Adopsi Teknologi**: Framework dan pola desain yang digunakan dapat menjadi referensi bagi penerbit yang ingin mengembangkan sistem serupa.

---

**Catatan untuk Artikel:**

Bagian Diskusi ini mencakup sekitar 15% dari keseluruhan artikel dan berisi:

- Analisis mendalam hasil implementasi
- Analisis hasil pengujian performa
- Perbandingan dengan penelitian terdahulu (tabel komparasi)
- Keterbatasan penelitian
- Implikasi praktis

Bagian ini WAJIB ada karena menunjukkan pentingnya hasil penelitian yang telah dilakukan.
