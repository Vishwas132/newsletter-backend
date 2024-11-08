import { IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';

export class ImportSubscribersDto {
  @IsUUID()
  listId: string;

  @Transform(({ value }) => {
    if (value instanceof Buffer) return value;
    return Buffer.from(value);
  })
  csvFile: Buffer;
}
