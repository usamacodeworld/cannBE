import { Repository, Raw, In } from "typeorm";
import { Product } from "./entities/product.entity";
import { Category } from "../category/category.entity";
import { Attribute } from "../attributes/entities/attribute.entity";
import { AttributeValue } from "../attributes/entities/attribute-value.entity";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { ProductResponseDto } from "./dto/product-response.dto";
import { cuid } from "../../libs/cuid";
import { GetProductsQueryDto } from "./dto/get-products-query.dto";
import { PaginatedResponseDto } from "../../common/dto/paginated-response.dto";
import slugify from "slug";
import { MediaFile } from "../media/media-file.entity";

export class ProductService {
  private productRepository: Repository<Product>;
  private attributeRepository: Repository<Attribute>;
  private attributeValueRepository: Repository<AttributeValue>;
  private categoryRepository: Repository<Category>;
  private mediaRepository: Repository<MediaFile>;

  constructor(
    productRepository: Repository<Product>,
    attributeRepository: Repository<Attribute>,
    attributeValueRepository: Repository<AttributeValue>,
    categoryRepository: Repository<Category>,
    mediaRepository: Repository<MediaFile>
  ) {
    this.productRepository = productRepository;
    this.attributeRepository = attributeRepository;
    this.attributeValueRepository = attributeValueRepository;
    this.categoryRepository = categoryRepository;
    this.mediaRepository = mediaRepository;
  }

  private async toProductResponse(
    product: any,
    includeRelations: boolean = false
  ): Promise<ProductResponseDto> {
    if (includeRelations) {
      return { ...product };
    } else {
      const { categories, photos, variations, ...productWithoutRelations } =
        product;
      return { ...productWithoutRelations };
    }
  }

  private async generateUniqueSlug(slug: string): Promise<string> {
    let uniqueSlug = slug;
    const existingProduct = await this.productRepository.query(
      "SELECT id FROM products WHERE slug = $1",
      [uniqueSlug]
    );
    while (existingProduct && existingProduct.length > 0) {
      uniqueSlug = `${slug}-${cuid().slice(-4)}`;
      const checkProduct = await this.productRepository.query(
        "SELECT id FROM products WHERE slug = $1",
        [uniqueSlug]
      );
      if (!checkProduct || checkProduct.length === 0) break;
    }
    return uniqueSlug;
  }

  async createProduct(
    data: CreateProductDto,
    user: any,
    slug: string
  ): Promise<ProductResponseDto> {
    try {
      // Generate unique slug
      const uniqueSlug = await this.generateUniqueSlug(slug);

      // Extract data for processing
      const {
        variations,
        thumbnailBase64,
        photosBase64,
        categoryIds,
        ...productData
      } = data;

      // Fetch categories by IDs
      let categories: Category[] = [];
      if (categoryIds && categoryIds.length > 0) {
        categories = await this.categoryRepository.find({
          where: { id: In(categoryIds) },
        });
        if (categories.length !== categoryIds.length) {
          throw new Error("Some category IDs do not exist");
        }
      }

      // Create product entity
      const product = this.productRepository.create({
        addedBy:
          user.roles && user.roles.length > 0 ? user.roles[0].name : "user",
        userId: user.id,
        name: productData.name,
        slug: uniqueSlug,
        photosIds: productData.photosIds ?? [],
        thumbnailImgId: productData.thumbnailImgId,
        tags: productData.tags || [],
        shortDescription: productData.shortDescription,
        longDescription: productData.longDescription,
        regularPrice: productData.regularPrice,
        salePrice: productData.salePrice,
        isVariant: productData.isVariant || false,
        published: productData.published || false,
        approved: productData.approved || false,
        stock: productData.stock,
        cashOnDelivery: productData.cashOnDelivery || false,
        featured: productData.featured || false,
        discount: productData.discount,
        discountType: productData.discountType,
        discountStartDate: productData.discountStartDate,
        discountEndDate: productData.discountEndDate,
        tax: productData.tax,
        taxType: productData.taxType,
        shippingType: productData.shippingType,
        shippingCost: productData.shippingCost,
        estShippingDays: productData.estShippingDays,
        numOfSales: productData.numOfSales,
        metaTitle: productData.metaTitle,
        metaDescription: productData.metaDescription,
        rating: productData.rating,
        externalLink: productData.externalLink,
        externalLinkBtn: productData.externalLinkBtn,
        categories,
      });

      // Save the product
      const savedProduct = await this.productRepository.save(product);

      // Handle variations if provided
      if (variations && Array.isArray(variations)) {
        await this.createProductVariations(savedProduct.id, variations);
      }

      // Return the complete product with relations
      const finalProduct = await this.findOne(savedProduct.id);
      return await this.toProductResponse(finalProduct);
    } catch (error) {
      console.error("Error creating product:", error);
      throw error;
    }
  }

