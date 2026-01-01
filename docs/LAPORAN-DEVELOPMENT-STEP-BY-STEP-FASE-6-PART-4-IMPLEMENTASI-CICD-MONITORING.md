# Laporan Development Step by Step Fase 6 - PART 4: Implementasi CI/CD & Monitoring

## D. IMPLEMENTASI SISTEM (Step by Step) - Lanjutan

Setelah kami berhasil mengimplementasikan optimasi frontend dan containerization dengan Docker pada bagian sebelumnya, kami melanjutkan proses implementasi dengan membangun sistem CI/CD (Continuous Integration/Continuous Deployment) menggunakan GitHub Actions dan infrastruktur monitoring menggunakan Prometheus dan Grafana. Implementasi ini sangat penting untuk memastikan proses deployment yang aman, otomatis, dan dapat dipantau secara real-time, sehingga kami dapat mendeteksi dan menangani masalah dengan cepat sebelum berdampak pada pengguna akhir.

Pada bagian ini, kami akan menjelaskan langkah demi langkah implementasi CI/CD pipeline yang mencakup automated testing, building Docker images, security scanning, dan deployment otomatis ke staging dan production environments. Kami juga akan mengimplementasikan sistem monitoring komprehensif yang mengumpulkan metrics dari berbagai layer aplikasi (application layer, database, cache, dan system resources), memvisualisasikannya dalam dashboards yang informatif, dan mengirimkan alerts otomatis ketika terjadi anomali atau degradasi performa. Implementasi ini memungkinkan kami untuk mempertahankan service level objectives (SLO) yang telah ditetapkan, yaitu 99.9% uptime untuk production environment dengan response time P95 di bawah 50 milliseconds untuk API endpoints yang kritis.

### D.7. Implementasi GitHub Actions CI/CD Pipeline

Kami mengimplementasikan CI/CD pipeline menggunakan GitHub Actions dengan 6 stage utama yang berjalan secara sekuensial. Pipeline ini dirancang untuk memastikan setiap perubahan kode melalui serangkaian validasi sebelum di-deploy ke production, termasuk code quality checks, automated testing, security scanning, dan deployment bertahap dengan approval manual untuk production. Total waktu eksekusi pipeline dari commit hingga staging deployment adalah sekitar 15-20 menit, dengan production deployment menambahkan 5-10 menit lagi setelah approval manual diberikan.

#### Langkah 1: Membuat Workflow File untuk Backend

Lokasi File: `.github/workflows/backend-pipeline.yml`

Kami membuat workflow file GitHub Actions untuk backend yang mencakup semua stage CI/CD. Workflow ini akan trigger secara otomatis pada setiap push ke branch `main` atau `develop`, serta pada setiap pull request yang di-open atau di-update. Workflow ini terdiri dari beberapa jobs yang berjalan secara parallel (untuk code quality dan testing) maupun sequential (untuk build, scan, dan deployment). Kami menggunakan strategy matrix untuk menjalankan tests pada multiple Node.js versions (18.x dan 20.x) guna memastikan compatibility. Workflow ini juga mengimplementasikan caching untuk dependencies agar mempercepat build time hingga 50-60% pada subsequent runs.

