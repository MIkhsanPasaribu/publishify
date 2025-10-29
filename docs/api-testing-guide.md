# 🧪 API Testing Guide - Publishify Backend

**Version:** 1.0  
**Last Updated:** 29 Oktober 2025

---

## 📋 Table of Contents

1. [Testing Setup](#testing-setup)
2. [Manual Testing dengan cURL](#manual-testing-dengan-curl)
3. [Testing dengan Postman](#testing-dengan-postman)
4. [Automated Testing](#automated-testing)
5. [Test Scenarios](#test-scenarios)
6. [Common Issues](#common-issues)

---

## 🛠️ Testing Setup

### Prerequisites

```bash
# Backend harus running
bun run start:dev

# Server running di: http://localhost:4000
# Swagger UI: http://localhost:4000/api/docs
```

### Test User Credentials

Setelah menjalankan `bun prisma db seed`:

| Role       | Email                     | Password     |
| ---------- | ------------------------- | ------------ |
| Admin      | admin@publishify.com      | Password123! |
| Editor     | editor@publishify.com     | Password123! |
| Penulis    | penulis@publishify.com    | Password123! |
| Percetakan | percetakan@publishify.com | Password123! |

---

## 🔧 Manual Testing dengan cURL

### 1. Authentication Tests

#### Register New User

```bash
curl -X POST http://localhost:4000/api/auth/daftar \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "kataSandi": "Password123!",
    "namaDepan": "Test",
    "namaBelakang": "User",
    "peran": "penulis"
  }'
```

**Expected Response:**

```json
{
  "sukses": true,
  "pesan": "Registrasi berhasil",
  "data": {
    "id": "uuid",
    "email": "testuser@example.com",
    "accessToken": "jwt-token",
    "refreshToken": "refresh-token"
  }
}
```

#### Login

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "penulis@publishify.com",
    "kataSandi": "Password123!"
  }'
```

**Save the accessToken for subsequent requests!**

---

### 2. Naskah Tests

#### Create Naskah (Authenticated)

```bash
# Replace YOUR_TOKEN with actual token from login
export TOKEN="your-access-token-here"

curl -X POST http://localhost:4000/api/naskah \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "judul": "Naskah Test API",
    "subJudul": "Subtitle Test",
    "sinopsis": "Ini adalah sinopsis test untuk naskah yang dibuat melalui API testing. Minimal 50 karakter untuk validasi.",
    "idKategori": "get-from-database",
    "idGenre": "get-from-database",
    "bahasaTulis": "id"
  }'
```

#### Get All Naskah dengan Filter

```bash
curl -X GET "http://localhost:4000/api/naskah?halaman=1&limit=10&status=draft" \
  -H "Authorization: Bearer $TOKEN"
```

#### Get Naskah by ID

```bash
curl -X GET http://localhost:4000/api/naskah/{id} \
  -H "Authorization: Bearer $TOKEN"
```

#### Update Naskah

```bash
curl -X PUT http://localhost:4000/api/naskah/{id} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "judul": "Naskah Updated",
    "sinopsis": "Sinopsis yang sudah diupdate dengan informasi baru yang lebih lengkap."
  }'
```

#### Submit Naskah untuk Review

```bash
curl -X POST http://localhost:4000/api/naskah/{id}/ajukan \
  -H "Authorization: Bearer $TOKEN"
```

---

### 3. Review Tests

#### Assign Review (Admin Only)

```bash
# Login as admin first
export ADMIN_TOKEN="admin-token-here"

curl -X POST http://localhost:4000/api/review \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "idNaskah": "naskah-id",
    "idEditor": "editor-id",
    "deadline": "2025-12-31T23:59:59Z"
  }'
```

#### Get Review Assignments (Editor)

```bash
# Login as editor
export EDITOR_TOKEN="editor-token-here"

curl -X GET "http://localhost:4000/api/review?status=ditugaskan" \
  -H "Authorization: Bearer $EDITOR_TOKEN"
```

#### Add Feedback

```bash
curl -X POST http://localhost:4000/api/review/{id}/feedback \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $EDITOR_TOKEN" \
  -d '{
    "halaman": 10,
    "baris": 5,
    "jenis": "perbaikan",
    "konten": "Typo pada kata ini, seharusnya ..."
  }'
```

#### Submit Review

```bash
curl -X POST http://localhost:4000/api/review/{id}/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $EDITOR_TOKEN" \
  -d '{
    "rekomendasi": "setujui",
    "catatan": "Naskah sudah sangat baik dan siap untuk diterbitkan"
  }'
