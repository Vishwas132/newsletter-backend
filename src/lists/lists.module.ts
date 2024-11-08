import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { List } from '../entities/list.entity';
import { Subscriber } from '../entities/subscriber.entity';
import { ListsService } from './lists.service';
import { ListsController } from './lists.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [TypeOrmModule.forFeature([List, Subscriber]), ConfigModule],
  providers: [ListsService],
  controllers: [ListsController],
  exports: [ListsService],
})
export class ListsModule {}
