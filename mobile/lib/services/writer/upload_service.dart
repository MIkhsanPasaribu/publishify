import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:http_parser/http_parser.dart';
import 'package:publishify/services/general/auth_service.dart';
import 'package:publishify/config/api_config.dart';
import 'package:mime/mime.dart';

/// Upload Service
/// Handles file upload to backend
class UploadService {
  /// Upload single file (naskah)
  /// POST /api/upload/single
  static Future<UploadResponse> uploadNaskah({
    required File file,
    String? deskripsi,
    String? idReferensi,
  }) async {
    try {
      // Get access token
      final accessToken = await AuthService.getAccessToken();

      if (accessToken == null) {
        return UploadResponse(
          sukses: false,
          pesan: 'Token tidak ditemukan. Silakan login kembali.',
        );
      }

      // Create multipart request
      final uri = Uri.parse(ApiConfig.uploadSingle);
      final request = http.MultipartRequest('POST', uri);

      // Add headers
      request.headers['Authorization'] = 'Bearer $accessToken';
      request.headers['X-Platform'] = 'mobile';

      // Add file
      final mimeType = lookupMimeType(file.path) ?? 'application/octet-stream';
      final mimeTypeData = mimeType.split('/');

      request.files.add(
        await http.MultipartFile.fromPath(
          'file',
          file.path,
          contentType: MediaType(mimeTypeData[0], mimeTypeData[1]),
        ),
      );

      // Add form fields
      request.fields['tujuan'] = 'naskah';

      if (deskripsi != null && deskripsi.isNotEmpty) {
        request.fields['deskripsi'] = deskripsi;
      }

      if (idReferensi != null && idReferensi.isNotEmpty) {
        request.fields['idReferensi'] = idReferensi;
      }

      // Send request
      final streamedResponse = await request.send().timeout(
        const Duration(minutes: 5),
      );
      final response = await http.Response.fromStream(streamedResponse);

      final responseData = jsonDecode(response.body);

      if (response.statusCode == 201) {
        return UploadResponse.fromJson(responseData);
      } else {
        return UploadResponse(
          sukses: false,
          pesan: responseData['pesan'] ?? 'Upload gagal',
        );
      }
    } catch (e) {
      return UploadResponse(
        sukses: false,
        pesan: 'Terjadi kesalahan: ${e.toString()}',
      );
    }
  }

  /// Upload sampul buku
  /// POST /api/upload/single
  static Future<UploadResponse> uploadSampul({
    required File file,
    String? deskripsi,
    String? idReferensi,
  }) async {
    try {
      final accessToken = await AuthService.getAccessToken();

      if (accessToken == null) {
        return UploadResponse(
          sukses: false,
          pesan: 'Token tidak ditemukan. Silakan login kembali.',
        );
      }

      final uri = Uri.parse(ApiConfig.uploadSingle);
      final request = http.MultipartRequest('POST', uri);

      request.headers['Authorization'] = 'Bearer $accessToken';
      request.headers['X-Platform'] = 'mobile';

      final mimeType = lookupMimeType(file.path) ?? 'image/jpeg';
      final mimeTypeData = mimeType.split('/');

      request.files.add(
        await http.MultipartFile.fromPath(
          'file',
          file.path,
          contentType: MediaType(mimeTypeData[0], mimeTypeData[1]),
        ),
      );

      request.fields['tujuan'] = 'sampul';

      if (deskripsi != null && deskripsi.isNotEmpty) {
        request.fields['deskripsi'] = deskripsi;
      }

      if (idReferensi != null && idReferensi.isNotEmpty) {
        request.fields['idReferensi'] = idReferensi;
      }

      final streamedResponse = await request.send().timeout(
        const Duration(minutes: 2),
      );
      final response = await http.Response.fromStream(streamedResponse);

      final responseData = jsonDecode(response.body);

      if (response.statusCode == 201) {
        return UploadResponse.fromJson(responseData);
      } else {
        return UploadResponse(
          sukses: false,
          pesan: responseData['pesan'] ?? 'Upload gagal',
        );
      }
    } catch (e) {
      return UploadResponse(
        sukses: false,
        pesan: 'Terjadi kesalahan: ${e.toString()}',
      );
    }
  }

