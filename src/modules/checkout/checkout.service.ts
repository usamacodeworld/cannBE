import { Repository, DataSource } from "typeorm";
import { Order } from "./entities/order.entity";
import { OrderItem } from "./entities/order-item.entity";
import { OrderStatusHistory } from "./entities/order-status-history.entity";
import { ShippingAddress } from "./entities/shipping-address.entity";
import { Coupon, COUPON_TYPE } from "../coupon/coupon.entity";
import { Cart } from "../cart/entities/cart.entity";
import { Product } from "../products/entities/product.entity";
import { User } from "../user/user.entity";
import {
  Address,
  ADDRESS_TYPE,
  ADDRESS_STATUS,
} from "../address/address.entity";
import { CheckoutInitiateDto } from "./dto/checkout-initiate.dto";
import { ShippingAddressDto } from "./dto/shipping-address.dto";
import { ApplyCouponDto } from "./dto/apply-coupon.dto";
import { ConfirmOrderDto } from "./dto/confirm-order.dto";
import {
  CheckoutInitiateResponseDto,
  CheckoutSummaryDto,
  ShippingMethodResponseDto,
  CouponApplicationResponseDto,
  OrderConfirmationResponseDto,
} from "./dto/checkout-response.dto";
import { v4 as uuidv4 } from "uuid";
import { cacheService } from "../../common/services/cache.service";
import { paymentService } from "../../common/services/payment.service";
import { shippingService } from "../../common/services/shipping.service";
import { taxService } from "../../common/services/tax.service";
import { emailService } from "../../common/services/email.service";
import { ShippingIntegrationService } from "../shipping/shipping-integration.service";
import { ShippingRateService } from "../shipping/shipping-rate.service";
import { ShippingMethodService } from "../shipping/shipping-method.service";
import { ShippingRate } from "../shipping/shipping-rate.entity";
import { CategoryRestrictionService } from "../category-restrictions/category-restriction.service";
import { CategoryStateRestriction } from "../category-restrictions/category-restriction.entity";
import { ShippingMethod } from "../shipping/shipping-method.entity";
import {
  ORDER_STATUS,
  PAYMENT_METHOD,
  PAYMENT_STATUS,
} from "./entities/order.enums";

export class CheckoutService {
  private orderRepository: Repository<Order>;
  private orderItemRepository: Repository<OrderItem>;
  private orderStatusHistoryRepository: Repository<OrderStatusHistory>;
  private shippingAddressRepository: Repository<ShippingAddress>;
  private couponRepository: Repository<Coupon>;
  private cartRepository: Repository<Cart>;
  private productRepository: Repository<Product>;
  private userRepository: Repository<User>;
  private addressRepository: Repository<Address>;
  private dataSource: DataSource;
  private categoryRestrictionService: CategoryRestrictionService;

  // Redis-based checkout sessions with 30-minute TTL
  private readonly CHECKOUT_SESSION_TTL = 1800; // 30 minutes

  // Redis-based checkout session management
  private async getCheckoutSession(checkoutId: string): Promise<any | null> {
    try {
      const sessionKey = `checkout:session:${checkoutId}`;
      const session = await cacheService.get(sessionKey);

      if (session) {
        // Enrich session with address data if not already present
        return await this.enrichSessionWithAddresses(session);
      }

      return null;
    } catch (error) {
      console.error("Error getting checkout session:", error);
      return null;
    }
  }

  private async enrichSessionWithAddresses(session: any): Promise<any> {
    try {
      // If addresses are already populated, return as is
      if (session.shippingAddress && session.billingAddress) {
        return session;
      }

      // Populate missing addresses
      if (
        session.shippingAddressId &&
        !session.shippingAddress &&
        session.userId
      ) {
        session.shippingAddress = await this.validateUserAddress(
          session.userId,
          session.shippingAddressId
        );
      }

      if (
        session.billingAddressId &&
        !session.billingAddress &&
        session.userId
      ) {
        session.billingAddress = await this.validateUserAddress(
          session.userId,
          session.billingAddressId
        );
      }

      // If no billing address but has shipping address, use shipping as billing
      if (!session.billingAddress && session.shippingAddress) {
        session.billingAddress = session.shippingAddress;
      }

      return session;
    } catch (error) {
      console.error("Error enriching session with addresses:", error);
      return session; // Return original session if enrichment fails
    }
  }

  private async setCheckoutSession(
    checkoutId: string,
    sessionData: any
  ): Promise<void> {
    try {
      const sessionKey = `checkout:session:${checkoutId}`;
      await cacheService.set(sessionKey, sessionData, {
        ttl: this.CHECKOUT_SESSION_TTL,
      });
    } catch (error) {
      console.error("Error setting checkout session:", error);
    }
  }

  private async deleteCheckoutSession(checkoutId: string): Promise<void> {
    try {
      const sessionKey = `checkout:session:${checkoutId}`;
      await cacheService.delete(sessionKey);
    } catch (error) {
      console.error("Error deleting checkout session:", error);
    }
  }

  constructor(
    orderRepository: Repository<Order>,
    orderItemRepository: Repository<OrderItem>,
    orderStatusHistoryRepository: Repository<OrderStatusHistory>,
    shippingAddressRepository: Repository<ShippingAddress>,
    couponRepository: Repository<Coupon>,
    cartRepository: Repository<Cart>,
    productRepository: Repository<Product>,
    userRepository: Repository<User>,
    addressRepository: Repository<Address>,
    dataSource: DataSource
  ) {
    this.orderRepository = orderRepository;
    this.orderItemRepository = orderItemRepository;
    this.orderStatusHistoryRepository = orderStatusHistoryRepository;
    this.shippingAddressRepository = shippingAddressRepository;
    this.couponRepository = couponRepository;
    this.cartRepository = cartRepository;
    this.productRepository = productRepository;
    this.userRepository = userRepository;
    this.addressRepository = addressRepository;
    this.dataSource = dataSource;
    const categoryRestrictionRepository = this.dataSource.getRepository(
      CategoryStateRestriction
    );
    this.categoryRestrictionService = new CategoryRestrictionService(
      categoryRestrictionRepository
    );
  }

