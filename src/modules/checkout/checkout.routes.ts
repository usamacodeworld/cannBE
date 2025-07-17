import { Router } from "express";
import { AppDataSource } from "../../config/database";
import { Order } from "./entities/order.entity";
import { OrderItem } from "./entities/order-item.entity";
import { OrderStatusHistory } from "./entities/order-status-history.entity";
import { ShippingAddress } from "./entities/shipping-address.entity";
import { Coupon } from "../coupon/coupon.entity";
import { Cart } from "../cart/entities/cart.entity";
import { Product } from "../products/entities/product.entity";
import { User } from "../user/user.entity";
import { Address } from "../address/address.entity";
import { checkoutController } from "./checkout.controller";
import { validateDto } from "../../common/middlewares/validation.middleware";
import { CheckoutInitiateDto } from "./dto/checkout-initiate.dto";
import { ShippingAddressDto } from "./dto/shipping-address.dto";
import { ApplyCouponDto } from "./dto/apply-coupon.dto";
import { ConfirmOrderDto } from "./dto/confirm-order.dto";
import { UpdateCheckoutAddressDto } from "./dto/update-checkout-address.dto";
import {
  authenticate,
  optionalAuth,
} from "../auth/middlewares/auth.middleware";
import { paymentService } from "../../common/services/payment.service";
import { ORDER_STATUS, PAYMENT_STATUS } from "./entities/order.enums";

const router = Router();

// Initialize repositories
const orderRepository = AppDataSource.getRepository(Order);
const orderItemRepository = AppDataSource.getRepository(OrderItem);
const orderStatusHistoryRepository =
  AppDataSource.getRepository(OrderStatusHistory);
const shippingAddressRepository = AppDataSource.getRepository(ShippingAddress);
const couponRepository = AppDataSource.getRepository(Coupon);
const cartRepository = AppDataSource.getRepository(Cart);
const productRepository = AppDataSource.getRepository(Product);
const userRepository = AppDataSource.getRepository(User);
const addressRepository = AppDataSource.getRepository(Address);

// Initialize controller
const ctrl = checkoutController(
  orderRepository,
  orderItemRepository,
  orderStatusHistoryRepository,
  shippingAddressRepository,
  couponRepository,
  cartRepository,
  productRepository,
  userRepository,
  addressRepository
);

// Checkout process endpoints - Allow both authenticated and guest users
router.post(
  "/initiate",
  optionalAuth,
  validateDto(CheckoutInitiateDto),
  ctrl.initiateCheckout
);

router.post("/calculate-shipping", optionalAuth, ctrl.calculateShipping);

router.post(
  "/calculate-shipping-preview",
  optionalAuth,
  ctrl.calculateShippingWithoutSession
);

router.post("/calculate-tax", optionalAuth, ctrl.calculateTax);

router.post(
  "/apply-coupon",
  optionalAuth,
  validateDto(ApplyCouponDto),
  ctrl.applyCoupon
);

router.post(
  "/confirm-order",
  optionalAuth,
  validateDto(ConfirmOrderDto),
  ctrl.confirmOrder
);

// Get checkout session data with addresses populated
router.get("/session/:checkoutId", optionalAuth, ctrl.getCheckoutSession);

// Update checkout address for guests
router.put(
  "/address",
  optionalAuth,
  validateDto(UpdateCheckoutAddressDto),
  ctrl.updateCheckoutAddress
);

// Order management endpoints - Allow both authenticated and guest users
router.get("/orders", optionalAuth, ctrl.getOrders);

router.get("/orders/:id", optionalAuth, ctrl.getOrderById);

// Address management endpoints for checkout - Require authentication
router.get("/addresses", authenticate, ctrl.getUserAddresses);

router.get("/addresses/default", authenticate, ctrl.getDefaultAddresses);

// Payment webhook endpoints
router.post("/webhooks/authorize-net", async (req: any, res: any) => {
  try {
    const signature = req.headers["x-signature"] as string;
    const isValid = await paymentService.verifyWebhook(
      req.body,
      signature,
      "authorizeNet"
    );

    if (!isValid) {
      return res.status(400).json({ error: "Invalid signature" });
    }

    // Process Authorize.net webhook
    const { eventType, payload } = req.body;

    if (eventType === "net.authorize.payment.authcapture.created") {
      const order = await orderRepository.findOne({
        where: { paymentTransactionId: payload.id },
      });

      if (order) {
        order.paymentStatus = PAYMENT_STATUS.CAPTURED;
        order.status = ORDER_STATUS.CONFIRMED;
        await orderRepository.save(order);

        // Create status history
        const statusHistory = orderStatusHistoryRepository.create({
          orderId: order.id,
          status: ORDER_STATUS.CONFIRMED,
          notes: "Payment captured via Authorize.net",
          notificationSent: false,
        });
        await orderStatusHistoryRepository.save(statusHistory);
      }
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("Authorize.net webhook error:", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
});

router.post("/webhooks/stripe", async (req: any, res: any) => {
  try {
    const signature = req.headers["stripe-signature"] as string;
    const isValid = await paymentService.verifyWebhook(
      req.body,
      signature,
      "stripe"
    );

    if (!isValid) {
      return res.status(400).json({ error: "Invalid signature" });
    }

    // Process Stripe webhook
    const { type, data } = req.body;

    if (type === "payment_intent.succeeded") {
      const order = await orderRepository.findOne({
        where: { paymentTransactionId: data.object.id },
      });

      if (order) {
        order.paymentStatus = PAYMENT_STATUS.CAPTURED;
        order.status = ORDER_STATUS.CONFIRMED;
        await orderRepository.save(order);

        // Create status history
        const statusHistory = orderStatusHistoryRepository.create({
          orderId: order.id,
          status: ORDER_STATUS.CONFIRMED,
          notes: "Payment captured via Stripe",
          notificationSent: false,
        });
        await orderStatusHistoryRepository.save(statusHistory);
      }
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("Stripe webhook error:", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
});

export default router;
