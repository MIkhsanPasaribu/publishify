# 📁 FASE 4: PRINTING & ORDER MANAGEMENT SYSTEM

**Periode**: Minggu 7-8  
**Focus**: Sistem percetakan lengkap dengan tarif dinamis, tracking produksi, dan pengiriman  
**Output**: Panel percetakan functional, Order management complete, Shipping integration

---

## 📋 LAPORAN PROGRESS FASE 4

### **File**: `LAPORAN-PROGRESS-FASE-4-PRINTING-SYSTEM.md`

#### **Konten yang Harus Dibahas:**

---

### 1. PRINTING SYSTEM ARCHITECTURE

#### 1.1 Overview Sistem Percetakan

**Actors**:

1. **Penulis**: Order cetak fisik untuk naskah terbit
2. **Percetakan**: Mitra percetakan yang terima & proses pesanan
3. **Admin**: Monitor & manage seluruh pesanan

**Workflow**:

```
Penulis Order → Pilih Percetakan → Input Spesifikasi → Hitung Harga →
Bayar → Percetakan Terima/Tolak → Produksi (5 tahap) → Kirim → Terkirim
```

**5 Database Tables**:

- `pesanan_cetak`: Main order entity
- `parameter_harga_percetakan`: Dynamic pricing schema
- `log_produksi`: Production status logs
- `pengiriman`: Shipping information
- `tracking_log`: Shipping status history

---

### 2. PESANAN CETAK MODULE

#### 2.1 Pesanan Cetak Model

```prisma
model PesananCetak {
  id                String         @id @default(uuid())
  idNaskah          String
  idPenulis         String
  idPercetakan      String

  // Spesifikasi Cetak
  formatBuku        FormatBuku     @default(A5)
  jenisKertas       JenisKertas    @default(HVS)
  jenisCover        JenisCover     @default(SOFTCOVER)
  cetakWarna        Boolean        @default(false)
  jumlah            Int            // Quantity

  // Financial
  totalBiaya        Decimal        @db.Decimal(10, 2)
  biayaProduksi     Decimal        @db.Decimal(10, 2)
  biayaPengiriman   Decimal        @db.Decimal(10, 2)

  // Status & Timeline
  status            StatusPesanan  @default(tertunda)
  alamatPengiriman  String         @db.Text
  catatanPesanan    String?        @db.Text
  dibuatPada        DateTime       @default(now())
  diperbaruiPada    DateTime       @updatedAt

  // Relations
  naskah       Naskah          @relation(fields: [idNaskah], references: [id])
  penulis      Pengguna        @relation(fields: [idPenulis], references: [id])
  percetakan   Pengguna        @relation("PesananPercetakan", fields: [idPercetakan], references: [id])
  logProduksi  LogProduksi[]
  pengiriman   Pengiriman?
  pembayaran   Pembayaran[]

  @@index([idPenulis])
  @@index([idPercetakan])
  @@index([status])
  @@map("pesanan_cetak")
}

enum StatusPesanan {
  tertunda           // Pending confirmation
  diterima           // Accepted by percetakan
  dalam_produksi     // In production
  kontrol_kualitas   // Quality check
  siap               // Ready to ship
  dikirim            // Shipped
  terkirim           // Delivered
  selesai            // Completed
  dibatalkan         // Cancelled

  @@map("status_pesanan")
}
```

#### 2.2 Backend Endpoints

**Create Order (Penulis)**:

```typescript
POST /api/percetakan/pesanan
Body: {
  idNaskah: UUID,
  idPercetakan: UUID,
  formatBuku: 'A4' | 'A5' | 'B5',
  jenisKertas: 'HVS' | 'BOOKPAPER' | 'ART_PAPER',
  jenisCover: 'SOFTCOVER' | 'HARDCOVER',
  cetakWarna: boolean,
  jumlah: number,
  alamatPengiriman: string
}
```

**List Orders (Multi-role)**:

```typescript
// Penulis: Own orders
GET / api / percetakan / pesanan / saya;

// Percetakan: Assigned orders
GET / api / percetakan / pesanan / percetakan - saya;

// Admin: All orders
GET / api / percetakan / pesanan;
```

**Confirm/Reject Order (Percetakan)**:

```typescript
PUT /api/percetakan/pesanan/:id/konfirmasi
Body: { terima: boolean, catatan?: string }
```

**Update Status (Percetakan)**:

```typescript
PUT /api/percetakan/pesanan/:id/status
Body: { status: StatusPesanan, catatan?: string }
```

---

### 3. DYNAMIC PRICING SYSTEM

#### 3.1 Parameter Harga Model

```prisma
model ParameterHargaPercetakan {
  id              String   @id @default(uuid())
  idPercetakan    String
  namaSkema       String   // "Tarif Standar", "Tarif Diskon"
  komponenHarga   Json     // Flexible pricing components
  aktif           Boolean  @default(true)
  berlakuMulai    DateTime @default(now())
  berlakuHingga   DateTime?
  dibuatPada      DateTime @default(now())
  diperbaruiPada  DateTime @updatedAt

  percetakan Pengguna @relation("ParameterHarga", fields: [idPercetakan], references: [id])

  @@map("parameter_harga_percetakan")
}
```

#### 3.2 Komponen Harga Structure (JSON)

```typescript
interface KomponenHarga {
  // Base prices per format
  hargaDasar: {
    A4: number;
    A5: number;
    B5: number;
  };

  // Price per page (varies by paper type)
  hargaPerHalaman: {
    HVS: number;
    BOOKPAPER: number;
    ART_PAPER: number;
  };

  // Cover prices
  hargaCover: {
    SOFTCOVER: number;
    HARDCOVER: number;
  };

  // Color printing markup (percentage)
  markupWarna: number; // e.g., 30 (means +30%)

  // Quantity discounts (tier-based)
  diskonJumlah: Array<{
    minJumlah: number;
    diskonPersen: number;
  }>;
  // Example: [
  //   { minJumlah: 50, diskonPersen: 5 },
  //   { minJumlah: 100, diskonPersen: 10 },
  //   { minJumlah: 500, diskonPersen: 15 }
  // ]

  // Shipping cost calculation
  biayaPengiriman: {
    hargaDasar: number;
    hargaPerKg: number;
    beratPerBuku: number; // kg
  };
}
```

#### 3.3 Price Calculation Logic

```typescript
// percetakan.service.ts
async hitungHarga(dto: HitungHargaDto): Promise<HitungHargaResponse> {
  const { idPercetakan, idNaskah, formatBuku, jenisKertas, jenisCover, cetakWarna, jumlah } = dto;

  // Get active pricing schema
  const schema = await this.prisma.parameterHargaPercetakan.findFirst({
    where: {
      idPercetakan,
      aktif: true,
      berlakuMulai: { lte: new Date() },
      OR: [
        { berlakuHingga: null },
        { berlakuHingga: { gte: new Date() } }
      ]
    }
  });

  if (!schema) {
    throw new NotFoundException('Skema harga tidak ditemukan');
  }

  const harga = schema.komponenHarga as KomponenHarga;

  // Get naskah details (for page count)
  const naskah = await this.prisma.naskah.findUnique({
    where: { id: idNaskah },
    select: { jumlahHalaman: true }
  });

  // Calculate production cost
  let biayaProduksi = 0;

  // 1. Base price (per format)
  biayaProduksi += harga.hargaDasar[formatBuku];

  // 2. Paper cost (price per page * page count * quantity)
  const pageCount = naskah.jumlahHalaman || 100;
  biayaProduksi += harga.hargaPerHalaman[jenisKertas] * pageCount * jumlah;

  // 3. Cover cost
  biayaProduksi += harga.hargaCover[jenisCover] * jumlah;

  // 4. Color printing markup
  if (cetakWarna) {
    biayaProduksi *= (1 + harga.markupWarna / 100);
  }

  // 5. Apply quantity discount
  let diskonPersen = 0;
  for (const tier of harga.diskonJumlah.sort((a, b) => b.minJumlah - a.minJumlah)) {
    if (jumlah >= tier.minJumlah) {
      diskonPersen = tier.diskonPersen;
      break;
    }
  }
  const diskon = biayaProduksi * (diskonPersen / 100);
  biayaProduksi -= diskon;

  // Calculate shipping cost
  const beratTotal = harga.biayaPengiriman.beratPerBuku * jumlah;
  const biayaPengiriman = harga.biayaPengiriman.hargaDasar +
                          (harga.biayaPengiriman.hargaPerKg * beratTotal);

  const totalBiaya = biayaProduksi + biayaPengiriman;

  return {
    sukses: true,
    data: {
      biayaProduksi,
      biayaPengiriman,
      totalBiaya,
      breakdown: {
        hargaDasar: harga.hargaDasar[formatBuku],
        biayaKertas: harga.hargaPerHalaman[jenisKertas] * pageCount * jumlah,
        biayaCover: harga.hargaCover[jenisCover] * jumlah,
        markupWarna: cetakWarna ? (biayaProduksi * harga.markupWarna / 100) : 0,
        diskon,
        diskonPersen
      }
    }
  };
}
```

