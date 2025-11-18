# Changelog Backend - Publishify

> **Periode**: Commit `cb9a704` hingga `c8b639d` (12-13 November 2025)
> 
> Dokumentasi lengkap semua perubahan, penambahan, dan perbaikan yang dilakukan pada folder `backend/`

---

## 📋 Ringkasan Perubahan

**Total Commit**: 6 commit
**File Berubah**: 13 files
**Penambahan**: 5,183 baris
**Penghapusan**: 30 baris

---

## 🎯 Daftar Commit

| Commit Hash | Tanggal | Deskripsi |
|------------|---------|-----------|
| `c8b639d` | 2025-11-13 | feat: Implement editor review status management documentation and fix feedback API mismatch |
| `91652fd` | 2025-11-12 | feat: Implement Editor Self-Assign Workflow with comprehensive documentation and testing checklist |
| `40131a2` | 2025-11-12 | feat(backend-naskah): tambah endpoint admin GET /naskah/admin/semua |
| `2c8921f` | 2025-11-12 | fix(backend): perbaiki tipe data 'take' di review & alur 'ajukan' di naskah |
| `1bc7873` | 2025-11-12 | feat(frontend): Add Google Sign-In UI and callback handling |
| `191c76f` | 2025-11-12 | Implement Google OAuth and Redis caching (frontend) |

---

## 🚀 Fitur Baru (New Features)

### 1. **Google OAuth Integration** (Commit: `191c76f`, `1bc7873`)

#### Perubahan pada `auth.module.ts`
- **Implementasi Dynamic Google Strategy Provider**
  - Menambahkan factory provider untuk `GoogleStrategy` agar tidak crash saat credential belum diset
  - Menggunakan `useFactory` dengan dependency `ConfigService` dan `AuthService`
  - Menambahkan validasi credential (clientID & clientSecret) sebelum inisialisasi strategy
  - Fallback ke `DisabledGoogleStrategy` (noop class) jika credential tidak tersedia
  - Console warning untuk memberi tahu developer saat Google OAuth disabled

```typescript
// GoogleStrategy: register only if credentials exist to avoid startup crash
{
  provide: GoogleStrategy,
  useFactory: (configService: ConfigService, authService: AuthService) => {
    const clientID = configService.get<string>('googleOAuth.clientID');
    const clientSecret = configService.get<string>('googleOAuth.clientSecret');

    if (!clientID || !clientSecret) {
      console.warn('[AuthModule] Google OAuth disabled - GOOGLE_CLIENT_ID/SECRET tidak diset');
      class DisabledGoogleStrategy {}
      return new DisabledGoogleStrategy();
    }

    return new GoogleStrategy(configService, authService);
  },
  inject: [ConfigService, AuthService],
}
```

**Manfaat**:
- ✅ Development-safe: aplikasi bisa berjalan tanpa Google OAuth credential
- ✅ Tidak crash saat startup di environment yang belum setup Google OAuth
- ✅ Menghindari error DI (Dependency Injection) saat resolve provider

---

#### Perubahan pada `auth.controller.ts`
- **Endpoint: `GET /auth/google/login`**
  - Menambahkan validasi credential sebelum redirect ke Google
  - Error handling untuk konfigurasi OAuth yang belum lengkap
  - Redirect ke frontend callback URL dengan error message jika OAuth belum dikonfigurasi

- **Endpoint: `GET /auth/google/callback`**
  - Menambahkan validasi credential di callback handler
  - Error handling untuk mencegah crash saat Google OAuth belum setup
  - Redirect ke frontend dengan error parameter yang informatif

```typescript
// Validasi credential sebelum proses OAuth
const clientID = this.configService.get<string>('googleOAuth.clientID');
const callbackURL = this.configService.get<string>('googleOAuth.callbackURL');

if (!clientID || !callbackURL) {
  const frontendCallback = this.configService.get<string>('googleOAuth.frontendCallback');
  const errorUrl = `${frontendCallback}?${new URLSearchParams({
    error: 'oauth_not_configured',
    message: 'Google OAuth belum dikonfigurasi pada server',
  })}`;
  return response.redirect(errorUrl);
}
```

