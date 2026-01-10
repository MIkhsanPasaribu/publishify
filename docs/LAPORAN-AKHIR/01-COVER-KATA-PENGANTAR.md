# LAPORAN AKHIR PROYEK

---

<div align="center">

# PENGEMBANGAN SISTEM PENERBITAN NASKAH DIGITAL BERBASIS WEB DAN APLIKASI SELULER MENGGUNAKAN METODE ADDIE

## (STUDI KASUS: PUBLISHIFY)

---

### LAPORAN AKHIR PROYEK

---

**Disusun oleh:**

**Tim Pengembang Publishify**

---

![Logo Publishify](tempat-untuk-logo-publishify.png)

_[Catatan: Tempatkan logo Publishify di sini - file: `/frontend/public/logo.png` atau buat logo baru]_

---

**PROGRAM STUDI TEKNIK INFORMATIKA**

**FAKULTAS TEKNIK**

**UNIVERSITAS**

**2026**

</div>

---

<div style="page-break-after: always;"></div>

# HALAMAN PENGESAHAN

---

<div align="center">

## LAPORAN AKHIR PROYEK

### PENGEMBANGAN SISTEM PENERBITAN NASKAH DIGITAL BERBASIS WEB DAN APLIKASI SELULER MENGGUNAKAN METODE ADDIE

### (STUDI KASUS: PUBLISHIFY)

---

**Disusun oleh:**

Tim Pengembang Publishify

---

**Telah disetujui dan disahkan pada:**

Tanggal: ********\_******** 2026

---

**Mengetahui,**

|                            |                            |
| -------------------------- | -------------------------- |
| Pembimbing I               | Pembimbing II              |
|                            |                            |
|                            |                            |
| ************\_************ | ************\_************ |
| NIP.                       | NIP.                       |

---

**Ketua Program Studi**

---

NIP.

</div>

---

<div style="page-break-after: always;"></div>

# KATA PENGANTAR

---

Puji dan syukur kami panjatkan ke hadirat Tuhan Yang Maha Esa atas segala rahmat dan karunia-Nya sehingga kami dapat menyelesaikan laporan akhir proyek yang berjudul **"Pengembangan Sistem Penerbitan Naskah Digital Berbasis Web dan Aplikasi Seluler Menggunakan Metode ADDIE (Studi Kasus: Publishify)"** dengan baik dan tepat waktu.

Laporan akhir ini disusun sebagai dokumentasi komprehensif dari seluruh proses pengembangan sistem Publishify, mulai dari tahap analisis kebutuhan hingga evaluasi akhir. Publishify merupakan sebuah platform digital yang dirancang untuk menjembatani para penulis, editor, dan pihak percetakan dalam satu ekosistem penerbitan yang terintegrasi. Sistem ini dikembangkan dengan harapan dapat memberikan kontribusi positif terhadap modernisasi industri penerbitan di Indonesia.

Dalam proses penyusunan laporan dan pengembangan sistem ini, kami mendapatkan banyak dukungan, bimbingan, dan bantuan dari berbagai pihak. Oleh karena itu, pada kesempatan ini kami ingin menyampaikan ucapan terima kasih yang sebesar-besarnya kepada:

1. **Tuhan Yang Maha Esa**, atas segala rahmat dan karunia yang diberikan sehingga proyek ini dapat terselesaikan dengan baik.

2. **Orang tua dan keluarga**, yang senantiasa memberikan dukungan moral dan material selama proses pengembangan proyek berlangsung.

3. **Dosen Pembimbing**, yang telah meluangkan waktu, tenaga, dan pikirannya untuk memberikan bimbingan, arahan, serta masukan yang sangat berharga dalam penyusunan laporan dan pengembangan sistem.

4. **Seluruh dosen dan staf pengajar** di Program Studi Teknik Informatika yang telah memberikan ilmu pengetahuan dan keterampilan yang menjadi bekal dalam pengembangan proyek ini.

5. **Teman-teman seperjuangan** yang telah memberikan semangat, bantuan, dan kerja sama yang luar biasa selama proses pengembangan sistem.

6. **Komunitas pengembang** perangkat lunak sumber terbuka yang telah menyediakan berbagai pustaka, kerangka kerja, dan dokumentasi yang sangat membantu dalam pembangunan sistem ini.

Kami menyadari sepenuhnya bahwa laporan akhir ini masih jauh dari kesempurnaan. Keterbatasan pengetahuan, pengalaman, dan waktu menjadi faktor yang mempengaruhi kualitas hasil akhir yang kami sajikan. Oleh karena itu, kami sangat mengharapkan kritik dan saran yang membangun dari para pembaca guna perbaikan dan penyempurnaan di masa yang akan datang.

