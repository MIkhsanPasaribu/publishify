# 🧪 RLS Test Queries - Publishify

## 📋 Overview

Dokumen ini berisi test queries untuk memverifikasi RLS policies bekerja dengan benar untuk setiap role: **Admin**, **Editor**, **Penulis**, **Percetakan**, dan **Anonymous**.

## 🎭 Test Scenarios

### Setup: Get Test User IDs

Pertama, dapatkan user IDs untuk testing:

```sql
-- Get all seeded users
SELECT
  p.id,
  p.email,
  pr.jenisPeran as role,
  pr.aktif
FROM pengguna p
JOIN peran_pengguna pr ON pr.idPengguna = p.id
WHERE p.email IN (
  'admin@publishify.com',
  'editor@publishify.com',
  'penulis@publishify.com',
  'percetakan@publishify.com'
)
ORDER BY pr.jenisPeran;

-- Save these IDs for testing:
-- ADMIN_ID = '...'
-- EDITOR_ID = '...'
-- PENULIS_ID = '...'
-- PERCETAKAN_ID = '...'
```

---

## 1️⃣ Test as ADMIN

Admin harus bisa akses **SEMUA DATA**.

### Set Context sebagai Admin

```sql
-- Replace dengan ADMIN_ID yang sebenarnya
SELECT set_config('request.jwt.claims',
  '{"sub": "YOUR_ADMIN_ID", "email": "admin@publishify.com"}',
  true
);

-- Verify context
SELECT public.current_user_id(), public.is_admin();
-- Expected: (admin_id, true)
```

### Test Admin Access

```sql
-- Admin: Lihat semua pengguna
SELECT COUNT(*) as total_users FROM pengguna;
-- Expected: ≥ 4 (semua users)

-- Admin: Lihat semua naskah
SELECT COUNT(*) as total_naskah FROM naskah;
-- Expected: Semua naskah (termasuk draft, private)

-- Admin: Lihat semua review
SELECT COUNT(*) as total_reviews FROM review_naskah;
-- Expected: Semua reviews

-- Admin: Lihat semua pesanan
SELECT COUNT(*) as total_pesanan FROM pesanan_cetak;
-- Expected: Semua pesanan

-- Admin: Lihat semua pembayaran
SELECT COUNT(*) as total_pembayaran FROM pembayaran;
-- Expected: Semua pembayaran

-- Admin: Update user role
UPDATE peran_pengguna
SET aktif = true
WHERE idPengguna = 'ANY_USER_ID';
-- Expected: Success (admin can manage roles)

-- Admin: Insert kategori baru
INSERT INTO kategori (id, nama, slug, aktif)
VALUES (gen_random_uuid(), 'Test Kategori', 'test-kategori', true);
-- Expected: Success

-- Cleanup
DELETE FROM kategori WHERE slug = 'test-kategori';
```

---

## 2️⃣ Test as EDITOR

Editor hanya bisa akses:

- Naskah yang sedang direview atau status review-able
- Review yang ditugaskan ke mereka

### Set Context sebagai Editor

```sql
-- Replace dengan EDITOR_ID yang sebenarnya
SELECT set_config('request.jwt.claims',
  '{"sub": "YOUR_EDITOR_ID", "email": "editor@publishify.com"}',
  true
);

-- Verify context
SELECT public.current_user_id(), public.is_editor();
-- Expected: (editor_id, true)
```

### Test Editor Access

