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

        return {
          store: await redisStore(redisConfig),
          ttl: 300, // Default TTL: 5 minutes (dalam detik)
          max: 1000, // Maximum items in cache
          isGlobal: true,
        };
      },
    }),
  ],
  providers: [CacheService],
  exports: [CacheService, NestCacheModule],
})
export class CacheModule {}
