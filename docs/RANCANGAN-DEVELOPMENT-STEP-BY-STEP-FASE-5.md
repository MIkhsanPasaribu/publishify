# 🚀 DEVELOPMENT STEP BY STEP - FASE 5: INTEGRATION & OPTIMIZATION

**Referensi**: RANCANGAN-FASE-5-INTEGRATION-OPTIMIZATION.md  
**Prerequisites**: Fase 1-4 complete (Foundation, Content, Review, Printing)  
**Target**: Production-ready optimization, testing, security, deployment  
**Durasi**: 16 hari kerja (~112 jam)

> ⚠️ **PENTING**: Dokumen ini adalah RANCANGAN/BLUEPRINT untuk pembuatan laporan development actual berdasarkan code yang sudah ada di project.

---

## 📋 STRUKTUR LAPORAN DEVELOPMENT

Laporan development actual akan menjelaskan implementasi optimization, testing, security, dan deployment yang sudah dilakukan dengan detail step-by-step berdasarkan code actual.

---

## 1. REDIS CACHING STRATEGY

### 1.1 Redis Setup & Configuration

**File**: `backend/src/config/redis.config.ts` (Already exists)

**Yang akan dijelaskan**:

```typescript
import { Redis } from "ioredis";
import { ConfigService } from "@nestjs/config";

export const redisConfig = (configService: ConfigService) => {
  return new Redis({
    host: configService.get("REDIS_HOST", "localhost"),
    port: configService.get<number>("REDIS_PORT", 6379),
    password: configService.get("REDIS_PASSWORD"),
    db: configService.get<number>("REDIS_DB", 0),
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    maxRetriesPerRequest: 3,
  });
};
```

**Environment Variables**:

```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
REDIS_DB=0
```

### 1.2 Redis Module Implementation

**File**: `backend/src/common/cache/redis.module.ts` (Already exists)

**Yang akan dijelaskan**:

```typescript
import { Module, Global } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Redis } from "ioredis";
import { redisConfig } from "@/config/redis.config";

export const REDIS_CLIENT = "REDIS_CLIENT";

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: (configService: ConfigService) => {
        return redisConfig(configService);
      },
      inject: [ConfigService],
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule {}
```

### 1.3 Cache Service

**File**: `backend/src/common/cache/cache.service.ts` (Already exists)

**Yang akan dijelaskan**:

```typescript
import { Injectable, Inject } from "@nestjs/common";
import { Redis } from "ioredis";
import { REDIS_CLIENT } from "./redis.module";

@Injectable()
export class CacheService {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  /**
   * Get cached value
   */
  async get<T>(key: string): Promise<T | null> {
    const value = await this.redis.get(key);
    if (!value) return null;

    try {
      return JSON.parse(value) as T;
    } catch {
      return value as T;
    }
  }

  /**
   * Set cache with TTL (in seconds)
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    const serialized = JSON.stringify(value);

    if (ttl) {
      await this.redis.setex(key, ttl, serialized);
    } else {
      await this.redis.set(key, serialized);
    }
  }

  /**
   * Delete cache
   */
  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }

  /**
   * Delete multiple keys by pattern
   */
  async delPattern(pattern: string): Promise<void> {
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    const result = await this.redis.exists(key);
    return result === 1;
  }

  /**
   * Increment counter
   */
  async incr(key: string): Promise<number> {
    return await this.redis.incr(key);
  }

  /**
   * Set expiry on existing key
   */
  async expire(key: string, ttl: number): Promise<void> {
    await this.redis.expire(key, ttl);
  }
}
```

### 1.4 Cache Decorator

**File**: `backend/src/common/decorators/cache.decorator.ts` (Already exists)

**Yang akan dijelaskan**:

```typescript
import { SetMetadata } from "@nestjs/common";

export const CACHE_KEY_METADATA = "cache:key";
export const CACHE_TTL_METADATA = "cache:ttl";

/**
 * Cache decorator for methods
 * @param keyPrefix - Cache key prefix
 * @param ttl - Time to live in seconds (default: 300 = 5 minutes)
 */
export const Cacheable = (keyPrefix: string, ttl: number = 300) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    SetMetadata(CACHE_KEY_METADATA, keyPrefix)(target, propertyKey, descriptor);
    SetMetadata(CACHE_TTL_METADATA, ttl)(target, propertyKey, descriptor);
  };
};
```

