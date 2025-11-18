# Correct Workflow Documentation - Admin Assigns Review to Editor

## 🎯 **Workflow yang Benar**

### **Alur Kerja:**

```
┌─────────────────────────────────────────────────────────┐
│  1. PENULIS AJUKAN NASKAH                               │
│     • Create naskah                                     │
│     • Submit naskah                                     │
│     • Status: draft → diajukan                          │
│     • Data masuk tabel: NASKAH                          │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────────────────────┐
│  2. ADMIN LIHAT ANTRIAN                                 │
│     • Buka: /dashboard/admin/antrian                    │
│     • API: GET /api/naskah?status=diajukan              │
│     • Melihat: Daftar naskah siap ditugaskan            │
│     • Tabel: NASKAH (status: diajukan)                  │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────────────────────┐
│  3. ADMIN TUGASKAN KE EDITOR                            │
│     • Klik button "Tugaskan"                            │
│     • Pilih editor dari dropdown                        │
│     • API: POST /api/review/tugaskan                    │
│       Body: { idNaskah, idEditor, catatan }             │
│     • Backend creates record di: REVIEW_NASKAH          │
│     • Naskah status: diajukan → dalam_review            │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────────────────────┐
│  4. EDITOR LIHAT DAFTAR REVIEW                          │
│     • Buka: /dashboard/editor/review                    │
│     • API: GET /api/review/editor/saya                  │
│     • Data dari: REVIEW_NASKAH (WHERE idEditor = X)     │
│     • Status: ditugaskan, dalam_proses, selesai         │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────────────────────┐
│  5. EDITOR KERJAKAN REVIEW                              │
│     • Buka detail review                                │
│     • Tambah feedback (aspek, komentar, skor)           │
│     • Submit review dengan rekomendasi                  │
│     • Status review: ditugaskan → dalam_proses → selesai│
└─────────────────────────────────────────────────────────┘
```

---

## 📊 **Database Flow**

### **Step 1: Penulis Ajukan**
```sql
-- Table: naskah
INSERT INTO naskah (id, judul, status, id_penulis, ...)
VALUES ('uuid-1', 'Novel Petang', 'diajukan', 'uuid-penulis', ...);

-- Table: review_naskah
-- KOSONG (belum ada review)
```

### **Step 2: Admin Lihat Antrian**
```sql
-- Query di halaman admin
SELECT * FROM naskah 
WHERE status = 'diajukan'
ORDER BY diperbarui_pada DESC;

-- Result: List naskah yang siap ditugaskan
```

### **Step 3: Admin Tugaskan**
```sql
-- Backend executes after API call:

-- 1. Create review record
INSERT INTO review_naskah (id, id_naskah, id_editor, status, ...)
VALUES ('uuid-review', 'uuid-1', 'uuid-editor', 'ditugaskan', ...);

-- 2. Update naskah status
UPDATE naskah 
SET status = 'dalam_review' 
WHERE id = 'uuid-1';
```

### **Step 4: Editor Lihat Review**
```sql
-- Query di halaman editor
SELECT rn.*, n.judul, n.sinopsis, ... 
FROM review_naskah rn
JOIN naskah n ON rn.id_naskah = n.id
WHERE rn.id_editor = 'uuid-editor'
ORDER BY rn.ditugaskan_pada DESC;

-- Result: List review yang ditugaskan ke editor
```

---

## 🚫 **PENTING: Self-Assign Dihapus**

### **Sebelumnya (SALAH):**
- Editor bisa ambil review sendiri dari "Naskah Masuk"
- Button "📥 Ambil Review Naskah Ini"
- Self-assign workflow

### **Sekarang (BENAR):**
- Editor **TIDAK BISA** self-assign
- Hanya **ADMIN** yang bisa tugaskan review
- Editor hanya bisa **LIHAT** naskah yang diajukan (read-only)
- Editor **KERJAKAN** review yang sudah ditugaskan admin

---

## 📁 **File Structure**