  private async validateCategories(categoryIds: string[]): Promise<void> {
    try {
      const categories = await this.categoryRepository.find({
        where: { id: In(categoryIds) },
      });
      if (categories.length !== categoryIds.length) {
        throw new Error("Some category IDs do not exist");
      }
      console.log(`Validated ${categories.length} categories for product`);
    } catch (error) {
      console.log("Error validating categories:", error);
      throw new Error("Invalid category IDs provided");
    }
  }

  private async createProductVariations(
    productId: string,
    variations: Array<{
      name: string;
      variant: string;
      sku: string;
      price: number;
      quantity: number;
      imageId?: string;
    }>
  ): Promise<void> {
    console.log("=== Processing Variations and Attributes ===");
    console.log("Total variations:", variations.length);

    // Group variations by attribute name
    const attributeGroups = new Map<string, typeof variations>();
    for (const variation of variations) {
      if (!variation.name) {
        throw new Error("Variation name is required");
      }

      if (!attributeGroups.has(variation.name)) {
        attributeGroups.set(variation.name, []);
      }
      attributeGroups.get(variation.name)!.push(variation);
    }

    // Create attributes and their values
    for (const [attributeName, attributeVariations] of attributeGroups) {
      console.log(
        `Processing attribute: ${attributeName} with ${attributeVariations.length} variations`
      );

      // Create or find attribute
      let attribute = await this.attributeRepository.findOne({
        where: { name: attributeName, productId },
      });

      if (!attribute) {
        attribute = this.attributeRepository.create({
          name: attributeName,
          productId,
        });
        await this.attributeRepository.save(attribute);
      }

      // Create attribute values
      for (const variation of attributeVariations) {
        console.log(
          `Creating attribute value: ${variation.variant} for ${attributeName}`
        );

        const attributeValue = this.attributeValueRepository.create({
          attribute: attribute,
          variant: variation.variant,
          sku: variation.sku,
          price: variation.price,
          quantity: variation.quantity,
          imageId: variation.imageId,
        });

        await this.attributeValueRepository.save(attributeValue);
      }
    }
  }

