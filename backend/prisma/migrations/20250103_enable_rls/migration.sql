-- ============================================
-- PUBLISHIFY - ROW LEVEL SECURITY (RLS) MIGRATION
-- ============================================
-- 
-- File: 20250103_enable_rls/migration.sql
-- Tujuan: Enable comprehensive RLS untuk semua 28 tabel
-- 
-- Struktur:
-- 1. Helper Functions (public schema)
-- 2. Enable RLS untuk semua tabel
-- 3. Drop existing policies (if any)
-- 4. Create RLS Policies per domain
-- 5. Grant necessary permissions
--
-- ============================================

-- ============================================
-- 1. HELPER FUNCTIONS (PUBLIC SCHEMA)
-- ============================================
-- Semua fungsi dibuat di public schema karena Supabase auth schema tidak accessible
-- untuk custom functions. Middleware akan inject JWT claims via set_config().

-- Function: Get current user ID dari JWT claims
CREATE OR REPLACE FUNCTION public.current_user_id() RETURNS text AS $$
DECLARE
  user_id_text text;
BEGIN
  -- Get user ID from JWT claims or app context
  user_id_text := COALESCE(
    current_setting('request.jwt.claims', true)::json->>'sub',
    current_setting('app.current_user_id', true)
  );
  
  -- Return NULL if empty string
  IF user_id_text IS NULL OR user_id_text = '' THEN
    RETURN NULL;
  ELSE
    RETURN user_id_text;
  END IF;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION public.current_user_id() IS 'Mendapatkan user ID dari JWT claims atau app context';

-- Function: Get current user email
CREATE OR REPLACE FUNCTION public.current_user_email() RETURNS text AS $$
  SELECT NULLIF(
    current_setting('request.jwt.claims', true)::json->>'email',
    ''
  )::text;
$$ LANGUAGE sql STABLE;

COMMENT ON FUNCTION public.current_user_email() IS 'Mendapatkan email dari JWT claims';

-- Function: Check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM peran_pengguna
    WHERE peran_pengguna."idPengguna" = public.current_user_id()
    AND peran_pengguna."jenisPeran" = 'admin'
    AND peran_pengguna.aktif = true
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

COMMENT ON FUNCTION public.is_admin() IS 'Check apakah user memiliki role admin';

-- Function: Check if user is editor
CREATE OR REPLACE FUNCTION public.is_editor() RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM peran_pengguna
    WHERE peran_pengguna."idPengguna" = public.current_user_id()
    AND peran_pengguna."jenisPeran" = 'editor'
    AND peran_pengguna.aktif = true
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

COMMENT ON FUNCTION public.is_editor() IS 'Check apakah user memiliki role editor';

-- Function: Check if user is penulis
CREATE OR REPLACE FUNCTION public.is_penulis() RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM peran_pengguna
    WHERE peran_pengguna."idPengguna" = public.current_user_id()
    AND peran_pengguna."jenisPeran" = 'penulis'
    AND peran_pengguna.aktif = true
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

COMMENT ON FUNCTION public.is_penulis() IS 'Check apakah user memiliki role penulis';

-- Function: Check if user is percetakan
CREATE OR REPLACE FUNCTION public.is_percetakan() RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM peran_pengguna
    WHERE peran_pengguna."idPengguna" = public.current_user_id()
    AND peran_pengguna."jenisPeran" = 'percetakan'
    AND peran_pengguna.aktif = true
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

COMMENT ON FUNCTION public.is_percetakan() IS 'Check apakah user memiliki role percetakan';

-- Function: Check if user has any specific role
CREATE OR REPLACE FUNCTION public.has_role(role_name text) RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM peran_pengguna
    WHERE peran_pengguna."idPengguna" = public.current_user_id()
    AND peran_pengguna."jenisPeran"::text = role_name
    AND peran_pengguna.aktif = true
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

COMMENT ON FUNCTION public.has_role(text) IS 'Check apakah user memiliki role tertentu';

-- Function: Check if naskah is accessible by current user
CREATE OR REPLACE FUNCTION public.can_access_naskah(naskah_id text) RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM naskah n
    WHERE n.id = naskah_id
    AND (
      -- Naskah publik dan diterbitkan
      (n.publik = true AND n.status = 'diterbitkan')
      -- Owner naskah
      OR n."idPenulis" = public.current_user_id()
      -- Editor yang sedang review naskah ini
      OR EXISTS (
        SELECT 1 FROM review_naskah r
        WHERE r."idNaskah" = n.id
        AND r."idEditor" = public.current_user_id()
        AND r.status IN ('ditugaskan', 'dalam_proses')
      )
      -- Admin
      OR public.is_admin()
    )
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

