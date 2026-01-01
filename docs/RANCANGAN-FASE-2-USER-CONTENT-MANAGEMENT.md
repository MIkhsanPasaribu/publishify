# 📁 FASE 2: USER MANAGEMENT & CONTENT SYSTEM

**Periode**: Minggu 3-4  
**Focus**: Implementasi CRUD pengguna, profil, dan sistem manajemen naskah lengkap  
**Output**: Dashboard penulis functional, Upload & manage naskah, Kategori & Genre management

---

## 📋 LAPORAN PROGRESS FASE 2

### **File**: `LAPORAN-PROGRESS-FASE-2-USER-CONTENT.md`

#### **Konten yang Harus Dibahas:**

---

### 1. USER MANAGEMENT SYSTEM

#### 1.1 Profil Pengguna Management

**Backend Module**: `modules/pengguna/`

**Fitur Implementasi**:

- ✅ **GET /api/pengguna**: Daftar semua pengguna (admin only)
  - Pagination dengan cursor/offset
  - Filter by role, status (aktif/nonaktif)
  - Search by email, nama
  - Include profil & peran
- ✅ **GET /api/pengguna/:id**: Detail pengguna
  - Include: profilPengguna, peranPengguna, profilPenulis
  - Statistics: jumlah naskah, review, pesanan
- ✅ **PUT /api/pengguna/:id**: Update pengguna
  - Update email, telepon
  - Update profil (nama, bio, avatar, alamat)
  - Admin can update role
- ✅ **DELETE /api/pengguna/:id**: Soft delete pengguna (admin only)
  - Set aktif = false
  - Cascade: disable access, hide content

**Frontend Pages**:

- `/dashboard/profile`: Profile page untuk current user
  - Form edit profil dengan avatar upload
  - Change password
  - Email verification status
  - Connected OAuth providers
- `/dashboard/admin/pengguna`: User management table (admin)
  - Tab filter by role
  - Search & pagination
  - Actions: Edit, Toggle status, Delete

**Data Structure**:

```typescript
interface ProfilPengguna {
  namaDepan: string;
  namaBelakang: string;
  namaTampilan: string;
  bio: string;
  urlAvatar: string;
  tanggalLahir: Date;
  jenisKelamin: "L" | "P";
  alamat: string;
  kota: string;
  provinsi: string;
  kodePos: string;
}
```

#### 1.2 Profil Penulis Extended

**Purpose**: Additional data specifically untuk role penulis

**Fitur**:

- ✅ **GET /api/pengguna/:id/profil-penulis**: Get author profile
  - Include: namaPena, biografi, spesialisasi, statistics
- ✅ **PUT /api/pengguna/:id/profil-penulis**: Update author profile
  - namaPena (pen name)
  - biografi (long bio)
  - spesialisasi (array of genres)
  - Bank info: nama rekening, bank, nomor rekening, NPWP

**Frontend Component**: Author Profile Card

- Display: nama pena, total buku, rating, specialization badges
- Edit form: Rich text editor untuk biografi
- Bank info form (protected, only editable by author)

**Auto Statistics Calculation**:

- totalBuku: Count dari naskah status 'diterbitkan'
- totalDibaca: Sum dari statistik_naskah.totalDilihat
- ratingRataRata: Average dari rating_review

#### 1.3 Role Management (Admin)

**Backend**: `modules/pengguna/peran.controller.ts`

**Endpoints**:

- ✅ **POST /api/pengguna/:id/peran**: Assign role ke user
  - Body: { jenisPeran: 'penulis' | 'editor' | 'percetakan' | 'admin' }
  - Validation: User can have multiple roles
  - Create entry di peran_pengguna table
- ✅ **DELETE /api/pengguna/:id/peran/:idPeran**: Remove role
  - Set aktif = false (soft delete)
  - Keep historical data

**Frontend**: Role Badge Component

- Visual indicators: Color-coded badges
  - Penulis: Blue
  - Editor: Purple
  - Percetakan: Green
  - Admin: Red
- Toggle roles in admin panel

---

### 2. KATEGORI & GENRE MANAGEMENT

#### 2.1 Kategori System (Hierarchical)

