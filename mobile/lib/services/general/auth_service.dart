import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:logger/logger.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:publishify/models/general/auth_models.dart';
import 'package:publishify/config/api_config.dart';

/// Authentication Service
/// Handles all authentication related API calls
class AuthService {
  static final logger = Logger();

  // SharedPreferences keys
  static const String _keyUserId = 'user_id';
  static const String _keyUserEmail = 'user_email';
  static const String _keyTokenVerifikasi = 'token_verifikasi';
  static const String _keyIsLoggedIn = 'is_logged_in';
  static const String _keyAccessToken = 'access_token';
  static const String _keyRefreshToken = 'refresh_token';
  static const String _keyUserData = 'user_data';
  static const String _keyNamaDepan = 'nama_depan';
  static const String _keyNamaBelakang = 'nama_belakang';
  static const String _keyNamaTampilan = 'nama_tampilan';
  static const String _keyPeran = 'peran';
  static const String _keyTerverifikasi = 'terverifikasi';

  /// Register new user
  /// POST /api/auth/daftar
  static Future<RegisterResponse> register(RegisterRequest request) async {
    try {
      final url = Uri.parse(ApiConfig.authDaftar);

      final response = await http
          .post(
            url,
            headers: {
              'Content-Type': 'application/json',
              'X-Platform': 'mobile',
            },
            body: jsonEncode(request.toJson()),
          )
          .timeout(ApiConfig.defaultTimeout);

      final responseData = jsonDecode(response.body);
      final registerResponse = RegisterResponse.fromJson(responseData);

      // If registration successful, save to SharedPreferences
      if (registerResponse.sukses && registerResponse.data != null) {
        await _saveUserData(registerResponse.data!);
      }

      return registerResponse;
    } catch (e) {
      // Return error response
      return RegisterResponse(
        sukses: false,
        pesan: 'Terjadi kesalahan: ${e.toString()}',
      );
    }
  }

  /// Login user
  /// POST /api/auth/login
  static Future<LoginResponse> login(LoginRequest request) async {
    try {
      final url = Uri.parse(ApiConfig.authLogin);

      final response = await http
          .post(
            url,
            headers: {
              'Content-Type': 'application/json',
              'X-Platform': 'mobile',
            },
            body: jsonEncode(request.toJson()),
          )
          .timeout(ApiConfig.defaultTimeout);

      final responseData = jsonDecode(response.body);
      final loginResponse = LoginResponse.fromJson(responseData);

      // If login successful, save to SharedPreferences
      if (loginResponse.sukses && loginResponse.data != null) {
        await _saveLoginData(loginResponse.data!);
      }

      return loginResponse;
    } catch (e) {
      // Return error response
      return LoginResponse(
        sukses: false,
        pesan: 'Terjadi kesalahan: ${e.toString()}',
      );
    }
  }

