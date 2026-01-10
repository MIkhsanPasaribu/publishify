/// API Configuration - Konfigurasi Terpusat untuk Koneksi Backend
/// File ini berisi semua konfigurasi API yang diperlukan aplikasi mobile
/// untuk terhubung ke backend Publishify.
///
/// PENTING: Gunakan konfigurasi dari file ini di semua service
/// untuk memastikan konsistensi URL dan endpoint.
library;

import 'package:flutter_dotenv/flutter_dotenv.dart';

/// Konfigurasi API terpusat untuk aplikasi mobile Publishify
class ApiConfig {
  // Private constructor untuk singleton pattern
  ApiConfig._();

  // ============================================
  // BASE URL CONFIGURATION
  // ============================================

  /// Base URL API backend
  /// Production: http://74.225.221.140
  /// Development (Android Emulator): http://10.0.2.2:4000
  /// Development (iOS/Desktop): http://localhost:4000
  static String get baseUrl =>
      dotenv.env['BASE_URL'] ?? 'http://74.225.221.140';

  /// Base URL untuk API (dengan prefix /api)
  static String get apiBaseUrl => '$baseUrl/api';

  // ============================================
  // AUTHENTICATION ENDPOINTS
  // ============================================

  /// POST - Registrasi pengguna baru
  static String get authDaftar => '$apiBaseUrl/auth/daftar';

  /// POST - Login pengguna
  static String get authLogin => '$apiBaseUrl/auth/login';

  /// POST - Logout pengguna
  static String get authLogout => '$apiBaseUrl/auth/logout';

  /// POST - Refresh access token
  static String get authRefresh => '$apiBaseUrl/auth/refresh';

  /// POST - Verifikasi email
  static String get authVerifikasiEmail => '$apiBaseUrl/auth/verifikasi-email';

  /// POST - Request reset password
  static String get authLupaPassword => '$apiBaseUrl/auth/lupa-password';

  /// POST - Reset password dengan token
  static String get authResetPassword => '$apiBaseUrl/auth/reset-password';

  /// POST - Get profil pengguna saat ini (untuk testing JWT)
  static String get authMe => '$apiBaseUrl/auth/me';

  /// GET - Initiate Google OAuth
  static String get authGoogle => '$apiBaseUrl/auth/google';

  /// GET - Google OAuth callback
  static String get authGoogleCallback => '$apiBaseUrl/auth/google/callback';

  /// POST - Link Google account ke user
  static String get authGoogleLink => '$apiBaseUrl/auth/google/link';

  /// DELETE - Unlink Google account dari user
  static String get authGoogleUnlink => '$apiBaseUrl/auth/google/unlink';

  // ============================================
  // PENGGUNA ENDPOINTS
  // ============================================

  /// GET - Ambil daftar pengguna (admin only)
  static String get pengguna => '$apiBaseUrl/pengguna';

  /// GET - Ambil statistik pengguna (admin only)
  static String get penggunaStatistik => '$apiBaseUrl/pengguna/statistik';

  /// GET/PUT - Ambil/Perbarui profil sendiri
  static String get penggunaProfilSaya => '$apiBaseUrl/pengguna/profil/saya';

  /// PUT - Ganti password
  static String get penggunaPassword => '$apiBaseUrl/pengguna/password';

  /// GET/PUT/DELETE - Detail pengguna by ID
  static String penggunaById(String id) => '$apiBaseUrl/pengguna/$id';

  // ============================================
  // NASKAH ENDPOINTS
  // ============================================

  /// GET/POST - Daftar naskah / Buat naskah baru
  static String get naskah => '$apiBaseUrl/naskah';

  /// GET - Naskah dengan cursor pagination
  static String get naskahCursor => '$apiBaseUrl/naskah/cursor';

  /// GET - Statistik naskah
  static String get naskahStatistik => '$apiBaseUrl/naskah/statistik';

