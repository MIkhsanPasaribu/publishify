# Editor Self-Assign Workflow Documentation

## 📋 Overview

Fitur **Self-Assign Review** memungkinkan editor untuk mengambil (assign) naskah yang ingin mereka review secara mandiri, tanpa perlu menunggu admin untuk menugaskan.

## 🎯 Workflow

### 1. **Penulis Mengajukan Naskah**
```
Penulis → Buat Naskah → Status: "draft"
                      ↓
                 Ajukan Naskah → Status: "diajukan"
```

### 2. **Editor Browse Naskah Masuk**
```
Editor → Dashboard → Klik "Naskah Masuk" (hijau)
                              ↓
                    Lihat daftar naskah status "diajukan"
```

### 3. **Editor Pilih & Ambil Review**
```
Editor → Pilih naskah → Klik "Lihat Detail"
                              ↓
                     Baca info lengkap naskah
                              ↓
                     Klik "📥 Ambil Review Naskah Ini"
                              ↓
                  API: POST /review/tugaskan
                  Body: { idNaskah, idEditor }
                              ↓
                     Create record di tabel review_naskah
                              ↓
                     Redirect ke halaman Detail Review
```

### 4. **Editor Mulai Review**
```
Editor → Halaman Detail Review
              ↓
        Tambah Feedback (aspek, komentar, skor)
              ↓
        Submit Review (rekomendasi: setujui/revisi/tolak)
              ↓
        Status Review: "selesai"
```

## 🔧 Technical Implementation

### Frontend Changes

#### 1. **API Client Update** (`frontend/lib/api/review.ts`)
```typescript
export interface TugaskanReviewDto {
  idNaskah: string;
  idEditor: string;
  catatan?: string;
}

export const reviewApi = {
  async tugaskanReview(payload: TugaskanReviewDto): Promise<ResponseSukses<Review>> {
    const { data } = await api.post<ResponseSukses<Review>>("/review/tugaskan", payload);
    return data;
  },
  // ... other methods
};
```

#### 2. **Naskah Detail Page** (`frontend/app/(dashboard)/dashboard/editor/naskah/[id]/page.tsx`)

**Added Features:**
- Import `reviewApi` from API client
- State: `sedangAmbil` untuk loading button
- Function: `handleAmbilReview()` untuk self-assign
- Button: "📥 Ambil Review Naskah Ini" dengan loading state
- Auto-redirect ke detail review setelah berhasil

**Key Code:**
```typescript
const handleAmbilReview = async () => {
  setSedangAmbil(true);
  try {
    const userData = JSON.parse(localStorage.getItem("userData") || "{}");
    const response = await reviewApi.tugaskanReview({
      idNaskah: naskah.id,
      idEditor: userData.id,
      catatan: `Review diambil oleh editor pada ${new Date().toLocaleString("id-ID")}`,
    });
    
    toast.success("Berhasil mengambil review naskah!");
    router.push(`/dashboard/editor/review/${response.data.id}`);
  } catch (error: any) {
    toast.error(error.response?.data?.pesan || "Gagal mengambil review");
  } finally {
    setSedangAmbil(false);
  }
};
```

#### 3. **Naskah List Page** (`frontend/app/(dashboard)/dashboard/editor/naskah/page.tsx`)

**Updated Info Card:**
- Changed from blue info card to green gradient
- Added step-by-step instructions for self-assign
- Clear call-to-action dengan emoji

#### 4. **Dashboard Editor** (`frontend/app/(dashboard)/dashboard/editor/page.tsx`)

**Added Quick Action Button:**
- Icon: 📥 (inbox)
- Color: Green theme
- Link: `/dashboard/editor/naskah`
- Description: "Lihat naskah siap review"

### Backend (No Changes Required!)

✅ Endpoint already exists: `POST /api/review/tugaskan`
- Role: `admin`, `editor` (both allowed)
- DTO: `TugaskanReviewDto`
- Validates: Naskah status must be `diajukan`
- Creates: Record in `review_naskah` table
- Updates: Naskah status to `dalam_review`

