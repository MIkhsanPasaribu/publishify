# 📚 Dokumentasi Fitur Cetak Fisik Buku - Publishify

## 🎯 Overview

Sistem cetak fisik buku Publishify memungkinkan penulis untuk memesan pencetakan buku mereka yang sudah diterbitkan secara digital menjadi bentuk fisik. Sistem ini mencakup proses pemesanan, produksi, pembayaran, hingga pengiriman dengan manajemen lengkap untuk percetakan.

---

## 👤 BAGIAN 1: FITUR UNTUK PENULIS

### 1.1 Halaman Form Cetak Fisik Buku
**Path:** `/dashboard/buku-terbit/[id]/cetak`

#### 📋 Deskripsi Fitur
Halaman checkout yang memungkinkan penulis untuk membuat pesanan cetak fisik dari naskah yang telah mereka terbitkan. Interface dirancang dengan desain modern bergradasi teal-cyan yang menarik dan mudah digunakan.

#### 🎨 Tampilan Visual
- **Header Informasi Buku:** Menampilkan sampul buku, judul, penulis, dan ISBN dalam layout card yang elegan
- **Form Spesifikasi:** Panel konfigurasi cetak dengan pilihan lengkap
- **Ringkasan Pesanan:** Sidebar yang menampilkan total biaya secara real-time
- **Desain Responsif:** Optimal di desktop, tablet, dan mobile

#### ⚙️ Spesifikasi Cetak yang Dapat Dipilih

**1. Format Kertas:**
- A4 (21 x 29.7 cm)
- A5 (14.8 x 21 cm)
- B5 (17.6 x 25 cm)
- Novel (13 x 19 cm)
- Custom

**2. Jenis Kertas:**
- Bookpaper - Standar untuk buku novel (Rp 80.000/rim)
- HVS 70gr - Ekonomis dan ringan (Rp 60.000/rim)
- HVS 80gr - Lebih tebal dari HVS 70 (Rp 75.000/rim)
- Art Paper 120gr - Premium dengan permukaan glossy (Rp 150.000/rim)

**3. Jenis Cover:**
- Soft Cover - Cover lembut, fleksibel (Rp 15.000/unit)
- Hard Cover - Cover keras, premium (Rp 35.000/unit)

**4. Finishing Tambahan (Opsional):**
- Laminasi Glossy - Mengkilap, melindungi cover (Rp 5.000/unit)
- Laminasi Doff - Matte finish, elegan (Rp 5.000/unit)
- Spot UV - Efek mengkilap sebagian (Rp 10.000/unit)
- Emboss - Timbul pada cover (Rp 15.000/unit)
- Foil - Efek metalik (Rp 20.000/unit)

**5. Jumlah Cetak:**
- Minimum: 100 eksemplar
- Maximum: 10.000 eksemplar
- Sistem otomatis menghitung harga berdasarkan quantity

#### 💰 Sistem Kalkulasi Harga

**Formula Perhitungan:**
```
Harga Dasar = (Jumlah Halaman / 500) × Harga Kertas × Jumlah Cetak
Biaya Cover = Harga Cover × Jumlah Cetak
Biaya Finishing = Total Harga Finishing × Jumlah Cetak
Total = Harga Dasar + Biaya Cover + Biaya Finishing
```

**Contoh Perhitungan:**
- Buku 200 halaman, format A5, Bookpaper
- Soft Cover dengan Laminasi Doff
- Cetak 500 eksemplar

```
Harga Dasar = (200 / 500) × 80.000 × 500 = Rp 16.000.000
Biaya Cover = 15.000 × 500 = Rp 7.500.000
Biaya Laminasi = 5.000 × 500 = Rp 2.500.000
TOTAL = Rp 26.000.000
```

#### 📝 Informasi Pengiriman

Form mencakup field lengkap untuk pengiriman:
- **Alamat Lengkap:** Textarea untuk alamat detail (min 10 karakter)
- **Nama Penerima:** Identitas penerima paket (min 3 karakter)
- **Nomor Telepon:** Kontak yang bisa dihubungi kurir (min 8 digit)

#### ✨ Fitur Interaktif

1. **Real-time Price Calculation:**
   - Harga update otomatis saat memilih opsi
   - Breakdown harga ditampilkan detail

2. **Input Validation:**
   - Jumlah cetak minimum 100 eksemplar
   - Validasi format alamat dan nomor telepon
   - Alert error yang jelas jika ada field tidak valid

3. **Visual Feedback:**
   - Hover effects pada setiap opsi
   - Loading state saat submit pesanan
   - Success notification dengan redirect otomatis

4. **Smart Navigation:**
   - Tombol "Kembali" ke halaman buku terbit
   - Auto-redirect ke halaman pesanan setelah berhasil
   - Confirm dialog jika meninggalkan halaman dengan data terisi

#### 🔄 Flow Proses Pemesanan

```
1. Penulis akses halaman dari daftar buku terbit
   ↓
2. Sistem load data buku (judul, halaman, sampul)
   ↓
3. Penulis pilih spesifikasi cetak
   ↓
4. Sistem hitung harga real-time
   ↓
5. Penulis isi data pengiriman
   ↓
6. Penulis tambahkan catatan (opsional)
   ↓
7. Submit pesanan
   ↓
8. Validasi data frontend
   ↓
9. Kirim ke backend API
   ↓
10. Backend create PesananCetak + Pengiriman (atomic transaction)
    ↓
11. Redirect ke halaman riwayat pesanan
    ↓
12. Notifikasi sukses ditampilkan
```

