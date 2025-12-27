import { IsString, IsEnum, IsDecimal, IsInt, Min, IsOptional, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Decimal } from '@prisma/client/runtime/library';

export enum FormatBuku {
  A4 = 'A4',
  A5 = 'A5',
  B5 = 'B5',
}

export enum JenisKertas {
  HVS_70gr = 'HVS_70gr',
  HVS_80gr = 'HVS_80gr',
  BOOKPAPER = 'BOOKPAPER',
  ART_PAPER = 'ART_PAPER',
}

export enum JenisCover {
  SOFTCOVER = 'SOFTCOVER',
  HARDCOVER = 'HARDCOVER',
}

export class BuatKombinasiTarifDto {
  @ApiProperty({
    description: 'Nama skema tarif (contoh: "Tarif Standar", "Tarif Diskon", "Tarif Premium")',
    example: 'Tarif Standar',
  })
  @IsString()
  namaKombinasi!: string;

  @ApiPropertyOptional({
    description: 'Deskripsi skema tarif',
    example: 'Tarif standar untuk pesanan reguler',
  })
  @IsOptional()
  @IsString()
  deskripsi?: string;

  @ApiProperty({
    description: 'Harga kertas A4 per lembar',
    example: 500,
  })
  @IsDecimal()
  @Type(() => Number)
  hargaKertasA4!: number;

  @ApiProperty({
    description: 'Harga kertas A5 per lembar',
    example: 350,
  })
  @IsDecimal()
  @Type(() => Number)
  hargaKertasA5!: number;

  @ApiPropertyOptional({
    description: 'Harga kertas B5 per lembar',
    example: 400,
  })
  @IsOptional()
  @IsDecimal()
  @Type(() => Number)
  hargaKertasB5?: number;

  @ApiProperty({
    description: 'Harga softcover per unit',
    example: 5000,
  })
  @IsDecimal()
  @Type(() => Number)
  hargaSoftcover!: number;

  @ApiProperty({
    description: 'Harga hardcover per unit',
    example: 15000,
  })
  @IsDecimal()
  @Type(() => Number)
  hargaHardcover!: number;

  @ApiProperty({
    description: 'Biaya jilid per buku',
    example: 3000,
  })
  @IsDecimal()
  @Type(() => Number)
  biayaJilid!: number;

  @ApiProperty({
    description: 'Minimum pesanan (unit)',
    example: 50,
  })
  @IsInt()
  @Min(1)
  minimumPesanan!: number;

  @ApiPropertyOptional({
    description: 'Set skema ini sebagai aktif (hanya 1 skema aktif per percetakan)',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  aktif?: boolean;
}

export class PerbaruiKombinasiTarifDto {
  @ApiPropertyOptional({
    description: 'Nama kombinasi tarif',
    example: 'Harga Promo',
  })
  @IsOptional()
  @IsString()
  namaKombinasi?: string;

  @ApiPropertyOptional({
    description: 'Deskripsi kombinasi tarif',
  })
  @IsOptional()
  @IsString()
  deskripsi?: string;

  @ApiPropertyOptional({
    description: 'Status aktif kombinasi',
  })
  @IsOptional()
  @IsBoolean()
  aktif?: boolean;
}

export class ToggleAktifKombinasiDto {
  @ApiProperty({
    description: 'Set kombinasi sebagai aktif atau nonaktif',
    example: true,
  })
  @IsBoolean()
  aktif!: boolean;
}

export class KalkulasiHargaDto {
  @ApiProperty({
    description: 'Format buku',
    enum: FormatBuku,
  })
  @IsEnum(FormatBuku)
  formatBuku!: FormatBuku;

  @ApiProperty({
    description: 'Jenis kertas',
    enum: JenisKertas,
  })
  @IsEnum(JenisKertas)
  jenisKertas!: JenisKertas;

  @ApiProperty({
    description: 'Jenis cover',
    enum: JenisCover,
  })
  @IsEnum(JenisCover)
  jenisCover!: JenisCover;

  @ApiProperty({
    description: 'Jumlah halaman buku',
    example: 100,
  })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  jumlahHalaman!: number;

  @ApiProperty({
    description: 'Jumlah buku yang dipesan',
    example: 50,
  })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  jumlahBuku!: number;

  @ApiProperty({
    description: 'Apakah pesanan termasuk jilid',
    example: true,
    default: true,
  })
  @IsBoolean()
  denganJilid!: boolean;
}
