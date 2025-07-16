import { Repository } from "typeorm";
import { Cart } from "./entities/cart.entity";
import { Product } from "../products/entities/product.entity";
import { Attribute } from "../attributes/entities/attribute.entity";
import { AttributeValue } from "../attributes/entities/attribute-value.entity";
import { AddToCartDto } from "./dto/add-to-cart.dto";
import { UpdateCartDto } from "./dto/update-cart.dto";
import { CartResponseDto } from "./dto/cart-response.dto";
import { GetCartQueryDto } from "./dto/get-cart-query.dto";
import { PaginatedResponseDto } from "../../common/dto/paginated-response.dto";
import { cuid } from "../../libs/cuid";
import { cacheService } from "../../common/services/cache.service";

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

  private async toCartResponse(
    cart: any,
    includeProduct: boolean = false
  ): Promise<CartResponseDto> {
    if (includeProduct) {
      return { ...cart };
    } else {
      const { product, ...cartWithoutProduct } = cart;
      return { ...cartWithoutProduct };
    }
  }

  private async validateVariants(
    productId: string,
    variants?: any[]
  ): Promise<{
    isValid: boolean;
    message?: string;
    variantPrice?: number;
    variantQuantity?: number | undefined;
  }> {
    if (!variants || variants.length === 0) {
      return { isValid: true };
    }

    try {
      // Get product attributes
      const productAttributes = await this.attributeRepository.find({
        where: { productId },
        relations: ["values"],
      });

      if (productAttributes.length === 0) {
        return { isValid: false, message: "Product has no attributes defined" };
      }

      let selectedVariantPrice: number | undefined = undefined;
      let variantQuantity: number | undefined = undefined;

      for (const variant of variants) {
        // Check if attribute exists for this product
        const attribute = productAttributes.find(
          (attr) => attr.id === variant.attributeId
        );
        if (!attribute) {
          return {
            isValid: false,
            message: `Attribute '${variant.attributeName}' does not exist for this product`,
          };
        }

        // Check if attribute value exists
        const attributeValue = attribute.values.find(
          (val) => val.id === variant.attributeValueId
        );
        if (!attributeValue) {
          return {
            isValid: false,
            message: `Value '${variant.attributeValue}' does not exist for attribute '${variant.attributeName}'`,
          };
        }

        // Check if variant name matches
        if (attribute.name !== variant.attributeName) {
          return {
            isValid: false,
            message: `Attribute name mismatch. Expected: '${attribute.name}', Received: '${variant.attributeName}'`,
          };
        }

        // Check if variant value matches
        if (attributeValue.variant !== variant.attributeValue) {
          return {
            isValid: false,
            message: `Attribute value mismatch. Expected: '${attributeValue.variant}', Received: '${variant.attributeValue}'`,
          };
        }

        // Use the price of the selected variant (attribute value)
        if (attributeValue.price) {
          selectedVariantPrice = Number(attributeValue.price);
        }

        // Set variant quantity if available
        if (
          attributeValue.quantity !== null &&
          attributeValue.quantity !== undefined
        ) {
          if (variantQuantity === undefined) {
            variantQuantity = attributeValue.quantity;
          } else {
            variantQuantity = Math.min(
              variantQuantity,
              attributeValue.quantity
            );
          }
        }
      }

      return {
        isValid: true,
        variantPrice: selectedVariantPrice,
        variantQuantity,
      };
    } catch (error) {
      return { isValid: false, message: "Error validating variants" };
    }
  }

  async addToCart(data: AddToCartDto, user?: any): Promise<CartResponseDto> {
    try {
      // Check if product exists
      const product = await this.productRepository.findOne({
        where: { id: data.productId },
      });
      if (!product) {
        throw new Error("Product not found");
      }

      // Validate variants if provided
      const variantValidation = await this.validateVariants(
        data.productId,
        data.variants
      );
      if (!variantValidation.isValid) {
        throw new Error(variantValidation.message || "Invalid variants");
      }

      // Check variant quantity if product has variants
      if (
        data.variants &&
        data.variants.length > 0 &&
        variantValidation.variantQuantity !== undefined
      ) {
        const requestedQuantity = data.quantity || 1;
        if (requestedQuantity > variantValidation.variantQuantity) {
          throw new Error(
            `Insufficient stock. Available: ${variantValidation.variantQuantity}, Requested: ${requestedQuantity}`
          );
        }
      }

      // Auto-generate guestId if not provided and user is not logged in
      // Auto-save userId if user is logged in
      const userId = user?.id || null;
      const guestId = user ? null : data.guestId || cuid();

      // Calculate final price (unit price)
      let finalPrice: number;
      if (data.variants && data.variants.length > 0) {
        // For variant products, use the selected variant's price
        finalPrice = Number(variantValidation.variantPrice || 0);
      } else {
        // For non-variant products, use the product's price
        if (data.price) {
          finalPrice = Number(data.price);
        } else if (Number(product.salePrice) > 0) {
          finalPrice = Number(product.salePrice);
        } else {
          finalPrice = Number(product.regularPrice || 0);
        }
      }

      // Check if item already exists in cart (including variants)
      const whereCondition: any = {
        productId: data.productId,
        isActive: true,
      };

      if (userId) {
        whereCondition.userId = userId;
      } else {
        whereCondition.guestId = guestId;
      }

      const existingCartItems = await this.cartRepository.find({
        where: whereCondition,
      });

      // Find exact match including variants
      const existingCartItem = existingCartItems.find((item) => {
        const itemVariants = item.variants || [];
        const newVariants = data.variants || [];

        if (itemVariants.length !== newVariants.length) {
          return false;
        }

        // Check if variants match exactly
        return itemVariants.every((itemVariant: any) =>
          newVariants.some(
            (newVariant: any) =>
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
          existingCartItem.variants = data.variants as any;
        }
        existingCartItem.price = finalPrice;

        const updatedCart = await this.cartRepository.save(existingCartItem);
        return this.toCartResponse(updatedCart);
      }

      // Create new cart item
      const cartData = {
        guestId: guestId || undefined,
        userId: userId,
        productId: data.productId,
        quantity: data.quantity || 1,
        price: finalPrice,
        variants: data.variants || undefined,
        isActive: true,
      };

      const newCartItem = this.cartRepository.create(cartData);
      const savedCart = await this.cartRepository.save(newCartItem);
      return this.toCartResponse(savedCart);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async getCart(query: GetCartQueryDto): Promise<CartResponseDto[]> {
    try {
      const { guestId, userId } = query;

      if (!guestId && !userId) {
        throw new Error("Either guestId or userId is required");
      }

      const where: any = { isActive: true };
      if (guestId) where.guestId = guestId;
      if (userId) where.userId = userId;

      const cartItems = await this.cartRepository.find({
        where,
        order: { createdAt: "DESC" },
        relations: ["product", "product.thumbnailImg"],
      });

      const formattedCartItems = cartItems.map((item: any) => ({
        ...item,
        variants: item.variants
          ? item.variants.map((variant: any) => ({
              attributeId: variant.attributeId,
              attributeValueId: variant.attributeValueId,
              attributeName: variant.attributeName,
              attributeValue: variant.attributeValue,
            }))
          : undefined,
        product: item.product
          ? {
              id: item.product.id,
              name: item.product.name,
              slug: item.product.slug,
              shortDescription: item.product.shortDescription,
              longDescription: item.product.longDescription,
              regularPrice: item.product.regularPrice,
              salePrice: item.product.salePrice,
              thumbnailImgId: item.product.thumbnailImgId,
              thumbnailImg: item.product.thumbnailImg || null,
              photosIds: item.product.photosIds,
              stock: item.product.stock,
              published: item.product.published,
              approved: item.product.approved,
            }
          : null,
      }));

      return formattedCartItems;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async updateCartItem(
    id: string,
    data: UpdateCartDto,
    user?: any
  ): Promise<CartResponseDto> {
    try {
      const cartItem = await this.cartRepository.findOne({ where: { id } });
      if (!cartItem) {
        throw new Error("Cart item not found");
      }

      // Validate variants if provided
      if (data.variants) {
        const variantValidation = await this.validateVariants(
          cartItem.productId,
          data.variants
        );
        if (!variantValidation.isValid) {
          throw new Error(variantValidation.message || "Invalid variants");
        }

        // Check variant quantity if product has variants
        if (variantValidation.variantQuantity !== undefined) {
          const requestedQuantity = data.quantity || cartItem.quantity;
          if (requestedQuantity > variantValidation.variantQuantity) {
            throw new Error(
              `Insufficient stock. Available: ${variantValidation.variantQuantity}, Requested: ${requestedQuantity}`
            );
          }
        }

        // Calculate new price with variants
        const product = await this.productRepository.findOne({
          where: { id: cartItem.productId },
        });
        if (product) {
          let finalPrice: number;
          if (data.variants && data.variants.length > 0) {
            finalPrice = Number(variantValidation.variantPrice || 0);
          } else {
            finalPrice = Number(
              data.price || product.salePrice || product.regularPrice || 0
            );
          }
          cartItem.price = finalPrice;
        }
      }

      if (data.quantity !== undefined) {
        cartItem.quantity = data.quantity;
      }
      if (data.variants !== undefined) {
        cartItem.variants = data.variants as any;
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
        throw new Error("Cart item not found");
      }

      // Check if this is the last active cart item for this user/guest
      const whereCondition: any = { isActive: true };
      if (cartItem.userId) {
        whereCondition.userId = cartItem.userId;
      } else if (cartItem.guestId) {
        whereCondition.guestId = cartItem.guestId;
      }

      const activeCartItems = await this.cartRepository.find({
        where: whereCondition,
      });

      // If this is the last item, delete it from database
      if (activeCartItems.length === 1 && activeCartItems[0].id === id) {
        await this.cartRepository.remove(cartItem);
      } else {
        // Otherwise, just mark it as inactive
        cartItem.isActive = false;
        await this.cartRepository.save(cartItem);
      }
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async clearCart(guestId?: string, userId?: string): Promise<void> {
    try {
      if (!guestId && !userId) {
        throw new Error("Either guestId or userId is required");
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

      // Invalidate cart cache
      if (userId) {
        await cacheService.deletePattern(`cart:user:${userId}:*`);
      } else if (guestId) {
        await cacheService.deletePattern(`cart:guest:${guestId}:*`);
      }
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async getCartSummary(guestId?: string, userId?: string): Promise<any> {
    try {
      if (!guestId && !userId) {
        throw new Error("Either guestId or userId is required");
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

  async getCartForCouponValidation(
    guestId?: string,
    userId?: string
  ): Promise<any[]> {
    try {
      if (!guestId && !userId) {
        throw new Error("Either guestId or userId is required");
      }

      const where: any = { isActive: true };
      if (guestId) where.guestId = guestId;
      if (userId) where.userId = userId;

      const cartItems = await this.cartRepository.find({
        where,
        relations: ["product", "product.categories"],
      });

      return cartItems.map((item) => ({
        productId: item.productId,
        categoryId: item.product?.categories?.[0]?.id || null, // Take first category
        quantity: item.quantity,
        unitPrice: item.price,
        totalPrice: item.price * item.quantity,
        product: item.product,
      }));
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}
