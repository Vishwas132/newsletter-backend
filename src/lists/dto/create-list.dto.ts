import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsObject,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateListDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsUUID()
  @IsNotEmpty()
  organizationId: string;

  @IsOptional()
  @IsObject()
  @Type(() => Object)
  customFields?: Record<string, any>;
}
