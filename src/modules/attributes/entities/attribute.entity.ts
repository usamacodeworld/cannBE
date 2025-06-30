import { Entity, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { AttributeValue } from './attribute-value.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('attributes')
export class Attribute extends BaseEntity {
  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  productId?: string;

  @ManyToOne(() => Product, { nullable: true })
  @JoinColumn({ name: 'productId' })
  product?: Product;

  @OneToMany(() => AttributeValue, value => value.attribute)
  values: AttributeValue[];
} 