```sql
-- Editor: Lihat profil sendiri
SELECT * FROM pengguna WHERE id = public.current_user_id();
-- Expected: 1 row (editor's own data)

-- Editor: Lihat naskah yang bisa direview
SELECT
  id,
  judul,
  status,
  CASE
    WHEN status IN ('diajukan', 'dalam_review', 'perlu_revisi') THEN '✅ Visible'
    ELSE '❌ Hidden'
  END as visibility
FROM naskah;
-- Expected: Hanya naskah dengan status reviewable

-- Editor: TIDAK bisa lihat naskah draft penulis lain
SELECT COUNT(*) as draft_naskah
FROM naskah
WHERE status = 'draft';
-- Expected: 0 (editor tidak bisa akses draft)

-- Editor: Lihat review yang ditugaskan
SELECT * FROM review_naskah
WHERE idEditor = public.current_user_id();
-- Expected: Reviews assigned to this editor

-- Editor: Insert feedback untuk review mereka
-- (Assuming ada review dengan ID 'REVIEW_ID')
INSERT INTO feedback_review (id, idReview, komentar)
VALUES (
  gen_random_uuid(),
  'REVIEW_ID_ASSIGNED_TO_EDITOR',
  'Test feedback dari editor'
);
-- Expected: Success (if review is assigned to editor)

-- Editor: TIDAK bisa update naskah
UPDATE naskah SET judul = 'Test' WHERE id = 'ANY_NASKAH_ID';
-- Expected: 0 rows affected (editor can't update naskah)

-- Editor: TIDAK bisa lihat pembayaran
SELECT COUNT(*) FROM pembayaran;
-- Expected: 0 (editor can't see payments)

-- Cleanup
DELETE FROM feedback_review WHERE komentar = 'Test feedback dari editor';
```

---

## 3️⃣ Test as PENULIS

Penulis hanya bisa:

- Full access naskah sendiri
- Lihat review untuk naskah mereka
- Manage tags naskah sendiri

### Set Context sebagai Penulis

```sql
-- Replace dengan PENULIS_ID yang sebenarnya
SELECT set_config('request.jwt.claims',
  '{"sub": "YOUR_PENULIS_ID", "email": "penulis@publishify.com"}',
  true
);

-- Verify context
SELECT public.current_user_id(), public.is_penulis();
-- Expected: (penulis_id, true)
```

### Test Penulis Access

```sql
-- Penulis: Lihat profil sendiri
SELECT * FROM profil_pengguna WHERE idPengguna = public.current_user_id();
-- Expected: 1 row (own profile)

-- Penulis: Lihat naskah sendiri (all status)
SELECT id, judul, status
FROM naskah
WHERE idPenulis = public.current_user_id();
-- Expected: All manuscripts owned by this penulis

-- Penulis: TIDAK bisa lihat naskah penulis lain (non-published)
SELECT COUNT(*) as others_naskah
FROM naskah
WHERE idPenulis != public.current_user_id()
AND NOT (publik = true AND status = 'diterbitkan');
-- Expected: 0

-- Penulis: Bisa lihat naskah published/public
SELECT COUNT(*) as public_naskah
FROM naskah
WHERE publik = true AND status = 'diterbitkan';
-- Expected: ≥ 0 (public manuscripts)

-- Penulis: Insert naskah baru
INSERT INTO naskah (
  id, idPenulis, judul, sinopsis, idKategori, idGenre, status
)
VALUES (
  gen_random_uuid(),
  public.current_user_id(),
  'Test Naskah Penulis',
  'Ini adalah test naskah untuk verifikasi RLS',
  (SELECT id FROM kategori LIMIT 1),
  (SELECT id FROM genre LIMIT 1),
  'draft'
);
-- Expected: Success

-- Penulis: Update naskah sendiri
UPDATE naskah
SET judul = 'Test Naskah Updated'
WHERE idPenulis = public.current_user_id()
AND judul = 'Test Naskah Penulis';
-- Expected: 1 row updated

-- Penulis: TIDAK bisa update naskah orang lain
UPDATE naskah
SET judul = 'Hacked'
WHERE idPenulis != public.current_user_id();
-- Expected: 0 rows affected

-- Penulis: Lihat review untuk naskah sendiri
SELECT r.*, n.judul
FROM review_naskah r
JOIN naskah n ON n.id = r.idNaskah
WHERE n.idPenulis = public.current_user_id();
-- Expected: Reviews for own manuscripts

-- Penulis: Lihat feedback review untuk naskah sendiri
SELECT f.*, r.idNaskah
FROM feedback_review f
JOIN review_naskah r ON r.id = f.idReview
JOIN naskah n ON n.id = r.idNaskah
WHERE n.idPenulis = public.current_user_id();
-- Expected: Feedbacks for own manuscript reviews

-- Penulis: TIDAK bisa insert review (only admin/editor)
INSERT INTO review_naskah (id, idNaskah, idEditor, status)
VALUES (gen_random_uuid(), 'ANY_NASKAH_ID', 'ANY_EDITOR_ID', 'ditugaskan');
-- Expected: Error/0 rows (penulis can't create reviews)

-- Cleanup
DELETE FROM naskah
WHERE judul IN ('Test Naskah Penulis', 'Test Naskah Updated')
AND idPenulis = public.current_user_id();
```

