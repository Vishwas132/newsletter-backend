import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from '../entities/organization.entity';
import { CreateOrganizationDto } from './dto/organization.dto';

@Injectable()
export class OrganizationsService {
  private readonly logger = new Logger(OrganizationsService.name);

  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
  ) {}

  async create(
    createOrganizationDto: CreateOrganizationDto,
  ): Promise<Organization> {
    try {
      this.logger.log(`Creating organization: ${createOrganizationDto.name}`);

      const existingOrg = await this.organizationRepository.findOne({
        where: { name: createOrganizationDto.name },
      });

      if (existingOrg) {
        throw new BadRequestException(
          `Organization with name "${createOrganizationDto.name}" already exists`,
        );
      }

      const organization = this.organizationRepository.create(
        createOrganizationDto,
      );
      const savedOrg = await this.organizationRepository.save(organization);

      this.logger.log(
        `Organization created successfully with ID: ${savedOrg.id}`,
      );
      return savedOrg;
    } catch (error) {
      this.logger.error(
        `Failed to create organization: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findOne(id: string): Promise<Organization> {
    try {
      this.logger.log(`Finding organization by ID: ${id}`);

      const organization = await this.organizationRepository.findOne({
        where: { id },
      });

      if (!organization) {
        throw new NotFoundException(`Organization with ID ${id} not found`);
      }

      return organization;
    } catch (error) {
      this.logger.error(
        `Error finding organization ${id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findAll(): Promise<Organization[]> {
    try {
      this.logger.log('Finding all organizations');
      return await this.organizationRepository.find();
    } catch (error) {
      this.logger.error(
        `Failed to fetch organizations: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
