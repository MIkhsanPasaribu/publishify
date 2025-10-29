import { Module } from '@nestjs/common';
import { PembayaranController } from './pembayaran.controller';
import { PembayaranService } from './pembayaran.service';
import { PrismaModule } from '@/prisma/prisma.module';

/**
 * Module untuk mengelola pembayaran pesanan cetak
 * Fitur: transaksi, konfirmasi, webhook payment gateway, statistik
 */
@Module({
  imports: [PrismaModule],
  controllers: [PembayaranController],
  providers: [PembayaranService],
  exports: [PembayaranService],
})
export class PembayaranModule {}
