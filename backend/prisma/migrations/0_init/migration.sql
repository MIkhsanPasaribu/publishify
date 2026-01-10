-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- CreateEnum
CREATE TYPE "jenis_peran" AS ENUM ('penulis', 'editor', 'percetakan', 'admin');

-- CreateEnum
CREATE TYPE "status_naskah" AS ENUM ('draft', 'diajukan', 'dalam_review', 'perlu_revisi', 'disetujui', 'ditolak', 'diterbitkan');

-- CreateEnum
CREATE TYPE "status_review" AS ENUM ('ditugaskan', 'dalam_proses', 'selesai', 'dibatalkan');

-- CreateEnum
CREATE TYPE "rekomendasi" AS ENUM ('setujui', 'revisi', 'tolak');

-- CreateEnum
CREATE TYPE "status_pesanan" AS ENUM ('tertunda', 'diterima', 'dalam_produksi', 'kontrol_kualitas', 'siap', 'dikirim', 'terkirim', 'selesai', 'dibatalkan');

-- CreateEnum
CREATE TYPE "status_pengiriman" AS ENUM ('diproses', 'dalam_perjalanan', 'terkirim', 'gagal');

-- CreateEnum
CREATE TYPE "status_pembayaran" AS ENUM ('tertunda', 'diproses', 'berhasil', 'gagal', 'dibatalkan', 'dikembalikan');

-- CreateEnum
CREATE TYPE "metode_pembayaran" AS ENUM ('transfer_bank', 'kartu_kredit', 'e_wallet', 'virtual_account', 'cod');

-- CreateEnum
CREATE TYPE "tipe_notifikasi" AS ENUM ('info', 'sukses', 'peringatan', 'error');

-- CreateEnum
CREATE TYPE "platform" AS ENUM ('web', 'mobile');

-- CreateEnum
CREATE TYPE "format_buku" AS ENUM ('A4', 'A5', 'B5');

-- CreateEnum
CREATE TYPE "jenis_kertas" AS ENUM ('HVS', 'BOOKPAPER', 'ART_PAPER');

-- CreateEnum
CREATE TYPE "jenis_cover" AS ENUM ('SOFTCOVER', 'HARDCOVER');

