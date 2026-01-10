/// Pembayaran Service - Service untuk fitur Pembayaran
/// Mengelola pembayaran untuk semua role
library;

import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:publishify/config/api_config.dart';
import 'package:publishify/services/general/auth_service.dart';
import 'package:logger/logger.dart';

final _logger = Logger(
  printer: PrettyPrinter(
    methodCount: 0,
    dateTimeFormat: DateTimeFormat.onlyTimeAndSinceStart,
  ),
);

/// Service untuk mengelola pembayaran
class PembayaranService {
  // ============================================
  // GET - Daftar Pembayaran
  // ============================================

  /// GET /api/pembayaran - Ambil daftar pembayaran
  static Future<PembayaranListResponse> ambilDaftarPembayaran({
    int halaman = 1,
    int limit = 20,
    String? status,
    String? idPesanan,
  }) async {
    try {
      final token = await AuthService.getAccessToken();
      if (token == null) {
        throw Exception('Token tidak ditemukan. Silakan login kembali.');
      }

      final queryParams = <String, String>{
        'halaman': halaman.toString(),
        'limit': limit.toString(),
      };

      if (status != null && status.isNotEmpty) {
        queryParams['status'] = status;
      }

      if (idPesanan != null && idPesanan.isNotEmpty) {
        queryParams['idPesanan'] = idPesanan;
      }

      final uri = Uri.parse(
        ApiConfig.pembayaran,
      ).replace(queryParameters: queryParams);

      final response = await http
          .get(
            uri,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer $token',
              'X-Platform': 'mobile',
            },
          )
          .timeout(ApiConfig.defaultTimeout);

      _logger.d('GET ${uri.toString()} - Status: ${response.statusCode}');

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return PembayaranListResponse.fromJson(data);
      } else {
        throw Exception('HTTP Error ${response.statusCode}: ${response.body}');
      }
    } on SocketException {
      throw Exception('Tidak ada koneksi internet');
    } catch (e) {
      _logger.e('Error ambilDaftarPembayaran: $e');
      rethrow;
    }
  }

  // ============================================
  // GET - Detail Pembayaran
  // ============================================

  /// GET /api/pembayaran/:id - Ambil detail pembayaran
  static Future<PembayaranDetailResponse> ambilDetailPembayaran(
    String id,
  ) async {
    try {
      final token = await AuthService.getAccessToken();
      if (token == null) {
        throw Exception('Token tidak ditemukan. Silakan login kembali.');
      }

      final uri = Uri.parse(ApiConfig.pembayaranById(id));

      final response = await http
          .get(
            uri,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer $token',
              'X-Platform': 'mobile',
            },
          )
          .timeout(ApiConfig.defaultTimeout);

      _logger.d('GET ${uri.toString()} - Status: ${response.statusCode}');

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return PembayaranDetailResponse.fromJson(data);
      } else {
        throw Exception('HTTP Error ${response.statusCode}: ${response.body}');
      }
    } on SocketException {
      throw Exception('Tidak ada koneksi internet');
    } catch (e) {
      _logger.e('Error ambilDetailPembayaran: $e');
      rethrow;
    }
  }

  // ============================================
  // POST - Buat Pembayaran
  // ============================================

  /// POST /api/pembayaran - Buat pembayaran baru
  static Future<BuatPembayaranResponse> buatPembayaran({
    required String idPesanan,
    required String metodePembayaran,
    required double jumlah,
    String? catatan,
  }) async {
    try {
      final token = await AuthService.getAccessToken();
      if (token == null) {
        throw Exception('Token tidak ditemukan. Silakan login kembali.');
      }

      final uri = Uri.parse(ApiConfig.pembayaran);

      final body = <String, dynamic>{
        'idPesanan': idPesanan,
        'metodePembayaran': metodePembayaran,
        'jumlah': jumlah,
      };

      if (catatan != null && catatan.isNotEmpty) {
        body['catatan'] = catatan;
      }

      final response = await http
          .post(
            uri,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer $token',
              'X-Platform': 'mobile',
            },
            body: json.encode(body),
          )
          .timeout(ApiConfig.defaultTimeout);

      _logger.d('POST ${uri.toString()} - Status: ${response.statusCode}');

      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = json.decode(response.body);
        return BuatPembayaranResponse.fromJson(data);
      } else {
        throw Exception('HTTP Error ${response.statusCode}: ${response.body}');
      }
    } on SocketException {
      throw Exception('Tidak ada koneksi internet');
    } catch (e) {
      _logger.e('Error buatPembayaran: $e');
      rethrow;
    }
  }

  // ============================================
  // PUT - Konfirmasi Pembayaran
  // ============================================

  /// PUT /api/pembayaran/:id/konfirmasi - Konfirmasi pembayaran
  static Future<KonfirmasiPembayaranResponse> konfirmasiPembayaran({
    required String id,
    String? buktiPembayaran,
  }) async {
    try {
      final token = await AuthService.getAccessToken();
      if (token == null) {
        throw Exception('Token tidak ditemukan. Silakan login kembali.');
      }

      final uri = Uri.parse(ApiConfig.pembayaranKonfirmasi(id));

      final body = <String, dynamic>{};
      if (buktiPembayaran != null && buktiPembayaran.isNotEmpty) {
        body['buktiPembayaran'] = buktiPembayaran;
      }

      final response = await http
          .put(
            uri,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer $token',
              'X-Platform': 'mobile',
            },
            body: json.encode(body),
          )
          .timeout(ApiConfig.defaultTimeout);

      _logger.d('PUT ${uri.toString()} - Status: ${response.statusCode}');

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return KonfirmasiPembayaranResponse.fromJson(data);
      } else {
        throw Exception('HTTP Error ${response.statusCode}: ${response.body}');
      }
    } on SocketException {
      throw Exception('Tidak ada koneksi internet');
    } catch (e) {
      _logger.e('Error konfirmasiPembayaran: $e');
      rethrow;
    }
  }

  // ============================================
  // PUT - Batalkan Pembayaran
  // ============================================

  /// PUT /api/pembayaran/:id/batal - Batalkan pembayaran
  static Future<BatalPembayaranResponse> batalkanPembayaran({
    required String id,
    String? alasan,
  }) async {
    try {
      final token = await AuthService.getAccessToken();
      if (token == null) {
        throw Exception('Token tidak ditemukan. Silakan login kembali.');
      }

      final uri = Uri.parse(ApiConfig.pembayaranBatal(id));

      final body = <String, dynamic>{};
      if (alasan != null && alasan.isNotEmpty) {
        body['alasan'] = alasan;
      }

      final response = await http
          .put(
            uri,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer $token',
              'X-Platform': 'mobile',
            },
            body: json.encode(body),
          )
          .timeout(ApiConfig.defaultTimeout);

      _logger.d('PUT ${uri.toString()} - Status: ${response.statusCode}');

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return BatalPembayaranResponse.fromJson(data);
      } else {
        throw Exception('HTTP Error ${response.statusCode}: ${response.body}');
      }
    } on SocketException {
      throw Exception('Tidak ada koneksi internet');
    } catch (e) {
      _logger.e('Error batalkanPembayaran: $e');
      rethrow;
    }
  }

  // ============================================
  // GET - Statistik Pembayaran
  // ============================================

  /// GET /api/pembayaran/statistik/ringkasan - Ambil statistik ringkasan
  static Future<StatistikPembayaranResponse> ambilStatistikRingkasan() async {
    try {
      final token = await AuthService.getAccessToken();
      if (token == null) {
        throw Exception('Token tidak ditemukan. Silakan login kembali.');
      }

      final uri = Uri.parse(ApiConfig.pembayaranStatistikRingkasan);

      final response = await http
          .get(
            uri,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer $token',
              'X-Platform': 'mobile',
            },
          )
          .timeout(ApiConfig.defaultTimeout);

      _logger.d('GET ${uri.toString()} - Status: ${response.statusCode}');

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return StatistikPembayaranResponse.fromJson(data);
      } else {
        throw Exception('HTTP Error ${response.statusCode}: ${response.body}');
      }
    } on SocketException {
      throw Exception('Tidak ada koneksi internet');
    } catch (e) {
      _logger.e('Error ambilStatistikRingkasan: $e');
      rethrow;
    }
  }
}

