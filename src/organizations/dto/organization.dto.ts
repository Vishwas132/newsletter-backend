import { IsString, MinLength, MaxLength } from 'class-validator';

export class CreateOrganizationDto {
  @IsString()
  @MinLength(2, {
    message: 'Organization name must be at least 2 characters long',
  })
  @MaxLength(50, { message: 'Organization name must not exceed 50 characters' })
  name: string;
}
