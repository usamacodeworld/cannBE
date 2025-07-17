import { AppDataSource } from "../../../config/database";
import { User } from "../../user/user.entity";
import { Cart } from "../../cart/entities/cart.entity";
import { Order } from "../../checkout/entities/order.entity";
import { Address } from "../../address/address.entity";
import { CreateUserDto } from "../../user/dto/create-user.dto";
import { UserResponseDto } from "../../user/dto/user-response.dto";
import { getAccessToken, getRefreshToken } from "../../../libs/jwt";
import { USER_TYPE } from "../../../constants/user";
import { UserInfo } from "@/types/auth";
import * as bcrypt from "bcrypt";

export class GuestMigrationService {
  private userRepository = AppDataSource.getRepository(User);
  private cartRepository = AppDataSource.getRepository(Cart);
  private orderRepository = AppDataSource.getRepository(Order);
  private addressRepository = AppDataSource.getRepository(Address);

  /**
   * Register a new user and migrate guest data
   */
  async registerAndMigrate(
    createUserDto: CreateUserDto,
    guestId: string
  ): Promise<{
    user: UserResponseDto;
    accessToken: string;
    refreshToken: string;
    migrationSummary: {
      cartItemsMigrated: number;
      ordersMigrated: number;
      addressesMigrated: number;
    };
  }> {
    return await AppDataSource.transaction(async (manager) => {
      // Step 1: Create the new user
      const existingUser = await this.userRepository.findOne({
        where: { email: createUserDto.email },
      });

      if (existingUser) {
        throw new Error("User with this email already exists");
      }

      // Hash password and create user

      const user = this.userRepository.create({
        ...createUserDto,
        type: USER_TYPE.BUYER, // Default to buyer for guest registrations
        emailVerified: false,
        isActive: true,
      });

      const savedUser = await manager.save(User, user);

      // Step 2: Migrate cart items
      const cartItemsMigrated = await this.migrateCartItems(
        manager,
        guestId,
        savedUser.id
      );

      // Step 3: Migrate orders
      const ordersMigrated = await this.migrateOrders(
        manager,
        guestId,
        savedUser.id
      );

      // Step 4: Migrate addresses from orders
      const addressesMigrated = await this.migrateAddresses(
        manager,
        guestId,
        savedUser.id
      );

      // Step 5: Generate authentication tokens
      const userInfo: UserInfo = {
        id: savedUser.id,
        type: savedUser.type as USER_TYPE,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        email: savedUser.email,
      };
      const accessToken = getAccessToken(userInfo);
      const refreshToken = getRefreshToken(userInfo);

      // Step 6: Clear guest data (optional - you might want to keep it for analytics)
      await this.clearGuestData(manager, guestId);

      return {
        user: {
          id: savedUser.id,
          firstName: savedUser.firstName,
          lastName: savedUser.lastName,
          email: savedUser.email,
          type: savedUser.type as USER_TYPE,
          phone: savedUser.phone,
          emailVerified: savedUser.emailVerified,
          createdAt: savedUser.createdAt,
          updatedAt: savedUser.updatedAt,
        },
        accessToken,
        refreshToken,
        migrationSummary: {
          cartItemsMigrated,
          ordersMigrated,
          addressesMigrated,
        },
      };
    });
  }

  /**
   * Migrate cart items from guest to user
   */
  private async migrateCartItems(
    manager: any,
    guestId: string,
    userId: string
  ): Promise<number> {
    // Get all active cart items for the guest
    const guestCartItems = await this.cartRepository.find({
      where: { guestId, isActive: true },
    });

    if (guestCartItems.length === 0) {
      return 0;
    }

    // Get existing user cart items to check for duplicates
    const userCartItems = await this.cartRepository.find({
      where: { userId, isActive: true },
    });

    let migratedCount = 0;

    for (const guestItem of guestCartItems) {
      // Check if user already has this product in cart
      const existingUserItem = userCartItems.find(
        (item) => item.productId === guestItem.productId
      );

      if (existingUserItem) {
        // Merge quantities
        existingUserItem.quantity += guestItem.quantity;
        await manager.save(Cart, existingUserItem);

        // Mark guest item as inactive
        guestItem.isActive = false;
        await manager.save(Cart, guestItem);
      } else {
        // Create new cart item for user
        const newCartItem = this.cartRepository.create({
          userId: userId,
          productId: guestItem.productId,
          quantity: guestItem.quantity,
          price: guestItem.price,
          variants: guestItem.variants,
          isActive: true,
        });
        await manager.save(Cart, newCartItem);

        // Mark guest item as inactive
        guestItem.isActive = false;
        await manager.save(Cart, guestItem);
      }

      migratedCount++;
    }

    return migratedCount;
  }

