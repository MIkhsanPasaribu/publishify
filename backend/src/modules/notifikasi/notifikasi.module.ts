import { Module } from '@nestjs/common';
import { NotifikasiController } from './notifikasi.controller';
import { NotifikasiService } from './notifikasi.service';
import { NotifikasiGateway } from './notifikasi.gateway';
import { EmailService } from './email.service';
import { PrismaModule } from '@/prisma/prisma.module';

/**
 * Module untuk mengelola notifikasi real-time
 * Fitur: WebSocket Gateway, REST API, push notifications, Email
 */
@Module({
  imports: [PrismaModule],
  controllers: [NotifikasiController],
  providers: [NotifikasiService, NotifikasiGateway, EmailService],
  exports: [NotifikasiService, NotifikasiGateway, EmailService],
})
export class NotifikasiModule {}