### **Admin Panel:**
```
frontend/app/(dashboard)/dashboard/admin/antrian/page.tsx
```
**Fitur:**
- ✅ Tampilkan naskah dengan status `diajukan`
- ✅ Tabel lengkap (judul, penulis, kategori, tanggal)
- ✅ Button "Tugaskan" di setiap row
- ✅ Modal pilih editor
- ✅ Call API `POST /api/review/tugaskan`
- ✅ Refresh list setelah sukses

### **Editor Panel (Updated):**
```
frontend/app/(dashboard)/dashboard/editor/naskah/page.tsx
frontend/app/(dashboard)/dashboard/editor/naskah/[id]/page.tsx
```
**Perubahan:**
- ❌ REMOVE: Button "Ambil Review"
- ❌ REMOVE: Self-assign logic
- ✅ KEEP: View naskah list (read-only)
- ✅ KEEP: View naskah detail (read-only)
- ✅ KEEP: Download file naskah
- ✅ ADD: Info card "Tunggu penugasan dari admin"

---

## 🔧 **API Endpoints**

### **1. Admin - Get Antrian Naskah**
```
GET /api/naskah?status=diajukan&limit=100
```
**Response:**
```json
{
  "sukses": true,
  "data": [
    {
      "id": "uuid-naskah",
      "judul": "Novel Petang",
      "status": "diajukan",
      "penulis": { ... },
      "kategori": { ... }
    }
  ]
}
```

### **2. Admin - Get Daftar Editor**
```
GET /api/pengguna?peran=editor&limit=100
```
**Response:**
```json
{
  "sukses": true,
  "data": [
    {
      "id": "uuid-editor",
      "email": "editor@test.com",
      "profilPengguna": { ... },
      "peranPengguna": [
        { "jenisPeran": "editor", "aktif": true }
      ]
    }
  ]
}
```

### **3. Admin - Tugaskan Review**
```
POST /api/review/tugaskan
Body: {
  "idNaskah": "uuid-naskah",
  "idEditor": "uuid-editor",
  "catatan": "Ditugaskan oleh admin..."
}
```
**Response:**
```json
{
  "sukses": true,
  "pesan": "Review berhasil ditugaskan",
  "data": {
    "id": "uuid-review",
    "idNaskah": "uuid-naskah",
    "idEditor": "uuid-editor",
    "status": "ditugaskan",
    ...
  }
}
```

### **4. Editor - Get Review Saya**
```
GET /api/review/editor/saya?status=ditugaskan
```
**Response:**
```json
{
  "sukses": true,
  "data": [
    {
      "id": "uuid-review",
      "status": "ditugaskan",
      "naskah": { "judul": "Novel Petang", ... },
      "editor": { ... }
    }
  ]
}
```

---

## 🎨 **UI Components**

### **Admin - Antrian Page**

**Features:**
1. **Header**
   - Title: "📋 Antrian Review - Belum Ditugaskan"
   - Description

2. **Info Card**
   - Step-by-step instructions
   - How to assign review

3. **Stats Cards**
   - Menunggu Penugasan (count)
   - Editor Tersedia (count)
   - Total Naskah

4. **Table**
   - Columns: No, Judul, Penulis, Kategori, Tanggal, Aksi
   - Action: Button "Tugaskan"

5. **Modal**
   - Naskah info (judul, penulis, kategori)
   - Dropdown select editor
   - Button "Simpan Penugasan"
   - Loading state

**States:**
```typescript
- naskahList: Naskah[]
- editorList: Editor[]
- modalOpen: boolean
- selectedNaskah: Naskah | null
- selectedEditor: string
- sedangTugaskan: boolean
```

### **Editor - Naskah Masuk (Read-Only)**

**Features:**
1. **Info Card** (Updated)
   - "Admin akan menugaskan review kepada Anda"
   - No self-assign instructions

2. **List Page**
   - Display naskah status `diajukan`
   - Button: "Lihat Detail" only
   - No "Ambil Review" button

3. **Detail Page** (Updated)
   - Show full naskah info
   - Download file button
   - **NEW:** Info box "Tunggu penugasan dari admin"
   - **REMOVED:** "Ambil Review" button

---

## ✅ **Testing Checklist**

