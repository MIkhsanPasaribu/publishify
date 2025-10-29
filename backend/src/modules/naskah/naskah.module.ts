import { Module } from '@nestjs/common';
import { NaskahController } from './naskah.controller';
import { NaskahService } from './naskah.service';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [NaskahController],
  providers: [NaskahService],
  exports: [NaskahService], // Export untuk digunakan module lain (Review, Percetakan)
})
export class NaskahModule {}