  /// Save user data from registration to SharedPreferences
  static Future<void> _saveUserData(RegisterData data) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_keyUserId, data.id);
    await prefs.setString(_keyUserEmail, data.email);
    await prefs.setString(_keyTokenVerifikasi, data.tokenVerifikasi);
    await prefs.setBool(
      _keyIsLoggedIn,
      false,
    ); // Not logged in yet, need verification
  }

  /// Save login data to SharedPreferences
  static Future<void> _saveLoginData(LoginData data) async {
    final prefs = await SharedPreferences.getInstance();

    // Save tokens
    await prefs.setString(_keyAccessToken, data.accessToken);
    await prefs.setString(_keyRefreshToken, data.refreshToken);

    // Save user data
    await prefs.setString(_keyUserId, data.pengguna.id);
    await prefs.setString(_keyUserEmail, data.pengguna.email);
    await prefs.setStringList(_keyPeran, data.pengguna.peran);
    await prefs.setBool(_keyTerverifikasi, data.pengguna.terverifikasi);

    // Save profile data if available
    if (data.pengguna.profilPengguna != null) {
      final profil = data.pengguna.profilPengguna!;
      await prefs.setString(_keyNamaDepan, profil.namaDepan);
      await prefs.setString(_keyNamaBelakang, profil.namaBelakang);
      await prefs.setString(_keyNamaTampilan, profil.namaTampilan);
    }

    // Save complete user data as JSON for easy retrieval
    await prefs.setString(_keyUserData, jsonEncode(data.toJson()));

    // Mark as logged in
    await prefs.setBool(_keyIsLoggedIn, true);
  }

  /// Get saved user ID
  static Future<String?> getUserId() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_keyUserId);
  }

  /// Get saved user email
  static Future<String?> getUserEmail() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_keyUserEmail);
  }

  /// Get saved token verifikasi
  static Future<String?> getTokenVerifikasi() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_keyTokenVerifikasi);
  }

  /// Get access token
  static Future<String?> getAccessToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_keyAccessToken);
  }

  /// Get refresh token
  static Future<String?> getRefreshToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_keyRefreshToken);
  }

  /// Refresh access token menggunakan refresh token
  /// POST /api/auth/refresh
  static Future<RefreshTokenResponse> refreshAccessToken() async {
    try {
      final refreshToken = await getRefreshToken();
      if (refreshToken == null) {
        return RefreshTokenResponse(
          sukses: false,
          pesan: 'Refresh token tidak ditemukan. Silakan login ulang.',
        );
      }

      final url = Uri.parse(ApiConfig.authRefresh);

      final response = await http
          .post(
            url,
            headers: {
              'Content-Type': 'application/json',
              'X-Platform': 'mobile',
            },
            body: jsonEncode({'refreshToken': refreshToken}),
          )
          .timeout(ApiConfig.defaultTimeout);

      final responseData = jsonDecode(response.body);
      final refreshResponse = RefreshTokenResponse.fromJson(responseData);

      // Jika berhasil, simpan access token baru
      if (refreshResponse.sukses && refreshResponse.data != null) {
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString(
          _keyAccessToken,
          refreshResponse.data!.accessToken,
        );
      }

      return refreshResponse;
    } catch (e) {
      return RefreshTokenResponse(
        sukses: false,
        pesan: 'Terjadi kesalahan: ${e.toString()}',
      );
    }
  }

  /// Get complete user data from SharedPreferences
  static Future<LoginData?> getLoginData() async {
    final prefs = await SharedPreferences.getInstance();
    final userDataJson = prefs.getString(_keyUserData);

    if (userDataJson != null) {
      try {
        final userData = jsonDecode(userDataJson);
        return LoginData.fromJson(userData);
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  /// Get user roles using helper method from UserData
  static Future<List<String>> getUserRoles() async {
    final loginData = await getLoginData();
    if (loginData != null) {
      return loginData.pengguna.getActiveRoles();
    }

    // Fallback: get from SharedPreferences
    final prefs = await SharedPreferences.getInstance();
    return prefs.getStringList(_keyPeran) ?? [];
  }

  /// Check if user has specific role
  static Future<bool> hasRole(String role) async {
    final loginData = await getLoginData();
    if (loginData != null) {
      return loginData.pengguna.hasRole(role);
    }

    // Fallback: check from SharedPreferences
    final roles = await getUserRoles();
    return roles.contains(role);
  }

  /// Get primary role (first active role)
  static Future<String?> getPrimaryRole() async {
    final loginData = await getLoginData();
    if (loginData != null) {
      return loginData.pengguna.getPrimaryRole();
    }

    // Fallback: get first role from SharedPreferences
    final roles = await getUserRoles();
    return roles.isNotEmpty ? roles.first : null;
  }

  /// Verifikasi email dengan token
  /// POST /api/auth/verifikasi-email
  static Future<VerifikasiEmailResponse> verifikasiEmail({
    required String token,
  }) async {
    try {
      final url = Uri.parse(ApiConfig.authVerifikasiEmail);

      final response = await http
          .post(
            url,
            headers: {
              'Content-Type': 'application/json',
              'X-Platform': 'mobile',
            },
            body: jsonEncode({'token': token}),
          )
          .timeout(ApiConfig.defaultTimeout);

      final responseData = jsonDecode(response.body);
      return VerifikasiEmailResponse.fromJson(responseData);
    } catch (e) {
      return VerifikasiEmailResponse(
        sukses: false,
        pesan: 'Terjadi kesalahan: ${e.toString()}',
      );
    }
  }

  /// Reset password dengan token
  /// POST /api/auth/reset-password
  static Future<ResetPasswordResponse> resetPassword({
    required String token,
    required String passwordBaru,
  }) async {
    try {
      final url = Uri.parse(ApiConfig.authResetPassword);

      final response = await http
          .post(
            url,
            headers: {
              'Content-Type': 'application/json',
              'X-Platform': 'mobile',
            },
            body: jsonEncode({'token': token, 'passwordBaru': passwordBaru}),
          )
          .timeout(ApiConfig.defaultTimeout);

      final responseData = jsonDecode(response.body);
      return ResetPasswordResponse.fromJson(responseData);
    } catch (e) {
      return ResetPasswordResponse(
        sukses: false,
        pesan: 'Terjadi kesalahan: ${e.toString()}',
      );
    }
  }

  /// Get profil pengguna saat ini (untuk testing/refresh data)
  /// POST /api/auth/me
  static Future<AuthMeResponse> getMe() async {
    try {
      final accessToken = await getAccessToken();
      if (accessToken == null) {
        return AuthMeResponse(
          sukses: false,
          pesan: 'Token tidak ditemukan. Silakan login ulang.',
        );
      }

      final url = Uri.parse(ApiConfig.authMe);

      final response = await http
          .post(
            url,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer $accessToken',
              'X-Platform': 'mobile',
            },
          )
          .timeout(ApiConfig.defaultTimeout);

      final responseData = jsonDecode(response.body);
      return AuthMeResponse.fromJson(responseData);
    } catch (e) {
      return AuthMeResponse(
        sukses: false,
        pesan: 'Terjadi kesalahan: ${e.toString()}',
      );
    }
  }

  /// Save user roles to SharedPreferences
  static Future<void> saveUserRoles(List<String> roles) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setStringList(_keyPeran, roles);
  }

  /// Get nama tampilan (display name)
  static Future<String?> getNamaTampilan() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_keyNamaTampilan);
  }

  /// Check if user is verified
  static Future<bool> isVerified() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool(_keyTerverifikasi) ?? false;
  }

  /// Check if user is logged in
  static Future<bool> isLoggedIn() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool(_keyIsLoggedIn) ?? false;
  }

  /// Logout user with API call
  /// POST /api/auth/logout
  static Future<bool> logout() async {
    try {
      // Get refresh token before clearing
      final refreshToken = await getRefreshToken();

      if (refreshToken != null) {
        try {
          final url = Uri.parse(ApiConfig.authLogout);

          // Call logout API
          await http
              .post(
                url,
                headers: {
                  'Content-Type': 'application/json',
                  'X-Platform': 'mobile',
                },
                body: jsonEncode({'refreshToken': refreshToken}),
              )
              .timeout(ApiConfig.defaultTimeout);

          // Regardless of API response, clear local data
        } catch (e) {
          // If API call fails, still proceed with local logout
          logger.e('Logout API error: $e');
        }
      }

      // Clear all local data
      await _clearAllAuthData();
      return true;
    } catch (e) {
      // Even if error, try to clear local data
      logger.e('Logout error: $e');
      await _clearAllAuthData();
      return false;
    }
  }

  /// Clear all saved auth data from SharedPreferences
  static Future<void> _clearAllAuthData() async {
    final prefs = await SharedPreferences.getInstance();

    // Clear all auth related data
    await prefs.remove(_keyUserId);
    await prefs.remove(_keyUserEmail);
    await prefs.remove(_keyTokenVerifikasi);
    await prefs.remove(_keyAccessToken);
    await prefs.remove(_keyRefreshToken);
    await prefs.remove(_keyUserData);
    await prefs.remove(_keyNamaDepan);
    await prefs.remove(_keyNamaBelakang);
    await prefs.remove(_keyNamaTampilan);
    await prefs.remove(_keyPeran);
    await prefs.remove(_keyTerverifikasi);
    await prefs.remove(_keyIsLoggedIn);

    // Also clear any other profile related data
    await prefs.remove('bio');
    await prefs.remove('url_avatar');
    await prefs.remove('tanggal_lahir');
    await prefs.remove('jenis_kelamin');
    await prefs.remove('alamat');
    await prefs.remove('kota');
    await prefs.remove('provinsi');
    await prefs.remove('kode_pos');
    await prefs.remove('telepon');
  }

  /// Clear all data including verification token
  static Future<void> clearAllData() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
  }

  // ====================================
  // ENHANCED ROLE MANAGEMENT METHODS
  // ====================================
  // Methods updated to use UserData helper methods

  /// Lupa password - request reset link
  /// POST /api/auth/lupa-password
  static Future<LupaPasswordResponse> lupaPassword({
    required String email,
  }) async {
    try {
      final url = Uri.parse(ApiConfig.authLupaPassword);

      final response = await http
          .post(
            url,
            headers: {
              'Content-Type': 'application/json',
              'X-Platform': 'mobile',
            },
            body: jsonEncode({'email': email}),
          )
          .timeout(ApiConfig.defaultTimeout);

      final responseData = jsonDecode(response.body);
      return LupaPasswordResponse.fromJson(responseData);
    } catch (e) {
      return LupaPasswordResponse(
        sukses: false,
        pesan: 'Terjadi kesalahan: ${e.toString()}',
      );
    }
  }

  /// Link Google Account ke user yang sudah login
  /// POST /api/auth/google/link
  static Future<GoogleLinkResponse> linkGoogleAccount({
    required String idToken,
  }) async {
    try {
      final accessToken = await getAccessToken();
      if (accessToken == null) {
        return GoogleLinkResponse(
          sukses: false,
          pesan: 'Token tidak ditemukan. Silakan login ulang.',
        );
      }

      final url = Uri.parse(ApiConfig.authGoogleLink);

      final response = await http
          .post(
            url,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer $accessToken',
              'X-Platform': 'mobile',
            },
            body: jsonEncode({'idToken': idToken}),
          )
          .timeout(ApiConfig.defaultTimeout);

      final responseData = jsonDecode(response.body);
      return GoogleLinkResponse.fromJson(responseData);
    } catch (e) {
      return GoogleLinkResponse(
        sukses: false,
        pesan: 'Terjadi kesalahan: ${e.toString()}',
      );
    }
  }

  /// Unlink Google Account dari user
  /// DELETE /api/auth/google/unlink
  static Future<GoogleUnlinkResponse> unlinkGoogleAccount() async {
    try {
      final accessToken = await getAccessToken();
      if (accessToken == null) {
        return GoogleUnlinkResponse(
          sukses: false,
          pesan: 'Token tidak ditemukan. Silakan login ulang.',
        );
      }

      final url = Uri.parse(ApiConfig.authGoogleUnlink);

      final response = await http
          .delete(
            url,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer $accessToken',
              'X-Platform': 'mobile',
            },
          )
          .timeout(ApiConfig.defaultTimeout);

      final responseData = jsonDecode(response.body);
      return GoogleUnlinkResponse.fromJson(responseData);
    } catch (e) {
      return GoogleUnlinkResponse(
        sukses: false,
        pesan: 'Terjadi kesalahan: ${e.toString()}',
      );
    }
  }

  /// Ganti password untuk user yang sudah login
  /// PUT /api/pengguna/password
  static Future<GantiPasswordResponse> gantiPassword({
    required String passwordLama,
    required String passwordBaru,
  }) async {
    try {
      final accessToken = await getAccessToken();
      if (accessToken == null) {
        return GantiPasswordResponse(
          sukses: false,
          pesan: 'Token tidak ditemukan. Silakan login ulang.',
        );
      }

      final url = Uri.parse(ApiConfig.penggunaPassword);

      final response = await http
          .put(
            url,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer $accessToken',
              'X-Platform': 'mobile',
            },
            body: jsonEncode({
              'passwordLama': passwordLama,
              'passwordBaru': passwordBaru,
            }),
          )
          .timeout(ApiConfig.defaultTimeout);

      final responseData = jsonDecode(response.body);
      return GantiPasswordResponse.fromJson(responseData);
    } catch (e) {
      return GantiPasswordResponse(
        sukses: false,
        pesan: 'Terjadi kesalahan: ${e.toString()}',
      );
    }
  }
}
