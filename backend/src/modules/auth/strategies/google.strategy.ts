import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

// Type untuk Express.Request dengan query
interface RequestWithQuery extends Express.Request {
  query: {
    state?: string;
    [key: string]: any;
  };
}

/**
 * Google OAuth 2.0 Strategy
 *
 * Strategy untuk autentikasi menggunakan Google OAuth 2.0.
 * Menggunakan Authorization Code Flow (paling aman).
 *
 * Flow:
 * 1. User klik "Sign in with Google"
 * 2. Redirect ke Google OAuth page
 * 3. User login & grant permissions
 * 4. Google redirect ke callback URL dengan code
 * 5. Strategy ini exchange code → tokens
 * 6. Extract user profile
 * 7. Create/link user di database
 * 8. Return user object untuk JWT generation
 *
 * Security:
 * - State parameter untuk CSRF protection
 * - Server-side code exchange (client secret never exposed)
 * - Email verification otomatis
 *
 * @see https://www.passportjs.org/packages/passport-google-oauth20/
 */
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('googleOAuth.clientID'),
      clientSecret: configService.get<string>('googleOAuth.clientSecret'),
      callbackURL: configService.get<string>('googleOAuth.callbackURL'),
      scope: configService.get<string[]>('googleOAuth.scope'),
      accessType: configService.get<string>('googleOAuth.accessType'),
      prompt: configService.get<string>('googleOAuth.prompt'),
      passReqToCallback: true, // ✅ Enable access to request object
    });
  }

  /**
   * Validate method
   *
   * Dipanggil setelah Google berhasil authenticate user.
   * Method ini:
   * 1. Validate state parameter (CSRF protection)
   * 2. Extract user info dari Google profile
   * 3. Find or create user di database
   * 4. Return user object
   *
   * @param request - Express request object (untuk state validation)
   * @param accessToken - Google access token
   * @param refreshToken - Google refresh token (optional)
   * @param profile - User profile from Google
   * @param done - Passport callback
   */
  async validate(
    request: RequestWithQuery,
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<any> {
    try {
      // ============================================
      // 1. Extract user info dari Google profile
      // ============================================
      const { id: googleId, emails, displayName, name, photos } = profile;

      // Validate email exists
      if (!emails || emails.length === 0) {
        throw new UnauthorizedException(
          'Email tidak tersedia dari Google. Pastikan Anda memberikan akses email.',
        );
      }

      const email = emails[0].value;
      const emailVerified = emails[0].verified ?? true; // Google emails umumnya verified

      // ============================================
      // 2. Validate state parameter (CSRF protection)
      // ============================================
      const state = request.query.state as string;

      if (!state) {
        throw new UnauthorizedException('State parameter tidak ditemukan. Silakan coba lagi.');
      }

      // Validate state di database
      await this.authService.validateOAuthState(state, 'google');

      // ============================================
      // 3. Extract user data
      // ============================================
      const userData = {
        googleId,
        email,
        emailVerified,
        namaDepan: name?.givenName || displayName.split(' ')[0] || 'User',
        namaBelakang: name?.familyName || displayName.split(' ').slice(1).join(' ') || '',
        namaTampilan: displayName,
        avatarUrl: photos && photos.length > 0 ? photos[0].value : null,
        accessToken, // Google access token (optional - untuk future use)
        refreshToken, // Google refresh token (optional)
      };

      // ============================================
      // 4. Find or create user
      // ============================================
      const user = await this.authService.handleGoogleOAuth(userData);

      // ============================================
      // 5. Return user (akan di-attach ke request.user)
      // ============================================
      done(null, user);
    } catch (error) {
      // Log error untuk debugging
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[GoogleStrategy] Error:', errorMessage);

      // Return error ke Passport
      done(error as Error, undefined);
    }
  }
}
