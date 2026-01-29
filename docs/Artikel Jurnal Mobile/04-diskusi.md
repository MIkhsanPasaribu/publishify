# DISKUSI

Bagian ini menyajikan analisis mendalam terhadap hasil penelitian serta perbandingan dengan penelitian terdahulu.

## 4.1 Analisis Hasil Implementasi

Implementasi aplikasi mobile Publishify menggunakan Flutter berhasil menghasilkan aplikasi yang responsif dan terintegrasi dengan baik dengan backend sistem. Pemilihan Flutter sebagai framework pengembangan terbukti tepat berdasarkan beberapa indikator berikut.

### 4.1.1 Produktivitas Pengembangan

Fitur hot reload Flutter secara signifikan meningkatkan produktivitas pengembangan. Perubahan kode dapat langsung dilihat hasilnya tanpa perlu melakukan full rebuild aplikasi, yang menghemat waktu dalam proses debugging dan penyempurnaan UI [19]. Berdasarkan pengalaman pengembangan, rata-rata waktu untuk melihat perubahan UI adalah kurang dari 1 detik, dibandingkan dengan 15-30 detik jika menggunakan pendekatan native tradisional.

### 4.1.2 Konsistensi UI

Penggunaan widget-based architecture Flutter menghasilkan antarmuka yang konsisten di berbagai perangkat. Widget yang sama dirender dengan hasil yang identik pada perangkat dengan resolusi dan densitas layar yang berbeda [20]. Hasil pengujian kompatibilitas membuktikan hal ini dengan keberhasilan 100% pada lima perangkat dengan spesifikasi berbeda.

### 4.1.3 Integrasi Backend

Integrasi dengan backend API berjalan lancar berkat penggunaan package http yang mature dan dukungan JSON serialization yang baik di Dart. Penanganan token JWT dengan SharedPreferences memberikan persistensi sesi yang reliable tanpa perlu setup database lokal yang kompleks [21].

## 4.2 Analisis Hasil Pengujian

### 4.2.1 Analisis Pengujian Fungsional

Tingkat keberhasilan 100% pada 24 kasus uji menunjukkan bahwa seluruh fitur yang diimplementasikan berfungsi sesuai spesifikasi. Keberhasilan ini dapat diatribusikan pada beberapa faktor:

1. **Definisi kebutuhan yang jelas**: Analisis kebutuhan yang detail di awal proyek memberikan panduan yang jelas selama implementasi.

2. **Pengujian inkremental**: Pendekatan pengembangan iteratif memungkinkan pengujian dini untuk setiap sprint, sehingga bug dapat dideteksi dan diperbaiki lebih awal.

3. **Arsitektur terstruktur**: Pemisahan lapisan presentasi, logika, dan data memudahkan pengujian unit dan integrasi [22].

### 4.2.2 Analisis Pengujian Performa

Skor performa 88/100 untuk mode mobile menunjukkan hasil yang baik, meskipun masih ada ruang untuk perbaikan. Analisis per metrik:

**Total Blocking Time (TBT) 10 ms**: Nilai ini sangat baik dan menunjukkan bahwa JavaScript (dalam konteks Flutter Web) tidak memblokir main thread secara signifikan. Hal ini merupakan hasil dari efisiensi Dart VM dan optimasi rendering Flutter [23].

**Cumulative Layout Shift (CLS) 0**: Nilai sempurna ini menunjukkan tidak ada pergeseran layout yang mengganggu. Hal ini dicapai dengan penggunaan dimensi eksplisit pada widget dan skeleton loaders selama proses loading data.

**Largest Contentful Paint (LCP) 3,1 detik**: Metrik ini masih di atas target ideal 2,5 detik. Penyebab utama meliputi:

- Waktu respon API backend yang dapat mencapai 1-2 detik untuk data yang kompleks
- Ukuran gambar yang belum sepenuhnya dioptimasi
- Tidak adanya caching agresif untuk konten statis

Rekomendasi perbaikan LCP meliputi:

1. Implementasi image caching dengan package cached_network_image
2. Lazy loading untuk konten di bawah fold
3. Prefetching data untuk halaman yang sering dikunjungi
4. Optimasi ukuran gambar di sisi server

## 4.3 Perbandingan dengan Penelitian Terdahulu

