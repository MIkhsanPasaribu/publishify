import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:publishify/services/general/auth_service.dart';
import 'package:publishify/config/api_config.dart';

class PercetakanService {
  /// POST /api/percetakan - Buat pesanan cetak
  static Future<BuatPesananResponse> buatPesananCetak({
    required String idNaskah,
    required int jumlah,
    required String formatKertas,
    required String jenisKertas,
    required String jenisCover,
    List<String> finishingTambahan = const [],
    String? catatan,
  }) async {
    try {
      final accessToken = await AuthService.getAccessToken();

      if (accessToken == null) {
        return BuatPesananResponse(
          sukses: false,
          pesan: 'Token tidak ditemukan. Silakan login kembali.',
        );
      }

      final url = Uri.parse(ApiConfig.percetakan);

      final body = {
        'idNaskah': idNaskah,
        'jumlah': jumlah,
        'formatKertas': formatKertas,
        'jenisKertas': jenisKertas,
        'jenisCover': jenisCover,
        'finishingTambahan': finishingTambahan,
      };

      if (catatan != null && catatan.isNotEmpty) {
        body['catatan'] = catatan;
      }

      final response = await http
          .post(
            url,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer $accessToken',
              'X-Platform': 'mobile',
            },
            body: jsonEncode(body),
          )
          .timeout(ApiConfig.defaultTimeout);

      final responseData = jsonDecode(response.body);
      return BuatPesananResponse.fromJson(responseData);
    } catch (e) {
      return BuatPesananResponse(
        sukses: false,
        pesan: 'Terjadi kesalahan: ${e.toString()}',
      );
    }
  }

  /// GET /api/percetakan/tarif - Ambil daftar skema tarif
  static Future<TarifPercetakanResponse> ambilDaftarTarif() async {
    try {
      final accessToken = await AuthService.getAccessToken();

      if (accessToken == null) {
        return TarifPercetakanResponse(
          sukses: false,
          pesan: 'Token tidak ditemukan. Silakan login kembali.',
        );
      }

      final url = Uri.parse(ApiConfig.percetakanTarif);

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
      return TarifPercetakanResponse.fromJson(responseData);
    } catch (e) {
      return TarifPercetakanResponse(
        sukses: false,
        pesan: 'Terjadi kesalahan: ${e.toString()}',
      );
    }
  }

  /// GET /api/percetakan/kalkulasi-harga - Kalkulasi estimasi harga cetak
  static Future<KalkulasiHargaResponse> kalkulasiHarga({
    required int jumlahHalaman,
    required int jumlahCetak,
    required String formatKertas,
    required String jenisKertas,
    required String jenisCover,
    List<String> finishingTambahan = const [],
  }) async {
    try {
      final accessToken = await AuthService.getAccessToken();

      if (accessToken == null) {
        return KalkulasiHargaResponse(
          sukses: false,
          pesan: 'Token tidak ditemukan. Silakan login kembali.',
        );
      }

      final queryParams = <String, String>{
        'jumlahHalaman': jumlahHalaman.toString(),
        'jumlahCetak': jumlahCetak.toString(),
        'formatKertas': formatKertas,
        'jenisKertas': jenisKertas,
        'jenisCover': jenisCover,
      };

      if (finishingTambahan.isNotEmpty) {
        queryParams['finishingTambahan'] = finishingTambahan.join(',');
      }

      final url = Uri.parse(
        ApiConfig.percetakanKalkulasiHarga,
      ).replace(queryParameters: queryParams);

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
      return KalkulasiHargaResponse.fromJson(responseData);
    } catch (e) {
      return KalkulasiHargaResponse(
        sukses: false,
        pesan: 'Terjadi kesalahan: ${e.toString()}',
      );
    }
  }

  /// GET /api/percetakan/penulis/saya - Ambil pesanan penulis sendiri
  static Future<PesananListResponse> ambilPesananSaya({
    int halaman = 1,
    int limit = 20,
    String? status,
  }) async {
    try {
      final accessToken = await AuthService.getAccessToken();

      if (accessToken == null) {
        return PesananListResponse(
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

      final url = Uri.parse(
        ApiConfig.percetakanPenulisSaya,
      ).replace(queryParameters: queryParams);

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
      return PesananListResponse.fromJson(responseData);
    } catch (e) {
      return PesananListResponse(
        sukses: false,
        pesan: 'Terjadi kesalahan: ${e.toString()}',
      );
    }
  }

  /// GET /api/percetakan/:id - Ambil detail pesanan
  static Future<PesananDetailResponse> ambilDetailPesanan(String id) async {
    try {
      final accessToken = await AuthService.getAccessToken();

      if (accessToken == null) {
        return PesananDetailResponse(
          sukses: false,
          pesan: 'Token tidak ditemukan. Silakan login kembali.',
        );
      }

      final url = Uri.parse(ApiConfig.percetakanById(id));

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
      return PesananDetailResponse.fromJson(responseData);
    } catch (e) {
      return PesananDetailResponse(
        sukses: false,
        pesan: 'Terjadi kesalahan: ${e.toString()}',
      );
    }
  }

  /// PUT /api/percetakan/:id/batal - Batalkan pesanan
  static Future<BatalPesananResponse> batalkanPesanan({
    required String id,
    String? alasanBatal,
  }) async {
    try {
      final accessToken = await AuthService.getAccessToken();

      if (accessToken == null) {
        return BatalPesananResponse(
          sukses: false,
          pesan: 'Token tidak ditemukan. Silakan login kembali.',
        );
      }

      final url = Uri.parse(ApiConfig.percetakanBatal(id));

      final body = <String, dynamic>{};
      if (alasanBatal != null && alasanBatal.isNotEmpty) {
        body['alasanBatal'] = alasanBatal;
      }

      final response = await http
          .put(
            url,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer $accessToken',
              'X-Platform': 'mobile',
            },
            body: jsonEncode(body),
          )
          .timeout(ApiConfig.defaultTimeout);

      final responseData = jsonDecode(response.body);
      return BatalPesananResponse.fromJson(responseData);
    } catch (e) {
      return BatalPesananResponse(
        sukses: false,
        pesan: 'Terjadi kesalahan: ${e.toString()}',
      );
    }
  }
}

