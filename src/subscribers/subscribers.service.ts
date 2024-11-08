import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscriber } from '../entities/subscriber.entity';
import { CreateSubscriberDto } from './dto/create-subscriber.dto';
import { UpdateSubscriberDto } from './dto/update-subscriber.dto';
import { QuerySubscriberDto } from './dto/query-subscriber.dto';

@Injectable()
export class SubscribersService {
  constructor(
    @InjectRepository(Subscriber)
    private subscribersRepository: Repository<Subscriber>,
  ) {}

  async create(createSubscriberDto: CreateSubscriberDto): Promise<Subscriber> {
    // Check if subscriber already exists in the organization
    const existingSubscriber = await this.subscribersRepository.findOne({
      where: {
        email: createSubscriberDto.email,
        organization: { id: createSubscriberDto.organizationId },
      },
    });

    if (existingSubscriber) {
      throw new BadRequestException(
        'Subscriber already exists in this organization',
      );
    }

    const subscriber = this.subscribersRepository.create({
      email: createSubscriberDto.email,
      customFields: createSubscriberDto.customFields || {},
      organization: { id: createSubscriberDto.organizationId },
    });

    return this.subscribersRepository.save(subscriber);
  }

  async findAll(query: QuerySubscriberDto) {
    const { organizationId, search, page, limit } = query;

    const queryBuilder = this.subscribersRepository
      .createQueryBuilder('subscriber')
      .leftJoinAndSelect('subscriber.organization', 'organization')
      .where('organization.id = :organizationId', { organizationId });

    if (search) {
      queryBuilder.andWhere('subscriber.email LIKE :search', {
        search: `%${search}%`,
      });
    }

    const [subscribers, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data: subscribers,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, organizationId: string): Promise<Subscriber> {
    const subscriber = await this.subscribersRepository.findOne({
      where: {
        id,
        organization: { id: organizationId },
      },
      relations: ['organization'],
    });

    if (!subscriber) {
      throw new NotFoundException('Subscriber not found');
    }

    return subscriber;
  }

  async update(
    id: string,
    organizationId: string,
    updateSubscriberDto: UpdateSubscriberDto,
  ): Promise<Subscriber> {
    const subscriber = await this.findOne(id, organizationId);

    // Create a new object for the update
    const updateData: Partial<Subscriber> = {
      ...updateSubscriberDto,
      customFields: updateSubscriberDto.customFields
        ? updateSubscriberDto.customFields
        : subscriber.customFields,
    };

    // Merge and save
    Object.assign(subscriber, updateData);
    return this.subscribersRepository.save(subscriber);
  }

  async remove(id: string, organizationId: string): Promise<void> {
    const subscriber = await this.findOne(id, organizationId);
    await this.subscribersRepository.remove(subscriber);
  }

  async bulkImport(
    organizationId: string,
    subscribers: CreateSubscriberDto[],
  ): Promise<{
    success: number;
    failed: number;
    errors: Array<{ email: string; error: string }>;
  }> {
    const results = {
      success: 0,
      failed: 0,
      errors: [],
    };

    for (const subscriber of subscribers) {
      try {
        await this.create({ ...subscriber, organizationId });
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          email: subscriber.email,
          error: error.message,
        });
      }
    }

    return results;
  }
}
