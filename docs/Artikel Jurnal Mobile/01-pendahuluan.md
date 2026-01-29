# PENDAHULUAN

Perkembangan teknologi mobile telah mengubah cara manusia berinteraksi dengan sistem informasi. Data dari Asosiasi Penyelenggara Jasa Internet Indonesia (APJII) menunjukkan bahwa pada tahun 2024, lebih dari 78% pengguna internet di Indonesia mengakses internet melalui perangkat mobile [1]. Pergeseran perilaku pengguna ini mendorong kebutuhan akan aplikasi mobile yang dapat mengakomodasi berbagai aktivitas bisnis, termasuk dalam industri penerbitan buku.

Industri penerbitan buku modern memerlukan koordinasi yang intensif antara berbagai pihak, mulai dari penulis, editor, hingga operator percetakan. Proses ini seringkali memerlukan respons cepat terhadap perubahan status naskah, permintaan revisi, dan keputusan editorial. Ketergantungan pada sistem berbasis desktop menyebabkan keterlambatan dalam komunikasi dan pengambilan keputusan karena pemangku kepentingan tidak selalu memiliki akses ke komputer [2]. Penelitian oleh Santoso dan Wibowo (2023) menunjukkan bahwa editor penerbit rata-rata menghabiskan 35% waktu kerja mereka di luar kantor untuk keperluan rapat dan koordinasi, sehingga memerlukan akses mobile ke sistem manajemen naskah [3].

Flutter, framework pengembangan mobile yang dikembangkan oleh Google, menawarkan solusi untuk pengembangan aplikasi lintas platform yang efisien. Flutter memungkinkan pengembang menulis satu codebase yang dapat dikompilasi menjadi aplikasi native untuk Android dan iOS, mengurangi waktu dan biaya pengembangan secara signifikan [4]. Berbeda dengan pendekatan hybrid tradisional yang mengandalkan WebView, Flutter menggunakan mesin rendering sendiri (Skia) yang menghasilkan performa setara aplikasi native [5].

Beberapa penelitian terdahulu telah mengeksplorasi pengembangan aplikasi mobile untuk domain penerbitan. Penelitian oleh Kurniawan dan Pratama (2022) mengembangkan aplikasi Android untuk tracking naskah menggunakan Java native, namun aplikasi tersebut hanya mendukung platform Android dan tidak memiliki fitur notifikasi real-time [6]. Penelitian lain oleh Wijayanti dkk. (2023) menggunakan React Native untuk mengembangkan aplikasi e-book reader, tetapi fokusnya pada konsumsi konten bukan manajemen proses penerbitan [7]. Gap penelitian menunjukkan belum adanya aplikasi mobile komprehensif yang mendukung seluruh alur kerja penerbitan dengan fitur real-time dan dukungan multi-platform.

Publishify merupakan sistem informasi penerbitan buku berbasis web yang telah dikembangkan sebelumnya menggunakan Next.js dan NestJS. Sistem ini menyediakan fitur lengkap untuk manajemen naskah, review editorial, dan penerbitan. Namun, keterbatasan akses hanya melalui browser web mengurangi fleksibilitas pengguna dalam situasi mobile. Pengembangan aplikasi mobile menjadi esensial untuk melengkapi ekosistem Publishify dan memberikan pengalaman pengguna yang optimal pada perangkat mobile.

Berdasarkan latar belakang tersebut, penelitian ini bertujuan untuk mengembangkan aplikasi mobile Publishify menggunakan framework Flutter. Tujuan spesifik penelitian meliputi: (1) merancang arsitektur aplikasi mobile yang terintegrasi dengan backend API Publishify, (2) mengimplementasikan fitur-fitur utama meliputi manajemen naskah, sistem review, dan notifikasi real-time, (3) menganalisis performa dan fungsionalitas aplikasi melalui pengujian sistematis.

Rumusan masalah dalam penelitian ini adalah: (1) Bagaimana merancang arsitektur aplikasi mobile yang dapat terintegrasi dengan sistem backend yang sudah ada? (2) Bagaimana mengimplementasikan fitur-fitur utama sistem penerbitan pada platform mobile dengan pengalaman pengguna yang optimal? (3) Bagaimana tingkat performa dan keberhasilan fungsional aplikasi mobile yang dikembangkan?

Manfaat penelitian ini meliputi: (1) bagi penulis, aplikasi menyediakan akses mobile untuk memantau status naskah dan menerima notifikasi perubahan, (2) bagi editor, aplikasi memungkinkan pengelolaan antrian review dan pemberian feedback dari mana saja, (3) bagi pengembang, penelitian ini memberikan referensi implementasi Flutter untuk aplikasi bisnis enterprise.

---

**Catatan untuk Artikel:**

Bagian Pendahuluan ini mencakup sekitar 15% dari keseluruhan artikel dan berisi:

- Latar belakang dengan data penggunaan mobile di Indonesia
- Permasalahan akses mobile dalam industri penerbitan
- Pengenalan Flutter sebagai solusi
- Kajian penelitian terdahulu dan gap penelitian
- Tujuan dan rumusan masalah
- Manfaat penelitian

Sitasi menggunakan format IEEE dengan nomor urut [1], [2], dst.
