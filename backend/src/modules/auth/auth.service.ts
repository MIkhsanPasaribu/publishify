/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/prisma/prisma.service';
import { hashPassword, verifyPassword } from '@/utils/hash.util';
import { detectPlatform } from '@/utils/platform.util';
import {
  DaftarDto,
  LoginDto,
  RefreshTokenDto,
  LupaPasswordDto,
  ResetPasswordDto,
  VerifikasiEmailDto,
} from './dto';
import { JenisPeran, Platform } from '@prisma/client';
import * as crypto from 'crypto';
import { Request } from 'express';

/**
 * Interface untuk JWT payload
 */
interface JwtPayload {
  sub: string; // User ID
  email: string;
  peran: JenisPeran[];
}

/**
 * Interface untuk response login
 */
/**
 * Interface untuk response login
 * Export agar bisa digunakan di controller
 */
export interface ResponseLogin {
  accessToken: string;
  refreshToken: string;
  pengguna: {
    id: string;
    email: string;
    peran: JenisPeran[];
    terverifikasi: boolean;
    profilPengguna: any;
  };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Registrasi pengguna baru
   */
  async daftar(dto: DaftarDto) {
    // Check apakah email sudah terdaftar
    const emailSudahAda = await this.prisma.pengguna.findUnique({
      where: { email: dto.email },
    });

    if (emailSudahAda) {
      throw new ConflictException('Email sudah terdaftar');
    }

    // Hash password
    const hashedPassword = await hashPassword(dto.kataSandi);

    // Generate token verifikasi email
    const tokenVerifikasi = crypto.randomBytes(32).toString('hex');

    // Buat pengguna baru dengan transaction
    const pengguna = await this.prisma.$transaction(async (prisma) => {
      // Buat pengguna
      const newPengguna = await prisma.pengguna.create({
        data: {
          email: dto.email,
          kataSandi: hashedPassword,
          telepon: dto.telepon,
          aktif: true,
          terverifikasi: false,
        },
      });

      // Buat profil pengguna
      await prisma.profilPengguna.create({
        data: {
          idPengguna: newPengguna.id,
          namaDepan: dto.namaDepan,
          namaBelakang: dto.namaBelakang,
          namaTampilan: `${dto.namaDepan}${dto.namaBelakang ? ' ' + dto.namaBelakang : ''}`,
        },
      });

      // Assign peran
      await prisma.peranPengguna.create({
        data: {
          idPengguna: newPengguna.id,
          jenisPeran: dto.jenisPeran || 'penulis',
          aktif: true,
        },
      });

      // Jika peran penulis, buat profil penulis
      if (dto.jenisPeran === 'penulis' || !dto.jenisPeran) {
        await prisma.profilPenulis.create({
          data: {
            idPengguna: newPengguna.id,
          },
        });
      }

      // Simpan token verifikasi (gunakan tabel TokenRefresh sementara)
      await prisma.tokenRefresh.create({
        data: {
          idPengguna: newPengguna.id,
          token: tokenVerifikasi,
          kadaluarsaPada: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 jam
        },
      });

      return newPengguna;
    });

    // TODO: Kirim email verifikasi
    // await this.emailService.kirimEmailVerifikasi(pengguna.email, tokenVerifikasi);

    return {
      sukses: true,
      pesan: 'Registrasi berhasil. Silakan cek email untuk verifikasi akun.',
      data: {
        id: pengguna.id,
        email: pengguna.email,
        tokenVerifikasi, // Untuk development, nanti dihapus
      },
    };
  }