// Response model untuk buat pesanan
class BuatPesananResponse {
  final bool sukses;
  final String pesan;
  final PesananData? data;

  BuatPesananResponse({required this.sukses, required this.pesan, this.data});

  factory BuatPesananResponse.fromJson(Map<String, dynamic> json) {
    return BuatPesananResponse(
      sukses: json['sukses'] ?? false,
      pesan: json['pesan'] ?? '',
      data: json['data'] != null ? PesananData.fromJson(json['data']) : null,
    );
  }
}

class PesananData {
  final String id;
  final String idNaskah;
  final String idPenulis;
  final int jumlah;
  final String formatKertas;
  final String jenisKertas;
  final String jenisCover;
  final List<String> finishingTambahan;
  final String? catatan;
  final String status;
  final String dibuatPada;
  final String diperbaruiPada;

  PesananData({
    required this.id,
    required this.idNaskah,
    required this.idPenulis,
    required this.jumlah,
    required this.formatKertas,
    required this.jenisKertas,
    required this.jenisCover,
    required this.finishingTambahan,
    this.catatan,
    required this.status,
    required this.dibuatPada,
    required this.diperbaruiPada,
  });

  factory PesananData.fromJson(Map<String, dynamic> json) {
    return PesananData(
      id: json['id'] ?? '',
      idNaskah: json['idNaskah'] ?? '',
      idPenulis: json['idPenulis'] ?? '',
      jumlah: json['jumlah'] ?? 0,
      formatKertas: json['formatKertas'] ?? '',
      jenisKertas: json['jenisKertas'] ?? '',
      jenisCover: json['jenisCover'] ?? '',
      finishingTambahan: List<String>.from(json['finishingTambahan'] ?? []),
      catatan: json['catatan'],
      status: json['status'] ?? '',
      dibuatPada: json['dibuatPada'] ?? '',
      diperbaruiPada: json['diperbaruiPada'] ?? '',
    );
  }
}