## 📊 Database Flow

### Before Self-Assign:
```sql
-- Table: naskah
id | judul           | status    | idPenulis
1  | "Novel Petang"  | diajukan  | uuid-1

-- Table: review_naskah
(empty - no review yet)
```

### After Self-Assign:
```sql
-- Table: naskah (status updated by backend)
id | judul           | status        | idPenulis
1  | "Novel Petang"  | dalam_review  | uuid-1

-- Table: review_naskah (new record created)
id | idNaskah | idEditor | status      | ditugaskanPada
a1 | 1        | uuid-2   | ditugaskan  | 2025-11-12 10:30:00
```

## 🎨 UI/UX Features

### List Page (`/dashboard/editor/naskah`)
- ✅ Display naskah dengan status `diajukan`
- ✅ Pagination (10 items per page)
- ✅ Client-side search (title & synopsis)
- ✅ Card layout dengan cover image
- ✅ Author info & metadata badges
- ✅ Relative time formatting
- ✅ Empty state handling
- ✅ Step-by-step instructions

### Detail Page (`/dashboard/editor/naskah/[id]`)
- ✅ Full manuscript information
- ✅ Cover image with fallback gradient
- ✅ Metadata grid (pages, words, language, ISBN)
- ✅ Full synopsis with preserved whitespace
- ✅ Download manuscript file button
- ✅ Author profile sidebar
- ✅ Category & genre descriptions
- ✅ Timeline visualization
- ✅ **"📥 Ambil Review" button** (NEW!)
- ✅ Loading state during assignment
- ✅ Success/error toast notifications
- ✅ Auto-redirect to review page

### Dashboard (`/dashboard/editor`)
- ✅ Quick action button "Naskah Masuk"
- ✅ Green theme to differentiate from review buttons
- ✅ Icon: 📥 (inbox)

## 🚀 User Journey

**Editor's Perspective:**

1. **Login** → Dashboard Editor
2. **See Quick Actions** → 4 buttons including "Naskah Masuk" (green)
3. **Click "Naskah Masuk"** → List of manuscripts ready for review
4. **Browse Manuscripts** → Search, paginate, see covers & info
5. **Choose Manuscript** → Click "Lihat Detail"
6. **Review Information** → Read synopsis, check metadata, download file
7. **Decide to Review** → Click "📥 Ambil Review Naskah Ini"
8. **Assignment Processing** → API call, record created
9. **Redirected** → Detail Review page
10. **Start Review** → Add feedback, submit recommendation

**Advantages:**
- ✅ **Autonomy**: Editor chooses what to review
- ✅ **Transparency**: See full info before committing
- ✅ **Flexibility**: No admin bottleneck
- ✅ **Workload Balance**: Editor takes based on capacity

## 🔐 Security & Validation

### Frontend
- ✅ User ID from `localStorage.getItem("userData")`
- ✅ JWT token in request headers (via API client)
- ✅ Loading state prevents double submission
- ✅ Error handling with toast notifications

### Backend (Existing)
- ✅ JWT Auth Guard (verify token)
- ✅ Role Guard (only `admin` & `editor`)
- ✅ Naskah status validation (must be `diajukan`)
- ✅ Duplicate check (no active review for same naskah)
- ✅ Editor existence validation

## 📝 API Endpoint Details

### `POST /api/review/tugaskan`

**Request:**
```json
{
  "idNaskah": "uuid-of-manuscript",
  "idEditor": "uuid-of-editor",
  "catatan": "Review diambil oleh editor pada 12/11/2025 10:30"
}
```

**Success Response (201):**
```json
{
  "sukses": true,
  "pesan": "Review berhasil ditugaskan",
  "data": {
    "id": "uuid-of-review",
    "idNaskah": "uuid-of-manuscript",
    "idEditor": "uuid-of-editor",
    "status": "ditugaskan",
    "ditugaskanPada": "2025-11-12T10:30:00Z",
    "naskah": { /* manuscript details */ },
    "editor": { /* editor details */ }
  }
}
```

