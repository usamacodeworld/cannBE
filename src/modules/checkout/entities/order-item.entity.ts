import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Order } from './order.entity';
import { Product } from '../../products/entities/product.entity';

export interface SelectedVariant {
  attributeId: string;
  attributeValueId: string;
  attributeName: string;
  attributeValue: string;
  attributePrice: number;
}

@Entity('order_items')
export class OrderItem extends BaseEntity {
  @Column()
  orderId: string;

  @Column()
  productId: string;

  @Column()
  productName: string;

  @Column({ nullable: true })
  productSlug: string;

  @Column('int')
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2 })
  unitPrice: number;

  @Column('decimal', { precision: 10, scale: 2 })
  totalPrice: number;

  @Column('simple-json', { nullable: true })
  productSnapshot: any;

  @Column('simple-json', { nullable: true })
  selectedVariants: SelectedVariant[];

  @Column({ nullable: true })
  sku: string;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  taxAmount: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ nullable: true })
  thumbnailImage: string;

  // Relationships
  @ManyToOne(() => Order, order => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @ManyToOne(() => Product, { nullable: true })
  @JoinColumn({ name: 'productId' })
  product?: Product;
} 