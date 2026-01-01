# LAPORAN DEVELOPMENT STEP BY STEP FASE 5

## PART 4: IMPLEMENTASI STEP-BY-STEP - ROW LEVEL SECURITY DAN TESTING INFRASTRUCTURE

**Tutorial**: Security Hardening dan Quality Assurance  
**Focus**: RLS Policies dan Automated Testing  
**Prerequisite**: PART 3 - Redis & Database Optimization  
**Versi Dokumen**: 1.0.0

---

## D. IMPLEMENTASI STEP-BY-STEP (Lanjutan)

### D.5 Implement Row Level Security (RLS)

Row Level Security provide additional security layer pada database level yang enforce access control independently dari application code. Tutorial ini akan guide step-by-step implementation untuk Publishify.

**Langkah 1: Create RLS Helper Functions**

Helper functions ini provide reusable logic untuk checking user roles dan ownership. Functions dibuat di `public` schema karena Supabase auth schema tidak accessible untuk custom functions.

**Lokasi File**: `backend/prisma/migrations/20250103_enable_rls/migration.sql` (Lines 1-130)

**Create Helper Function - Get Current User ID**:

```sql
CREATE OR REPLACE FUNCTION public.current_user_id()
RETURNS text AS $$
DECLARE
  user_id_text text;
BEGIN
  -- Try to get dari JWT claims (Supabase auth)
  -- Atau dari app context (our middleware injection)
  user_id_text := COALESCE(
    current_setting('request.jwt.claims', true)::json->>'sub',
    current_setting('app.current_user_id', true)
  );

  -- Return NULL jika empty string
  IF user_id_text IS NULL OR user_id_text = '' THEN
    RETURN NULL;
  ELSE
    RETURN user_id_text;
  END IF;
END;
$$ LANGUAGE plpgsql STABLE;
```

**Function Explained**:

- `STABLE`: Result consistent within single query, optimized by PostgreSQL
- `COALESCE`: Try JWT claims first, fallback ke app context
- `true` parameter: Return NULL instead of throwing error jika setting tidak exists

**Create Helper Function - Role Checking**:

```sql
-- Check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM peran_pengguna
    WHERE "idPengguna" = public.current_user_id()
      AND "jenisPeran" = 'admin'
      AND aktif = true
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Similar functions untuk is_editor(), is_penulis(), is_percetakan()
```

**Function Features**:

- `SECURITY DEFINER`: Function run dengan privileges dari creator (bypasses RLS on peran_pengguna table)
- `EXISTS`: Efficient untuk boolean checks, stops scanning after first match
- `aktif = true`: Only consider active role assignments

**Langkah 2: Enable RLS pada Tables**

Enable RLS untuk semua tables yang contain sensitive data:

```sql
-- Enable RLS untuk Core Tables
ALTER TABLE pengguna ENABLE ROW LEVEL SECURITY;
ALTER TABLE profil_pengguna ENABLE ROW LEVEL SECURITY;
ALTER TABLE profil_penulis ENABLE ROW LEVEL SECURITY;
ALTER TABLE peran_pengguna ENABLE ROW LEVEL SECURITY;

-- Enable RLS untuk Content Tables
ALTER TABLE naskah ENABLE ROW LEVEL SECURITY;
ALTER TABLE revisi_naskah ENABLE ROW LEVEL SECURITY;

-- Enable RLS untuk Review Tables
ALTER TABLE review_naskah ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_review ENABLE ROW LEVEL SECURITY;

-- Enable RLS untuk Printing Tables
ALTER TABLE pesanan_cetak ENABLE ROW LEVEL SECURITY;
ALTER TABLE log_produksi ENABLE ROW LEVEL SECURITY;

-- Dan seterusnya untuk semua 28 tables
```

**Important**: Setelah enable RLS tanpa policies, **NO ONE can access data** (default deny). Kami must create policies untuk grant access.

**Langkah 3: Create RLS Policies untuk Naskah**

Policies untuk table `naskah` demonstrate ownership-based dan status-based access control.

**Policy 1: Penulis Can Select Their Own Naskah**

```sql
CREATE POLICY "policy_naskah_penulis_select" ON naskah
FOR SELECT
USING (
  -- Owner can see their own
  "idPenulis" = public.current_user_id()
  OR
  -- Published public naskah visible to all
  (status = 'diterbitkan' AND publik = true)
  OR
  -- Admin can see all
  public.is_admin()
);
```

