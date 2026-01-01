# LAPORAN DEVELOPMENT STEP BY STEP FASE 5

## PART 3: IMPLEMENTASI STEP-BY-STEP - REDIS CACHING DAN DATABASE OPTIMIZATION

**Tutorial**: Hands-on Implementation Guide  
**Focus**: Redis Caching Layer dan Query Optimization  
**Prerequisite**: PART 2 - Perancangan Sistem  
**Versi Dokumen**: 1.0.0

---

## D. IMPLEMENTASI STEP-BY-STEP

### D.1 Setup Redis Infrastructure

Langkah pertama dalam implementing caching layer adalah setup Redis infrastructure yang reliable dan production-ready. Kami akan walk through dari installation hingga configuration.

**Langkah 1: Pilih Redis Hosting Option**

Untuk production deployment, kami recommend managed Redis services karena mereka handle scaling, backups, dan maintenance automatically. Options yang kami evaluate:

1. **Upstash Redis** (✅ Pilihan kami)

   - Serverless pricing model (pay per request)
   - Global replication untuk low latency
   - Built-in REST API sebagai fallback
   - Free tier: 10,000 commands/day
   - Automatic scaling dan high availability

2. **Redis Cloud**

   - Traditional Redis provider
   - Robust features dan good documentation
   - Pricing: Fixed monthly cost

3. **AWS ElastiCache** / **Azure Cache for Redis**
   - Cloud provider native solutions
   - Good jika already using AWS/Azure
   - More complex setup requirements

**Langkah 2: Provision Redis Instance**

Untuk Upstash (step-by-step):

1. Sign up di https://console.upstash.com/
2. Create new database
3. Pilih region closest ke application server (untuk low latency)
4. Select pricing plan (Free tier sufficient untuk development)
5. Copy connection details:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
   - Atau traditional connection string untuk direct TCP connection

**Langkah 3: Install Dependencies**

```bash
# Install Redis client dan cache manager packages
bun add ioredis @nestjs/cache-manager cache-manager cache-manager-redis-store

# Install type definitions
bun add -D @types/cache-manager @types/cache-manager-redis-store
```

**Dependency Explanation**:

- `ioredis`: Robust Redis client untuk Node.js dengan TypeScript support
- `@nestjs/cache-manager`: NestJS official caching module
- `cache-manager`: Caching framework dengan multiple backend support
- `cache-manager-redis-store`: Redis backend untuk cache-manager

**Langkah 4: Create Redis Configuration**

**Lokasi File**: `backend/src/config/redis.config.ts`

```typescript
import { registerAs } from "@nestjs/config";

export default registerAs("redis", () => ({
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT, 10) || 6379,
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB, 10) || 0,
  // Connection retry strategy
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  // Max retry attempts per request
  maxRetriesPerRequest: 3,
  // Enable auto reconnection
  enableReadyCheck: true,
  enableOfflineQueue: false,
}));
```

**Configuration Explained**:

- `retryStrategy`: Exponential backoff untuk reconnection - start dengan 50ms, double each retry, cap di 2000ms
- `maxRetriesPerRequest`: Prevent infinite retry loops
- `enableReadyCheck`: Wait untuk connection ready sebelum accepting commands
- `enableOfflineQueue`: Disable queuing commands when disconnected (fail fast)

**Langkah 5: Setup Environment Variables**

**Lokasi File**: `backend/.env`

```env
# Redis Configuration
REDIS_HOST=region-endpoint.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=your_upstash_password_here
REDIS_DB=0

# Cache Configuration
CACHE_TTL=300  # Default TTL dalam detik (5 menit)
```

**Security Note**: NEVER commit `.env` file. Ensure `.env` listed dalam `.gitignore`. Untuk production, use environment variable management dari hosting provider (Vercel, Railway, etc).

**Langkah 6: Verify Redis Connection**

Create simple test script untuk verify connection works:

**Lokasi File**: `backend/test/test-redis.ts`

