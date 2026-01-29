# BAB I

# PENDAHULUAN

---

## A. Latar Belakang Proyek

Perkembangan teknologi mobile telah mengubah cara manusia berinteraksi dengan informasi dan layanan digital secara fundamental. Menurut data dari Statista, jumlah pengguna smartphone di Indonesia mencapai lebih dari 190 juta pada tahun 2025, menjadikan Indonesia sebagai salah satu pasar mobile terbesar di dunia (Statista, 2025). Penetrasi smartphone yang tinggi ini membuka peluang besar bagi pengembangan aplikasi mobile yang dapat mendukung berbagai aktivitas profesional, termasuk dalam industri penerbitan.

Industri penerbitan di Indonesia mengalami transformasi signifikan seiring dengan meningkatnya adopsi teknologi digital. Penerbit, penulis, dan editor kini membutuhkan fleksibilitas untuk mengelola pekerjaan mereka tanpa terikat pada lokasi fisik tertentu. Kebutuhan akan mobilitas ini menjadi semakin relevan dalam konteks kerja jarak jauh yang telah menjadi norma baru pasca pandemi (Wijaya & Kusuma, 2023). Namun demikian, banyak sistem manajemen penerbitan yang masih hanya tersedia dalam format berbasis web desktop, membatasi kemampuan pengguna untuk mengakses dan mengelola pekerjaan mereka secara mobile.

Publishify sebagai sistem manajemen penerbitan naskah telah berhasil dikembangkan dalam format berbasis web. Sistem web ini menyediakan fitur-fitur komprehensif untuk mendukung seluruh alur kerja penerbitan, mulai dari pengajuan naskah hingga publikasi akhir. Namun, untuk memenuhi kebutuhan mobilitas pengguna dan memperluas jangkauan sistem, pengembangan aplikasi mobile menjadi langkah strategis yang perlu dilakukan.

Pengembangan aplikasi mobile Publishify bertujuan untuk menyediakan akses yang lebih fleksibel kepada pengguna sistem. Melalui aplikasi mobile, penulis dapat memantau status naskah mereka kapan saja, editor dapat mengelola antrian review bahkan saat dalam perjalanan, dan administrator dapat memantau aktivitas sistem secara real-time dari perangkat genggam mereka. Fleksibilitas ini diharapkan dapat meningkatkan produktivitas dan responsivitas seluruh pemangku kepentingan dalam proses penerbitan.

Dalam pengembangan aplikasi mobile ini, kami memilih Flutter sebagai framework pengembangan. Flutter adalah framework open-source yang dikembangkan oleh Google untuk membangun aplikasi mobile, web, dan desktop dari satu basis kode tunggal (Google, 2024). Keunggulan Flutter meliputi performa yang mendekati native, hot reload untuk pengembangan yang cepat, dan ekosistem widget yang kaya untuk membangun antarmuka pengguna yang menarik.

Aplikasi mobile Publishify dikembangkan dengan memperhatikan prinsip-prinsip desain mobile-first dan panduan Material Design dari Google. Pendekatan ini memastikan bahwa aplikasi tidak hanya fungsional tetapi juga menyediakan pengalaman pengguna yang intuitif dan konsisten dengan ekspektasi pengguna perangkat mobile modern.

Integrasi antara aplikasi mobile dan sistem backend yang sudah ada menjadi pertimbangan utama dalam perancangan aplikasi. Dengan menggunakan arsitektur RESTful API yang telah tersedia dari pengembangan sistem web, aplikasi mobile dapat memanfaatkan seluruh fungsionalitas backend tanpa perlu pengembangan ulang. Pendekatan ini tidak hanya menghemat waktu dan sumber daya pengembangan, tetapi juga memastikan konsistensi data antara platform web dan mobile.

Selain fitur-fitur inti yang mengacu pada sistem web, aplikasi mobile juga dirancang untuk memanfaatkan kemampuan unik perangkat mobile. Fitur notifikasi push memungkinkan pengguna untuk menerima pembaruan penting secara real-time, bahkan saat tidak sedang menggunakan aplikasi. Integrasi dengan sistem file perangkat memudahkan pengunggahan naskah langsung dari penyimpanan lokal atau layanan cloud yang terhubung dengan perangkat.

Pengembangan aplikasi mobile Publishify juga mempertimbangkan aspek inklusivitas dan aksesibilitas. Aplikasi dirancang untuk dapat digunakan oleh pengguna dengan berbagai kemampuan, mengikuti panduan aksesibilitas mobile dari platform Android dan iOS. Dengan demikian, aplikasi ini diharapkan dapat menjangkau pengguna yang lebih luas dalam ekosistem penerbitan Indonesia.

---

## B. Identifikasi Masalah