  /// Hapus file yang sudah diupload
  /// DELETE /api/upload/:id
  static Future<HapusFileResponse> hapusFile(String idFile) async {
    try {
      final accessToken = await AuthService.getAccessToken();

      if (accessToken == null) {
        return HapusFileResponse(
          sukses: false,
          pesan: 'Token tidak ditemukan. Silakan login kembali.',
        );
      }

      final response = await http
          .delete(
            Uri.parse(ApiConfig.uploadHapus(idFile)),
            headers: {
              'Authorization': 'Bearer $accessToken',
              'Content-Type': 'application/json',
              'X-Platform': 'mobile',
            },
          )
          .timeout(const Duration(seconds: 30));

      final responseData = jsonDecode(response.body);

      if (response.statusCode == 200) {
        return HapusFileResponse.fromJson(responseData);
      } else {
        return HapusFileResponse(
          sukses: false,
          pesan: responseData['pesan'] ?? 'Gagal menghapus file',
        );
      }
    } catch (e) {
      return HapusFileResponse(
        sukses: false,
        pesan: 'Terjadi kesalahan: ${e.toString()}',
      );
    }
  }

  /// Upload multiple files
  /// POST /api/upload/multiple
  static Future<UploadMultipleResponse> uploadMultiple({
    required List<File> files,
    required String tujuan,
    String? deskripsi,
    String? idReferensi,
  }) async {
    try {
      final accessToken = await AuthService.getAccessToken();

      if (accessToken == null) {
        return UploadMultipleResponse(
          sukses: false,
          pesan: 'Token tidak ditemukan. Silakan login kembali.',
        );
      }

      final uri = Uri.parse(ApiConfig.uploadMultiple);
      final request = http.MultipartRequest('POST', uri);

      request.headers['Authorization'] = 'Bearer $accessToken';
      request.headers['X-Platform'] = 'mobile';

      // Add files
      for (var file in files) {
        final mimeType =
            lookupMimeType(file.path) ?? 'application/octet-stream';
        final mimeTypeData = mimeType.split('/');

        request.files.add(
          await http.MultipartFile.fromPath(
            'files',
            file.path,
            contentType: MediaType(mimeTypeData[0], mimeTypeData[1]),
          ),
        );
      }

      request.fields['tujuan'] = tujuan;

      if (deskripsi != null && deskripsi.isNotEmpty) {
        request.fields['deskripsi'] = deskripsi;
      }

      if (idReferensi != null && idReferensi.isNotEmpty) {
        request.fields['idReferensi'] = idReferensi;
      }

      final streamedResponse = await request.send().timeout(
        const Duration(minutes: 10),
      );
      final response = await http.Response.fromStream(streamedResponse);

      final responseData = jsonDecode(response.body);

      if (response.statusCode == 201) {
        return UploadMultipleResponse.fromJson(responseData);
      } else {
        return UploadMultipleResponse(
          sukses: false,
          pesan: responseData['pesan'] ?? 'Upload gagal',
        );
      }
    } catch (e) {
      return UploadMultipleResponse(
        sukses: false,
        pesan: 'Terjadi kesalahan: ${e.toString()}',
      );
    }
  }