```typescript
import Redis from "ioredis";

async function testRedisConnection() {
  const redis = new Redis({
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT),
    password: process.env.REDIS_PASSWORD,
  });

  try {
    // Test PING command
    const pong = await redis.ping();
    console.log("✅ Redis connection successful:", pong);

    // Test SET dan GET
    await redis.set("test:key", "Hello Redis!");
    const value = await redis.get("test:key");
    console.log("✅ SET/GET test:", value);

    // Test TTL
    await redis.setex("test:ttl", 10, "Expires in 10s");
    const ttl = await redis.ttl("test:ttl");
    console.log("✅ TTL test:", ttl, "seconds");

    // Cleanup
    await redis.del("test:key", "test:ttl");
    console.log("✅ All tests passed!");
  } catch (error) {
    console.error("❌ Redis test failed:", error);
  } finally {
    await redis.quit();
  }
}

testRedisConnection();
```

**Run Test**:

```bash
bun run test/test-redis.ts
```

Expected output:

```
✅ Redis connection successful: PONG
✅ SET/GET test: Hello Redis!
✅ TTL test: 10 seconds
✅ All tests passed!
```

### D.2 Implement Cache Service Abstraction Layer

Cache Service berfungsi sebagai unified interface untuk all caching operations, hiding complexity dari underlying Redis implementation.

**Langkah 1: Create Cache Module**

**Lokasi File**: `backend/src/common/cache/cache.module.ts`

```typescript
import { Module, Global } from "@nestjs/common";
import { CacheModule as NestCacheModule } from "@nestjs/cache-manager";
import { ConfigModule, ConfigService } from "@nestjs/config";
import * as redisStore from "cache-manager-redis-store";
import { CacheService } from "./cache.service";
import { CacheInterceptor } from "./cache.interceptor";

@Global() // Make module global untuk easy access dari anywhere
@Module({
  imports: [
    NestCacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get("REDIS_HOST"),
        port: configService.get("REDIS_PORT"),
        password: configService.get("REDIS_PASSWORD"),
        db: configService.get("REDIS_DB", 0),
        ttl: configService.get("CACHE_TTL", 300),
        // Handle connection errors gracefully
        socket: {
          timeout: 5000, // 5s timeout
        },
      }),
    }),
  ],
  providers: [CacheService, CacheInterceptor],
  exports: [CacheService, CacheInterceptor],
})
export class CacheModule {}
```

**Module Design Points**:

- `@Global()` decorator makes module accessible tanpa re-importing
- `registerAsync()` allows access ke ConfigService untuk environment variables
- Error handling timeout prevents hanging operations
- TTL default dari environment variable untuk easy tuning

**Langkah 2: Implement Cache Service**

**Lokasi File**: `backend/src/common/cache/cache.service.ts` (163 lines)

```typescript
import { Injectable, Inject, Logger } from "@nestjs/common";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  /**
   * Ambil data dari cache
   */
  async ambil<T>(key: string): Promise<T | undefined> {
    try {
      const data = await this.cacheManager.get<T>(key);
      if (data) {
        this.logger.debug(`Cache HIT: ${key}`);
      } else {
        this.logger.debug(`Cache MISS: ${key}`);
      }
      return data;
    } catch (error) {
      this.logger.error(`Error mengambil cache untuk key ${key}:`, error);
      return undefined; // Graceful degradation
    }
  }

  /**
   * Simpan data ke cache dengan TTL
   */
  async simpan<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      await this.cacheManager.set(key, value, ttl ? ttl * 1000 : undefined);
      this.logger.debug(`Cache SET: ${key} (TTL: ${ttl || "default"}s)`);
    } catch (error) {
      this.logger.error(`Error menyimpan cache untuk key ${key}:`, error);
      // Don't throw - caching failure shouldn't break app
    }
  }

  /**
   * Hapus single key dari cache
   */
  async hapus(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);
      this.logger.debug(`Cache DELETE: ${key}`);
    } catch (error) {
      this.logger.error(`Error menghapus cache untuk key ${key}:`, error);
    }
  }

  /**
   * Hapus multiple keys matching pattern
   * Useful untuk bulk invalidation
   */
  async hapusPola(pattern: string): Promise<void> {
    try {
      // Get Redis client dari cache manager
      const store: any = this.cacheManager.store;
      const redis = store.getClient();

      // Find all keys matching pattern
      const keys = await redis.keys(pattern);

      if (keys.length > 0) {
        // Delete all matching keys
        await redis.del(...keys);
        this.logger.debug(
          `Cache DELETE PATTERN: ${pattern} (${keys.length} keys)`
        );
      }
    } catch (error) {
      this.logger.error(`Error menghapus cache pattern ${pattern}:`, error);
    }
  }

  /**
   * Wrap expensive function dengan automatic caching
   * Pattern: Cache-Aside (Lazy Loading)
   */
  async wrapDenganCache<T>(
    key: string,
    fn: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    // Try to get dari cache first
    const cachedData = await this.ambil<T>(key);
    if (cachedData !== undefined) {
      return cachedData;
    }

    // Cache miss - execute function
    this.logger.debug(`Executing function untuk cache key: ${key}`);
    const data = await fn();

    // Store result ke cache
    await this.simpan(key, data, ttl);

    return data;
  }

  /**
   * Reset entire cache
   * USE WITH CAUTION - only untuk development atau emergency
   */
  async reset(): Promise<void> {
    try {
      await this.cacheManager.reset();
      this.logger.warn("Cache RESET - All keys deleted");
    } catch (error) {
      this.logger.error("Error resetting cache:", error);
    }
  }
}
```

