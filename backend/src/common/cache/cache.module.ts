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
        const redisEnabled = configService.get<boolean>('redis.enabled', true);
        
        // Jika Redis di-disable, gunakan in-memory cache
        if (!redisEnabled) {
          console.log('[CacheModule] Redis disabled, using in-memory cache');
          return {
            ttl: 300, // 5 minutes
            max: 1000,
            isGlobal: true,
          };
        }

        const redisConfig = {
          socket: {
            host: configService.get<string>('redis.host', 'localhost'),
            port: configService.get<number>('redis.port', 6379),
          },
          username: configService.get<string>('redis.username') || undefined,
          password: configService.get<string>('redis.password') || undefined,
          database: configService.get<number>('redis.db', 0),
        };

        // Coba inisialisasi redis store. Jika gagal (mis. Redis tidak tersedia),
        // fallback ke cache in-memory agar aplikasi tetap bisa berjalan di dev.
        try {
          console.log('[CacheModule] Connecting to Redis:', redisConfig.socket.host);
          const store = await redisStore(redisConfig);
          console.log('[CacheModule] Redis connected successfully');
          return {
            store,
            ttl: 300, // Default TTL: 5 minutes (dalam detik)
            max: 1000, // Maximum items in cache
            isGlobal: true,
          };
        } catch (err) {
          console.warn('[CacheModule] Redis unavailable, falling back to in-memory cache. Error:', err instanceof Error ? err.message : String(err));
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
