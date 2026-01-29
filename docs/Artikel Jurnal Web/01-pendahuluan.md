# PENDAHULUAN

Industri penerbitan buku di Indonesia mengalami transformasi signifikan seiring dengan perkembangan teknologi digital. Menurut data Ikatan Penerbit Indonesia (IKAPI), jumlah penerbit aktif di Indonesia mencapai lebih dari 1.500 penerbit dengan produksi rata-rata 30.000 judul buku baru setiap tahunnya [1]. Namun demikian, sebagian besar proses penerbitan masih dilakukan secara konvensional dengan ketergantungan tinggi pada komunikasi manual melalui email, telepon, dan pertemuan tatap muka yang menyebabkan inefisiensi waktu dan potensi kesalahan koordinasi [2].

Proses penerbitan buku konvensional melibatkan serangkaian tahapan kompleks mulai dari pengajuan naskah, review editorial, editing, proofreading, desain sampul, layout, pengurusan ISBN, hingga pencetakan dan distribusi. Setiap tahapan memerlukan koordinasi antara berbagai pihak termasuk penulis, editor, desainer, dan operator percetakan [3]. Kompleksitas ini seringkali mengakibatkan keterlambatan penerbitan, kehilangan berkas, dan kesulitan dalam pelacakan status naskah. Penelitian oleh Suryani dan Wahyudi (2023) menunjukkan bahwa rata-rata waktu penerbitan buku di penerbit konvensional mencapai 6-12 bulan, dimana 40% waktu tersebut digunakan untuk proses administrasi dan koordinasi yang sebenarnya dapat diotomatisasi [4].

Sistem informasi berbasis web menawarkan solusi untuk mengatasi permasalahan tersebut dengan menyediakan platform terpusat yang dapat diakses oleh seluruh pemangku kepentingan secara real-time. Beberapa penelitian terdahulu telah mengembangkan sistem serupa, namun masih terdapat keterbatasan dalam hal skalabilitas, pengalaman pengguna, dan integrasi fitur yang komprehensif [5]. Penelitian oleh Rahman dan Pratama (2022) mengembangkan sistem penerbitan berbasis PHP yang mampu mengurangi waktu proses hingga 30%, namun sistem tersebut belum mendukung notifikasi real-time dan memiliki keterbatasan dalam hal responsivitas antarmuka [6].

Perkembangan framework JavaScript modern seperti Next.js dan NestJS membuka peluang untuk mengembangkan sistem informasi yang lebih responsif, skalabel, dan mudah dipelihara. Next.js menyediakan kemampuan server-side rendering dan static site generation yang mengoptimalkan performa aplikasi web, sementara NestJS menawarkan arsitektur modular yang terstruktur untuk pengembangan backend [7]. Kombinasi kedua framework ini dengan basis data PostgreSQL dan Object-Relational Mapping (ORM) Prisma memungkinkan pengembangan sistem yang robust dengan tipe data yang aman [8].

Berdasarkan latar belakang tersebut, penelitian ini bertujuan untuk mengembangkan Publishify, sebuah sistem informasi penerbitan buku berbasis web yang komprehensif. Sistem ini dirancang untuk mendigitalisasi seluruh alur kerja penerbitan dengan fitur-fitur meliputi: (1) manajemen naskah dengan pelacakan status real-time, (2) sistem review editorial dengan mekanisme umpan balik terstruktur, (3) manajemen paket penerbitan dengan kalkulasi biaya otomatis, (4) notifikasi real-time menggunakan teknologi WebSocket, dan (5) dasbor analitik untuk pemantauan kinerja. Pengembangan sistem menggunakan metodologi waterfall dengan penyempurnaan iteratif untuk memastikan kualitas dan kesesuaian dengan kebutuhan pengguna.

Rumusan masalah dalam penelitian ini adalah: (1) Bagaimana merancang arsitektur sistem informasi penerbitan buku yang dapat mengakomodasi seluruh alur kerja dari pengajuan hingga penerbitan? (2) Bagaimana mengimplementasikan sistem menggunakan framework Next.js dan NestJS dengan integrasi basis data PostgreSQL? (3) Bagaimana tingkat performa dan keberhasilan fungsional sistem yang dikembangkan?

Manfaat penelitian ini meliputi: (1) bagi penerbit, sistem dapat meningkatkan efisiensi operasional dan mengurangi waktu proses penerbitan, (2) bagi penulis, sistem menyediakan transparansi status naskah dan kemudahan komunikasi dengan editor, (3) bagi akademisi, penelitian ini memberikan kontribusi dalam pengembangan sistem informasi berbasis web dengan arsitektur modern.

---

**Catatan untuk Artikel:**

Bagian Pendahuluan ini mencakup sekitar 15% dari keseluruhan artikel dan berisi:

- Latar belakang masalah dengan data pendukung
- Kajian penelitian terdahulu
- Identifikasi gap penelitian
- Tujuan dan rumusan masalah
- Manfaat penelitian

Sitasi menggunakan format IEEE dengan nomor urut [1], [2], dst. yang akan direferensikan di bagian Daftar Pustaka.
