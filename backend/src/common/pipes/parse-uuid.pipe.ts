import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { isValidUUID } from '@/utils/validation.util';

@Injectable()
export class ParseUUIDPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (!isValidUUID(value)) {
      throw new BadRequestException('ID tidak valid. Harus berupa UUID.');
    }
    return value;
  }
}
