import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '@/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

/**
 * Middleware untuk inject user context ke Prisma untuk RLS
 * Middleware ini akan:
 * 1. Extract JWT token dari header Authorization
 * 2. Decode JWT untuk mendapatkan user info
 * 3. Set user context di Prisma session untuk RLS
 * 4. Clear context setelah request selesai
 */
@Injectable()
export class PrismaRlsMiddleware implements NestMiddleware {
  private readonly logger = new Logger(PrismaRlsMiddleware.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // Extract token dari Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // Tidak ada token, lanjutkan tanpa set context
      // RLS akan treat sebagai anonymous/unauthenticated
      this.logger.debug('⚠️ Request tanpa token JWT - treated as anonymous');
      return next();
    }

    try {
      // Extract token
      const token = authHeader.substring(7); // Remove 'Bearer ' prefix

      // Decode token (tanpa verify karena sudah di-verify di JwtAuthGuard)
      const payload = this.jwtService.decode(token) as any;

      if (!payload || !payload.sub) {
        this.logger.warn('⚠️ Token JWT tidak valid atau tidak ada user ID');
        return next();
      }

      // Set user context untuk RLS
      await this.prisma.setUserContext({
        userId: payload.sub,
        email: payload.email || '',
        role: payload.role || 'authenticated',
      });

      this.logger.debug(`✅ User context di-set untuk request: ${payload.email}`);

      // Cleanup context setelah request selesai
      res.on('finish', async () => {
        await this.prisma.clearUserContext();
        this.logger.debug('🧹 User context dibersihkan setelah response');
      });

      // Handle error dan cleanup
      res.on('close', async () => {
        await this.prisma.clearUserContext();
      });

      next();
    } catch (error: any) {
      this.logger.error(`❌ Error di RLS middleware: ${error.message}`);
      // Jika error, tetap lanjutkan request tapi tanpa context
      // RLS akan treat sebagai anonymous
      next();
    }
  }
}
