-- ============================================
-- ENABLE REALTIME DI SUPABASE
-- Migration untuk mengaktifkan realtime publication
-- untuk semua tabel yang memerlukan real-time updates
-- ============================================

-- 1. Enable Realtime Extension (jika belum aktif)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Drop existing publication jika ada (untuk re-run migration)
DROP PUBLICATION IF EXISTS supabase_realtime;

-- 3. Buat publication baru untuk realtime
CREATE PUBLICATION supabase_realtime;

-- ============================================
-- ENABLE REALTIME UNTUK USER MANAGEMENT
-- ============================================

-- Tabel: pengguna - untuk status online, login terakhir
ALTER PUBLICATION supabase_realtime ADD TABLE pengguna;

-- Tabel: profil_pengguna - untuk update profil real-time
ALTER PUBLICATION supabase_realtime ADD TABLE profil_pengguna;

-- Tabel: peran_pengguna - untuk perubahan role real-time
ALTER PUBLICATION supabase_realtime ADD TABLE peran_pengguna;

-- Tabel: profil_penulis - untuk update statistik penulis
ALTER PUBLICATION supabase_realtime ADD TABLE profil_penulis;

-- ============================================
-- ENABLE REALTIME UNTUK CONTENT MANAGEMENT
-- ============================================

-- Tabel: naskah - untuk status naskah, progress publishing
ALTER PUBLICATION supabase_realtime ADD TABLE naskah;

-- Tabel: revisi_naskah - untuk tracking revisi
ALTER PUBLICATION supabase_realtime ADD TABLE revisi_naskah;

-- Tabel: kategori - untuk update kategori
ALTER PUBLICATION supabase_realtime ADD TABLE kategori;

-- Tabel: genre - untuk update genre
ALTER PUBLICATION supabase_realtime ADD TABLE genre;

-- Tabel: tag - untuk update tags
ALTER PUBLICATION supabase_realtime ADD TABLE tag;

-- Tabel: tag_naskah - untuk tagging real-time
ALTER PUBLICATION supabase_realtime ADD TABLE tag_naskah;

-- ============================================
-- ENABLE REALTIME UNTUK REVIEW SYSTEM
-- ============================================

-- Tabel: review_naskah - untuk status review real-time
ALTER PUBLICATION supabase_realtime ADD TABLE review_naskah;

-- Tabel: feedback_review - untuk feedback editor real-time
ALTER PUBLICATION supabase_realtime ADD TABLE feedback_review;

-- ============================================
-- ENABLE REALTIME UNTUK PRINTING SYSTEM
-- ============================================

-- Tabel: pesanan_cetak - untuk status pesanan real-time
ALTER PUBLICATION supabase_realtime ADD TABLE pesanan_cetak;

-- Tabel: log_produksi - untuk progress produksi real-time
ALTER PUBLICATION supabase_realtime ADD TABLE log_produksi;

-- Tabel: pengiriman - untuk tracking pengiriman real-time
ALTER PUBLICATION supabase_realtime ADD TABLE pengiriman;

-- Tabel: tracking_log - untuk update lokasi pengiriman real-time
ALTER PUBLICATION supabase_realtime ADD TABLE tracking_log;

-- ============================================
-- ENABLE REALTIME UNTUK PAYMENT SYSTEM
-- ============================================

-- Tabel: pembayaran - untuk status pembayaran real-time
ALTER PUBLICATION supabase_realtime ADD TABLE pembayaran;

-- ============================================
-- ENABLE REALTIME UNTUK NOTIFICATION SYSTEM
-- ============================================

-- Tabel: notifikasi - untuk notifikasi real-time (PENTING!)
ALTER PUBLICATION supabase_realtime ADD TABLE notifikasi;

-- ============================================
-- ENABLE REALTIME UNTUK AUTH & SECURITY
-- ============================================

-- Tabel: token_refresh - untuk monitoring token
ALTER PUBLICATION supabase_realtime ADD TABLE token_refresh;

-- Tabel: log_aktivitas - untuk activity tracking real-time
ALTER PUBLICATION supabase_realtime ADD TABLE log_aktivitas;

-- ============================================
-- ENABLE REALTIME UNTUK ANALYTICS
-- ============================================

-- Tabel: statistik_naskah - untuk update statistik real-time
ALTER PUBLICATION supabase_realtime ADD TABLE statistik_naskah;

-- Tabel: rating_review - untuk rating real-time
ALTER PUBLICATION supabase_realtime ADD TABLE rating_review;

-- ============================================
-- ENABLE REALTIME UNTUK FILE STORAGE
-- ============================================

-- Tabel: file - untuk upload progress real-time
ALTER PUBLICATION supabase_realtime ADD TABLE file;

-- ============================================
-- KONFIGURASI REPLICA IDENTITY
-- Diperlukan untuk Realtime update & delete events
-- ============================================

-- Set REPLICA IDENTITY untuk semua tabel
ALTER TABLE pengguna REPLICA IDENTITY FULL;
ALTER TABLE profil_pengguna REPLICA IDENTITY FULL;
ALTER TABLE peran_pengguna REPLICA IDENTITY FULL;
ALTER TABLE profil_penulis REPLICA IDENTITY FULL;
ALTER TABLE naskah REPLICA IDENTITY FULL;
ALTER TABLE revisi_naskah REPLICA IDENTITY FULL;
ALTER TABLE kategori REPLICA IDENTITY FULL;
ALTER TABLE genre REPLICA IDENTITY FULL;
ALTER TABLE tag REPLICA IDENTITY FULL;
ALTER TABLE tag_naskah REPLICA IDENTITY FULL;
ALTER TABLE review_naskah REPLICA IDENTITY FULL;
ALTER TABLE feedback_review REPLICA IDENTITY FULL;
ALTER TABLE pesanan_cetak REPLICA IDENTITY FULL;
ALTER TABLE log_produksi REPLICA IDENTITY FULL;
ALTER TABLE pengiriman REPLICA IDENTITY FULL;
ALTER TABLE tracking_log REPLICA IDENTITY FULL;
ALTER TABLE pembayaran REPLICA IDENTITY FULL;
ALTER TABLE notifikasi REPLICA IDENTITY FULL;
ALTER TABLE token_refresh REPLICA IDENTITY FULL;
ALTER TABLE log_aktivitas REPLICA IDENTITY FULL;
ALTER TABLE statistik_naskah REPLICA IDENTITY FULL;
ALTER TABLE rating_review REPLICA IDENTITY FULL;
ALTER TABLE file REPLICA IDENTITY FULL;

-- ============================================
-- VERIFY REALTIME SETUP
-- ============================================

-- Query untuk verify realtime tables
-- SELECT schemaname, tablename FROM pg_publication_tables WHERE pubname = 'supabase_realtime';

-- Query untuk verify replica identity
-- SELECT schemaname, tablename, replicaidentity FROM pg_tables WHERE schemaname = 'public';
