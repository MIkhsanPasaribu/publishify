import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('health')
@Controller()
export class AppController {
  @Get()
  @ApiOperation({ summary: 'Root endpoint - API information' })
  @ApiResponse({
    status: 200,
    description: 'API information dan status',
  })
  getRoot() {
    return {
      sukses: true,
      pesan: 'Selamat datang di API Publishify',
      data: {
        nama: 'Publishify API',
        versi: '1.0.0',
        deskripsi: 'Sistem Penerbitan Naskah Publishify',
        dokumentasi: '/api/docs',
        endpoints: {
          auth: '/api/auth',
          pengguna: '/api/pengguna',
          naskah: '/api/naskah',
          review: '/api/review',
          percetakan: '/api/percetakan',
          pembayaran: '/api/pembayaran',
          notifikasi: '/api/notifikasi',
          upload: '/api/upload',
        },
        status: 'online',
        timestamp: new Date().toISOString(),
      },
    };
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({
    status: 200,
    description: 'Health check status',
  })
  getHealth() {
    return {
      sukses: true,
      pesan: 'Server berjalan dengan baik',
      data: {
        status: 'healthy',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          unit: 'MB',
        },
      },
    };
  }
}
