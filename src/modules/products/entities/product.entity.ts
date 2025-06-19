import { Entity, Column, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { ProductVariant } from './product-variant.entity';

@Entity('products')
export class Product extends BaseEntity {
  @Column({ nullable: true })
  added_by: string;

  @Column({ nullable: true })
  user_id: string;

  @Column({ nullable: true })
  category_id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column('simple-array', { nullable: true })
  photos: string[];

  @Column({ nullable: true })
  thumbnail_img: string;

  @Column('simple-array', { nullable: true })
  tags: string[];

  @Column({ nullable: true })
  short_description: string;

  @Column({ nullable: true })
  long_description: string;

  @Column('decimal', { nullable: true })
  regular_price: number;

  @Column('decimal', { nullable: true })
  sale_price: number;

  @Column({ default: false })
  is_variant: boolean;

  @Column({ default: false })
  published: boolean;

  @Column({ default: false })
  approved: boolean;

  @Column('int', { nullable: true })
  stock: number;

  @Column({ default: false })
  cash_on_delivery: boolean;

  @Column({ default: false })
  featured: boolean;

  @Column('decimal', { nullable: true })
  discount: number;

  @Column({ nullable: true })
  discount_type: string;

  @Column({ nullable: true })
  discount_start_date: Date;

  @Column({ nullable: true })
  discount_end_date: Date;

  @Column('decimal', { nullable: true })
  tax: number;

  @Column({ nullable: true })
  tax_type: string;

  @Column({ nullable: true })
  shipping_type: string;

  @Column('decimal', { nullable: true })
  shipping_cose: number;

  @Column('int', { nullable: true })
  est_shipping_days: number;

  @Column('int', { nullable: true })
  num_of_sales: number;

  @Column({ nullable: true })
  meta_title: string;

  @Column({ nullable: true })
  meta_description: string;

  @Column('decimal', { nullable: true })
  rating: number;

  @Column({ nullable: true })
  external_link: string;

  @Column({ nullable: true })
  external_link_btn: string;

  @OneToMany(() => ProductVariant, variant => variant.product, { cascade: true })
  variants: ProductVariant[];
} 