**Backend Module**: `modules/kategori/`

**Schema Features**:

- Self-referential relation: idInduk → parent kategori
- Support nested categories (2-3 levels deep)
- Slug generation untuk SEO-friendly URLs
- Active/inactive status

**Endpoints**:

- ✅ **GET /api/kategori**: Semua kategori (flat list)
  - Query: ?includeInactive=true
- ✅ **GET /api/kategori/tree**: Hierarchical structure
  - Return nested JSON with children
- ✅ **GET /api/kategori/aktif**: Active categories only (for forms)
- ✅ **POST /api/kategori**: Create kategori (admin)
  - Generate slug dari nama
  - Optional: idInduk for subcategory
- ✅ **PUT /api/kategori/:id**: Update kategori
- ✅ **DELETE /api/kategori/:id**: Soft delete (set aktif=false)
  - Validation: Cannot delete if has children or active naskah

**Frontend Components**:

- **Kategori Tree View** (admin):
  - Expandable/collapsible tree
  - Drag & drop untuk reorder (future)
  - Inline edit nama & slug
- **Kategori Dropdown** (forms):
  - Grouped by parent kategori
  - Search/filter capability
- **Kategori Filter** (naskah list):
  - Sidebar with checkboxes
  - Multi-select support

**Sample Data**:

```json
[
  {
    "id": "uuid-1",
    "nama": "Fiksi",
    "slug": "fiksi",
    "children": [
      { "id": "uuid-2", "nama": "Novel", "slug": "fiksi-novel" },
      { "id": "uuid-3", "nama": "Cerpen", "slug": "fiksi-cerpen" }
    ]
  },
  {
    "id": "uuid-4",
    "nama": "Non-Fiksi",
    "slug": "non-fiksi",
    "children": [
      { "id": "uuid-5", "nama": "Biografi", "slug": "non-fiksi-biografi" },
      { "id": "uuid-6", "nama": "Sejarah", "slug": "non-fiksi-sejarah" }
    ]
  }
]
```

#### 2.2 Genre System (Flat Structure)

**Backend Module**: `modules/genre/`

**Purpose**: Tag-like categorization for books (non-hierarchical)

**Endpoints**:

- ✅ **GET /api/genre**: All genres
- ✅ **GET /api/genre/aktif**: Active genres only
- ✅ **POST /api/genre**: Create genre (admin)
  - Auto-generate slug
- ✅ **PUT /api/genre/:id**: Update genre
- ✅ **DELETE /api/genre/:id**: Soft delete

**Frontend**:

- **Genre Pills/Badges**: Display di naskah cards
- **Genre Multi-Select**: Form input untuk naskah
- **Genre Filter**: Checkbox list di sidebar

**Popular Genres**:

- Fiksi: Roman, Thriller, Misteri, Fantasi, Sci-Fi, Horror
- Non-Fiksi: Biografi, Motivasi, Self-Help, Bisnis, Teknologi, Sains

---

### 3. NASKAH CRUD SYSTEM (CORE FEATURE)

#### 3.1 Backend Naskah Module

**Module**: `modules/naskah/`

**Full CRUD Endpoints**:

##### A. Create Naskah

**POST /api/naskah**

```typescript
// Body
{
  judul: string;
  subJudul?: string;
  sinopsis: string; // min 50 kata
  idKategori: UUID;
  idGenre: UUID;
  formatBuku: 'A4' | 'A5' | 'B5';
  bahasaTulis: string; // default: 'id'
  urlSampul?: string; // from upload service
  urlFile?: string; // from upload service
}

// Response
{
  sukses: true,
  pesan: "Naskah berhasil dibuat",
  data: {
    id: "uuid",
    judul: "Judul Naskah",
    status: "draft",
    idPenulis: "uuid",
    // ... other fields
  }
}
```

**Business Logic**:

- Auto-set idPenulis dari current user
- Auto-set status = 'draft'
- Auto-set publik = false
- Create first revision entry di revisi_naskah
- Calculate jumlahKata dari content (if available)

##### B. Read Naskah

**GET /api/naskah** (List with filters)

