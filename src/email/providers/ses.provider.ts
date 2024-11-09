import { Injectable, Logger } from '@nestjs/common';
import { EmailProvider } from '../interfaces/email-provider.interface';
import { EmailProviderConfig } from '../email.service';
import * as nodemailer from 'nodemailer';
import * as aws from '@aws-sdk/client-ses';

@Injectable()
export class SESProvider implements EmailProvider {
  private readonly logger = new Logger(SESProvider.name);
  private transporter: nodemailer.Transporter;

  constructor(config: EmailProviderConfig['config']) {
    try {
      this.logger.log('Initializing SES provider...');
      this.logger.debug(`SES provider config: ${JSON.stringify(config)}`);

      const ses = new aws.SES({
        region: config.region,
        credentials: {
          accessKeyId: config.accessKeyId,
          secretAccessKey: config.secretAccessKey,
        },
      });

      this.transporter = nodemailer.createTransport({
        SES: { ses, aws },
        sendingRate: 14,
      });

      this.logger.log('SES provider initialized successfully');
    } catch (error) {
      this.logger.error(
        `Failed to initialize SES provider: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async send(to: string, subject: string, content: string): Promise<void> {
    try {
      this.logger.debug(`Attempting to send email via SES to ${to}`);

      await this.transporter.sendMail({
        from: process.env.AWS_SES_FROM_EMAIL,
        to,
        subject,
        html: content,
      });

      this.logger.debug(`Successfully sent email to ${to}`);
    } catch (error) {
      this.logger.error(
        `SES email sending failed to ${to}: ${error.message}`,
        error.stack,
      );
      throw new Error(`Failed to send email via SES: ${error.message}`);
    }
  }

  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      throw new Error(`SES connection verification failed: ${error.message}`);
    }
  }
}
