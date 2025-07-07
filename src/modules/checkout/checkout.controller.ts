import { Request, Response } from 'express';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderStatusHistory } from './entities/order-status-history.entity';
import { ShippingAddress } from './entities/shipping-address.entity';
import { Coupon } from './entities/coupon.entity';
import { Cart } from '../cart/entities/cart.entity';
import { Product } from '../products/entities/product.entity';
import { User } from '../user/user.entity';
import { Address } from '../address/address.entity';
import { CheckoutService } from './checkout.service';
import { AppDataSource } from '../../config/database';

export function checkoutController(
  orderRepository: Repository<Order>,
  orderItemRepository: Repository<OrderItem>,
  orderStatusHistoryRepository: Repository<OrderStatusHistory>,
  shippingAddressRepository: Repository<ShippingAddress>,
  couponRepository: Repository<Coupon>,
  cartRepository: Repository<Cart>,
  productRepository: Repository<Product>,
  userRepository: Repository<User>,
  addressRepository: Repository<Address>
) {
  const checkoutService = new CheckoutService(
    orderRepository,
    orderItemRepository,
    orderStatusHistoryRepository,
    shippingAddressRepository,
    couponRepository,
    cartRepository,
    productRepository,
    userRepository,
    addressRepository,
    AppDataSource
  );

  return {
    initiateCheckout: async (req: Request, res: Response) => {
      try {
        const user = (req as any).user;
        const checkoutData = {
          ...req.body,
          userId: user?.id,
          checkoutType: user ? 'registered' : 'guest'
        };
        
        const result = await checkoutService.initiateCheckout(checkoutData);
        res.status(200).json({
          success: true,
          data: result
        });
      } catch (error: any) {
        res.status(400).json({
          success: false,
          error: {
            code: 'CHECKOUT_INITIATION_FAILED',
            message: error.message
          }
        });
      }
    },

    confirmOrder: async (req: Request, res: Response) => {
      try {
        const user = (req as any).user;
        const orderData = {
          ...req.body,
          userId: user?.id
        };
        
        const result = await checkoutService.confirmOrder(orderData);
        res.status(201).json({
          success: true,
          data: result
        });
      } catch (error: any) {
        res.status(400).json({
          success: false,
          error: {
            code: 'ORDER_CONFIRMATION_FAILED',
            message: error.message
          }
        });
      }
    },

    getOrders: async (req: Request, res: Response) => {
      try {
        const user = (req as any).user;
        const orders = await checkoutService.getOrders(user?.id);
        
        res.status(200).json({
          success: true,
          data: orders
        });
      } catch (error: any) {
        res.status(400).json({
          success: false,
          error: {
            code: 'GET_ORDERS_FAILED',
            message: error.message
          }
        });
      }
    },

    getOrderById: async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const order = await checkoutService.getOrderById(id);
        
        if (!order) {
          res.status(404).json({
            success: false,
            error: {
              code: 'ORDER_NOT_FOUND',
              message: 'Order not found'
            }
          });
          return;
        }

        res.status(200).json({
          success: true,
          data: order
        });
      } catch (error: any) {
        res.status(400).json({
          success: false,
          error: {
            code: 'GET_ORDER_FAILED',
            message: error.message
          }
        });
      }
    },

    calculateShipping: async (req: Request, res: Response) => {
      try {
        const { checkoutId, shippingAddress } = req.body;
        const shippingMethods = await checkoutService.calculateShipping(checkoutId, shippingAddress);

        res.status(200).json({
          success: true,
          data: {
            shippingMethods,
            defaultMethod: 'standard'
          }
        });
      } catch (error: any) {
        res.status(400).json({
          success: false,
          error: {
            code: 'SHIPPING_CALCULATION_FAILED',
            message: error.message
          }
        });
      }
    },

    calculateTax: async (req: Request, res: Response) => {
      try {
        const { checkoutId, shippingAddress } = req.body;
        const taxAmount = await checkoutService.calculateTax(checkoutId, shippingAddress);

        res.status(200).json({
          success: true,
          data: {
            taxAmount,
            taxRate: 8.0,
            taxBreakdown: [
              {
                type: 'state_tax',
                rate: 4.0,
                amount: taxAmount / 2
              },
              {
                type: 'local_tax',
                rate: 4.0,
                amount: taxAmount / 2
              }
            ]
          }
        });
      } catch (error: any) {
        res.status(400).json({
          success: false,
          error: {
            code: 'TAX_CALCULATION_FAILED',
            message: error.message
          }
        });
      }
    },

    applyCoupon: async (req: Request, res: Response) => {
      try {
        const result = await checkoutService.applyCoupon(req.body);

        res.status(200).json({
          success: true,
          data: result
        });
      } catch (error: any) {
        res.status(400).json({
          success: false,
          error: {
            code: 'COUPON_APPLICATION_FAILED',
            message: error.message
          }
        });
      }
    },

    // Get user addresses for checkout
    getUserAddresses: async (req: Request, res: Response) => {
      try {
        const user = (req as any).user;
        if (!user?.id) {
          res.status(401).json({
            success: false,
            error: {
              code: 'UNAUTHORIZED',
              message: 'User not authenticated'
            }
          });
          return;
        }

        const addresses = await checkoutService.getUserAddresses(user.id);
        
        res.status(200).json({
          success: true,
          data: addresses
        });
      } catch (error: any) {
        res.status(400).json({
          success: false,
          error: {
            code: 'GET_ADDRESSES_FAILED',
            message: error.message
          }
        });
      }
    },

    // Get default addresses for user
    getDefaultAddresses: async (req: Request, res: Response) => {
      try {
        const user = (req as any).user;
        if (!user?.id) {
          res.status(401).json({
            success: false,
            error: {
              code: 'UNAUTHORIZED',
              message: 'User not authenticated'
            }
          });
          return;
        }

        const addresses = await checkoutService.getDefaultAddresses(user.id);
        
        res.status(200).json({
          success: true,
          data: addresses
        });
      } catch (error: any) {
        res.status(400).json({
          success: false,
          error: {
            code: 'GET_DEFAULT_ADDRESSES_FAILED',
            message: error.message
          }
        });
      }
    }
  };
} 