**Policy Logic**:

- Condition 1: User adalah owner (`idPenulis` matches current user)
- Condition 2: Naskah is published AND public (accessible to everyone)
- Condition 3: User is admin (full access)

**Policy 2: Penulis Can Insert Naskah**

```sql
CREATE POLICY "policy_naskah_penulis_insert" ON naskah
FOR INSERT
WITH CHECK (
  -- Only penulis atau admin can create naskah
  (public.is_penulis() OR public.is_admin())
  AND
  -- Must set themselves as owner
  "idPenulis" = public.current_user_id()
);
```

**Policy Logic**:

- `WITH CHECK`: Condition evaluated on data being inserted
- Ensure user has penulis role
- Prevent users dari creating naskah attributed to other users

**Policy 3: Penulis Can Update Own Naskah**

```sql
CREATE POLICY "policy_naskah_penulis_update" ON naskah
FOR UPDATE
USING (
  "idPenulis" = public.current_user_id()
  OR public.is_admin()
)
WITH CHECK (
  -- Cannot change ownership
  "idPenulis" = public.current_user_id()
  OR public.is_admin()
);
```

**Policy Logic**:

- `USING`: Determines which rows can be updated (existing row check)
- `WITH CHECK`: Determines what values can be set (new values check)
- Both required untuk UPDATE operations

**Policy 4: Only Admin Can Delete**

```sql
CREATE POLICY "policy_naskah_admin_delete" ON naskah
FOR DELETE
USING (
  public.is_admin()
);
```

Only admin can delete naskah, preventing accidental data loss.

**Langkah 4: Create RLS Policies untuk Review**

Review table requires relationship-based access - editor can access reviews assigned to them.

**Policy: Editor Access Assigned Reviews**

```sql
CREATE POLICY "policy_review_editor_select" ON review_naskah
FOR SELECT
USING (
  -- Editor can see reviews assigned to them
  "idEditor" = public.current_user_id()
  OR
  -- Penulis can see reviews for their naskah
  EXISTS (
    SELECT 1 FROM naskah
    WHERE naskah.id = review_naskah."idNaskah"
      AND naskah."idPenulis" = public.current_user_id()
  )
  OR
  -- Admin can see all
  public.is_admin()
);
```

**Policy Complexity**:

- Uses `EXISTS` subquery untuk check naskah ownership
- Three access patterns: editor assignment, naskah ownership, admin access
- Demonstrates relationship-based policies

**Langkah 5: Create RLS Policies untuk Pesanan**

Pesanan involve multiple parties - pemesan (penulis) dan percetakan.

```sql
CREATE POLICY "policy_pesanan_participants_select" ON pesanan_cetak
FOR SELECT
USING (
  -- Pemesan (penulis) can see their orders
  "idPemesan" = public.current_user_id()
  OR
  -- Percetakan can see orders assigned to them
  "idPercetakan" = public.current_user_id()
  OR
  -- Admin can see all
  public.is_admin()
);
```

**Multi-party Access**: Both pemesan dan percetakan dapat access same pesanan record based on their respective roles.

**Langkah 6: Run RLS Migration**

```bash
# Create migration
bunx prisma migrate dev --name enable_rls

# This will:
# 1. Create helper functions
# 2. Enable RLS on tables
# 3. Create all policies
# 4. Grant necessary permissions
```

**Langkah 7: Create RLS Middleware**

Middleware inject user context dari JWT ke PostgreSQL session.

**Lokasi File**: `backend/src/common/middlewares/prisma-rls.middleware.ts` (75 lines)

```typescript
import { Injectable, NestMiddleware, Logger } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { PrismaService } from "@/prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class PrismaRlsMiddleware implements NestMiddleware {
  private readonly logger = new Logger(PrismaRlsMiddleware.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // Extract token dari Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      // No token, proceed tanpa setting context
      return next();
    }

    try {
      const token = authHeader.substring(7); // Remove 'Bearer '
      const payload = this.jwtService.verify(token);

      // Extract user ID dari JWT payload
      const userId = payload.sub;

      if (userId) {
        // Set PostgreSQL session variable
        // Ini akan di-access oleh current_user_id() function
        await this.prisma.$executeRaw`
          SET LOCAL app.current_user_id = ${userId};
        `;

        this.logger.debug(`RLS context set untuk user: ${userId}`);
      }
    } catch (error) {
      // Token invalid atau expired, log dan proceed
      this.logger.warn("Failed to verify JWT token:", error.message);
    }

    next();
  }
}
```

