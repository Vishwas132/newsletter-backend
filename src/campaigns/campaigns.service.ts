import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
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
  private readonly logger = new Logger(CampaignsService.name);

  constructor(
    @InjectRepository(Campaign)
    private campaignsRepository: Repository<Campaign>,
    @InjectRepository(List)
    private listsRepository: Repository<List>,
    private listsService: ListsService,
    private emailService: EmailService,
  ) {}

  async create(createCampaignDto: CreateCampaignDto): Promise<Campaign> {
    try {
      this.logger.log(`Creating campaign for list ${createCampaignDto.listId}`);

      const list = await this.listsRepository.findOne({
        where: {
          id: createCampaignDto.listId,
          organizationId: createCampaignDto.organizationId,
        },
      });

      if (!list) {
        this.logger.error(`List not found: ${createCampaignDto.listId}`);
        throw new NotFoundException('List not found');
      }

      const campaign = this.campaignsRepository.create({
        ...createCampaignDto,
        organizationId: createCampaignDto.organizationId,
      });

      const savedCampaign = await this.campaignsRepository.save(campaign);
      this.logger.log(
        `Campaign created successfully with ID: ${savedCampaign.id}`,
      );
      return savedCampaign;
    } catch (error) {
      this.logger.error(
        `Failed to create campaign: ${error.message}`,
        error.stack,
      );
      throw error;
    }
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
    try {
      this.logger.log(`Starting campaign send process for campaign ${id}`);

      const campaign = await this.findOne(id, organizationId);

      const list = await this.listsRepository.findOne({
        where: {
          id: campaign.listId,
          organizationId: organizationId,
        },
        relations: ['subscribers'],
      });

      if (!list) {
        this.logger.error(`List not found for campaign ${id}`);
        throw new NotFoundException('List not found');
      }

      const subscribers = await this.listsService.getSegmentedSubscribers(
        list.id,
        organizationId,
      );

      if (subscribers.length === 0) {
        this.logger.warn(`No subscribers found for campaign ${id}`);
        throw new BadRequestException('No subscribers found in the list');
      }

      this.logger.log(
        `Sending campaign ${id} to ${subscribers.length} subscribers`,
      );

      let successCount = 0;
      let failureCount = 0;

      for (const subscriber of subscribers) {
        try {
          await this.emailService.sendEmail(
            subscriber.email,
            campaign.subject,
            campaign.content,
          );
          successCount++;
        } catch (error) {
          failureCount++;
          this.logger.error(
            `Failed to send email to ${subscriber.email}: ${error.message}`,
            error.stack,
          );
        }
      }

      this.logger.log(
        `Campaign ${id} completed. Success: ${successCount}, Failures: ${failureCount}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send campaign ${id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
