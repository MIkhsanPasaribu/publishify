# BAB I

# PENDAHULUAN

---

## A. Latar Belakang Proyek

Industri penerbitan di Indonesia telah mengalami transformasi yang signifikan seiring dengan perkembangan teknologi informasi dan komunikasi. Menurut data dari Ikatan Penerbit Indonesia (IKAPI), jumlah penerbit di Indonesia terus meningkat setiap tahunnya, dengan lebih dari 1.500 penerbit aktif yang tersebar di seluruh wilayah Indonesia (Pusat Data IKAPI, 2024). Pertumbuhan ini menunjukkan bahwa industri penerbitan masih memiliki potensi besar untuk berkembang, namun di sisi lain juga menghadirkan tantangan dalam hal efisiensi dan manajemen proses penerbitan.

Proses penerbitan buku secara konvensional melibatkan serangkaian tahapan yang kompleks dan membutuhkan koordinasi yang intensif antara berbagai pihak yang terlibat. Tahapan tersebut meliputi penerimaan naskah, proses editorial, persetujuan penerbitan, desain sampul, penyetakan, hingga distribusi (Suwarno, 2021). Setiap tahapan memerlukan komunikasi yang efektif dan dokumentasi yang terstruktur untuk memastikan kelancaran proses penerbitan. Namun, dalam praktiknya, banyak penerbit masih mengandalkan metode manual yang rentan terhadap kesalahan dan keterlambatan.

Permasalahan utama yang sering dihadapi dalam industri penerbitan konvensional mencakup beberapa aspek fundamental. Pertama, proses pengiriman dan pelacakan naskah yang masih dilakukan secara manual melalui surel atau media penyimpanan fisik menyebabkan kesulitan dalam mengelola dan melacak status naskah secara real-time (Widodo & Pratama, 2023). Kedua, komunikasi antara penulis dan editor yang tidak terstruktur sering kali menyebabkan miskomunikasi dan keterlambatan dalam proses review. Ketiga, dokumentasi proses penerbitan yang tidak sistematis menyulitkan pelacakan histori perubahan dan keputusan yang telah diambil.

Dalam konteks global, transformasi digital telah menjadi keharusan bagi berbagai industri, termasuk industri penerbitan. Menurut laporan dari International Publishers Association, penerbit yang mengadopsi teknologi digital dalam proses operasionalnya menunjukkan peningkatan efisiensi hingga 40% dibandingkan dengan yang masih menggunakan metode konvensional (International Publishers Association, 2023). Hal ini menunjukkan bahwa digitalisasi bukan lagi sekadar pilihan, melainkan kebutuhan untuk bertahan dan bersaing dalam industri penerbitan modern.

Melihat kondisi tersebut, kami mengidentifikasi kebutuhan mendesak akan sebuah sistem yang dapat mengintegrasikan seluruh proses penerbitan dalam satu platform yang terpadu. Sistem tersebut harus mampu memfasilitasi kolaborasi yang efektif antara penulis, editor, dan penerbit, serta menyediakan mekanisme pelacakan yang transparan untuk setiap tahapan proses penerbitan. Selain itu, sistem tersebut juga perlu dilengkapi dengan fitur-fitur yang mendukung manajemen dokumen, notifikasi otomatis, dan pelaporan yang komprehensif.

Berdasarkan analisis kebutuhan tersebut, kami mengembangkan Publishify sebagai solusi sistem manajemen penerbitan naskah berbasis web. Publishify dirancang dengan pendekatan yang berpusat pada pengguna (user-centered design) untuk memastikan bahwa sistem ini dapat memenuhi kebutuhan seluruh pemangku kepentingan dalam proses penerbitan. Sistem ini dibangun menggunakan teknologi web modern yang memungkinkan akses dari berbagai perangkat dan lokasi, serta menyediakan antarmuka yang intuitif dan responsif.