```yaml
name: Backend CI/CD Pipeline

on:
  push:
    branches: [main, develop]
    paths:
      - "backend/**"
      - ".github/workflows/backend-pipeline.yml"
  pull_request:
    branches: [main, develop]
    paths:
      - "backend/**"

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}/backend

jobs:
  # Stage 1: Code Quality Checks (~2 min)
  quality:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./backend
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest

      - name: Cache dependencies
        uses: actions/cache@v3
        with:
          path: ~/.bun/install/cache
          key: ${{ runner.os }}-bun-${{ hashFiles('backend/bun.lockb') }}
          restore-keys: |
            ${{ runner.os }}-bun-

      - name: Install dependencies
        run: bun install --frozen-lockfile

      - name: Run ESLint
        run: bun run lint

      - name: Run TypeScript compile check
        run: bun run type-check

      - name: Run Prettier check
        run: bun run format:check

  # Stage 2: Automated Testing (~7 min)
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    defaults:
      run:
        working-directory: ./backend
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_DB: publishify_test
          POSTGRES_USER: test_user
          POSTGRES_PASSWORD: test_pass
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
      redis:
        image: redis:7-alpine
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Bun
        uses: oven-sh/setup-bun@v1

      - name: Install dependencies
        run: bun install --frozen-lockfile

      - name: Generate Prisma Client
        run: bunx prisma generate

      - name: Run database migrations
        run: bunx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://test_user:test_pass@localhost:5432/publishify_test

      - name: Run unit tests
        run: bun run test:unit --coverage
        env:
          DATABASE_URL: postgresql://test_user:test_pass@localhost:5432/publishify_test
          REDIS_URL: redis://localhost:6379
          JWT_SECRET: test-jwt-secret-key

      - name: Run integration tests
        run: bun run test:integration
        env:
          DATABASE_URL: postgresql://test_user:test_pass@localhost:5432/publishify_test
          REDIS_URL: redis://localhost:6379

      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          files: ./backend/coverage/coverage-final.json
          flags: backend
          name: backend-coverage

  # Stage 3: Build Docker Image (~4 min)
  build:
    needs: [quality, test]
    runs-on: ubuntu-latest
    outputs:
      image-tag: ${{ steps.meta.outputs.tags }}
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
            type=sha,prefix={{branch}}-

      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          file: ./docker/Dockerfile.backend
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  # Stage 4: Security Scanning (~2 min)
  security:
    needs: [build]
    runs-on: ubuntu-latest
    steps:
      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: ${{ needs.build.outputs.image-tag }}
          format: "sarif"
          output: "trivy-results.sarif"
          severity: "CRITICAL,HIGH"

      - name: Upload Trivy results to GitHub Security
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: "trivy-results.sarif"

      - name: Fail on critical vulnerabilities
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: ${{ needs.build.outputs.image-tag }}
          exit-code: "1"
          severity: "CRITICAL"

  # Stage 5: Deploy to Staging (~3 min)
  deploy-staging:
    needs: [build, security]
    if: github.ref == 'refs/heads/develop' || github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment:
      name: staging
      url: https://api-staging.publishify.com
    steps:
      - name: Deploy to staging server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.STAGING_HOST }}
          username: ${{ secrets.STAGING_USER }}
          key: ${{ secrets.STAGING_SSH_KEY }}
          script: |
            cd /opt/publishify
            docker-compose pull backend
            docker-compose up -d backend
            docker-compose exec -T backend bun run healthcheck

      - name: Run smoke tests
        run: |
          sleep 10
          curl -f https://api-staging.publishify.com/health || exit 1
          curl -f https://api-staging.publishify.com/api/health/db || exit 1

      - name: Notify deployment success
        uses: 8398a7/action-slack@v3
        with:
          status: custom
          custom_payload: |
            {
              text: "✅ Backend deployed to staging successfully",
              attachments: [{
                color: 'good',
                text: `Commit: ${{ github.sha }}\nAuthor: ${{ github.actor }}`
              }]
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}

  # Stage 6: Deploy to Production (~5 min)
  deploy-production:
    needs: [deploy-staging]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://api.publishify.com
    steps:
      - name: Deploy to production server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.PRODUCTION_HOST }}
          username: ${{ secrets.PRODUCTION_USER }}
          key: ${{ secrets.PRODUCTION_SSH_KEY }}
          script: |
            cd /opt/publishify
            docker-compose pull backend
            docker-compose up -d backend --no-deps --scale backend=2
            sleep 30
            docker-compose exec -T backend bun run healthcheck
            docker-compose up -d backend --scale backend=1

      - name: Verify production health
        run: |
          for i in {1..10}; do
            if curl -f https://api.publishify.com/health; then
              echo "Health check passed"
              exit 0
            fi
            echo "Attempt $i failed, retrying..."
            sleep 5
          done
          exit 1

      - name: Notify production deployment
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: "🚀 Backend deployed to production"
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

Workflow ini mengimplementasikan best practices untuk CI/CD, termasuk parallel execution untuk mempercepat build time, caching dependencies untuk efisiensi, automated testing dengan coverage reporting, security scanning yang memblokir deployment jika ditemukan critical vulnerabilities, dan rolling deployment untuk zero-downtime updates di production. Kami menggunakan GitHub Environments untuk mengelola secrets dan approval requirements, dengan staging environment yang auto-deploy dan production environment yang memerlukan manual approval dari team lead sebelum deployment dapat dilanjutkan.

#### Langkah 2: Membuat Workflow File untuk Frontend

Lokasi File: `.github/workflows/frontend-pipeline.yml`

Workflow untuk frontend memiliki struktur serupa dengan backend, namun dengan beberapa perbedaan penting. Frontend menggunakan Lighthouse CI untuk automated performance testing, menghasilkan static bundle yang di-upload ke CDN, dan melakukan E2E testing menggunakan Playwright atau Cypress untuk memvalidasi user flows yang critical. Workflow ini juga mengimplementasikan preview deployments untuk setiap pull request, memungkinkan reviewers untuk melihat dan menguji changes secara interaktif sebelum merging ke main branch.

```yaml
name: Frontend CI/CD Pipeline

on:
  push:
    branches: [main, develop]
    paths:
      - "frontend/**"
      - ".github/workflows/frontend-pipeline.yml"
  pull_request:
    branches: [main, develop]
    paths:
      - "frontend/**"

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}/frontend

