import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import {
  ProsesPembayaranDto,
  KonfirmasiPembayaranDto,
  FilterPembayaranDto,
  WebhookPembayaranDto,
} from './dto';
import { Decimal } from '@prisma/client/runtime/library';

/**
 * Service untuk mengelola pembayaran pesanan cetak
 * Menangani transaksi, konfirmasi, dan webhook dari payment gateway
 */
@Injectable()
export class PembayaranService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Buat pembayaran baru untuk pesanan
   * Validasi: pesanan harus ada, belum ada pembayaran, dan status diterima
   */
  async buatPembayaran(idPengguna: string, dto: ProsesPembayaranDto) {
    // Validasi pesanan exists
    const pesanan = await this.prisma.pesananCetak.findUnique({
      where: { id: dto.idPesanan },
      include: {
        pembayaran: true,
        pemesan: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    if (!pesanan) {
      throw new NotFoundException('Pesanan tidak ditemukan');
    }

    // Validasi pemesan
    if (pesanan.idPemesan !== idPengguna) {
      throw new ForbiddenException('Anda tidak memiliki akses untuk membayar pesanan ini');
    }

    // Validasi pesanan sudah dikonfirmasi percetakan
    if (pesanan.status === 'tertunda') {
      throw new BadRequestException(
        'Pesanan belum dikonfirmasi oleh percetakan. Silakan tunggu konfirmasi terlebih dahulu',
      );
    }

    if (pesanan.status === 'dibatalkan') {
      throw new BadRequestException('Pesanan sudah dibatalkan');
    }

    // Validasi belum ada pembayaran
    if (pesanan.pembayaran) {
      throw new BadRequestException('Pesanan ini sudah memiliki pembayaran');
    }

    // Validasi bukti transfer untuk metode transfer_bank
    if (dto.metodePembayaran === 'transfer_bank' && !dto.urlBukti) {
      throw new BadRequestException('URL bukti transfer wajib untuk metode transfer bank');
    }

    // Generate nomor transaksi unik (format: TRX-YYYYMMDD-XXXX)
    const tanggal = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const nomorTransaksi = `TRX-${tanggal}-${randomNum}`;

    // Buat pembayaran
    const pembayaran = await this.prisma.pembayaran.create({
      data: {
        idPesanan: dto.idPesanan,
        idPengguna,
        nomorTransaksi,
        jumlah: pesanan.hargaTotal,
        metodePembayaran: dto.metodePembayaran,
        status: dto.metodePembayaran === 'cod' ? 'diproses' : 'tertunda',
        urlBukti: dto.urlBukti,
        catatanPembayaran: dto.catatanPembayaran,
      },
      include: {
        pesanan: {
          select: {
            id: true,
            nomorPesanan: true,
            jumlah: true,
            hargaTotal: true,
          },
        },
        pengguna: {
          select: {
            id: true,
            email: true,
            profilPengguna: {
              select: {
                namaDepan: true,
                namaBelakang: true,
              },
            },
          },
        },
      },
    });

    // Log aktivitas
    await this.prisma.logAktivitas.create({
      data: {
        idPengguna,
        jenis: 'pembayaran',
        aksi: 'buat',
        entitas: 'pembayaran',
        idEntitas: pembayaran.id,
        deskripsi: `Membuat pembayaran ${nomorTransaksi} untuk pesanan ${pesanan.nomorPesanan}`,
      },
    });

    return {
      sukses: true,
      pesan: 'Pembayaran berhasil dibuat',
      data: pembayaran,
    };
  }

  /**
   * Ambil semua pembayaran dengan filter dan pagination
   * Admin: lihat semua, Penulis: lihat milik sendiri, Percetakan: lihat untuk pesanan mereka
   */
  async ambilSemuaPembayaran(filter: FilterPembayaranDto, idPengguna?: string, peran?: string) {
    const { halaman, limit, urutkan, arah, ...filterLainnya } = filter;
    const skip = (halaman - 1) * limit;

    // Build where clause
    const where: any = {};

    // Filter berdasarkan peran
    if (peran === 'penulis' && idPengguna) {
      where.idPengguna = idPengguna;
    } else if (peran === 'percetakan' && idPengguna) {
      where.pesanan = {
        idPercetakan: idPengguna,
      };
    }
    // Admin bisa lihat semua

    // Apply filters
    if (filterLainnya.status) {
      where.status = filterLainnya.status;
    }

    if (filterLainnya.metodePembayaran) {
      where.metodePembayaran = filterLainnya.metodePembayaran;
    }

    if (filterLainnya.idPengguna) {
      where.idPengguna = filterLainnya.idPengguna;
    }

    if (filterLainnya.idPesanan) {
      where.idPesanan = filterLainnya.idPesanan;
    }

    if (filterLainnya.nomorTransaksi) {
      where.nomorTransaksi = {
        contains: filterLainnya.nomorTransaksi,
        mode: 'insensitive' as const,
      };
    }

    // Date range filter
    if (filterLainnya.tanggalMulai || filterLainnya.tanggalSelesai) {
      where.dibuatPada = {};
      if (filterLainnya.tanggalMulai) {
        where.dibuatPada.gte = new Date(filterLainnya.tanggalMulai);
      }
      if (filterLainnya.tanggalSelesai) {
        where.dibuatPada.lte = new Date(filterLainnya.tanggalSelesai);
      }
    }

    const [pembayaran, total] = await Promise.all([
      this.prisma.pembayaran.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [urutkan]: arah },
        include: {
          pesanan: {
            select: {
              id: true,
              nomorPesanan: true,
              jumlah: true,
              hargaTotal: true,
            },
          },
          pengguna: {
            select: {
              id: true,
              email: true,
              profilPengguna: {
                select: {
                  namaDepan: true,
                  namaBelakang: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.pembayaran.count({ where }),
    ]);

    return {
      sukses: true,
      data: pembayaran,
      metadata: {
        total,
        halaman,
        limit,
        totalHalaman: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Ambil detail pembayaran by ID
   */
  async ambilPembayaranById(id: string, idPengguna?: string, peran?: string) {
    const pembayaran = await this.prisma.pembayaran.findUnique({
      where: { id },
      include: {
        pesanan: {
          include: {
            naskah: {
              select: {
                id: true,
                judul: true,
                isbn: true,
              },
            },
          },
        },
        pengguna: {
          select: {
            id: true,
            email: true,
            telepon: true,
            profilPengguna: {
              select: {
                namaDepan: true,
                namaBelakang: true,
              },
            },
          },
        },
      },
    });

    if (!pembayaran) {
      throw new NotFoundException('Pembayaran tidak ditemukan');
    }

    // Validasi akses berdasarkan peran
    if (peran === 'penulis' && pembayaran.idPengguna !== idPengguna) {
      throw new ForbiddenException('Anda tidak memiliki akses ke pembayaran ini');
    }

    if (peran === 'percetakan' && pembayaran.pesanan.idPercetakan !== idPengguna) {
      throw new ForbiddenException('Anda tidak memiliki akses ke pembayaran ini');
    }

    return {
      sukses: true,
      data: pembayaran,
    };
  }

  /**
   * Verifikasi pembayaran (cek signature dari payment gateway)
   * Digunakan untuk validasi webhook
   */
  async verifikasiPembayaran(signature: string, data: any): Promise<boolean> {
    // TODO: Implement signature verification logic
    // Contoh untuk Midtrans:
    // const serverKey = process.env.MIDTRANS_SERVER_KEY;
    // const hash = crypto.createHash('sha512');
    // hash.update(`${data.order_id}${data.status_code}${data.gross_amount}${serverKey}`);
    // const expectedSignature = hash.digest('hex');
    // return signature === expectedSignature;

    // Untuk development, return true
    return true;
  }

  /**
   * Konfirmasi pembayaran oleh admin/percetakan
   * Status berubah: tertunda/diproses → berhasil atau gagal
   */
  async konfirmasiPembayaran(id: string, idKonfirmator: string, dto: KonfirmasiPembayaranDto) {
    const pembayaran = await this.prisma.pembayaran.findUnique({
      where: { id },
      include: {
        pesanan: true,
      },
    });

    if (!pembayaran) {
      throw new NotFoundException('Pembayaran tidak ditemukan');
    }

    if (pembayaran.status !== 'tertunda' && pembayaran.status !== 'diproses') {
      throw new BadRequestException(
        'Hanya pembayaran dengan status "tertunda" atau "diproses" yang dapat dikonfirmasi',
      );
    }

    // Validasi catatan wajib jika ditolak
    if (!dto.diterima && !dto.catatan) {
      throw new BadRequestException('Catatan wajib diisi jika pembayaran ditolak');
    }

    const statusBaru = dto.diterima ? 'berhasil' : 'gagal';

    const pembayaranUpdated = await this.prisma.pembayaran.update({
      where: { id },
      data: {
        status: statusBaru,
        tanggalPembayaran: dto.diterima ? new Date() : undefined,
        catatanPembayaran: dto.catatan
          ? `${pembayaran.catatanPembayaran || ''}\n\nKonfirmasi: ${dto.catatan}`
          : pembayaran.catatanPembayaran,
      },
      include: {
        pesanan: {
          select: {
            nomorPesanan: true,
          },
        },
      },
    });

    // Log aktivitas
    await this.prisma.logAktivitas.create({
      data: {
        idPengguna: idKonfirmator,
        jenis: 'pembayaran',
        aksi: dto.diterima ? 'konfirmasi' : 'tolak',
        entitas: 'pembayaran',
        idEntitas: id,
        deskripsi: `${dto.diterima ? 'Mengkonfirmasi' : 'Menolak'} pembayaran ${pembayaran.nomorTransaksi} untuk pesanan ${pembayaranUpdated.pesanan.nomorPesanan}`,
      },
    });

    return {
      sukses: true,
      pesan: dto.diterima ? 'Pembayaran berhasil dikonfirmasi' : 'Pembayaran ditolak',
      data: pembayaranUpdated,
    };
  }

  /**
   * Batalkan pembayaran (hanya oleh pemilik, status harus tertunda)
   */
  async batalkanPembayaran(id: string, idPengguna: string, alasan?: string) {
    const pembayaran = await this.prisma.pembayaran.findUnique({
      where: { id },
    });

    if (!pembayaran) {
      throw new NotFoundException('Pembayaran tidak ditemukan');
    }

    if (pembayaran.idPengguna !== idPengguna) {
      throw new ForbiddenException('Anda tidak memiliki akses untuk membatalkan pembayaran ini');
    }

    if (pembayaran.status !== 'tertunda') {
      throw new BadRequestException(
        'Hanya pembayaran dengan status "tertunda" yang dapat dibatalkan',
      );
    }

    const pembayaranUpdated = await this.prisma.pembayaran.update({
      where: { id },
      data: {
        status: 'dibatalkan',
        catatanPembayaran: alasan
          ? `${pembayaran.catatanPembayaran || ''}\n\nAlasan Pembatalan: ${alasan}`
          : pembayaran.catatanPembayaran,
      },
    });

    // Log aktivitas
    await this.prisma.logAktivitas.create({
      data: {
        idPengguna,
        jenis: 'pembayaran',
        aksi: 'batalkan',
        entitas: 'pembayaran',
        idEntitas: id,
        deskripsi: `Membatalkan pembayaran ${pembayaran.nomorTransaksi}`,
      },
    });

    return {
      sukses: true,
      pesan: 'Pembayaran berhasil dibatalkan',
      data: pembayaranUpdated,
    };
  }

  /**
   * Handle webhook dari payment gateway
   * Untuk auto-update status pembayaran berdasarkan notifikasi gateway
   */
  async handleWebhook(dto: WebhookPembayaranDto) {
    // Verifikasi signature jika ada
    if (dto.signature) {
      const isValid = await this.verifikasiPembayaran(dto.signature, dto.rawData);
      if (!isValid) {
        throw new BadRequestException('Signature tidak valid');
      }
    }

    // Cari pembayaran berdasarkan nomor transaksi
    const pembayaran = await this.prisma.pembayaran.findUnique({
      where: { nomorTransaksi: dto.nomorTransaksi },
      include: {
        pesanan: true,
      },
    });

    if (!pembayaran) {
      throw new NotFoundException(
        `Pembayaran dengan nomor transaksi ${dto.nomorTransaksi} tidak ditemukan`,
      );
    }

    // Map status dari gateway ke status sistem
    const statusMapping: Record<
      string,
      'diproses' | 'berhasil' | 'gagal' | 'dibatalkan' | 'dikembalikan'
    > = {
      pending: 'diproses',
      success: 'berhasil',
      failed: 'gagal',
      cancelled: 'dibatalkan',
      refunded: 'dikembalikan',
    };

    const statusBaru = statusMapping[dto.status] || 'diproses';

    // Update pembayaran
    const pembayaranUpdated = await this.prisma.pembayaran.update({
      where: { id: pembayaran.id },
      data: {
        status: statusBaru,
        tanggalPembayaran: dto.tanggalPembayaran
          ? new Date(dto.tanggalPembayaran)
          : statusBaru === 'berhasil'
            ? new Date()
            : undefined,
        catatanPembayaran: `${pembayaran.catatanPembayaran || ''}\n\nWebhook Update: Status ${dto.status} dari payment gateway`,
      },
    });

    // Log webhook untuk debugging
    await this.prisma.logAktivitas.create({
      data: {
        idPengguna: pembayaran.idPengguna,
        jenis: 'webhook_pembayaran',
        aksi: 'update_status',
        entitas: 'pembayaran',
        idEntitas: pembayaran.id,
        deskripsi: `Webhook dari payment gateway: status ${dto.status} untuk transaksi ${dto.nomorTransaksi}`,
      },
    });

    return {
      sukses: true,
      pesan: 'Webhook berhasil diproses',
      data: pembayaranUpdated,
    };
  }

  /**
   * Ambil statistik pembayaran
   * Total pembayaran, revenue, breakdown status dan metode
   */
  async ambilStatistikPembayaran(idPengguna?: string, peran?: string) {
    const where: any = {};

    // Filter berdasarkan peran
    if (peran === 'penulis' && idPengguna) {
      where.idPengguna = idPengguna;
    } else if (peran === 'percetakan' && idPengguna) {
      where.pesanan = {
        idPercetakan: idPengguna,
      };
    }

    const [
      totalPembayaran,
      pembayaranBerhasil,
      pembayaranTertunda,
      totalRevenue,
      breakdownStatus,
      breakdownMetode,
    ] = await Promise.all([
      // Total semua pembayaran
      this.prisma.pembayaran.count({ where }),

      // Pembayaran berhasil
      this.prisma.pembayaran.count({
        where: {
          ...where,
          status: 'berhasil',
        },
      }),

      // Pembayaran tertunda
      this.prisma.pembayaran.count({
        where: {
          ...where,
          status: 'tertunda',
        },
      }),

      // Total revenue (hanya yang berhasil)
      this.prisma.pembayaran.aggregate({
        where: {
          ...where,
          status: 'berhasil',
        },
        _sum: {
          jumlah: true,
        },
      }),

      // Breakdown berdasarkan status
      this.prisma.pembayaran.groupBy({
        by: ['status'],
        where,
        _count: {
          status: true,
        },
      }),

      // Breakdown berdasarkan metode pembayaran
      this.prisma.pembayaran.groupBy({
        by: ['metodePembayaran'],
        where,
        _count: {
          metodePembayaran: true,
        },
      }),
    ]);

    // Format breakdown status
    const statusBreakdown = breakdownStatus.reduce(
      (acc, item) => {
        acc[item.status] = item._count.status;
        return acc;
      },
      {} as Record<string, number>,
    );

    // Format breakdown metode
    const metodeBreakdown = breakdownMetode.reduce(
      (acc, item) => {
        acc[item.metodePembayaran] = item._count.metodePembayaran;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      sukses: true,
      data: {
        totalPembayaran,
        pembayaranBerhasil,
        pembayaranTertunda,
        totalRevenue: totalRevenue._sum.jumlah?.toString() || '0',
        statusBreakdown,
        metodeBreakdown,
      },
    };
  }
}
