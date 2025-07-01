import { Request, Response } from 'express';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { Product } from '../products/entities/product.entity';
import { Attribute } from '../attributes/entities/attribute.entity';
import { AttributeValue } from '../attributes/entities/attribute-value.entity';
import { CartService } from './cart.service';
import { v4 as uuidv4 } from 'uuid';
import { GetCartQueryDto } from './dto/get-cart-query.dto';

export function cartController(
  cartRepository: Repository<Cart>,
  productRepository: Repository<Product>,
  attributeRepository: Repository<Attribute>,
  attributeValueRepository: Repository<AttributeValue>
) {
  const cartService = new CartService(cartRepository, productRepository, attributeRepository, attributeValueRepository);

  return {
    addToCart: async (req: Request, res: Response) => {
      try {
        const cartData = req.body;
        const user = req.user;

        const cartItem = await cartService.addToCart(cartData, user);
        
        // Return guestId in response if it was auto-generated
        const responseData = {
          ...cartItem,
          guestId: cartItem.guestId || null
        };
        
        res.status(201).json({
          message: 'Item added to cart successfully',
          requestId: uuidv4(),
          data: responseData,
          code: 0
        });
      } catch (error: any) {
        res.status(400).json({
          message: error.message,
          requestId: uuidv4(),
          data: null,
          code: 1
        });
      }
    },

    getCart: async (req: Request, res: Response) => {
      try {
        const query = req.query as unknown as GetCartQueryDto;
        const user = req.user;

        // If user is authenticated, use userId, otherwise use guestId from query
        if (user?.id) {
          query.userId = user.id;
        } else if (!query.guestId) {
          res.status(400).json({
            message: 'Guest ID is required for unauthenticated users',
            requestId: uuidv4(),
            data: null,
            code: 1
          });
          return;
        }

        const cart = await cartService.getCart(query);
        res.json({
          message: 'Cart retrieved successfully',
          requestId: uuidv4(),
          data: cart,
          code: 0
        });
      } catch (error: any) {
        res.status(500).json({
          message: error.message,
          requestId: uuidv4(),
          data: null,
          code: 1
        });
      }
    },

    updateCartItem: async (req: Request, res: Response) => {
      try {
        const updateData = req.body;
        const cartItem = await cartService.updateCartItem(req.params.id, updateData);
        res.json({
          message: 'Cart item updated successfully',
          requestId: uuidv4(),
          data: cartItem,
          code: 0
        });
      } catch (error: any) {
        res.status(400).json({
          message: error.message,
          requestId: uuidv4(),
          data: null,
          code: 1
        });
      }
    },

    removeFromCart: async (req: Request, res: Response) => {
      try {
        await cartService.removeFromCart(req.params.id);
        res.json({
          message: 'Item removed from cart successfully',
          requestId: uuidv4(),
          data: null,
          code: 0
        });
      } catch (error: any) {
        res.status(400).json({
          message: error.message,
          requestId: uuidv4(),
          data: null,
          code: 1
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
            message: 'Guest ID is required for unauthenticated users',
            requestId: uuidv4(),
            data: null,
            code: 1
          });
          return;
        }

        res.json({
          message: 'Cart cleared successfully',
          requestId: uuidv4(),
          data: null,
          code: 0
        });
      } catch (error: any) {
        res.status(400).json({
          message: error.message,
          requestId: uuidv4(),
          data: null,
          code: 1
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
            message: 'Guest ID is required for unauthenticated users',
            requestId: uuidv4(),
            data: null,
            code: 1
          });
          return;
        }

        res.json({
          message: 'Cart summary retrieved successfully',
          requestId: uuidv4(),
          data: summary,
          code: 0
        });
      } catch (error: any) {
        res.status(500).json({
          message: error.message,
          requestId: uuidv4(),
          data: null,
          code: 1
        });
      }
    }
  };
} 