/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { PercetakanService } from './percetakan.service';
import {
  BuatPesananDtoClass,
  PerbaruiPesananDtoClass,
  FilterPesananDtoClass,
  UpdateStatusDtoClass,
  BuatPengirimanDtoClass,
  KonfirmasiPesananDtoClass,
  KonfirmasiPenerimaanDtoClass,
} from './dto';
import { BuatTarifDto } from './dto/buat-tarif.dto';
import { PerbaruiTarifDto } from './dto/perbarui-tarif.dto';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PeranGuard } from '@/modules/auth/guards/roles.guard';
import { Peran } from '@/modules/auth/decorators/peran.decorator';
import { PenggunaSaatIni } from '@/modules/auth/decorators/pengguna-saat-ini.decorator';
import { Public } from '@/common/decorators/public.decorator';
import { ValidasiZodPipe } from '@/common/pipes/validasi-zod.pipe';
import {
  BuatPesananSchema,
  BuatPesananDto,
  PerbaruiPesananSchema,
  FilterPesananSchema,
  UpdateStatusSchema,
  BuatPengirimanSchema,
  KonfirmasiPenerimaanSchema,
  KonfirmasiPesananSchema,
} from './dto';

/**
 * Controller untuk mengelola pesanan cetak buku
 * Endpoints untuk create, read, update, konfirmasi, dan tracking pesanan
 */
@ApiTags('percetakan')
@ApiBearerAuth()
@Controller('percetakan')
@UseGuards(JwtAuthGuard, PeranGuard)
export class PercetakanController {
  constructor(private readonly percetakanService: PercetakanService) {}

  /**
   * Health check endpoint (public, tidak perlu auth)
   * Untuk testing apakah module percetakan berjalan
   */
  @Get('health')
  @Public()
  @ApiOperation({ summary: 'Health check percetakan module' })
  @ApiResponse({ status: 200, description: 'Module percetakan berjalan dengan baik' })
  async healthCheck() {
    return {
      sukses: true,
      pesan: 'Module percetakan berjalan dengan baik',
      data: {
        timestamp: new Date().toISOString(),
        module: 'percetakan',
        status: 'healthy',
      },
    };
  }

  /**
   * Ambil daftar percetakan yang tersedia dengan info tarif
   * Untuk ditampilkan saat penulis akan membuat pesanan cetak
   */
  @Get('daftar')
  @Peran('penulis', 'admin')
  @ApiOperation({ summary: 'Ambil daftar percetakan yang tersedia dengan tarif aktif' })
  @ApiResponse({
    status: 200,
    description: 'Daftar percetakan berhasil diambil',
    schema: {
      example: {
        sukses: true,
        pesan: 'Daftar percetakan berhasil diambil',
        data: [
          {
            id: 'uuid-percetakan',
            nama: 'Percetakan ABC',
            alamat: 'Jl. Example No. 123',
            kota: 'Jakarta',
            tarifAktif: {
              id: 'uuid-tarif',
              namaKombinasi: 'Tarif Standar',
              hargaKertasA4: 500,
              hargaKertasA5: 350,
              hargaSoftcover: 5000,
              hargaHardcover: 15000,
              biayaJilid: 3000,
              minimumPesanan: 10,
            },
          },
        ],
        total: 1,
      },
    },
  })
  async ambilDaftarPercetakan() {
    return this.percetakanService.ambilDaftarPercetakan();
  }

