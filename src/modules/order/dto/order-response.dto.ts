import {
  ORDER_STATUS,
  PAYMENT_METHOD,
  PAYMENT_STATUS,
} from "../../../modules/checkout/entities/order.enums";

export class OrderItemResponseDto {
  productId: string;
  productName: string;
  productSlug?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  selectedVariants?: any[];
  sku?: string;
  taxAmount?: number;
  discountAmount?: number;
  thumbnailImage?: string;
}

export class OrderStatusHistoryResponseDto {
  status: ORDER_STATUS;
  changedBy?: string;
  notes?: string;
  notificationSent?: boolean;
  previousStatus?: ORDER_STATUS;
  timestamp: Date;
}

export class OrderResponseDto {
  id: string;
  orderNumber: string;
  userId?: string;
  guestId?: string;
  status: ORDER_STATUS;
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  totalAmount: number;
  paymentStatus: PAYMENT_STATUS;
  paymentMethod?: PAYMENT_METHOD;
  paymentTransactionId?: string;
  shippingAddress: any;
  billingAddress?: any;
  shippingMethod?: string;
  trackingNumber?: string;
  estimatedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
  notes?: string;
  adminNotes?: string;
  couponCode?: string;
  emailSent?: boolean;
  cancelledAt?: Date;
  cancelReason?: string;
  customerEmail?: string;
  customerFirstName?: string;
  customerLastName?: string;
  customerPhone?: string;
  items: OrderItemResponseDto[];
  statusHistory: OrderStatusHistoryResponseDto[];
  createdAt: Date;
  updatedAt: Date;
}