Tabel 12 menyajikan perbandingan aplikasi Publishify Mobile dengan penelitian terdahulu yang relevan.

**Tabel 12.** Perbandingan dengan Penelitian Terdahulu

| Aspek                | Kurniawan & Pratama (2022) [6] | Wijayanti dkk. (2023) [7] | Publishify Mobile (2026) |
| -------------------- | ------------------------------ | ------------------------- | ------------------------ |
| Framework            | Java Native Android            | React Native              | Flutter                  |
| Target Platform      | Android saja                   | Android + iOS             | Android + iOS            |
| Notifikasi Real-time | ✗                              | ✗                         | ✓ (WebSocket)            |
| Offline Support      | ✗                              | ✓ (Partial)               | ✗                        |
| Multi-role           | 2 peran                        | 1 peran                   | 4 peran                  |
| Integrasi Backend    | REST API                       | REST API                  | REST API + WebSocket     |
| Performa Score       | Tidak diukur                   | 72/100                    | 88/100                   |
| Pengujian Fungsional | 80%                            | 90%                       | 100%                     |

Analisis perbandingan menunjukkan beberapa keunggulan Publishify Mobile:

1. **Cross-platform Genuine**: Berbeda dengan penelitian Kurniawan & Pratama yang hanya mendukung Android, Publishify Mobile dapat dikompilasi untuk Android dan iOS dari satu codebase [24].

2. **Real-time Communication**: Implementasi WebSocket memberikan kemampuan notifikasi real-time yang tidak tersedia pada penelitian terdahulu, meningkatkan responsivitas sistem terhadap perubahan status.

3. **Multi-role Support**: Dukungan untuk empat peran pengguna (penulis, editor, admin, percetakan) memberikan kelengkapan fitur yang tidak tersedia pada penelitian terdahulu yang umumnya fokus pada satu atau dua peran.

4. **Performa Superior**: Skor PageSpeed 88/100 melampaui penelitian Wijayanti dkk. (72/100), menunjukkan bahwa optimasi performa yang dilakukan memberikan hasil yang signifikan.

## 4.4 Keterbatasan Penelitian

Penelitian ini memiliki beberapa keterbatasan yang perlu dicatat:

1. **Tidak Ada Offline Support**: Aplikasi memerlukan koneksi internet untuk semua operasi. Implementasi offline mode dengan sinkronisasi akan meningkatkan usability dalam kondisi jaringan tidak stabil.

2. **Build iOS Belum Diuji**: Meskipun Flutter mendukung iOS, pengujian hanya dilakukan pada platform Android karena keterbatasan perangkat pengembangan.

3. **Tidak Ada Push Notification**: Notifikasi hanya tersedia saat aplikasi aktif. Integrasi Firebase Cloud Messaging akan memungkinkan notifikasi saat aplikasi di background.

4. **Pengujian Usability Formal**: Belum dilakukan pengujian usability dengan metodologi formal seperti System Usability Scale (SUS).

## 4.5 Implikasi Praktis

Hasil penelitian ini memiliki beberapa implikasi praktis:

1. **Aksesibilitas Meningkat**: Pemangku kepentingan dapat mengakses sistem dari mana saja menggunakan perangkat mobile, meningkatkan fleksibilitas kerja.

2. **Respons Lebih Cepat**: Notifikasi real-time memungkinkan respons cepat terhadap perubahan status dan permintaan revisi.

3. **Efisiensi Operasional**: Editor dapat mereview naskah dan memberikan feedback di luar jam kantor atau saat dalam perjalanan.

4. **Referensi Teknis**: Arsitektur dan pola implementasi yang digunakan dapat menjadi referensi bagi pengembang yang ingin membangun aplikasi bisnis serupa dengan Flutter [25].

---

**Catatan untuk Artikel:**

Bagian Diskusi ini mencakup sekitar 15% dari keseluruhan artikel dan berisi:

- Analisis mendalam hasil implementasi (produktivitas, konsistensi UI, integrasi)
- Analisis hasil pengujian per metrik
- Perbandingan dengan penelitian terdahulu (tabel komparasi)
- Keterbatasan penelitian
- Implikasi praktis

Bagian ini WAJIB ada karena menunjukkan pentingnya hasil penelitian yang telah dilakukan.
