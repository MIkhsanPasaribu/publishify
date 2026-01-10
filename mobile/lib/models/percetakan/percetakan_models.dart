/// Models untuk module Percetakan (sesuai backend DTO & Prisma)
/// Menggunakan data dari DTO pengguna + DTO percetakan
library;

/// Model utama untuk Pesanan Cetak
class PesananCetak {
  final String id;
  final String idNaskah;
  final String idPemesan;
  final String? idPercetakan;
  final String nomorPesanan;
  final int jumlah;
  final String formatKertas; // A4, A5, B5, Letter, Custom
  final String jenisKertas; // HVS 70gr, HVS 80gr, Art Paper, dll
  final String jenisCover; // Soft Cover, Hard Cover, Board Cover
  final List<String> finishingTambahan; // Laminasi, Emboss, dll
  final String? catatan;
  final String hargaTotal; // Decimal dari backend
  final String status; // tertunda, diterima, dalam_produksi, dll
  final DateTime tanggalPesan;
  final DateTime? estimasiSelesai;
  final DateTime? tanggalSelesai;
  final DateTime diperbaruiPada;

  // Relasi (include dari backend)
  final NaskahInfo? naskah;
  final PemesanInfo? pemesan;
  final PembayaranInfo? pembayaran;
  final PengirimanInfo? pengiriman;

  const PesananCetak({
    required this.id,
    required this.idNaskah,
    required this.idPemesan,
    this.idPercetakan,
    required this.nomorPesanan,
    required this.jumlah,
    required this.formatKertas,
    required this.jenisKertas,
    required this.jenisCover,
    this.finishingTambahan = const [],
    this.catatan,
    required this.hargaTotal,
    required this.status,
    required this.tanggalPesan,
    this.estimasiSelesai,
    this.tanggalSelesai,
    required this.diperbaruiPada,
    this.naskah,
    this.pemesan,
    this.pembayaran,
    this.pengiriman,
  });

