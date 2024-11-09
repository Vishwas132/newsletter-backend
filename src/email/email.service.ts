import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailProvider } from './interfaces/email-provider.interface';
import { SESProvider } from './providers/ses.provider';

export interface EmailProviderConfig {
  provider: 'ses' | 'sendgrid' | 'mailgun' | 'smtp';
  config: {
    region?: string;
    accessKeyId?: string;
    secretAccessKey?: string;
    fromEmail?: string;
  };
}

@Injectable()
export class EmailService implements OnModuleInit {
  private provider: EmailProvider;
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private configService: ConfigService,
    private sesProvider: SESProvider,
  ) {}

  async onModuleInit() {
    try {
      this.logger.log('Initializing email provider...');
      await this.initializeProvider();
      this.logger.log('Email provider initialized successfully');
    } catch (error) {
      this.logger.error(
        `Failed to initialize email provider: ${error.message}`,
        error.stack,
      );
      throw new Error('Failed to initialize email provider');
    }
  }

  private async initializeProvider() {
    const config = this.configService.get<EmailProviderConfig>('email');

    switch (config.provider) {
      case 'ses':
        this.provider = this.sesProvider;
        break;
      default:
        this.logger.error(`Unsupported email provider: ${config.provider}`);
        throw new Error(`Unsupported email provider: ${config.provider}`);
    }
  }

  async sendEmail(to: string, subject: string, content: string): Promise<void> {
    if (!this.provider) {
      this.logger.error('Email provider not initialized');
      throw new Error('Email provider not initialized');
    }

    try {
      this.logger.debug(`Sending email to ${to} with subject: ${subject}`);
      await this.provider.send(to, subject, content);
      this.logger.debug(`Successfully sent email to ${to}`);
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${to}: ${error.message}`,
        error.stack,
      );
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }
}
