import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:publishify/models/writer/genre_models.dart';
import 'package:publishify/services/general/auth_service.dart';
import 'package:publishify/config/api_config.dart';

/// Genre Service
/// Handles all genre related API calls
class GenreService {
  /// Get list of genres with pagination
  /// GET /api/genre?halaman=1&limit=20&aktif=true
  static Future<GenreResponse> getGenres({
    int halaman = 1,
    int limit = 20,
    bool? aktif,
  }) async {
    try {
      // Get access token from cache
      final accessToken = await AuthService.getAccessToken();

      if (accessToken == null) {
        return GenreResponse(sukses: false);
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
        ApiConfig.genre,
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
      return GenreResponse.fromJson(responseData);
    } catch (e) {
      // Return error response
      return GenreResponse(sukses: false);
    }
  }

  /// Get only active genres
  /// GET /api/genre/aktif
  static Future<GenreResponse> getActiveGenres() async {
    try {
      // Get access token from cache
      final accessToken = await AuthService.getAccessToken();

      if (accessToken == null) {
        return GenreResponse(sukses: false);
      }

      final uri = Uri.parse(ApiConfig.genreAktif);

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
      return GenreResponse.fromJson(responseData);
    } catch (e) {
      // Return error response
      return GenreResponse(sukses: false);
    }
  }

  /// Get detail genre by ID
  /// GET /api/genre/:id
  static Future<GenreDetailResponse> getGenreById(String id) async {
    try {
      final accessToken = await AuthService.getAccessToken();

      if (accessToken == null) {
        return GenreDetailResponse(
          sukses: false,
          pesan: 'Token tidak ditemukan',
        );
      }

      final response = await http
          .get(
            Uri.parse(ApiConfig.genreById(id)),
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer $accessToken',
              'X-Platform': 'mobile',
            },
          )
          .timeout(ApiConfig.defaultTimeout);

      final responseData = jsonDecode(response.body);
      return GenreDetailResponse.fromJson(responseData);
    } catch (e) {
      return GenreDetailResponse(
        sukses: false,
        pesan: 'Terjadi kesalahan: ${e.toString()}',
      );
    }
  }

  /// Buat genre baru (Admin only)
  /// POST /api/genre
  static Future<GenreDetailResponse> createGenre({
    required String nama,
    required String slug,
    String? deskripsi,
    bool aktif = true,
  }) async {
    try {
      final accessToken = await AuthService.getAccessToken();

      if (accessToken == null) {
        return GenreDetailResponse(
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

      final response = await http
          .post(
            Uri.parse(ApiConfig.genre),
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer $accessToken',
              'X-Platform': 'mobile',
            },
            body: jsonEncode(body),
          )
          .timeout(ApiConfig.defaultTimeout);

      final responseData = jsonDecode(response.body);
      return GenreDetailResponse.fromJson(responseData);
    } catch (e) {
      return GenreDetailResponse(
        sukses: false,
        pesan: 'Terjadi kesalahan: ${e.toString()}',
      );
    }
  }

  /// Perbarui genre (Admin only)
  /// PUT /api/genre/:id
  static Future<GenreDetailResponse> updateGenre({
    required String id,
    String? nama,
    String? slug,
    String? deskripsi,
    bool? aktif,
  }) async {
    try {
      final accessToken = await AuthService.getAccessToken();

      if (accessToken == null) {
        return GenreDetailResponse(
          sukses: false,
          pesan: 'Token tidak ditemukan',
        );
      }

      final body = <String, dynamic>{};
      if (nama != null) body['nama'] = nama;
      if (slug != null) body['slug'] = slug;
      if (deskripsi != null) body['deskripsi'] = deskripsi;
      if (aktif != null) body['aktif'] = aktif;

      final response = await http
          .put(
            Uri.parse(ApiConfig.genreById(id)),
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer $accessToken',
              'X-Platform': 'mobile',
            },
            body: jsonEncode(body),
          )
          .timeout(ApiConfig.defaultTimeout);

      final responseData = jsonDecode(response.body);
      return GenreDetailResponse.fromJson(responseData);
    } catch (e) {
      return GenreDetailResponse(
        sukses: false,
        pesan: 'Terjadi kesalahan: ${e.toString()}',
      );
    }
  }

  /// Hapus genre (Admin only)
  /// DELETE /api/genre/:id
  static Future<DeleteGenreResponse> deleteGenre(String id) async {
    try {
      final accessToken = await AuthService.getAccessToken();

      if (accessToken == null) {
        return DeleteGenreResponse(
          sukses: false,
          pesan: 'Token tidak ditemukan',
        );
      }

      final response = await http
          .delete(
            Uri.parse(ApiConfig.genreById(id)),
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer $accessToken',
              'X-Platform': 'mobile',
            },
          )
          .timeout(ApiConfig.defaultTimeout);

      final responseData = jsonDecode(response.body);
      return DeleteGenreResponse.fromJson(responseData);
    } catch (e) {
      return DeleteGenreResponse(
        sukses: false,
        pesan: 'Terjadi kesalahan: ${e.toString()}',
      );
    }
  }
}

/// Genre Detail Response
class GenreDetailResponse {
  final bool sukses;
  final String pesan;
  final Genre? data;

  GenreDetailResponse({required this.sukses, this.pesan = '', this.data});

  factory GenreDetailResponse.fromJson(Map<String, dynamic> json) {
    return GenreDetailResponse(
      sukses: json['sukses'] ?? false,
      pesan: json['pesan'] ?? '',
      data: json['data'] != null ? Genre.fromJson(json['data']) : null,
    );
  }
}

/// Delete Genre Response
class DeleteGenreResponse {
  final bool sukses;
  final String pesan;

  DeleteGenreResponse({required this.sukses, this.pesan = ''});

  factory DeleteGenreResponse.fromJson(Map<String, dynamic> json) {
    return DeleteGenreResponse(
      sukses: json['sukses'] ?? false,
      pesan: json['pesan'] ?? '',
    );
  }
}
