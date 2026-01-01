# LAPORAN DEVELOPMENT STEP BY STEP FASE 4

## SISTEM PERCETAKAN DAN MANAJEMEN PESANAN PUBLISHIFY

**PART 1: PENDAHULUAN DAN ANALISIS KEBUTUHAN**

---

## A. PENDAHULUAN

### A.1 Latar Belakang Pengembangan

Sistem Publishify telah melewati tiga fase pengembangan yang mencakup fondasi autentikasi dan manajemen pengguna pada Fase 1, sistem manajemen konten naskah pada Fase 2, serta sistem review editorial pada Fase 3. Ketiga fase tersebut telah berhasil membangun ekosistem digital yang memungkinkan penulis untuk mendaftarkan karya mereka, mengunggah naskah, dan mendapatkan review dari editor profesional. Namun, untuk melengkapi value chain dari penerbitan digital hingga ke produk fisik, kami memerlukan sebuah sistem yang dapat menjembatani naskah digital yang telah disetujui dengan produksi buku cetak yang siap dipasarkan.

Fase 4 hadir untuk menjawab kebutuhan tersebut melalui pengembangan sistem percetakan dan manajemen pesanan yang terintegrasi. Sistem ini dirancang untuk mengakomodasi model bisnis print-on-demand yang semakin populer di industri penerbitan modern. Model print-on-demand memungkinkan penulis untuk menerbitkan buku mereka tanpa harus mencetak dalam jumlah besar di awal, sehingga mengurangi risiko inventori berlebih dan biaya modal yang tinggi. Penulis dapat mencetak sesuai dengan permintaan pasar, baik untuk keperluan pribadi, promosi, maupun penjualan kepada pembaca.

Dalam konteks implementasi, kami menghadapi tantangan yang cukup kompleks karena sistem ini melibatkan tiga stakeholder utama dengan kebutuhan yang berbeda. Penulis memerlukan transparansi harga, kemudahan dalam memilih spesifikasi cetak, dan tracking status pesanan secara real-time. Mitra percetakan memerlukan dashboard yang efisien untuk mengelola pesanan masuk, update status produksi, dan mengatur tarif cetak mereka sendiri. Sementara administrator platform perlu memiliki visibilitas penuh terhadap semua transaksi untuk memastikan kualitas layanan dan menangani dispute jika terjadi masalah.

Pengembangan Fase 4 ini juga menjadi pembelajaran penting bagi tim kami dalam merancang sistem yang scalable dan flexible, khususnya dalam hal perhitungan harga dinamis yang dapat disesuaikan oleh setiap percetakan tanpa perlu mengubah kode aplikasi. Kami menerapkan pendekatan configuration-based pricing dimana setiap percetakan dapat mendefinisikan parameter harga mereka sendiri melalui interface yang user-friendly, dan sistem akan secara otomatis menghitung total biaya pesanan berdasarkan spesifikasi yang dipilih oleh penulis.

### A.2 Tujuan Pengembangan

Tujuan utama dari pengembangan Fase 4 adalah membangun sebuah sistem percetakan yang lengkap dan terintegrasi yang dapat memfasilitasi seluruh proses dari pemesanan hingga pengiriman produk fisik. Secara spesifik, kami menetapkan beberapa tujuan teknis dan bisnis yang ingin dicapai melalui fase ini.

Dari sisi teknis, kami bertujuan untuk mengimplementasikan arsitektur sistem yang robust dan scalable yang mampu menangani multiple concurrent orders tanpa mengalami performance degradation. Sistem harus dapat menghitung harga secara dinamis berdasarkan berbagai parameter seperti jenis kertas, ukuran buku, jenis cover, jumlah pesanan, dan opsi tambahan seperti laminating. Perhitungan ini harus accurate dan consistent terlepas dari siapa percetakan yang dipilih atau kapan pesanan dibuat.

Kami juga bertujuan untuk mengimplementasikan tracking system yang comprehensive dimana setiap perubahan status pesanan dari awal hingga produk terkirim dapat dimonitor secara real-time. Tracking ini tidak hanya mencatat status level tinggi seperti tertunda, diterima, atau dikirim, tetapi juga tracking detail level produksi seperti tahapan cetak, potong, jilid, finishing, dan packing. Data tracking ini sangat valuable untuk memberikan transparency kepada penulis dan juga untuk analytics internal percetakan dalam mengoptimalkan proses produksi mereka.

Dari sisi bisnis, tujuan kami adalah menciptakan user experience yang seamless dimana penulis dapat dengan mudah membuat pesanan cetak hanya dalam beberapa klik tanpa perlu memahami kompleksitas teknis di belakang layar. Interface harus intuitif dan guiding, dengan error handling yang jelas ketika ada input yang invalid atau kondisi yang tidak memenuhi requirement minimum pesanan.

