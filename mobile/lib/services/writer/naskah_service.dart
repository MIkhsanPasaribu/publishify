import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:publishify/models/writer/naskah_models.dart';
import 'package:publishify/services/general/auth_service.dart';
import 'package:publishify/config/api_config.dart';

/// Naskah Service
/// Handles all manuscript (naskah) related API calls
class NaskahService {
  /// Get list of user's manuscripts (naskah penulis saya)
  /// GET /api/naskah/penulis/saya?halaman=1&limit=6&status=draft
  static Future<NaskahListResponse> getNaskahSaya({
    int halaman = 1,
    int limit = 6,
    String? status,
  }) async {
    try {
      // Get access token from cache
      final accessToken = await AuthService.getAccessToken();

      if (accessToken == null) {
        return NaskahListResponse(
          sukses: false,
          pesan: 'Token tidak ditemukan. Silakan login kembali.',
        );
      }

      // Build URL with query parameters
      final queryParams = {
        'halaman': halaman.toString(),
        'limit': limit.toString(),
      };

      if (status != null && status.isNotEmpty) {
        queryParams['status'] = status;
      }

      final uri = Uri.parse(
        ApiConfig.naskahPenulisSaya,
      ).replace(queryParameters: queryParams);

      // Make API request
      final response = await http.get(
        uri,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $accessToken',
          'X-Platform': 'mobile',
        },
      );

      final responseData = jsonDecode(response.body);
      return NaskahListResponse.fromJson(responseData);
    } catch (e) {
      // Return error response
      return NaskahListResponse(
        sukses: false,
        pesan: 'Terjadi kesalahan: ${e.toString()}',
      );
    }
  }

  /// Get count of manuscripts by status
  static Future<Map<String, int>> getStatusCount() async {
    try {
      final response = await getNaskahSaya(limit: 100); // Get all to count

      if (!response.sukses || response.data == null) {
        return {'draft': 0, 'review': 0, 'revision': 0, 'published': 0};
      }

      // Count by status
      final Map<String, int> statusCount = {
        'draft': 0,
        'review': 0,
        'revision': 0,
        'published': 0,
      };

      for (var naskah in response.data!) {
        final status = naskah.status.toLowerCase();
        if (statusCount.containsKey(status)) {
          statusCount[status] = statusCount[status]! + 1;
        }
      }

      return statusCount;
    } catch (e) {
      return {'draft': 0, 'review': 0, 'revision': 0, 'published': 0};
    }
  }

  /// Get user's manuscripts with specific status
  /// GET /api/naskah/penulis/saya?status=diterbitkan&halaman=1&limit=100
  static Future<List<NaskahData>> getNaskahPenulisWithStatus(
    String status,
  ) async {
    try {
      // Get access token from cache
      final accessToken = await AuthService.getAccessToken();

      if (accessToken == null) {
        throw Exception('Token tidak ditemukan. Silakan login kembali.');
      }

      // Build URL with query parameters for getting all manuscripts with status
      final queryParams = {
        'status': status,
        'halaman': '1',
        'limit': '100', // Get a large number to get all manuscripts
      };

      final uri = Uri.parse(
        ApiConfig.naskahPenulisSaya,
      ).replace(queryParameters: queryParams);

      final response = await http
          .get(
            uri,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer $accessToken',
              'X-Platform': 'mobile',
            },
          )
          .timeout(ApiConfig.defaultTimeout);

      if (response.statusCode == 200) {
        final responseData = jsonDecode(response.body);
        final naskahResponse = NaskahListResponse.fromJson(responseData);

        if (naskahResponse.sukses && naskahResponse.data != null) {
          return naskahResponse.data!;
        } else {
          throw Exception(naskahResponse.pesan);
        }
      } else {
        throw Exception('Server error: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Terjadi kesalahan: ${e.toString()}');
    }
  }

  /// GET /api/naskah/:id - Detail naskah
  static Future<NaskahDetailResponse> ambilDetailNaskah(String id) async {
    try {
      final accessToken = await AuthService.getAccessToken();

      if (accessToken == null) {
        throw Exception('Token akses tidak ditemukan');
      }

      final url = Uri.parse(ApiConfig.naskahById(id));

      final response = await http
          .get(
            url,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer $accessToken',
              'X-Platform': 'mobile',
            },
          )
          .timeout(ApiConfig.defaultTimeout);

      final responseData = jsonDecode(response.body);

      if (response.statusCode == 200) {
        return NaskahDetailResponse.fromJson(responseData);
      } else {
        throw Exception(
          responseData['pesan'] ?? 'Gagal mengambil detail naskah',
        );
      }
    } catch (e) {
      throw Exception('Terjadi kesalahan: ${e.toString()}');
    }
  }

  /// Get published manuscripts (latest 10) - PUBLIC endpoint
  /// GET /api/naskah?status=diterbitkan&limit=10&urutkan=dibuatPada&arah=desc
  static Future<NaskahListResponse> getNaskahTerbit({int limit = 10}) async {
    try {
      // Build URL with query parameters
      final queryParams = {
        'status': 'diterbitkan',
        'limit': limit.toString(),
        'urutkan': 'dibuatPada',
        'arah': 'desc',
        'halaman': '1',
      };

      final uri = Uri.parse(
        ApiConfig.naskah,
      ).replace(queryParameters: queryParams);

      // Make API request (PUBLIC, no auth required)
      final response = await http
          .get(
            uri,
            headers: {
              'Content-Type': 'application/json',
              'X-Platform': 'mobile',
            },
          )
          .timeout(ApiConfig.defaultTimeout);

      final responseData = jsonDecode(response.body);
      return NaskahListResponse.fromJson(responseData);
    } catch (e) {
      // Return error response
      return NaskahListResponse(
        sukses: false,
        pesan: 'Terjadi kesalahan: ${e.toString()}',
      );
    }
  }

  /// Create new manuscript (naskah)
  /// POST /api/naskah
  static Future<CreateNaskahResponse> createNaskah({
    required String judul,
    String? subJudul,
    required String sinopsis,
    required String idKategori,
    required String idGenre,
    String? isbn,
    int? jumlahHalaman,
    int? jumlahKata,
    String? urlSampul,
    String? urlFile,
    bool publik = false,
  }) async {
    try {
      // Get access token from cache
      final accessToken = await AuthService.getAccessToken();

      if (accessToken == null) {
        return CreateNaskahResponse(
          sukses: false,
          pesan: 'Token tidak ditemukan. Silakan login kembali.',
        );
      }

      final uri = Uri.parse(ApiConfig.naskah);

      // Build request body
      final Map<String, dynamic> body = {
        'judul': judul,
        'sinopsis': sinopsis,
        'idKategori': idKategori,
        'idGenre': idGenre,
        'publik': publik,
      };

      if (subJudul != null && subJudul.isNotEmpty) {
        body['subJudul'] = subJudul;
      }

      if (isbn != null && isbn.isNotEmpty) {
        body['isbn'] = isbn;
      }

      if (jumlahHalaman != null) {
        body['jumlahHalaman'] = jumlahHalaman;
      }

      if (jumlahKata != null) {
        body['jumlahKata'] = jumlahKata;
      }

      if (urlSampul != null && urlSampul.isNotEmpty) {
        body['urlSampul'] = urlSampul;
      }

      if (urlFile != null && urlFile.isNotEmpty) {
        body['urlFile'] = urlFile;
      }

      // Make API request
      final response = await http
          .post(
            uri,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer $accessToken',
              'X-Platform': 'mobile',
            },
            body: jsonEncode(body),
          )
          .timeout(ApiConfig.defaultTimeout);

      final responseData = jsonDecode(response.body);
      return CreateNaskahResponse.fromJson(responseData);
    } catch (e) {
      // Return error response
      return CreateNaskahResponse(
        sukses: false,
        pesan: 'Terjadi kesalahan: ${e.toString()}',
      );
    }
  }

  /// Update manuscript (naskah)
  /// PUT /api/naskah/:id
  static Future<UpdateNaskahResponse> updateNaskah({
    required String id,
    String? judul,
    String? subJudul,
    String? sinopsis,
    String? idKategori,
    String? idGenre,
    String? isbn,
    int? jumlahHalaman,
    int? jumlahKata,
    String? urlSampul,
    String? urlFile,
    bool? publik,
  }) async {
    try {
      // Get access token from cache
      final accessToken = await AuthService.getAccessToken();

      if (accessToken == null) {
        return UpdateNaskahResponse(
          sukses: false,
          pesan: 'Token tidak ditemukan. Silakan login kembali.',
        );
      }

      final uri = Uri.parse(ApiConfig.naskahById(id));

      // Build request body - only include non-null values
      final Map<String, dynamic> body = {};

      if (judul != null && judul.isNotEmpty) {
        body['judul'] = judul;
      }

      if (subJudul != null) {
        body['subJudul'] = subJudul;
      }

      if (sinopsis != null && sinopsis.isNotEmpty) {
        body['sinopsis'] = sinopsis;
      }

      if (idKategori != null && idKategori.isNotEmpty) {
        body['idKategori'] = idKategori;
      }

      if (idGenre != null && idGenre.isNotEmpty) {
        body['idGenre'] = idGenre;
      }

      if (isbn != null) {
        body['isbn'] = isbn;
      }

      if (jumlahHalaman != null) {
        body['jumlahHalaman'] = jumlahHalaman;
      }

      if (jumlahKata != null) {
        body['jumlahKata'] = jumlahKata;
      }

      if (urlSampul != null) {
        body['urlSampul'] = urlSampul;
      }

      if (urlFile != null) {
        body['urlFile'] = urlFile;
      }

      if (publik != null) {
        body['publik'] = publik;
      }

      // Make API request
      final response = await http
          .put(
            uri,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer $accessToken',
              'X-Platform': 'mobile',
            },
            body: jsonEncode(body),
          )
          .timeout(ApiConfig.defaultTimeout);

      final responseData = jsonDecode(response.body);
      return UpdateNaskahResponse.fromJson(responseData);
    } catch (e) {
      // Return error response
      return UpdateNaskahResponse(
        sukses: false,
        pesan: 'Terjadi kesalahan: ${e.toString()}',
      );
    }
  }

  /// Delete manuscript (naskah)
  /// DELETE /api/naskah/:id
  static Future<DeleteNaskahResponse> deleteNaskah(String id) async {
    try {
      // Get access token from cache
      final accessToken = await AuthService.getAccessToken();

      if (accessToken == null) {
        return DeleteNaskahResponse(
          sukses: false,
          pesan: 'Token tidak ditemukan. Silakan login kembali.',
        );
      }

      final uri = Uri.parse(ApiConfig.naskahById(id));

      // Make API request
      final response = await http
          .delete(
            uri,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer $accessToken',
              'X-Platform': 'mobile',
            },
          )
          .timeout(ApiConfig.defaultTimeout);

      final responseData = jsonDecode(response.body);
      return DeleteNaskahResponse.fromJson(responseData);
    } catch (e) {
      // Return error response
      return DeleteNaskahResponse(
        sukses: false,
        pesan: 'Terjadi kesalahan: ${e.toString()}',
      );
    }
  }

  /// Get all manuscripts with full options (for list page)
  /// GET /api/naskah/penulis/saya
  static Future<NaskahListResponse> getAllNaskah({
    int halaman = 1,
    int limit = 20,
    String? cari,
    String? status,
    String? idKategori,
    String? idGenre,
    String urutkan = 'dibuatPada', // dibuatPada, judul, status, jumlahHalaman
    String arah = 'desc', // asc, desc
  }) async {
    try {
      // Get access token from cache
      final accessToken = await AuthService.getAccessToken();

      if (accessToken == null) {
        return NaskahListResponse(
          sukses: false,
          pesan: 'Token tidak ditemukan. Silakan login kembali.',
        );
      }

      // Build URL with query parameters
      final queryParams = {
        'halaman': halaman.toString(),
        'limit': limit.toString(),
        'urutkan': urutkan,
        'arah': arah,
      };

      if (cari != null && cari.isNotEmpty) {
        queryParams['cari'] = cari;
      }

      if (status != null && status.isNotEmpty) {
        queryParams['status'] = status;
      }

      if (idKategori != null && idKategori.isNotEmpty) {
        queryParams['idKategori'] = idKategori;
      }

      if (idGenre != null && idGenre.isNotEmpty) {
        queryParams['idGenre'] = idGenre;
      }

      final uri = Uri.parse(
        ApiConfig.naskahPenulisSaya,
      ).replace(queryParameters: queryParams);

      // Make API request
      final response = await http
          .get(
            uri,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer $accessToken',
              'X-Platform': 'mobile',
            },
          )
          .timeout(ApiConfig.defaultTimeout);

      final responseData = jsonDecode(response.body);
      return NaskahListResponse.fromJson(responseData);
    } catch (e) {
      // Return error response
      return NaskahListResponse(
        sukses: false,
        pesan: 'Terjadi kesalahan: ${e.toString()}',
      );
    }
  }

  /// Ajukan naskah untuk review
  /// PUT /api/naskah/:id/ajukan
  static Future<AjukanNaskahResponse> ajukanReview(String id) async {
    try {
      final accessToken = await AuthService.getAccessToken();

      if (accessToken == null) {
        return AjukanNaskahResponse(
          sukses: false,
          pesan: 'Token tidak ditemukan. Silakan login kembali.',
        );
      }

      final uri = Uri.parse(ApiConfig.naskahAjukan(id));

      final response = await http
          .put(
            uri,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer $accessToken',
              'X-Platform': 'mobile',
            },
          )
          .timeout(ApiConfig.defaultTimeout);

      final responseData = jsonDecode(response.body);
      return AjukanNaskahResponse.fromJson(responseData);
    } catch (e) {
      return AjukanNaskahResponse(
        sukses: false,
        pesan: 'Terjadi kesalahan: ${e.toString()}',
      );
    }
  }

  /// Terbitkan naskah (Admin only)
  /// PUT /api/naskah/:id/terbitkan
  static Future<TerbitkanNaskahResponse> terbitkanNaskah(String id) async {
    try {
      final accessToken = await AuthService.getAccessToken();

      if (accessToken == null) {
        return TerbitkanNaskahResponse(
          sukses: false,
          pesan: 'Token tidak ditemukan. Silakan login kembali.',
        );
      }

      final uri = Uri.parse(ApiConfig.naskahTerbitkan(id));

      final response = await http
          .put(
            uri,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer $accessToken',
              'X-Platform': 'mobile',
            },
          )
          .timeout(ApiConfig.defaultTimeout);

      final responseData = jsonDecode(response.body);
      return TerbitkanNaskahResponse.fromJson(responseData);
    } catch (e) {
      return TerbitkanNaskahResponse(
        sukses: false,
        pesan: 'Terjadi kesalahan: ${e.toString()}',
      );
    }
  }

  /// Set harga jual naskah
  /// PUT /api/naskah/:id/harga-jual
  static Future<SetHargaJualResponse> setHargaJual({
    required String id,
    required double hargaJual,
  }) async {
    try {
      final accessToken = await AuthService.getAccessToken();

      if (accessToken == null) {
        return SetHargaJualResponse(
          sukses: false,
          pesan: 'Token tidak ditemukan. Silakan login kembali.',
        );
      }

      final uri = Uri.parse(ApiConfig.naskahHargaJual(id));

      final response = await http
          .put(
            uri,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer $accessToken',
              'X-Platform': 'mobile',
            },
            body: jsonEncode({'hargaJual': hargaJual}),
          )
          .timeout(ApiConfig.defaultTimeout);

      final responseData = jsonDecode(response.body);
      return SetHargaJualResponse.fromJson(responseData);
    } catch (e) {
      return SetHargaJualResponse(
        sukses: false,
        pesan: 'Terjadi kesalahan: ${e.toString()}',
      );
    }
  }

  /// Get naskah dengan cursor pagination
  /// GET /api/naskah/cursor?cursor=xxx&limit=20
  static Future<NaskahCursorResponse> getNaskahWithCursor({
    String? cursor,
    int limit = 20,
    String? status,
  }) async {
    try {
      final queryParams = <String, String>{'limit': limit.toString()};

      if (cursor != null && cursor.isNotEmpty) {
        queryParams['cursor'] = cursor;
      }

      if (status != null && status.isNotEmpty) {
        queryParams['status'] = status;
      }

      final uri = Uri.parse(
        ApiConfig.naskahCursor,
      ).replace(queryParameters: queryParams);

      final response = await http
          .get(
            uri,
            headers: {
              'Content-Type': 'application/json',
              'X-Platform': 'mobile',
            },
          )
          .timeout(ApiConfig.defaultTimeout);

      final responseData = jsonDecode(response.body);
      return NaskahCursorResponse.fromJson(responseData);
    } catch (e) {
      return NaskahCursorResponse(
        sukses: false,
        pesan: 'Terjadi kesalahan: ${e.toString()}',
      );
    }
  }

  /// Get semua naskah untuk admin
  /// GET /api/naskah/admin/semua
  static Future<NaskahListResponse> getNaskahAdminSemua({
    int halaman = 1,
    int limit = 20,
    String? status,
    String? cari,
  }) async {
    try {
      final accessToken = await AuthService.getAccessToken();

      if (accessToken == null) {
        return NaskahListResponse(
          sukses: false,
          pesan: 'Token tidak ditemukan. Silakan login kembali.',
        );
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
        ApiConfig.naskahAdminSemua,
      ).replace(queryParameters: queryParams);

      final response = await http
          .get(
            uri,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer $accessToken',
              'X-Platform': 'mobile',
            },
          )
          .timeout(ApiConfig.defaultTimeout);

      final responseData = jsonDecode(response.body);
      return NaskahListResponse.fromJson(responseData);
    } catch (e) {
      return NaskahListResponse(
        sukses: false,
        pesan: 'Terjadi kesalahan: ${e.toString()}',
      );
    }
  }

  /// Get naskah diterbitkan milik penulis (siap cetak)
  /// GET /api/naskah/penulis/diterbitkan
  static Future<NaskahListResponse> getNaskahPenulisDiterbitkan({
    int halaman = 1,
    int limit = 20,
  }) async {
    try {
      final accessToken = await AuthService.getAccessToken();

      if (accessToken == null) {
        return NaskahListResponse(
          sukses: false,
          pesan: 'Token tidak ditemukan. Silakan login kembali.',
        );
      }

      final queryParams = <String, String>{
        'halaman': halaman.toString(),
        'limit': limit.toString(),
      };

      final uri = Uri.parse(
        ApiConfig.naskahPenulisDiterbitkan,
      ).replace(queryParameters: queryParams);

      final response = await http
          .get(
            uri,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer $accessToken',
              'X-Platform': 'mobile',
            },
          )
          .timeout(ApiConfig.defaultTimeout);

      final responseData = jsonDecode(response.body);
      return NaskahListResponse.fromJson(responseData);
    } catch (e) {
      return NaskahListResponse(
        sukses: false,
        pesan: 'Terjadi kesalahan: ${e.toString()}',
      );
    }
  }
}

