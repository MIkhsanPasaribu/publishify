import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/prisma/prisma.service';
import { hashPassword, verifyPassword } from '@/utils/hash.util';
import {
  DaftarDto,
  LoginDto,
  RefreshTokenDto,
  LupaPasswordDto,
  ResetPasswordDto,
  VerifikasiEmailDto,
} from './dto';
import { JenisPeran } from '@prisma/client';
import * as crypto from 'crypto';

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
  async login(pengguna: any): Promise<ResponseLogin> {
    // Prepare JWT payload
    const payload: JwtPayload = {
      sub: pengguna.id,
      email: pengguna.email,
      peran: pengguna.peranPengguna.map((p) => p.jenisPeran),
    };

    // Generate access token
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('jwt.expiresIn', '1h'),
    });

    // Generate refresh token
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.refreshSecret'),
      expiresIn: this.configService.get<string>('jwt.refreshExpiresIn', '7d'),
    });

    // Simpan refresh token ke database
    await this.prisma.tokenRefresh.create({
      data: {
        idPengguna: pengguna.id,
        token: refreshToken,
        kadaluarsaPada: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 hari
      },
    });

    // Update last login
    await this.prisma.pengguna.update({
      where: { id: pengguna.id },
      data: { loginTerakhir: new Date() },
    });

    // Log aktivitas
    await this.prisma.logAktivitas.create({
      data: {
        idPengguna: pengguna.id,
        jenis: 'login',
        aksi: 'Login',
        deskripsi: 'Pengguna berhasil login',
      },
    });

    return {
      accessToken,
      refreshToken,
      pengguna: {
        id: pengguna.id,
        email: pengguna.email,
        peran: pengguna.peranPengguna.map((p) => p.jenisPeran),
        terverifikasi: pengguna.terverifikasi,
        profilPengguna: pengguna.profilPengguna,
      },
    };
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

      // Generate access token baru
      const newPayload: JwtPayload = {
        sub: pengguna.id,
        email: pengguna.email,
        peran: pengguna.peranPengguna.map((p) => p.jenisPeran),
      };

      const accessToken = this.jwtService.sign(newPayload, {
        expiresIn: this.configService.get<string>('jwt.expiresIn', '1h'),
      });

      return {
        sukses: true,
        pesan: 'Token berhasil diperbarui',
        data: {
          accessToken,
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
}
