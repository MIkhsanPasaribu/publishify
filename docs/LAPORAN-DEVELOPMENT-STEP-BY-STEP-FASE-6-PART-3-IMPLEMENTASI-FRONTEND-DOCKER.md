# LAPORAN DEVELOPMENT STEP BY STEP FASE 6

## PART 3: IMPLEMENTASI FRONTEND & DOCKER

**Tutorial**: Step-by-Step Frontend Optimization & Containerization  
**Focus**: Practical Implementation dengan Code Examples  
**Prerequisite**: [PART 2 - Perancangan Sistem](./LAPORAN-DEVELOPMENT-STEP-BY-STEP-FASE-6-PART-2-PERANCANGAN-SISTEM.md)  
**Versi Dokumen**: 1.0.0

---

## D. IMPLEMENTASI STEP-BY-STEP

### D.1 Implementasi Image Optimization dengan Next.js

Image optimization adalah starting point dari frontend optimization karena images typically constitute largest portion dari page weight. Kami akan implement comprehensive image optimization menggunakan Next.js Image component.

#### Langkah 1: Configure Next.js Image Domains

First step adalah configure allowed image domains dalam Next.js configuration untuk security purposes. Next.js require explicit domain allowlist untuk external images.

**Lokasi File**: `frontend/next.config.ts`

```typescript
// Configure image optimization
const config: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "cdn.publishify.com",
      },
    ],
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
};
```

**Penjelasan Configuration**:

- `remotePatterns`: Define allowed domains untuk external images dengan protocol dan path patterns
- `formats`: Priority order untuk modern formats - WebP first, then AVIF jika browser support
- `deviceSizes`: Breakpoints untuk responsive images aligned dengan common device widths
- `imageSizes`: Smaller sizes untuk icons, thumbnails, dan UI elements
- `minimumCacheTTL`: Cache duration dalam seconds untuk optimized images

#### Langkah 2: Replace Standard img Tags dengan Image Component

Convert existing img tags throughout application ke Next.js Image component. Example dari naskah cover images.

**Lokasi File**: `frontend/components/shared/naskah-card.tsx`

**Before (Standard img tag)**:

```typescript
<img
  src={naskah.urlSampul}
  alt={naskah.judul}
  className="w-full h-48 object-cover"
/>
```

**After (Next.js Image component)**:

```typescript
import Image from "next/image";

<Image
  src={naskah.urlSampul}
  alt={naskah.judul}
  width={400}
  height={600}
  className="w-full h-48 object-cover"
  loading="lazy"
  placeholder="blur"
  blurDataURL={naskah.blurDataUrl || "/blur-placeholder.jpg"}
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
/>;
```

**Penjelasan Props**:

- `width` dan `height`: Required untuk aspect ratio calculation dan prevent layout shift
- `loading="lazy"`: Defer loading until image near viewport
- `placeholder="blur"`: Show blur preview during loading untuk better perceived performance
- `sizes`: Responsive sizing hints untuk browser select optimal image size

#### Langkah 3: Generate Blur Placeholders

Blur placeholders improve perceived performance dengan showing low-quality preview immediately. Kami implement automatic blur data generation.

**Lokasi File**: `frontend/lib/utils/image-utils.ts`

```typescript
import sharp from "sharp";

export async function generateBlurDataUrl(imageUrl: string): Promise<string> {
  try {
    // Fetch image
    const response = await fetch(imageUrl);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate small blur version (10x10 pixels)
    const blurBuffer = await sharp(buffer)
      .resize(10, 10, { fit: "inside" })
      .blur(5)
      .jpeg({ quality: 20 })
      .toBuffer();

    // Convert to base64 data URL
    const base64 = blurBuffer.toString("base64");
    return `data:image/jpeg;base64,${base64}`;
  } catch (error) {
    console.error("Failed to generate blur placeholder:", error);
    return "/default-blur.jpg";
  }
}
```

**Usage dalam page atau component**:

```typescript
// Generate during server-side rendering atau data fetching
const naskahWithBlur = await Promise.all(
  naskah.map(async (n) => ({
    ...n,
    blurDataUrl: await generateBlurDataUrl(n.urlSampul),
  }))
);
```

