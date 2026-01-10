/// Admin Service - Service untuk fitur Admin
/// Mengelola pengguna, review, naskah untuk role Admin
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

/// Admin Service untuk mengelola fitur admin
class AdminService {
  // ============================================
  // PENGGUNA MANAGEMENT
  // ============================================

  /// GET /api/pengguna - Ambil daftar semua pengguna
  static Future<PenggunaListResponse> ambilDaftarPengguna({
    int halaman = 1,
    int limit = 20,
    String? peran,
    String? cari,
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

      if (peran != null && peran.isNotEmpty) {
        queryParams['peran'] = peran;
      }

      if (cari != null && cari.isNotEmpty) {
        queryParams['cari'] = cari;
      }

      final uri = Uri.parse(
        ApiConfig.pengguna,
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
        return PenggunaListResponse.fromJson(data);
      } else {
        throw Exception('HTTP Error ${response.statusCode}: ${response.body}');
      }
    } on SocketException {
      throw Exception('Tidak ada koneksi internet');
    } catch (e) {
      _logger.e('Error ambilDaftarPengguna: $e');
      rethrow;
    }
  }

  /// GET /api/pengguna/statistik - Ambil statistik pengguna
  static Future<StatistikPenggunaResponse> ambilStatistikPengguna() async {
    try {
      final token = await AuthService.getAccessToken();
      if (token == null) {
        throw Exception('Token tidak ditemukan. Silakan login kembali.');
      }

      final uri = Uri.parse(ApiConfig.penggunaStatistik);

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
        return StatistikPenggunaResponse.fromJson(data);
      } else {
        throw Exception('HTTP Error ${response.statusCode}: ${response.body}');
      }
    } on SocketException {
      throw Exception('Tidak ada koneksi internet');
    } catch (e) {
      _logger.e('Error ambilStatistikPengguna: $e');
      rethrow;
    }
  }

  /// GET /api/pengguna/:id - Ambil detail pengguna
  static Future<PenggunaDetailResponse> ambilDetailPengguna(String id) async {
    try {
      final token = await AuthService.getAccessToken();
      if (token == null) {
        throw Exception('Token tidak ditemukan. Silakan login kembali.');
      }

      final uri = Uri.parse(ApiConfig.penggunaById(id));

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
        return PenggunaDetailResponse.fromJson(data);
      } else {
        throw Exception('HTTP Error ${response.statusCode}: ${response.body}');
      }
    } on SocketException {
      throw Exception('Tidak ada koneksi internet');
    } catch (e) {
      _logger.e('Error ambilDetailPengguna: $e');
      rethrow;
    }
  }

  /// PUT /api/pengguna/:id - Perbarui data pengguna (Admin only)
  static Future<PerbaruiPenggunaResponse> perbaruiPengguna({
    required String id,
    String? email,
    String? telepon,
    bool? aktif,
    bool? terverifikasi,
  }) async {
    try {
      final token = await AuthService.getAccessToken();
      if (token == null) {
        throw Exception('Token tidak ditemukan. Silakan login kembali.');
      }

      final uri = Uri.parse(ApiConfig.penggunaById(id));

      final body = <String, dynamic>{};
      if (email != null) body['email'] = email;
      if (telepon != null) body['telepon'] = telepon;
      if (aktif != null) body['aktif'] = aktif;
      if (terverifikasi != null) body['terverifikasi'] = terverifikasi;

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
        return PerbaruiPenggunaResponse.fromJson(data);
      } else {
        throw Exception('HTTP Error ${response.statusCode}: ${response.body}');
      }
    } on SocketException {
      throw Exception('Tidak ada koneksi internet');
    } catch (e) {
      _logger.e('Error perbaruiPengguna: $e');
      rethrow;
    }
  }

  /// DELETE /api/pengguna/:id - Hapus pengguna (Admin only)
  static Future<HapusPenggunaResponse> hapusPengguna(String id) async {
    try {
      final token = await AuthService.getAccessToken();
      if (token == null) {
        throw Exception('Token tidak ditemukan. Silakan login kembali.');
      }

      final uri = Uri.parse(ApiConfig.penggunaById(id));

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

      _logger.d('DELETE ${uri.toString()} - Status: ${response.statusCode}');

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return HapusPenggunaResponse.fromJson(data);
      } else {
        throw Exception('HTTP Error ${response.statusCode}: ${response.body}');
      }
    } on SocketException {
      throw Exception('Tidak ada koneksi internet');
    } catch (e) {
      _logger.e('Error hapusPengguna: $e');
      rethrow;
    }
  }

  // ============================================
  // REVIEW MANAGEMENT (Admin)
  // ============================================

  /// POST /api/review/tugaskan - Tugaskan review ke editor
  static Future<TugaskanReviewResponse> tugaskanReview({
    required String idNaskah,
    required String idEditor,
    DateTime? batasWaktu,
    String? catatan,
  }) async {
    try {
      final token = await AuthService.getAccessToken();
      if (token == null) {
        throw Exception('Token tidak ditemukan. Silakan login kembali.');
      }

      final uri = Uri.parse(ApiConfig.reviewTugaskan);

      final body = <String, dynamic>{
        'idNaskah': idNaskah,
        'idEditor': idEditor,
      };

      if (batasWaktu != null) {
        body['batasWaktu'] = batasWaktu.toIso8601String();
      }

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
        return TugaskanReviewResponse.fromJson(data);
      } else {
        throw Exception('HTTP Error ${response.statusCode}: ${response.body}');
      }
    } on SocketException {
      throw Exception('Tidak ada koneksi internet');
    } catch (e) {
      _logger.e('Error tugaskanReview: $e');
      rethrow;
    }
  }

  /// GET /api/review - Ambil semua review (untuk Admin)
  static Future<ReviewListResponse> ambilSemuaReview({
    int halaman = 1,
    int limit = 20,
    String? status,
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

      final uri = Uri.parse(
        ApiConfig.review,
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
        return ReviewListResponse.fromJson(data);
      } else {
        throw Exception('HTTP Error ${response.statusCode}: ${response.body}');
      }
    } on SocketException {
      throw Exception('Tidak ada koneksi internet');
    } catch (e) {
      _logger.e('Error ambilSemuaReview: $e');
      rethrow;
    }
  }

  // ============================================
  // NASKAH MANAGEMENT (Admin)
  // ============================================

  /// GET /api/naskah - Ambil semua naskah (admin)
  static Future<NaskahListResponse> ambilSemuaNaskah({
    int halaman = 1,
    int limit = 20,
    String? status,
    String? cari,
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

      if (cari != null && cari.isNotEmpty) {
        queryParams['cari'] = cari;
      }

      final uri = Uri.parse(
        ApiConfig.naskah,
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
        return NaskahListResponse.fromJson(data);
      } else {
        throw Exception('HTTP Error ${response.statusCode}: ${response.body}');
      }
    } on SocketException {
      throw Exception('Tidak ada koneksi internet');
    } catch (e) {
      _logger.e('Error ambilSemuaNaskah: $e');
      rethrow;
    }
  }

  /// PUT /api/naskah/:id/terbitkan - Terbitkan naskah
  static Future<TerbitkanNaskahResponse> terbitkanNaskah(String id) async {
    try {
      final token = await AuthService.getAccessToken();
      if (token == null) {
        throw Exception('Token tidak ditemukan. Silakan login kembali.');
      }

      final uri = Uri.parse(ApiConfig.naskahTerbitkan(id));

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

      _logger.d('PUT ${uri.toString()} - Status: ${response.statusCode}');

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return TerbitkanNaskahResponse.fromJson(data);
      } else {
        throw Exception('HTTP Error ${response.statusCode}: ${response.body}');
      }
    } on SocketException {
      throw Exception('Tidak ada koneksi internet');
    } catch (e) {
      _logger.e('Error terbitkanNaskah: $e');
      rethrow;
    }
  }
}