  /// Ambil daftar file dengan pagination dan filter
  /// GET /api/upload
  static Future<FileListResponse> ambilDaftarFile({
    int halaman = 1,
    int limit = 20,
    String? tujuan,
    String? idReferensi,
    String? cari,
  }) async {
    try {
      final accessToken = await AuthService.getAccessToken();

      if (accessToken == null) {
        return FileListResponse(
          sukses: false,
          pesan: 'Token tidak ditemukan. Silakan login kembali.',
        );
      }

      final queryParams = <String, String>{
        'halaman': halaman.toString(),
        'limit': limit.toString(),
      };

      if (tujuan != null && tujuan.isNotEmpty) {
        queryParams['tujuan'] = tujuan;
      }

      if (idReferensi != null && idReferensi.isNotEmpty) {
        queryParams['idReferensi'] = idReferensi;
      }

      if (cari != null && cari.isNotEmpty) {
        queryParams['cari'] = cari;
      }

      final uri = Uri.parse(
        ApiConfig.upload,
      ).replace(queryParameters: queryParams);

      final response = await http
          .get(
            uri,
            headers: {
              'Authorization': 'Bearer $accessToken',
              'Content-Type': 'application/json',
              'X-Platform': 'mobile',
            },
          )
          .timeout(const Duration(seconds: 30));

      final responseData = jsonDecode(response.body);

      if (response.statusCode == 200) {
        return FileListResponse.fromJson(responseData);
      } else {
        return FileListResponse(
          sukses: false,
          pesan: responseData['pesan'] ?? 'Gagal mengambil daftar file',
        );
      }
    } catch (e) {
      return FileListResponse(
        sukses: false,
        pesan: 'Terjadi kesalahan: ${e.toString()}',
      );
    }
  }

  /// Ambil metadata file by ID
  /// GET /api/upload/metadata/:id
  static Future<FileMetadataResponse> ambilMetadataFile(String idFile) async {
    try {
      final accessToken = await AuthService.getAccessToken();

      if (accessToken == null) {
        return FileMetadataResponse(
          sukses: false,
          pesan: 'Token tidak ditemukan. Silakan login kembali.',
        );
      }

      final response = await http
          .get(
            Uri.parse(ApiConfig.uploadMetadata(idFile)),
            headers: {
              'Authorization': 'Bearer $accessToken',
              'Content-Type': 'application/json',
              'X-Platform': 'mobile',
            },
          )
          .timeout(const Duration(seconds: 30));

      final responseData = jsonDecode(response.body);

      if (response.statusCode == 200) {
        return FileMetadataResponse.fromJson(responseData);
      } else {
        return FileMetadataResponse(
          sukses: false,
          pesan: responseData['pesan'] ?? 'Gagal mengambil metadata file',
        );
      }
    } catch (e) {
      return FileMetadataResponse(
        sukses: false,
        pesan: 'Terjadi kesalahan: ${e.toString()}',
      );
    }
  }

  /// Ambil URL file by ID
  /// GET /api/upload/:id
  static Future<FileUrlResponse> ambilUrlFile(String idFile) async {
    try {
      final accessToken = await AuthService.getAccessToken();

      if (accessToken == null) {
        return FileUrlResponse(
          sukses: false,
          pesan: 'Token tidak ditemukan. Silakan login kembali.',
        );
      }

      final response = await http
          .get(
            Uri.parse(ApiConfig.uploadById(idFile)),
            headers: {
              'Authorization': 'Bearer $accessToken',
              'Content-Type': 'application/json',
              'X-Platform': 'mobile',
            },
          )
          .timeout(const Duration(seconds: 30));

      final responseData = jsonDecode(response.body);

      if (response.statusCode == 200) {
        return FileUrlResponse.fromJson(responseData);
      } else {
        return FileUrlResponse(
          sukses: false,
          pesan: responseData['pesan'] ?? 'Gagal mengambil URL file',
        );
      }
    } catch (e) {
      return FileUrlResponse(
        sukses: false,
        pesan: 'Terjadi kesalahan: ${e.toString()}',
      );
    }
  }

  /// Download template naskah (public)
  /// GET /api/upload/template/naskah
  static Future<TemplateResponse> downloadTemplateNaskah() async {
    try {
      final response = await http
          .get(
            Uri.parse(ApiConfig.uploadTemplateNaskah),
            headers: {
              'Content-Type': 'application/json',
              'X-Platform': 'mobile',
            },
          )
          .timeout(const Duration(seconds: 30));

      final responseData = jsonDecode(response.body);

      if (response.statusCode == 200) {
        return TemplateResponse.fromJson(responseData);
      } else {
        return TemplateResponse(
          sukses: false,
          pesan: responseData['pesan'] ?? 'Gagal mengambil template',
        );
      }
    } catch (e) {
      return TemplateResponse(
        sukses: false,
        pesan: 'Terjadi kesalahan: ${e.toString()}',
      );
    }
  }