/// Response untuk daftar tarif percetakan
class TarifPercetakanResponse {
  final bool sukses;
  final String pesan;
  final TarifData? data;

  TarifPercetakanResponse({required this.sukses, this.pesan = '', this.data});

  factory TarifPercetakanResponse.fromJson(Map<String, dynamic> json) {
    return TarifPercetakanResponse(
      sukses: json['sukses'] ?? false,
      pesan: json['pesan'] ?? '',
      data: json['data'] != null ? TarifData.fromJson(json['data']) : null,
    );
  }
}

class TarifData {
  final List<TarifItem> formatKertas;
  final List<TarifItem> jenisKertas;
  final List<TarifItem> jenisCover;
  final List<TarifItem> finishing;
  final int minimumCetak;
  final int maksimumCetak;

  TarifData({
    required this.formatKertas,
    required this.jenisKertas,
    required this.jenisCover,
    required this.finishing,
    required this.minimumCetak,
    required this.maksimumCetak,
  });

  factory TarifData.fromJson(Map<String, dynamic> json) {
    return TarifData(
      formatKertas:
          (json['formatKertas'] as List?)
              ?.map((e) => TarifItem.fromJson(e))
              .toList() ??
          [],
      jenisKertas:
          (json['jenisKertas'] as List?)
              ?.map((e) => TarifItem.fromJson(e))
              .toList() ??
          [],
      jenisCover:
          (json['jenisCover'] as List?)
              ?.map((e) => TarifItem.fromJson(e))
              .toList() ??
          [],
      finishing:
          (json['finishing'] as List?)
              ?.map((e) => TarifItem.fromJson(e))
              .toList() ??
          [],
      minimumCetak: json['minimumCetak'] ?? 1,
      maksimumCetak: json['maksimumCetak'] ?? 10000,
    );
  }
}

class TarifItem {
  final String kode;
  final String nama;
  final String? deskripsi;
  final double harga;
  final String? satuan;

  TarifItem({
    required this.kode,
    required this.nama,
    this.deskripsi,
    required this.harga,
    this.satuan,
  });

  factory TarifItem.fromJson(Map<String, dynamic> json) {
    return TarifItem(
      kode: json['kode'] ?? '',
      nama: json['nama'] ?? '',
      deskripsi: json['deskripsi'],
      harga: (json['harga'] ?? 0).toDouble(),
      satuan: json['satuan'],
    );
  }
}

/// Response untuk kalkulasi harga
class KalkulasiHargaResponse {
  final bool sukses;
  final String pesan;
  final KalkulasiHargaData? data;

  KalkulasiHargaResponse({required this.sukses, this.pesan = '', this.data});

  factory KalkulasiHargaResponse.fromJson(Map<String, dynamic> json) {
    return KalkulasiHargaResponse(
      sukses: json['sukses'] ?? false,
      pesan: json['pesan'] ?? '',
      data: json['data'] != null
          ? KalkulasiHargaData.fromJson(json['data'])
          : null,
    );
  }
}

class KalkulasiHargaData {
  final double hargaPerBuku;
  final double subtotal;
  final double biayaFinishing;
  final double totalHarga;
  final int jumlahCetak;
  final int jumlahHalaman;
  final RincianHarga? rincian;

  KalkulasiHargaData({
    required this.hargaPerBuku,
    required this.subtotal,
    required this.biayaFinishing,
    required this.totalHarga,
    required this.jumlahCetak,
    required this.jumlahHalaman,
    this.rincian,
  });

