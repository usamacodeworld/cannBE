import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Order, ORDER_STATUS } from './order.entity';
import { User } from '../../user/user.entity';

@Entity('order_status_history')
export class OrderStatusHistory extends BaseEntity {
  @Column()
  orderId: string;

  @Column({
    type: 'enum',
    enum: ORDER_STATUS,
    enumName: 'order_status_enum'
  })
  status: ORDER_STATUS;

  @Column({ nullable: true })
  changedBy: string;

  @Column('text', { nullable: true })
  notes: string;

  @Column({ default: false })
  notificationSent: boolean;

  @Column({
    type: 'enum',
    enum: ORDER_STATUS,
    enumName: 'order_status_enum',
    nullable: true
  })
  previousStatus: ORDER_STATUS;

  // Relationships
  @ManyToOne(() => Order, order => order.statusHistory, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'changedBy' })
  changedByUser?: User;
} 