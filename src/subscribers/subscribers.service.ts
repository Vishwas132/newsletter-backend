import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Subscriber } from '../entities/subscriber.entity';
import { CreateSubscriberDto } from './dto/create-subscriber.dto';
import { UpdateSubscriberDto } from './dto/update-subscriber.dto';
import { QuerySubscriberDto } from './dto/query-subscriber.dto';
import { ListsService } from 'src/lists/lists.service';

@Injectable()
export class SubscribersService {
  private readonly logger = new Logger(SubscribersService.name);
  constructor(
    @InjectRepository(Subscriber)
    private subscribersRepository: Repository<Subscriber>,
    private listsService: ListsService,
  ) {}

  async create(
    listId: string,
    createSubscriberDto: CreateSubscriberDto,
  ): Promise<Subscriber> {
    try {
      this.logger.log(
        `Creating subscriber for list ${listId} and organization ${createSubscriberDto.organizationId}, email: ${createSubscriberDto.email}, custom fields: ${JSON.stringify(createSubscriberDto.customFields)}`,
      );
      // Check if subscriber already exists in the organization
      const existingSubscriber = await this.subscribersRepository.findOne({
        where: {
          email: createSubscriberDto.email,
          organizationId: createSubscriberDto.organizationId,
        },
      });

      if (existingSubscriber) {
        throw new BadRequestException(
          'Subscriber already exists in this organization',
        );
      }

      let subscriber = this.subscribersRepository.create({
        email: createSubscriberDto.email,
        customFields: createSubscriberDto.customFields || {},
        organizationId: createSubscriberDto.organizationId,
      });

      subscriber = await this.subscribersRepository.save(subscriber);
      this.logger.debug(
        `Subscriber created successfully with ID: ${JSON.stringify(subscriber)}`,
      );

      await this.listsService.addSubscriber(
        listId,
        subscriber.id,
        createSubscriberDto.organizationId,
      );

      return subscriber;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        'Failed to create subscriber: ' + error.message,
      );
    }
  }

  async findAll(query: QuerySubscriberDto) {
    try {
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
    } catch (error) {
      throw new BadRequestException(
        'Failed to fetch subscribers: ' + error.message,
      );
    }
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
    try {
      const subscriber = await this.findOne(id, organizationId);

      if (updateSubscriberDto.email) {
        // Check if new email already exists for another subscriber
        const existingSubscriber = await this.subscribersRepository.findOne({
          where: {
            email: updateSubscriberDto.email,
            organization: { id: organizationId },
            id: Not(id), // Exclude current subscriber
          },
        });

        if (existingSubscriber) {
          throw new BadRequestException(
            'Email already exists in this organization',
          );
        }
      }

      const updateData: Partial<Subscriber> = {
        ...updateSubscriberDto,
        customFields: updateSubscriberDto.customFields
          ? updateSubscriberDto.customFields
          : subscriber.customFields,
      };

      Object.assign(subscriber, updateData);
      return await this.subscribersRepository.save(subscriber);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException(
        'Failed to update subscriber: ' + error.message,
      );
    }
  }

  async remove(id: string, organizationId: string): Promise<void> {
    const subscriber = await this.findOne(id, organizationId);
    await this.subscribersRepository.remove(subscriber);
  }

  async bulkImport(
    listId: string,
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
        await this.create(listId, { ...subscriber, organizationId });
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
