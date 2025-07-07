import { Repository } from 'typeorm';
import { Order, ORDER_STATUS, PAYMENT_STATUS, PAYMENT_METHOD } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderStatusHistory } from './entities/order-status-history.entity';
import { ShippingAddress } from './entities/shipping-address.entity';
import { Coupon, COUPON_TYPE } from './entities/coupon.entity';
import { Cart } from '../cart/entities/cart.entity';
import { Product } from '../products/entities/product.entity';
import { User } from '../user/user.entity';
import { CheckoutInitiateDto } from './dto/checkout-initiate.dto';
import { ShippingAddressDto } from './dto/shipping-address.dto';
import { ApplyCouponDto } from './dto/apply-coupon.dto';
import { ConfirmOrderDto } from './dto/confirm-order.dto';
import { CheckoutInitiateResponseDto, CheckoutSummaryDto, ShippingMethodResponseDto, CouponApplicationResponseDto, OrderConfirmationResponseDto } from './dto/checkout-response.dto';
import { v4 as uuidv4 } from 'uuid';

export class CheckoutService {
  private orderRepository: Repository<Order>;
  private orderItemRepository: Repository<OrderItem>;
  private orderStatusHistoryRepository: Repository<OrderStatusHistory>;
  private shippingAddressRepository: Repository<ShippingAddress>;
  private couponRepository: Repository<Coupon>;
  private cartRepository: Repository<Cart>;
  private productRepository: Repository<Product>;
  private userRepository: Repository<User>;

  // In-memory checkout sessions (in production, use Redis or database)
  private checkoutSessions = new Map<string, any>();

  constructor(
    orderRepository: Repository<Order>,
    orderItemRepository: Repository<OrderItem>,
    orderStatusHistoryRepository: Repository<OrderStatusHistory>,
    shippingAddressRepository: Repository<ShippingAddress>,
    couponRepository: Repository<Coupon>,
    cartRepository: Repository<Cart>,
    productRepository: Repository<Product>,
    userRepository: Repository<User>
  ) {
    this.orderRepository = orderRepository;
    this.orderItemRepository = orderItemRepository;
    this.orderStatusHistoryRepository = orderStatusHistoryRepository;
    this.shippingAddressRepository = shippingAddressRepository;
    this.couponRepository = couponRepository;
    this.cartRepository = cartRepository;
    this.productRepository = productRepository;
    this.userRepository = userRepository;
  }

