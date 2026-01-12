# 📱 Panduan Aplikasi Mobile Publishify

**Dokumen ini adalah suplemen untuk [BUKU-PANDUAN-PUBLISHIFY.md](./BUKU-PANDUAN-PUBLISHIFY.md)**

**Target**: Pengguna yang mengakses Publishify via Mobile App (Android/iOS)

---

## 🎯 Pengantar Mobile App

Publishify Mobile App adalah aplikasi native yang dikembangkan dengan **Flutter** untuk memberikan pengalaman terbaik di perangkat mobile. App ini memiliki **feature parity** penuh dengan versi web, dengan tambahan fitur khusus mobile seperti push notifications, camera integration, dan offline mode.

### Download & Install

#### Android (Google Play Store)
- **Minimum OS**: Android 5.0 (Lollipop) atau lebih tinggi
- **Recommended OS**: Android 10.0 atau lebih tinggi
- **Size**: ~35 MB
- **Link**: [Play Store - Publishify](https://play.google.com/store/apps/details?id=com.publishify.app)

[screenshot: google-play-store-publishify]

#### iOS (App Store)
- **Minimum OS**: iOS 11.0 atau lebih tinggi
- **Recommended OS**: iOS 15.0 atau lebih tinggi
- **Size**: ~45 MB
- **Devices**: iPhone 6s atau lebih baru, iPad Air 2 atau lebih baru
- **Link**: [App Store - Publishify](https://apps.apple.com/id/app/publishify/id...)

[screenshot: app-store-publishify]

### Perangkat yang Diuji

✅ **Android**:
- Samsung Galaxy S20/S21/S22/S23 series
- Xiaomi Redmi Note 8/9/10/11/12 series
- Oppo Reno 5/6/7/8 series
- Vivo V20/V21/V23/V25 series
- Google Pixel 4/5/6/7 series
- Realme 8/9/10 series

✅ **iOS**:
- iPhone 8, 8 Plus, X, XR, XS, XS Max
- iPhone 11, 11 Pro, 11 Pro Max
- iPhone 12, 12 Mini, 12 Pro, 12 Pro Max
- iPhone 13, 13 Mini, 13 Pro, 13 Pro Max
- iPhone 14, 14 Plus, 14 Pro, 14 Pro Max
- iPhone 15, 15 Plus, 15 Pro, 15 Pro Max
- iPad Air (3rd gen atau lebih baru)
- iPad Pro (semua ukuran)

---

## 🔐 Registrasi & Login via Mobile

### Splash Screen

Saat pertama kali membuka app, Anda akan melihat **Splash Screen** dengan logo Publishify dan loading indicator.

[screenshot-mobile: splash-screen-loading]

**Durasi**: 2-3 detik

### Halaman Welcome

Setelah splash screen, akan muncul halaman welcome dengan opsi:
- **Masuk** → Untuk pengguna yang sudah terdaftar
- **Daftar Sekarang** → Untuk pengguna baru

[screenshot-mobile: welcome-screen-buttons]

### Registrasi Mobile

#### Step 1: Tap "Daftar Sekarang"

[screenshot-mobile: tap-daftar-sekarang]

#### Step 2: Isi Form Registrasi

Form registrasi mobile menggunakan **single-column scrolling layout** dengan field:

1. **Email**
   - Input type: Email keyboard
   - Auto-suggestion domain (@gmail.com, @yahoo.com)
   - Validasi real-time
   
   [screenshot-mobile: input-email-mobile]

2. **Password**
   - Input type: Secure text
   - Toggle visibility dengan icon mata
   - Strength indicator (Weak/Medium/Strong)
   
   [screenshot-mobile: input-password-toggle]

3. **Konfirmasi Password**
   - Auto-check match dengan password
   - Visual feedback ✅/❌
   
   [screenshot-mobile: confirm-password-match]

4. **Nama Depan & Belakang**
   - Auto-capitalize first letter
   - Letter-only keyboard suggestion
   
   [screenshot-mobile: input-nama-mobile]

5. **Nomor Telepon**
   - Numeric keyboard
   - Format otomatis (08xx-xxxx-xxxx)
   - Validasi format Indonesia
   
   [screenshot-mobile: input-telepon-format]

6. **Pilih Peran**
   - Tap untuk buka **Bottom Sheet** dengan radio options
   - 3 pilihan: Penulis, Editor, Percetakan
   - Deskripsi singkat setiap peran
   
   [screenshot-mobile: bottom-sheet-pilih-peran]

7. **Terms & Conditions**
   - Switch toggle (ON/OFF)
   - Tap label untuk baca Terms dalam bottom sheet
   
   [screenshot-mobile: terms-toggle-mobile]

#### Step 3: Submit Registrasi

Tap tombol **"Daftar"** di bottom:

[screenshot-mobile: tombol-daftar-mobile]

**Loading State:**
- Full-screen overlay dengan spinner
- Progress text: "Mendaftarkan akun..."
- Tidak bisa di-dismiss

[screenshot-mobile: loading-registrasi-fullscreen]

**Success:**
- Navigate ke Success Page
- Ilustrasi sukses dengan animasi
- Pesan: "🎉 Akun Berhasil Dibuat!"
- Tombol: "Cek Email Sekarang" (buka email app) atau "Nanti Saja" (ke login)

[screenshot-mobile: success-page-registrasi]

#### Troubleshooting Mobile

**Error: "Email sudah terdaftar"**
- SnackBar muncul dari bottom
- Warna merah dengan icon ❌
- Durasi: 3 detik
- Action: "Coba email lain"

[screenshot-mobile: snackbar-error-email]

**Error: Koneksi terputus**
- Alert Dialog dengan icon ⚠️
- Pesan: "Koneksi internet terputus"
- Button: "Retry" dan "Cancel"
- Auto-retry saat koneksi kembali

[screenshot-mobile: dialog-koneksi-terputus]

**Error: Field tidak valid**
- Shake animation pada field yang error
- Border merah pada field
- Helper text error di bawah field
- Auto-scroll ke field pertama yang error

[screenshot-mobile: field-error-shake-animation]

### Login Mobile

#### Step 1: Tap "Masuk" di Welcome Screen

[screenshot-mobile: tap-masuk-welcome]

#### Step 2: Isi Credentials

**Email:**
- Email keyboard dengan "@" shortcut
- Auto-complete dari saved accounts (jika ada)

[screenshot-mobile: login-email-autocomplete]

**Password:**
- Secure text dengan toggle visibility
- "Lupa Password?" link di bawah field

[screenshot-mobile: login-password-field]

**Remember Me:**
- Checkbox "Ingat Saya"
- Jika ON: Auto-login di session berikutnya
- Jika OFF: Harus login setiap kali buka app

[screenshot-mobile: checkbox-remember-me]

#### Step 3: Login

Tap tombol **"Masuk"**:

[screenshot-mobile: tombol-masuk-loading]

**Loading State:**
- Button berubah jadi loading spinner
- Text: "Memverifikasi..."
- Durasi: 1-2 detik

**Success:**
- SnackBar hijau: "✅ Login berhasil!"
- Navigate ke Dashboard sesuai role
- Animasi transition (fade + slide)

[screenshot-mobile: login-success-snackbar]
[screenshot-mobile: transition-to-dashboard]

#### Login dengan Biometrik (Opsional)

Jika device support fingerprint/Face ID:

1. **Setup Biometrik** (first time login)
   - Dialog muncul: "Aktifkan Login Biometrik?"
   - Button: "Ya, Aktifkan" atau "Nanti Saja"
   
   [screenshot-mobile: dialog-setup-biometrik]

2. **Login dengan Biometrik** (subsequent logins)
   - Icon fingerprint/Face ID di halaman login
   - Tap icon → Prompt biometrik muncul
   - Scan fingerprint/face → Auto-login
   
   [screenshot-mobile: login-biometrik-prompt]

**Supported Devices:**
- Android: Fingerprint (API 23+), Face Unlock (API 29+)
- iOS: Touch ID, Face ID

#### Login dengan Google OAuth

**Android:**

1. Tap tombol **"Masuk dengan Google"**
2. Bottom Sheet Google Account Picker muncul
3. Pilih akun Google
4. Auto-login jika akun sudah terdaftar
5. Jika belum terdaftar, redirect ke form registrasi (data terisi otomatis)

[screenshot-mobile: google-oauth-android]

**iOS:**

1. Tap tombol **"Sign in with Apple"** atau **"Continue with Google"**
2. Native authentication dialog muncul
3. Authorize dengan Face ID/Touch ID
4. Auto-login atau redirect registrasi

[screenshot-mobile: apple-signin-ios]

#### Lupa Password (Mobile)

1. Tap **"Lupa Password?"** di halaman login
2. Navigate ke Forgot Password page
3. Input email
4. Tap **"Kirim Link Reset"**
5. Check email untuk reset link
6. Tap link → Buka app → Form reset password
7. Input password baru (2x)
8. Submit → Auto-login

[screenshot-mobile: forgot-password-flow]

**Deep Link Handling:**
- Reset password link membuka app (jika installed)
- Jika app tidak installed, buka web browser

---

## 📊 Dashboard Mobile

Setiap role memiliki dashboard yang disesuaikan untuk mobile experience.

### Navigasi Mobile

**Bottom Navigation Bar** (5 tabs):

| Tab | Icon | Fungsi |
|-----|------|--------|
| **Beranda** | 🏠 | Dashboard utama |
| **Naskah** | 📄 | Kelola naskah (Penulis/Editor) |
| **Notifikasi** | 🔔 | Notifikasi real-time |
| **Statistik** | 📊 | Laporan & analytics |
| **Profil** | 👤 | Settings & profile |

[screenshot-mobile: bottom-navigation-bar]

**Swipe Gestures:**
- Swipe left/right: Pindah tab
- Swipe down: Refresh page
- Swipe up: Scroll to bottom
- Long-press: Contextual menu

### Dashboard Penulis (Mobile)

[screenshot-mobile: dashboard-penulis-mobile]

**Header:**
- Avatar & nama penulis
- Level badge (if any)
- Settings icon (top-right)

**Quick Stats Cards** (Horizontal Scroll):
1. Total Naskah
2. Dalam Review
3. Disetujui
4. Diterbitkan

[screenshot-mobile: stats-cards-horizontal-scroll]

**Aksi Cepat:**
- ➕ **Upload Naskah Baru** (Floating Action Button)
- 📋 **Naskah Saya** (List view)
- 🖨️ **Pesanan Cetak** (List view)
- 📈 **Statistik** (Charts)

[screenshot-mobile: fab-upload-naskah]

**Daftar Naskah:**
- Card view dengan thumbnail cover
- Status badge (Draft, Review, Approved, Published)
- Last updated timestamp
- Swipe actions: Edit, Delete, View

[screenshot-mobile: naskah-list-card-view]

### Dashboard Editor (Mobile)

[screenshot-mobile: dashboard-editor-mobile]

**Header:**
- Avatar & nama editor
- Rating bintang (avg)
- Notifikasi badge

**Quick Stats:**
1. Antrian Review (pending)
2. Sedang Dikerjakan (in-progress)
3. Selesai (completed)
4. Total Review (all-time)

[screenshot-mobile: editor-stats-mobile]

**Antrian Review:**
- List dengan pull-to-refresh
- Filter: Semua, Ditugaskan, Self-Assign
- Sort: Terbaru, Deadline, Prioritas
- Tap naskah → Detail Review

[screenshot-mobile: antrian-review-list-mobile]

**Review Interface:**
- Scrollable naskah content
- Floating comment button
- Bottom action bar: Approve, Revisi, Reject
- Comment threads dengan replies

[screenshot-mobile: review-interface-mobile]

### Dashboard Percetakan (Mobile)

[screenshot-mobile: dashboard-percetakan-mobile]

**Header:**
- Logo percetakan
- Nama percetakan
- Status: Online/Offline toggle

**Quick Stats:**
1. Pesanan Baru
2. Dalam Produksi
3. Siap Kirim
4. Selesai

[screenshot-mobile: percetakan-stats-mobile]

**Daftar Pesanan:**
- Timeline view (vertical)
- Status badge dengan warna
- Detail: Judul buku, Qty, Spek, Deadline
- Tap → Detail pesanan

[screenshot-mobile: pesanan-list-timeline]

**Update Status:**
- Tap pesanan → Bottom Sheet Actions
- Pilih status baru (Dropdown)
- Upload foto progress (Camera/Gallery)
- Tambah catatan
- Submit update

[screenshot-mobile: update-status-bottom-sheet]

### Dashboard Admin (Mobile)

[screenshot-mobile: dashboard-admin-mobile]

**Header:**
- Admin badge
- Total users counter
- Quick search icon

**Overview Cards:**
1. Total Pengguna (breakdown by role)
2. Total Naskah (by status)
3. Total Pesanan (by status)
4. Revenue (MTD/YTD)

[screenshot-mobile: admin-overview-cards]

**Management Sections:**
- 👥 **Users** → User list dengan filter role
- 📄 **Naskah** → All manuscripts
- 🖨️ **Pesanan** → All orders
- 💳 **Pembayaran** → Payment logs
- ⚙️ **Settings** → App configuration

[screenshot-mobile: admin-management-sections]

---

## 📝 Manajemen Naskah (Mobile)

### Upload Naskah Baru

#### Step 1: Tap FAB "+" di Dashboard

[screenshot-mobile: tap-fab-upload]

#### Step 2: Pilih Sumber File

Bottom Sheet muncul dengan opsi:

1. **📷 Ambil Foto** → Camera mode untuk foto naskah fisik
2. **🖼️ Galeri** → Pilih dari photo gallery
3. **📁 File Manager** → Browse file .doc/.docx
4. **☁️ Cloud Storage** → Import dari Google Drive/iCloud

[screenshot-mobile: bottom-sheet-pilih-sumber]

#### Step 3: Upload & Process

**Jika dari Camera/Galeri:**
- OCR processing untuk convert gambar ke text
- Loading bar dengan progress %
- Preview hasil OCR → Edit jika perlu

[screenshot-mobile: ocr-processing-progress]

**Jika dari File Manager:**
- Direct upload .doc/.docx
- Extracting metadata
- Preview file

[screenshot-mobile: upload-file-progress]

#### Step 4: Isi Metadata Naskah

Form metadata dengan sections:

**Informasi Dasar:**
- Judul Naskah*
- Sub-judul (optional)
- Sinopsis* (min. 50 karakter)
- Bahasa Tulis (dropdown)

[screenshot-mobile: form-metadata-info-dasar]

**Kategorisasi:**
- Kategori* (dropdown/search)
- Genre* (multi-select chips)
- Tags (optional, comma-separated)

[screenshot-mobile: form-metadata-kategori]

**Detail Tambahan:**
- Jumlah Halaman (auto-detected)
- Jumlah Kata (auto-counted)
- Target Pembaca (dropdown)
- Rating Konten (dropdown)

[screenshot-mobile: form-metadata-detail]

**Upload Cover:**
- Tap area upload cover
- Pilih: Camera, Galeri, atau Template
- Crop & resize tool
- Preview final

[screenshot-mobile: upload-cover-crop-tool]

#### Step 5: Save Draft atau Submit Review

Bottom bar dengan 2 tombol:

1. **Simpan Draft** → Save tanpa submit review
2. **Kirim ke Review** → Submit untuk review editor

[screenshot-mobile: bottom-bar-save-submit]

**Konfirmasi Submit:**
- Dialog: "Yakin kirim ke review?"
- Note: "Naskah tidak bisa diedit setelah dikirim"
- Button: "Ya, Kirim" atau "Batal"

[screenshot-mobile: dialog-konfirmasi-submit]

### Edit Naskah (Mobile)

#### Buka Naskah untuk Edit

**Dari Dashboard:**
1. Tap naskah dari list
2. Tap icon edit (✏️) di top-right

**Dari Detail Naskah:**
1. Scroll ke bottom
2. Tap button **"Edit Naskah"**

[screenshot-mobile: detail-naskah-edit-button]

#### Editor Naskah Mobile

**Toolbar** (Sticky top):
- **B** = Bold
- **I** = Italic
- **U** = Underline
- **T** = Heading
- **#** = Font size
- **≡** = Alignment
- **🔗** = Insert link
- **📷** = Insert image

[screenshot-mobile: editor-toolbar-mobile]

**Content Area:**
- Rich text editor
- Auto-save every 30 seconds
- Word count di bottom

[screenshot-mobile: rich-text-editor-mobile]

**Bottom Actions:**
- **Discard** → Cancel changes (dengan konfirmasi)
- **Save** → Save changes

[screenshot-mobile: editor-bottom-actions]

### Lihat Detail Naskah

Tap naskah dari list → Detail page dengan sections:

**Header:**
- Cover buku (large)
- Judul & sub-judul
- Status badge
- Share icon (top-right)

[screenshot-mobile: detail-header-cover]

**Info Tab:**
- Sinopsis
- Kategori & Genre (chips)
- Bahasa tulis
- Jumlah halaman & kata
- Tanggal dibuat & update
- Status timeline

[screenshot-mobile: detail-info-tab]

**Review Tab** (jika ada):
- List review comments
- Rating dari editor
- Rekomendasi: Approve/Revisi/Reject
- Tanggal review

[screenshot-mobile: detail-review-tab]

**Files Tab:**
- File naskah (download button)
- Cover image (view full-size)
- Revisions history (versions)

[screenshot-mobile: detail-files-tab]

**Actions Tab:**
- Edit Metadata
- Upload Revisi
- Delete Naskah (dengan konfirmasi 2-step)
- Cetak Buku (jika approved)

[screenshot-mobile: detail-actions-tab]

### Hapus Naskah

**2-Step Confirmation** untuk mencegah accidental delete:

#### Step 1: Tap Delete dari Actions

Dialog pertama muncul:
```
⚠️ Hapus Naskah?

Naskah: [Judul Naskah]
Status: [Status]

[Batal]  [Ya, Hapus]
```

[screenshot-mobile: dialog-delete-step1]

#### Step 2: Konfirmasi dengan Password

Jika tap "Ya, Hapus", dialog kedua muncul:
```
🔐 Konfirmasi Penghapusan

Ketik "HAPUS" untuk konfirmasi:
[____________]

[Batal]  [Hapus Permanen]
```

[screenshot-mobile: dialog-delete-step2-password]

**Setelah Delete:**
- SnackBar: "✅ Naskah berhasil dihapus"
- Navigate back ke dashboard
- Naskah hilang dari list

---

## 🔔 Notifikasi (Mobile)

### Push Notifications

Publishify Mobile App menggunakan **Firebase Cloud Messaging (FCM)** untuk push notifications real-time.

#### Setup Notifikasi (First Time)

Saat pertama kali login, dialog permission muncul:

**Android:**
```
🔔 Izinkan Notifikasi?

Dapatkan update real-time tentang:
• Status naskah berubah
• Review baru dari editor
• Pesanan cetak update
• Pesan dari admin

[Tolak]  [Izinkan]
```

[screenshot-mobile: permission-dialog-notif-android]

**iOS:**
```
"Publishify" Would Like to Send You Notifications

Notifications may include alerts, sounds, and icon badges.

[Don't Allow]  [Allow]
```

[screenshot-mobile: permission-dialog-notif-ios]

#### Jenis Notifikasi

| Trigger | Judul Notif | Body Notif | Action |
|---------|-------------|------------|--------|
| Naskah disubmit | **Naskah Dikirim** | "Naskah '[Judul]' berhasil dikirim ke review" | Tap → Detail naskah |
| Naskah approved | **Naskah Disetujui! 🎉** | "Naskah '[Judul]' telah disetujui editor" | Tap → Detail naskah |
| Review baru | **Review Masuk** | "Editor '[Nama]' memberikan feedback" | Tap → Review detail |
| Perlu revisi | **Revisi Diperlukan** | "Naskah '[Judul]' memerlukan revisi" | Tap → Feedback list |
| Pesanan confirmed | **Pesanan Dikonfirmasi** | "Pesanan #[ID] diterima percetakan" | Tap → Order tracking |
| Produksi dimulai | **Produksi Dimulai 🖨️** | "Buku '[Judul]' mulai dicetak" | Tap → Order detail |
| Pengiriman | **Buku Dikirim 📦** | "Pesanan #[ID] dalam perjalanan" | Tap → Tracking |
| Buku diterima | **Buku Sampai! ✅** | "Pesanan #[ID] telah diterima" | Tap → Confirmation |

[screenshot-mobile: notification-list-inbox]

#### Notification Center

Tap icon 🔔 di bottom navigation → Notification Center:

**Filter Tabs:**
- **Semua** (All)
- **Belum Dibaca** (Unread) - badge counter
- **Naskah** (Manuscripts)
- **Pesanan** (Orders)
- **Sistem** (System)

[screenshot-mobile: notification-center-tabs]

**Notification Item:**
- Icon sesuai jenis
- Judul (bold jika unread)
- Body text (truncated)
- Timestamp (relative: "2 jam lalu")
- Swipe actions: Mark Read/Unread, Delete

[screenshot-mobile: notification-item-swipe]

**Bulk Actions:**
- Long-press untuk multi-select
- Bottom bar muncul dengan: Mark All Read, Delete Selected

[screenshot-mobile: notification-bulk-actions]

#### Notification Settings

**Akses:** Profil Tab → Settings → Notifikasi

**Toggle Options:**

| Setting | Default | Deskripsi |
|---------|---------|-----------|
| Push Notifications | ON | Master toggle |
| Status Naskah | ON | Notif perubahan status naskah |
| Review & Feedback | ON | Notif review baru |
| Pesanan Cetak | ON | Notif update pesanan |
| Pesan Sistem | ON | Notif dari admin |
| Sound | ON | Play sound saat notif |
| Vibrate | ON | Vibration |
| LED Light | ON | LED notification (Android) |
| Badge Count | ON | Show unread count di icon app |

[screenshot-mobile: notification-settings-toggles]

**Quiet Hours:**
- Set jam tenang (misal: 22:00 - 07:00)
- Notif tetap masuk tapi silent

[screenshot-mobile: quiet-hours-time-picker]

---

## 📷 Fitur Khusus Mobile

### Camera Integration

#### Upload Naskah via Camera

1. Tap FAB "+" → Pilih **"Ambil Foto"**
2. Camera mode terbuka dengan overlay guide
3. Posisikan halaman naskah dalam frame
4. Tap capture button atau volume button
5. Preview hasil foto → Crop, Rotate, Adjust
6. Tap "OK" → OCR processing
7. Text result → Edit jika perlu
8. Lanjut ke form metadata

[screenshot-mobile: camera-mode-overlay-guide]
[screenshot-mobile: photo-crop-adjust-tools]
[screenshot-mobile: ocr-result-editable]

**Tips Foto Naskah yang Baik:**
- ✅ Pencahayaan cukup (natural light lebih baik)
- ✅ Halaman rata (tidak kusut)
- ✅ Kontras tinggi (kertas putih, tinta hitam)
- ✅ Fokus jelas
- ❌ Hindari bayangan
- ❌ Hindari refleksi lampu

#### Upload Cover via Camera

1. Dari form metadata, tap area upload cover
2. Pilih **"Ambil Foto"**
3. Camera mode dengan grid 3x3
4. Capture cover buku
5. Crop square/rectangle sesuai aspect ratio
6. Filter options (Optional): None, Vivid, Vintage, B&W
7. Save & use as cover

[screenshot-mobile: camera-cover-grid]
[screenshot-mobile: cover-crop-square]
[screenshot-mobile: cover-filters-preview]

#### Multi-Page Scan

Untuk naskah banyak halaman:

1. Setelah capture halaman 1, tap **"+ Tambah Halaman"**
2. Capture halaman 2, 3, dst.
3. Setiap halaman di-OCR
4. Preview all pages (scrollable list)
5. Reorder pages (drag & drop)
6. Delete pages (swipe)
7. Combine all → Single document

[screenshot-mobile: multi-page-scan-list]
[screenshot-mobile: reorder-pages-drag-drop]

**Batasan:**
- Max 50 halaman per session
- Ukuran total < 100 MB
- Processing time ~2-5 detik per halaman

### Offline Mode

Publishify Mobile App mendukung **limited offline functionality**:

#### Fitur yang Berfungsi Offline:

✅ **View Content:**
- Lihat naskah yang sudah di-download
- Lihat detail pesanan (cached)
- Lihat notifikasi (cached)
- Lihat profil sendiri

✅ **Draft Creation:**
- Buat draft naskah baru
- Edit draft yang belum di-submit
- Upload file (queued, sent saat online)

✅ **Read Mode:**
- Baca naskah offline
- Scroll, zoom, search in document

[screenshot-mobile: offline-mode-banner]

#### Fitur yang Memerlukan Internet:

❌ **Sync & Upload:**
- Submit naskah ke review
- Upload file besar
- Download naskah baru
- Real-time sync

❌ **Communication:**
- Kirim/terima notifikasi push
- Chat dengan editor/admin
- Update status pesanan

#### Offline Sync Queue

Saat offline, actions yang memerlukan internet akan masuk **Sync Queue**:

**Queue Manager:**
- Accessible dari: Settings → Sync Queue
- List pending actions dengan status
- Option: Retry, Cancel, Clear All
- Auto-retry saat online kembali

[screenshot-mobile: sync-queue-manager]

**Auto-Sync saat Online:**
- Banner muncul: "⚡ Syncing..."
- Progress bar dengan item count
- Selesai: "✅ [X] items synced"

[screenshot-mobile: auto-sync-banner]

#### Download for Offline

**Download Naskah:**
1. Buka detail naskah
2. Tap icon download (⬇️) di top-right
3. Confirm download
4. Progress notification
5. Selesai: Icon berubah jadi ✅

[screenshot-mobile: download-naskah-offline]

**Manage Downloads:**
- Settings → Downloads & Storage
- List naskah yang di-download
- Total storage used
- Clear individual atau Clear All

[screenshot-mobile: manage-downloads-storage]

### Biometric Authentication

#### Setup Biometric

1. Login pertama kali dengan email/password
2. Dialog muncul: "Aktifkan Login Biometrik?"
3. Tap "Ya, Aktifkan"
4. Verify biometric (fingerprint/Face ID)
5. Setup selesai

[screenshot-mobile: setup-biometric-success]

#### Login dengan Biometric

1. Buka app (jika sudah setup)
2. Screen lock dengan icon fingerprint/Face ID
3. Tap icon atau auto-prompt
4. Scan fingerprint/Face → Auto-login

[screenshot-mobile: biometric-lock-screen]

**Fallback:**
- Jika biometric gagal 3x, fallback ke password
- Option "Use Password Instead"

#### Disable Biometric

1. Settings → Security → Biometric Login
2. Toggle OFF
3. Confirm dengan password
4. Biometric disabled, kembali ke password login

[screenshot-mobile: disable-biometric-settings]

### Share & Export

#### Share Naskah

Dari detail naskah:

1. Tap icon share (↗️) di top-right
2. Bottom Sheet share options:
   - **📱 Share Link** → Copy link ke clipboard
   - **✉️ Email** → Share via email
   - **💬 WhatsApp** → Share via WA
   - **📄 Export PDF** → Generate & share PDF
   - **⬇️ Download** → Download file original

[screenshot-mobile: share-bottom-sheet]

3. Pilih method → Native share sheet muncul
4. Pilih app tujuan → Share

[screenshot-mobile: native-share-sheet]

#### Export ke PDF

1. Dari share options, pilih **"Export PDF"**
2. Processing: Convert DOCX → PDF
3. Progress bar dengan %
4. Selesai: Preview PDF
5. Options:
   - **Save to Device** → Save ke Downloads
   - **Share** → Share via apps
   - **Print** → Print via mobile printer

[screenshot-mobile: export-pdf-processing]
[screenshot-mobile: pdf-preview-options]

### Gestures & Shortcuts

#### Swipe Gestures

| Gesture | Fungsi | Screen |
|---------|--------|--------|
| **Swipe Right** | Back/Previous | Global |
| **Swipe Left** | Forward/Next (jika ada) | Global |
| **Swipe Down** | Refresh/Pull-to-Refresh | Lists |
| **Swipe Left on Item** | Delete/Archive action | Lists |
| **Swipe Right on Item** | Mark Read/Complete | Lists |
| **Pinch Out** | Zoom In | PDF/Image viewer |
| **Pinch In** | Zoom Out | PDF/Image viewer |
| **Double Tap** | Zoom Toggle | PDF/Image viewer |

[screenshot-mobile: gestures-visual-guide]

#### Long-Press Actions

| Element | Long-Press Action |
|---------|------------------|
| **Naskah Item** | Contextual menu: Edit, Delete, Share, Download |
| **Notification Item** | Multi-select mode |
| **Image** | Save image, Share, View full-size |
| **Link** | Preview link, Copy link, Open in browser |
| **Text** | Text selection, Copy, Paste |

[screenshot-mobile: long-press-contextual-menu]

#### Shake to Report Bug

**Android & iOS:**
1. Shake device (jika dalam app)
2. Dialog muncul: "Laporkan Bug?"
3. Tap "Ya"
4. Form report bug pre-filled dengan:
   - Device info
   - OS version
   - App version
   - Screenshot current screen
5. Tambah deskripsi bug
6. Submit

[screenshot-mobile: shake-report-bug-dialog]

### Dark Mode

#### Enable Dark Mode

**Option 1: System Default**
- Settings → Appearance → Theme: **System Default**
- App mengikuti setting device

**Option 2: Manual**
- Settings → Appearance → Theme: **Dark** atau **Light**
- Override system setting

[screenshot-mobile: theme-settings-options]

**Dark Mode Preview:**

[screenshot-mobile: dashboard-light-mode]
[screenshot-mobile: dashboard-dark-mode]

**Auto Dark Mode:**
- Settings → Auto Dark Mode → ON
- Set time range (misal: 18:00 - 06:00)
- App otomatis switch ke dark mode di jam tersebut

[screenshot-mobile: auto-dark-mode-time]

---

## 🚀 Performance & Optimization

### Data Usage

#### Monitor Data Usage

Settings → Data Usage:

**Statistics:**
- Total data used (all-time)
- This month (reset setiap bulan)
- Breakdown by category:
  - Upload files: XX MB
  - Download files: XX MB
  - Sync & updates: XX MB
  - Images & media: XX MB

[screenshot-mobile: data-usage-stats]

#### Data Saver Mode

Toggle ON di Settings → Data Saver:

**Effects:**
- ✅ Reduce image quality (compressed)
- ✅ Disable auto-download images
- ✅ Disable video autoplay
- ✅ Sync only on WiFi
- ❌ Lower quality preview

[screenshot-mobile: data-saver-toggle]

**Estimated Savings:**
- Normal mode: ~50-100 MB/day
- Data Saver mode: ~10-20 MB/day

### Cache Management

Settings → Storage & Cache:

**Cache Size:**
- Images: XX MB
- Documents: XX MB
- Temporary files: XX MB
- **Total: XX MB**

[screenshot-mobile: cache-size-breakdown]

**Actions:**
- **Clear Image Cache** → Clear all cached images
- **Clear Document Cache** → Clear preview cache
- **Clear All Cache** → Full cache clear (confirm required)

**Auto Clear:**
- Toggle: Auto-clear cache after 7/14/30 days
- Helps save storage

[screenshot-mobile: auto-clear-cache-options]

### Battery Optimization

#### Battery Saver

Settings → Battery:

**Battery Saver Mode:**
- Toggle ON/OFF
- Effects:
  - Reduce background sync frequency
  - Disable push notifications (only fetch on app open)
  - Reduce animation
  - Lower screen brightness (optional)

[screenshot-mobile: battery-saver-mode]

**Sync Frequency:**
- Real-time (high battery usage)
- Every 15 minutes (balanced)
- Manual only (low battery usage)

#### Background Restrictions

**Android:**
- Settings → Battery → Background Restriction
- Options:
  - **Unrestricted** → Full background activity
  - **Optimized** → Balanced (recommended)
  - **Restricted** → Minimal background

**iOS:**
- Automatic background refresh management
- Settings → Background App Refresh → ON/OFF

[screenshot-mobile: background-restrictions-android]

---

## 🆘 Troubleshooting Mobile-Specific

### App Crashes

**Symptom:** App tiba-tiba close sendiri

**Solutions:**

1. **Force Close & Restart:**
   - Android: Settings → Apps → Publishify → Force Stop
   - iOS: Swipe up from app switcher → Swipe away Publishify

2. **Clear Cache:**
   - Settings (in-app) → Storage → Clear Cache

3. **Reinstall App:**
   - Uninstall → Restart device → Install lagi
   - Data tersimpan di cloud, tidak hilang

4. **Update App:**
   - Check Play Store/App Store untuk update
   - Install latest version

5. **Check Storage:**
   - Pastikan storage device tidak penuh (min. 1 GB free)

[screenshot-mobile: troubleshoot-crash]

### Login Issues

**Symptom:** Tidak bisa login, loading terus

**Solutions:**

1. **Check Internet:**
   - Test buka website di browser
   - Switch WiFi ↔ Mobile Data

2. **Check Credentials:**
   - Pastikan email & password benar
   - Try "Forgot Password"

3. **Clear App Data:**
   - Android: Settings → Apps → Publishify → Clear Data
   - iOS: Uninstall & reinstall
   - ⚠️ Warning: Offline data akan hilang

4. **Disable VPN:**
   - Jika pakai VPN, coba disable

[screenshot-mobile: troubleshoot-login]

### Push Notification Not Working

**Symptom:** Tidak terima notifikasi push

**Solutions:**

1. **Check Permission:**
   - Device Settings → Apps → Publishify → Permissions → Notifications → ON

2. **Check In-App Settings:**
   - Publishify Settings → Notifikasi → Master toggle ON

3. **Check Battery Optimization:**
   - Android: Disable battery optimization untuk Publishify
   - iOS: Background App Refresh → ON

4. **Re-login:**
   - Logout → Login lagi
   - FCM token akan refresh

5. **Reinstall:**
   - Last resort: Uninstall & install lagi

[screenshot-mobile: troubleshoot-notifications]

### Upload Failed

**Symptom:** Upload file gagal terus

**Solutions:**

1. **Check File Size:**
   - Max 10 MB
   - Compress file jika terlalu besar

2. **Check File Format:**
   - Only .doc, .docx supported
   - Convert jika format lain

3. **Check Connection:**
   - Upload requires stable internet
   - Prefer WiFi untuk file besar

4. **Retry with WiFi:**
   - Switch ke WiFi
   - Retry upload

5. **Clear Upload Queue:**
   - Settings → Sync Queue → Clear Failed
   - Try upload ulang

[screenshot-mobile: troubleshoot-upload]

### Slow Performance

**Symptom:** App lemot, lag, loading lama

**Solutions:**

1. **Close Background Apps:**
   - Free up RAM
   - Android: Clear recent apps
   - iOS: Force close unused apps

2. **Clear Cache:**
   - Settings → Storage → Clear Cache

3. **Update App:**
   - Ensure latest version installed

4. **Restart Device:**
   - Full device restart

5. **Check Device Storage:**
   - Free up storage (min. 1 GB)
   - Delete unused files/apps

6. **Lower Quality:**
   - Settings → Data Saver ON
   - Reduce image quality

[screenshot-mobile: troubleshoot-performance]

### Biometric Not Working

**Symptom:** Fingerprint/Face ID tidak recognized

**Solutions:**

1. **Re-register Biometric:**
   - Device Settings → Security → Biometric
   - Delete & add fingerprint/face lagi

2. **Clean Sensor:**
   - Bersihkan fingerprint sensor (Android)
   - Bersihkan kamera depan (iOS Face ID)

3. **Fallback to Password:**
   - Use "Use Password Instead" option

4. **Disable & Re-enable:**
   - Publishify Settings → Security → Biometric Login OFF
   - Login dengan password
   - Enable lagi

[screenshot-mobile: troubleshoot-biometric]

---

## 📞 Dukungan & Bantuan

### In-App Help

**Akses:** Profile Tab → Help & Support

**Sections:**
1. **FAQ** → Pertanyaan umum
2. **Tutorial** → Video guides
3. **Contact Support** → Form kontak
4. **Report Bug** → Report issue

[screenshot-mobile: help-support-menu]

### Contact Support

**Via App:**
1. Profile → Help & Support → Contact Support
2. Pilih kategori: Technical, Account, Payment, Other
3. Isi form dengan detail masalah
4. Attach screenshot (optional)
5. Submit

[screenshot-mobile: contact-support-form]

**Response Time:**
- Normal: 1-2 hari kerja
- Urgent: < 24 jam

**Via Email:**
- Email: support@publishify.me
- Subject: [Mobile App] - [Your Issue]

**Via WhatsApp:**
- Number: +62 812-3456-7890
- Jam operasional: 09:00 - 17:00 WIB (Senin-Jumat)

---

## 🔄 Update & Changelog

### Auto-Update

**Android (Play Store):**
- Settings (device) → Play Store → Auto-update apps → ON
- App akan auto-update saat ada versi baru

**iOS (App Store):**
- Settings (device) → App Store → App Updates → ON
- Auto-download updates

### Check for Updates

**Manual Check:**
1. Open Play Store/App Store
2. Search "Publishify"
3. Jika ada update, tombol "Update" akan muncul

**In-App Check:**
- Settings → About → Check for Updates
- Tap → Redirect ke Store jika ada update

[screenshot-mobile: check-updates-in-app]

### Changelog

**View Changelog:**
- Settings → About → Version [X.X.X]
- Tap version number → Changelog modal muncul

[screenshot-mobile: changelog-modal]

**Latest Version:** v1.5.0 (January 2025)

**Changelog Example:**
```
📱 Version 1.5.0 - January 2025

✨ New Features:
- Dark mode support
- Biometric authentication
- Offline mode for read
- Multi-page scan

🐛 Bug Fixes:
- Fixed upload crash on Android 13
- Fixed notification delay
- Improved PDF preview performance

🔧 Improvements:
- Faster app startup (30% faster)
- Reduced data usage
- Better error messages
```

---

## 📊 Perbandingan Web vs Mobile

### Feature Parity

| Fitur | Web | Mobile | Notes |
|-------|-----|--------|-------|
| **Registrasi** | ✅ | ✅ | UI berbeda, fungsi sama |
| **Login** | ✅ | ✅ | Mobile + biometric |
| **Upload Naskah** | ✅ | ✅ | Mobile + camera scan |
| **Edit Naskah** | ✅ | ✅ | Web lebih luas screen |
| **Review Naskah** | ✅ | ✅ | Mobile + swipe gestures |
| **Cetak Buku** | ✅ | ✅ | Form sama |
| **Tracking Pesanan** | ✅ | ✅ | Mobile + push notif |
| **Pembayaran** | ✅ | ✅ | Web + mobile banking |
| **Notifikasi** | ✅ | ✅ | Mobile lebih real-time |
| **Profil Settings** | ✅ | ✅ | - |
| **Admin Panel** | ✅ | ✅ | Web lebih komprehensif |
| **Biometric Login** | ❌ | ✅ | Mobile-only |
| **Offline Mode** | ❌ | ✅ | Mobile-only |
| **Camera Scan** | ❌ | ✅ | Mobile-only |
| **Push Notifications** | Partial | ✅ | Mobile lebih baik |
| **Multi-tab** | ✅ | ❌ | Web-only |
| **Keyboard Shortcuts** | ✅ | ❌ | Web-only |

### Kapan Pakai Web vs Mobile?

**Gunakan Web Jika:**
- ✅ Butuh screen besar untuk edit naskah panjang
- ✅ Multi-tasking (buka banyak tab)
- ✅ Keyboard typing lebih cepat
- ✅ Admin panel yang kompleks
- ✅ Export/import file bulk

**Gunakan Mobile Jika:**
- ✅ On-the-go, mobile access
- ✅ Quick check notifikasi
- ✅ Upload via camera (scan fisik)
- ✅ Real-time push notifications
- ✅ Offline reading
- ✅ Biometric login (faster)

**Best Practice:**
- 📝 **Tulis & Edit Naskah** → Web (screen besar, keyboard)
- 👀 **Monitor Progress** → Mobile (notifikasi real-time)
- 📷 **Upload Cepat** → Mobile (camera scan)
- 🖨️ **Order Cetak** → Web atau Mobile (sama-sama mudah)
- 📊 **Review Analytics** → Web (charts lebih detail)
- 💬 **Komunikasi Cepat** → Mobile (push notif)

---

## 📱 Quick Tips & Tricks

### Productivity Tips

1. **Use Biometric Login**
   - Setup sekali, login cepat selamanya
   - Hemat waktu 5-10 detik per login

2. **Enable Push Notifications**
   - Jangan lewatkan update penting
   - Real-time alerts

3. **Download for Offline**
   - Download naskah penting sebelum bepergian
   - Baca tanpa internet

4. **Use Camera Scan**
   - Upload naskah fisik dengan cepat
   - Tidak perlu scan di komputer

5. **Swipe Gestures**
   - Master swipe gestures untuk navigasi cepat
   - Lebih cepat dari tap tombol

6. **Dark Mode**
   - Aktifkan dark mode untuk hemat baterai
   - Nyaman di mata saat malam

7. **Data Saver**
   - Aktifkan jika kuota terbatas
   - Hemat hingga 70% data

8. **Sync Queue**
   - Lihat sync queue saat koneksi buruk
   - Pastikan semua ter-upload

### Hidden Features

1. **Shake to Report Bug**
   - Shake device di app mana pun
   - Quick report bug

2. **Long-press for Menu**
   - Long-press item untuk contextual menu
   - Akses cepat actions

3. **Double-tap to Zoom**
   - Double-tap PDF/image untuk zoom toggle
   - Faster than pinch

4. **Swipe Right to Back**
   - Swipe dari kiri ke kanan untuk back
   - Universal gesture

5. **Pull to Refresh**
   - Pull down list untuk refresh data
   - Update manual

6. **3D Touch (iOS)**
   - Hard-press icon untuk quick actions
   - Upload, Notifications, Profile

---

## ✅ Kesimpulan Mobile

Publishify Mobile App memberikan **full feature parity** dengan versi web, ditambah **fitur eksklusif mobile** seperti:

- 📷 **Camera integration** untuk scan naskah fisik
- 🔔 **Push notifications** real-time
- 🔒 **Biometric authentication** untuk login cepat & aman
- 📴 **Offline mode** untuk read access
- 👆 **Gestures & shortcuts** untuk produktivitas
- 🌙 **Dark mode** untuk kenyamanan mata & hemat baterai
- 💾 **Data saver** untuk hemat kuota

**Rekomendasi:**
- Gunakan **Web** untuk editing intensif & admin panel
- Gunakan **Mobile** untuk monitoring, notifikasi, & upload cepat
- **Best experience**: Kombinasi Web + Mobile

---

**📞 Butuh bantuan?**
- Email: support@publishify.me
- WhatsApp: +62 812-3456-7890
- In-App: Profile → Help & Support

**🔗 Resources:**
- [Panduan Web Lengkap](./BUKU-PANDUAN-PUBLISHIFY.md)
- [API Documentation](./API-DOCUMENTATION.md)
- [FAQ](./FAQ.md)

---

**Last Updated:** January 2025  
**Mobile App Version:** v1.5.0  
**Min Android:** 5.0 (Lollipop)  
**Min iOS:** 11.0

