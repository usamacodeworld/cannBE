import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { User } from '../user/user.entity';

export enum COUPON_TYPE {
  PERCENTAGE = 'percentage',
  FIXED_AMOUNT = 'fixed_amount',
  FREE_SHIPPING = 'free_shipping'
}

@Entity('coupons')
export class Coupon extends BaseEntity {
  @Column({ unique: true })
  code: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: COUPON_TYPE,
    enumName: 'coupon_type_enum',
    default: COUPON_TYPE.PERCENTAGE
  })
  type: COUPON_TYPE;

  @Column('decimal', { precision: 10, scale: 2 })
  value: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  minimumAmount: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  maximumDiscount: number;

  @Column({ nullable: true })
  startDate: Date;

  @Column({ nullable: true })
  endDate: Date;

  @Column('int', { nullable: true })
  usageLimit: number;

  @Column('int', { default: 0 })
  usageCount: number;

  @Column('int', { nullable: true })
  usageLimitPerUser: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  createdBy: string;

  @Column('simple-array', { nullable: true })
  applicableCategories: string[];

  @Column('simple-array', { nullable: true })
  applicableProducts: string[];

  // Relationships
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'createdBy' })
  creator?: User;
} 