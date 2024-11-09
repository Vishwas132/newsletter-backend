import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { List } from '../entities/list.entity';
import { Subscriber } from '../entities/subscriber.entity';
import { CreateListDto } from './dto/create-list.dto';
import { UpdateListDto } from './dto/update-list.dto';
import * as csv from 'csv-parse';
import { SegmentRuleDto } from './dto/segment-rule.dto';

@Injectable()
export class ListsService {
  private readonly logger = new Logger(ListsService.name);

  constructor(
    @InjectRepository(List)
    private listsRepository: Repository<List>,
    @InjectRepository(Subscriber)
    private subscribersRepository: Repository<Subscriber>,
  ) {}

  async create(createListDto: CreateListDto): Promise<List> {
    const list = this.listsRepository.create({
      name: createListDto.name,
      customFields: createListDto.customFields || {},
      organization: { id: createListDto.organizationId },
    });

    return this.listsRepository.save(list);
  }

  async findAll(organizationId: string): Promise<List[]> {
    return this.listsRepository.find({
      where: { organization: { id: organizationId } },
      relations: ['subscribers'],
    });
  }

  async findOne(id: string, organizationId: string): Promise<List> {
    const list = await this.listsRepository.findOne({
      where: {
        id,
        organization: { id: organizationId },
      },
      relations: ['subscribers'],
    });

    if (!list) {
      throw new NotFoundException('List not found');
    }

    return list;
  }

  async update(
    id: string,
    organizationId: string,
    updateListDto: UpdateListDto,
  ): Promise<List> {
    const list = await this.findOne(id, organizationId);

    Object.assign(list, {
      ...updateListDto,
      customFields: updateListDto.customFields
        ? updateListDto.customFields
        : list.customFields,
    });

    return this.listsRepository.save(list);
  }

  async remove(id: string, organizationId: string): Promise<void> {
    const list = await this.findOne(id, organizationId);
    await this.listsRepository.remove(list);
  }

  async addSubscriber(
    listId: string,
    subscriberId: string,
    organizationId: string,
  ): Promise<List> {
    const list = await this.findOne(listId, organizationId);
    this.logger.debug(
      `Adding subscriber ${subscriberId} to list ${listId} and organization ${organizationId}`,
    );
    const subscriber = await this.subscribersRepository.findOne({
      where: {
        id: subscriberId,
        organization: { id: organizationId },
      },
    });

    if (!subscriber) {
      throw new NotFoundException('Subscriber not found');
    }

    // Check if subscriber is already in the list using a query
    const existingSubscriber = await this.listsRepository
      .createQueryBuilder('list')
      .innerJoin('list.subscribers', 'subscriber')
      .where('list.id = :listId', { listId })
      .andWhere('subscriber.id = :subscriberId', { subscriberId })
      .getOne();

    if (existingSubscriber) {
      throw new BadRequestException('Subscriber already in list');
    }

    // Use createQueryBuilder to add the subscriber to the list
    await this.listsRepository
      .createQueryBuilder()
      .relation(List, 'subscribers')
      .of(list)
      .add(subscriber);

    // Reload the list to get updated subscribers
    return this.findOne(listId, organizationId);
  }

  async removeSubscriber(
    listId: string,
    subscriberId: string,
    organizationId: string,
  ): Promise<List> {
    const list = await this.findOne(listId, organizationId);
    const subscriber = await this.subscribersRepository.findOne({
      where: {
        id: subscriberId,
        organization: { id: organizationId },
      },
    });

    if (!subscriber) {
      throw new NotFoundException('Subscriber not found');
    }

    // Use createQueryBuilder to remove the subscriber from the list
    await this.listsRepository
      .createQueryBuilder()
      .relation(List, 'subscribers')
      .of(list)
      .remove(subscriber);

    // Reload the list to get updated subscribers
    return this.findOne(listId, organizationId);
  }

  async importSubscribersFromCsv(
    listId: string,
    organizationId: string,
    csvBuffer: Express.Multer.File,
  ): Promise<void> {
    const list = await this.findOne(listId, organizationId);

    const records = await new Promise<any[]>((resolve, reject) => {
      csv.parse(
        csvBuffer.buffer,
        {
          columns: true,
          skip_empty_lines: true,
        },
        (err, records) => {
          if (err) reject(err);
          else resolve(records);
        },
      );
    });

    const subscribers = records.map(record => {
      const subscriber = new Subscriber();
      subscriber.email = record.email;
      subscriber.organizationId = organizationId;
      subscriber.customFields = {};

      // Map CSV columns to custom fields
      Object.keys(record).forEach(key => {
        if (key !== 'email') {
          subscriber.customFields[key] = record[key];
        }
      });

      return subscriber;
    });

    // Save subscribers in batches
    const batchSize = 100;
    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize);
      const savedSubscribers = await this.subscribersRepository.save(batch);