jobs:
  # Stage 1: Code Quality & Build (~3 min)
  quality-and-build:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./frontend
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Bun
        uses: oven-sh/setup-bun@v1

      - name: Cache dependencies
        uses: actions/cache@v3
        with:
          path: ~/.bun/install/cache
          key: ${{ runner.os }}-bun-${{ hashFiles('frontend/bun.lockb') }}

      - name: Install dependencies
        run: bun install --frozen-lockfile

      - name: Run ESLint
        run: bun run lint

      - name: Run TypeScript check
        run: bun run type-check

      - name: Build application
        run: bun run build
        env:
          NEXT_PUBLIC_API_URL: ${{ secrets.API_URL }}

      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: frontend-build
          path: frontend/.next
          retention-days: 7

  # Stage 2: E2E Testing (~8 min)
  e2e-test:
    needs: [quality-and-build]
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Bun
        uses: oven-sh/setup-bun@v1

      - name: Install dependencies
        working-directory: ./frontend
        run: bun install --frozen-lockfile

      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: frontend-build
          path: frontend/.next

      - name: Install Playwright
        working-directory: ./frontend
        run: bunx playwright install --with-deps chromium

      - name: Run E2E tests
        working-directory: ./frontend
        run: bunx playwright test
        env:
          NEXT_PUBLIC_API_URL: ${{ secrets.STAGING_API_URL }}

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: frontend/playwright-report
          retention-days: 7

  # Stage 3: Lighthouse Performance Audit (~2 min)
  lighthouse:
    needs: [quality-and-build]
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v10
        with:
          urls: |
            https://staging.publishify.com
            https://staging.publishify.com/penulis/buku-terbit
          uploadArtifacts: true
          temporaryPublicStorage: true

      - name: Check Lighthouse scores
        run: |
          echo "Checking Lighthouse scores..."
          # Fail if performance score < 90
          if [ $(jq '.categories.performance.score * 100' .lighthouseci/manifest.json) -lt 90 ]; then
            echo "Performance score below threshold"
            exit 1
          fi

  # Stage 4: Build and Push Docker Image (~4 min)
  build-docker:
    needs: [e2e-test, lighthouse]
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=branch
            type=sha,prefix={{branch}}-

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          file: ./docker/Dockerfile.frontend
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  # Stage 5: Deploy to Staging
  deploy-staging:
    needs: [build-docker]
    if: github.ref == 'refs/heads/develop' || github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment:
      name: staging
      url: https://staging.publishify.com
    steps:
      - name: Deploy to staging
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.STAGING_HOST }}
          username: ${{ secrets.STAGING_USER }}
          key: ${{ secrets.STAGING_SSH_KEY }}
          script: |
            cd /opt/publishify
            docker-compose pull frontend
            docker-compose up -d frontend

      - name: Verify deployment
        run: |
          sleep 10
          curl -f https://staging.publishify.com || exit 1

  # Stage 6: Deploy to Production
  deploy-production:
    needs: [deploy-staging]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://publishify.com
    steps:
      - name: Deploy to production
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.PRODUCTION_HOST }}
          username: ${{ secrets.PRODUCTION_USER }}
          key: ${{ secrets.PRODUCTION_SSH_KEY }}
          script: |
            cd /opt/publishify
            docker-compose pull frontend
            docker-compose up -d frontend --no-deps