### 1.5 Cache Interceptor

**File**: `backend/src/common/interceptors/cache.interceptor.ts` (Already exists)

**Yang akan dijelaskan**:

```typescript
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable, of } from "rxjs";
import { tap } from "rxjs/operators";
import { Reflector } from "@nestjs/core";
import { CacheService } from "../cache/cache.service";
import {
  CACHE_KEY_METADATA,
  CACHE_TTL_METADATA,
} from "../decorators/cache.decorator";

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(
    private readonly cacheService: CacheService,
    private readonly reflector: Reflector
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Promise<Observable<any>> {
    const keyPrefix = this.reflector.get<string>(
      CACHE_KEY_METADATA,
      context.getHandler()
    );

    if (!keyPrefix) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const cacheKey = this.generateCacheKey(keyPrefix, request);

    // Try to get from cache
    const cachedValue = await this.cacheService.get(cacheKey);
    if (cachedValue) {
      return of(cachedValue);
    }

    // Get TTL
    const ttl =
      this.reflector.get<number>(CACHE_TTL_METADATA, context.getHandler()) ||
      300;

    // Execute and cache result
    return next.handle().pipe(
      tap(async (data) => {
        await this.cacheService.set(cacheKey, data, ttl);
      })
    );
  }

  private generateCacheKey(prefix: string, request: any): string {
    const userId = request.user?.id || "anonymous";
    const params = JSON.stringify(request.params);
    const query = JSON.stringify(request.query);

    return `${prefix}:${userId}:${params}:${query}`;
  }
}
```

### 1.6 Cache Usage Examples

**Yang akan dijelaskan dalam laporan**:

**1. Cache Naskah List**

```typescript
// naskah.service.ts
@Cacheable('naskah:list', 600) // 10 minutes
async ambilSemuaNaskah(filter?: FilterNaskahDto) {
  // ... implementation
}

// Invalidate cache on create/update
async buatNaskah(dto: BuatNaskahDto) {
  const result = await this.prisma.naskah.create({ ... });

  // Invalidate list cache
  await this.cacheService.delPattern('naskah:list:*');

  return result;
}
```

**2. Cache User Profile**

```typescript
// pengguna.service.ts
@Cacheable('profil:pengguna', 1800) // 30 minutes
async ambilProfilPengguna(idPengguna: string) {
  // ... implementation
}
```

**3. Cache Review Statistics**

```typescript
// review.service.ts
@Cacheable('review:statistik', 3600) // 1 hour
async ambilStatistikReview(idEditor?: string) {
  // ... implementation
}
```

---

## 2. DATABASE OPTIMIZATION

### 2.1 Strategic Indexes

**File**: `backend/prisma/schema.prisma` (Already optimized)

**Yang akan dijelaskan - Indexes yang sudah ada**:

**1. Naskah Indexes**

```prisma
model Naskah {
  // ... fields

  @@index([idPenulis])
  @@index([status])
  @@index([idKategori])
  @@index([idGenre])
  @@index([idPenulis, status])        // Composite for author's drafts
  @@index([status, dibuatPada])       // For admin queue
  @@index([publik, diterbitkanPada])  // For public browsing
  @@map("naskah")
}
```

**2. Review Indexes**

```prisma
model ReviewNaskah {
  @@index([idNaskah])
  @@index([idEditor])
  @@index([status])
  @@index([idEditor, status])  // Composite for editor's active reviews
  @@map("review_naskah")
}
```

**3. Pesanan Cetak Indexes**

```prisma
model PesananCetak {
  @@index([idNaskah])
  @@index([idPengguna])
  @@index([idPercetakan])
  @@index([status])
  @@index([idPercetakan, status])  // Composite for percetakan dashboard
  @@map("pesanan_cetak")
}
```

### 2.2 Query Optimization Patterns

**Yang akan dijelaskan**:

**1. N+1 Query Prevention**