Untuk mitra percetakan, kami bertujuan memberikan mereka full control terhadap business process mereka melalui dashboard yang powerful namun tetap simple untuk digunakan. Percetakan harus dapat dengan mudah menerima atau menolak pesanan, update status produksi, mengatur tarif, dan melihat analytics performa bisnis mereka. Semua fitur ini harus dapat diakses tanpa memerlukan training yang extensive.

### A.3 Ruang Lingkup Dokumen

Dokumen laporan development step by step ini disusun sebagai panduan komprehensif yang menjelaskan bagaimana sistem percetakan Publishify dibangun dari awal hingga menjadi sistem yang fully functional. Berbeda dengan laporan progress yang fokus pada achievement dan milestone, dokumen ini fokus pada HOW TO implement setiap komponen sistem dengan penjelasan langkah demi langkah yang detail.

Ruang lingkup dokumen mencakup seluruh siklus pengembangan mulai dari analisis kebutuhan dimana kami mengidentifikasi functional dan non-functional requirements, perancangan sistem dimana kami mendesain database schema dan API architecture, implementasi backend dimana kami membangun business logic dan API endpoints, implementasi frontend dimana kami membangun user interface untuk ketiga role user, hingga pengujian dan evaluasi dimana kami memvalidasi bahwa sistem berjalan sesuai requirement.

Dokumen ini akan menjelaskan keputusan-keputusan desain yang kami ambil beserta reasoning di baliknya. Misalnya mengapa kami memilih menggunakan JSON untuk menyimpan parameter harga alih-alih membuat tabel terpisah untuk setiap komponen harga, mengapa kami menggunakan enum untuk status pesanan alih-alih string bebas, atau mengapa kami memilih arsitektur tertentu untuk API endpoints. Penjelasan reasoning ini penting agar developer yang membaca dokumen ini tidak hanya tahu WHAT tapi juga WHY suatu keputusan diambil.

Untuk setiap step implementasi, kami akan menyertakan referensi ke file code actual yang ada di repository sehingga pembaca dapat melihat implementasi nyata dari konsep yang dijelaskan. Kami tidak akan embed full code di dokumen untuk menjaga readability, namun akan menunjukkan snippet penting dan mengarahkan pembaca ke lokasi file yang relevan untuk eksplorasi lebih lanjut.

Dokumen ini juga akan mencakup testing strategy dan hasil testing yang kami lakukan untuk memastikan kualitas sistem. Kami akan menjelaskan berbagai skenario testing yang kami buat, tools yang kami gunakan, dan bagaimana kami handle edge cases dan error scenarios.

### A.4 Metodologi Pengembangan

Dalam mengembangkan sistem percetakan Fase 4, kami menerapkan metodologi Agile Software Development dengan framework Scrum yang telah terbukti efektif di fase-fase sebelumnya. Periode pengembangan selama dua minggu kami bagi menjadi dua sprint dengan durasi masing-masing satu minggu. Pembagian ini memungkinkan kami untuk melakukan iterasi cepat, mendapatkan feedback lebih awal, dan melakukan adjustment jika diperlukan.

Sprint pertama kami fokuskan pada pembangunan backend foundation yang meliputi database schema design, migration setup, core service layer implementation, dan API endpoints development. Kami memulai dengan mendefinisikan domain models yang merepresentasikan entitas bisnis seperti pesanan cetak, tarif percetakan, log produksi, dan pengiriman. Model-model ini kemudian kami translasikan ke dalam Prisma schema dengan mempertimbangkan relasi antar entitas, indexing untuk query optimization, dan constraints untuk data integrity.

Setelah schema ready, kami implement service layer yang berisi business logic inti dari sistem percetakan. Service layer ini bertanggung jawab untuk operasi CRUD pesanan, perhitungan harga dinamis, validasi business rules, dan orchestration dengan module lain seperti notifikasi dan pembayaran. Kami menerapkan principle of separation of concerns dimana setiap service method memiliki single responsibility dan reusable di berbagai context.

Controller layer kemudian kami bangun sebagai interface antara HTTP requests dan service layer. Controller bertanggung jawab untuk request validation, authentication dan authorization checking, data transformation, dan response formatting. Kami menggunakan DTO pattern untuk strongly type request dan response objects, serta decorator dari NestJS untuk automatic validation dan API documentation generation.

Sprint kedua kami alokasikan untuk frontend development dan integration testing. Kami membangun komponen-komponen UI menggunakan React dengan Next.js 14 App Router, TanStack Query untuk data fetching dan caching, dan Tailwind CSS dengan shadcn/ui untuk styling. Setiap page dan component kami design dengan mobile-first approach dan accessibility in mind.