Pengembangan Publishify dilakukan dengan mempertimbangkan berbagai aspek teknis dan fungsional. Dari sisi teknis, sistem ini dibangun menggunakan arsitektur monorepo dengan pemisahan yang jelas antara komponen frontend dan backend. Frontend dikembangkan menggunakan Next.js versi 14 dengan App Router yang menyediakan pengalaman pengguna yang cepat dan responsif. Sementara itu, backend dikembangkan menggunakan NestJS versi 10 yang menyediakan fondasi yang kuat untuk pengembangan Application Programming Interface (API) yang terstruktur dan dapat diskalakan.

Dari sisi fungsional, Publishify menyediakan berbagai fitur yang mendukung seluruh alur kerja penerbitan. Fitur-fitur tersebut mencakup manajemen naskah, sistem review, pelacakan status, manajemen penerbitan, serta sistem notifikasi real-time. Setiap fitur dirancang untuk memudahkan pengguna dalam menjalankan tugasnya masing-masing, baik sebagai penulis, editor, maupun administrator. Dengan demikian, Publishify diharapkan dapat menjadi solusi komprehensif yang dapat meningkatkan efisiensi dan transparansi dalam proses penerbitan buku di Indonesia.

---

## B. Identifikasi Masalah

Berdasarkan analisis terhadap kondisi industri penerbitan saat ini, kami mengidentifikasi beberapa permasalahan utama yang menjadi fokus pengembangan sistem Publishify:

### 1. Permasalahan dalam Pengelolaan Naskah

Proses pengelolaan naskah dalam sistem konvensional masih banyak dilakukan secara manual. Penulis mengirimkan naskah melalui surel atau media penyimpanan eksternal, kemudian editor harus mengunduh, mereview, dan mengirimkan kembali hasil review melalui saluran yang sama. Proses ini tidak hanya memakan waktu yang lama, tetapi juga rentan terhadap kehilangan data dan kesalahan dalam pengelolaan versi naskah (Rahmawati & Kusuma, 2022). Selain itu, tidak adanya sistem yang terintegrasi menyebabkan kesulitan dalam melacak histori perubahan dan status terkini dari setiap naskah yang sedang dalam proses editorial.

### 2. Permasalahan dalam Komunikasi dan Koordinasi

Komunikasi antara penulis, editor, dan pihak penerbit sering kali tidak terstruktur dan terfragmentasi. Diskusi mengenai revisi naskah, umpan balik editorial, dan keputusan penerbitan dilakukan melalui berbagai saluran yang berbeda, seperti surel, pesan instan, atau bahkan pertemuan langsung. Fragmentasi komunikasi ini menyebabkan informasi penting sering terlewat atau tidak terdokumentasi dengan baik, yang pada akhirnya berdampak pada kualitas dan ketepatan waktu proses penerbitan (Hartono, 2023).

### 3. Permasalahan dalam Transparansi Proses

Dalam sistem konvensional, penulis sering kali tidak memiliki visibilitas yang jelas mengenai status naskah mereka dalam proses editorial. Ketidakjelasan ini menimbulkan ketidakpastian dan kecemasan bagi penulis, serta sering kali memicu pertanyaan berulang mengenai status naskah yang harus dijawab oleh tim editorial. Kondisi ini tidak hanya mengurangi produktivitas tim editorial, tetapi juga menurunkan tingkat kepuasan penulis terhadap layanan penerbitan.

### 4. Permasalahan dalam Dokumentasi dan Pelaporan

Dokumentasi proses penerbitan yang tidak sistematis menyulitkan penerbit dalam melakukan analisis dan evaluasi kinerja. Data mengenai waktu rata-rata proses editorial, tingkat penolakan naskah, dan metrik-metrik penting lainnya sulit untuk dikumpulkan dan dianalisis. Akibatnya, penerbit kesulitan dalam mengambil keputusan strategis yang berbasis data untuk meningkatkan efisiensi dan kualitas layanan (Santoso & Wijaya, 2024).

