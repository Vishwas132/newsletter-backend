import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Campaign } from '../entities/campaign.entity';
import { List } from '../entities/list.entity';
import { CampaignsService } from './campaigns.service';
import { CampaignsController } from './campaigns.controller';
import { ConfigModule } from '@nestjs/config';
import { ListsModule } from '../lists/lists.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Campaign, List]),
    ConfigModule,
    ListsModule,
    EmailModule,
  ],
  providers: [CampaignsService],
  controllers: [CampaignsController],
  exports: [CampaignsService],
})
export class CampaignsModule {}
