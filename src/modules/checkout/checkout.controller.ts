import { Request, Response } from 'express';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderStatusHistory } from './entities/order-status-history.entity';
import { ShippingAddress } from './entities/shipping-address.entity';
import { Coupon } from '../coupon/coupon.entity';
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
          userId: user?.id,
          guestId: user ? undefined : req.body.guestId
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
        const { guestId } = req.query;
        
        if (!user?.id && !guestId) {
          res.status(400).json({
            success: false,
            error: {
              code: 'MISSING_IDENTIFIER',
              message: 'Either user authentication or guestId is required'
            }
          });
          return;
        }
        
        const orders = await checkoutService.getOrders(user?.id, guestId as string);
        
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
        const user = (req as any).user;
        const { guestId } = req.query;
        
        const order = await checkoutService.getOrderById(id, user?.id, guestId as string);
        
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

    getCheckoutSession: async (req: Request, res: Response) => {
      try {
        const { checkoutId } = req.params;
        
        const session = await checkoutService.getCheckoutSessionWithAddresses(checkoutId);
        
        if (!session) {
          res.status(404).json({
            success: false,
            error: {
              code: 'SESSION_NOT_FOUND',
              message: 'Checkout session not found or expired'
            }
          });
          return;
        }

        res.status(200).json({
          success: true,
          data: session
        });
      } catch (error: any) {
        res.status(400).json({
          success: false,
          error: {
            code: 'GET_SESSION_FAILED',
            message: error.message
          }
        });
      }
    },

    updateCheckoutAddress: async (req: Request, res: Response) => {
      try {
        const { checkoutId, shippingAddress, billingAddress, billingAddressSameAsShipping } = req.body;
        
        const result = await checkoutService.updateCheckoutAddress(
          checkoutId,
          shippingAddress,
          billingAddress,
          billingAddressSameAsShipping
        );
        
        res.status(200).json({
          success: true,
          data: result
        });
      } catch (error: any) {
        res.status(400).json({
          success: false,
          error: {
            code: 'UPDATE_ADDRESS_FAILED',
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

    calculateShippingWithoutSession: async (req: Request, res: Response) => {
      try {
        const { items, shippingAddress } = req.body;
        
        if (!items || !Array.isArray(items) || items.length === 0) {
          res.status(400).json({
            success: false,
            error: {
              code: 'INVALID_ITEMS',
              message: 'Items array is required and cannot be empty'
            }
          });
          return;
        }

        if (!shippingAddress) {
          res.status(400).json({
            success: false,
            error: {
              code: 'MISSING_ADDRESS',
              message: 'Shipping address is required'
            }
          });
          return;
        }

        const shippingMethods = await checkoutService.calculateShippingWithoutSession(items, shippingAddress);

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