**Error Handling yang Ditambahkan**:
- `oauth_not_configured`: Ketika GOOGLE_CLIENT_ID/SECRET belum diset
- Redirect ke frontend dengan query parameter error yang jelas
- Mencegah crash/exception yang tidak tertangani

---

#### Perubahan pada `auth.service.ts`
- **Method: `validateGoogleUser()`**
  - Perbaikan return value untuk konsistensi dengan method `validateUser()`
  - Mengembalikan full user object (tanpa password) alih-alih partial object
  - Menggunakan destructuring untuk exclude password: `const { kataSandi, ...penggunaWithoutPassword }`

**Sebelum**:
```typescript
return {
  id: pengguna.id,
  email: pengguna.email,
  peran: pengguna.peranPengguna.map((p: any) => p.jenisPeran),
  terverifikasi: pengguna.terverifikasi,
  profilPengguna: pengguna.profilPengguna,
};
```

**Sesudah**:
```typescript
// Return full user object (consistent dengan validateUser)
const { kataSandi, ...penggunaWithoutPassword } = pengguna as any;
return penggunaWithoutPassword;
```

**Manfaat**:
- ✅ Konsistensi response format dengan local authentication
- ✅ Mengembalikan semua relasi user (peranPengguna, profilPengguna, dll)
- ✅ Safety: password selalu di-exclude dari response

---

### 2. **Redis Cache Improvements** (Commit: `191c76f`)

#### Perubahan pada `cache.module.ts`
- **Implementasi Redis Fallback ke In-Memory Cache**
  - Menambahkan flag `redis.enabled` untuk toggle Redis on/off via environment variable
  - Try-catch block untuk handle Redis connection failure
  - Auto-fallback ke in-memory cache jika Redis tidak tersedia
  - Logging yang informatif untuk setiap kondisi

**Fitur Baru**:
```typescript
// 1. Check apakah Redis enabled via config
const redisEnabled = configService.get<boolean>('redis.enabled', true);

if (!redisEnabled) {
  console.log('[CacheModule] Redis disabled, using in-memory cache');
  return {
    ttl: 300, // 5 minutes
    max: 1000,
    isGlobal: true,
  };
}

// 2. Try connect to Redis, fallback jika gagal
try {
  console.log('[CacheModule] Connecting to Redis:', redisConfig.socket.host);
  const store = await redisStore(redisConfig);
  console.log('[CacheModule] Redis connected successfully');
  return {
    store,
    ttl: 300,
    max: 1000,
    isGlobal: true,
  };
} catch (err) {
  console.warn('[CacheModule] Redis unavailable, falling back to in-memory cache. Error:', 
    err instanceof Error ? err.message : String(err));
  return {
    ttl: 300,
    max: 1000,
    isGlobal: true,
  };
}
```

- **Migrasi Config Keys ke Nested Object**
  - Sebelumnya: `REDIS_HOST`, `REDIS_PORT`, `REDIS_USERNAME`, `REDIS_PASSWORD`
  - Sekarang: `redis.host`, `redis.port`, `redis.username`, `redis.password`
  - Konsisten dengan pattern ConfigService NestJS

**Manfaat**:
- ✅ Development-safe: bisa development tanpa Redis
- ✅ Production-ready: gunakan Redis untuk performance optimal
- ✅ Auto-recovery: jika Redis down, aplikasi tetap berjalan dengan in-memory cache
- ✅ Logging yang jelas untuk debugging

---

#### Perubahan pada `redis.config.ts`
- **Menambahkan flag `enabled`**
  - Default: `true`
  - Bisa di-disable dengan `REDIS_ENABLED=false` di `.env`

- **Menambahkan field `username`**
  - Support untuk Redis 6+ yang memiliki ACL (Access Control List)
  - Optional field untuk Redis yang butuh username authentication