// ============================================
// RESPONSE MODELS
// ============================================

/// Response untuk list pengguna
class PenggunaListResponse {
  final bool sukses;
  final String pesan;
  final List<PenggunaData>? data;
  final PaginationMeta? metadata;

  PenggunaListResponse({
    required this.sukses,
    required this.pesan,
    this.data,
    this.metadata,
  });

  factory PenggunaListResponse.fromJson(Map<String, dynamic> json) {
    return PenggunaListResponse(
      sukses: json['sukses'] ?? false,
      pesan: json['pesan'] ?? '',
      data: json['data'] != null
          ? (json['data'] as List).map((e) => PenggunaData.fromJson(e)).toList()
          : null,
      metadata: json['metadata'] != null
          ? PaginationMeta.fromJson(json['metadata'])
          : null,
    );
  }
}

/// Data pengguna
class PenggunaData {
  final String id;
  final String email;
  final String? telepon;
  final bool aktif;
  final bool terverifikasi;
  final String? dibuatPada;
  final ProfilData? profilPengguna;
  final List<PeranData>? peranPengguna;

  PenggunaData({
    required this.id,
    required this.email,
    this.telepon,
    required this.aktif,
    required this.terverifikasi,
    this.dibuatPada,
    this.profilPengguna,
    this.peranPengguna,
  });