#### Langkah 4: Implement Priority Loading untuk Above-Fold Images

Critical images above the fold should load immediately tanpa lazy loading. Hero images dan first visible content receive priority treatment.

**Lokasi File**: `frontend/app/page.tsx` (Homepage hero)

```typescript
<Image
  src="/hero-publishify.jpg"
  alt="Publishify - Platform Penerbitan Naskah"
  width={1920}
  height={1080}
  priority // Load immediately, no lazy loading
  className="w-full h-screen object-cover"
  sizes="100vw"
/>
```

**Priority prop effects**:

- Preload hint added ke HTML head untuk early fetch
- No lazy loading delay
- Higher priority dalam browser loading queue
- Use sparingly (only 2-3 images per page) untuk avoid diluting priority

#### Langkah 5: Optimize Landing Page Images

Landing page contains multiple image sections yang need comprehensive optimization. Kami implement responsive srcset dan lazy loading strategy.

**Lokasi File**: `frontend/components/landing/buku-unggulan-section.tsx`

```typescript
export function BukuUnggulanSection() {
  return (
    <section className="py-16">
      <h2>Buku Unggulan</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {bukuUnggulan.map((buku, index) => (
          <div key={buku.id}>
            <Image
              src={buku.cover}
              alt={buku.judul}
              width={400}
              height={600}
              loading={index < 3 ? "eager" : "lazy"} // First 3 eager, rest lazy
              className="rounded-lg shadow-md"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <h3>{buku.judul}</h3>
            <p>{buku.penulis}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
```

**Strategy Explanation**: First three books load eagerly karena likely visible pada initial viewport. Remaining books lazy load karena require scrolling untuk visibility. This balance immediate visual richness dengan optimal loading performance.

### D.2 Implementasi Code Splitting Strategy

Code splitting reduce initial bundle size dengan breaking application into smaller chunks loaded on demand. Kami implement multi-level splitting strategy.

#### Langkah 1: Configure Webpack Chunk Splitting

Next.js webpack configuration customize chunking strategy untuk optimal bundle organization.

**Lokasi File**: `frontend/next.config.ts`

```typescript
const config: NextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: "all",
        cacheGroups: {
          // Framework code (React, Next.js)
          framework: {
            name: "framework",
            test: /[\\/]node_modules[\\/](react|react-dom|next)[\\/]/,
            priority: 40,
            enforce: true,
          },
          // UI library (Radix, Lucide icons)
          ui: {
            name: "ui",
            test: /[\\/]node_modules[\\/](@radix-ui|lucide-react)[\\/]/,
            priority: 30,
            enforce: true,
          },
          // Form libraries
          forms: {
            name: "forms",
            test: /[\\/]node_modules[\\/](react-hook-form|zod|@hookform)[\\/]/,
            priority: 25,
            enforce: true,
          },
          // Utilities (date-fns, axios, etc)
          utils: {
            name: "utils",
            test: /[\\/]node_modules[\\/](date-fns|axios|clsx|tailwind-merge)[\\/]/,
            priority: 20,
            minChunks: 2,
          },
          // Common code used across pages
          commons: {
            name: "commons",
            minChunks: 3,
            priority: 10,
            reuseExistingChunk: true,
          },
        },
      };
    }
    return config;
  },
};
```

**Configuration Breakdown**:

- `framework` chunk: React dan Next.js core (highest priority, rarely changes)
- `ui` chunk: UI components library (high priority, stable)
- `forms` chunk: Form handling libraries (specific use case)
- `utils` chunk: Utility libraries used dalam multiple places
- `commons` chunk: Shared application code used dalam 3+ pages

#### Langkah 2: Implement Route-Based Code Splitting

Next.js automatically split by route, but kami optimize dengan strategic dynamic imports untuk heavy routes.

**Lokasi File**: `frontend/app/(dashboard)/dashboard/page.tsx`

