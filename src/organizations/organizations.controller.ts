import { Controller, Get, Post, Body, UseGuards, Param } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/organization.dto';
import { Organization } from '../entities/organization.entity';
import { JwtAuthGuard } from '../users/guards/jwt-auth.guard';

@Controller('api/organizations')
@UseGuards(JwtAuthGuard) // Protect all routes with JWT authentication
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  async create(
    @Body() createOrganizationDto: CreateOrganizationDto,
  ): Promise<Organization> {
    return await this.organizationsService.create(createOrganizationDto);
  }

  @Get()
  async findAll(): Promise<Organization[]> {
    return await this.organizationsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Organization> {
    return await this.organizationsService.findOne(id);
  }
}