  /// Process image (resize/compress)
  /// POST /api/upload/:id/process
  static Future<ProcessImageResponse> processImage({
    required String idFile,
    int? width,
    int? height,
    int? quality,
    String? format,
  }) async {
    try {
      final accessToken = await AuthService.getAccessToken();

      if (accessToken == null) {
        return ProcessImageResponse(
          sukses: false,
          pesan: 'Token tidak ditemukan. Silakan login kembali.',
        );
      }

      final body = <String, dynamic>{};
      if (width != null) body['width'] = width;
      if (height != null) body['height'] = height;
      if (quality != null) body['quality'] = quality;
      if (format != null) body['format'] = format;

      final response = await http
          .post(
            Uri.parse(ApiConfig.uploadProcessImage(idFile)),
            headers: {
              'Authorization': 'Bearer $accessToken',
              'Content-Type': 'application/json',
              'X-Platform': 'mobile',
            },
            body: jsonEncode(body),
          )
          .timeout(const Duration(minutes: 2));

      final responseData = jsonDecode(response.body);

      if (response.statusCode == 200 || response.statusCode == 201) {
        return ProcessImageResponse.fromJson(responseData);
      } else {
        return ProcessImageResponse(
          sukses: false,
          pesan: responseData['pesan'] ?? 'Gagal memproses gambar',
        );
      }
    } catch (e) {
      return ProcessImageResponse(
        sukses: false,
        pesan: 'Terjadi kesalahan: ${e.toString()}',
      );
    }
  }

  /// Process image dengan preset
  /// POST /api/upload/image/:id/preset/:preset
  static Future<ProcessImageResponse> processImageWithPreset({
    required String idFile,
    required String preset,
  }) async {
    try {
      final accessToken = await AuthService.getAccessToken();

      if (accessToken == null) {
        return ProcessImageResponse(
          sukses: false,
          pesan: 'Token tidak ditemukan. Silakan login kembali.',
        );
      }

      final response = await http
          .post(
            Uri.parse(ApiConfig.uploadProcessPreset(idFile, preset)),
            headers: {
              'Authorization': 'Bearer $accessToken',
              'Content-Type': 'application/json',
              'X-Platform': 'mobile',
            },
          )
          .timeout(const Duration(minutes: 2));

      final responseData = jsonDecode(response.body);

      if (response.statusCode == 200 || response.statusCode == 201) {
        return ProcessImageResponse.fromJson(responseData);
      } else {
        return ProcessImageResponse(
          sukses: false,
          pesan: responseData['pesan'] ?? 'Gagal memproses gambar',
        );
      }
    } catch (e) {
      return ProcessImageResponse(
        sukses: false,
        pesan: 'Terjadi kesalahan: ${e.toString()}',
      );
    }
  }

  /// Konversi DOCX ke PDF by ID
  /// POST /api/upload/:id/convert/pdf
  static Future<ConvertDocxResponse> convertDocxToPdf(String idFile) async {
    try {
      final accessToken = await AuthService.getAccessToken();

      if (accessToken == null) {
        return ConvertDocxResponse(
          sukses: false,
          pesan: 'Token tidak ditemukan. Silakan login kembali.',
        );
      }

      final response = await http
          .post(
            Uri.parse(ApiConfig.uploadConvertDocx(idFile)),
            headers: {
              'Authorization': 'Bearer $accessToken',
              'Content-Type': 'application/json',
              'X-Platform': 'mobile',
            },
          )
          .timeout(const Duration(minutes: 5));

      final responseData = jsonDecode(response.body);

      if (response.statusCode == 200 || response.statusCode == 201) {
        return ConvertDocxResponse.fromJson(responseData);
      } else {
        return ConvertDocxResponse(
          sukses: false,
          pesan: responseData['pesan'] ?? 'Gagal mengkonversi DOCX ke PDF',
        );
      }
    } catch (e) {
      return ConvertDocxResponse(
        sukses: false,
        pesan: 'Terjadi kesalahan: ${e.toString()}',
      );
    }
  }

