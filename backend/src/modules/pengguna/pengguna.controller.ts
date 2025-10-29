import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { PenggunaService } from './pengguna.service';
import {
  PerbaruiPenggunaDto,
  PerbaruiPenggunaDtoClass,
  PerbaruiProfilDto,
  PerbaruiProfilDtoClass,
  FilterPenggunaDto,
  FilterPenggunaDtoClass,
  GantiPasswordDto,
  GantiPasswordDtoClass,
} from './dto';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PeranGuard } from '@/modules/auth/guards/roles.guard';
import { Peran } from '@/modules/auth/decorators/peran.decorator';
import { PenggunaSaatIni } from '@/modules/auth/decorators/pengguna-saat-ini.decorator';
import { ValidasiZodPipe } from '@/common/pipes/validasi-zod.pipe';
import {
  PerbaruiPenggunaSchema,
  PerbaruiProfilSchema,
  FilterPenggunaSchema,
  GantiPasswordSchema,
} from './dto';

@ApiTags('pengguna')
@ApiBearerAuth()
@Controller('pengguna')
@UseGuards(JwtAuthGuard, PeranGuard)
export class PenggunaController {
  constructor(private readonly penggunaService: PenggunaService) {}

  /**
   * GET /pengguna - Ambil daftar pengguna dengan pagination & filter
   * Role: admin
   */
  @Get()
  @Peran('admin')
  @ApiOperation({
    summary: 'Ambil daftar pengguna',
    description:
      'Mengambil daftar pengguna dengan pagination, filter, dan pencarian. Hanya admin yang bisa akses.',
  })
  @ApiResponse({
    status: 200,
    description: 'Daftar pengguna berhasil diambil',
  })
  @ApiQuery({ type: FilterPenggunaDtoClass })
  async ambilSemuaPengguna(
    @Query(new ValidasiZodPipe(FilterPenggunaSchema)) filter: FilterPenggunaDto,
  ) {
    return await this.penggunaService.ambilSemuaPengguna(filter);
  }

  /**
   * GET /pengguna/statistik - Ambil statistik pengguna
   * Role: admin
   */
  @Get('statistik')
  @Peran('admin')
  @ApiOperation({
    summary: 'Ambil statistik pengguna',
    description:
      'Mengambil statistik pengguna seperti total, aktif, terverifikasi, dan per role. Hanya admin yang bisa akses.',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistik pengguna berhasil diambil',
  })
  async ambilStatistikPengguna() {
    return await this.penggunaService.ambilStatistikPengguna();
  }

  /**
   * GET /pengguna/profil/saya - Ambil profil pengguna saat ini
   * Role: authenticated
   */
  @Get('profil/saya')
  @ApiOperation({
    summary: 'Ambil profil sendiri',
    description: 'Mengambil profil pengguna yang sedang login',
  })
  @ApiResponse({
    status: 200,
    description: 'Profil berhasil diambil',
  })
  async ambilProfilSaya(@PenggunaSaatIni('id') idPengguna: string) {
    return await this.penggunaService.ambilPenggunaById(idPengguna);
  }

  /**
   * GET /pengguna/:id - Ambil detail pengguna by ID
   * Role: admin
   */
  @Get(':id')
  @Peran('admin')
  @ApiOperation({
    summary: 'Ambil detail pengguna',
    description: 'Mengambil detail lengkap pengguna berdasarkan ID. Hanya admin yang bisa akses.',
  })
  @ApiResponse({
    status: 200,
    description: 'Detail pengguna berhasil diambil',
  })
  @ApiResponse({
    status: 404,
    description: 'Pengguna tidak ditemukan',
  })
  async ambilPenggunaById(@Param('id', ParseUUIDPipe) id: string) {
    return await this.penggunaService.ambilPenggunaById(id);
  }

  /**
   * PUT /pengguna/:id - Perbarui pengguna (Admin only)
   * Role: admin
   */
  @Put(':id')
  @Peran('admin')
  @ApiOperation({
    summary: 'Perbarui data pengguna',
    description:
      'Admin memperbarui data pengguna (email, telepon, status aktif, verifikasi, dll). Hanya admin yang bisa akses.',
  })
  @ApiResponse({
    status: 200,
    description: 'Data pengguna berhasil diperbarui',
  })
  @ApiResponse({
    status: 404,
    description: 'Pengguna tidak ditemukan',
  })
  @ApiResponse({
    status: 409,
    description: 'Email sudah digunakan oleh pengguna lain',
  })
  async perbaruiPengguna(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ValidasiZodPipe(PerbaruiPenggunaSchema))
    dto: PerbaruiPenggunaDto,
  ) {
    return await this.penggunaService.perbaruiPengguna(id, dto);
  }

  /**
   * PUT /pengguna/profil/saya - Perbarui profil sendiri
   * Role: authenticated
   */
  @Put('profil/saya')
  @ApiOperation({
    summary: 'Perbarui profil sendiri',
    description: 'Pengguna memperbarui profil mereka sendiri',
  })
  @ApiResponse({
    status: 200,
    description: 'Profil berhasil diperbarui',
  })
  async perbaruiProfilSaya(
    @PenggunaSaatIni('id') idPengguna: string,
    @Body(new ValidasiZodPipe(PerbaruiProfilSchema)) dto: PerbaruiProfilDto,
  ) {
    return await this.penggunaService.perbaruiProfil(idPengguna, dto);
  }

  /**
   * PUT /pengguna/password - Ganti password
   * Role: authenticated
   */
  @Put('password')
  @ApiOperation({
    summary: 'Ganti password',
    description: 'Pengguna mengganti password mereka sendiri',
  })
  @ApiResponse({
    status: 200,
    description: 'Password berhasil diperbarui',
  })
  @ApiResponse({
    status: 400,
    description: 'Kata sandi lama tidak valid',
  })
  async gantiPassword(
    @PenggunaSaatIni('id') idPengguna: string,
    @Body(new ValidasiZodPipe(GantiPasswordSchema)) dto: GantiPasswordDto,
  ) {
    return await this.penggunaService.gantiPassword(idPengguna, dto);
  }

  /**
   * DELETE /pengguna/:id - Hapus pengguna
   * Role: admin
   */
  @Delete(':id')
  @Peran('admin')
  @ApiOperation({
    summary: 'Hapus pengguna',
    description:
      'Admin menghapus pengguna (soft delete: set aktif=false). Hanya admin yang bisa akses.',
  })
  @ApiResponse({
    status: 200,
    description: 'Pengguna berhasil dihapus',
  })
  @ApiResponse({
    status: 404,
    description: 'Pengguna tidak ditemukan',
  })
  async hapusPengguna(@Param('id', ParseUUIDPipe) id: string) {
    return await this.penggunaService.hapusPengguna(id);
  }
}
