import 'package:publishify/config/api_config.dart';

/// Helper untuk menangani URL gambar dari backend
class ImageHelper {
  /// Base URL backend dari ApiConfig (production)
  static String get _baseUrl {
    final url = ApiConfig.baseUrl;
    // Remove trailing slash jika ada
    return url.endsWith('/') ? url.substring(0, url.length - 1) : url;
  }

  /// Mengkonversi relative path menjadi full URL
  ///
  /// Contoh:
  /// - Input: `/uploads/sampul/2025-11-04_lukisan_a6011cc09612df7e.jpg`
  /// - Output: `http://74.225.221.140/uploads/sampul/2025-11-04_lukisan_a6011cc09612df7e.jpg`
  ///
  /// Juga handle path dari seed data yang tidak punya prefix /uploads:
  /// - Input: `/sampul/978-602-1234-012-6.jpg`
  /// - Output: `http://74.225.221.140/uploads/sampul/978-602-1234-012-6.jpg`
  ///
  /// Jika input sudah full URL (dimulai dengan http/https), langsung return
  static String getFullImageUrl(String? relativePath) {
    if (relativePath == null || relativePath.isEmpty) {
      return '';
    }

    // Jika sudah full URL, return as is
    if (relativePath.startsWith('http://') ||
        relativePath.startsWith('https://')) {
      return relativePath;
    }

    // Normalize path
    String path = relativePath.startsWith('/')
        ? relativePath
        : '/$relativePath';

    // Jika path tidak dimulai dengan /uploads, tambahkan prefix /uploads
    // Ini untuk backward compatibility dengan seed data yang pakai format lama
    // seperti /sampul/xxx.jpg atau /naskah/xxx.pdf
    if (!path.startsWith('/uploads/')) {
      // Handle format: /sampul/xxx, /naskah/xxx, /gambar/xxx, /dokumen/xxx
      final validPrefixes = ['/sampul/', '/naskah/', '/gambar/', '/dokumen/'];
      for (final prefix in validPrefixes) {
        if (path.startsWith(prefix)) {
          path = '/uploads$path';
          break;
        }
      }
    }

    // Gabungkan base URL dengan path
    return '$_baseUrl$path';
  }

  /// Check apakah URL valid dan bisa digunakan
  static bool isValidImageUrl(String? url) {
    if (url == null || url.isEmpty) {
      return false;
    }

    // Cek apakah URL atau path valid
    // Support both /uploads/xxx dan legacy format /sampul/xxx, /naskah/xxx
    return url.isNotEmpty &&
        (url.startsWith('http://') ||
            url.startsWith('https://') ||
            url.startsWith('/uploads/') ||
            url.startsWith('/sampul/') ||
            url.startsWith('/naskah/') ||
            url.startsWith('/gambar/') ||
            url.startsWith('/dokumen/'));
  }

  /// Get full URL untuk sampul buku
  static String? getSampulUrl(String? urlSampul) {
    if (!isValidImageUrl(urlSampul)) {
      return null;
    }
    return getFullImageUrl(urlSampul);
  }

  /// Get full URL untuk file naskah
  static String? getNaskahUrl(String? urlFile) {
    if (urlFile == null || urlFile.isEmpty) {
      return null;
    }
    return getFullImageUrl(urlFile);
  }

  /// Get full URL untuk avatar/profile picture
  static String? getAvatarUrl(String? urlAvatar) {
    if (!isValidImageUrl(urlAvatar)) {
      return null;
    }
    return getFullImageUrl(urlAvatar);
  }
}
