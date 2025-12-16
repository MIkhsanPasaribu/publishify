import { IsString, IsNumber, IsBoolean, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BuatTarifDto {
  @ApiProperty({ description: 'Format buku', example: 'A5' })
  @IsString()
  formatBuku!: string;

  @ApiProperty({ description: 'Jenis kertas', example: 'BOOKPAPER' })
  @IsString()
  jenisKertas!: string;

  @ApiProperty({ description: 'Jenis cover', example: 'SOFTCOVER' })
  @IsString()
  jenisCover!: string;

  @ApiProperty({ description: 'Harga per halaman', example: 500 })
  @IsNumber()
  @Min(0)
  hargaPerHalaman!: number;

  @ApiProperty({ description: 'Biaya jilid', example: 5000 })
  @IsNumber()
  @Min(0)
  biayaJilid!: number;

  @ApiProperty({ description: 'Minimum pesanan', example: 1, required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  minimumPesanan?: number;

  @ApiProperty({ description: 'Status aktif', example: true, required: false })
  @IsOptional()
  @IsBoolean()
  aktif?: boolean;
}