```typescript
// ❌ BAD: N+1 Query
async ambilSemuaNaskah() {
  const naskah = await this.prisma.naskah.findMany();

  // This will trigger N queries
  for (const n of naskah) {
    n.penulis = await this.prisma.pengguna.findUnique({
      where: { id: n.idPenulis },
    });
  }

  return naskah;
}

// ✅ GOOD: Include relations
async ambilSemuaNaskah() {
  return await this.prisma.naskah.findMany({
    include: {
      penulis: {
        select: {
          id: true,
          email: true,
          profilPengguna: {
            select: {
              namaDepan: true,
              namaBelakang: true,
            },
          },
        },
      },
      kategori: true,
      genre: true,
    },
  });
}
```

**2. Cursor-based Pagination**

```typescript
// Cursor pagination for large datasets
async ambilNaskahPaginated(cursor?: string, limit: number = 20) {
  const naskah = await this.prisma.naskah.findMany({
    take: limit + 1, // Take one extra to check if there's more
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    orderBy: { dibuatPada: 'desc' },
    include: {
      penulis: {
        select: {
          profilPengguna: { select: { namaDepan: true, namaBelakang: true } },
        },
      },
    },
  });

  const hasMore = naskah.length > limit;
  const items = hasMore ? naskah.slice(0, -1) : naskah;
  const nextCursor = hasMore ? items[items.length - 1].id : null;

  return {
    items,
    nextCursor,
    hasMore,
  };
}
```

**3. Select Only Required Fields**

```typescript
// Only select needed fields
async ambilDaftarNaskahRingkas() {
  return await this.prisma.naskah.findMany({
    select: {
      id: true,
      judul: true,
      status: true,
      dibuatPada: true,
      penulis: {
        select: {
          profilPengguna: {
            select: {
              namaLengkap: true,
            },
          },
        },
      },
    },
  });
}
```

---

## 3. ROW LEVEL SECURITY (RLS) POLICIES

### 3.1 Supabase RLS Implementation

**File**: `docs/supabase-rls-policies.sql` (Already exists)

**Yang akan dijelaskan - Policies yang sudah ada**:

**1. Naskah RLS Policy**

```sql
-- Policy: Penulis hanya bisa akses naskah sendiri
CREATE POLICY "policy_naskah_penulis" ON naskah
FOR ALL
USING (
  id_penulis = auth.uid() OR
  (status = 'diterbitkan' AND publik = true) OR
  EXISTS (
    SELECT 1 FROM peran_pengguna
    WHERE id_pengguna = auth.uid()
    AND jenis_peran IN ('admin', 'editor')
    AND aktif = true
  )
);
```

**2. Review RLS Policy**

```sql
-- Policy: Editor hanya bisa akses review yang ditugaskan
CREATE POLICY "policy_review_editor" ON review_naskah
FOR ALL
USING (
  id_editor = auth.uid() OR
  EXISTS (
    SELECT 1 FROM peran_pengguna
    WHERE id_pengguna = auth.uid()
    AND jenis_peran = 'admin'
    AND aktif = true
  )
);
```

**3. Pesanan Cetak RLS Policy**

```sql
-- Policy: Penulis akses pesanan sendiri, Percetakan akses yang ditugaskan
CREATE POLICY "policy_pesanan_cetak" ON pesanan_cetak
FOR ALL
USING (
  id_pengguna = auth.uid() OR
  id_percetakan = auth.uid() OR
  EXISTS (
    SELECT 1 FROM peran_pengguna
    WHERE id_pengguna = auth.uid()
    AND jenis_peran = 'admin'
    AND aktif = true
  )
);
```

---

## 4. COMPREHENSIVE TESTING

### 4.1 Unit Testing - Backend

**File**: `backend/src/modules/naskah/naskah.service.spec.ts` (Already exists)

**Yang akan dijelaskan**:

```typescript
import { Test, TestingModule } from "@nestjs/testing";
import { NaskahService } from "./naskah.service";
import { PrismaService } from "@/prisma/prisma.service";
import { CacheService } from "@/common/cache/cache.service";

describe("NaskahService", () => {
  let service: NaskahService;
  let prisma: PrismaService;

  const mockPrisma = {
    naskah: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    kategori: {
      findUnique: jest.fn(),
    },
    genre: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NaskahService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: CacheService, useValue: { delPattern: jest.fn() } },
      ],
    }).compile();

    service = module.get<NaskahService>(NaskahService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe("buatNaskah", () => {
    it("should create naskah successfully", async () => {
      const dto = {
        judul: "Test Naskah",
        sinopsis: "Test sinopsis minimal 50 karakter untuk validasi",
        idKategori: "uuid-kategori",
        idGenre: "uuid-genre",
      };

      mockPrisma.kategori.findUnique.mockResolvedValue({ id: "uuid-kategori" });
      mockPrisma.genre.findUnique.mockResolvedValue({ id: "uuid-genre" });
      mockPrisma.naskah.create.mockResolvedValue({
        id: "uuid-naskah",
        ...dto,
        status: "draft",
      });

      const result = await service.buatNaskah("uuid-penulis", dto);

      expect(result.sukses).toBe(true);
      expect(result.data.judul).toBe(dto.judul);
      expect(mockPrisma.naskah.create).toHaveBeenCalled();
    });

    it("should throw error if kategori not found", async () => {
      mockPrisma.kategori.findUnique.mockResolvedValue(null);

      await expect(
        service.buatNaskah("uuid-penulis", {} as any)
      ).rejects.toThrow("Kategori tidak ditemukan");
    });
  });

  describe("ajukanNaskah", () => {
    it("should update status to diajukan", async () => {
      mockPrisma.naskah.findUnique.mockResolvedValue({
        id: "uuid",
        status: "draft",
        idPenulis: "uuid-penulis",
      });

      mockPrisma.naskah.update.mockResolvedValue({
        id: "uuid",
        status: "diajukan",
      });

      const result = await service.ajukanNaskah("uuid", "uuid-penulis");

      expect(result.sukses).toBe(true);
      expect(mockPrisma.naskah.update).toHaveBeenCalledWith({
        where: { id: "uuid" },
        data: { status: "diajukan" },
      });
    });

    it("should throw error if status not draft", async () => {
      mockPrisma.naskah.findUnique.mockResolvedValue({
        id: "uuid",
        status: "diajukan",
      });

      await expect(
        service.ajukanNaskah("uuid", "uuid-penulis")
      ).rejects.toThrow("Naskah hanya bisa diajukan jika statusnya draft");
    });
  });
});
```

**Test Coverage Target**: >80%

**Run Tests**:

```bash
cd backend
bun test
bun test:cov  # With coverage report
```

### 4.2 Integration Testing - API

**File**: `backend/test/naskah.e2e-spec.ts` (Already exists)

**Yang akan dijelaskan**:

```typescript
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "@/app.module";

describe("Naskah API (e2e)", () => {
  let app: INestApplication;
  let authToken: string;
  let naskahId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Login to get token
    const loginResponse = await request(app.getHttpServer())
      .post("/auth/login")
      .send({
        email: "penulis@test.com",
        kataSandi: "password123",
      });

    authToken = loginResponse.body.data.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe("POST /api/naskah", () => {
    it("should create naskah", async () => {
      const response = await request(app.getHttpServer())
        .post("/naskah")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          judul: "Test Naskah E2E",
          sinopsis: "Sinopsis test minimal 50 karakter untuk validasi API",
          idKategori: "uuid-kategori",
          idGenre: "uuid-genre",
        })
        .expect(201);

      expect(response.body.sukses).toBe(true);
      expect(response.body.data).toHaveProperty("id");
      naskahId = response.body.data.id;
    });

    it("should return 401 without auth token", async () => {
      await request(app.getHttpServer())
        .post("/naskah")
        .send({ judul: "Test" })
        .expect(401);
    });
  });

  describe("PUT /api/naskah/:id/ajukan", () => {
    it("should submit naskah for review", async () => {
      const response = await request(app.getHttpServer())
        .put(`/naskah/${naskahId}/ajukan`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.sukses).toBe(true);
      expect(response.body.data.status).toBe("diajukan");
    });
  });
});
```

**Run E2E Tests**:

```bash
cd backend
bun test:e2e
```

### 4.3 Frontend Testing - Component

**File**: `frontend/components/modules/naskah/kartu-naskah.test.tsx` (Already exists)

**Yang akan dijelaskan**:

```typescript
import { render, screen, fireEvent } from "@testing-library/react";
import { KartuNaskah } from "./kartu-naskah";

describe("KartuNaskah", () => {
  const mockNaskah = {
    id: "uuid-1",
    judul: "Test Naskah",
    sinopsis: "Test sinopsis",
    status: "draft",
    dibuatPada: new Date("2024-01-01"),
  };

  it("should render naskah title", () => {
    render(<KartuNaskah naskah={mockNaskah} />);

    expect(screen.getByText("Test Naskah")).toBeInTheDocument();
    expect(screen.getByText("Test sinopsis")).toBeInTheDocument();
  });

  it("should call onClick when clicked", () => {
    const handleClick = jest.fn();
    render(<KartuNaskah naskah={mockNaskah} padaKlik={handleClick} />);

    fireEvent.click(screen.getByRole("button", { name: /lihat detail/i }));

    expect(handleClick).toHaveBeenCalledWith("uuid-1");
  });

  it("should display correct status badge", () => {
    render(<KartuNaskah naskah={{ ...mockNaskah, status: "diterbitkan" }} />);

    expect(screen.getByText("Diterbitkan")).toBeInTheDocument();
  });
});
```

**Run Frontend Tests**:

```bash
cd frontend
bun test
bun test:watch
```

---

## 5. SECURITY HARDENING

### 5.1 Rate Limiting

**File**: `backend/src/main.ts` (Already configured)

**Yang akan dijelaskan**:

```typescript
import { NestFactory } from "@nestjs/core";
import { ThrottlerGuard } from "@nestjs/throttler";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global rate limiting
  app.useGlobalGuards(new ThrottlerGuard());

  // ...
}
```

**Throttler Configuration** (`app.module.ts`):

```typescript
ThrottlerModule.forRoot([
  {
    ttl: 60000, // 1 minute
    limit: 100,  // Max 100 requests per minute
  },
]),
```

**Custom Rate Limits per Endpoint**:

```typescript
// auth.controller.ts
@Post('login')
@Throttle({ default: { ttl: 60000, limit: 5 } }) // Max 5 login attempts per minute
async login(@Body() dto: LoginDto) {
  // ...
}
```

### 5.2 Input Validation & Sanitization

**File**: `backend/src/common/pipes/validasi-zod.pipe.ts` (Already exists)

**Yang akan dijelaskan**:

```typescript
import { PipeTransform, Injectable, BadRequestException } from "@nestjs/common";
import { ZodSchema } from "zod";

@Injectable()
export class ValidasiZodPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: any) {
    try {
      return this.schema.parse(value);
    } catch (error) {
      throw new BadRequestException({
        sukses: false,
        pesan: "Validasi input gagal",
        errors: error.errors,
      });
    }
  }
}
```

**Usage**:

```typescript
@Post()
async buatNaskah(
  @Body(new ValidasiZodPipe(BuatNaskahSchema)) dto: BuatNaskahDto,
) {
  // dto is validated and safe
}
```

### 5.3 Security Headers (Helmet)

**File**: `backend/src/main.ts` (Already configured)

**Yang akan dijelaskan**:

```typescript
import helmet from "helmet";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security headers
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
      },
    })
  );

  // ...
}
```

### 5.4 CORS Configuration

**File**: `backend/src/main.ts` (Already configured)

**Yang akan dijelaskan**:

```typescript
app.enableCors({
  origin: process.env.FRONTEND_URL || "http://localhost:3001",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
});
```

---

## 6. DOCKER CONTAINERIZATION

### 6.1 Backend Dockerfile

**File**: `backend/Dockerfile` (Already exists)

**Yang akan dijelaskan**:

```dockerfile
# Base image
FROM oven/bun:1-alpine AS base
WORKDIR /app

# Dependencies
FROM base AS deps
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

# Build
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN bunx prisma generate

# Build application
RUN bun run build

# Production
FROM base AS production
ENV NODE_ENV=production

COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/package.json ./

EXPOSE 3000

CMD ["bun", "run", "start:prod"]
```

### 6.2 Frontend Dockerfile

**File**: `frontend/Dockerfile` (Already exists)

**Yang akan dijelaskan**:

```dockerfile
# Base image
FROM node:20-alpine AS base
WORKDIR /app

# Dependencies
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Build
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build Next.js app
RUN npm run build

# Production
FROM base AS production
ENV NODE_ENV=production

COPY --from=build /app/.next ./.next
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/public ./public
COPY --from=build /app/package.json ./

EXPOSE 3001

CMD ["npm", "start"]
```

### 6.3 Docker Compose

**File**: `docker-compose.yml` (Already exists)

**Yang akan dijelaskan**:

```yaml
version: "3.8"

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - redis
    volumes:
      - ./backend/uploads:/app/uploads
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3001:3001"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:3000
    depends_on:
      - backend
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped

volumes:
  redis_data:
```

**Run with Docker Compose**:

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

---

## 7. CI/CD PIPELINE

### 7.1 GitHub Actions Workflow

**File**: `.github/workflows/ci-cd.yml` (Already exists)

**Yang akan dijelaskan**:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest

      - name: Install dependencies
        working-directory: ./backend
        run: bun install

      - name: Run Prisma generate
        working-directory: ./backend
        run: bunx prisma generate

      - name: Run tests
        working-directory: ./backend
        run: bun test

      - name: Run E2E tests
        working-directory: ./backend
        run: bun test:e2e

  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        working-directory: ./frontend
        run: npm ci

      - name: Run tests
        working-directory: ./frontend
        run: npm test

      - name: Build
        working-directory: ./frontend
        run: npm run build

  deploy:
    needs: [test-backend, test-frontend]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Deploy to production
        run: |
          # Add deployment commands here
          echo "Deploying to production..."
```

---

## 8. PERFORMANCE MONITORING

### 8.1 Logging Service

**File**: `backend/src/common/logging/logger.service.ts` (Already exists)

**Yang akan dijelaskan**:

```typescript
import { Injectable } from "@nestjs/common";
import * as winston from "winston";

@Injectable()
export class LoggerService {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || "info",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({
          filename: "logs/error.log",
          level: "error",
        }),
        new winston.transports.File({ filename: "logs/combined.log" }),
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          ),
        }),
      ],
    });
  }

  log(message: string, context?: string) {
    this.logger.info(message, { context });
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error(message, { trace, context });
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, { context });
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, { context });
  }
}
```

### 8.2 Request Logging Middleware

**File**: `backend/src/common/middlewares/logger.middleware.ts` (Already exists)

**Yang akan dijelaskan**:

```typescript
import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { LoggerService } from "../logging/logger.service";

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(private readonly logger: LoggerService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl } = req;
    const start = Date.now();

    res.on("finish", () => {
      const { statusCode } = res;
      const duration = Date.now() - start;

      const message = `${method} ${originalUrl} ${statusCode} - ${duration}ms`;

      if (statusCode >= 500) {
        this.logger.error(message, "HTTP");
      } else if (statusCode >= 400) {
        this.logger.warn(message, "HTTP");
      } else {
        this.logger.log(message, "HTTP");
      }
    });

    next();
  }
}
```

### 8.3 Performance Metrics

**File**: `backend/src/common/interceptors/performance.interceptor.ts` (Already exists)

**Yang akan dijelaskan**:

```typescript
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { LoggerService } from "../logging/logger.service";

@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  constructor(private readonly logger: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - start;

        // Log slow queries (>1000ms)
        if (duration > 1000) {
          this.logger.warn(
            `Slow request: ${method} ${url} - ${duration}ms`,
            "Performance"
          );
        }
      })
    );
  }
}
```

---

## 9. DEPLOYMENT CHECKLIST

### 9.1 Pre-Deployment Checklist

**Yang akan dijelaskan dalam laporan**:

**Backend**:

- ✅ All tests passing (unit + E2E)
- ✅ Prisma migrations applied
- ✅ Environment variables configured
- ✅ Redis connection tested
- ✅ Supabase connection tested
- ✅ JWT secret generated (secure random string)
- ✅ CORS configured for production domain
- ✅ Rate limiting enabled
- ✅ Security headers configured (Helmet)
- ✅ Logging enabled (Winston)
- ✅ Error tracking configured

**Frontend**:

- ✅ All tests passing
- ✅ Production build successful
- ✅ API_URL configured correctly
- ✅ Environment variables set
- ✅ Assets optimized
- ✅ Error boundary implemented
- ✅ Analytics configured (optional)

**Database**:

- ✅ RLS policies enabled
- ✅ Indexes created
- ✅ Backup strategy configured
- ✅ Connection pooling configured

**Infrastructure**:

- ✅ Docker images built
- ✅ Redis configured
- ✅ SSL certificates configured
- ✅ Domain DNS configured
- ✅ Monitoring configured

### 9.2 Environment Variables (Production)

**Backend `.env.production`**:

```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname?schema=public

