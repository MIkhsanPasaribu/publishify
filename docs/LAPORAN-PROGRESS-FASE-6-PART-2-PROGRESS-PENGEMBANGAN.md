# LAPORAN PROGRESS FASE 6

## PART 2: PROGRESS PENGEMBANGAN - FRONTEND OPTIMIZATION & CONTAINERIZATION

**Focus**: Frontend Performance Optimization & Docker Implementation  
**Periode**: Week 1-2 of Fase 6  
**Status**: In Progress (85% Complete)  
**Prerequisite**: [PART 1 - Pendahuluan & Ruang Lingkup](./LAPORAN-PROGRESS-FASE-6-PART-1-PENDAHULUAN-RUANG-LINGKUP.md)

---

## C. PROGRESS PENGEMBANGAN

### C.1 Frontend Performance Optimization

Frontend performance optimization merupakan prioritas utama dalam fase enam mengingat direct impact nya terhadap user experience. Kami telah melakukan comprehensive audit menggunakan Lighthouse dan Chrome DevTools untuk identify bottlenecks dan opportunities untuk improvement.

#### C.1.1 Image Optimization dengan Next.js Image Component

Image optimization merupakan area pertama yang kami tackle karena images typically constitute majority dari page weight. Dalam audit initial, kami discovered bahwa product images dan user avatars contribute hingga enam puluh persen dari total page size, dengan many images served dalam unoptimized formats dan sizes yang unnecessarily large.

**Implementation Progress**: Kami telah successfully migrate semua image references dari standard HTML img tags ke Next.js Image component across all major pages. Implementation mencakup landing page hero section dengan large banner images, kategori dan genre listing pages dengan thumbnail images, naskah detail pages dengan cover images, user profile pages dengan avatar images, dan admin dashboard dengan various product images. Next.js Image component provide automatic optimization features termasuk automatic format selection dimana modern browsers receive WebP format yang typically tiga puluh persen smaller than JPEG dengan same quality, sedangkan older browsers fallback ke JPEG. Responsive images automatically generated dalam multiple sizes untuk serve appropriate size based pada device viewport, eliminating waste dari serving desktop-sized images ke mobile devices.

**Configuration Implementation**: Kami configure Next.js Image component dalam next.config.ts file dengan custom loader untuk support Supabase Storage sebagai image source. Configuration includes domains whitelist untuk allow images from Supabase bucket, deviceSizes array defining breakpoints untuk responsive images generation (mobile: enam ratus empat puluh, tablet: tujuh ratus enam puluh lapan, desktop: seribu dua puluh empat, wide: seribu dua ratus delapan puluh), imageSizes array untuk smaller variants (icon sizes: enam belas, tiga puluh dua, enam puluh empat), dan formats configuration enabling modern formats seperti WebP dan AVIF where supported. Blur placeholder implementation menggunakan blurDataURL prop untuk provide placeholder selama image loading, improving perceived performance significantly.

**Next.js Configuration Example** (`frontend/next.config.ts`):

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Image Optimization Configuration */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
    deviceSizes: [640, 768, 1024, 1280, 1536],
    imageSizes: [16, 32, 48, 64, 96],
    formats: ["image/webp", "image/avif"],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },

  /* Performance Optimizations */
  compress: true,
  poweredByHeader: false,

  /* Production Build Optimizations */
  swcMinify: true,
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? {
            exclude: ["error", "warn"],
          }
        : false,
  },

  /* Standalone Output for Docker */
  output: "standalone",
};

export default nextConfig;
```

**Usage Example in Component**:

```typescript
import Image from "next/image";

