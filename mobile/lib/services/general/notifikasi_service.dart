/// Notifikasi Service - Service Terpusat untuk Notifikasi
/// Dapat digunakan oleh semua role (Writer, Editor, Percetakan, Admin)
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

/// Service untuk mengelola notifikasi semua role
class NotifikasiService {
  // ============================================
  // GET - Daftar Notifikasi
  // ============================================

  /// GET /api/notifikasi
  /// Ambil daftar notifikasi dengan filter dan pagination
  static Future<NotifikasiListResponse> getNotifikasi({
    int halaman = 1,
    int limit = 20,
    bool? dibaca,
    String? tipe,
    String? tanggalMulai,
    String? tanggalSelesai,
    String urutkan = 'dibuatPada',
    String arah = 'desc',
  }) async {
    try {
      final token = await AuthService.getAccessToken();
      if (token == null) {
        return NotifikasiListResponse(
          sukses: false,
          pesan: 'Token tidak ditemukan. Silakan login kembali.',
        );
      }

      // Build query parameters
      final queryParams = <String, String>{
        'halaman': halaman.toString(),
        'limit': limit.toString(),
        'urutkan': urutkan,
        'arah': arah,
      };

      if (dibaca != null) {
        queryParams['dibaca'] = dibaca.toString();
      }

      if (tipe != null && tipe.isNotEmpty) {
        queryParams['tipe'] = tipe;
      }

      if (tanggalMulai != null && tanggalMulai.isNotEmpty) {
        queryParams['tanggalMulai'] = tanggalMulai;
      }

      if (tanggalSelesai != null && tanggalSelesai.isNotEmpty) {
        queryParams['tanggalSelesai'] = tanggalSelesai;
      }

      final uri = Uri.parse(
        ApiConfig.notifikasi,
      ).replace(queryParameters: queryParams);

      _logger.d('GET $uri');

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

      _logger.d('Response status: ${response.statusCode}');

      if (response.statusCode == 200) {
        final jsonResponse = json.decode(response.body);
        return NotifikasiListResponse.fromJson(jsonResponse);
      } else if (response.statusCode == 401) {
        return NotifikasiListResponse(
          sukses: false,
          pesan: 'Unauthorized - Token tidak valid atau sudah kedaluwarsa',
        );
      } else {
        final jsonResponse = json.decode(response.body);
        return NotifikasiListResponse(
          sukses: false,
          pesan: jsonResponse['pesan'] ?? 'Gagal mengambil notifikasi',
        );
      }
    } on SocketException {
      return NotifikasiListResponse(
        sukses: false,
        pesan: 'Tidak ada koneksi internet',
      );
    } catch (e) {
      _logger.e('Error getNotifikasi: $e');
      return NotifikasiListResponse(
        sukses: false,
        pesan: 'Terjadi kesalahan: ${e.toString()}',
      );
    }
  }

  // ============================================
  // GET - Detail Notifikasi
  // ============================================

  /// GET /api/notifikasi/:id
  /// Ambil detail notifikasi berdasarkan ID
  static Future<NotifikasiResponse> getNotifikasiById(String id) async {
    try {
      final token = await AuthService.getAccessToken();
      if (token == null) {
        return NotifikasiResponse(
          sukses: false,
          pesan: 'Token tidak ditemukan. Silakan login kembali.',
        );
      }

      final uri = Uri.parse(ApiConfig.notifikasiById(id));

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

      _logger.d('GET $uri - Status: ${response.statusCode}');

      if (response.statusCode == 200) {
        final jsonResponse = json.decode(response.body);
        return NotifikasiResponse.fromJson(jsonResponse);
      } else {
        final jsonResponse = json.decode(response.body);
        return NotifikasiResponse(
          sukses: false,
          pesan: jsonResponse['pesan'] ?? 'Gagal mengambil detail notifikasi',
        );
      }
    } on SocketException {
      return NotifikasiResponse(
        sukses: false,
        pesan: 'Tidak ada koneksi internet',
      );
    } catch (e) {
      _logger.e('Error getNotifikasiById: $e');
      return NotifikasiResponse(
        sukses: false,
        pesan: 'Terjadi kesalahan: ${e.toString()}',
      );
    }
  }

  // ============================================
  // PUT - Tandai Dibaca
  // ============================================

