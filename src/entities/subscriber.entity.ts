import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Organization } from './organization.entity';

@Entity('subscribers')
export class Subscriber {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

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

  @Column('text', {
    name: 'gpg_public_key',
    nullable: true,
  })
  gpgPublicKey: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