  /// Konversi DOCX ke PDF dari URL
  /// POST /api/upload/convert/pdf-from-url
  static Future<ConvertDocxResponse> convertDocxFromUrl({
    required String url,
  }) async {
    try {
      final accessToken = await AuthService.getAccessToken();

      if (accessToken == null) {
        return ConvertDocxResponse(
          sukses: false,
          pesan: 'Token tidak ditemukan. Silakan login kembali.',
        );
      }

      final response = await http
          .post(
            Uri.parse(ApiConfig.uploadConvertDocxUrl),
            headers: {
              'Authorization': 'Bearer $accessToken',
              'Content-Type': 'application/json',
              'X-Platform': 'mobile',
            },
            body: jsonEncode({'url': url}),
          )
          .timeout(const Duration(minutes: 5));

      final responseData = jsonDecode(response.body);

      if (response.statusCode == 200 || response.statusCode == 201) {
        return ConvertDocxResponse.fromJson(responseData);
      } else {
        return ConvertDocxResponse(
          sukses: false,
          pesan: responseData['pesan'] ?? 'Gagal mengkonversi DOCX ke PDF',
        );
      }
    } catch (e) {
      return ConvertDocxResponse(
        sukses: false,
        pesan: 'Terjadi kesalahan: ${e.toString()}',
      );
    }
  }
}

/// Hapus File Response Model
class HapusFileResponse {
  final bool sukses;
  final String pesan;

  HapusFileResponse({required this.sukses, required this.pesan});

  factory HapusFileResponse.fromJson(Map<String, dynamic> json) {
    return HapusFileResponse(
      sukses: json['sukses'] ?? false,
      pesan: json['pesan'] ?? '',
    );
  }
}

/// Upload Response Model
class UploadResponse {
  final bool sukses;
  final String pesan;
  final UploadData? data;

  UploadResponse({required this.sukses, required this.pesan, this.data});

  factory UploadResponse.fromJson(Map<String, dynamic> json) {
    return UploadResponse(
      sukses: json['sukses'] ?? false,
      pesan: json['pesan'] ?? '',
      data: json['data'] != null ? UploadData.fromJson(json['data']) : null,
    );
  }
}

/// Upload Data Model
class UploadData {
  final String id;
  final String namaFile;
  final String namaAsli;
  final String mimeType;
  final int ukuran;
  final String url;
  final String path;

  UploadData({
    required this.id,
    required this.namaFile,
    required this.namaAsli,
    required this.mimeType,
    required this.ukuran,
    required this.url,
    required this.path,
  });

  factory UploadData.fromJson(Map<String, dynamic> json) {
    return UploadData(
      id: json['id'] ?? '',
      namaFile: json['namaFile'] ?? '',
      namaAsli: json['namaAsli'] ?? '',
      mimeType: json['mimeType'] ?? '',
      ukuran: json['ukuran'] ?? 0,
      url: json['url'] ?? '',
      path: json['path'] ?? '',
    );
  }
}

/// Upload Multiple Response Model
class UploadMultipleResponse {
  final bool sukses;
  final String pesan;
  final UploadMultipleData? data;

  UploadMultipleResponse({
    required this.sukses,
    required this.pesan,
    this.data,
  });

  factory UploadMultipleResponse.fromJson(Map<String, dynamic> json) {
    return UploadMultipleResponse(
      sukses: json['sukses'] ?? false,
      pesan: json['pesan'] ?? '',
      data: json['data'] != null
          ? UploadMultipleData.fromJson(json['data'])
          : null,
    );
  }
}

class UploadMultipleData {
  final int totalBerhasil;
  final int totalGagal;
  final List<UploadData> berhasil;
  final List<UploadError> gagal;

  UploadMultipleData({
    required this.totalBerhasil,
    required this.totalGagal,
    required this.berhasil,
    required this.gagal,
  });

