import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { SESProvider } from './providers/ses.provider';
import { ConfigModule, ConfigService } from '@nestjs/config';
import emailConfig from '../config/email.config';

@Module({
  imports: [ConfigModule.forFeature(emailConfig)],
  providers: [
    EmailService,
    {
      provide: SESProvider,
      useFactory: (configService: ConfigService) => {
        const config = configService.get('email');
        return new SESProvider(config.config);
      },
      inject: [ConfigService],
    },
  ],
  exports: [EmailService],
})
export class EmailModule {}
