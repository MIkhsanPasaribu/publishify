# 📱 Daftar Implementasi Fitur Mobile Publishify

Dokumen ini berisi analisis perbandingan fitur frontend (website) dengan mobile app, dan daftar fitur yang perlu diimplementasikan.

## 📊 Ringkasan Perbandingan Fitur

### Frontend (Website) vs Mobile

| Role           | Fitur Website | Fitur Mobile | Gap              |
| -------------- | ------------- | ------------ | ---------------- |
| **Penulis**    | 16 halaman    | 14 halaman   | 2 fitur          |
| **Editor**     | 5 halaman     | 12 halaman   | ✅ Lebih lengkap |
| **Admin**      | 13 halaman    | 5 halaman    | **8 fitur**      |
| **Percetakan** | 12 halaman    | 7 halaman    | **5 fitur**      |

---

## 🔴 FITUR YANG BELUM ADA DI MOBILE

### 1️⃣ Admin - **8 Fitur Kurang**

| No  | Fitur Website                                          | Status Mobile  | Prioritas |
| --- | ------------------------------------------------------ | -------------- | --------- |
| 1   | **Antrian Review** (`/admin/antrian`)                  | ❌ Belum ada   | 🔴 HIGH   |
| 2   | **Antrian Review Alt** (`/admin/antrian-review`)       | ❌ Belum ada   | 🔴 HIGH   |
| 3   | **Manajemen Buku Terbit** (`/admin/buku`)              | ❌ Belum ada   | 🟡 MEDIUM |
| 4   | **Naskah Siap Terbit** (`/admin/naskah-siap-terbit`)   | ❌ Belum ada   | 🔴 HIGH   |
| 5   | **Monitoring Review** (`/admin/monitoring`)            | ❌ Belum ada   | 🟡 MEDIUM |
| 6   | **Kelola Pesanan** (`/admin/pesanan`)                  | ❌ Belum ada   | 🟡 MEDIUM |
| 7   | **Kelola Pengiriman** (`/admin/pengiriman`)            | ❌ Belum ada   | 🟡 MEDIUM |
| 8   | **Master Kategori & Genre** (`/admin/master/kategori`) | ❌ Belum ada   | 🟢 LOW    |
| 9   | **Pengaturan Admin** (`/admin/pengaturan`)             | ❌ Belum ada   | 🟡 MEDIUM |
| 10  | **Notifikasi Admin**                                   | ❌ Placeholder | 🟡 MEDIUM |
| 11  | **Profil Admin**                                       | ❌ Placeholder | 🟡 MEDIUM |

### 2️⃣ Percetakan - **5 Fitur Kurang**

| No  | Fitur Website                                              | Status Mobile | Prioritas |
| --- | ---------------------------------------------------------- | ------------- | --------- |
| 1   | **Kelola Harga/Tarif** (`/percetakan/harga`)               | ❌ Belum ada  | 🔴 HIGH   |
| 2   | **Pesanan Baru (Konfirmasi)** (`/percetakan/pesanan/baru`) | ❌ Belum ada  | 🔴 HIGH   |
| 3   | **Pesanan Produksi** (`/percetakan/pesanan/produksi`)      | ❌ Belum ada  | 🔴 HIGH   |
| 4   | **Kelola Pengiriman** (`/percetakan/pesanan/pengiriman`)   | ❌ Belum ada  | 🔴 HIGH   |
| 5   | **Riwayat Pesanan** (`/percetakan/pesanan/riwayat`)        | ❌ Belum ada  | 🟡 MEDIUM |
| 6   | **Detail Pesanan** (`/percetakan/pesanan/[id]`)            | ❌ Belum ada  | 🔴 HIGH   |
| 7   | **Laporan Keuangan** (`/percetakan/keuangan/laporan`)      | ❌ Belum ada  | 🟡 MEDIUM |
| 8   | **Saldo & Penarikan** (`/percetakan/keuangan/saldo`)       | ❌ Belum ada  | 🟡 MEDIUM |
| 9   | **Pengaturan Percetakan** (`/percetakan/pengaturan`)       | ❌ Belum ada  | 🟡 MEDIUM |

### 3️⃣ Penulis - **2 Fitur Kurang/Partial**

