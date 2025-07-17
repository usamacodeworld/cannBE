import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity('category_state_restrictions')
@Index(['categoryId'], { unique: true })
export class CategoryStateRestriction extends BaseEntity {
  @Column({ type: 'uuid' })
  categoryId: string;

  @Column({ type: 'json' })
  states: string[]; // Array of 2-character state codes

  @Column({ type: 'boolean', default: true })
  isRestricted: boolean;

  @Column({ type: 'text', nullable: true })
  reason?: string;

  @Column({ type: 'text', nullable: true })
  customMessage?: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'uuid', nullable: true })
  createdBy?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;
} 