/// Response for creating naskah
class CreateNaskahResponse {
  final bool sukses;
  final String pesan;
  final NaskahData? data;

  CreateNaskahResponse({required this.sukses, required this.pesan, this.data});

  factory CreateNaskahResponse.fromJson(Map<String, dynamic> json) {
    return CreateNaskahResponse(
      sukses: json['sukses'] ?? false,
      pesan: json['pesan'] ?? '',
      data: json['data'] != null ? NaskahData.fromJson(json['data']) : null,
    );
  }
}

/// Response for updating naskah
class UpdateNaskahResponse {
  final bool sukses;
  final String pesan;
  final NaskahData? data;

  UpdateNaskahResponse({required this.sukses, required this.pesan, this.data});

  factory UpdateNaskahResponse.fromJson(Map<String, dynamic> json) {
    return UpdateNaskahResponse(
      sukses: json['sukses'] ?? false,
      pesan: json['pesan'] ?? '',
      data: json['data'] != null ? NaskahData.fromJson(json['data']) : null,
    );
  }
}

/// Response for deleting naskah
class DeleteNaskahResponse {
  final bool sukses;
  final String pesan;

  DeleteNaskahResponse({required this.sukses, required this.pesan});

  factory DeleteNaskahResponse.fromJson(Map<String, dynamic> json) {
    return DeleteNaskahResponse(
      sukses: json['sukses'] ?? false,
      pesan: json['pesan'] ?? '',
    );
  }
}

