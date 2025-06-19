import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Attribute } from './attribute.entity';

@Entity('attribute_values')
export class AttributeValue extends BaseEntity {
  @Column()
  value: string;

  @Column({ nullable: true })
  colorCode?: string;

  @ManyToOne(() => Attribute, attribute => attribute.values, { onDelete: 'CASCADE' })
  attribute: Attribute;
} 