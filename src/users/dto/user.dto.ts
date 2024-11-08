import {
  IsEmail,
  IsString,
  MinLength,
  IsUUID,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { UserRole } from '../../entities/user.entity';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}

export class RegisterDto extends LoginDto {
  @IsUUID()
  organizationId: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}
