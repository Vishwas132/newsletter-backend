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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { ListsService } from './lists.service';
import { CreateListDto } from './dto/create-list.dto';
import { UpdateListDto } from './dto/update-list.dto';
import { JwtAuthGuard } from '../users/guards/jwt-auth.guard';
import { OrganizationGuard } from '../users/guards/organization.guard';
import { SegmentRuleDto } from './dto/segment-rule.dto';

@Controller('api/lists')
@UseGuards(JwtAuthGuard, OrganizationGuard)
export class ListsController {
  constructor(private readonly listsService: ListsService) {}

  @Post()
  create(@Body() createListDto: CreateListDto) {
    return this.listsService.create(createListDto);
  }

  @Get()
  findAll(@Query('organizationId', ParseUUIDPipe) organizationId: string) {
    return this.listsService.findAll(organizationId);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('organizationId', ParseUUIDPipe) organizationId: string,
  ) {
    return this.listsService.findOne(id, organizationId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('organizationId', ParseUUIDPipe) organizationId: string,
    @Body() updateListDto: UpdateListDto,
  ) {
    return this.listsService.update(id, organizationId, updateListDto);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('organizationId', ParseUUIDPipe) organizationId: string,
  ) {
    return this.listsService.remove(id, organizationId);
  }

  @Post(':id/subscribers/:subscriberId')
  addSubscriber(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('subscriberId', ParseUUIDPipe) subscriberId: string,
    @Query('organizationId', ParseUUIDPipe) organizationId: string,
  ) {
    return this.listsService.addSubscriber(id, subscriberId, organizationId);
  }

  @Delete(':id/subscribers/:subscriberId')
  removeSubscriber(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('subscriberId', ParseUUIDPipe) subscriberId: string,
    @Query('organizationId', ParseUUIDPipe) organizationId: string,
  ) {
    return this.listsService.removeSubscriber(id, subscriberId, organizationId);
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  async importSubscribers(
    @UploadedFile() file: Express.Multer.File,
    @Query('listId', ParseUUIDPipe) listId: string,
    @Query('organizationId', ParseUUIDPipe) organizationId: string,
  ) {
    return this.listsService.importSubscribersFromCsv(
      listId,
      organizationId,
      file,
    );
  }

  @Post(':id/segment')
  async addSegmentRule(
    @Param('id') listId: string,
    @Query('organizationId') organizationId: string,
    @Body() segmentRule: SegmentRuleDto,
  ) {
    return this.listsService.addSegmentRule(
      listId,
      organizationId,
      segmentRule,
    );
  }

  @Get(':id/segmented-subscribers')
  async getSegmentedSubscribers(
    @Param('id') listId: string,
    @Query('organizationId') organizationId: string,
  ) {
    return this.listsService.getSegmentedSubscribers(listId, organizationId);
  }
}
