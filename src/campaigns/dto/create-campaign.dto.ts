import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateCampaignDto {
  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsUUID()
  @IsNotEmpty()
  listId: string;

  @IsUUID()
  @IsNotEmpty()
  organizationId: string;
}