/// Response for ajukan naskah review
class AjukanNaskahResponse {
  final bool sukses;
  final String pesan;
  final NaskahData? data;

  AjukanNaskahResponse({required this.sukses, required this.pesan, this.data});

  factory AjukanNaskahResponse.fromJson(Map<String, dynamic> json) {
    return AjukanNaskahResponse(
      sukses: json['sukses'] ?? false,
      pesan: json['pesan'] ?? '',
      data: json['data'] != null ? NaskahData.fromJson(json['data']) : null,
    );
  }
}

/// Response for terbitkan naskah
class TerbitkanNaskahResponse {
  final bool sukses;
  final String pesan;
  final NaskahData? data;

  TerbitkanNaskahResponse({
    required this.sukses,
    required this.pesan,
    this.data,
  });

  factory TerbitkanNaskahResponse.fromJson(Map<String, dynamic> json) {
    return TerbitkanNaskahResponse(
      sukses: json['sukses'] ?? false,
      pesan: json['pesan'] ?? '',
      data: json['data'] != null ? NaskahData.fromJson(json['data']) : null,
    );
  }
}

/// Response for set harga jual naskah
class SetHargaJualResponse {
  final bool sukses;
  final String pesan;
  final NaskahData? data;

  SetHargaJualResponse({required this.sukses, required this.pesan, this.data});

