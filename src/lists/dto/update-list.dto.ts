import { IsString, IsOptional, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateListDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsOptional()
  @IsObject()
  @Type(() => Object)
  customFields?: Record<string, any>;
}