Berdasarkan analisis terhadap kebutuhan pengguna dan kondisi industri penerbitan saat ini, kami mengidentifikasi beberapa permasalahan yang menjadi fokus pengembangan aplikasi mobile Publishify:

### 1. Keterbatasan Akses Mobile

Sistem manajemen penerbitan yang ada umumnya dikembangkan dengan fokus pada platform desktop atau web. Meskipun beberapa sistem web sudah responsif untuk perangkat mobile, pengalaman pengguna seringkali tidak optimal karena antarmuka yang tidak dirancang khusus untuk layar sentuh dan ukuran layar yang lebih kecil (Rahardjo, 2023). Pengguna mobile sering mengalami kesulitan dalam navigasi, input data, dan penyelesaian tugas-tugas yang membutuhkan interaksi kompleks.

### 2. Respons yang Lambat terhadap Perkembangan Proses

Dalam proses penerbitan konvensional maupun berbasis web, pengguna harus secara aktif membuka sistem untuk mengetahui perkembangan terkini. Hal ini menyebabkan keterlambatan dalam merespons perubahan status atau permintaan yang memerlukan tindakan segera. Penulis mungkin tidak menyadari bahwa naskah mereka telah direview hingga beberapa waktu setelah review selesai, menyebabkan keterlambatan dalam proses revisi (Santoso, 2024).

### 3. Produktivitas yang Terbatas pada Lokasi

Ketergantungan pada perangkat desktop atau laptop membatasi produktivitas pengguna pada lokasi tertentu. Editor yang sedang dalam perjalanan tidak dapat mengelola antrian review mereka. Penulis yang berada jauh dari komputer tidak dapat melakukan tindakan cepat untuk merespons feedback. Kondisi ini mengurangi fleksibilitas kerja dan dapat memperpanjang siklus penerbitan secara keseluruhan.

### 4. Pengalaman Pengguna yang Tidak Konsisten

Penggunaan peramban web mobile untuk mengakses sistem berbasis web sering menghasilkan pengalaman yang tidak konsisten. Perbedaan peramban, versi sistem operasi, dan spesifikasi perangkat dapat menyebabkan tampilan dan perilaku yang berbeda-beda. Hal ini menciptakan kebingungan bagi pengguna dan dapat mengurangi kepercayaan terhadap sistem.

### 5. Kurangnya Pemanfaatan Fitur Native Perangkat

Sistem berbasis web tidak dapat sepenuhnya memanfaatkan fitur-fitur native perangkat mobile seperti notifikasi push, kamera untuk pemindaian dokumen, atau integrasi dengan sistem file lokal. Keterbatasan ini mengurangi potensi produktivitas yang dapat dicapai melalui pemanfaatan kemampuan perangkat mobile modern.

---

## C. Batasan Masalah

Untuk memfokuskan pengembangan dan memastikan kualitas hasil, kami menetapkan batasan masalah dalam pengembangan aplikasi mobile Publishify sebagai berikut:

1. **Cakupan Platform**: Aplikasi dikembangkan menggunakan Flutter yang mendukung platform Android dan iOS. Prioritas pengembangan awal difokuskan pada platform Android dengan rencana ekspansi ke iOS pada fase berikutnya.

2. **Versi Minimum Sistem Operasi**: Aplikasi dirancang untuk mendukung Android versi 6.0 (Marshmallow) ke atas untuk memastikan kompatibilitas dengan sebagian besar perangkat yang digunakan di Indonesia.

3. **Fitur Inti**: Pengembangan difokuskan pada fitur-fitur inti yang mendukung alur kerja utama penerbitan, meliputi autentikasi, manajemen naskah, review editorial, dan notifikasi. Fitur-fitur lanjutan seperti editor naskah terintegrasi tidak termasuk dalam cakupan fase awal.

4. **Peran Pengguna**: Aplikasi mendukung tiga peran utama: penulis, editor, dan administrator. Setiap peran memiliki akses ke fitur-fitur yang relevan dengan tanggung jawab mereka.

5. **Konektivitas**: Aplikasi memerlukan koneksi internet untuk sebagian besar fungsionalitasnya. Fitur offline terbatas pada penyimpanan data cache untuk viewing.

6. **Bahasa Antarmuka**: Antarmuka pengguna dikembangkan sepenuhnya dalam Bahasa Indonesia sesuai dengan target pengguna utama.

---

## D. Rumusan Masalah

Berdasarkan identifikasi dan batasan masalah yang telah diuraikan, kami merumuskan permasalahan penelitian sebagai berikut:

1. Bagaimana merancang dan mengembangkan aplikasi mobile yang dapat menyediakan akses yang fleksibel dan optimal ke sistem manajemen penerbitan Publishify?

