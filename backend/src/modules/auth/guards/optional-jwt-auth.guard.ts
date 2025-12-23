import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Optional JWT Authentication Guard
 * 
 * Mencoba extract JWT token jika ada, tapi TIDAK throw error jika token tidak ada/invalid.
 * Berguna untuk endpoint yang bisa diakses public tapi memiliki behavior berbeda untuk authenticated user.
 * 
 * Perbedaan dengan JwtAuthGuard:
 * - JwtAuthGuard: WAJIB ada token valid, throw 401 jika tidak ada
 * - OptionalJwtAuthGuard: OPSIONAL token, tidak throw error jika tidak ada
 * 
 * @example
 * // Endpoint yang bisa diakses public, tapi user authenticated dapat akses lebih banyak
 * @UseGuards(OptionalJwtAuthGuard)
 * @Get(':id')
 * async getNaskah(
 *   @Param('id') id: string,
 *   @PenggunaSaatIni('id') idPengguna?: string, // Optional, bisa undefined
 * ) {
 *   return this.naskahService.ambilNaskahById(id, idPengguna);
 * }
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  /**
   * Override handleRequest untuk tidak throw error jika authentication gagal
   * Return null jika tidak ada user, sehingga @PenggunaSaatIni akan return undefined
   */
  handleRequest<TUser = any>(
    err: any,
    user: any,
    info: any,
    context: ExecutionContext,
  ): TUser {
    // Jika ada error atau tidak ada user, return null (tidak throw error)
    // Ini membuat endpoint tetap accessible tanpa authentication
    if (err || !user) {
      return null as any;
    }

    // Jika ada user, return user tersebut
    return user;
  }
}