  factory PesananCetak.fromJson(Map<String, dynamic> json) {
    return PesananCetak(
      id: json['id'] as String,
      idNaskah: json['idNaskah'] as String,
      idPemesan: json['idPemesan'] as String,
      idPercetakan: json['idPercetakan'] as String?,
      nomorPesanan: json['nomorPesanan'] as String,
      jumlah: json['jumlah'] as int,
      formatKertas: json['formatKertas'] as String,
      jenisKertas: json['jenisKertas'] as String,
      jenisCover: json['jenisCover'] as String,
      finishingTambahan:
          (json['finishingTambahan'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          [],
      catatan: json['catatan'] as String?,
      hargaTotal: json['hargaTotal'].toString(),
      status: json['status'] as String,
      tanggalPesan: DateTime.parse(json['tanggalPesan'] as String),
      estimasiSelesai: json['estimasiSelesai'] != null
          ? DateTime.parse(json['estimasiSelesai'] as String)
          : null,
      tanggalSelesai: json['tanggalSelesai'] != null
          ? DateTime.parse(json['tanggalSelesai'] as String)
          : null,
      diperbaruiPada: DateTime.parse(json['diperbaruiPada'] as String),
      naskah: json['naskah'] != null
          ? NaskahInfo.fromJson(json['naskah'] as Map<String, dynamic>)
          : null,
      pemesan: json['pemesan'] != null
          ? PemesanInfo.fromJson(json['pemesan'] as Map<String, dynamic>)
          : null,
      pembayaran: json['pembayaran'] != null
          ? PembayaranInfo.fromJson(json['pembayaran'] as Map<String, dynamic>)
          : null,
      pengiriman: json['pengiriman'] != null
          ? PengirimanInfo.fromJson(json['pengiriman'] as Map<String, dynamic>)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'idNaskah': idNaskah,
      'idPemesan': idPemesan,
      'idPercetakan': idPercetakan,
      'nomorPesanan': nomorPesanan,
      'jumlah': jumlah,
      'formatKertas': formatKertas,
      'jenisKertas': jenisKertas,
      'jenisCover': jenisCover,
      'finishingTambahan': finishingTambahan,
      'catatan': catatan,
      'hargaTotal': hargaTotal,
      'status': status,
      'tanggalPesan': tanggalPesan.toIso8601String(),
      'estimasiSelesai': estimasiSelesai?.toIso8601String(),
      'tanggalSelesai': tanggalSelesai?.toIso8601String(),
      'diperbaruiPada': diperbaruiPada.toIso8601String(),
      if (naskah != null) 'naskah': naskah!.toJson(),
      if (pemesan != null) 'pemesan': pemesan!.toJson(),
      if (pembayaran != null) 'pembayaran': pembayaran!.toJson(),
      if (pengiriman != null) 'pengiriman': pengiriman!.toJson(),
    };
  }
}

/// Model untuk informasi naskah dalam pesanan
class NaskahInfo {
  final String id;
  final String judul;
  final int? jumlahHalaman;

  const NaskahInfo({required this.id, required this.judul, this.jumlahHalaman});

  factory NaskahInfo.fromJson(Map<String, dynamic> json) {
    return NaskahInfo(
      id: json['id'] as String,
      judul: json['judul'] as String,
      jumlahHalaman: json['jumlahHalaman'] as int?,
    );
  }

  Map<String, dynamic> toJson() {
    return {'id': id, 'judul': judul, 'jumlahHalaman': jumlahHalaman};
  }
}

/// Model untuk informasi pemesan (penulis)
class PemesanInfo {
  final String id;
  final String email;
  final ProfilPenggunaInfo? profilPengguna;

  const PemesanInfo({
    required this.id,
    required this.email,
    this.profilPengguna,
  });

  factory PemesanInfo.fromJson(Map<String, dynamic> json) {
    return PemesanInfo(
      id: json['id'] as String,
      email: json['email'] as String,
      profilPengguna: json['profilPengguna'] != null
          ? ProfilPenggunaInfo.fromJson(
              json['profilPengguna'] as Map<String, dynamic>,
            )
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      if (profilPengguna != null) 'profilPengguna': profilPengguna!.toJson(),
    };
  }
}

/// Model untuk profil pengguna
class ProfilPenggunaInfo {
  final String? namaDepan;
  final String? namaBelakang;

  const ProfilPenggunaInfo({this.namaDepan, this.namaBelakang});

  factory ProfilPenggunaInfo.fromJson(Map<String, dynamic> json) {
    return ProfilPenggunaInfo(
      namaDepan: json['namaDepan'] as String?,
      namaBelakang: json['namaBelakang'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {'namaDepan': namaDepan, 'namaBelakang': namaBelakang};
  }

  String get namaLengkap {
    if (namaDepan == null && namaBelakang == null) return 'User';
    return '${namaDepan ?? ''} ${namaBelakang ?? ''}'.trim();
  }
}

/// Model untuk informasi pembayaran
class PembayaranInfo {
  final String id;
  final String idPesanan;
  final String metodePembayaran;
  final String status;
  final DateTime? tanggalBayar;

  const PembayaranInfo({
    required this.id,
    required this.idPesanan,
    required this.metodePembayaran,
    required this.status,
    this.tanggalBayar,
  });

  factory PembayaranInfo.fromJson(Map<String, dynamic> json) {
    return PembayaranInfo(
      id: json['id'] as String,
      idPesanan: json['idPesanan'] as String,
      metodePembayaran: json['metodePembayaran'] as String,
      status: json['status'] as String,
      tanggalBayar: json['tanggalBayar'] != null
          ? DateTime.parse(json['tanggalBayar'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'idPesanan': idPesanan,
      'metodePembayaran': metodePembayaran,
      'status': status,
      'tanggalBayar': tanggalBayar?.toIso8601String(),
    };
  }
}

/// Model untuk informasi pengiriman
class PengirimanInfo {
  final String id;
  final String idPesanan;
  final String namaEkspedisi;
  final String? nomorResi;
  final String status;
  final DateTime? tanggalKirim;
  final DateTime? estimasiTiba;

  const PengirimanInfo({
    required this.id,
    required this.idPesanan,
    required this.namaEkspedisi,
    this.nomorResi,
    required this.status,
    this.tanggalKirim,
    this.estimasiTiba,
  });

  factory PengirimanInfo.fromJson(Map<String, dynamic> json) {
    return PengirimanInfo(
      id: json['id'] as String,
      idPesanan: json['idPesanan'] as String,
      namaEkspedisi: json['namaEkspedisi'] as String,
      nomorResi: json['nomorResi'] as String?,
      status: json['status'] as String,
      tanggalKirim: json['tanggalKirim'] != null
          ? DateTime.parse(json['tanggalKirim'] as String)
          : null,
      estimasiTiba: json['estimasiTiba'] != null
          ? DateTime.parse(json['estimasiTiba'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'idPesanan': idPesanan,
      'namaEkspedisi': namaEkspedisi,
      'nomorResi': nomorResi,
      'status': status,
      'tanggalKirim': tanggalKirim?.toIso8601String(),
      'estimasiTiba': estimasiTiba?.toIso8601String(),
    };
  }
}

/// Model untuk statistik percetakan
class PercetakanStats {
  final int totalPesanan;
  final int pesananAktif;
  final int pesananSelesai;
  final String totalRevenue;
  final StatusBreakdown statusBreakdown;

  const PercetakanStats({
    required this.totalPesanan,
    required this.pesananAktif,
    required this.pesananSelesai,
    required this.totalRevenue,
    required this.statusBreakdown,
  });

  factory PercetakanStats.fromJson(Map<String, dynamic> json) {
    return PercetakanStats(
      totalPesanan: json['totalPesanan'] as int,
      pesananAktif: json['pesananAktif'] as int,
      pesananSelesai: json['pesananSelesai'] as int,
      totalRevenue: json['totalRevenue'].toString(),
      statusBreakdown: StatusBreakdown.fromJson(
        json['statusBreakdown'] as Map<String, dynamic>,
      ),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'totalPesanan': totalPesanan,
      'pesananAktif': pesananAktif,
      'pesananSelesai': pesananSelesai,
      'totalRevenue': totalRevenue,
      'statusBreakdown': statusBreakdown.toJson(),
    };
  }
}

/// Model untuk breakdown status pesanan
class StatusBreakdown {
  final int tertunda;
  final int diterima;
  final int dalamProduksi;
  final int kontrolKualitas;
  final int siap;
  final int dikirim;
  final int terkirim;
  final int dibatalkan;

  const StatusBreakdown({
    required this.tertunda,
    required this.diterima,
    required this.dalamProduksi,
    required this.kontrolKualitas,
    required this.siap,
    required this.dikirim,
    required this.terkirim,
    required this.dibatalkan,
  });

  factory StatusBreakdown.fromJson(Map<String, dynamic> json) {
    return StatusBreakdown(
      tertunda: json['tertunda'] as int,
      diterima: json['diterima'] as int,
      dalamProduksi: json['dalam_produksi'] as int,
      kontrolKualitas: json['kontrol_kualitas'] as int,
      siap: json['siap'] as int,
      dikirim: json['dikirim'] as int,
      terkirim: json['terkirim'] as int,
      dibatalkan: json['dibatalkan'] as int,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'tertunda': tertunda,
      'diterima': diterima,
      'dalam_produksi': dalamProduksi,
      'kontrol_kualitas': kontrolKualitas,
      'siap': siap,
      'dikirim': dikirim,
      'terkirim': terkirim,
      'dibatalkan': dibatalkan,
    };
  }
}

/// API Response untuk list pesanan
class PesananListResponse {
  final bool sukses;
  final String pesan;
  final List<PesananCetak>? data;
  final PaginationMeta? metadata;

  const PesananListResponse({
    required this.sukses,
    required this.pesan,
    this.data,
    this.metadata,
  });

  factory PesananListResponse.fromJson(Map<String, dynamic> json) {
    return PesananListResponse(
      sukses: json['sukses'] as bool,
      pesan: json['pesan'] as String,
      data: json['data'] != null
          ? (json['data'] as List<dynamic>)
                .map((e) => PesananCetak.fromJson(e as Map<String, dynamic>))
                .toList()
          : null,
      metadata: json['metadata'] != null
          ? PaginationMeta.fromJson(json['metadata'] as Map<String, dynamic>)
          : null,
    );
  }
}

/// API Response untuk single pesanan
class PesananDetailResponse {
  final bool sukses;
  final String pesan;
  final PesananCetak? data;

  const PesananDetailResponse({
    required this.sukses,
    required this.pesan,
    this.data,
  });

  factory PesananDetailResponse.fromJson(Map<String, dynamic> json) {
    return PesananDetailResponse(
      sukses: json['sukses'] as bool,
      pesan: json['pesan'] as String,
      data: json['data'] != null
          ? PesananCetak.fromJson(json['data'] as Map<String, dynamic>)
          : null,
    );
  }
}

/// API Response untuk statistik
class StatsResponse {
  final bool sukses;
  final String pesan;
  final PercetakanStats? data;

  const StatsResponse({required this.sukses, required this.pesan, this.data});

  factory StatsResponse.fromJson(Map<String, dynamic> json) {
    return StatsResponse(
      sukses: json['sukses'] as bool,
      pesan: json['pesan'] as String,
      data: json['data'] != null
          ? PercetakanStats.fromJson(json['data'] as Map<String, dynamic>)
          : null,
    );
  }
}

/// Model untuk pagination metadata
class PaginationMeta {
  final int total;
  final int halaman;
  final int limit;
  final int totalHalaman;

  const PaginationMeta({
    required this.total,
    required this.halaman,
    required this.limit,
    required this.totalHalaman,
  });

  factory PaginationMeta.fromJson(Map<String, dynamic> json) {
    return PaginationMeta(
      total: json['total'] as int,
      halaman: json['halaman'] as int,
      limit: json['limit'] as int,
      totalHalaman: json['totalHalaman'] as int,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'total': total,
      'halaman': halaman,
      'limit': limit,
      'totalHalaman': totalHalaman,
    };
  }
}

/// API Response untuk buat pengiriman
class PengirimanResponse {
  final bool sukses;
  final String pesan;
  final PengirimanData? data;

  const PengirimanResponse({
    required this.sukses,
    required this.pesan,
    this.data,
  });

  factory PengirimanResponse.fromJson(Map<String, dynamic> json) {
    return PengirimanResponse(
      sukses: json['sukses'] as bool? ?? false,
      pesan: json['pesan'] as String? ?? '',
      data: json['data'] != null
          ? PengirimanData.fromJson(json['data'] as Map<String, dynamic>)
          : null,
    );
  }
}

/// Data pengiriman yang dibuat
class PengirimanData {
  final String id;
  final String idPesanan;
  final String namaEkspedisi;
  final String? nomorResi;
  final String biayaPengiriman;
  final String alamatTujuan;
  final String namaPenerima;
  final String teleponPenerima;
  final String status;
  final DateTime? estimasiTiba;
  final DateTime? tanggalKirim;
  final DateTime? tanggalTerima;
  final DateTime dibuatPada;

  const PengirimanData({
    required this.id,
    required this.idPesanan,
    required this.namaEkspedisi,
    this.nomorResi,
    required this.biayaPengiriman,
    required this.alamatTujuan,
    required this.namaPenerima,
    required this.teleponPenerima,
    required this.status,
    this.estimasiTiba,
    this.tanggalKirim,
    this.tanggalTerima,
    required this.dibuatPada,
  });

  factory PengirimanData.fromJson(Map<String, dynamic> json) {
    return PengirimanData(
      id: json['id'] as String,
      idPesanan: json['idPesanan'] as String,
      namaEkspedisi: json['namaEkspedisi'] as String,
      nomorResi: json['nomorResi'] as String?,
      biayaPengiriman: json['biayaPengiriman']?.toString() ?? '0',
      alamatTujuan: json['alamatTujuan'] as String,
      namaPenerima: json['namaPenerima'] as String,
      teleponPenerima: json['teleponPenerima'] as String,
      status: json['status'] as String,
      estimasiTiba: json['estimasiTiba'] != null
          ? DateTime.parse(json['estimasiTiba'] as String)
          : null,
      tanggalKirim: json['tanggalKirim'] != null
          ? DateTime.parse(json['tanggalKirim'] as String)
          : null,
      tanggalTerima: json['tanggalTerima'] != null
          ? DateTime.parse(json['tanggalTerima'] as String)
          : null,
      dibuatPada: DateTime.parse(json['dibuatPada'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'idPesanan': idPesanan,
      'namaEkspedisi': namaEkspedisi,
      'nomorResi': nomorResi,
      'biayaPengiriman': biayaPengiriman,
      'alamatTujuan': alamatTujuan,
      'namaPenerima': namaPenerima,
      'teleponPenerima': teleponPenerima,
      'status': status,
      'estimasiTiba': estimasiTiba?.toIso8601String(),
      'tanggalKirim': tanggalKirim?.toIso8601String(),
      'tanggalTerima': tanggalTerima?.toIso8601String(),
      'dibuatPada': dibuatPada.toIso8601String(),
    };
  }
}

// ====================================
// TARIF MODELS
// ====================================

/// Data tarif percetakan
class TarifData {
  final String id;
  final String nama;
  final String ukuranKertas;
  final String jenisKertas;
  final double hargaPerLembar;
  final double hargaJilid;
  final String? deskripsi;
  final bool aktif;
  final DateTime dibuatPada;
  final DateTime diperbaruiPada;

  const TarifData({
    required this.id,
    required this.nama,
    required this.ukuranKertas,
    required this.jenisKertas,
    required this.hargaPerLembar,
    required this.hargaJilid,
    this.deskripsi,
    required this.aktif,
    required this.dibuatPada,
    required this.diperbaruiPada,
  });

  factory TarifData.fromJson(Map<String, dynamic> json) {
    return TarifData(
      id: json['id'] as String,
      nama: json['nama'] as String,
      ukuranKertas: json['ukuranKertas'] as String,
      jenisKertas: json['jenisKertas'] as String,
      hargaPerLembar: (json['hargaPerLembar'] as num).toDouble(),
      hargaJilid: (json['hargaJilid'] as num).toDouble(),
      deskripsi: json['deskripsi'] as String?,
      aktif: json['aktif'] as bool? ?? true,
      dibuatPada: DateTime.parse(json['dibuatPada'] as String),
      diperbaruiPada: DateTime.parse(json['diperbaruiPada'] as String),
    );
  }
}

/// Response untuk single tarif
class TarifResponse {
  final bool sukses;
  final String pesan;
  final TarifData? data;

  TarifResponse({required this.sukses, this.pesan = '', this.data});

  factory TarifResponse.fromJson(Map<String, dynamic> json) {
    return TarifResponse(
      sukses: json['sukses'] ?? false,
      pesan: json['pesan'] ?? '',
      data: json['data'] != null ? TarifData.fromJson(json['data']) : null,
    );
  }
}

/// Response untuk list tarif
class TarifListResponse {
  final bool sukses;
  final String pesan;
  final List<TarifData>? data;

  TarifListResponse({required this.sukses, this.pesan = '', this.data});

  factory TarifListResponse.fromJson(Map<String, dynamic> json) {
    return TarifListResponse(
      sukses: json['sukses'] ?? false,
      pesan: json['pesan'] ?? '',
      data: json['data'] != null
          ? (json['data'] as List).map((e) => TarifData.fromJson(e)).toList()
          : null,
    );
  }
}

/// Response untuk delete tarif
class DeleteTarifResponse {
  final bool sukses;
  final String pesan;

  DeleteTarifResponse({required this.sukses, this.pesan = ''});

  factory DeleteTarifResponse.fromJson(Map<String, dynamic> json) {
    return DeleteTarifResponse(
      sukses: json['sukses'] ?? false,
      pesan: json['pesan'] ?? '',
    );
  }
}

// ====================================
// PARAMETER HARGA MODELS
// ====================================

/// Response untuk parameter harga
class ParameterHargaResponse {
  final bool sukses;
  final String pesan;
  final Map<String, dynamic>? data;

  ParameterHargaResponse({required this.sukses, this.pesan = '', this.data});

  factory ParameterHargaResponse.fromJson(Map<String, dynamic> json) {
    return ParameterHargaResponse(
      sukses: json['sukses'] ?? false,
      pesan: json['pesan'] ?? '',
      data: json['data'] as Map<String, dynamic>?,
    );
  }
}

// ====================================
// KOMBINASI TARIF MODELS
// ====================================

/// Data kombinasi tarif
class KombinasiTarifData {
  final String id;
  final String nama;
  final String? deskripsi;
  final List<String> idTarif;
  final bool aktif;
  final DateTime dibuatPada;
  final DateTime diperbaruiPada;
  final List<TarifData>? tarif;

  const KombinasiTarifData({
    required this.id,
    required this.nama,
    this.deskripsi,
    required this.idTarif,
    required this.aktif,
    required this.dibuatPada,
    required this.diperbaruiPada,
    this.tarif,
  });

  factory KombinasiTarifData.fromJson(Map<String, dynamic> json) {
    return KombinasiTarifData(
      id: json['id'] as String,
      nama: json['nama'] as String,
      deskripsi: json['deskripsi'] as String?,
      idTarif:
          (json['idTarif'] as List?)?.map((e) => e.toString()).toList() ?? [],
      aktif: json['aktif'] as bool? ?? true,
      dibuatPada: DateTime.parse(json['dibuatPada'] as String),
      diperbaruiPada: DateTime.parse(json['diperbaruiPada'] as String),
      tarif: json['tarif'] != null
          ? (json['tarif'] as List).map((e) => TarifData.fromJson(e)).toList()
          : null,
    );
  }
}

/// Response untuk single kombinasi tarif
class KombinasiTarifResponse {
  final bool sukses;
  final String pesan;
  final KombinasiTarifData? data;

  KombinasiTarifResponse({required this.sukses, this.pesan = '', this.data});

  factory KombinasiTarifResponse.fromJson(Map<String, dynamic> json) {
    return KombinasiTarifResponse(
      sukses: json['sukses'] ?? false,
      pesan: json['pesan'] ?? '',
      data: json['data'] != null
          ? KombinasiTarifData.fromJson(json['data'])
          : null,
    );
  }
}

/// Response untuk list kombinasi tarif
class KombinasiTarifListResponse {
  final bool sukses;
  final String pesan;
  final List<KombinasiTarifData>? data;

  KombinasiTarifListResponse({
    required this.sukses,
    this.pesan = '',
    this.data,
  });

  factory KombinasiTarifListResponse.fromJson(Map<String, dynamic> json) {
    return KombinasiTarifListResponse(
      sukses: json['sukses'] ?? false,
      pesan: json['pesan'] ?? '',
      data: json['data'] != null
          ? (json['data'] as List)
                .map((e) => KombinasiTarifData.fromJson(e))
                .toList()
          : null,
    );
  }
}

// ====================================
// KALKULASI OPSI MODELS
// ====================================

/// Opsi harga hasil kalkulasi
class OpsiHarga {
  final String idTarif;
  final String namaTarif;
  final String ukuranKertas;
  final String jenisKertas;
  final double hargaSatuan;
  final double hargaTotal;
  final double hargaPerLembar;
  final double hargaJilid;

  const OpsiHarga({
    required this.idTarif,
    required this.namaTarif,
    required this.ukuranKertas,
    required this.jenisKertas,
    required this.hargaSatuan,
    required this.hargaTotal,
    required this.hargaPerLembar,
    required this.hargaJilid,
  });

  factory OpsiHarga.fromJson(Map<String, dynamic> json) {
    return OpsiHarga(
      idTarif: json['idTarif'] as String,
      namaTarif: json['namaTarif'] as String,
      ukuranKertas: json['ukuranKertas'] as String,
      jenisKertas: json['jenisKertas'] as String,
      hargaSatuan: (json['hargaSatuan'] as num).toDouble(),
      hargaTotal: (json['hargaTotal'] as num).toDouble(),
      hargaPerLembar: (json['hargaPerLembar'] as num).toDouble(),
      hargaJilid: (json['hargaJilid'] as num).toDouble(),
    );
  }
}

/// Response untuk kalkulasi opsi harga
class KalkulasiOpsiResponse {
  final bool sukses;
  final String pesan;
  final List<OpsiHarga>? data;

  KalkulasiOpsiResponse({required this.sukses, this.pesan = '', this.data});

  factory KalkulasiOpsiResponse.fromJson(Map<String, dynamic> json) {
    return KalkulasiOpsiResponse(
      sukses: json['sukses'] ?? false,
      pesan: json['pesan'] ?? '',
      data: json['data'] != null
          ? (json['data'] as List).map((e) => OpsiHarga.fromJson(e)).toList()
          : null,
    );
  }
}

/// Response untuk konfirmasi/tolak pesanan oleh percetakan
class KonfirmasiPesananResponse {
  final bool sukses;
  final String pesan;
  final PesananCetak? data;

  const KonfirmasiPesananResponse({
    required this.sukses,
    required this.pesan,
    this.data,
  });

  factory KonfirmasiPesananResponse.fromJson(Map<String, dynamic> json) {
    return KonfirmasiPesananResponse(
      sukses: json['sukses'] as bool? ?? false,
      pesan: json['pesan'] as String? ?? '',
      data: json['data'] != null
          ? PesananCetak.fromJson(json['data'] as Map<String, dynamic>)
          : null,
    );
  }
}

/// Response untuk batalkan pesanan oleh percetakan
class BatalPesananPercetakanResponse {
  final bool sukses;
  final String pesan;
  final PesananCetak? data;

  const BatalPesananPercetakanResponse({
    required this.sukses,
    required this.pesan,
    this.data,
  });

  factory BatalPesananPercetakanResponse.fromJson(Map<String, dynamic> json) {
    return BatalPesananPercetakanResponse(
      sukses: json['sukses'] as bool? ?? false,
      pesan: json['pesan'] as String? ?? '',
      data: json['data'] != null
          ? PesananCetak.fromJson(json['data'] as Map<String, dynamic>)
          : null,
    );
  }
}
