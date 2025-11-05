import { Platform } from '@prisma/client';

/**
 * Deteksi platform dari User-Agent atau custom header
 *
 * @param userAgent - User-Agent string dari request header
 * @param customPlatform - Custom platform header (X-Platform)
 * @returns Platform enum (web atau mobile)
 */
export function detectPlatform(userAgent?: string, customPlatform?: string): Platform {
  // Prioritas 1: Gunakan custom header jika ada
  if (customPlatform) {
    const platformLower = customPlatform.toLowerCase();
    if (platformLower === 'mobile') return Platform.mobile;
    if (platformLower === 'web') return Platform.web;
  }

  // Prioritas 2: Deteksi dari User-Agent
  if (userAgent) {
    const ua = userAgent.toLowerCase();

    // Deteksi mobile User-Agent patterns
    const mobilePatterns = [
      /android/i,
      /iphone/i,
      /ipad/i,
      /ipod/i,
      /mobile/i,
      /windows phone/i,
      /blackberry/i,
    ];

    for (const pattern of mobilePatterns) {
      if (pattern.test(ua)) {
        return Platform.mobile;
      }
    }
  }

  // Default: web platform
  return Platform.web;
}

/**
 * Format platform enum ke string yang readable
 */
export function formatPlatform(platform: Platform): string {
  const labels: Record<Platform, string> = {
    [Platform.web]: 'Web',
    [Platform.mobile]: 'Mobile',
  };

  return labels[platform];
}