  // Initialize shipping services
  private getShippingIntegrationService(): ShippingIntegrationService {
    const shippingRateRepository = this.dataSource.getRepository(ShippingRate);
    const shippingMethodRepository =
      this.dataSource.getRepository(ShippingMethod);

    const shippingRateService = new ShippingRateService(shippingRateRepository);
    const shippingMethodService = new ShippingMethodService(
      shippingMethodRepository
    );

    return new ShippingIntegrationService(
      this.dataSource,
      shippingRateService,
      shippingMethodService
    );
  }

  async getCheckoutSessionWithAddresses(
    checkoutId: string
  ): Promise<any | null> {
    return await this.getCheckoutSession(checkoutId);
  }

  async updateCheckoutAddress(
    checkoutId: string,
    shippingAddress: any,
    billingAddress?: any,
    billingAddressSameAsShipping?: boolean
  ): Promise<any> {
    try {
      // Get existing checkout session
      const session = await this.getCheckoutSession(checkoutId);
      if (!session) {
        throw new Error("Checkout session not found or expired");
      }

      // Update shipping address
      session.shippingAddress = shippingAddress;
      session.shippingAddressId = null; // Clear address ID since we're using direct address

      // Handle billing address
      if (billingAddressSameAsShipping) {
        session.billingAddress = shippingAddress;
        session.billingAddressId = null;
      } else if (billingAddress) {
        session.billingAddress = billingAddress;
        session.billingAddressId = null;
      } else {
        // Default to shipping address if no billing address provided
        session.billingAddress = shippingAddress;
        session.billingAddressId = null;
      }

      // Validate category-based state restrictions
      if (shippingAddress && shippingAddress.state) {
        const categoryIds = session.items
          .flatMap(
            (item: any) =>
              item.product?.categories?.map((cat: any) => cat.id) || []
          )
          .filter(Boolean);

        if (categoryIds.length > 0) {
          const restrictionResult =
            await this.categoryRestrictionService.isProductRestrictedInState(
              categoryIds,
              shippingAddress.state
            );

          if (restrictionResult.isRestricted) {
            // Get the restricted product names
            const restrictedProducts = session.items.filter((item: any) => {
              const itemCategoryIds =
                item.product?.categories?.map((cat: any) => cat.id) || [];
              return itemCategoryIds.some((catId: string) =>
                restrictionResult.restrictedCategories.some(
                  (rc: any) => rc.categoryId === catId
                )
              );
            });

            const productNames = restrictedProducts.map(
              (item: any) => item.product?.name || "Unknown Product"
            );
            const uniqueProductNames = [...new Set(productNames)];

            // Get custom messages from restricted categories
            const customMessages = restrictionResult.restrictedCategories
              .map((rc: any) => rc.customMessage || rc.reason)
              .filter(Boolean);

            const errorMessage = `The following products cannot be shipped to ${
              shippingAddress.state
            }: ${uniqueProductNames.join(", ")}. ${
              customMessages.length > 0
                ? customMessages[0]
                : "Please remove these items to continue."
            }`;

            throw new Error(errorMessage);
          }
        }
      }

      // Recalculate shipping and tax based on new address
      let shippingAmount = 0;
      let availableShippingMethods: ShippingMethodResponseDto[] = [];

      try {
        const shippingIntegrationService = this.getShippingIntegrationService();

        // Convert items to shipping format
        const shippingItems = session.items.map((item: any) => ({
          id: item.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.unitPrice,
          weight: item.product?.weight || 0.5,
          categoryIds: item.product?.categoryIds || [],
        }));

        const shippingRequest = {
          items: shippingItems,
          shippingAddress: {
            country: shippingAddress.country || "US",
            state: shippingAddress.state || "",
            city: shippingAddress.city || "",
            postalCode: shippingAddress.postalCode || "",
          },
          orderValue: session.summary.subtotal,
          isHoliday: false,
        };

        // Calculate shipping options
        const shippingOptions =
          await shippingIntegrationService.calculateShippingOptions(
            shippingRequest
          );

        if (shippingOptions && shippingOptions.length > 0) {
          // Use the cheapest shipping option as default
          const defaultShipping = shippingOptions[0];
          shippingAmount = defaultShipping.totalCost;

          // Convert to shipping method format for compatibility
          availableShippingMethods = shippingOptions.map((option) => ({
            id: option.methodId,
            name: option.methodName,
            description: `${option.methodName} - ${
              option.estimatedDays || 7
            } days`,
            price: option.totalCost,
            estimatedDays: option.estimatedDays || 7,
          }));
        } else {
          // No shipping methods available for this address/cart
          availableShippingMethods = [];
          console.warn(
            "No shipping methods available for the provided address and cart items"
          );
        }
      } catch (error) {
        console.error("Error calculating shipping:", error);
        // Shipping calculation failed - return empty array
        availableShippingMethods = [];
      }
      const taxAmount = 0;
      // const taxAmount = await this.calculateTaxAmount(
      //   shippingAddress,
      //   session.items
      // );

      // Update session with new calculations
      session.summary = await this.calculateSummary(
        session.items,
        session.discountAmount || 0,
        shippingAmount,
        taxAmount
      );

      session.updatedAt = new Date();

      // Save updated session
      await this.setCheckoutSession(checkoutId, session);

      return {
        session,
        availableShippingMethods,
        updatedSummary: session.summary,
      };
    } catch (error: any) {
      throw new Error(error.message || "Failed to update checkout address");
    }
  }

