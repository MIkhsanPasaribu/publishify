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
    description: 'Nama kombinasi tarif (contoh: "Harga Normal", "Promo Desember")',
    example: 'Harga Normal',
  })
  @IsString()
  namaKombinasi!: string;

  @ApiPropertyOptional({
    description: 'Deskripsi kombinasi tarif',
    example: 'Tarif standar untuk pesanan reguler',
  })
  @IsOptional()
  @IsString()
  deskripsi?: string;

  @ApiProperty({
    description: 'Format buku',
    enum: FormatBuku,
    example: FormatBuku.A5,
  })
  @IsEnum(FormatBuku)
  formatBuku!: FormatBuku;

  @ApiProperty({
    description: 'Jenis kertas',
    enum: JenisKertas,
    example: JenisKertas.HVS_80gr,
  })
  @IsEnum(JenisKertas)
  jenisKertas!: JenisKertas;

  @ApiProperty({
    description: 'Jenis cover',
    enum: JenisCover,
    example: JenisCover.SOFTCOVER,
  })
  @IsEnum(JenisCover)
  jenisCover!: JenisCover;

  @ApiPropertyOptional({
    description: 'Set kombinasi ini sebagai aktif (hanya 1 kombinasi aktif per percetakan)',
    default: false,
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
