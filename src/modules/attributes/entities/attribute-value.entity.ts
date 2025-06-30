import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Attribute } from './attribute.entity';
import { MediaFile } from '../../media/media-file.entity';

@Entity('attribute_values')
export class AttributeValue extends BaseEntity {


  @Column({ nullable: true })
  variant?: string;

  @Column({ nullable: true })
  sku?: string;

  @Column('decimal', { nullable: true })
  price?: number;

  @Column('int', { nullable: true })
  quantity?: number;

  @Column({ nullable: true })
  imageId?: string;

  @ManyToOne(() => MediaFile, { nullable: true })
  @JoinColumn({ name: 'imageId' })
  image?: MediaFile;

  @ManyToOne(() => Attribute, attribute => attribute.values, { onDelete: 'CASCADE' })
  attribute: Attribute;
} 