### **Admin Panel:**
- [ ] Login sebagai Admin
- [ ] Navigate to `/dashboard/admin/antrian`
- [ ] Verify list shows naskah with status `diajukan`
- [ ] Check stats cards display correct counts
- [ ] Click "Tugaskan" button → Modal opens
- [ ] Select editor from dropdown
- [ ] Click "Simpan Penugasan"
- [ ] Verify success toast
- [ ] Verify naskah disappears from list (status changed)
- [ ] Check database: record created in `review_naskah`

### **Editor Panel:**
- [ ] Login sebagai Editor
- [ ] Navigate to "Naskah Masuk"
- [ ] Verify can see naskah list (read-only)
- [ ] Click "Lihat Detail"
- [ ] Verify NO "Ambil Review" button
- [ ] Verify info box says "Tunggu penugasan dari admin"
- [ ] Can download naskah file
- [ ] Navigate to "Daftar Review"
- [ ] Verify assigned review appears (after admin assigns)

### **End-to-End:**
- [ ] Penulis: Create & submit naskah
- [ ] Admin: See naskah in antrian
- [ ] Admin: Assign to Editor A
- [ ] Editor A: See review in "Daftar Review"
- [ ] Editor A: Can work on review
- [ ] Verify Editor B **cannot** see review (not assigned)

---

## 🐛 **Common Issues & Solutions**

### **Issue 1: Editor list kosong**
**Cause:** Tidak ada user dengan role `editor`
**Solution:** 
- Create user dengan role editor di database
- Atau admin assign role editor ke existing user

### **Issue 2: Naskah tidak muncul di antrian**
**Cause:** Status naskah bukan `diajukan`
**Solution:**
```sql
UPDATE naskah SET status = 'diajukan' WHERE id = '...';
```

### **Issue 3: Error 409 "Sudah ada review aktif"**
**Cause:** Naskah sudah punya review dengan status aktif
**Solution:**
- Complete existing review dulu
- Atau batalkan review existing

### **Issue 4: Modal tidak bisa pilih editor**
**Cause:** `loadingEditor` masih true atau API error
**Solution:**
- Check endpoint `/api/pengguna?peran=editor`
- Verify response structure

---

## 📊 **Comparison: Old vs New**

| Aspect | Old (Self-Assign) | New (Admin Assign) |
|--------|-------------------|-------------------|
| **Workflow** | Editor ambil sendiri | Admin tugaskan |
| **Button "Ambil Review"** | ✅ Ada | ❌ Dihapus |
| **Editor autonomy** | Tinggi | Rendah |
| **Admin control** | Rendah | Tinggi |
| **Workload distribution** | Random | Controlled |
| **Review queue management** | Tidak ada | Ada (Antrian) |
| **Data source editor** | Tabel `naskah` | Tabel `review_naskah` |

---

## 🎯 **Benefits of Admin-Assign Workflow**

### **For Admin:**
- ✅ Full control atas penugasan
- ✅ Bisa distribute workload merata
- ✅ Bisa assign berdasarkan keahlian
- ✅ Clear queue management

### **For Editor:**
- ✅ Jelas review mana yang harus dikerjakan
- ✅ Tidak overwhelmed dengan pilihan
- ✅ Fokus pada tugas yang diberikan

### **For System:**
- ✅ Data consistency
- ✅ Clear separation of roles
- ✅ Better tracking & reporting
- ✅ Scalable process

---

## 📝 **Summary**

**Correct Workflow:**
1. **Penulis** → Ajukan naskah (status: `diajukan`)
2. **Admin** → Lihat antrian, tugaskan ke editor
3. **System** → Create record di `review_naskah`
4. **Editor** → Lihat review yang ditugaskan, kerjakan

**Key Changes:**
- ✅ Created: `/dashboard/admin/antrian/page.tsx`
- ✅ Updated: `/dashboard/editor/naskah/page.tsx` (remove self-assign)
- ✅ Updated: `/dashboard/editor/naskah/[id]/page.tsx` (remove button)
- ✅ Removed: Self-assign logic completely

**Status:** ✅ **READY FOR TESTING**

---

**Last Updated:** November 12, 2025  
**Version:** 2.0.0 (Corrected Workflow)
