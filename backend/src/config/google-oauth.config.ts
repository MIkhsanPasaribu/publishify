import { registerAs } from '@nestjs/config';

/**
 * Google OAuth 2.0 Configuration
 *
 * Konfigurasi untuk autentikasi menggunakan Google OAuth.
 * Menggunakan Authorization Code Flow (paling aman untuk web apps).
 *
 * Setup:
 * 1. Buat project di Google Cloud Console
 * 2. Enable Google+ API
 * 3. Create OAuth 2.0 Client ID
 * 4. Add authorized redirect URIs
 * 5. Copy Client ID & Secret ke .env
 */
export default registerAs('googleOAuth', () => ({
  // OAuth Credentials
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,

  // Callback URL (backend endpoint)
  callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:4000/api/auth/google/callback',

  // Frontend redirect (after successful OAuth)
  frontendCallback: process.env.FRONTEND_AUTH_CALLBACK || 'http://localhost:3000/auth/callback',

  // Scopes yang diminta dari Google
  scope: ['profile', 'email'],

  // State expiry (CSRF protection) - dalam detik
  stateExpiry: parseInt(process.env.OAUTH_STATE_EXPIRY || '300', 10), // 5 minutes

  // Access type (offline = get refresh token)
  accessType: 'offline',

  // Prompt consent untuk selalu tampilkan consent screen
  prompt: 'consent',
}));
