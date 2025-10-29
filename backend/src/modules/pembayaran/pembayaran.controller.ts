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
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { PembayaranService } from './pembayaran.service';
import {
  ProsesPembayaranDto,
  KonfirmasiPembayaranDto,
  FilterPembayaranDto,
  WebhookPembayaranDto,
} from './dto';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PeranGuard } from '@/modules/auth/guards/roles.guard';
import { Peran } from '@/modules/auth/decorators/peran.decorator';
import { PenggunaSaatIni } from '@/modules/auth/decorators/pengguna-saat-ini.decorator';
import { Public } from '@/common/decorators/public.decorator';
import { ParseUUIDPipe } from '@/common/pipes/parse-uuid.pipe';

/**
 * Controller untuk mengelola pembayaran
 * Endpoints: create, list, detail, confirm, cancel, webhook, statistics
 */
@ApiTags('pembayaran')
@Controller('pembayaran')
export class PembayaranController {
  constructor(private readonly pembayaranService: PembayaranService) {}

  /**
   * Buat pembayaran baru untuk pesanan
   * Hanya penulis yang bisa membuat pembayaran untuk pesanannya sendiri
   */
  @Post()
  @UseGuards(JwtAuthGuard, PeranGuard)
  @Peran('penulis')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Buat pembayaran baru',
    description: 'Penulis membuat pembayaran untuk pesanan cetak yang sudah dikonfirmasi',
  })
  @ApiResponse({ status: 201, description: 'Pembayaran berhasil dibuat' })
  @ApiResponse({ status: 400, description: 'Data tidak valid atau pesanan belum dikonfirmasi' })
  @ApiResponse({ status: 403, description: 'Tidak memiliki akses' })
  @ApiResponse({ status: 404, description: 'Pesanan tidak ditemukan' })
  async buatPembayaran(
    @PenggunaSaatIni('id') idPengguna: string,
    @Body() dto: ProsesPembayaranDto,
  ) {
    return this.pembayaranService.buatPembayaran(idPengguna, dto);
  }

  /**
   * Ambil daftar pembayaran dengan filter
   * Penulis: lihat pembayaran sendiri
   * Percetakan: lihat pembayaran untuk pesanan mereka
   * Admin: lihat semua pembayaran
   */
  @Get()
  @UseGuards(JwtAuthGuard, PeranGuard)
  @Peran('penulis', 'percetakan', 'admin')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Ambil daftar pembayaran',
    description: 'Daftar pembayaran dengan filter dan pagination (RBAC)',
  })
  @ApiQuery({ name: 'halaman', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'metodePembayaran', required: false, type: String })
  @ApiQuery({ name: 'nomorTransaksi', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Daftar pembayaran berhasil diambil' })
  async ambilSemuaPembayaran(
    @PenggunaSaatIni('id') idPengguna: string,
    @PenggunaSaatIni('peran') peran: string,
    @Query('halaman') halaman: number = 1,
    @Query('limit') limit: number = 20,
    @Query('status') status?: string,
    @Query('metodePembayaran') metodePembayaran?: string,
    @Query('idPengguna') idPenggunaFilter?: string,
    @Query('idPesanan') idPesanan?: string,
    @Query('nomorTransaksi') nomorTransaksi?: string,
    @Query('tanggalMulai') tanggalMulai?: string,
    @Query('tanggalSelesai') tanggalSelesai?: string,
    @Query('urutkan') urutkan: string = 'dibuatPada',
    @Query('arah') arah: 'asc' | 'desc' = 'desc',
  ) {
    const filter: FilterPembayaranDto = {
      halaman: Number(halaman),
      limit: Number(limit),
      status: status as any,
      metodePembayaran: metodePembayaran as any,
      idPengguna: idPenggunaFilter,
      idPesanan,
      nomorTransaksi,
      tanggalMulai,
      tanggalSelesai,
      urutkan: urutkan as any,
      arah,
    };

    return this.pembayaranService.ambilSemuaPembayaran(filter, idPengguna, peran);
  }

  /**
   * Ambil detail pembayaran by ID
   * Validasi akses berdasarkan peran
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard, PeranGuard)
  @Peran('penulis', 'percetakan', 'admin')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Ambil detail pembayaran',
    description: 'Detail pembayaran dengan validasi akses berdasarkan peran',
  })
  @ApiResponse({ status: 200, description: 'Detail pembayaran berhasil diambil' })
  @ApiResponse({ status: 403, description: 'Tidak memiliki akses' })
  @ApiResponse({ status: 404, description: 'Pembayaran tidak ditemukan' })
  async ambilPembayaranById(
    @Param('id', ParseUUIDPipe) id: string,
    @PenggunaSaatIni('id') idPengguna: string,
    @PenggunaSaatIni('peran') peran: string,
  ) {
    return this.pembayaranService.ambilPembayaranById(id, idPengguna, peran);
  }

  /**
   * Konfirmasi pembayaran oleh admin/percetakan
   * Status berubah dari tertunda/diproses → berhasil atau gagal
   */
  @Put(':id/konfirmasi')
  @UseGuards(JwtAuthGuard, PeranGuard)
  @Peran('admin', 'percetakan')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Konfirmasi pembayaran',
    description: 'Admin/Percetakan mengkonfirmasi atau menolak pembayaran',
  })
  @ApiResponse({ status: 200, description: 'Pembayaran berhasil dikonfirmasi' })
  @ApiResponse({ status: 400, description: 'Status pembayaran tidak valid untuk dikonfirmasi' })
  @ApiResponse({ status: 404, description: 'Pembayaran tidak ditemukan' })
  async konfirmasiPembayaran(
    @Param('id', ParseUUIDPipe) id: string,
    @PenggunaSaatIni('id') idKonfirmator: string,
    @Body() dto: KonfirmasiPembayaranDto,
  ) {
    return this.pembayaranService.konfirmasiPembayaran(id, idKonfirmator, dto);
  }

  /**
   * Batalkan pembayaran
   * Hanya pemilik yang bisa membatalkan, status harus tertunda
   */
  @Put(':id/batal')
  @UseGuards(JwtAuthGuard, PeranGuard)
  @Peran('penulis')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Batalkan pembayaran',
    description: 'Penulis membatalkan pembayaran yang masih berstatus tertunda',
  })
  @ApiResponse({ status: 200, description: 'Pembayaran berhasil dibatalkan' })
  @ApiResponse({ status: 400, description: 'Pembayaran tidak dapat dibatalkan' })
  @ApiResponse({ status: 403, description: 'Tidak memiliki akses' })
  @ApiResponse({ status: 404, description: 'Pembayaran tidak ditemukan' })
  async batalkanPembayaran(
    @Param('id', ParseUUIDPipe) id: string,
    @PenggunaSaatIni('id') idPengguna: string,
    @Body('alasan') alasan?: string,
  ) {
    return this.pembayaranService.batalkanPembayaran(id, idPengguna, alasan);
  }

  /**
   * Webhook endpoint untuk payment gateway
   * Public endpoint (no auth) - signature verification di service
   */
  @Post('webhook')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Webhook payment gateway',
    description: 'Endpoint untuk menerima notifikasi dari payment gateway (Midtrans/Xendit)',
  })
  @ApiResponse({ status: 200, description: 'Webhook berhasil diproses' })
  @ApiResponse({ status: 400, description: 'Signature tidak valid' })
  @ApiResponse({ status: 404, description: 'Pembayaran tidak ditemukan' })
  async handleWebhook(@Body() dto: WebhookPembayaranDto) {
    return this.pembayaranService.handleWebhook(dto);
  }

  /**
   * Ambil statistik pembayaran
   * Total pembayaran, revenue, breakdown status dan metode
   */
  @Get('statistik/ringkasan')
  @UseGuards(JwtAuthGuard, PeranGuard)
  @Peran('penulis', 'percetakan', 'admin')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Ambil statistik pembayaran',
    description: 'Statistik pembayaran: total, revenue, breakdown status dan metode (RBAC)',
  })
  @ApiResponse({ status: 200, description: 'Statistik pembayaran berhasil diambil' })
  async ambilStatistikPembayaran(
    @PenggunaSaatIni('id') idPengguna: string,
    @PenggunaSaatIni('peran') peran: string,
  ) {
    return this.pembayaranService.ambilStatistikPembayaran(idPengguna, peran);
  }
}