Selama kedua sprint, kami menjalankan daily standup meeting setiap pagi selama lima belas menit untuk synchronize progress, identify blockers, dan coordinate tasks antar team members. Setiap hari juga kami lakukan code review untuk pull requests yang masuk sebelum di-merge ke main branch. Code review ini sangat penting untuk maintain code quality, share knowledge antar team members, dan catch potential bugs lebih awal.

Di akhir setiap sprint, kami melakukan sprint review untuk demo hasil development kepada stakeholders dan sprint retrospective untuk reflect on what went well, what can be improved, dan action items untuk sprint berikutnya. Feedback dari sprint review kami incorporate ke dalam backlog untuk prioritization di sprint selanjutnya.

---

## B. ANALISIS KEBUTUHAN

### B.1 Identifikasi Stakeholder

Dalam sistem percetakan Publishify, kami mengidentifikasi tiga stakeholder utama yang masing-masing memiliki kebutuhan, goals, dan pain points yang berbeda. Understanding mendalam terhadap setiap stakeholder ini menjadi fondasi penting dalam merancang sistem yang dapat deliver value maksimal kepada semua pihak.

#### B.1.1 Penulis (Author)

Penulis adalah stakeholder pertama dan mungkin yang paling penting karena mereka adalah end users yang akan menggunakan sistem untuk mencetak karya mereka. Persona typical dari penulis kami adalah seorang penulis independen berusia dua puluh lima hingga empat puluh lima tahun yang telah menyelesaikan naskah mereka dan ingin menerbitkan dalam bentuk buku fisik. Mereka mungkin tidak memiliki background teknis yang kuat dan mengharapkan interface yang simple dan straightforward.

Goals utama dari penulis adalah dapat mencetak buku mereka dengan biaya yang terjangkau, mendapatkan hasil cetak berkualitas baik, dan menerima produk dalam waktu yang reasonable. Mereka juga ingin transparency dalam pricing sehingga dapat memahami breakdown biaya dari setiap komponen dan membuat keputusan yang informed tentang spesifikasi cetak yang akan dipilih.

Pain points yang sering mereka alami adalah ketidakjelasan harga di percetakan konvensional dimana mereka harus request quotation berkali-kali untuk berbagai spesifikasi, proses pemesanan yang complicated dan memakan waktu, serta lack of visibility dalam tracking progress produksi dimana mereka tidak tahu apakah pesanan mereka sudah sampai tahap mana.

Kebutuhan teknis dari penulis mencakup interface untuk browse dan compare pricing dari berbagai percetakan, calculator untuk mengestimasi biaya berdasarkan spesifikasi yang mereka inginkan, form pemesanan yang clear dengan validation yang helpful, dashboard untuk tracking status pesanan secara real-time, dan notification system yang memberikan update setiap ada perubahan status pesanan.

#### B.1.2 Mitra Percetakan (Printing Partner)

Stakeholder kedua adalah mitra percetakan yang merupakan business entity yang menyediakan jasa printing. Persona typical adalah pemilik atau operator percetakan skala menengah yang telah berpengalaman dalam industri printing namun baru pertama kali menggunakan platform digital untuk manage orders.

Goals utama dari percetakan adalah mendapatkan order secara konsisten dari platform, dapat mengelola production workflow dengan efisien, dan memiliki control penuh atas pricing strategy mereka. Mereka ingin dapat menerima atau menolak order berdasarkan capacity dan specifications, serta dapat berkomunikasi dengan penulis jika ada clarification yang diperlukan.

Pain points yang mereka hadapi adalah sulitnya manage multiple orders secara manual, tidak adanya sistem tracking yang terintegrasi untuk monitor production progress, dan kesulitan dalam updating pricing ketika ada perubahan harga bahan baku atau operational costs.

Kebutuhan teknis mencakup dashboard untuk view incoming orders dengan informasi lengkap tentang specifications, interface untuk accept atau reject orders dengan reason, form untuk update production status di setiap tahapan, configuration panel untuk set dan update pricing parameters, analytics dashboard untuk monitor business metrics seperti revenue, completion rate, dan average production time, serta notification system untuk alert ketika ada order baru atau inquiry dari penulis.

#### B.1.3 Administrator Platform

Stakeholder ketiga adalah administrator platform Publishify yang bertanggung jawab untuk overall operation dan quality assurance dari sistem. Persona typical adalah staff operational atau customer support yang memiliki technical understanding dan business acumen.

Goals utama dari admin adalah memastikan smooth operation dari seluruh sistem, maintain high quality of service, handle disputes antara penulis dan percetakan jika terjadi, dan gather insights untuk continuous improvement platform.

Pain points yang mereka alami adalah kesulitan dalam monitoring health status dari sistem ketika terdapat banyak transactions happening simultaneously, lack of tools untuk intervene ketika ada problematic orders, dan limited visibility untuk generate reports dan analytics untuk business decision making.