**Middleware Features**:

- Extract JWT dari Authorization header
- Verify token signature dan expiration
- Set `app.current_user_id` session variable
- `SET LOCAL` ensures variable scoped ke current transaction only
- Error handling tidak block request (graceful degradation)

**Langkah 8: Register Middleware**

**Lokasi File**: `backend/src/app.module.ts`

```typescript
import { Module, MiddlewareConsumer, NestModule } from "@nestjs/common";
import { PrismaRlsMiddleware } from "./common/middlewares/prisma-rls.middleware";

@Module({
  // ... imports
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(PrismaRlsMiddleware).forRoutes("*"); // Apply ke semua routes
  }
}
```

**Langkah 9: Test RLS Policies**

Create test script untuk verify policies work correctly.

**Lokasi File**: `backend/test/rls-test.ts`

```typescript
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testRlsPolicies() {
  // Test 1: Set user context
  await prisma.$executeRaw`
    SET LOCAL app.current_user_id = 'test-user-123';
  `;

  // Test 2: Try to access naskah
  const naskah = await prisma.naskah.findMany();
  console.log("Naskah visible:", naskah.length);
  // Should only return naskah owned by test-user-123

  // Test 3: Try to access other user's naskah
  const otherNaskah = await prisma.naskah.findFirst({
    where: { idPenulis: "other-user-456" },
  });
  console.log("Other user naskah:", otherNaskah);
  // Should return null (blocked by RLS)

  // Test 4: Public published naskah
  const publicNaskah = await prisma.naskah.findMany({
    where: { status: "diterbitkan", publik: true },
  });
  console.log("Public naskah:", publicNaskah.length);
  // Should return public naskah regardless of owner
}

testRlsPolicies();
```

### D.6 Setup Testing Infrastructure

**Langkah 1: Install Testing Dependencies**

```bash
# Testing frameworks
bun add -D jest @nestjs/testing ts-jest

# Test utilities
bun add -D @types/jest supertest @types/supertest

# Database mocking
bun add -D jest-mock-extended

# Cypress untuk E2E
bun add -D cypress @testing-library/cypress
```

**Langkah 2: Configure Jest**

**Lokasi File**: `backend/jest.config.ts`

```typescript
import type { Config } from "jest";

const config: Config = {
  moduleFileExtensions: ["js", "json", "ts"],
  rootDir: ".",
  testRegex: ".*\\.spec\\.ts$",
  transform: {
    "^.+\\.(t|j)s$": "ts-jest",
  },
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.module.ts",
    "!src/main.ts",
    "!src/**/*.interface.ts",
    "!src/**/*.dto.ts",
  ],
  coverageDirectory: "./coverage",
  testEnvironment: "node",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};

export default config;
```

**Configuration Explained**:

- `testRegex`: Run files ending dengan `.spec.ts`
- `collectCoverageFrom`: Include semua source files kecuali modules, main, interfaces, DTOs
- `coverageThreshold`: Fail tests jika coverage di bawah 80%
- `moduleNameMapper`: Support `@/` alias untuk imports

**Langkah 3: Create Test Helpers**

**Helper 1: Database Utilities**

**Lokasi File**: `backend/test/helpers/database.helper.ts`

```typescript
import { PrismaClient } from "@prisma/client";

export class DatabaseHelper {
  private prisma = new PrismaClient();

  /**
   * Clean database - delete all test data
   */
  async cleanup() {
    const models = [
      "pesananCetak",
      "reviewNaskah",
      "naskah",
      "profilPenulis",
      "peranPengguna",
      "profilPengguna",
      "pengguna",
    ];

    for (const model of models) {
      await this.prisma[model].deleteMany({});
    }
  }

  /**
   * Seed basic test data
   */
  async seed() {
    // Create test users, naskah, etc.
    const user = await this.prisma.pengguna.create({
      data: {
        email: "test@example.com",
        kataSandi: "hashed_password",
      },
    });

    return { user };
  }

  async disconnect() {
    await this.prisma.$disconnect();
  }
}
```

**Helper 2: Data Factories**

**Lokasi File**: `backend/test/helpers/factories.helper.ts`

