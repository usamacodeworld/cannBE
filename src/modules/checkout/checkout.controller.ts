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
import { CheckoutService } from './checkout.service';

export function checkoutController(
  orderRepository: Repository<Order>,
  orderItemRepository: Repository<OrderItem>,
  orderStatusHistoryRepository: Repository<OrderStatusHistory>,
  shippingAddressRepository: Repository<ShippingAddress>,
  couponRepository: Repository<Coupon>,
  cartRepository: Repository<Cart>,
  productRepository: Repository<Product>,
  userRepository: Repository<User>
) {
  const checkoutService = new CheckoutService(
    orderRepository,
    orderItemRepository,
    orderStatusHistoryRepository,
    shippingAddressRepository,
    couponRepository,
    cartRepository,
    productRepository,
    userRepository
  );

  return {
    initiateCheckout: async (req: Request, res: Response) => {
      try {
        const result = await checkoutService.initiateCheckout(req.body);
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
        const result = await checkoutService.confirmOrder(req.body);
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
        // Mock shipping calculation
        const shippingMethods = [
          {
            id: 'standard',
            name: 'Standard Shipping',
            description: '5-7 business days',
            price: 9.99,
            estimatedDays: 7,
            carrier: 'USPS'
          },
          {
            id: 'express',
            name: 'Express Shipping',
            description: '2-3 business days',
            price: 19.99,
            estimatedDays: 3,
            carrier: 'FedEx'
          }
        ];

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
        const { items, shippingAddress } = req.body;
        
        // Mock tax calculation
        let taxableAmount = 0;
        for (const item of items || []) {
          taxableAmount += (item.unitPrice || 0) * (item.quantity || 0);
        }

        const taxRate = 0.08; // 8%
        const taxAmount = Math.round(taxableAmount * taxRate * 100) / 100;

        res.status(200).json({
          success: true,
          data: {
            taxAmount,
            taxRate: taxRate * 100,
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
        const { couponCode, items, checkoutId } = req.body;

        // Find coupon
        const coupon = await couponRepository.findOne({
          where: { code: couponCode, isActive: true }
        });

        if (!coupon) {
          res.status(400).json({
            success: false,
            error: {
              code: 'INVALID_COUPON',
              message: 'Invalid coupon code'
            }
          });
          return;
        }

        // Calculate discount
        const totalAmount = items.reduce((sum: number, item: any) => 
          sum + (item.unitPrice * item.quantity), 0);
        
        let discountAmount = 0;
        if (coupon.type === 'percentage') {
          discountAmount = (totalAmount * coupon.value) / 100;
        } else if (coupon.type === 'fixed_amount') {
          discountAmount = coupon.value;
        }

        res.status(200).json({
          success: true,
          data: {
            couponApplied: true,
            coupon: {
              code: coupon.code,
              name: coupon.name,
              type: coupon.type,
              value: coupon.value,
              discountAmount
            },
            updatedSummary: {
              subtotal: totalAmount,
              taxAmount: 0,
              shippingAmount: 0,
              discountAmount,
              totalAmount: totalAmount - discountAmount
            }
          }
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
    }
  };
} 