# Setup Guide - Publishify Backend

Panduan lengkap untuk setup development environment Publishify Backend.

## Prerequisites

Sebelum memulai, pastikan sudah install:

### 1. Bun Runtime

```bash
# Windows (PowerShell)
powershell -c "irm bun.sh/install.ps1 | iex"

# Verify installation
bun --version
```

### 2. PostgreSQL 14+

- Download dari: https://www.postgresql.org/download/
- Atau gunakan Docker:

```bash
docker run --name publishify-postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres:14
```

### 3. Redis 6+

- Download dari: https://redis.io/download
- Atau gunakan Docker:

```bash
docker run --name publishify-redis -p 6379:6379 -d redis:6
```

### 4. Git

- Download dari: https://git-scm.com/downloads

## Step-by-Step Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd publishify/backend
```

### 2. Install Dependencies

```bash
bun install
```

Ini akan menginstall semua dependencies yang diperlukan termasuk:

- NestJS framework
- Prisma ORM
- Authentication libraries
- Socket.io
- Dan lainnya

### 3. Setup Environment Variables

Copy file `.env.example` menjadi `.env`:

```bash
cp .env.example .env
```

Edit `.env` dan sesuaikan dengan environment Anda:

```env
# Environment
NODE_ENV=development

# Server
PORT=4000
FRONTEND_URL=http://localhost:3000

# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/publishify?schema=public"
DIRECT_URL="postgresql://postgres:password@localhost:5432/publishify?schema=public"

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Email (SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@publishify.com
```

**Important Notes**:

- Ganti `JWT_SECRET` dan `JWT_REFRESH_SECRET` dengan random string yang kuat
- Untuk Gmail, gunakan [App Password](https://support.google.com/accounts/answer/185833)
- Sesuaikan `DATABASE_URL` dengan kredensial PostgreSQL Anda

### 4. Setup Database

#### 4.1 Create Database

Buat database PostgreSQL baru:

```sql
CREATE DATABASE publishify;
```

#### 4.2 Generate Prisma Client

```bash
bun prisma generate
```

#### 4.3 Run Migrations

```bash
bun prisma migrate dev
```

Ini akan:

- Membuat semua tabel di database
- Generate migration files
- Update Prisma Client

#### 4.4 Seed Database (Optional tapi Recommended)

```bash
bun prisma db seed
```

Ini akan membuat:

- 4 default users dengan different roles
- Sample kategori dan sub-kategori
- Genre dan tags
- Sample naskah

### 5. Verify Setup

Cek Prisma Studio untuk memastikan database terisi:

```bash
bun prisma studio
```

Browser akan terbuka di `http://localhost:5555` menampilkan database viewer.

### 6. Run Development Server

```bash
bun run start:dev
```

Server akan start dengan watch mode (auto-reload on file changes).

Cek output console, seharusnya ada:

```
✅ Koneksi database berhasil
🚀 Aplikasi berjalan pada: http://localhost:4000
📚 Dokumentasi API: http://localhost:4000/api/docs
```

### 7. Test API

Buka browser dan akses:

- **API Docs (Swagger)**: http://localhost:4000/api/docs
- **Health Check**: http://localhost:4000/api (should return basic info)

Atau test dengan curl:

```bash
curl http://localhost:4000/api
```

## Development Workflow

### 1. Making Database Changes

Jika ingin mengubah schema database:

1. Edit `prisma/schema.prisma`
2. Generate migration:
   ```bash
   bun prisma migrate dev --name nama_perubahan
   ```
3. Prisma akan auto-generate Prisma Client baru

### 2. Running Tests

```bash
# Unit tests
bun test

# E2E tests
bun test:e2e

# Coverage
bun test:cov
```

### 3. Code Quality

```bash
# Lint code
bun run lint

# Format code
bun run format
```

### 4. Debugging

Run in debug mode:

```bash
bun run start:debug
```

Then attach debugger di VS Code (F5) dengan config:

```json
{
  "type": "node",
  "request": "attach",
  "name": "Attach to NestJS",
  "port": 9229
}
```

## Testing Login

Setelah seed database, test login dengan:

### Via Swagger UI

1. Buka http://localhost:4000/api/docs
2. Cari endpoint `POST /api/auth/login`
3. Klik "Try it out"
4. Input:
   ```json
   {
     "email": "penulis@publishify.com",
     "kataSandi": "Password123!"
   }
   ```
5. Execute
6. Copy `accessToken` dari response
7. Klik "Authorize" di top-right Swagger
8. Paste token: `Bearer <accessToken>`
9. Sekarang bisa test endpoint yang perlu auth

### Via cURL

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "penulis@publishify.com",
    "kataSandi": "Password123!"
  }'
```

## Common Issues & Solutions

### Issue: Cannot connect to database

**Solution**:

- Pastikan PostgreSQL sudah running
- Check DATABASE_URL di `.env` sudah benar
- Test koneksi: `psql -U postgres -h localhost`

### Issue: Prisma Client not found

**Solution**:

```bash
bun prisma generate
```

### Issue: Port 4000 already in use

**Solution**:

- Kill process yang menggunakan port 4000
- Atau ganti PORT di `.env`

### Issue: Redis connection failed

**Solution**:

- Pastikan Redis sudah running: `redis-cli ping` (should return "PONG")
- Check REDIS_HOST dan REDIS_PORT di `.env`

### Issue: Email sending fails

**Solution**:

- Untuk Gmail, pastikan "Less secure app access" diaktifkan
- Atau gunakan App Password
- Test SMTP credentials

## Next Steps

Setelah setup berhasil:

1. **Baca dokumentasi**:

   - [Backend README](../docs/backend-readme.md)
   - [Database Schema](../docs/database-schema.md)
   - [API Documentation](http://localhost:4000/api/docs)

2. **Explore codebase**:

   - Lihat struktur modules di `src/modules/`
   - Pelajari common utilities di `src/common/`
   - Review Prisma schema di `prisma/schema.prisma`

3. **Start development**:
   - Buat feature module baru
   - Implement business logic
   - Write tests
   - Document API

## Tips untuk Development

1. **Always run with watch mode**: `bun run start:dev`
2. **Use Prisma Studio**: Sangat helpful untuk debug database
3. **Check Swagger docs**: Selalu update API documentation
4. **Follow naming conventions**: Gunakan Bahasa Indonesia
5. **Write tests**: Test-driven development recommended
6. **Use Git properly**: Commit small, commit often
7. **Read logs**: Log sangat helpful untuk debugging

## Getting Help

Jika ada masalah:

1. Check logs di console
2. Baca dokumentasi lengkap
3. Search di Stack Overflow
4. Ask team members
5. Check NestJS/Prisma documentation

## Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Bun Documentation](https://bun.sh/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

Happy coding! 🚀