      // Add subscribers to list
      await this.listsRepository
        .createQueryBuilder()
        .relation(List, 'subscribers')
        .of(list)
        .add(savedSubscribers);
    }
  }

  async getSegmentedSubscribers(
    listId: string,
    organizationId: string,
  ): Promise<Subscriber[]> {
    this.logger.debug(
      `Getting segmented subscribers for list ${listId} and organization ${organizationId}`,
    );

    const list = await this.listsRepository.findOne({
      where: {
        id: listId,
        organization: { id: organizationId },
      },
    });

    if (!list) {
      throw new NotFoundException('List not found');
    }

    // Simplified query using the junction table directly
    const baseQuery = this.subscribersRepository
      .createQueryBuilder('subscriber')
      .innerJoin(
        'list_subscribers',
        'list_subscribers',
        'list_subscribers.subscriber_id = subscriber.id',
      )
      .where('list_subscribers.list_id = :listId', { listId })
      .andWhere('subscriber.organization_id = :organizationId', {
        organizationId,
      });

    // If there are segment rules, apply them
    if (list.segmentRules?.length) {
      list.segmentRules.forEach((rule, index) => {
        const paramName = `value${index}`;
        const fieldPath = `subscriber.custom_fields->>'${rule.field}'`;

        switch (rule.operator) {
          case 'equals':
            baseQuery.andWhere(`${fieldPath} = :${paramName}`, {
              [paramName]: rule.value,
            });
            break;
          case 'contains':
            baseQuery.andWhere(`${fieldPath} ILIKE :${paramName}`, {
              [paramName]: `%${rule.value}%`,
            });
            break;
          case 'startsWith':
            baseQuery.andWhere(`${fieldPath} ILIKE :${paramName}`, {
              [paramName]: `${rule.value}%`,
            });
            break;
          case 'endsWith':
            baseQuery.andWhere(`${fieldPath} ILIKE :${paramName}`, {
              [paramName]: `%${rule.value}`,
            });
            break;
          case 'greaterThan':
            baseQuery.andWhere(`(${fieldPath})::numeric > :${paramName}`, {
              [paramName]: rule.value,
            });
            break;
          case 'lessThan':
            baseQuery.andWhere(`(${fieldPath})::numeric < :${paramName}`, {
              [paramName]: rule.value,
            });
            break;
        }
      });
    }

    // Log the query for debugging
    this.logger.debug('Generated SQL:', baseQuery.getSql());
    this.logger.debug('Query parameters:', baseQuery.getParameters());

    try {
      const subscribers = await baseQuery.getMany();
      this.logger.debug(`Found ${subscribers.length} subscribers`);
      return subscribers;
    } catch (error) {
      this.logger.error('Error executing query:', error);
      throw error;
    }
  }

  async addSegmentRule(
    listId: string,
    organizationId: string,
    segmentRule: SegmentRuleDto,
  ): Promise<List> {
    const list = await this.findOne(listId, organizationId);

    if (!list.segmentRules) {
      list.segmentRules = [];
    }

    // Validate that the field exists in customFields
    const hasField = Object.keys(list.customFields).includes(segmentRule.field);
    if (!hasField) {
      throw new BadRequestException(
        `Field "${segmentRule.field}" does not exist in list custom fields`,
      );
    }

    // Add the new segment rule
    list.segmentRules.push(segmentRule);

    // Save and return the updated list
    return this.listsRepository.save(list);
  }

  private async addSubscribersToList(
    listId: string,
    subscriberIds: string[],
  ): Promise<void> {
    const list = await this.listsRepository.findOne({
      where: { id: listId },
      relations: ['subscribers'],
    });

    if (!list) {
      throw new NotFoundException('List not found');
    }

    // Get all subscribers
    const subscribers = await this.subscribersRepository.findBy({
      id: In(subscriberIds),
    });

    // Add new subscribers to the list
    list.subscribers = [...list.subscribers, ...subscribers];

    await this.listsRepository.save(list);
  }

  private convertValueToType(value: string, type: string): any {
    switch (type.toLowerCase()) {
      case 'number':
        return Number(value);
      case 'boolean':
        return value.toLowerCase() === 'true';
      case 'date':
        return new Date(value);
      case 'array':
        try {
          return JSON.parse(value);
        } catch {
          return value.split(',').map(item => item.trim());
        }
      default:
        return value;
    }
  }
}
