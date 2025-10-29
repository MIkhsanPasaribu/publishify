import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { KirimNotifikasiDto, FilterNotifikasiDto } from './dto';

/**
 * Service untuk mengelola notifikasi pengguna
 * Menyimpan notifikasi ke database dan siap untuk emit via WebSocket Gateway
 */
@Injectable()
export class NotifikasiService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Kirim notifikasi ke pengguna tertentu
   * Simpan ke database, lalu Gateway akan emit via WebSocket
   */
  async kirimNotifikasi(dto: KirimNotifikasiDto) {
    // Validasi pengguna exists
    const pengguna = await this.prisma.pengguna.findUnique({
      where: { id: dto.idPengguna },
      select: { id: true, email: true },
    });

    if (!pengguna) {
      throw new NotFoundException('Pengguna tidak ditemukan');
    }

    // Buat notifikasi di database
    const notifikasi = await this.prisma.notifikasi.create({
      data: {
        idPengguna: dto.idPengguna,
        judul: dto.judul,
        pesan: dto.pesan,
        tipe: dto.tipe || 'info',
        url: dto.url,
        dibaca: false,
      },
    });

    return {
      sukses: true,
      pesan: 'Notifikasi berhasil dikirim',
      data: notifikasi,
    };
  }

  /**
   * Kirim notifikasi broadcast ke banyak pengguna
   * Untuk notifikasi sistem atau announcement
   */
  async kirimBroadcast(
    idPenggunaList: string[],
    judul: string,
    pesan: string,
    tipe: 'info' | 'sukses' | 'peringatan' | 'error' = 'info',
    url?: string,
  ) {
    // Validasi semua pengguna exists
    const pengguna = await this.prisma.pengguna.findMany({
      where: {
        id: { in: idPenggunaList },
      },
      select: { id: true },
    });

    if (pengguna.length === 0) {
      throw new NotFoundException('Tidak ada pengguna yang valid ditemukan');
    }

    // Buat notifikasi untuk semua pengguna
    const notifikasiData = pengguna.map((user) => ({
      idPengguna: user.id,
      judul,
      pesan,
      tipe,
      url: url || null,
      dibaca: false,
    }));

    await this.prisma.notifikasi.createMany({
      data: notifikasiData,
    });

    return {
      sukses: true,
      pesan: `Notifikasi berhasil dikirim ke ${pengguna.length} pengguna`,
      data: {
        totalPenerima: pengguna.length,
      },
    };
  }

  /**
   * Ambil notifikasi pengguna dengan filter dan pagination
   * Hanya pengguna yang bersangkutan yang bisa akses
   */
  async ambilNotifikasiPengguna(idPengguna: string, filter: FilterNotifikasiDto) {
    const { halaman, limit, urutkan, arah, ...filterLainnya } = filter;
    const skip = (halaman - 1) * limit;

    // Build where clause
    const where: any = {
      idPengguna,
    };

    // Filter berdasarkan status dibaca
    if (filterLainnya.dibaca !== undefined) {
      where.dibaca = filterLainnya.dibaca;
    }

    // Filter berdasarkan tipe
    if (filterLainnya.tipe) {
      where.tipe = filterLainnya.tipe;
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

    const [notifikasi, total] = await Promise.all([
      this.prisma.notifikasi.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [urutkan]: arah },
      }),
      this.prisma.notifikasi.count({ where }),
    ]);

    return {
      sukses: true,
      data: notifikasi,
      metadata: {
        total,
        halaman,
        limit,
        totalHalaman: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Ambil detail notifikasi by ID
   * Validasi akses hanya untuk pemilik notifikasi
   */
  async ambilNotifikasiById(id: string, idPengguna: string) {
    const notifikasi = await this.prisma.notifikasi.findUnique({
      where: { id },
    });

    if (!notifikasi) {
      throw new NotFoundException('Notifikasi tidak ditemukan');
    }

    // Validasi akses
    if (notifikasi.idPengguna !== idPengguna) {
      throw new ForbiddenException('Anda tidak memiliki akses ke notifikasi ini');
    }

    return {
      sukses: true,
      data: notifikasi,
    };
  }

  /**
   * Tandai notifikasi sebagai sudah dibaca
   */
  async tandaiDibaca(id: string, idPengguna: string) {
    // Validasi notifikasi exists dan akses
    const notifikasi = await this.prisma.notifikasi.findUnique({
      where: { id },
    });

    if (!notifikasi) {
      throw new NotFoundException('Notifikasi tidak ditemukan');
    }

    if (notifikasi.idPengguna !== idPengguna) {
      throw new ForbiddenException('Anda tidak memiliki akses ke notifikasi ini');
    }

    // Update status dibaca
    const notifikasiUpdated = await this.prisma.notifikasi.update({
      where: { id },
      data: { dibaca: true },
    });

    return {
      sukses: true,
      pesan: 'Notifikasi ditandai sebagai sudah dibaca',
      data: notifikasiUpdated,
    };
  }

  /**
   * Tandai semua notifikasi pengguna sebagai sudah dibaca
   */
  async tandaiSemuaDibaca(idPengguna: string) {
    const result = await this.prisma.notifikasi.updateMany({
      where: {
        idPengguna,
        dibaca: false,
      },
      data: {
        dibaca: true,
      },
    });

    return {
      sukses: true,
      pesan: `${result.count} notifikasi ditandai sebagai sudah dibaca`,
      data: {
        totalDitandai: result.count,
      },
    };
  }

  /**
   * Hapus notifikasi
   * Hanya pemilik yang bisa hapus
   */
  async hapusNotifikasi(id: string, idPengguna: string) {
    // Validasi notifikasi exists dan akses
    const notifikasi = await this.prisma.notifikasi.findUnique({
      where: { id },
    });

    if (!notifikasi) {
      throw new NotFoundException('Notifikasi tidak ditemukan');
    }

    if (notifikasi.idPengguna !== idPengguna) {
      throw new ForbiddenException('Anda tidak memiliki akses ke notifikasi ini');
    }

    await this.prisma.notifikasi.delete({
      where: { id },
    });

    return {
      sukses: true,
      pesan: 'Notifikasi berhasil dihapus',
    };
  }

  /**
   * Hitung jumlah notifikasi yang belum dibaca
   */
  async hitungBelumDibaca(idPengguna: string) {
    const total = await this.prisma.notifikasi.count({
      where: {
        idPengguna,
        dibaca: false,
      },
    });

    return {
      sukses: true,
      data: {
        totalBelumDibaca: total,
      },
    };
  }
}
