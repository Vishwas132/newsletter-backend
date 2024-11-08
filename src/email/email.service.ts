import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailProvider } from './interfaces/email-provider.interface';
import { SESProvider } from './providers/ses.provider';

export interface EmailProviderConfig {
  provider: 'ses' | 'sendgrid' | 'mailgun' | 'smtp';
  config: {
    apiKey?: string;
    host?: string;
    port?: number;
    username?: string;
    password?: string;
    region?: string;
  };
}

@Injectable()
export class EmailService implements OnModuleInit {
  private provider: EmailProvider;

  constructor(
    private configService: ConfigService,
    private sesProvider: SESProvider,
  ) {}

  async onModuleInit() {
    await this.initializeProvider();
  }

  private async initializeProvider() {
    const config = this.configService.get<EmailProviderConfig>('email');

    switch (config.provider) {
      case 'ses':
        this.provider = this.sesProvider;
        break;
      default:
        throw new Error(`Unsupported email provider: ${config.provider}`);
    }
  }

  async sendEmail(to: string, subject: string, content: string): Promise<void> {
    if (!this.provider) {
      throw new Error('Email provider not initialized');
    }
    return this.provider.send(to, subject, content);
  }
}
