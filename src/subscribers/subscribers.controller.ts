import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseUUIDPipe,
  Put,
} from '@nestjs/common';
import { SubscribersService } from './subscribers.service';
import { CreateSubscriberDto } from './dto/create-subscriber.dto';
import { UpdateSubscriberDto } from './dto/update-subscriber.dto';
import { QuerySubscriberDto } from './dto/query-subscriber.dto';
import { JwtAuthGuard } from '../users/guards/jwt-auth.guard';
import { OrganizationGuard } from '../users/guards/organization.guard';

@Controller('/subscribers')
@UseGuards(JwtAuthGuard, OrganizationGuard)
export class SubscribersController {
  constructor(private readonly subscribersService: SubscribersService) {}

  @Post()
  create(
    @Body() createSubscriberDto: CreateSubscriberDto,
    @Query() query: { listId: string },
  ) {
    try {
      return this.subscribersService.create(query.listId, createSubscriberDto);
    } catch (error) {
      throw error;
    }
  }

  @Get()
  findAll(@Query() query: QuerySubscriberDto) {
    try {
      return this.subscribersService.findAll(query);
    } catch (error) {
      throw error;
    }
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('organizationId', ParseUUIDPipe) organizationId: string,
  ) {
    try {
      if (!id || !organizationId) {
        throw new Error('Missing required parameters');
      }
      return this.subscribersService.findOne(id, organizationId);
    } catch (error) {
      throw error;
    }
  }

  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('organizationId', ParseUUIDPipe) organizationId: string,
    @Body() updateSubscriberDto: UpdateSubscriberDto,
  ) {
    return this.subscribersService.update(
      id,
      organizationId,
      updateSubscriberDto,
    );
  }

  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('organizationId', ParseUUIDPipe) organizationId: string,
  ) {
    return this.subscribersService.remove(id, organizationId);
  }
}
