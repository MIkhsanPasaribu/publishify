import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CacheService } from './cache.service';
import { CACHE_KEY_METADATA, CACHE_TTL_METADATA, NO_CACHE_METADATA } from './cache.decorator';

/**
 * Interceptor untuk automatic caching pada endpoints
 *
 * Usage:
 * @UseInterceptors(CacheInterceptor)
 * @CacheKey('kategori:list')
 * @CacheTTL(3600)
 * @Get()
 * async getKategori() { ... }
 */
@Injectable()
export class CacheInterceptor implements NestInterceptor {
  private readonly logger = new Logger(CacheInterceptor.name);

  constructor(
    private readonly cacheService: CacheService,
    private readonly reflector: Reflector,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    // Check if caching is disabled for this handler
    const noCache = this.reflector.get<boolean>(NO_CACHE_METADATA, context.getHandler());
    if (noCache) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const { method, url } = request;

    // Only cache GET requests
    if (method !== 'GET') {
      return next.handle();
    }

    // Get cache metadata
    const cacheKeyPattern = this.reflector.get<string>(CACHE_KEY_METADATA, context.getHandler());
    const ttl = this.reflector.get<number>(CACHE_TTL_METADATA, context.getHandler());

    if (!cacheKeyPattern) {
      // No cache key specified, skip caching
      return next.handle();
    }

    // Generate cache key dengan query params
    const cacheKey = this.generateCacheKey(cacheKeyPattern, request.query);

    try {
      // Check cache
      const cachedData = await this.cacheService.ambil(cacheKey);
      if (cachedData !== undefined) {
        this.logger.debug(`Serving from cache: ${cacheKey}`);
        return of(cachedData);
      }

      // Cache miss - execute handler and cache result
      return next.handle().pipe(
        tap(async (data) => {
          if (data !== undefined && data !== null) {
            await this.cacheService.simpan(cacheKey, data, ttl);
            this.logger.debug(`Cached response: ${cacheKey} (TTL: ${ttl || 'default'}s)`);
          }
        }),
      );
    } catch (error) {
      this.logger.error(`Cache error for ${url}:`, error);
      // On cache error, proceed without caching
      return next.handle();
    }
  }

  /**
   * Generate cache key dari pattern dan query params
   */
  private generateCacheKey(pattern: string, query: any): string {
    if (!query || Object.keys(query).length === 0) {
      return pattern;
    }

    // Sort query params untuk consistent cache key
    const sortedQuery = Object.keys(query)
      .sort()
      .reduce((acc, key) => {
        acc[key] = query[key];
        return acc;
      }, {} as any);

    const queryString = JSON.stringify(sortedQuery);
    return `${pattern}:${queryString}`;
  }
}