### 5. Permasalahan dalam Aksesibilitas dan Mobilitas

Sistem penerbitan konvensional yang berbasis dokumen fisik atau perangkat lunak desktop membatasi kemampuan pengguna untuk mengakses sistem dari lokasi dan perangkat yang berbeda. Dalam era kerja jarak jauh dan mobilitas tinggi, keterbatasan ini menjadi hambatan signifikan bagi produktivitas dan fleksibilitas kerja (Pratama, 2023).

---

## C. Batasan Masalah

Mengingat kompleksitas industri penerbitan dan keterbatasan sumber daya yang tersedia, kami menetapkan batasan masalah dalam pengembangan sistem Publishify sebagai berikut:

1. **Cakupan Fungsional**: Sistem ini difokuskan pada proses pengelolaan naskah dari tahap pengajuan hingga penerbitan digital. Proses percetakan fisik dan distribusi buku cetak tidak termasuk dalam cakupan pengembangan fase pertama ini.

2. **Peran Pengguna**: Sistem ini mendukung tiga peran utama pengguna, yaitu penulis, editor, dan administrator. Peran tambahan seperti desainer grafis, penata letak, dan distributor tidak termasuk dalam pengembangan awal ini.

3. **Platform Pengembangan**: Pengembangan difokuskan pada platform web yang dapat diakses melalui peramban web modern. Pengembangan aplikasi desktop native tidak termasuk dalam cakupan proyek ini.

4. **Bahasa Antarmuka**: Antarmuka pengguna dikembangkan dalam Bahasa Indonesia untuk memenuhi kebutuhan pengguna utama di Indonesia.

5. **Integrasi Eksternal**: Integrasi dengan sistem eksternal seperti sistem pembayaran, sistem percetakan, dan marketplace buku tidak termasuk dalam fase pengembangan awal.

6. **Kapasitas Sistem**: Sistem dirancang untuk mendukung operasi penerbitan skala menengah dengan kapasitas maksimal 1.000 pengguna aktif dan 10.000 naskah dalam basis data.

---

## D. Rumusan Masalah

Berdasarkan identifikasi dan batasan masalah yang telah diuraikan, kami merumuskan permasalahan penelitian sebagai berikut:

1. Bagaimana merancang dan mengembangkan sistem manajemen penerbitan naskah berbasis web yang dapat mengintegrasikan seluruh proses penerbitan dalam satu platform terpadu?

2. Bagaimana mengimplementasikan sistem pelacakan status naskah yang transparan dan real-time untuk meningkatkan visibilitas proses penerbitan bagi seluruh pemangku kepentingan?

3. Bagaimana merancang antarmuka pengguna yang intuitif dan responsif sesuai dengan prinsip-prinsip interaksi manusia dan komputer untuk berbagai peran pengguna dalam sistem penerbitan?

4. Bagaimana mengimplementasikan arsitektur sistem yang terstruktur, terukur, dan mudah dikembangkan untuk mengakomodasi kebutuhan penerbitan yang terus berkembang?

5. Bagaimana mengukur dan mengevaluasi kinerja sistem web yang dikembangkan berdasarkan standar metrik web yang berlaku?

---

## E. Tujuan Proyek

Proyek pengembangan sistem web Publishify ini memiliki tujuan sebagai berikut:

### 1. Tujuan Umum

Mengembangkan sistem manajemen penerbitan naskah berbasis web yang komprehensif untuk meningkatkan efisiensi dan transparansi proses penerbitan buku.

### 2. Tujuan Khusus

a. **Mengembangkan Modul Manajemen Naskah**: Merancang dan mengimplementasikan modul yang memungkinkan penulis untuk mengunggah, mengelola, dan melacak naskah mereka dalam sistem yang terintegrasi.

