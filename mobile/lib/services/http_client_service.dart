/// HTTP Client Service - Layanan HTTP Client Terpusat
/// Service ini menyediakan fungsi-fungsi untuk melakukan HTTP request
/// dengan fitur authentication, error handling, dan retry mechanism.
library;

import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:logger/logger.dart';
import 'package:publishify/config/api_config.dart';
import 'package:publishify/services/general/auth_service.dart';

/// Logger untuk debugging
final _logger = Logger(
  printer: PrettyPrinter(
    methodCount: 0,
    dateTimeFormat: DateTimeFormat.onlyTimeAndSinceStart,
  ),
);

/// Response wrapper untuk standardisasi response
class ApiResponse<T> {
  final bool sukses;
  final String pesan;
  final T? data;
  final Map<String, dynamic>? metadata;
  final int? statusCode;

  ApiResponse({
    required this.sukses,
    required this.pesan,
    this.data,
    this.metadata,
    this.statusCode,
  });

  factory ApiResponse.success(
    T data, {
    String pesan = 'Sukses',
    Map<String, dynamic>? metadata,
  }) {
    return ApiResponse(
      sukses: true,
      pesan: pesan,
      data: data,
      metadata: metadata,
    );
  }

  factory ApiResponse.error(String pesan, {int? statusCode}) {
    return ApiResponse(sukses: false, pesan: pesan, statusCode: statusCode);
  }
}

/// HTTP Client Service untuk koneksi ke backend
class HttpClientService {
  // Singleton pattern
  static final HttpClientService _instance = HttpClientService._internal();
  factory HttpClientService() => _instance;
  HttpClientService._internal();

  /// Get authorization headers dengan token
  static Future<Map<String, String>> getHeaders({bool withAuth = true}) async {
    final headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Platform': 'mobile',
    };

    if (withAuth) {
      final token = await AuthService.getAccessToken();
      if (token != null && token.isNotEmpty) {
        headers['Authorization'] = 'Bearer $token';
      }
    }

