import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorator untuk mendapatkan pengguna saat ini dari request
 * 
 * Digunakan setelah JWT authentication berhasil
 * Request akan memiliki property 'user' yang berisi payload JWT
 * 
 * @example
 * // Mendapatkan seluruh object pengguna
 * async getProfile(@PenggunaSaatIni() pengguna: any) {
 *   return pengguna;
 * }
 * 
 * @example
 * // Mendapatkan field spesifik (id)
 * async getMyData(@PenggunaSaatIni('id') idPengguna: string) {
 *   return this.penggunaService.ambilById(idPengguna);
 * }
 * 
 * @example
 * // Mendapatkan email
 * async getMyProfile(@PenggunaSaatIni('email') email: string) {
 *   return { email };
 * }
 */
export const PenggunaSaatIni = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const pengguna = request.user;

    // Jika tidak ada data (field name), return seluruh object pengguna
    if (!data) {
      return pengguna;
    }

    // Jika ada data, return field spesifik
    return pengguna?.[data];
  },
);
