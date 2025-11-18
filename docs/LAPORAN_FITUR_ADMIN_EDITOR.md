# 📋 Dokumentasi Fitur Admin & Editor - Publishify

**Tanggal**: 12 November 2025  
**Status**: 🟢 **90% Complete**

---

## 📊 Alur Review Naskah

**Flow**: Penulis Upload → Admin Assign Editor → Editor Review → Admin Approve → Publikasi

**7 Status Naskah**:
- 🟡 **draft** - Belum diajukan
- 🟠 **diajukan** - Menunggu assign editor
- 🔵 **dalam_review** - Sedang direview
- 🟣 **perlu_revisi** - Butuh revisi penulis
- 🟢 **disetujui** - Approved admin
- 🔴 **ditolak** - Rejected
- 🟢 **diterbitkan** - Published

---

## 👨‍💼 Fitur Admin

### 1. Dashboard Admin
**Route**: `/dashboard/admin`

**4 Kartu Statistik**: Total Naskah | Menunggu Review | Review Aktif | Total Editor

**Quick Actions**: Antrian Review | Semua Naskah | Monitoring Review | Kelola Pengguna

**[Screenshot: Dashboard admin dengan statistik dan quick actions]**

---

### 2. Semua Naskah
**Route**: `/dashboard/admin/review`

**Tab Filter**: Semua | Draft | Diajukan | Dalam Review | Perlu Revisi | Disetujui | Ditolak | Diterbitkan

**Tabel**: Cover | Judul | Penulis | Kategori | Status Badge | Tanggal | Aksi

**Kemampuan**: Lihat SEMUA naskah dari semua penulis (tanpa filter status publikasi)

**[Screenshot: Tabel naskah dengan tab filter dan status badges]**

---

### 3. Antrian Review
**Route**: `/dashboard/admin/antrian`

**Fitur**: List naskah status "diajukan" yang belum ada editor

**Action**: Klik "Tugaskan ke Editor" → Pilih editor dari dropdown → Tambah catatan → Submit

**Hasil**: Status naskah "diajukan" → "dalam_review" | Data review baru dibuat | Editor dapat notifikasi

**[Screenshot: Card naskah dengan tombol assign editor]**

**[Screenshot: Modal assign editor dengan dropdown dan form catatan]**

---

### 4. Monitoring Review
**Route**: `/dashboard/admin/monitoring`

**Tabel**: Judul | Penulis | Editor | Status Review | Rekomendasi | Deadline | Progress

**Tab Filter**: Semua | Ditugaskan | Dalam Proses | Selesai | Terlambat

**Action**: Lihat detail review → Approve/Reject/Revisi berdasarkan rekomendasi editor

**[Screenshot: Tabel monitoring dengan status dan rekomendasi]**

---

### 5. Kelola Pengguna
**Route**: `/dashboard/admin/pengguna`

**Tab Role**: Semua | Penulis | Editor | Percetakan | Admin

**Tabel**: Avatar | Nama | Email | Role | Status | Login Terakhir | Aksi

**Action**: Tambah user | Edit role | Toggle aktif/nonaktif | Reset password | Hapus akun

**[Screenshot: Tabel pengguna dengan tab role]**

---

### 6. Sidebar Admin
**Menu**: 
- Dashboard Admin
- Semua Naskah
- Antrian Review
- Kelola Pengguna
- Monitoring Review

**[Screenshot: Sidebar admin dengan 5 menu]**

---

## 👨‍🎨 Fitur Editor

### 1. Dashboard Editor
**Route**: `/dashboard/editor`

**3 Kartu Statistik**: Review Ditugaskan | Dalam Proses | Selesai

**Recent Activity**: 5 review terakhir dengan status & tanggal

**[Screenshot: Dashboard editor dengan statistik dan recent activity]**

---

### 2. Daftar Review
**Route**: `/dashboard/editor/review`

**Tab Filter**: Semua | Ditugaskan | Dalam Proses | Selesai

**Card Info**: Cover | Judul | Penulis | Kategori | Deadline | Status Badge | Progress

**Action**: Mulai Review | Lanjut Review | Lihat Detail

**[Screenshot: Grid card review dengan tab filter]**

---

### 3. Detail & Review Naskah
**Route**: `/dashboard/editor/review/[id]`

**Section 1 - Info Naskah**: Cover | Judul | Penulis | Kategori | Genre | Sinopsis | Download PDF

**Section 2 - Form Review**:
- Rating 1-5 bintang untuk 6 aspek:
  - Originalitas Cerita
  - Kualitas Penulisan
  - Plot & Alur
  - Karakter & Dialog
  - Tema & Pesan
  - Potensi Komersial
