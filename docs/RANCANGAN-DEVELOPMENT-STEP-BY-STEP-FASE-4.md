# 🚀 DEVELOPMENT STEP BY STEP - FASE 4: PRINTING & SHIPPING SYSTEM

**Referensi**: RANCANGAN-FASE-4-PRINTING-SYSTEM.md  
**Prerequisites**: Fase 1-3 complete (Auth, Naskah, Review)  
**Target**: Implementasi Printing System lengkap dengan dynamic pricing, production tracking, dan shipping  
**Durasi**: 14 hari kerja (~98 jam)

> ⚠️ **PENTING**: Dokumen ini adalah RANCANGAN/BLUEPRINT untuk pembuatan laporan development actual berdasarkan code yang sudah ada di project.

---

## 📋 STRUKTUR LAPORAN DEVELOPMENT

Laporan development actual akan menjelaskan implementasi Printing & Shipping System yang sudah ada dengan detail step-by-step berdasarkan code actual.

---

## 1. PRISMA SCHEMA - PRINTING MODELS

### 1.1 Model PesananCetak

**Yang akan dijelaskan**: Model utama untuk pesanan cetak dengan 8 status

**Code dari `schema.prisma` (already exists)**:

```prisma
model PesananCetak {
  id                String         @id @default(uuid())
  idNaskah          String
  idPengguna        String          // Penulis yang memesan
  idPercetakan      String?         // Null if not assigned yet
  jumlah            Int
  jenisKertas       String          // HVS 70g, HVS 80g, Art Paper
  ukuranBuku        String          // A4, A5, B5
  jenisPenjilidan   String          // Soft Cover, Hard Cover
  laminating        Boolean         @default(false)
  hargaSatuan       Decimal         @db.Decimal(10,2)
  totalHarga        Decimal         @db.Decimal(12,2)
  status            StatusPesanan   @default(tertunda)
  alamatPengiriman  Json            // { nama, telepon, alamat, kota, provinsi, kodePos }
  catatanPercetakan String?         @db.Text
  dibuatPada        DateTime        @default(now())
  diperbaruiPada    DateTime        @updatedAt

  // Relations
  naskah     Naskah          @relation(fields: [idNaskah], references: [id])
  pengguna   Pengguna        @relation(fields: [idPengguna], references: [id])
  percetakan Pengguna?       @relation("Percetakan", fields: [idPercetakan], references: [id])
  logProduksi LogProduksi[]
  pengiriman Pengiriman?
  pembayaran Pembayaran[]

  @@index([idNaskah])
  @@index([idPengguna])
  @@index([idPercetakan])
  @@index([status])
  @@map("pesanan_cetak")
}

enum StatusPesanan {
  tertunda          // Payment pending
  diterima          // Percetakan accepted
  dalam_produksi    // In production
  kontrol_kualitas  // QC stage
  siap              // Ready to ship
  dikirim           // Shipped
  terkirim          // Delivered
  dibatalkan        // Cancelled

  @@map("status_pesanan")
}
```

**Status Workflow**:

1. `tertunda`: Pesanan dibuat, waiting for payment
2. `diterima`: Percetakan accepts order after payment
3. `dalam_produksi`: Printing in progress (5 stages tracked)
4. `kontrol_kualitas`: QC inspection
5. `siap`: Ready for pickup/shipment
6. `dikirim`: Order shipped
7. `terkirim`: Order delivered
8. `dibatalkan`: Order cancelled

### 1.2 Model ParameterHargaPercetakan

**Yang akan dijelaskan**: Dynamic pricing system dengan JSON schema

```prisma
model ParameterHargaPercetakan {
  id             String   @id @default(uuid())
  idPercetakan   String
  namaParameter  String   // "Harga Dasar 2024"
  deskripsi      String?  @db.Text
  parametersJson Json     // Flexible pricing rules
  aktif          Boolean  @default(true)
  dibuatPada     DateTime @default(now())
  diperbaruiPada DateTime @updatedAt

  percetakan Pengguna @relation(fields: [idPercetakan], references: [id])

  @@index([idPercetakan])
  @@map("parameter_harga_percetakan")
}
```

**parametersJson Structure** (Example):

```json
{
  "hargaDasar": {
    "softCover": 15000,
    "hardCover": 25000
  },
  "hargaKertas": {
    "HVS70g": 0,
    "HVS80g": 500,
    "ArtPaper": 1500
  },
  "hargaUkuran": {
    "A4": 2000,
    "A5": 0,
    "B5": 1000
  },
  "hargaLaminating": 3000,
  "diskonVolume": [
    { "minQty": 100, "discount": 0.05 },
    { "minQty": 500, "discount": 0.1 },
    { "minQty": 1000, "discount": 0.15 }
  ]
}
```

