import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { BaseEntity } from "../../../common/entities/base.entity";
import { User } from "../../user/user.entity";
import { OrderItem } from "./order-item.entity";
import { OrderStatusHistory } from "./order-status-history.entity";
import { ORDER_STATUS, PAYMENT_METHOD, PAYMENT_STATUS } from "./order.enums";

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface BillingAddress extends ShippingAddress {
  sameAsShipping?: boolean;
}

@Entity("orders")
export class Order extends BaseEntity {
  @Column({ unique: true })
  orderNumber: string;

  @Column({ nullable: true })
  userId: string;

  @Column({ nullable: true })
  guestId: string;

  @Column({
    type: "enum",
    enum: ORDER_STATUS,
    enumName: "order_status_enum",
    default: ORDER_STATUS.PENDING,
  })
  status: ORDER_STATUS;

  // Financial Information
  @Column("decimal", { precision: 10, scale: 2 })
  subtotal: number;

  @Column("decimal", { precision: 10, scale: 2, default: 0 })
  taxAmount: number;

  @Column("decimal", { precision: 10, scale: 2, default: 0 })
  shippingAmount: number;

  @Column("decimal", { precision: 10, scale: 2, default: 0 })
  discountAmount: number;

  @Column("decimal", { precision: 10, scale: 2 })
  totalAmount: number;

  // Payment Information
  @Column({
    type: "enum",
    enum: PAYMENT_STATUS,
    enumName: "payment_status_enum",
    default: PAYMENT_STATUS.PENDING,
  })
  paymentStatus: PAYMENT_STATUS;

  @Column({
    type: "enum",
    enum: PAYMENT_METHOD,
    enumName: "payment_method_enum",
    nullable: true,
  })
  paymentMethod: PAYMENT_METHOD;

  @Column({ nullable: true })
  paymentTransactionId: string;

  @Column("text", { nullable: true })
  paymentGatewayResponse: string;

  // Shipping Information
  @Column("simple-json")
  shippingAddress: ShippingAddress;

  @Column("simple-json", { nullable: true })
  billingAddress: BillingAddress;

  @Column({ nullable: true })
  shippingMethod: string;

  @Column({ nullable: true })
  trackingNumber: string;

  @Column({ nullable: true })
  estimatedDeliveryDate: Date;

  @Column({ nullable: true })
  actualDeliveryDate: Date;

  // Additional Information
  @Column("text", { nullable: true })
  notes: string;

  @Column("text", { nullable: true })
  adminNotes: string;

  @Column({ nullable: true })
  couponCode: string;

  @Column({ default: false })
  emailSent: boolean;

  @Column({ nullable: true })
  cancelledAt: Date;

  @Column({ nullable: true })
  cancelReason: string;

  // Customer Information (for guest orders)
  @Column({ nullable: true })
  customerEmail: string;

  @Column({ nullable: true })
  customerFirstName: string;

  @Column({ nullable: true })
  customerLastName: string;

  @Column({ nullable: true })
  customerPhone: string;

  // Relationships
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "userId" })
  user?: User;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, { cascade: true })
  items: OrderItem[];

  @OneToMany(() => OrderStatusHistory, (history) => history.order, {
    cascade: true,
  })
  statusHistory: OrderStatusHistory[];
}