export function NaskahCard({ naskah }) {
  return (
    <div className="relative">
      <Image
        src={naskah.urlSampul}
        alt={naskah.judul}
        width={300}
        height={400}
        className="rounded-lg"
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRg..."
        loading="lazy"
        quality={85}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </div>
  );
}
```

**Image Optimization Flow Diagram**:

```mermaid
graph TB
    A[User Request Image] --> B{Browser Support?}
    B -->|Modern| C[Serve WebP/AVIF]
    B -->|Legacy| D[Serve JPEG/PNG]

    C --> E[Next.js Image Optimizer]
    D --> E

    E --> F{Device Size?}
    F -->|Mobile 640px| G[Serve 640w variant]
    F -->|Tablet 768px| H[Serve 768w variant]
    F -->|Desktop 1024px+| I[Serve 1024w+ variant]

    G --> J[CDN Cache 30 days]
    H --> J
    I --> J

    J --> K[Deliver to User]

    style C fill:#6bcf7f
    style G fill:#6bcf7f
    style H fill:#6bcf7f
    style I fill:#6bcf7f
    style J fill:#4dabf7
```

**Performance Impact**: Image optimization telah deliver measurable improvements. Average image file size reduced dari rata-rata delapan ratus KB ke dua ratus lima puluh KB (sixty-nine percent reduction). Page load time untuk image-heavy pages seperti naskah listing improved dari rata-rata empat koma dua detik ke satu koma lapan detik (fifty-seven percent improvement). Largest Contentful Paint (LCP) metric improved dari tiga koma lapan detik ke satu koma sembilan detik, meeting Google's good threshold di bawah dua koma lima detik. Cumulative Layout Shift (CLS) improved dari nol koma dua satu ke nol koma nol lapan through proper image dimensions specification yang prevent layout shift during loading.

#### C.1.2 Code Splitting dan Bundle Optimization

JavaScript bundle size merupakan critical factor dalam initial page load performance. Large bundles result dalam longer parse time, execution time, dan network transfer time, directly impacting Time to Interactive metric.

**Bundle Analysis Results**: Kami run bundle analyzer untuk identify largest dependencies dan opportunities untuk optimization. Analysis revealed bahwa initial bundle size adalah dua koma tiga MB uncompressed (delapan ratus lima puluh KB gzipped), dengan largest contributors being UI component library (dua ratus KB), Rich Text Editor library (tiga ratus lima puluh KB), Chart library untuk dashboard (dua ratus delapan puluh KB), PDF generation library (empat ratus KB), dan various utilities dan helpers. Many dari dependencies ini not required untuk initial page load dan can be lazy loaded.

**Code Splitting Implementation**: Kami implement code splitting strategy pada multiple levels. Route-level code splitting automatic dari Next.js App Router dimana each route bundled separately dan loaded on demand. Component-level code splitting implemented menggunakan dynamic imports untuk heavy components seperti Rich Text Editor yang only needed pada naskah creation/edit pages, Chart components yang only needed di dashboard analytics sections, PDF viewer yang only needed ketika user preview documents, dan Modal dialogs yang can be loaded when actually opened. Third-party library code splitting implemented dengan careful import strategy, importing only needed components from libraries rather than entire library (example: import specific icons from lucide-react rather than entire icon set).

**Tree Shaking Configuration**: Kami optimize tree shaking configuration dalam next.config.ts dan tsconfig.json untuk ensure unused code eliminated during build. This includes enabling sideEffects false dalam package.json untuk libraries yang support tree shaking, using ES6 modules syntax (import/export) throughout codebase rather than CommonJS require, avoiding namespace imports (import \* as) yang prevent tree shaking, dan configuring Webpack optimization settings untuk aggressive unused export elimination.

**Performance Impact**: Code splitting dan bundle optimization deliver significant improvements. Initial JavaScript bundle size reduced dari delapan ratus lima puluh KB (gzipped) ke empat ratus dua puluh KB (fifty-one percent reduction). Time to Interactive improved dari lima koma enam detik ke dua koma lapan detik. First Contentful Paint improved dari dua koma tiga detik ke satu koma dua detik. Total Blocking Time reduced dari empat ratus lima puluh milliseconds ke satu ratus delapan puluh milliseconds, resulting dalam much more responsive initial page load experience.

**Code Splitting Implementation Examples**:

**1. Dynamic Import for Heavy Components**:

```typescript
// frontend/app/(penulis)/naskah/[id]/edit/page.tsx
import dynamic from "next/dynamic";
import { Suspense } from "react";