### 1.3 Model LogProduksi

**Yang akan dijelaskan**: Tracking 5 stages of production

```prisma
model LogProduksi {
  id           String   @id @default(uuid())
  idPesanan    String
  tahap        String   // "cetak", "potong", "jilid", "finishing", "packing"
  status       String   // "mulai", "selesai", "gagal"
  catatan      String?  @db.Text
  dikerjakanOleh String?
  waktu        DateTime @default(now())

  pesanan PesananCetak @relation(fields: [idPesanan], references: [id], onDelete: Cascade)

  @@index([idPesanan])
  @@index([tahap])
  @@map("log_produksi")
}
```

**5 Tahapan Produksi**:

1. `cetak`: Printing pages
2. `potong`: Cutting to size
3. `jilid`: Binding
4. `finishing`: Cover & laminating
5. `packing`: Packaging for shipment

### 1.4 Model Pengiriman

**Yang akan dijelaskan**: Shipping management with tracking

```prisma
model Pengiriman {
  id               String            @id @default(uuid())
  idPesanan        String            @unique
  kurir            String            // JNE, J&T, SiCepat
  nomorResi        String            @unique
  biayaKirim       Decimal           @db.Decimal(10,2)
  estimasiTiba     DateTime?
  tanggalKirim     DateTime          @default(now())
  tanggalTiba      DateTime?
  status           StatusPengiriman  @default(diproses)
  catatanKurir     String?           @db.Text
  dibuatPada       DateTime          @default(now())
  diperbaruiPada   DateTime          @updatedAt

  pesanan      PesananCetak  @relation(fields: [idPesanan], references: [id], onDelete: Cascade)
  trackingLogs TrackingLog[]

  @@index([status])
  @@map("pengiriman")
}

enum StatusPengiriman {
  diproses        // Processing shipment
  dalam_perjalanan // In transit
  terkirim        // Delivered
  gagal           // Failed delivery

  @@map("status_pengiriman")
}
```

### 1.5 Model TrackingLog

**Yang akan dijelaskan**: Detailed tracking history

```prisma
model TrackingLog {
  id           String     @id @default(uuid())
  idPengiriman String
  lokasi       String
  status       String
  keterangan   String?    @db.Text
  waktu        DateTime   @default(now())

  pengiriman Pengiriman @relation(fields: [idPengiriman], references: [id], onDelete: Cascade)

  @@index([idPengiriman])
  @@map("tracking_log")
}
```

### 1.6 Migration

**Commands yang sudah dijalankan**:

```bash
cd backend
bunx prisma migrate dev --name add_printing_system

# Verify
bunx prisma studio
# Check: pesanan_cetak, parameter_harga_percetakan, log_produksi, pengiriman, tracking_log
```

---

## 2. BACKEND - PERCETAKAN MODULE STRUCTURE

### 2.1 Module Files (Already Implemented)

```
modules/percetakan/
├── percetakan.module.ts
├── percetakan.controller.ts
├── percetakan.service.ts      # Core business logic
├── pricing.service.ts          # Dynamic pricing calculation
└── dto/
    ├── buat-pesanan.dto.ts
    ├── terima-pesanan.dto.ts
    ├── update-status-pesanan.dto.ts
    ├── tambah-log-produksi.dto.ts
    ├── buat-pengiriman.dto.ts
    ├── tambah-tracking.dto.ts
    └── index.ts
```

---

## 3. PRICING SERVICE - DYNAMIC CALCULATION

### 3.1 Method: hitungHarga() - Calculate Order Price

**File**: `backend/src/modules/percetakan/pricing.service.ts` (Already exists)

**Yang akan dijelaskan**:

```typescript
async hitungHarga(
  idPercetakan: string,
  jumlah: number,
  jenisKertas: string,
  ukuranBuku: string,
  jenisPenjilidan: string,
  laminating: boolean,
): Promise<{ hargaSatuan: number; totalHarga: number }> {
  // 1. Get parameter harga aktif
  const params = await this.prisma.parameterHargaPercetakan.findFirst({
    where: {
      idPercetakan,
      aktif: true,
    },
  });

  if (!params) {
    throw new NotFoundException('Parameter harga tidak ditemukan');
  }

  const rules = params.parametersJson as any;

  // 2. Calculate base price
  let hargaDasar = 0;
  if (jenisPenjilidan === 'Soft Cover') {
    hargaDasar = rules.hargaDasar.softCover || 15000;
  } else if (jenisPenjilidan === 'Hard Cover') {
    hargaDasar = rules.hargaDasar.hardCover || 25000;
  }

  // 3. Add paper cost
  const hargaKertas = rules.hargaKertas[jenisKertas] || 0;

  // 4. Add size cost
  const hargaUkuran = rules.hargaUkuran[ukuranBuku] || 0;

  // 5. Add laminating cost
  const hargaLam = laminating ? (rules.hargaLaminating || 3000) : 0;

  // 6. Calculate price per unit
  const hargaSatuan = hargaDasar + hargaKertas + hargaUkuran + hargaLam;

  // 7. Calculate total before discount
  let totalHarga = hargaSatuan * jumlah;

  // 8. Apply volume discount
  if (rules.diskonVolume && Array.isArray(rules.diskonVolume)) {
    // Sort descending by minQty
    const sortedDiscounts = rules.diskonVolume.sort(
      (a: any, b: any) => b.minQty - a.minQty
    );

    // Find applicable discount
    for (const tier of sortedDiscounts) {
      if (jumlah >= tier.minQty) {
        totalHarga = totalHarga * (1 - tier.discount);
        break;
      }
    }
  }

  return {
    hargaSatuan: Math.round(hargaSatuan),
    totalHarga: Math.round(totalHarga),
  };
}
```

**Example Calculation**:

- Order: 150 books, A5, HVS 80g, Soft Cover, dengan laminating
- Base: 15,000
- Kertas HVS80g: +500
- Ukuran A5: +0
- Laminating: +3,000
- **Harga satuan**: 18,500
- **Total**: 18,500 × 150 = 2,775,000
- **Diskon 5%** (qty ≥ 100): 2,775,000 × 0.95 = **2,636,250**

---

## 4. PERCETAKAN SERVICE IMPLEMENTATION

### 4.1 Method: buatPesanan() - Create Order

**File**: `percetakan.service.ts` (Already exists)

**Yang akan dijelaskan**:

```typescript
async buatPesanan(idPengguna: string, dto: BuatPesananDto) {
  // 1. Validate naskah exists and status=disetujui
  const naskah = await this.prisma.naskah.findUnique({
    where: { id: dto.idNaskah },
    select: {
      id: true,
      judul: true,
      status: true,
      idPenulis: true,
    },
  });

  if (!naskah) {
    throw new NotFoundException('Naskah tidak ditemukan');
  }

  if (naskah.status !== StatusNaskah.disetujui) {
    throw new BadRequestException(
      'Naskah harus berstatus disetujui untuk dicetak'
    );
  }

  // 2. Check ownership
  if (naskah.idPenulis !== idPengguna) {
    throw new ForbiddenException('Anda tidak memiliki akses ke naskah ini');
  }

  // 3. Get percetakan (if specified)
  let idPercetakan = dto.idPercetakan;
  if (!idPercetakan) {
    // Get default percetakan
    const defaultPercetakan = await this.prisma.pengguna.findFirst({
      where: {
        peranPengguna: {
          some: {
            jenisPeran: 'percetakan',
            aktif: true,
          },
        },
      },
    });

    if (defaultPercetakan) {
      idPercetakan = defaultPercetakan.id;
    }
  }

  // 4. Calculate price
  const pricing = await this.pricingService.hitungHarga(
    idPercetakan!,
    dto.jumlah,
    dto.jenisKertas,
    dto.ukuranBuku,
    dto.jenisPenjilidan,
    dto.laminating,
  );

  // 5. Create pesanan
  const pesanan = await this.prisma.pesananCetak.create({
    data: {
      idNaskah: dto.idNaskah,
      idPengguna,
      idPercetakan,
      jumlah: dto.jumlah,
      jenisKertas: dto.jenisKertas,
      ukuranBuku: dto.ukuranBuku,
      jenisPenjilidan: dto.jenisPenjilidan,
      laminating: dto.laminating,
      hargaSatuan: pricing.hargaSatuan,
      totalHarga: pricing.totalHarga,
      alamatPengiriman: dto.alamatPengiriman,
      catatanPercetakan: dto.catatan,
      status: StatusPesanan.tertunda,
    },
    include: {
      naskah: {
        select: {
          judul: true,
          penulis: {
            select: {
              profilPengguna: true,
            },
          },
        },
      },
    },
  });

  // 6. Notify percetakan
  if (idPercetakan) {
    await this.prisma.notifikasi.create({
      data: {
        idPengguna: idPercetakan,
        judul: 'Pesanan Cetak Baru',
        pesan: `Pesanan cetak "${naskah.judul}" menunggu konfirmasi`,
        tipe: 'info',
      },
    });
  }

  return {
    sukses: true,
    pesan: 'Pesanan berhasil dibuat',
    data: pesanan,
  };
}
```