---

## 4️⃣ Test as PERCETAKAN

Percetakan hanya bisa:

- Lihat pesanan yang assigned ke mereka
- Update status pesanan mereka
- Manage pengiriman

### Set Context sebagai Percetakan

```sql
-- Replace dengan PERCETAKAN_ID yang sebenarnya
SELECT set_config('request.jwt.claims',
  '{"sub": "YOUR_PERCETAKAN_ID", "email": "percetakan@publishify.com"}',
  true
);

-- Verify context
SELECT public.current_user_id(), public.is_percetakan();
-- Expected: (percetakan_id, true)
```

### Test Percetakan Access

```sql
-- Percetakan: Lihat pesanan assigned
SELECT * FROM pesanan_cetak
WHERE idPercetakan = public.current_user_id();
-- Expected: Orders assigned to this percetakan

-- Percetakan: Lihat pesanan belum assigned (untuk pickup)
SELECT * FROM pesanan_cetak
WHERE idPercetakan IS NULL;
-- Expected: Unassigned orders (if any)

-- Percetakan: TIDAK bisa lihat pesanan percetakan lain
SELECT COUNT(*) as others_orders
FROM pesanan_cetak
WHERE idPercetakan IS NOT NULL
AND idPercetakan != public.current_user_id();
-- Expected: 0

-- Percetakan: Update status pesanan sendiri
-- (Assuming ada pesanan dengan ID 'PESANAN_ID' assigned to this percetakan)
UPDATE pesanan_cetak
SET status = 'dalam_produksi'
WHERE id = 'PESANAN_ID_ASSIGNED_TO_PERCETAKAN'
AND idPercetakan = public.current_user_id();
-- Expected: 1 row updated (if order exists)

-- Percetakan: Insert log produksi
INSERT INTO log_produksi (id, idPesanan, tahapan, deskripsi)
VALUES (
  gen_random_uuid(),
  'PESANAN_ID_ASSIGNED_TO_PERCETAKAN',
  'Percetakan',
  'Test log produksi'
);
-- Expected: Success

-- Percetakan: Insert tracking log
-- (Assuming ada pengiriman dengan ID 'PENGIRIMAN_ID')
INSERT INTO tracking_log (id, idPengiriman, lokasi, status, waktu)
VALUES (
  gen_random_uuid(),
  'PENGIRIMAN_ID',
  'Test Lokasi',
  'Dalam Perjalanan',
  NOW()
);
-- Expected: Success (if pengiriman belongs to percetakan's order)

-- Percetakan: TIDAK bisa lihat pembayaran
SELECT COUNT(*) FROM pembayaran;
-- Expected: 0

-- Percetakan: TIDAK bisa lihat naskah (except through orders)
SELECT COUNT(*) FROM naskah;
-- Expected: 0 (percetakan doesn't have direct access to manuscripts)

-- Cleanup
DELETE FROM tracking_log WHERE lokasi = 'Test Lokasi';
DELETE FROM log_produksi WHERE deskripsi = 'Test log produksi';
```

---

## 5️⃣ Test as ANONYMOUS (No JWT)

Anonymous users hanya bisa akses public data.

### Clear Context (Anonymous)

```sql
-- Clear JWT context
SELECT set_config('request.jwt.claims', NULL, true);

-- Verify no user
SELECT public.current_user_id();
-- Expected: NULL
```

### Test Anonymous Access