```typescript
import dynamic from "next/dynamic";

// Heavy components loaded dynamically
const ChartDashboard = dynamic(
  () => import("@/components/dashboard/chart-dashboard"),
  {
    loading: () => <ChartSkeleton />,
    ssr: false, // Client-side only for chart library
  }
);

const RichTextEditor = dynamic(
  () => import("@/components/editor/rich-text-editor"),
  {
    loading: () => <EditorSkeleton />,
    ssr: false,
  }
);

export default function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>
      {/* Basic components loaded immediately */}
      <StatsCards />

      {/* Heavy components loaded when needed */}
      <Suspense fallback={<ChartSkeleton />}>
        <ChartDashboard />
      </Suspense>
    </div>
  );
}
```

**Benefits Dynamic Import**:

- Chart library (~120KB) only loaded ketika dashboard page visited
- Editor library (~150KB) only loaded when editing needed
- Loading states maintain UI stability during chunk loading
- SSR disabled untuk client-only libraries reduce server bundle size

#### Langkah 3: Component-Level Lazy Loading

Individual heavy components dapat lazy loaded untuk defer loading until actually needed.

**Lokasi File**: `frontend/app/(penulis)/penulis/draf-saya/page.tsx`

```typescript
"use client";

import { lazy, Suspense, useState } from "react";

// Lazy load PDF preview modal
const PdfPreviewModal = lazy(() => import("@/components/pdf-preview-modal"));

export default function DrafSayaPage() {
  const [showPreview, setShowPreview] = useState(false);
  const [selectedDraf, setSelectedDraf] = useState(null);

  return (
    <div>
      <h1>Draf Saya</h1>

      {/* Draf list always visible */}
      <DrafList
        onPreview={(draf) => {
          setSelectedDraf(draf);
          setShowPreview(true);
        }}
      />

      {/* PDF preview only loaded when triggered */}
      {showPreview && (
        <Suspense fallback={<ModalSkeleton />}>
          <PdfPreviewModal
            draf={selectedDraf}
            onClose={() => setShowPreview(false)}
          />
        </Suspense>
      )}
    </div>
  );
}
```

**Component Loading Strategy**: PDF preview library only downloaded ketika user actually click preview button. Majority users yang hanya browse list tidak download unused code.

#### Langkah 4: Prefetch Strategy untuk Next Navigation

Next.js automatic prefetching can be optimized untuk predictive loading based on user behavior.

**Lokasi File**: `frontend/components/dashboard/quick-actions.tsx`

```typescript
import Link from "next/link";

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 gap-4">
      {/* High-probability next action - prefetch immediately */}
      <Link
        href="/penulis/draf-saya/new"
        prefetch={true}
        className="btn-primary"
      >
        Buat Naskah Baru
      </Link>

      {/* Less common action - prefetch on hover */}
      <Link
        href="/penulis/pesanan-cetak"
        prefetch={false}
        onMouseEnter={() => {
          // Manual prefetch on hover
          import("../../app/(penulis)/penulis/pesanan-cetak/page");
        }}
        className="btn-secondary"
      >
        Pesanan Cetak
      </Link>
    </div>
  );
}
```

**Prefetch Strategy Benefits**: Common paths prefetched proactively, less common paths prefetched on hover, dan rarely used paths load on click. This balance performance dengan network usage.

### D.3 Implementasi SEO Optimization

SEO implementation ensure search engines properly index dan understand Publishify content. Kami implement comprehensive meta tags, structured data, dan sitemap.

#### Langkah 1: Setup Dynamic Meta Tags

Meta tags dynamically generated based on page content untuk relevance dan accuracy.

**Lokasi File**: `frontend/app/layout.tsx`

```typescript
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: {
      default: "Publishify - Platform Penerbitan Naskah Indonesia",
      template: "%s | Publishify",
    },
    description:
      "Platform lengkap untuk menerbitkan naskah Anda. Dari naskah hingga buku tercetak, semua dalam satu tempat.",
    keywords: [
      "penerbitan naskah",
      "self publishing",
      "cetak buku",
      "platform penulis",
    ],
    authors: [{ name: "Publishify Team" }],
    openGraph: {
      type: "website",
      locale: "id_ID",
      url: "https://publishify.com",
      siteName: "Publishify",
      images: [
        {
          url: "https://publishify.com/og-image.jpg",
          width: 1200,
          height: 630,
          alt: "Publishify Platform",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: "@publishify",
      creator: "@publishify",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}
```