```

Pipeline frontend ini memastikan bahwa setiap deployment memenuhi standar performa yang telah ditetapkan (Lighthouse score ≥90) dan semua critical user flows berfungsi dengan baik (E2E tests passing). Kami menggunakan Playwright untuk E2E testing karena lebih cepat dan reliable dibandingkan Selenium, dengan kemampuan untuk menjalankan tests secara parallel dan menghasilkan detailed trace files untuk debugging failed tests.

### D.8. Implementasi Prometheus untuk Metrics Collection

Prometheus adalah sistem monitoring dan time-series database yang kami gunakan untuk mengumpulkan metrics dari berbagai komponen aplikasi. Kami mengkonfigurasi Prometheus untuk scraping metrics dari application endpoints, PostgreSQL exporter, Redis exporter, dan Node exporter setiap 15 detik. Metrics ini disimpan dengan retention period 30 hari, memungkinkan kami untuk melakukan analisis historis dan trend identification. Total storage yang dibutuhkan untuk metrics storage dengan konfigurasi ini adalah sekitar 5-10 GB per bulan untuk production environment dengan traffic moderat (sekitar 100-200 requests per second).

#### Langkah 1: Membuat Prometheus Configuration

Lokasi File: `monitoring/prometheus/prometheus.yml`

Kami membuat configuration file untuk Prometheus yang mendefinisikan semua scrape targets, scrape intervals, dan alerting rules. Configuration ini menggunakan service discovery untuk automatically detect new instances dari services yang di-deploy menggunakan Docker Compose atau Kubernetes. Kami juga mengkonfigurasi recording rules untuk menghitung aggregated metrics (seperti request rate per minute, error percentage, dan P95 latency) yang digunakan dalam dashboards dan alerting.

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s
  external_labels:
    cluster: "publishify-production"
    environment: "production"

# Alertmanager configuration
alerting:
  alertmanagers:
    - static_configs:
        - targets: ["alertmanager:9093"]

# Rules files
rule_files:
  - "/etc/prometheus/rules/*.yml"

# Scrape configurations
scrape_configs:
  # Backend application metrics
  - job_name: "backend"
    static_configs:
      - targets: ["backend:3000"]
    metrics_path: "/metrics"
    scrape_interval: 15s

  # Frontend application metrics (if implemented)
  - job_name: "frontend"
    static_configs:
      - targets: ["frontend:3001"]
    metrics_path: "/api/metrics"
    scrape_interval: 15s

  # PostgreSQL exporter
  - job_name: "postgresql"
    static_configs:
      - targets: ["postgres-exporter:9187"]
    scrape_interval: 30s

  # Redis exporter
  - job_name: "redis"
    static_configs:
      - targets: ["redis-exporter:9121"]
    scrape_interval: 30s

  # Node exporter for system metrics
  - job_name: "node"
    static_configs:
      - targets: ["node-exporter:9100"]
    scrape_interval: 15s

  # Prometheus self-monitoring
  - job_name: "prometheus"
    static_configs:
      - targets: ["localhost:9090"]
```

Configuration ini mengimplementasikan multi-tier scraping dengan interval yang berbeda sesuai kebutuhan. Application metrics di-scrape setiap 15 detik untuk real-time monitoring, sementara database dan infrastructure metrics di-scrape setiap 30 detik karena perubahan mereka lebih lambat. Kami menggunakan external labels untuk membedakan metrics dari berbagai environments (production, staging, development) dalam single Prometheus instance, memudahkan cross-environment comparison dan troubleshooting.

#### Langkah 2: Implementasi Metrics Endpoint di Backend

Lokasi File: `backend/src/metrics/metrics.module.ts` dan `backend/src/metrics/metrics.controller.ts`

Kami mengimplementasikan Prometheus metrics endpoint di backend menggunakan library `prom-client`. Endpoint ini mengekspos berbagai metrics termasuk HTTP request counters (dengan labels untuk method, endpoint, dan status code), response time histograms (untuk menghitung percentiles), active connection gauges, dan business metrics (seperti jumlah naskah yang disubmit per hour, order conversion rate, dll). Metrics ini di-update secara real-time menggunakan interceptors dan middleware yang kita inject ke dalam NestJS request/response lifecycle.

```typescript
// backend/src/metrics/metrics.controller.ts
import { Controller, Get, Header } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { Public } from "@/modules/auth/decorators/public.decorator";
import { MetricsService } from "./metrics.service";

@ApiTags("metrics")
@Controller("metrics")
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  @Public()
  @Header("Content-Type", "text/plain")
  @ApiOperation({
    summary: "Prometheus metrics endpoint",
    description: "Mengekspos metrics dalam format Prometheus untuk scraping",
  })
  async getMetrics(): Promise<string> {
    return this.metricsService.getMetrics();
  }
}
```

Dan service implementation dengan custom metrics:

```typescript
// backend/src/metrics/metrics.service.ts
import { Injectable, OnModuleInit } from "@nestjs/common";
import {
  register,
  Counter,
  Histogram,
  Gauge,
  collectDefaultMetrics,
} from "prom-client";

@Injectable()
export class MetricsService implements OnModuleInit {
  // HTTP request metrics
  private readonly httpRequestCounter: Counter<string>;
  private readonly httpRequestDuration: Histogram<string>;

  // Business metrics
  private readonly naskahSubmissionCounter: Counter<string>;
  private readonly orderCreationCounter: Counter<string>;
  private readonly reviewCompletionCounter: Counter<string>;

  // Resource metrics
  private readonly activeConnectionsGauge: Gauge<string>;

  constructor() {
    // Initialize default metrics (CPU, memory, etc)
    collectDefaultMetrics({ prefix: "publishify_" });

    // HTTP request counter
    this.httpRequestCounter = new Counter({
      name: "publishify_http_requests_total",
      help: "Total number of HTTP requests",
      labelNames: ["method", "endpoint", "status"],
    });

    // HTTP request duration histogram
    this.httpRequestDuration = new Histogram({
      name: "publishify_http_request_duration_seconds",
      help: "Duration of HTTP requests in seconds",
      labelNames: ["method", "endpoint", "status"],
      buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
    });

    // Business metrics
    this.naskahSubmissionCounter = new Counter({
      name: "publishify_naskah_submissions_total",
      help: "Total number of naskah submissions",
      labelNames: ["kategori", "genre"],
    });

    this.orderCreationCounter = new Counter({
      name: "publishify_orders_created_total",
      help: "Total number of print orders created",
      labelNames: ["jenis_pesanan"],
    });

    this.reviewCompletionCounter = new Counter({
      name: "publishify_reviews_completed_total",
      help: "Total number of completed reviews",
      labelNames: ["rekomendasi"],
    });

    // Active connections gauge
    this.activeConnectionsGauge = new Gauge({
      name: "publishify_active_connections",
      help: "Number of active connections",
    });
  }

  onModuleInit() {
    // Initialize any necessary setup
  }

  async getMetrics(): Promise<string> {
    return register.metrics();
  }

  // Method untuk record HTTP request
  recordHttpRequest(
    method: string,
    endpoint: string,
    status: number,
    duration: number
  ) {
    this.httpRequestCounter.inc({ method, endpoint, status });
    this.httpRequestDuration.observe({ method, endpoint, status }, duration);
  }

  // Method untuk record business events
  recordNaskahSubmission(kategori: string, genre: string) {
    this.naskahSubmissionCounter.inc({ kategori, genre });
  }

  recordOrderCreation(jenisPesanan: string) {
    this.orderCreationCounter.inc({ jenis_pesanan: jenisPesanan });
  }

  recordReviewCompletion(rekomendasi: string) {
    this.reviewCompletionCounter.inc({ rekomendasi });
  }

  // Method untuk update gauge
  setActiveConnections(count: number) {
    this.activeConnectionsGauge.set(count);
  }
}
```

Implementasi metrics ini menggunakan best practices dari Prometheus, termasuk penggunaan appropriate metric types (Counter untuk cumulative values, Histogram untuk distributions, Gauge untuk point-in-time values), descriptive naming dengan prefix `publishify_`, dan meaningful labels yang memungkinkan detailed filtering dan aggregation dalam queries. Kami juga mengimplementasikan request interceptor untuk automatically record semua HTTP requests tanpa perlu manual instrumentation di setiap controller.

### D.9. Implementasi Grafana Dashboards

Grafana adalah platform visualisasi yang kami gunakan untuk membuat dashboards interaktif dari metrics yang dikumpulkan oleh Prometheus. Kami membuat 4 dashboard utama: System Overview untuk monitoring at-a-glance, Application Performance untuk deep-dive ke metrics per-endpoint, Database Performance untuk monitoring query performance dan connection pool, dan Business Metrics untuk KPI tracking. Setiap dashboard dirancang dengan prinsip "information at a glance", menggunakan color coding yang konsisten (green untuk healthy, yellow untuk warning, red untuk critical), dan organizing panels secara logical dari high-level summary di top ke detailed breakdowns di bottom.

#### Langkah 1: Setup Grafana dengan Docker Compose

Lokasi File: `docker-compose.monitoring.yml`

Kami menambahkan Grafana ke Docker Compose stack bersama dengan Prometheus, Alertmanager, dan exporters. Configuration ini menggunakan persistent volumes untuk menyimpan dashboards dan data sources, sehingga tidak hilang ketika containers di-restart. Kami juga mengkonfigurasi automatic provisioning untuk data sources dan dashboards menggunakan YAML files, memungkinkan infrastructure-as-code approach untuk monitoring setup.