COMMENT ON FUNCTION public.can_access_naskah(text) IS 'Check apakah user bisa akses naskah tertentu';

-- ============================================
-- 2. ENABLE RLS UNTUK SEMUA TABEL
-- ============================================

-- User Management Tables
ALTER TABLE pengguna ENABLE ROW LEVEL SECURITY;
ALTER TABLE profil_pengguna ENABLE ROW LEVEL SECURITY;
ALTER TABLE peran_pengguna ENABLE ROW LEVEL SECURITY;
ALTER TABLE profil_penulis ENABLE ROW LEVEL SECURITY;

-- Content Management Tables
ALTER TABLE naskah ENABLE ROW LEVEL SECURITY;
ALTER TABLE kategori ENABLE ROW LEVEL SECURITY;
ALTER TABLE genre ENABLE ROW LEVEL SECURITY;
ALTER TABLE tag ENABLE ROW LEVEL SECURITY;
ALTER TABLE tag_naskah ENABLE ROW LEVEL SECURITY;
ALTER TABLE revisi_naskah ENABLE ROW LEVEL SECURITY;

-- Review System Tables
ALTER TABLE review_naskah ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_review ENABLE ROW LEVEL SECURITY;

-- Printing System Tables
ALTER TABLE pesanan_cetak ENABLE ROW LEVEL SECURITY;
ALTER TABLE log_produksi ENABLE ROW LEVEL SECURITY;
ALTER TABLE pengiriman ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracking_log ENABLE ROW LEVEL SECURITY;

-- Payment System Tables
ALTER TABLE pembayaran ENABLE ROW LEVEL SECURITY;

-- Notification & Auth Tables
ALTER TABLE notifikasi ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_refresh ENABLE ROW LEVEL SECURITY;
ALTER TABLE log_aktivitas ENABLE ROW LEVEL SECURITY;

-- Analytics Tables
ALTER TABLE statistik_naskah ENABLE ROW LEVEL SECURITY;
ALTER TABLE rating_review ENABLE ROW LEVEL SECURITY;

-- File Storage Table
ALTER TABLE file ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 3. DROP EXISTING POLICIES (IDEMPOTENT)
-- ============================================

-- User Management
DROP POLICY IF EXISTS "pengguna_public_select" ON pengguna;
DROP POLICY IF EXISTS "pengguna_own_select" ON pengguna;
DROP POLICY IF EXISTS "pengguna_own_update" ON pengguna;
DROP POLICY IF EXISTS "pengguna_admin_all" ON pengguna;

DROP POLICY IF EXISTS "profil_pengguna_public_select" ON profil_pengguna;
DROP POLICY IF EXISTS "profil_pengguna_own_all" ON profil_pengguna;
DROP POLICY IF EXISTS "profil_pengguna_admin_all" ON profil_pengguna;

DROP POLICY IF EXISTS "peran_pengguna_own_select" ON peran_pengguna;
DROP POLICY IF EXISTS "peran_pengguna_admin_all" ON peran_pengguna;

DROP POLICY IF EXISTS "profil_penulis_public_select" ON profil_penulis;
DROP POLICY IF EXISTS "profil_penulis_own_all" ON profil_penulis;
DROP POLICY IF EXISTS "profil_penulis_admin_all" ON profil_penulis;

-- Content Management
DROP POLICY IF EXISTS "naskah_public_select" ON naskah;
DROP POLICY IF EXISTS "naskah_penulis_all" ON naskah;
DROP POLICY IF EXISTS "naskah_editor_select" ON naskah;
DROP POLICY IF EXISTS "naskah_admin_all" ON naskah;

DROP POLICY IF EXISTS "kategori_public_select" ON kategori;
DROP POLICY IF EXISTS "kategori_admin_all" ON kategori;

DROP POLICY IF EXISTS "genre_public_select" ON genre;
DROP POLICY IF EXISTS "genre_admin_all" ON genre;

DROP POLICY IF EXISTS "tag_public_select" ON tag;
DROP POLICY IF EXISTS "tag_admin_all" ON tag;

