import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:publishify/models/percetakan/percetakan_models.dart';
import 'package:publishify/services/general/auth_service.dart';
import 'package:publishify/config/api_config.dart';

class PercetakanService {
  static String get baseUrl => ApiConfig.percetakan;

  /// Ambil daftar pesanan dengan pagination dan filter
  static Future<PesananListResponse> ambilDaftarPesanan({
    int halaman = 1,
    int limit = 20,
    String? status,
    String? cari,
  }) async {
    try {
      final token = await AuthService.getAccessToken();
      if (token == null) throw Exception('Token tidak ditemukan');

      final Map<String, String> queryParams = {
        'halaman': halaman.toString(),
        'limit': limit.toString(),
      };

      if (status != null && status.isNotEmpty) {
        queryParams['status'] = status;
      }

      if (cari != null && cari.isNotEmpty) {
        queryParams['cari'] = cari;
      }

      final uri = Uri.parse(baseUrl).replace(queryParameters: queryParams);

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

      if (response.statusCode == 200) {
        final responseData = json.decode(response.body);
        return PesananListResponse.fromJson(responseData);
      } else {
        throw Exception('HTTP Error ${response.statusCode}: ${response.body}');
      }
    } on SocketException {
      throw Exception('Tidak ada koneksi internet');
    } catch (e) {
      throw Exception('Terjadi kesalahan: ${e.toString()}');
    }
  }