  factory PenggunaData.fromJson(Map<String, dynamic> json) {
    return PenggunaData(
      id: json['id'] ?? '',
      email: json['email'] ?? '',
      telepon: json['telepon'],
      aktif: json['aktif'] ?? false,
      terverifikasi: json['terverifikasi'] ?? false,
      dibuatPada: json['dibuatPada'],
      profilPengguna: json['profilPengguna'] != null
          ? ProfilData.fromJson(json['profilPengguna'])
          : null,
      peranPengguna: json['peranPengguna'] != null
          ? (json['peranPengguna'] as List)
                .map((e) => PeranData.fromJson(e))
                .toList()
          : null,
    );
  }

  /// Mendapatkan nama lengkap
  String get namaLengkap {
    if (profilPengguna != null) {
      final nama =
          '${profilPengguna!.namaDepan ?? ''} ${profilPengguna!.namaBelakang ?? ''}'
              .trim();
      if (nama.isNotEmpty) return nama;
      if (profilPengguna!.namaTampilan != null) {
        return profilPengguna!.namaTampilan!;
      }
    }
    return email.split('@').first;
  }

  /// Mendapatkan daftar peran aktif
  List<String> get peranAktif {
    if (peranPengguna == null) return [];
    return peranPengguna!
        .where((p) => p.aktif)
        .map((p) => p.jenisPeran)
        .toList();
  }
}

/// Data profil pengguna
class ProfilData {
  final String? namaDepan;
  final String? namaBelakang;
  final String? namaTampilan;
  final String? urlAvatar;

  ProfilData({
    this.namaDepan,
    this.namaBelakang,
    this.namaTampilan,
    this.urlAvatar,
  });

  factory ProfilData.fromJson(Map<String, dynamic> json) {
    return ProfilData(
      namaDepan: json['namaDepan'],
      namaBelakang: json['namaBelakang'],
      namaTampilan: json['namaTampilan'],
      urlAvatar: json['urlAvatar'],
    );
  }
}

/// Data peran pengguna
class PeranData {
  final String jenisPeran;
  final bool aktif;

  PeranData({required this.jenisPeran, required this.aktif});

  factory PeranData.fromJson(Map<String, dynamic> json) {
    return PeranData(
      jenisPeran: json['jenisPeran'] ?? '',
      aktif: json['aktif'] ?? false,
    );
  }
}

/// Response untuk detail pengguna
class PenggunaDetailResponse {
  final bool sukses;
  final String pesan;
  final PenggunaData? data;

  PenggunaDetailResponse({
    required this.sukses,
    required this.pesan,
    this.data,
  });

  factory PenggunaDetailResponse.fromJson(Map<String, dynamic> json) {
    return PenggunaDetailResponse(
      sukses: json['sukses'] ?? false,
      pesan: json['pesan'] ?? '',
      data: json['data'] != null ? PenggunaData.fromJson(json['data']) : null,
    );
  }
}

/// Response untuk perbarui pengguna
class PerbaruiPenggunaResponse {
  final bool sukses;
  final String pesan;
  final PenggunaData? data;

  PerbaruiPenggunaResponse({
    required this.sukses,
    required this.pesan,
    this.data,
  });

  factory PerbaruiPenggunaResponse.fromJson(Map<String, dynamic> json) {
    return PerbaruiPenggunaResponse(
      sukses: json['sukses'] ?? false,
      pesan: json['pesan'] ?? '',
      data: json['data'] != null ? PenggunaData.fromJson(json['data']) : null,
    );
  }
}

