-- AlterEnum
-- Menambahkan nilai 'selesai' ke enum "status_pesanan"
ALTER TYPE "status_pesanan" ADD VALUE 'selesai';

-- AlterTable
-- Menambahkan kolom 'catatanPenerimaan' ke tabel "pesanan_cetak"
ALTER TABLE "pesanan_cetak" ADD COLUMN "catatanPenerimaan" TEXT;