#### 🛡️ Error Handling

**Client-side Validation:**
- Jumlah cetak < 100: "Jumlah minimum adalah 100 eksemplar"
- Alamat kosong: "Alamat pengiriman wajib diisi"
- Nomor telepon invalid: "Format nomor telepon tidak valid"

**Server Response Handling:**
- 400 Bad Request: Tampilkan pesan error spesifik dari backend
- 401 Unauthorized: Redirect ke halaman login
- 500 Server Error: "Terjadi kesalahan server, coba lagi"

---

### 1.2 Halaman Riwayat Pesanan
**Path:** `/dashboard/pesanan-cetak`

#### 📋 Deskripsi Fitur
Dashboard komprehensif yang menampilkan semua pesanan cetak yang pernah dibuat oleh penulis. Interface menggunakan card-based layout dengan desain modern dan informasi yang mudah dipahami.

#### 🎨 Tampilan Visual
- **Gradient Background:** Teal-cyan gradient yang eye-catching
- **Statistics Cards:** 5 kartu statistik dengan animasi hover
- **Order Cards:** Grid responsif dengan preview sampul buku
- **Search & Filter:** Bar pencarian dan dropdown filter status

#### 📊 Statistik Dashboard (5 Cards)

**1. Total Pesanan**
- Jumlah seluruh pesanan yang pernah dibuat
- Icon: 📦 Package
- Warna: Blue gradient

**2. Pesanan Tertunda**
- Pesanan dengan status "tertunda" (belum dikonfirmasi)
- Icon: ⏰ Clock
- Warna: Amber gradient
- Badge pulse animation untuk menarik perhatian

**3. Sedang Diproses**
- Pesanan dalam tahap produksi
- Icon: ⚙️ Cog (spinning animation)
- Warna: Purple gradient

**4. Dalam Pengiriman**
- Pesanan yang sedang dikirim
- Icon: 🚚 Truck
- Warna: Cyan gradient

**5. Pesanan Selesai**
- Pesanan yang sudah diterima
- Icon: ✅ CheckCircle
- Warna: Green gradient

#### 🔍 Filter & Search

**Search Functionality:**
- Cari berdasarkan:
  - Judul buku
  - Nomor pesanan
  - Tanggal pemesanan
- Real-time search (tanpa submit button)
- Placeholder: "Cari berdasarkan judul buku atau nomor pesanan..."

**Filter Status:**
- Dropdown select dengan 6 opsi:
  1. **Semua Pesanan** - Tampilkan semua
  2. **Tertunda** - Menunggu konfirmasi percetakan
  3. **Dalam Produksi** - Sedang dicetak
  4. **Dikirim** - Dalam pengiriman
  5. **Selesai** - Sudah diterima
  6. **Dibatalkan** - Pesanan dibatalkan

#### 📦 Kartu Pesanan (Order Card)

**Layout Setiap Card:**

```
┌─────────────────────────────────────────────┐
│ [Sampul Buku]  Judul Buku                  │
│                #PO-20251126-1234            │
│                                             │
│ 📏 500 eksemplar • A5 • Bookpaper          │
│ 📖 Soft Cover • Laminasi Doff              │
│                                             │
│ 💰 Rp 26.000.000                           │
│                                             │
│ Status: [●] Dalam Produksi                 │
│ Kemajuan: ████████░░░░ 65%                │
│                                             │
│ 📍 Dikirim ke: Jakarta Selatan             │
│ 📦 Resi: JNE123456789 [Lacak Paket]       │
│                                             │
│ 📅 Dipesan: 26 Nov 2025, 10:30            │
│                                             │
│ [Lihat Detail]  [Hubungi Percetakan]      │
└─────────────────────────────────────────────┘
```

**Komponen Detail:**

1. **Header:**
   - Thumbnail sampul buku (cover image)
   - Judul buku (font besar, bold)
   - Nomor pesanan unik (format: PO-YYYYMMDD-XXXX)

2. **Spesifikasi Cetak:**
   - Jumlah eksemplar + format + jenis kertas
   - Jenis cover + finishing tambahan
   - Icon untuk setiap kategori

3. **Harga Total:**
   - Format rupiah dengan pemisah ribuan
   - Font besar dan bold untuk visibility

4. **Status & Progress:**
   - Badge status dengan warna sesuai:
     - Tertunda: Amber (⏰)
     - Dalam Produksi: Purple (⚙️)
     - Dikirim: Cyan (🚚)
     - Selesai: Green (✅)
     - Dibatalkan: Red (❌)
   - Progress bar untuk pesanan dalam produksi
   - Animated pulse dot pada status aktif

5. **Informasi Pengiriman:**
   - Alamat tujuan (singkat)
   - Nomor resi tracking (jika sudah dikirim)
   - Link "Lacak Paket" yang membuka tracking eksternal

6. **Metadata:**
   - Tanggal pemesanan (format Indonesia)
   - Estimasi pengiriman (jika tersedia)

7. **Action Buttons:**
   - **Lihat Detail:** Buka halaman detail pesanan
   - **Hubungi Percetakan:** Chat/email ke percetakan
   - **Batalkan Pesanan:** Jika status masih "tertunda"

#### 🎭 Status Pesanan & Workflow

**Status Timeline:**

