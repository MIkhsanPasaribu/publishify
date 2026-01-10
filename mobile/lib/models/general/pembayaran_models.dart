/// Model untuk response daftar pembayaran
class PembayaranListResponse {
  final bool sukses;
  final String pesan;
  final List<PembayaranData>? data;
  final PembayaranMetadata? metadata;

  PembayaranListResponse({
    required this.sukses,
    this.pesan = '',
    this.data,
    this.metadata,
  });

  factory PembayaranListResponse.fromJson(Map<String, dynamic> json) {
    return PembayaranListResponse(
      sukses: json['sukses'] ?? false,
      pesan: json['pesan'] ?? '',
      data: json['data'] != null
          ? (json['data'] as List)
                .map((item) => PembayaranData.fromJson(item))
                .toList()
          : null,
      metadata: json['metadata'] != null
          ? PembayaranMetadata.fromJson(json['metadata'])
          : null,
    );
  }
}

/// Model untuk detail pembayaran
class PembayaranDetailResponse {
  final bool sukses;
  final String pesan;
  final PembayaranData? data;

  PembayaranDetailResponse({required this.sukses, this.pesan = '', this.data});

  factory PembayaranDetailResponse.fromJson(Map<String, dynamic> json) {
    return PembayaranDetailResponse(
      sukses: json['sukses'] ?? false,
      pesan: json['pesan'] ?? '',
      data: json['data'] != null ? PembayaranData.fromJson(json['data']) : null,
    );
  }
}

/// Model data pembayaran
class PembayaranData {
  final String id;
  final String idPesanan;
  final String idPengguna;
  final String nomorTransaksi;
  final double jumlah;
  final String metodePembayaran;
  final String status;
  final String? urlBukti;
  final String? catatanPembayaran;
  final String? catatanAdmin;
  final String? tanggalKonfirmasi;
  final String? dikonfirmasiOleh;
  final String? tanggalKadaluarsa;
  final String dibuatPada;
  final String diperbaruiPada;
  final PembayaranPengguna? pengguna;
  final PembayaranPesanan? pesanan;

  PembayaranData({
    required this.id,
    required this.idPesanan,
    required this.idPengguna,
    required this.nomorTransaksi,
    required this.jumlah,
    required this.metodePembayaran,
    required this.status,
    this.urlBukti,
    this.catatanPembayaran,
    this.catatanAdmin,
    this.tanggalKonfirmasi,
    this.dikonfirmasiOleh,
    this.tanggalKadaluarsa,
    required this.dibuatPada,
    required this.diperbaruiPada,
    this.pengguna,
    this.pesanan,
  });

  factory PembayaranData.fromJson(Map<String, dynamic> json) {
    return PembayaranData(
      id: json['id'] ?? '',
      idPesanan: json['idPesanan'] ?? '',
      idPengguna: json['idPengguna'] ?? '',
      nomorTransaksi: json['nomorTransaksi'] ?? '',
      jumlah: (json['jumlah'] ?? 0).toDouble(),
      metodePembayaran: json['metodePembayaran'] ?? '',
      status: json['status'] ?? 'tertunda',
      urlBukti: json['urlBukti'],
      catatanPembayaran: json['catatanPembayaran'],
      catatanAdmin: json['catatanAdmin'],
      tanggalKonfirmasi: json['tanggalKonfirmasi'],
      dikonfirmasiOleh: json['dikonfirmasiOleh'],
      tanggalKadaluarsa: json['tanggalKadaluarsa'],
      dibuatPada: json['dibuatPada'] ?? '',
      diperbaruiPada: json['diperbaruiPada'] ?? '',
      pengguna: json['pengguna'] != null
          ? PembayaranPengguna.fromJson(json['pengguna'])
          : null,
      pesanan: json['pesanan'] != null
          ? PembayaranPesanan.fromJson(json['pesanan'])
          : null,
    );
  }

  /// Get label status dalam bahasa Indonesia
  String get statusLabel {
    const labels = {
      'tertunda': 'Menunggu Pembayaran',
      'diproses': 'Sedang Diproses',
      'berhasil': 'Berhasil',
      'gagal': 'Gagal',
      'dibatalkan': 'Dibatalkan',
      'dikembalikan': 'Dikembalikan',
    };
    return labels[status] ?? status;
  }

  /// Get label metode pembayaran
  String get metodePembayaranLabel {
    const labels = {
      'transfer_bank': 'Transfer Bank',
      'kartu_kredit': 'Kartu Kredit',
      'e_wallet': 'E-Wallet',
      'virtual_account': 'Virtual Account',
      'cod': 'Bayar di Tempat (COD)',
    };
    return labels[metodePembayaran] ?? metodePembayaran;
  }
}

/// Model pengguna pada pembayaran
class PembayaranPengguna {
  final String id;
  final String email;
  final PembayaranProfilPengguna? profilPengguna;

  PembayaranPengguna({
    required this.id,
    required this.email,
    this.profilPengguna,
  });

  factory PembayaranPengguna.fromJson(Map<String, dynamic> json) {
    return PembayaranPengguna(
      id: json['id'] ?? '',
      email: json['email'] ?? '',
      profilPengguna: json['profilPengguna'] != null
          ? PembayaranProfilPengguna.fromJson(json['profilPengguna'])
          : null,
    );
  }

