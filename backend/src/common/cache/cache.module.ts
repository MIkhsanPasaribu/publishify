import { Module, Global } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-yet';
import { CacheService } from './cache.service';

@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const redisConfig = {
          socket: {
            host: configService.get<string>('REDIS_HOST', 'localhost'),
            port: configService.get<number>('REDIS_PORT', 6379),
          },
          username: configService.get<string>('REDIS_USERNAME') || undefined,
          password: configService.get<string>('REDIS_PASSWORD') || undefined,
          database: configService.get<number>('REDIS_DB', 0),
        };

        // Coba inisialisasi redis store. Jika gagal (mis. Redis tidak tersedia),
        // fallback ke cache in-memory agar aplikasi tetap bisa berjalan di dev.
        try {
          const store = await redisStore(redisConfig);
          return {
            store,
            ttl: 300, // Default TTL: 5 minutes (dalam detik)
            max: 1000, // Maximum items in cache
            isGlobal: true,
          };
        } catch (err) {
          console.warn('[CacheModule] Redis unavailable, falling back to in-memory cache. Error:', String(err));
          return {
            // Tanpa `store` -> menggunakan memory store bawaan cache-manager
            ttl: 300,
            max: 1000,
            isGlobal: true,
          };
        }
      },
    }),
  ],
  providers: [CacheService],
  exports: [CacheService, NestCacheModule],
})
export class CacheModule {}