**Error Response (400):**
```json
{
  "sukses": false,
  "pesan": "Naskah tidak dalam status yang valid atau sudah ada review aktif",
  "error": {
    "kode": "INVALID_STATUS",
    "detail": "Naskah harus berstatus 'diajukan'",
    "timestamp": "2025-11-12T10:30:00Z"
  }
}
```

## 🧪 Testing Checklist

- [ ] Login as Editor
- [ ] Navigate to "Naskah Masuk"
- [ ] Verify list shows only status `diajukan`
- [ ] Test search functionality
- [ ] Test pagination
- [ ] Click "Lihat Detail" on a manuscript
- [ ] Verify all manuscript info displayed
- [ ] Download manuscript file
- [ ] Click "📥 Ambil Review Naskah Ini"
- [ ] Verify loading state appears
- [ ] Verify success toast message
- [ ] Verify redirect to review detail page
- [ ] Verify record created in `review_naskah` table
- [ ] Verify naskah status updated to `dalam_review`
- [ ] Try to assign same manuscript again (should fail)

## 🎯 Benefits of This Implementation

### For Editors:
- ✅ Freedom to choose manuscripts
- ✅ See full context before committing
- ✅ Manage own workload
- ✅ Immediate start (no waiting for admin)

### For Admins:
- ✅ Less manual assignment work
- ✅ Better workload distribution
- ✅ Still can assign manually if needed
- ✅ Track which editors are active

### For Authors:
- ✅ Faster review assignment
- ✅ More editors can pick up work
- ✅ Transparent process

### For System:
- ✅ Minimal backend changes (uses existing endpoint)
- ✅ Frontend-only implementation
- ✅ Scalable solution
- ✅ Clean separation of concerns

## 🔄 Alternative Workflows

### Admin-Only Assignment (Previous)
```
Penulis ajukan → Admin assign ke editor → Editor review
```
**Cons:** Admin bottleneck, slower process

### Auto-Assignment (Alternative)
```
Penulis ajukan → System auto-assigns → Editor review
```
**Cons:** Need complex logic (round-robin, capacity check)

### Self-Assignment (Current) ✅
```
Penulis ajukan → Editor pilih & ambil → Editor review
```
**Pros:** Balance of control & flexibility

## 📚 Related Files

### Modified Files:
1. `frontend/lib/api/review.ts` - Added `tugaskanReview()` method
2. `frontend/app/(dashboard)/dashboard/editor/naskah/[id]/page.tsx` - Added self-assign button
3. `frontend/app/(dashboard)/dashboard/editor/naskah/page.tsx` - Updated info card
4. `frontend/app/(dashboard)/dashboard/editor/page.tsx` - Added "Naskah Masuk" button

### Created Files:
1. `docs/editor-self-assign-workflow.md` - This documentation

### Backend Files (No Changes):
- `backend/src/modules/review/review.controller.ts` - Existing endpoint
- `backend/src/modules/review/review.service.ts` - Existing logic
- `backend/src/modules/review/dto/tugaskan-review.dto.ts` - Existing DTO

## 🎉 Conclusion

Implementasi **Self-Assign Review** berhasil dilakukan dengan:
- ✅ **Minimal Changes**: Hanya frontend, backend sudah siap
- ✅ **User-Friendly**: UI intuitif dengan step-by-step guide
- ✅ **Secure**: Menggunakan existing auth & validation
- ✅ **Scalable**: Dapat digunakan banyak editor bersamaan
- ✅ **Flexible**: Admin masih bisa assign manual jika perlu

**Status:** ✅ **READY FOR TESTING**

---

**Last Updated:** November 12, 2025
**Author:** GitHub Copilot
**Version:** 1.0.0