```typescript
// Query params
{
  halaman?: number; // default: 1
  limit?: number; // default: 20
  status?: StatusNaskah; // filter by status
  idKategori?: UUID; // filter by category
  idGenre?: UUID; // filter by genre
  cari?: string; // search judul, sinopsis
  urutkan?: 'terbaru' | 'terlama' | 'judul_asc' | 'judul_desc';
  idPenulis?: UUID; // filter by author (for admin)
}

// Response
{
  sukses: true,
  data: Naskah[],
  metadata: {
    total: 100,
    halaman: 1,
    limit: 20,
    totalHalaman: 5
  }
}
```

**GET /api/naskah/:id** (Detail)

```typescript
// Include relations
{
  naskah,
  penulis: {
    id, email, profilPengguna
  },
  kategori: { nama, slug },
  genre: { nama, slug },
  revisi: RevisiNaskah[], // ordered by versi DESC
  review: ReviewNaskah[] // if applicable
}
```

**Special Queries**:

- **GET /api/naskah/saya**: Current user's naskah only
- **GET /api/naskah/diterbitkan**: Published naskah (public)
- **GET /api/naskah/:id/statistik**: Naskah statistics

##### C. Update Naskah

**PUT /api/naskah/:id**

```typescript
// Partial update (semua field optional)
{
  judul?: string;
  subJudul?: string;
  sinopsis?: string;
  idKategori?: UUID;
  idGenre?: UUID;
  formatBuku?: FormatBuku;
  urlSampul?: string;
  urlFile?: string;
  hargaJual?: Decimal;
}

// Validations:
// - Only owner or admin can update
// - Cannot update if status = 'diterbitkan' (published)
// - Cannot update if in active review process
```

**PUT /api/naskah/:id/status** (Admin only)

```typescript
// Change status workflow
{
  status: StatusNaskah;
  catatan?: string; // reason for status change
}

// Status flow validation:
// draft → diajukan (by penulis)
// diajukan → dalam_review (by admin assign editor)
// dalam_review → disetujui/ditolak/perlu_revisi (by admin after review)
// disetujui → diterbitkan (by admin)
```

##### D. Delete Naskah

**DELETE /api/naskah/:id**

- Validation: Only draft status can be deleted
- Hard delete dari database
- Delete associated: revisi, tags
- Delete files dari storage (urlSampul, urlFile)

#### 3.2 Revisi System

**Purpose**: Version control untuk naskah file

**Automatic Revision Creation**:

- Setiap kali upload naskah baru (urlFile berubah)
- Auto increment versi number
- Store: versi (int), catatan (optional), urlFile, dibuatPada

**Endpoints**:

- **GET /api/naskah/:id/revisi**: List all revisions
- **POST /api/naskah/:id/revisi**: Create new revision
  - Upload new file
  - Add revision note
  - Update naskah.urlFile ke latest
- **GET /api/naskah/:id/revisi/:versi/download**: Download specific version

**Frontend Component**: Revision History Timeline

- Display all versions dengan timestamps
- Show revision notes
- Download links per version
- Visual indicator untuk current active version

#### 3.3 Naskah Status Workflow

**7 Status States**:

1. **draft** (Draft)

   - Initial state after creation
   - Editable by penulis
   - Not visible to editor/admin
   - Actions: Edit, Delete, Ajukan

2. **diajukan** (Submitted)

   - After penulis clicks "Ajukan untuk Review"
   - Visible in admin's antrian review
   - Waiting for editor assignment
   - Actions: Cancel (back to draft)

3. **dalam_review** (In Review)

   - After admin assigns editor
   - Editor can view & review
   - Locked for editing
   - Actions: Monitor progress

4. **perlu_revisi** (Needs Revision)

   - After editor recommends revisi
   - Penulis must fix issues
   - Back to editable
   - Actions: Upload new version, Re-submit

5. **disetujui** (Approved)

   - After editor recommends setujui AND admin approves
   - Ready untuk publish
   - Actions: Terbitkan

6. **ditolak** (Rejected)

   - After editor or admin rejects
   - Final state (cannot be changed)
   - Reason stored in review.catatan

7. **diterbitkan** (Published)
   - After admin clicks "Terbitkan"
   - Visible publicly
   - Set diterbitkanPada timestamp
   - Generate ISBN (if not exist)
   - Actions: Cetak Fisik