**Lokasi File**: `frontend/app/(penulis)/penulis/buku-terbit/[id]/page.tsx`

```typescript
export async function generateMetadata({ params }): Promise<Metadata> {
  const buku = await getBukuDetail(params.id);

  return {
    title: `${buku.judul} - ${buku.penulis}`,
    description: buku.sinopsis.substring(0, 160),
    openGraph: {
      title: buku.judul,
      description: buku.sinopsis,
      type: "book",
      images: [{ url: buku.cover }],
    },
    twitter: {
      card: "summary_large_image",
      title: buku.judul,
      description: buku.sinopsis,
      images: [buku.cover],
    },
  };
}
```

**Dynamic Meta Benefits**: Each page have relevant meta tags rather than generic site-wide tags. Search engines dan social media platforms show accurate previews.

#### Langkah 2: Implement JSON-LD Structured Data

Structured data help search engines understand content semantics untuk rich search results.

**Lokasi File**: `frontend/components/seo/book-schema.tsx`

```typescript
export function BookSchema({ buku }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Book",
    name: buku.judul,
    author: {
      "@type": "Person",
      name: buku.penulis,
    },
    description: buku.sinopsis,
    isbn: buku.isbn,
    genre: buku.genre,
    datePublished: buku.tanggalTerbit,
    publisher: {
      "@type": "Organization",
      name: "Publishify",
    },
    image: buku.cover,
    aggregateRating: buku.rating && {
      "@type": "AggregateRating",
      ratingValue: buku.rating,
      reviewCount: buku.jumlahReview,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
```

**Usage dalam page**:

```typescript
export default async function BukuDetailPage({ params }) {
  const buku = await getBukuDetail(params.id);

  return (
    <>
      <BookSchema buku={buku} />
      <div>{/* Page content */}</div>
    </>
  );
}
```

#### Langkah 3: Generate Sitemap

Sitemap help search engines discover dan crawl all pages efficiently.

**Lokasi File**: `frontend/app/sitemap.ts`

```typescript
import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://publishify.com";

  // Static pages
  const staticPages = [
    "",
    "/tentang",
    "/fitur",
    "/kontak",
    "/login",
    "/register",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  // Dynamic pages - fetch from database
  const buku = await getAllPublishedBuku();
  const bukuPages = buku.map((b) => ({
    url: `${baseUrl}/buku/${b.slug}`,
    lastModified: new Date(b.updatedAt),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const penulis = await getAllActivePenulis();
  const penulisPages = penulis.map((p) => ({
    url: `${baseUrl}/penulis/${p.username}`,
    lastModified: new Date(p.updatedAt),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...bukuPages, ...penulisPages];
}
```

**Sitemap Benefits**: Automatic submission to search engines via robots.txt reference. Dynamic updates when content changes. Priority hints guide crawler importance.

### D.4 Docker Backend Containerization

Backend containerization ensure consistent deployment across environments dengan optimal image size dan security.

#### Langkah 1: Create Multi-Stage Backend Dockerfile

Multi-stage build minimize final image size dengan separating build dan runtime dependencies.

**Lokasi File**: `docker/Dockerfile.backend`

```dockerfile
# Stage 1: Builder
FROM oven/bun:1 AS builder

WORKDIR /app

# Copy dependency files
COPY backend/package.json backend/bun.lockb ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY backend/ .

# Build application
RUN bun run build

# Generate Prisma Client
RUN bunx prisma generate

# Stage 2: Runtime
FROM oven/bun:1-slim AS runtime

WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

# Copy only production dependencies
COPY backend/package.json backend/bun.lockb ./
RUN bun install --production --frozen-lockfile

# Copy built application from builder
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nestjs:nodejs /app/prisma ./prisma

# Copy startup script
COPY backend/docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD bun run healthcheck || exit 1

# Start application
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["bun", "run", "start:prod"]
```

**Dockerfile Breakdown**:

- **Stage 1 (Builder)**: Full Bun image dengan all build tools. Install all dependencies including devDependencies. Compile TypeScript. Generate Prisma client. Result tidak digunakan directly, only artifacts copied.
- **Stage 2 (Runtime)**: Slim Bun image untuk smaller size. Create non-root user untuk security. Install only production dependencies. Copy compiled code dan generated Prisma client dari builder. Result adalah optimized image under 750MB.

#### Langkah 2: Create Docker Entrypoint Script

Entrypoint script handle initialization tasks before starting application.

**Lokasi File**: `backend/docker-entrypoint.sh`

```bash
#!/bin/sh
set -e

echo "Starting Publishify Backend..."

# Wait for database to be ready
echo "Waiting for database..."
until bunx prisma db execute --stdin <<< "SELECT 1;" > /dev/null 2>&1; do
  echo "Database is unavailable - sleeping"
  sleep 2
done

echo "Database is ready!"

# Run migrations in production
if [ "$NODE_ENV" = "production" ]; then
  echo "Running database migrations..."
  bunx prisma migrate deploy
fi

# Start application
echo "Starting NestJS application..."
exec "$@"
```

**Script Functions**:

- Wait untuk database connectivity before proceeding
- Run Prisma migrations dalam production environment
- Execute main command (passed sebagai arguments)
- Use `exec` untuk proper signal handling

#### Langkah 3: Create Health Check Endpoint

Health check endpoint enable container orchestration detect unhealthy containers.

**Lokasi File**: `backend/src/health/health.controller.ts`

```typescript
import { Controller, Get } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";

@Controller("health")
export class HealthController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async check() {
    // Check database connectivity
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: "healthy",
        timestamp: new Date().toISOString(),
        database: "connected",
      };
    } catch (error) {
      throw new Error("Database connection failed");
    }
  }
}
```

**Lokasi File**: `backend/healthcheck.ts` (for Docker HEALTHCHECK)

```typescript
#!/usr/bin/env bun

async function healthcheck() {
  try {
    const response = await fetch("http://localhost:3000/health", {
      method: "GET",
      headers: { Accept: "application/json" },
    });

    if (response.ok) {
      const data = await response.json();
      console.log("Health check passed:", data);
      process.exit(0);
    } else {
      console.error("Health check failed:", response.status);
      process.exit(1);
    }
  } catch (error) {
    console.error("Health check error:", error);
    process.exit(1);
  }
}

healthcheck();
```

### D.5 Docker Frontend Containerization

Frontend containerization optimize Next.js standalone build untuk minimal image size.

#### Langkah 1: Configure Next.js Standalone Build

Next.js standalone output include only required files untuk runtime.

**Lokasi File**: `frontend/next.config.ts`

```typescript
const config: NextConfig = {
  output: "standalone",
  // ... other config
};
```

**Standalone benefits**: Only copies files needed untuk production. Excludes devDependencies automatically. Smaller deployment package. Faster container builds.

#### Langkah 2: Create Multi-Stage Frontend Dockerfile

**Lokasi File**: `docker/Dockerfile.frontend`

```dockerfile
# Stage 1: Dependencies
FROM oven/bun:1 AS deps

WORKDIR /app

COPY frontend/package.json frontend/bun.lockb ./
RUN bun install --frozen-lockfile

# Stage 2: Builder
FROM oven/bun:1 AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY frontend/ .

# Build with standalone output
ENV NEXT_TELEMETRY_DISABLED 1
RUN bun run build

# Stage 3: Runtime
FROM oven/bun:1-slim AS runtime

WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone build
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

EXPOSE 3001

ENV PORT 3001
ENV HOSTNAME "0.0.0.0"

CMD ["bun", "run", "server.js"]
```

**Dockerfile Optimization Points**:

- Separate dependency installation untuk leverage Docker layer caching
- Standalone output significantly smaller than full build
- Static files dan public assets copied separately
- Non-root user execution untuk security
- Final image typically under 420MB

### D.6 Docker Compose Orchestration

Docker Compose coordinate multiple services dengan proper networking dan volumes.

#### Langkah 1: Create Docker Compose File

**Lokasi File**: `docker-compose.yml` (root directory)