// ============================================
// RESPONSE MODELS
// ============================================

/// Response untuk list pembayaran
class PembayaranListResponse {
  final bool sukses;
  final String pesan;
  final List<PembayaranData>? data;
  final PaginationMeta? metadata;

  PembayaranListResponse({
    required this.sukses,
    required this.pesan,
    this.data,
    this.metadata,
  });

  factory PembayaranListResponse.fromJson(Map<String, dynamic> json) {
    return PembayaranListResponse(
      sukses: json['sukses'] ?? false,
      pesan: json['pesan'] ?? '',
      data: json['data'] != null
          ? (json['data'] as List)
              .map((e) => PembayaranData.fromJson(e))
              .toList()
          : null,
      metadata: json['metadata'] != null
          ? PaginationMeta.fromJson(json['metadata'])
          : null,
    );
  }
}

/// Response untuk detail pembayaran
class PembayaranDetailResponse {
  final bool sukses;
  final String pesan;
  final PembayaranData? data;

  PembayaranDetailResponse({
    required this.sukses,
    required this.pesan,
    this.data,
  });

  factory PembayaranDetailResponse.fromJson(Map<String, dynamic> json) {
    return PembayaranDetailResponse(
      sukses: json['sukses'] ?? false,
      pesan: json['pesan'] ?? '',
      data: json['data'] != null
          ? PembayaranData.fromJson(json['data'])
          : null,
    );
  }
}