```typescript
export default registerAs('redis', () => ({
  enabled: process.env.REDIS_ENABLED !== 'false', // Default true
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
  username: process.env.REDIS_USERNAME || undefined, // ✅ Baru ditambahkan
  db: parseInt(process.env.REDIS_DB || '0', 10),
}));
```

---

### 3. **Endpoint Admin untuk Semua Naskah** (Commit: `40131a2`)

#### Perubahan pada `naskah.controller.ts`
- **Endpoint Baru: `GET /naskah/admin/semua`**
  - Role: `admin`
  - Mengambil SEMUA naskah dari semua penulis tanpa filter publik
  - Menampilkan naskah dengan status apapun (draft, diajukan, dalam_review, dll)
  - Menggunakan `FilterNaskahDto` untuk filtering, sorting, dan pagination

```typescript
/**
 * GET /naskah/admin/semua - Ambil SEMUA naskah untuk admin (tanpa filter publik)
 * Role: admin
 */
@Get('admin/semua')
@ApiBearerAuth()
@Peran('admin')
@ApiOperation({
  summary: 'Ambil semua naskah untuk admin',
  description: 'Mengambil SEMUA naskah dari semua penulis dengan semua status (draft, diajukan, dalam_review, dll). Hanya untuk admin.',
})
@ApiResponse({
  status: 200,
  description: 'Daftar semua naskah berhasil diambil',
})
@ApiQuery({ type: FilterNaskahDtoClass })
async ambilSemuaNaskahUntukAdmin(
  @Query(new ValidasiZodPipe(FilterNaskahSchema)) filter: FilterNaskahDto,
  @PenggunaSaatIni('id') idPengguna: string,
) {
  return await this.naskahService.ambilSemuaNaskah(filter, idPengguna);
}
```

**Fitur**:
- ✅ Filter berdasarkan status, kategori, genre, penulis
- ✅ Sorting berdasarkan field apapun
- ✅ Pagination dengan metadata lengkap
- ✅ Role-based access: hanya admin yang bisa akses

**Use Case**:
- Admin panel untuk melihat semua naskah dalam sistem
- Monitoring naskah yang perlu di-review
- Statistik dan analisis naskah

---

### 4. **Include Review Data dalam Response Naskah** (Commit: Bagian dari `2c8921f`)

#### Perubahan pada `naskah.service.ts` - Method `ambilSemuaNaskah()`
- **Menambahkan relasi `review` dalam select query**
  - Menampilkan review terbaru untuk setiap naskah
  - Include field: `id`, `status`, `rekomendasi`, `catatan`, `ditugaskanPada`, `selesaiPada`
  - Sorting: `ditugaskanPada` descending
  - Limit: 1 (hanya review terbaru)

```typescript
review: {
  select: {
    id: true,
    status: true,
    rekomendasi: true,
    catatan: true,
    ditugaskanPada: true,
    selesaiPada: true,
  },
  orderBy: { ditugaskanPada: 'desc' },
  take: 1, // Ambil review terbaru saja
},
```

**Manfaat**:
- ✅ Frontend bisa langsung menampilkan status review tanpa query terpisah
- ✅ Efisiensi: 1 query untuk mendapatkan naskah + review terbaru
- ✅ User experience: admin/penulis bisa lihat status review dengan cepat

---

## 🐛 Bug Fixes (Perbaikan)

### 1. **Fix Tipe Data `take` di Pagination** (Commit: `2c8921f`)

#### Masalah
Prisma mengharuskan parameter `take` dan `skip` bertipe `number`, tetapi dari query parameter bisa jadi `string` yang menyebabkan error atau behavior tidak terduga.

#### Solusi pada `naskah.service.ts` dan `review.service.ts`
- **Convert explicit query params ke `number`**
  - `halaman` dan `limit` di-convert ke `Number()` sebelum digunakan
  - Variabel baru: `halamanNumber`, `limitNumber`
  - Memastikan `skip` dan `take` selalu bertipe number

**Sebelum**:
```typescript
const skip = (halaman - 1) * limit;

// ...

take: limit, // ❌ Bisa jadi string
```