```yaml
version: "3.8"

services:
  # PostgreSQL Database
  db:
    image: postgres:16-alpine
    container_name: publishify-db
    environment:
      POSTGRES_DB: publishify
      POSTGRES_USER: publishify
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - db-data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U publishify"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  # Redis Cache
  redis:
    image: redis:7-alpine
    container_name: publishify-redis
    command: redis-server --maxmemory 512mb --maxmemory-policy allkeys-lru
    volumes:
      - redis-data:/data
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  # Backend API
  backend:
    build:
      context: .
      dockerfile: docker/Dockerfile.backend
    container_name: publishify-backend
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://publishify:${DB_PASSWORD}@db:5432/publishify
      REDIS_URL: redis://redis:6379
      JWT_SECRET: ${JWT_SECRET}
      PORT: 3000
    volumes:
      - uploads:/app/uploads
      - logs:/app/logs
    ports:
      - "3000:3000"
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "bun", "run", "healthcheck"]
      interval: 30s
      timeout: 5s
      retries: 3
    restart: unless-stopped

  # Frontend Web
  frontend:
    build:
      context: .
      dockerfile: docker/Dockerfile.frontend
    container_name: publishify-frontend
    environment:
      NODE_ENV: production
      NEXT_PUBLIC_API_URL: http://backend:3000
    ports:
      - "3001:3001"
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  db-data:
    driver: local
  redis-data:
    driver: local
  uploads:
    driver: local
  logs:
    driver: local

networks:
  default:
    name: publishify-network
```

**Compose Configuration Explanation**:

- **db service**: PostgreSQL dengan persistent volume untuk data storage. Health check ensure database ready before dependent services start.
- **redis service**: Redis dengan memory limit dan LRU eviction policy. Persistent volume untuk data durability.
- **backend service**: NestJS API depend on healthy db dan redis. Volume mounts untuk uploads dan logs. Environment variables for configuration.
- **frontend service**: Next.js app depend on backend. Exposed port untuk external access.
- **volumes**: Named volumes persist data across container restarts.
- **networks**: Default network enable service-to-service communication via service names.

#### Langkah 2: Create Environment Variables File

**Lokasi File**: `.env` (root directory, not committed to git)

```env
# Database
DB_PASSWORD=strongpassword123

# JWT
JWT_SECRET=your-super-secret-jwt-key

# API Keys (if needed)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
```

**Lokasi File**: `.env.example` (template, committed to git)

```env
# Database
DB_PASSWORD=changeme

# JWT
JWT_SECRET=changeme

# API Keys
SUPABASE_URL=your-url
SUPABASE_KEY=your-key
```

#### Langkah 3: Start Complete Stack

```bash
# Build dan start all services
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop all services
docker-compose down

# Stop dan remove volumes (caution: deletes data)
docker-compose down -v
```

**Docker Compose Benefits**: Single command start complete stack. Automatic network configuration. Service dependency management. Easy local development environment. Consistent across team members.

---

**Lokasi File Implementation Complete:**

Frontend Optimization:

- `frontend/next.config.ts` - Image dan webpack configuration
- `frontend/components/shared/naskah-card.tsx` - Image component usage
- `frontend/lib/utils/image-utils.ts` - Blur placeholder generation
- `frontend/app/layout.tsx` - Meta tags dan SEO
- `frontend/app/sitemap.ts` - Sitemap generation

Docker Configuration:

- `docker/Dockerfile.backend` - Backend containerization
- `docker/Dockerfile.frontend` - Frontend containerization
- `docker-compose.yml` - Service orchestration
- `backend/docker-entrypoint.sh` - Initialization script
- `backend/healthcheck.ts` - Health check script

**Total Word Count Part 3**: ~3,800 kata

---

**Navigation**: [← PART 2](./LAPORAN-DEVELOPMENT-STEP-BY-STEP-FASE-6-PART-2-PERANCANGAN-SISTEM.md) | [PART 4: CI/CD & Monitoring →](./LAPORAN-DEVELOPMENT-STEP-BY-STEP-FASE-6-PART-4-IMPLEMENTASI-CICD-MONITORING.md)