**Status Transition Rules**:

```typescript
const allowedTransitions = {
  draft: ["diajukan"],
  diajukan: ["draft", "dalam_review"],
  dalam_review: ["perlu_revisi", "disetujui", "ditolak"],
  perlu_revisi: ["diajukan"],
  disetujui: ["diterbitkan"],
  ditolak: [], // final state
  diterbitkan: [], // final state
};
```

---

### 4. FILE UPLOAD SYSTEM

#### 4.1 Upload Module Implementation

**Module**: `modules/upload/`

**Technologies**:

- **Storage**: Supabase Storage (bucket-based)
- **Processing**: Multer for file handling, Sharp for image optimization
- **Validation**: File type, size, dimensions

**Supported File Types**:

1. **Naskah**: PDF only (max 50MB)
2. **Sampul**: JPEG, PNG (max 5MB, min 800x1200px)
3. **Gambar**: JPEG, PNG (max 2MB) - for profile, content
4. **Dokumen**: PDF, DOCX (max 10MB) - for legal docs

**Backend Endpoints**:

##### A. Single File Upload

**POST /api/upload**

```typescript
// Multipart form data
{
  file: File; // from input type="file"
  jenis: 'naskah' | 'sampul' | 'gambar' | 'dokumen';
  idReferensi?: UUID; // optional: naskah ID, pengguna ID
  deskripsi?: string;
}

// Response
{
  sukses: true,
  pesan: "File berhasil diupload",
  data: {
    id: "uuid",
    namaFile: "original-filename.pdf",
    urlFile: "https://storage.supabase.co/...",
    ukuran: 1048576, // bytes
    mimetype: "application/pdf"
  }
}
```

**Processing Steps**:

1. Validate file type & size
2. Generate unique filename: `{timestamp}-{uuid}-{originalname}`
3. Upload to Supabase bucket (different bucket per jenis)
4. Optimize images (resize, compress) if applicable
5. Store metadata di `file` table
6. Return public URL

##### B. Multiple File Upload

**POST /api/upload/multiple**

- Accept array of files
- Process in parallel
- Return array of uploaded file data

##### C. List Files

**GET /api/upload**

```typescript
// Query params
{
  jenis?: FileType;
  idPengguna?: UUID;
  idReferensi?: UUID;
  halaman?: number;
  limit?: number;
}
```

##### D. Delete File

**DELETE /api/upload/:id**

- Delete from Supabase Storage
- Delete metadata from database
- Validation: Only file owner or admin can delete

#### 4.2 Supabase Storage Configuration

**Buckets Setup**:

```typescript
// Create buckets in Supabase Dashboard
const buckets = {
  naskah: {
    public: false, // private files
    fileSizeLimit: 50 * 1024 * 1024, // 50MB
    allowedMimeTypes: ["application/pdf"],
  },
  sampul: {
    public: true, // public images
    fileSizeLimit: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: ["image/jpeg", "image/png"],
  },
  gambar: {
    public: true,
    fileSizeLimit: 2 * 1024 * 1024, // 2MB
    allowedMimeTypes: ["image/jpeg", "image/png"],
  },
  dokumen: {
    public: false,
    fileSizeLimit: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
  },
};
```

**Storage Service**:

```typescript
// src/modules/upload/supabase-storage.service.ts
import { createClient } from "@supabase/supabase-js";

@Injectable()
export class SupabaseStorageService {
  private supabase;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY
    );
  }

  async uploadFile(
    bucketName: string,
    filePath: string,
    file: Buffer,
    contentType: string
  ): Promise<string> {
    const { data, error } = await this.supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        contentType,
        upsert: false,
      });

    if (error) throw error;

    const { data: urlData } = this.supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  }

  async deleteFile(bucketName: string, filePath: string): Promise<void> {
    const { error } = await this.supabase.storage
      .from(bucketName)
      .remove([filePath]);

    if (error) throw error;
  }
}
```

#### 4.3 Frontend Upload Component

**Component**: `components/shared/file-upload.tsx`

**Features**:

- Drag & drop area (react-dropzone)
- File preview (images)
- Upload progress bar
- Multiple file support
- File type & size validation
- Error handling & retry

**Usage Example**:

```typescript
import { FileUpload } from "@/components/shared/file-upload";

<FileUpload
  jenis="sampul"
  maxSize={5 * 1024 * 1024} // 5MB
  accept={{ "image/*": [".jpeg", ".jpg", ".png"] }}
  onUploadComplete={(url) => {
    form.setValue("urlSampul", url);
  }}
/>;
```

---

### 5. FRONTEND PAGES & COMPONENTS

#### 5.1 Dashboard Penulis

**Route**: `/dashboard` atau `/dashboard/penulis`

**Layout**: Sidebar + Main Content

**Components**:

##### A. Statistik Cards (4 cards)

```typescript
const stats = {
  totalDraf: 5,
  dalamReview: 2,
  perluRevisi: 1,
  diterbitkan: 10,
};
```

##### B. Quick Actions (3 buttons)

- "Tulis Naskah Baru" → `/dashboard/ajukan-draf`
- "Draf Saya" → `/dashboard/draf`
- "Buku Terbit" → `/dashboard/buku-terbit`

##### C. Chart: Penjualan/Views (optional)

- Line chart 6 bulan terakhir
- Data: total views per naskah
- Library: Recharts

##### D. Recent Activity Timeline

- 5 aktivitas terakhir
- Types: Naskah diajukan, Review selesai, Naskah diterbitkan, Pesanan masuk

#### 5.2 Draf Saya Page

**Route**: `/dashboard/draf` atau `/dashboard/draf-saya`

**Features**:

##### A. Tab Filter (4 tabs)

- **Semua**: All drafts
- **Draft**: Status = draft
- **Dalam Review**: Status = diajukan, dalam_review
- **Perlu Revisi**: Status = perlu_revisi

##### B. Grid Layout

- Responsive: 1 col (mobile), 2 cols (tablet), 3 cols (desktop)
- Card per naskah:
  - Cover image (urlSampul)
  - Judul & subjudul
  - Sinopsis (truncated, max 150 chars)
  - Status badge (colored)
  - Metadata: Kategori, Genre, Jumlah halaman
  - Action buttons

##### C. Action Buttons (conditional)

- **Draft**: "Edit", "Ajukan", "Hapus"
- **Diajukan/Dalam Review**: "Lihat Detail", "Cancel" (jika applicable)
- **Perlu Revisi**: "Edit", "Re-submit"

##### D. Empty State

- Icon + pesan: "Belum ada naskah"
- CTA button: "Tulis Naskah Pertama"

#### 5.3 Ajukan Draf Page

**Route**: `/dashboard/ajukan-draf`

**Form Sections**:

##### A. Mode Selector (Toggle)

- **Tulis Langsung**: Rich text editor (TipTap)
- **Upload PDF**: File upload component

##### B. Basic Info (Left Column)

- Input: Judul\* (required)
- Input: Sub Judul (optional)
- Textarea: Sinopsis\* (min 50 kata, counter)
- Dropdown: Kategori\* (from API)
- Dropdown: Genre\* (from API)
- Dropdown: Format Buku (A4, A5, B5)
- Input: Bahasa Tulis (default: Indonesia)

##### C. Upload Section (Right Column)

- Upload Sampul:
  - Preview area
  - Requirements: Min 800x1200px, Max 5MB
  - Accept: JPEG, PNG
- Upload Naskah PDF (if mode = upload):
  - Max 50MB
  - Accept: PDF only
  - Display file name + size after upload

##### D. Submit Actions

- Button: "Simpan sebagai Draft" (status = draft)
- Button: "Ajukan untuk Review" (status = diajukan)
- Link: "Kembali"

**Validation**:

- Real-time validation dengan Zod
- Error messages dalam bahasa Indonesia
- Disable submit jika ada errors
- Toast notification after success

#### 5.4 Detail Naskah Page

**Route**: `/dashboard/naskah/:id`

**Sections**:

##### A. Naskah Info

- Cover image (large)
- Judul & subjudul
- Author name
- Kategori & Genre badges
- Status badge (prominent)
- Metadata: Jumlah halaman, kata, bahasa
- Sinopsis (full text)
- ISBN (if published)
- Harga jual (if published)
- Tanggal diterbitkan (if published)

