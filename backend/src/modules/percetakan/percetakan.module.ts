import { Module } from '@nestjs/common';
import { PercetakanController } from './percetakan.controller';
import { PercetakanService } from './percetakan.service';
import { PrismaModule } from '@/prisma/prisma.module';

/**
 * Percetakan Module
 * Mengelola pesanan cetak buku dari naskah yang sudah diterbitkan
 *
 * Features:
 * - Buat pesanan cetak dengan spesifikasi lengkap
 * - Konfirmasi pesanan oleh percetakan
 * - Tracking status produksi (8 status)
 * - Manajemen pengiriman dengan ekspedisi
 * - Kalkulasi biaya cetak otomatis
 * - Statistik pesanan dan revenue
 * - Log produksi untuk tracking detail
 *
 * Flow Status:
 * tertunda → diterima → dalam_produksi → kontrol_kualitas → siap → dikirim → terkirim
 * (atau tertunda → dibatalkan)
 */
@Module({
  imports: [PrismaModule],
  controllers: [PercetakanController],
  providers: [PercetakanService],
  exports: [PercetakanService],
})
export class PercetakanModule {}