- Rating keseluruhan (auto calculated)
- Textarea feedback lengkap
- Rekomendasi: ✅ Setujui | 🔄 Revisi | ❌ Tolak

**Section 3 - Action**: Simpan Draft | Submit Review | Kembali

**[Screenshot: Info naskah dan form penilaian]**

**[Screenshot: Rating bintang 6 aspek]**

**[Screenshot: Textarea feedback dan pilihan rekomendasi]**

---

### 4. History Review
**Route**: `/dashboard/editor/history`

**List**: Semua review selesai | Rating diberikan | Rekomendasi | Keputusan admin

**Statistik**: Total review | Rata-rata rating | Persentase rekomendasi | Waktu rata-rata

**[Screenshot: History review dengan statistik editor]**

---

### 5. Sidebar Editor
**Menu**: Dashboard Editor | Daftar Review | History Review | Pengaturan

**Badge**: Count review baru | Warning deadline < 3 hari

**[Screenshot: Sidebar editor dengan badge notifikasi]**

---

## 🔄 Complete Review Flow

### Step 1: Penulis Upload Naskah
1. Login → Klik "Ajukan Draf Baru"
2. Isi form (judul, sinopsis, kategori, genre) + Upload cover & PDF
3. Status: **draft** → **diajukan**
4. Naskah masuk "Antrian Review" admin

**[Screenshot: Form ajukan draf penulis]**

---

### Step 2: Admin Assign Editor
1. Buka "Antrian Review" → Lihat naskah baru
2. Klik "Tugaskan ke Editor" → Pilih editor → Tambah catatan
3. Status: **diajukan** → **dalam_review**
4. Editor dapat notifikasi

**[Screenshot: Admin klik assign dari antrian]**
**[Screenshot: Modal assign editor]**

---

### Step 3: Editor Review Naskah
1. Login → Lihat review baru di dashboard
2. Klik "Mulai Review" → Download & baca PDF
3. Isi rating 6 aspek (1-5 bintang) + Feedback lengkap
4. Pilih rekomendasi: Setujui/Revisi/Tolak
5. Klik "Submit Review"
6. Status review: **dalam_proses** → **selesai**

**[Screenshot: Editor isi form review]**
**[Screenshot: Rating dan rekomendasi]**

---

### Step 4: Admin Approve/Reject
1. Buka "Monitoring Review" → Lihat review selesai
2. Baca feedback & rating editor
3. **Approve**: Status → **disetujui** (siap publikasi)
4. **Revisi**: Status → **perlu_revisi** (kirim ke penulis)
5. **Tolak**: Status → **ditolak** (tidak bisa publish)

**[Screenshot: Admin lihat detail review]**
**[Screenshot: Admin approve naskah]**

---

## 📊 Status & Badge Colors

**Naskah**: 🟡 draft | 🟠 diajukan | 🔵 dalam_review | 🟣 perlu_revisi | 🟢 disetujui | 🔴 ditolak | 🟢 diterbitkan

**Review**: 🟡 ditugaskan | 🔵 dalam_proses | 🟢 selesai | 🔴 dibatalkan

**Rekomendasi**: ✅ setujui | 🔄 revisi | ❌ tolak

---

## 🎯 Summary

### Admin Features (6 fitur)
✅ Dashboard statistik real-time SEMUA naskah  
✅ Lihat & filter naskah (7 status)  
✅ Antrian review & assign editor  
✅ Monitoring progress review  
✅ Approve/reject naskah  
✅ Kelola user & role  

### Editor Features (5 fitur)
✅ Dashboard statistik review pribadi  
✅ List review dengan filter status  
✅ Form review 6 aspek + rating bintang  
✅ Feedback lengkap & rekomendasi  
✅ History review selesai  

### Review Flow
✅ Penulis upload → Admin assign → Editor review → Admin approve → Publikasi

---

## 📸 Screenshot Checklist

**Admin** (10):
1. Dashboard statistik
2. Tabel semua naskah
3. Antrian review
4. Modal assign editor
5. Monitoring review
6. Detail review editor
7. Approve/reject form
8. Kelola pengguna
9. Sidebar menu
10. Badge & status

**Editor** (8):
1. Dashboard statistik
2. Grid card review
3. Tab filter status
4. Detail naskah
5. Form rating 6 aspek
6. Textarea feedback
7. Rekomendasi final
8. History review

**Flow** (5):
1. Penulis ajukan
2. Admin antrian
3. Admin assign
4. Editor submit
5. Admin approve

**Total: 23 screenshot**

---

**Dibuat oleh**: Tim Frontend Publishify  
**Tanggal**: 12 November 2025  
**Status**: Production Ready 🚀
