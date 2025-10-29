import { Module } from '@nestjs/common';
import { PenggunaController } from './pengguna.controller';
import { PenggunaService } from './pengguna.service';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PenggunaController],
  providers: [PenggunaService],
  exports: [PenggunaService], // Export untuk digunakan module lain
})
export class PenggunaModule {}
