import { IsEmail, IsOptional, IsString, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateSubscriberDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsOptional()
  @IsObject()
  @Type(() => Object)
  customFields?: Record<string, any>;

  @IsString()
  @IsOptional()
  gpgPublicKey?: string;
}