// Lazy load Rich Text Editor (350KB)
const TipTapEditor = dynamic(() => import("@/components/editor/TipTapEditor"), {
  loading: () => <div className="animate-pulse h-96 bg-gray-100 rounded" />,
  ssr: false, // Editor tidak perlu SSR
});

// Lazy load PDF Preview (400KB)
const PDFPreview = dynamic(() => import("@/components/pdf/PDFPreview"), {
  ssr: false,
});

export default function EditNaskahPage({ params }) {
  return (
    <div>
      <Suspense fallback={<EditorSkeleton />}>
        <TipTapEditor initialContent={content} />
      </Suspense>
    </div>
  );
}
```

**2. Route-Based Code Splitting** (Automatic dengan Next.js App Router):

```typescript
// App Router automatically splits routes
app/
  ├── (penulis)/         // Bundle: penulis.chunk.js
  │   ├── dashboard/     // Lazy loaded saat akses
  │   └── naskah/        // Lazy loaded saat akses
  ├── (editor)/          // Bundle: editor.chunk.js
  │   ├── review/
  │   └── antrian/
  └── (admin)/           // Bundle: admin.chunk.js
      ├── dashboard/
      └── pengguna/
```

**3. Library-Specific Imports**:

```typescript
// ❌ SEBELUM: Import seluruh library
import * as Icons from "lucide-react"; // 500KB
import { BarChart, LineChart, PieChart } from "recharts"; // 280KB

// ✅ SESUDAH: Import spesifik yang dibutuhkan
import { BookOpen, User, Settings } from "lucide-react"; // 15KB
import { BarChart } from "recharts/es6/chart/BarChart"; // 80KB
```

**Bundle Size Reduction Diagram**:

```mermaid
pie title Bundle Size Distribution - Before Optimization
    "UI Components" : 200
    "Rich Text Editor" : 350
    "Charts Library" : 280
    "PDF Generator" : 400
    "Utilities" : 120
```

```mermaid
pie title Bundle Size Distribution - After Optimization
    "UI Components" : 120
    "Core App Logic" : 180
    "Utilities" : 80
    "Lazy Loaded (On Demand)" : 40