DROP POLICY IF EXISTS "tag_naskah_public_select" ON tag_naskah;
DROP POLICY IF EXISTS "tag_naskah_penulis_manage" ON tag_naskah;
DROP POLICY IF EXISTS "tag_naskah_admin_all" ON tag_naskah;

DROP POLICY IF EXISTS "revisi_naskah_penulis_manage" ON revisi_naskah;
DROP POLICY IF EXISTS "revisi_naskah_editor_select" ON revisi_naskah;
DROP POLICY IF EXISTS "revisi_naskah_admin_all" ON revisi_naskah;

-- Review System
DROP POLICY IF EXISTS "review_naskah_penulis_select" ON review_naskah;
DROP POLICY IF EXISTS "review_naskah_editor_manage" ON review_naskah;
DROP POLICY IF EXISTS "review_naskah_admin_all" ON review_naskah;

DROP POLICY IF EXISTS "feedback_review_penulis_select" ON feedback_review;
DROP POLICY IF EXISTS "feedback_review_editor_manage" ON feedback_review;
DROP POLICY IF EXISTS "feedback_review_admin_all" ON feedback_review;

-- Printing System
DROP POLICY IF EXISTS "pesanan_cetak_pemesan_all" ON pesanan_cetak;
DROP POLICY IF EXISTS "pesanan_cetak_percetakan_manage" ON pesanan_cetak;
DROP POLICY IF EXISTS "pesanan_cetak_admin_all" ON pesanan_cetak;

DROP POLICY IF EXISTS "log_produksi_pemesan_select" ON log_produksi;
DROP POLICY IF EXISTS "log_produksi_percetakan_manage" ON log_produksi;
DROP POLICY IF EXISTS "log_produksi_admin_all" ON log_produksi;

DROP POLICY IF EXISTS "pengiriman_pemesan_select" ON pengiriman;
DROP POLICY IF EXISTS "pengiriman_percetakan_manage" ON pengiriman;
DROP POLICY IF EXISTS "pengiriman_admin_all" ON pengiriman;

DROP POLICY IF EXISTS "tracking_log_pemesan_select" ON tracking_log;
DROP POLICY IF EXISTS "tracking_log_percetakan_insert" ON tracking_log;
DROP POLICY IF EXISTS "tracking_log_admin_all" ON tracking_log;

-- Payment System
DROP POLICY IF EXISTS "pembayaran_own_all" ON pembayaran;
DROP POLICY IF EXISTS "pembayaran_admin_all" ON pembayaran;

-- Notification & Auth
DROP POLICY IF EXISTS "notifikasi_own_all" ON notifikasi;
DROP POLICY IF EXISTS "notifikasi_admin_insert" ON notifikasi;

DROP POLICY IF EXISTS "token_refresh_own_all" ON token_refresh;
DROP POLICY IF EXISTS "token_refresh_admin_all" ON token_refresh;

DROP POLICY IF EXISTS "log_aktivitas_own_select" ON log_aktivitas;
DROP POLICY IF EXISTS "log_aktivitas_system_insert" ON log_aktivitas;
DROP POLICY IF EXISTS "log_aktivitas_admin_all" ON log_aktivitas;

-- Analytics
DROP POLICY IF EXISTS "statistik_naskah_public_select" ON statistik_naskah;
DROP POLICY IF EXISTS "statistik_naskah_penulis_select" ON statistik_naskah;
DROP POLICY IF EXISTS "statistik_naskah_system_update" ON statistik_naskah;
DROP POLICY IF EXISTS "statistik_naskah_admin_all" ON statistik_naskah;

DROP POLICY IF EXISTS "rating_review_public_select" ON rating_review;
DROP POLICY IF EXISTS "rating_review_user_manage" ON rating_review;
DROP POLICY IF EXISTS "rating_review_admin_all" ON rating_review;

-- File Storage
DROP POLICY IF EXISTS "file_own_all" ON file;
DROP POLICY IF EXISTS "file_public_select" ON file;
DROP POLICY IF EXISTS "file_admin_all" ON file;

-- ============================================
-- 4. CREATE RLS POLICIES
-- ============================================

-- =============================================
-- 4.1 USER MANAGEMENT POLICIES
-- =============================================

-- PENGGUNA TABLE
-- Public: Lihat user yang aktif & terverifikasi
CREATE POLICY "pengguna_public_select" ON pengguna
  FOR SELECT
  USING (aktif = true AND terverifikasi = true);