  factory SetHargaJualResponse.fromJson(Map<String, dynamic> json) {
    return SetHargaJualResponse(
      sukses: json['sukses'] ?? false,
      pesan: json['pesan'] ?? '',
      data: json['data'] != null ? NaskahData.fromJson(json['data']) : null,
    );
  }
}

/// Response untuk cursor pagination naskah
class NaskahCursorResponse {
  final bool sukses;
  final String pesan;
  final List<NaskahData>? data;
  final NaskahCursorMeta? metadata;

  NaskahCursorResponse({
    required this.sukses,
    required this.pesan,
    this.data,
    this.metadata,
  });

  factory NaskahCursorResponse.fromJson(Map<String, dynamic> json) {
    return NaskahCursorResponse(
      sukses: json['sukses'] ?? false,
      pesan: json['pesan'] ?? '',
      data: json['data'] != null
          ? (json['data'] as List).map((e) => NaskahData.fromJson(e)).toList()
          : null,
      metadata: json['metadata'] != null
          ? NaskahCursorMeta.fromJson(json['metadata'])
          : null,
    );
  }
}

/// Metadata untuk cursor pagination
class NaskahCursorMeta {
  final int limit;
  final String? nextCursor;
  final bool hasNextPage;

  NaskahCursorMeta({
    required this.limit,
    this.nextCursor,
    required this.hasNextPage,
  });

  factory NaskahCursorMeta.fromJson(Map<String, dynamic> json) {
    return NaskahCursorMeta(
      limit: json['limit'] ?? 20,
      nextCursor: json['nextCursor'],
      hasNextPage: json['hasNextPage'] ?? false,
    );
  }
}
