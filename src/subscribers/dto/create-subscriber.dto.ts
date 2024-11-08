import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSubscriberDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsUUID()
  @IsNotEmpty()
  organizationId: string;

  @IsOptional()
  @IsObject()
  @Type(() => Object)
  customFields?: Record<string, any>;
}
