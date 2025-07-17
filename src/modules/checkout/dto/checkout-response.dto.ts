import { COUPON_TYPE } from "../../coupon/coupon.entity";
import {
  ORDER_STATUS,
  PAYMENT_METHOD,
  PAYMENT_STATUS,
} from "../entities/order.enums";

export class CheckoutSummaryDto {
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  totalAmount: number;
  itemCount: number;
  items: CheckoutItemResponseDto[];
}

export class CheckoutItemResponseDto {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  selectedVariants?: Array<{
    attributeName: string;
    attributeValue: string;
    attributePrice: number;
  }>;
  thumbnailImage?: string;
}

export class ShippingMethodResponseDto {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: number;
  carrier?: string;
}

export class CheckoutInitiateResponseDto {
  checkoutId: string;
  summary: CheckoutSummaryDto;
  items: CheckoutItemResponseDto[];
  shippingAddress?: any;
  billingAddress?: any;
  availablePaymentMethods: PAYMENT_METHOD[];
  availableShippingMethods: ShippingMethodResponseDto[];
}

export class CouponResponseDto {
  code: string;
  name: string;
  type: COUPON_TYPE;
  value: number;
  discountAmount: number;
}

export class CouponApplicationResponseDto {
  couponApplied: boolean;
  coupon?: CouponResponseDto;
  updatedSummary: CheckoutSummaryDto;
}

export class OrderResponseDto {
  id: string;
  orderNumber: string;
  status: ORDER_STATUS;
  paymentStatus: PAYMENT_STATUS;
  totalAmount: number;
  estimatedDeliveryDate?: Date;
  trackingNumber?: string;
  items: OrderItemResponseDto[];
  shippingAddress: any;
  createdAt: Date;
  updatedAt: Date;
}

export class OrderItemResponseDto {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  selectedVariants?: Array<{
    attributeName: string;
    attributeValue: string;
    attributePrice: number;
  }>;
}

export class PaymentReceiptDto {
  transactionId: string;
  paymentMethod: PAYMENT_METHOD;
  last4?: string;
  amount: number;
  currency: string;
  status: PAYMENT_STATUS;
}

export class OrderConfirmationResponseDto {
  order: OrderResponseDto;
  paymentReceipt: PaymentReceiptDto;
  emailSent: boolean;
  invoiceUrl?: string;
}
