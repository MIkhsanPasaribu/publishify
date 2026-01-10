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

      final uri = Uri.parse('${ApiConfig.kategori}/aktif');

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
}