#### 3.4 Frontend: Kalkulasi Harga Hook

```typescript
// hooks/use-kalkulasi-harga.ts
export const useKalkulasiHarga = () => {
  const [spec, setSpec] = useState({
    idNaskah: "",
    idPercetakan: "",
    formatBuku: "A5",
    jenisKertas: "HVS",
    jenisCover: "SOFTCOVER",
    cetakWarna: false,
    jumlah: 100,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["harga", spec],
    queryFn: () => percetakanApi.hitungHarga(spec),
    enabled: !!spec.idNaskah && !!spec.idPercetakan && spec.jumlah > 0,
  });

  return {
    spec,
    setSpec,
    harga: data?.data,
    isLoading,
  };
};
```

---

### 4. PRODUCTION TRACKING SYSTEM

#### 4.1 Log Produksi Model

```prisma
model LogProduksi {
  id             String   @id @default(uuid())
  idPesanan      String
  statusSebelum  StatusPesanan
  statusSesudah  StatusPesanan
  catatan        String?  @db.Text
  dibuatPada     DateTime @default(now())

  pesanan PesananCetak @relation(fields: [idPesanan], references: [id], onDelete: Cascade)

  @@index([idPesanan, dibuatPada])
  @@map("log_produksi")
}
```

#### 4.2 Auto-Logging Status Changes

```typescript
// Middleware atau service method
async updateStatusPesanan(
  idPesanan: string,
  statusBaru: StatusPesanan,
  catatan?: string
) {
  const pesanan = await this.prisma.pesananCetak.findUnique({
    where: { id: idPesanan }
  });

  if (!pesanan) {
    throw new NotFoundException('Pesanan tidak ditemukan');
  }

  // Create log & update status in transaction
  await this.prisma.$transaction(async (prisma) => {
    // Create log
    await prisma.logProduksi.create({
      data: {
        idPesanan,
        statusSebelum: pesanan.status,
        statusSesudah: statusBaru,
        catatan
      }
    });

    // Update pesanan
    await prisma.pesananCetak.update({
      where: { id: idPesanan },
      data: { status: statusBaru }
    });
  });

  // Send notification based on status
  await this.sendStatusNotification(idPesanan, statusBaru);
}
```

#### 4.3 Frontend: Production Timeline Component