  async initiateCheckout(data: CheckoutInitiateDto): Promise<CheckoutInitiateResponseDto> {
    try {
      const checkoutId = uuidv4();
      
      // Validate cart items
      const validatedItems = await this.validateCartItems(data.cartItems);
      
      // Calculate summary
      const summary = await this.calculateSummary(validatedItems);

      return {
        checkoutId,
        summary,
        availablePaymentMethods: [PAYMENT_METHOD.CREDIT_CARD, PAYMENT_METHOD.PAYPAL, PAYMENT_METHOD.CASH_ON_DELIVERY],
        availableShippingMethods: [
          { id: 'standard', name: 'Standard Shipping', description: '5-7 business days', price: 9.99, estimatedDays: 7 }
        ]
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to initiate checkout');
    }
  }

  async applyCoupon(data: ApplyCouponDto): Promise<CouponApplicationResponseDto> {
    try {
      // Get checkout session
      const session = this.checkoutSessions.get(data.checkoutId);
      if (!session) {
        throw new Error('Checkout session not found or expired');
      }

      // Find coupon
      const coupon = await this.couponRepository.findOne({
        where: { code: data.couponCode, isActive: true }
      });

      if (!coupon) {
        throw new Error('Invalid coupon code');
      }

      // Validate coupon
      const couponValidation = await this.validateCoupon(coupon, data.items, session.userId);
      if (!couponValidation.valid) {
        throw new Error(couponValidation.message);
      }

      // Calculate discount
      const discountAmount = await this.calculateCouponDiscount(coupon, data.items);

      // Update session with coupon
      session.coupon = coupon;
      session.discountAmount = discountAmount;
      session.summary = await this.calculateSummary(session.items, discountAmount);

      return {
        couponApplied: true,
        coupon: {
          code: coupon.code,
          name: coupon.name,
          type: coupon.type,
          value: coupon.value,
          discountAmount
        },
        updatedSummary: session.summary
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to apply coupon');
    }
  }

  async calculateShipping(checkoutId: string, shippingAddress: any): Promise<ShippingMethodResponseDto[]> {
    try {
      const session = this.checkoutSessions.get(checkoutId);
      if (!session) {
        throw new Error('Checkout session not found or expired');
      }

      // Calculate shipping costs based on address and items
      const shippingMethods = await this.getShippingMethods(shippingAddress, session.items);
      
      return shippingMethods;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to calculate shipping');
    }
  }

  async calculateTax(checkoutId: string, shippingAddress: any): Promise<number> {
    try {
      const session = this.checkoutSessions.get(checkoutId);
      if (!session) {
        throw new Error('Checkout session not found or expired');
      }

      // Calculate tax based on shipping address and items
      const taxAmount = await this.calculateTaxAmount(shippingAddress, session.items);
      
      // Update session with tax
      session.taxAmount = taxAmount;
      session.summary = await this.calculateSummary(session.items, session.discountAmount, session.shippingAmount, taxAmount);

      return taxAmount;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to calculate tax');
    }
  }

  async confirmOrder(data: ConfirmOrderDto): Promise<OrderConfirmationResponseDto> {
    try {
      const orderNumber = await this.generateOrderNumber();

      const order = this.orderRepository.create({
        orderNumber,
        userId: undefined, // Will be set if user is logged in
        guestId: uuidv4(), // Generate for guest checkout
        status: ORDER_STATUS.PENDING,
        subtotal: data.orderSummary.subtotal,
        taxAmount: data.orderSummary.taxAmount,
        shippingAmount: data.orderSummary.shippingAmount,
        discountAmount: data.orderSummary.discountAmount,
        totalAmount: data.orderSummary.totalAmount,
        paymentStatus: PAYMENT_STATUS.PENDING,
        paymentMethod: data.paymentMethod,
        shippingAddress: data.shippingAddress,
        billingAddress: data.billingAddress,
        customerEmail: data.customerInfo.email,
        customerFirstName: data.customerInfo.firstName,
        customerLastName: data.customerInfo.lastName,
        customerPhone: data.customerInfo.phone,
        notes: data.notes
      });

      const savedOrder = await this.orderRepository.save(order);

      // Create order items
      const orderItems = [];
      for (const item of data.items) {
        const product = await this.productRepository.findOne({
          where: { id: item.productId }
        });

        const orderItem = this.orderItemRepository.create({
          orderId: savedOrder.id,
          productId: item.productId,
          productName: product?.name || 'Unknown Product',
          productSlug: product?.slug,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.unitPrice * item.quantity,
          selectedVariants: item.selectedVariants,
          productSnapshot: product,
          thumbnailImage: product?.thumbnailImgId
        });

        orderItems.push(await this.orderItemRepository.save(orderItem));
      }

      // Create initial status history
      const statusHistory = this.orderStatusHistoryRepository.create({
        orderId: savedOrder.id,
        status: ORDER_STATUS.PENDING,
        notes: 'Order created',
        notificationSent: false
      });

      await this.orderStatusHistoryRepository.save(statusHistory);

      // Update product stock
      await this.updateProductStock(data.items);

      // Update coupon usage if applicable
      if (data.couponCode) {
        await this.updateCouponUsage(data.couponCode, savedOrder.id, undefined);
      }

      // Clear cart items
      await this.clearCartItems(undefined, savedOrder.guestId);

      // Clean up checkout session
      this.checkoutSessions.delete(data.checkoutId);

      // Prepare response
      const response: OrderConfirmationResponseDto = {
        order: {
          id: savedOrder.id,
          orderNumber: savedOrder.orderNumber,
          status: savedOrder.status,
          paymentStatus: savedOrder.paymentStatus,
          totalAmount: savedOrder.totalAmount,
          estimatedDeliveryDate: new Date(Date.now() + data.shippingMethod.estimatedDays * 24 * 60 * 60 * 1000),
          trackingNumber: savedOrder.trackingNumber,
          items: orderItems.map(item => ({
            id: item.id,
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            selectedVariants: item.selectedVariants
          })),
          shippingAddress: savedOrder.shippingAddress,
          createdAt: savedOrder.createdAt,
          updatedAt: savedOrder.updatedAt
        },
        paymentReceipt: {
          transactionId: savedOrder.paymentTransactionId || '',
          paymentMethod: savedOrder.paymentMethod,
          amount: savedOrder.totalAmount,
          currency: 'USD',
          status: savedOrder.paymentStatus
        },
        emailSent: false,
        invoiceUrl: undefined
      };

      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to confirm order');
    }
  }

  private async validateCartItems(cartItems: any[]): Promise<any[]> {
    const validatedItems = [];

    for (const item of cartItems) {
      const product = await this.productRepository.findOne({
        where: { id: item.productId }
      });

      if (!product) {
        throw new Error(`Product with ID ${item.productId} not found`);
      }

      if (!product.published || !product.approved) {
        throw new Error(`Product ${product.name} is not available for purchase`);
      }

      if (product.stock && product.stock < item.quantity) {
        throw new Error(`Insufficient stock for product ${product.name}`);
      }

      validatedItems.push({
        ...item,
        product,
        unitPrice: product.salePrice || product.regularPrice || 0
      });
    }

    return validatedItems;
  }

  private async calculateSummary(items: any[], discountAmount = 0, shippingAmount = 0, taxAmount = 0): Promise<CheckoutSummaryDto> {
    let subtotal = 0;
    const checkoutItems = [];

    for (const item of items) {
      const itemTotal = item.unitPrice * item.quantity;
      subtotal += itemTotal;

      checkoutItems.push({
        id: item.id,
        productId: item.productId,
        productName: item.product.name,
        productSlug: item.product.slug,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: itemTotal,
        selectedVariants: item.selectedVariants,
        thumbnailImage: item.product.thumbnailImgId
      });
    }

    const totalAmount = subtotal + taxAmount + shippingAmount - discountAmount;

    return {
      subtotal,
      taxAmount,
      shippingAmount,
      discountAmount,
      totalAmount,
      itemCount: items.length,
      items: checkoutItems
    };
  }

  private async getShippingMethods(address: any, items: any[]): Promise<ShippingMethodResponseDto[]> {
    // Calculate shipping based on address and items
    const baseMethods = await this.getAvailableShippingMethods();
    
    // You can modify prices based on destination, weight, etc.
    return baseMethods;
  }

  private async calculateTaxAmount(address: any, items: any[]): Promise<number> {
    // Mock tax calculation - in production, integrate with tax service
    let taxableAmount = 0;
    
    for (const item of items) {
      taxableAmount += item.unitPrice * item.quantity;
    }

    // Simple tax calculation (8% for example)
    const taxRate = 0.08;
    return Math.round(taxableAmount * taxRate * 100) / 100;
  }

  private async validateCoupon(coupon: Coupon, items: any[], userId?: string): Promise<{ valid: boolean; message?: string }> {
    // Check if coupon is expired
    if (coupon.endDate && new Date() > coupon.endDate) {
      return { valid: false, message: 'Coupon has expired' };
    }

    if (coupon.startDate && new Date() < coupon.startDate) {
      return { valid: false, message: 'Coupon is not yet active' };
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return { valid: false, message: 'Coupon usage limit reached' };
    }

    // Check minimum amount
    if (coupon.minimumAmount) {
      const totalAmount = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
      if (totalAmount < coupon.minimumAmount) {
        return { valid: false, message: `Minimum order amount of $${coupon.minimumAmount} required` };
      }
    }

    return { valid: true };
  }

  private async calculateCouponDiscount(coupon: Coupon, items: any[]): Promise<number> {
    const totalAmount = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);

    let discountAmount = 0;

    if (coupon.type === COUPON_TYPE.PERCENTAGE) {
      discountAmount = (totalAmount * coupon.value) / 100;
    } else if (coupon.type === COUPON_TYPE.FIXED_AMOUNT) {
      discountAmount = coupon.value;
    }

    // Apply maximum discount limit
    if (coupon.maximumDiscount && discountAmount > coupon.maximumDiscount) {
      discountAmount = coupon.maximumDiscount;
    }

    return Math.round(discountAmount * 100) / 100;
  }

  private async generateOrderNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    return `ORD-${year}-${randomNum}`;
  }