  String get namaLengkap {
    if (profilPengguna != null) {
      final depan = profilPengguna!.namaDepan;
      final belakang = profilPengguna!.namaBelakang;
      if (depan.isNotEmpty || belakang.isNotEmpty) {
        return '$depan $belakang'.trim();
      }
    }
    return email;
  }
}

class PembayaranProfilPengguna {
  final String namaDepan;
  final String namaBelakang;

  PembayaranProfilPengguna({
    required this.namaDepan,
    required this.namaBelakang,
  });

  factory PembayaranProfilPengguna.fromJson(Map<String, dynamic> json) {
    return PembayaranProfilPengguna(
      namaDepan: json['namaDepan'] ?? '',
      namaBelakang: json['namaBelakang'] ?? '',
    );
  }
}

/// Model pesanan pada pembayaran
class PembayaranPesanan {
  final String id;
  final String nomorPesanan;
  final int jumlahCetak;
  final double totalHarga;
  final String status;
  final PembayaranNaskah? naskah;

  PembayaranPesanan({
    required this.id,
    required this.nomorPesanan,
    required this.jumlahCetak,
    required this.totalHarga,
    required this.status,
    this.naskah,
  });

  factory PembayaranPesanan.fromJson(Map<String, dynamic> json) {
    return PembayaranPesanan(
      id: json['id'] ?? '',
      nomorPesanan: json['nomorPesanan'] ?? '',
      jumlahCetak: json['jumlahCetak'] ?? 0,
      totalHarga: (json['totalHarga'] ?? 0).toDouble(),
      status: json['status'] ?? '',
      naskah: json['naskah'] != null
          ? PembayaranNaskah.fromJson(json['naskah'])
          : null,
    );
  }
}

class PembayaranNaskah {
  final String id;
  final String judul;

  PembayaranNaskah({required this.id, required this.judul});

  factory PembayaranNaskah.fromJson(Map<String, dynamic> json) {
    return PembayaranNaskah(id: json['id'] ?? '', judul: json['judul'] ?? '');
  }
}

/// Metadata untuk pagination
class PembayaranMetadata {
  final int total;
  final int halaman;
  final int limit;
  final int totalHalaman;

  PembayaranMetadata({
    required this.total,
    required this.halaman,
    required this.limit,
    required this.totalHalaman,
  });

  factory PembayaranMetadata.fromJson(Map<String, dynamic> json) {
    return PembayaranMetadata(
      total: json['total'] ?? 0,
      halaman: json['halaman'] ?? 1,
      limit: json['limit'] ?? 20,
      totalHalaman: json['totalHalaman'] ?? 1,
    );
  }
}

/// Model statistik pembayaran
class PembayaranStatistikResponse {
  final bool sukses;
  final String pesan;
  final PembayaranStatistik? data;

  PembayaranStatistikResponse({
    required this.sukses,
    this.pesan = '',
    this.data,
  });

  factory PembayaranStatistikResponse.fromJson(Map<String, dynamic> json) {
    return PembayaranStatistikResponse(
      sukses: json['sukses'] ?? false,
      pesan: json['pesan'] ?? '',
      data: json['data'] != null
          ? PembayaranStatistik.fromJson(json['data'])
          : null,
    );
  }
}

class PembayaranStatistik {
  final int totalPembayaran;
  final int tertunda;
  final int diproses;
  final int berhasil;
  final int gagal;
  final int dibatalkan;
  final double totalPendapatan;
  final double pendapatanBulanIni;

  PembayaranStatistik({
    required this.totalPembayaran,
    required this.tertunda,
    required this.diproses,
    required this.berhasil,
    required this.gagal,
    required this.dibatalkan,
    required this.totalPendapatan,
    required this.pendapatanBulanIni,
  });

  factory PembayaranStatistik.fromJson(Map<String, dynamic> json) {
    return PembayaranStatistik(
      totalPembayaran: json['totalPembayaran'] ?? 0,
      tertunda: json['tertunda'] ?? 0,
      diproses: json['diproses'] ?? 0,
      berhasil: json['berhasil'] ?? 0,
      gagal: json['gagal'] ?? 0,
      dibatalkan: json['dibatalkan'] ?? 0,
      totalPendapatan: (json['totalPendapatan'] ?? 0).toDouble(),
      pendapatanBulanIni: (json['pendapatanBulanIni'] ?? 0).toDouble(),
    );
  }
}

/// Response untuk operasi pembayaran (create, confirm, cancel)
class PembayaranOperasiResponse {
  final bool sukses;
  final String pesan;
  final PembayaranData? data;

  PembayaranOperasiResponse({required this.sukses, this.pesan = '', this.data});

  factory PembayaranOperasiResponse.fromJson(Map<String, dynamic> json) {
    return PembayaranOperasiResponse(
      sukses: json['sukses'] ?? false,
      pesan: json['pesan'] ?? '',
      data: json['data'] != null ? PembayaranData.fromJson(json['data']) : null,
    );
  }
}
