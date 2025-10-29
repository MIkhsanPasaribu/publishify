# 📘 Testing Guide - Backend Publishify

**Version:** 1.0  
**Last Updated:** 29 Oktober 2025

---

## 🎯 Overview

Dokumen ini berisi panduan lengkap untuk menjalankan testing pada backend Publishify, termasuk setup environment, menjalankan test, dan interpretasi hasil.

---

## 📋 Table of Contents

1. [Setup Testing Environment](#setup-testing-environment)
2. [Running Tests](#running-tests)
3. [Test Structure](#test-structure)
4. [Writing Tests](#writing-tests)
5. [Test Coverage](#test-coverage)
6. [Troubleshooting](#troubleshooting)

---

## 🛠️ Setup Testing Environment

### 1. Prerequisites

```bash
# Pastikan dependencies sudah terinstall
bun install

# Setup test database (buat database terpisah untuk testing)
createdb publishify_test

# Atau via psql
psql -U postgres
CREATE DATABASE publishify_test;
\q
```

### 2. Environment Variables

Buat file `.env.test` untuk testing:

```env
# Test Database
TEST_DATABASE_URL="postgresql://postgres:postgres@localhost:5432/publishify_test"

# JWT Secrets (gunakan nilai berbeda untuk testing)
JWT_SECRET="test-jwt-secret-key-for-testing"
JWT_EXPIRES_IN="1h"
JWT_REFRESH_SECRET="test-refresh-secret-for-testing"
JWT_REFRESH_EXPIRES_IN="7d"

# Redis (optional, bisa mock)
REDIS_HOST="localhost"
REDIS_PORT=6379

# Supabase (optional, bisa mock)
SUPABASE_URL="https://test.supabase.co"
SUPABASE_KEY="test-key"

# Environment
NODE_ENV="test"
```

### 3. Run Migrations on Test Database

```bash
# Set test database URL
export DATABASE_URL=$TEST_DATABASE_URL

# Run migrations
bun prisma migrate deploy

# Optional: Seed test data
bun prisma db seed
```

### 4. Configure Jest

File `jest.config.ts` sudah dikonfigurasi:

```typescript
// Highlights:
- Module aliases (@/, @test/)
- Coverage thresholds (70%)
- Test timeout (30s)
- Setup file loaded before tests
```

---

## 🚀 Running Tests

### Basic Commands

```bash
# Run all tests
bun test

# Run specific test file
bun test auth.service.spec

# Run tests in watch mode
bun test --watch

# Run tests with coverage
bun test --coverage

# Run tests verbose
bun test --verbose

# Run only unit tests
bun test test/unit

# Run only integration tests
bun test test/integration

# Run only E2E tests
bun test --config test/jest-e2e.config.ts
```

### Run Specific Test Suite

```bash
# Run specific describe block
bun test -t "AuthService"

# Run specific test case
bun test -t "should successfully login"

# Run tests matching pattern
bun test --testNamePattern="login"
```

### Advanced Options

```bash
# Run tests in parallel (faster)
bun test --maxWorkers=4

# Run tests serially (for E2E)
bun test --runInBand

# Update snapshots
bun test -u

# Clear cache
bun test --clearCache

# Show test timing
bun test --verbose --testLocationInResults
```

---

## 📁 Test Structure

```
test/
├── setup.ts                      # Global test setup
├── jest-e2e.config.ts           # E2E Jest config
├── helpers/                      # Test utilities
│   ├── database.helper.ts       # DB setup/cleanup
│   └── factories.helper.ts      # Test data factories
├── unit/                         # Unit tests
│   ├── auth.service.spec.ts
│   ├── pengguna.service.spec.ts
│   ├── naskah.service.spec.ts
│   └── ... (one file per service)
├── integration/                  # Integration tests
│   ├── auth.controller.spec.ts
│   ├── pengguna.controller.spec.ts
│   └── ... (API endpoint tests)
└── e2e/                          # E2E tests
    ├── manuscript-flow.e2e-spec.ts
    ├── payment-flow.e2e-spec.ts
    └── ... (user journey tests)
```

---

## ✍️ Writing Tests

### Unit Test Example

```typescript
import { Test, TestingModule } from "@nestjs/testing";
import { NaskahService } from "@/modules/naskah/naskah.service";
import { PrismaService } from "@/prisma/prisma.service";

describe("NaskahService", () => {
  let service: NaskahService;
  let prismaService: PrismaService;

  // Mock dependencies
  const mockPrismaService = {
    naskah: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NaskahService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<NaskahService>(NaskahService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe("buatNaskah", () => {
    it("should create new naskah successfully", async () => {
      const mockNaskah = {
        id: "naskah-123",
        judul: "Test Naskah",
        status: "draft",
      };

      mockPrismaService.naskah.create.mockResolvedValue(mockNaskah);

      const result = await service.buatNaskah("user-id", {
        judul: "Test Naskah",
        sinopsis: "Test sinopsis minimal 50 karakter untuk validasi",
        idKategori: "kategori-id",
        idGenre: "genre-id",
      });

      expect(result.sukses).toBe(true);
      expect(result.data.judul).toBe("Test Naskah");
      expect(mockPrismaService.naskah.create).toHaveBeenCalled();
    });
  });
});
```

### Integration Test Example

```typescript
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "@/app.module";
import { cleanTestDatabase, seedTestData } from "@test/helpers/database.helper";

describe("NaskahController (Integration)", () => {
  let app: INestApplication;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Login to get token
    const loginResponse = await request(app.getHttpServer())
      .post("/api/auth/login")
      .send({
        email: "penulis@publishify.com",
        kataSandi: "Password123!",
      });

    accessToken = loginResponse.body.data.accessToken;
  });

  afterAll(async () => {
    await cleanTestDatabase();
    await app.close();
  });

  describe("POST /api/naskah", () => {
    it("should create new naskah", async () => {
      const response = await request(app.getHttpServer())
        .post("/api/naskah")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          judul: "Integration Test Naskah",
          sinopsis: "Sinopsis test minimal 50 karakter untuk validasi",
          idKategori: "valid-kategori-id",
          idGenre: "valid-genre-id",
        });

      expect(response.status).toBe(201);
      expect(response.body.sukses).toBe(true);
      expect(response.body.data.judul).toBe("Integration Test Naskah");
    });

    it("should return 401 without token", async () => {
      const response = await request(app.getHttpServer())
        .post("/api/naskah")
        .send({
          judul: "Test",
          sinopsis: "Test sinopsis",
        });

      expect(response.status).toBe(401);
    });
  });
});
```

### E2E Test Example

```typescript
describe("Manuscript Submission Flow (E2E)", () => {
  let app: INestApplication;
  let penulisToken: string;
  let naskahId: string;

  beforeAll(async () => {
    // Setup app
    // Seed test data
  });

  it("1. Penulis register dan login", async () => {
    const response = await request(app.getHttpServer())
      .post("/api/auth/daftar")
      .send({
        email: "penulis-e2e@test.com",
        kataSandi: "Test@123",
        namaDepan: "Penulis",
        namaBelakang: "E2E",
        peran: "penulis",
      });

    expect(response.status).toBe(201);
    penulisToken = response.body.data.accessToken;
  });

  it("2. Penulis membuat naskah", async () => {
    const response = await request(app.getHttpServer())
      .post("/api/naskah")
      .set("Authorization", `Bearer ${penulisToken}`)
      .send({
        judul: "E2E Test Naskah",
        sinopsis: "Sinopsis lengkap",
        idKategori: "kategori-id",
        idGenre: "genre-id",
      });

    expect(response.status).toBe(201);
    naskahId = response.body.data.id;
  });

  it("3. Penulis submit naskah untuk review", async () => {
    const response = await request(app.getHttpServer())
      .post(`/api/naskah/${naskahId}/ajukan`)
      .set("Authorization", `Bearer ${penulisToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data.status).toBe("diajukan");
  });
});
```

---

## 📊 Test Coverage

### View Coverage Report

```bash
# Generate coverage
bun test --coverage

# Coverage akan tersimpan di folder coverage/
# Buka coverage/lcov-report/index.html di browser untuk melihat detail
```

### Coverage Thresholds

Minimum coverage yang harus dipenuhi (dikonfigurasi di `jest.config.ts`):

```typescript
coverageThreshold: {
  global: {
    branches: 70,
    functions: 70,
    lines: 70,
    statements: 70,
  },
}
```

### Current Coverage Status

```
Target Coverage Goals:
├── Unit Tests: 70%+ per module
├── Integration Tests: 80%+ API endpoints
├── E2E Tests: 90%+ critical flows
└── Overall: 85%+ total coverage
```

---

## 🐛 Troubleshooting

### Issue 1: Module Path Aliases Not Working

**Error:**

```
Cannot find module '@/modules/...' or its corresponding type declarations
```

**Solution:**

```bash
# Pastikan tsconfig.json include test files
# Check jest.config.ts moduleNameMapper
# Restart TypeScript server di VS Code
```

### Issue 2: Test Database Connection Error

**Error:**

```
Can't reach database server at localhost:5432
```

**Solution:**

```bash
# Check PostgreSQL running
sudo service postgresql status

# Check test database exists
psql -U postgres -c "\l"

# Recreate test database
dropdb publishify_test
createdb publishify_test
bun prisma migrate deploy
```

### Issue 3: Tests Hanging/Timeout

**Error:**

```
Timeout - Async callback was not invoked within the 30000 ms timeout
```

**Solution:**

```typescript
// Increase timeout di test individual
it("slow test", async () => {
  // ...
}, 60000); // 60 seconds

// Atau global di jest.config.ts
testTimeout: 60000;
```

### Issue 4: Mock Not Working

**Problem:** Mock function tidak terpanggil

**Solution:**

```typescript
// Reset mocks sebelum setiap test
beforeEach(() => {
  jest.clearAllMocks();
});

// Check if mock dipanggil
expect(mockFunction).toHaveBeenCalled();
expect(mockFunction).toHaveBeenCalledWith(expectedArgs);

// Debug mock calls
console.log(mockFunction.mock.calls);
```

### Issue 5: Prisma Transaction Mock

**Problem:** Error saat mock `$transaction`

**Solution:**

```typescript
mockPrismaService.$transaction.mockImplementation(async (callback) => {
  // Setup mocks yang diperlukan transaction
  mockPrismaService.pengguna.create.mockResolvedValue(mockData);

  // Call callback dengan prisma mock
  return callback(mockPrismaService);
});
```

---

## 📈 Test Performance

### Optimize Test Speed

```bash
# Run tests in parallel
bun test --maxWorkers=50%

# Skip slow tests during development
bun test --testPathIgnorePatterns=e2e

# Use watch mode untuk instant feedback
bun test --watch --onlyChanged
```

### Database Performance

```typescript
// Use in-memory SQLite untuk unit tests (faster)
// Use Docker PostgreSQL untuk integration/E2E

// Clean database efficiently
await prisma.$executeRawUnsafe("TRUNCATE TABLE ... CASCADE");

// Use transactions untuk rollback after test
await prisma.$transaction(async (tx) => {
  // Test code here
  throw new Error(); // Rollback
});
```

---

## 🎯 Best Practices

### DO ✅

- Write descriptive test names
- Use `beforeEach` untuk setup
- Mock external dependencies
- Test error cases
- Use factories untuk test data
- Clean up after tests
- Check edge cases

### DON'T ❌

- Test implementation details
- Use real external APIs
- Share state between tests
- Skip error handling tests
- Use production database
- Hardcode test data
- Ignore flaky tests

---

## 📚 Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [NestJS Testing Guide](https://docs.nestjs.com/fundamentals/testing)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://testingjavascript.com/)

---

## 🔄 Continuous Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: publishify_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v3

      - uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest

      - run: bun install

      - run: bun prisma migrate deploy
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/publishify_test

      - run: bun test --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

---

**Last Updated:** 29 Oktober 2025  
**Next:** Start writing unit tests untuk semua modules
