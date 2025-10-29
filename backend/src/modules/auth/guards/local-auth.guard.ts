import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Local Authentication Guard
 * 
 * Digunakan untuk endpoint login
 * Menggunakan LocalStrategy untuk validate username/password
 * 
 * @example
 * @UseGuards(LocalAuthGuard)
 * @Post('login')
 * async login(@PenggunaSaatIni() pengguna: any) {
 *   return this.authService.login(pengguna);
 * }
 */
@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}