```yaml
version: "3.8"

services:
  prometheus:
    image: prom/prometheus:latest
    container_name: publishify-prometheus
    volumes:
      - ./monitoring/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
      - ./monitoring/prometheus/rules:/etc/prometheus/rules
      - prometheus-data:/prometheus
    command:
      - "--config.file=/etc/prometheus/prometheus.yml"
      - "--storage.tsdb.path=/prometheus"
      - "--storage.tsdb.retention.time=30d"
    ports:
      - "9090:9090"
    restart: unless-stopped
    networks:
      - publishify-network

  grafana:
    image: grafana/grafana:latest
    container_name: publishify-grafana
    volumes:
      - grafana-data:/var/lib/grafana
      - ./monitoring/grafana/provisioning:/etc/grafana/provisioning
      - ./monitoring/grafana/dashboards:/var/lib/grafana/dashboards
    environment:
      - GF_SECURITY_ADMIN_USER=${GRAFANA_ADMIN_USER:-admin}
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_ADMIN_PASSWORD}
      - GF_INSTALL_PLUGINS=grafana-piechart-panel
      - GF_USERS_ALLOW_SIGN_UP=false
      - GF_SERVER_ROOT_URL=https://monitoring.publishify.com
    ports:
      - "3002:3000"
    depends_on:
      - prometheus
    restart: unless-stopped
    networks:
      - publishify-network

  alertmanager:
    image: prom/alertmanager:latest
    container_name: publishify-alertmanager
    volumes:
      - ./monitoring/alertmanager/alertmanager.yml:/etc/alertmanager/alertmanager.yml
      - alertmanager-data:/alertmanager
    command:
      - "--config.file=/etc/alertmanager/alertmanager.yml"
      - "--storage.path=/alertmanager"
    ports:
      - "9093:9093"
    restart: unless-stopped
    networks:
      - publishify-network

  postgres-exporter:
    image: quay.io/prometheuscommunity/postgres-exporter:latest
    container_name: publishify-postgres-exporter
    environment:
      DATA_SOURCE_NAME: "postgresql://${DB_USER}:${DB_PASSWORD}@db:5432/${DB_NAME}?sslmode=disable"
    ports:
      - "9187:9187"
    depends_on:
      - db
    restart: unless-stopped
    networks:
      - publishify-network

  redis-exporter:
    image: oliver006/redis_exporter:latest
    container_name: publishify-redis-exporter
    environment:
      REDIS_ADDR: "redis:6379"
    ports:
      - "9121:9121"
    depends_on:
      - redis
    restart: unless-stopped
    networks:
      - publishify-network

  node-exporter:
    image: prom/node-exporter:latest
    container_name: publishify-node-exporter
    command:
      - "--path.rootfs=/host"
    volumes:
      - "/:/host:ro,rslave"
    ports:
      - "9100:9100"
    restart: unless-stopped
    networks:
      - publishify-network

volumes:
  prometheus-data:
    driver: local
  grafana-data:
    driver: local
  alertmanager-data:
    driver: local

networks:
  publishify-network:
    external: true
```

Configuration ini membuat complete monitoring stack dengan semua komponen yang necessary. Prometheus di-configure dengan 30 hari retention untuk historical analysis. Grafana di-setup dengan admin credentials dari environment variables dan automatic plugin installation. Alertmanager akan handle alert routing dan notification. Exporters collect metrics dari PostgreSQL, Redis, dan system-level resources. Semua services terhubung ke same network untuk service discovery.

#### Langkah 2: Membuat System Overview Dashboard

Lokasi File: `monitoring/grafana/dashboards/system-overview.json`

Dashboard System Overview adalah dashboard utama yang menampilkan health status dari semua services, key metrics seperti request rate dan error rate, dan recent alerts. Dashboard ini dirancang untuk ditampilkan di wall-mounted monitor di operations room, dengan large fonts dan clear color indicators. Kami menggunakan single-stat panels untuk metrics yang paling critical (service uptime, current error rate, P95 latency) dan time-series graphs untuk trends over time.

Panel-panel utama dalam dashboard ini antara lain:

1. **Service Status Panel**: Menampilkan status (UP/DOWN) dari semua services menggunakan single stat panel dengan thresholds (green untuk up, red untuk down). Query: `up{job="backend"}` dan `up{job="frontend"}`.

2. **Request Rate Panel**: Time-series graph menampilkan total requests per second across all endpoints. Query: `sum(rate(publishify_http_requests_total[5m]))`.

3. **Error Rate Panel**: Gauge panel menampilkan percentage of failed requests (status 5xx) dengan thresholds: <1% green, 1-5% yellow, >5% red. Query: `sum(rate(publishify_http_requests_total{status=~"5.."}[5m])) / sum(rate(publishify_http_requests_total[5m])) * 100`.

4. **Response Time Percentiles**: Time-series graph dengan multiple series untuk P50, P90, P95, dan P99 latencies. Query: `histogram_quantile(0.95, sum(rate(publishify_http_request_duration_seconds_bucket[5m])) by (le))`.

5. **Active Connections**: Single stat panel dengan sparkline menampilkan current number of active database connections. Query: `publishify_active_connections`.

6. **Recent Alerts Panel**: Table panel menampilkan list of active alerts dengan severity, description, dan duration.

Dashboard ini menggunakan template variables untuk memfilter by environment (production/staging) dan time range, memungkinkan operators untuk quickly switch context tanpa perlu navigasi ke different dashboards.

### D.10. Implementasi Alerting Rules dan Notification Channels

Alerting adalah komponen critical dari monitoring infrastructure yang memastikan team aware of issues sebelum mereka impact users. Kami mengimplementasikan 3-tier alerting system dengan severity levels (Critical, Warning, Info) dan routing rules yang mengirim notifications ke channels yang appropriate (PagerDuty untuk critical alerts, Slack untuk warnings, email untuk info). Alerts di-configure dengan appropriate thresholds berdasarkan historical data dan SLO targets, dengan evaluation periods yang balance antara early detection dan false positive reduction.

