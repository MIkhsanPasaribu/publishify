/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
  Headers,
  Get,
  Res,
  Query,
  Delete,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiHeader,
  ApiQuery,
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
import { Request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

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
  @ApiHeader({
    name: 'X-Platform',
    description:
      'Platform yang digunakan (web atau mobile). Jika tidak diisi akan detect dari User-Agent.',
    required: false,
    enum: ['web', 'mobile'],
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
    @Req() request: Request,
  ) {
    const result = await this.authService.login(pengguna, request);
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
  async refreshToken(@Body(new ValidasiZodPipe(RefreshTokenSchema)) dto: RefreshTokenDto) {
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
          description:
            'Refresh token yang akan di-revoke (optional, jika tidak ada akan logout dari semua device)',
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
  async verifikasiEmail(@Body(new ValidasiZodPipe(VerifikasiEmailSchema)) dto: VerifikasiEmailDto) {
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
  async lupaPassword(@Body(new ValidasiZodPipe(LupaPasswordSchema)) dto: LupaPasswordDto) {
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
  async resetPassword(@Body(new ValidasiZodPipe(ResetPasswordSchema)) dto: ResetPasswordDto) {
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

  // ============================================
  // OAUTH GOOGLE ENDPOINTS
  // ============================================

  /**
   * Initiate Google OAuth flow
   *
   * Endpoint ini:
   * 1. Generate state token (CSRF protection)
   * 2. Build Google OAuth URL
   * 3. Redirect user ke Google login page
   *
   * @param redirect - Frontend callback URL (optional)
   * @param response - Express response untuk redirect
   */
  @Public()
  @Get('google')
  @ApiOperation({
    summary: 'Initiate Google OAuth',
    description: 'Redirect user ke halaman login Google untuk OAuth authentication.',
  })
  @ApiQuery({
    name: 'redirect',
    required: false,
    description: 'Frontend callback URL setelah OAuth berhasil',
    example: 'http://localhost:3000/dashboard',
  })
  @ApiResponse({
    status: 302,
    description: 'Redirect ke Google OAuth page',
  })
  async googleAuth(@Query('redirect') redirect: string, @Res() response: Response) {
    try {
      // Generate state token untuk CSRF protection
      const state = await this.authService.generateOAuthState('google', redirect);

      // Get OAuth config
      const clientID = this.configService.get<string>('googleOAuth.clientID');
      const callbackURL = this.configService.get<string>('googleOAuth.callbackURL');

      // Jika Google OAuth belum dikonfigurasi, redirect ke frontend dengan error
      if (!clientID || !callbackURL) {
        const frontendCallback = this.configService.get<string>('googleOAuth.frontendCallback');
        const errorUrl = `${frontendCallback}?${new URLSearchParams({
          error: 'oauth_not_configured',
          message: 'Google OAuth belum dikonfigurasi pada server',
        })}`;
        return response.redirect(errorUrl);
      }

      // Build Google OAuth URL
      const params = {
        client_id: clientID!,
        redirect_uri: callbackURL!,
        response_type: 'code',
        scope: 'profile email',
        state,
        access_type: 'offline',
        prompt: 'consent',
      };
      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams(params as Record<string, string>)}`;

      // Redirect ke Google
      return response.redirect(googleAuthUrl);
    } catch (error) {
      // Handle error
      const frontendCallback = this.configService.get<string>('googleOAuth.frontendCallback');
      const errorMessage = error instanceof Error ? error.message : 'Gagal memulai OAuth';
      const errorUrl = `${frontendCallback}?${new URLSearchParams({
        error: 'oauth_init_failed',
        message: errorMessage,
      })}`;
      return response.redirect(errorUrl);
    }
  }

  /**
   * Google OAuth callback endpoint
   *
   * Endpoint ini dipanggil oleh Google setelah user login.
   * Flow:
   * 1. GoogleStrategy validate code & state
   * 2. Extract user profile
   * 3. Create/link user account
   * 4. Generate JWT tokens
   * 5. Redirect ke frontend dengan tokens
   *
   * @param request - Express request (contains user dari GoogleStrategy)
   * @param response - Express response untuk redirect
   */
  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({
    summary: 'Google OAuth callback',
    description:
      'Endpoint yang dipanggil Google setelah user berhasil login. Handler oleh GoogleStrategy.',
  })
  @ApiQuery({
    name: 'code',
    required: true,
    description: 'Authorization code dari Google',
  })
  @ApiQuery({
    name: 'state',
    required: true,
    description: 'State token untuk CSRF protection',
  })
  @ApiResponse({
    status: 302,
    description: 'Redirect ke frontend dengan JWT tokens',
  })
  @ApiResponse({
    status: 401,
    description: 'OAuth authentication failed',
  })
  async googleAuthCallback(@Req() request: Request & { user: any }, @Res() response: Response) {
    try {
      // Jika Google OAuth belum dikonfigurasi, redirect ke frontend dengan error
      const clientID = this.configService.get<string>('googleOAuth.clientID');
      const callbackURL = this.configService.get<string>('googleOAuth.callbackURL');

      if (!clientID || !callbackURL) {
        const frontendCallback = this.configService.get<string>('googleOAuth.frontendCallback');
        const errorUrl = `${frontendCallback}?${new URLSearchParams({
          error: 'oauth_not_configured',
          message: 'Google OAuth belum dikonfigurasi pada server',
        })}`;
        return response.redirect(errorUrl);
      }
      // User sudah di-validate oleh GoogleStrategy
      const user = request.user;

      if (!user) {
        throw new Error('User tidak ditemukan dari GoogleStrategy');
      }

      // Generate JWT tokens untuk Publishify
      const tokens = await this.authService.login(user, request);

      // Get frontend callback URL
      const frontendCallback = this.configService.get<string>('googleOAuth.frontendCallback');

      // Redirect ke frontend dengan tokens
      const redirectUrl = `${frontendCallback}?${new URLSearchParams({
        token: tokens.accessToken,
        refresh: tokens.refreshToken,
        success: 'true',
      })}`;

      return response.redirect(redirectUrl);
    } catch (error) {
      // Log error
      console.error('[GoogleOAuthCallback] Error:', error);

      // Redirect ke frontend dengan error
      const frontendCallback = this.configService.get<string>('googleOAuth.frontendCallback');

      const errorMessage = error instanceof Error ? error.message : 'Autentikasi Google gagal';

      const errorUrl = `${frontendCallback}?${new URLSearchParams({
        error: 'oauth_callback_failed',
        message: errorMessage,
      })}`;

      return response.redirect(errorUrl);
    }
  }

  /**
   * Link Google account to existing logged-in user
   *
   * Use case: User sudah login dengan password,
   * ingin link Google account untuk future login.
   *
   * @param userId - ID user dari JWT token
   * @param body - Contains googleId
   */
  @Post('google/link')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Link Google account',
    description: 'Link Google account ke user yang sedang login.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        googleId: {
          type: 'string',
          description: 'Google user ID',
          example: '1234567890',
        },
      },
      required: ['googleId'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Google account berhasil di-link',
    schema: {
      example: {
        sukses: true,
        pesan: 'Google account berhasil di-link',
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Google account sudah digunakan oleh user lain',
  })
  async linkGoogleAccount(
    @PenggunaSaatIni('id') userId: string,
    @Body('googleId') googleId: string,
  ) {
    return this.authService.linkGoogleAccount(userId, googleId);
  }

  /**
   * Unlink Google account from user
   *
   * Syarat: User harus punya password
   *
   * @param userId - ID user dari JWT token
   */
  @Delete('google/unlink')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Unlink Google account',
    description: 'Hapus link Google account dari user. User harus punya password.',
  })
  @ApiResponse({
    status: 200,
    description: 'Google account berhasil di-unlink',
    schema: {
      example: {
        sukses: true,
        pesan: 'Google account berhasil di-unlink',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Tidak bisa unlink (user tidak punya password)',
  })
  async unlinkGoogleAccount(@PenggunaSaatIni('id') userId: string) {
    return this.authService.unlinkGoogleAccount(userId);
  }
}
