import { registerAs } from '@nestjs/config';

export default registerAs('email', () => ({
  provider: process.env.EMAIL_PROVIDER || 'smtp',
  config: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    username: process.env.SMTP_USERNAME,
    password: process.env.SMTP_PASSWORD,
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    fromEmail: process.env.AWS_SES_FROM_EMAIL,
  },
}));
