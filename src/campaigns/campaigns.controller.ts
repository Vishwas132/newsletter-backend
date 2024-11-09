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
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { JwtAuthGuard } from '../users/guards/jwt-auth.guard';
import { OrganizationGuard } from '../users/guards/organization.guard';

@Controller('/campaigns')
@UseGuards(JwtAuthGuard, OrganizationGuard)
export class CampaignsController {
  private readonly logger = new Logger(CampaignsController.name);

  constructor(private readonly campaignsService: CampaignsService) {}

  @Post()
  async create(@Body() createCampaignDto: CreateCampaignDto) {
    try {
      this.logger.log(`Creating campaign for list ${createCampaignDto.listId}`);
      return await this.campaignsService.create(createCampaignDto);
    } catch (error) {
      this.logger.error(
        `Failed to create campaign: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        error.message || 'Failed to create campaign',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  async findAll(
    @Query('organizationId', ParseUUIDPipe) organizationId: string,
  ) {
    try {
      this.logger.log(`Fetching campaigns for organization ${organizationId}`);
      return await this.campaignsService.findAll(organizationId);
    } catch (error) {
      this.logger.error(
        `Failed to fetch campaigns: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        error.message || 'Failed to fetch campaigns',
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
      this.logger.log(`Fetching campaign ${id}`);
      return await this.campaignsService.findOne(id, organizationId);
    } catch (error) {
      this.logger.error(
        `Failed to fetch campaign ${id}: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        error.message || 'Failed to fetch campaign',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('organizationId', ParseUUIDPipe) organizationId: string,
    @Body() updateCampaignDto: UpdateCampaignDto,
  ) {
    try {
      this.logger.log(`Updating campaign ${id}`);
      return await this.campaignsService.update(
        id,
        organizationId,
        updateCampaignDto,
      );
    } catch (error) {
      this.logger.error(
        `Failed to update campaign ${id}: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        error.message || 'Failed to update campaign',
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
      this.logger.log(`Removing campaign ${id}`);
      await this.campaignsService.remove(id, organizationId);
    } catch (error) {
      this.logger.error(
        `Failed to remove campaign ${id}: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        error.message || 'Failed to remove campaign',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':id/send')
  async send(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('organizationId', ParseUUIDPipe) organizationId: string,
  ) {
    try {
      this.logger.log(`Sending campaign ${id}`);
      await this.campaignsService.send(id, organizationId);
    } catch (error) {
      this.logger.error(
        `Failed to send campaign ${id}: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        error.message || 'Failed to send campaign',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
