import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import {
  BuatPesananDto,
  PerbaruiPesananDto,
  FilterPesananDto,
  UpdateStatusDto,
  BuatPengirimanDto,
  KonfirmasiPesananDto,
  KonfirmasiPenerimaanDto,
} from './dto';
import { Decimal } from '@prisma/client/runtime/library';
import { NotifikasiService } from '@/modules/notifikasi/notifikasi.service';
import { NotifikasiGateway } from '@/modules/notifikasi/notifikasi.gateway';
import { EmailService } from '@/modules/notifikasi/email.service';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

/**
 * Service untuk mengelola pesanan cetak buku
 * Menangani pembuatan, update, konfirmasi, tracking pesanan, email & WebSocket notifications
 */
@Injectable()
export class PercetakanService {
  private readonly logger = new Logger(PercetakanService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifikasiService: NotifikasiService,
    private readonly notifikasiGateway: NotifikasiGateway,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Ambil daftar percetakan yang tersedia dengan info tarif aktif
   * Untuk ditampilkan saat penulis akan membuat pesanan cetak
   */
  async ambilDaftarPercetakan() {
    console.log('\n🏭 [PERCETAKAN] Mengambil Daftar Percetakan');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Ambil semua user dengan peran percetakan
    const daftarPercetakan = await this.prisma.pengguna.findMany({
      where: {
        peranPengguna: {
          some: {
            jenisPeran: 'percetakan',
            aktif: true,
          },
        },
        aktif: true,
      },
      include: {
        profilPengguna: {
          select: {
            namaDepan: true,
            namaBelakang: true,
            namaTampilan: true,
            alamat: true,
            kota: true,
            provinsi: true,
          },
        },
        parameterHarga: {
          where: {
            aktif: true,
          },
          select: {
            id: true,
            namaKombinasi: true,
            deskripsi: true,
            hargaKertasA4: true,
            hargaKertasA5: true,
            hargaKertasB5: true,
            hargaSoftcover: true,
            hargaHardcover: true,
            biayaJilid: true,
            minimumPesanan: true,
          },
        },
      },
      orderBy: {
        dibuatPada: 'desc',
      },
    });

    console.log(`✅ Ditemukan ${daftarPercetakan.length} percetakan aktif`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    return {
      sukses: true,
      pesan: 'Daftar percetakan berhasil diambil',
      data: daftarPercetakan.map((p) => {
        const tarif = p.parameterHarga[0];
        return {
          id: p.id,
          email: p.email,
          nama: p.profilPengguna?.namaTampilan || 
                `${p.profilPengguna?.namaDepan || ''} ${p.profilPengguna?.namaBelakang || ''}`.trim() ||
                'Percetakan',
          alamat: p.profilPengguna?.alamat,
          kota: p.profilPengguna?.kota,
          provinsi: p.profilPengguna?.provinsi,
          tarifAktif: tarif ? {
            ...tarif,
            hargaKertasA4: tarif.hargaKertasA4 ? Number(tarif.hargaKertasA4) : 0,
            hargaKertasA5: tarif.hargaKertasA5 ? Number(tarif.hargaKertasA5) : 0,
            hargaKertasB5: tarif.hargaKertasB5 ? Number(tarif.hargaKertasB5) : 0,
            hargaSoftcover: tarif.hargaSoftcover ? Number(tarif.hargaSoftcover) : 0,
            hargaHardcover: tarif.hargaHardcover ? Number(tarif.hargaHardcover) : 0,
            biayaJilid: tarif.biayaJilid ? Number(tarif.biayaJilid) : 0,
          } : null,
        };
      }),
      total: daftarPercetakan.length,
    };
  }

  /**
   * Ambil detail tarif percetakan tertentu (skema aktif)
   */
  async ambilTarifPercetakan(idPercetakan: string) {
    console.log('\n💰 [PERCETAKAN] Mengambil Tarif Percetakan');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🏭 ID Percetakan:', idPercetakan);

    // Validasi percetakan exists dan aktif
    const percetakan = await this.prisma.pengguna.findFirst({
      where: {
        id: idPercetakan,
        aktif: true,
        peranPengguna: {
          some: {
            jenisPeran: 'percetakan',
            aktif: true,
          },
        },
      },
      select: {
        id: true,
        email: true,
        profilPengguna: {
          select: {
            namaDepan: true,
            namaBelakang: true,
            namaTampilan: true,
          },
        },
      },
    });

    if (!percetakan) {
      throw new NotFoundException('Percetakan tidak ditemukan atau tidak aktif');
    }

    // Ambil tarif aktif
    const tarifAktif = await this.prisma.parameterHargaPercetakan.findFirst({
      where: {
        idPercetakan,
        aktif: true,
      },
    });

    if (!tarifAktif) {
      throw new NotFoundException('Percetakan belum memiliki tarif aktif');
    }

    console.log('✅ Tarif ditemukan:', tarifAktif.namaKombinasi);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Transform Decimal to number untuk frontend
    return {
      sukses: true,
      pesan: 'Tarif percetakan berhasil diambil',
      data: {
        percetakan: {
          id: percetakan.id,
          nama: percetakan.profilPengguna?.namaTampilan ||
                `${percetakan.profilPengguna?.namaDepan || ''} ${percetakan.profilPengguna?.namaBelakang || ''}`.trim() ||
                'Percetakan',
        },
        tarif: {
          ...tarifAktif,
          hargaKertasA4: tarifAktif.hargaKertasA4 ? Number(tarifAktif.hargaKertasA4) : 0,
          hargaKertasA5: tarifAktif.hargaKertasA5 ? Number(tarifAktif.hargaKertasA5) : 0,
          hargaKertasB5: tarifAktif.hargaKertasB5 ? Number(tarifAktif.hargaKertasB5) : 0,
          hargaSoftcover: tarifAktif.hargaSoftcover ? Number(tarifAktif.hargaSoftcover) : 0,
          hargaHardcover: tarifAktif.hargaHardcover ? Number(tarifAktif.hargaHardcover) : 0,
          biayaJilid: tarifAktif.biayaJilid ? Number(tarifAktif.biayaJilid) : 0,
        },
      },
    };
  }

  /**
   * Buat pesanan cetak baru dengan validasi percetakan dan kalkulasi harga otomatis
   * Validasi: naskah harus berstatus 'diterbitkan', percetakan harus aktif, jumlah >= minimum
   */
  async buatPesanan(idPemesan: string, dto: BuatPesananDto) {
    console.log('\n🎯 [PERCETAKAN] Membuat Pesanan Baru');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👤 ID Pemesan:', idPemesan);
    console.log('🏭 ID Percetakan:', dto.idPercetakan);
    console.log('📝 DTO:', JSON.stringify(dto, null, 2));

    // 1. Validasi naskah exists dan status diterbitkan
    const naskah = await this.prisma.naskah.findUnique({
      where: { id: dto.idNaskah },
      include: {
        penulis: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    console.log('📖 Naskah:', naskah ? `${naskah.judul} (${naskah.status})` : 'Tidak ditemukan');

    if (!naskah) {
      throw new NotFoundException('Naskah tidak ditemukan');
    }

    if (naskah.status !== 'diterbitkan') {
      throw new BadRequestException('Hanya naskah dengan status "diterbitkan" yang dapat dicetak');
    }

    // 2. Validasi pemesan adalah penulis naskah
    if (naskah.idPenulis !== idPemesan) {
      throw new ForbiddenException('Anda hanya dapat memesan cetak untuk naskah Anda sendiri');
    }

    // 3. Validasi percetakan exists dan aktif
    const percetakan = await this.prisma.pengguna.findFirst({
      where: {
        id: dto.idPercetakan,
        aktif: true,
        peranPengguna: {
          some: {
            jenisPeran: 'percetakan',
            aktif: true,
          },
        },
      },
    });

    if (!percetakan) {
      throw new NotFoundException('Percetakan tidak ditemukan atau tidak aktif');
    }

    console.log('🏭 Percetakan:', percetakan.email);

    // 4. Ambil tarif aktif percetakan
    const tarifAktif = await this.prisma.parameterHargaPercetakan.findFirst({
      where: {
        idPercetakan: dto.idPercetakan,
        aktif: true,
      },
    });

    if (!tarifAktif) {
      throw new NotFoundException('Percetakan belum memiliki tarif aktif');
    }

    console.log('💰 Tarif:', tarifAktif.namaKombinasi);
    console.log('📦 Minimum Pesanan:', tarifAktif.minimumPesanan);

    // 5. Validasi jumlah pesanan terhadap minimum
    if (dto.jumlah < tarifAktif.minimumPesanan) {
      throw new BadRequestException(
        `Jumlah pesanan minimal ${tarifAktif.minimumPesanan} eksemplar`
      );
    }

    // 6. Kalkulasi harga otomatis berdasarkan tarif
    let hargaKertasPerLembar = 0;
    if (dto.formatKertas === 'A4') {
      hargaKertasPerLembar = Number(tarifAktif.hargaKertasA4);
    } else if (dto.formatKertas === 'A5') {
      hargaKertasPerLembar = Number(tarifAktif.hargaKertasA5);
    } else if (dto.formatKertas === 'B5') {
      hargaKertasPerLembar = Number(tarifAktif.hargaKertasB5);
    }

    let hargaCoverPerUnit = 0;
    if (dto.jenisCover === 'SOFTCOVER') {
      hargaCoverPerUnit = Number(tarifAktif.hargaSoftcover);
    } else if (dto.jenisCover === 'HARDCOVER') {
      hargaCoverPerUnit = Number(tarifAktif.hargaHardcover);
    }

    const hargaJilid = Number(tarifAktif.biayaJilid);
    const jumlahHalaman = naskah.jumlahHalaman || 100;

    // Rumus: (Harga Kertas/lembar * Jumlah Halaman + Harga Cover + Biaya Jilid) * Jumlah Buku
    const biayaPerUnit = hargaKertasPerLembar * jumlahHalaman + hargaCoverPerUnit + hargaJilid;
    const hargaTotal = biayaPerUnit * dto.jumlah;

    console.log('\n💵 Kalkulasi Harga:');
    console.log('  - Harga Kertas/lembar:', hargaKertasPerLembar);
    console.log('  - Jumlah Halaman:', jumlahHalaman);
    console.log('  - Harga Cover:', hargaCoverPerUnit);
    console.log('  - Biaya Jilid:', hargaJilid);
    console.log('  - Biaya/Unit:', biayaPerUnit);
    console.log('  - Jumlah Buku:', dto.jumlah);
    console.log('  - TOTAL:', hargaTotal);

    // 7. Generate nomor pesanan unik (format: PO-YYYYMMDD-XXXX)
    const tanggal = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const nomorPesanan = `PO-${tanggal}-${randomNum}`;

    // 8. Buat pesanan dengan pengiriman
    const pesanan = await this.prisma.$transaction(async (prisma) => {
      // Buat pesanan cetak
      const pesanan = await prisma.pesananCetak.create({
        data: {
          idNaskah: dto.idNaskah,
          idPemesan,
          idPercetakan: dto.idPercetakan,
          nomorPesanan,
          jumlah: dto.jumlah,
          formatKertas: dto.formatKertas,
          jenisKertas: dto.jenisKertas,
          jenisCover: dto.jenisCover,
          finishingTambahan: dto.finishingTambahan || [],
          catatan: dto.catatan,
          hargaTotal: new Decimal(hargaTotal),
          status: 'tertunda',
          judulSnapshot: naskah.judul,
          formatSnapshot: dto.formatKertas,
          jumlahHalamanSnapshot: jumlahHalaman,
        },
      });

      // Buat data pengiriman jika ada alamat
      if (dto.alamatPengiriman && dto.namaPenerima && dto.teleponPenerima) {
        await prisma.pengiriman.create({
          data: {
            idPesanan: pesanan.id,
            namaEkspedisi: 'TBD', // To be determined by admin
            biayaPengiriman: new Decimal(0), // Will be calculated later
            alamatTujuan: dto.alamatPengiriman,
            namaPenerima: dto.namaPenerima,
            teleponPenerima: dto.teleponPenerima,
            status: 'diproses',
          },
        });
      }

      return pesanan;
    });

    // Fetch pesanan lengkap dengan relasi
    const pesananLengkap = await this.prisma.pesananCetak.findUnique({
      where: { id: pesanan.id },
      include: {
        naskah: {
          select: {
            id: true,
            judul: true,
            jumlahHalaman: true,
          },
        },
        pemesan: {
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
        pengiriman: true,
      },
    });

    // Log aktivitas
    await this.prisma.logAktivitas.create({
      data: {
        idPengguna: idPemesan,
        jenis: 'pesanan_cetak',
        aksi: 'buat',
        entitas: 'pesanan_cetak',
        idEntitas: pesanan.id,
        deskripsi: `Membuat pesanan cetak untuk naskah "${naskah.judul}" dengan nomor ${nomorPesanan}`,
      },
    });

    console.log('\n✅ Pesanan berhasil dibuat!');
    console.log('  - ID Pesanan:', pesanan.id);
    console.log('  - Nomor Pesanan:', nomorPesanan);
    console.log('  - Total Harga:', hargaTotal);
    console.log('  - Status:', pesanan.status);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    return {
      sukses: true,
      pesan: 'Pesanan cetak berhasil dibuat',
      data: pesananLengkap,
    };
  }

  /**
   * Ambil semua pesanan dengan filter dan pagination
   * Admin: lihat semua, Percetakan: lihat yang ditugaskan, Penulis: lihat milik sendiri
   */
  async ambilSemuaPesanan(filter: FilterPesananDto, idPengguna?: string, peran?: string) {
    console.log('\n📋 [PERCETAKAN] Mengambil Daftar Pesanan');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👤 ID Pengguna:', idPengguna || 'N/A');
    console.log('🎭 Peran:', peran || 'N/A');
    console.log('🔍 Filter:', JSON.stringify(filter, null, 2));

    const { halaman, limit, urutkan, arah, ...filterLainnya } = filter;
    const skip = (halaman - 1) * limit;

    // Build where clause
    const where: any = {};

    // Filter berdasarkan peran
    if (peran === 'penulis' && idPengguna) {
      where.idPemesan = idPengguna;
    } else if (peran === 'percetakan' && idPengguna) {
      where.idPercetakan = idPengguna;
    }
    // Admin bisa lihat semua

    console.log('🔎 Where Clause (before filters):', JSON.stringify(where, null, 2));

    // Apply filters
    if (filterLainnya.status) {
      where.status = filterLainnya.status;
    }

    if (filterLainnya.idPemesan) {
      where.idPemesan = filterLainnya.idPemesan;
    }

    if (filterLainnya.idNaskah) {
      where.idNaskah = filterLainnya.idNaskah;
    }

    if (filterLainnya.nomorPesanan) {
      where.nomorPesanan = {
        contains: filterLainnya.nomorPesanan,
        mode: 'insensitive' as const,
      };
    }

    // Date range filter
    if (filterLainnya.tanggalMulai || filterLainnya.tanggalSelesai) {
      where.tanggalPesan = {};
      if (filterLainnya.tanggalMulai) {
        where.tanggalPesan.gte = new Date(filterLainnya.tanggalMulai);
      }
      if (filterLainnya.tanggalSelesai) {
        where.tanggalPesan.lte = new Date(filterLainnya.tanggalSelesai);
      }
    }

    // Search
    if (filterLainnya.cari) {
      where.OR = [
        {
          nomorPesanan: {
            contains: filterLainnya.cari,
            mode: 'insensitive' as const,
          },
        },
        {
          catatan: {
            contains: filterLainnya.cari,
            mode: 'insensitive' as const,
          },
        },
      ];
    }

    const [pesanan, total] = await Promise.all([
      this.prisma.pesananCetak.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [urutkan]: arah },
        include: {
          naskah: {
            select: {
              id: true,
              judul: true,
              jumlahHalaman: true,
            },
          },
          pemesan: {
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
          pengiriman: {
            select: {
              id: true,
              namaEkspedisi: true,
              nomorResi: true,
              status: true,
            },
          },
        },
      }),
      this.prisma.pesananCetak.count({ where }),
    ]);

    console.log('\n✅ Query berhasil!');
    console.log('  - Total data:', total);
    console.log('  - Data diambil:', pesanan.length);
    console.log('  - Halaman:', halaman, '/', Math.ceil(total / limit));
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    return {
      sukses: true,
      data: pesanan,
      metadata: {
        total,
        halaman,
        limit,
        totalHalaman: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Ambil detail pesanan by ID
   */
  async ambilPesananById(id: string, idPengguna?: string, peran?: string) {
    console.log('\n🔍 [PERCETAKAN] Mengambil Detail Pesanan');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🏷️  ID Pesanan:', id);
    console.log('👤 ID Pengguna:', idPengguna || 'N/A');
    console.log('🎭 Peran:', peran || 'N/A');

    const pesanan = await this.prisma.pesananCetak.findUnique({
      where: { id },
      include: {
        naskah: {
          select: {
            id: true,
            judul: true,
            isbn: true,
            jumlahHalaman: true,
            urlSampul: true,
          },
        },
        pemesan: {
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
        pengiriman: true,
        logProduksi: {
          orderBy: {
            dibuatPada: 'desc',
          },
        },
      },
    });

    if (!pesanan) {
      throw new NotFoundException('Pesanan tidak ditemukan');
    }

    // Validasi akses berdasarkan peran
    if (peran === 'penulis' && pesanan.idPemesan !== idPengguna) {
      throw new ForbiddenException('Anda tidak memiliki akses ke pesanan ini');
    }

    if (peran === 'percetakan' && pesanan.idPercetakan !== idPengguna) {
      throw new ForbiddenException('Anda tidak memiliki akses ke pesanan ini');
    }

    return {
      sukses: true,
      data: pesanan,
    };
  }

  /**
   * Ambil pesanan milik penulis yang login
   */
  async ambilPesananPenulis(idPenulis: string, filter: FilterPesananDto) {
    return this.ambilSemuaPesanan(
      {
        ...filter,
        idPemesan: idPenulis,
      },
      idPenulis,
      'penulis',
    );
  }

  /**
   * Perbarui detail pesanan (hanya untuk status tertunda)
   */
  async perbaruiPesanan(id: string, idPemesan: string, dto: PerbaruiPesananDto) {
    console.log('\n✏️  [PERCETAKAN] Memperbarui Pesanan');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🏷️  ID Pesanan:', id);
    console.log('👤 ID Pemesan:', idPemesan);
    console.log('📝 Update Data:', JSON.stringify(dto, null, 2));

    const pesanan = await this.prisma.pesananCetak.findUnique({
      where: { id },
      include: {
        naskah: true,
      },
    });

    console.log('📦 Pesanan Lama:', pesanan ? `Status: ${pesanan.status}, Total: ${pesanan.hargaTotal}` : 'Tidak ditemukan');

    if (!pesanan) {
      throw new NotFoundException('Pesanan tidak ditemukan');
    }

    // Validasi pemesan
    if (pesanan.idPemesan !== idPemesan) {
      throw new ForbiddenException('Anda tidak memiliki akses untuk memperbarui pesanan ini');
    }

    // Hanya bisa update jika status masih tertunda
    if (pesanan.status !== 'tertunda') {
      throw new BadRequestException(
        'Pesanan hanya dapat diperbarui ketika status masih "tertunda"',
      );
    }

    // Recalculate harga jika ada perubahan spesifikasi
    let hargaBaru = pesanan.hargaTotal;
    if (
      dto.jumlah ||
      dto.formatKertas ||
      dto.jenisKertas ||
      dto.jenisCover ||
      dto.finishingTambahan
    ) {
      hargaBaru = new Decimal(
        await this.hitungBiayaCetak({
          jumlah: dto.jumlah ?? pesanan.jumlah,
          formatKertas: dto.formatKertas ?? pesanan.formatKertas,
          jenisKertas: dto.jenisKertas ?? pesanan.jenisKertas,
          jenisCover: dto.jenisCover ?? pesanan.jenisCover,
          finishingTambahan: dto.finishingTambahan ?? pesanan.finishingTambahan,
          jumlahHalaman: pesanan.naskah.jumlahHalaman || 100,
        }),
      );
    }

    const pesananUpdated = await this.prisma.pesananCetak.update({
      where: { id },
      data: {
        ...dto,
        hargaTotal: hargaBaru,
      },
      include: {
        naskah: {
          select: {
            id: true,
            judul: true,
          },
        },
      },
    });

    // Log aktivitas
    await this.prisma.logAktivitas.create({
      data: {
        idPengguna: idPemesan,
        jenis: 'pesanan_cetak',
        aksi: 'perbarui',
        entitas: 'pesanan_cetak',
        idEntitas: id,
        deskripsi: `Memperbarui pesanan ${pesanan.nomorPesanan}`,
      },
    });

    return {
      sukses: true,
      pesan: 'Pesanan berhasil diperbarui',
      data: pesananUpdated,
    };
  }

  /**
   * Konfirmasi pesanan oleh percetakan
   * Status berubah: tertunda → diterima atau dibatalkan (jika ditolak)
   */
  async konfirmasiPesanan(id: string, idPercetakan: string, dto: KonfirmasiPesananDto) {
    const pesanan = await this.prisma.pesananCetak.findUnique({
      where: { id },
    });

    if (!pesanan) {
      throw new NotFoundException('Pesanan tidak ditemukan');
    }

    if (pesanan.status !== 'tertunda') {
      throw new BadRequestException(
        'Hanya pesanan dengan status "tertunda" yang dapat dikonfirmasi',
      );
    }

    const statusBaru = dto.diterima ? 'diterima' : 'dibatalkan';
    const hargaFinal = dto.hargaTotal ? new Decimal(dto.hargaTotal) : pesanan.hargaTotal;

    const pesananUpdated = await this.prisma.pesananCetak.update({
      where: { id },
      data: {
        idPercetakan,
        status: statusBaru,
        hargaTotal: hargaFinal,
        estimasiSelesai: dto.estimasiSelesai ? new Date(dto.estimasiSelesai) : undefined,
      },
      include: {
        naskah: {
          select: {
            judul: true,
          },
        },
      },
    });

    // Buat log produksi
    await this.prisma.logProduksi.create({
      data: {
        idPesanan: id,
        tahapan: dto.diterima ? 'Pesanan Diterima' : 'Pesanan Ditolak',
        deskripsi:
          dto.catatan || (dto.diterima ? 'Pesanan dikonfirmasi dan diterima' : 'Pesanan ditolak'),
      },
    });

    // Log aktivitas
    await this.prisma.logAktivitas.create({
      data: {
        idPengguna: idPercetakan,
        jenis: 'pesanan_cetak',
        aksi: dto.diterima ? 'konfirmasi' : 'tolak',
        entitas: 'pesanan_cetak',
        idEntitas: id,
        deskripsi: `${dto.diterima ? 'Menerima' : 'Menolak'} pesanan ${pesanan.nomorPesanan} untuk naskah "${pesananUpdated.naskah.judul}"`,
      },
    });

    console.log('\n✅ Konfirmasi pesanan berhasil!');
    console.log('  - Pesanan:', pesanan.nomorPesanan);
    console.log('  - Keputusan:', dto.diterima ? 'DITERIMA' : 'DITOLAK');
    console.log('  - Status Baru:', pesananUpdated.status);
    console.log('  - Estimasi:', pesananUpdated.estimasiSelesai || '-');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    return {
      sukses: true,
      pesan: dto.diterima ? 'Pesanan berhasil dikonfirmasi' : 'Pesanan ditolak',
      data: pesananUpdated,
    };
  }

  /**
   * Batalkan pesanan (hanya oleh pemesan, status harus tertunda)
   */
  async batalkanPesanan(id: string, idPemesan: string, alasan?: string) {
    console.log('\n❌ [PERCETAKAN] Membatalkan Pesanan');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🏷️  ID Pesanan:', id);
    console.log('👤 ID Pemesan:', idPemesan);
    console.log('📝 Alasan:', alasan || 'Tidak ada');

    const pesanan = await this.prisma.pesananCetak.findUnique({
      where: { id },
    });

    if (!pesanan) {
      throw new NotFoundException('Pesanan tidak ditemukan');
    }

    console.log('📦 Pesanan:', `${pesanan.nomorPesanan} - Status: ${pesanan.status}`);

    if (pesanan.idPemesan !== idPemesan) {
      throw new ForbiddenException('Anda tidak memiliki akses untuk membatalkan pesanan ini');
    }

    if (pesanan.status !== 'tertunda') {
      throw new BadRequestException('Hanya pesanan dengan status "tertunda" yang dapat dibatalkan');
    }

    const pesananUpdated = await this.prisma.pesananCetak.update({
      where: { id },
      data: {
        status: 'dibatalkan',
        catatan: alasan
          ? `${pesanan.catatan || ''}\n\nAlasan Pembatalan: ${alasan}`
          : pesanan.catatan,
      },
    });

    console.log('✅ Pesanan berhasil dibatalkan');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Log aktivitas
    await this.prisma.logAktivitas.create({
      data: {
        idPengguna: idPemesan,
        jenis: 'pesanan_cetak',
        aksi: 'batalkan',
        entitas: 'pesanan_cetak',
        idEntitas: id,
        deskripsi: `Membatalkan pesanan ${pesanan.nomorPesanan}`,
      },
    });

    return {
      sukses: true,
      pesan: 'Pesanan berhasil dibatalkan',
      data: pesananUpdated,
    };
  }

  /**
   * Update status pesanan (oleh percetakan)
   * Flow: diterima → dalam_produksi → kontrol_kualitas → siap → dikirim → terkirim
   */
  async updateStatusPesanan(id: string, idPercetakan: string, dto: UpdateStatusDto) {
    const pesanan = await this.prisma.pesananCetak.findUnique({
      where: { id },
      include: {
        naskah: {
          select: {
            judul: true,
            penulis: {
              select: {
                id: true,
                email: true,
                profilPengguna: {
                  select: {
                    namaDepan: true,
                    namaBelakang: true,
                    namaTampilan: true,
                  },
                },
              },
            },
          },
        },
        pengiriman: true,
      },
    });

    if (!pesanan) {
      throw new NotFoundException('Pesanan tidak ditemukan');
    }

    if (pesanan.idPercetakan !== idPercetakan) {
      throw new ForbiddenException('Anda tidak memiliki akses untuk memperbarui pesanan ini');
    }

    // Validasi status flow
    const validTransitions: Record<string, string[]> = {
      diterima: ['dalam_produksi'],
      dalam_produksi: ['kontrol_kualitas'],
      kontrol_kualitas: ['siap', 'dalam_produksi'], // bisa kembali ke produksi jika QC gagal
      siap: ['dikirim'],
      dikirim: ['terkirim'],
    };

    const currentStatus = pesanan.status;
    const allowedNextStatuses = validTransitions[currentStatus];

    if (!allowedNextStatuses || !allowedNextStatuses.includes(dto.status)) {
      throw new BadRequestException(
        `Transisi status dari "${currentStatus}" ke "${dto.status}" tidak valid`,
      );
    }

    // Update pesanan
    const updateData: any = {
      status: dto.status,
    };

    if (dto.estimasiSelesai) {
      updateData.estimasiSelesai = new Date(dto.estimasiSelesai);
    }

    const pesananUpdated = await this.prisma.pesananCetak.update({
      where: { id },
      data: updateData,
      include: {
        naskah: {
          select: {
            judul: true,
            penulis: {
              select: {
                id: true,
                email: true,
                profilPengguna: {
                  select: {
                    namaDepan: true,
                    namaBelakang: true,
                    namaTampilan: true,
                  },
                },
              },
            },
          },
        },
        pengiriman: true,
      },
    });

    // Buat log produksi
    const labelStatus: Record<string, string> = {
      diterima: 'Pesanan Diterima',
      dalam_produksi: 'Proses Produksi',
      kontrol_kualitas: 'Kontrol Kualitas',
      siap: 'Siap Kirim',
      dikirim: 'Dikirim',
      terkirim: 'Diterima Pelanggan',
    };

    await this.prisma.logProduksi.create({
      data: {
        idPesanan: id,
        tahapan: labelStatus[dto.status] || dto.status,
        deskripsi: dto.catatan || `Status pesanan diperbarui menjadi ${dto.status}`,
      },
    });

    // Log aktivitas
    await this.prisma.logAktivitas.create({
      data: {
        idPengguna: idPercetakan,
        jenis: 'pesanan_cetak',
        aksi: 'update_status',
        entitas: 'pesanan_cetak',
        idEntitas: id,
        deskripsi: `Memperbarui status pesanan ${pesanan.nomorPesanan} menjadi ${dto.status}`,
      },
    });

    // 🔔 PRIORITY 1: Email & WebSocket Notification saat status = "terkirim"
    if (dto.status === 'terkirim' && pesananUpdated.pengiriman) {
      this.logger.log(`📧 Mengirim email & notifikasi untuk pesanan terkirim: ${pesanan.nomorPesanan}`);

      const penulis = pesananUpdated.naskah.penulis;
      const namaPenerima = penulis.profilPengguna?.namaTampilan ||
        `${penulis.profilPengguna?.namaDepan || ''} ${penulis.profilPengguna?.namaBelakang || ''}`.trim() ||
        'Pengguna';

      // Format tanggal estimasi sampai
      const estimasiSampai = pesananUpdated.pengiriman.estimasiTiba
        ? format(new Date(pesananUpdated.pengiriman.estimasiTiba), 'd MMMM yyyy', { locale: idLocale })
        : 'Segera';

      // Kirim email notification
      try {
        await this.emailService.kirimEmailPesananDikirim({
          emailPenerima: penulis.email,
          namaPenerima,
          nomorPesanan: pesananUpdated.nomorPesanan,
          judulBuku: pesananUpdated.naskah.judul,
          nomorResi: pesananUpdated.pengiriman.nomorResi || '-',
          kurir: pesananUpdated.pengiriman.namaEkspedisi,
          estimasiSampai,
        });

        this.logger.log(`✅ Email pesanan dikirim terkirim ke ${penulis.email}`);
      } catch (error) {
        this.logger.error(`❌ Gagal kirim email: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      // Kirim database notification
      try {
        const notifikasi = await this.notifikasiService.kirimNotifikasi({
          idPengguna: penulis.id,
          judul: 'Pesanan Telah Dikirim! 📦',
          pesan: `Pesanan "${pesananUpdated.naskah.judul}" telah dikirim dengan resi ${pesananUpdated.pengiriman.nomorResi}. Estimasi tiba: ${estimasiSampai}.`,
          tipe: 'info',
          url: `/penulis/pesanan-cetak`,
        });

        // Emit via WebSocket
        await this.notifikasiGateway.emitKeUser(penulis.id, notifikasi.data);

        this.logger.log(`✅ WebSocket notification dikirim ke user ${penulis.id}`);
      } catch (error) {
        this.logger.error(`❌ Gagal kirim notifikasi: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return {
      sukses: true,
      pesan: `Status pesanan berhasil diperbarui menjadi "${dto.status}"`,
      data: pesananUpdated,
    };
  }

  /**
   * Buat data pengiriman untuk pesanan
   * Status pesanan harus 'siap' atau 'dikirim'
   */
  async buatPengiriman(id: string, idPercetakan: string, dto: BuatPengirimanDto) {
    console.log('\n🚚 [PERCETAKAN] Membuat Data Pengiriman');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🏷️  ID Pesanan:', id);
    console.log('🏭 ID Percetakan:', idPercetakan);
    console.log('📦 Ekspedisi:', dto.namaEkspedisi);
    console.log('📝 Nomor Resi:', dto.nomorResi || 'Belum ada');

    const pesanan = await this.prisma.pesananCetak.findUnique({
      where: { id },
      include: {
        pengiriman: true,
      },
    });

    if (!pesanan) {
      throw new NotFoundException('Pesanan tidak ditemukan');
    }

    console.log('📦 Status Pesanan:', pesanan.status);
    console.log('📍 Pengiriman Existing:', pesanan.pengiriman ? 'Sudah ada' : 'Belum ada');

    if (pesanan.idPercetakan !== idPercetakan) {
      throw new ForbiddenException('Anda tidak memiliki akses untuk pesanan ini');
    }

    if (pesanan.status !== 'siap' && pesanan.status !== 'dikirim') {
      throw new BadRequestException(
        'Pengiriman hanya dapat dibuat untuk pesanan dengan status "siap" atau "dikirim"',
      );
    }

    if (pesanan.pengiriman) {
      throw new BadRequestException('Pesanan ini sudah memiliki data pengiriman');
    }

    const pengiriman = await this.prisma.pengiriman.create({
      data: {
        idPesanan: id,
        namaEkspedisi: dto.namaEkspedisi,
        nomorResi: dto.nomorResi,
        biayaPengiriman: new Decimal(dto.biayaPengiriman),
        alamatTujuan: dto.alamatTujuan,
        namaPenerima: dto.namaPenerima,
        teleponPenerima: dto.teleponPenerima,
        status: 'diproses',
        tanggalKirim: new Date(),
        estimasiTiba: dto.estimasiTiba ? new Date(dto.estimasiTiba) : undefined,
      },
    });

    // Update status pesanan menjadi 'dikirim' jika masih 'siap'
    if (pesanan.status === 'siap') {
      await this.prisma.pesananCetak.update({
        where: { id },
        data: {
          status: 'dikirim',
        },
      });

      // Buat log produksi
      await this.prisma.logProduksi.create({
        data: {
          idPesanan: id,
          tahapan: 'Dikirim',
          deskripsi: `Pesanan dikirim melalui ${dto.namaEkspedisi}${dto.nomorResi ? ` dengan resi ${dto.nomorResi}` : ''}`,
        },
      });
    }

    // Log aktivitas
    await this.prisma.logAktivitas.create({
      data: {
        idPengguna: idPercetakan,
        jenis: 'pengiriman',
        aksi: 'buat',
        entitas: 'pengiriman',
        idEntitas: pengiriman.id,
        deskripsi: `Membuat data pengiriman untuk pesanan ${pesanan.nomorPesanan}`,
      },
    });

    return {
      sukses: true,
      pesan: 'Data pengiriman berhasil dibuat',
      data: pengiriman,
    };
  }

  /**
   * Hitung biaya cetak berdasarkan spesifikasi
   * Formula: (biayaDasar × jumlah) + biayaKertas + biayaCover + biayaFinishing
   */
  async hitungBiayaCetak(spec: {
    jumlah: number;
    formatKertas: string;
    jenisKertas: string;
    jenisCover: string;
    finishingTambahan: string[];
    jumlahHalaman: number;
  }): Promise<number> {
    // Biaya dasar per halaman (dalam rupiah)
    const biayaPerHalaman = 100;
    const biayaDasar = spec.jumlahHalaman * biayaPerHalaman * spec.jumlah;

    // Biaya format kertas
    const biayaFormat: Record<string, number> = {
      A4: 500,
      A5: 300,
      B5: 400,
      Letter: 500,
      Custom: 1000,
    };
    const biayaFormatTotal = (biayaFormat[spec.formatKertas] || 500) * spec.jumlah;

    // Biaya jenis kertas per eksemplar
    const biayaKertas: Record<string, number> = {
      'HVS 70gr': 2000,
      'HVS 80gr': 2500,
      'Art Paper 120gr': 5000,
      'Art Paper 150gr': 7000,
      Bookpaper: 4000,
    };
    const biayaKertasTotal = (biayaKertas[spec.jenisKertas] || 2500) * spec.jumlah;

    // Biaya cover per eksemplar
    const biayaCover: Record<string, number> = {
      'Soft Cover': 5000,
      'Hard Cover': 15000,
      'Board Cover': 10000,
    };
    const biayaCoverTotal = (biayaCover[spec.jenisCover] || 5000) * spec.jumlah;

    // Biaya finishing per eksemplar
    const biayaFinishing: Record<string, number> = {
      'Laminasi Glossy': 3000,
      'Laminasi Doff': 3000,
      Emboss: 5000,
      Deboss: 5000,
      'Spot UV': 7000,
      Foil: 10000,
      'Tidak Ada': 0,
    };

    const biayaFinishingTotal = spec.finishingTambahan.reduce((total, finishing) => {
      return total + (biayaFinishing[finishing] || 0) * spec.jumlah;
    }, 0);

    // Total harga
    const totalHarga =
      biayaDasar + biayaFormatTotal + biayaKertasTotal + biayaCoverTotal + biayaFinishingTotal;

    return Math.round(totalHarga);
  }

  /**
   * Ambil statistik pesanan
   * Total pesanan, revenue, status breakdown
   */
  async ambilStatistikPesanan(idPengguna?: string, peran?: string) {
    const where: any = {};

    // Filter berdasarkan peran
    if (peran === 'penulis' && idPengguna) {
      where.idPemesan = idPengguna;
    } else if (peran === 'percetakan' && idPengguna) {
      where.idPercetakan = idPengguna;
    }

    // Hitung tanggal awal bulan ini
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [
      totalPesanan,
      pesananTertunda,
      pesananDalamProduksi,
      pesananSelesai,
      revenueBulanIni,
      pesananBulanIni,
    ] = await Promise.all([
      // Total semua pesanan
      this.prisma.pesananCetak.count({ where }),

      // Pesanan tertunda
      this.prisma.pesananCetak.count({
        where: {
          ...where,
          status: 'tertunda',
        },
      }),

      // Pesanan dalam produksi
      this.prisma.pesananCetak.count({
        where: {
          ...where,
          status: 'dalam_produksi',
        },
      }),

      // Pesanan selesai (terkirim)
      this.prisma.pesananCetak.count({
        where: {
          ...where,
          status: 'terkirim',
        },
      }),

      // Revenue bulan ini
      this.prisma.pesananCetak.aggregate({
        where: {
          ...where,
          status: {
            not: 'dibatalkan',
          },
          tanggalPesan: {
            gte: startOfMonth,
          },
        },
        _sum: {
          hargaTotal: true,
        },
      }),

      // Pesanan bulan ini
      this.prisma.pesananCetak.count({
        where: {
          ...where,
          tanggalPesan: {
            gte: startOfMonth,
          },
        },
      }),
    ]);

    // Hitung tingkat penyelesaian
    const tingkatPenyelesaian =
      totalPesanan > 0 ? Math.round((pesananSelesai / totalPesanan) * 100) : 0;

    // Hitung rata-rata waktu produksi (placeholder - bisa ditingkatkan dengan data real)
    const rataRataWaktuProduksi = 5; // 5 hari (default)

    // Console log detail untuk debugging
    console.log('\n🖨️  [PERCETAKAN] Statistik Pesanan');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 Filter Query:', JSON.stringify(where, null, 2));
    console.log('📅 Start of Month:', startOfMonth.toISOString());
    console.log('\n📈 Hasil Query:');
    console.log('  - Total Pesanan:', totalPesanan);
    console.log('  - Pesanan Tertunda:', pesananTertunda);
    console.log('  - Pesanan Dalam Produksi:', pesananDalamProduksi);
    console.log('  - Pesanan Selesai:', pesananSelesai);
    console.log('  - Revenue Bulan Ini:', revenueBulanIni._sum.hargaTotal || 0);
    console.log('  - Pesanan Bulan Ini:', pesananBulanIni);
    console.log('  - Tingkat Penyelesaian:', tingkatPenyelesaian + '%');
    console.log('  - Rata-rata Waktu Produksi:', rataRataWaktuProduksi, 'hari');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    return {
      sukses: true,
      data: {
        totalPesanan,
        pesananTertunda,
        pesananDalamProduksi,
        pesananSelesai,
        revenueBulanIni: Number(revenueBulanIni._sum.hargaTotal || 0),
        pesananBulanIni,
        tingkatPenyelesaian,
        rataRataWaktuProduksi,
      },
    };
  }

  /**
   * ============================================
   * TARIF PERCETAKAN - CRUD Operations (DEPRECATED)
   * Use buatKombinasiTarif instead
   * ============================================
   */

  /**
   * @deprecated Use buatKombinasiTarif instead
   */
  async buatTarif(idPercetakan: string, dto: any) {
    throw new BadRequestException(
      'Method deprecated. Use buatKombinasiTarif instead.',
    );
  }

  /**
   * Ambil semua tarif percetakan
   */
  async ambilSemuaTarif(idPercetakan?: string, aktif?: boolean) {
    const where: any = {};
    
    return this.ambilSemuaKombinasi(idPercetakan || '');
  }

  /**
   * @deprecated Use parameterHargaPercetakan instead
   */
  async ambilTarifById(id: string) {
    const tarif = await this.prisma.parameterHargaPercetakan.findUnique({
      where: { id },
      include: {
        percetakan: {
          select: {
            id: true,
            email: true,
            profilPengguna: true,
          },
        },
      },
    });

    if (!tarif) {
      throw new NotFoundException('Tarif tidak ditemukan');
    }

    return {
      sukses: true,
      data: tarif,
    };
  }

  /**
   * @deprecated Table tarifPercetakan removed
   */
  async perbaruiTarif(id: string, idPercetakan: string, dto: any) {
    throw new BadRequestException(
      'Method deprecated. Use buatKombinasiTarif to create new tariff schemes.',
    );
  }

  /**
   * @deprecated Use hapusKombinasi instead
   */
  async hapusTarif(id: string, idPercetakan: string) {
    return this.hapusKombinasi(id);
  }

  /**
   * ============================================
   * KALKULASI HARGA & PESANAN BARU
   * ============================================
   */

  /**
   * @deprecated tarifPercetakan table removed. Use kalkulasiHargaOtomatis instead
   */
  async kalkulasiOpsiHarga(dto: any) {
    throw new BadRequestException(
      'Method deprecated. Use kalkulasiHargaOtomatis instead.',
    );
  }

  /**
   * @deprecated Use buatPesanan instead
   */
  async buatPesananBaru(idPenulis: string, dto: any) {
    return this.buatPesanan(idPenulis, dto);
  }

  /**
   * Ambil pesanan untuk percetakan dengan filter status
   */
  async ambilPesananPercetakan(idPercetakan: string, status?: string) {
    const where: any = { idPercetakan };
    
    if (status) {
      if (status === 'baru') {
        where.status = { in: ['tertunda', 'diterima'] };
      } else if (status === 'produksi') {
        // Include pesanan yang baru diterima + dalam produksi + kontrol kualitas
        where.status = { in: ['diterima', 'dalam_produksi', 'kontrol_kualitas'] };
      } else if (status === 'pengiriman') {
        where.status = { in: ['siap', 'dikirim'] };
      } else if (status === 'selesai') {
        where.status = { in: ['terkirim', 'dibatalkan'] };
      } else {
        where.status = status;
      }
    }

    const pesanan = await this.prisma.pesananCetak.findMany({
      where,
      include: {
        naskah: {
          select: {
            id: true,
            judul: true,
            urlSampul: true,
            urlFile: true,
          },
        },
        pemesan: {
          select: {
            id: true,
            email: true,
            profilPengguna: true,
          },
        },
        pengiriman: true,
        pembayaran: true,
      },
      orderBy: {
        tanggalPesan: 'desc',
      },
    });

    return {
      sukses: true,
      data: pesanan,
      total: pesanan.length,
    };
  }

  // ============================================
  // PARAMETER HARGA MANAGEMENT
  // ============================================

  /**
   * Buat atau update parameter harga percetakan
   * Satu percetakan hanya punya 1 set parameter harga
   */
  async simpanParameterHarga(idPercetakan: string, dto: any) {
    console.log('\n💰 [PERCETAKAN] Simpan Parameter Harga');
    console.log('🏢 ID Percetakan:', idPercetakan);

    // Check existing parameter
    const existing = await this.prisma.parameterHargaPercetakan.findFirst({
      where: { idPercetakan },
    });

    if (existing) {
      // Update existing parameter
      const updated = await this.prisma.parameterHargaPercetakan.update({
        where: { id: existing.id },
        data: {
          hargaKertasA4: new Decimal(dto.hargaKertasA4),
          hargaKertasA5: new Decimal(dto.hargaKertasA5),
          hargaKertasB5: dto.hargaKertasB5 ? new Decimal(dto.hargaKertasB5) : new Decimal(0),
          hargaSoftcover: new Decimal(dto.hargaSoftcover),
          hargaHardcover: new Decimal(dto.hargaHardcover),
          biayaJilid: new Decimal(dto.biayaJilid),
          minimumPesanan: dto.minimumPesanan,
        },
      });

      return {
        sukses: true,
        pesan: 'Parameter harga berhasil diperbarui',
        data: updated,
      };
    } else {
      // Create new parameter
      const created = await this.prisma.parameterHargaPercetakan.create({
        data: {
          idPercetakan,
          hargaKertasA4: new Decimal(dto.hargaKertasA4),
          hargaKertasA5: new Decimal(dto.hargaKertasA5),
          hargaKertasB5: dto.hargaKertasB5 ? new Decimal(dto.hargaKertasB5) : new Decimal(0),
          hargaSoftcover: new Decimal(dto.hargaSoftcover),
          hargaHardcover: new Decimal(dto.hargaHardcover),
          biayaJilid: new Decimal(dto.biayaJilid),
          minimumPesanan: dto.minimumPesanan,
        },
      });

      return {
        sukses: true,
        pesan: 'Parameter harga berhasil dibuat',
        data: created,
      };
    }
  }

  /**
   * Ambil parameter harga percetakan
   */
  async ambilParameterHarga(idPercetakan: string) {
    const parameter = await this.prisma.parameterHargaPercetakan.findFirst({
      where: { idPercetakan },
      include: {
        percetakan: {
          select: {
            id: true,
            email: true,
            profilPengguna: {
              select: {
                namaDepan: true,
                namaBelakang: true,
                namaTampilan: true,
              },
            },
          },
        },
      },
    });

    if (!parameter) {
      throw new NotFoundException('Parameter harga belum diatur');
    }

    return {
      sukses: true,
      data: parameter,
    };
  }

  // ============================================
  // KOMBINASI TARIF MANAGEMENT
  // ============================================

  /**
   * Buat skema tarif baru
   * Langsung save ke ParameterHargaPercetakan dengan semua komponen harga
   */
  async buatKombinasiTarif(idPercetakan: string, dto: any) {
    console.log('\n🎯 [PERCETAKAN] Buat Skema Tarif');
    console.log('📝 Data:', JSON.stringify(dto, null, 2));

    // Jika aktif = true (default), nonaktifkan skema lain
    if (dto.aktif !== false) {
      await this.prisma.parameterHargaPercetakan.updateMany({
        where: { idPercetakan, aktif: true },
        data: { aktif: false },
      });
    }

    // Buat skema tarif baru
    const skemaTarif = await this.prisma.parameterHargaPercetakan.create({
      data: {
        idPercetakan,
        namaKombinasi: dto.namaKombinasi,
        deskripsi: dto.deskripsi,
        hargaKertasA4: new Decimal(dto.hargaKertasA4),
        hargaKertasA5: new Decimal(dto.hargaKertasA5),
        hargaKertasB5: new Decimal(dto.hargaKertasB5 || 0),
        hargaSoftcover: new Decimal(dto.hargaSoftcover),
        hargaHardcover: new Decimal(dto.hargaHardcover),
        biayaJilid: new Decimal(dto.biayaJilid),
        minimumPesanan: dto.minimumPesanan,
        aktif: dto.aktif !== false, // Default true
      },
      include: {
        percetakan: {
          select: {
            id: true,
            email: true,
            profilPengguna: true,
          },
        },
      },
    });

    console.log('✅ Skema tarif berhasil dibuat:', skemaTarif.namaKombinasi);

    return {
      sukses: true,
      pesan: 'Skema tarif berhasil dibuat',
      data: skemaTarif,
    };
  }

  /**
   * Ambil semua skema tarif percetakan
   */
  async ambilSemuaKombinasi(idPercetakan: string) {
    const skemaTarif = await this.prisma.parameterHargaPercetakan.findMany({
      where: { idPercetakan },
      include: {
        percetakan: {
          select: {
            id: true,
            email: true,
            profilPengguna: true,
          },
        },
      },
      orderBy: [
        { aktif: 'desc' }, // Aktif di atas
        { dibuatPada: 'desc' },
      ],
    });

    return {
      sukses: true,
      data: skemaTarif,
      total: skemaTarif.length,
    };
  }

  /**
   * Toggle status aktif skema tarif
   * Hanya 1 skema yang boleh aktif per percetakan
   */
  async toggleAktifKombinasi(idKombinasi: string, aktif: boolean) {
    console.log('\n🔄 [PERCETAKAN] Toggle Aktif Skema Tarif');

    const skemaTarif = await this.prisma.parameterHargaPercetakan.findUnique({
      where: { id: idKombinasi },
    });

    if (!skemaTarif) {
      throw new NotFoundException('Skema tarif tidak ditemukan');
    }

    // Jika mau aktifkan, nonaktifkan skema lain dulu
    if (aktif) {
      await this.prisma.parameterHargaPercetakan.updateMany({
        where: {
          idPercetakan: skemaTarif.idPercetakan,
          id: { not: idKombinasi },
        },
        data: { aktif: false },
      });
    }

    // Update skema ini
    const updated = await this.prisma.parameterHargaPercetakan.update({
      where: { id: idKombinasi },
      data: { aktif },
    });

    return {
      sukses: true,
      pesan: aktif
        ? 'Skema tarif berhasil diaktifkan'
        : 'Skema tarif berhasil dinonaktifkan',
      data: updated,
    };
  }

  /**
   * Hapus skema tarif
   */
  async hapusKombinasi(idKombinasi: string) {
    const skemaTarif = await this.prisma.parameterHargaPercetakan.findUnique({
      where: { id: idKombinasi },
    });

    if (!skemaTarif) {
      throw new NotFoundException('Skema tarif tidak ditemukan');
    }

    await this.prisma.parameterHargaPercetakan.delete({
      where: { id: idKombinasi },
    });

    return {
      sukses: true,
      pesan: 'Kombinasi tarif berhasil dihapus',
    };
  }

  /**
   * Kalkulasi harga otomatis berdasarkan spesifikasi pesanan
   * Menggunakan skema tarif yang aktif dari percetakan
   */
  async kalkulasiHargaOtomatis(idPercetakan: string, dto: any) {
    console.log('\n💰 [PERCETAKAN] Kalkulasi Harga Otomatis');

    // Cari skema tarif yang aktif
    const skemaTarif = await this.prisma.parameterHargaPercetakan.findFirst({
      where: {
        idPercetakan,
        aktif: true,
      },
      include: {
        percetakan: {
          select: {
            id: true,
            email: true,
            profilPengguna: true,
          },
        },
      },
    });

    if (!skemaTarif) {
      throw new NotFoundException(
        'Skema tarif tidak ditemukan atau belum diaktifkan',
      );
    }

    // Tentukan harga kertas berdasarkan format
    let hargaKertasPerLembar = 0;
    if (dto.formatBuku === 'A4') {
      hargaKertasPerLembar = Number(skemaTarif.hargaKertasA4);
    } else if (dto.formatBuku === 'A5') {
      hargaKertasPerLembar = Number(skemaTarif.hargaKertasA5);
    } else if (dto.formatBuku === 'B5') {
      hargaKertasPerLembar = Number(skemaTarif.hargaKertasB5);
    }

    // Tentukan harga cover berdasarkan jenis
    let hargaCoverPerUnit = 0;
    if (dto.jenisCover === 'SOFTCOVER') {
      hargaCoverPerUnit = Number(skemaTarif.hargaSoftcover);
    } else if (dto.jenisCover === 'HARDCOVER') {
      hargaCoverPerUnit = Number(skemaTarif.hargaHardcover);
    }

    // Hitung total harga
    const hargaKertas = hargaKertasPerLembar * dto.jumlahHalaman * dto.jumlahBuku;
    const hargaCover = hargaCoverPerUnit * dto.jumlahBuku;
    const hargaJilid = dto.denganJilid ? Number(skemaTarif.biayaJilid) * dto.jumlahBuku : 0;

    const totalHarga = hargaKertas + hargaCover + hargaJilid;

    return {
      sukses: true,
      data: {
        skemaTarif: {
          id: skemaTarif.id,
          namaKombinasi: skemaTarif.namaKombinasi,
        },
        spesifikasi: {
          formatBuku: dto.formatBuku,
          jenisKertas: dto.jenisKertas,
          jenisCover: dto.jenisCover,
          jumlahHalaman: dto.jumlahHalaman,
          jumlahBuku: dto.jumlahBuku,
          denganJilid: dto.denganJilid,
        },
        rincianHarga: {
          hargaKertasPerLembar,
          totalHargaKertas: hargaKertas,
          hargaCoverPerUnit,
          totalHargaCover: hargaCover,
          biayaJilidPerBuku: Number(skemaTarif.biayaJilid),
          totalBiayaJilid: hargaJilid,
        },
        totalHarga,
        minimumPesanan: skemaTarif.minimumPesanan,
      },
    };
  }

  /**
   * 🎯 PRIORITY 1: Konfirmasi penerimaan pesanan oleh penulis
   * Update status dari "terkirim" menjadi "selesai"
   * Kirim email notification dan WebSocket update
   * 
   * Endpoint: POST /api/pesanan/:id/konfirmasi-terima
   */
  async konfirmasiPenerimaanPesanan(id: string, idPenulis: string, dto: KonfirmasiPenerimaanDto) {
    this.logger.log(`\n✅ [KONFIRMASI] Penulis konfirmasi penerimaan pesanan: ${id}`);
    this.logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Ambil pesanan dengan relasi lengkap
    const pesanan = await this.prisma.pesananCetak.findUnique({
      where: { id },
      include: {
        naskah: {
          select: {
            judul: true,
            penulis: {
              select: {
                id: true,
                email: true,
                profilPengguna: {
                  select: {
                    namaDepan: true,
                    namaBelakang: true,
                    namaTampilan: true,
                  },
                },
              },
            },
          },
        },
        pengiriman: true,
        percetakan: {
          select: {
            id: true,
            email: true,
            profilPengguna: {
              select: {
                namaDepan: true,
                namaBelakang: true,
                namaTampilan: true,
              },
            },
          },
        },
      },
    });

    if (!pesanan) {
      throw new NotFoundException('Pesanan tidak ditemukan');
    }

    // Validasi: hanya pemesan yang bisa konfirmasi
    if (pesanan.idPemesan !== idPenulis) {
      throw new ForbiddenException('Anda tidak memiliki akses untuk konfirmasi pesanan ini');
    }

    // Validasi: status harus "terkirim"
    if (pesanan.status !== 'terkirim') {
      throw new BadRequestException(
        `Pesanan hanya bisa dikonfirmasi jika status "terkirim". Status saat ini: "${pesanan.status}"`,
      );
    }

    this.logger.log(`📦 Pesanan: ${pesanan.nomorPesanan}`);
    this.logger.log(`📖 Buku: ${pesanan.naskah.judul}`);
    this.logger.log(`👤 Penulis: ${idPenulis}`);

    // Update status menjadi "selesai"
    const tanggalSelesai = new Date();
    const pesananUpdated = await this.prisma.pesananCetak.update({
      where: { id },
      data: {
        status: 'selesai',
        tanggalSelesai,
        catatanPenerimaan: dto.catatan || null,
      },
    });

    // Buat log produksi
    await this.prisma.logProduksi.create({
      data: {
        idPesanan: id,
        tahapan: 'Pesanan Selesai',
        deskripsi: dto.catatan
          ? `Pesanan dikonfirmasi selesai oleh penulis. Catatan: ${dto.catatan}`
          : 'Pesanan dikonfirmasi selesai oleh penulis',
      },
    });

    // Log aktivitas penulis
    await this.prisma.logAktivitas.create({
      data: {
        idPengguna: idPenulis,
        jenis: 'pesanan_cetak',
        aksi: 'konfirmasi_penerimaan',
        entitas: 'pesanan_cetak',
        idEntitas: id,
        deskripsi: `Mengkonfirmasi penerimaan pesanan ${pesanan.nomorPesanan}`,
      },
    });

    this.logger.log(`✅ Status updated: terkirim → selesai`);

    // 🔔 PRIORITY 1: Email & WebSocket Notification saat konfirmasi selesai
    // Gunakan data dari pesanan awal yang sudah include naskah
    const penulis = pesanan.naskah.penulis;
    const namaPenerima = penulis.profilPengguna?.namaTampilan ||
      `${penulis.profilPengguna?.namaDepan || ''} ${penulis.profilPengguna?.namaBelakang || ''}`.trim() ||
      'Pengguna';

    const tanggalSelesaiStr = format(tanggalSelesai, 'd MMMM yyyy, HH:mm', { locale: idLocale });

    // Kirim email notification ke penulis
    try {
      await this.emailService.kirimEmailPesananSelesai({
        emailPenerima: penulis.email,
        namaPenerima,
        nomorPesanan: pesanan.nomorPesanan,
        judulBuku: pesanan.naskah.judul,
        tanggalSelesai: tanggalSelesaiStr,
      });

      this.logger.log(`✅ Email pesanan selesai terkirim ke ${penulis.email}`);
    } catch (error) {
      this.logger.error(`❌ Gagal kirim email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Kirim database notification ke penulis
    try {
      const notifikasiPenulis = await this.notifikasiService.kirimNotifikasi({
        idPengguna: penulis.id,
        judul: 'Pesanan Selesai! 🎉',
        pesan: `Terima kasih telah mengkonfirmasi penerimaan "${pesanan.naskah.judul}". Pesanan Anda telah selesai dengan sukses.`,
        tipe: 'sukses',
        url: `/penulis/pesanan-cetak`,
      });

      // Emit via WebSocket ke penulis
      await this.notifikasiGateway.emitKeUser(penulis.id, notifikasiPenulis.data);

      this.logger.log(`✅ WebSocket notification dikirim ke penulis ${penulis.id}`);
    } catch (error) {
      this.logger.error(`❌ Gagal kirim notifikasi ke penulis: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Kirim notifikasi ke percetakan juga
    if (pesanan.percetakan) {
      try {
        const namaPercetakan = pesanan.percetakan.profilPengguna?.namaTampilan ||
          `${pesanan.percetakan.profilPengguna?.namaDepan || ''} ${pesanan.percetakan.profilPengguna?.namaBelakang || ''}`.trim() ||
          'Percetakan';

        const notifikasiPercetakan = await this.notifikasiService.kirimNotifikasi({
          idPengguna: pesanan.percetakan.id,
          judul: 'Pesanan Dikonfirmasi Diterima ✅',
          pesan: `Penulis telah mengkonfirmasi penerimaan pesanan ${pesanan.nomorPesanan} untuk buku "${pesanan.naskah.judul}". Pesanan selesai.`,
          tipe: 'sukses',
          url: `/percetakan/pesanan/${id}`,
        });

        // Emit via WebSocket ke percetakan
        await this.notifikasiGateway.emitKeUser(pesanan.percetakan.id, notifikasiPercetakan.data);

        this.logger.log(`✅ WebSocket notification dikirim ke percetakan ${pesanan.percetakan.id}`);
      } catch (error) {
        this.logger.error(`❌ Gagal kirim notifikasi ke percetakan: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    this.logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    return {
      sukses: true,
      pesan: 'Terima kasih! Penerimaan pesanan telah dikonfirmasi. Status pesanan diperbarui menjadi "selesai".',
      data: pesananUpdated,
    };
  }
}