```typescript
import { faker } from "@faker-js/faker";

export class Factories {
  static createPengguna(override = {}) {
    return {
      email: faker.internet.email(),
      kataSandi: faker.internet.password(),
      ...override,
    };
  }

  static createNaskah(idPenulis: string, override = {}) {
    return {
      judul: faker.lorem.sentence(),
      sinopsis: faker.lorem.paragraphs(3),
      idPenulis,
      status: "draft",
      ...override,
    };
  }

  // More factories untuk other models
}
```

**Langkah 4: Write Unit Tests**

**Lokasi File**: `backend/test/unit/auth.service.spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '@/modules/auth/auth.service';
import { PrismaService } from '@/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: DeepMockProxy<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>(),
        },
        {
          provide: JwtService,
          useValue: mockDeep<JwtService>(),
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get(PrismaService);
  });

  describe('register', () => {
    it('harus berhasil register user baru', async () => {
      // Arrange
      const registerDto = {
        email: 'test@example.com',
        kataSandi: 'password123',
      };

      prisma.pengguna.create.mockResolvedValue({
        id: '123',
        email: registerDto.email,
        kataSandi: 'hashed',
        ...
      });

      // Act
      const result = await service.register(registerDto);

      // Assert
      expect(result.sukses).toBe(true);
      expect(result.data.email).toBe(registerDto.email);
      expect(prisma.pengguna.create).toHaveBeenCalledTimes(1);
    });

    it('harus throw error jika email sudah terdaftar', async () => {
      // Arrange
      prisma.pengguna.findUnique.mockResolvedValue({
        id: '123',
        email: 'existing@example.com',
        ...
      });

      // Act & Assert
      await expect(
        service.register({
          email: 'existing@example.com',
          kataSandi: 'password',
        }),
      ).rejects.toThrow('Email sudah terdaftar');
    });
  });
});
```

**Test Pattern**:

- **Arrange**: Setup test data dan mocks
- **Act**: Execute function being tested
- **Assert**: Verify expected results

**Langkah 5: Write Integration Tests**

**Lokasi File**: `backend/test/integration/naskah.spec.ts`

```typescript
import { Test } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "@/app.module";
import { DatabaseHelper } from "../helpers/database.helper";

describe("Naskah API (Integration)", () => {
  let app: INestApplication;
  let dbHelper: DatabaseHelper;
  let authToken: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    dbHelper = new DatabaseHelper();
    await dbHelper.cleanup();
    const { user } = await dbHelper.seed();

    // Login untuk get auth token
    const loginRes = await request(app.getHttpServer())
      .post("/auth/login")
      .send({ email: user.email, kataSandi: "password" });

    authToken = loginRes.body.data.accessToken;
  });

  afterAll(async () => {
    await dbHelper.cleanup();
    await app.close();
  });

  describe("POST /naskah", () => {
    it("harus berhasil create naskah dengan auth", async () => {
      const response = await request(app.getHttpServer())
        .post("/naskah")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          judul: "Test Naskah",
          sinopsis: "Test sinopsis yang panjang...",
          idKategori: "kategori-id",
          idGenre: "genre-id",
        })
        .expect(201);

      expect(response.body.sukses).toBe(true);
      expect(response.body.data.judul).toBe("Test Naskah");
    });

    it("harus gagal tanpa auth token", async () => {
      await request(app.getHttpServer())
        .post("/naskah")
        .send({ judul: "Test" })
        .expect(401);
    });
  });
});
```

**Langkah 6: Run Tests**

```bash
# Run all tests
bun test

# Run dengan coverage
bun test --coverage

# Run specific test file
bun test auth.service.spec.ts

# Watch mode untuk development
bun test --watch
```

**Lokasi File Code Lengkap**:

- RLS Migration: `backend/prisma/migrations/20250103_enable_rls/migration.sql` (918 lines)
- RLS Middleware: `backend/src/common/middlewares/prisma-rls.middleware.ts` (75 lines)
- Jest Config: `backend/jest.config.ts`
- Database Helper: `backend/test/helpers/database.helper.ts`
- Factories: `backend/test/helpers/factories.helper.ts`
- Auth Service Tests: `backend/test/unit/auth.service.spec.ts`
- Integration Tests: `backend/test/integration/naskah.spec.ts`
- Test Documentation: `backend/test/TESTING_MILESTONE_1.md`

Tutorial section berikutnya akan cover pengujian sistem, evaluasi, dan kesimpulan dari implementasi Fase 5.