  /**
   * Ambil detail tarif percetakan tertentu
   * Untuk kalkulasi harga sebelum buat pesanan
   */
  @Get('tarif/:id')
  @Peran('penulis', 'admin')
  @ApiOperation({ summary: 'Ambil detail tarif percetakan tertentu' })
  @ApiParam({ name: 'id', description: 'ID percetakan' })
  @ApiResponse({
    status: 200,
    description: 'Tarif percetakan berhasil diambil',
    schema: {
      example: {
        sukses: true,
        pesan: 'Tarif percetakan berhasil diambil',
        data: {
          percetakan: {
            id: 'uuid-percetakan',
            nama: 'Percetakan ABC',
          },
          tarif: {
            id: 'uuid-tarif',
            namaKombinasi: 'Tarif Standar',
            deskripsi: 'Tarif standar untuk pesanan reguler',
            hargaKertasA4: 500,
            hargaKertasA5: 350,
            hargaKertasB5: 400,
            hargaSoftcover: 5000,
            hargaHardcover: 15000,
            biayaJilid: 3000,
            minimumPesanan: 10,
          },
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Percetakan tidak ditemukan atau belum ada tarif aktif' })
  async ambilTarifPercetakan(@Param('id') idPercetakan: string) {
    return this.percetakanService.ambilTarifPercetakan(idPercetakan);
  }

  /**
   * Buat pesanan cetak baru dengan pilihan percetakan dan kalkulasi harga otomatis
   * Hanya untuk penulis yang memiliki naskah dengan status 'diterbitkan'
   */
  @Post('pesanan')
  @Peran('penulis')
  @ApiOperation({ summary: 'Buat pesanan cetak baru dengan pilihan percetakan' })
  @ApiResponse({
    status: 201,
    description: 'Pesanan cetak berhasil dibuat',
    schema: {
      example: {
        sukses: true,
        pesan: 'Pesanan cetak berhasil dibuat',
        data: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          nomorPesanan: 'PO-20240129-1234',
          jumlah: 100,
          hargaTotal: '15000000',
          status: 'tertunda',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Validasi gagal atau naskah tidak diterbitkan' })
  @ApiResponse({ status: 404, description: 'Naskah tidak ditemukan' })
  async buatPesanan(
    @PenggunaSaatIni('id') idPemesan: string,
    @Body(new ValidasiZodPipe(BuatPesananSchema)) dto: BuatPesananDtoClass,
  ) {
    return this.percetakanService.buatPesanan(idPemesan, dto as unknown as BuatPesananDto);
  }

  /**
   * Ambil daftar pesanan dengan filter
   * Admin: lihat semua, Percetakan: lihat yang ditugaskan, Penulis: lihat milik sendiri
   */
  @Get()
  @Peran('penulis', 'percetakan', 'admin')
  @ApiOperation({ summary: 'Ambil daftar pesanan dengan filter dan pagination' })
  @ApiQuery({ name: 'halaman', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: [
      'tertunda',
      'diterima',
      'dalam_produksi',
      'kontrol_kualitas',
      'siap',
      'dikirim',
      'terkirim',
      'dibatalkan',
    ],
  })
  @ApiQuery({ name: 'idPemesan', required: false, type: String })
  @ApiQuery({ name: 'idNaskah', required: false, type: String })
  @ApiQuery({ name: 'nomorPesanan', required: false, type: String })
  @ApiQuery({ name: 'tanggalMulai', required: false, type: String })
  @ApiQuery({ name: 'tanggalSelesai', required: false, type: String })
  @ApiQuery({ name: 'cari', required: false, type: String })
  @ApiQuery({
    name: 'urutkan',
    required: false,
    enum: ['tanggalPesan', 'hargaTotal', 'jumlah', 'status'],
  })
  @ApiQuery({ name: 'arah', required: false, enum: ['asc', 'desc'] })
  @ApiResponse({
    status: 200,
    description: 'Daftar pesanan berhasil diambil',
  })
  async ambilSemuaPesanan(
    @Query(new ValidasiZodPipe(FilterPesananSchema)) filter: FilterPesananDtoClass,
    @PenggunaSaatIni('id') idPengguna: string,
    @PenggunaSaatIni('peran') peran: string,
  ) {
    return this.percetakanService.ambilSemuaPesanan(filter, idPengguna, peran);
  }

  /**
   * Ambil pesanan milik penulis yang login
   * Shortcut untuk filter pesanan penulis
   */
  @Get('penulis/saya')
  @Peran('penulis')
  @ApiOperation({ summary: 'Ambil pesanan milik penulis yang login' })
  @ApiQuery({ name: 'halaman', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: [
      'tertunda',
      'diterima',
      'dalam_produksi',
      'kontrol_kualitas',
      'siap',
      'dikirim',
      'terkirim',
      'dibatalkan',
    ],
  })
  @ApiResponse({
    status: 200,
    description: 'Daftar pesanan penulis berhasil diambil',
  })
  async ambilPesananPenulis(
    @PenggunaSaatIni('id') idPenulis: string,
    @Query(new ValidasiZodPipe(FilterPesananSchema)) filter: FilterPesananDtoClass,
  ) {
    return this.percetakanService.ambilPesananPenulis(idPenulis, filter);
  }

  /**
   * Ambil statistik pesanan
   * Admin: semua, Percetakan: yang ditugaskan, Penulis: milik sendiri
   */
  @Get('statistik')
  @Peran('penulis', 'percetakan', 'admin')
  @ApiOperation({ summary: 'Ambil statistik pesanan' })
  @ApiResponse({
    status: 200,
    description: 'Statistik pesanan berhasil diambil',
    schema: {
      example: {
        sukses: true,
        data: {
          totalPesanan: 150,
          pesananTertunda: 10,
          pesananDalamProduksi: 12,
          pesananSelesai: 90,
          revenueBulanIni: 45000000,
          pesananBulanIni: 25,
          tingkatPenyelesaian: 60,
          rataRataWaktuProduksi: 5,
        },
      },
    },
  })
  async ambilStatistikPesanan(
    @PenggunaSaatIni('id') idPengguna: string,
    @PenggunaSaatIni('peran') peran: string,
  ) {
    return this.percetakanService.ambilStatistikPesanan(idPengguna, peran);
  }



  /**
   * Konfirmasi pesanan oleh percetakan
   * Status: tertunda → diterima/dibatalkan
   */
  @Put(':id/konfirmasi')
  @Peran('percetakan')
  @ApiOperation({ summary: 'Konfirmasi atau tolak pesanan oleh percetakan' })
  @ApiParam({ name: 'id', description: 'ID pesanan' })
  @ApiResponse({
    status: 200,
    description: 'Pesanan berhasil dikonfirmasi',
  })
  @ApiResponse({ status: 400, description: 'Status pesanan tidak tertunda' })
  @ApiResponse({ status: 404, description: 'Pesanan tidak ditemukan' })
  async konfirmasiPesanan(
    @Param('id') id: string,
    @PenggunaSaatIni('id') idPercetakan: string,
    @Body(new ValidasiZodPipe(KonfirmasiPesananSchema)) dto: KonfirmasiPesananDtoClass,
  ) {
    return this.percetakanService.konfirmasiPesanan(id, idPercetakan, dto);
  }

  /**
   * Update status pesanan
   * Flow: diterima → dalam_produksi → kontrol_kualitas → siap → dikirim → terkirim
   */
  @Put(':id/status')
  @Peran('percetakan')
  @ApiOperation({ summary: 'Update status pesanan (untuk tracking produksi)' })
  @ApiParam({ name: 'id', description: 'ID pesanan' })
  @ApiResponse({
    status: 200,
    description: 'Status pesanan berhasil diperbarui',
  })
  @ApiResponse({ status: 400, description: 'Transisi status tidak valid' })
  @ApiResponse({ status: 404, description: 'Pesanan tidak ditemukan' })
  @ApiResponse({ status: 403, description: 'Tidak memiliki akses' })
  async updateStatusPesanan(
    @Param('id') id: string,
    @PenggunaSaatIni('id') idPercetakan: string,
    @Body(new ValidasiZodPipe(UpdateStatusSchema)) dto: UpdateStatusDtoClass,
  ) {
    return this.percetakanService.updateStatusPesanan(id, idPercetakan, dto);
  }

  /**
   * Batalkan pesanan
   * Hanya untuk status 'tertunda'
   */
  @Put(':id/batal')
  @Peran('penulis')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Batalkan pesanan (hanya status tertunda)' })
  @ApiParam({ name: 'id', description: 'ID pesanan' })
  @ApiResponse({
    status: 200,
    description: 'Pesanan berhasil dibatalkan',
  })
  @ApiResponse({ status: 400, description: 'Status pesanan tidak tertunda' })
  @ApiResponse({ status: 404, description: 'Pesanan tidak ditemukan' })
  @ApiResponse({ status: 403, description: 'Tidak memiliki akses' })
  async batalkanPesanan(
    @Param('id') id: string,
    @PenggunaSaatIni('id') idPemesan: string,
    @Body('alasan') alasan?: string,
  ) {
    return this.percetakanService.batalkanPesanan(id, idPemesan, alasan);
  }

  /**
   * Buat data pengiriman untuk pesanan
   * Status harus 'siap' atau 'dikirim'
   */
  @Post(':id/pengiriman')
  @Peran('percetakan')
  @ApiOperation({ summary: 'Buat data pengiriman untuk pesanan' })
  @ApiParam({ name: 'id', description: 'ID pesanan' })
  @ApiResponse({
    status: 201,
    description: 'Data pengiriman berhasil dibuat',
  })
  @ApiResponse({ status: 400, description: 'Status pesanan tidak valid atau pengiriman sudah ada' })
  @ApiResponse({ status: 404, description: 'Pesanan tidak ditemukan' })
  @ApiResponse({ status: 403, description: 'Tidak memiliki akses' })
  async buatPengiriman(
    @Param('id') id: string,
    @PenggunaSaatIni('id') idPercetakan: string,
    @Body(new ValidasiZodPipe(BuatPengirimanSchema)) dto: BuatPengirimanDtoClass,
  ) {
    return this.percetakanService.buatPengiriman(id, idPercetakan, dto);
  }

  /**
   * ============================================
   * TARIF PERCETAKAN ENDPOINTS
   * ============================================
   */

  /**
   * Buat tarif percetakan baru
   */
  @Post('tarif')
  @Peran('percetakan')
  @ApiOperation({ summary: 'Buat tarif percetakan baru' })
  @ApiResponse({ status: 201, description: 'Tarif berhasil dibuat' })
  async buatTarif(
    @PenggunaSaatIni('id') idPercetakan: string,
    @Body() dto: BuatTarifDto,
  ) {
    return this.percetakanService.buatTarif(idPercetakan, dto);
  }

  /**
   * Ambil semua tarif percetakan
   */
  @Public()
  @Get('tarif')
  @ApiOperation({ summary: 'Ambil semua tarif percetakan' })
  @ApiQuery({ name: 'idPercetakan', required: false })
  @ApiQuery({ name: 'aktif', required: false, type: Boolean })
  async ambilSemuaTarif(
    @Query('idPercetakan') idPercetakan?: string,
    @Query('aktif') aktif?: string,
  ) {
    return this.percetakanService.ambilSemuaTarif(
      idPercetakan,
      aktif ? aktif === 'true' : undefined,
    );
  }

  /**
   * Ambil tarif by ID
   */
  @Public()
  @Get('tarif/:id')
  @ApiOperation({ summary: 'Ambil detail tarif' })
  @ApiParam({ name: 'id', description: 'ID tarif' })
  async ambilTarifById(@Param('id') id: string) {
    return this.percetakanService.ambilTarifById(id);
  }

  /**
   * Perbarui tarif
   */
  @Put('tarif/:id')
  @Peran('percetakan')
  @ApiOperation({ summary: 'Perbarui tarif percetakan' })
  @ApiParam({ name: 'id', description: 'ID tarif' })
  async perbaruiTarif(
    @Param('id') id: string,
    @PenggunaSaatIni('id') idPercetakan: string,
    @Body() dto: PerbaruiTarifDto,
  ) {
    return this.percetakanService.perbaruiTarif(id, idPercetakan, dto);
  }

  /**
   * Hapus tarif
   */
  @Put('tarif/:id/hapus')
  @Peran('percetakan')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Hapus tarif percetakan' })
  @ApiParam({ name: 'id', description: 'ID tarif' })
  async hapusTarif(
    @Param('id') id: string,
    @PenggunaSaatIni('id') idPercetakan: string,
  ) {
    return this.percetakanService.hapusTarif(id, idPercetakan);
  }

  /**
   * ============================================
   * PARAMETER HARGA & KOMBINASI TARIF (NEW SYSTEM)
   * ============================================
   */

  /**
   * Simpan parameter harga percetakan
   * Create jika belum ada, Update jika sudah ada
   */
  @Post('parameter-harga')
  @Peran('percetakan')
  @ApiOperation({ summary: 'Simpan parameter harga percetakan (create/update)' })
  @ApiResponse({
    status: 200,
    description: 'Parameter harga berhasil disimpan',
  })
  async simpanParameterHarga(
    @PenggunaSaatIni('id') idPercetakan: string,
    @Body() dto: any,
  ) {
    return this.percetakanService.simpanParameterHarga(idPercetakan, dto);
  }

  /**
   * Ambil parameter harga percetakan
   */
  @Get('parameter-harga')
  @Peran('percetakan')
  @ApiOperation({ summary: 'Ambil parameter harga percetakan' })
  @ApiResponse({
    status: 200,
    description: 'Parameter harga berhasil diambil',
  })
  @ApiResponse({
    status: 404,
    description: 'Parameter harga belum diatur',
  })
  async ambilParameterHarga(@PenggunaSaatIni('id') idPercetakan: string) {
    return this.percetakanService.ambilParameterHarga(idPercetakan);
  }

  /**
   * Buat kombinasi tarif baru dari parameter harga
   */
  @Post('kombinasi-tarif')
  @Peran('percetakan')
  @ApiOperation({ summary: 'Buat kombinasi tarif baru' })
  @ApiResponse({
    status: 201,
    description: 'Kombinasi tarif berhasil dibuat',
  })
  @ApiResponse({
    status: 400,
    description: 'Parameter harga belum diatur',
  })
  async buatKombinasiTarif(
    @PenggunaSaatIni('id') idPercetakan: string,
    @Body() dto: any,
  ) {
    return this.percetakanService.buatKombinasiTarif(idPercetakan, dto);
  }

  /**
   * Ambil semua kombinasi tarif percetakan
   */
  @Get('kombinasi-tarif')
  @Peran('percetakan')
  @ApiOperation({ summary: 'Ambil semua kombinasi tarif percetakan' })
  @ApiResponse({
    status: 200,
    description: 'Kombinasi tarif berhasil diambil',
  })
  async ambilSemuaKombinasi(@PenggunaSaatIni('id') idPercetakan: string) {
    return this.percetakanService.ambilSemuaKombinasi(idPercetakan);
  }

  /**
   * Toggle status aktif kombinasi tarif
   */
  @Put('kombinasi-tarif/:id/toggle-aktif')
  @Peran('percetakan')
  @ApiOperation({ summary: 'Toggle status aktif kombinasi tarif' })
  @ApiParam({ name: 'id', description: 'ID kombinasi tarif' })
  @ApiResponse({
    status: 200,
    description: 'Status aktif berhasil diubah',
  })
  @ApiResponse({
    status: 404,
    description: 'Kombinasi tarif tidak ditemukan',
  })
  async toggleAktifKombinasi(
    @Param('id') id: string,
    @Body() dto: { aktif: boolean },
  ) {
    return this.percetakanService.toggleAktifKombinasi(id, dto.aktif);
  }

  /**
   * Hapus kombinasi tarif
   */
  @Put('kombinasi-tarif/:id/hapus')
  @Peran('percetakan')
  @ApiOperation({ summary: 'Hapus kombinasi tarif' })
  @ApiParam({ name: 'id', description: 'ID kombinasi tarif' })
  @ApiResponse({
    status: 200,
    description: 'Kombinasi tarif berhasil dihapus',
  })
  @ApiResponse({
    status: 404,
    description: 'Kombinasi tarif tidak ditemukan',
  })
  async hapusKombinasi(@Param('id') id: string) {
    return this.percetakanService.hapusKombinasi(id);
  }

  /**
   * Kalkulasi harga otomatis berdasarkan spesifikasi
   */
  @Post('kalkulasi-harga-otomatis')
  @Peran('penulis', 'percetakan')
  @ApiOperation({ summary: 'Kalkulasi harga otomatis dari kombinasi aktif' })
  @ApiResponse({
    status: 200,
    description: 'Harga berhasil dikalkulasi',
  })
  @ApiResponse({
    status: 404,
    description: 'Kombinasi tarif tidak ditemukan untuk spesifikasi ini',
  })
  async kalkulasiHargaOtomatis(
    @Body() dto: any,
  ) {
    return this.percetakanService.kalkulasiHargaOtomatis(dto.idPercetakan, dto);
  }

  /**
   * ============================================
   * KALKULASI & PESANAN BARU
   * ============================================
   */

  /**
   * Kalkulasi opsi harga dari berbagai percetakan
   */
  @Post('kalkulasi-harga')
  @Peran('penulis')
  @ApiOperation({ summary: 'Kalkulasi estimasi harga dari berbagai percetakan' })
  async kalkulasiOpsiHarga(@Body() dto: any) {
    return this.percetakanService.kalkulasiOpsiHarga(dto);
  }

  /**
   * Buat pesanan baru dengan snapshot pattern
   */
  @Post('pesanan/baru')
  @Peran('penulis')
  @ApiOperation({ summary: 'Buat pesanan cetak baru' })
  async buatPesananBaru(
    @PenggunaSaatIni('id') idPenulis: string,
    @Body() dto: any,
  ) {
    return this.percetakanService.buatPesananBaru(idPenulis, dto);
  }

  /**
   * Ambil pesanan untuk percetakan dengan filter
   */
  @Get('pesanan/percetakan')
  @Peran('percetakan')
  @ApiOperation({ summary: 'Ambil pesanan untuk percetakan' })
  @ApiQuery({ name: 'status', required: false, description: 'baru | produksi | pengiriman | selesai' })
  async ambilPesananPercetakan(
    @PenggunaSaatIni('id') idPercetakan: string,
    @Query('status') status?: string,
  ) {
    return this.percetakanService.ambilPesananPercetakan(idPercetakan, status);
  }

  /**
   * ============================================
   * GENERIC ID ROUTES (MUST BE LAST)
   * ============================================
   */

  /**
   * Ambil detail pesanan by ID
   * ⚠️ Route ini harus di paling bawah karena menggunakan :id dinamis
   */
  @Get(':id')
  @Peran('penulis', 'percetakan', 'admin')
  @ApiOperation({ summary: 'Ambil detail pesanan by ID' })
  @ApiParam({ name: 'id', description: 'ID pesanan' })
  @ApiResponse({
    status: 200,
    description: 'Detail pesanan berhasil diambil',
  })
  @ApiResponse({ status: 404, description: 'Pesanan tidak ditemukan' })
  @ApiResponse({ status: 403, description: 'Tidak memiliki akses ke pesanan ini' })
  async ambilPesananById(
    @Param('id') id: string,
    @PenggunaSaatIni('id') idPengguna: string,
    @PenggunaSaatIni('peran') peran: string,
  ) {
    return this.percetakanService.ambilPesananById(id, idPengguna, peran);
  }

  /**
   * 🎯 PRIORITY 1: Konfirmasi penerimaan pesanan oleh penulis
   * Update status dari "terkirim" menjadi "selesai"
   * Kirim email notification dan WebSocket update
   * ⚠️ Route ini harus sebelum :id karena menggunakan static path
   */
  @Post(':id/konfirmasi-terima')
  @Peran('penulis')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Konfirmasi penerimaan pesanan (ubah status ke "selesai")',
    description: `
      Endpoint untuk penulis mengkonfirmasi bahwa pesanan telah diterima.
      Status pesanan akan otomatis berubah dari "terkirim" menjadi "selesai".
      
      **Fitur:**
      - Update status pesanan ke "selesai"
      - Kirim email notification ke penulis & percetakan
      - Real-time WebSocket notification
      - Catat waktu selesai dan catatan penerimaan
      
      **Requirements:**
      - Status pesanan harus "terkirim"
      - Hanya pemesan (penulis) yang bisa konfirmasi
    `,
  })
  @ApiParam({ name: 'id', description: 'ID pesanan' })
  @ApiResponse({
    status: 200,
    description: 'Penerimaan pesanan berhasil dikonfirmasi',
    schema: {
      example: {
        sukses: true,
        pesan: 'Terima kasih! Penerimaan pesanan telah dikonfirmasi. Status pesanan diperbarui menjadi "selesai".',
        data: {
          id: 'uuid-pesanan',
          nomorPesanan: 'PSN-2025-001',
          status: 'selesai',
          tanggalSelesai: '2025-12-19T10:30:00.000Z',
          catatanPenerimaan: 'Buku diterima dalam kondisi sempurna',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Status pesanan bukan "terkirim"' })
  @ApiResponse({ status: 404, description: 'Pesanan tidak ditemukan' })
  @ApiResponse({ status: 403, description: 'Hanya pemesan yang bisa konfirmasi' })
  async konfirmasiPenerimaanPesanan(
    @Param('id') id: string,
    @PenggunaSaatIni('id') idPenulis: string,
    @Body() dto: KonfirmasiPenerimaanDtoClass,
  ) {
    return this.percetakanService.konfirmasiPenerimaanPesanan(id, idPenulis, dto);
  }

  /**
   * Perbarui detail pesanan
   * Hanya untuk status 'tertunda'
   * ⚠️ Route ini harus di paling bawah karena menggunakan :id dinamis
   */
  @Put(':id')
  @Peran('penulis')
  @ApiOperation({ summary: 'Perbarui detail pesanan (hanya status tertunda)' })
  @ApiParam({ name: 'id', description: 'ID pesanan' })
  @ApiResponse({
    status: 200,
    description: 'Pesanan berhasil diperbarui',
  })
  @ApiResponse({ status: 400, description: 'Status pesanan tidak tertunda' })
  @ApiResponse({ status: 404, description: 'Pesanan tidak ditemukan' })
  @ApiResponse({ status: 403, description: 'Tidak memiliki akses' })
  async perbaruiPesanan(
    @Param('id') id: string,
    @PenggunaSaatIni('id') idPemesan: string,
    @Body(new ValidasiZodPipe(PerbaruiPesananSchema)) dto: PerbaruiPesananDtoClass,
  ) {
    return this.percetakanService.perbaruiPesanan(id, idPemesan, dto);
  }
}
