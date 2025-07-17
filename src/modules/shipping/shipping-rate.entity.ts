import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { ShippingMethod } from './shipping-method.entity';

export enum RATE_TYPE {
  FLAT_RATE = 'flat_rate',
  WEIGHT_BASED = 'weight_based',
  PRICE_BASED = 'price_based',
  DISTANCE_BASED = 'distance_based',
  FREE = 'free',
  ITEM_BASED = 'item_based'
}

@Entity('shipping_rates')
export class ShippingRate extends BaseEntity {
  @Column({ nullable: true })
  methodId: string;

  @ManyToOne(() => ShippingMethod, method => method.rates)
  @JoinColumn({ name: 'methodId' })
  method: ShippingMethod;

  @Column({
    type: 'enum',
    enum: RATE_TYPE,
    enumName: 'rate_type_enum',
    default: RATE_TYPE.FLAT_RATE
  })
  rateType: RATE_TYPE;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  baseRate: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  additionalRate: number;

  // Weight-based pricing
  @Column('decimal', { precision: 8, scale: 2, nullable: true })
  minWeight?: number;

  @Column('decimal', { precision: 8, scale: 2, nullable: true })
  maxWeight?: number;

  @Column('decimal', { precision: 8, scale: 2, nullable: true })
  weightUnit?: number; // Weight increment for additional charges

  // Price-based pricing
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  minOrderValue?: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  maxOrderValue?: number;

  // Distance-based pricing
  @Column('decimal', { precision: 8, scale: 2, nullable: true })
  minDistance?: number;

  @Column('decimal', { precision: 8, scale: 2, nullable: true })
  maxDistance?: number;

  @Column('decimal', { precision: 8, scale: 2, nullable: true })
  distanceUnit?: number; // Distance increment for additional charges

  // Item-based pricing (NEW)
  @Column('integer', { nullable: true })
  firstItemCount?: number; // Number of items included in base rate

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  additionalItemRate?: number; // Rate per additional item

  @Column('integer', { nullable: true })
  maxItems?: number; // Maximum number of items for this rate

  // Conditions
  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  name?: string;

  @Column({ nullable: true })
  description?: string;

  // Special conditions
  @Column({ default: false })
  isFreeShipping: boolean;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  freeShippingThreshold?: number;

  @Column({ default: false })
  appliesToAllProducts: boolean;

  @Column('simple-json', { nullable: true })
  productIds?: string[];

  @Column('simple-json', { nullable: true })
  categoryIds?: string[];

  @Column('simple-json', { nullable: true })
  excludedProductIds?: string[];

  @Column('simple-json', { nullable: true })
  excludedCategoryIds?: string[];

  // Time-based conditions
  @Column({ nullable: true })
  validFrom?: Date;

  @Column({ nullable: true })
  validTo?: Date;

  @Column({ default: false })
  isHolidayRate: boolean;

  @Column('simple-json', { nullable: true })
  holidayDates?: string[];

  // Additional fees
  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  handlingFee: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  insuranceFee: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  signatureFee: number;
} 