-- CreateTable
CREATE TABLE "pengguna" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "kataSandi" TEXT,
    "telepon" TEXT,
    "google_id" TEXT,
    "facebook_id" TEXT,
    "apple_id" TEXT,
    "provider" TEXT,
    "avatar_url" TEXT,
    "email_verified_by_provider" BOOLEAN NOT NULL DEFAULT false,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "terverifikasi" BOOLEAN NOT NULL DEFAULT false,
    "emailDiverifikasiPada" TIMESTAMP(3),
    "loginTerakhir" TIMESTAMP(3),
    "dibuatPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbaruiPada" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pengguna_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profil_pengguna" (
    "id" TEXT NOT NULL,
    "idPengguna" TEXT NOT NULL,
    "namaDepan" TEXT,
    "namaBelakang" TEXT,
    "namaTampilan" TEXT,
    "bio" TEXT,
    "urlAvatar" TEXT,
    "tanggalLahir" TIMESTAMP(3),
    "jenisKelamin" TEXT,
    "alamat" TEXT,
    "kota" TEXT,
    "provinsi" TEXT,
    "kodePos" TEXT,
    "dibuatPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbaruiPada" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profil_pengguna_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "peran_pengguna" (
    "id" TEXT NOT NULL,
    "idPengguna" TEXT NOT NULL,
    "jenisPeran" "jenis_peran" NOT NULL,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "ditugaskanPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ditugaskanOleh" TEXT,

    CONSTRAINT "peran_pengguna_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profil_penulis" (
    "id" TEXT NOT NULL,
    "idPengguna" TEXT NOT NULL,
    "namaPena" TEXT,
    "biografi" TEXT,
    "spesialisasi" TEXT[],
    "totalBuku" INTEGER NOT NULL DEFAULT 0,
    "totalDibaca" INTEGER NOT NULL DEFAULT 0,
    "ratingRataRata" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "namaRekeningBank" TEXT,
    "namaBank" TEXT,
    "nomorRekeningBank" TEXT,
    "npwp" TEXT,
    "dibuatPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbaruiPada" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profil_penulis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "naskah" (
    "id" TEXT NOT NULL,
    "idPenulis" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "subJudul" TEXT,
    "sinopsis" TEXT NOT NULL,
    "isbn" TEXT,
    "idKategori" TEXT NOT NULL,
    "idGenre" TEXT NOT NULL,
    "formatBuku" "format_buku" NOT NULL DEFAULT 'A5',
    "bahasaTulis" TEXT NOT NULL DEFAULT 'id',
    "jumlahHalaman" INTEGER,
    "jumlahKata" INTEGER,
    "status" "status_naskah" NOT NULL DEFAULT 'draft',
    "urlSampul" TEXT,
    "urlFile" TEXT,
    "publik" BOOLEAN NOT NULL DEFAULT false,
    "biayaProduksi" DECIMAL(10,2),
    "hargaJual" DECIMAL(10,2),
    "diterbitkanPada" TIMESTAMP(3),
    "dibuatPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbaruiPada" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "naskah_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kategori" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "deskripsi" TEXT,
    "idInduk" TEXT,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "dibuatPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbaruiPada" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kategori_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "genre" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "deskripsi" TEXT,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "dibuatPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbaruiPada" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "genre_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tag" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "dibuatPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tag_naskah" (
    "id" TEXT NOT NULL,
    "idNaskah" TEXT NOT NULL,
    "idTag" TEXT NOT NULL,
    "dibuatPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tag_naskah_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "revisi_naskah" (
    "id" TEXT NOT NULL,
    "idNaskah" TEXT NOT NULL,
    "versi" INTEGER NOT NULL,
    "catatan" TEXT,
    "urlFile" TEXT NOT NULL,
    "dibuatPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "revisi_naskah_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_naskah" (
    "id" TEXT NOT NULL,
    "idNaskah" TEXT NOT NULL,
    "idEditor" TEXT NOT NULL,
    "status" "status_review" NOT NULL DEFAULT 'ditugaskan',
    "rekomendasi" "rekomendasi",
    "catatan" TEXT,
    "ditugaskanPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dimulaiPada" TIMESTAMP(3),
    "selesaiPada" TIMESTAMP(3),
    "diperbaruiPada" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "review_naskah_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedback_review" (
    "id" TEXT NOT NULL,
    "idReview" TEXT NOT NULL,
    "bab" TEXT,
    "halaman" INTEGER,
    "komentar" TEXT NOT NULL,
    "dibuatPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feedback_review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pesanan_cetak" (
    "id" TEXT NOT NULL,
    "idNaskah" TEXT NOT NULL,
    "idPemesan" TEXT NOT NULL,
    "idPercetakan" TEXT,
    "nomorPesanan" TEXT NOT NULL,
    "jumlah" INTEGER NOT NULL,
    "judulSnapshot" TEXT NOT NULL,
    "formatSnapshot" TEXT NOT NULL,
    "jumlahHalamanSnapshot" INTEGER NOT NULL,
    "formatKertas" TEXT NOT NULL,
    "jenisKertas" TEXT NOT NULL,
    "jenisCover" TEXT NOT NULL,
    "finishingTambahan" TEXT[],
    "catatan" TEXT,
    "hargaTotal" DECIMAL(10,2) NOT NULL,
    "status" "status_pesanan" NOT NULL DEFAULT 'tertunda',
    "tanggalPesan" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estimasiSelesai" TIMESTAMP(3),
    "tanggalSelesai" TIMESTAMP(3),
    "catatanPenerimaan" TEXT,
    "diperbaruiPada" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pesanan_cetak_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "log_produksi" (
    "id" TEXT NOT NULL,
    "idPesanan" TEXT NOT NULL,
    "tahapan" TEXT NOT NULL,
    "deskripsi" TEXT,
    "dibuatPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "log_produksi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pengiriman" (
    "id" TEXT NOT NULL,
    "idPesanan" TEXT NOT NULL,
    "namaEkspedisi" TEXT NOT NULL,
    "nomorResi" TEXT,
    "biayaPengiriman" DECIMAL(10,2) NOT NULL,
    "alamatTujuan" TEXT NOT NULL,
    "namaPenerima" TEXT NOT NULL,
    "teleponPenerima" TEXT NOT NULL,
    "status" "status_pengiriman" NOT NULL DEFAULT 'diproses',
    "tanggalKirim" TIMESTAMP(3),
    "estimasiTiba" TIMESTAMP(3),
    "tanggalTiba" TIMESTAMP(3),
    "dibuatPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbaruiPada" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pengiriman_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tracking_log" (
    "id" TEXT NOT NULL,
    "idPengiriman" TEXT NOT NULL,
    "lokasi" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "deskripsi" TEXT,
    "waktu" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tracking_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parameter_harga_percetakan" (
    "id" TEXT NOT NULL,
    "idPercetakan" TEXT NOT NULL,
    "namaKombinasi" TEXT NOT NULL DEFAULT 'Tarif Default',
    "deskripsi" TEXT,
    "hargaKertasA4" DECIMAL(10,2) NOT NULL,
    "hargaKertasA5" DECIMAL(10,2) NOT NULL,
    "hargaKertasB5" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "hargaSoftcover" DECIMAL(10,2) NOT NULL,
    "hargaHardcover" DECIMAL(10,2) NOT NULL,
    "biayaJilid" DECIMAL(10,2) NOT NULL,
    "minimumPesanan" INTEGER NOT NULL DEFAULT 1,
    "aktif" BOOLEAN NOT NULL DEFAULT false,
    "dibuatPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbaruiPada" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parameter_harga_percetakan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pembayaran" (
    "id" TEXT NOT NULL,
    "idPesanan" TEXT NOT NULL,
    "idPengguna" TEXT NOT NULL,
    "nomorTransaksi" TEXT NOT NULL,
    "jumlah" DECIMAL(10,2) NOT NULL,
    "metodePembayaran" "metode_pembayaran" NOT NULL,
    "status" "status_pembayaran" NOT NULL DEFAULT 'tertunda',
    "urlBukti" TEXT,
    "catatanPembayaran" TEXT,
    "tanggalPembayaran" TIMESTAMP(3),
    "dibuatPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbaruiPada" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pembayaran_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifikasi" (
    "id" TEXT NOT NULL,
    "idPengguna" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "pesan" TEXT NOT NULL,
    "tipe" "tipe_notifikasi" NOT NULL DEFAULT 'info',
    "dibaca" BOOLEAN NOT NULL DEFAULT false,
    "url" TEXT,
    "dibuatPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifikasi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "token_refresh" (
    "id" TEXT NOT NULL,
    "idPengguna" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "platform" "platform" NOT NULL DEFAULT 'web',
    "kadaluarsaPada" TIMESTAMP(3) NOT NULL,
    "dibuatPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "token_refresh_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "log_aktivitas" (
    "id" TEXT NOT NULL,
    "idPengguna" TEXT,
    "jenis" TEXT NOT NULL,
    "aksi" TEXT NOT NULL,
    "entitas" TEXT,
    "idEntitas" TEXT,
    "deskripsi" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "dibuatPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "log_aktivitas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "oauth_state" (
    "id" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "redirectUrl" TEXT,
    "kadaluarsaPada" TIMESTAMP(3) NOT NULL,
    "dibuatPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "oauth_state_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "statistik_naskah" (
    "id" TEXT NOT NULL,
    "idNaskah" TEXT NOT NULL,
    "totalDiunduh" INTEGER NOT NULL DEFAULT 0,
    "totalDibaca" INTEGER NOT NULL DEFAULT 0,
    "totalDibagikan" INTEGER NOT NULL DEFAULT 0,
    "totalDicetak" INTEGER NOT NULL DEFAULT 0,
    "ratingRataRata" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "totalRating" INTEGER NOT NULL DEFAULT 0,
    "terakhirDiperbarui" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "statistik_naskah_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rating_review" (
    "id" TEXT NOT NULL,
    "idNaskah" TEXT NOT NULL,
    "idPengguna" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "ulasan" TEXT,
    "dibuatPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbaruiPada" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rating_review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "file" (
    "id" TEXT NOT NULL,
    "idPengguna" TEXT NOT NULL,
    "namaFileAsli" TEXT NOT NULL,
    "namaFileSimpan" TEXT NOT NULL,
    "ukuran" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "ekstensi" TEXT NOT NULL,
    "tujuan" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "urlPublik" TEXT,
    "idReferensi" TEXT,
    "deskripsi" TEXT,
    "diuploadPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "file_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pengguna_email_key" ON "pengguna"("email");

-- CreateIndex
CREATE UNIQUE INDEX "pengguna_google_id_key" ON "pengguna"("google_id");

-- CreateIndex
CREATE UNIQUE INDEX "pengguna_facebook_id_key" ON "pengguna"("facebook_id");

-- CreateIndex
CREATE UNIQUE INDEX "pengguna_apple_id_key" ON "pengguna"("apple_id");

-- CreateIndex
CREATE INDEX "idx_pengguna_google_id" ON "pengguna"("google_id");

-- CreateIndex
CREATE INDEX "idx_pengguna_provider" ON "pengguna"("provider");

-- CreateIndex
CREATE UNIQUE INDEX "profil_pengguna_idPengguna_key" ON "profil_pengguna"("idPengguna");

-- CreateIndex
CREATE UNIQUE INDEX "peran_pengguna_idPengguna_jenisPeran_key" ON "peran_pengguna"("idPengguna", "jenisPeran");

-- CreateIndex
CREATE UNIQUE INDEX "profil_penulis_idPengguna_key" ON "profil_penulis"("idPengguna");

-- CreateIndex
CREATE UNIQUE INDEX "naskah_isbn_key" ON "naskah"("isbn");

-- CreateIndex
CREATE INDEX "naskah_idPenulis_idx" ON "naskah"("idPenulis");

-- CreateIndex
CREATE INDEX "naskah_status_idx" ON "naskah"("status");

-- CreateIndex
CREATE INDEX "naskah_idKategori_idx" ON "naskah"("idKategori");

-- CreateIndex
CREATE INDEX "naskah_idGenre_idx" ON "naskah"("idGenre");

-- CreateIndex
CREATE INDEX "naskah_idPenulis_status_idx" ON "naskah"("idPenulis", "status");

-- CreateIndex
CREATE INDEX "naskah_status_dibuatPada_idx" ON "naskah"("status", "dibuatPada");

-- CreateIndex
CREATE INDEX "naskah_idKategori_status_idx" ON "naskah"("idKategori", "status");

-- CreateIndex
CREATE INDEX "naskah_publik_diterbitkanPada_idx" ON "naskah"("publik", "diterbitkanPada");

-- CreateIndex
CREATE INDEX "naskah_dibuatPada_idx" ON "naskah"("dibuatPada");

-- CreateIndex
CREATE UNIQUE INDEX "kategori_slug_key" ON "kategori"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "genre_nama_key" ON "genre"("nama");

-- CreateIndex
CREATE UNIQUE INDEX "genre_slug_key" ON "genre"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "tag_nama_key" ON "tag"("nama");

-- CreateIndex
CREATE UNIQUE INDEX "tag_slug_key" ON "tag"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "tag_naskah_idNaskah_idTag_key" ON "tag_naskah"("idNaskah", "idTag");

-- CreateIndex
CREATE UNIQUE INDEX "revisi_naskah_idNaskah_versi_key" ON "revisi_naskah"("idNaskah", "versi");

-- CreateIndex
CREATE INDEX "review_naskah_idNaskah_idx" ON "review_naskah"("idNaskah");

-- CreateIndex
CREATE INDEX "review_naskah_idEditor_idx" ON "review_naskah"("idEditor");

-- CreateIndex
CREATE INDEX "review_naskah_idEditor_status_idx" ON "review_naskah"("idEditor", "status");

-- CreateIndex
CREATE INDEX "review_naskah_status_ditugaskanPada_idx" ON "review_naskah"("status", "ditugaskanPada");

-- CreateIndex
CREATE UNIQUE INDEX "pesanan_cetak_nomorPesanan_key" ON "pesanan_cetak"("nomorPesanan");

-- CreateIndex
CREATE INDEX "pesanan_cetak_nomorPesanan_idx" ON "pesanan_cetak"("nomorPesanan");

-- CreateIndex
CREATE INDEX "pesanan_cetak_status_idx" ON "pesanan_cetak"("status");

-- CreateIndex
CREATE INDEX "pesanan_cetak_idPemesan_status_idx" ON "pesanan_cetak"("idPemesan", "status");

-- CreateIndex
CREATE INDEX "pesanan_cetak_idPercetakan_status_idx" ON "pesanan_cetak"("idPercetakan", "status");

-- CreateIndex
CREATE INDEX "pesanan_cetak_status_tanggalPesan_idx" ON "pesanan_cetak"("status", "tanggalPesan");

-- CreateIndex
CREATE INDEX "pesanan_cetak_tanggalPesan_idx" ON "pesanan_cetak"("tanggalPesan");

-- CreateIndex
CREATE UNIQUE INDEX "pengiriman_idPesanan_key" ON "pengiriman"("idPesanan");

-- CreateIndex
CREATE INDEX "parameter_harga_percetakan_idPercetakan_idx" ON "parameter_harga_percetakan"("idPercetakan");

-- CreateIndex
CREATE INDEX "parameter_harga_percetakan_aktif_idx" ON "parameter_harga_percetakan"("aktif");

-- CreateIndex
CREATE INDEX "parameter_harga_percetakan_idPercetakan_aktif_idx" ON "parameter_harga_percetakan"("idPercetakan", "aktif");

-- CreateIndex
CREATE UNIQUE INDEX "parameter_harga_percetakan_idPercetakan_namaKombinasi_key" ON "parameter_harga_percetakan"("idPercetakan", "namaKombinasi");

-- CreateIndex
CREATE UNIQUE INDEX "pembayaran_idPesanan_key" ON "pembayaran"("idPesanan");

-- CreateIndex
CREATE UNIQUE INDEX "pembayaran_nomorTransaksi_key" ON "pembayaran"("nomorTransaksi");

-- CreateIndex
CREATE INDEX "pembayaran_nomorTransaksi_idx" ON "pembayaran"("nomorTransaksi");

-- CreateIndex
CREATE INDEX "pembayaran_status_idx" ON "pembayaran"("status");

-- CreateIndex
CREATE INDEX "pembayaran_idPengguna_status_idx" ON "pembayaran"("idPengguna", "status");

-- CreateIndex
CREATE INDEX "pembayaran_status_dibuatPada_idx" ON "pembayaran"("status", "dibuatPada");

-- CreateIndex
CREATE INDEX "notifikasi_idPengguna_dibaca_idx" ON "notifikasi"("idPengguna", "dibaca");

-- CreateIndex
CREATE UNIQUE INDEX "token_refresh_token_key" ON "token_refresh"("token");

-- CreateIndex
CREATE INDEX "token_refresh_token_idx" ON "token_refresh"("token");

-- CreateIndex
CREATE INDEX "token_refresh_idPengguna_platform_idx" ON "token_refresh"("idPengguna", "platform");

-- CreateIndex
CREATE INDEX "log_aktivitas_idPengguna_idx" ON "log_aktivitas"("idPengguna");

-- CreateIndex
CREATE INDEX "log_aktivitas_dibuatPada_idx" ON "log_aktivitas"("dibuatPada");

-- CreateIndex
CREATE UNIQUE INDEX "oauth_state_state_key" ON "oauth_state"("state");

-- CreateIndex
CREATE INDEX "idx_oauth_state_state" ON "oauth_state"("state");

-- CreateIndex
CREATE INDEX "idx_oauth_state_expiry" ON "oauth_state"("kadaluarsaPada");

-- CreateIndex
CREATE UNIQUE INDEX "statistik_naskah_idNaskah_key" ON "statistik_naskah"("idNaskah");

-- CreateIndex
CREATE UNIQUE INDEX "rating_review_idNaskah_idPengguna_key" ON "rating_review"("idNaskah", "idPengguna");

-- CreateIndex
CREATE UNIQUE INDEX "file_namaFileSimpan_key" ON "file"("namaFileSimpan");

-- CreateIndex
CREATE INDEX "file_idPengguna_idx" ON "file"("idPengguna");

-- CreateIndex
CREATE INDEX "file_tujuan_idx" ON "file"("tujuan");

-- CreateIndex
CREATE INDEX "file_idReferensi_idx" ON "file"("idReferensi");

-- AddForeignKey
ALTER TABLE "profil_pengguna" ADD CONSTRAINT "profil_pengguna_idPengguna_fkey" FOREIGN KEY ("idPengguna") REFERENCES "pengguna"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "peran_pengguna" ADD CONSTRAINT "peran_pengguna_idPengguna_fkey" FOREIGN KEY ("idPengguna") REFERENCES "pengguna"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profil_penulis" ADD CONSTRAINT "profil_penulis_idPengguna_fkey" FOREIGN KEY ("idPengguna") REFERENCES "pengguna"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "naskah" ADD CONSTRAINT "naskah_idPenulis_fkey" FOREIGN KEY ("idPenulis") REFERENCES "pengguna"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "naskah" ADD CONSTRAINT "naskah_idKategori_fkey" FOREIGN KEY ("idKategori") REFERENCES "kategori"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "naskah" ADD CONSTRAINT "naskah_idGenre_fkey" FOREIGN KEY ("idGenre") REFERENCES "genre"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kategori" ADD CONSTRAINT "kategori_idInduk_fkey" FOREIGN KEY ("idInduk") REFERENCES "kategori"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tag_naskah" ADD CONSTRAINT "tag_naskah_idNaskah_fkey" FOREIGN KEY ("idNaskah") REFERENCES "naskah"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tag_naskah" ADD CONSTRAINT "tag_naskah_idTag_fkey" FOREIGN KEY ("idTag") REFERENCES "tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revisi_naskah" ADD CONSTRAINT "revisi_naskah_idNaskah_fkey" FOREIGN KEY ("idNaskah") REFERENCES "naskah"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_naskah" ADD CONSTRAINT "review_naskah_idNaskah_fkey" FOREIGN KEY ("idNaskah") REFERENCES "naskah"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_naskah" ADD CONSTRAINT "review_naskah_idEditor_fkey" FOREIGN KEY ("idEditor") REFERENCES "pengguna"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback_review" ADD CONSTRAINT "feedback_review_idReview_fkey" FOREIGN KEY ("idReview") REFERENCES "review_naskah"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pesanan_cetak" ADD CONSTRAINT "pesanan_cetak_idNaskah_fkey" FOREIGN KEY ("idNaskah") REFERENCES "naskah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pesanan_cetak" ADD CONSTRAINT "pesanan_cetak_idPemesan_fkey" FOREIGN KEY ("idPemesan") REFERENCES "pengguna"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pesanan_cetak" ADD CONSTRAINT "pesanan_cetak_idPercetakan_fkey" FOREIGN KEY ("idPercetakan") REFERENCES "pengguna"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "log_produksi" ADD CONSTRAINT "log_produksi_idPesanan_fkey" FOREIGN KEY ("idPesanan") REFERENCES "pesanan_cetak"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pengiriman" ADD CONSTRAINT "pengiriman_idPesanan_fkey" FOREIGN KEY ("idPesanan") REFERENCES "pesanan_cetak"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tracking_log" ADD CONSTRAINT "tracking_log_idPengiriman_fkey" FOREIGN KEY ("idPengiriman") REFERENCES "pengiriman"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parameter_harga_percetakan" ADD CONSTRAINT "parameter_harga_percetakan_idPercetakan_fkey" FOREIGN KEY ("idPercetakan") REFERENCES "pengguna"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pembayaran" ADD CONSTRAINT "pembayaran_idPesanan_fkey" FOREIGN KEY ("idPesanan") REFERENCES "pesanan_cetak"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pembayaran" ADD CONSTRAINT "pembayaran_idPengguna_fkey" FOREIGN KEY ("idPengguna") REFERENCES "pengguna"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifikasi" ADD CONSTRAINT "notifikasi_idPengguna_fkey" FOREIGN KEY ("idPengguna") REFERENCES "pengguna"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "token_refresh" ADD CONSTRAINT "token_refresh_idPengguna_fkey" FOREIGN KEY ("idPengguna") REFERENCES "pengguna"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "log_aktivitas" ADD CONSTRAINT "log_aktivitas_idPengguna_fkey" FOREIGN KEY ("idPengguna") REFERENCES "pengguna"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file" ADD CONSTRAINT "file_idPengguna_fkey" FOREIGN KEY ("idPengguna") REFERENCES "pengguna"("id") ON DELETE CASCADE ON UPDATE CASCADE;