  /// PUT /api/notifikasi/:id/baca
  /// Tandai notifikasi sebagai sudah dibaca
  static Future<NotifikasiResponse> tandaiDibaca(String id) async {
    try {
      final token = await AuthService.getAccessToken();
      if (token == null) {
        return NotifikasiResponse(
          sukses: false,
          pesan: 'Token tidak ditemukan. Silakan login kembali.',
        );
      }

      final uri = Uri.parse('${ApiConfig.notifikasiById(id)}/baca');

      final response = await http
          .put(
            uri,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer $token',
              'X-Platform': 'mobile',
            },
          )
          .timeout(ApiConfig.defaultTimeout);

      _logger.d('PUT $uri - Status: ${response.statusCode}');

      if (response.statusCode == 200) {
        final jsonResponse = json.decode(response.body);
        return NotifikasiResponse.fromJson(jsonResponse);
      } else {
        final jsonResponse = json.decode(response.body);
        return NotifikasiResponse(
          sukses: false,
          pesan:
              jsonResponse['pesan'] ??
              'Gagal menandai notifikasi sebagai dibaca',
        );
      }
    } on SocketException {
      return NotifikasiResponse(
        sukses: false,
        pesan: 'Tidak ada koneksi internet',
      );
    } catch (e) {
      _logger.e('Error tandaiDibaca: $e');
      return NotifikasiResponse(
        sukses: false,
        pesan: 'Terjadi kesalahan: ${e.toString()}',
      );
    }
  }

  // ============================================
  // PUT - Tandai Semua Dibaca
  // ============================================

  /// PUT /api/notifikasi/baca-semua/all
  /// Tandai semua notifikasi sebagai sudah dibaca
  static Future<NotifikasiResponse> tandaiSemuaDibaca() async {
    try {
      final token = await AuthService.getAccessToken();
      if (token == null) {
        return NotifikasiResponse(
          sukses: false,
          pesan: 'Token tidak ditemukan. Silakan login kembali.',
        );
      }

      final uri = Uri.parse('${ApiConfig.notifikasi}/baca-semua/all');

      final response = await http
          .put(
            uri,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer $token',
              'X-Platform': 'mobile',
            },
          )
          .timeout(ApiConfig.defaultTimeout);

      _logger.d('PUT $uri - Status: ${response.statusCode}');

      if (response.statusCode == 200) {
        final jsonResponse = json.decode(response.body);
        return NotifikasiResponse(
          sukses: jsonResponse['sukses'] ?? false,
          pesan: jsonResponse['pesan'],
        );
      } else {
        final jsonResponse = json.decode(response.body);
        return NotifikasiResponse(
          sukses: false,
          pesan:
              jsonResponse['pesan'] ??
              'Gagal menandai semua notifikasi sebagai dibaca',
        );
      }
    } on SocketException {
      return NotifikasiResponse(
        sukses: false,
        pesan: 'Tidak ada koneksi internet',
      );
    } catch (e) {
      _logger.e('Error tandaiSemuaDibaca: $e');
      return NotifikasiResponse(
        sukses: false,
        pesan: 'Terjadi kesalahan: ${e.toString()}',
      );
    }
  }

  // ============================================
  // DELETE - Hapus Notifikasi
  // ============================================

  /// DELETE /api/notifikasi/:id
  /// Hapus notifikasi
  static Future<NotifikasiResponse> hapusNotifikasi(String id) async {
    try {
      final token = await AuthService.getAccessToken();
      if (token == null) {
        return NotifikasiResponse(
          sukses: false,
          pesan: 'Token tidak ditemukan. Silakan login kembali.',
        );
      }

      final uri = Uri.parse(ApiConfig.notifikasiById(id));

      final response = await http
          .delete(
            uri,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer $token',
              'X-Platform': 'mobile',
            },
          )
          .timeout(ApiConfig.defaultTimeout);

      _logger.d('DELETE $uri - Status: ${response.statusCode}');

      if (response.statusCode == 200) {
        final jsonResponse = json.decode(response.body);
        return NotifikasiResponse(
          sukses: jsonResponse['sukses'] ?? false,
          pesan: jsonResponse['pesan'],
        );
      } else {
        final jsonResponse = json.decode(response.body);
        return NotifikasiResponse(
          sukses: false,
          pesan: jsonResponse['pesan'] ?? 'Gagal menghapus notifikasi',
        );
      }
    } on SocketException {
      return NotifikasiResponse(
        sukses: false,
        pesan: 'Tidak ada koneksi internet',
      );
    } catch (e) {
      _logger.e('Error hapusNotifikasi: $e');
      return NotifikasiResponse(
        sukses: false,
        pesan: 'Terjadi kesalahan: ${e.toString()}',
      );
    }
  }

  // ============================================
  // GET - Hitung Belum Dibaca
  // ============================================

  /// GET /api/notifikasi/belum-dibaca/count
  /// Hitung jumlah notifikasi yang belum dibaca
  static Future<NotifikasiBelumDibacaResponse> hitungBelumDibaca() async {
    try {
      final token = await AuthService.getAccessToken();
      if (token == null) {
        return NotifikasiBelumDibacaResponse(
          sukses: false,
          pesan: 'Token tidak ditemukan. Silakan login kembali.',
        );
      }

      final uri = Uri.parse('${ApiConfig.notifikasi}/belum-dibaca/count');

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

      _logger.d('GET $uri - Status: ${response.statusCode}');

      if (response.statusCode == 200) {
        final jsonResponse = json.decode(response.body);
        return NotifikasiBelumDibacaResponse.fromJson(jsonResponse);
      } else {
        final jsonResponse = json.decode(response.body);
        return NotifikasiBelumDibacaResponse(
          sukses: false,
          pesan:
              jsonResponse['pesan'] ??
              'Gagal menghitung notifikasi belum dibaca',
        );
      }
    } on SocketException {
      return NotifikasiBelumDibacaResponse(
        sukses: false,
        pesan: 'Tidak ada koneksi internet',
      );
    } catch (e) {
      _logger.e('Error hitungBelumDibaca: $e');
      return NotifikasiBelumDibacaResponse(
        sukses: false,
        pesan: 'Terjadi kesalahan: ${e.toString()}',
      );
    }
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  /// Helper untuk mendapatkan icon berdasarkan tipe
  static String getTipeIcon(String tipe) {
    switch (tipe.toLowerCase()) {
      case 'sukses':
        return '✅';
      case 'peringatan':
        return '⚠️';
      case 'error':
        return '❌';
      case 'info':
      default:
        return 'ℹ️';
    }
  }

  /// Helper untuk mendapatkan label tipe
  static String getTipeLabel(String tipe) {
    switch (tipe.toLowerCase()) {
      case 'sukses':
        return 'Sukses';
      case 'peringatan':
        return 'Peringatan';
      case 'error':
        return 'Error';
      case 'info':
      default:
        return 'Info';
    }
  }
}