  private async updateProductStock(items: any[]): Promise<void> {
    for (const item of items) {
      const product = await this.productRepository.findOne({
        where: { id: item.productId }
      });

      if (product && product.stock) {
        product.stock -= item.quantity;
        product.numOfSales = (product.numOfSales || 0) + item.quantity;
        await this.productRepository.save(product);
      }
    }
  }

  private async updateCouponUsage(couponCode: string, orderId: string, userId?: string): Promise<void> {
    const coupon = await this.couponRepository.findOne({
      where: { code: couponCode }
    });

    if (coupon) {
      coupon.usageCount += 1;
      await this.couponRepository.save(coupon);
    }
  }

  private async clearCartItems(userId?: string, guestId?: string): Promise<void> {
    const whereCondition: any = {};
    
    if (userId) {
      whereCondition.userId = userId;
    } else if (guestId) {
      whereCondition.guestId = guestId;
    }

    if (Object.keys(whereCondition).length > 0) {
      await this.cartRepository.delete(whereCondition);
    }
  }

  async getOrders(userId?: string, guestId?: string): Promise<Order[]> {
    const whereCondition: any = {};
    
    if (userId) {
      whereCondition.userId = userId;
    } else if (guestId) {
      whereCondition.guestId = guestId;
    }

    return await this.orderRepository.find({
      where: whereCondition,
      relations: ['items', 'statusHistory'],
      order: { createdAt: 'DESC' }
    });
  }

  async getOrderById(orderId: string): Promise<Order | null> {
    return await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['items', 'statusHistory']
    });
  }

  async updateOrderStatus(orderId: string, status: ORDER_STATUS, changedBy?: string, notes?: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId }
    });

    if (!order) {
      throw new Error('Order not found');
    }

    const previousStatus = order.status;
    order.status = status;
    order.updatedAt = new Date();

    // Create status history entry
    const statusHistory = this.orderStatusHistoryRepository.create({
      orderId: order.id,
      status,
      previousStatus,
      changedBy,
      notes,
      notificationSent: false
    });

    await this.orderStatusHistoryRepository.save(statusHistory);
    return await this.orderRepository.save(order);
  }

  private async getAvailableShippingMethods(): Promise<ShippingMethodResponseDto[]> {
    // Mock shipping methods - in production, integrate with shipping providers
    return [
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
      },
      {
        id: 'overnight',
        name: 'Overnight Shipping',
        description: 'Next business day',
        price: 39.99,
        estimatedDays: 1,
        carrier: 'UPS'
      }
    ];
  }
} 