  /// GET - Naskah milik penulis sendiri
  static String get naskahPenulisSaya => '$apiBaseUrl/naskah/penulis/saya';

  /// GET/PUT/DELETE - Detail naskah by ID
  static String naskahById(String id) => '$apiBaseUrl/naskah/$id';

  /// PUT - Ajukan naskah untuk review
  static String naskahAjukan(String id) => '$apiBaseUrl/naskah/$id/ajukan';

  /// PUT - Terbitkan naskah
  static String naskahTerbitkan(String id) =>
      '$apiBaseUrl/naskah/$id/terbitkan';

  /// PUT - Set harga jual naskah
  static String naskahHargaJual(String id) =>
      '$apiBaseUrl/naskah/$id/harga-jual';

  /// GET - Semua naskah untuk Admin
  static String get naskahAdminSemua => '$apiBaseUrl/naskah/admin/semua';

  /// GET - Naskah diterbitkan milik penulis
  static String get naskahPenulisDiterbitkan =>
      '$apiBaseUrl/naskah/penulis/diterbitkan';

  // ============================================
  // KATEGORI & GENRE ENDPOINTS
  // ============================================

  /// GET/POST - Daftar kategori
  static String get kategori => '$apiBaseUrl/kategori';

  /// GET/PUT/DELETE - Detail kategori by ID
  static String kategoriById(String id) => '$apiBaseUrl/kategori/$id';

  /// GET - Kategori aktif untuk dropdown
  static String get kategoriAktif => '$apiBaseUrl/kategori/aktif';

  /// GET/POST - Daftar genre
  static String get genre => '$apiBaseUrl/genre';

  /// GET/PUT/DELETE - Detail genre by ID
  static String genreById(String id) => '$apiBaseUrl/genre/$id';

  /// GET - Genre aktif untuk dropdown
  static String get genreAktif => '$apiBaseUrl/genre/aktif';

  // ============================================
  // REVIEW ENDPOINTS
  // ============================================

  /// GET - Daftar review
  static String get review => '$apiBaseUrl/review';

  /// POST - Tugaskan review ke editor
  static String get reviewTugaskan => '$apiBaseUrl/review/tugaskan';

  /// GET - Statistik review
  static String get reviewStatistik => '$apiBaseUrl/review/statistik';

  /// GET - Review yang ditugaskan kepada saya (editor)
  static String get reviewEditorSaya => '$apiBaseUrl/review/editor/saya';

  /// GET - Review untuk naskah tertentu
  static String reviewNaskah(String idNaskah) =>
      '$apiBaseUrl/review/naskah/$idNaskah';

  /// GET/PUT - Detail review by ID
  static String reviewById(String id) => '$apiBaseUrl/review/$id';

  /// POST - Tambah feedback ke review
  static String reviewFeedback(String id) => '$apiBaseUrl/review/$id/feedback';

  /// PUT - Submit/finalisasi review
  static String reviewSubmit(String id) => '$apiBaseUrl/review/$id/submit';

  /// PUT - Batalkan review
  static String reviewBatal(String id) => '$apiBaseUrl/review/$id/batal';

  // ============================================
  // PERCETAKAN ENDPOINTS
  // ============================================

  /// GET/POST - Daftar pesanan / Buat pesanan cetak
  static String get percetakan => '$apiBaseUrl/percetakan';

  /// GET - Pesanan milik penulis sendiri
  static String get percetakanPenulisSaya =>
      '$apiBaseUrl/percetakan/penulis/saya';

  /// GET - Statistik pesanan
  static String get percetakanStatistik => '$apiBaseUrl/percetakan/statistik';

  /// GET - Daftar skema tarif
  static String get percetakanTarif => '$apiBaseUrl/percetakan/tarif';

  /// GET - Kalkulasi harga
  static String get percetakanKalkulasiHarga =>
      '$apiBaseUrl/percetakan/kalkulasi-harga';

