import { Controller, Get, Put, Delete, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { NotifikasiService } from './notifikasi.service';
import { FilterNotifikasiDto } from './dto';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PenggunaSaatIni } from '@/modules/auth/decorators/pengguna-saat-ini.decorator';
import { ParseUUIDPipe } from '@/common/pipes/parse-uuid.pipe';

/**
 * Controller untuk mengelola notifikasi pengguna
 * Endpoints: list, detail, mark read, mark all read, delete, unread count
 */
@ApiTags('notifikasi')
@ApiBearerAuth()
@Controller('notifikasi')
@UseGuards(JwtAuthGuard)
export class NotifikasiController {
  constructor(private readonly notifikasiService: NotifikasiService) {}

  /**
   * Ambil daftar notifikasi pengguna dengan filter
   * User hanya bisa lihat notifikasi sendiri
   */
  @Get()
  @ApiOperation({
    summary: 'Ambil daftar notifikasi',
    description: 'Daftar notifikasi pengguna dengan filter dan pagination',
  })
  @ApiQuery({ name: 'halaman', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'dibaca', required: false, type: Boolean })
  @ApiQuery({ name: 'tipe', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Daftar notifikasi berhasil diambil' })
  async ambilSemuaNotifikasi(
    @PenggunaSaatIni('id') idPengguna: string,
    @Query('halaman') halaman: number = 1,
    @Query('limit') limit: number = 20,
    @Query('dibaca') dibaca?: boolean,
    @Query('tipe') tipe?: string,
    @Query('tanggalMulai') tanggalMulai?: string,
    @Query('tanggalSelesai') tanggalSelesai?: string,
    @Query('urutkan') urutkan: string = 'dibuatPada',
    @Query('arah') arah: 'asc' | 'desc' = 'desc',
  ) {
    const filter: FilterNotifikasiDto = {
      halaman: Number(halaman),
      limit: Number(limit),
      dibaca: dibaca === undefined ? undefined : dibaca === true,
      tipe: tipe as any,
      tanggalMulai,
      tanggalSelesai,
      urutkan: urutkan as any,
      arah,
    };

    return this.notifikasiService.ambilNotifikasiPengguna(idPengguna, filter);
  }

  /**
   * Ambil detail notifikasi by ID
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Ambil detail notifikasi',
    description: 'Detail notifikasi dengan validasi akses',
  })
  @ApiResponse({ status: 200, description: 'Detail notifikasi berhasil diambil' })
  @ApiResponse({ status: 403, description: 'Tidak memiliki akses' })
  @ApiResponse({ status: 404, description: 'Notifikasi tidak ditemukan' })
  async ambilNotifikasiById(
    @Param('id', ParseUUIDPipe) id: string,
    @PenggunaSaatIni('id') idPengguna: string,
  ) {
    return this.notifikasiService.ambilNotifikasiById(id, idPengguna);
  }

  /**
   * Tandai notifikasi sebagai sudah dibaca
   */
  @Put(':id/baca')
  @ApiOperation({
    summary: 'Tandai notifikasi sebagai sudah dibaca',
    description: 'Update status notifikasi menjadi sudah dibaca',
  })
  @ApiResponse({ status: 200, description: 'Notifikasi berhasil ditandai sebagai sudah dibaca' })
  @ApiResponse({ status: 403, description: 'Tidak memiliki akses' })
  @ApiResponse({ status: 404, description: 'Notifikasi tidak ditemukan' })
  async tandaiDibaca(
    @Param('id', ParseUUIDPipe) id: string,
    @PenggunaSaatIni('id') idPengguna: string,
  ) {
    return this.notifikasiService.tandaiDibaca(id, idPengguna);
  }

  /**
   * Tandai semua notifikasi sebagai sudah dibaca
   */
  @Put('baca-semua/all')
  @ApiOperation({
    summary: 'Tandai semua notifikasi sebagai sudah dibaca',
    description: 'Update semua notifikasi pengguna menjadi sudah dibaca',
  })
  @ApiResponse({
    status: 200,
    description: 'Semua notifikasi berhasil ditandai sebagai sudah dibaca',
  })
  async tandaiSemuaDibaca(@PenggunaSaatIni('id') idPengguna: string) {
    return this.notifikasiService.tandaiSemuaDibaca(idPengguna);
  }

  /**
   * Hapus notifikasi
   */
  @Delete(':id')
  @ApiOperation({
    summary: 'Hapus notifikasi',
    description: 'Hapus notifikasi dari database',
  })
  @ApiResponse({ status: 200, description: 'Notifikasi berhasil dihapus' })
  @ApiResponse({ status: 403, description: 'Tidak memiliki akses' })
  @ApiResponse({ status: 404, description: 'Notifikasi tidak ditemukan' })
  async hapusNotifikasi(
    @Param('id', ParseUUIDPipe) id: string,
    @PenggunaSaatIni('id') idPengguna: string,
  ) {
    return this.notifikasiService.hapusNotifikasi(id, idPengguna);
  }

  /**
   * Ambil jumlah notifikasi yang belum dibaca
   */
  @Get('belum-dibaca/count')
  @ApiOperation({
    summary: 'Hitung notifikasi belum dibaca',
    description: 'Ambil jumlah notifikasi yang belum dibaca untuk ditampilkan di badge',
  })
  @ApiResponse({ status: 200, description: 'Jumlah notifikasi belum dibaca berhasil diambil' })
  async hitungBelumDibaca(@PenggunaSaatIni('id') idPengguna: string) {
    return this.notifikasiService.hitungBelumDibaca(idPengguna);
  }
}