```

---

### 4. Percetakan Tests

#### Create Pesanan Cetak

```bash
curl -X POST http://localhost:4000/api/percetakan \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "idNaskah": "naskah-id",
    "jumlah": 100,
    "jenisCover": "soft_cover",
    "jenisKertas": "hvs_70gsm",
    "finishing": ["laminasi_glossy"],
    "catatanTambahan": "Mohon dikerjakan dengan hati-hati"
  }'
```

#### Update Status Pesanan (Percetakan)

```bash
# Login as percetakan
export PERCETAKAN_TOKEN="percetakan-token-here"

curl -X PUT http://localhost:4000/api/percetakan/{id}/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $PERCETAKAN_TOKEN" \
  -d '{
    "status": "dalam_produksi",
    "catatan": "Produksi sedang berjalan"
  }'
```

---

### 5. Pembayaran Tests

#### Create Pembayaran

```bash
curl -X POST http://localhost:4000/api/pembayaran \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "idPesanan": "pesanan-id",
    "metodePembayaran": "transfer_bank",
    "urlBukti": "https://example.com/bukti-transfer.jpg"
  }'
```

#### Confirm Pembayaran (Admin/Percetakan)

```bash
curl -X PUT http://localhost:4000/api/pembayaran/{id}/konfirmasi \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "diterima": true,
    "catatan": "Pembayaran valid dan sudah diterima"
  }'
```

#### Get Payment Statistics

```bash
curl -X GET http://localhost:4000/api/pembayaran/statistik/ringkasan \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

### 6. Notifikasi Tests (WebSocket)

#### Test dengan wscat

```bash
# Install wscat
npm install -g wscat

# Connect to WebSocket
wscat -c ws://localhost:4000/notifikasi

# Join user room (setelah connect)
{"event":"join_room","data":{"idPengguna":"user-id-here"}}
```

#### REST API - Get Notifications

```bash
curl -X GET "http://localhost:4000/api/notifikasi?halaman=1&limit=20&dibaca=false" \
  -H "Authorization: Bearer $TOKEN"
```

#### Mark as Read

```bash
curl -X PUT http://localhost:4000/api/notifikasi/{id}/baca \
  -H "Authorization: Bearer $TOKEN"
```

#### Get Unread Count

```bash
curl -X GET http://localhost:4000/api/notifikasi/belum-dibaca/count \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📮 Testing dengan Postman

### Import Collection

1. Buka Postman
2. Import Swagger spec dari `http://localhost:4000/api/docs-json`
3. Atau buat collection manual dengan endpoints di atas

### Environment Variables

```json
{
  "base_url": "http://localhost:4000/api",
  "access_token": "{{login_response.accessToken}}",
  "user_id": "{{login_response.data.id}}",
  "naskah_id": "",
  "review_id": "",
  "pesanan_id": "",
  "pembayaran_id": ""
}
```

### Pre-request Scripts

```javascript
// Auto set token from login response
pm.environment.set("access_token", pm.response.json().data.accessToken);
```

### Tests Scripts

```javascript
// Test status code
pm.test("Status code is 200", function () {
  pm.response.to.have.status(200);
});

// Test response structure
pm.test("Response has sukses field", function () {
  var jsonData = pm.response.json();
  pm.expect(jsonData).to.have.property("sukses");
  pm.expect(jsonData.sukses).to.be.true;
});

// Save response data
var jsonData = pm.response.json();
pm.environment.set("naskah_id", jsonData.data.id);
```

---

## 🤖 Automated Testing

### Unit Tests (Jest)

