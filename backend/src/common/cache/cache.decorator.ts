import { SetMetadata } from '@nestjs/common';

/**
 * Decorator untuk menandai endpoint yang menggunakan cache
 * Digunakan bersama CacheInterceptor
 */
export const CACHE_KEY_METADATA = 'cache:key';
export const CACHE_TTL_METADATA = 'cache:ttl';

/**
 * Set custom cache key untuk endpoint
 * @param key - Cache key pattern
 */
export const CacheKey = (key: string) => SetMetadata(CACHE_KEY_METADATA, key);

/**
 * Set custom TTL untuk endpoint
 * @param ttl - Time to live dalam detik
 */
export const CacheTTL = (ttl: number) => SetMetadata(CACHE_TTL_METADATA, ttl);

/**
 * Decorator untuk skip caching pada endpoint tertentu
 */
export const NO_CACHE_METADATA = 'cache:no-cache';
export const NoCache = () => SetMetadata(NO_CACHE_METADATA, true);
