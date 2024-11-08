import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Campaign } from '../entities/campaign.entity';
import { List } from '../entities/list.entity';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { ListsService } from '../lists/lists.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class CampaignsService {
  constructor(
    @InjectRepository(Campaign)
    private campaignsRepository: Repository<Campaign>,
    @InjectRepository(List)
    private listsRepository: Repository<List>,
    private listsService: ListsService,
    private emailService: EmailService,
  ) {}

  async create(createCampaignDto: CreateCampaignDto): Promise<Campaign> {
    const list = await this.listsRepository.findOne({
      where: {
        id: createCampaignDto.listId,
        organizationId: createCampaignDto.organizationId,
      },
    });

    if (!list) {
      throw new NotFoundException('List not found');
    }

    const campaign = this.campaignsRepository.create({
      ...createCampaignDto,
      organizationId: createCampaignDto.organizationId,
    });

    return this.campaignsRepository.save(campaign);
  }

  async findAll(organizationId: string): Promise<Campaign[]> {
    return this.campaignsRepository.find({
      where: { organizationId },
      relations: ['list'],
    });
  }

  async findOne(id: string, organizationId: string): Promise<Campaign> {
    const campaign = await this.campaignsRepository.findOne({
      where: {
        id,
        organizationId,
      },
      relations: ['list'],
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    return campaign;
  }

  async update(
    id: string,
    organizationId: string,
    updateCampaignDto: UpdateCampaignDto,
  ): Promise<Campaign> {
    const campaign = await this.findOne(id, organizationId);

    Object.assign(campaign, updateCampaignDto);
    return this.campaignsRepository.save(campaign);
  }

  async remove(id: string, organizationId: string): Promise<void> {
    const campaign = await this.findOne(id, organizationId);
    await this.campaignsRepository.remove(campaign);
  }

  async send(id: string, organizationId: string): Promise<void> {
    const campaign = await this.findOne(id, organizationId);

    const list = await this.listsRepository.findOne({
      where: {
        id: campaign.listId,
        organizationId: organizationId,
      },
      relations: ['subscribers'],
    });

    if (!list) {
      throw new NotFoundException('List not found');
    }

    const subscribers = await this.listsService.getSegmentedSubscribers(
      list.id,
      organizationId,
    );

    if (subscribers.length === 0) {
      throw new BadRequestException('No subscribers found in the list');
    }

    for (const subscriber of subscribers) {
      try {
        await this.emailService.sendEmail(
          subscriber.email,
          campaign.subject,
          campaign.content,
        );
      } catch (error) {
        // Log error or handle as needed
        console.error(`Failed to send email to ${subscriber.email}`, error);
      }
    }
  }
}