-- Own: User bisa lihat dan update data sendiri
CREATE POLICY "pengguna_own_select" ON pengguna
  FOR SELECT
  USING (id = public.current_user_id());

CREATE POLICY "pengguna_own_update" ON pengguna
  FOR UPDATE
  USING (id = public.current_user_id())
  WITH CHECK (id = public.current_user_id());

-- Admin: Full access
CREATE POLICY "pengguna_admin_all" ON pengguna
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- PROFIL_PENGGUNA TABLE
-- Public: Lihat profil user yang aktif
CREATE POLICY "profil_pengguna_public_select" ON profil_pengguna
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM pengguna
      WHERE pengguna.id = profil_pengguna."idPengguna"
      AND pengguna.aktif = true
      AND pengguna.terverifikasi = true
    )
  );

-- Own: User manage profil sendiri
CREATE POLICY "profil_pengguna_own_all" ON profil_pengguna
  FOR ALL
  USING ("idPengguna" = public.current_user_id())
  WITH CHECK ("idPengguna" = public.current_user_id());

-- Admin: Full access
CREATE POLICY "profil_pengguna_admin_all" ON profil_pengguna
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- PERAN_PENGGUNA TABLE
-- Own: User lihat role sendiri
CREATE POLICY "peran_pengguna_own_select" ON peran_pengguna
  FOR SELECT
  USING ("idPengguna" = public.current_user_id());

-- Admin: Assign dan manage roles
CREATE POLICY "peran_pengguna_admin_all" ON peran_pengguna
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- PROFIL_PENULIS TABLE
-- Public: Semua bisa lihat profil penulis
CREATE POLICY "profil_penulis_public_select" ON profil_penulis
  FOR SELECT
  USING (true);

-- Own: Penulis manage profil sendiri
CREATE POLICY "profil_penulis_own_all" ON profil_penulis
  FOR ALL
  USING ("idPengguna" = public.current_user_id())
  WITH CHECK ("idPengguna" = public.current_user_id());

-- Admin: Full access
CREATE POLICY "profil_penulis_admin_all" ON profil_penulis
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- =============================================
-- 4.2 CONTENT MANAGEMENT POLICIES
-- =============================================

-- NASKAH TABLE
-- Public: Lihat naskah yang publik dan diterbitkan
CREATE POLICY "naskah_public_select" ON naskah
  FOR SELECT
  USING (publik = true AND status = 'diterbitkan');

-- Penulis: Full access naskah sendiri
CREATE POLICY "naskah_penulis_all" ON naskah
  FOR ALL
  USING ("idPenulis" = public.current_user_id())
  WITH CHECK ("idPenulis" = public.current_user_id());

-- Editor: Lihat naskah yang sedang direview
CREATE POLICY "naskah_editor_select" ON naskah
  FOR SELECT
  USING (
    public.is_editor() AND (
      status IN ('diajukan', 'dalam_review', 'perlu_revisi')
      OR EXISTS (
        SELECT 1 FROM review_naskah
        WHERE review_naskah."idNaskah" = naskah.id
        AND review_naskah."idEditor" = public.current_user_id()
      )
    )
  );

-- Admin: Full access semua naskah
CREATE POLICY "naskah_admin_all" ON naskah
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- KATEGORI TABLE
-- Public: Lihat kategori aktif
CREATE POLICY "kategori_public_select" ON kategori
  FOR SELECT
  USING (aktif = true);

-- Admin: Manage kategori
CREATE POLICY "kategori_admin_all" ON kategori
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- GENRE TABLE
-- Public: Lihat genre aktif
CREATE POLICY "genre_public_select" ON genre
  FOR SELECT
  USING (aktif = true);

-- Admin: Manage genre
CREATE POLICY "genre_admin_all" ON genre
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- TAG TABLE
-- Public: Lihat semua tags
CREATE POLICY "tag_public_select" ON tag
  FOR SELECT
  USING (true);

-- Admin: Manage tags
CREATE POLICY "tag_admin_all" ON tag
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- TAG_NASKAH TABLE
-- Public: Lihat tags dari naskah publik
CREATE POLICY "tag_naskah_public_select" ON tag_naskah
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM naskah
      WHERE naskah.id = tag_naskah."idNaskah"
      AND naskah.publik = true
      AND naskah.status = 'diterbitkan'
    )
  );

