import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { BuatKategoriDto, PerbaruiKategoriDto } from './dto';

@Injectable()
export class KategoriService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Ambil semua kategori dengan pagination
   */
  async ambilSemuaKategori(halaman: number = 1, limit: number = 20, aktif?: boolean) {
    const skip = (halaman - 1) * limit;
    const where = aktif !== undefined ? { aktif } : {};

    const [data, total] = await Promise.all([
      this.prisma.kategori.findMany({
        where,
        include: {
          induk: {
            select: {
              id: true,
              nama: true,
              slug: true,
            },
          },
          subKategori: {
            where: { aktif: true },
            select: {
              id: true,
              nama: true,
              slug: true,
              aktif: true,
            },
          },
          _count: {
            select: {
              naskah: true,
              subKategori: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          nama: 'asc',
        },
      }),
      this.prisma.kategori.count({ where }),
    ]);

    return {
      sukses: true,
      data,
      metadata: {
        total,
        halaman,
        limit,
        totalHalaman: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Ambil hanya kategori aktif (untuk dropdown/select)
   */
  async ambilKategoriAktif() {
    const kategori = await this.prisma.kategori.findMany({
      where: { aktif: true },
      select: {
        id: true,
        nama: true,
        slug: true,
        deskripsi: true,
        idInduk: true,
        induk: {
          select: {
            id: true,
            nama: true,
          },
        },
      },
      orderBy: {
        nama: 'asc',
      },
    });

    return {
      sukses: true,
      data: kategori,
      total: kategori.length,
    };
  }

  /**
   * Ambil kategori by ID
   */
  async ambilKategoriById(id: string) {
    const kategori = await this.prisma.kategori.findUnique({
      where: { id },
      include: {
        induk: {
          select: {
            id: true,
            nama: true,
            slug: true,
          },
        },
        subKategori: {
          select: {
            id: true,
            nama: true,
            slug: true,
            aktif: true,
            _count: {
              select: {
                naskah: true,
              },
            },
          },
        },
        _count: {
          select: {
            naskah: true,
            subKategori: true,
          },
        },
      },
    });

    if (!kategori) {
      throw new NotFoundException('Kategori tidak ditemukan');
    }

    return {
      sukses: true,
      data: kategori,
    };
  }

  /**
   * Buat kategori baru
   * Role: admin
   */
  async buatKategori(dto: BuatKategoriDto) {
    // Cek apakah slug sudah digunakan
    const existingSlug = await this.prisma.kategori.findUnique({
      where: { slug: dto.slug },
    });

    if (existingSlug) {
      throw new ConflictException('Slug sudah digunakan');
    }

    // Jika ada idInduk, validasi kategori induk exists
    if (dto.idInduk) {
      const induk = await this.prisma.kategori.findUnique({
        where: { id: dto.idInduk },
      });

      if (!induk) {
        throw new BadRequestException('Kategori induk tidak ditemukan');
      }

      if (!induk.aktif) {
        throw new BadRequestException('Kategori induk tidak aktif');
      }
    }

    const kategori = await this.prisma.kategori.create({
      data: dto,
      include: {
        induk: {
          select: {
            id: true,
            nama: true,
            slug: true,
          },
        },
      },
    });

    return {
      sukses: true,
      pesan: 'Kategori berhasil dibuat',
      data: kategori,
    };
  }

  /**
   * Perbarui kategori
   * Role: admin
   */
  async perbaruiKategori(id: string, dto: PerbaruiKategoriDto) {
    // Validasi kategori exists
    const existing = await this.prisma.kategori.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Kategori tidak ditemukan');
    }

    // Jika update slug, cek apakah slug baru sudah digunakan
    if (dto.slug && dto.slug !== existing.slug) {
      const slugExists = await this.prisma.kategori.findUnique({
        where: { slug: dto.slug },
      });

      if (slugExists) {
        throw new ConflictException('Slug sudah digunakan');
      }
    }

    // Jika update idInduk, validasi
    if (dto.idInduk !== undefined) {
      if (dto.idInduk) {
        // Tidak boleh set induk ke diri sendiri
        if (dto.idInduk === id) {
          throw new BadRequestException('Kategori tidak boleh menjadi induk dari dirinya sendiri');
        }

        // Validasi induk exists
        const induk = await this.prisma.kategori.findUnique({
          where: { id: dto.idInduk },
        });

        if (!induk) {
          throw new BadRequestException('Kategori induk tidak ditemukan');
        }

        if (!induk.aktif) {
          throw new BadRequestException('Kategori induk tidak aktif');
        }

        // Cegah circular reference (kategori tidak boleh jadi induk dari induknya sendiri)
        if (induk.idInduk === id) {
          throw new BadRequestException('Circular reference tidak diperbolehkan');
        }
      }
    }

    const kategori = await this.prisma.kategori.update({
      where: { id },
      data: dto,
      include: {
        induk: {
          select: {
            id: true,
            nama: true,
            slug: true,
          },
        },
        subKategori: {
          select: {
            id: true,
            nama: true,
            slug: true,
          },
        },
      },
    });

    return {
      sukses: true,
      pesan: 'Kategori berhasil diperbarui',
      data: kategori,
    };
  }

  /**
   * Hapus kategori
   * Role: admin
   */
  async hapusKategori(id: string) {
    // Validasi kategori exists
    const kategori = await this.prisma.kategori.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            naskah: true,
            subKategori: true,
          },
        },
      },
    });

    if (!kategori) {
      throw new NotFoundException('Kategori tidak ditemukan');
    }

    // Cek apakah ada naskah yang menggunakan kategori ini
    if (kategori._count.naskah > 0) {
      throw new BadRequestException(
        `Kategori tidak dapat dihapus karena masih digunakan oleh ${kategori._count.naskah} naskah`,
      );
    }

    // Cek apakah ada sub-kategori
    if (kategori._count.subKategori > 0) {
      throw new BadRequestException(
        `Kategori tidak dapat dihapus karena masih memiliki ${kategori._count.subKategori} sub-kategori`,
      );
    }

    await this.prisma.kategori.delete({
      where: { id },
    });

    return {
      sukses: true,
      pesan: 'Kategori berhasil dihapus',
    };
  }
}
