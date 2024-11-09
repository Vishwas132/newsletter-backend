import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscribersService } from './subscribers.service';
import { SubscribersController } from './subscribers.controller';
import { Subscriber } from '../entities/subscriber.entity';
import { ListsService } from 'src/lists/lists.service';
import { List } from 'src/entities/list.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Subscriber, List])],
  providers: [SubscribersService, ListsService],
  controllers: [SubscribersController],
  exports: [SubscribersService],
})
export class SubscribersModule {}
