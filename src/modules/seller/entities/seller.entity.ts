import { Entity, Column, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../user/user.entity';
import { Product } from '../../products/entities/product.entity';

export enum SELLER_STATUS {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SUSPENDED = 'suspended',
  INACTIVE = 'inactive'
}

export enum SELLER_VERIFICATION_STATUS {
  UNVERIFIED = 'unverified',
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected'
}

@Entity('sellers')
export class Seller extends BaseEntity {
  @Column({ unique: true })
  userId: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  businessName: string;

  @Column({ nullable: true })
  businessDescription: string;

  @Column({ nullable: true })
  businessPhone: string;

  @Column({ nullable: true })
  businessEmail: string;

  @Column({ nullable: true })
  businessWebsite: string;

  @Column({ nullable: true })
  businessAddress: string;

  @Column({ nullable: true })
  businessCity: string;

  @Column({ nullable: true })
  businessState: string;

  @Column({ nullable: true })
  businessPostalCode: string;

  @Column({ nullable: true })
  businessCountry: string;

  @Column({ nullable: true })
  taxId: string;

  @Column({ nullable: true })
  licenseNumber: string;

  @Column({ nullable: true })
  licenseExpiryDate: Date;

  @Column({
    type: 'enum',
    enum: SELLER_STATUS,
    default: SELLER_STATUS.PENDING
  })
  status: SELLER_STATUS;

  @Column({
    type: 'enum',
    enum: SELLER_VERIFICATION_STATUS,
    default: SELLER_VERIFICATION_STATUS.UNVERIFIED
  })
  verificationStatus: SELLER_VERIFICATION_STATUS;

  @Column({ nullable: true })
  verificationDocuments: string; // JSON string of document URLs

  @Column({ nullable: true })
  profileImage: string;

  @Column({ nullable: true })
  bannerImage: string;

  @Column({ default: 0 })
  totalProducts: number;

  @Column({ default: 0 })
  totalSales: number;

  @Column({ default: 0 })
  totalOrders: number;

  @Column({ default: 0 })
  totalRevenue: number;

  @Column({ default: 0 })
  rating: number;

  @Column({ default: 0 })
  reviewCount: number;

  @Column({ nullable: true })
  commissionRate: number; // Percentage commission for platform

  @Column({ nullable: true })
  payoutMethod: string; // bank_transfer, paypal, stripe

  @Column({ nullable: true })
  payoutDetails: string; // JSON string of payout details

  @Column({ nullable: true })
  approvedAt: Date;

  @Column({ nullable: true })
  approvedBy: string;

  @Column({ nullable: true })
  rejectionReason: string;

  @Column({ nullable: true })
  notes: string;

  @OneToMany(() => Product, product => product.seller)
  products: Product[];
} 