  factory KalkulasiHargaData.fromJson(Map<String, dynamic> json) {
    return KalkulasiHargaData(
      hargaPerBuku: (json['hargaPerBuku'] ?? 0).toDouble(),
      subtotal: (json['subtotal'] ?? 0).toDouble(),
      biayaFinishing: (json['biayaFinishing'] ?? 0).toDouble(),
      totalHarga: (json['totalHarga'] ?? 0).toDouble(),
      jumlahCetak: json['jumlahCetak'] ?? 0,
      jumlahHalaman: json['jumlahHalaman'] ?? 0,
      rincian: json['rincian'] != null
          ? RincianHarga.fromJson(json['rincian'])
          : null,
    );
  }
}

class RincianHarga {
  final double biayaKertas;
  final double biayaCover;
  final double biayaCetak;
  final List<RincianFinishing> finishing;

  RincianHarga({
    required this.biayaKertas,
    required this.biayaCover,
    required this.biayaCetak,
    required this.finishing,
  });

  factory RincianHarga.fromJson(Map<String, dynamic> json) {
    return RincianHarga(
      biayaKertas: (json['biayaKertas'] ?? 0).toDouble(),
      biayaCover: (json['biayaCover'] ?? 0).toDouble(),
      biayaCetak: (json['biayaCetak'] ?? 0).toDouble(),
      finishing:
          (json['finishing'] as List?)
              ?.map((e) => RincianFinishing.fromJson(e))
              .toList() ??
          [],
    );
  }
}

class RincianFinishing {
  final String nama;
  final double harga;

  RincianFinishing({required this.nama, required this.harga});

  factory RincianFinishing.fromJson(Map<String, dynamic> json) {
    return RincianFinishing(
      nama: json['nama'] ?? '',
      harga: (json['harga'] ?? 0).toDouble(),
    );
  }
}

/// Response untuk daftar pesanan
class PesananListResponse {
  final bool sukses;
  final String pesan;
  final List<PesananData>? data;
  final PesananMetadata? metadata;

  PesananListResponse({
    required this.sukses,
    this.pesan = '',
    this.data,
    this.metadata,
  });

  factory PesananListResponse.fromJson(Map<String, dynamic> json) {
    return PesananListResponse(
      sukses: json['sukses'] ?? false,
      pesan: json['pesan'] ?? '',
      data: json['data'] != null
          ? (json['data'] as List)
                .map((item) => PesananData.fromJson(item))
                .toList()
          : null,
      metadata: json['metadata'] != null
          ? PesananMetadata.fromJson(json['metadata'])
          : null,
    );
  }
}

class PesananMetadata {
  final int total;
  final int halaman;
  final int limit;
  final int totalHalaman;

  PesananMetadata({
    required this.total,
    required this.halaman,
    required this.limit,
    required this.totalHalaman,
  });

  factory PesananMetadata.fromJson(Map<String, dynamic> json) {
    return PesananMetadata(
      total: json['total'] ?? 0,
      halaman: json['halaman'] ?? 1,
      limit: json['limit'] ?? 20,
      totalHalaman: json['totalHalaman'] ?? 1,
    );
  }
}

/// Response untuk detail pesanan
class PesananDetailResponse {
  final bool sukses;
  final String pesan;
  final PesananData? data;

  PesananDetailResponse({required this.sukses, this.pesan = '', this.data});

  factory PesananDetailResponse.fromJson(Map<String, dynamic> json) {
    return PesananDetailResponse(
      sukses: json['sukses'] ?? false,
      pesan: json['pesan'] ?? '',
      data: json['data'] != null ? PesananData.fromJson(json['data']) : null,
    );
  }
}

/// Response untuk batalkan pesanan
class BatalPesananResponse {
  final bool sukses;
  final String pesan;
  final PesananData? data;

  BatalPesananResponse({required this.sukses, this.pesan = '', this.data});

  factory BatalPesananResponse.fromJson(Map<String, dynamic> json) {
    return BatalPesananResponse(
      sukses: json['sukses'] ?? false,
      pesan: json['pesan'] ?? '',
      data: json['data'] != null ? PesananData.fromJson(json['data']) : null,
    );
  }
}