  async initiateCheckout(
    data: CheckoutInitiateDto
  ): Promise<CheckoutInitiateResponseDto> {
    try {
      const checkoutId = uuidv4();

      // Get cart items from user's cart automatically
      const cartItems = await this.getUserCartItems(data.userId, data.guestId);

      if (!cartItems || cartItems.length === 0) {
        throw new Error(
          "Cart is empty. Please add items to cart before checkout."
        );
      }

      // Validate cart items
      const validatedItems = await this.validateCartItems(cartItems);

      // Calculate initial summary without shipping
      let summary = await this.calculateSummary(validatedItems);

      // Get user addresses if provided
      let shippingAddress = null;
      let billingAddress = null;
      let shippingAmount = 0;
      let availableShippingMethods: ShippingMethodResponseDto[] = [];

      // Handle shipping address - for authenticated users with addressId or guest users with direct address
      if (data.shippingAddressId && data.userId) {
        // Authenticated user with saved address ID
        shippingAddress = await this.validateUserAddress(
          data.userId,
          data.shippingAddressId
        );
      } else if (data.shippingAddress) {
        // Guest user with direct address or authenticated user with direct address
        shippingAddress = data.shippingAddress;
      }

      // Handle billing address
      if (data.billingAddressId && data.userId) {
        // Authenticated user with saved address ID
        billingAddress = await this.validateUserAddress(
          data.userId,
          data.billingAddressId
        );
      } else if (data.billingAddress) {
        // Guest user with direct address or authenticated user with direct address
        billingAddress = data.billingAddress;
      } else if (shippingAddress) {
        // Default billing address to shipping address if not provided
        billingAddress = shippingAddress;
      }
      console.log("Shipping Adderess => ", shippingAddress);

      // Validate category-based state restrictions if shipping address is provided
      if (shippingAddress && shippingAddress.state) {
        const categoryIds = validatedItems
          .flatMap(
            (item: any) =>
              item.product?.categories?.map((cat: any) => cat.id) || []
          )
          .filter(Boolean);

        console.log("Category Ids => ", categoryIds);

        if (categoryIds.length > 0) {
          const restrictionResult =
            await this.categoryRestrictionService.isProductRestrictedInState(
              categoryIds,
              shippingAddress.state
            );

          if (restrictionResult.isRestricted) {
            // Get the restricted product names
            const restrictedProducts = validatedItems.filter((item: any) => {
              const itemCategoryIds =
                item.product?.categories?.map((cat: any) => cat.id) || [];
              return itemCategoryIds.some((catId: string) =>
                restrictionResult.restrictedCategories.some(
                  (rc: any) => rc.categoryId === catId
                )
              );
            });

            const productNames = restrictedProducts.map(
              (item: any) => item.product?.name || "Unknown Product"
            );
            const uniqueProductNames = [...new Set(productNames)];

            // Get custom messages from restricted categories
            const customMessages = restrictionResult.restrictedCategories
              .map((rc: any) => rc.customMessage || rc.reason)
              .filter(Boolean);

            const errorMessage = `The following products cannot be shipped to ${
              shippingAddress.state
            }: ${uniqueProductNames.join(", ")}. ${
              customMessages.length > 0
                ? customMessages[0]
                : "Please remove these items to continue."
            }`;

            throw new Error(errorMessage);
          }
        }
      }

      // Calculate shipping costs if shipping address is provided
      if (shippingAddress) {
        try {
          const shippingIntegrationService =
            this.getShippingIntegrationService();

          // Convert items to shipping format
          const shippingItems = validatedItems.map((item: any) => ({
            id: item.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.unitPrice,
            weight: item.product?.weight || 0.5,
            categoryIds: item.product?.categoryIds || [],
          }));

          const shippingRequest = {
            items: shippingItems,
            shippingAddress: {
              country: shippingAddress.country || "US",
              state: shippingAddress.state || "",
              city: shippingAddress.city || "",
              postalCode: shippingAddress.postalCode || "",
            },
            orderValue: summary.subtotal,
            isHoliday: false,
          };

          // If a specific shipping method is provided, calculate cost for that method only
          if (data.shippingMethod) {
            const selectedShippingCost =
              await shippingIntegrationService.getShippingCostForMethod(
                data.shippingMethod,
                shippingRequest
              );
            if (selectedShippingCost) {
              shippingAmount = selectedShippingCost.totalCost;

              // Get all available shipping methods for the response
              const shippingOptions =
                await shippingIntegrationService.calculateShippingOptions(
                  shippingRequest
                );
              availableShippingMethods = shippingOptions.map((option) => ({
                id: option.methodId,
                name: option.methodName,
                description: `${option.methodName} - ${
                  option.estimatedDays || 7
                } days`,
                price: option.totalCost,
                estimatedDays: option.estimatedDays || 7,
              }));

              // Update summary with selected shipping cost
              summary = await this.calculateSummary(
                validatedItems,
                0,
                shippingAmount,
                0
              );
            } else {
              // Selected shipping method not available for this address/cart
              availableShippingMethods = [];
              console.warn(
                `Shipping method ${data.shippingMethod} not available for the provided address and cart items`
              );
            }
          } else {
            // No specific method provided, calculate all available options
            const shippingOptions =
              await shippingIntegrationService.calculateShippingOptions(
                shippingRequest
              );

            if (shippingOptions && shippingOptions.length > 0) {
              // Use the first available method as default
              const defaultShipping = shippingOptions[0];
              shippingAmount = defaultShipping.totalCost;

              // Convert to shipping method format for compatibility
              availableShippingMethods = shippingOptions.map((option) => ({
                id: option.methodId,
                name: option.methodName,
                description: `${option.methodName} - ${
                  option.estimatedDays || 7
                } days`,
                price: option.totalCost,
                estimatedDays: option.estimatedDays || 7,
              }));

              // Update summary with default shipping cost
              summary = await this.calculateSummary(
                validatedItems,
                0,
                shippingAmount,
                0
              );
            } else {
              // No shipping methods available for this address/cart
              availableShippingMethods = [];
              console.warn(
                "No shipping methods available for the provided address and cart items"
              );
            }
          }
        } catch (error) {
          console.error("Error calculating shipping:", error);
          // Shipping calculation failed - return empty array
          availableShippingMethods = [];
        }
      } else {
        // No shipping address provided - return empty array
        availableShippingMethods = [];
      }

      // Store checkout session in Redis
      const sessionData = {
        checkoutId,
        items: validatedItems,
        summary,
        userId: data.userId,
        guestId: data.guestId,
        shippingAddressId: data.shippingAddressId,
        billingAddressId: data.billingAddressId,
        shippingAddress: shippingAddress, // Store full address object
        billingAddress: billingAddress, // Store full address object
        shippingMethod: data.shippingMethod,
        paymentMethod: data.paymentMethod,
        shippingAmount,
        availableShippingMethods,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await this.setCheckoutSession(checkoutId, sessionData);

      return {
        checkoutId,
        summary,
        items: validatedItems,
        shippingAddress,
        billingAddress,
        availablePaymentMethods: [
          PAYMENT_METHOD.CREDIT_CARD,
          PAYMENT_METHOD.PAYPAL,
          PAYMENT_METHOD.CASH_ON_DELIVERY,
        ],
        availableShippingMethods,
      };
    } catch (error: any) {
      throw new Error(error.message || "Failed to initiate checkout");
    }
  }

  async applyCoupon(
    data: ApplyCouponDto
  ): Promise<CouponApplicationResponseDto> {
    try {
      // Get checkout session
      const session = await this.getCheckoutSession(data.checkoutId);
      if (!session) {
        throw new Error("Checkout session not found or expired");
      }

      // Find coupon
      const coupon = await this.couponRepository.findOne({
        where: { code: data.couponCode, isActive: true },
      });

      if (!coupon) {
        throw new Error("Invalid coupon code");
      }

      // Validate coupon
      const couponValidation = await this.validateCoupon(
        coupon,
        data.items,
        session.userId
      );
      if (!couponValidation.valid) {
        throw new Error(couponValidation.message);
      }

      // Calculate discount
      const discountAmount = await this.calculateCouponDiscount(
        coupon,
        data.items
      );

      // Update session with coupon
      session.coupon = coupon;
      session.discountAmount = discountAmount;
      session.summary = await this.calculateSummary(
        session.items,
        discountAmount
      );
      session.updatedAt = new Date();

      // Save updated session to Redis
      await this.setCheckoutSession(data.checkoutId, session);

      return {
        couponApplied: true,
        coupon: {
          code: coupon.code,
          name: coupon.name,
          type: coupon.type,
          value: coupon.value,
          discountAmount,
        },
        updatedSummary: session.summary,
      };
    } catch (error: any) {
      throw new Error(error.message || "Failed to apply coupon");
    }
  }

  async calculateShippingWithoutSession(
    items: any[],
    shippingAddress: any
  ): Promise<ShippingMethodResponseDto[]> {
    try {
      const shippingIntegrationService = this.getShippingIntegrationService();

      // Convert items to shipping format
      const shippingItems = items.map((item: any) => ({
        id: item.id || `item-${Math.random()}`,
        productId: item.productId,
        quantity: item.quantity,
        price: item.unitPrice || item.price,
        weight: item.product?.weight || item.weight || 0.5,
        categoryIds: item.product?.categoryIds || item.categoryIds || [],
      }));

      const orderValue = items.reduce((total, item) => {
        const price = item.unitPrice || item.price || 0;
        return total + price * item.quantity;
      }, 0);

      const shippingRequest = {
        items: shippingItems,
        shippingAddress: {
          country: shippingAddress.country || "US",
          state: shippingAddress.state || "",
          city: shippingAddress.city || "",
          postalCode: shippingAddress.postalCode || "",
        },
        orderValue,
        isHoliday: false,
      };

      // Calculate shipping options
      const shippingOptions =
        await shippingIntegrationService.calculateShippingOptions(
          shippingRequest
        );

      if (shippingOptions && shippingOptions.length > 0) {
        // Convert to shipping method format for compatibility
        return shippingOptions.map((option) => ({
          id: option.methodId,
          name: option.methodName,
          description: `${option.methodName} - ${
            option.estimatedDays || 7
          } days`,
          price: option.totalCost,
          estimatedDays: option.estimatedDays || 7,
        }));
      } else {
        // No shipping methods available
        return [];
      }
    } catch (error: any) {
      console.error("Shipping calculation error:", error);
      // Return empty array instead of default methods
      return [];
    }
  }

  async calculateShipping(
    checkoutId: string,
    shippingAddress: any
  ): Promise<ShippingMethodResponseDto[]> {
    try {
      const session = await this.getCheckoutSession(checkoutId);
      if (!session) {
        throw new Error("Checkout session not found or expired");
      }

      const shippingIntegrationService = this.getShippingIntegrationService();

      // Convert items to shipping format
      const shippingItems = session.items.map((item: any) => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.unitPrice,
        weight: item.product?.weight || 0.5,
        categoryIds: item.product?.categoryIds || [],
      }));

      const shippingRequest = {
        items: shippingItems,
        shippingAddress: {
          country: shippingAddress.country,
          state: shippingAddress.state,
          city: shippingAddress.city,
          postalCode: shippingAddress.postalCode,
        },
        orderValue: session.summary.subtotal,
        isHoliday: false,
      };

      // Calculate shipping options
      const shippingOptions =
        await shippingIntegrationService.calculateShippingOptions(
          shippingRequest
        );

      if (shippingOptions && shippingOptions.length > 0) {
        // Convert to shipping method format for compatibility
        return shippingOptions.map((option) => ({
          id: option.methodId,
          name: option.methodName,
          description: `${option.methodName} - ${
            option.estimatedDays || 7
          } days`,
          price: option.totalCost,
          estimatedDays: option.estimatedDays || 7,
        }));
      } else {
        // No shipping methods available
        return [];
      }
    } catch (error: any) {
      console.error("Shipping calculation error:", error);
      // Return empty array instead of default methods
      return [];
    }
  }

  async calculateTax(
    checkoutId: string,
    shippingAddress: any
  ): Promise<number> {
    try {
      const session = await this.getCheckoutSession(checkoutId);
      if (!session) {
        throw new Error("Checkout session not found or expired");
      }

      // Convert items to tax format
      const taxItems = session.items.map((item: any) => ({
        id: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        description: item.product.name,
      }));

      const taxRequest = {
        fromAddress: {
          country: "US",
          state: "CA",
          city: "Business City",
          postalCode: "90210",
        },
        toAddress: {
          country: shippingAddress.country,
          state: shippingAddress.state,
          city: shippingAddress.city,
          postalCode: shippingAddress.postalCode,
        },
        items: taxItems,
        shippingAmount: session.summary.shippingAmount || 0,
      };

      // Calculate real tax
      const taxCalculation = await taxService.calculateTax(taxRequest);

      // Update session with tax
      session.taxAmount = taxCalculation.taxAmount;
      session.summary = await this.calculateSummary(
        session.items,
        session.discountAmount,
        session.shippingAmount,
        taxCalculation.taxAmount
      );

      // Save updated session to Redis
      await this.setCheckoutSession(checkoutId, session);

      return taxCalculation.taxAmount;
    } catch (error: any) {
      console.error("Tax calculation error:", error);
      // Fallback to basic calculation
      const session = await this.getCheckoutSession(checkoutId);
      // Basic tax calculation fallback
      const taxableAmount = (session?.items || []).reduce(
        (sum: number, item: any) => sum + item.unitPrice * item.quantity,
        0
      );
      const taxRate = 0.08; // 8% default
      return Math.round(taxableAmount * taxRate * 100) / 100;
    }
  }

  async confirmOrder(
    data: ConfirmOrderDto
  ): Promise<OrderConfirmationResponseDto> {
    return await this.dataSource.transaction(async (manager) => {
      try {
        // Get checkout session to retrieve cartId
        const session = await this.getCheckoutSession(data.checkoutId);

        if (!session) {
          throw new Error("Checkout session not found or expired");
        }

        const orderNumber = await this.generateOrderNumber();

        // Get addresses from session or validate provided IDs
        let shippingAddress = session.shippingAddress;
        let billingAddress = session.billingAddress || session.shippingAddress;

        if (session.shippingAddressId && !shippingAddress) {
          shippingAddress = await this.validateUserAddress(
            data.userId!,
            session.shippingAddressId
          );
        }

        if (session.billingAddressId && !billingAddress) {
          billingAddress = await this.validateUserAddress(
            data.userId!,
            session.billingAddressId
          );
        }

        // Validate that addresses are provided
        if (!shippingAddress) {
          throw new Error(
            "Shipping address is required. Please provide a shipping address before confirming the order."
          );
        }

        if (!billingAddress) {
          throw new Error(
            "Billing address is required. Please provide a billing address before confirming the order."
          );
        }

        // Validate category-based state restrictions
        if (shippingAddress && shippingAddress.state) {
          const categoryIds = session.items
            .flatMap(
              (item: any) =>
                item.product?.categories?.map((cat: any) => cat.id) || []
            )
            .filter(Boolean);

          if (categoryIds.length > 0) {
            const restrictionResult =
              await this.categoryRestrictionService.isProductRestrictedInState(
                categoryIds,
                shippingAddress.state
              );

            if (restrictionResult.isRestricted) {
              // Get the restricted product names
              const restrictedProducts = session.items.filter((item: any) => {
                const itemCategoryIds =
                  item.product?.categories?.map((cat: any) => cat.id) || [];
                return itemCategoryIds.some((catId: string) =>
                  restrictionResult.restrictedCategories.some(
                    (rc: any) => rc.categoryId === catId
                  )
                );
              });

              const productNames = restrictedProducts.map(
                (item: any) => item.product?.name || "Unknown Product"
              );
              const uniqueProductNames = [...new Set(productNames)];

              // Get custom messages from restricted categories
              const customMessages = restrictionResult.restrictedCategories
                .map((rc: any) => rc.customMessage || rc.reason)
                .filter(Boolean);

              const errorMessage = `Cannot complete order. The following products cannot be shipped to ${
                shippingAddress.state
              }: ${uniqueProductNames.join(", ")}. ${
                customMessages.length > 0
                  ? customMessages[0]
                  : "Please remove these items to continue."
              }`;

              throw new Error(errorMessage);
            }
          }
        }

        // Get shipping method from session
        const shippingMethod = session.shippingMethod || {
          id: "standard",
          name: "Standard Shipping",
          price: 4.99,
          estimatedDays: 7,
        };

        const paymentRequest = {
          amount: session.summary.totalAmount,
          currency: "USD",
          paymentMethod: data.paymentMethod || PAYMENT_METHOD.CREDIT_CARD,
          paymentData: {
            cardNumber: data.paymentData?.cardNumber,
            expiryMonth: data.paymentData?.expiryMonth,
            expiryYear: data.paymentData?.expiryYear,
            cvv: data.paymentData?.cvv,
            cardholderName: data.paymentData?.cardholderName,
            billingAddress: billingAddress,
          },
          orderId: orderNumber,
          orderNumber,
          customerEmail: billingAddress.email,
          customerName: `${billingAddress.firstName} ${billingAddress.lastName}`,
          description: `Order ${orderNumber}`,
        };

        // console.log(
        //   "🔍 Payment Debug - Payment Request Amount:",
        //   paymentRequest.amount
        // );

        // Process payment first
        // const paymentRequest = {
        //   amount: session.summary.totalAmount,
        //   currency: "USD",
        //   paymentMethod: data.paymentMethod,
        //   paymentData: {
        //     cardNumber: data.paymentData?.cardNumber,
        //     expiryMonth: data.paymentData?.expiryMonth,
        //     expiryYear: data.paymentData?.expiryYear,
        //     cvv: data.paymentData?.cvv,
        //     cardholderName: data.paymentData?.cardholderName,
        //     billingAddress: billingAddress,
        //     paymentMethodId: data.paymentData?.paymentMethodId,
        //   },
        //   orderId: orderNumber,
        //   orderNumber,
        //   customerEmail: data.customerInfo.email,
        //   customerName: `${data.customerInfo.firstName} ${data.customerInfo.lastName}`,
        //   description: `Order ${orderNumber}`,
        // };

        const paymentResponse = await paymentService.processPayment(
          paymentRequest
        );

        if (
          !paymentResponse.success &&
          paymentResponse.paymentStatus !== PAYMENT_STATUS.PENDING
        ) {
          throw new Error(paymentResponse.error || "Payment processing failed");
        }

        // Create order
        const order = manager.create(Order, {
          orderNumber,
          userId: data.userId,
          guestId: data.guestId || uuidv4(),
          status: ORDER_STATUS.PENDING,
          subtotal: session.summary.subtotal,
          taxAmount: session.summary.taxAmount,
          shippingAmount: session.summary.shippingAmount,
          discountAmount: session.summary.discountAmount,
          totalAmount: session.summary.totalAmount,
          paymentStatus: paymentResponse.paymentStatus,
          paymentMethod: data.paymentMethod,
          paymentTransactionId: paymentResponse.transactionId,
          paymentGatewayResponse: JSON.stringify(
            paymentResponse.gatewayResponse
          ),
          shippingAddress: shippingAddress,
          billingAddress: billingAddress,
          shippingMethod: shippingMethod.name,
          customerEmail: billingAddress.email,
          customerFirstName: billingAddress.firstName,
          customerLastName: billingAddress.lastName,
          customerPhone: billingAddress.phone,
          notes: data.notes,
          couponCode: data.couponCode,
        });

        const savedOrder = await manager.save(Order, order);

        // Create order items
        const orderItems = [];
        for (const item of session.items) {
          const product = await this.productRepository.findOne({
            where: { id: item.productId },
          });

          const orderItem = manager.create(OrderItem, {
            orderId: savedOrder.id,
            productId: item.productId,
            productName: product?.name || "Unknown Product",
            productSlug: product?.slug,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.unitPrice * item.quantity,
            selectedVariants: item.selectedVariants,
            productSnapshot: product,
            thumbnailImage: product?.thumbnailImgId,
          });

          orderItems.push(await manager.save(OrderItem, orderItem));
        }

        // Create initial status history
        const statusHistory = manager.create(OrderStatusHistory, {
          orderId: savedOrder.id,
          status: ORDER_STATUS.PENDING,
          notes: "Order created",
          notificationSent: false,
        });

        await manager.save(OrderStatusHistory, statusHistory);

        // Update product stock
        await this.updateProductStock(session.items, manager);

        // Update coupon usage if applicable
        if (data.couponCode) {
          await this.updateCouponUsage(
            data.couponCode,
            savedOrder.id,
            manager,
            data.userId
          );
        }

        // Clear cart items
        await this.clearCartItems(manager, data.userId, savedOrder.guestId);

        // Clean up checkout session
        await this.deleteCheckoutSession(data.checkoutId);

        // Create shipment if not cash on delivery
        let trackingNumber: string | undefined;
        if (data.paymentMethod !== PAYMENT_METHOD.CASH_ON_DELIVERY) {
          const shippingItems = session.items.map((item: any) => ({
            weight: 1, // Default weight
            length: 10,
            width: 10,
            height: 10,
            quantity: item.quantity,
            description: "Product",
          }));

          const shipmentResult = await shippingService.createShipment(
            {
              id: shippingMethod.id,
              name: shippingMethod.name,
              description: shippingMethod.name,
              price: shippingMethod.price,
              estimatedDays: shippingMethod.estimatedDays,
              carrier: "USPS",
              serviceCode: shippingMethod.id,
              trackingAvailable: true,
            },
            {
              fromAddress: {
                firstName: "CannBE",
                lastName: "Store",
                addressLine1: "123 Business Street",
                city: "Business City",
                state: "CA",
                postalCode: "90210",
                country: "US",
              },
              toAddress: shippingAddress,
              items: shippingItems,
              weight: shippingService.calculateWeight(shippingItems),
            },
            orderNumber
          );

          if (shipmentResult.success && shipmentResult.trackingNumber) {
            trackingNumber = shipmentResult.trackingNumber;
            savedOrder.trackingNumber = trackingNumber;
            await manager.save(Order, savedOrder);
          }
        }

        // Send confirmation email
        const emailData = {
          order: savedOrder,
          customerName: `${billingAddress.firstName} ${billingAddress.lastName}`,
          customerEmail: billingAddress.email,
          orderNumber,
          totalAmount: session.summary.totalAmount,
          items: orderItems,
          shippingAddress: shippingAddress,
          trackingNumber,
          estimatedDelivery: new Date(
            Date.now() + shippingMethod.estimatedDays * 24 * 60 * 60 * 1000
          ),
        };

        const emailSent = await emailService.sendOrderConfirmation(emailData);

        // Prepare response
        const response: OrderConfirmationResponseDto = {
          order: {
            id: savedOrder.id,
            orderNumber: savedOrder.orderNumber,
            status: savedOrder.status,
            paymentStatus: savedOrder.paymentStatus,
            totalAmount: savedOrder.totalAmount,
            estimatedDeliveryDate: new Date(
              Date.now() + shippingMethod.estimatedDays * 24 * 60 * 60 * 1000
            ),
            trackingNumber: savedOrder.trackingNumber,
            items: orderItems.map((item) => ({
              id: item.id,
              productId: item.productId,
              productName: item.productName,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.totalPrice,
              selectedVariants: item.selectedVariants,
            })),
            shippingAddress: savedOrder.shippingAddress,
            createdAt: savedOrder.createdAt,
            updatedAt: savedOrder.updatedAt,
          },
          paymentReceipt: {
            transactionId: savedOrder.paymentTransactionId || "",
            paymentMethod: savedOrder.paymentMethod,
            amount: savedOrder.totalAmount,
            currency: "USD",
            status: savedOrder.paymentStatus,
          },
          emailSent: emailSent,
          invoiceUrl: undefined,
        };

        return response;
      } catch (error: any) {
        console.error("Order confirmation error:", error);
        throw new Error(error.message || "Failed to confirm order");
      }
    });
  }

  private async validateCartItems(cartItems: any[]): Promise<any[]> {
    const validatedItems = [];

    for (const item of cartItems) {
      const product = await this.productRepository.findOne({
        where: { id: item.productId },
        relations: ["attributes", "attributes.values"], // Ensure attribute values are loaded
      });

      if (!product) {
        throw new Error(`Product with ID ${item.productId} not found`);
      }

      if (!product.published || !product.approved) {
        throw new Error(
          `Product ${product.name} is not available for purchase`
        );
      }

      if (product.stock && product.stock < item.quantity) {
        throw new Error(`Insufficient stock for product ${product.name}`);
      }

      let unitPrice = product.salePrice || product.regularPrice || 0;

      // If item has variants, get the price from the selected attribute value
      if (item.selectedVariants && item.selectedVariants.length > 0) {
        for (const variant of item.selectedVariants) {
          for (const attr of product.attributes || []) {
            const attrValue = (attr.values || []).find(
              (val: any) => val.id === variant.attributeValueId
            );

            if (attrValue && attrValue.price) {
              unitPrice = Number(attrValue.price);
              break;
            }
          }
        }
      }

      validatedItems.push({
        ...item,
        product,
        unitPrice,
      });
    }

    return validatedItems;
  }

  private async calculateSummary(
    items: any[],
    discountAmount = 0,
    shippingAmount = 0,
    taxAmount = 0
  ): Promise<CheckoutSummaryDto> {
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
        thumbnailImage: item.product.thumbnailImgId,
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
      items: checkoutItems,
    };
  }

  private async calculateTaxAmount(
    address: any,
    items: any[]
  ): Promise<number> {
    // Mock tax calculation - in production, integrate with tax service
    let taxableAmount = 0;

    for (const item of items) {
      taxableAmount += item.unitPrice * item.quantity;
    }

    // Simple tax calculation (8% for example)
    const taxRate = 0.08;
    return Math.round(taxableAmount * taxRate * 100) / 100;
  }

  private async validateCoupon(
    coupon: Coupon,
    items: any[],
    userId?: string
  ): Promise<{ valid: boolean; message?: string }> {
    // Check if coupon is expired
    console.log("Coupon ==> ", coupon);
    if (coupon.endDate && new Date() > coupon.endDate) {
      return { valid: false, message: "Coupon has expired" };
    }

    if (coupon.startDate && new Date() < coupon.startDate) {
      return { valid: false, message: "Coupon is not yet active" };
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return { valid: false, message: "Coupon usage limit reached" };
    }

    // Check minimum amount
    if (coupon.minimumAmount) {
      const totalAmount = items.reduce(
        (sum, item) => sum + item.unitPrice * item.quantity,
        0
      );
      if (totalAmount < coupon.minimumAmount) {
        return {
          valid: false,
          message: `Minimum order amount of $${coupon.minimumAmount} required`,
        };
      }
    }

    // Check category and product restrictions
    if (
      (coupon.applicableCategories && coupon.applicableCategories.length > 0) ||
      (coupon.applicableProducts && coupon.applicableProducts.length > 0)
    ) {
      let hasApplicableItems = false;

      for (const item of items) {
        // Get product with categories for validation
        const product = await this.productRepository.findOne({
          where: { id: item.productId },
          relations: ["categories"],
        });

        if (!product) continue;

        // Check if product is in applicable products list
        if (coupon.applicableProducts && coupon.applicableProducts.length > 0) {
          if (coupon.applicableProducts.includes(item.productId)) {
            hasApplicableItems = true;
            break;
          }
        }

        // Check if product's categories are in applicable categories list
        if (
          coupon.applicableCategories &&
          coupon.applicableCategories.length > 0
        ) {
          const productCategoryIds =
            product.categories?.map((cat) => cat.id) || [];
          if (
            productCategoryIds.some((catId) =>
              coupon.applicableCategories.includes(catId)
            )
          ) {
            hasApplicableItems = true;
            break;
          }
        }
      }

      if (!hasApplicableItems) {
        return {
          valid: false,
          message: "This coupon is not applicable to any items in your cart",
        };
      }
    }

    // TODO: Check per-user usage limit (would need order history)
    // For now, we'll skip this check

    return { valid: true };
  }

  private async calculateCouponDiscount(
    coupon: Coupon,
    items: any[]
  ): Promise<number> {
    // Calculate applicable amount (only for eligible items)
    let applicableAmount = 0;

    if (
      (coupon.applicableCategories && coupon.applicableCategories.length > 0) ||
      (coupon.applicableProducts && coupon.applicableProducts.length > 0)
    ) {
      // Only apply to eligible items
      for (const item of items) {
        const product = await this.productRepository.findOne({
          where: { id: item.productId },
          relations: ["categories"],
        });

        if (!product) continue;

        let isEligible = false;

        // Check if product is in applicable products list
        if (coupon.applicableProducts && coupon.applicableProducts.length > 0) {
          if (coupon.applicableProducts.includes(item.productId)) {
            isEligible = true;
          }
        }

        // Check if product's categories are in applicable categories list
        if (
          coupon.applicableCategories &&
          coupon.applicableCategories.length > 0
        ) {
          const productCategoryIds =
            product.categories?.map((cat) => cat.id) || [];
          if (
            productCategoryIds.some((catId) =>
              coupon.applicableCategories.includes(catId)
            )
          ) {
            isEligible = true;
          }
        }

        if (isEligible) {
          applicableAmount += item.unitPrice * item.quantity;
        }
      }
    } else {
      // Apply to all items if no restrictions
      applicableAmount = items.reduce(
        (sum, item) => sum + item.unitPrice * item.quantity,
        0
      );
    }

    let discountAmount = 0;

    if (coupon.type === COUPON_TYPE.PERCENTAGE) {
      discountAmount = (applicableAmount * coupon.value) / 100;
    } else if (coupon.type === COUPON_TYPE.FIXED_AMOUNT) {
      discountAmount = Math.min(coupon.value, applicableAmount);
    } else if (coupon.type === COUPON_TYPE.FREE_SHIPPING) {
      // Free shipping discount amount is handled separately
      discountAmount = 0;
    }

    // Apply maximum discount limit
    if (coupon.maximumDiscount && discountAmount > coupon.maximumDiscount) {
      discountAmount = coupon.maximumDiscount;
    }

    return Math.round(discountAmount * 100) / 100;
  }

  private async generateOrderNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, "0");
    return `ORD-${year}-${randomNum}`;
  }

  private async updateProductStock(items: any[], manager: any): Promise<void> {
    for (const item of items) {
      const product = await this.productRepository.findOne({
        where: { id: item.productId },
      });

      if (product && product.stock) {
        product.stock -= item.quantity;
        product.numOfSales = (product.numOfSales || 0) + item.quantity;
        await manager.save(Product, product);
      }
    }
  }

  private async updateCouponUsage(
    couponCode: string,
    orderId: string,
    manager: any,
    userId?: string
  ): Promise<void> {
    const coupon = await this.couponRepository.findOne({
      where: { code: couponCode },
    });

    if (coupon) {
      coupon.usageCount += 1;
      await manager.save(Coupon, coupon);
    }
  }

  private async clearCartItems(
    manager: any,
    userId?: string,
    guestId?: string
  ): Promise<void> {
    const whereCondition: any = {};

    if (userId) {
      whereCondition.userId = userId;
    } else if (guestId) {
      whereCondition.guestId = guestId;
    }

    if (Object.keys(whereCondition).length > 0) {
      await manager.delete(Cart, whereCondition);
    }
  }

  async getOrders(userId?: string, guestId?: string): Promise<Order[]> {
    const whereCondition: any = {};

    if (userId) {
      whereCondition.userId = userId;
    } else if (guestId) {
      whereCondition.guestId = guestId;
    }

    // Create cache key
    const cacheKey = `orders:${userId || guestId}:${JSON.stringify(
      whereCondition
    )}`;

    // Use cache wrapper for order retrieval (5-minute TTL)
    return await cacheService.cacheWrapper(
      cacheKey,
      async () => {
        return await this.orderRepository.find({
          where: whereCondition,
          relations: ["items", "statusHistory"],
          order: { createdAt: "DESC" },
        });
      },
      { ttl: 300 } // 5 minutes
    );
  }

  async getOrderById(
    orderId: string,
    userId?: string,
    guestId?: string
  ): Promise<Order | null> {
    // Create cache key
    const cacheKey = `order:${orderId}`;

    // Use cache wrapper for single order retrieval (10-minute TTL)
    return await cacheService.cacheWrapper(
      cacheKey,
      async () => {
        const whereCondition: any = { id: orderId };

        // Add user/guest validation if provided
        if (userId) {
          whereCondition.userId = userId;
        } else if (guestId) {
          whereCondition.guestId = guestId;
        }

        return await this.orderRepository.findOne({
          where: whereCondition,
          relations: ["items", "statusHistory"],
        });
      },
      { ttl: 600 } // 10 minutes
    );
  }

  async updateOrderStatus(
    orderId: string,
    status: ORDER_STATUS,
    changedBy?: string,
    notes?: string
  ): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
    });

    if (!order) {
      throw new Error("Order not found");
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
      notificationSent: false,
    });

    await this.orderStatusHistoryRepository.save(statusHistory);
    const updatedOrder = await this.orderRepository.save(order);

    // Invalidate related caches
    await cacheService.delete(`order:${orderId}`);
    if (order.userId) {
      await cacheService.deletePattern(`orders:${order.userId}:*`);
    } else if (order.guestId) {
      await cacheService.deletePattern(`orders:${order.guestId}:*`);
    }

    return updatedOrder;
  }

  // Get user addresses for checkout
  async getUserAddresses(
    userId: string
  ): Promise<{ shipping: Address[]; billing: Address[] }> {
    try {
      const addresses = await this.addressRepository.find({
        where: { userId, status: ADDRESS_STATUS.ACTIVE },
        order: { isDefault: "DESC", createdAt: "DESC" },
      });

      const shippingAddresses = addresses.filter(
        (addr) =>
          addr.type === ADDRESS_TYPE.SHIPPING || addr.type === ADDRESS_TYPE.BOTH
      );

      const billingAddresses = addresses.filter(
        (addr) =>
          addr.type === ADDRESS_TYPE.BILLING || addr.type === ADDRESS_TYPE.BOTH
      );

      return { shipping: shippingAddresses, billing: billingAddresses };
    } catch (error: any) {
      console.error("Get user addresses error:", error);
      throw new Error("Failed to get user addresses");
    }
  }

  // Get default addresses for user
  async getDefaultAddresses(
    userId: string
  ): Promise<{ shipping?: Address; billing?: Address }> {
    try {
      const defaultShipping = await this.addressRepository.findOne({
        where: {
          userId,
          type: ADDRESS_TYPE.SHIPPING,
          isDefault: true,
          status: ADDRESS_STATUS.ACTIVE,
        },
      });

      const defaultBilling = await this.addressRepository.findOne({
        where: {
          userId,
          type: ADDRESS_TYPE.BILLING,
          isDefault: true,
          status: ADDRESS_STATUS.ACTIVE,
        },
      });

      return {
        shipping: defaultShipping || undefined,
        billing: defaultBilling || undefined,
      };
    } catch (error: any) {
      console.error("Get default addresses error:", error);
      throw new Error("Failed to get default addresses");
    }
  }

  // Validate address belongs to user
  async validateUserAddress(
    userId: string,
    addressId: string
  ): Promise<Address> {
    try {
      const address = await this.addressRepository.findOne({
        where: { id: addressId, userId, status: ADDRESS_STATUS.ACTIVE },
      });

      if (!address) {
        throw new Error("Address not found or does not belong to user");
      }

      return address;
    } catch (error: any) {
      console.error("Validate user address error:", error);
      throw new Error(error.message || "Failed to validate address");
    }
  }

  private async getUserCartItems(
    userId?: string,
    guestId?: string
  ): Promise<any[]> {
    try {
      let cartItems: any[] = [];

      if (userId) {
        // Get cart items for registered user
        const cart = await this.cartRepository.find({
          where: { userId },
          relations: ["product", "product.thumbnailImg", "product.categories"],
        });

        cartItems = cart.map((item) => ({
          id: item.id,
          productId: item.productId,
          quantity: item.quantity,
          product: item.product,
          selectedVariants: item.variants || [],
        }));
      } else if (guestId) {
        // Get cart items for guest user
        const cart = await this.cartRepository.find({
          where: { guestId },
          relations: ["product", "product.thumbnailImg", "product.categories"],
        });

        cartItems = cart.map((item) => ({
          id: item.id,
          productId: item.productId,
          quantity: item.quantity,
          product: item.product,
          selectedVariants: item.variants || [],
        }));
      }

      return cartItems;
    } catch (error) {
      console.error("Error getting user cart items:", error);
      throw new Error("Failed to retrieve cart items");
    }
  }
}