/// Response untuk hapus pengguna
class HapusPenggunaResponse {
  final bool sukses;
  final String pesan;

  HapusPenggunaResponse({required this.sukses, required this.pesan});

  factory HapusPenggunaResponse.fromJson(Map<String, dynamic> json) {
    return HapusPenggunaResponse(
      sukses: json['sukses'] ?? false,
      pesan: json['pesan'] ?? '',
    );
  }
}

/// Response untuk statistik pengguna
class StatistikPenggunaResponse {
  final bool sukses;
  final String pesan;
  final StatistikPenggunaData? data;

  StatistikPenggunaResponse({
    required this.sukses,
    required this.pesan,
    this.data,
  });

  factory StatistikPenggunaResponse.fromJson(Map<String, dynamic> json) {
    return StatistikPenggunaResponse(
      sukses: json['sukses'] ?? false,
      pesan: json['pesan'] ?? '',
      data: json['data'] != null
          ? StatistikPenggunaData.fromJson(json['data'])
          : null,
    );
  }
}

/// Data statistik pengguna
class StatistikPenggunaData {
  final int totalPengguna;
  final int penulis;
  final int editor;
  final int percetakan;
  final int admin;
  final int aktif;
  final int terverifikasi;

  StatistikPenggunaData({
    required this.totalPengguna,
    required this.penulis,
    required this.editor,
    required this.percetakan,
    required this.admin,
    required this.aktif,
    required this.terverifikasi,
  });

  // Getter aliases untuk kompatibilitas
  int get totalPenulis => penulis;
  int get totalEditor => editor;
  int get totalPercetakan => percetakan;

  factory StatistikPenggunaData.fromJson(Map<String, dynamic> json) {
    return StatistikPenggunaData(
      totalPengguna: json['totalPengguna'] ?? 0,
      penulis: json['penulis'] ?? 0,
      editor: json['editor'] ?? 0,
      percetakan: json['percetakan'] ?? 0,
      admin: json['admin'] ?? 0,
      aktif: json['aktif'] ?? 0,
      terverifikasi: json['terverifikasi'] ?? 0,
    );
  }
}

/// Response untuk tugaskan review
class TugaskanReviewResponse {
  final bool sukses;
  final String pesan;

  TugaskanReviewResponse({required this.sukses, required this.pesan});

  factory TugaskanReviewResponse.fromJson(Map<String, dynamic> json) {
    return TugaskanReviewResponse(
      sukses: json['sukses'] ?? false,
      pesan: json['pesan'] ?? '',
    );
  }
}

/// Response untuk list review
class ReviewListResponse {
  final bool sukses;
  final String pesan;
  final List<ReviewData>? data;
  final PaginationMeta? metadata;

  ReviewListResponse({
    required this.sukses,
    required this.pesan,
    this.data,
    this.metadata,
  });

  factory ReviewListResponse.fromJson(Map<String, dynamic> json) {
    return ReviewListResponse(
      sukses: json['sukses'] ?? false,
      pesan: json['pesan'] ?? '',
      data: json['data'] != null
          ? (json['data'] as List).map((e) => ReviewData.fromJson(e)).toList()
          : null,
      metadata: json['metadata'] != null
          ? PaginationMeta.fromJson(json['metadata'])
          : null,
    );
  }
}

/// Data review
class ReviewData {
  final String id;
  final String idNaskah;
  final String idEditor;
  final String status;
  final String? catatan;
  final String? rekomendasi;
  final double? skorAkhir;
  final String? dibuatPada;
  final NaskahReviewData? naskah;
  final EditorReviewData? editor;

  ReviewData({
    required this.id,
    required this.idNaskah,
    required this.idEditor,
    required this.status,
    this.catatan,
    this.rekomendasi,
    this.skorAkhir,
    this.dibuatPada,
    this.naskah,
    this.editor,
  });

  // Getter untuk judul naskah
  String get judulNaskah => naskah?.judul ?? 'Tanpa Judul';

  // Getter untuk nama editor
  String get namaEditor => editor?.nama ?? editor?.email ?? 'Unknown';

