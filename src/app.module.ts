import { Module, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ListsModule } from './lists/lists.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { getTypeOrmConfig } from './config/typeorm.config';
import { EmailModule } from './email/email.module';
import { OrganizationsModule } from './organizations/organizations.module';
import emailConfig from './config/email.config';
import { SubscribersModule } from './subscribers/subscribers.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [emailConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const logger = new Logger('TypeOrmConfig');
        try {
          const config = await getTypeOrmConfig(configService);
          logger.log('Database configuration loaded successfully');
          return {
            ...config,
            logging: true,
            logger: 'advanced-console',
          };
        } catch (error) {
          logger.error(
            `Failed to load database configuration: ${error.message}`,
            error.stack,
          );
          throw error;
        }
      },
      inject: [ConfigService],
    }),
    UsersModule,
    ListsModule,
    CampaignsModule,
    EmailModule,
    OrganizationsModule,
    SubscribersModule,
  ],
  controllers: [AppController],
  providers: [AppService, Logger],
})
export class AppModule {}
