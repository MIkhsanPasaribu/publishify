import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/prisma/prisma.service';

/**
 * Interface untuk JWT payload
 */
export interface JwtPayload {
  sub: string; // User ID
  email: string;
  peran: string[];
  iat?: number; // Issued at
  exp?: number; // Expiration time
}

/**
 * JWT Strategy untuk validasi JWT token
 * 
 * Digunakan untuk protect routes yang memerlukan authentication
 * Passport akan otomatis extract JWT dari Authorization header
 * Kemudian memanggil method validate() untuk verifikasi token
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret'),
    });
  }

  /**
   * Method validate dipanggil setelah JWT token berhasil di-verify
   * 
   * @param payload - Payload dari JWT token
   * @returns Object pengguna untuk di-attach ke request.user
   * @throws UnauthorizedException jika user tidak ditemukan atau tidak aktif
   */
  async validate(payload: JwtPayload) {
    // Cek apakah user masih ada dan aktif di database
    const pengguna = await this.prisma.pengguna.findUnique({
      where: {
        id: payload.sub,
      },
      include: {
        profilPengguna: true,
        peranPengguna: {
          where: {
            aktif: true,
          },
        },
      },
    });

    if (!pengguna) {
      throw new UnauthorizedException('Pengguna tidak ditemukan');
    }

    if (!pengguna.aktif) {
      throw new UnauthorizedException('Akun Anda telah dinonaktifkan');
    }

    // Object ini akan di-attach ke request.user
    return {
      id: pengguna.id,
      email: pengguna.email,
      peran: pengguna.peranPengguna.map((p) => p.jenisPeran),
      terverifikasi: pengguna.terverifikasi,
      profilPengguna: pengguna.profilPengguna,
    };
  }
}