**Service Features Explained**:

1. **Generic Type Support**: Methods use TypeScript generics (`<T>`) untuk type safety
2. **Debug Logging**: Log setiap cache operation untuk monitoring dan debugging
3. **Error Handling**: Catch exceptions dan gracefully degrade (return undefined, don't throw)
4. **Pattern Deletion**: Support wildcard deletion untuk bulk invalidation
5. **Wrapper Function**: High-order function pattern untuk easy caching integration

**Langkah 3: Create Cache Decorators**

**Lokasi File**: `backend/src/common/cache/cache.decorator.ts`

```typescript
import { SetMetadata } from "@nestjs/common";

export const CACHE_KEY_METADATA = "cache:key";
export const CACHE_TTL_METADATA = "cache:ttl";
export const NO_CACHE_METADATA = "cache:no-cache";

/**
 * Specify cache key untuk endpoint
 * @param keyPattern - Cache key pattern (e.g., 'naskah:list')
 */
export const CacheKey = (keyPattern: string) =>
  SetMetadata(CACHE_KEY_METADATA, keyPattern);

/**
 * Specify TTL (Time To Live) dalam detik
 * @param ttl - TTL dalam detik (default: 300)
 */
export const CacheTTL = (ttl: number) => SetMetadata(CACHE_TTL_METADATA, ttl);

/**
 * Disable caching untuk specific endpoint
 */
export const NoCache = () => SetMetadata(NO_CACHE_METADATA, true);
```

**Decorator Usage Example**:

```typescript
@Controller("kategori")
export class KategoriController {
  @Get("dropdown")
  @CacheKey("kategori:dropdown")
  @CacheTTL(3600) // Cache selama 1 jam
  async getDropdown() {
    // ... implementation
  }

  @Post()
  @NoCache() // Explicitly disable caching untuk POST
  async create() {
    // ... implementation
  }
}
```

**Langkah 4: Implement Cache Interceptor**

**Lokasi File**: `backend/src/common/cache/cache.interceptor.ts` (98 lines)

```typescript
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable, of } from "rxjs";
import { tap } from "rxjs/operators";
import { CacheService } from "./cache.service";
import {
  CACHE_KEY_METADATA,
  CACHE_TTL_METADATA,
  NO_CACHE_METADATA,
} from "./cache.decorator";

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  private readonly logger = new Logger(CacheInterceptor.name);

  constructor(
    private readonly cacheService: CacheService,
    private readonly reflector: Reflector
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Promise<Observable<any>> {
    // Check if caching disabled for this handler
    const noCache = this.reflector.get<boolean>(
      NO_CACHE_METADATA,
      context.getHandler()
    );
    if (noCache) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const { method, url } = request;

    // Only cache GET requests
    if (method !== "GET") {
      return next.handle();
    }

    // Get cache metadata dari decorators
    const cacheKeyPattern = this.reflector.get<string>(
      CACHE_KEY_METADATA,
      context.getHandler()
    );
    const ttl = this.reflector.get<number>(
      CACHE_TTL_METADATA,
      context.getHandler()
    );

    if (!cacheKeyPattern) {
      // No cache key specified, skip caching
      return next.handle();
    }

    // Generate complete cache key dengan query params
    const cacheKey = this.generateCacheKey(cacheKeyPattern, request);

    // Try to get dari cache
    const cachedResponse = await this.cacheService.ambil(cacheKey);
    if (cachedResponse) {
      this.logger.debug(`Returning cached response untuk ${url}`);
      return of(cachedResponse); // Return cached data immediately
    }

    // Cache miss - execute handler dan cache result
    return next.handle().pipe(
      tap(async (response) => {
        await this.cacheService.simpan(cacheKey, response, ttl);
      })
    );
  }

  /**
   * Generate cache key dengan including query parameters
   * Format: keyPattern:param1Value:param2Value
   */
  private generateCacheKey(pattern: string, request: any): string {
    const { query, params } = request;
    const keyParts = [pattern];

    // Include path params
    if (params && Object.keys(params).length > 0) {
      keyParts.push(...Object.values(params));
    }

    // Include query params (sorted untuk consistency)
    if (query && Object.keys(query).length > 0) {
      const sortedQuery = Object.keys(query)
        .sort()
        .map((key) => `${key}=${query[key]}`)
        .join(":");
      keyParts.push(sortedQuery);
    }

    return keyParts.join(":");
  }
}
```

**Interceptor Workflow**:

1. Check if caching enabled (via decorators)
2. Only cache GET requests (idempotent operations)
3. Generate unique cache key including query params
4. Check cache - return if hit
5. Execute handler on miss
6. Store result ke cache untuk future requests

### D.3 Apply Caching ke Controllers

Sekarang infrastructure sudah ready, kami apply caching ke high-traffic endpoints.

**Langkah 1: Import Cache Module di App Module**

**Lokasi File**: `backend/src/app.module.ts`

```typescript
import { CacheModule } from "./common/cache/cache.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [redisConfig], // Load Redis configuration
    }),
    CacheModule, // Import globally
    // ... other modules
  ],
})
export class AppModule {}
```

**Langkah 2: Apply Caching ke Kategori Controller**

**Lokasi File**: `backend/src/modules/kategori/kategori.controller.ts`

```typescript
import { Controller, Get, UseInterceptors } from "@nestjs/common";
import { CacheInterceptor, CacheKey, CacheTTL } from "@/common/cache";
import { KategoriService } from "./kategori.service";

@Controller("kategori")
@UseInterceptors(CacheInterceptor) // Apply interceptor ke semua routes
export class KategoriController {
  constructor(private readonly kategoriService: KategoriService) {}

  @Get("dropdown")
  @CacheKey("kategori:dropdown")
  @CacheTTL(3600) // 1 jam - data jarang berubah
  async ambilDropdown() {
    return this.kategoriService.ambilKategoriDropdown();
  }

  @Get("tree")
  @CacheKey("kategori:tree")
  @CacheTTL(3600)
  async ambilTree() {
    return this.kategoriService.ambilKategoriTree();
  }
}
```

**Langkah 3: Implement Cache Invalidation**

Ketika data berubah, kami need invalidate related cache:

```typescript
@Controller("kategori")
export class KategoriController {
  @Post()
  async buatKategori(@Body() dto: BuatKategoriDto) {
    const result = await this.kategoriService.buatKategori(dto);

    // Invalidate cached dropdown dan tree
    await this.cacheService.hapusPola("kategori:*");

    return result;
  }

  @Put(":id")
  async perbaruiKategori(
    @Param("id") id: string,
    @Body() dto: PerbaruiKategoriDto
  ) {
    const result = await this.kategoriService.perbaruiKategori(id, dto);

    // Invalidate cache
    await this.cacheService.hapusPola("kategori:*");

    return result;
  }
}
```

**Cache Invalidation Strategy**:

- Pattern-based deletion: Delete semua keys starting dengan `kategori:`
- Invalidate on CREATE, UPDATE, DELETE operations
- Not invalidate on READ operations

### D.4 Database Query Optimization

**Langkah 1: Identify N+1 Query Problems**

Enable Prisma query logging untuk identify issues:

**Lokasi File**: `backend/src/prisma/prisma.service.ts`

```typescript
this.$on("query" as any, (e: any) => {
  this.logger.debug(`Query: ${e.query}`);
  this.logger.debug(`Duration: ${e.duration}ms`);
});
```

**Langkah 2: Fix N+1 dengan Prisma Include**

**Before (N+1 Problem)**:

**Lokasi**: `backend/src/modules/naskah/naskah.service.ts` (Lines 145-160, OLD)

```typescript
// ❌ BAD: N+1 queries
async ambilSemuaNaskah() {
  const naskahList = await this.prisma.naskah.findMany();

  // This loops dan create N additional queries!
  for (const naskah of naskahList) {
    naskah.penulis = await this.prisma.pengguna.findUnique({
      where: { id: naskah.idPenulis }
    });
  }

  return naskahList;
}
```

**After (Optimized)**:

**Lokasi**: `backend/src/modules/naskah/naskah.service.ts` (Lines 145-175, CURRENT)

```typescript
// ✅ GOOD: Single query dengan JOIN
async ambilSemuaNaskah(filter?: FilterNaskahDto) {
  return await this.prisma.naskah.findMany({
    where: this.buildWhereClause(filter),
    include: {
      penulis: {
        select: {
          id: true,
          profilPengguna: {
            select: {
              namaDepan: true,
              namaBelakang: true,
              urlAvatar: true,
            },
          },
        },
      },
      kategori: {
        select: { id: true, nama: true },
      },
      genre: {
        select: { id: true, nama: true },
      },
    },
    orderBy: { dibuatPada: 'desc' },
    take: filter?.limit || 20,
  });
}
```

**Performance Impact**:

- Before: 1 + N queries (21 queries untuk 20 naskah)
- After: 1 query dengan JOINs
- Improvement: **95% reduction** dalam query count

**Langkah 3: Add Strategic Indexes**

**Lokasi File**: `backend/prisma/schema.prisma`

```prisma
model Naskah {
  id          String   @id @default(uuid())
  judul       String
  status      StatusNaskah
  publik      Boolean  @default(false)
  idPenulis   String
  idKategori  String
  dibuatPada  DateTime @default(now())

  // Relations
  penulis     Pengguna @relation(fields: [idPenulis], references: [id])
  kategori    Kategori @relation(fields: [idKategori], references: [id])

  // Strategic Indexes
  @@index([idPenulis])              // Filter by penulis
  @@index([status])                 // Filter by status
  @@index([publik])                 // Public/private filtering
  @@index([idPenulis, status])      // Composite untuk common query
  @@index([status, publik, dibuatPada])  // Covering index untuk published query
  @@index([dibuatPada])             // Sorting optimization

  @@map("naskah")
}
```

**Run Migration**:

```bash
bunx prisma migrate dev --name add_strategic_indexes
```

**Verify Index Usage**:

```sql
EXPLAIN ANALYZE
SELECT * FROM naskah
WHERE status = 'diterbitkan' AND publik = true
ORDER BY dibuat_pada DESC
LIMIT 20;
```

Expected plan: `Index Scan using naskah_status_publik_dibuat_pada_idx`

**Lokasi File Code Lengkap**:

- Cache Service: `backend/src/common/cache/cache.service.ts` (163 lines)
- Cache Interceptor: `backend/src/common/cache/cache.interceptor.ts` (98 lines)
- Cache Module: `backend/src/common/cache/cache.module.ts`
- Cache Decorators: `backend/src/common/cache/cache.decorator.ts`
- Redis Config: `backend/src/config/redis.config.ts`
- Optimized Naskah Service: `backend/src/modules/naskah/naskah.service.ts` (Lines 145-290)
- Prisma Schema (Indexes): `backend/prisma/schema.prisma` (Lines 218-290)

Tutorial sections berikutnya akan cover RLS implementation dan testing infrastructure setup.