  /// GET/PUT - Detail pesanan by ID
  static String percetakanById(String id) => '$apiBaseUrl/percetakan/$id';

  /// PUT - Konfirmasi pesanan
  static String percetakanKonfirmasi(String id) =>
      '$apiBaseUrl/percetakan/$id/konfirmasi';

  /// PUT - Update status pesanan
  static String percetakanStatus(String id) =>
      '$apiBaseUrl/percetakan/$id/status';

  /// PUT - Batalkan pesanan
  static String percetakanBatal(String id) =>
      '$apiBaseUrl/percetakan/$id/batal';

  /// POST - Buat pengiriman
  static String percetakanPengiriman(String id) =>
      '$apiBaseUrl/percetakan/$id/pengiriman';

  /// POST - Buat tarif percetakan baru
  static String get percetakanTarifBaru => '$apiBaseUrl/percetakan/tarif';

  /// GET/PUT/DELETE - Detail tarif by ID
  static String percetakanTarifById(String id) =>
      '$apiBaseUrl/percetakan/tarif/$id';

  /// POST - Simpan parameter harga
  static String get percetakanParameterHarga =>
      '$apiBaseUrl/percetakan/tarif/parameter';

  /// GET - Ambil parameter harga
  static String get percetakanGetParameterHarga =>
      '$apiBaseUrl/percetakan/tarif/parameter';

  /// POST - Buat kombinasi tarif
  static String get percetakanKombinasiTarif =>
      '$apiBaseUrl/percetakan/tarif/kombinasi';

  /// GET - Ambil semua kombinasi tarif
  static String get percetakanGetKombinasiTarif =>
      '$apiBaseUrl/percetakan/tarif/kombinasi';

  /// PUT - Toggle status aktif kombinasi
  static String percetakanKombinasiToggle(String id) =>
      '$apiBaseUrl/percetakan/tarif/kombinasi/$id/toggle';

  /// DELETE - Hapus kombinasi tarif
  static String percetakanKombinasiHapus(String id) =>
      '$apiBaseUrl/percetakan/tarif/kombinasi/$id';

  /// POST - Kalkulasi opsi harga
  static String get percetakanKalkulasiOpsi =>
      '$apiBaseUrl/percetakan/kalkulasi-opsi';

  /// POST - Buat pesanan baru (snapshot pattern)
  static String get percetakanPesananBaru => '$apiBaseUrl/percetakan/pesanan';

  /// GET - Pesanan untuk percetakan
  static String get percetakanPesananUntukPercetakan =>
      '$apiBaseUrl/percetakan/pesanan/untuk-percetakan';

  /// POST - Konfirmasi penerimaan pesanan
  static String percetakanKonfirmasiTerima(String id) =>
      '$apiBaseUrl/percetakan/$id/konfirmasi-terima';

  /// PUT - Perbarui detail pesanan
  static String percetakanPerbaruiDetail(String id) =>
      '$apiBaseUrl/percetakan/$id/perbarui';

  // ============================================
  // UPLOAD ENDPOINTS
  // ============================================

  /// GET - Daftar file dengan pagination
  static String get upload => '$apiBaseUrl/upload';

  /// POST - Upload single file
  static String get uploadSingle => '$apiBaseUrl/upload/single';

  /// POST - Upload multiple files
  static String get uploadMultiple => '$apiBaseUrl/upload/multiple';

  /// GET - Ambil URL file by ID
  static String uploadById(String id) => '$apiBaseUrl/upload/$id';

  /// GET - Metadata file by ID
  static String uploadMetadata(String id) => '$apiBaseUrl/upload/metadata/$id';

  /// DELETE - Hapus file
  static String uploadHapus(String id) => '$apiBaseUrl/upload/$id';

  /// GET - Download template naskah (public)
  static String get uploadTemplateNaskah =>
      '$apiBaseUrl/upload/template/naskah';

  /// POST - Process image (resize/compress)
  static String uploadProcessImage(String id) =>
      '$apiBaseUrl/upload/image/$id/process';