```sql
-- Anonymous: Lihat user aktif & terverifikasi saja
SELECT COUNT(*) as public_users
FROM pengguna;
-- Expected: Only active + verified users

-- Anonymous: TIDAK bisa lihat user yang belum verified
SELECT COUNT(*) as unverified
FROM pengguna
WHERE terverifikasi = false;
-- Expected: 0

-- Anonymous: Lihat naskah published & public saja
SELECT COUNT(*) as public_naskah
FROM naskah
WHERE publik = true AND status = 'diterbitkan';
-- Expected: ≥ 0 (only published public manuscripts)

-- Anonymous: TIDAK bisa lihat naskah draft
SELECT COUNT(*) as draft_naskah
FROM naskah
WHERE status = 'draft';
-- Expected: 0

-- Anonymous: Lihat kategori aktif
SELECT COUNT(*) FROM kategori WHERE aktif = true;
-- Expected: All active categories

-- Anonymous: Lihat genre aktif
SELECT COUNT(*) FROM genre WHERE aktif = true;
-- Expected: All active genres

-- Anonymous: Lihat profil penulis (public)
SELECT COUNT(*) FROM profil_penulis;
-- Expected: All author profiles (public info)

-- Anonymous: TIDAK bisa lihat review
SELECT COUNT(*) FROM review_naskah;
-- Expected: 0

-- Anonymous: TIDAK bisa lihat pesanan
SELECT COUNT(*) FROM pesanan_cetak;
-- Expected: 0

-- Anonymous: TIDAK bisa lihat pembayaran
SELECT COUNT(*) FROM pembayaran;
-- Expected: 0

-- Anonymous: TIDAK bisa lihat notifikasi
SELECT COUNT(*) FROM notifikasi;
-- Expected: 0

-- Anonymous: TIDAK bisa insert anything
INSERT INTO naskah (id, idPenulis, judul, sinopsis, idKategori, idGenre)
VALUES (gen_random_uuid(), 'ANY_ID', 'Test', 'Test', 'CAT_ID', 'GENRE_ID');
-- Expected: Error/0 rows

-- Anonymous: Lihat statistik naskah public
SELECT COUNT(*) FROM statistik_naskah sn
WHERE EXISTS (
  SELECT 1 FROM naskah n
  WHERE n.id = sn.idNaskah
  AND n.publik = true
  AND n.status = 'diterbitkan'
);
-- Expected: Stats for public manuscripts

-- Anonymous: Lihat rating naskah public
SELECT COUNT(*) FROM rating_review rr
WHERE EXISTS (
  SELECT 1 FROM naskah n
  WHERE n.id = rr.idNaskah
  AND n.publik = true
  AND n.status = 'diterbitkan'
);
-- Expected: Ratings for public manuscripts
```

---

## 6️⃣ Cross-Role Security Tests

### Test 1: Penulis TIDAK bisa akses review orang lain

```sql
-- Set as Penulis 1
SELECT set_config('request.jwt.claims',
  '{"sub": "PENULIS_1_ID", "email": "penulis@publishify.com"}',
  true
);

-- Try to see reviews for other penulis' manuscripts
SELECT COUNT(*) FROM review_naskah r
JOIN naskah n ON n.id = r.idNaskah
WHERE n.idPenulis != public.current_user_id();
-- Expected: 0
```

### Test 2: Editor TIDAK bisa update naskah

```sql
-- Set as Editor
SELECT set_config('request.jwt.claims',
  '{"sub": "EDITOR_ID", "email": "editor@publishify.com"}',
  true
);

-- Try to update any naskah
UPDATE naskah SET judul = 'Hacked by Editor' WHERE id = 'ANY_NASKAH_ID';
-- Expected: 0 rows affected
```

### Test 3: Percetakan TIDAK bisa assign pesanan ke diri sendiri

```sql
-- Set as Percetakan
SELECT set_config('request.jwt.claims',
  '{"sub": "PERCETAKAN_ID", "email": "percetakan@publishify.com"}',
  true
);

-- Try to assign unassigned order (only admin can assign)
UPDATE pesanan_cetak
SET idPercetakan = public.current_user_id()
WHERE idPercetakan IS NULL;
-- Expected: 0 rows (percetakan can't self-assign)
```

### Test 4: Regular user TIDAK bisa lihat pembayaran orang lain

```sql
-- Set as User 1
SELECT set_config('request.jwt.claims',
  '{"sub": "USER_1_ID", "email": "user1@test.com"}',
  true
);

-- Try to see other user's payments
SELECT COUNT(*) FROM pembayaran
WHERE idPengguna != public.current_user_id();
-- Expected: 0
```