### 4.2 Method: terimaPesanan() - Percetakan Accepts Order

**File**: `percetakan.service.ts` (Already exists)

**Yang akan dijelaskan**:

```typescript
async terimaPesanan(idPesanan: string, idPercetakan: string) {
  // 1. Get pesanan
  const pesanan = await this.prisma.pesananCetak.findUnique({
    where: { id: idPesanan },
    include: {
      naskah: true,
      pengguna: true,
    },
  });

  if (!pesanan) {
    throw new NotFoundException('Pesanan tidak ditemukan');
  }

  // 2. Validate percetakan ownership
  if (pesanan.idPercetakan !== idPercetakan) {
    throw new ForbiddenException('Anda tidak memiliki akses ke pesanan ini');
  }

  // 3. Validate status
  if (pesanan.status !== StatusPesanan.tertunda) {
    throw new BadRequestException(
      'Pesanan hanya bisa diterima jika statusnya tertunda'
    );
  }

  // 4. Update status to 'diterima'
  const updated = await this.prisma.pesananCetak.update({
    where: { id: idPesanan },
    data: {
      status: StatusPesanan.diterima,
    },
  });

  // 5. Notify penulis
  await this.prisma.notifikasi.create({
    data: {
      idPengguna: pesanan.idPengguna,
      judul: 'Pesanan Diterima',
      pesan: `Pesanan cetak "${pesanan.naskah.judul}" telah diterima percetakan`,
      tipe: 'sukses',
    },
  });

  return {
    sukses: true,
    pesan: 'Pesanan berhasil diterima',
    data: updated,
  };
}
```

### 4.3 Method: updateStatusPesanan() - Update Order Status

**File**: `percetakan.service.ts` (Already exists)

**Yang akan dijelaskan**:

```typescript
async updateStatusPesanan(
  idPesanan: string,
  idPercetakan: string,
  status: StatusPesanan,
) {
  // 1. Validate pesanan
  const pesanan = await this.prisma.pesananCetak.findUnique({
    where: { id: idPesanan },
    include: { naskah: true },
  });

  if (!pesanan) {
    throw new NotFoundException('Pesanan tidak ditemukan');
  }

  // 2. Check ownership
  if (pesanan.idPercetakan !== idPercetakan) {
    throw new ForbiddenException('Anda tidak memiliki akses ke pesanan ini');
  }

  // 3. Validate status transition
  const validTransitions: Record<StatusPesanan, StatusPesanan[]> = {
    tertunda: [StatusPesanan.diterima, StatusPesanan.dibatalkan],
    diterima: [StatusPesanan.dalam_produksi, StatusPesanan.dibatalkan],
    dalam_produksi: [StatusPesanan.kontrol_kualitas],
    kontrol_kualitas: [StatusPesanan.siap, StatusPesanan.dalam_produksi],
    siap: [StatusPesanan.dikirim],
    dikirim: [StatusPesanan.terkirim],
    terkirim: [],
    dibatalkan: [],
  };

  if (!validTransitions[pesanan.status].includes(status)) {
    throw new BadRequestException(
      `Invalid status transition: ${pesanan.status} → ${status}`
    );
  }

  // 4. Update status
  const updated = await this.prisma.pesananCetak.update({
    where: { id: idPesanan },
    data: { status },
  });

  // 5. Notify penulis
  const statusLabels = {
    diterima: 'diterima percetakan',
    dalam_produksi: 'sedang diproduksi',
    kontrol_kualitas: 'dalam kontrol kualitas',
    siap: 'siap dikirim',
    dikirim: 'sudah dikirim',
    terkirim: 'telah sampai',
    dibatalkan: 'dibatalkan',
  };

  await this.prisma.notifikasi.create({
    data: {
      idPengguna: pesanan.idPengguna,
      judul: 'Update Status Pesanan',
      pesan: `Pesanan "${pesanan.naskah.judul}" ${statusLabels[status]}`,
      tipe: status === StatusPesanan.dibatalkan ? 'peringatan' : 'info',
    },
  });

  return {
    sukses: true,
    pesan: 'Status pesanan berhasil diupdate',
    data: updated,
  };
}
```

---

## 5. PRODUCTION TRACKING

### 5.1 Method: tambahLogProduksi() - Track Production Stage