  factory UploadMultipleData.fromJson(Map<String, dynamic> json) {
    return UploadMultipleData(
      totalBerhasil: json['totalBerhasil'] ?? 0,
      totalGagal: json['totalGagal'] ?? 0,
      berhasil:
          (json['berhasil'] as List?)
              ?.map((e) => UploadData.fromJson(e))
              .toList() ??
          [],
      gagal:
          (json['gagal'] as List?)
              ?.map((e) => UploadError.fromJson(e))
              .toList() ??
          [],
    );
  }
}

class UploadError {
  final String namaFile;
  final String error;

  UploadError({required this.namaFile, required this.error});

  factory UploadError.fromJson(Map<String, dynamic> json) {
    return UploadError(
      namaFile: json['namaFile'] ?? '',
      error: json['error'] ?? '',
    );
  }
}

/// File List Response Model
class FileListResponse {
  final bool sukses;
  final String pesan;
  final List<UploadData>? data;
  final FileListMetadata? metadata;

  FileListResponse({
    required this.sukses,
    required this.pesan,
    this.data,
    this.metadata,
  });

  factory FileListResponse.fromJson(Map<String, dynamic> json) {
    return FileListResponse(
      sukses: json['sukses'] ?? false,
      pesan: json['pesan'] ?? '',
      data: (json['data'] as List?)
          ?.map((e) => UploadData.fromJson(e))
          .toList(),
      metadata: json['metadata'] != null
          ? FileListMetadata.fromJson(json['metadata'])
          : null,
    );
  }
}

class FileListMetadata {
  final int total;
  final int halaman;
  final int limit;
  final int totalHalaman;

  FileListMetadata({
    required this.total,
    required this.halaman,
    required this.limit,
    required this.totalHalaman,
  });

  factory FileListMetadata.fromJson(Map<String, dynamic> json) {
    return FileListMetadata(
      total: json['total'] ?? 0,
      halaman: json['halaman'] ?? 1,
      limit: json['limit'] ?? 20,
      totalHalaman: json['totalHalaman'] ?? 1,
    );
  }
}

/// File Metadata Response Model
class FileMetadataResponse {
  final bool sukses;
  final String pesan;
  final FileMetadata? data;

  FileMetadataResponse({required this.sukses, required this.pesan, this.data});

  factory FileMetadataResponse.fromJson(Map<String, dynamic> json) {
    return FileMetadataResponse(
      sukses: json['sukses'] ?? false,
      pesan: json['pesan'] ?? '',
      data: json['data'] != null ? FileMetadata.fromJson(json['data']) : null,
    );
  }
}

class FileMetadata {
  final String id;
  final String namaFile;
  final String namaAsli;
  final String mimeType;
  final int ukuran;
  final String tujuan;
  final String? deskripsi;
  final String? idReferensi;
  final String url;
  final String path;
  final String dibuatPada;
  final FileUploader? pengguna;

  FileMetadata({
    required this.id,
    required this.namaFile,
    required this.namaAsli,
    required this.mimeType,
    required this.ukuran,
    required this.tujuan,
    this.deskripsi,
    this.idReferensi,
    required this.url,
    required this.path,
    required this.dibuatPada,
    this.pengguna,
  });

  factory FileMetadata.fromJson(Map<String, dynamic> json) {
    return FileMetadata(
      id: json['id'] ?? '',
      namaFile: json['namaFile'] ?? '',
      namaAsli: json['namaAsli'] ?? '',
      mimeType: json['mimeType'] ?? '',
      ukuran: json['ukuran'] ?? 0,
      tujuan: json['tujuan'] ?? '',
      deskripsi: json['deskripsi'],
      idReferensi: json['idReferensi'],
      url: json['url'] ?? '',
      path: json['path'] ?? '',
      dibuatPada: json['dibuatPada'] ?? '',
      pengguna: json['pengguna'] != null
          ? FileUploader.fromJson(json['pengguna'])
          : null,
    );
  }
}

class FileUploader {
  final String id;
  final String email;

  FileUploader({required this.id, required this.email});