##### B. Action Buttons (conditional by status)

- **Draft**: "Edit", "Ajukan", "Hapus"
- **Diajukan**: "Cancel Pengajuan"
- **Dalam Review**: "Lihat Progress Review"
- **Perlu Revisi**: "Upload Revisi"
- **Diterbitkan**: "Lihat Statistik", "Cetak Fisik"

##### C. Revision History (if exists)

- Timeline component
- List all versions dengan:
  - Versi number
  - Tanggal upload
  - Catatan revisi
  - Download link

##### D. Review Feedback (if status >= dalam_review)

- Show review status
- Editor name
- Feedback list (if submitted)
- Recommendation (setujui/revisi/tolak)

##### E. Statistics (if published)

- Total views
- Total downloads
- Total orders
- Revenue

#### 5.5 Edit Naskah Page

**Route**: `/dashboard/naskah/:id/edit`

**Similar to Ajukan Draf**, but:

- Pre-filled with existing data
- Cannot change if status != draft
- Show "Upload New Revision" if status = perlu_revisi
- Version increment automatically

---

### 6. API INTEGRATION (Frontend)

#### 6.1 React Query Setup

**File**: `lib/api/naskah.ts`

```typescript
import apiClient from "./client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Query Keys
export const naskahKeys = {
  all: ["naskah"] as const,
  lists: () => [...naskahKeys.all, "list"] as const,
  list: (filters: any) => [...naskahKeys.lists(), filters] as const,
  details: () => [...naskahKeys.all, "detail"] as const,
  detail: (id: string) => [...naskahKeys.details(), id] as const,
};

// API Functions
export const naskahApi = {
  getDaftarNaskah: async (params: any) => {
    const response = await apiClient.get("/naskah", { params });
    return response.data;
  },

  getNaskahById: async (id: string) => {
    const response = await apiClient.get(`/naskah/${id}`);
    return response.data;
  },

  buatNaskah: async (data: any) => {
    const response = await apiClient.post("/naskah", data);
    return response.data;
  },

  updateNaskah: async ({ id, data }: { id: string; data: any }) => {
    const response = await apiClient.put(`/naskah/${id}`, data);
    return response.data;
  },

  hapusNaskah: async (id: string) => {
    const response = await apiClient.delete(`/naskah/${id}`);
    return response.data;
  },

  ajukanNaskah: async (id: string) => {
    const response = await apiClient.put(`/naskah/${id}/status`, {
      status: "diajukan",
    });
    return response.data;
  },
};

// Custom Hooks
export const useDaftarNaskah = (params: any) => {
  return useQuery({
    queryKey: naskahKeys.list(params),
    queryFn: () => naskahApi.getDaftarNaskah(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useNaskahDetail = (id: string) => {
  return useQuery({
    queryKey: naskahKeys.detail(id),
    queryFn: () => naskahApi.getNaskahById(id),
    enabled: !!id,
  });
};

export const useBuatNaskah = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: naskahApi.buatNaskah,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: naskahKeys.lists() });
    },
  });
};

export const useUpdateNaskah = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: naskahApi.updateNaskah,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: naskahKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: naskahKeys.lists() });
    },
  });
};
```

#### 6.2 Usage in Components

```typescript
"use client";

import { useDaftarNaskah, useBuatNaskah } from "@/lib/api/naskah";

export default function DrafSayaPage() {
  const [filter, setFilter] = useState("semua");

  const { data, isLoading, error } = useDaftarNaskah({
    status: filter === "semua" ? undefined : filter,
    halaman: 1,
    limit: 20,
  });

  const { mutate: buatNaskah, isLoading: isCreating } = useBuatNaskah();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      {/* Tab Filter */}
      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="semua">Semua</TabsTrigger>
          <TabsTrigger value="draft">Draft</TabsTrigger>
          <TabsTrigger value="dalam_review">Dalam Review</TabsTrigger>
          <TabsTrigger value="perlu_revisi">Perlu Revisi</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Grid Naskah */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.data.map((naskah) => (
          <KartuNaskah key={naskah.id} naskah={naskah} />
        ))}
      </div>
    </div>
  );
}
```