Kebutuhan teknis mencakup comprehensive dashboard yang menampilkan overview dari semua orders across all printings, ability untuk view detail dari setiap order dan transaction, tools untuk manually update order status atau cancel orders jika necessary, access control management untuk onboard new printing partners, reporting tools untuk generate various business reports, dan audit logs untuk track all actions yang dilakukan dalam sistem.

### B.2 Functional Requirements

Berdasarkan analisis stakeholder di atas, kami mendefinisikan functional requirements yang comprehensive untuk sistem percetakan. Requirements ini kami kategorikan berdasarkan module atau feature area untuk memudahkan tracking dan implementation.

#### B.2.1 Module Manajemen Pesanan

**FR-MP-01**: Sistem harus dapat menampilkan daftar percetakan yang tersedia beserta informasi tarif aktif mereka sehingga penulis dapat membandingkan dan memilih percetakan yang sesuai dengan budget dan kebutuhan mereka.

**FR-MP-02**: Sistem harus menyediakan form pembuatan pesanan yang mencakup field untuk memilih naskah, jumlah pesanan, spesifikasi cetak (jenis kertas, ukuran buku, jenis cover, opsi laminating), alamat pengiriman, dan catatan tambahan untuk percetakan.

**FR-MP-03**: Sistem harus melakukan validasi input pada form pemesanan untuk memastikan semua field required telah diisi dengan format yang benar, jumlah pesanan memenuhi minimum order quantity, dan naskah yang dipilih memiliki status disetujui.

**FR-MP-04**: Sistem harus dapat menghitung estimasi harga secara real-time ketika penulis memilih atau mengubah spesifikasi cetak sehingga mereka dapat melihat dampak dari setiap pilihan terhadap total biaya.

**FR-MP-05**: Sistem harus menyimpan data pesanan ke database dengan status initial "tertunda" dan generate nomor pesanan yang unique untuk reference di komunikasi selanjutnya.

**FR-MP-06**: Sistem harus mengirimkan notifikasi kepada percetakan yang dipilih ketika ada pesanan baru yang masuk sehingga mereka dapat segera me-review dan respond.

**FR-MP-07**: Sistem harus menyediakan interface bagi percetakan untuk menerima atau menolak pesanan dengan field reason jika menolak sehingga penulis dapat memahami alasan penolakan.

**FR-MP-08**: Sistem harus update status pesanan menjadi "diterima" ketika percetakan accept order dan mengirimkan notification kepada penulis tentang acceptance tersebut.

**FR-MP-09**: Sistem harus menyediakan interface untuk view list pesanan dengan berbagai filter seperti status, date range, dan search by nomor pesanan atau judul naskah.

**FR-MP-10**: Sistem harus menyediakan halaman detail pesanan yang menampilkan semua informasi lengkap tentang pesanan termasuk specifications, pricing breakdown, status timeline, production logs, dan shipping information.

#### B.2.2 Module Perhitungan Harga Dinamis

**FR-PH-01**: Sistem harus menyediakan interface bagi percetakan untuk mendefinisikan parameter harga mereka yang mencakup harga base per ukuran kertas (A4, A5, B5), harga cover (softcover, hardcover), biaya jilid, biaya laminating, biaya pengiriman per kilogram, dan tier diskon berdasarkan quantity.

**FR-PH-02**: Sistem harus dapat menyimpan parameter harga dalam format yang flexible sehingga percetakan dapat menambah atau modify komponen harga tanpa memerlukan perubahan pada kode aplikasi.

**FR-PH-03**: Sistem harus support multiple pricing schemes per percetakan dimana hanya satu scheme yang active pada satu waktu namun historical schemes tetap tersimpan untuk audit purposes.

**FR-PH-04**: Sistem harus implement algoritma perhitungan harga yang memperhitungkan semua komponen yaitu harga kertas dikalikan jumlah halaman, harga cover, biaya jilid, biaya laminating jika dipilih, dan diskon quantity jika applicable.

**FR-PH-05**: Sistem harus dapat handle edge cases dalam perhitungan seperti ketika jumlah halaman naskah belum diketahui atau ketika percetakan belum set pricing parameters.

**FR-PH-06**: Sistem harus menyediakan endpoint API untuk kalkulasi harga yang dapat dipanggil dari frontend saat user mengubah specifications di form pemesanan.

**FR-PH-07**: Sistem harus return pricing breakdown detail yang mencakup subtotal dari setiap komponen sehingga user dapat memahami dari mana total harga berasal.

#### B.2.3 Module Tracking Produksi

**FR-TP-01**: Sistem harus support tracking produksi dalam lima tahapan yaitu cetak (printing pages), potong (cutting to size), jilid (binding), finishing (cover dan laminating), dan packing (packaging for shipment).