  async findAll(
    query: GetProductsQueryDto
  ): Promise<PaginatedResponseDto<any>> {
    const {
      page = 1,
      limit = 10,
      sort = "updatedAt",
      order = "desc",
      filters = {},
    } = query;
    const skip = (page - 1) * limit;
    const {
      search,
      categoryId,
      categoryIds,
      isVariant,
      published,
      featured,
      minPrice,
      maxPrice,
    } = filters;

    try {
      // Build query builder
      const queryBuilder = this.productRepository.createQueryBuilder("product");

      // Add filters
      if (isVariant !== undefined) {
        queryBuilder.andWhere("product.isVariant = :isVariant", { isVariant });
      }

      if (published !== undefined) {
        queryBuilder.andWhere("product.published = :published", { published });
      }

      if (featured !== undefined) {
        queryBuilder.andWhere("product.featured = :featured", { featured });
      }

      if (minPrice !== undefined && maxPrice !== undefined) {
        queryBuilder.andWhere(
          "product.salePrice BETWEEN :minPrice AND :maxPrice",
          {
            minPrice,
            maxPrice,
          }
        );
      }

      if (search) {
        const searchTerm = `%${search}%`;
        queryBuilder.andWhere(
          "(product.name ILIKE :search OR product.slug ILIKE :search OR product.shortDescription ILIKE :search OR product.longDescription ILIKE :search)",
          { search: searchTerm }
        );
      }

      if (categoryIds && categoryIds.length > 0) {
        queryBuilder.andWhere(
          "product.categoryIds && ARRAY[:...categoryIds]::text[]",
          {
            categoryIds,
          }
        );
      } else if (categoryId) {
        queryBuilder.andWhere(
          "product.categoryIds && ARRAY[:categoryId]::text[]",
          {
            categoryId,
          }
        );
      }

      // Add ordering
      queryBuilder.orderBy(
        `product.${sort}`,
        order.toUpperCase() as "ASC" | "DESC"
      );

      // Get total count
      const total = await queryBuilder.getCount();

      // Add pagination
      queryBuilder.skip(skip).take(limit);

      // Execute query
      const products = await queryBuilder.getMany();

      // Enhance products with thumbnail images
      const productDtos = await Promise.all(
        products.map(async (product: any) => {
          let thumbnailImg = undefined;
          if (product.thumbnailImgId) {
            try {
              thumbnailImg = await this.mediaRepository.findOne({
                where: { id: product.thumbnailImgId },
              });
            } catch (error) {
              console.log(
                "Error fetching thumbnail for product:",
                product.id,
                error
              );
            }
          }

          return {
            ...product,
            thumbnailImg,
          };
        })
      );

      return {
        data: productDtos,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error("Error in findAll:", error);
      throw error;
    }
  }

  async findOne(id: string): Promise<ProductResponseDto> {
    try {
      // Find the product
      const product = await this.productRepository.findOne({
        where: { id },
      });

      if (!product) {
        throw new Error("Product not found");
      }

      // Fetch categories if categoryIds exist
      let categories: Category[] = [];
      if (product.categories && product.categories.length > 0) {
        try {
          categories = await this.categoryRepository.find({
            where: {
              id: In(product.categories.map((category) => category.id)),
            },
          });
        } catch (error) {
          console.log("Error fetching categories for product:", id, error);
        }
      }

      // Fetch thumbnail image
      let thumbnailImg = undefined;
      if (product.thumbnailImgId) {
        try {
          thumbnailImg = await this.mediaRepository.findOne({
            where: { id: product.thumbnailImgId },
          });
        } catch (error) {
          console.log("Error fetching thumbnail for product:", id, error);
        }
      }

      // Fetch photos
      let photos: MediaFile[] = [];
      if (product.photosIds && product.photosIds.length > 0) {
        try {
          photos = await this.mediaRepository.find({
            where: { id: In(product.photosIds) },
          });
        } catch (error) {
          console.log("Error fetching photos for product:", id, error);
        }
      }

      // Fetch variations using TypeORM relations
      let variations: any[] = [];
      try {
        const attributes = await this.attributeRepository.find({
          where: { productId: id },
          relations: ["values", "values.image"],
        });

        for (const attribute of attributes) {
          for (const value of attribute.values) {
            variations.push({
              name: attribute.name,
              variant: value.variant,
              sku: value.sku,
              price: value.price,
              quantity: value.quantity,
              imageId: value.imageId,
              image: value.image,
            });
          }
        }

        console.log("=== Debug: Final variations array ===");
        console.log("Total variations:", variations.length);
        variations.forEach((variation: any, index: number) => {
          console.log(`Variation ${index + 1}:`, variation);
        });
      } catch (error) {
        console.log("Error fetching variations for product:", id, error);
      }

      const productWithRelations = {
        ...product,
        categories,
        thumbnailImg,
        photos,
        variations,
      };

      return await this.toProductResponse(productWithRelations, true);
    } catch (error) {
      console.error("Error in findOne:", error);
      throw error;
    }
  }

  async updateProduct(
    id: string,
    data: UpdateProductDto
  ): Promise<ProductResponseDto> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ["categories"],
    });
    if (!product) {
      throw new Error("Product not found");
    }

    // If categoryIds is present in data, update categories relation
    if (data.categoryIds && Array.isArray(data.categoryIds)) {
      const categories = await this.categoryRepository.find({
        where: { id: In(data.categoryIds) },
      });
      if (categories.length !== data.categoryIds.length) {
        throw new Error("Some category IDs do not exist");
      }
      product.categories = categories;
    }

    // Update other fields
    Object.assign(product, data);

    const updatedProduct = await this.productRepository.save(product);
    return this.toProductResponse(updatedProduct);
  }

  private async updateProductVariations(
    productId: string,
    variations: Array<{
      name: string;
      variant: string;
      sku: string;
      price: number;
      quantity: number;
      imageId?: string;
    }>
  ): Promise<void> {
    console.log("=== Processing Variations and Attributes for Update ===");
    console.log("Total variations:", variations.length);

    // Clear existing variations
    console.log("Clearing existing variations...");
    const existingAttributes = await this.attributeRepository.find({
      where: { productId },
    });

    if (existingAttributes.length > 0) {
      // Delete attribute values first (due to foreign key constraint)
      for (const attribute of existingAttributes) {
        await this.attributeValueRepository.delete({
          attribute: { id: attribute.id },
        });
      }

      // Then delete attributes
      await this.attributeRepository.delete({ productId });

      console.log(
        `Cleared ${existingAttributes.length} existing attributes and their values`
      );
    }

    // Create new variations
    await this.createProductVariations(productId, variations);
  }

  async removeProduct(id: string): Promise<void> {
    // Find the product
    const product = await this.productRepository.findOne({
      where: { id },
    });

    if (!product) {
      throw new Error("Product not found");
    }

    // Find all attributes for this product
    const attributes = await this.attributeRepository.find({
      where: { productId: id },
    });

    // Delete attribute values first (due to foreign key constraint)
    if (attributes.length > 0) {
      for (const attribute of attributes) {
        await this.attributeValueRepository.delete({
          attribute: { id: attribute.id },
        });
      }
    }

    // Delete attributes
    await this.attributeRepository.delete({ productId: id });

    // Delete the product
    await this.productRepository.delete({ id });
  }

  async findByCategoryId(
    categoryId: string,
    query: GetProductsQueryDto
  ): Promise<PaginatedResponseDto<ProductResponseDto>> {
    const {
      page = 1,
      limit = 10,
      sort = "updatedAt",
      order = "desc",
      filters = {},
    } = query;
    const skip = (page - 1) * limit;

    // Build where condition for category relation
    const where: any = {
      categories: { id: categoryId },
    };

    // Optionally add more filters (search, published, etc.)
    if (filters.search) {
      where.name =
        typeof filters.search === "string" ? filters.search : undefined;
    }
    if (filters.published !== undefined) {
      where.published = filters.published;
    }
    if (filters.featured !== undefined) {
      where.featured = filters.featured;
    }
    if (filters.isVariant !== undefined) {
      where.isVariant = filters.isVariant;
    }
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.regularPrice = {};
      if (filters.minPrice !== undefined)
        where.regularPrice["$gte"] = filters.minPrice;
      if (filters.maxPrice !== undefined)
        where.regularPrice["$lte"] = filters.maxPrice;
    }

    // Query products
    const [products, total] = await this.productRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: { [sort]: order },
      relations: ["categories", "thumbnailImg"],
    });

    const productDtos = await Promise.all(
      products.map((product) => this.toProductResponse(product))
    );

    return {
      data: productDtos,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
