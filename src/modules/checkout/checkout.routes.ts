import { Router } from 'express';
import { AppDataSource } from '../../config/database';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderStatusHistory } from './entities/order-status-history.entity';
import { ShippingAddress } from './entities/shipping-address.entity';
import { Coupon } from './entities/coupon.entity';
import { Cart } from '../cart/entities/cart.entity';
import { Product } from '../products/entities/product.entity';
import { User } from '../user/user.entity';
import { checkoutController } from './checkout.controller';
import { validateDto } from '../../common/middlewares/validation.middleware';
import { CheckoutInitiateDto } from './dto/checkout-initiate.dto';
import { ShippingAddressDto } from './dto/shipping-address.dto';
import { ApplyCouponDto } from './dto/apply-coupon.dto';
import { ConfirmOrderDto } from './dto/confirm-order.dto';
import { authenticate } from '../auth/middlewares/auth.middleware';

const router = Router();

// Initialize repositories
const orderRepository = AppDataSource.getRepository(Order);
const orderItemRepository = AppDataSource.getRepository(OrderItem);
const orderStatusHistoryRepository = AppDataSource.getRepository(OrderStatusHistory);
const shippingAddressRepository = AppDataSource.getRepository(ShippingAddress);
const couponRepository = AppDataSource.getRepository(Coupon);
const cartRepository = AppDataSource.getRepository(Cart);
const productRepository = AppDataSource.getRepository(Product);
const userRepository = AppDataSource.getRepository(User);

// Initialize controller
const ctrl = checkoutController(
  orderRepository,
  orderItemRepository,
  orderStatusHistoryRepository,
  shippingAddressRepository,
  couponRepository,
  cartRepository,
  productRepository,
  userRepository
);

// Checkout process endpoints
router.post('/initiate', validateDto(CheckoutInitiateDto), ctrl.initiateCheckout);

router.post('/calculate-shipping', ctrl.calculateShipping);

router.post('/calculate-tax', ctrl.calculateTax);

router.post('/apply-coupon', validateDto(ApplyCouponDto), ctrl.applyCoupon);

router.post('/confirm-order', validateDto(ConfirmOrderDto), ctrl.confirmOrder);

// Order management endpoints
router.get('/orders', authenticate, ctrl.getOrders);

router.get('/orders/:id', authenticate, ctrl.getOrderById);

export default router; 