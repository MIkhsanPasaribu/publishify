# Supabase Migrations - Publishify

## 📁 Migration Files

### 1. Enable Realtime (`20250103_enable_realtime/migration.sql`)

**Tujuan**: Mengaktifkan Supabase Realtime untuk semua 28 tabel

**What it does**:

- Create publication `supabase_realtime`
- Add 28 tables ke realtime publication
- Set `REPLICA IDENTITY FULL` untuk semua tabel
- Enable real-time INSERT, UPDATE, DELETE events

**Tables enabled**:

- User Management (4): pengguna, profil_pengguna, peran_pengguna, profil_penulis
- Content (8): naskah, revisi_naskah, kategori, genre, tag, tag_naskah
- Review (2): review_naskah, feedback_review
- Printing (4): pesanan_cetak, log_produksi, pengiriman, tracking_log
- Payment (1): pembayaran
- Notification (1): notifikasi
- Auth (2): token_refresh, log_aktivitas
- Analytics (2): statistik_naskah, rating_review
- Storage (1): file

**Run Order**: #1 (Run first)

---

### 2. Enable RLS (`20250103_enable_rls/migration.sql`)

**Tujuan**: Implementasi Row Level Security komprehensif

**What it does**:

- Create helper functions: `auth.uid()`, `is_admin()`, `is_editor()`, `is_penulis()`, `is_percetakan()`
- Enable RLS untuk 28 tabel
- Implementasi 80+ security policies
- Grant permissions untuk authenticated & anon users
- Create performance indexes

**RLS Policies Summary**:

1. **Pengguna & Profil** (15 policies)
   - Public: Melihat user aktif & terverifikasi
   - Own: Manage data sendiri
   - Admin: Full access

2. **Naskah & Content** (25 policies)
   - Public: Naskah yang published & publik
   - Penulis: Full access naskah sendiri
   - Editor: Akses naskah yang direview
   - Admin: Full access

3. **Review System** (10 policies)
   - Penulis: Melihat review naskah sendiri
   - Editor: Manage review yang assigned
   - Admin: Assign & manage all

4. **Printing System** (15 policies)
   - Pemesan: Full access pesanan sendiri
   - Percetakan: Manage pesanan assigned
   - Admin: Full access

5. **Payment** (4 policies) ⚠️ STRICT
   - User: Hanya akses pembayaran sendiri
   - Admin: Verify & manage

6. **Supporting Systems** (15 policies)
   - Notifikasi: User own, Admin insert
   - Tokens: User own, Admin manage
   - Logs: User read own, System insert
   - Stats: Public read published, Penulis own
   - Files: User own, Public read avatar/sampul

**Run Order**: #2 (Run after realtime)

---

## 🚀 How to Apply

### Method 1: Supabase Dashboard (Recommended)

1. Login ke [Supabase Dashboard](https://app.supabase.com)
2. Pilih project Publishify
3. Go to **SQL Editor**
4. Click **New Query**
5. Copy-paste isi `20250103_enable_realtime/migration.sql`
6. Click **Run** or press `Ctrl+Enter`
7. Verify success (no errors)
8. Repeat steps 4-7 untuk `20250103_enable_rls/migration.sql`

### Method 2: Prisma Migrate

```bash
cd backend

# Push schema to database
bun prisma db push

# Or run migrations
bun prisma migrate deploy
```

### Method 3: Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref YOUR_PROJECT_REF

# Apply migrations
supabase db push
```

---

## ✅ Verification

### Check Realtime Setup

```sql
-- Check publication exists
SELECT * FROM pg_publication WHERE pubname = 'supabase_realtime';

-- List all realtime tables (should return 28)
SELECT schemaname, tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;

-- Check replica identity (should all be FULL)
SELECT schemaname, tablename,
  CASE
    WHEN c.relreplident = 'f' THEN 'FULL'
    WHEN c.relreplident = 'd' THEN 'DEFAULT'
    WHEN c.relreplident = 'i' THEN 'INDEX'
    WHEN c.relreplident = 'n' THEN 'NOTHING'
  END as replica_identity
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
AND c.relkind = 'r'
ORDER BY c.relname;
```

### Check RLS Setup

```sql
-- Check RLS enabled (should all return true)
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Count policies (should return 80+)
SELECT COUNT(*) as total_policies
FROM pg_policies
WHERE schemaname = 'public';

-- List policies by table
SELECT tablename, COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY policy_count DESC;

-- Check helper functions exist
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'auth' OR routine_name LIKE 'is_%'
ORDER BY routine_name;
```

---

## 🧪 Testing

### Test Realtime

```typescript
// Frontend test
import { supabase } from '@/lib/supabase';

const channel = supabase
  .channel('test-realtime')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'notifikasi',
    },
    (payload) => {
      console.log('✅ Realtime working:', payload);
    },
  )
  .subscribe();