---

### 7. DATABASE OPTIMIZATION

#### 7.1 Indexes untuk Performance

**Prisma Indexes** (added to schema.prisma):

```prisma
model Naskah {
  // ... fields

  @@index([idPenulis])
  @@index([status])
  @@index([idKategori])
  @@index([idGenre])
  @@index([idPenulis, status]) // Composite: penulis filter by status
  @@index([status, dibuatPada]) // Composite: filter by status + sort
  @@index([idKategori, status]) // Composite: kategori page
  @@index([publik, diterbitkanPada]) // Composite: public listing
  @@index([dibuatPada]) // For cursor pagination
}

model Pengguna {
  // ... fields

  @@index([email]) // Already unique, but index for faster lookup
  @@index([googleId])
  @@index([provider])
}

model ReviewNaskah {
  @@index([idNaskah])
  @@index([idEditor])
  @@index([status])
  @@index([idEditor, status]) // Editor's filtered reviews
}
```

#### 7.2 Query Optimization Patterns

**Use Select to Limit Data**:

```typescript
// ❌ Bad: Fetch everything
const naskah = await prisma.naskah.findMany();

// ✅ Good: Select specific fields
const naskah = await prisma.naskah.findMany({
  select: {
    id: true,
    judul: true,
    status: true,
    urlSampul: true,
    penulis: {
      select: {
        id: true,
        profilPengguna: {
          select: {
            namaDepan: true,
            namaBelakang: true,
          },
        },
      },
    },
  },
  take: 20,
});
```

**Use Pagination**:

```typescript
// Cursor-based pagination (better for large datasets)
const naskah = await prisma.naskah.findMany({
  take: 20,
  skip: 1, // skip the cursor
  cursor: {
    id: lastNaskahId, // from previous page
  },
  orderBy: {
    dibuatPada: "desc",
  },
});

// Offset-based pagination (simpler, but slower for large offsets)
const naskah = await prisma.naskah.findMany({
  take: 20,
  skip: (page - 1) * 20,
});
```

---

### 8. TESTING FASE 2

#### 8.1 Unit Tests

**Test Files**:

- `pengguna.service.spec.ts`: User CRUD operations
- `naskah.service.spec.ts`: Naskah CRUD & status transitions
- `kategori.service.spec.ts`: Category hierarchy
- `upload.service.spec.ts`: File upload logic

**Example Unit Test**:

```typescript
// naskah.service.spec.ts
describe("NaskahService", () => {
  let service: NaskahService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [NaskahService, PrismaService],
    }).compile();

    service = module.get<NaskahService>(NaskahService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe("buatNaskah", () => {
    it("should create naskah with status draft", async () => {
      const dto = {
        judul: "Test Naskah",
        sinopsis: "Sinopsis panjang minimal 50 kata...",
        idKategori: "uuid",
        idGenre: "uuid",
      };

      const result = await service.buatNaskah("user-id", dto);

      expect(result.sukses).toBe(true);
      expect(result.data.status).toBe("draft");
      expect(result.data.idPenulis).toBe("user-id");
    });

    it("should throw error if kategori not found", async () => {
      const dto = {
        judul: "Test",
        sinopsis: "Test...",
        idKategori: "invalid-uuid",
        idGenre: "uuid",
      };

      await expect(service.buatNaskah("user-id", dto)).rejects.toThrow();
    });
  });
});
```

#### 8.2 Integration Tests

**Test Scenarios**:

- Full naskah creation flow (create → upload sampul → upload PDF → ajukan)
- User profile update with avatar upload
- Kategori tree retrieval
- File upload to Supabase Storage

#### 8.3 E2E Tests (Frontend)

**Test with Playwright/Cypress**:

- Login → Create naskah → Submit for review
- Upload cover image & PDF
- Filter naskah by status
- Edit naskah details

---

### 9. HASIL & DELIVERABLES FASE 2

#### 9.1 Backend Deliverables