  factory FileUploader.fromJson(Map<String, dynamic> json) {
    return FileUploader(id: json['id'] ?? '', email: json['email'] ?? '');
  }
}

/// File URL Response Model
class FileUrlResponse {
  final bool sukses;
  final String pesan;
  final FileUrlData? data;

  FileUrlResponse({required this.sukses, required this.pesan, this.data});

  factory FileUrlResponse.fromJson(Map<String, dynamic> json) {
    return FileUrlResponse(
      sukses: json['sukses'] ?? false,
      pesan: json['pesan'] ?? '',
      data: json['data'] != null ? FileUrlData.fromJson(json['data']) : null,
    );
  }
}

class FileUrlData {
  final String url;
  final String namaFile;

  FileUrlData({required this.url, required this.namaFile});

  factory FileUrlData.fromJson(Map<String, dynamic> json) {
    return FileUrlData(
      url: json['url'] ?? '',
      namaFile: json['namaFile'] ?? '',
    );
  }
}

/// Template Response Model
class TemplateResponse {
  final bool sukses;
  final String pesan;
  final TemplateData? data;

  TemplateResponse({required this.sukses, required this.pesan, this.data});

  factory TemplateResponse.fromJson(Map<String, dynamic> json) {
    return TemplateResponse(
      sukses: json['sukses'] ?? false,
      pesan: json['pesan'] ?? '',
      data: json['data'] != null ? TemplateData.fromJson(json['data']) : null,
    );
  }
}

class TemplateData {
  final String url;
  final String namaFile;

  TemplateData({required this.url, required this.namaFile});

  factory TemplateData.fromJson(Map<String, dynamic> json) {
    return TemplateData(
      url: json['url'] ?? '',
      namaFile: json['namaFile'] ?? '',
    );
  }
}

/// Process Image Response Model
class ProcessImageResponse {
  final bool sukses;
  final String pesan;
  final ProcessedImageData? data;

  ProcessImageResponse({required this.sukses, required this.pesan, this.data});

  factory ProcessImageResponse.fromJson(Map<String, dynamic> json) {
    return ProcessImageResponse(
      sukses: json['sukses'] ?? false,
      pesan: json['pesan'] ?? '',
      data: json['data'] != null
          ? ProcessedImageData.fromJson(json['data'])
          : null,
    );
  }
}

class ProcessedImageData {
  final String id;
  final String namaFile;
  final String url;
  final int ukuran;
  final int? width;
  final int? height;
  final String? format;

  ProcessedImageData({
    required this.id,
    required this.namaFile,
    required this.url,
    required this.ukuran,
    this.width,
    this.height,
    this.format,
  });

  factory ProcessedImageData.fromJson(Map<String, dynamic> json) {
    return ProcessedImageData(
      id: json['id'] ?? '',
      namaFile: json['namaFile'] ?? '',
      url: json['url'] ?? '',
      ukuran: json['ukuran'] ?? 0,
      width: json['width'],
      height: json['height'],
      format: json['format'],
    );
  }
}

/// Convert DOCX Response Model
class ConvertDocxResponse {
  final bool sukses;
  final String pesan;
  final ConvertedPdfData? data;

  ConvertDocxResponse({required this.sukses, required this.pesan, this.data});

  factory ConvertDocxResponse.fromJson(Map<String, dynamic> json) {
    return ConvertDocxResponse(
      sukses: json['sukses'] ?? false,
      pesan: json['pesan'] ?? '',
      data: json['data'] != null
          ? ConvertedPdfData.fromJson(json['data'])
          : null,
    );
  }
}

class ConvertedPdfData {
  final String id;
  final String namaFile;
  final String url;
  final int ukuran;

  ConvertedPdfData({
    required this.id,
    required this.namaFile,
    required this.url,
    required this.ukuran,
  });

  factory ConvertedPdfData.fromJson(Map<String, dynamic> json) {
    return ConvertedPdfData(
      id: json['id'] ?? '',
      namaFile: json['namaFile'] ?? '',
      url: json['url'] ?? '',
      ukuran: json['ukuran'] ?? 0,
    );
  }
}
