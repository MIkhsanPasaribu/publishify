# 🚀 Panduan Deployment RLS Migration ke Supabase

## 📋 Overview

Dokumen ini menjelaskan langkah-langkah deployment file migration RLS (`20250103_enable_rls/migration.sql`) ke Supabase PostgreSQL database.

## ⚠️ Prerequisites

1. ✅ Akses ke Supabase Dashboard
2. ✅ Database sudah ada dan Prisma migrations sudah dijalankan
3. ✅ Backup database (recommended)
4. ✅ File `migration.sql` sudah siap

## 📝 Migration File Summary

- **File**: `backend/prisma/migrations/20250103_enable_rls/migration.sql`
- **Total Tables**: 28 tabel dengan RLS enabled
- **Total Policies**: ~95 RLS policies
- **Helper Functions**: 8 functions di public schema
- **Estimated Time**: 2-3 menit

## 🔧 Langkah Deployment

### Step 1: Backup Database (IMPORTANT!)

```sql
-- Di Supabase SQL Editor, jalankan:
-- Export database structure dan data
-- Atau gunakan Supabase CLI:
-- supabase db dump -f backup_$(date +%Y%m%d).sql
```

### Step 2: Login ke Supabase Dashboard

1. Buka [https://app.supabase.com](https://app.supabase.com)
2. Pilih project **Publishify**
3. Navigasi ke **SQL Editor**

### Step 3: Run Migration

1. Klik **New Query** di SQL Editor
2. Copy seluruh isi file `migration.sql`
3. Paste ke SQL Editor
4. Klik **Run** atau tekan `Ctrl+Enter`

### Step 4: Verify Deployment

Run verification queries berikut:

#### 4.1 Check RLS Enabled

```sql
-- Check bahwa RLS enabled untuk semua 28 tabel
SELECT
  tablename,
  rowsecurity,
  CASE WHEN rowsecurity THEN '✅' ELSE '❌' END as status
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
  'pengguna', 'profil_pengguna', 'peran_pengguna', 'profil_penulis',
  'naskah', 'kategori', 'genre', 'tag', 'tag_naskah', 'revisi_naskah',
  'review_naskah', 'feedback_review',
  'pesanan_cetak', 'log_produksi', 'pengiriman', 'tracking_log',
  'pembayaran',
  'notifikasi', 'token_refresh', 'log_aktivitas',
  'statistik_naskah', 'rating_review',
  'file'
)
ORDER BY tablename;

-- Expected: 28 rows dengan rowsecurity = true
```

#### 4.2 Check Helper Functions

```sql
-- Check bahwa semua helper functions sudah dibuat
SELECT
  routine_name,
  routine_schema,
  data_type as return_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN (
  'current_user_id',
  'current_user_email',
  'is_admin',
  'is_editor',
  'is_penulis',
  'is_percetakan',
  'has_role',
  'can_access_naskah'
)
ORDER BY routine_name;

-- Expected: 8 functions
```

#### 4.3 Check Policies Count

```sql
-- Count total policies per table
SELECT
  tablename,
  COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY policy_count DESC, tablename;

-- Expected: Total ~95 policies across 28 tables
```

#### 4.4 Check Specific Table Policies

```sql
-- Example: Check naskah table policies
SELECT
  policyname,
  permissive,
  cmd as operation,
  SUBSTRING(qual::text, 1, 100) as using_expression
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'naskah'
ORDER BY policyname;

-- Expected: 4 policies untuk naskah table
-- - naskah_public_select
-- - naskah_penulis_all
-- - naskah_editor_select
-- - naskah_admin_all
```

### Step 5: Test RLS Policies

Lihat file `RLS_TEST_QUERIES.md` untuk test queries lengkap.

## ✅ Success Indicators

- ✅ Semua 28 tabel memiliki `rowsecurity = true`
- ✅ 8 helper functions tersedia di public schema
- ✅ ~95 policies terbuat tanpa error
- ✅ Tidak ada error message di SQL Editor
- ✅ Test queries berjalan dengan benar

## ❌ Troubleshooting

### Error: Column does not exist

**Problem**: Column name mismatch (snake_case vs camelCase)

**Solution**:

```sql
-- Check actual column names in your database
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'pengguna'
AND table_schema = 'public';

-- Migration file sudah menggunakan camelCase sesuai Prisma schema
```

### Error: Function already exists

**Problem**: Helper functions sudah ada dari migration sebelumnya

**Solution**: Migration menggunakan `CREATE OR REPLACE FUNCTION`, jadi seharusnya tidak ada error. Tapi jika ada:

```sql
-- Drop existing functions (hati-hati!)
DROP FUNCTION IF EXISTS public.current_user_id() CASCADE;
-- ... drop other functions

-- Then re-run migration
```

### Error: Policy already exists

**Problem**: Policies sudah ada

**Solution**: Migration sudah include `DROP POLICY IF EXISTS`, jadi idempotent. Jika masih error:

```sql
-- Drop all policies untuk satu tabel
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'nama_tabel') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON ' || quote_ident('nama_tabel');
    END LOOP;
END $$;

-- Then re-run migration
```

### Error: Permission denied

**Problem**: User tidak punya permission untuk ALTER TABLE atau CREATE POLICY

**Solution**: Pastikan menggunakan user dengan SUPERUSER atau owner database:

```sql
-- Check current user permissions
SELECT current_user, usesuper FROM pg_user WHERE usename = current_user;

-- Di Supabase, gunakan postgres user (default di SQL Editor)
```

### Performance Issues

**Problem**: Queries lambat setelah RLS enabled

**Solution**:

1. Check query performance:

```sql
EXPLAIN ANALYZE SELECT * FROM naskah LIMIT 10;
```

2. Add indexes jika perlu:

```sql
-- Index untuk foreign keys (sudah ada di Prisma schema)
-- Index untuk RLS conditions
CREATE INDEX IF NOT EXISTS idx_naskah_status_publik
ON naskah(status, publik)
WHERE publik = true AND status = 'diterbitkan';
```

3. Monitor slow queries:

```sql
SELECT * FROM pg_stat_statements
WHERE query LIKE '%naskah%'
ORDER BY mean_exec_time DESC
LIMIT 10;
```

## 🔄 Rollback Procedure

Jika ada masalah dan perlu rollback:

### Option 1: Disable RLS (Quick)

```sql
-- Disable RLS untuk semua tabel (DANGER: No security!)
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'ALTER TABLE ' || quote_ident(r.tablename) || ' DISABLE ROW LEVEL SECURITY';
    END LOOP;
END $$;
```

### Option 2: Drop All Policies

```sql
-- Drop semua policies tapi keep RLS enabled
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public'
    ) LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) ||
                ' ON ' || quote_ident(r.schemaname) || '.' || quote_ident(r.tablename);
    END LOOP;
END $$;
```

### Option 3: Restore dari Backup

```bash
# Using Supabase CLI
supabase db reset --db-url "postgresql://..."

# Or using psql
psql -h db.xxx.supabase.co -U postgres -d postgres -f backup.sql
```

## 📊 Monitoring

### Check Policy Execution

```sql
-- Enable policy logging (development only)
SET log_statement = 'all';
SET log_duration = on;

-- Monitor policy evaluation
SELECT * FROM pg_stat_activity
WHERE query LIKE '%policy%'
ORDER BY query_start DESC;
```

### Performance Metrics

```sql
-- Check table sizes
SELECT
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check index usage
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan as index_scans
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;
```

## 🔐 Security Best Practices

1. **Never Disable RLS in Production**: RLS adalah security layer utama
2. **Test dengan Different Roles**: Test sebagai admin, editor, penulis, percetakan, anonymous
3. **Monitor Failed Queries**: Log queries yang gagal karena RLS
4. **Regular Security Audit**: Review policies secara berkala
5. **Keep Helper Functions Simple**: Avoid complex logic di RLS functions

## 📖 Additional Resources

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS Documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- Internal: `docs/SUPABASE_RLS_REALTIME_GUIDE.md`
- Internal: `docs/SUPABASE_RLS_QUICKSTART.md`
- Test Queries: `backend/prisma/migrations/20250103_enable_rls/RLS_TEST_QUERIES.md`

## ✅ Post-Deployment Checklist

- [ ] RLS enabled untuk semua 28 tabel
- [ ] 8 helper functions berhasil dibuat
- [ ] ~95 policies terbuat tanpa error
- [ ] Verification queries semua pass
- [ ] Test queries dengan different roles berhasil
- [ ] Backend API masih berfungsi normal
- [ ] Frontend dapat akses data sesuai role
- [ ] No performance degradation
- [ ] Backup database tersimpan aman

## 🎯 Next Steps

1. **Enable Realtime**: Run migration `20250103_enable_realtime/migration.sql`
2. **Frontend Integration**: Implement Supabase client untuk realtime subscriptions
3. **Monitor Performance**: Setup monitoring dashboard
4. **Security Audit**: Review policies dengan security team
5. **Documentation Update**: Update API documentation dengan RLS behavior

---

**Last Updated**: January 3, 2025  
**Migration Version**: 20250103_enable_rls  
**Status**: ✅ Production Ready
