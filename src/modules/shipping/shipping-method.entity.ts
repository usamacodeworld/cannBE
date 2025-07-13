import { Entity, Column, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { ShippingZone } from './shipping-zone.entity';
import { ShippingRate } from './shipping-rate.entity';

export enum METHOD_TYPE {
  FLAT_RATE = 'flat_rate',
  FREE_SHIPPING = 'free_shipping',
  WEIGHT_BASED = 'weight_based',
  PRICE_BASED = 'price_based',
  DISTANCE_BASED = 'distance_based'
}

export enum CARRIER_TYPE {
  STANDARD = 'standard',
  EXPRESS = 'express',
  PREMIUM = 'premium',
  ECONOMY = 'economy',
  SAME_DAY = 'same_day',
  NEXT_DAY = 'next_day'
}

@Entity('shipping_methods')
export class ShippingMethod extends BaseEntity {
  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: METHOD_TYPE,
    enumName: 'method_type_enum',
    default: METHOD_TYPE.FLAT_RATE
  })
  methodType: METHOD_TYPE;

  @Column({
    type: 'enum',
    enum: CARRIER_TYPE,
    enumName: 'carrier_type_enum',
    default: CARRIER_TYPE.STANDARD
  })
  carrierType: CARRIER_TYPE;

  @Column({ nullable: true })
  zoneId: string;

  @ManyToOne(() => ShippingZone, zone => zone.methods)
  @JoinColumn({ name: 'zoneId' })
  zone: ShippingZone;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 0 })
  priority: number;

  @Column({ nullable: true })
  estimatedDays?: number;

  @Column({ nullable: true })
  icon?: string;

  @Column({ nullable: true })
  color?: string;

  @Column({ default: false })
  isDefault: boolean;

  @Column({ default: false })
  requiresSignature: boolean;

  @Column({ default: false })
  isInsured: boolean;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  insuranceAmount?: number;

  @OneToMany(() => ShippingRate, rate => rate.method)
  rates: ShippingRate[];
} 