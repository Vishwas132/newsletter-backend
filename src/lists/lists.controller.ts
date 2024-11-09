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
  Logger,
  HttpException,
  HttpStatus,
  Put,
} from '@nestjs/common';
import { ListsService } from './lists.service';
import { CreateListDto } from './dto/create-list.dto';
import { UpdateListDto } from './dto/update-list.dto';
import { JwtAuthGuard } from '../users/guards/jwt-auth.guard';
import { OrganizationGuard } from '../users/guards/organization.guard';
import { SegmentRuleDto } from './dto/segment-rule.dto';

@Controller('/lists')
@UseGuards(JwtAuthGuard, OrganizationGuard)
export class ListsController {
  private readonly logger = new Logger(ListsController.name);

  constructor(private readonly listsService: ListsService) {}

  @Post()
  async create(@Body() createListDto: CreateListDto) {
    try {
      this.logger.log(
        `Creating list for organization ${createListDto.organizationId}`,
      );
      return await this.listsService.create(createListDto);
    } catch (error) {
      this.logger.error(`Failed to create list: ${error.message}`, error.stack);
      throw new HttpException(
        error.message || 'Failed to create list',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  async findAll(
    @Query('organizationId', ParseUUIDPipe) organizationId: string,
  ) {
    try {
      this.logger.log(`Fetching lists for organization ${organizationId}`);
      return await this.listsService.findAll(organizationId);
    } catch (error) {
      this.logger.error(`Failed to fetch lists: ${error.message}`, error.stack);
      throw new HttpException(
        error.message || 'Failed to fetch lists',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('organizationId', ParseUUIDPipe) organizationId: string,
  ) {
    try {
      this.logger.log(`Fetching list ${id}`);
      return await this.listsService.findOne(id, organizationId);
    } catch (error) {
      this.logger.error(
        `Failed to fetch list ${id}: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        error.message || 'Failed to fetch list',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('organizationId', ParseUUIDPipe) organizationId: string,
    @Body() updateListDto: UpdateListDto,
  ) {
    try {
      this.logger.log(`Updating list ${id}`);
      return await this.listsService.update(id, organizationId, updateListDto);
    } catch (error) {
      this.logger.error(
        `Failed to update list ${id}: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        error.message || 'Failed to update list',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('organizationId', ParseUUIDPipe) organizationId: string,
  ) {
    try {
      this.logger.log(`Removing list ${id}`);
      await this.listsService.remove(id, organizationId);
    } catch (error) {
      this.logger.error(
        `Failed to remove list ${id}: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        error.message || 'Failed to remove list',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':id/subscribers/:subscriberId')
  async addSubscriber(
    @Param('id', ParseUUIDPipe) listId: string,
    @Param('subscriberId', ParseUUIDPipe) subscriberId: string,
    @Query('organizationId', ParseUUIDPipe) organizationId: string,
  ) {
    try {
      this.logger.log(`Adding subscriber ${subscriberId} to list ${listId}`);
      return await this.listsService.addSubscriber(
        listId,
        subscriberId,
        organizationId,
      );
    } catch (error) {
      this.logger.error(
        `Failed to add subscriber ${subscriberId} to list ${listId}: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        error.message || 'Failed to add subscriber to list',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id/subscribers/:subscriberId')
  async removeSubscriber(
    @Param('id', ParseUUIDPipe) listId: string,
    @Param('subscriberId', ParseUUIDPipe) subscriberId: string,
    @Query('organizationId', ParseUUIDPipe) organizationId: string,
  ) {
    try {
      this.logger.log(
        `Removing subscriber ${subscriberId} from list ${listId}`,
      );
      return await this.listsService.removeSubscriber(
        listId,
        subscriberId,
        organizationId,
      );
    } catch (error) {
      this.logger.error(
        `Failed to remove subscriber ${subscriberId} from list ${listId}: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        error.message || 'Failed to remove subscriber from list',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':id/segment')
  async addSegmentRule(
    @Param('id') listId: string,
    @Query('organizationId') organizationId: string,
    @Body() segmentRule: SegmentRuleDto,
  ) {
    try {
      this.logger.log(`Adding segment rule to list ${listId}`);
      return await this.listsService.addSegmentRule(
        listId,
        organizationId,
        segmentRule,
      );
    } catch (error) {
      this.logger.error(
        `Failed to add segment rule to list ${listId}: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        error.message || 'Failed to add segment rule',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id/segmented-subscribers')
  async getSegmentedSubscribers(
    @Param('id') listId: string,
    @Query('organizationId') organizationId: string,
  ) {
    try {
      this.logger.log(`Fetching segmented subscribers for list ${listId}`);
      return await this.listsService.getSegmentedSubscribers(
        listId,
        organizationId,
      );
    } catch (error) {
      this.logger.error(
        `Failed to fetch segmented subscribers for list ${listId}: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        error.message || 'Failed to fetch segmented subscribers',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