  /// Ambil detail pesanan berdasarkan ID
  static Future<PesananDetailResponse> ambilDetailPesanan(
    String idPesanan,
  ) async {
    try {
      final token = await AuthService.getAccessToken();
      if (token == null) throw Exception('Token tidak ditemukan');

      final response = await http
          .get(
            Uri.parse('$baseUrl/$idPesanan'),
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer $token',
              'X-Platform': 'mobile',
            },
          )
          .timeout(ApiConfig.defaultTimeout);

      if (response.statusCode == 200) {
        final responseData = json.decode(response.body);
        return PesananDetailResponse.fromJson(responseData);
      } else {
        throw Exception('HTTP Error ${response.statusCode}: ${response.body}');
      }
    } on SocketException {
      throw Exception('Tidak ada koneksi internet');
    } catch (e) {
      throw Exception('Terjadi kesalahan: ${e.toString()}');
    }
  }

  /// Perbarui status pesanan
  static Future<PesananDetailResponse> perbaruiStatusPesanan(
    String idPesanan,
    String statusBaru, {
    String? catatan,
  }) async {
    try {
      final token = await AuthService.getAccessToken();
      if (token == null) throw Exception('Token tidak ditemukan');

      final Map<String, dynamic> requestData = {'status': statusBaru};

      if (catatan != null && catatan.isNotEmpty) {
        requestData['catatan'] = catatan;
      }

      final response = await http
          .put(
            Uri.parse('$baseUrl/$idPesanan/status'),
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer $token',
              'X-Platform': 'mobile',
            },
            body: json.encode(requestData),
          )
          .timeout(ApiConfig.defaultTimeout);

      if (response.statusCode == 200) {
        final responseData = json.decode(response.body);
        return PesananDetailResponse.fromJson(responseData);
      } else {
        throw Exception('HTTP Error ${response.statusCode}: ${response.body}');
      }
    } on SocketException {
      throw Exception('Tidak ada koneksi internet');
    } catch (e) {
      throw Exception('Terjadi kesalahan: ${e.toString()}');
    }
  }

  /// Terima pesanan
  static Future<PesananDetailResponse> terimaPesanan(
    String idPesanan, {
    DateTime? estimasiSelesai,
    String? catatan,
  }) async {
    try {
      final token = await AuthService.getAccessToken();
      if (token == null) throw Exception('Token tidak ditemukan');

      final Map<String, dynamic> requestData = {};

      if (estimasiSelesai != null) {
        requestData['estimasiSelesai'] = estimasiSelesai.toIso8601String();
      }

      if (catatan != null && catatan.isNotEmpty) {
        requestData['catatan'] = catatan;
      }

      final response = await http
          .post(
            Uri.parse('$baseUrl/$idPesanan/terima'),
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer $token',
              'X-Platform': 'mobile',
            },
            body: json.encode(requestData),
          )
          .timeout(ApiConfig.defaultTimeout);

      if (response.statusCode == 200) {
        final responseData = json.decode(response.body);
        return PesananDetailResponse.fromJson(responseData);
      } else {
        throw Exception('HTTP Error ${response.statusCode}: ${response.body}');
      }
    } on SocketException {
      throw Exception('Tidak ada koneksi internet');
    } catch (e) {
      throw Exception('Terjadi kesalahan: ${e.toString()}');
    }
  }

  /// Ambil statistik percetakan
  static Future<StatsResponse> ambilStatistik() async {
    try {
      final token = await AuthService.getAccessToken();
      if (token == null) throw Exception('Token tidak ditemukan');

      final response = await http
          .get(
            Uri.parse('$baseUrl/statistik'),
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer $token',
              'X-Platform': 'mobile',
            },
          )
          .timeout(ApiConfig.defaultTimeout);

      if (response.statusCode == 200) {
        final responseData = json.decode(response.body);
        return StatsResponse.fromJson(responseData);
      } else {
        throw Exception('HTTP Error ${response.statusCode}: ${response.body}');
      }
    } on SocketException {
      throw Exception('Tidak ada koneksi internet');
    } catch (e) {
      throw Exception('Terjadi kesalahan: ${e.toString()}');
    }
  }

  /// Konfirmasi atau tolak pesanan oleh percetakan
  /// PUT /api/percetakan/:id/konfirmasi
  static Future<KonfirmasiPesananResponse> konfirmasiPesanan({
    required String idPesanan,
    required bool diterima,
    DateTime? estimasiSelesai,
    String? alasanPenolakan,
    String? catatan,
  }) async {
    try {
      final token = await AuthService.getAccessToken();
      if (token == null) {
        return KonfirmasiPesananResponse(
          sukses: false,
          pesan: 'Token tidak ditemukan',
        );
      }

      final Map<String, dynamic> requestData = {'diterima': diterima};

      if (diterima && estimasiSelesai != null) {
        requestData['estimasiSelesai'] = estimasiSelesai.toIso8601String();
      }

      if (!diterima && alasanPenolakan != null) {
        requestData['alasanPenolakan'] = alasanPenolakan;
      }

      if (catatan != null && catatan.isNotEmpty) {
        requestData['catatan'] = catatan;
      }

      final response = await http
          .put(
            Uri.parse(ApiConfig.percetakanKonfirmasi(idPesanan)),
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer $token',
              'X-Platform': 'mobile',
            },
            body: json.encode(requestData),
          )
          .timeout(ApiConfig.defaultTimeout);

      final responseData = json.decode(response.body);

      if (response.statusCode == 200) {
        return KonfirmasiPesananResponse.fromJson(responseData);
      } else {
        return KonfirmasiPesananResponse(
          sukses: false,
          pesan: responseData['pesan'] ?? 'Gagal konfirmasi pesanan',
        );
      }
    } on SocketException {
      return KonfirmasiPesananResponse(
        sukses: false,
        pesan: 'Tidak ada koneksi internet',
      );
    } catch (e) {
      return KonfirmasiPesananResponse(
        sukses: false,
        pesan: 'Terjadi kesalahan: ${e.toString()}',
      );
    }
  }

  /// Batalkan pesanan (hanya untuk status tertunda)
  /// PUT /api/percetakan/:id/batal
  static Future<BatalPesananPercetakanResponse> batalkanPesanan({
    required String idPesanan,
    String? alasan,
  }) async {
    try {
      final token = await AuthService.getAccessToken();
      if (token == null) {
        return BatalPesananPercetakanResponse(
          sukses: false,
          pesan: 'Token tidak ditemukan',
        );
      }

      final Map<String, dynamic> requestData = {};

      if (alasan != null && alasan.isNotEmpty) {
        requestData['alasan'] = alasan;
      }

      final response = await http
          .put(
            Uri.parse(ApiConfig.percetakanBatal(idPesanan)),
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer $token',
              'X-Platform': 'mobile',
            },
            body: json.encode(requestData),
          )
          .timeout(ApiConfig.defaultTimeout);

      final responseData = json.decode(response.body);

      if (response.statusCode == 200) {
        return BatalPesananPercetakanResponse.fromJson(responseData);
      } else {
        return BatalPesananPercetakanResponse(
          sukses: false,
          pesan: responseData['pesan'] ?? 'Gagal membatalkan pesanan',
        );
      }
    } on SocketException {
      return BatalPesananPercetakanResponse(
        sukses: false,
        pesan: 'Tidak ada koneksi internet',
      );
    } catch (e) {
      return BatalPesananPercetakanResponse(
        sukses: false,
        pesan: 'Terjadi kesalahan: ${e.toString()}',
      );
    }
  }

  /// Buat pengiriman untuk pesanan
  /// POST /api/percetakan/:id/pengiriman
  static Future<PengirimanResponse> buatPengiriman({
    required String idPesanan,
    required String namaEkspedisi,
    required double biayaPengiriman,
    required String alamatTujuan,
    required String namaPenerima,
    required String teleponPenerima,
    String? nomorResi,
    DateTime? estimasiTiba,
  }) async {
    try {
      final token = await AuthService.getAccessToken();
      if (token == null) {
        return PengirimanResponse(
          sukses: false,
          pesan: 'Token tidak ditemukan',
        );
      }

      final Map<String, dynamic> requestData = {
        'namaEkspedisi': namaEkspedisi,
        'biayaPengiriman': biayaPengiriman,
        'alamatTujuan': alamatTujuan,
        'namaPenerima': namaPenerima,
        'teleponPenerima': teleponPenerima,
      };

      if (nomorResi != null && nomorResi.isNotEmpty) {
        requestData['nomorResi'] = nomorResi;
      }

      if (estimasiTiba != null) {
        requestData['estimasiTiba'] = estimasiTiba.toIso8601String();
      }

      final response = await http
          .post(
            Uri.parse(ApiConfig.percetakanPengiriman(idPesanan)),
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer $token',
              'X-Platform': 'mobile',
            },
            body: json.encode(requestData),
          )
          .timeout(ApiConfig.defaultTimeout);

      final responseData = json.decode(response.body);

      if (response.statusCode == 201 || response.statusCode == 200) {
        return PengirimanResponse.fromJson(responseData);
      } else {
        return PengirimanResponse(
          sukses: false,
          pesan: responseData['pesan'] ?? 'Gagal membuat pengiriman',
        );
      }
    } on SocketException {
      return PengirimanResponse(
        sukses: false,
        pesan: 'Tidak ada koneksi internet',
      );
    } catch (e) {
      return PengirimanResponse(
        sukses: false,
        pesan: 'Terjadi kesalahan: ${e.toString()}',
      );
    }
  }

  // ====================================
  // TARIF MANAGEMENT (Percetakan Only)
  // ====================================

  /// Buat tarif percetakan baru
  /// POST /api/percetakan/tarif
  static Future<TarifResponse> buatTarif({
    required String nama,
    required String ukuranKertas,
    required String jenisKertas,
    required double hargaPerLembar,
    required double hargaJilid,
    String? deskripsi,
  }) async {
    try {
      final token = await AuthService.getAccessToken();
      if (token == null) {
        return TarifResponse(sukses: false, pesan: 'Token tidak ditemukan');
      }

      final body = {
        'nama': nama,
        'ukuranKertas': ukuranKertas,
        'jenisKertas': jenisKertas,
        'hargaPerLembar': hargaPerLembar,
        'hargaJilid': hargaJilid,
      };

      if (deskripsi != null) body['deskripsi'] = deskripsi;

      final response = await http
          .post(
            Uri.parse(ApiConfig.percetakanTarifBaru),
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer $token',
              'X-Platform': 'mobile',
            },
            body: json.encode(body),
          )
          .timeout(ApiConfig.defaultTimeout);

      final responseData = json.decode(response.body);
      return TarifResponse.fromJson(responseData);
    } catch (e) {
      return TarifResponse(
        sukses: false,
        pesan: 'Terjadi kesalahan: ${e.toString()}',
      );
    }
  }

  /// Ambil semua tarif
  /// GET /api/percetakan/tarif
  static Future<TarifListResponse> ambilSemuaTarif() async {
    try {
      final token = await AuthService.getAccessToken();

      final headers = <String, String>{
        'Content-Type': 'application/json',
        'X-Platform': 'mobile',
      };

      if (token != null) {
        headers['Authorization'] = 'Bearer $token';
      }

      final response = await http
          .get(Uri.parse(ApiConfig.percetakanTarif), headers: headers)
          .timeout(ApiConfig.defaultTimeout);

      final responseData = json.decode(response.body);
      return TarifListResponse.fromJson(responseData);
    } catch (e) {
      return TarifListResponse(
        sukses: false,
        pesan: 'Terjadi kesalahan: ${e.toString()}',
      );
    }
  }

  /// Ambil tarif by ID
  /// GET /api/percetakan/tarif/:id
  static Future<TarifResponse> ambilTarifById(String id) async {
    try {
      final token = await AuthService.getAccessToken();

      final headers = <String, String>{
        'Content-Type': 'application/json',
        'X-Platform': 'mobile',
      };

      if (token != null) {
        headers['Authorization'] = 'Bearer $token';
      }

      final response = await http
          .get(Uri.parse(ApiConfig.percetakanTarifById(id)), headers: headers)
          .timeout(ApiConfig.defaultTimeout);

      final responseData = json.decode(response.body);
      return TarifResponse.fromJson(responseData);
    } catch (e) {
      return TarifResponse(
        sukses: false,
        pesan: 'Terjadi kesalahan: ${e.toString()}',
      );
    }
  }

  /// Perbarui tarif
  /// PUT /api/percetakan/tarif/:id
  static Future<TarifResponse> perbaruiTarif({
    required String id,
    String? nama,
    String? ukuranKertas,
    String? jenisKertas,
    double? hargaPerLembar,
    double? hargaJilid,
    String? deskripsi,
    bool? aktif,
  }) async {
    try {
      final token = await AuthService.getAccessToken();
      if (token == null) {
        return TarifResponse(sukses: false, pesan: 'Token tidak ditemukan');
      }

      final body = <String, dynamic>{};
      if (nama != null) body['nama'] = nama;
      if (ukuranKertas != null) body['ukuranKertas'] = ukuranKertas;
      if (jenisKertas != null) body['jenisKertas'] = jenisKertas;
      if (hargaPerLembar != null) body['hargaPerLembar'] = hargaPerLembar;
      if (hargaJilid != null) body['hargaJilid'] = hargaJilid;
      if (deskripsi != null) body['deskripsi'] = deskripsi;
      if (aktif != null) body['aktif'] = aktif;

      final response = await http
          .put(
            Uri.parse(ApiConfig.percetakanTarifById(id)),
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer $token',
              'X-Platform': 'mobile',
            },
            body: json.encode(body),
          )
          .timeout(ApiConfig.defaultTimeout);

      final responseData = json.decode(response.body);
      return TarifResponse.fromJson(responseData);
    } catch (e) {
      return TarifResponse(
        sukses: false,
        pesan: 'Terjadi kesalahan: ${e.toString()}',
      );
    }
  }

  /// Hapus tarif
  /// DELETE /api/percetakan/tarif/:id
  static Future<DeleteTarifResponse> hapusTarif(String id) async {
    try {
      final token = await AuthService.getAccessToken();
      if (token == null) {
        return DeleteTarifResponse(
          sukses: false,
          pesan: 'Token tidak ditemukan',
        );
      }

      final response = await http
          .delete(
            Uri.parse(ApiConfig.percetakanTarifById(id)),
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer $token',
              'X-Platform': 'mobile',
            },
          )
          .timeout(ApiConfig.defaultTimeout);

      final responseData = json.decode(response.body);
      return DeleteTarifResponse.fromJson(responseData);
    } catch (e) {
      return DeleteTarifResponse(
        sukses: false,
        pesan: 'Terjadi kesalahan: ${e.toString()}',
      );
    }
  }

  // ====================================
  // PARAMETER HARGA (Percetakan Only)
  // ====================================

  /// Simpan parameter harga
  /// POST /api/percetakan/tarif/parameter
  static Future<ParameterHargaResponse> simpanParameterHarga({
    required Map<String, dynamic> parameter,
  }) async {
    try {
      final token = await AuthService.getAccessToken();
      if (token == null) {
        return ParameterHargaResponse(
          sukses: false,
          pesan: 'Token tidak ditemukan',
        );
      }

      final response = await http
          .post(
            Uri.parse(ApiConfig.percetakanParameterHarga),
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer $token',
              'X-Platform': 'mobile',
            },
            body: json.encode(parameter),
          )
          .timeout(ApiConfig.defaultTimeout);

      final responseData = json.decode(response.body);
      return ParameterHargaResponse.fromJson(responseData);
    } catch (e) {
      return ParameterHargaResponse(
        sukses: false,
        pesan: 'Terjadi kesalahan: ${e.toString()}',
      );
    }
  }

  /// Ambil parameter harga
  /// GET /api/percetakan/tarif/parameter
  static Future<ParameterHargaResponse> ambilParameterHarga() async {
    try {
      final token = await AuthService.getAccessToken();
      if (token == null) {
        return ParameterHargaResponse(
          sukses: false,
          pesan: 'Token tidak ditemukan',
        );
      }

      final response = await http
          .get(
            Uri.parse(ApiConfig.percetakanGetParameterHarga),
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer $token',
              'X-Platform': 'mobile',
            },
          )
          .timeout(ApiConfig.defaultTimeout);

      final responseData = json.decode(response.body);
      return ParameterHargaResponse.fromJson(responseData);
    } catch (e) {
      return ParameterHargaResponse(
        sukses: false,
        pesan: 'Terjadi kesalahan: ${e.toString()}',
      );
    }
  }

  // ====================================
  // KOMBINASI TARIF (Percetakan Only)
  // ====================================

  /// Buat kombinasi tarif baru
  /// POST /api/percetakan/tarif/kombinasi
  static Future<KombinasiTarifResponse> buatKombinasiTarif({
    required String nama,
    required List<String> idTarif,
    String? deskripsi,
  }) async {
    try {
      final token = await AuthService.getAccessToken();
      if (token == null) {
        return KombinasiTarifResponse(
          sukses: false,
          pesan: 'Token tidak ditemukan',
        );
      }

      final body = <String, dynamic>{'nama': nama, 'idTarif': idTarif};

      if (deskripsi != null) body['deskripsi'] = deskripsi;

      final response = await http
          .post(
            Uri.parse(ApiConfig.percetakanKombinasiTarif),
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer $token',
              'X-Platform': 'mobile',
            },
            body: json.encode(body),
          )
          .timeout(ApiConfig.defaultTimeout);

      final responseData = json.decode(response.body);
      return KombinasiTarifResponse.fromJson(responseData);
    } catch (e) {
      return KombinasiTarifResponse(
        sukses: false,
        pesan: 'Terjadi kesalahan: ${e.toString()}',
      );
    }
  }

  /// Ambil semua kombinasi tarif
  /// GET /api/percetakan/tarif/kombinasi
  static Future<KombinasiTarifListResponse> ambilSemuaKombinasiTarif() async {
    try {
      final token = await AuthService.getAccessToken();
      if (token == null) {
        return KombinasiTarifListResponse(
          sukses: false,
          pesan: 'Token tidak ditemukan',
        );
      }

      final response = await http
          .get(
            Uri.parse(ApiConfig.percetakanGetKombinasiTarif),
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer $token',
              'X-Platform': 'mobile',
            },
          )
          .timeout(ApiConfig.defaultTimeout);

      final responseData = json.decode(response.body);
      return KombinasiTarifListResponse.fromJson(responseData);
    } catch (e) {
      return KombinasiTarifListResponse(
        sukses: false,
        pesan: 'Terjadi kesalahan: ${e.toString()}',
      );
    }
  }

  /// Toggle status aktif kombinasi tarif
  /// PUT /api/percetakan/tarif/kombinasi/:id/toggle
  static Future<KombinasiTarifResponse> toggleKombinasiTarif(String id) async {
    try {
      final token = await AuthService.getAccessToken();
      if (token == null) {
        return KombinasiTarifResponse(
          sukses: false,
          pesan: 'Token tidak ditemukan',
        );
      }

      final response = await http
          .put(
            Uri.parse(ApiConfig.percetakanKombinasiToggle(id)),
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer $token',
              'X-Platform': 'mobile',
            },
          )
          .timeout(ApiConfig.defaultTimeout);

      final responseData = json.decode(response.body);
      return KombinasiTarifResponse.fromJson(responseData);
    } catch (e) {
      return KombinasiTarifResponse(
        sukses: false,
        pesan: 'Terjadi kesalahan: ${e.toString()}',
      );
    }
  }

  /// Hapus kombinasi tarif
  /// DELETE /api/percetakan/tarif/kombinasi/:id
  static Future<DeleteTarifResponse> hapusKombinasiTarif(String id) async {
    try {
      final token = await AuthService.getAccessToken();
      if (token == null) {
        return DeleteTarifResponse(
          sukses: false,
          pesan: 'Token tidak ditemukan',
        );
      }

      final response = await http
          .delete(
            Uri.parse(ApiConfig.percetakanKombinasiHapus(id)),
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer $token',
              'X-Platform': 'mobile',
            },
          )
          .timeout(ApiConfig.defaultTimeout);

      final responseData = json.decode(response.body);
      return DeleteTarifResponse.fromJson(responseData);
    } catch (e) {
      return DeleteTarifResponse(
        sukses: false,
        pesan: 'Terjadi kesalahan: ${e.toString()}',
      );
    }
  }

  // ====================================
  // KALKULASI & PESANAN BARU
  // ====================================

  /// Kalkulasi opsi harga
  /// POST /api/percetakan/kalkulasi-opsi
  static Future<KalkulasiOpsiResponse> kalkulasiOpsiHarga({
    required int jumlahHalaman,
    required int jumlahExemplar,
  }) async {
    try {
      final token = await AuthService.getAccessToken();
      if (token == null) {
        return KalkulasiOpsiResponse(
          sukses: false,
          pesan: 'Token tidak ditemukan',
        );
      }

      final response = await http
          .post(
            Uri.parse(ApiConfig.percetakanKalkulasiOpsi),
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer $token',
              'X-Platform': 'mobile',
            },
            body: json.encode({
              'jumlahHalaman': jumlahHalaman,
              'jumlahExemplar': jumlahExemplar,
            }),
          )
          .timeout(ApiConfig.defaultTimeout);

      final responseData = json.decode(response.body);
      return KalkulasiOpsiResponse.fromJson(responseData);
    } catch (e) {
      return KalkulasiOpsiResponse(
        sukses: false,
        pesan: 'Terjadi kesalahan: ${e.toString()}',
      );
    }
  }

  /// Buat pesanan baru dengan snapshot pattern
  /// POST /api/percetakan/pesanan
  static Future<PesananDetailResponse> buatPesananBaru({
    required String idNaskah,
    required int jumlahExemplar,
    required String idTarif,
    required String alamatPengiriman,
    String? catatan,
  }) async {
    try {
      final token = await AuthService.getAccessToken();
      if (token == null) throw Exception('Token tidak ditemukan');

      final body = <String, dynamic>{
        'idNaskah': idNaskah,
        'jumlahExemplar': jumlahExemplar,
        'idTarif': idTarif,
        'alamatPengiriman': alamatPengiriman,
      };

      if (catatan != null) body['catatan'] = catatan;

      final response = await http
          .post(
            Uri.parse(ApiConfig.percetakanPesananBaru),
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer $token',
              'X-Platform': 'mobile',
            },
            body: json.encode(body),
          )
          .timeout(ApiConfig.defaultTimeout);

      final responseData = json.decode(response.body);
      return PesananDetailResponse.fromJson(responseData);
    } catch (e) {
      throw Exception('Terjadi kesalahan: ${e.toString()}');
    }
  }

  /// Ambil pesanan untuk percetakan
  /// GET /api/percetakan/pesanan/untuk-percetakan
  static Future<PesananListResponse> ambilPesananUntukPercetakan({
    int halaman = 1,
    int limit = 20,
    String? status,
  }) async {
    try {
      final token = await AuthService.getAccessToken();
      if (token == null) throw Exception('Token tidak ditemukan');

      final queryParams = <String, String>{
        'halaman': halaman.toString(),
        'limit': limit.toString(),
      };

      if (status != null && status.isNotEmpty) {
        queryParams['status'] = status;
      }

      final uri = Uri.parse(
        ApiConfig.percetakanPesananUntukPercetakan,
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

      final responseData = json.decode(response.body);
      return PesananListResponse.fromJson(responseData);
    } catch (e) {
      throw Exception('Terjadi kesalahan: ${e.toString()}');
    }
  }

  /// Konfirmasi penerimaan pesanan
  /// POST /api/percetakan/:id/konfirmasi-terima
  static Future<PesananDetailResponse> konfirmasiTerimaPesanan(
    String idPesanan,
  ) async {
    try {
      final token = await AuthService.getAccessToken();
      if (token == null) throw Exception('Token tidak ditemukan');

      final response = await http
          .post(
            Uri.parse(ApiConfig.percetakanKonfirmasiTerima(idPesanan)),
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer $token',
              'X-Platform': 'mobile',
            },
          )
          .timeout(ApiConfig.defaultTimeout);

      final responseData = json.decode(response.body);
      return PesananDetailResponse.fromJson(responseData);
    } catch (e) {
      throw Exception('Terjadi kesalahan: ${e.toString()}');
    }
  }

  /// Perbarui detail pesanan
  /// PUT /api/percetakan/:id/perbarui
  static Future<PesananDetailResponse> perbaruiDetailPesanan({
    required String idPesanan,
    int? jumlahExemplar,
    String? alamatPengiriman,
    String? catatan,
  }) async {
    try {
      final token = await AuthService.getAccessToken();
      if (token == null) throw Exception('Token tidak ditemukan');

      final body = <String, dynamic>{};
      if (jumlahExemplar != null) body['jumlahExemplar'] = jumlahExemplar;
      if (alamatPengiriman != null) body['alamatPengiriman'] = alamatPengiriman;
      if (catatan != null) body['catatan'] = catatan;

      final response = await http
          .put(
            Uri.parse(ApiConfig.percetakanPerbaruiDetail(idPesanan)),
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer $token',
              'X-Platform': 'mobile',
            },
            body: json.encode(body),
          )
          .timeout(ApiConfig.defaultTimeout);

      final responseData = json.decode(response.body);
      return PesananDetailResponse.fromJson(responseData);
    } catch (e) {
      throw Exception('Terjadi kesalahan: ${e.toString()}');
    }
  }

  /// Get menu items untuk dashboard
  static List<Map<String, dynamic>> ambilMenuItems() {
    return [
      {
        'judul': 'Pesanan Baru',
        'subjudul': 'Pesanan yang belum diproses',
        'icon': 'inbox',
        'warna': 'blue',
        'route': '/percetakan/pesanan/tertunda',
        'badge': 0,
      },
      {
        'judul': 'Dalam Produksi',
        'subjudul': 'Pesanan sedang dikerjakan',
        'icon': 'print',
        'warna': 'orange',
        'route': '/percetakan/pesanan/produksi',
        'badge': 0,
      },
      {
        'judul': 'Kontrol Kualitas',
        'subjudul': 'Periksa hasil cetak',
        'icon': 'check_circle',
        'warna': 'purple',
        'route': '/percetakan/pesanan/qc',
        'badge': 0,
      },
      {
        'judul': 'Siap Kirim',
        'subjudul': 'Pesanan siap dikirim',
        'icon': 'local_shipping',
        'warna': 'green',
        'route': '/percetakan/pesanan/siap',
        'badge': 0,
      },
      {
        'judul': 'Statistik',
        'subjudul': 'Laporan dan analisis',
        'icon': 'analytics',
        'warna': 'indigo',
        'route': '/percetakan/statistik',
        'badge': 0,
      },
    ];
  }

  /// Get label status
  static Map<String, String> ambilLabelStatus() {
    return {
      'tertunda': 'Tertunda',
      'diterima': 'Diterima',
      'dalam_produksi': 'Dalam Produksi',
      'kontrol_kualitas': 'Kontrol Kualitas',
      'siap': 'Siap',
      'dikirim': 'Dikirim',
      'terkirim': 'Terkirim',
      'dibatalkan': 'Dibatalkan',
    };
  }

  /// Get warna status
  static Map<String, String> ambilWarnaStatus() {
    return {
      'tertunda': 'grey',
      'diterima': 'blue',
      'dalam_produksi': 'orange',
      'kontrol_kualitas': 'purple',
      'siap': 'green',
      'dikirim': 'teal',
      'terkirim': 'green',
      'dibatalkan': 'red',
    };
  }

  /// Format harga ke Rupiah
  static String formatHarga(String harga) {
    try {
      final double nilai = double.parse(harga);
      return 'Rp ${nilai.toStringAsFixed(0).replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (Match m) => '${m[1]}.')}';
    } catch (e) {
      return 'Rp 0';
    }
  }

  /// Format tanggal ke format Indonesia
  static String formatTanggal(DateTime tanggal) {
    final Map<int, String> bulan = {
      1: 'Januari',
      2: 'Februari',
      3: 'Maret',
      4: 'April',
      5: 'Mei',
      6: 'Juni',
      7: 'Juli',
      8: 'Agustus',
      9: 'September',
      10: 'Oktober',
      11: 'November',
      12: 'Desember',
    };

    return '${tanggal.day} ${bulan[tanggal.month]} ${tanggal.year}';
  }

  /// Format tanggal dengan waktu
  static String formatTanggalWaktu(DateTime tanggal) {
    final String tgl = formatTanggal(tanggal);
    final String jam =
        '${tanggal.hour.toString().padLeft(2, '0')}:${tanggal.minute.toString().padLeft(2, '0')}';
    return '$tgl pukul $jam';
  }
}
