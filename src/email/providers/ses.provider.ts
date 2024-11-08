import { Injectable } from '@nestjs/common';
import { EmailProvider } from '../interfaces/email-provider.interface';
import { EmailProviderConfig } from '../email.service';
import * as nodemailer from 'nodemailer';
import * as aws from '@aws-sdk/client-ses';

@Injectable()
export class SESProvider implements EmailProvider {
  private transporter: nodemailer.Transporter;

  constructor(config: EmailProviderConfig['config']) {
    // Create SES client
    const ses = new aws.SES({
      region: config.region,
      credentials: {
        accessKeyId: config.username,
        secretAccessKey: config.password,
      },
    });

    // Create Nodemailer transporter using SES
    this.transporter = nodemailer.createTransport({
      SES: { ses, aws },
      sendingRate: 14, // Optional: Limits per second
    });
  }

  async send(to: string, subject: string, content: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: process.env.AWS_SES_FROM_EMAIL,
        to,
        subject,
        html: content,
      });
    } catch (error) {
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
