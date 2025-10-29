import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  DaftarDto,
  DaftarDtoClass,
  LoginDto,
  LoginDtoClass,
  RefreshTokenDto,
  RefreshTokenDtoClass,
  LupaPasswordDto,
  LupaPasswordDtoClass,
  ResetPasswordDto,
  ResetPasswordDtoClass,
  VerifikasiEmailDto,
  VerifikasiEmailDtoClass,
} from './dto';
import { ValidasiZodPipe } from '@/common/pipes/validasi-zod.pipe';
import {
  DaftarSchema,
  LoginSchema,
  RefreshTokenSchema,
  LupaPasswordSchema,
  ResetPasswordSchema,
  VerifikasiEmailSchema,
} from './dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { PenggunaSaatIni } from './decorators/pengguna-saat-ini.decorator';
import { Public } from '@/common/decorators/public.decorator';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Registrasi pengguna baru
   */
  @Public()
  @Post('daftar')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Registrasi pengguna baru',
    description: 'Mendaftarkan pengguna baru ke sistem. Email verifikasi akan dikirim.',
  })
  @ApiBody({ type: DaftarDtoClass })
  @ApiResponse({
    status: 201,
    description: 'Registrasi berhasil',
    schema: {
      example: {
        sukses: true,
        pesan: 'Registrasi berhasil. Silakan cek email untuk verifikasi akun.',
        data: {
          id: 'uuid',
          email: 'penulis@publishify.com',
        },
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Email sudah terdaftar',
  })
  async daftar(@Body(new ValidasiZodPipe(DaftarSchema)) dto: DaftarDto) {
    return this.authService.daftar(dto);
  }

  /**
   * Login pengguna
   */
  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login pengguna',
    description: 'Login dengan email dan password, mendapatkan access token dan refresh token.',
  })
  @ApiBody({ type: LoginDtoClass })
  @ApiResponse({
    status: 200,
    description: 'Login berhasil',
    schema: {
      example: {
        sukses: true,
        pesan: 'Login berhasil',
        data: {
          accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          pengguna: {
            id: 'uuid',
            email: 'penulis@publishify.com',
            peran: ['penulis'],
            terverifikasi: true,
            profilPengguna: {
              namaDepan: 'John',
              namaBelakang: 'Doe',
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Email atau password salah',
  })
  async login(
    @Body(new ValidasiZodPipe(LoginSchema)) dto: LoginDto,
    @PenggunaSaatIni() pengguna: any,
  ) {
    const result = await this.authService.login(pengguna);
    return {
      sukses: true,
      pesan: 'Login berhasil',
      data: result,
    };
  }

  /**
   * Refresh access token
   */
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh access token',
    description: 'Mendapatkan access token baru menggunakan refresh token.',
  })
  @ApiBody({ type: RefreshTokenDtoClass })
  @ApiResponse({
    status: 200,
    description: 'Token berhasil diperbarui',
    schema: {
      example: {
        sukses: true,
        pesan: 'Token berhasil diperbarui',
        data: {
          accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Refresh token tidak valid',
  })
  async refreshToken(
    @Body(new ValidasiZodPipe(RefreshTokenSchema)) dto: RefreshTokenDto,
  ) {
    return this.authService.refreshToken(dto);
  }

  /**
   * Logout pengguna
   */
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Logout pengguna',
    description: 'Logout dan revoke refresh token.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        refreshToken: {
          type: 'string',
          description: 'Refresh token yang akan di-revoke (optional, jika tidak ada akan logout dari semua device)',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Logout berhasil',
    schema: {
      example: {
        sukses: true,
        pesan: 'Logout berhasil',
      },
    },
  })
  async logout(
    @PenggunaSaatIni('id') idPengguna: string,
    @Body('refreshToken') refreshToken?: string,
  ) {
    return this.authService.logout(idPengguna, refreshToken);
  }

  /**
   * Verifikasi email
   */
  @Public()
  @Post('verifikasi-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verifikasi email',
    description: 'Verifikasi email menggunakan token yang dikirim via email.',
  })
  @ApiBody({ type: VerifikasiEmailDtoClass })
  @ApiResponse({
    status: 200,
    description: 'Email berhasil diverifikasi',
    schema: {
      example: {
        sukses: true,
        pesan: 'Email berhasil diverifikasi. Anda sekarang dapat login.',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Token tidak valid atau sudah kadaluarsa',
  })
  async verifikasiEmail(
    @Body(new ValidasiZodPipe(VerifikasiEmailSchema)) dto: VerifikasiEmailDto,
  ) {
    return this.authService.verifikasiEmail(dto);
  }

  /**
   * Request reset password
   */
  @Public()
  @Post('lupa-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Request reset password',
    description: 'Mengirim link reset password ke email.',
  })
  @ApiBody({ type: LupaPasswordDtoClass })
  @ApiResponse({
    status: 200,
    description: 'Email reset password telah dikirim',
    schema: {
      example: {
        sukses: true,
        pesan: 'Jika email terdaftar, kami telah mengirim link reset password.',
      },
    },
  })
  async lupaPassword(
    @Body(new ValidasiZodPipe(LupaPasswordSchema)) dto: LupaPasswordDto,
  ) {
    return this.authService.lupaPassword(dto);
  }

  /**
   * Reset password
   */
  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reset password',
    description: 'Reset password menggunakan token dari email.',
  })
  @ApiBody({ type: ResetPasswordDtoClass })
  @ApiResponse({
    status: 200,
    description: 'Password berhasil direset',
    schema: {
      example: {
        sukses: true,
        pesan: 'Password berhasil direset. Silakan login dengan password baru.',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Token tidak valid atau sudah kadaluarsa',
  })
  async resetPassword(
    @Body(new ValidasiZodPipe(ResetPasswordSchema)) dto: ResetPasswordDto,
  ) {
    return this.authService.resetPassword(dto);
  }

  /**
   * Get current user profile (testing endpoint)
   */
  @UseGuards(JwtAuthGuard)
  @Post('me')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get profil pengguna saat ini',
    description: 'Mendapatkan informasi pengguna yang sedang login (untuk testing JWT).',
  })
  @ApiResponse({
    status: 200,
    description: 'Data pengguna',
    schema: {
      example: {
        sukses: true,
        data: {
          id: 'uuid',
          email: 'penulis@publishify.com',
          peran: ['penulis'],
          terverifikasi: true,
        },
      },
    },
  })
  async getMe(@PenggunaSaatIni() pengguna: any) {
    return {
      sukses: true,
      data: pengguna,
    };
  }
}
