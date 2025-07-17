import { Request, Response } from "express";
import { Repository } from "typeorm";
import { Cart } from "./entities/cart.entity";
import { Product } from "../products/entities/product.entity";
import { Attribute } from "../attributes/entities/attribute.entity";
import { AttributeValue } from "../attributes/entities/attribute-value.entity";
import { CartService } from "./cart.service";
import { GetCartQueryDto } from "./dto/get-cart-query.dto";
import { cuid } from "../../libs/cuid";
import { getUserProfile } from "../user/user.service";

export function cartController(
  cartRepository: Repository<Cart>,
  productRepository: Repository<Product>,
  attributeRepository: Repository<Attribute>,
  attributeValueRepository: Repository<AttributeValue>
) {
  const cartService = new CartService(
    cartRepository,
    productRepository,
    attributeRepository,
    attributeValueRepository
  );

  return {
    addToCart: async (req: Request, res: Response) => {
      try {
        const cartData = req.body;
        let user = req.user;

        // If userId is provided in body, find the user and use it
        if (cartData.userId) {
          try {
            const foundUser = await getUserProfile(cartData.userId);
            user = {
              id: foundUser.id,
              roles: foundUser.roles,
              type: foundUser.type,
              firstName: foundUser.firstName,
              lastName: foundUser.lastName,
              userName: foundUser.email, // fallback, as userName is not in UserResponseDto
              email: foundUser.email,
              password: '', // not available
              phone: foundUser.phone,
              emailVerified: foundUser.emailVerified,
              isActive: true,
              createdAt: foundUser.createdAt,
              updatedAt: foundUser.updatedAt,
              hashPassword: async () => {},
              comparePassword: async () => true,
            } as any;
          } catch (err) {
            res.status(400).json({
              message: "User not found for provided userId",
              requestId: cuid(),
              data: null,
              code: 1,
            });
            return;
          }
        }

        const cartItem = await cartService.addToCart(cartData, user as any);

        // Return guestId in response if it was auto-generated
        const responseData = {
          ...cartItem,
          guestId: cartItem.guestId || null,
        };

        res.status(201).json({
          message: "Item added to cart successfully",
          requestId: cuid(),
          data: responseData,
          code: 0,
        });
      } catch (error: any) {
        res.status(400).json({
          message: error.message,
          requestId: cuid(),
          data: null,
          code: 1,
        });
      }
    },

    getCart: async (req: Request, res: Response) => {
      try {
        const query = req.query as unknown as GetCartQueryDto;
        let user = req.user;

        // If userId is provided in query, find the user and use it
        if (query.userId) {
          try {
            const foundUser = await getUserProfile(query.userId);
            user = {
              id: foundUser.id,
              roles: foundUser.roles,
              type: foundUser.type,
              firstName: foundUser.firstName,
              lastName: foundUser.lastName,
              userName: foundUser.email, // fallback, as userName is not in UserResponseDto
              email: foundUser.email,
              password: '', // not available
              phone: foundUser.phone,
              emailVerified: foundUser.emailVerified,
              isActive: true,
              createdAt: foundUser.createdAt,
              updatedAt: foundUser.updatedAt,
              hashPassword: async () => {},
              comparePassword: async () => true,
            } as any;
            query.userId = foundUser.id;
          } catch (err) {
            res.status(400).json({
              message: "User not found for provided userId",
              requestId: cuid(),
              data: null,
              code: 1,
            });
            return;
          }
        }

        // If user is authenticated, use userId, otherwise use guestId from query
        if (user?.id) {
          query.userId = user.id;
        } else if (!query.guestId) {
          res.status(400).json({
            message: "Guest ID is required for unauthenticated users",
            requestId: cuid(),
            data: null,
            code: 1,
          });
          return;
        }

        const cart = await cartService.getCart(query);
        res.json({
          message: "Cart retrieved successfully",
          requestId: cuid(),
          data: cart,
          code: 0,
        });
      } catch (error: any) {
        res.status(500).json({
          message: error.message,
          requestId: cuid(),
          data: null,
          code: 1,
        });
      }
    },

    updateCartItem: async (req: Request, res: Response) => {
      try {
        const updateData = req.body;
        let user = req.user;

        // If userId is provided in body, find the user and use it
        if (updateData.userId) {
          try {
            const foundUser = await getUserProfile(updateData.userId);
            user = {
              id: foundUser.id,
              roles: foundUser.roles,
              type: foundUser.type,
              firstName: foundUser.firstName,
              lastName: foundUser.lastName,
              userName: foundUser.email, // fallback, as userName is not in UserResponseDto
              email: foundUser.email,
              password: '', // not available
              phone: foundUser.phone,
              emailVerified: foundUser.emailVerified,
              isActive: true,
              createdAt: foundUser.createdAt,
              updatedAt: foundUser.updatedAt,
              hashPassword: async () => {},
              comparePassword: async () => true,
            } as any;
          } catch (err) {
            res.status(400).json({
              message: "User not found for provided userId",
              requestId: cuid(),
              data: null,
              code: 1,
            });
            return;
          }
        }

        const cartItem = await cartService.updateCartItem(
          req.params.id,
          updateData,
          user as any
        );
        res.json({
          message: "Cart item updated successfully",
          requestId: cuid(),
          data: cartItem,
          code: 0,
        });
      } catch (error: any) {
        res.status(400).json({
          message: error.message,
          requestId: cuid(),
          data: null,
          code: 1,
        });
      }
    },

    removeFromCart: async (req: Request, res: Response) => {
      try {
        await cartService.removeFromCart(req.params.id);
        res.json({
          message: "Item removed from cart successfully",
          requestId: cuid(),
          data: null,
          code: 0,
        });
      } catch (error: any) {
        res.status(400).json({
          message: error.message,
          requestId: cuid(),
          data: null,
          code: 1,
        });
      }
    },

    clearCart: async (req: Request, res: Response) => {
      try {
        const user = req.user;
        const { guestId } = req.query;

        if (user?.id) {
          await cartService.clearCart(undefined, user.id);
        } else if (guestId) {
          await cartService.clearCart(guestId as string);
        } else {
          res.status(400).json({
            message: "Guest ID is required for unauthenticated users",
            requestId: cuid(),
            data: null,
            code: 1,
          });
          return;
        }

        res.json({
          message: "Cart cleared successfully",
          requestId: cuid(),
          data: null,
          code: 0,
        });
      } catch (error: any) {
        res.status(400).json({
          message: error.message,
          requestId: cuid(),
          data: null,
          code: 1,
        });
      }
    },

    getCartSummary: async (req: Request, res: Response) => {
      try {
        const user = req.user;
        const { guestId } = req.query;

        let summary;
        if (user?.id) {
          summary = await cartService.getCartSummary(undefined, user.id);
        } else if (guestId) {
          summary = await cartService.getCartSummary(guestId as string);
        } else {
          res.status(400).json({
            message: "Guest ID is required for unauthenticated users",
            requestId: cuid(),
            data: null,
            code: 1,
          });
          return;
        }

        res.json({
          message: "Cart summary retrieved successfully",
          requestId: cuid(),
          data: summary,
          code: 0,
        });
      } catch (error: any) {
        res.status(500).json({
          message: error.message,
          requestId: cuid(),
          data: null,
          code: 1,
        });
      }
    },

    getCartForCouponValidation: async (req: Request, res: Response) => {
      try {
        const user = req.user;
        const { guestId } = req.query;

        let cartItems;
        if (user?.id) {
          cartItems = await cartService.getCartForCouponValidation(undefined, user.id);
        } else if (guestId) {
          cartItems = await cartService.getCartForCouponValidation(guestId as string);
        } else {
          res.status(400).json({
            message: "Guest ID is required for unauthenticated users",
            requestId: cuid(),
            data: null,
            code: 1,
          });
          return;
        }

        res.json({
          message: "Cart items for coupon validation retrieved successfully",
          requestId: cuid(),
          data: cartItems,
          code: 0,
        });
      } catch (error: any) {
        res.status(500).json({
          message: error.message,
          requestId: cuid(),
          data: null,
          code: 1,
        });
      }
    },
  };
}