**File**: `percetakan.service.ts` (Already exists)

**Yang akan dijelaskan**:

```typescript
async tambahLogProduksi(
  idPesanan: string,
  idPercetakan: string,
  dto: TambahLogProduksiDto,
) {
  // 1. Validate pesanan
  const pesanan = await this.prisma.pesananCetak.findUnique({
    where: { id: idPesanan },
  });

  if (!pesanan) {
    throw new NotFoundException('Pesanan tidak ditemukan');
  }

  // 2. Check ownership
  if (pesanan.idPercetakan !== idPercetakan) {
    throw new ForbiddenException('Anda tidak memiliki akses ke pesanan ini');
  }

  // 3. Validate pesanan status
  if (pesanan.status !== StatusPesanan.dalam_produksi) {
    throw new BadRequestException(
      'Log produksi hanya bisa ditambahkan saat pesanan dalam produksi'
    );
  }

  // 4. Create log
  const log = await this.prisma.logProduksi.create({
    data: {
      idPesanan,
      tahap: dto.tahap,
      status: dto.status,
      catatan: dto.catatan,
      dikerjakanOleh: dto.dikerjakanOleh,
    },
  });

  // 5. Auto-update pesanan status if all stages complete
  const allLogs = await this.prisma.logProduksi.findMany({
    where: {
      idPesanan,
      status: 'selesai',
    },
  });

  const completedStages = new Set(allLogs.map(l => l.tahap));
  const requiredStages = ['cetak', 'potong', 'jilid', 'finishing', 'packing'];
  const allComplete = requiredStages.every(s => completedStages.has(s));

  if (allComplete) {
    await this.prisma.pesananCetak.update({
      where: { id: idPesanan },
      data: { status: StatusPesanan.kontrol_kualitas },
    });

    // Notify
    await this.prisma.notifikasi.create({
      data: {
        idPengguna: pesanan.idPengguna,
        judul: 'Produksi Selesai',
        pesan: 'Pesanan telah selesai diproduksi dan dalam tahap QC',
        tipe: 'info',
      },
    });
  }

  return {
    sukses: true,
    pesan: 'Log produksi berhasil ditambahkan',
    data: log,
  };
}
```

---

## 6. SHIPPING MANAGEMENT

### 6.1 Method: buatPengiriman() - Create Shipment

**File**: `percetakan.service.ts` (Already exists)

**Yang akan dijelaskan**:

```typescript
async buatPengiriman(
  idPesanan: string,
  idPercetakan: string,
  dto: BuatPengirimanDto,
) {
  // 1. Validate pesanan
  const pesanan = await this.prisma.pesananCetak.findUnique({
    where: { id: idPesanan },
    include: { pengiriman: true },
  });

  if (!pesanan) {
    throw new NotFoundException('Pesanan tidak ditemukan');
  }

  // 2. Check ownership
  if (pesanan.idPercetakan !== idPercetakan) {
    throw new ForbiddenException('Anda tidak memiliki akses ke pesanan ini');
  }

  // 3. Validate status = siap
  if (pesanan.status !== StatusPesanan.siap) {
    throw new BadRequestException(
      'Pengiriman hanya bisa dibuat jika pesanan statusnya siap'
    );
  }

  // 4. Check no existing shipment
  if (pesanan.pengiriman) {
    throw new ConflictException('Pesanan ini sudah memiliki pengiriman');
  }

  // 5. Create pengiriman & update pesanan status
  const pengiriman = await this.prisma.$transaction(async (prisma) => {
    const newShipment = await prisma.pengiriman.create({
      data: {
        idPesanan,
        kurir: dto.kurir,
        nomorResi: dto.nomorResi,
        biayaKirim: dto.biayaKirim,
        estimasiTiba: dto.estimasiTiba,
        status: StatusPengiriman.diproses,
        catatanKurir: dto.catatan,
      },
    });

    // Update pesanan status to 'dikirim'
    await prisma.pesananCetak.update({
      where: { id: idPesanan },
      data: { status: StatusPesanan.dikirim },
    });

    return newShipment;
  });

  // 6. Create initial tracking log
  await this.prisma.trackingLog.create({
    data: {
      idPengiriman: pengiriman.id,
      lokasi: 'Gudang Percetakan',
      status: 'Paket diterima kurir',
      keterangan: 'Pesanan siap dikirim',
    },
  });

  // 7. Notify penulis
  await this.prisma.notifikasi.create({
    data: {
      idPengguna: pesanan.idPengguna,
      judul: 'Pesanan Dikirim',
      pesan: `Pesanan telah dikirim via ${dto.kurir}. Resi: ${dto.nomorResi}`,
      tipe: 'sukses',
    },
  });

  return {
    sukses: true,
    pesan: 'Pengiriman berhasil dibuat',
    data: pengiriman,
  };
}
```