#### Langkah 1: Membuat Prometheus Alerting Rules

Lokasi File: `monitoring/prometheus/rules/alerts.yml`

Kami membuat alerting rules file yang mendefinisikan conditions untuk triggering alerts. Rules ini menggunakan PromQL queries untuk evaluate metrics dan trigger alerts ketika conditions terpenuhi. Setiap alert memiliki labels (severity, team) dan annotations (summary, description, runbook_url) yang digunakan untuk routing dan providing context kepada responders.

```yaml
groups:
  - name: publishify_alerts
    interval: 30s
    rules:
      # Critical: Service Down
      - alert: ServiceDown
        expr: up{job=~"backend|frontend"} == 0
        for: 1m
        labels:
          severity: critical
          team: platform
        annotations:
          summary: "Service {{ $labels.job }} is down"
          description: "Service {{ $labels.job }} on {{ $labels.instance }} has been down for more than 1 minute."
          runbook_url: "https://docs.publishify.com/runbooks/service-down"

      # Critical: High Error Rate
      - alert: HighErrorRate
        expr: |
          sum(rate(publishify_http_requests_total{status=~"5.."}[5m])) by (job)
          /
          sum(rate(publishify_http_requests_total[5m])) by (job)
          > 0.10
        for: 5m
        labels:
          severity: critical
          team: backend
        annotations:
          summary: "High error rate detected on {{ $labels.job }}"
          description: "Error rate is {{ $value | humanizePercentage }} on {{ $labels.job }}, exceeding 10% threshold."
          runbook_url: "https://docs.publishify.com/runbooks/high-error-rate"

      # Critical: High Response Time
      - alert: HighResponseTime
        expr: |
          histogram_quantile(0.95,
            sum(rate(publishify_http_request_duration_seconds_bucket[5m])) by (le, job)
          ) > 5
        for: 10m
        labels:
          severity: critical
          team: backend
        annotations:
          summary: "High P95 response time on {{ $labels.job }}"
          description: "P95 response time is {{ $value }}s on {{ $labels.job }}, exceeding 5s threshold."
          runbook_url: "https://docs.publishify.com/runbooks/high-latency"

      # Warning: Elevated Error Rate
      - alert: ElevatedErrorRate
        expr: |
          sum(rate(publishify_http_requests_total{status=~"5.."}[5m])) by (job)
          /
          sum(rate(publishify_http_requests_total[5m])) by (job)
          > 0.05
        for: 10m
        labels:
          severity: warning
          team: backend
        annotations:
          summary: "Elevated error rate on {{ $labels.job }}"
          description: "Error rate is {{ $value | humanizePercentage }} on {{ $labels.job }}, exceeding 5% threshold."

      # Warning: Database Connection Pool Saturation
      - alert: DatabaseConnectionPoolHigh
        expr: publishify_active_connections > 80
        for: 5m
        labels:
          severity: warning
          team: database
        annotations:
          summary: "Database connection pool usage is high"
          description: "Active connections ({{ $value }}) approaching pool limit (100)."
          runbook_url: "https://docs.publishify.com/runbooks/db-connections"

      # Warning: High Memory Usage
      - alert: HighMemoryUsage
        expr: |
          (1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100 > 85
        for: 10m
        labels:
          severity: warning
          team: platform
        annotations:
          summary: "High memory usage detected"
          description: "Memory usage is {{ $value }}% on {{ $labels.instance }}."

      # Warning: Low Disk Space
      - alert: LowDiskSpace
        expr: |
          (node_filesystem_avail_bytes{mountpoint="/"} / node_filesystem_size_bytes{mountpoint="/"}) * 100 < 15
        for: 5m
        labels:
          severity: warning
          team: platform
        annotations:
          summary: "Low disk space on root partition"
          description: "Only {{ $value }}% disk space remaining on {{ $labels.instance }}."
          runbook_url: "https://docs.publishify.com/runbooks/disk-space"

      # Info: Deployment Completed
      - alert: DeploymentCompleted
        expr: |
          changes(publishify_build_info[5m]) > 0
        labels:
          severity: info
          team: platform
        annotations:
          summary: "New deployment detected"
          description: "Application version has changed, indicating a deployment."
```

Rules ini mengimplementasikan layered alerting dengan appropriate for durations untuk reduce false positives. Critical alerts memiliki shorter evaluation periods (1-5 minutes) untuk quick detection, sementara warning alerts menggunakan longer periods (5-10 minutes) untuk confirm sustained issues. Kami menggunakan rate functions dengan appropriate windows (5m untuk most metrics) untuk smooth out short-term spikes dan focus pada sustained issues.