**FR-TP-02**: Sistem harus menyediakan interface bagi percetakan untuk update progress produksi di setiap tahapan dengan timestamp otomatis untuk mencatat kapan setiap tahapan dimulai dan selesai.

**FR-TP-03**: Sistem harus dapat menyimpan catatan atau notes pada setiap tahapan produksi jika percetakan ingin menambahkan keterangan tentang progress atau issue yang ditemukan.

**FR-TP-04**: Sistem harus menampilkan production timeline di halaman detail pesanan dalam bentuk visual timeline atau progress bar sehingga mudah dipahami oleh penulis.

**FR-TP-05**: Sistem harus mengirimkan notification kepada penulis setiap kali ada update pada production progress sehingga mereka selalu informed tentang status terkini.

**FR-TP-06**: Sistem harus dapat generate production report yang menunjukkan average duration dari setiap tahapan produksi untuk analytics dan process improvement purposes.

#### B.2.4 Module Pengiriman

**FR-PE-01**: Sistem harus menyediakan interface untuk percetakan membuat shipment record ketika pesanan sudah siap untuk dikirim dengan field untuk expedition name, nomor resi, estimasi waktu sampai, dan biaya pengiriman actual.

**FR-PE-02**: Sistem harus update status pesanan menjadi "dikirim" ketika shipment record dibuat dan mengirimkan notification kepada penulis dengan informasi resi dan expedition.

**FR-PE-03**: Sistem harus menyediakan interface untuk penulis view tracking information dan dapat mengklik link untuk track shipment di website expedition.

**FR-PE-04**: Sistem harus support tracking log dimana percetakan atau expedition dapat update lokasi current dari shipment untuk memberikan transparency kepada penulis.

**FR-PE-05**: Sistem harus menyediakan interface untuk penulis confirm penerimaan produk ketika barang sudah sampai yang akan update status pesanan menjadi "terkirim".

**FR-PE-06**: Sistem harus generate shipping report yang mencakup metrics seperti on-time delivery rate, average delivery time, dan distribution of shipments across different expeditions.

#### B.2.5 Module Dashboard dan Analytics

**FR-DA-01**: Sistem harus menyediakan dashboard untuk percetakan yang menampilkan key metrics seperti total orders, pending orders, orders in production, completed orders, revenue bulan ini, dan completion rate.

**FR-DA-02**: Sistem harus menampilkan chart atau graph untuk visualize trend orders dan revenue over time sehingga percetakan dapat monitor business performance mereka.

**FR-DA-03**: Sistem harus menyediakan list pesanan terbaru di dashboard dengan quick actions untuk accept, view detail, atau update status.

**FR-DA-04**: Sistem harus menyediakan notification center yang menampilkan semua notifications relevant dengan highlight untuk notifications yang belum dibaca.

**FR-DA-05**: Sistem harus menyediakan settings page dimana percetakan dapat update profil mereka, manage pricing parameters, dan configure notification preferences.

### B.3 Non-Functional Requirements

Selain functional requirements, kami juga mendefinisikan non-functional requirements yang sama pentingnya untuk memastikan sistem tidak hanya functional tapi juga performant, secure, dan maintainable.

#### B.3.1 Performance

**NFR-P-01**: API endpoints harus memiliki average response time maksimal lima ratus milidetik untuk ninety-fifth percentile pada load normal (hingga seratus concurrent users).

**NFR-P-02**: Database queries harus dioptimasi dengan proper indexing sehingga query time untuk fetch list pesanan tidak melebihi dua ratus milidetik even ketika data sudah mencapai puluhan ribu records.

**NFR-P-03**: Frontend pages harus memiliki First Contentful Paint maksimal dua detik dan Largest Contentful Paint maksimal tiga detik pada koneksi 4G.

**NFR-P-04**: Sistem harus dapat handle minimal dua ratus concurrent users tanpa degradation yang significant pada response time atau availability.

#### B.3.2 Security

**NFR-S-01**: Semua API endpoints kecuali health check dan authentication endpoints harus protected dengan JWT authentication.

**NFR-S-02**: Sistem harus implement role-based access control dimana setiap endpoint hanya dapat diakses oleh role yang authorized.

**NFR-S-03**: Sensitive data seperti alamat pengiriman dan kontak information harus di-encrypt at rest di database.

**NFR-S-04**: Sistem harus implement rate limiting untuk prevent abuse atau DoS attacks dengan limit seratus requests per menit per IP address.

#### B.3.3 Scalability

**NFR-SC-01**: Arsitektur sistem harus modular sehingga dapat scale horizontally dengan menambah server instances jika traffic meningkat.

**NFR-SC-02**: Database design harus support sharding jika di masa depan data volume menjadi sangat besar.