```typescript
// components/percetakan/timeline-produksi.tsx
const statusSteps = [
  { key: "diterima", label: "Diterima", icon: "✓" },
  { key: "dalam_produksi", label: "Produksi", icon: "🏭" },
  { key: "kontrol_kualitas", label: "QC", icon: "🔍" },
  { key: "siap", label: "Siap Kirim", icon: "📦" },
  { key: "dikirim", label: "Dikirim", icon: "🚚" },
  { key: "terkirim", label: "Terkirim", icon: "✅" },
];

export function TimelineProduksi({ pesanan, logs }) {
  const currentIndex = statusSteps.findIndex((s) => s.key === pesanan.status);

  return (
    <div className="relative">
      {statusSteps.map((step, index) => {
        const isCompleted = index <= currentIndex;
        const log = logs.find((l) => l.statusSesudah === step.key);

        return (
          <div key={step.key} className="flex items-start gap-4">
            {/* Icon */}
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isCompleted ? "bg-green-500 text-white" : "bg-gray-200"
              }`}
            >
              {step.icon}
            </div>

            {/* Content */}
            <div>
              <h4 className="font-semibold">{step.label}</h4>
              {log && (
                <>
                  <p className="text-sm text-gray-600">
                    {format(new Date(log.dibuatPada), "dd MMM yyyy HH:mm")}
                  </p>
                  {log.catatan && (
                    <p className="text-sm text-gray-500">{log.catatan}</p>
                  )}
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

---

### 5. SHIPPING MANAGEMENT

#### 5.1 Pengiriman Model

```prisma
model Pengiriman {
  id             String            @id @default(uuid())
  idPesanan      String            @unique
  ekspedisi      String            // JNE, TIKI, POS, dll
  nomorResi      String            @unique
  statusKirim    StatusPengiriman  @default(diproses)
  estimasiTiba   DateTime?
  tanggalKirim   DateTime?
  tanggalTiba    DateTime?
  catatan        String?           @db.Text
  dibuatPada     DateTime          @default(now())
  diperbaruiPada DateTime          @updatedAt

  pesanan     PesananCetak  @relation(fields: [idPesanan], references: [id])
  trackingLog TrackingLog[]

  @@map("pengiriman")
}

model TrackingLog {
  id           String   @id @default(uuid())
  idPengiriman String
  lokasi       String
  status       String
  keterangan   String?
  waktu        DateTime
  dibuatPada   DateTime @default(now())

  pengiriman Pengiriman @relation(fields: [idPengiriman], references: [id], onDelete: Cascade)

  @@index([idPengiriman, waktu])
  @@map("tracking_log")
}
```

#### 5.2 Create Shipment (Percetakan)

```typescript
POST /api/percetakan/pesanan/:id/kirim
Body: {
  ekspedisi: string,
  nomorResi: string,
  estimasiTiba: Date,
  catatan?: string
}

// Logic:
async buatPengiriman(idPesanan: string, dto: BuatPengirimanDto) {
  // Validate pesanan status is 'siap'
  const pesanan = await this.prisma.pesananCetak.findUnique({
    where: { id: idPesanan }
  });

  if (pesanan.status !== 'siap') {
    throw new BadRequestException('Pesanan belum siap untuk dikirim');
  }

  // Create pengiriman & update pesanan status
  const pengiriman = await this.prisma.$transaction(async (prisma) => {
    const newPengiriman = await prisma.pengiriman.create({
      data: {
        idPesanan,
        ekspedisi: dto.ekspedisi,
        nomorResi: dto.nomorResi,
        estimasiTiba: dto.estimasiTiba,
        statusKirim: 'diproses',
        tanggalKirim: new Date(),
        catatan: dto.catatan
      }
    });

    await prisma.pesananCetak.update({
      where: { id: idPesanan },
      data: { status: 'dikirim' }
    });

    return newPengiriman;
  });

  // Send notification
  await this.notifikasiService.kirimNotifikasi({
    idPengguna: pesanan.idPenulis,
    judul: 'Pesanan Dikirim',
    pesan: `Pesanan Anda telah dikirim via ${dto.ekspedisi}. Nomor resi: ${dto.nomorResi}`,
    tipe: 'sukses'
  });

  return { sukses: true, data: pengiriman };
}
```

#### 5.3 Update Tracking (Manual/Webhook)

```typescript
POST /api/percetakan/pengiriman/:id/tracking
Body: {
  lokasi: string,
  status: string,
  keterangan?: string,
  waktu: Date
}
```

#### 5.4 Frontend: Tracking Component

```typescript
// components/percetakan/tracking-resi.tsx
export function TrackingResi({ pengiriman }) {
  const { data: tracking } = useQuery({
    queryKey: ["tracking", pengiriman.id],
    queryFn: () => percetakanApi.getTracking(pengiriman.id),
    refetchInterval: 60000, // Refresh every 1 minute
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tracking Pengiriman</CardTitle>
        <p>Ekspedisi: {pengiriman.ekspedisi}</p>
        <p>
          No. Resi: <strong>{pengiriman.nomorResi}</strong>
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tracking?.data.map((log) => (
            <div key={log.id} className="border-l-2 border-blue-500 pl-4">
              <p className="font-semibold">{log.status}</p>
              <p className="text-sm">{log.lokasi}</p>
              <p className="text-xs text-gray-500">
                {format(new Date(log.waktu), "dd MMM yyyy HH:mm")}
              </p>
              {log.keterangan && (
                <p className="text-sm text-gray-600">{log.keterangan}</p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

---

### 6. FRONTEND - DASHBOARD PERCETAKAN

#### 6.1 Dashboard Layout

**Route**: `/percetakan` atau `/dashboard/percetakan`

**Sections**:

##### A. Statistik Cards (4 cards)

- Total Pesanan
- Pesanan Aktif (tertunda + diterima + dalam_produksi)
- Pesanan Selesai
- Revenue Bulan Ini

##### B. Quick Actions

- "Pesanan Baru" → Pesanan tertunda & diterima
- "Kelola Tarif" → Parameter harga
- "Saldo & Penarikan" → Financial

##### C. Recent Orders Table

- 5 pesanan terbaru
- Columns: ID, Naskah, Jumlah, Status, Tanggal

#### 6.2 Kelola Pesanan Pages

**Pesanan Baru** (`/percetakan/pesanan/baru`):

- Tab: Tertunda, Diterima
- Actions: Terima/Tolak pesanan

**Dalam Produksi** (`/percetakan/pesanan/produksi`):

- Tab: Dalam Produksi, QC, Siap
- Action: Update status + catatan
- Timeline production per pesanan

**Pengiriman** (`/percetakan/pengiriman`):

- Tab: Belum Dikirim, Dikirim, Terkirim
- Create shipment modal
- Update tracking

#### 6.3 Parameter Harga Page

**Route**: `/percetakan/harga`

**Features**:

- View current active schema
- Form untuk edit komponen harga:
  - Harga dasar per format (A4, A5, B5)
  - Harga per halaman per jenis kertas
  - Harga cover (soft/hard)
  - Markup warna (%)
  - Diskon tier (quantity-based)
  - Biaya pengiriman formula
- Save as new schema (versioning)
- Activate/deactivate schema

**Calculator Preview**:

- Real-time preview: Input spesifikasi → Show calculated price

---

### 7. PAYMENT INTEGRATION (Basic)

#### 7.1 Pembayaran Model (Already exists from Fase 1)

```prisma
model Pembayaran {
  id                String           @id @default(uuid())
  idPesanan         String
  idPengguna        String
  jumlah            Decimal          @db.Decimal(10, 2)
  metodePembayaran  MetodePembayaran
  statusPembayaran  StatusPembayaran @default(tertunda)
  buktiPembayaran   String?
  nomorReferensi    String?
  dibayarPada       DateTime?
  dibuatPada        DateTime         @default(now())
  diperbaruiPada    DateTime         @updatedAt

  pesanan  PesananCetak @relation(fields: [idPesanan], references: [id])
  pengguna Pengguna     @relation(fields: [idPengguna], references: [id])

  @@map("pembayaran")
}
```

#### 7.2 Payment Flow

1. Penulis create order → Status: tertunda
2. Penulis upload bukti pembayaran → Status pembayaran: diproses
3. Admin/Percetakan konfirmasi pembayaran → Status pembayaran: berhasil
4. Percetakan dapat terima pesanan → Status pesanan: diterima

**Future Enhancement**: Integration dengan payment gateway (Midtrans, Xendit)

---

### 8. ANALYTICS & REPORTS (Percetakan)

#### 8.1 Financial Dashboard

**Metrics**:

- Revenue per bulan (chart 6 months)
- Top 5 penulis (by order volume)
- Breakdown by format buku
- Profit margins

#### 8.2 Operational Metrics

- Average production time
- Order fulfillment rate
- Quality rejection rate (if tracked)
- On-time delivery rate

---

### 9. HASIL & DELIVERABLES FASE 4

#### 9.1 Backend

✅ Percetakan Module (20+ endpoints)  
✅ Dynamic pricing system dengan JSON schema  
✅ Order management (create, confirm, reject, update status)  
✅ Production tracking dengan auto-logging  
✅ Shipping management dengan tracking logs  
✅ Payment integration (basic manual confirmation)

#### 9.2 Frontend

✅ Dashboard percetakan dengan statistik  
✅ Pesanan management pages (baru, produksi, pengiriman)  
✅ Parameter harga editor & calculator  
✅ Production timeline component  
✅ Shipping tracking component  
✅ Order creation form untuk penulis (modal cetak fisik)

#### 9.3 Metrics

- **LOC Backend**: +4,000
- **LOC Frontend**: +5,500
- **API Endpoints**: +20
- **Time**: ~96 jam (12 hari kerja)

---

### 10. NEXT STEPS → FASE 5

Fase 5 (Final) akan fokus pada:

1. **Integration Testing**: E2E test seluruh workflow
2. **Performance Optimization**: Caching, query optimization, lazy loading
3. **Security Hardening**: RLS policies, rate limiting, SQL injection prevention
4. **Deployment**: Docker containerization, CI/CD pipeline, production deployment
5. **Documentation**: API docs, user guides, deployment guides

---
