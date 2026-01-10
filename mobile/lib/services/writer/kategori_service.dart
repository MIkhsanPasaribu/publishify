import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:publishify/models/writer/kategori_models.dart';
import 'package:publishify/services/general/auth_service.dart';
import 'package:publishify/config/api_config.dart';

/// Kategori Service
/// Handles all kategori related API calls
class KategoriService {
  /// Get list of kategori with pagination
  /// GET /api/kategori?halaman=1&limit=20&aktif=true
  static Future<KategoriResponse> getKategori({
    int halaman = 1,
    int limit = 20,
    bool? aktif,
  }) async {
    try {
      // Get access token from cache
      final accessToken = await AuthService.getAccessToken();

      if (accessToken == null) {
        return KategoriResponse(sukses: false);
      }

      // Build URL with query parameters
      final queryParams = {
        'halaman': halaman.toString(),
        'limit': limit.toString(),
      };

      if (aktif != null) {
        queryParams['aktif'] = aktif.toString();
      }

      final uri = Uri.parse(
        ApiConfig.kategori,
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
      return KategoriResponse.fromJson(responseData);
    } catch (e) {
      // Return error response
      return KategoriResponse(sukses: false);
    }
  }

  /// Get only active kategori
  /// GET /api/kategori/aktif
  static Future<KategoriResponse> getActiveKategori() async {
    try {
      // Get access token from cache
      final accessToken = await AuthService.getAccessToken();

      if (accessToken == null) {
        return KategoriResponse(sukses: false);
      }

      final uri = Uri.parse(ApiConfig.kategoriAktif);

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
      return KategoriResponse.fromJson(responseData);
    } catch (e) {
      // Return error response
      return KategoriResponse(sukses: false);
    }
  }

  /// Get detail kategori by ID
  /// GET /api/kategori/:id
  static Future<KategoriDetailResponse> getKategoriById(String id) async {
    try {
      final accessToken = await AuthService.getAccessToken();

      if (accessToken == null) {
        return KategoriDetailResponse(
          sukses: false,
          pesan: 'Token tidak ditemukan',
        );
      }

      final response = await http
          .get(
            Uri.parse(ApiConfig.kategoriById(id)),
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer $accessToken',
              'X-Platform': 'mobile',
            },
          )
          .timeout(ApiConfig.defaultTimeout);

      final responseData = jsonDecode(response.body);
      return KategoriDetailResponse.fromJson(responseData);
    } catch (e) {
      return KategoriDetailResponse(
        sukses: false,
        pesan: 'Terjadi kesalahan: ${e.toString()}',
      );
    }
  }

  /// Buat kategori baru (Admin only)
  /// POST /api/kategori
  static Future<KategoriDetailResponse> createKategori({
    required String nama,
    required String slug,
    String? deskripsi,
    String? idInduk,
    bool aktif = true,
  }) async {
    try {
      final accessToken = await AuthService.getAccessToken();

      if (accessToken == null) {
        return KategoriDetailResponse(
          sukses: false,
          pesan: 'Token tidak ditemukan',
        );
      }

      final body = <String, dynamic>{
        'nama': nama,
        'slug': slug,
        'aktif': aktif,
      };

      if (deskripsi != null) body['deskripsi'] = deskripsi;
      if (idInduk != null) body['idInduk'] = idInduk;

      final response = await http
          .post(
            Uri.parse(ApiConfig.kategori),
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer $accessToken',
              'X-Platform': 'mobile',
            },
            body: jsonEncode(body),
          )
          .timeout(ApiConfig.defaultTimeout);

      final responseData = jsonDecode(response.body);
      return KategoriDetailResponse.fromJson(responseData);
    } catch (e) {
      return KategoriDetailResponse(
        sukses: false,
        pesan: 'Terjadi kesalahan: ${e.toString()}',
      );
    }
  }

  /// Perbarui kategori (Admin only)
  /// PUT /api/kategori/:id
  static Future<KategoriDetailResponse> updateKategori({
    required String id,
    String? nama,
    String? slug,
    String? deskripsi,
    String? idInduk,
    bool? aktif,
  }) async {
    try {
      final accessToken = await AuthService.getAccessToken();

      if (accessToken == null) {
        return KategoriDetailResponse(
          sukses: false,
          pesan: 'Token tidak ditemukan',
        );
      }

      final body = <String, dynamic>{};
      if (nama != null) body['nama'] = nama;
      if (slug != null) body['slug'] = slug;
      if (deskripsi != null) body['deskripsi'] = deskripsi;
      if (idInduk != null) body['idInduk'] = idInduk;
      if (aktif != null) body['aktif'] = aktif;

      final response = await http
          .put(
            Uri.parse(ApiConfig.kategoriById(id)),
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer $accessToken',
              'X-Platform': 'mobile',
            },
            body: jsonEncode(body),
          )
          .timeout(ApiConfig.defaultTimeout);

      final responseData = jsonDecode(response.body);
      return KategoriDetailResponse.fromJson(responseData);
    } catch (e) {
      return KategoriDetailResponse(
        sukses: false,
        pesan: 'Terjadi kesalahan: ${e.toString()}',
      );
    }
  }

  /// Hapus kategori (Admin only)
  /// DELETE /api/kategori/:id
  static Future<DeleteKategoriResponse> deleteKategori(String id) async {
    try {
      final accessToken = await AuthService.getAccessToken();

      if (accessToken == null) {
        return DeleteKategoriResponse(
          sukses: false,
          pesan: 'Token tidak ditemukan',
        );
      }

      final response = await http
          .delete(
            Uri.parse(ApiConfig.kategoriById(id)),
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer $accessToken',
              'X-Platform': 'mobile',
            },
          )
          .timeout(ApiConfig.defaultTimeout);

      final responseData = jsonDecode(response.body);
      return DeleteKategoriResponse.fromJson(responseData);
    } catch (e) {
      return DeleteKategoriResponse(
        sukses: false,
        pesan: 'Terjadi kesalahan: ${e.toString()}',
      );
    }
  }
}

/// Kategori Detail Response
class KategoriDetailResponse {
  final bool sukses;
  final String pesan;
  final Kategori? data;

  KategoriDetailResponse({required this.sukses, this.pesan = '', this.data});

  factory KategoriDetailResponse.fromJson(Map<String, dynamic> json) {
    return KategoriDetailResponse(
      sukses: json['sukses'] ?? false,
      pesan: json['pesan'] ?? '',
      data: json['data'] != null ? Kategori.fromJson(json['data']) : null,
    );
  }
}

/// Delete Kategori Response
class DeleteKategoriResponse {
  final bool sukses;
  final String pesan;

  DeleteKategoriResponse({required this.sukses, this.pesan = ''});

  factory DeleteKategoriResponse.fromJson(Map<String, dynamic> json) {
    return DeleteKategoriResponse(
      sukses: json['sukses'] ?? false,
      pesan: json['pesan'] ?? '',
    );
  }
}
