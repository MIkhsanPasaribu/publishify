import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    MulterModule.register({
      // Gunakan memory storage karena kita handle file save di service
      storage: undefined, // default ke memory storage
      limits: {
        fileSize: 50 * 1024 * 1024, // max 50MB (untuk naskah PDF)
        files: 10, // max 10 files untuk multiple upload
      },
      fileFilter: (req, file, callback) => {
        // Basic file filter - detailed validation di service
        const allowedMimes = [
          // Documents
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          // Images
          'image/jpeg',
          'image/png',
          'image/webp',
          'image/gif',
        ];

        if (allowedMimes.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(
            new Error(
              'Tipe file tidak diperbolehkan. Hanya PDF, DOCX, XLSX, dan gambar (JPEG, PNG, WebP, GIF)',
            ),
            false,
          );
        }
      },
    }),
  ],
  controllers: [UploadController],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule {}