### 6.2 Method: tambahTracking() - Add Tracking Update

**File**: `percetakan.service.ts` (Already exists)

**Yang akan dijelaskan**:

```typescript
async tambahTracking(
  idPengiriman: string,
  dto: TambahTrackingDto,
) {
  // 1. Validate pengiriman
  const pengiriman = await this.prisma.pengiriman.findUnique({
    where: { id: idPengiriman },
    include: {
      pesanan: {
        select: {
          idPengguna: true,
          naskah: { select: { judul: true } },
        },
      },
    },
  });

  if (!pengiriman) {
    throw new NotFoundException('Pengiriman tidak ditemukan');
  }

  // 2. Create tracking log
  const tracking = await this.prisma.trackingLog.create({
    data: {
      idPengiriman,
      lokasi: dto.lokasi,
      status: dto.status,
      keterangan: dto.keterangan,
      waktu: dto.waktu || new Date(),
    },
  });

  // 3. Auto-update pengiriman status if delivered
  if (dto.status.toLowerCase().includes('terkirim') ||
      dto.status.toLowerCase().includes('delivered')) {
    await this.prisma.$transaction(async (prisma) => {
      // Update pengiriman status
      await prisma.pengiriman.update({
        where: { id: idPengiriman },
        data: {
          status: StatusPengiriman.terkirim,
          tanggalTiba: new Date(),
        },
      });

      // Update pesanan status
      await prisma.pesananCetak.update({
        where: { id: pengiriman.idPesanan },
        data: { status: StatusPesanan.terkirim },
      });
    });

    // Notify penulis
    await this.prisma.notifikasi.create({
      data: {
        idPengguna: pengiriman.pesanan.idPengguna,
        judul: 'Pesanan Terkirim',
        pesan: `Pesanan "${pengiriman.pesanan.naskah.judul}" telah sampai`,
        tipe: 'sukses',
      },
    });
  }

  return {
    sukses: true,
    pesan: 'Tracking update berhasil ditambahkan',
    data: tracking,
  };
}
```

---

## 7. FRONTEND - PERCETAKAN DASHBOARD

### 7.1 Percetakan Page - Daftar Pesanan

**File**: `frontend/app/(percetakan)/percetakan/pesanan/page.tsx` (Already exists)

**Features**:

- Tab: Tertunda, Diterima, Dalam Produksi, Siap, Dikirim, Selesai
- Kartu pesanan dengan info naskah & penulis
- Button "Terima" (status=tertunda)
- Button "Lihat Detail" (all status)

### 7.2 Percetakan Page - Detail Pesanan

**File**: `frontend/app/(percetakan)/percetakan/pesanan/[id]/page.tsx` (Already exists)

**Features**:

- Info pesanan lengkap (naskah, jumlah, spesifikasi, harga)
- Alamat pengiriman
- Button actions:
  - "Terima Pesanan" (tertunda)
  - "Mulai Produksi" (diterima)
  - "Tambah Log Produksi" (dalam_produksi)
  - "Selesai QC" (kontrol_kualitas)
  - "Buat Pengiriman" (siap)

### 7.3 Percetakan Page - Tracking Produksi

**File**: `frontend/app/(percetakan)/percetakan/pesanan/[id]/produksi/page.tsx` (Already exists)

**Features**:

- Stepper UI untuk 5 tahapan produksi
- Visual progress indicator
- Form tambah log untuk setiap tahap
- Timeline log produksi

### 7.4 Percetakan Page - Parameter Harga

**File**: `frontend/app/(percetakan)/percetakan/parameter-harga/page.tsx` (Already exists)

**Features**:

- List parameter harga
- Button "Buat Parameter Baru"
- Toggle aktif/nonaktif
- Edit parameter (JSON editor)

**Yang akan dijelaskan**:

- JSON editor untuk parametersJson
- Validation for pricing structure
- Preview calculation dengan example order

---

## 8. FRONTEND - PENULIS ORDER FLOW

### 8.1 Penulis Page - Buat Pesanan Cetak

**File**: `frontend/app/(penulis)/penulis/pesanan/buat/page.tsx` (Already exists)

**Features**:

- Form pesanan dengan React Hook Form
- Dropdown: Jenis Kertas, Ukuran, Penjilidan
- Checkbox: Laminating
- Input: Jumlah (with validation min 50)
- Real-time price calculation
- Address form (shipping)
- Button "Hitung Harga" → "Buat Pesanan"

