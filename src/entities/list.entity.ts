import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Organization } from './organization.entity';
import { Subscriber } from './subscriber.entity';
import { SegmentRuleDto } from '../lists/dto/segment-rule.dto';

@Entity('lists')
export class List {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ name: 'organization_id' })
  organizationId: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @Column('jsonb', {
    name: 'custom_fields',
    default: {},
  })
  customFields: Record<string, any>;

  @ManyToMany(() => Subscriber)
  @JoinTable({
    name: 'list_subscribers',
    joinColumn: {
      name: 'list_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'subscriber_id',
      referencedColumnName: 'id',
    },
  })
  subscribers: Subscriber[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column('jsonb', {
    name: 'segment_rules',
    nullable: true,
  })
  segmentRules: SegmentRuleDto[];
}
