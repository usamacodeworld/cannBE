import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Product } from './product.entity';

@Entity('product_variants')
export class ProductVariant extends BaseEntity {
  @ManyToOne(() => Product, product => product.variants, { onDelete: 'CASCADE' })
  product: Product;

  @Column()
  variant: string;

  @Column({ unique: true })
  sku: string;

  @Column('decimal')
  price: number;

  @Column('int')
  quantity: number;

  @Column({ nullable: true })
  image: string;
} 