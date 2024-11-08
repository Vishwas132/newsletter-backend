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
import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { JwtAuthGuard } from '../users/guards/jwt-auth.guard';
import { OrganizationGuard } from '../users/guards/organization.guard';

@Controller('api/campaigns')
@UseGuards(JwtAuthGuard, OrganizationGuard)
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Post()
  create(@Body() createCampaignDto: CreateCampaignDto) {
    return this.campaignsService.create(createCampaignDto);
  }

  @Get()
  findAll(@Query('organizationId', ParseUUIDPipe) organizationId: string) {
    return this.campaignsService.findAll(organizationId);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('organizationId', ParseUUIDPipe) organizationId: string,
  ) {
    return this.campaignsService.findOne(id, organizationId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('organizationId', ParseUUIDPipe) organizationId: string,
    @Body() updateCampaignDto: UpdateCampaignDto,
  ) {
    return this.campaignsService.update(id, organizationId, updateCampaignDto);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('organizationId', ParseUUIDPipe) organizationId: string,
  ) {
    return this.campaignsService.remove(id, organizationId);
  }

  @Post(':id/send')
  send(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('organizationId', ParseUUIDPipe) organizationId: string,
  ) {
    return this.campaignsService.send(id, organizationId);
  }
}
