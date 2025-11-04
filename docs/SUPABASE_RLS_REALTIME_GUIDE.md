# Panduan Implementasi Supabase Realtime + RLS di Publishify

## 📋 Overview

Dokumen ini menjelaskan implementasi lengkap **Row Level Security (RLS)** dan **Realtime Subscriptions** untuk sistem Publishify menggunakan Supabase PostgreSQL.

## 🎯 Tujuan

1. **Keamanan Data**: Setiap user hanya bisa akses data yang sesuai dengan role dan ownership mereka
2. **Real-time Updates**: Perubahan data langsung ter-update di client tanpa perlu refresh
3. **Scalability**: RLS di database level lebih efisien daripada filtering di application layer

## 📁 Files yang Dibuat/Dimodifikasi

### 1. Migration Files

#### `prisma/migrations/20250103_enable_realtime/migration.sql`

- Enable realtime publication untuk **28 tabel**
- Set REPLICA IDENTITY FULL untuk semua tabel
- Konfigurasi Supabase realtime

#### `prisma/migrations/20250103_enable_rls/migration.sql`

- Enable RLS untuk **28 tabel**
- Implementasi **80+ RLS policies**
- Helper functions: `auth.uid()`, `is_admin()`, `is_editor()`, `is_penulis()`, `is_percetakan()`
- Comprehensive security rules

### 2. Backend Files

#### `src/prisma/prisma.service.ts`

**Fitur Baru:**

```typescript
interface UserContext {
  userId: string;
  email: string;
  role?: string;
}

// Methods:
- setUserContext(context: UserContext): Promise<PrismaClient>
- clearUserContext(): Promise<void>
- withUserContext<T>(context, fn): Promise<T>
```

#### `src/common/middlewares/prisma-rls.middleware.ts`

**Fungsi:**

- Extract JWT token dari Authorization header
- Decode JWT untuk mendapatkan user info
- Inject user context ke Prisma session
- Auto cleanup setelah request selesai

#### `src/app.module.ts`

**Update:**

- Register `PrismaRlsMiddleware` untuk semua routes
- Exclude public routes (login, register, verify-email, dll)

## 🔐 RLS Security Model

### User Roles (JenisPeran)

```typescript
enum JenisPeran {
  penulis    // Author - create/manage manuscripts
  editor     // Editor - review manuscripts
  percetakan // Printing partner - manage orders
  admin      // Administrator - full access
}
```

### Helper Functions

#### `auth.uid()`

Mendapatkan user ID dari JWT claims

```sql
SELECT auth.uid(); -- Returns: UUID of current user
```

#### `is_admin()`, `is_editor()`, `is_penulis()`, `is_percetakan()`

Check user role

```sql
SELECT is_admin();     -- Returns: true/false
SELECT is_editor();    -- Returns: true/false
SELECT is_penulis();   -- Returns: true/false
SELECT is_percetakan(); -- Returns: true/false
```

## 📊 RLS Policies Summary

### 1. User Management Tables

#### `pengguna`

- ✅ Public: Melihat user yang aktif & terverifikasi
- ✅ Own: User bisa melihat/update data sendiri
- ✅ Admin: Full access semua user

#### `profil_pengguna`

- ✅ Public: Melihat profil public
- ✅ Own: Manage profil sendiri
- ✅ Admin: Full access

#### `peran_pengguna`

- ✅ Own: Melihat role sendiri
- ✅ Admin: Assign/manage roles

#### `profil_penulis`

- ✅ Public: Semua orang bisa lihat profil penulis
- ✅ Own: Penulis manage profil sendiri
- ✅ Admin: Full access

### 2. Content Management Tables

#### `naskah`

- ✅ Public: Melihat naskah yang publik & diterbitkan
- ✅ Penulis: Full access naskah sendiri
- ✅ Editor: Melihat naskah yang sedang direview atau assigned ke mereka
- ✅ Admin: Full access semua naskah

#### `kategori` & `genre`

- ✅ Public: Melihat kategori/genre aktif
- ✅ Admin: Manage kategori/genre