  /// POST - Process image dengan preset
  static String uploadProcessPreset(String id, String preset) =>
      '$apiBaseUrl/upload/image/$id/preset/$preset';

  /// POST - Konversi DOCX ke PDF by ID
  static String uploadConvertDocx(String id) =>
      '$apiBaseUrl/upload/$id/convert/pdf';

  /// POST - Konversi DOCX ke PDF dari URL
  static String get uploadConvertDocxUrl =>
      '$apiBaseUrl/upload/convert/pdf-from-url';

  // ============================================
  // PEMBAYARAN ENDPOINTS
  // ============================================

  /// GET/POST - Daftar pembayaran / Buat pembayaran baru
  static String get pembayaran => '$apiBaseUrl/pembayaran';

  /// GET - Detail pembayaran by ID
  static String pembayaranById(String id) => '$apiBaseUrl/pembayaran/$id';

  /// PUT - Konfirmasi pembayaran
  static String pembayaranKonfirmasi(String id) =>
      '$apiBaseUrl/pembayaran/$id/konfirmasi';

  /// PUT - Batalkan pembayaran
  static String pembayaranBatal(String id) =>
      '$apiBaseUrl/pembayaran/$id/batal';

  /// POST - Webhook pembayaran
  static String get pembayaranWebhook => '$apiBaseUrl/pembayaran/webhook';

  /// GET - Statistik ringkasan pembayaran
  static String get pembayaranStatistikRingkasan =>
      '$apiBaseUrl/pembayaran/statistik/ringkasan';

  // ============================================
  // NOTIFIKASI ENDPOINTS
  // ============================================

  /// GET - Daftar notifikasi
  static String get notifikasi => '$apiBaseUrl/notifikasi';

  /// GET - Notifikasi belum dibaca
  static String get notifikasiBelumDibaca =>
      '$apiBaseUrl/notifikasi/belum-dibaca';

  /// PUT - Tandai notifikasi sudah dibaca
  static String notifikasiDibaca(String id) =>
      '$apiBaseUrl/notifikasi/$id/dibaca';

  /// GET/DELETE - Detail notifikasi by ID
  static String notifikasiById(String id) => '$apiBaseUrl/notifikasi/$id';

  /// PUT - Tandai semua notifikasi sudah dibaca
  static String get notifikasiDibacaSemua =>
      '$apiBaseUrl/notifikasi/dibaca-semua';

  // ============================================
  // PENGGUNA DETAIL ENDPOINTS
  // ============================================

  /// GET - Ambil profil pengguna by ID (admin)
  static String penggunaProfil(String id) => '$apiBaseUrl/pengguna/$id/profil';

  /// GET - Review untuk naskah by ID (alternatif)
  static String reviewByNaskah(String idNaskah) =>
      '$apiBaseUrl/review/naskah/$idNaskah';

  // ============================================
  // HELPER METHODS
  // ============================================

  /// Build URL dengan query parameters
  static Uri buildUri(String endpoint, {Map<String, String>? queryParams}) {
    final uri = Uri.parse(endpoint);
    if (queryParams != null && queryParams.isNotEmpty) {
      return uri.replace(queryParameters: queryParams);
    }
    return uri;
  }

  /// Build URL gambar/file dari path relatif
  static String buildFileUrl(String? relativePath) {
    if (relativePath == null || relativePath.isEmpty) {
      return '';
    }
    // Jika sudah URL lengkap, kembalikan apa adanya
    if (relativePath.startsWith('http://') ||
        relativePath.startsWith('https://')) {
      return relativePath;
    }
    // Jika path relatif, tambahkan base URL
    return '$baseUrl/$relativePath';
  }

  /// Timeout default untuk HTTP request
  static const Duration defaultTimeout = Duration(seconds: 30);

  /// Timeout untuk upload file
  static const Duration uploadTimeout = Duration(minutes: 5);
}