/// Response untuk buat pembayaran
class BuatPembayaranResponse {
  final bool sukses;
  final String pesan;
  final PembayaranData? data;

  BuatPembayaranResponse({
    required this.sukses,
    required this.pesan,
    this.data,
  });

  factory BuatPembayaranResponse.fromJson(Map<String, dynamic> json) {
    return BuatPembayaranResponse(
      sukses: json['sukses'] ?? false,
      pesan: json['pesan'] ?? '',
      data: json['data'] != null
          ? PembayaranData.fromJson(json['data'])
          : null,
    );
  }
}

/// Response untuk konfirmasi pembayaran
class KonfirmasiPembayaranResponse {
  final bool sukses;
  final String pesan;
  final PembayaranData? data;

  KonfirmasiPembayaranResponse({
    required this.sukses,
    required this.pesan,
    this.data,
  });

  factory KonfirmasiPembayaranResponse.fromJson(Map<String, dynamic> json) {
    return KonfirmasiPembayaranResponse(
      sukses: json['sukses'] ?? false,
      pesan: json['pesan'] ?? '',
      data: json['data'] != null
          ? PembayaranData.fromJson(json['data'])
          : null,
    );
  }
}

/// Response untuk batal pembayaran
class BatalPembayaranResponse {
  final bool sukses;
  final String pesan;

  BatalPembayaranResponse({required this.sukses, required this.pesan});

  factory BatalPembayaranResponse.fromJson(Map<String, dynamic> json) {
    return BatalPembayaranResponse(
      sukses: json['sukses'] ?? false,
      pesan: json['pesan'] ?? '',
    );
  }
}

/// Response untuk statistik pembayaran
class StatistikPembayaranResponse {
  final bool sukses;
  final String pesan;
  final StatistikPembayaranData? data;

  StatistikPembayaranResponse({
    required this.sukses,
    required this.pesan,
    this.data,
  });

  factory StatistikPembayaranResponse.fromJson(Map<String, dynamic> json) {
    return StatistikPembayaranResponse(
      sukses: json['sukses'] ?? false,
      pesan: json['pesan'] ?? '',
      data: json['data'] != null
          ? StatistikPembayaranData.fromJson(json['data'])
          : null,
    );
  }
}

/// Data pembayaran
class PembayaranData {
  final String id;
  final String idPesanan;
  final String? idPengguna;
  final double jumlah;
  final String metodePembayaran;
  final String status;
  final String? buktiPembayaran;
  final String? catatan;
  final String? nomorReferensi;
  final String? dibuatPada;
  final String? diperbaruiPada;
  final PesananData? pesanan;

