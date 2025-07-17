// src/modules/checkout/entities/order.enums.ts

export enum ORDER_STATUS {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  PROCESSING = "processing",
  SHIPPED = "shipped",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
  REFUNDED = "refunded",
  RETURNED = "returned",
}

export enum PAYMENT_STATUS {
  PENDING = "pending",
  AUTHORIZED = "authorized",
  CAPTURED = "captured",
  FAILED = "failed",
  CANCELLED = "cancelled",
  REFUNDED = "refunded",
  PARTIALLY_REFUNDED = "partially_refunded",
}

export enum PAYMENT_METHOD {
  CREDIT_CARD = "credit_card",
  DEBIT_CARD = "debit_card",
  PAYPAL = "paypal",
  STRIPE = "stripe",
  CASH_ON_DELIVERY = "cash_on_delivery",
  BANK_TRANSFER = "bank_transfer",
  WALLET = "wallet",
}