  /**
   * Migrate orders from guest to user
   */
  private async migrateOrders(
    manager: any,
    guestId: string,
    userId: string
  ): Promise<number> {
    // Get all orders for the guest
    const guestOrders = await this.orderRepository.find({
      where: { guestId },
    });

    if (guestOrders.length === 0) {
      return 0;
    }

    let migratedCount = 0;

    for (const guestOrder of guestOrders) {
      // Update order to associate with user
      guestOrder.userId = userId;
      (guestOrder as any).guestId = null; // Clear guest ID
      await manager.save(Order, guestOrder);
      migratedCount++;
    }

    return migratedCount;
  }

  /**
   * Migrate addresses from guest orders to user's address book
   */
  private async migrateAddresses(
    manager: any,
    guestId: string,
    userId: string
  ): Promise<number> {
    // Get all orders for the guest to extract addresses
    const guestOrders = await this.orderRepository.find({
      where: { guestId },
    });

    if (guestOrders.length === 0) {
      return 0;
    }

    let migratedCount = 0;
    const processedAddresses = new Set(); // To avoid duplicates

    for (const order of guestOrders) {
      // Migrate shipping address
      if (
        order.shippingAddress &&
        !processedAddresses.has(this.getAddressKey(order.shippingAddress))
      ) {
        const shippingAddress = this.addressRepository.create({
          userId: userId,
          type: "shipping" as any,
          firstName: order.shippingAddress.firstName,
          lastName: order.shippingAddress.lastName,
          company: order.shippingAddress.company,
          addressLine1: order.shippingAddress.addressLine1,
          addressLine2: order.shippingAddress.addressLine2,
          city: order.shippingAddress.city,
          state: order.shippingAddress.state,
          postalCode: order.shippingAddress.postalCode,
          country: order.shippingAddress.country,
          phone: order.shippingAddress.phone,
          email: order.customerEmail,
          isDefault: false, // Don't set as default automatically
          status: "active" as any,
        });
        await manager.save(Address, shippingAddress);
        processedAddresses.add(this.getAddressKey(order.shippingAddress));
        migratedCount++;
      }

      // Migrate billing address if different from shipping
      if (
        order.billingAddress &&
        !processedAddresses.has(this.getAddressKey(order.billingAddress)) &&
        JSON.stringify(order.shippingAddress) !==
          JSON.stringify(order.billingAddress)
      ) {
        const billingAddress = this.addressRepository.create({
          userId: userId,
          type: "billing" as any,
          firstName: order.billingAddress.firstName,
          lastName: order.billingAddress.lastName,
          company: order.billingAddress.company,
          addressLine1: order.billingAddress.addressLine1,
          addressLine2: order.billingAddress.addressLine2,
          city: order.billingAddress.city,
          state: order.billingAddress.state,
          postalCode: order.billingAddress.postalCode,
          country: order.billingAddress.country,
          phone: order.billingAddress.phone,
          email: order.customerEmail,
          isDefault: false,
          status: "active" as any,
        });
        await manager.save(Address, billingAddress);
        processedAddresses.add(this.getAddressKey(order.billingAddress));
        migratedCount++;
      }
    }

    return migratedCount;
  }

  /**
   * Clear guest data after migration (optional)
   */
  private async clearGuestData(manager: any, guestId: string): Promise<void> {
    // Mark all guest cart items as inactive
    await manager.update(Cart, { guestId }, { isActive: false });

    // Note: We don't delete orders as they represent actual purchases
    // Guest ID is cleared from orders during migration
  }

  /**
   * Generate a unique key for address comparison
   */
  private getAddressKey(address: any): string {
    return `${address.firstName}-${address.lastName}-${address.addressLine1}-${address.city}-${address.state}-${address.postalCode}`;
  }

  /**
   * Check if guest has any data to migrate
   */
  async checkGuestData(guestId: string): Promise<{
    hasCartItems: boolean;
    hasOrders: boolean;
    cartItemCount: number;
    orderCount: number;
  }> {
    const [cartItems, orders] = await Promise.all([
      this.cartRepository.count({ where: { guestId, isActive: true } }),
      this.orderRepository.count({ where: { guestId } }),
    ]);

    return {
      hasCartItems: cartItems > 0,
      hasOrders: orders > 0,
      cartItemCount: cartItems,
      orderCount: orders,
    };
  }

  /**
   * Get guest order history for display during registration
   */
  async getGuestOrderHistory(guestId: string): Promise<any[]> {
    const orders = await this.orderRepository.find({
      where: { guestId },
      relations: ["items"],
      order: { createdAt: "DESC" },
    });

    return orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt,
      itemCount: order.items?.length || 0,
    }));
  }
}