  factory ReviewData.fromJson(Map<String, dynamic> json) {
    return ReviewData(
      id: json['id'] ?? '',
      idNaskah: json['idNaskah'] ?? '',
      idEditor: json['idEditor'] ?? '',
      status: json['status'] ?? '',
      catatan: json['catatan'],
      rekomendasi: json['rekomendasi'],
      skorAkhir: json['skorAkhir'] != null
          ? (json['skorAkhir'] as num).toDouble()
          : null,
      dibuatPada: json['dibuatPada'],
      naskah: json['naskah'] != null
          ? NaskahReviewData.fromJson(json['naskah'])
          : null,
      editor: json['editor'] != null
          ? EditorReviewData.fromJson(json['editor'])
          : null,
    );
  }
}

/// Data naskah di review
class NaskahReviewData {
  final String id;
  final String judul;
  final String? penulis;

  NaskahReviewData({required this.id, required this.judul, this.penulis});

  factory NaskahReviewData.fromJson(Map<String, dynamic> json) {
    return NaskahReviewData(
      id: json['id'] ?? '',
      judul: json['judul'] ?? '',
      penulis: json['penulis']?['profilPengguna']?['namaTampilan'],
    );
  }
}

/// Data editor di review
class EditorReviewData {
  final String id;
  final String email;
  final String? nama;

  EditorReviewData({required this.id, required this.email, this.nama});

  factory EditorReviewData.fromJson(Map<String, dynamic> json) {
    return EditorReviewData(
      id: json['id'] ?? '',
      email: json['email'] ?? '',
      nama: json['profilPengguna']?['namaTampilan'],
    );
  }
}

/// Response untuk list naskah
class NaskahListResponse {
  final bool sukses;
  final String pesan;
  final List<NaskahAdminData>? data;
  final PaginationMeta? metadata;

  NaskahListResponse({
    required this.sukses,
    required this.pesan,
    this.data,
    this.metadata,
  });

  factory NaskahListResponse.fromJson(Map<String, dynamic> json) {
    return NaskahListResponse(
      sukses: json['sukses'] ?? false,
      pesan: json['pesan'] ?? '',
      data: json['data'] != null
          ? (json['data'] as List)
                .map((e) => NaskahAdminData.fromJson(e))
                .toList()
          : null,
      metadata: json['metadata'] != null
          ? PaginationMeta.fromJson(json['metadata'])
          : null,
    );
  }
}

/// Data naskah untuk admin
class NaskahAdminData {
  final String id;
  final String judul;
  final String? sinopsis;
  final String status;
  final String? dibuatPada;
  final PenulisData? penulisData;
  final String? namaKategori;
  final String? namaGenre;

  NaskahAdminData({
    required this.id,
    required this.judul,
    this.sinopsis,
    required this.status,
    this.dibuatPada,
    this.penulisData,
    this.namaKategori,
    this.namaGenre,
  });

  // Getter untuk nama penulis
  String get penulis => penulisData?.nama ?? penulisData?.email ?? 'Unknown';

  // Getter untuk kategori
  String? get kategori => namaKategori;

  // Getter untuk genre
  String? get genre => namaGenre;

  factory NaskahAdminData.fromJson(Map<String, dynamic> json) {
    return NaskahAdminData(
      id: json['id'] ?? '',
      judul: json['judul'] ?? '',
      sinopsis: json['sinopsis'],
      status: json['status'] ?? '',
      dibuatPada: json['dibuatPada'],
      penulisData: json['penulis'] != null
          ? PenulisData.fromJson(json['penulis'])
          : null,
      namaKategori: json['kategori']?['nama'],
      namaGenre: json['genre']?['nama'],
    );
  }
}

/// Data penulis
class PenulisData {
  final String id;
  final String email;
  final String? nama;

  PenulisData({required this.id, required this.email, this.nama});

  factory PenulisData.fromJson(Map<String, dynamic> json) {
    return PenulisData(
      id: json['id'] ?? '',
      email: json['email'] ?? '',
      nama: json['profilPengguna']?['namaTampilan'],
    );
  }
}

/// Response untuk terbitkan naskah
class TerbitkanNaskahResponse {
  final bool sukses;
  final String pesan;

  TerbitkanNaskahResponse({required this.sukses, required this.pesan});

  factory TerbitkanNaskahResponse.fromJson(Map<String, dynamic> json) {
    return TerbitkanNaskahResponse(
      sukses: json['sukses'] ?? false,
      pesan: json['pesan'] ?? '',
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
