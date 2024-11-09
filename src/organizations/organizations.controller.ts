import { Controller, Get, Post, Body, Param, Logger } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/organization.dto';
import { Organization } from '../entities/organization.entity';

@Controller('/organizations')
export class OrganizationsController {
  private readonly logger = new Logger(OrganizationsController.name);

  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  async create(
    @Body() createOrganizationDto: CreateOrganizationDto,
  ): Promise<Organization> {
    try {
      this.logger.log(
        `Creating organization with name: ${createOrganizationDto.name}`,
      );
      return await this.organizationsService.create(createOrganizationDto);
    } catch (error) {
      this.logger.error(`Failed to create organization: ${error.message}`);
      throw error; // Rethrow the error to be handled by the global error handler
    }
  }

  @Get()
  async findAll(): Promise<Organization[]> {
    try {
      this.logger.log('Fetching all organizations');
      return await this.organizationsService.findAll();
    } catch (error) {
      this.logger.error(`Failed to fetch organizations: ${error.message}`);
      throw error; // Rethrow the error to be handled by the global error handler
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Organization> {
    try {
      this.logger.log(`Fetching organization with id: ${id}`);
      return await this.organizationsService.findOne(id);
    } catch (error) {
      this.logger.error(
        `Failed to fetch organization with id ${id}: ${error.message}`,
      );
      throw error; // Rethrow the error to be handled by the global error handler
    }
  }
}