Akhir kata, kami berharap laporan akhir proyek ini dapat memberikan manfaat bagi semua pihak yang membacanya, khususnya bagi para akademisi, praktisi, dan pemerhati industri penerbitan digital di Indonesia. Semoga karya ini dapat menjadi inspirasi dan referensi bagi pengembangan sistem serupa di masa depan.

---

<div align="right">

**Jakarta, Januari 2026**

**Tim Pengembang**

</div>

---

<div style="page-break-after: always;"></div>

# ABSTRAK

---

**PENGEMBANGAN SISTEM PENERBITAN NASKAH DIGITAL BERBASIS WEB DAN APLIKASI SELULER MENGGUNAKAN METODE ADDIE (STUDI KASUS: PUBLISHIFY)**

---

Industri penerbitan di Indonesia menghadapi tantangan dalam hal efisiensi proses, transparansi komunikasi, dan integrasi antar pemangku kepentingan. Proses penerbitan konvensional yang masih bersifat manual dan terfragmentasi mengakibatkan waktu penerbitan yang panjang serta kesulitan dalam pelacakan status naskah. Penelitian ini bertujuan untuk mengembangkan sistem penerbitan naskah digital bernama Publishify yang mengintegrasikan seluruh alur kerja penerbitan dalam satu platform terpadu.

Metode pengembangan yang digunakan adalah ADDIE (_Analysis, Design, Development, Implementation, Evaluation_) yang dipilih karena pendekatan sistematis dan terstrukturnya dalam pengembangan sistem. Sistem dikembangkan menggunakan arsitektur modern dengan teknologi Next.js untuk antarmuka web, NestJS untuk layanan _backend_, Flutter untuk aplikasi seluler, dan PostgreSQL sebagai basis data relasional.

Hasil pengembangan menunjukkan bahwa sistem Publishify berhasil mengimplementasikan fitur-fitur utama yang mencakup: (1) manajemen naskah dengan sistem pengunggahan dan pelacakan status; (2) sistem peninjauan editorial dengan umpan balik terstruktur; (3) manajemen percetakan dengan pelacakan produksi; (4) sistem pembayaran terintegrasi; serta (5) notifikasi waktu nyata. Pengujian sistem menggunakan metode kotak hitam (_black-box testing_) menunjukkan tingkat keberhasilan sebesar 100% untuk seluruh skenario pengujian fungsional. Evaluasi kegunaan (_usability_) berdasarkan prinsip Interaksi Manusia dan Komputer menunjukkan bahwa sistem memiliki antarmuka yang intuitif dan mudah digunakan oleh keempat kategori pengguna.

Kesimpulan dari penelitian ini adalah sistem Publishify berhasil dikembangkan sebagai solusi digital yang efektif untuk modernisasi proses penerbitan naskah di Indonesia. Sistem ini diharapkan dapat meningkatkan efisiensi, transparansi, dan kolaborasi dalam ekosistem penerbitan.

**Kata Kunci:** Sistem Penerbitan Digital, Publishify, ADDIE, Aplikasi Web, Aplikasi Seluler, Interaksi Manusia dan Komputer

---

<div style="page-break-after: always;"></div>

# ABSTRACT

---

**DEVELOPMENT OF DIGITAL MANUSCRIPT PUBLISHING SYSTEM BASED ON WEB AND MOBILE APPLICATION USING ADDIE METHOD (CASE STUDY: PUBLISHIFY)**

---

The publishing industry in Indonesia faces challenges in terms of process efficiency, communication transparency, and integration among stakeholders. Conventional publishing processes that are still manual and fragmented result in long publication times and difficulties in tracking manuscript status. This research aims to develop a digital manuscript publishing system called Publishify that integrates the entire publishing workflow in a unified platform.

The development method used is ADDIE (_Analysis, Design, Development, Implementation, Evaluation_) which was chosen for its systematic and structured approach to system development. The system was developed using modern architecture with Next.js for web interface, NestJS for backend services, Flutter for mobile application, and PostgreSQL as relational database.

Development results show that the Publishify system successfully implements main features including: (1) manuscript management with upload system and status tracking; (2) editorial review system with structured feedback; (3) printing management with production tracking; (4) integrated payment system; and (5) real-time notifications. System testing using black-box testing method shows a 100% success rate for all functional testing scenarios. Usability evaluation based on Human-Computer Interaction principles shows that the system has an intuitive interface that is easy to use by all four user categories.

The conclusion of this research is that the Publishify system was successfully developed as an effective digital solution for modernizing the manuscript publishing process in Indonesia. This system is expected to improve efficiency, transparency, and collaboration in the publishing ecosystem.

**Keywords:** Digital Publishing System, Publishify, ADDIE, Web Application, Mobile Application, Human-Computer Interaction