```typescript
// naskah.service.spec.ts
describe("NaskahService", () => {
  let service: NaskahService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        NaskahService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<NaskahService>(NaskahService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe("buatNaskah", () => {
    it("should create new naskah", async () => {
      const dto = {
        judul: "Test Naskah",
        sinopsis:
          "Test sinopsis yang cukup panjang untuk validasi minimal karakter",
        idKategori: "kategori-id",
        idGenre: "genre-id",
      };

      const result = await service.buatNaskah("user-id", dto);

      expect(result.sukses).toBe(true);
      expect(result.data.judul).toBe("Test Naskah");
      expect(prisma.naskah.create).toHaveBeenCalled();
    });

    it("should throw error if kategori not found", async () => {
      prisma.kategori.findUnique = jest.fn().mockResolvedValue(null);

      await expect(service.buatNaskah("user-id", dto)).rejects.toThrow(
        NotFoundException
      );
    });
  });
});
```

### Integration Tests

```typescript
// naskah.integration.spec.ts
describe("Naskah API Integration", () => {
  let app: INestApplication;
  let accessToken: string;

  beforeAll(async () => {
    // Setup test database
    await prisma.$executeRaw`TRUNCATE TABLE naskah CASCADE`;

    // Login to get token
    const loginResponse = await request(app.getHttpServer())
      .post("/api/auth/login")
      .send({
        email: "penulis@publishify.com",
        kataSandi: "Password123!",
      });

    accessToken = loginResponse.body.data.accessToken;
  });

  it("POST /api/naskah - should create naskah", async () => {
    const response = await request(app.getHttpServer())
      .post("/api/naskah")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        judul: "Integration Test Naskah",
        sinopsis:
          "Sinopsis test untuk integration testing dengan minimal 50 karakter",
        idKategori: "valid-kategori-id",
        idGenre: "valid-genre-id",
      });

    expect(response.status).toBe(201);
    expect(response.body.sukses).toBe(true);
    expect(response.body.data.judul).toBe("Integration Test Naskah");
  });

  it("GET /api/naskah - should return naskah list", async () => {
    const response = await request(app.getHttpServer())
      .get("/api/naskah?halaman=1&limit=10")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.sukses).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });
});
```

### E2E Tests

```typescript
// manuscript-flow.e2e.spec.ts
describe("Manuscript Submission Flow (E2E)", () => {
  let penulisToken: string;
  let editorToken: string;
  let adminToken: string;
  let naskahId: string;
  let reviewId: string;

  it("1. Penulis register dan login", async () => {
    // Register
    const registerResponse = await request(app.getHttpServer())
      .post("/api/auth/daftar")
      .send({
        email: "penulis-test@example.com",
        kataSandi: "Password123!",
        namaDepan: "Penulis",
        namaBelakang: "Test",
        peran: "penulis",
      });

    expect(registerResponse.status).toBe(201);
    penulisToken = registerResponse.body.data.accessToken;
  });

  it("2. Penulis membuat naskah", async () => {
    const response = await request(app.getHttpServer())
      .post("/api/naskah")
      .set("Authorization", `Bearer ${penulisToken}`)
      .send({
        judul: "E2E Test Naskah",
        sinopsis:
          "Sinopsis lengkap untuk E2E testing flow manuscript submission",
        idKategori: kategoriId,
        idGenre: genreId,
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

  it("4. Admin assign review ke editor", async () => {
    const response = await request(app.getHttpServer())
      .post("/api/review")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        idNaskah: naskahId,
        idEditor: editorId,
        deadline: "2025-12-31T23:59:59Z",
      });

    expect(response.status).toBe(201);
    reviewId = response.body.data.id;
  });

  it("5. Editor submit review dengan rekomendasi", async () => {
    // Add feedback
    await request(app.getHttpServer())
      .post(`/api/review/${reviewId}/feedback`)
      .set("Authorization", `Bearer ${editorToken}`)
      .send({
        halaman: 1,
        baris: 5,
        jenis: "saran",
        konten: "Bagus, pertahankan!",
      });

    // Submit review
    const response = await request(app.getHttpServer())
      .post(`/api/review/${reviewId}/submit`)
      .set("Authorization", `Bearer ${editorToken}`)
      .send({
        rekomendasi: "setujui",
        catatan: "Naskah siap terbit",
      });

    expect(response.status).toBe(200);
    expect(response.body.data.status).toBe("selesai");
  });

  it("6. Verify naskah status changed to disetujui", async () => {
    const response = await request(app.getHttpServer())
      .get(`/api/naskah/${naskahId}`)
      .set("Authorization", `Bearer ${penulisToken}`);

    expect(response.body.data.status).toBe("disetujui");
  });
});
```

