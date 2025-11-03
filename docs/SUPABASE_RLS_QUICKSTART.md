# 🚀 Quick Start: Supabase RLS + Realtime - Publishify

## ✅ Apa yang Sudah Dibuat?

### 1. Database Migrations (2 files)

📁 `prisma/migrations/20250103_enable_realtime/migration.sql`

- ✅ Enable realtime untuk **28 tabel**
- ✅ Set REPLICA IDENTITY FULL
- ✅ Configure Supabase realtime publication

📁 `prisma/migrations/20250103_enable_rls/migration.sql`

- ✅ Enable RLS untuk **28 tabel**
- ✅ **80+ RLS policies** komprehensif
- ✅ Helper functions: `auth.uid()`, `is_admin()`, `is_editor()`, `is_penulis()`, `is_percetakan()`

### 2. Backend Code (3 files)

📄 `src/prisma/prisma.service.ts`

- ✅ Method `setUserContext()` untuk inject JWT ke session
- ✅ Method `clearUserContext()` untuk cleanup
- ✅ Method `withUserContext()` untuk wrapper otomatis

📄 `src/common/middlewares/prisma-rls.middleware.ts`

- ✅ Auto extract JWT dari Authorization header
- ✅ Auto inject context ke setiap request
- ✅ Auto cleanup setelah response

📄 `src/app.module.ts`

- ✅ Register middleware global
- ✅ Exclude public routes (login, register, dll)

### 3. Documentation

📚 `docs/SUPABASE_RLS_REALTIME_GUIDE.md` - Panduan lengkap 400+ baris

---

## 🎯 Cara Deploy

### Step 1: Apply Migrations ke Supabase

```bash
# Option A: Via Supabase Dashboard
# 1. Login ke https://app.supabase.com
# 2. Pilih project → SQL Editor
# 3. Copy-paste migration files → Execute

# Option B: Via Prisma CLI
cd backend
bun prisma db push
```

### Step 2: Verify Setup

```sql
-- Check RLS enabled (should return true untuk semua tabel)
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- Check policies (should return 80+ policies)
SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public';

-- Check realtime (should return 28 tables)
SELECT COUNT(*) FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
```

### Step 3: Test Backend

```bash
cd backend
bun run start:dev

# Test dengan JWT token
curl http://localhost:4000/api/naskah \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🔐 RLS Policies Cheat Sheet

### Penulis Role

```
✅ Naskah: Full access naskah sendiri
✅ Review: Melihat review untuk naskah sendiri
✅ Feedback: Melihat feedback dari editor
✅ Pesanan: Full access pesanan sendiri
✅ Pembayaran: Full access pembayaran sendiri
❌ Naskah orang lain: Hanya jika publik & diterbitkan
```

### Editor Role

```
✅ Naskah: Melihat naskah yang direview
✅ Review: Full access review yang assigned
✅ Feedback: Insert/update feedback
❌ Naskah lain: Tidak bisa akses
❌ Pembayaran: Tidak bisa akses
```

### Percetakan Role

```
✅ Pesanan: Melihat & update pesanan yang assigned
✅ Pengiriman: Manage pengiriman
✅ Tracking: Insert tracking updates
❌ Pembayaran: Tidak bisa akses
❌ Naskah: Tidak bisa akses
```

### Admin Role

```
✅ ALL: Full access ke semua tabel
✅ Assign: Bisa assign editor & percetakan
✅ Manage: Bisa manage users, roles, dll
```

---

## 💻 Backend Usage

### Otomatis (Recommended) ✅

Middleware sudah handle semua! Tidak perlu kode tambahan:

```typescript
@Controller("naskah")
export class NaskahController {
  @Get()
  async ambilSemuaNaskah() {
    // RLS otomatis berlaku berdasarkan JWT token!
    // User hanya akan dapat data sesuai policy
    return this.prisma.naskah.findMany();
  }
}
```

### Manual (Advanced)

Jika butuh control manual:

```typescript
// Option 1: Set context manual
await this.prisma.setUserContext({
  userId: "uuid",
  email: "user@email.com",
  role: "penulis",
});

const data = await this.prisma.naskah.findMany();
await this.prisma.clearUserContext();

// Option 2: Wrapper auto cleanup
const data = await this.prisma.withUserContext(
  { userId, email, role },
  async (prisma) => {
    return prisma.naskah.findMany();
  }
);
```

---

## 🌐 Frontend: Realtime Subscriptions

### Setup Supabase Client

```bash
cd frontend
bun add @supabase/supabase-js
```

```typescript
// lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

### Subscribe ke Notifikasi Real-time

```typescript
"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function useNotifikasi(userId: string) {
  const [notifikasi, setNotifikasi] = useState([]);

  useEffect(() => {
    // Subscribe ke notifikasi user
    const channel = supabase
      .channel("notifikasi-channel")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifikasi",
          filter: `id_pengguna=eq.${userId}`,
        },
        (payload) => {
          // Notifikasi baru masuk!
          setNotifikasi((prev) => [payload.new, ...prev]);
          toast.success(payload.new.judul);
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [userId]);

  return notifikasi;
}
```

### Track Pesanan Real-time

