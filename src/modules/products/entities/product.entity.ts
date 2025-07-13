import { Entity, Column, ManyToOne, OneToMany, JoinColumn, ManyToMany, JoinTable } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Category } from '../../category/category.entity';
import { MediaFile } from '../../media/media-file.entity';
import { Attribute } from '../../attributes/entities/attribute.entity';
import { Seller } from '../../seller/entities/seller.entity';

@Entity('products')
export class Product extends BaseEntity {
  @Column({ nullable: true })
  addedBy: string;

  @Column({ nullable: true })
  userId: string;

  @Column({ nullable: true })
  sellerId: string;

  @ManyToOne(() => Seller, { nullable: true })
  @JoinColumn({ name: 'sellerId' })
  seller: Seller;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @ManyToMany(() => MediaFile)
  @JoinTable()
  photos: MediaFile[];

  @Column({ nullable: true })
  thumbnailImgId: string;

  @ManyToOne(() => MediaFile, { nullable: true })
  @JoinColumn({ name: 'thumbnailImgId' })
  thumbnailImg?: MediaFile;

  @ManyToMany(() => Category, { eager: true })
  @JoinTable()
  categories: Category[];

  @Column('simple-array', { nullable: true })
  tags: string[];

  @Column({ nullable: true })
  shortDescription: string;

  @Column({ nullable: true })
  longDescription: string;

  @Column('decimal', { nullable: true })
  regularPrice: number;

  @Column('decimal', { nullable: true })
  salePrice: number;

  @Column({ default: false })
  isVariant: boolean;

  @Column({ default: false })
  published: boolean;

  @Column({ default: false })
  approved: boolean;

  @Column('int', { nullable: true })
  stock: number;

  @Column({ default: false })
  cashOnDelivery: boolean;

  @Column({ default: false })
  featured: boolean;

  @Column('decimal', { nullable: true })
  discount: number;

  @Column({ nullable: true })
  discountType: string;

  @Column({ nullable: true })
  discountStartDate: Date;

  @Column({ nullable: true })
  discountEndDate: Date;

  @Column('decimal', { nullable: true })
  tax: number;

  @Column({ nullable: true })
  taxType: string;

  @Column({ nullable: true })
  shippingType: string;

  @Column('decimal', { nullable: true })
  shippingCost: number;

  @Column('int', { nullable: true })
  estShippingDays: number;

  @Column('int', { nullable: true })
  numOfSales: number;

  @Column({ nullable: true })
  metaTitle: string;

  @Column({ nullable: true })
  metaDescription: string;

  @Column('decimal', { nullable: true })
  rating: number;

  @Column({ nullable: true })
  externalLink: string;

  @Column({ nullable: true })
  externalLinkBtn: string;

  @OneToMany(() => Attribute, attribute => attribute.product)
  attributes?: Attribute[];
} 