---

## 7️⃣ Performance Tests

### Test Query Performance dengan RLS

```sql
-- Test 1: Naskah query performance
EXPLAIN ANALYZE
SELECT * FROM naskah
WHERE publik = true AND status = 'diterbitkan'
LIMIT 10;

-- Test 2: Review query performance
EXPLAIN ANALYZE
SELECT r.*, n.judul
FROM review_naskah r
JOIN naskah n ON n.id = r.idNaskah
WHERE r.idEditor = 'EDITOR_ID'
LIMIT 10;

-- Test 3: Pesanan query performance
EXPLAIN ANALYZE
SELECT * FROM pesanan_cetak
WHERE idPemesan = 'USER_ID'
ORDER BY tanggalPesan DESC
LIMIT 10;

-- Look for:
-- - Execution time < 100ms
-- - Index scans (not seq scans)
-- - No RLS policy violations
```

---

## ✅ Expected Test Results Summary

| Role           | Pengguna  | Naskah Own | Naskah Others  | Review         | Pesanan     | Pembayaran | Admin Actions |
| -------------- | --------- | ---------- | -------------- | -------------- | ----------- | ---------- | ------------- |
| **Admin**      | ✅ All    | ✅ All     | ✅ All         | ✅ All         | ✅ All      | ✅ All     | ✅ Yes        |
| **Editor**     | ✅ Own    | ❌ No      | ✅ Reviewable  | ✅ Assigned    | ❌ No       | ❌ No      | ❌ No         |
| **Penulis**    | ✅ Own    | ✅ Own     | ✅ Public only | ✅ Own reviews | ❌ No       | ✅ Own     | ❌ No         |
| **Percetakan** | ✅ Own    | ❌ No      | ❌ No          | ❌ No          | ✅ Assigned | ❌ No      | ❌ No         |
| **Anonymous**  | ✅ Public | ❌ No      | ✅ Public      | ❌ No          | ❌ No       | ❌ No      | ❌ No         |

---

## 🐛 Common Issues & Solutions

### Issue 1: All queries return 0 rows

**Cause**: JWT context not set properly

**Solution**:

```sql
-- Check current user context
SELECT public.current_user_id();

-- If NULL, set context properly:
SELECT set_config('request.jwt.claims',
  '{"sub": "YOUR_USER_ID", "email": "user@example.com"}',
  true
);
```

### Issue 2: Admin can't access data

**Cause**: Admin role not assigned properly

**Solution**:

```sql
-- Check admin role
SELECT * FROM peran_pengguna
WHERE idPengguna = 'ADMIN_ID'
AND jenisPeran = 'admin';

-- If missing, assign admin role:
INSERT INTO peran_pengguna (id, idPengguna, jenisPeran, aktif)
VALUES (gen_random_uuid(), 'ADMIN_ID', 'admin', true);
```

### Issue 3: Queries too slow

**Cause**: Missing indexes for RLS conditions

**Solution**:

```sql
-- Add indexes for common RLS filters
CREATE INDEX IF NOT EXISTS idx_naskah_penulis_status
ON naskah(idPenulis, status);

CREATE INDEX IF NOT EXISTS idx_review_editor
ON review_naskah(idEditor);

CREATE INDEX IF NOT EXISTS idx_pesanan_pemesan
ON pesanan_cetak(idPemesan);
```

---

## 📝 Test Completion Checklist

- [ ] Admin dapat akses semua data
- [ ] Editor hanya dapat akses review assigned
- [ ] Penulis hanya dapat akses naskah sendiri
- [ ] Percetakan hanya dapat akses pesanan assigned
- [ ] Anonymous hanya dapat akses public data
- [ ] Cross-role security tests pass
- [ ] No permission escalation possible
- [ ] Query performance acceptable (< 100ms)
- [ ] All CRUD operations work correctly
- [ ] Error handling works properly

---

**Last Updated**: January 3, 2025  
**Test Coverage**: ~95 RLS policies  
**Status**: ✅ Ready for Testing