#### `tag` & `tag_naskah`

- ✅ Public: Melihat semua tags
- ✅ Penulis: Manage tags naskah sendiri
- ✅ Admin: Manage semua tags

#### `revisi_naskah`

- ✅ Penulis: Melihat/insert revisi naskah sendiri
- ✅ Editor: Melihat revisi naskah yang direview
- ✅ Admin: Full access

### 3. Review System Tables

#### `review_naskah`

- ✅ Penulis: Melihat review untuk naskah sendiri
- ✅ Editor: Full access review yang ditugaskan ke mereka
- ✅ Admin: Assign editor, manage semua review

#### `feedback_review`

- ✅ Penulis: Melihat feedback untuk naskah mereka
- ✅ Editor: Insert/update feedback untuk review mereka
- ✅ Admin: Full access

### 4. Printing System Tables

#### `pesanan_cetak`

- ✅ Pemesan: Full access pesanan sendiri
- ✅ Percetakan: Melihat & update status pesanan yang assigned
- ✅ Admin: Full access

#### `log_produksi`

- ✅ Pemesan: Melihat log produksi pesanan sendiri
- ✅ Percetakan: Insert log untuk pesanan mereka
- ✅ Admin: Full access

#### `pengiriman` & `tracking_log`

- ✅ Pemesan: Melihat tracking pesanan sendiri
- ✅ Percetakan: Manage pengiriman & insert tracking updates
- ✅ Admin: Full access

### 5. Payment System Tables

#### `pembayaran` ⚠️ SENSITIVE

- ✅ User: Hanya bisa akses pembayaran sendiri
- ✅ User: Insert/update pembayaran untuk pesanan sendiri
- ✅ Admin: Full access (verify, manage)

### 6. Supporting Systems

#### `notifikasi`

- ✅ User: Melihat & mark read notifikasi sendiri
- ✅ Admin: Insert notifikasi untuk user manapun
- ✅ Admin: Full access

#### `token_refresh`

- ✅ User: Melihat/insert/delete token sendiri
- ✅ Admin: Full access

#### `log_aktivitas`

- ✅ User: Melihat log sendiri
- ✅ System: Insert log untuk user manapun (system logs)
- ✅ Admin: Full access

#### `statistik_naskah`

- ✅ Public: Melihat statistik naskah publik
- ✅ Penulis: Melihat statistik naskah sendiri
- ✅ Admin: Full access

#### `rating_review`

- ✅ Public: Melihat rating naskah publik
- ✅ User: Insert/update rating sendiri
- ✅ Admin: Full access

#### `file`

- ✅ User: Melihat/insert/delete file sendiri
- ✅ Public: Melihat file dengan url_publik atau tujuan 'sampul'/'avatar'
- ✅ Admin: Full access

## 🚀 Realtime Enabled Tables

Total: **28 tabel** dengan realtime enabled

### High Priority (Real-time Critical)

1. `notifikasi` - Instant notifications
2. `pesanan_cetak` - Order status updates
3. `pengiriman` - Shipping tracking
4. `tracking_log` - Live location updates
5. `pembayaran` - Payment status
6. `review_naskah` - Review status changes
7. `feedback_review` - Editor feedback
8. `log_produksi` - Production progress

### Medium Priority

9. `naskah` - Manuscript status
10. `pengguna` - User online status
11. `log_aktivitas` - Activity tracking
12. `statistik_naskah` - Live statistics

### Low Priority (Background Updates)

13-28. Other tables for sync purposes

## 💻 Usage Examples

### Backend: Set User Context

#### Method 1: Automatic (via Middleware) ✅ RECOMMENDED

```typescript
// Middleware otomatis inject context dari JWT
// Tidak perlu kode tambahan, langsung pakai Prisma seperti biasa

@Controller("naskah")
export class NaskahController {
  @Get()
  async ambilSemuaNaskah() {
    // RLS otomatis berlaku! User hanya akan melihat naskah yang sesuai policy
    return this.prisma.naskah.findMany();
  }
}
```