| No  | Fitur Website                                            | Status Mobile            | Prioritas |
| --- | -------------------------------------------------------- | ------------------------ | --------- |
| 1   | **Pesanan Cetak Detail** (`/penulis/pesanan-cetak/[id]`) | ⚠️ Partial (dummy)       | 🟡 MEDIUM |
| 2   | **Pilih Percetakan**                                     | ⚠️ Partial (dummy data)  | 🟡 MEDIUM |
| 3   | **Pengaturan Penulis** (`/penulis/pengaturan`)           | ✅ Ada tapi perlu update | 🟢 LOW    |

### 4️⃣ Editor - **Lengkap** ✅

Semua fitur editor sudah terimplementasi di mobile dengan baik.

---

## 📝 RENCANA IMPLEMENTASI

### FASE 1: Admin Core Features (8 Halaman)

```
📁 lib/pages/admin/
├── antrian/
│   ├── admin_antrian_page.dart         # Antrian Review
│   └── admin_antrian_detail_page.dart  # Detail & Assign Editor
├── buku/
│   └── admin_buku_page.dart            # Manajemen Buku Terbit
├── naskah/
│   ├── admin_naskah_page.dart          # (Ada - perlu update)
│   └── admin_naskah_siap_terbit_page.dart # Naskah Siap Terbit
├── monitoring/
│   └── admin_monitoring_page.dart      # Monitoring Review
├── pesanan/
│   ├── admin_pesanan_page.dart         # Kelola Pesanan
│   └── admin_pengiriman_page.dart      # Kelola Pengiriman
├── master/
│   └── admin_master_kategori_page.dart # Master Kategori & Genre
├── profil/
│   └── admin_profil_page.dart          # Profil Admin
├── notifikasi/
│   └── admin_notifikasi_page.dart      # Notifikasi Admin
└── pengaturan/
    └── admin_pengaturan_page.dart      # Pengaturan Admin
```

**Service yang perlu dibuat:**

```
📁 lib/services/admin/
├── admin_service.dart        # (Ada - perlu extend)
├── admin_antrian_service.dart
├── admin_buku_service.dart
├── admin_pesanan_service.dart
├── admin_master_service.dart
└── admin_notifikasi_service.dart
```

### FASE 2: Percetakan Core Features (9 Halaman)

```
📁 lib/pages/percetakan/
├── home/
│   └── percetakan_dashboard_page.dart  # (Ada - perlu update)
├── harga/
│   └── percetakan_harga_page.dart      # Kelola Harga/Tarif
├── pesanan/
│   ├── percetakan_pesanan_page.dart    # Daftar Semua Pesanan
│   ├── percetakan_pesanan_baru_page.dart    # Pesanan Baru
│   ├── percetakan_pesanan_produksi_page.dart # Pesanan Produksi
│   ├── percetakan_pengiriman_page.dart      # Kelola Pengiriman
│   ├── percetakan_riwayat_page.dart         # Riwayat Pesanan
│   └── percetakan_pesanan_detail_page.dart  # Detail Pesanan
├── keuangan/
│   ├── percetakan_laporan_page.dart    # Laporan Keuangan
│   └── percetakan_saldo_page.dart      # Saldo & Penarikan
├── payments/
│   └── percetakan_payments_page.dart   # (Ada - perlu update dari dummy)
└── pengaturan/
    └── percetakan_pengaturan_page.dart # Pengaturan
```

**Service yang perlu dibuat:**

```
📁 lib/services/percetakan/
├── percetakan_service.dart       # (Ada - perlu extend)
├── percetakan_harga_service.dart
├── percetakan_pesanan_service.dart
├── percetakan_keuangan_service.dart
└── percetakan_pengiriman_service.dart
```

### FASE 3: Penulis Enhancement

```
📁 lib/pages/writer/
├── percetakan/
│   ├── pilih_percetakan_page.dart  # (Ada - update dari dummy)
│   └── detail_pesanan_page.dart    # Detail Pesanan Cetak
└── pengaturan/
    └── penulis_pengaturan_page.dart # (Ada via profile - perlu extend)
```

---

## 🔧 MODEL YANG PERLU DIBUAT

### Admin Models