**Yang akan dijelaskan**:

```typescript
// Real-time price calculation
const watchFields = form.watch([
  "jumlah",
  "jenisKertas",
  "ukuranBuku",
  "jenisPenjilidan",
  "laminating",
]);

useEffect(() => {
  if (allFieldsFilled) {
    hitungHarga();
  }
}, [watchFields]);

const hitungHarga = async () => {
  const result = await percetakanApi.hitungHarga({
    idPercetakan: selectedPercetakan,
    ...formValues,
  });

  setHargaSatuan(result.hargaSatuan);
  setTotalHarga(result.totalHarga);
};
```

### 8.2 Penulis Page - Daftar Pesanan Saya

**File**: `frontend/app/(penulis)/penulis/pesanan/page.tsx` (Already exists)

**Features**:

- Tab by status
- Kartu pesanan dengan detail
- Button "Lihat Detail"
- Button "Bayar" (tertunda)
- Button "Lacak" (dikirim)

### 8.3 Penulis Page - Detail Pesanan

**File**: `frontend/app/(penulis)/penulis/pesanan/[id]/page.tsx` (Already exists)

**Features**:

- Info pesanan lengkap
- Spesifikasi cetak
- Status timeline
- Tracking pengiriman (if dikirim)
- Download invoice

---

## 9. API INTEGRATION - FRONTEND

### 9.1 Percetakan API Client

**File**: `frontend/lib/api/percetakan.ts` (Already exists)

```typescript
export const percetakanApi = {
  // Order management
  ambilDaftarPesanan: async (status?: string) => {
    const { data } = await api.get("/percetakan/pesanan", {
      params: status ? { status } : {},
    });
    return data;
  },

  terimaPesanan: async (idPesanan: string) => {
    const { data } = await api.put(`/percetakan/pesanan/${idPesanan}/terima`);
    return data;
  },

  updateStatus: async (idPesanan: string, status: string) => {
    const { data } = await api.put(`/percetakan/pesanan/${idPesanan}/status`, {
      status,
    });
    return data;
  },

  // Production tracking
  tambahLogProduksi: async (idPesanan: string, payload: LogProduksiPayload) => {
    const { data } = await api.post(
      `/percetakan/pesanan/${idPesanan}/log-produksi`,
      payload
    );
    return data;
  },

  ambilLogProduksi: async (idPesanan: string) => {
    const { data } = await api.get(
      `/percetakan/pesanan/${idPesanan}/log-produksi`
    );
    return data;
  },

  // Shipping
  buatPengiriman: async (idPesanan: string, payload: PengirimanPayload) => {
    const { data } = await api.post(
      `/percetakan/pesanan/${idPesanan}/pengiriman`,
      payload
    );
    return data;
  },

  tambahTracking: async (idPengiriman: string, payload: TrackingPayload) => {
    const { data } = await api.post(
      `/percetakan/pengiriman/${idPengiriman}/tracking`,
      payload
    );
    return data;
  },

  lacakPengiriman: async (idPengiriman: string) => {
    const { data } = await api.get(
      `/percetakan/pengiriman/${idPengiriman}/tracking`
    );
    return data;
  },

  // Pricing
  hitungHarga: async (payload: HitungHargaPayload) => {
    const { data } = await api.post("/percetakan/hitung-harga", payload);
    return data;
  },

  // Parameter harga
  ambilParameterHarga: async () => {
    const { data } = await api.get("/percetakan/parameter-harga");
    return data;
  },

  buatParameterHarga: async (payload: ParameterHargaPayload) => {
    const { data } = await api.post("/percetakan/parameter-harga", payload);
    return data;
  },

  updateParameterHarga: async (id: string, payload: ParameterHargaPayload) => {
    const { data } = await api.put(
      `/percetakan/parameter-harga/${id}`,
      payload
    );
    return data;
  },
};
```

---

## 10. COMPLETE WORKFLOW TESTING

### 10.1 Test Scenario 1: Penulis Creates Order

**Steps**:

1. Penulis login, go to /penulis/pesanan/buat
2. Select naskah (must be status=disetujui)
3. Fill order form:
   - Jumlah: 200
   - Jenis Kertas: HVS 80g
   - Ukuran: A5
   - Penjilidan: Soft Cover
   - Laminating: Yes
4. Click "Hitung Harga"
5. See price calculation (hargaSatuan + totalHarga dengan diskon)
6. Fill shipping address
7. Submit order
8. Verify: Pesanan created with status=tertunda

