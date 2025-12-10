import { PartialType } from '@nestjs/swagger';
import { BuatTarifDto } from './buat-tarif.dto';

export class PerbaruiTarifDto extends PartialType(BuatTarifDto) {}
