import { IsString, IsOptional } from 'class-validator';

export class UpdateCampaignDto {
  @IsString()
  @IsOptional()
  subject?: string;

  @IsString()
  @IsOptional()
  content?: string;
}
