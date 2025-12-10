import { IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class KalkulasiHargaDto {
  @ApiProperty({ description: 'ID Naskah', example: 'uuid-naskah' })
  @IsUUID()
  naskahId: string;

  @ApiProperty({ description: 'Jenis kertas', example: 'BOOKPAPER' })
  @IsString()
  jenisKertas: string;

  @ApiProperty({ description: 'Jenis cover', example: 'SOFTCOVER' })
  @IsString()
  jenisCover: string;
}
