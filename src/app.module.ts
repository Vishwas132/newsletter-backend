import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ListsModule } from './lists/lists.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { getTypeOrmConfig } from './config/typeorm.config';
import { EmailModule } from './email/email.module';
import emailConfig from './config/email.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [emailConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getTypeOrmConfig,
      inject: [ConfigService],
    }),
    UsersModule,
    ListsModule,
    CampaignsModule,
    EmailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