**Sesudah**:
```typescript
// Convert to number untuk memastikan tipe data yang benar untuk Prisma
const halamanNumber = Number(halaman);
const limitNumber = Number(limit);
const skip = (halamanNumber - 1) * limitNumber;

// ...

take: limitNumber, // ✅ Pasti number
```

**File yang Diperbaiki**:
- ✅ `backend/src/modules/naskah/naskah.service.ts` - Method `ambilSemuaNaskah()`
- ✅ `backend/src/modules/review/review.service.ts` - Method `ambilAntrianReview()`

**Manfaat**:
- ✅ Mencegah error Prisma saat pagination
- ✅ Konsistensi tipe data
- ✅ Menghindari bug saat parameter dari query string

---

### 2. **Perbaikan Metadata Pagination** (Commit: `2c8921f`)

#### Solusi
Metadata pagination juga menggunakan variabel `halamanNumber` dan `limitNumber` untuk konsistensi.

```typescript
metadata: {
  total,
  halaman: halamanNumber,  // ✅ Menggunakan number yang sudah di-convert
  limit: limitNumber,       // ✅ Menggunakan number yang sudah di-convert
  totalHalaman: Math.ceil(total / limitNumber),
}
```

---

## 📄 File-File Baru

### 1. **swagger-endpoints.json** (Commit: `c8b639d`)
- File baru berisi **5,043 baris**
- Dokumentasi lengkap semua endpoint API dalam format Swagger/OpenAPI
- Include semua endpoint: auth, naskah, review, percetakan, pembayaran, dll
- Generated otomatis oleh NestJS Swagger module

**Lokasi**: `backend/swagger-endpoints.json`

**Manfaat**:
- ✅ Dokumentasi API yang up-to-date
- ✅ Bisa digunakan untuk generate client SDK
- ✅ Import ke Postman/Insomnia untuk testing
- ✅ Dokumentasi visual yang mudah dibaca

---

### 2. **File Debugging & Patches**
File-file berikut ditambahkan (0 baris, file kosong/placeholder):
- `backend/DEBUG-PATCHES-APPLIED.md`
- `backend/DIAGNOSTIC-PATCH.md`
- `backend/apply-debug-patches.js`
- `backend/verify-patches.js`

**Catatan**: File-file ini kemungkinan untuk debugging purpose dan belum diimplementasi (0 baris).

---

## 🔧 Perubahan Configuration

### Environment Variables yang Ditambahkan

```env
# Redis Configuration
REDIS_ENABLED=true                    # ✅ Baru: Toggle Redis on/off
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_USERNAME=                       # ✅ Baru: Redis ACL username (optional)
REDIS_PASSWORD=
REDIS_DB=0

# Google OAuth
GOOGLE_CLIENT_ID=                     # Sudah ada sebelumnya
GOOGLE_CLIENT_SECRET=                 # Sudah ada sebelumnya
GOOGLE_CALLBACK_URL=                  # Sudah ada sebelumnya
```

---

## 📊 Statistik Perubahan per File

| File | Penambahan | Penghapusan | Perubahan Utama |
|------|-----------|------------|----------------|
| `swagger-endpoints.json` | 5,043 | 0 | Dokumentasi API lengkap |
| `cache.module.ts` | 28 | 21 | Redis fallback & error handling |
| `naskah.service.ts` | 16 | 9 | Fix pagination, include review |
| `naskah.controller.ts` | 25 | 0 | Endpoint admin baru |
| `auth.module.ts` | 20 | 2 | Dynamic Google Strategy |
| `auth.controller.ts` | 22 | 0 | OAuth error handling |
| `auth.service.ts` | 2 | 10 | Fix return value consistency |
| `review.service.ts` | 8 | 5 | Fix pagination types |
| `redis.config.ts` | 2 | 0 | Add enabled flag & username |

---

## 🎓 Best Practices yang Diimplementasikan

### 1. **Development-Safe Configuration**
- Redis & Google OAuth bisa di-disable untuk development
- Aplikasi tidak crash saat service eksternal tidak tersedia
- Fallback mechanism untuk cache dan authentication

