import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { IS_PUBLIC_KEY } from '@/common/decorators/public.decorator';

/**
 * JWT Authentication Guard
 * 
 * Protect routes yang memerlukan authentication
 * Otomatis skip authentication untuk routes yang di-mark dengan @Public()
 * 
 * @example
 * // Di controller
 * @UseGuards(JwtAuthGuard)
 * @Get('profile')
 * async getProfile(@PenggunaSaatIni() pengguna: any) {
 *   return pengguna;
 * }
 * 
 * @example
 * // Route publik (skip auth)
 * @Public()
 * @Get('public-data')
 * async getPublicData() {
 *   return 'Data publik';
 * }
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Check apakah route di-mark sebagai public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Jika public, skip authentication
    if (isPublic) {
      return true;
    }

    // Lanjutkan dengan JWT authentication
    return super.canActivate(context);
  }
}
