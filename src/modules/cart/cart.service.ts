import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { Product } from '../products/entities/product.entity';
import { Attribute } from '../attributes/entities/attribute.entity';
import { AttributeValue } from '../attributes/entities/attribute-value.entity';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { CartResponseDto } from './dto/cart-response.dto';
import { GetCartQueryDto } from './dto/get-cart-query.dto';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { v4 as uuidv4 } from 'uuid';

export class CartService {
  private cartRepository: Repository<Cart>;
  private productRepository: Repository<Product>;
  private attributeRepository: Repository<Attribute>;
  private attributeValueRepository: Repository<AttributeValue>;

  constructor(
    cartRepository: Repository<Cart>,
    productRepository: Repository<Product>,
    attributeRepository: Repository<Attribute>,
    attributeValueRepository: Repository<AttributeValue>
  ) {
    this.cartRepository = cartRepository;
    this.productRepository = productRepository;
    this.attributeRepository = attributeRepository;
    this.attributeValueRepository = attributeValueRepository;
  }

  private async toCartResponse(cart: any, includeProduct: boolean = false): Promise<CartResponseDto> {
    if (includeProduct) {
      return { ...cart };
    } else {
      const { product, ...cartWithoutProduct } = cart;
      return { ...cartWithoutProduct };
    }
  }

  private async validateVariants(productId: string, variants?: any[]): Promise<{ isValid: boolean; message?: string; variantPrice?: number; variantQuantity?: number | undefined }> {
    if (!variants || variants.length === 0) {
      return { isValid: true };
    }

    try {
      // Get product attributes
      const productAttributes = await this.attributeRepository.find({
        where: { productId },
        relations: ['values']
      });

      if (productAttributes.length === 0) {
        return { isValid: false, message: 'Product has no attributes defined' };
      }

      let variantPrice = 0;
      let variantQuantity: number | undefined = undefined;

      for (const variant of variants) {
        // Check if attribute exists for this product
        const attribute = productAttributes.find(attr => attr.id === variant.attributeId);
        if (!attribute) {
          return { isValid: false, message: `Attribute '${variant.attributeName}' does not exist for this product` };
        }

        // Check if attribute value exists
        const attributeValue = attribute.values.find(val => val.id === variant.attributeValueId);
        if (!attributeValue) {
          return { isValid: false, message: `Value '${variant.attributeValue}' does not exist for attribute '${variant.attributeName}'` };
        }

        // Check if variant name matches
        if (attribute.name !== variant.attributeName) {
          return { isValid: false, message: `Attribute name mismatch. Expected: '${attribute.name}', Received: '${variant.attributeName}'` };
        }

        // Check if variant value matches
        if (attributeValue.variant !== variant.attributeValue) {
          return { isValid: false, message: `Attribute value mismatch. Expected: '${attributeValue.variant}', Received: '${variant.attributeValue}'` };
        }

        // Add variant price if available
        if (attributeValue.price) {
          variantPrice += Number(attributeValue.price);
        }

        // Set variant quantity if available
        if (attributeValue.quantity !== null && attributeValue.quantity !== undefined) {
          if (variantQuantity === undefined) {
            variantQuantity = attributeValue.quantity;
          } else {
            variantQuantity = Math.min(variantQuantity, attributeValue.quantity);
          }
        }
      }

      return { isValid: true, variantPrice, variantQuantity };
    } catch (error) {
      return { isValid: false, message: 'Error validating variants' };
    }
  }