---

## 📝 Test Scenarios

### Critical User Flows

#### 1. User Registration & Login Flow

```
✅ Register new user (penulis)
✅ Verify email (optional)
✅ Login with credentials
✅ Get user profile
✅ Update profile
```

#### 2. Manuscript Submission Flow

```
✅ Create draft naskah
✅ Update naskah
✅ Upload naskah file
✅ Submit for review
✅ Track review status
✅ Receive feedback
✅ Make revisions if needed
✅ Get approval
✅ Publish naskah
```

#### 3. Review Process Flow

```
✅ Admin assign review to editor
✅ Editor receives notification
✅ Editor review naskah
✅ Editor add feedback
✅ Editor submit review with recommendation
✅ Penulis receives notification
✅ Admin approve/reject based on review
```

#### 4. Printing Order Flow

```
✅ Create printing order
✅ Percetakan receives notification
✅ Percetakan confirm order
✅ Update order status through production
✅ Create shipping
✅ Track delivery
✅ Complete order
```

#### 5. Payment Flow

```
✅ Create payment for order
✅ Upload payment proof (if transfer bank)
✅ Admin/Percetakan verify payment
✅ Confirm payment
✅ Update order status
✅ Send payment confirmation notification
```

---

## ⚠️ Common Issues

### 1. Authentication Errors

**Problem:** `401 Unauthorized`

**Solution:**

```bash
# Check if token is valid
curl -X GET http://localhost:4000/api/pengguna/profil \
  -H "Authorization: Bearer $TOKEN"

# If expired, refresh token
curl -X POST http://localhost:4000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "your-refresh-token"}'
```

### 2. Validation Errors

**Problem:** `400 Bad Request - Validation failed`

**Solution:**

- Check Swagger docs untuk required fields
- Ensure data types match (string, number, boolean)
- Check minimum/maximum constraints
- Verify enum values

### 3. Foreign Key Errors

**Problem:** `404 Not Found - Kategori/Genre tidak ditemukan`

**Solution:**

```bash
# Get valid kategori
curl http://localhost:4000/api/naskah/kategori

# Get valid genre
curl http://localhost:4000/api/naskah/genre
```

### 4. Permission Errors

**Problem:** `403 Forbidden - Tidak memiliki akses`

**Solution:**

- Check user role (penulis, editor, admin, percetakan)
- Verify endpoint permissions in Swagger
- Ensure user owns the resource (for owner-only endpoints)

### 5. WebSocket Connection Issues

**Problem:** WebSocket tidak connect

**Solution:**

```bash
# Check if Socket.io server running
curl http://localhost:4000/socket.io/

# Test with wscat
wscat -c ws://localhost:4000/notifikasi

# Check CORS settings in main.ts
```

---

## 📊 Test Coverage Goals

| Module     | Unit Tests | Integration Tests | E2E Tests |
| ---------- | ---------- | ----------------- | --------- |
| Auth       | 15+ tests  | 8+ tests          | 3+ flows  |
| Pengguna   | 12+ tests  | 6+ tests          | 2+ flows  |
| Naskah     | 18+ tests  | 10+ tests         | 4+ flows  |
| Review     | 15+ tests  | 8+ tests          | 3+ flows  |
| Percetakan | 18+ tests  | 10+ tests         | 3+ flows  |
| Pembayaran | 15+ tests  | 8+ tests          | 2+ flows  |
| Notifikasi | 12+ tests  | 6+ tests          | 2+ flows  |
| Upload     | 10+ tests  | 6+ tests          | 2+ flows  |
| **Total**  | **115+**   | **62+**           | **21+**   |

**Target Coverage:** 80%+

---

## 🎯 Quick Test Commands

```bash
# Run all tests
bun test

# Run specific test file
bun test naskah.service.spec.ts

# Run tests with coverage
bun test:cov

# Run E2E tests
bun test:e2e

# Run tests in watch mode
bun test:watch

# Run tests with verbose output
bun test --verbose
```

---

## 📚 Additional Resources

- [Swagger UI](http://localhost:4000/api/docs) - Interactive API documentation
- [NestJS Testing Guide](https://docs.nestjs.com/fundamentals/testing)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)

---

**Last Updated:** 29 Oktober 2025  
**Maintainer:** Publishify Development Team