2. Bagaimana mengimplementasikan sistem notifikasi push yang efektif untuk meningkatkan responsivitas pengguna terhadap perkembangan proses penerbitan?

3. Bagaimana merancang antarmuka pengguna mobile yang intuitif dan efisien sesuai dengan prinsip-prinsip desain mobile dan interaksi manusia-komputer?

4. Bagaimana mengintegrasikan aplikasi mobile dengan backend yang sudah ada untuk memastikan konsistensi data dan fungsionalitas lintas platform?

5. Bagaimana mengukur dan mengevaluasi kinerja serta kegunaan aplikasi mobile yang dikembangkan?

---

## E. Tujuan Proyek

Proyek pengembangan aplikasi mobile Publishify ini memiliki tujuan sebagai berikut:

### 1. Tujuan Umum

Mengembangkan aplikasi mobile yang komprehensif untuk sistem manajemen penerbitan naskah Publishify guna meningkatkan aksesibilitas, mobilitas, dan produktivitas pengguna.

### 2. Tujuan Khusus

a. **Mengembangkan Antarmuka Mobile yang Optimal**: Merancang dan mengimplementasikan antarmuka pengguna yang dioptimalkan untuk perangkat mobile dengan memperhatikan ukuran layar, interaksi sentuh, dan ergonomi penggunaan satu tangan.

b. **Mengimplementasikan Fitur Notifikasi Push**: Membangun sistem notifikasi push yang terintegrasi dengan backend untuk memberikan pembaruan real-time kepada pengguna mengenai aktivitas yang relevan.

c. **Menyediakan Akses Multi-Peran**: Mengembangkan aplikasi yang dapat mengakomodasi berbagai peran pengguna (penulis, editor, administrator) dengan fitur dan tampilan yang sesuai untuk masing-masing peran.

d. **Mengintegrasikan dengan Sistem Backend**: Memastikan integrasi yang mulus dengan backend NestJS yang sudah ada, memanfaatkan RESTful API dan WebSocket untuk komunikasi real-time.

e. **Menerapkan Prinsip Material Design**: Mengimplementasikan panduan Material Design dari Google untuk menciptakan pengalaman pengguna yang konsisten dan familiar bagi pengguna Android.

f. **Melakukan Pengujian Komprehensif**: Menguji aplikasi untuk memastikan kinerja, kegunaan, dan keandalan yang memenuhi standar kualitas.

---

## F. Manfaat Proyek

Pengembangan aplikasi mobile Publishify diharapkan dapat memberikan manfaat sebagai berikut:

### 1. Manfaat Teoritis

a. Memberikan kontribusi dalam pengembangan keilmuan di bidang pengembangan aplikasi mobile, khususnya dalam penerapan framework Flutter untuk aplikasi bisnis.

b. Menjadi referensi dalam penerapan prinsip-prinsip interaksi manusia dan komputer dalam konteks aplikasi mobile untuk industri penerbitan.

c. Memberikan contoh implementasi integrasi aplikasi mobile dengan sistem backend berbasis REST API dan WebSocket.

### 2. Manfaat Praktis

a. **Bagi Penulis**: Menyediakan akses mobile yang mudah untuk memantau status naskah, menerima notifikasi tentang perkembangan review, dan merespons feedback editor dengan cepat dari mana saja.

b. **Bagi Editor**: Menyediakan fleksibilitas untuk mengelola antrian review, memberikan feedback, dan memproses naskah bahkan saat dalam perjalanan atau di luar kantor.

c. **Bagi Administrator**: Menyediakan kemampuan monitoring sistem secara real-time melalui perangkat mobile, memungkinkan pengambilan tindakan cepat untuk situasi yang memerlukan respons segera.

d. **Bagi Industri Penerbitan**: Mendorong peningkatan efisiensi dan responsivitas dalam proses penerbitan melalui adopsi teknologi mobile yang dapat diakses secara luas.

### 3. Manfaat Pengembangan

a. Memberikan pengalaman praktis dalam pengembangan aplikasi mobile menggunakan Flutter dan Dart.

b. Mengasah kemampuan dalam menerapkan prinsip-prinsip desain mobile dan Material Design.

c. Meningkatkan pemahaman mengenai integrasi aplikasi mobile dengan backend RESTful dan sistem notifikasi real-time.

---

**Catatan untuk Penyusunan:**

Pada bagian BAB I ini, silakan tambahkan tangkapan layar atau diagram pendukung yang relevan:

1. **Gambar 1.1**: Statistik penggunaan smartphone di Indonesia
2. **Gambar 1.2**: Perbandingan akses web vs mobile
3. **Gambar 1.3**: Gambaran umum aplikasi mobile Publishify

File referensi untuk tangkapan layar:

- Main app: `mobile/lib/main.dart`
- Layout utama: `mobile/lib/pages/main_layout.dart`