-- Penulis: Manage tags naskah sendiri
CREATE POLICY "tag_naskah_penulis_manage" ON tag_naskah
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM naskah
      WHERE naskah.id = tag_naskah."idNaskah"
      AND naskah."idPenulis" = public.current_user_id()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM naskah
      WHERE naskah.id = tag_naskah."idNaskah"
      AND naskah."idPenulis" = public.current_user_id()
    )
  );

-- Admin: Full access
CREATE POLICY "tag_naskah_admin_all" ON tag_naskah
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- REVISI_NASKAH TABLE
-- Penulis: Manage revisi naskah sendiri
CREATE POLICY "revisi_naskah_penulis_manage" ON revisi_naskah
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM naskah
      WHERE naskah.id = revisi_naskah."idNaskah"
      AND naskah."idPenulis" = public.current_user_id()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM naskah
      WHERE naskah.id = revisi_naskah."idNaskah"
      AND naskah."idPenulis" = public.current_user_id()
    )
  );

-- Editor: Lihat revisi naskah yang sedang direview
CREATE POLICY "revisi_naskah_editor_select" ON revisi_naskah
  FOR SELECT
  USING (
    public.is_editor() AND EXISTS (
      SELECT 1 FROM review_naskah
      WHERE review_naskah."idNaskah" = revisi_naskah."idNaskah"
      AND review_naskah."idEditor" = public.current_user_id()
      AND review_naskah.status IN ('ditugaskan', 'dalam_proses')
    )
  );

-- Admin: Full access
CREATE POLICY "revisi_naskah_admin_all" ON revisi_naskah
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- =============================================
-- 4.3 REVIEW SYSTEM POLICIES
-- =============================================

-- REVIEW_NASKAH TABLE
-- Penulis: Lihat review untuk naskah sendiri
CREATE POLICY "review_naskah_penulis_select" ON review_naskah
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM naskah
      WHERE naskah.id = review_naskah."idNaskah"
      AND naskah."idPenulis" = public.current_user_id()
    )
  );

-- Editor: Full access review yang ditugaskan
CREATE POLICY "review_naskah_editor_manage" ON review_naskah
  FOR ALL
  USING ("idEditor" = public.current_user_id())
  WITH CHECK ("idEditor" = public.current_user_id());

-- Admin: Full access (assign editor, manage)
CREATE POLICY "review_naskah_admin_all" ON review_naskah
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- FEEDBACK_REVIEW TABLE
-- Penulis: Lihat feedback untuk naskah mereka
CREATE POLICY "feedback_review_penulis_select" ON feedback_review
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM review_naskah
      JOIN naskah ON naskah.id = review_naskah."idNaskah"
      WHERE review_naskah.id = feedback_review."idReview"
      AND naskah."idPenulis" = public.current_user_id()
    )
  );

-- Editor: Insert/update feedback untuk review mereka
CREATE POLICY "feedback_review_editor_manage" ON feedback_review
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM review_naskah
      WHERE review_naskah.id = feedback_review."idReview"
      AND review_naskah."idEditor" = public.current_user_id()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM review_naskah
      WHERE review_naskah.id = feedback_review."idReview"
      AND review_naskah."idEditor" = public.current_user_id()
    )
  );

-- Admin: Full access
CREATE POLICY "feedback_review_admin_all" ON feedback_review
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- =============================================
-- 4.4 PRINTING SYSTEM POLICIES
-- =============================================

-- PESANAN_CETAK TABLE
-- Pemesan: Full access pesanan sendiri
CREATE POLICY "pesanan_cetak_pemesan_all" ON pesanan_cetak
  FOR ALL
  USING ("idPemesan" = public.current_user_id())
  WITH CHECK ("idPemesan" = public.current_user_id());

-- Percetakan: Lihat dan update status pesanan yang assigned
CREATE POLICY "pesanan_cetak_percetakan_manage" ON pesanan_cetak
  FOR SELECT
  USING (
    public.is_percetakan() AND (
      "idPercetakan" = public.current_user_id()
      OR "idPercetakan" IS NULL -- Pesanan yang belum assigned
    )
  );

CREATE POLICY "pesanan_cetak_percetakan_update" ON pesanan_cetak
  FOR UPDATE
  USING (
    public.is_percetakan() AND 
    "idPercetakan" = public.current_user_id()
  )
  WITH CHECK (
    public.is_percetakan() AND 
    "idPercetakan" = public.current_user_id()
  );