### 2. **Type Safety**
- Explicit type conversion untuk Prisma parameters
- Destructuring dengan type safety untuk exclude sensitive data
- Proper TypeScript patterns

### 3. **Error Handling**
- Try-catch untuk service eksternal (Redis, Google OAuth)
- Informative error messages
- Graceful degradation

### 4. **Logging & Debugging**
- Console logging untuk connection status
- Warning messages untuk configuration issues
- Informative error messages untuk debugging

### 5. **API Design**
- RESTful endpoint structure
- Role-based access control
- Comprehensive API documentation with Swagger
- Consistent response format dengan metadata

---

## 🚦 Testing & Validation

### Endpoint yang Perlu Ditest

#### 1. Google OAuth Flow
```bash
# Test OAuth login redirect
GET http://localhost:3000/api/auth/google/login

# Test OAuth callback (simulated by Google)
GET http://localhost:3000/api/auth/google/callback?code=xxx
```

#### 2. Admin Naskah Endpoint
```bash
# Test ambil semua naskah (admin only)
GET http://localhost:3000/api/naskah/admin/semua
Authorization: Bearer <admin_token>

# Test dengan filter
GET http://localhost:3000/api/naskah/admin/semua?status=dalam_review&halaman=1&limit=20
```

#### 3. Redis Cache
```bash
# Test dengan Redis enabled
REDIS_ENABLED=true bun run start:dev

# Test dengan Redis disabled (fallback to memory)
REDIS_ENABLED=false bun run start:dev
```

---

## 📝 Migration Notes

### Breaking Changes
❌ **Tidak ada breaking changes** - Semua perubahan backward compatible

### Deployment Checklist

#### Environment Variables
- [ ] Set `REDIS_ENABLED=true` di production
- [ ] Set `GOOGLE_CLIENT_ID` dan `GOOGLE_CLIENT_SECRET` jika menggunakan OAuth
- [ ] Set `REDIS_USERNAME` jika Redis menggunakan ACL
- [ ] Verifikasi semua Redis connection parameters

#### Database
- [ ] Tidak ada migration baru yang perlu dijalankan
- [ ] Existing schema tetap kompatibel

#### Dependencies
- [ ] Tidak ada dependency baru yang perlu di-install
- [ ] Existing `package.json` sudah mencakup semua dependency

---

## 🔮 Next Steps & Recommendations

### Improvements yang Bisa Dilakukan
1. **Testing**
   - Tambahkan unit test untuk Google OAuth flow
   - Integration test untuk Redis fallback mechanism
   - E2E test untuk endpoint admin baru

2. **Documentation**
   - Update Swagger documentation dengan contoh request/response
   - Tambahkan API usage examples di README
   - Documentation untuk error codes dan handling

3. **Performance**
   - Monitor cache hit rate untuk Redis
   - Optimize query untuk endpoint admin (pagination besar)
   - Consider adding database indexes untuk query yang sering digunakan

4. **Security**
   - Audit Google OAuth implementation
   - Rate limiting untuk OAuth endpoints
   - Add CSRF protection untuk OAuth flow

---

## 👥 Contributors
- **Daffa** - Semua implementasi dan perbaikan (12-13 November 2025)

---

## 📚 Related Documentation
- [GOOGLE-OAUTH-SETUP-GUIDE.md](../docs/GOOGLE-OAUTH-SETUP-GUIDE.md)
- [REDIS-SETUP-GUIDE.md](../docs/REDIS-SETUP-GUIDE.md)
- [API-TESTING-GUIDE.md](../docs/api-testing-guide.md)
- [EDITOR-REVIEW-SYSTEM.md](../docs/EDITOR-REVIEW-SYSTEM.md)

---

## 📧 Support
Jika ada pertanyaan atau issue terkait perubahan ini, silakan:
1. Check existing documentation di folder `docs/`
2. Review commit history untuk detail implementasi
3. Contact: daffarobbani18@gmail.com

---

**Last Updated**: 18 November 2025
**Document Version**: 1.0.0