```typescript
export function useOrderTracking(orderId: string) {
  const [status, setStatus] = useState("");
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const channel = supabase
      .channel(`order-${orderId}`)
      // Subscribe ke update status pesanan
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "pesanan_cetak",
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          setStatus(payload.new.status);
        }
      )
      // Subscribe ke log produksi baru
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "log_produksi",
          filter: `id_pesanan=eq.${orderId}`,
        },
        (payload) => {
          setLogs((prev) => [...prev, payload.new]);
        }
      )
      // Subscribe ke tracking pengiriman
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "tracking_log",
        },
        (payload) => {
          toast.info(`Paket di ${payload.new.lokasi}`);
        }
      )
      .subscribe();

    return () => channel.unsubscribe();
  }, [orderId]);

  return { status, logs };
}
```

### Review Real-time untuk Penulis

```typescript
export function useReviewUpdates(naskahId: string) {
  const [reviews, setReviews] = useState([]);
  const [feedback, setFeedback] = useState([]);

  useEffect(() => {
    const channel = supabase
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
            toast.info(`Status: ${payload.new.status}`);
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
          setFeedback((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => channel.unsubscribe();
  }, [naskahId]);

  return { reviews, feedback };
}
```

---

## 🧪 Testing RLS

### Test User Isolation

```typescript
// Test: Penulis A tidak bisa akses naskah Penulis B
const penulisA = await testLogin("penulisA@test.com");
const response = await fetch("http://localhost:4000/api/naskah", {
  headers: { Authorization: `Bearer ${penulisA.token}` },
});
const naskah = await response.json();

// Assert: Hanya naskah penulis A
expect(naskah.data.every((n) => n.idPenulis === penulisA.id)).toBe(true);
```

### Test Role Access

```typescript
// Test: Editor hanya bisa akses naskah yang assigned
const editor = await testLogin("editor@test.com");
const response = await fetch("http://localhost:4000/api/naskah", {
  headers: { Authorization: `Bearer ${editor.token}` },
});
const naskah = await response.json();

// Assert: Semua naskah punya review untuk editor ini
for (const n of naskah.data) {
  const review = await prisma.reviewNaskah.findFirst({
    where: { idNaskah: n.id, idEditor: editor.id },
  });
  expect(review).toBeTruthy();
}
```

### Test Payment Security

```typescript
// Test: User tidak bisa akses pembayaran orang lain
const userA = await testLogin("userA@test.com");
const userB = await testLogin("userB@test.com");

// Create pembayaran for user B
await createPembayaran({ idPengguna: userB.id, jumlah: 100000 });

// Try to access as user A
const response = await fetch("http://localhost:4000/api/pembayaran", {
  headers: { Authorization: `Bearer ${userA.token}` },
});
const pembayaran = await response.json();

// Assert: User A tidak dapat pembayaran user B
expect(pembayaran.data.find((p) => p.idPengguna === userB.id)).toBeUndefined();
```

---

## 🔧 Troubleshooting

### RLS tidak bekerja?

```sql
-- 1. Check RLS enabled
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'naskah';
-- Expected: rowsecurity = true

-- 2. Check policies exist
SELECT * FROM pg_policies WHERE tablename = 'naskah';
-- Expected: Multiple policies returned

-- 3. Check JWT claims di session
SELECT current_setting('request.jwt.claims', true);
-- Expected: JSON dengan sub, email, role
```

### Realtime tidak update?

```sql
-- 1. Check publication
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
-- Expected: 28 tables listed

-- 2. Check replica identity
SELECT relname, relreplident FROM pg_class WHERE relname = 'notifikasi';
-- Expected: relreplident = 'f' (FULL)
```

### Middleware tidak jalan?

```typescript
// 1. Check middleware registered di app.module.ts
// 2. Check route tidak di-exclude
// 3. Check JWT token format: "Bearer <token>"
// 4. Check JWT secret di .env sesuai
```

---

## 📊 Performance Tips

### Backend

```typescript
// ✅ GOOD: Select spesifik fields
const naskah = await prisma.naskah.findMany({
  select: {
    id: true,
    judul: true,
    status: true,
    penulis: {
      select: { id: true, email: true },
    },
  },
});

// ❌ BAD: Include all relations
const naskah = await prisma.naskah.findMany({
  include: { penulis: true, revisi: true, review: true },
});
```

### Frontend Realtime

```typescript
// ✅ GOOD: Filter di subscription
.on('postgres_changes', {
  filter: `id_pengguna=eq.${userId}` // Filter di DB
}, handler)

// ✅ GOOD: Unsubscribe saat unmount
useEffect(() => {
  const channel = supabase.channel('my-channel').subscribe();
  return () => channel.unsubscribe(); // Cleanup!
}, []);

// ❌ BAD: Subscribe tanpa filter
.on('postgres_changes', {
  table: 'notifikasi' // Akan dapat SEMUA notifikasi!
}, handler)
```

---

## 🎉 Summary

### ✅ Completed

1. ✅ Enable Realtime untuk 28 tabel
2. ✅ Enable RLS untuk 28 tabel
3. ✅ Implementasi 80+ RLS policies
4. ✅ Helper functions di database
5. ✅ Backend middleware auto-inject context
6. ✅ TypeScript types & interfaces
7. ✅ Comprehensive documentation
8. ✅ TypeScript compilation: 0 errors

### 🚀 Next Steps

1. Deploy migrations ke Supabase Production
2. Test RLS dengan berbagai role
3. Implement frontend realtime subscriptions
4. Performance testing & optimization
5. Security audit

### 📚 Docs

- Full Guide: `docs/SUPABASE_RLS_REALTIME_GUIDE.md`
- This Quick Start: `docs/SUPABASE_RLS_QUICKSTART.md`
- Database Schema: `docs/database-schema.md`

---

**Status**: ✅ Ready for Testing & Deployment  
**Version**: 1.0.0  
**Date**: 2025-01-03