**NFR-SC-03**: File storage untuk cover images dan manuscript files harus menggunakan cloud storage service yang scalable seperti Supabase Storage atau AWS S3.

#### B.3.4 Maintainability

**NFR-M-01**: Code harus follow consistent coding standards dan style guide untuk memudahkan maintenance dan collaboration.

**NFR-M-02**: Semua functions dan methods harus memiliki documentation comments yang menjelaskan purpose, parameters, dan return values.

**NFR-M-03**: Sistem harus memiliki comprehensive logging untuk facilitate debugging dan monitoring di production environment.

**NFR-M-04**: Error handling harus robust dengan meaningful error messages yang dapat membantu developers identify dan fix issues dengan cepat.

### B.4 Use Case Scenarios

Untuk memvalidasi bahwa requirements kami sudah complete dan coherent, kami mendefinisikan beberapa use case scenarios yang merepresentasikan typical user journeys dalam sistem.

#### Use Case 1: Penulis Membuat Pesanan Cetak Baru

**Actor**: Penulis yang sudah memiliki naskah disetujui

**Preconditions**:

- Penulis sudah login ke sistem
- Penulis memiliki minimal satu naskah dengan status "disetujui"
- Ada minimal satu percetakan yang aktif di sistem

**Main Flow**:

1. Penulis mengakses halaman dashboard dan mengklik menu "Pesanan Cetak"
2. Sistem menampilkan list pesanan existing (jika ada) dan tombol "Buat Pesanan Baru"
3. Penulis mengklik tombol "Buat Pesanan Baru"
4. Sistem menampilkan form pemesanan dengan field untuk pilih naskah, pilih percetakan, jumlah, dan spesifikasi
5. Penulis memilih naskah dari dropdown yang menampilkan list naskah mereka yang statusnya "disetujui"
6. Sistem menampilkan informasi naskah seperti judul dan jumlah halaman (jika sudah set)
7. Penulis memilih percetakan dari list yang menampilkan nama, lokasi, dan range harga
8. Penulis mengisi jumlah pesanan
9. Sistem memvalidasi apakah jumlah memenuhi minimum order dari percetakan yang dipilih
10. Penulis memilih spesifikasi cetak: jenis kertas, ukuran buku, jenis cover, dan opsi laminating
11. Sistem menghitung dan menampilkan estimasi harga secara real-time di side panel
12. Penulis mengisi alamat pengiriman lengkap dengan nama penerima, telepon, alamat, kota, provinsi, dan kode pos
13. Penulis dapat menambahkan catatan optional untuk percetakan
14. Penulis mengklik tombol "Buat Pesanan"
15. Sistem melakukan final validation dan menyimpan pesanan dengan status "tertunda"
16. Sistem mengirimkan notification kepada percetakan tentang pesanan baru
17. Sistem menampilkan konfirmasi sukses dengan nomor pesanan dan redirect ke halaman detail pesanan

**Alternative Flows**:

- Jika validation gagal pada step 9, sistem menampilkan error message dan highlight field yang bermasalah
- Jika naskah belum memiliki jumlah halaman, sistem menampilkan warning dan allow penulis untuk input manual estimated halaman
- Jika percetakan tidak ada pricing parameters yang aktif, sistem tidak allow pemilihan percetakan tersebut

**Postconditions**:

- Pesanan baru tersimpan di database dengan status "tertunda"
- Notification terkirim kepada percetakan
- Penulis dapat view dan track pesanan dari dashboard mereka

#### Use Case 2: Percetakan Menerima dan Memproses Pesanan

**Actor**: Percetakan partner

**Preconditions**:

- Percetakan sudah login dengan role "percetakan"
- Ada pesanan baru dengan status "tertunda" yang ditujukan untuk percetakan ini
- Percetakan telah set pricing parameters yang aktif

**Main Flow**:

1. Percetakan receives notification (email dan/atau push notification) tentang pesanan baru
2. Percetakan mengakses dashboard dan melihat pesanan baru di section "Pesanan Tertunda"
3. Percetakan mengklik pesanan untuk view detail
4. Sistem menampilkan complete information tentang pesanan termasuk naskah details, specifications, quantity, delivery address, dan calculated price
5. Percetakan review pesanan dan memutuskan untuk accept
6. Percetakan mengklik tombol "Terima Pesanan"
7. Sistem menampilkan confirmation dialog dengan summary pesanan
8. Percetakan confirm acceptance
9. Sistem update status pesanan menjadi "diterima" dan record timestamp
10. Sistem mengirim notification kepada penulis bahwa pesanan telah diterima
11. Pesanan berpindah dari section "Pesanan Tertunda" ke "Pesanan Diterima" di dashboard percetakan
12. Percetakan mulai proses produksi dan mengklik tombol "Mulai Produksi"
13. Sistem update status menjadi "dalam_produksi" dan create first production log untuk tahap "cetak"
14. Percetakan update progress di setiap tahapan produksi (cetak, potong, jilid, finishing, packing)
15. Setiap update progress, sistem create new production log record dan send notification kepada penulis
16. Setelah semua tahapan selesai, percetakan update status menjadi "kontrol_kualitas"
17. Setelah QC pass, percetakan update status menjadi "siap"
18. Percetakan create shipment record dengan input nomor resi dan expedition
19. Sistem update status menjadi "dikirim" dan send notification kepada penulis