b. **Mengembangkan Modul Review Editorial**: Membangun sistem review yang terstruktur untuk memfasilitasi proses editorial, termasuk penugasan editor, pemberian umpan balik, dan pelacakan revisi.

c. **Mengembangkan Sistem Notifikasi Real-time**: Mengimplementasikan sistem notifikasi yang dapat memberikan informasi terkini mengenai status naskah dan aktivitas terkait kepada pengguna secara real-time.

d. **Merancang Antarmuka Pengguna yang Intuitif**: Mendesain dan mengimplementasikan antarmuka pengguna yang mudah dipahami dan digunakan oleh berbagai kategori pengguna dengan menerapkan prinsip-prinsip interaksi manusia dan komputer.

e. **Mengimplementasikan Arsitektur Sistem yang Terukur**: Membangun arsitektur sistem yang terstruktur dengan pemisahan yang jelas antara komponen frontend dan backend untuk memudahkan pengembangan dan pemeliharaan di masa depan.

f. **Melakukan Pengujian dan Evaluasi Kinerja**: Menguji sistem yang dikembangkan untuk memastikan kesesuaian dengan standar kinerja web yang berlaku.

---

## F. Manfaat Proyek

Pengembangan sistem Publishify diharapkan dapat memberikan manfaat sebagai berikut:

### 1. Manfaat Teoritis

a. Memberikan kontribusi dalam pengembangan keilmuan di bidang sistem informasi, khususnya dalam penerapan teknologi web modern untuk mendukung proses bisnis industri penerbitan.

b. Menjadi referensi dalam penerapan prinsip-prinsip interaksi manusia dan komputer dalam perancangan antarmuka sistem manajemen konten.

c. Memberikan contoh implementasi arsitektur monorepo dengan pemisahan frontend dan backend dalam pengembangan aplikasi web skala menengah.

### 2. Manfaat Praktis

a. **Bagi Penulis**: Menyediakan platform yang memudahkan pengajuan naskah, pelacakan status, dan komunikasi dengan editor. Sistem ini memungkinkan penulis untuk memantau perkembangan naskah mereka secara real-time dan menerima umpan balik yang terstruktur.

b. **Bagi Editor**: Menyediakan alat yang efisien untuk mengelola tugas editorial, memberikan umpan balik, dan melacak progres review. Sistem ini membantu editor dalam mengorganisasi pekerjaan mereka dan meningkatkan produktivitas.

c. **Bagi Penerbit**: Menyediakan platform terpadu yang mengintegrasikan seluruh proses penerbitan, meningkatkan efisiensi operasional, dan menyediakan data yang komprehensif untuk pengambilan keputusan strategis.

d. **Bagi Industri Penerbitan**: Mendorong transformasi digital industri penerbitan di Indonesia dengan menyediakan solusi teknologi yang dapat diadopsi oleh berbagai skala penerbit.

### 3. Manfaat Pengembangan

a. Memberikan pengalaman praktis dalam pengembangan aplikasi web menggunakan teknologi modern seperti Next.js dan NestJS.

b. Mengasah kemampuan dalam menerapkan prinsip-prinsip rekayasa perangkat lunak, termasuk arsitektur sistem, manajemen basis data, dan pengujian perangkat lunak.

c. Meningkatkan pemahaman mengenai penerapan prinsip interaksi manusia dan komputer dalam perancangan antarmuka pengguna yang efektif.

---

**Catatan untuk Penyusunan:**

Pada bagian BAB I ini, silakan tambahkan tangkapan layar atau diagram pendukung yang relevan:

1. **Gambar 1.1**: Statistik industri penerbitan Indonesia (dapat dibuat dari data IKAPI)
2. **Gambar 1.2**: Diagram perbandingan proses penerbitan konvensional vs digital
3. **Gambar 1.3**: Gambaran umum sistem Publishify

File referensi untuk tangkapan layar:

- Halaman beranda: `frontend/app/page.tsx`
- Komponen utama: `frontend/components/landing/`