```
1. Tertunda (Pending)
   ↓ Percetakan konfirmasi pesanan
2. Dalam Produksi (In Production)
   ↓ Proses cetak selesai
3. Kontrol Kualitas (QC)
   ↓ QC passed
4. Siap Kirim (Ready to Ship)
   ↓ Diserahkan ke kurir
5. Dikirim (Shipped)
   ↓ Paket sampai tujuan
6. Selesai (Completed)
```

**Status Alternatif:**
- **Dibatalkan:** Bisa oleh penulis (saat tertunda) atau percetakan (stok habis, dll)

#### 📱 Responsive Design

**Desktop (≥1024px):**
- Grid 3 kolom untuk order cards
- Statistics dalam 5 kolom
- Sidebar untuk filter detail

**Tablet (768px - 1023px):**
- Grid 2 kolom untuk order cards
- Statistics dalam 3 kolom (baris 1: 3 cards, baris 2: 2 cards)

**Mobile (<768px):**
- Single column layout
- Statistics stacked vertical
- Komponen accordion untuk detail pesanan

#### ✨ Fitur Interaktif

1. **Hover Effects:**
   - Card elevation saat hover
   - Button color transition
   - Smooth scale animation

2. **Real-time Updates:**
   - Auto-refresh status setiap 30 detik
   - WebSocket notification untuk perubahan status
   - Badge pulse untuk status penting

3. **Image Lazy Loading:**
   - Sampul buku dimuat progresif
   - Skeleton loader saat loading

4. **Pagination:**
   - Load more on scroll
   - Atau numbered pagination (10 items per page)

#### 🔔 Notifikasi

**Push Notifications untuk:**
- Pesanan dikonfirmasi percetakan
- Pesanan mulai diproduksi
- Pesanan selesai dan siap kirim
- Pesanan sudah dikirim (dengan nomor resi)
- Pesanan sampai tujuan

---

## 🏭 BAGIAN 2: FITUR UNTUK PERCETAKAN

### 2.1 Dashboard Percetakan
**Path:** `/dashboard/percetakan`

#### 📋 Deskripsi Fitur
Halaman utama untuk admin percetakan yang menampilkan overview bisnis, statistik operasional, dan aktivitas terbaru. Dirancang dengan tema slate/gray profesional untuk antarmuka administrator.

#### 🎨 Tampilan Visual
- **Professional Theme:** Slate, gray, dan neutral colors
- **Data Visualization:** Charts dan graphs untuk insights
- **Quick Access:** Shortcut ke fitur-fitur penting
- **Real-time Data:** Update statistik secara berkala

#### 📊 Statistik Dashboard (6 Cards)

**Layout Grid: 3 Kolom × 2 Baris**

**1. Total Pesanan (Blue Gradient)**
- Jumlah pesanan masuk secara keseluruhan
- Icon: 📦 Layers
- Value: 127 pesanan
- Subtext: "Total pesanan bulan ini"

**2. Pesanan Aktif (Amber Gradient)**
- Pesanan yang sedang dalam proses (belum selesai)
- Icon: ⚙️ Activity
- Value: 23 pesanan
- Subtext: "Sedang dikerjakan"
- Badge pulse untuk indikasi aktif

**3. Selesai Bulan Ini (Green Gradient)**
- Pesanan yang berhasil diselesaikan di bulan berjalan
- Icon: ✅ CheckCircle2
- Value: 45 pesanan
- Subtext: "Completed orders"
- Trending up icon

**4. Pendapatan Bulan Ini (Purple Gradient)**
- Total revenue dari pesanan yang dibayar
- Icon: 💰 DollarSign
- Value: Rp 125.000.000
- Subtext: "Dari 45 pesanan selesai"
- Percentage increase vs last month

**5. Rata-rata Waktu Produksi (Teal Gradient)**
- Average time dari konfirmasi hingga selesai produksi
- Icon: ⏱️ Clock
- Value: 7 hari
- Subtext: "Lead time production"

**6. Tingkat Kepuasan (Rose Gradient)**
- Rating rata-rata dari feedback penulis
- Icon: ⭐ Star
- Value: 4.8/5.0
- Subtext: "Dari 40 ulasan"

#### 📋 Pesanan Terbaru (Recent Orders)

**Section: Grid 2 Kolom**

**Kolom 1: Daftar Pesanan Terbaru (4 items)**

Setiap item menampilkan:
```
┌─────────────────────────────────────┐
│ #PO-20251126-1234                  │
│ Petualangan di Negeri Dongeng      │
│                                     │
│ 👤 Ahmad Rudi                      │
│ 📦 500 eks • A5 • Soft Cover       │
│                                     │
│ Status: [●] Dalam Produksi         │
│ Progress: ████████░░ 65%           │
│                                     │
│ 📅 26 Nov 2025, 10:30             │
│                                     │
│ [Lihat Detail]                     │
└─────────────────────────────────────┘
```

**Data yang Ditampilkan:**
- Nomor pesanan
- Judul buku
- Nama penulis
- Spesifikasi singkat
- Status dengan badge berwarna
- Progress bar (untuk status produksi)
- Tanggal pemesanan
- Quick action button

**Kolom 2: Aktivitas Produksi (Activity Feed)**

Timeline-style feed dengan 4 aktivitas terakhir:
```
⚙️ 10:30 - Memulai produksi PO-20251126-1234
✅ 09:15 - Selesai QC PO-20251125-5678  
📦 08:45 - Pesanan siap kirim PO-20251124-9012
🚚 07:30 - Diserahkan ke JNE PO-20251123-3456
```

**Komponen Activity:**
- Icon sesuai jenis aktivitas
- Timestamp relatif (atau absolute)
- Deskripsi singkat aktivitas
- Link ke pesanan terkait
- Warna indikator berbeda per jenis