```dart
// lib/models/admin/
- AntrianReview
- BukuTerbit
- NaskahSiapTerbit
- MonitoringReview
- PesananAdmin
- PengirimanAdmin
- KategoriMaster
- GenreMaster
```

### Percetakan Models

```dart
// lib/models/percetakan/
- TarifPercetakan        # (Perlu extend dari yang ada)
- PesananPercetakan      # (Ada - perlu extend)
- ProduksiPercetakan
- PengirimanPercetakan
- LaporanKeuangan
- SaldoPercetakan
```

---

## 📋 ROUTING YANG PERLU DITAMBAHKAN

```dart
// lib/routes/app_routes.dart

// ADMIN ROUTES (Baru)
case '/admin/antrian':
case '/admin/antrian/detail':
case '/admin/buku':
case '/admin/naskah-siap-terbit':
case '/admin/monitoring':
case '/admin/pesanan':
case '/admin/pengiriman':
case '/admin/master/kategori':
case '/admin/profil':
case '/admin/notifikasi':
case '/admin/pengaturan':

// PERCETAKAN ROUTES (Baru)
case '/percetakan/harga':
case '/percetakan/pesanan':
case '/percetakan/pesanan/baru':
case '/percetakan/pesanan/produksi':
case '/percetakan/pesanan/pengiriman':
case '/percetakan/pesanan/riwayat':
case '/percetakan/pesanan/detail':
case '/percetakan/keuangan/laporan':
case '/percetakan/keuangan/saldo':
case '/percetakan/pengaturan':

// PENULIS ROUTES (Update)
case '/penulis/pesanan-cetak/detail':
```

---

## 🎯 PRIORITAS IMPLEMENTASI

### Week 1: Admin Core

1. ✅ Admin Antrian Review
2. ✅ Admin Naskah Siap Terbit
3. ✅ Admin Monitoring Review
4. ✅ Admin Notifikasi & Profil

### Week 2: Admin Extended

5. ✅ Admin Kelola Pesanan
6. ✅ Admin Kelola Pengiriman
7. ✅ Admin Master Kategori
8. ✅ Admin Pengaturan

### Week 3: Percetakan Core

9. ✅ Percetakan Kelola Harga
10. ✅ Percetakan Pesanan Baru
11. ✅ Percetakan Pesanan Produksi
12. ✅ Percetakan Kelola Pengiriman

### Week 4: Percetakan Extended & Penulis

13. ✅ Percetakan Riwayat Pesanan
14. ✅ Percetakan Laporan Keuangan
15. ✅ Percetakan Saldo
16. ✅ Penulis Update (Pilih Percetakan, Detail Pesanan)

---

## 🧪 TESTING CHECKLIST

### Per Halaman:

- [ ] Layout responsive
- [ ] API integration working
- [ ] Error handling
- [ ] Loading states
- [ ] Empty states
- [ ] Pagination (jika ada)
- [ ] Search & Filter (jika ada)
- [ ] Actions working (CRUD)
- [ ] Navigation correct

### Final Testing:

- [ ] `flutter analyze` - no errors
- [ ] All routes accessible
- [ ] Backend connectivity
- [ ] Token authentication
- [ ] Real-time notifications

---

## 📝 CATATAN PENTING

### Konvensi Bahasa Indonesia

- **Variabel**: camelCase Bahasa Indonesia (`ambilDataNaskah`, `daftarPesanan`)
- **Class**: PascalCase Bahasa Indonesia (`HalamanAntrianAdmin`, `LayananPercetakan`)
- **String/Pesan**: WAJIB Bahasa Indonesia
- **File**: kebab-case Bahasa Indonesia (`admin-antrian-page.dart`)
- **Komentar**: Bahasa Indonesia

### Struktur Widget

```dart
/// Halaman [NamaFitur] - [Role]
/// [Deskripsi singkat fungsi halaman]
class NamaHalaman extends StatefulWidget {
  // ...
}
```

### API Pattern

```dart
/// [Deskripsi endpoint] - [HTTP Method] [Path]
static Future<Response> namaMethod() async {
  // ...
}
```

---

Dokumen ini dibuat pada: 12 Januari 2026
Terakhir diupdate: 12 Januari 2026
