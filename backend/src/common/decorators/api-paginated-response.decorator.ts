import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { ResponsePaginated } from '../interfaces/response.interface';

/**
 * Decorator untuk mendokumentasikan response pagination di Swagger
 */
export const ApiPaginatedResponse = <TModel extends Type<any>>(model: TModel) => {
  return applyDecorators(
    ApiExtraModels(model),
    ApiOkResponse({
      description: 'Response dengan pagination',
      schema: {
        allOf: [
          {
            properties: {
              sukses: {
                type: 'boolean',
                example: true,
              },
              pesan: {
                type: 'string',
                example: 'Data berhasil diambil',
              },
              data: {
                type: 'array',
                items: { $ref: getSchemaPath(model) },
              },
              metadata: {
                type: 'object',
                properties: {
                  total: { type: 'number', example: 100 },
                  halaman: { type: 'number', example: 1 },
                  limit: { type: 'number', example: 20 },
                  totalHalaman: { type: 'number', example: 5 },
                },
              },
            },
          },
        ],
      },
    }),
  );
};