#### Method 2: Manual Context

```typescript
// Jika butuh manual control
const result = await this.prisma.withUserContext(
  {
    userId: "user-uuid",
    email: "user@example.com",
    role: "penulis",
  },
  async (prisma) => {
    return prisma.naskah.findMany();
  }
);
```

### Frontend: Supabase Realtime Subscription

#### Setup Supabase Client

```typescript
// lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

#### Subscribe to Realtime Changes

```typescript
// Example: Subscribe to notifications
const subscription = supabase
  .channel("notifikasi-channel")
  .on(
    "postgres_changes",
    {
      event: "*", // INSERT, UPDATE, DELETE
      schema: "public",
      table: "notifikasi",
      filter: `id_pengguna=eq.${userId}`, // Filter by user
    },
    (payload) => {
      console.log("Notifikasi baru:", payload.new);
      // Update UI dengan notifikasi baru
      setNotifikasi((prev) => [...prev, payload.new]);
    }
  )
  .subscribe();

// Cleanup
return () => {
  subscription.unsubscribe();
};
```

#### Real-time Order Tracking

```typescript
// Track pesanan cetak real-time
const subscribeToOrder = (orderId: string) => {
  const channel = supabase
    .channel(`order-${orderId}`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "pesanan_cetak",
        filter: `id=eq.${orderId}`,
      },
      (payload) => {
        console.log("Status pesanan berubah:", payload.new.status);
        setOrderStatus(payload.new.status);
      }
    )
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "log_produksi",
        filter: `id_pesanan=eq.${orderId}`,
      },
      (payload) => {
        console.log("Progress produksi:", payload.new);
        setProductionLogs((prev) => [...prev, payload.new]);
      }
    )
    .subscribe();

  return () => channel.unsubscribe();
};
```

#### Real-time Manuscript Review

```typescript
// Subscribe ke review updates untuk penulis
const subscribeToReview = (naskahId: string) => {
  return supabase
    .channel(`review-${naskahId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "review_naskah",
        filter: `id_naskah=eq.${naskahId}`,
      },
      (payload) => {
        if (payload.eventType === "INSERT") {
          toast.success("Review baru ditugaskan");
        } else if (payload.eventType === "UPDATE") {
          toast.info(`Status review: ${payload.new.status}`);
        }
        refetchReviews();
      }
    )
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "feedback_review",
      },
      (payload) => {
        toast.info("Feedback baru dari editor");
        refetchFeedback();
      }
    )
    .subscribe();
};
```

## 🔧 Deployment Steps

### 1. Apply Migrations to Supabase

#### Via Supabase Dashboard

1. Login ke [Supabase Dashboard](https://app.supabase.com)
2. Pilih project Publishify
3. Go to **SQL Editor**
4. Copy-paste isi file `20250103_enable_realtime/migration.sql`
5. Execute SQL
6. Repeat untuk `20250103_enable_rls/migration.sql`

#### Via Prisma CLI

```bash
# Push schema ke database
cd backend
bun prisma db push

# Atau jalankan migrations
bun prisma migrate deploy
```

### 2. Verify RLS Setup

```sql
-- Check RLS enabled
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- List all policies
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Check realtime tables
SELECT schemaname, tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime';
```

### 3. Environment Variables

```env
# .env
DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/[DATABASE]?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/[DATABASE]"

# Supabase specific
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

### 4. Frontend Environment

```env
# frontend/.env.local
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
NEXT_PUBLIC_API_URL="http://localhost:4000"
```

## 🧪 Testing RLS

### Test Script

```typescript
// test/rls/rls.test.ts
describe("RLS Policies", () => {
  it("Penulis hanya bisa akses naskah sendiri", async () => {
    // Set context sebagai penulis A
    await prisma.setUserContext({
      userId: "penulis-a-uuid",
      email: "penulisA@example.com",
      role: "penulis",
    });

    // Query naskah - hanya dapat naskah penulis A
    const naskah = await prisma.naskah.findMany();

    expect(naskah.every((n) => n.idPenulis === "penulis-a-uuid")).toBe(true);
  });

  it("Editor bisa akses naskah yang direview", async () => {
    // Set context sebagai editor
    await prisma.setUserContext({
      userId: "editor-uuid",
      email: "editor@example.com",
      role: "editor",
    });

    // Query naskah - hanya dapat naskah yang assigned
    const naskah = await prisma.naskah.findMany();

    // Verify all naskah have review assigned to this editor
    for (const n of naskah) {
      const review = await prisma.reviewNaskah.findFirst({
        where: { idNaskah: n.id, idEditor: "editor-uuid" },
      });
      expect(review).toBeTruthy();
    }
  });

  it("User tidak bisa akses pembayaran orang lain", async () => {
    await prisma.setUserContext({
      userId: "user-a-uuid",
      email: "userA@example.com",
    });

    // Try to query pembayaran user lain
    const pembayaran = await prisma.pembayaran.findMany();

    // Hanya dapat pembayaran sendiri
    expect(pembayaran.every((p) => p.idPengguna === "user-a-uuid")).toBe(true);
  });
});
```

## 📈 Performance Considerations

### RLS Performance

- ✅ Index pada kolom yang digunakan di RLS policies
- ✅ Helper functions menggunakan `STABLE SECURITY DEFINER`
- ✅ Policies menggunakan EXISTS subquery yang efficient

### Realtime Performance

- ✅ Filter realtime subscriptions di client
- ✅ Unsubscribe saat component unmount
- ✅ Gunakan channel grouping untuk related tables

### Monitoring

```sql
-- Check slow queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
WHERE mean_exec_time > 100
ORDER BY mean_exec_time DESC
LIMIT 20;

-- Check RLS overhead
EXPLAIN ANALYZE
SELECT * FROM naskah WHERE id_penulis = 'some-uuid';
```

## 🔒 Security Best Practices

1. **Never bypass RLS**: Jangan gunakan service role key di client
2. **Validate JWT**: Pastikan JWT valid sebelum set context
3. **Audit logs**: Track semua access violations
4. **Regular review**: Review policies secara berkala
5. **Test extensively**: Test semua role combinations

## 🐛 Troubleshooting

### RLS Not Working?

```sql
-- Check if RLS enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'your_table';

-- Check policies
SELECT * FROM pg_policies WHERE tablename = 'your_table';

-- Check current JWT claims
SELECT current_setting('request.jwt.claims', true);
```

### Realtime Not Receiving Updates?

1. Check publication: `SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';`
2. Check replica identity: `SELECT relname, relreplident FROM pg_class WHERE relname = 'your_table';`
3. Verify Supabase realtime is enabled di dashboard
4. Check filter syntax di subscription

### Context Not Set?

1. Verify middleware registered di app.module.ts
2. Check JWT token di Authorization header
3. Check middleware tidak di-exclude untuk route tersebut
4. Verify JWT secret di config

## 📚 References

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Realtime Documentation](https://supabase.com/docs/guides/realtime)
- [PostgreSQL RLS Documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Prisma with PostgreSQL RLS](https://www.prisma.io/docs/guides/database/row-level-security)

## ✅ Checklist

- [x] Enable Realtime untuk 28 tabel
- [x] Set REPLICA IDENTITY FULL
- [x] Enable RLS untuk semua tabel
- [x] Implementasi 80+ RLS policies
- [x] Create helper functions (auth.uid, is_admin, dll)
- [x] Update prisma.service.ts dengan context methods
- [x] Create PrismaRlsMiddleware
- [x] Register middleware di app.module.ts
- [x] Add TypeScript types & interfaces
- [x] Documentation & examples
- [ ] Deploy migrations ke Supabase Production
- [ ] Test RLS dengan different roles
- [ ] Frontend implementation
- [ ] Performance testing
- [ ] Security audit

---

**Created**: 2025-01-03  
**Version**: 1.0.0  
**Status**: Ready for Testing & Deployment