✅ **Pengguna Module**: Complete CRUD dengan profil management  
✅ **Kategori Module**: Hierarchical categories dengan tree structure  
✅ **Genre Module**: Flat genre system  
✅ **Naskah Module**: Full CRUD dengan status workflow  
✅ **Upload Module**: File upload service dengan Supabase integration  
✅ **Revisi System**: Version control untuk naskah  
✅ **API Docs**: Swagger updated dengan 30+ new endpoints  
✅ **Database Indexes**: Optimization untuk common queries

#### 9.2 Frontend Deliverables

✅ **Dashboard Penulis**: Statistik, quick actions, recent activity  
✅ **Draf Saya Page**: Grid view dengan tab filter  
✅ **Ajukan Draf Page**: Form lengkap dengan file upload  
✅ **Detail Naskah Page**: Comprehensive naskah info  
✅ **Edit Naskah Page**: Update naskah dengan revision support  
✅ **Profile Page**: User profile edit dengan avatar upload  
✅ **File Upload Component**: Reusable drag & drop component  
✅ **Kartu Naskah Component**: Naskah card dengan conditional actions

#### 9.3 Data & Content

✅ **Seed Data**: 10+ categories, 20+ genres, sample naskah  
✅ **Test Users**: Penulis, editor, admin dengan sample content  
✅ **Sample Files**: Cover images, sample PDFs untuk testing

---

### 10. METRICS & STATISTICS FASE 2

#### 10.1 Lines of Code

- **Backend**: +4,500 LOC
  - Pengguna module: 800 LOC
  - Naskah module: 1,200 LOC
  - Kategori/Genre: 600 LOC
  - Upload module: 900 LOC
  - Tests: 1,000 LOC
- **Frontend**: +5,000 LOC
  - Dashboard pages: 1,500 LOC
  - Form components: 1,200 LOC
  - API integration: 800 LOC
  - UI components: 1,500 LOC

#### 10.2 API Endpoints

- Total endpoints: 45+
  - Pengguna: 8 endpoints
  - Naskah: 12 endpoints
  - Kategori: 6 endpoints
  - Genre: 5 endpoints
  - Upload: 4 endpoints
  - Revisi: 4 endpoints

#### 10.3 Database Queries

- Optimized queries dengan select & include
- Average query time: <100ms
- Pagination implemented untuk large datasets

#### 10.4 Time Estimation

- **Pengguna Module**: 12 jam
- **Naskah CRUD**: 20 jam
- **Kategori & Genre**: 8 jam
- **Upload System**: 16 jam
- **Frontend Pages**: 24 jam
- **Testing**: 12 jam
- **Documentation**: 6 jam
- **Total**: ~98 jam (12-13 hari kerja)

---

### 11. CHALLENGES & SOLUTIONS FASE 2

#### Challenge 1: Hierarchical Categories

**Issue**: Self-referential relations tricky di Prisma  
**Solution**:

- Use `idInduk` optional field
- Recursive query function untuk tree structure
- Frontend tree component dengan recursion

#### Challenge 2: File Upload to Supabase

**Issue**: Different bucket policies, public/private files  
**Solution**:

- Create separate buckets per file type
- Configure RLS policies
- Use signed URLs untuk private files
- Sharp untuk image optimization sebelum upload

#### Challenge 3: Naskah Status Workflow

**Issue**: Complex state machine dengan 7 states  
**Solution**:

- Define allowedTransitions mapping
- Validation function sebelum status change
- State diagram documentation
- Frontend conditional rendering berdasarkan status

#### Challenge 4: Large File Upload (50MB PDF)

**Issue**: Upload timeout, progress tracking  
**Solution**:

- Increase timeout di axios config
- Implement upload progress bar
- Chunked upload untuk file >20MB (future improvement)
- Background upload job dengan Bull queue (future)

---

### 12. NEXT STEPS → FASE 3

Setelah user & content management selesai, Fase 3 akan fokus pada:

1. **Review Assignment System**: Admin assign editor ke naskah
2. **Editor Dashboard**: Dashboard & review queue untuk editor
3. **Feedback Mechanism**: Editor dapat memberikan feedback per aspek
4. **Review Workflow**: Status tracking dari ditugaskan → selesai
5. **Admin Approval**: Admin approve/reject based on editor recommendation

---
