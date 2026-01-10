/// DEPRECATED: Gunakan NotifikasiService dari services/general/notifikasi_service.dart
/// File ini hanya untuk backward compatibility
library;

// Re-export semua dari service general untuk backward compatibility
export 'package:publishify/services/general/notifikasi_service.dart';

import 'package:publishify/services/general/notifikasi_service.dart';

/// EditorNotifikasiService - Wrapper untuk backward compatibility
/// Semua method didelegasikan ke NotifikasiService general
class EditorNotifikasiService {
  /// Ambil daftar notifikasi editor
  static Future<NotifikasiListResponse> ambilNotifikasi({
    int halaman = 1,
    int limit = 20,
    bool? dibaca,
    String? tipe,
    String? tanggalMulai,
    String? tanggalSelesai,
    String urutkan = 'dibuatPada',
    String arah = 'desc',
  }) async {
    return NotifikasiService.getNotifikasi(
      halaman: halaman,
      limit: limit,
      dibaca: dibaca,
      tipe: tipe,
      tanggalMulai: tanggalMulai,
      tanggalSelesai: tanggalSelesai,
      urutkan: urutkan,
      arah: arah,
    );
  }

  /// Ambil detail notifikasi
  static Future<NotifikasiResponse> ambilNotifikasiById(String id) async {
    return NotifikasiService.getNotifikasiById(id);
  }

  /// Tandai notifikasi sebagai sudah dibaca
  static Future<NotifikasiResponse> tandaiDibaca(String id) async {
    return NotifikasiService.tandaiDibaca(id);
  }

  /// Tandai semua notifikasi sebagai sudah dibaca
  static Future<NotifikasiResponse> tandaiSemuaDibaca() async {
    return NotifikasiService.tandaiSemuaDibaca();
  }

  /// Ambil jumlah notifikasi belum dibaca
  static Future<NotifikasiBelumDibacaResponse> hitungBelumDibaca() async {
    return NotifikasiService.hitungBelumDibaca();
  }

  /// Hapus notifikasi
  static Future<NotifikasiResponse> hapusNotifikasi(String id) async {
    return NotifikasiService.hapusNotifikasi(id);
  }
}