// Insert test data di backend atau SQL Editor
// INSERT INTO notifikasi (id_pengguna, judul, pesan)
// VALUES ('test-uuid', 'Test', 'Testing realtime');
```

### Test RLS

```sql
-- Set test JWT claims
SELECT set_config('request.jwt.claims',
  '{"sub": "penulis-uuid", "email": "penulis@test.com", "role": "penulis"}',
  true
);

-- Test: Penulis hanya bisa lihat naskah sendiri
SELECT COUNT(*) FROM naskah;
-- Should only return naskah where id_penulis = 'penulis-uuid'

-- Test: Editor bisa lihat naskah yang direview
SELECT set_config('request.jwt.claims',
  '{"sub": "editor-uuid", "email": "editor@test.com", "role": "editor"}',
  true
);
SELECT COUNT(*) FROM naskah;
-- Should only return naskah in review status or assigned to this editor

-- Clear context
SELECT set_config('request.jwt.claims', NULL, true);
```

---

## ⚠️ Important Notes

### Before Running

1. **Backup Database**: Always backup before running migrations

   ```bash
   # Via Supabase CLI
   supabase db dump -f backup.sql
   ```

2. **Test Environment**: Run di staging/development environment dulu
3. **Check Dependencies**: Pastikan tables sudah exist (run Prisma migrations dulu)

### After Running

1. **Verify**: Jalankan verification queries di atas
2. **Test**: Test RLS policies dengan berbagai roles
3. **Monitor**: Check logs untuk RLS violations atau errors
4. **Performance**: Monitor query performance dengan RLS enabled

### Rollback

Jika ada masalah:

```sql
-- Disable RLS sementara
ALTER TABLE nama_tabel DISABLE ROW LEVEL SECURITY;

-- Drop specific policy
DROP POLICY "policy_name" ON nama_tabel;

-- Drop publication
DROP PUBLICATION supabase_realtime;
```

---

## 🔧 Troubleshooting

### Migration Fails

**Error**: `publication "supabase_realtime" already exists`

```sql
-- Fix: Drop and recreate
DROP PUBLICATION IF EXISTS supabase_realtime CASCADE;
-- Then re-run migration
```

**Error**: `function auth.uid() does not exist`

```sql
-- Fix: Create schema auth first
CREATE SCHEMA IF NOT EXISTS auth;
GRANT USAGE ON SCHEMA auth TO authenticated, anon;
-- Then re-run migration
```

**Error**: `permission denied for table`

```sql
-- Fix: Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
-- Then re-run migration
```

### RLS Too Strict

Jika RLS terlalu strict dan block legitimate access:

1. Check policy conditions
2. Verify JWT claims di-set correctly
3. Test dengan admin role untuk isolate issue
4. Review helper functions (is_admin, etc)

### Performance Issues

Jika RLS memperlambat queries:

```sql
-- Add indexes untuk RLS lookups
CREATE INDEX IF NOT EXISTS idx_naskah_penulis ON naskah(id_penulis);
CREATE INDEX IF NOT EXISTS idx_review_editor ON review_naskah(id_editor);
-- Etc (sudah included di migration)
```

---

## 📚 Related Docs

- **Quick Start**: `docs/SUPABASE_RLS_QUICKSTART.md`
- **Full Guide**: `docs/SUPABASE_RLS_REALTIME_GUIDE.md`
- **Database Schema**: `docs/database-schema.md`
- **Prisma Schema**: `prisma/schema.prisma`

---

**Last Updated**: 2025-01-03  
**Migration Version**: v1.0.0  
**Status**: Ready for Production
