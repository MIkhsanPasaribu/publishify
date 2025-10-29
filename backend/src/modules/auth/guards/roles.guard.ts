import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JenisPeran } from '@prisma/client';
import { PERAN_KEY } from '../decorators/peran.decorator';

/**
 * Roles Guard untuk Role-Based Access Control (RBAC)
 * 
 * Check apakah user memiliki peran yang diizinkan untuk mengakses route
 * Harus digunakan setelah JwtAuthGuard
 * 
 * @example
 * // Di controller
 * @UseGuards(JwtAuthGuard, PeranGuard)
 * @Peran('admin')
 * @Delete(':id')
 * async hapusUser(@Param('id') id: string) {
 *   return this.userService.hapus(id);
 * }
 * 
 * @example
 * // Multiple roles
 * @UseGuards(JwtAuthGuard, PeranGuard)
 * @Peran('penulis', 'editor')
 * @Post('naskah')
 * async buatNaskah() {
 *   return 'Naskah dibuat';
 * }
 */
@Injectable()
export class PeranGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Ambil peran yang diizinkan dari metadata
    const peranDiizinkan = this.reflector.getAllAndOverride<JenisPeran[]>(
      PERAN_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Jika tidak ada peran yang di-set, allow access
    if (!peranDiizinkan || peranDiizinkan.length === 0) {
      return true;
    }

    // Ambil user dari request (sudah di-set oleh JwtAuthGuard)
    const request = context.switchToHttp().getRequest();
    const pengguna = request.user;

    // Jika user tidak ada, reject
    if (!pengguna) {
      throw new ForbiddenException('Anda tidak memiliki akses ke resource ini');
    }

    // Check apakah user memiliki salah satu peran yang diizinkan
    const peranPengguna = pengguna.peran || [];
    const memilikiPeran = peranDiizinkan.some((peran) =>
      peranPengguna.includes(peran),
    );

    if (!memilikiPeran) {
      throw new ForbiddenException(
        `Anda tidak memiliki akses ke resource ini. Peran yang dibutuhkan: ${peranDiizinkan.join(', ')}`,
      );
    }

    return true;
  }
}
