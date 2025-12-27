import { IsDecimal, IsInt, Min, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Decimal } from '@prisma/client/runtime/library';

export class BuatParameterHargaDto {
  @ApiProperty({
    description: 'Harga kertas A4 per lembar',
    example: 150,
  })
  @IsDecimal({ decimal_digits: '2' })
  @Type(() => Number)
  hargaKertasA4!: number | Decimal;

  @ApiProperty({
    description: 'Harga kertas A5 per lembar',
    example: 100,
  })
  @IsDecimal({ decimal_digits: '2' })
  @Type(() => Number)
  hargaKertasA5!: number | Decimal;

  @ApiPropertyOptional({
    description: 'Harga kertas B5 per lembar',
    example: 125,
    default: 0,
  })
  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  @Type(() => Number)
  hargaKertasB5?: number | Decimal;

  @ApiProperty({
    description: 'Harga softcover per unit',
    example: 5000,
  })
  @IsDecimal({ decimal_digits: '2' })
  @Type(() => Number)
  hargaSoftcover!: number | Decimal;

  @ApiProperty({
    description: 'Harga hardcover per unit',
    example: 15000,
  })
  @IsDecimal({ decimal_digits: '2' })
  @Type(() => Number)
  hargaHardcover!: number | Decimal;

  @ApiProperty({
    description: 'Biaya jilid per buku',
    example: 7000,
  })
  @IsDecimal({ decimal_digits: '2' })
  @Type(() => Number)
  biayaJilid!: number | Decimal;

  @ApiProperty({
    description: 'Minimum pesanan (jumlah buku)',
    example: 10,
    default: 1,
  })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  minimumPesanan!: number;
}

export class PerbaruiParameterHargaDto extends BuatParameterHargaDto {}