#### 🎯 Quick Actions Panel

**Shortcut Buttons Grid:**

```
┌─────────────────┬─────────────────┬─────────────────┐
│ 📋 Pesanan Baru │ ⚙️ Produksi     │ 💰 Pembayaran   │
│ (5 pending)     │ (23 active)     │ (2 pending)     │
└─────────────────┴─────────────────┴─────────────────┘
```

**Setiap Button:**
- Icon representatif
- Label fitur
- Badge counter (jika ada pending items)
- Direct link ke halaman terkait

#### 📈 Grafik Performa (Charts)

**Section: Full Width**

**1. Grafik Pesanan (Line Chart):**
- X-axis: 7 hari terakhir
- Y-axis: Jumlah pesanan
- Data: Pesanan masuk per hari
- Color: Gradient teal-blue
- Interaktif: Hover untuk detail

**2. Grafik Pendapatan (Bar Chart):**
- X-axis: 4 minggu terakhir
- Y-axis: Total pendapatan (Rupiah)
- Data: Revenue per minggu
- Color: Gradient green
- Tooltip: Breakdown per pesanan

**3. Status Distribution (Pie Chart):**
- Segmen: 6 status pesanan
- Percentage untuk masing-masing status
- Color-coded sesuai status
- Interactive legend

#### 🔔 Alert & Notifications

**Priority Alerts:**

1. **Pesanan Urgent (Red Alert):**
   - Pesanan dengan deadline < 3 hari
   - Menampilkan countdown timer

2. **Stok Material Menipis (Amber Alert):**
   - Notifikasi jika kertas/material < 20%
   - Link ke inventory management

3. **Pembayaran Pending (Blue Alert):**
   - Jumlah pembayaran yang menunggu verifikasi
   - Quick link ke halaman pembayaran

**Alert Card:**
```
⚠️ PERHATIAN!
3 pesanan dengan deadline < 3 hari
[Lihat Detail] [Dismiss]
```

#### 📱 Responsive Behavior

**Desktop:**
- Full layout dengan 6 stat cards dalam 3×2 grid
- Two-column untuk recent orders & activity
- Charts ditampilkan side-by-side

**Tablet:**
- Stat cards menjadi 2×3 grid
- Recent orders & activity stacked vertical
- Charts stacked vertical

**Mobile:**
- Single column semua elemen
- Stat cards scrollable horizontal
- Charts dengan aspect ratio adjusted

#### ⚡ Real-time Features

**Auto-refresh (setiap 30 detik):**
- Statistik dashboard
- Pesanan terbaru
- Activity feed

**WebSocket Updates:**
- Notifikasi pesanan baru (pop-up)
- Update status pesanan real-time
- Alert material/stok

---

### 2.2 Halaman Daftar Pesanan
**Path:** `/dashboard/percetakan/pesanan`

#### 📋 Deskripsi Fitur
Interface manajemen pesanan lengkap untuk staff percetakan. Menampilkan semua pesanan dalam format tabel dengan informasi detail, progress tracking, dan action buttons untuk update status.

#### 🎨 Tampilan Visual
- **Table-based Layout:** Data table profesional
- **Compact Information:** Semua data penting dalam satu view
- **Action-oriented:** Quick buttons untuk setiap pesanan
- **Status Indicators:** Visual progress bars dan badges

#### 📊 Quick Stats Bar (5 Mini Cards)

**Top Section: Horizontal Card Row**

```
┌────────────┬────────────┬────────────┬────────────┬────────────┐
│ Total      │ Tertunda   │ Produksi   │ QC         │ Siap Kirim │
│ 127        │ 5          │ 23         │ 8          │ 12         │
└────────────┴────────────┴────────────┴────────────┴────────────┘
```

**Setiap Card:**
- Label status
- Count number (besar dan bold)
- Icon kecil
- Background color sesuai status
- Clickable untuk filter langsung

#### 🔍 Filter & Search Panel

**Layout: Horizontal Bar**

**1. Search Input:**
- Placeholder: "Cari nomor pesanan, pemesan, atau judul buku..."
- Icon: 🔍 Search
- Real-time search
- Width: 60% di desktop

**2. Filter Status Dropdown:**
- Select dengan 8 opsi:
  - Semua Pesanan
  - Tertunda
  - Diterima
  - Dalam Produksi
  - Kontrol Kualitas
  - Siap Kirim
  - Dikirim
  - Selesai
- Width: 20% di desktop

**3. Filter Tanggal:**
- Date range picker
- Presets: Hari ini, 7 hari, 30 hari, Custom
- Width: 20% di desktop

#### 📋 Tabel Pesanan (Main Data Table)

**Kolom Table (6 Columns):**

