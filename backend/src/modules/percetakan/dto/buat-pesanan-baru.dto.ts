import { IsString, IsUUID, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BuatPesananBaruDto {
  @ApiProperty({ description: 'ID Naskah', example: 'uuid-naskah' })
  @IsUUID()
  naskahId!: string;

  @ApiProperty({ description: 'ID Percetakan yang dipilih', example: 'uuid-percetakan' })
  @IsUUID()
  percetakanId!: string;

  @ApiProperty({ description: 'Jenis kertas', example: 'BOOKPAPER' })
  @IsString()
  jenisKertas!: string;

  @ApiProperty({ description: 'Jenis cover', example: 'SOFTCOVER' })
  @IsString()
  jenisCover!: string;

  @ApiProperty({ description: 'Jumlah order', example: 100 })
  @IsNumber()
  @Min(1)
  jumlahOrder!: number;

  @ApiProperty({ description: 'Catatan tambahan', required: false })
  @IsOptional()
  @IsString()
  catatan?: string;
}