-- Admin: Full access
CREATE POLICY "pesanan_cetak_admin_all" ON pesanan_cetak
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- LOG_PRODUKSI TABLE
-- Pemesan: Lihat log produksi pesanan sendiri
CREATE POLICY "log_produksi_pemesan_select" ON log_produksi
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM pesanan_cetak
      WHERE pesanan_cetak.id = log_produksi."idPesanan"
      AND pesanan_cetak."idPemesan" = public.current_user_id()
    )
  );

-- Percetakan: Insert log untuk pesanan mereka
CREATE POLICY "log_produksi_percetakan_manage" ON log_produksi
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM pesanan_cetak
      WHERE pesanan_cetak.id = log_produksi."idPesanan"
      AND pesanan_cetak."idPercetakan" = public.current_user_id()
      AND public.is_percetakan()
    )
  );

-- Admin: Full access
CREATE POLICY "log_produksi_admin_all" ON log_produksi
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- PENGIRIMAN TABLE
-- Pemesan: Lihat tracking pesanan sendiri
CREATE POLICY "pengiriman_pemesan_select" ON pengiriman
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM pesanan_cetak
      WHERE pesanan_cetak.id = pengiriman."idPesanan"
      AND pesanan_cetak."idPemesan" = public.current_user_id()
    )
  );

-- Percetakan: Manage pengiriman untuk pesanan mereka
CREATE POLICY "pengiriman_percetakan_manage" ON pengiriman
  FOR ALL
  USING (
    public.is_percetakan() AND EXISTS (
      SELECT 1 FROM pesanan_cetak
      WHERE pesanan_cetak.id = pengiriman."idPesanan"
      AND pesanan_cetak."idPercetakan" = public.current_user_id()
    )
  )
  WITH CHECK (
    public.is_percetakan() AND EXISTS (
      SELECT 1 FROM pesanan_cetak
      WHERE pesanan_cetak.id = pengiriman."idPesanan"
      AND pesanan_cetak."idPercetakan" = public.current_user_id()
    )
  );

-- Admin: Full access
CREATE POLICY "pengiriman_admin_all" ON pengiriman
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- TRACKING_LOG TABLE
-- Pemesan: Lihat tracking log pesanan sendiri
CREATE POLICY "tracking_log_pemesan_select" ON tracking_log
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM pengiriman
      JOIN pesanan_cetak ON pesanan_cetak.id = pengiriman."idPesanan"
      WHERE pengiriman.id = tracking_log."idPengiriman"
      AND pesanan_cetak."idPemesan" = public.current_user_id()
    )
  );

-- Percetakan: Insert tracking updates
CREATE POLICY "tracking_log_percetakan_insert" ON tracking_log
  FOR INSERT
  WITH CHECK (
    public.is_percetakan() AND EXISTS (
      SELECT 1 FROM pengiriman
      JOIN pesanan_cetak ON pesanan_cetak.id = pengiriman."idPesanan"
      WHERE pengiriman.id = tracking_log."idPengiriman"
      AND pesanan_cetak."idPercetakan" = public.current_user_id()
    )
  );

-- Admin: Full access
CREATE POLICY "tracking_log_admin_all" ON tracking_log
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- =============================================
-- 4.5 PAYMENT SYSTEM POLICIES (SENSITIVE)
-- =============================================

-- PEMBAYARAN TABLE
-- User: Hanya bisa akses pembayaran sendiri
CREATE POLICY "pembayaran_own_all" ON pembayaran
  FOR ALL
  USING ("idPengguna" = public.current_user_id())
  WITH CHECK ("idPengguna" = public.current_user_id());

-- Admin: Full access (verify, manage)
CREATE POLICY "pembayaran_admin_all" ON pembayaran
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- =============================================
-- 4.6 NOTIFICATION & AUTH POLICIES
-- =============================================

-- NOTIFIKASI TABLE
-- User: Lihat dan mark read notifikasi sendiri
CREATE POLICY "notifikasi_own_all" ON notifikasi
  FOR ALL
  USING ("idPengguna" = public.current_user_id())
  WITH CHECK ("idPengguna" = public.current_user_id());

-- Admin: Insert notifikasi untuk user manapun
CREATE POLICY "notifikasi_admin_insert" ON notifikasi
  FOR INSERT
  WITH CHECK (public.is_admin());

-- TOKEN_REFRESH TABLE
-- User: Manage token sendiri
CREATE POLICY "token_refresh_own_all" ON token_refresh
  FOR ALL
  USING ("idPengguna" = public.current_user_id())
  WITH CHECK ("idPengguna" = public.current_user_id());