  PembayaranData({
    required this.id,
    required this.idPesanan,
    this.idPengguna,
    required this.jumlah,
    required this.metodePembayaran,
    required this.status,
    this.buktiPembayaran,
    this.catatan,
    this.nomorReferensi,
    this.dibuatPada,
    this.diperbaruiPada,
    this.pesanan,
  });

  factory PembayaranData.fromJson(Map<String, dynamic> json) {
    return PembayaranData(
      id: json['id'] ?? '',
      idPesanan: json['idPesanan'] ?? '',
      idPengguna: json['idPengguna'],
      jumlah: (json['jumlah'] as num?)?.toDouble() ?? 0.0,
      metodePembayaran: json['metodePembayaran'] ?? '',
      status: json['status'] ?? '',
      buktiPembayaran: json['buktiPembayaran'],
      catatan: json['catatan'],
      nomorReferensi: json['nomorReferensi'],
      dibuatPada: json['dibuatPada'],
      diperbaruiPada: json['diperbaruiPada'],
      pesanan:
          json['pesanan'] != null ? PesananData.fromJson(json['pesanan']) : null,
    );
  }

  /// Label status dalam Bahasa Indonesia
  String get labelStatus {
    switch (status.toLowerCase()) {
      case 'tertunda':
        return 'Tertunda';
      case 'diproses':
        return 'Diproses';
      case 'berhasil':
        return 'Berhasil';
      case 'gagal':
        return 'Gagal';
      case 'dibatalkan':
        return 'Dibatalkan';
      case 'dikembalikan':
        return 'Dikembalikan';
      default:
        return status;
    }
  }

  /// Label metode pembayaran
  String get labelMetodePembayaran {
    switch (metodePembayaran.toLowerCase()) {
      case 'transfer_bank':
        return 'Transfer Bank';
      case 'kartu_kredit':
        return 'Kartu Kredit';
      case 'e_wallet':
        return 'E-Wallet';
      case 'virtual_account':
        return 'Virtual Account';
      case 'cod':
        return 'COD';
      default:
        return metodePembayaran;
    }
  }
}

/// Data pesanan dalam pembayaran
class PesananData {
  final String id;
  final String? judulNaskah;
  final int jumlahCetak;
  final double totalHarga;

  PesananData({
    required this.id,
    this.judulNaskah,
    required this.jumlahCetak,
    required this.totalHarga,
  });

  factory PesananData.fromJson(Map<String, dynamic> json) {
    return PesananData(
      id: json['id'] ?? '',
      judulNaskah: json['naskah']?['judul'],
      jumlahCetak: json['jumlahCetak'] ?? 0,
      totalHarga: (json['totalHarga'] as num?)?.toDouble() ?? 0.0,
    );
  }
}

/// Data statistik pembayaran
class StatistikPembayaranData {
  final int totalPembayaran;
  final double totalNominal;
  final int tertunda;
  final int diproses;
  final int berhasil;
  final int gagal;
  final int dibatalkan;

  StatistikPembayaranData({
    required this.totalPembayaran,
    required this.totalNominal,
    required this.tertunda,
    required this.diproses,
    required this.berhasil,
    required this.gagal,
    required this.dibatalkan,
  });

  factory StatistikPembayaranData.fromJson(Map<String, dynamic> json) {
    return StatistikPembayaranData(
      totalPembayaran: json['totalPembayaran'] ?? 0,
      totalNominal: (json['totalNominal'] as num?)?.toDouble() ?? 0.0,
      tertunda: json['tertunda'] ?? 0,
      diproses: json['diproses'] ?? 0,
      berhasil: json['berhasil'] ?? 0,
      gagal: json['gagal'] ?? 0,
      dibatalkan: json['dibatalkan'] ?? 0,
    );
  }
}

/// Pagination metadata
class PaginationMeta {
  final int total;
  final int halaman;
  final int limit;
  final int totalHalaman;

  PaginationMeta({
    required this.total,
    required this.halaman,
    required this.limit,
    required this.totalHalaman,
  });

  factory PaginationMeta.fromJson(Map<String, dynamic> json) {
    return PaginationMeta(
      total: json['total'] ?? 0,
      halaman: json['halaman'] ?? 1,
      limit: json['limit'] ?? 20,
      totalHalaman: json['totalHalaman'] ?? 1,
    );
  }
}