  async addToCart(data: AddToCartDto, user?: any): Promise<CartResponseDto> {
    try {
      // Check if product exists
      const product = await this.productRepository.findOne({ where: { id: data.productId } });
      if (!product) {
        throw new Error('Product not found');
      }

      // Validate variants if provided
      const variantValidation = await this.validateVariants(data.productId, data.variants);
      if (!variantValidation.isValid) {
        throw new Error(variantValidation.message || 'Invalid variants');
      }

      // Check variant quantity if product has variants
      if (data.variants && data.variants.length > 0 && variantValidation.variantQuantity !== undefined) {
        const requestedQuantity = data.quantity || 1;
        if (requestedQuantity > variantValidation.variantQuantity) {
          throw new Error(`Insufficient stock. Available: ${variantValidation.variantQuantity}, Requested: ${requestedQuantity}`);
        }
      }

      // Auto-generate guestId if not provided and user is not logged in
      // Auto-save userId if user is logged in
      const userId = user?.id || null;
      const guestId = user ? null : (data.guestId || uuidv4());

      // Calculate final price (product price + variant price)
      const basePrice = Number(data.price || product.salePrice || product.regularPrice || 0);
      const variantPrice = Number(variantValidation.variantPrice || 0);
      const finalPrice = basePrice + variantPrice;

      // Check if item already exists in cart (including variants)
      const whereCondition: any = {
        productId: data.productId,
        isActive: true
      };
      
      if (userId) {
        whereCondition.userId = userId;
      } else {
        whereCondition.guestId = guestId;
      }
      
      const existingCartItems = await this.cartRepository.find({
        where: whereCondition
      });

      // Find exact match including variants
      const existingCartItem = existingCartItems.find(item => {
        const itemVariants = item.variants || [];
        const newVariants = data.variants || [];
        
        if (itemVariants.length !== newVariants.length) {
          return false;
        }
        
        // Check if variants match exactly
        return itemVariants.every((itemVariant: any) => 
          newVariants.some((newVariant: any) => 
            itemVariant.attributeId === newVariant.attributeId && 
            itemVariant.attributeValueId === newVariant.attributeValueId
          )
        );
      });

      if (existingCartItem) {
        // Update quantity if item already exists
        const newQuantity = existingCartItem.quantity + (data.quantity || 1);
        existingCartItem.quantity = newQuantity;
        if (data.variants) {
          existingCartItem.variants = data.variants;
        }
        existingCartItem.price = finalPrice;

        const updatedCart = await this.cartRepository.save(existingCartItem);
        return this.toCartResponse(updatedCart);
      }

      // Create new cart item
      const cartData = {
        guestId: guestId,
        userId: userId,
        productId: data.productId,
        quantity: data.quantity || 1,
        price: finalPrice,
        variants: data.variants || null,
        isActive: true
      };

      const insertQuery = `
        INSERT INTO carts (
          "guestId", "userId", "productId", quantity, price, 
          variants, "isActive", "createdAt", "updatedAt"
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9
        ) RETURNING *
      `;

      const insertParams = [
        cartData.guestId,
        cartData.userId,
        cartData.productId,
        cartData.quantity,
        cartData.price,
        cartData.variants ? JSON.stringify(cartData.variants) : null,
        cartData.isActive,
        new Date(),
        new Date()
      ];

      const savedCart = await this.cartRepository.query(insertQuery, insertParams);

      if (!savedCart || savedCart.length === 0) {
        throw new Error('Failed to add item to cart');
      }

      return this.toCartResponse(savedCart[0]);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async getCart(query: GetCartQueryDto): Promise<PaginatedResponseDto<CartResponseDto>> {
    try {
      const { guestId, userId } = query;

      if (!guestId && !userId) {
        throw new Error('Either guestId or userId is required');
      }

      let whereCondition = 'WHERE "isActive" = true';
      const params: any[] = [];
      let paramIndex = 1;

      if (guestId) {
        whereCondition += ` AND "guestId" = $${paramIndex}`;
        params.push(guestId);
        paramIndex++;
      }

      if (userId) {
        whereCondition += ` AND "userId" = $${paramIndex}`;
        params.push(userId);
        paramIndex++;
      }

      const queryString = `
        SELECT c.*, 
               p.id as "product_id",
               p.name as "product_name",
               p.slug as "product_slug",
               p."shortDescription" as "product_shortDescription",
               p."longDescription" as "product_longDescription",
               p."regularPrice" as "product_regularPrice",
               p."salePrice" as "product_salePrice",
               p."thumbnailImgId" as "product_thumbnailImgId",
               p."photosIds" as "product_photosIds",
               p.stock as "product_stock",
               p.published as "product_published",
               p.approved as "product_approved",
               mf.id as "thumbnail_id",
               mf.scope as "thumbnail_scope",
               mf.uri as "thumbnail_uri",
               mf.url as "thumbnail_url",
               mf."fileName" as "thumbnail_fileName",
               mf.mimetype as "thumbnail_mimetype",
               mf.size as "thumbnail_size",
               mf."userId" as "thumbnail_userId",
               mf."createdAt" as "thumbnail_createdAt",
               mf."updatedAt" as "thumbnail_updatedAt"
        FROM carts c
        LEFT JOIN products p ON c."productId" = p.id
        LEFT JOIN media_files mf ON p."thumbnailImgId" = mf.id
        ${whereCondition}
        ORDER BY c."createdAt" DESC
      `;

      const cartItems = await this.cartRepository.query(queryString, params);

      const formattedCartItems = cartItems.map((item: any) => ({
        id: item.id,
        guestId: item.guestId,
        userId: item.userId,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        variants: item.variants || undefined,
        isActive: item.isActive,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        product: item.product_id ? {
          id: item.product_id,
          name: item.product_name,
          slug: item.product_slug,
          shortDescription: item.product_shortDescription,
          longDescription: item.product_longDescription,
          regularPrice: item.product_regularPrice,
          salePrice: item.product_salePrice,
          thumbnailImgId: item.product_thumbnailImgId,
          thumbnailImg: item.thumbnail_id ? {
            id: item.thumbnail_id,
            scope: item.thumbnail_scope,
            uri: item.thumbnail_uri,
            url: item.thumbnail_url,
            fileName: item.thumbnail_fileName,
            mimetype: item.thumbnail_mimetype,
            size: item.thumbnail_size,
            userId: item.thumbnail_userId,
            createdAt: item.thumbnail_createdAt,
            updatedAt: item.thumbnail_updatedAt
          } : null,
          photosIds: item.product_photosIds,
          stock: item.product_stock,
          published: item.product_published,
          approved: item.product_approved
        } : null
      }));

      return {
        data: formattedCartItems,
        meta: {
          total: formattedCartItems.length,
          page: 1,
          limit: formattedCartItems.length,
          totalPages: 1
        }
      };
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async updateCartItem(id: string, data: UpdateCartDto): Promise<CartResponseDto> {
    try {
      const cartItem = await this.cartRepository.findOne({ where: { id } });
      if (!cartItem) {
        throw new Error('Cart item not found');
      }

      // Validate variants if provided
      if (data.variants) {
        const variantValidation = await this.validateVariants(cartItem.productId, data.variants);
        if (!variantValidation.isValid) {
          throw new Error(variantValidation.message || 'Invalid variants');
        }

        // Check variant quantity if product has variants
        if (variantValidation.variantQuantity !== undefined) {
          const requestedQuantity = data.quantity || cartItem.quantity;
          if (requestedQuantity > variantValidation.variantQuantity) {
            throw new Error(`Insufficient stock. Available: ${variantValidation.variantQuantity}, Requested: ${requestedQuantity}`);
          }
        }

        // Calculate new price with variants
        const product = await this.productRepository.findOne({ where: { id: cartItem.productId } });
        if (product) {
          const basePrice = Number(data.price || product.salePrice || product.regularPrice || 0);
          const variantPrice = Number(variantValidation.variantPrice || 0);
          const finalPrice = basePrice + variantPrice;
          cartItem.price = finalPrice;
        }
      }

      if (data.quantity !== undefined) {
        cartItem.quantity = data.quantity;
      }
      if (data.variants !== undefined) {
        cartItem.variants = data.variants;
      }
      if (data.price !== undefined && !data.variants) {
        cartItem.price = data.price;
      }

      const updatedCart = await this.cartRepository.save(cartItem);
      return this.toCartResponse(updatedCart);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async removeFromCart(id: string): Promise<void> {
    try {
      const cartItem = await this.cartRepository.findOne({ where: { id } });
      if (!cartItem) {
        throw new Error('Cart item not found');
      }

      cartItem.isActive = false;
      await this.cartRepository.save(cartItem);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async clearCart(guestId?: string, userId?: string): Promise<void> {
    try {
      if (!guestId && !userId) {
        throw new Error('Either guestId or userId is required');
      }

      let whereCondition = 'WHERE "isActive" = true';
      const params: any[] = [];
      let paramIndex = 1;

      if (guestId) {
        whereCondition += ` AND "guestId" = $${paramIndex}`;
        params.push(guestId);
        paramIndex++;
      }

      if (userId) {
        whereCondition += ` AND "userId" = $${paramIndex}`;
        params.push(userId);
        paramIndex++;
      }

      const updateQuery = `
        UPDATE carts 
        SET "isActive" = false, "updatedAt" = $${paramIndex}
        ${whereCondition}
      `;

      params.push(new Date());
      await this.cartRepository.query(updateQuery, params);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async getCartSummary(guestId?: string, userId?: string): Promise<any> {
    try {
      if (!guestId && !userId) {
        throw new Error('Either guestId or userId is required');
      }

      let whereCondition = 'WHERE c."isActive" = true';
      const params: any[] = [];
      let paramIndex = 1;

      if (guestId) {
        whereCondition += ` AND c."guestId" = $${paramIndex}`;
        params.push(guestId);
        paramIndex++;
      }

      if (userId) {
        whereCondition += ` AND c."userId" = $${paramIndex}`;
        params.push(userId);
        paramIndex++;
      }

      const summaryQuery = `
        SELECT 
          COUNT(c.id) as "totalItems",
          SUM(c.quantity) as "totalQuantity",
          SUM(c.quantity * c.price) as "totalAmount"
        FROM carts c
        ${whereCondition}
      `;

      const summary = await this.cartRepository.query(summaryQuery, params);
      return summary[0] || { totalItems: 0, totalQuantity: 0, totalAmount: 0 };
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}