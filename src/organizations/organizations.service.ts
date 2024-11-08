import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from '../entities/organization.entity';
import { CreateOrganizationDto } from './dto/organization.dto';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
  ) {}

  async create(
    createOrganizationDto: CreateOrganizationDto,
  ): Promise<Organization> {
    const organization = this.organizationRepository.create(
      createOrganizationDto,
    );
    return await this.organizationRepository.save(organization);
  }

  async findOne(id: string): Promise<Organization> {
    return await this.organizationRepository.findOne({ where: { id } });
  }

  async findAll(): Promise<Organization[]> {
    return await this.organizationRepository.find();
  }
}