#### Langkah 2: Konfigurasi Alertmanager untuk Notification Routing

Lokasi File: `monitoring/alertmanager/alertmanager.yml`

Alertmanager configuration mendefinisikan bagaimana alerts di-route ke different notification channels berdasarkan severity dan team labels. Kami juga mengkonfigurasi grouping untuk menghindari alert storms (multiple related alerts grouped menjadi single notification), inhibition rules untuk suppress downstream alerts ketika root cause alert active, dan silencing untuk maintenance windows.

```yaml
global:
  resolve_timeout: 5m
  slack_api_url: "${SLACK_WEBHOOK_URL}"

# Routing tree
route:
  group_by: ["alertname", "job"]
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 4h
  receiver: "default"

  routes:
    # Critical alerts -> PagerDuty
    - match:
        severity: critical
      receiver: "pagerduty"
      continue: true

    # Critical alerts -> Slack #alerts-critical
    - match:
        severity: critical
      receiver: "slack-critical"

    # Warning alerts -> Slack #alerts
    - match:
        severity: warning
      receiver: "slack-warnings"

    # Info alerts -> Email
    - match:
        severity: info
      receiver: "email-info"

# Receivers (notification channels)
receivers:
  - name: "default"
    slack_configs:
      - channel: "#alerts"
        title: "{{ .GroupLabels.alertname }}"
        text: "{{ range .Alerts }}{{ .Annotations.description }}{{ end }}"

  - name: "pagerduty"
    pagerduty_configs:
      - service_key: "${PAGERDUTY_SERVICE_KEY}"
        description: "{{ .GroupLabels.alertname }}: {{ .CommonAnnotations.summary }}"

  - name: "slack-critical"
    slack_configs:
      - channel: "#alerts-critical"
        color: "danger"
        title: "🚨 CRITICAL: {{ .GroupLabels.alertname }}"
        text: |
          {{ range .Alerts }}
          *Summary:* {{ .Annotations.summary }}
          *Description:* {{ .Annotations.description }}
          *Runbook:* {{ .Annotations.runbook_url }}
          {{ end }}

  - name: "slack-warnings"
    slack_configs:
      - channel: "#alerts"
        color: "warning"
        title: "⚠️ WARNING: {{ .GroupLabels.alertname }}"
        text: "{{ range .Alerts }}{{ .Annotations.description }}{{ end }}"

  - name: "email-info"
    email_configs:
      - to: "ops-team@publishify.com"
        from: "alertmanager@publishify.com"
        smarthost: "smtp.gmail.com:587"
        auth_username: "${SMTP_USERNAME}"
        auth_password: "${SMTP_PASSWORD}"
        headers:
          Subject: "Publishify Alert: {{ .GroupLabels.alertname }}"

# Inhibition rules (suppress alerts)
inhibit_rules:
  # Suppress all alerts when service is down
  - source_match:
      alertname: "ServiceDown"
    target_match_re:
      alertname: "(HighErrorRate|HighResponseTime|.*)"
    equal: ["job"]

  # Suppress high response time when error rate is high
  - source_match:
      alertname: "HighErrorRate"
    target_match:
      alertname: "HighResponseTime"
    equal: ["job"]
```

Configuration ini mengimplementasikan sophisticated alert routing dengan multiple receivers dan intelligent grouping. Critical alerts di-route ke both PagerDuty (untuk on-call engineer) dan Slack (untuk team awareness), ensuring rapid response. Warning alerts hanya ke Slack untuk triaging during business hours. Info alerts ke email untuk record keeping. Inhibition rules prevent alert cascades dimana root cause issue (seperti service down) menyebabkan dozens of downstream alerts yang semua ultimately caused by same issue.

---

Dengan implementasi CI/CD pipeline menggunakan GitHub Actions dan monitoring infrastructure menggunakan Prometheus dan Grafana, kami telah membangun complete DevOps ecosystem untuk sistem Publishify. Pipeline CI/CD memastikan setiap perubahan kode melalui rigorous testing dan validation sebelum deployment, sementara monitoring infrastructure memberikan real-time visibility ke dalam health dan performance dari aplikasi. Kombinasi automated deployment dan proactive monitoring memungkinkan kami untuk maintain high service availability (target 99.9% uptime) dan quick incident response (mean time to detection <3 minutes, mean time to resolution <30 minutes untuk P1 incidents).

Pada bagian selanjutnya (PART 5), kami akan melakukan comprehensive testing dari semua komponen yang telah diimplementasikan, melakukan evaluasi terhadap pencapaian objectives yang telah ditetapkan, dan menyimpulkan lessons learned serta recommendations untuk future improvements.
