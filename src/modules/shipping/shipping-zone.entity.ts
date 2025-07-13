import { Entity, Column, OneToMany, Index } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { ShippingMethod } from './shipping-method.entity';

export enum ZONE_TYPE {
  COUNTRY = 'country',
  STATE = 'state',
  CITY = 'city',
  POSTAL_CODE = 'postal_code',
  CUSTOM = 'custom'
}

@Entity('shipping_zones')
export class ShippingZone extends BaseEntity {
  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: ZONE_TYPE,
    enumName: 'zone_type_enum',
    default: ZONE_TYPE.COUNTRY
  })
  zoneType: ZONE_TYPE;

  @Column('simple-json', { nullable: true })
  countries?: string[];

  @Column('simple-json', { nullable: true })
  states?: string[];

  @Column('simple-json', { nullable: true })
  cities?: string[];

  @Column('simple-json', { nullable: true })
  postalCodes?: string[];

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 0 })
  priority: number;

  @Column({ nullable: true })
  color?: string;

  @OneToMany(() => ShippingMethod, method => method.zone)
  methods: ShippingMethod[];
} 