// ============================================
// RESPONSE MODELS
// ============================================

/// Model untuk Notifikasi
class Notifikasi {
  final String id;
  final String idPengguna;
  final String judul;
  final String pesan;
  final String tipe; // 'info' | 'sukses' | 'peringatan' | 'error'
  final String? url;
  final bool dibaca;
  final DateTime dibuatPada;
  final DateTime diperbaruiPada;

  Notifikasi({
    required this.id,
    required this.idPengguna,
    required this.judul,
    required this.pesan,
    required this.tipe,
    this.url,
    required this.dibaca,
    required this.dibuatPada,
    required this.diperbaruiPada,
  });

  factory Notifikasi.fromJson(Map<String, dynamic> json) {
    return Notifikasi(
      id: json['id'] ?? '',
      idPengguna: json['idPengguna'] ?? '',
      judul: json['judul'] ?? '',
      pesan: json['pesan'] ?? '',
      tipe: json['tipe'] ?? 'info',
      url: json['url'],
      dibaca: json['dibaca'] ?? false,
      dibuatPada: json['dibuatPada'] != null
          ? DateTime.parse(json['dibuatPada'])
          : DateTime.now(),
      diperbaruiPada: json['diperbaruiPada'] != null
          ? DateTime.parse(json['diperbaruiPada'])
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'idPengguna': idPengguna,
      'judul': judul,
      'pesan': pesan,
      'tipe': tipe,
      'url': url,
      'dibaca': dibaca,
      'dibuatPada': dibuatPada.toIso8601String(),
      'diperbaruiPada': diperbaruiPada.toIso8601String(),
    };
  }
}

/// Model untuk Metadata Pagination
class NotifikasiMetadata {
  final int total;
  final int halaman;
  final int limit;
  final int totalHalaman;

  NotifikasiMetadata({
    required this.total,
    required this.halaman,
    required this.limit,
    required this.totalHalaman,
  });

  factory NotifikasiMetadata.fromJson(Map<String, dynamic> json) {
    return NotifikasiMetadata(
      total: json['total'] ?? 0,
      halaman: json['halaman'] ?? 1,
      limit: json['limit'] ?? 20,
      totalHalaman: json['totalHalaman'] ?? 1,
    );
  }
}

/// Response untuk list notifikasi dengan pagination
class NotifikasiListResponse {
  final bool sukses;
  final String? pesan;
  final List<Notifikasi>? data;
  final NotifikasiMetadata? metadata;

  NotifikasiListResponse({
    required this.sukses,
    this.pesan,
    this.data,
    this.metadata,
  });

  factory NotifikasiListResponse.fromJson(Map<String, dynamic> json) {
    return NotifikasiListResponse(
      sukses: json['sukses'] ?? false,
      pesan: json['pesan'],
      data: json['data'] != null
          ? (json['data'] as List)
                .map((item) => Notifikasi.fromJson(item))
                .toList()
          : null,
      metadata: json['metadata'] != null
          ? NotifikasiMetadata.fromJson(json['metadata'])
          : null,
    );
  }
}

/// Response untuk single notifikasi
class NotifikasiResponse {
  final bool sukses;
  final String? pesan;
  final Notifikasi? data;

  NotifikasiResponse({required this.sukses, this.pesan, this.data});

  factory NotifikasiResponse.fromJson(Map<String, dynamic> json) {
    return NotifikasiResponse(
      sukses: json['sukses'] ?? false,
      pesan: json['pesan'],
      data: json['data'] != null ? Notifikasi.fromJson(json['data']) : null,
    );
  }
}

/// Response untuk count notifikasi belum dibaca
class NotifikasiBelumDibacaResponse {
  final bool sukses;
  final String? pesan;
  final int? totalBelumDibaca;

  NotifikasiBelumDibacaResponse({
    required this.sukses,
    this.pesan,
    this.totalBelumDibaca,
  });

  factory NotifikasiBelumDibacaResponse.fromJson(Map<String, dynamic> json) {
    return NotifikasiBelumDibacaResponse(
      sukses: json['sukses'] ?? false,
      pesan: json['pesan'],
      totalBelumDibaca: json['data'] != null
          ? json['data']['totalBelumDibaca']
          : null,
    );
  }
}