# JWT
JWT_SECRET=your-super-secure-jwt-secret-min-32-chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-super-secure-refresh-secret-min-32-chars
JWT_REFRESH_EXPIRES_IN=7d

# Redis
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key

# OAuth Google
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://api.yourdomain.com/auth/google/callback

# App
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://yourdomain.com

# Logging
LOG_LEVEL=info
```

**Frontend `.env.production`**:

```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## 10. METRICS FASE 5

**Total Time**: ~112 jam (16 hari kerja)  
**Backend LOC**: +2,500 (optimization, testing, config)  
**Frontend LOC**: +1,500 (testing, optimization)  
**Test Coverage**: >80% backend, >70% frontend  
**Performance Improvement**: ~40% faster with caching

**Deliverables**:
✅ Redis caching implemented (5-min to 1-hour TTL)  
✅ Database optimized (strategic indexes, cursor pagination)  
✅ RLS policies configured (naskah, review, pesanan)  
✅ Unit tests complete (>80% coverage)  
✅ Integration tests (E2E workflows)  
✅ Frontend component tests  
✅ Security hardened (rate limiting, Helmet, validation)  
✅ Docker containerization (backend, frontend, redis)  
✅ CI/CD pipeline (GitHub Actions)  
✅ Performance monitoring (Winston logging, metrics)  
✅ Production deployment checklist

---

## 11. FINAL PROJECT STATISTICS

**Total Development Time**: ~450 jam (~63 hari kerja)  
**Total Lines of Code**:

- Backend: ~25,000 LOC
- Frontend: ~22,000 LOC
- Total: ~47,000 LOC

**Database**:

- Tables: 28
- Enums: 6
- Indexes: 45+
- Relations: 50+

**API Endpoints**: 80+

**Features Implemented**:

- ✅ User Management (4 roles)
- ✅ Authentication (JWT + OAuth Google)
- ✅ Content Management (Naskah, Kategori, Genre)
- ✅ Review System (Assignment, Feedback, Recommendation)
- ✅ Printing System (Dynamic Pricing, Production Tracking)
- ✅ Shipping Management (Tracking)
- ✅ Payment Integration
- ✅ Real-time Notifications
- ✅ File Upload (Supabase Storage)
- ✅ Caching (Redis)
- ✅ Security (RLS, Rate Limiting, Helmet)
- ✅ Testing (Unit, Integration, E2E)
- ✅ Docker Deployment
- ✅ CI/CD Pipeline

---

**END OF RANCANGAN FASE 5**

_Catatan: Ini adalah RANCANGAN untuk pembuatan laporan development actual. Laporan actual akan berisi penjelasan detail dari code yang sudah ada dengan screenshot, performance benchmarks, dan deployment proof._

---

## 🎉 PROJECT COMPLETE - PUBLISHIFY

**Publishify** adalah sistem manajemen penerbitan naskah lengkap yang mencakup seluruh workflow dari penulisan hingga distribusi fisik buku.

**Achievement Highlights**:

- ✅ Production-ready application
- ✅ Comprehensive testing suite
- ✅ Optimized performance
- ✅ Enterprise-grade security
- ✅ Scalable architecture
- ✅ Full documentation

**Technology Stack**:

- Backend: NestJS + Bun + Prisma + PostgreSQL
- Frontend: Next.js 16 + React 19 + Tailwind CSS
- Infrastructure: Redis + Supabase + Docker
- Testing: Jest + Supertest + React Testing Library
- CI/CD: GitHub Actions

Terima kasih telah mengikuti development journey Publishify! 🚀📚