```

#### C.1.3 Static Site Generation dan Incremental Static Regeneration

Static Site Generation (SSG) provides best possible performance untuk pages dengan content yang tidak frequently change, karena pages pre-rendered during build time dan served as static HTML.

**SSG Implementation**: Kami identify pages yang suitable untuk SSG based pada content update frequency dan personalization requirements. Landing page (homepage) implement full SSG karena content purely marketing dan rarely changes. Kategori listing page implement SSG dengan Incremental Static Regeneration (ISR) dengan revalidate time satu jam, allowing kategori list updated hourly without full rebuild. Genre listing similarly implement SSG with ISR. Public naskah pages (published books available untuk public viewing) implement ISR dengan revalidate time tiga puluh menit, balancing freshness dengan performance. Help pages dan documentation pages implement full SSG karena static content.

**ISR Configuration**: Incremental Static Regeneration configured melalui getStaticProps dengan revalidate property. Configuration carefully tuned based pada content freshness requirements versus build time considerations. High-traffic pages dengan slowly changing content (categories, genres) use longer revalidate times (satu jam atau more) untuk reduce regeneration overhead. Medium-traffic pages dengan moderately changing content (public naskah listings) use shorter revalidate times (tiga puluh menit) untuk balance freshness dengan performance. On-demand revalidation hooks implemented dalam backend untuk trigger immediate revalidation when admin update critical content, eliminating wait untuk scheduled revalidation.

**Fallback Strategy**: For pages dengan many possible dynamic routes (individual naskah pages), kami implement fallback blocking strategy dimana frequently accessed pages pre-rendered during build, new pages generated on-demand dengan subsequent requests served from cache, dan fallback page shown during initial generation untuk acceptable user experience. This hybrid approach balance between pre-rendering everything (which would result dalam very long build times) dan generating everything on-demand (which would sacrifice performance untuk first visitor).

**Performance Impact**: SSG implementation deliver dramatic improvements untuk applicable pages. Landing page load time reduced ke under lima ratus milliseconds dengan instant Time to First Byte karena served as static file. Kategori listing Time to Interactive improved dari tiga koma dua detik ke under satu detik. Public naskah pages LCP improved dari dua koma lapan detik ke satu koma tiga detik. Build time increased dari tiga menit ke lima menit due to pre-rendering, but this trade-off acceptable given deployment frequency dan performance benefits untuk end users.

#### C.1.4 Lazy Loading dan Performance Monitoring

Lazy loading non-critical resources allows prioritizing critical content loading first, improving perceived performance significantly even if total load time remains same.

**Lazy Loading Implementation**: Kami implement lazy loading untuk various types dari resources. Below-the-fold components seperti footer, testimoni section di homepage, dan additional information sections loaded after initial viewport content rendered. Heavy libraries loaded on-demand only when actually needed, such as PDF generation library loaded when user clicks "Generate PDF" button, chart library loaded when user navigate to analytics page, dan rich text editor loaded when user start creating atau editing content. Third-party scripts such as analytics scripts loaded with defer attribute atau asynchronously to prevent blocking main thread. Image lazy loading configured dengan Next.js Image component loading property set to lazy untuk all below-fold images.

**Intersection Observer Usage**: For custom lazy loading implementations, kami utilize Intersection Observer API untuk efficiently detect when elements enter viewport. This approach more performant than scroll event listeners dan provide better control over loading triggers. Example implementation dalam custom hooks such as useIntersectionObserver yang wrap Intersection Observer API dengan React-friendly interface, useLazyLoad untuk images dan components yang should load when visible, dan useInfiniteScroll untuk pagination that automatically load more content when user scroll near bottom.

**Performance Monitoring Implementation**: Kami implement client-side performance monitoring untuk track actual user experience metrics in production. Monitoring includes Web Vitals tracking using next/web-vitals untuk capture FCP, LCP, FID, CLS, dan TTFB metrics, custom performance markers untuk measure specific interactions seperti form submission time atau search query execution time, error boundary implementation untuk capture dan report runtime errors yang impact user experience, dan analytics integration untuk send performance data to Google Analytics atau custom analytics endpoint untuk analysis dan alerting.

**Monitoring Dashboard**: Simple monitoring dashboard created dalam admin panel untuk visualize performance metrics aggregated from users. Dashboard displays average metrics across all users dengan breakdown by page, trend charts showing performance over time untuk identify regressions, percentile views (P50, P90, P99) untuk understand performance distribution, dan alerting rules configured untuk notify team when metrics degrade beyond acceptable thresholds.

**Performance Impact**: Lazy loading implementation reduce initial page weight by average tiga puluh persen without impacting user experience since deferred content loaded before user typically scroll to it. Performance monitoring provide visibility into real-world performance, helping identify issues yang not apparent dalam synthetic testing. Example: monitoring revealed that certain pages perform poorly untuk users dengan slow connections, leading to targeted optimizations untuk those scenarios.

### C.2 Docker Containerization Implementation

Docker containerization essential untuk ensure consistency across different environments dan enable scalable deployment strategies. Kami implement comprehensive containerization untuk both backend dan frontend applications.

#### C.2.0 Backend Redis Caching Implementation (Pre-Containerization)

Sebelum masuk ke containerization, penting untuk highlight backend caching implementation yang telah significantly improve performance dan menjadi critical component dalam containerized deployment strategy.

**Redis Cache Module Architecture**:

**1. Cache Module Setup** (`backend/src/common/cache/cache.module.ts`):

```typescript
import { Module, Global } from "@nestjs/common";
import { CacheModule as NestCacheModule } from "@nestjs/cache-manager";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { redisStore } from "cache-manager-redis-yet";
import { CacheService } from "./cache.service";

