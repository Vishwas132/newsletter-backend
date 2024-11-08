import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { SubscribersService } from './subscribers.service';
import { CreateSubscriberDto } from './dto/create-subscriber.dto';
import { UpdateSubscriberDto } from './dto/update-subscriber.dto';
import { QuerySubscriberDto } from './dto/query-subscriber.dto';
import { JwtAuthGuard } from '../users/guards/jwt-auth.guard';
import { OrganizationGuard } from '../users/guards/organization.guard';

@Controller('api/subscribers')
@UseGuards(JwtAuthGuard, OrganizationGuard)
export class SubscribersController {
  constructor(private readonly subscribersService: SubscribersService) {}

  @Post()
  create(@Body() createSubscriberDto: CreateSubscriberDto) {
    return this.subscribersService.create(createSubscriberDto);
  }

  @Get()
  findAll(@Query() query: QuerySubscriberDto) {
    return this.subscribersService.findAll(query);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('organizationId', ParseUUIDPipe) organizationId: string,
  ) {
    return this.subscribersService.findOne(id, organizationId);
  }

  @Patch(':id')
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
