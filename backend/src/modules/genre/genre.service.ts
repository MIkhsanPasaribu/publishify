import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { BuatGenreDto, PerbaruiGenreDto } from './dto';

@Injectable()
export class GenreService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Ambil semua genre dengan pagination
   */
  async ambilSemuaGenre(halaman: number = 1, limit: number = 20, aktif?: boolean) {
    const skip = (halaman - 1) * limit;
    const where = aktif !== undefined ? { aktif } : {};

    const [data, total] = await Promise.all([
      this.prisma.genre.findMany({
        where,
        include: {
          _count: {
            select: {
              naskah: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          nama: 'asc',
        },
      }),
      this.prisma.genre.count({ where }),
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
   * Ambil hanya genre aktif (untuk dropdown/select)
   */
  async ambilGenreAktif() {
    const genre = await this.prisma.genre.findMany({
      where: { aktif: true },
      select: {
        id: true,
        nama: true,
        slug: true,
        deskripsi: true,
      },
      orderBy: {
        nama: 'asc',
      },
    });

    return {
      sukses: true,
      data: genre,
      total: genre.length,
    };
  }

  /**
   * Ambil genre by ID
   */
  async ambilGenreById(id: string) {
    const genre = await this.prisma.genre.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            naskah: true,
          },
        },
      },
    });

    if (!genre) {
      throw new NotFoundException('Genre tidak ditemukan');
    }

    return {
      sukses: true,
      data: genre,
    };
  }

  /**
   * Buat genre baru
   * Role: admin
   */
  async buatGenre(dto: BuatGenreDto) {
    // Cek apakah nama sudah digunakan
    const existingNama = await this.prisma.genre.findUnique({
      where: { nama: dto.nama },
    });

    if (existingNama) {
      throw new ConflictException('Nama genre sudah digunakan');
    }

    // Cek apakah slug sudah digunakan
    const existingSlug = await this.prisma.genre.findUnique({
      where: { slug: dto.slug },
    });

    if (existingSlug) {
      throw new ConflictException('Slug sudah digunakan');
    }

    const genre = await this.prisma.genre.create({
      data: dto,
    });

    return {
      sukses: true,
      pesan: 'Genre berhasil dibuat',
      data: genre,
    };
  }

  /**
   * Perbarui genre
   * Role: admin
   */
  async perbaruiGenre(id: string, dto: PerbaruiGenreDto) {
    // Validasi genre exists
    const existing = await this.prisma.genre.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Genre tidak ditemukan');
    }

    // Jika update nama, cek apakah nama baru sudah digunakan
    if (dto.nama && dto.nama !== existing.nama) {
      const namaExists = await this.prisma.genre.findUnique({
        where: { nama: dto.nama },
      });

      if (namaExists) {
        throw new ConflictException('Nama genre sudah digunakan');
      }
    }

    // Jika update slug, cek apakah slug baru sudah digunakan
    if (dto.slug && dto.slug !== existing.slug) {
      const slugExists = await this.prisma.genre.findUnique({
        where: { slug: dto.slug },
      });

      if (slugExists) {
        throw new ConflictException('Slug sudah digunakan');
      }
    }

    const genre = await this.prisma.genre.update({
      where: { id },
      data: dto,
    });

    return {
      sukses: true,
      pesan: 'Genre berhasil diperbarui',
      data: genre,
    };
  }

  /**
   * Hapus genre
   * Role: admin
   */
  async hapusGenre(id: string) {
    // Validasi genre exists
    const genre = await this.prisma.genre.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            naskah: true,
          },
        },
      },
    });

    if (!genre) {
      throw new NotFoundException('Genre tidak ditemukan');
    }

    // Cek apakah ada naskah yang menggunakan genre ini
    if (genre._count.naskah > 0) {
      throw new ConflictException(
        `Genre tidak dapat dihapus karena masih digunakan oleh ${genre._count.naskah} naskah`,
      );
    }

    await this.prisma.genre.delete({
      where: { id },
    });

    return {
      sukses: true,
      pesan: 'Genre berhasil dihapus',
    };
  }
}