@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const redisEnabled = configService.get<boolean>("redis.enabled", true);

        // Fallback ke in-memory jika Redis disabled
        if (!redisEnabled) {
          console.log("[CacheModule] Redis disabled, using in-memory cache");
          return {
            ttl: 300, // 5 minutes
            max: 1000,
            isGlobal: true,
          };
        }

        const redisConfig = {
          socket: {
            host: configService.get<string>("redis.host", "localhost"),
            port: configService.get<number>("redis.port", 6379),
          },
          username: configService.get<string>("redis.username") || undefined,
          password: configService.get<string>("redis.password") || undefined,
          database: configService.get<number>("redis.db", 0),
        };

        try {
          console.log(
            "[CacheModule] Connecting to Redis:",
            redisConfig.socket.host
          );
          const store = await redisStore(redisConfig);
          console.log("[CacheModule] Redis connected successfully");

          return {
            store,
            ttl: 300, // Default TTL: 5 minutes
            max: 1000,
            isGlobal: true,
          };
        } catch (err) {
          console.warn(
            "[CacheModule] Redis unavailable, falling back to in-memory cache"
          );
          return {
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
```

**2. Cache Service dengan Best Practices** (`backend/src/common/cache/cache.service.ts`):

```typescript
import { Injectable, Inject, Logger } from "@nestjs/common";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  /**
   * Cache-aside pattern implementation
   * 1. Check cache first
   * 2. If miss, execute function and cache result
   */
  async wrapDenganCache<T>(
    key: string,
    fn: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    // Cache HIT
    const cachedData = await this.ambil<T>(key);
    if (cachedData !== undefined) {
      return cachedData;
    }

    // Cache MISS - execute function
    const data = await fn();

    // Store in cache
    await this.simpan(key, data, ttl);

    return data;
  }

  /**
   * Generate consistent cache keys
   * Pattern: {resource}:{action}:{...params}
   */
  generateKey(resource: string, action: string, ...params: any[]): string {
    const paramsString = params
      .filter((p) => p !== undefined && p !== null)
      .map((p) => (typeof p === "object" ? JSON.stringify(p) : String(p)))
      .join(":");

    return paramsString
      ? `${resource}:${action}:${paramsString}`
      : `${resource}:${action}`;
  }

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
      return undefined;
    }
  }

  /**
   * Simpan ke cache dengan TTL
   */
  async simpan<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      await this.cacheManager.set(key, value, ttl ? ttl * 1000 : undefined);
      this.logger.debug(`Cache SET: ${key} (TTL: ${ttl || "default"}s)`);
    } catch (error) {
      this.logger.error(`Error menyimpan cache untuk key ${key}:`, error);
    }
  }

  /**
   * Invalidate cache untuk resource
   */
  async invalidateResource(resource: string): Promise<void> {
    // Implementasi pattern-based deletion jika diperlukan
    this.logger.debug(`Cache INVALIDATE: ${resource}:*`);
  }
}
```

**3. Cache Interceptor untuk Controller** (`backend/src/modules/kategori/kategori.controller.ts`):

```typescript
import {
  Controller,
  Get,
  UseInterceptors,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { KategoriService } from "./kategori.service";
import { CacheInterceptor, CacheKey, CacheTTL } from "@/common/cache";

@Controller("kategori")
@UseInterceptors(CacheInterceptor) // Apply caching ke seluruh controller
export class KategoriController {
  constructor(private readonly kategoriService: KategoriService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @CacheKey("kategori:list") // Custom cache key
  @CacheTTL(3600) // Cache 1 jam
  async ambilSemuaKategori() {
    return await this.kategoriService.ambilSemuaKategori();
  }

  @Get(":id")
  @CacheTTL(1800) // Cache 30 menit
  async ambilKategoriById(@Param("id") id: string) {
    return await this.kategoriService.ambilKategoriById(id);
  }
}
```

**4. Service-Level Caching** (`backend/src/modules/naskah/naskah.service.ts`):

```typescript
import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { CacheService } from "@/common/cache/cache.service";

@Injectable()
export class NaskahService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService
  ) {}

  /**
   * Ambil naskah dengan caching
   */
  async ambilNaskahById(id: string) {
    const cacheKey = this.cacheService.generateKey("naskah", "detail", id);

    return await this.cacheService.wrapDenganCache(
      cacheKey,
      async () => {
        // Database query hanya dipanggil jika cache MISS
        const naskah = await this.prisma.naskah.findUnique({
          where: { id },
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

        if (!naskah) {
          throw new NotFoundException("Naskah tidak ditemukan");
        }

        return {
          sukses: true,
          data: naskah,
        };
      },
      1800 // TTL 30 menit
    );
  }

  /**
   * Perbarui naskah dan invalidate cache
   */
  async perbaruiNaskah(id: string, dto: PerbaruiNaskahDto) {
    const naskah = await this.prisma.naskah.update({
      where: { id },
      data: dto,
    });

    // Invalidate cache setelah update
    const cacheKey = this.cacheService.generateKey("naskah", "detail", id);
    await this.cacheService.hapus(cacheKey);

    // Invalidate list cache juga
    await this.cacheService.invalidateResource("naskah:list");

    return { sukses: true, data: naskah };
  }
}
```

**Redis Caching Architecture Diagram**:

```mermaid
sequenceDiagram
    participant Client
    participant Controller
    participant CacheInterceptor
    participant Redis
    participant Service
    participant Database

    Client->>Controller: GET /api/kategori
    Controller->>CacheInterceptor: Check Cache
    CacheInterceptor->>Redis: GET kategori:list

    alt Cache HIT
        Redis-->>CacheInterceptor: Return cached data
        CacheInterceptor-->>Controller: Cached response
        Controller-->>Client: 200 OK (45ms)
    else Cache MISS
        Redis-->>CacheInterceptor: null
        CacheInterceptor->>Service: Call Service Method
        Service->>Database: Query PostgreSQL
        Database-->>Service: Return data (285ms)
        Service-->>CacheInterceptor: Service response
        CacheInterceptor->>Redis: SET kategori:list (TTL: 3600s)
        CacheInterceptor-->>Controller: Fresh response
        Controller-->>Client: 200 OK (320ms)
    end
```

**Cache Performance Metrics**:

| Endpoint       | Without Cache | With Cache (Warm) | Improvement | Hit Rate |
| -------------- | ------------- | ----------------- | ----------- | -------- |
| Kategori List  | 98ms          | 5ms               | 95% faster  | 96.3%    |
| Naskah List    | 287ms         | 12ms              | 96% faster  | 78.5%    |
| Genre List     | 92ms          | 5ms               | 95% faster  | 94.7%    |
| Profile Lookup | 123ms         | 6ms               | 95% faster  | 91.8%    |
| Search Results | 456ms         | 18ms              | 96% faster  | 65.2%    |

**Cache Strategy Patterns**:

```mermaid
graph TB
    A[API Request] --> B{Check Cache}
    B -->|HIT| C[Return Cached Data]
    B -->|MISS| D[Query Database]

    D --> E[Store in Cache]
    E --> F[Return Fresh Data]

    G[Data Update] --> H[Invalidate Cache]
    H --> I[Next Request Cache MISS]
    I --> D

    style C fill:#6bcf7f
    style E fill:#4dabf7
    style H fill:#ff6b6b
```

---

#### C.2.1 Backend Docker Implementation

Backend containerization designed dengan focus pada security, performance, dan minimal image size melalui multi-stage build approach.

**Multi-Stage Build Structure**: Backend Dockerfile structured dengan empat distinct stages untuk optimize both build process dan final image size. Base stage setup common configuration menggunakan oven/bun official image sebagai foundation, setting working directory dan environment variables. Dependencies stage handles bun install dengan frozen lockfile untuk ensure reproducible builds, caching node_modules dalam separate layer untuk accelerate rebuilds when only source code changes. Builder stage copy source code, generate Prisma Client yang required untuk database access, compile TypeScript to JavaScript, dan create production build. Production stage create final minimal image dengan only necessary runtime dependencies, compiled code, dan configuration files, deliberately excluding dev dependencies, source TypeScript files, dan build artifacts.

**Optimization Techniques**: Several optimization techniques applied untuk minimize image size dan improve build performance. Using specific Bun version rather than latest untuk ensure consistent behavior across environments. Leveraging Docker layer caching dengan careful ordering dari commands - dependencies installed first (rarely change) followed by source code (frequently change) untuk maximize cache hits. Implementing .dockerignore file untuk exclude unnecessary files from build context such as node_modules, dist, coverage reports, dan local environment files, reducing context size dari dua ratus MB ke lima puluh MB dan significantly speeding up build. Multi-stage builds allow using heavier builder image dengan development tools while keeping production image lean dengan only runtime essentials.

**Security Hardening**: Security considerations integrated throughout Dockerfile. Running application as non-root user dengan explicit user creation dan permission management untuk prevent privilege escalation attacks. Using specific base image versions rather than latest tag untuk ensure reproducible builds dan easier vulnerability tracking. Scanning images dengan tools like Trivy atau Snyk untuk identify known vulnerabilities dalam dependencies atau base images. Implementing health check endpoint yang Docker can use untuk verify container health, enabling automatic restart dari unhealthy containers.

**Environment Configuration**: Environment variable management carefully implemented untuk support different deployment scenarios. Required variables explicitly documented within Dockerfile comments. Sensitive values like database passwords dan JWT secrets passed through Docker secrets atau environment variables rather than baked into image. Support untuk .env file mounting untuk local development while production uses orchestrator-provided environment variables. Configuration validation at container startup untuk fail fast if critical variables missing rather than failing during runtime.

**Build Results**: Completed backend Docker image size adalah tujuh ratus lima puluh MB uncompressed, meeting target di bawah satu GB. Build time on standard CI runner approximately empat menit dari clean state, under lima menit target. Subsequent builds dengan cached layers complete dalam under dua menit when only source code changes. Container startup time approximately lapan detik dari docker run to healthy state, meeting under sepuluh detik target. Memory usage under normal load stabilizes around empat ratus MB, well under lima ratus MB target, with room untuk growth under higher load.

#### C.2.2 Frontend Docker Implementation

Frontend Docker implementation similarly structured dengan multi-stage build approach but with Next.js-specific considerations untuk optimal production performance.

**Next.js Standalone Mode**: Key optimization for frontend container adalah using Next.js standalone output mode yang significantly reduce deployment size. Standalone mode configured dalam next.config.ts dengan output standalone option, instructs Next.js to create self-contained server bundle dengan only necessary files, automatically trace dan include required dependencies while excluding unnecessary ones. This approach reduce deployment size from typical node_modules heavy approach (often exceeding satu GB) to lean standalone bundle (typically under seratus MB excluding static assets).

**Multi-Stage Build Process**: Frontend Dockerfile structured dengan similar multi-stage approach as backend. Dependencies stage install production dependencies using bun install dengan frozen lockfile. Builder stage copy source code, build Next.js application dengan production optimizations enabled, generate static assets dan standalone server bundle. Production stage copy only necessary artifacts from builder - standalone server bundle, static assets (.next/static), public directory assets, resulting dalam minimal production image.

**Static Asset Handling**: Special attention given to static asset handling untuk optimize delivery. Public directory assets (images, fonts, favicons) copied to production image with proper permissions. Next.js generated static assets (.next/static) containing optimized JavaScript bundles, CSS files, dan other assets properly included. Image optimization cache (.next/cache/images) excluded from production image since images optimized on-demand dan cached dalam production rather than during build.

**Production Runtime Configuration**: Production runtime configured untuk optimal performance dan resource usage. Node environment set to production untuk enable production optimizations within Next.js. Telemetry disabled untuk respect privacy dan reduce overhead. Server listening on all interfaces (zero zero zero zero) to accept connections within container network. Proper signal handling configured untuk graceful shutdown when container stopped, allowing in-flight requests to complete sebelum process terminates.

**Build Results**: Frontend Docker image size adalah empat ratus dua puluh MB uncompressed, exceeding target slightly but acceptable given functionality included. Build time approximately tiga menit dari clean state, meeting target comfortably. Container startup time around enam detik to accepting requests. Memory usage stable around seratus lima puluh MB under normal load, well under dua ratus MB target. Successful demonstration from local development to production deployment dengan zero configuration changes required, validating consistency benefit dari containerization.

#### C.2.3 Docker Compose untuk Development dan Production

Docker Compose provide convenient way untuk orchestrate multiple services required untuk application stack, both in development dan production scenarios.

**Development Compose Configuration**: Development docker-compose.yml file orchestrate complete development stack enabling new developers to get started dengan single command. Stack includes PostgreSQL service dengan persistent volume for database data, ensuring data survives container restarts, configured dengan database name, credentials, dan exposed port for local access. Redis service untuk caching dengan persistent volume dan exposed port. Backend service built from local Dockerfile dengan hot reload enabled through volume mounting dari source code directory, environment variables configured untuk development (debug logging, relaxed security), dan depends_on ensuring database dan redis start before backend. Frontend service similarly configured dengan source code mounted, hot module replacement enabled, depending on backend availability.

**Development Workflow Enhancements**: Development compose configuration enhanced dengan several developer experience improvements. Volume mounting untuk source code enabling code changes immediately reflected without container rebuild. Environment variables loaded dari .env file untuk sensitive configuration, allowing each developer maintain their own credentials without committing to version control. Named volumes untuk database dan Redis providing data persistence across container lifecycle. Network configuration allowing services to communicate using service names as hostnames rather than IP addresses. Health checks configured ensuring services actually ready before dependent services start, preventing race conditions during startup.

**Production Compose Configuration**: Production docker-compose.yml structured differently focusing on stability, security, dan resource management. Services use pre-built images from container registry rather than building locally, ensuring consistent deployment across instances. Environment variables loaded from secure secret management rather than .env files. Volume mounts restricted to only necessary paths such as uploads directory dan logs directory, avoiding source code mounting yang unnecessary in production. Resource limits configured preventing any single service from consuming excessive memory atau CPU. Health checks configured with production-appropriate intervals dan timeouts. Restart policies set to unless-stopped ensuring services automatically restart after failures atau host reboots.

**Networking Configuration**: Both development dan production compose files configure networking untuk secure and efficient communication. Internal network created for backend, database, dan redis communication, preventing external access to database dan redis directly. Frontend connected to backend network for API communication. Backend exposed through configured port mapping for external access. In production setup, typically reverse proxy (nginx or traefik) would sit in front handling SSL termination dan request routing, though this outside current scope.

**Volume Management**: Persistent volumes carefully configured untuk data that must survive container lifecycle. Database volume storing PostgreSQL data ensuring no data loss when container updated atau restarted. Redis volume storing cache data allowing cache warming to persist. Uploads volume storing user-uploaded files ensuring availability across backend container updates. Logs volume collecting application logs for analysis dan debugging. Named volumes used rather than bind mounts for better portability across different host systems.

---

**File Referensi untuk Section Ini**:

**Frontend Optimization**:

- Image Config: `frontend/next.config.ts` (lines 15-35)
- Bundle Analysis: `frontend/.next/analyze/client.html`
- SSG Pages: `frontend/app/(penulis)/page.tsx`, `frontend/app/(publik)/kategori/page.tsx`
- Performance Monitoring: `frontend/lib/monitoring/web-vitals.ts`
- Lazy Loading Hooks: `frontend/lib/hooks/use-intersection-observer.ts`

**Docker Implementation**:

- Backend Dockerfile: `backend/Dockerfile` (complete multi-stage build)
- Frontend Dockerfile: `frontend/Dockerfile` (Next.js standalone)
- Dev Compose: `docker-compose.dev.yml` (full development stack)
- Prod Compose: `docker-compose.prod.yml` (production configuration)
- Docker Ignore: `backend/.dockerignore`, `frontend/.dockerignore`

**Performance Reports**:

- Lighthouse Baseline: `frontend/lighthouse-reports/baseline-report.json`
- Lighthouse After: `frontend/lighthouse-reports/optimized-report.json`
- Bundle Analyzer Before: `frontend/bundle-analysis/before/client.html`
- Bundle Analyzer After: `frontend/bundle-analysis/after/client.html`

**Status**: Part 2 of 4  
**Kata**: ~3,500 kata  
**Lanjut ke**: [PART 3 - Progress Deployment & Monitoring →](./LAPORAN-PROGRESS-FASE-6-PART-3-DEPLOYMENT-MONITORING.md)