  /**
   * Validasi pengguna untuk login (digunakan oleh LocalStrategy)
   */
  async validasiPengguna(email: string, kataSandi: string) {
    const pengguna = await this.prisma.pengguna.findUnique({
      where: { email },
      include: {
        profilPengguna: true,
        peranPengguna: {
          where: { aktif: true },
        },
      },
    });

    if (!pengguna) {
      return null;
    }

    // Check apakah user punya password (user OAuth-only tidak punya password)
    if (!pengguna.kataSandi) {
      throw new UnauthorizedException(
        'Akun ini terdaftar melalui OAuth. Silakan login dengan provider OAuth Anda.',
      );
    }

    // Verify password
    const passwordValid = await verifyPassword(kataSandi, pengguna.kataSandi);
    if (!passwordValid) {
      return null;
    }

    // Check apakah akun aktif
    if (!pengguna.aktif) {
      throw new UnauthorizedException('Akun Anda telah dinonaktifkan');
    }

    // Return pengguna tanpa password
    const { kataSandi: _, ...penggunaWithoutPassword } = pengguna;
    return penggunaWithoutPassword;
  }

  /**
   * Login dan generate JWT tokens
   */
  async login(pengguna: any, request?: Request): Promise<ResponseLogin> {
    // Deteksi platform dari request headers
    const userAgent = request?.headers['user-agent'];
    const customPlatform = request?.headers['x-platform'] as string | undefined;
    const platform = detectPlatform(userAgent, customPlatform);

    // Prepare JWT payload
    const payload: JwtPayload = {
      sub: pengguna.id,
      email: pengguna.email,
      peran: pengguna.peranPengguna.map((p: any) => p.jenisPeran),
    };

    // Get platform-specific expiry configuration
    const platformConfig = platform === Platform.mobile ? 'jwt.mobile' : 'jwt.web';
    const accessTokenExpiry = this.configService.get<string>(`${platformConfig}.expiresIn`, '1h');
    const refreshTokenExpiry = this.configService.get<string>(
      `${platformConfig}.refreshExpiresIn`,
      '7d',
    );

    // Generate access token dengan expiry sesuai platform
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: accessTokenExpiry,
    });

    // Generate refresh token dengan expiry sesuai platform
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.refreshSecret'),
      expiresIn: refreshTokenExpiry,
    });

    // Hitung kadaluarsa token dalam milliseconds
    const refreshExpiryMs = this.parseExpiryToMs(refreshTokenExpiry);

    // Simpan refresh token ke database dengan platform info
    await this.prisma.tokenRefresh.create({
      data: {
        idPengguna: pengguna.id,
        token: refreshToken,
        platform,
        kadaluarsaPada: new Date(Date.now() + refreshExpiryMs),
      },
    });

    // Update last login
    await this.prisma.pengguna.update({
      where: { id: pengguna.id },
      data: { loginTerakhir: new Date() },
    });

    // Log aktivitas dengan info platform
    await this.prisma.logAktivitas.create({
      data: {
        idPengguna: pengguna.id,
        jenis: 'login',
        aksi: 'Login',
        deskripsi: `Pengguna berhasil login dari platform ${platform}`,
      },
    });

    return {
      accessToken,
      refreshToken,
      pengguna: {
        id: pengguna.id,
        email: pengguna.email,
        peran: pengguna.peranPengguna.map((p: any) => p.jenisPeran),
        terverifikasi: pengguna.terverifikasi,
        profilPengguna: pengguna.profilPengguna,
      },
    };
  }

  /**
   * Helper: Parse expiry string (1h, 7d, 365d) ke milliseconds
   */
  private parseExpiryToMs(expiry: string): number {
    const match = expiry.match(/^(\d+)([smhd])$/);
    if (!match) return 7 * 24 * 60 * 60 * 1000; // default 7 hari

    const value = parseInt(match[1], 10);
    const unit = match[2];

    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    return value * (multipliers[unit] || 1000);
  }

  /**
   * Refresh access token menggunakan refresh token
   */
  async refreshToken(dto: RefreshTokenDto) {
    try {
      // Verify refresh token
      const payload = this.jwtService.verify(dto.refreshToken, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
      });

      // Check apakah refresh token ada di database dan belum kadaluarsa
      const tokenRecord = await this.prisma.tokenRefresh.findFirst({
        where: {
          token: dto.refreshToken,
          idPengguna: payload.sub,
          kadaluarsaPada: {
            gte: new Date(),
          },
        },
      });

      if (!tokenRecord) {
        throw new UnauthorizedException('Refresh token tidak valid atau sudah kadaluarsa');
      }

      // Get platform dari token record untuk maintain consistency
      const platform = tokenRecord.platform;

      // Get pengguna terbaru
      const pengguna = await this.prisma.pengguna.findUnique({
        where: { id: payload.sub },
        include: {
          peranPengguna: {
            where: { aktif: true },
          },
        },
      });

      if (!pengguna || !pengguna.aktif) {
        throw new UnauthorizedException('Pengguna tidak ditemukan atau tidak aktif');
      }

      // Generate access token baru dengan expiry sesuai platform
      const newPayload: JwtPayload = {
        sub: pengguna.id,
        email: pengguna.email,
        peran: pengguna.peranPengguna.map((p) => p.jenisPeran),
      };

      const platformConfig = platform === Platform.mobile ? 'jwt.mobile' : 'jwt.web';
      const accessTokenExpiry = this.configService.get<string>(`${platformConfig}.expiresIn`, '1h');

      const accessToken = this.jwtService.sign(newPayload, {
        expiresIn: accessTokenExpiry,
      });

      return {
        sukses: true,
        pesan: 'Token berhasil diperbarui',
        data: {
          accessToken,
          platform, // Return platform info untuk client reference
        },
      };
    } catch (error) {
      throw new UnauthorizedException('Refresh token tidak valid');
    }
  }

  /**
   * Logout - revoke refresh token
   */
  async logout(idPengguna: string, refreshToken?: string) {
    // Hapus refresh token dari database
    if (refreshToken) {
      await this.prisma.tokenRefresh.deleteMany({
        where: {
          idPengguna,
          token: refreshToken,
        },
      });
    } else {
      // Hapus semua refresh token user (logout dari semua device)
      await this.prisma.tokenRefresh.deleteMany({
        where: { idPengguna },
      });
    }

    // Log aktivitas
    await this.prisma.logAktivitas.create({
      data: {
        idPengguna,
        jenis: 'logout',
        aksi: 'Logout',
        deskripsi: 'Pengguna logout',
      },
    });

    return {
      sukses: true,
      pesan: 'Logout berhasil',
    };
  }

  /**
   * Verifikasi email menggunakan token
   */
  async verifikasiEmail(dto: VerifikasiEmailDto) {
    // Cari token verifikasi
    const tokenRecord = await this.prisma.tokenRefresh.findFirst({
      where: {
        token: dto.token,
        kadaluarsaPada: {
          gte: new Date(),
        },
      },
      include: {
        pengguna: true,
      },
    });

    if (!tokenRecord) {
      throw new BadRequestException('Token verifikasi tidak valid atau sudah kadaluarsa');
    }

    // Update status verifikasi pengguna
    await this.prisma.pengguna.update({
      where: { id: tokenRecord.idPengguna },
      data: {
        terverifikasi: true,
        emailDiverifikasiPada: new Date(),
      },
    });

    // Hapus token verifikasi
    await this.prisma.tokenRefresh.delete({
      where: { id: tokenRecord.id },
    });

    // Log aktivitas
    await this.prisma.logAktivitas.create({
      data: {
        idPengguna: tokenRecord.idPengguna,
        jenis: 'verifikasi_email',
        aksi: 'Verifikasi Email',
        deskripsi: 'Email berhasil diverifikasi',
      },
    });

    return {
      sukses: true,
      pesan: 'Email berhasil diverifikasi. Anda sekarang dapat login.',
    };
  }

  /**
   * Request reset password - kirim token via email
   */
  async lupaPassword(dto: LupaPasswordDto) {
    const pengguna = await this.prisma.pengguna.findUnique({
      where: { email: dto.email },
    });

    // Jangan beri tahu apakah email ada atau tidak (security)
    if (!pengguna) {
      return {
        sukses: true,
        pesan: 'Jika email terdaftar, kami telah mengirim link reset password.',
      };
    }

    // Generate token reset password
    const tokenReset = crypto.randomBytes(32).toString('hex');

    // Simpan token reset
    await this.prisma.tokenRefresh.create({
      data: {
        idPengguna: pengguna.id,
        token: tokenReset,
        kadaluarsaPada: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 jam
      },
    });

    // TODO: Kirim email reset password
    // await this.emailService.kirimEmailResetPassword(pengguna.email, tokenReset);

    // Log aktivitas
    await this.prisma.logAktivitas.create({
      data: {
        idPengguna: pengguna.id,
        jenis: 'lupa_password',
        aksi: 'Lupa Password',
        deskripsi: 'Request reset password',
      },
    });

    return {
      sukses: true,
      pesan: 'Jika email terdaftar, kami telah mengirim link reset password.',
      data: {
        tokenReset, // Untuk development, nanti dihapus
      },
    };
  }

  /**
   * Reset password menggunakan token
   */
  async resetPassword(dto: ResetPasswordDto) {
    // Cari token reset
    const tokenRecord = await this.prisma.tokenRefresh.findFirst({
      where: {
        token: dto.token,
        kadaluarsaPada: {
          gte: new Date(),
        },
      },
    });

    if (!tokenRecord) {
      throw new BadRequestException('Token reset password tidak valid atau sudah kadaluarsa');
    }

    // Hash password baru
    const hashedPassword = await hashPassword(dto.kataSandiBaru);

    // Update password
    await this.prisma.pengguna.update({
      where: { id: tokenRecord.idPengguna },
      data: { kataSandi: hashedPassword },
    });

    // Hapus semua token refresh dan reset untuk user ini (force logout semua device)
    await this.prisma.tokenRefresh.deleteMany({
      where: { idPengguna: tokenRecord.idPengguna },
    });

    // Log aktivitas
    await this.prisma.logAktivitas.create({
      data: {
        idPengguna: tokenRecord.idPengguna,
        jenis: 'reset_password',
        aksi: 'Reset Password',
        deskripsi: 'Password berhasil direset',
      },
    });

    return {
      sukses: true,
      pesan: 'Password berhasil direset. Silakan login dengan password baru.',
    };
  }

  // ============================================
  // OAUTH GOOGLE METHODS
  // ============================================

  /**
   * Generate OAuth state token untuk CSRF protection
   *
   * State token disimpan di database dengan expiry 5 menit.
   * Divalidasi saat callback dari OAuth provider.
   *
   * @param provider - OAuth provider ("google", "facebook", dll)
   * @param redirectUrl - Frontend callback URL (optional)
   * @returns state token
   */
  async generateOAuthState(provider: string, redirectUrl?: string): Promise<string> {
    // Generate secure random state (64 characters)
    const state = crypto.randomBytes(32).toString('hex');

    // Calculate expiry (5 minutes from now)
    const stateExpiry = this.configService.get<number>('googleOAuth.stateExpiry', 300);
    const kadaluarsaPada = new Date(Date.now() + stateExpiry * 1000);

    // Store in database
    await this.prisma.oAuthState.create({
      data: {
        state,
        provider,
        redirectUrl,
        kadaluarsaPada,
      },
    });

    return state;
  }

  /**
   * Validate OAuth state token (CSRF protection)
   *
   * Validasi:
   * 1. State exists di database
   * 2. Provider match
   * 3. Not expired
   * 4. Delete after use (one-time token)
   *
   * @param state - State token dari OAuth callback
   * @param provider - OAuth provider
   * @throws UnauthorizedException jika state invalid
   */
  async validateOAuthState(state: string, provider: string): Promise<void> {
    if (!state) {
      throw new UnauthorizedException('State parameter tidak ada');
    }

    // Find state in database
    const oauthState = await this.prisma.oAuthState.findUnique({
      where: { state },
    });

    if (!oauthState) {
      throw new UnauthorizedException('State tidak valid atau sudah digunakan');
    }

    // Check provider
    if (oauthState.provider !== provider) {
      throw new UnauthorizedException(
        `Provider tidak sesuai. Expected: ${provider}, Got: ${oauthState.provider}`,
      );
    }

    // Check expiry
    if (oauthState.kadaluarsaPada < new Date()) {
      // Delete expired state
      await this.prisma.oAuthState.delete({ where: { state } });
      throw new UnauthorizedException('State sudah kadaluarsa. Silakan coba lagi.');
    }

    // Delete state (one-time use)
    await this.prisma.oAuthState.delete({ where: { state } });
  }

  /**
   * Handle Google OAuth login/registration
   *
   * Strategi:
   * 1. Cari user by email OR googleId
   * 2. Jika ada:
   *    a. Jika belum ada googleId → Link account
   *    b. Jika sudah ada googleId → Just login
   * 3. Jika tidak ada → Create new user
   *
   * Features:
   * - Auto email verification untuk OAuth users
   * - Account linking untuk existing users
   * - Avatar sync dari Google
   * - Comprehensive logging
   *
   * @param googleData - Data dari Google OAuth
   * @returns User object untuk JWT generation
   */
  async handleGoogleOAuth(googleData: {
    googleId: string;
    email: string;
    emailVerified: boolean;
    namaDepan: string;
    namaBelakang: string;
    namaTampilan: string;
    avatarUrl: string | null;
    accessToken?: string;
    refreshToken?: string;
  }): Promise<any> {
    const { googleId, email, emailVerified, namaDepan, namaBelakang, namaTampilan, avatarUrl } =
      googleData;

    // ============================================
    // 1. Check if user exists (by email OR googleId)
    // ============================================
    let pengguna = await this.prisma.pengguna.findFirst({
      where: {
        OR: [{ email }, { googleId }],
      },
      include: {
        profilPengguna: true,
        peranPengguna: {
          where: { aktif: true },
        },
      },
    });

    if (pengguna) {
      // ===== EXISTING USER =====

      if (!pengguna.googleId) {
        // ============================================
        // 2a. Link Google account to existing user
        // ============================================
        pengguna = await this.prisma.pengguna.update({
          where: { id: pengguna.id },
          data: {
            googleId,
            provider: 'google',
            avatarUrl: avatarUrl || pengguna.avatarUrl,
            emailVerifiedByProvider: emailVerified,
            terverifikasi: emailVerified ? true : pengguna.terverifikasi,
            emailDiverifikasiPada:
              emailVerified && !pengguna.emailDiverifikasiPada
                ? new Date()
                : pengguna.emailDiverifikasiPada,
            loginTerakhir: new Date(),
          },
          include: {
            profilPengguna: true,
            peranPengguna: {
              where: { aktif: true },
            },
          },
        });

        // Update profile avatar if not set
        if (avatarUrl && !pengguna.profilPengguna?.urlAvatar) {
          await this.prisma.profilPengguna.update({
            where: { idPengguna: pengguna.id },
            data: { urlAvatar: avatarUrl },
          });
        }

        // Log activity: Account linked
        await this.prisma.logAktivitas.create({
          data: {
            idPengguna: pengguna.id,
            jenis: 'oauth_link',
            aksi: 'Link Google Account',
            deskripsi: `Akun Google berhasil di-link: ${email}`,
          },
        });
      } else {
        // ============================================
        // 2b. User already linked, just login
        // ============================================
        pengguna = await this.prisma.pengguna.update({
          where: { id: pengguna.id },
          data: {
            loginTerakhir: new Date(),
            avatarUrl: avatarUrl || pengguna.avatarUrl, // Update avatar if changed
          },
          include: {
            profilPengguna: true,
            peranPengguna: {
              where: { aktif: true },
            },
          },
        });

        // Log activity: Login
        await this.prisma.logAktivitas.create({
          data: {
            idPengguna: pengguna.id,
            jenis: 'login',
            aksi: 'Login via Google',
            deskripsi: `User login menggunakan Google OAuth: ${email}`,
          },
        });
      }
    } else {
      // ===== NEW USER =====
      // ============================================
      // 3. Create new user account
      // ============================================
      pengguna = await this.prisma.$transaction(async (prisma) => {
        // 3a. Create user
        const newPengguna = await prisma.pengguna.create({
          data: {
            email,
            googleId,
            provider: 'google',
            avatarUrl,
            aktif: true,
            terverifikasi: emailVerified, // Auto-verify if Google verified
            emailVerifiedByProvider: emailVerified,
            emailDiverifikasiPada: emailVerified ? new Date() : null,
            loginTerakhir: new Date(),
          },
        });

        // 3b. Create profile
        await prisma.profilPengguna.create({
          data: {
            idPengguna: newPengguna.id,
            namaDepan,
            namaBelakang,
            namaTampilan,
            urlAvatar: avatarUrl,
          },
        });

        // 3c. Assign default role (penulis)
        await prisma.peranPengguna.create({
          data: {
            idPengguna: newPengguna.id,
            jenisPeran: JenisPeran.penulis,
            aktif: true,
          },
        });

        // 3d. Create profil penulis
        await prisma.profilPenulis.create({
          data: {
            idPengguna: newPengguna.id,
            namaPena: namaTampilan,
          },
        });

        // 3e. Log activity: Registration
        await prisma.logAktivitas.create({
          data: {
            idPengguna: newPengguna.id,
            jenis: 'register',
            aksi: 'Register via Google',
            deskripsi: `User baru terdaftar melalui Google OAuth: ${email}`,
          },
        });

        // Return with relations
        return await prisma.pengguna.findUnique({
          where: { id: newPengguna.id },
          include: {
            profilPengguna: true,
            peranPengguna: {
              where: { aktif: true },
            },
          },
        });
      });

      // Validasi transaction result
      if (!pengguna) {
        throw new InternalServerErrorException('Gagal membuat user baru');
      }
    }

    // ============================================
    // 4. Return user data untuk JWT generation
    // ============================================
    return {
      id: pengguna.id,
      email: pengguna.email,
      peran: pengguna.peranPengguna.map((p: any) => p.jenisPeran),
      terverifikasi: pengguna.terverifikasi,
      profilPengguna: pengguna.profilPengguna,
    };
  }

  /**
   * Link Google account ke existing logged-in user
   *
   * Use case: User yang sudah punya account local
   * ingin link Google account untuk future login.
   *
   * @param userId - ID user yang sedang login
   * @param googleId - Google ID untuk di-link
   */
  async linkGoogleAccount(userId: string, googleId: string): Promise<any> {
    // Check if Google ID already used
    const existingGoogle = await this.prisma.pengguna.findUnique({
      where: { googleId },
    });

    if (existingGoogle && existingGoogle.id !== userId) {
      throw new ConflictException('Google account ini sudah digunakan oleh user lain');
    }

    // Link Google account
    const pengguna = await this.prisma.pengguna.update({
      where: { id: userId },
      data: {
        googleId,
        provider: 'google',
      },
    });

    // Log activity
    await this.prisma.logAktivitas.create({
      data: {
        idPengguna: userId,
        jenis: 'oauth_link',
        aksi: 'Link Google Account',
        deskripsi: 'Google account berhasil di-link ke akun existing',
      },
    });

    return {
      sukses: true,
      pesan: 'Google account berhasil di-link',
    };
  }

  /**
   * Unlink Google account dari user
   *
   * Syarat: User harus punya password (tidak boleh OAuth-only account)
   *
   * @param userId - ID user yang akan unlink
   */
  async unlinkGoogleAccount(userId: string): Promise<any> {
    const pengguna = await this.prisma.pengguna.findUnique({
      where: { id: userId },
    });

    if (!pengguna) {
      throw new NotFoundException('User tidak ditemukan');
    }

    // Check if user has password
    if (!pengguna.kataSandi) {
      throw new BadRequestException(
        'Tidak bisa unlink Google account. Silakan set password terlebih dahulu.',
      );
    }

    // Unlink Google
    await this.prisma.pengguna.update({
      where: { id: userId },
      data: {
        googleId: null,
        provider: 'local',
      },
    });

    // Log activity
    await this.prisma.logAktivitas.create({
      data: {
        idPengguna: userId,
        jenis: 'oauth_unlink',
        aksi: 'Unlink Google Account',
        deskripsi: 'Google account berhasil di-unlink',
      },
    });

    return {
      sukses: true,
      pesan: 'Google account berhasil di-unlink',
    };
  }
}