    return headers;
  }

  /// Generic GET request
  static Future<ApiResponse<T>> get<T>(
    String url, {
    Map<String, String>? queryParams,
    T Function(dynamic)? fromJson,
    bool withAuth = true,
  }) async {
    try {
      final headers = await getHeaders(withAuth: withAuth);
      final uri = ApiConfig.buildUri(url, queryParams: queryParams);

      _logger.d('GET: $uri');

      final response = await http
          .get(uri, headers: headers)
          .timeout(ApiConfig.defaultTimeout);

      return _handleResponse<T>(response, fromJson);
    } on SocketException {
      return ApiResponse.error(
        'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.',
      );
    } on http.ClientException catch (e) {
      return ApiResponse.error('Kesalahan jaringan: ${e.message}');
    } catch (e) {
      _logger.e('GET Error: $e');
      return ApiResponse.error('Terjadi kesalahan: ${e.toString()}');
    }
  }

  /// Generic POST request
  static Future<ApiResponse<T>> post<T>(
    String url, {
    Map<String, dynamic>? body,
    T Function(dynamic)? fromJson,
    bool withAuth = true,
  }) async {
    try {
      final headers = await getHeaders(withAuth: withAuth);
      final uri = Uri.parse(url);

      _logger.d('POST: $uri');
      _logger.d('Body: ${jsonEncode(body)}');

      final response = await http
          .post(
            uri,
            headers: headers,
            body: body != null ? jsonEncode(body) : null,
          )
          .timeout(ApiConfig.defaultTimeout);

      return _handleResponse<T>(response, fromJson);
    } on SocketException {
      return ApiResponse.error(
        'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.',
      );
    } on http.ClientException catch (e) {
      return ApiResponse.error('Kesalahan jaringan: ${e.message}');
    } catch (e) {
      _logger.e('POST Error: $e');
      return ApiResponse.error('Terjadi kesalahan: ${e.toString()}');
    }
  }

  /// Generic PUT request
  static Future<ApiResponse<T>> put<T>(
    String url, {
    Map<String, dynamic>? body,
    T Function(dynamic)? fromJson,
    bool withAuth = true,
  }) async {
    try {
      final headers = await getHeaders(withAuth: withAuth);
      final uri = Uri.parse(url);

      _logger.d('PUT: $uri');
      _logger.d('Body: ${jsonEncode(body)}');

      final response = await http
          .put(
            uri,
            headers: headers,
            body: body != null ? jsonEncode(body) : null,
          )
          .timeout(ApiConfig.defaultTimeout);

      return _handleResponse<T>(response, fromJson);
    } on SocketException {
      return ApiResponse.error(
        'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.',
      );
    } on http.ClientException catch (e) {
      return ApiResponse.error('Kesalahan jaringan: ${e.message}');
    } catch (e) {
      _logger.e('PUT Error: $e');
      return ApiResponse.error('Terjadi kesalahan: ${e.toString()}');
    }
  }

  /// Generic DELETE request
  static Future<ApiResponse<T>> delete<T>(
    String url, {
    Map<String, dynamic>? body,
    T Function(dynamic)? fromJson,
    bool withAuth = true,
  }) async {
    try {
      final headers = await getHeaders(withAuth: withAuth);
      final uri = Uri.parse(url);

      _logger.d('DELETE: $uri');

      final response = await http
          .delete(
            uri,
            headers: headers,
            body: body != null ? jsonEncode(body) : null,
          )
          .timeout(ApiConfig.defaultTimeout);

      return _handleResponse<T>(response, fromJson);
    } on SocketException {
      return ApiResponse.error(
        'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.',
      );
    } on http.ClientException catch (e) {
      return ApiResponse.error('Kesalahan jaringan: ${e.message}');
    } catch (e) {
      _logger.e('DELETE Error: $e');
      return ApiResponse.error('Terjadi kesalahan: ${e.toString()}');
    }
  }

  /// Handle HTTP response
  static ApiResponse<T> _handleResponse<T>(
    http.Response response,
    T Function(dynamic)? fromJson,
  ) {
    _logger.d('Response Status: ${response.statusCode}');
    _logger.d('Response Body: ${response.body}');

    try {
      final responseData = jsonDecode(response.body);

      // Handle sukses response
      if (response.statusCode >= 200 && response.statusCode < 300) {
        final sukses = responseData['sukses'] ?? true;
        final pesan = responseData['pesan'] ?? 'Sukses';
        final data = responseData['data'];
        final metadata = responseData['metadata'] as Map<String, dynamic>?;

        if (fromJson != null && data != null) {
          return ApiResponse<T>(
            sukses: sukses,
            pesan: pesan,
            data: fromJson(data),
            metadata: metadata,
            statusCode: response.statusCode,
          );
        }

        return ApiResponse<T>(
          sukses: sukses,
          pesan: pesan,
          data: data as T?,
          metadata: metadata,
          statusCode: response.statusCode,
        );
      }

      // Handle error response
      final pesan = responseData['pesan'] ?? 'Terjadi kesalahan';
      return ApiResponse.error(pesan, statusCode: response.statusCode);
    } catch (e) {
      _logger.e('Parse Response Error: $e');
      return ApiResponse.error(
        'Gagal memproses response dari server',
        statusCode: response.statusCode,
      );
    }
  }

  /// Upload file dengan multipart request
  static Future<ApiResponse<T>> uploadFile<T>(
    String url,
    File file, {
    String fieldName = 'file',
    Map<String, String>? fields,
    T Function(dynamic)? fromJson,
    bool withAuth = true,
  }) async {
    try {
      final token = withAuth ? await AuthService.getAccessToken() : null;
      final uri = Uri.parse(url);

      _logger.d('UPLOAD: $uri');

      final request = http.MultipartRequest('POST', uri);

      // Add auth header
      if (token != null && token.isNotEmpty) {
        request.headers['Authorization'] = 'Bearer $token';
      }
      request.headers['X-Platform'] = 'mobile';

      // Add file
      request.files.add(
        await http.MultipartFile.fromPath(fieldName, file.path),
      );

      // Add fields
      if (fields != null) {
        request.fields.addAll(fields);
      }

      final streamedResponse = await request.send().timeout(
        ApiConfig.uploadTimeout,
      );
      final response = await http.Response.fromStream(streamedResponse);

      return _handleResponse<T>(response, fromJson);
    } on SocketException {
      return ApiResponse.error(
        'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.',
      );
    } catch (e) {
      _logger.e('UPLOAD Error: $e');
      return ApiResponse.error(
        'Terjadi kesalahan saat upload: ${e.toString()}',
      );
    }
  }
}
