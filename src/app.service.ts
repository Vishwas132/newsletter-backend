import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  getHello(): string {
    try {
      this.logger.log('Generating hello message');
      return 'Hello World!';
    } catch (error) {
      this.logger.error(`Error in getHello: ${error.message}`, error.stack);
      throw error;
    }
  }
}
