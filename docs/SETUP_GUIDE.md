# 🚀 Publishify Backend - Setup & Testing Guide

**Status**: Development Phase  
**Last Updated**: 2025-11-03  
**Database**: Supabase PostgreSQL  
**Runtime**: Bun v1.3.1  
**Framework**: NestJS 10.3.0  

---

## 📋 Prerequisites

- **Bun**: v1.0+ installed ([https://bun.sh](https://bun.sh))
- **Supabase Account**: Free tier sufficient untuk development
- **Node.js**: v18+ (untuk compatibility)
- **Git**: Latest version

---

## 🔧 Step 1: Clone & Install Dependencies

```bash
# Clone repository
git clone <repository-url>
cd publishify/backend

# Install dependencies dengan Bun (super fast!)
bun install

# Verify installation
bun --version
```

**Expected Output**:
```
bun install v1.3.1 (89fa0f34)
✓ Installed 127 packages [2.34s]
```

---

## 🗄️ Step 2: Setup Supabase Database

### 2.1. Get Supabase Credentials

1. **Login ke Supabase**: [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. **Buat Project Baru** (atau gunakan existing):
   - Project Name: `publishify` (atau nama lain)
   - Database Password: **SIMPAN PASSWORD INI!**
   - Region: `Southeast Asia (Singapore)` (aws-1-ap-southeast-1)

3. **Get Connection Strings**:
   - Go to: `Project Settings > Database`
   - Copy **Connection String** (Pooling mode - Port 6543)
   - Copy **Direct Connection String** (Port 5432)

### 2.2. Create `.env` File

```bash
# Copy example file
cp .env.example .env

# Edit .env file
# Ganti [YOUR-PASSWORD] dengan password Supabase Anda
```

**Contoh `.env` Configuration**:
```env
# Environment
NODE_ENV=development
PORT=4000
FRONTEND_URL=http://localhost:3000

# Database (PostgreSQL dengan Supabase)
# PENTING: Ganti [YOUR-PASSWORD] dengan password Supabase!
DATABASE_URL=
DIRECT_URL=

# JWT Secrets (CHANGE IN PRODUCTION!)
JWT_SECRET=dev-secret-key-change-in-production-min-32-chars
JWT_REFRESH_SECRET=dev-refresh-secret-change-in-production-min-32-chars
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Redis (optional untuk development)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Email (optional untuk development)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@publishify.com

# Supabase Storage
SUPABASE_URL=https://tfjdkjkznpimcduaisrf.supabase.co
SUPABASE_KEY=your-supabase-anon-key
SUPABASE_STORAGE_BUCKET=publishify-files

# Rate Limiting
THROTTLE_TTL=60000
THROTTLE_LIMIT=100
```

### 2.3. Generate Prisma Client

```bash
# Generate Prisma Client dari schema
bun prisma generate
```

**Expected Output**:
```
✔ Generated Prisma Client (5.8.0) to ./node_modules/@prisma/client
```

### 2.4. Push Schema ke Supabase

```bash
# Push database schema ke Supabase (tanpa migration files)
bun prisma db push
```

**Expected Output**:
```
🚀 Your database is now in sync with your Prisma schema.
✔ Generated Prisma Client (5.8.0) to ./node_modules/@prisma/client
```

**Verify di Supabase**:
1. Go to: `Table Editor` di Supabase Dashboard
2. Check tables: `pengguna`, `profil_pengguna`, `naskah`, `kategori`, dll (38 tables total)

### 2.5. Seed Database (Optional)

```bash
# Seed kategori & genre
bun prisma db seed
```

**Seeded Data**:
- 3 Kategori: Fiksi, Non-Fiksi, Referensi
- 14 Genre: Fantasi, Romance, Thriller, Biografi, dll

### 2.6. Open Prisma Studio (Optional)

```bash
# Launch Prisma Studio (GUI untuk database)
bun prisma studio
```

**Opens**: http://localhost:5555  
**Use Case**: View/edit data secara visual

---

## 🏗️ Step 3: Build & Run Application

### 3.1. Development Mode

```bash
# Start development server dengan hot-reload
bun run start:dev
```

**Expected Output**:
```
[Nest] 12345  - 2025-11-03 10:30:45     LOG [NestFactory] Starting Nest application...
[Nest] 12345  - 2025-11-03 10:30:45     LOG [InstanceLoader] AppModule dependencies initialized
[Nest] 12345  - 2025-11-03 10:30:45     LOG [RoutesResolver] AuthController {/api/auth}:
[Nest] 12345  - 2025-11-03 10:30:45     LOG [RouterExplorer] Mapped {/api/auth/register, POST} route
[Nest] 12345  - 2025-11-03 10:30:46     LOG [NestApplication] Nest application successfully started
🚀 Server running on: http://localhost:4000
📚 API Documentation: http://localhost:4000/api
```

### 3.2. Production Build

```bash
# Build aplikasi
bun run build

# Run production build
bun run start:prod
```

### 3.3. Test API Endpoints

**Swagger UI**: http://localhost:4000/api

**Test dengan curl**:
```bash
# Health check
curl http://localhost:4000/health

# Register user
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "kataSandi": "SecurePass123!",
    "konfirmasiKataSandi": "SecurePass123!",
    "jenisPeran": "penulis"
  }'
```

---

## 🧪 Step 4: Running Tests

### 4.1. Unit Tests

```bash
# Run all unit tests
bun test

# Run specific test file
bun test test/unit/auth.service.spec.ts

# Watch mode (re-run on file changes)
bun test --watch

# Run with specific pattern
bun test -t "should successfully login"
```

**Current Status**:
- ✅ AuthService: 16/16 tests PASS (100%)
- ⏳ PenggunaService: 0/12 tests (todo)
- ⏳ NaskahService: 0/15 tests (todo)
- ⏳ ReviewService: 0/15 tests (todo)
- ⏳ UploadService: 0/14 tests (todo)
- ⏳ PercetakanService: 0/16 tests (todo)
- ⏳ PembayaranService: 0/14 tests (todo)
- ⏳ NotifikasiService: 0/14 tests (todo)

### 4.2. Test Coverage

```bash
# Generate coverage report
bun test --coverage

# Coverage akan generate di: coverage/lcov-report/index.html
# Open in browser untuk detailed report
```

**Target Coverage**:
- **Lines**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Statements**: > 80%

### 4.3. Integration Tests (Coming Soon)

```bash
# Run integration tests
bun test:integration

# Specific module
bun test test/integration/auth.controller.spec.ts
```

### 4.4. E2E Tests (Coming Soon)

```bash
# Run E2E tests
bun test:e2e

# Specific flow
bun test test/e2e/user-registration.e2e-spec.ts
```

---

## 📚 Step 5: Understanding Test Structure

### 5.1. Test File Locations

```
test/
├── setup.ts                    # Global test configuration
├── helpers/
│   ├── database.helper.ts     # DB utilities (clean, seed, create)
│   └── factories.helper.ts    # Data generators
├── unit/
│   ├── auth.service.spec.ts   # ✅ 16/16 PASS
│   └── pengguna.service.spec.ts  # TODO
├── integration/
│   ├── setup.ts               # Integration test setup
│   └── auth.controller.spec.ts   # TODO
└── e2e/
    └── user-registration.e2e-spec.ts  # TODO
```

### 5.2. Writing Tests - Proven Pattern

**Example Structure** (from auth.service.spec.ts):

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '@/modules/auth/auth.service';
import { PrismaService } from '@/prisma/prisma.service';

describe('AuthService', () => {
  let service: AuthService;
  let mockPrismaService: any;

  beforeEach(async () => {
    // 1. Create comprehensive mocks
    mockPrismaService = {
      pengguna: { 
        create: jest.fn(), 
        findUnique: jest.fn(),
        update: jest.fn() 
      },
      // ... other models
    };

    // 2. Setup test module
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  // 3. Test each method: success + error cases
  describe('daftar', () => {
    it('should successfully register new user', async () => {
      // Arrange
      mockPrismaService.pengguna.findUnique.mockResolvedValue(null);
      mockPrismaService.$transaction.mockImplementation(cb => cb(mockPrismaService));

      // Act
      const result = await service.daftar(mockDto);

      // Assert
      expect(result.sukses).toBe(true);
      expect(mockPrismaService.pengguna.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if email exists', async () => {
      mockPrismaService.pengguna.findUnique.mockResolvedValue({ id: '123' });

      await expect(service.daftar(mockDto)).rejects.toThrow(ConflictException);
    });
  });
});
```

### 5.3. Test Helpers Usage

```typescript
import { 
  generateTestEmail, 
  createUserFactory,
  cleanDatabase,
  seedTestData 
} from '@test/helpers';

// Generate test data
const email = generateTestEmail(); // user_1730628045123@test.com
const user = createUserFactory({ email }); // Complete user object

// Database utilities (for integration tests)
beforeEach(async () => {
  await cleanDatabase(); // Clean all tables
  await seedTestData();  // Seed kategori & genre
});
```

---

## 🔍 Step 6: Development Workflow

### 6.1. Daily Development

```bash
# 1. Pull latest changes
git pull origin main

# 2. Install new dependencies (if any)
bun install

# 3. Generate Prisma Client (if schema changed)
bun prisma generate

# 4. Start dev server
bun run start:dev

# 5. Run tests in watch mode (separate terminal)
bun test --watch
```

### 6.2. Before Commit

```bash
# 1. Run linter
bun run lint

# 2. Format code
bun run format

# 3. Run all tests
bun test

# 4. Check build
bun run build

# 5. Commit if all pass
git add .
git commit -m "feat: add feature X"
git push
```

### 6.3. Creating New Service Tests

**Follow AuthService pattern**:

1. **Create test file**: `test/unit/service-name.service.spec.ts`
2. **Import service & dependencies**: PrismaService, ConfigService, dll
3. **Create mocks**: Mock all external dependencies
4. **Setup beforeEach**: Initialize module, get service, clear mocks
5. **Write tests**: For each method - success case + all error cases
6. **Run tests**: `bun test test/unit/service-name.service.spec.ts`

**Checklist**:
- [ ] All methods tested
- [ ] Success cases covered
- [ ] All error cases covered
- [ ] Edge cases tested
- [ ] Mocks properly configured
- [ ] Tests isolated (no dependencies between tests)
- [ ] Clear test descriptions (Bahasa Indonesia)

---

## 📊 Step 7: Monitoring Progress

### 7.1. Check Test Status

```bash
# Run all tests with summary
bun test --verbose

# Check coverage
bun test --coverage

# View coverage report
open coverage/lcov-report/index.html
```

### 7.2. Current TODO Progress

**Completed** ✅:
- AuthService Unit Tests (16/16)
- TSConfig Strict Mode
- Supabase Schema Setup

**In Progress** 🔄:
- Supabase Database Connection (needs password)

**Next Up** 📋:
- Database Migration
- Fix Strict Mode Type Errors
- PenggunaService Unit Tests

**See**: `backend/test/TESTING_MILESTONE_1.md` untuk detailed status

---

## 🐛 Troubleshooting

### Issue 1: Prisma Generate Failed

**Error**: `Error: Generator "client" failed`

**Solution**:
```bash
# Clean node_modules
rm -rf node_modules
bun install

# Regenerate
bun prisma generate
```

### Issue 2: Database Connection Failed

**Error**: `Can't reach database server at aws-1-ap-southeast-1.pooler.supabase.com`

**Check**:
1. ✅ Password correct di `.env`?
2. ✅ Supabase project running?
3. ✅ Internet connection OK?
4. ✅ Firewall blocking port 5432/6543?

**Solution**:
```bash
# Test connection
bun prisma studio

# Check .env
cat .env | grep DATABASE_URL
```

### Issue 3: Tests Failing

**Error**: `Cannot find module '@/modules/...'`

**Solution**:
```bash
# Check jest.config.ts path mapping
# Ensure moduleNameMapper matches tsconfig paths
```

### Issue 4: Port Already in Use

**Error**: `Error: listen EADDRINUSE: address already in use :::4000`

**Solution**:
```bash
# Windows (PowerShell)
Get-Process -Id (Get-NetTCPConnection -LocalPort 4000).OwningProcess | Stop-Process

# Or change port in .env
PORT=4001
```

---

## 📈 Next Steps

### Immediate (This Week)

1. **Setup Supabase** ⚡
   - [ ] Get password dari user
   - [ ] Create `.env` file
   - [ ] Run `bun prisma db push`
   - [ ] Verify connection

2. **Fix Type Errors** 🔧
   - [ ] Run `bun run build`
   - [ ] Fix strict mode errors
   - [ ] Update nullable checks

3. **PenggunaService Tests** 🧪
   - [ ] Create test file (12 tests)
   - [ ] Follow AuthService pattern
   - [ ] Achieve 100% pass rate

### Short Term (Next 2 Weeks)

- Complete all 7 service unit tests (99 tests total)
- Setup integration test infrastructure
- Write integration tests untuk Auth & Pengguna modules

### Medium Term (Next Month)

- Complete all integration tests (132 tests)
- Setup E2E test infrastructure
- Write E2E tests untuk critical flows (21 scenarios)
- Enhance Swagger documentation

### Long Term (Next 2 Months)

- Redis caching implementation
- Database query optimization
- Security hardening
- CI/CD pipeline setup
- Production deployment

---

## 📞 Support & Resources

**Documentation**:
- Testing Guide: `docs/testing-guide.md`
- Milestone Report: `test/TESTING_MILESTONE_1.md`
- Copilot Instructions: `.github/copilot-instructions.md`

**External Resources**:
- NestJS Docs: https://docs.nestjs.com
- Prisma Docs: https://www.prisma.io/docs
- Supabase Docs: https://supabase.com/docs
- Jest Docs: https://jestjs.io/docs

**Commands Reference**:
```bash
# Development
bun run start:dev        # Start dev server
bun run build            # Build for production
bun run start:prod       # Run production build

# Database
bun prisma generate      # Generate Prisma Client
bun prisma db push       # Sync schema to database
bun prisma migrate dev   # Create migration
bun prisma studio        # Open Prisma Studio GUI
bun prisma db seed       # Seed database

# Testing
bun test                 # Run all tests
bun test --watch         # Watch mode
bun test --coverage      # Generate coverage
bun test:e2e             # Run E2E tests

# Code Quality
bun run lint             # Run ESLint
bun run format           # Format with Prettier
```

---

**Status**: Ready for development! 🚀  
**Last Validated**: AuthService tests 16/16 PASS  
**Next Milestone**: PenggunaService tests (12 tests)