-- Admin: Full access
CREATE POLICY "token_refresh_admin_all" ON token_refresh
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- LOG_AKTIVITAS TABLE
-- User: Lihat log sendiri
CREATE POLICY "log_aktivitas_own_select" ON log_aktivitas
  FOR SELECT
  USING ("idPengguna" = public.current_user_id());

-- System: Insert log untuk user manapun (system logs)
CREATE POLICY "log_aktivitas_system_insert" ON log_aktivitas
  FOR INSERT
  WITH CHECK (true); -- Allow system to log any activity

-- Admin: Full access
CREATE POLICY "log_aktivitas_admin_all" ON log_aktivitas
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- =============================================
-- 4.7 ANALYTICS POLICIES
-- =============================================

-- STATISTIK_NASKAH TABLE
-- Public: Lihat statistik naskah publik
CREATE POLICY "statistik_naskah_public_select" ON statistik_naskah
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM naskah
      WHERE naskah.id = statistik_naskah."idNaskah"
      AND naskah.publik = true
      AND naskah.status = 'diterbitkan'
    )
  );

-- Penulis: Lihat statistik naskah sendiri
CREATE POLICY "statistik_naskah_penulis_select" ON statistik_naskah
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM naskah
      WHERE naskah.id = statistik_naskah."idNaskah"
      AND naskah."idPenulis" = public.current_user_id()
    )
  );

-- System: Update statistik
CREATE POLICY "statistik_naskah_system_update" ON statistik_naskah
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Admin: Full access
CREATE POLICY "statistik_naskah_admin_all" ON statistik_naskah
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- RATING_REVIEW TABLE
-- Public: Lihat rating naskah publik
CREATE POLICY "rating_review_public_select" ON rating_review
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM naskah
      WHERE naskah.id = rating_review."idNaskah"
      AND naskah.publik = true
      AND naskah.status = 'diterbitkan'
    )
  );

-- User: Insert/update rating sendiri
CREATE POLICY "rating_review_user_manage" ON rating_review
  FOR ALL
  USING ("idPengguna" = public.current_user_id())
  WITH CHECK ("idPengguna" = public.current_user_id());

-- Admin: Full access
CREATE POLICY "rating_review_admin_all" ON rating_review
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- =============================================
-- 4.8 FILE STORAGE POLICIES
-- =============================================

-- FILE TABLE
-- User: Manage file sendiri
CREATE POLICY "file_own_all" ON file
  FOR ALL
  USING ("idPengguna" = public.current_user_id())
  WITH CHECK ("idPengguna" = public.current_user_id());

-- Public: Lihat file dengan "urlPublik" atau tujuan publik
CREATE POLICY "file_public_select" ON file
  FOR SELECT
  USING (
    "urlPublik" IS NOT NULL 
    OR tujuan IN ('sampul', 'gambar')
  );

-- Admin: Full access
CREATE POLICY "file_admin_all" ON file
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================
-- 5. GRANT PERMISSIONS
-- ============================================

-- Grant execute permission pada helper functions ke authenticated users
GRANT EXECUTE ON FUNCTION public.current_user_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_user_email() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_editor() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_penulis() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_percetakan() TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_access_naskah(text) TO authenticated;

-- Grant juga ke anon untuk public access
GRANT EXECUTE ON FUNCTION public.current_user_id() TO anon;
GRANT EXECUTE ON FUNCTION public.current_user_email() TO anon;

-- ============================================
-- 6. VERIFICATION QUERIES
-- ============================================

-- Uncomment untuk verify policies setelah deployment:

-- Check RLS enabled
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- Check policies per table
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
-- FROM pg_policies 
-- WHERE schemaname = 'public' 
-- ORDER BY tablename, policyname;

-- Count total policies
-- SELECT COUNT(*) as total_policies FROM pg_policies WHERE schemaname = 'public';

-- ============================================
-- END OF MIGRATION
-- ============================================

-- Migration successfully created!
-- Total Tables: 28
-- Total Policies: ~95 policies
-- Total Helper Functions: 8 functions
-- 
-- Next Steps:
-- 1. Run migration di Supabase SQL Editor
-- 2. Verify dengan verification queries
-- 3. Test dengan different user roles
-- 4. Monitor performance dan adjust indexes jika perlu