**1. Pesanan (Order Info)**
- Nomor pesanan (#PO-YYYYMMDD-XXXX)
- Judul buku (max 40 char, truncated)
- Tanggal pemesanan
- Width: 20%

**2. Pemesan (Customer Info)**
- Nama penulis
- Email contact
- Nomor telepon
- Width: 15%

**3. Spesifikasi (Print Specs)**
- Jumlah eksemplar
- Format kertas
- Jenis kertas
- Jenis cover
- Finishing tambahan (jika ada)
- Width: 25%

**4. Status**
- Status badge dengan icon & dot
- Animated pulse untuk status aktif
- Color-coded:
  - Tertunda: Amber
  - Diterima: Blue
  - Dalam Produksi: Purple
  - Kontrol Kualitas: Indigo
  - Siap: Teal
  - Dikirim: Cyan
  - Selesai: Green
- Width: 15%

**5. Progress**
- Progress bar (0-100%)
- Percentage text di dalam bar
- Color gradient sesuai completion:
  - 0-30%: Red to Orange
  - 31-70%: Orange to Yellow
  - 71-100%: Yellow to Green
- Width: 15%

**6. Aksi (Actions)**
- Button "Detail" (outline)
- Button "Update Status" (solid)
- Dropdown menu untuk advanced actions:
  - Ubah Status
  - Cetak Invoice
  - Hubungi Penulis
  - Batalkan Pesanan
  - Lihat History
- Width: 10%

#### 📦 Detail Row Expandable

**Klik row untuk expand detail:**

```
┌─────────────────────────────────────────────────────────┐
│ Detail Lengkap Pesanan                                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ 📋 Informasi Pesanan:                                  │
│ - Nomor: PO-20251126-1234                              │
│ - Tanggal: 26 November 2025, 10:30                    │
│ - Deadline: 3 Desember 2025                            │
│                                                         │
│ 📖 Spesifikasi Detail:                                 │
│ - Judul: Petualangan di Negeri Dongeng                │
│ - Jumlah Halaman: 250 halaman                         │
│ - Jumlah Cetak: 500 eksemplar                         │
│ - Format: A5 (14.8 x 21 cm)                           │
│ - Kertas: Bookpaper                                    │
│ - Cover: Soft Cover                                    │
│ - Finishing: Laminasi Doff, Spot UV                   │
│                                                         │
│ 💰 Rincian Biaya:                                      │
│ - Biaya Cetak: Rp 20.000.000                          │
│ - Biaya Cover: Rp 7.500.000                           │
│ - Biaya Finishing: Rp 7.500.000                       │
│ - Total: Rp 35.000.000                                │
│                                                         │
│ 📍 Informasi Pengiriman:                               │
│ - Alamat: Jl. Raya Bogor No. 123, Jakarta Timur      │
│ - Penerima: Ahmad Rudi (081234567890)                 │
│ - Ekspedisi: JNE Reguler                              │
│ - Estimasi: 3-5 hari kerja                            │
│                                                         │
│ 📝 Catatan Penulis:                                    │
│ "Mohon perhatikan kualitas cover. Ini buku special."  │
│                                                         │
│ 📊 Timeline Progress:                                  │
│ ✅ Pesanan diterima - 26 Nov, 10:30                   │
│ ✅ Konfirmasi pembayaran - 26 Nov, 11:00              │
│ ⚙️ Produksi dimulai - 27 Nov, 08:00                   │
│ ⏳ Kontrol kualitas - Pending                          │
│ ⏳ Siap kirim - Pending                                │
│ ⏳ Pengiriman - Pending                                │
│                                                         │
│ [Tutup Detail] [Update Status] [Cetak Invoice]        │
└─────────────────────────────────────────────────────────┘
```

#### 🔄 Update Status Modal

**Klik "Update Status" untuk buka modal:**

```
┌─────────────────────────────────────┐
│ Update Status Pesanan               │
│ PO-20251126-1234                   │
├─────────────────────────────────────┤
│                                     │
│ Status Saat Ini:                    │
│ [●] Dalam Produksi (65%)           │
│                                     │
│ Ubah Ke:                           │
│ ┌─────────────────────────────┐   │
│ │ ▼ Pilih Status Baru         │   │
│ │   - Kontrol Kualitas        │   │
│ │   - Siap Kirim              │   │
│ │   - Dikirim                 │   │
│ │   - Selesai                 │   │
│ │   - Dibatalkan              │   │
│ └─────────────────────────────┘   │
│                                     │
│ Progress (%):                       │
│ ┌─────────────────────────────┐   │
│ │ [========>          ] 75     │   │
│ └─────────────────────────────┘   │
│                                     │
│ Catatan Update:                     │
│ ┌─────────────────────────────┐   │
│ │                             │   │
│ │                             │   │
│ └─────────────────────────────┘   │
│                                     │
│ [Batal]           [Update Status]  │
└─────────────────────────────────────┘
```

**Validation Rules:**
- Status harus berurutan (tidak bisa skip)
- Progress harus >= progress sebelumnya
- Catatan wajib jika status "Dibatalkan"

#### 🎯 Status Workflow & Automation

**Automatic Status Changes:**

1. **Tertunda → Diterima:**
   - Trigger: Admin klik "Terima Pesanan"
   - Action: Kirim notifikasi ke penulis
   - Progress: 0% → 10%

2. **Diterima → Dalam Produksi:**
   - Trigger: Admin klik "Mulai Produksi"
   - Action: Generate work order untuk staff
   - Progress: 10% → 30%

3. **Dalam Produksi → Kontrol Kualitas:**
   - Trigger: Progress mencapai 90%
   - Action: Assign QC inspector
   - Progress: 90% → 95%

4. **Kontrol Kualitas → Siap Kirim:**
   - Trigger: QC approved
   - Action: Generate packing slip
   - Progress: 95% → 98%

5. **Siap Kirim → Dikirim:**
   - Trigger: Input nomor resi
   - Action: Kirim email tracking ke penulis
   - Progress: 98% → 99%

6. **Dikirim → Selesai:**
   - Trigger: Konfirmasi diterima (manual/auto)
   - Action: Request rating & review
   - Progress: 99% → 100%

#### 📊 Bulk Actions

**Checkbox Selection untuk Multiple Orders:**

**Actions Available:**
- Export to Excel/PDF
- Print packing slips
- Bulk status update (untuk status yang sama)
- Send notification to customers
- Generate batch invoice

**Toolbar muncul saat ada pesanan terpilih:**
```
┌──────────────────────────────────────────────┐
│ ☑️ 3 pesanan dipilih                        │
│ [Export] [Cetak] [Update] [Notifikasi]      │
└──────────────────────────────────────────────┘
```

#### 📱 Responsive Table

**Desktop (>1024px):**
- Semua 6 kolom visible
- Horizontal scroll jika konten panjang

**Tablet (768-1023px):**
- Hide kolom "Pemesan"
- Spesifikasi diringkas
- Action buttons dalam dropdown

**Mobile (<768px):**
- Table berubah jadi card list
- Setiap row jadi card dengan layout vertical
- Swipe right untuk reveal actions

#### 🔔 Notifications & Alerts

**Real-time Notifications:**

1. **Pesanan Baru:**
   - Pop-up notification di kanan bawah
   - Sound alert
   - Auto-add ke table (tanpa refresh)

2. **Deadline Warning:**
   - Badge merah pada pesanan dengan deadline < 2 hari
   - Highlight row dengan background orange

3. **QC Failed:**
   - Alert modal jika QC reject
   - Require reason input
   - Auto-rollback status ke "Dalam Produksi"

---

### 2.3 Halaman Pembayaran
**Path:** `/dashboard/percetakan/pembayaran`

#### 📋 Deskripsi Fitur
Sistem verifikasi dan tracking pembayaran dari penulis. Admin percetakan dapat memverifikasi bukti transfer, mengelola status pembayaran, dan memonitor cash flow secara real-time.

#### 🎨 Tampilan Visual
- **Clean Interface:** Focus pada data transaksional
- **Verification-centric:** Tools untuk approve/reject payment
- **Financial Dashboard:** Revenue tracking dan analytics
- **Emerald-Teal Gradient:** Professional financial theme

#### 📊 Statistik Pembayaran (4 Cards)

**Layout Grid: 2×2 atau 4×1**

**1. Total Pembayaran (Emerald Gradient)**
- Jumlah transaksi pembayaran total
- Icon: 💳 CreditCard
- Value: 127 transaksi
- Subtext: "Transaksi bulan ini"

**2. Berhasil / Terverifikasi (Green Gradient)**
- Pembayaran yang sudah diverifikasi admin
- Icon: ✅ CheckCircle2
- Value: 98 transaksi
- Percentage: 77.2% success rate
- Subtext: "Sudah diverifikasi"

**3. Menunggu Verifikasi (Amber Gradient)**
- Pembayaran pending yang perlu review
- Icon: ⏰ Clock
- Value: 23 transaksi
- Badge pulse animation
- Subtext: "Perlu ditindaklanjuti"
- CTA: Quick link "Verifikasi Sekarang"

**4. Total Pendapatan (Teal Gradient)**
- Total revenue dari pembayaran verified
- Icon: 💰 DollarSign
- Value: Rp 1.250.000.000
- Subtext: "Dari pembayaran berhasil"
- Trending up icon dengan percentage growth

#### 🔍 Filter & Search

**Search Bar:**
- Placeholder: "Cari nomor pembayaran, pesanan, atau pemesan..."
- Icon: 🔍 Search
- Real-time filtering
- Width: 70%

**Status Filter Dropdown:**
- Options:
  - Semua Status
  - Berhasil
  - Menunggu Verifikasi
  - Gagal
  - Refund
- Width: 30%

**Advanced Filters (Collapsible):**
- Rentang tanggal
- Rentang jumlah (min-max)
- Metode pembayaran
- Bank/E-wallet

#### 📋 Tabel Pembayaran (Main Table)

**Kolom Table (6 Columns):**

**1. Pembayaran (Payment Info)**
- Nama pemesan (bold)
- Nomor pembayaran (format: PAY-YYYYMMDD-XXXX)
- Tanggal pembayaran dengan icon 📅
- Width: 20%

Example:
```
Ahmad Rudi
PAY-20251126-1234
📅 26 Nov 2025, 10:30
```

**2. Pesanan (Order Reference)**
- Judul buku (truncated, max 40 char)
- Nomor pesanan terkait
- Link ke detail pesanan
- Width: 20%

Example:
```
Petualangan di Negeri Dongeng
PO-20251126-1234
```

**3. Metode (Payment Method)**
- Jenis metode pembayaran
- Nama bank/e-wallet
- Icon sesuai metode:
  - 🏦 Bank Transfer
  - 💳 E-Wallet
  - 💵 Cash
- Width: 15%

Example:
```
Transfer Bank
BCA
```

**4. Jumlah (Amount)**
- Total pembayaran (large, bold)
- Format Rupiah dengan separator
- Color: Teal untuk verified, Gray untuk pending
- Width: 15%

Example:
```
Rp 26.000.000
```

**5. Status**
- Status badge dengan icon & animated dot
- Color-coded:
  - Berhasil: Green (✅)
  - Menunggu: Amber (⏰) dengan pulse
  - Gagal: Red (❌)
  - Refund: Purple (↩️)
- Tanggal verifikasi (jika sudah verified)
- Width: 20%

Example:
```
[●] ✅ Berhasil
Verified: 26 Nov, 11:00
```

**6. Aksi (Actions)**
- Different actions based on status:

**Untuk "Menunggu Verifikasi":**
```
[✓ Verifikasi] [✕ Tolak]
```

**Untuk "Berhasil":**
```
✅ Terverifikasi
```

**Untuk "Gagal":**
```
❌ Gagal
```

- Dropdown menu:
  - Lihat Bukti Transfer
  - Cetak Receipt
  - Hubungi Penulis
  - History Pembayaran
- Width: 10%

#### 💳 Verifikasi Pembayaran Modal

**Trigger:** Klik "Verifikasi" pada pembayaran pending

**Modal Layout:**

```
┌───────────────────────────────────────────────┐
│ Verifikasi Pembayaran                         │
│ PAY-20251126-1234                            │
├───────────────────────────────────────────────┤
│                                               │
│ 📋 Informasi Pembayaran:                     │
│ - Pemesan: Ahmad Rudi                        │
│ - Pesanan: PO-20251126-1234                  │
│ - Jumlah: Rp 26.000.000                      │
│ - Metode: Transfer Bank (BCA)                │
│ - Tanggal: 26 Nov 2025, 10:30               │
│                                               │
│ 📸 Bukti Transfer:                           │
│ ┌─────────────────────────────────┐         │
│ │                                 │         │
│ │     [Image Preview]             │         │
│ │     Transfer Receipt            │         │
│ │                                 │         │
│ └─────────────────────────────────┘         │
│ [Perbesar] [Download]                       │
│                                               │
│ 🔍 Verifikasi Detail:                        │
│ ✓ Jumlah transfer sesuai                     │
│ ✓ Nama pengirim sesuai                       │
│ ✓ Bank tujuan benar                          │
│ ✓ Tanggal dalam batas waktu                  │
│                                               │
│ 📝 Catatan Verifikasi (Opsional):           │
│ ┌─────────────────────────────────┐         │
│ │                                 │         │
│ │                                 │         │
│ └─────────────────────────────────┘         │
│                                               │
│ ⚠️ Tindakan ini tidak dapat dibatalkan      │
│                                               │
│ [Batal]  [Tolak Pembayaran]  [Verifikasi]   │
└───────────────────────────────────────────────┘
```

**Validation Checklist:**
- [ ] Jumlah transfer sama dengan tagihan
- [ ] Nama pengirim sesuai dengan pemesan
- [ ] Rekening tujuan benar (milik percetakan)
- [ ] Tanggal transfer tidak lewat batas waktu

**Actions:**

1. **Verifikasi:**
   - Status berubah "Berhasil"
   - Pesanan status auto-update ke "Diterima"
   - Email konfirmasi ke penulis
   - Generate receipt/invoice

2. **Tolak:**
   - Status berubah "Gagal"
   - Require reason input (wajib)
   - Email notifikasi ke penulis dengan alasan
   - Pesanan tetap status "Tertunda"

#### 📊 Payment Analytics Dashboard

**Section: Charts & Graphs**

**1. Revenue Chart (Area Chart):**
- X-axis: 30 hari terakhir
- Y-axis: Pendapatan harian (Rupiah)
- Data: Accumulative revenue
- Color: Green gradient
- Hover: Show daily breakdown

**2. Payment Method Distribution (Donut Chart):**
- Segmen:
  - Transfer Bank: 65%
  - E-Wallet (GoPay, OVO, Dana): 30%
  - Cash: 5%
- Interactive legend
- Click segment untuk filter table

**3. Verification Timeline (Bar Chart):**
- X-axis: 7 hari terakhir
- Y-axis: Jumlah verifikasi
- Bars: Stacked (Berhasil vs Ditolak)
- Color: Green untuk approved, Red untuk rejected

#### 💼 Bulk Verification

**Feature untuk Verifikasi Multiple Payments:**

**Checkbox Selection:**
- Select multiple "Menunggu Verifikasi" items
- Max 10 selections per batch

**Bulk Action Toolbar:**
```
┌──────────────────────────────────────────┐
│ ☑️ 5 pembayaran dipilih                 │
│ Total: Rp 125.000.000                   │
│ [Verifikasi Semua] [Export]             │
└──────────────────────────────────────────┘
```

**Bulk Verification Modal:**
- Show preview all selected payments
- Single verify untuk semua (jika semua valid)
- Option untuk skip yang tidak valid

#### 📄 Receipt & Invoice Generation

**Auto-generate saat Verify:**

**Receipt Format:**
```
┌─────────────────────────────────────┐
│ PUBLISHIFY PRINTING SERVICES        │
│ Bukti Pembayaran                    │
├─────────────────────────────────────┤
│                                     │
│ No. Pembayaran: PAY-20251126-1234   │
│ Tanggal: 26 November 2025          │
│                                     │
│ Dibayar oleh: Ahmad Rudi            │
│ Untuk pesanan: PO-20251126-1234     │
│                                     │
│ Rincian:                            │
│ - Cetak 500 eks: Rp 20.000.000     │
│ - Cover: Rp 7.500.000              │
│ - Finishing: Rp 7.500.000          │
│ ───────────────────────────────    │
│ TOTAL: Rp 35.000.000               │
│                                     │
│ Metode: Transfer Bank (BCA)         │
│ Status: ✅ TERVERIFIKASI           │
│                                     │
│ Diverifikasi oleh: Admin A          │
│ Tanggal Verifikasi: 26 Nov 2025    │
│                                     │
│ Terima kasih atas pembayaran Anda   │
└─────────────────────────────────────┘
```

**Actions:**
- Download PDF
- Kirim via Email
- Print

#### 🔔 Payment Notifications

**Real-time Alerts:**

1. **Pembayaran Baru Masuk:**
   - Desktop notification
   - Sound alert
   - Badge counter update
   - Auto-add to table

2. **Reminder Pending:**
   - Daily digest email untuk admin
   - List semua pembayaran > 24 jam belum verified
   - Priority untuk jumlah besar

3. **Payment Verified:**
   - Email ke penulis dengan receipt
   - SMS notification (opsional)
   - Update pesanan status otomatis

#### 📱 Mobile Optimization

**Mobile View Adjustments:**

1. **Stats Cards:**
   - Horizontal scroll atau stacked
   - Simplified metrics

2. **Table → Card List:**
   - Setiap payment jadi card
   - Swipeable cards (swipe right: verify, left: reject)
   - Tap untuk expand detail

3. **Verification:**
   - Full-screen modal
   - Swipe up untuk view bukti transfer
   - Pinch to zoom pada image

#### 🔐 Security Features

**Audit Trail:**
- Log setiap verifikasi/penolakan
- Timestamp dan admin user ID
- Reason untuk rejection
- IP address dan device info

**Access Control:**
- Role: Admin Keuangan (full access)
- Role: Admin Produksi (read-only)
- Two-factor auth untuk bulk verification

**Fraud Detection:**
- Flag jika jumlah tidak match
- Alert untuk pembayaran duplicate
- Warning untuk bukti transfer yang sama

---

## 🔄 End-to-End Workflow

### Skenario Lengkap: Dari Order hingga Delivery

```
PENULIS:
1. Buka /dashboard/buku-terbit
2. Klik "Cetak Fisik" pada buku yang ingin dicetak
3. Isi form spesifikasi (format, kertas, cover, jumlah)
4. Lihat harga real-time
5. Isi data pengiriman
6. Submit pesanan → PO-20251126-1234 created
7. Redirect ke /dashboard/pesanan-cetak
8. Lihat status "Tertunda"

   ↓ (Penulis transfer pembayaran)

9. Upload bukti transfer
10. Status pembayaran: "Menunggu Verifikasi"

────────────────────────────────────────

PERCETAKAN:
11. Dashboard percetakan → Notifikasi pesanan baru
12. Buka /dashboard/percetakan/pembayaran
13. Lihat pembayaran pending
14. Klik "Verifikasi"
15. Cek bukti transfer
16. Approve pembayaran
17. Status pembayaran: "Berhasil"
18. Pesanan auto-update: "Diterima"

   ↓

19. Buka /dashboard/percetakan/pesanan
20. Klik pesanan PO-20251126-1234
21. Update status: "Dalam Produksi" (10%)
22. Progress update berkala (30%, 50%, 75%, 90%)

   ↓

23. Status: "Kontrol Kualitas" (95%)
24. QC passed
25. Status: "Siap Kirim" (98%)
26. Input nomor resi: JNE123456789
27. Status: "Dikirim" (99%)

────────────────────────────────────────

PENULIS:
28. Notifikasi: "Pesanan Anda dikirim"
29. Buka /dashboard/pesanan-cetak
30. Lihat status "Dikirim"
31. Klik "Lacak Paket" → Redirect ke JNE tracking
32. Paket sampai
33. Klik "Konfirmasi Diterima"
34. Status: "Selesai" (100%)

────────────────────────────────────────

PERCETAKAN:
35. Notifikasi: "Pesanan diselesaikan"
36. Dashboard update: +1 Selesai Bulan Ini
37. Revenue update: +Rp 35.000.000
38. Rating request sent to penulis
```

---

## 🎯 Value Proposition

### Untuk Penulis:
✅ **Mudah & Transparan:** Interface intuitif, harga jelas  
✅ **Customizable:** Pilihan spesifikasi lengkap  
✅ **Tracking Real-time:** Tahu progress setiap saat  
✅ **Reliable:** Tracking pengiriman terintegrasi  

### Untuk Percetakan:
✅ **Efficient Management:** Semua pesanan dalam satu dashboard  
✅ **Automated Workflow:** Status update otomatis trigger notifikasi  
✅ **Financial Control:** Verifikasi pembayaran mudah dan aman  
✅ **Analytics:** Data-driven insights untuk performa bisnis  

---

## 📌 Technical Notes

**Frontend Stack:**
- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui
- TanStack Query untuk data fetching
- Zustand untuk state management

**Backend Stack:**
- NestJS
- Prisma ORM
- PostgreSQL
- Redis untuk caching
- Socket.io untuk real-time updates

**Key Features:**
- Real-time notifications via WebSocket
- Optimistic UI updates
- Progressive image loading
- Responsive design (mobile-first)
- Dark mode support (optional)

---

## 📚 Kesimpulan

Sistem cetak fisik buku Publishify menyediakan solusi end-to-end untuk transformasi naskah digital menjadi buku fisik. Dengan interface yang user-friendly untuk penulis dan tools management yang powerful untuk percetakan, sistem ini mengotomasi workflow dari pemesanan hingga pengiriman sambil menjaga transparansi dan kontrol kualitas di setiap tahap.

**Benefit Utama:**
- Proses pemesanan hanya 5 menit
- Tracking real-time 24/7
- Pembayaran terverifikasi dalam 1 jam
- Lead time produksi rata-rata 7 hari
- Tingkat kepuasan 4.8/5.0

---

*Dokumentasi ini dibuat untuk Publishify v1.0*  
*Last Updated: 26 November 2025*