**Alternative Flows**:

- Jika percetakan memutuskan untuk reject pesanan pada step 6, mereka mengklik tombol "Tolak Pesanan", input reason, dan sistem update status menjadi "ditolak" dengan send notification kepada penulis
- Jika ada issue di production, percetakan dapat add notes pada production log yang akan visible di timeline untuk penulis

**Postconditions**:

- Status pesanan updated sesuai dengan progress
- Production logs terecord di database
- Penulis mendapat updates via notifications
- Shipment information tersedia untuk tracking

#### Use Case 3: Penulis Melacak Status Pesanan

**Actor**: Penulis

**Preconditions**:

- Penulis sudah login
- Penulis memiliki pesanan yang sedang diproses

**Main Flow**:

1. Penulis mengakses halaman "Pesanan Cetak" dari dashboard
2. Sistem menampilkan list semua pesanan penulis dengan status current dan summary info
3. Penulis mengklik salah satu pesanan untuk view detail tracking
4. Sistem menampilkan halaman detail dengan beberapa sections:
   - Order Information: nomor pesanan, tanggal dibuat, status current, percetakan
   - Specifications: detail spesifikasi cetak yang dipesan
   - Pricing: breakdown harga dari setiap komponen
   - Status Timeline: visual timeline menunjukkan progress dari tertunda hingga status current
   - Production Logs: detail logs dari setiap tahapan produksi dengan timestamp dan notes
   - Shipping Information: expedition, resi, tracking link (jika sudah dikirim)
5. Jika pesanan sudah dalam status "dikirim", penulis dapat mengklik link tracking untuk monitor shipment di website expedition
6. Ketika produk sudah diterima, penulis mengklik tombol "Konfirmasi Penerimaan"
7. Sistem menampilkan form untuk optional feedback atau rating
8. Penulis submit confirmation
9. Sistem update status menjadi "terkirim" dan mark transaction as complete

**Alternative Flows**:

- Jika pesanan masih dalam status "tertunda" dan belum ada update dari percetakan dalam waktu tertentu, sistem menampilkan option untuk cancel atau remind percetakan
- Jika ada issue dengan pesanan, penulis dapat mengklik tombol "Laporkan Masalah" untuk contact support

**Postconditions**:

- Penulis memiliki visibility penuh terhadap status pesanan mereka
- Feedback terecord untuk quality improvement

### B.5 Data Requirements

Berdasarkan functional requirements dan use cases di atas, kami mendefinisikan data entities yang diperlukan beserta attributes dan relationships mereka.

#### Entitas PesananCetak

Entitas utama yang merepresentasikan pesanan cetak dari penulis.

**Attributes**:

- `id` (UUID, Primary Key): Identifier unique untuk pesanan
- `nomorPesanan` (String, Unique): Nomor pesanan human-readable format (misal: PCT-2026-00123)
- `idNaskah` (UUID, Foreign Key): Reference ke naskah yang akan dicetak
- `idPemesan` (UUID, Foreign Key): Reference ke user yang membuat pesanan (penulis)
- `idPercetakan` (UUID, Foreign Key, Nullable): Reference ke percetakan yang handle pesanan
- `jumlah` (Integer): Quantity buku yang dipesan
- `formatBuku` (Enum): Ukuran buku (A4, A5, B5)
- `jenisKertas` (Enum): Jenis kertas (HVS, BOOKPAPER, ART_PAPER)
- `jenisCover` (Enum): Jenis cover (SOFTCOVER, HARDCOVER)
- `laminating` (Boolean): Apakah dengan laminating
- `hargaSatuan` (Decimal): Harga per unit dalam rupiah
- `totalHarga` (Decimal): Total harga pesanan dalam rupiah
- `status` (Enum): Status current dari pesanan
- `alamatPengiriman` (JSON): Object berisi detail alamat pengiriman
- `catatanKhusus` (Text, Nullable): Catatan dari penulis untuk percetakan
- `alasanDitolak` (Text, Nullable): Reason jika pesanan ditolak
- `dibuatPada` (DateTime): Timestamp pembuatan pesanan
- `diperbaruiPada` (DateTime): Timestamp last update

**Relationships**:

- Belongs to Naskah (many-to-one)
- Belongs to Pengguna as pemesan (many-to-one)
- Belongs to Pengguna as percetakan (many-to-one)
- Has many LogProduksi (one-to-many)
- Has one Pengiriman (one-to-one)

#### Entitas ParameterHargaPercetakan

Entitas untuk menyimpan pricing configuration dari setiap percetakan.

**Attributes**:

- `id` (UUID, Primary Key): Identifier unique
- `idPercetakan` (UUID, Foreign Key): Reference ke percetakan owner
- `namaKombinasi` (String): Nama pricing scheme (misal: "Tarif Standar 2026")
- `deskripsi` (Text, Nullable): Deskripsi tentang pricing scheme
- `hargaKertasA4` (Decimal): Harga base untuk kertas A4 per halaman
- `hargaKertasA5` (Decimal): Harga base untuk kertas A5 per halaman
- `hargaKertasB5` (Decimal): Harga base untuk kertas B5 per halaman
- `hargaSoftcover` (Decimal): Harga softcover
- `hargaHardcover` (Decimal): Harga hardcover
- `biayaJilid` (Decimal): Biaya jilid per buku
- `biayaLaminating` (Decimal): Biaya laminating cover
- `biayaPengirimanPerKg` (Decimal): Biaya pengiriman per kilogram
- `minimumPesanan` (Integer): Minimum order quantity
- `diskonTier` (JSON): Object berisi tier diskon berdasarkan quantity
- `aktif` (Boolean): Apakah pricing scheme ini yang currently active
- `dibuatPada` (DateTime): Timestamp creation
- `diperbaruiPada` (DateTime): Timestamp last update

**Relationships**:

- Belongs to Pengguna as percetakan (many-to-one)

#### Entitas LogProduksi

Entitas untuk tracking progress produksi di setiap tahapan.

**Attributes**:

- `id` (UUID, Primary Key): Identifier unique
- `idPesanan` (UUID, Foreign Key): Reference ke pesanan
- `tahapan` (String): Nama tahapan (cetak, potong, jilid, finishing, packing)
- `status` (String): Status tahapan (dimulai, selesai, atau issue)
- `catatan` (Text, Nullable): Notes atau keterangan dari percetakan
- `waktu` (DateTime): Timestamp log entry
- `dibuatPada` (DateTime): Timestamp creation

**Relationships**:

- Belongs to PesananCetak (many-to-one)

#### Entitas Pengiriman

Entitas untuk informasi pengiriman pesanan.

**Attributes**:

- `id` (UUID, Primary Key): Identifier unique
- `idPesanan` (UUID, Foreign Key, Unique): Reference ke pesanan
- `namaEkspedisi` (String): Nama expedition service
- `nomorResi` (String): Tracking number dari expedition
- `estimasiSampai` (Date, Nullable): Estimated delivery date
- `biayaKirim` (Decimal): Actual shipping cost
- `status` (Enum): Status pengiriman (diproses, dalam_perjalanan, terkirim, gagal)
- `tanggalKirim` (Date): Tanggal barang dikirim
- `tanggalTerima` (Date, Nullable): Tanggal barang diterima
- `catatanPenerima` (Text, Nullable): Notes dari penerima saat confirm delivery
- `dibuatPada` (DateTime): Timestamp creation
- `diperbaruiPada` (DateTime): Timestamp last update

**Relationships**:

- Belongs to PesananCetak (one-to-one)
- Has many TrackingLog (one-to-many)

#### Entitas TrackingLog

Entitas untuk tracking detailed location updates dari shipment.

**Attributes**:

- `id` (UUID, Primary Key): Identifier unique
- `idPengiriman` (UUID, Foreign Key): Reference ke pengiriman
- `lokasi` (String): Current location atau city
- `keterangan` (String): Description of status (misal: "Paket tiba di sorting center Jakarta")
- `waktu` (DateTime): Timestamp update
- `dibuatPada` (DateTime): Timestamp creation

**Relationships**:

- Belongs to Pengiriman (many-to-one)

---

**[REFERENSI FILE CODINGAN]**

Untuk implementasi actual dari analisis kebutuhan ini, silakan lihat file-file berikut:

- Database Schema: `backend/prisma/schema.prisma` (baris 408-536 untuk models Fase 4)
- DTO Definitions: `backend/src/modules/percetakan/dto/` (14 files)
- Type Definitions: `frontend/types/percetakan.ts`

---

**[TEMPAT UNTUK SCREENSHOT]**

Berikut adalah lokasi dimana screenshot dapat ditambahkan untuk memperjelas dokumentasi:

1. **Screenshot Use Case Flow**: Diagram visual menunjukkan flow dari use case 1-3 di atas
2. **Screenshot Entity Relationship Diagram**: ERD menunjukkan relationships antar entities
3. **Screenshot Stakeholder Personas**: Visual representation dari ketiga personas stakeholder