**API Call**:

```http
POST http://localhost:3000/api/percetakan/pesanan
{
  "idNaskah": "uuid-naskah",
  "jumlah": 200,
  "jenisKertas": "HVS 80g",
  "ukuranBuku": "A5",
  "jenisPenjilidan": "Soft Cover",
  "laminating": true,
  "alamatPengiriman": {
    "nama": "John Doe",
    "telepon": "08123456789",
    "alamat": "Jl. Merdeka No. 10",
    "kota": "Jakarta",
    "provinsi": "DKI Jakarta",
    "kodePos": "12345"
  },
  "catatan": "Tolong kirim secepatnya"
}
```

### 10.2 Test Scenario 2: Full Production & Shipping Flow

**Steps**:

1. Percetakan login, go to /percetakan/pesanan
2. See order in "Tertunda" tab
3. Click "Terima Pesanan" → status: tertunda → diterima
4. Click "Mulai Produksi" → status: diterima → dalam_produksi
5. Add production logs:
   - Tahap "cetak" → status "selesai"
   - Tahap "potong" → status "selesai"
   - Tahap "jilid" → status "selesai"
   - Tahap "finishing" → status "selesai"
   - Tahap "packing" → status "selesai"
6. Auto-update: dalam_produksi → kontrol_kualitas
7. Click "Selesai QC" → kontrol_kualitas → siap
8. Click "Buat Pengiriman":
   - Kurir: JNE
   - Nomor Resi: JNE1234567890
   - Biaya Kirim: 50000
   - Estimasi: 3 hari
9. Submit → status: siap → dikirim
10. Add tracking updates:
    - "Jakarta Hub - Paket diterima"
    - "Dalam perjalanan ke Bandung"
    - "Bandung Hub - Paket sampai"
    - "Paket sedang diantar kurir"
    - "Paket telah diterima penerima"
11. Auto-update: dikirim → terkirim
12. Penulis receives notification

**API Calls**:

```http
# 1. Terima pesanan
PUT http://localhost:3000/api/percetakan/pesanan/{id}/terima

# 2. Update status
PUT http://localhost:3000/api/percetakan/pesanan/{id}/status
{ "status": "dalam_produksi" }

# 3. Add production logs (repeat for each stage)
POST http://localhost:3000/api/percetakan/pesanan/{id}/log-produksi
{
  "tahap": "cetak",
  "status": "selesai",
  "catatan": "Cetak 200 eksemplar selesai",
  "dikerjakanOleh": "Operator A"
}

# 4. Create shipment
POST http://localhost:3000/api/percetakan/pesanan/{id}/pengiriman
{
  "kurir": "JNE",
  "nomorResi": "JNE1234567890",
  "biayaKirim": 50000,
  "estimasiTiba": "2024-01-15T10:00:00Z",
  "catatan": "Paket fragile, handle with care"
}

# 5. Add tracking (repeat for each update)
POST http://localhost:3000/api/percetakan/pengiriman/{id}/tracking
{
  "lokasi": "Jakarta Hub",
  "status": "Paket diterima",
  "keterangan": "Paket dalam proses sortir",
  "waktu": "2024-01-12T08:00:00Z"
}
```

---

## 11. METRICS FASE 4

**Total Time**: ~98 jam (14 hari kerja)  
**Backend LOC**: +4,000  
**Frontend LOC**: +5,500  
**Database Tables Added**: 5 (pesanan_cetak, parameter_harga_percetakan, log_produksi, pengiriman, tracking_log)  
**API Endpoints Added**: +20

**Deliverables**:
✅ Order creation system dengan dynamic pricing  
✅ Parameter harga percetakan (flexible JSON schema)  
✅ Production tracking (5 stages)  
✅ Quality control stage  
✅ Shipping management dengan tracking  
✅ Status workflow (8 statuses)  
✅ Real-time notifications  
✅ Percetakan dashboard functional  
✅ Penulis order flow complete  
✅ Price calculation with volume discount

---

## 12. NEXT STEPS → FASE 5

Fase 5 will implement:

- Redis caching strategy
- Database optimization (indexes, N+1 prevention)
- RLS policies for security
- Comprehensive testing (unit, integration, E2E)
- Security hardening
- Docker containerization
- CI/CD pipeline
- Performance monitoring

---

**END OF RANCANGAN FASE 4**

_Catatan: Ini adalah RANCANGAN untuk pembuatan laporan development actual. Laporan actual akan berisi penjelasan detail dari code yang sudah ada dengan screenshot dan flow diagram._
