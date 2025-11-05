import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'default-secret-key-change-in-production',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret-key',

  // Web platform - short-lived tokens for security
  web: {
    expiresIn: process.env.JWT_WEB_EXPIRES_IN || '1h',
    refreshExpiresIn: process.env.JWT_WEB_REFRESH_EXPIRES_IN || '7d',
  },

  // Mobile platform - long-lived tokens for convenience
  mobile: {
    expiresIn: process.env.JWT_MOBILE_EXPIRES_IN || '365d',
    refreshExpiresIn: process.env.JWT_MOBILE_REFRESH_EXPIRES_IN || '365d',
  },

  // Backward compatibility - default to web settings
  expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
}));
