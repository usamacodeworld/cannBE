import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { Category } from '../category/category.entity';
import { Attribute } from '../attributes/entities/attribute.entity';
import { AttributeValue } from '../attributes/entities/attribute-value.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { cuid } from '../../libs/cuid';
import { GetProductsQueryDto } from './dto/get-products-query.dto';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import slugify from 'slug';
import { s3Service } from '../../libs/s3';
import { MediaFile } from '../media/media-file.entity';

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

  private async toProductResponse(product: any, includeRelations: boolean = false): Promise<ProductResponseDto> {
    if (includeRelations) {
      return { ...product };
    } else {
      const { categories, photos, variations, ...productWithoutRelations } = product;
      return { ...productWithoutRelations };
    }
  }

  private async generateUniqueSlug(slug: string): Promise<string> {
    let uniqueSlug = slug;
    const existingProduct = await this.productRepository.query(
      'SELECT id FROM products WHERE slug = $1',
      [uniqueSlug]
    );
    while (existingProduct && existingProduct.length > 0) {
      uniqueSlug = `${slug}-${cuid().slice(-4)}`;
      const checkProduct = await this.productRepository.query(
        'SELECT id FROM products WHERE slug = $1',
        [uniqueSlug]
      );
      if (!checkProduct || checkProduct.length === 0) break;
    }
    return uniqueSlug;
  }

  private async handleImageUpload(
    file: Express.Multer.File | undefined,
    base64: string | undefined,
    folder: string,
    customFileName: string
  ): Promise<string | undefined> {
    if (file) {
      const result = await s3Service.uploadFile(file, folder, customFileName);
      return result.url;
    }
    if (base64) {
      const result = await s3Service.uploadBase64Image(base64, folder, customFileName);
      return result.url;
    }
    return undefined;
  }

  private async handleMultipleImageUploads(
    files: Express.Multer.File[] | undefined,
    base64s: string[] | undefined,
    folder: string,
    customFileNamePrefix: string
  ): Promise<string[]> {
    const urls: string[] = [];
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const url = await this.handleImageUpload(file, undefined, folder, `${customFileNamePrefix}-photo-${i}`);
        if (url) urls.push(url);
      }
    }
    if (base64s && base64s.length > 0) {
      for (let i = 0; i < base64s.length; i++) {
        const base64 = base64s[i];
        const url = await this.handleImageUpload(undefined, base64, folder, `${customFileNamePrefix}-photo-b64-${i}`);
        if (url) urls.push(url);
      }
    }
    return urls;
  }

  async createProduct(
    data: CreateProductDto,
    user: any,
    slug: string,
    thumbnailFile?: Express.Multer.File,
    photosFiles?: Express.Multer.File[],
    variantImageFiles?: Express.Multer.File[]
  ): Promise<ProductResponseDto> {
    try {
      const uniqueSlug = await this.generateUniqueSlug(slug);
      const { variations, thumbnailBase64, photosBase64, categoryIds, ...productData } = data;

      if (!productData.name) {
        throw new Error('Product name is required');
      }

      const thumbnailUrl = await this.handleImageUpload(
        thumbnailFile,
        thumbnailBase64,
        'products',
        `${uniqueSlug}-thumbnail`
      );
      if (thumbnailUrl) productData.thumbnailImgId = thumbnailUrl;

      const photosUrls = await this.handleMultipleImageUploads(
        Array.isArray(photosFiles) ? photosFiles : undefined,
        photosBase64,
        'products',
        uniqueSlug
      );
      if (photosUrls.length > 0) productData.photosIds = photosUrls;

      const insertQuery = `
        INSERT INTO products (
          "addedBy", "userId", name, slug, "photosIds", "thumbnailImgId", 
          "categoryIds", tags, "shortDescription", "longDescription", 
          "regularPrice", "salePrice", "isVariant", published, approved, 
          stock, "cashOnDelivery", featured, discount, "discountType", 
          "discountStartDate", "discountEndDate", tax, "taxType", 
          "shippingType", "shippingCost", "estShippingDays", "numOfSales", 
          "metaTitle", "metaDescription", rating, "externalLink", 
          "externalLinkBtn", "createdAt", "updatedAt"
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 
          $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, 
          $29, $30, $31, $32, $33, $34, $35
        ) RETURNING *
      `;

      const insertParams = [
        user.roles && user.roles.length > 0 ? user.roles[0].name : 'user',
        user.id,
        productData.name,
        uniqueSlug,
        productData.photosIds || [],
        productData.thumbnailImgId,
        categoryIds || [],
        productData.tags || [],
        productData.shortDescription,
        productData.longDescription,
        productData.regularPrice,
        productData.salePrice,
        productData.isVariant || false,
        productData.published || false,
        productData.approved || false,
        productData.stock,
        productData.cashOnDelivery || false,
        productData.featured || false,
        productData.discount,
        productData.discountType,
        productData.discountStartDate,
        productData.discountEndDate,
        productData.tax,
        productData.taxType,
        productData.shippingType,
        productData.shippingCost,
        productData.estShippingDays,
        productData.numOfSales,
        productData.metaTitle,
        productData.metaDescription,
        productData.rating,
        productData.externalLink,
        productData.externalLinkBtn,
        new Date(),
        new Date()
      ];

      const savedProduct = await this.productRepository.query(insertQuery, insertParams);

      if (!savedProduct || savedProduct.length === 0) {
        throw new Error('Failed to create product');
      }

      const product = savedProduct[0];

      if (categoryIds && categoryIds.length > 0) {
        try {
          const categoryIdList = categoryIds.map((id: string) => `'${id}'`).join(',');
          const categories = await this.categoryRepository.query(
            `SELECT c.*, mf.* FROM categories c 
             LEFT JOIN media_files mf ON c."thumbnailImageId" = mf.id 
             WHERE c.id IN (${categoryIdList})`
          );
          
          // Just validate that all category IDs exist
          if (categories.length !== categoryIds.length) {
            throw new Error('Some category IDs do not exist');
          }
          
          console.log(`Validated ${categories.length} categories for product`);
        } catch (error) {
          console.log('Error validating categories:', error);
          throw new Error('Invalid category IDs provided');
        }
      }

      if (variations && Array.isArray(variations)) {
        console.log('=== Processing Variations and Attributes ===');
        console.log('Total variations:', variations.length);
        
        const attributeGroups = new Map<string, any[]>();
        
        for (const v of variations) {
          if (!v.name) {
            throw new Error('Variation name is required');
          }
          
          if (!attributeGroups.has(v.name)) {
            attributeGroups.set(v.name, []);
          }
          attributeGroups.get(v.name)!.push(v);
        }
        
        for (const [attributeName, variations] of attributeGroups) {
          console.log(`Processing attribute: ${attributeName} with ${variations.length} variations`);
          
          let attribute = await this.attributeRepository.query(
            'SELECT * FROM attributes WHERE name = $1 AND "productId" = $2',
            [attributeName, product.id]
          );

          if (!attribute || attribute.length === 0) {
            const attributeInsertQuery = `
              INSERT INTO attributes (name, "productId", "createdAt", "updatedAt")
              VALUES ($1, $2, $3, $4)
              RETURNING *
            `;
            attribute = await this.attributeRepository.query(attributeInsertQuery, [
              attributeName,
              product.id,
              new Date(),
              new Date()
            ]);
          }

          const attributeId = attribute[0].id;

          for (const v of variations) {
            console.log(`Creating attribute value: ${v.variant} for ${attributeName}`);
            
            const valueInsertQuery = `
              INSERT INTO attribute_values (
                "attributeId", variant, sku, price, quantity, "imageId", 
                "createdAt", "updatedAt"
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
              RETURNING *
            `;
            
            await this.attributeValueRepository.query(valueInsertQuery, [
              attributeId,
              v.variant,
              v.sku,
              v.price,
              v.quantity,
              v.imageId,
              new Date(),
              new Date()
            ]);
          }
        }
      }

      const finalProduct = await this.findOne(product.id);
      return await this.toProductResponse(finalProduct);
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  async findAll(query: GetProductsQueryDto): Promise<PaginatedResponseDto<any>> {
    const { page = 1, limit = 10, sort = 'updatedAt', order = 'desc', filters = {} } = query;
    const skip = (page - 1) * limit;
    const { search, categoryId, categoryIds, isVariant, published, featured, minPrice, maxPrice } = filters;

    try {
      let baseQuery = 'SELECT * FROM products WHERE 1=1';
      const params: any[] = [];
      let paramIndex = 1;

      if (isVariant !== undefined) {
        baseQuery += ` AND "isVariant" = $${paramIndex++}`;
        params.push(isVariant);
      }
      if (published !== undefined) {
        baseQuery += ` AND published = $${paramIndex++}`;
        params.push(published);
      }
      if (featured !== undefined) {
        baseQuery += ` AND featured = $${paramIndex++}`;
        params.push(featured);
      }
      if (minPrice !== undefined && maxPrice !== undefined) {
        baseQuery += ` AND "salePrice" BETWEEN $${paramIndex++} AND $${paramIndex++}`;
        params.push(minPrice, maxPrice);
      }

      if (search) {
        baseQuery += ` AND (name ILIKE $${paramIndex++} OR slug ILIKE $${paramIndex++} OR "shortDescription" ILIKE $${paramIndex++} OR "longDescription" ILIKE $${paramIndex++})`;
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm, searchTerm);
        paramIndex += 4;
      }

      if (categoryIds && categoryIds.length > 0) {
        const categoryIdList = categoryIds.map((id: string) => `'${id}'`).join(',');
        baseQuery += ` AND "categoryIds" && ARRAY[${categoryIdList}]::text[]`;
      } else if (categoryId) {
        baseQuery += ` AND "categoryIds" && ARRAY['${categoryId}']::text[]`;
      }

      baseQuery += ` ORDER BY "${sort}" ${order.toUpperCase()}`;
      baseQuery += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
      params.push(limit, skip);

      const products = await this.productRepository.query(baseQuery, params);

      let countQuery = 'SELECT COUNT(*) as total FROM products WHERE 1=1';
      const countParams: any[] = [];
      let countParamIndex = 1;

      if (isVariant !== undefined) {
        countQuery += ` AND "isVariant" = $${countParamIndex++}`;
        countParams.push(isVariant);
      }
      if (published !== undefined) {
        countQuery += ` AND published = $${countParamIndex++}`;
        countParams.push(published);
      }
      if (featured !== undefined) {
        countQuery += ` AND featured = $${countParamIndex++}`;
        countParams.push(featured);
      }
      if (minPrice !== undefined && maxPrice !== undefined) {
        countQuery += ` AND "salePrice" BETWEEN $${countParamIndex++} AND $${countParamIndex++}`;
        countParams.push(minPrice, maxPrice);
      }

      if (search) {
        countQuery += ` AND (name ILIKE $${countParamIndex++} OR slug ILIKE $${countParamIndex++} OR "shortDescription" ILIKE $${countParamIndex++} OR "longDescription" ILIKE $${countParamIndex++})`;
        const searchTerm = `%${search}%`;
        countParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
      }

      if (categoryIds && categoryIds.length > 0) {
        const categoryIdList = categoryIds.map((id: string) => `'${id}'`).join(',');
        countQuery += ` AND "categoryIds" && ARRAY[${categoryIdList}]::text[]`;
      } else if (categoryId) {
        countQuery += ` AND "categoryIds" && ARRAY['${categoryId}']::text[]`;
      }

      const countResult = await this.productRepository.query(countQuery, countParams);
      const total = parseInt(countResult[0]?.total || '0');

      const productDtos = await Promise.all(products.map(async (product: any) => {
        let thumbnailImg = undefined;
        if (product.thumbnailImgId) {
          try {
            const thumbnailQuery = 'SELECT * FROM media_files WHERE id = $1';
            const thumbnailResult = await this.productRepository.query(thumbnailQuery, [product.thumbnailImgId]);
            thumbnailImg = thumbnailResult[0] || undefined;
          } catch (error) {
            console.log('Error fetching thumbnail for product:', product.id, error);
          }
        }

        return {
          ...product,
          thumbnailImg,
        };
      }));

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
      console.error('Error in findAll:', error);
      throw error;
    }
  }

  async findOne(id: string): Promise<ProductResponseDto> {
    try {
      const products = await this.productRepository.query('SELECT * FROM products WHERE id = $1', [id]);
      
      if (!products || products.length === 0) {
        throw new Error('Product not found');
      }
      
      const product = products[0];

      // Parse categoryIds from PostgreSQL array format
      let categoryIdsArray: string[] = [];
      if (product.categoryIds) {
        try {
          // Handle PostgreSQL array format: {"id1","id2"}
          if (typeof product.categoryIds === 'string') {
            // Remove curly braces and split by comma
            const cleanString = product.categoryIds.replace(/[{}]/g, '');
            categoryIdsArray = cleanString.split(',').map((id: string) => id.trim().replace(/"/g, ''));
          } else if (Array.isArray(product.categoryIds)) {
            categoryIdsArray = product.categoryIds;
          }
        } catch (error) {
          console.log('Error parsing categoryIds:', error);
        }
      }

      let categories: Category[] = [];
      if (categoryIdsArray.length > 0) {
        try {
          const categoryIdList = categoryIdsArray.map((id: string) => `'${id}'`).join(',');
          const categoriesResult = await this.categoryRepository.query(
            `SELECT c.*, mf.* FROM categories c 
             LEFT JOIN media_files mf ON c."thumbnailImageId" = mf.id 
             WHERE c.id IN (${categoryIdList})`
          );
          
          categories = categoriesResult.map((row: any) => ({
            id: row.id,
            name: row.name,
            slug: row.slug,
            description: row.description,
            isActive: row.isActive,
            isFeatured: row.isFeatured,
            isPopular: row.isPopular,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
            parentId: row.parentId,
            isParent: row.isParent,
            thumbnailImageId: row.thumbnailImageId,
            coverImageId: row.coverImageId,
            thumbnailImage: row.thumbnailImageId ? {
              id: row.thumbnailImageId,
              scope: row.scope,
              uri: row.uri,
              url: row.url,
              fileName: row.fileName,
              mimetype: row.mimetype,
              size: row.size,
              userId: row.userId,
              createdAt: row.createdAt,
              updatedAt: row.updatedAt,
            } : null
          }));
        } catch (error) {
          console.log('Error fetching categories for product:', id, error);
        }
      }

      let thumbnailImg = undefined;
      if (product.thumbnailImgId) {
        try {
          const thumbnailQuery = 'SELECT * FROM media_files WHERE id = $1';
          const thumbnailResult = await this.productRepository.query(thumbnailQuery, [product.thumbnailImgId]);
          thumbnailImg = thumbnailResult[0] || undefined;
        } catch (error) {
          console.log('Error fetching thumbnail for product:', id, error);
        }
      }

      // Parse photosIds from PostgreSQL array format
      let photoIdsArray: string[] = [];
      if (product.photosIds) {
        try {
          // Handle PostgreSQL array format: {"id1","id2"}
          if (typeof product.photosIds === 'string') {
            // Remove curly braces and split by comma
            const cleanString = product.photosIds.replace(/[{}]/g, '');
            photoIdsArray = cleanString.split(',').map((id: string) => id.trim().replace(/"/g, ''));
          } else if (Array.isArray(product.photosIds)) {
            photoIdsArray = product.photosIds;
          }
        } catch (error) {
          console.log('Error parsing photosIds:', error);
        }
      }

      let photos = [];
      if (photoIdsArray.length > 0) {
        try {
          const photoIdsString = photoIdsArray.map((photoId: string) => `'${photoId}'`).join(',');
          const photosQuery = `SELECT * FROM media_files WHERE id IN (${photoIdsString})`;
          photos = await this.productRepository.query(photosQuery);
        } catch (error) {
          console.log('Error fetching photos for product:', id, error);
        }
      }

      let variations: any[] = [];
      try {
        const attributesQuery = `
          SELECT a.id as "attributeId", a.name, av.id as "valueId", av.variant, av.sku, av.price, av.quantity, av."imageId"
          FROM attributes a
          LEFT JOIN attribute_values av ON a.id = av."attributeId"
          WHERE a."productId" = $1
          ORDER BY a.name, av.variant
        `;
        const attributesResult = await this.productRepository.query(attributesQuery, [id]);
        
        console.log('=== Debug: Attributes query result ===');
        console.log('Total rows:', attributesResult.length);
        attributesResult.forEach((row: any, index: number) => {
          console.log(`Row ${index + 1}:`, {
            attributeId: row.attributeId,
            name: row.name,
            valueId: row.valueId,
            variant: row.variant,
            sku: row.sku,
            price: row.price,
            quantity: row.quantity,
            imageId: row.imageId
          });
        });
        
        const attributeGroups = new Map<string, any[]>();
        for (const row of attributesResult) {
          if (!attributeGroups.has(row.name)) {
            attributeGroups.set(row.name, []);
          }
          if (row.variant) {
            attributeGroups.get(row.name)!.push({
              name: row.name,
              variant: row.variant,
              sku: row.sku,
              price: row.price,
              quantity: row.quantity,
              imageId: row.imageId
            });
          }
        }
        
        for (const [attributeName, variants] of attributeGroups) {
          variations.push(...variants);
        }
        
        console.log('=== Debug: Final variations array ===');
        console.log('Total variations:', variations.length);
        variations.forEach((variation: any, index: number) => {
          console.log(`Variation ${index + 1}:`, variation);
        });
      } catch (error) {
        console.log('Error fetching variations for product:', id, error);
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
      console.error('Error in findOne:', error);
      throw error;
    }
  }

  async updateProduct(
    id: string,
    data: UpdateProductDto,
    thumbnailFile?: Express.Multer.File,
    photosFiles?: Express.Multer.File[],
    variantImageFiles?: Express.Multer.File[]
  ): Promise<ProductResponseDto> {
    const existingProduct = await this.productRepository.query('SELECT * FROM products WHERE id = $1', [id]);
    if (!existingProduct || existingProduct.length === 0) {
      throw new Error('Product not found');
    }
    
    const product = existingProduct[0];
    
    if (data.name && !data.slug) {
      data.slug = slugify(data.name, { lower: true });
    }
    if (data.slug) {
      data.slug = await this.generateUniqueSlug(data.slug);
    }
    
    const { variations, thumbnailBase64, photosBase64, categoryIds, ...productData } = data;

    const uniqueSlug = (data.slug || product.slug || `product-${id}`) as string;

    const thumbnailUrl = await this.handleImageUpload(
      thumbnailFile,
      thumbnailBase64,
      'products',
      `${uniqueSlug}-thumbnail`
    );
    if (thumbnailUrl) productData.thumbnailImgId = thumbnailUrl;

    const photosUrls = await this.handleMultipleImageUploads(
      Array.isArray(photosFiles) ? photosFiles : undefined,
      photosBase64,
      'products',
      uniqueSlug
    );
    if (photosUrls.length > 0) productData.photosIds = photosUrls;

    const updateFields: string[] = [];
    const updateParams: any[] = [];
    let paramIndex = 1;

    Object.entries(productData).forEach(([key, value]) => {
      if (value !== undefined) {
        updateFields.push(`"${key}" = $${paramIndex++}`);
        updateParams.push(value);
      }
    });

    if (categoryIds !== undefined) {
      updateFields.push(`"categoryIds" = $${paramIndex++}`);
      updateParams.push(categoryIds);
    }

    updateFields.push(`"updatedAt" = $${paramIndex++}`);
    updateParams.push(new Date());

    if (updateFields.length > 0) {
      const updateQuery = `UPDATE products SET ${updateFields.join(', ')} WHERE id = $${paramIndex++}`;
      updateParams.push(id);
      
      await this.productRepository.query(updateQuery, updateParams);
    }

    if (variations && Array.isArray(variations)) {
      console.log('=== Processing Variations and Attributes for Update ===');
      console.log('Total variations:', variations.length);
      
      // First, clear all existing variations for this product
      console.log('Clearing existing variations...');
      const existingAttributes = await this.attributeRepository.query(
        'SELECT id FROM attributes WHERE "productId" = $1',
        [id]
      );
      
      if (existingAttributes.length > 0) {
        const attributeIds = existingAttributes.map((attr: any) => attr.id);
        const attributeIdsString = attributeIds.map((attrId: string) => `'${attrId}'`).join(',');
        
        // Delete attribute values first (due to foreign key constraint)
        await this.attributeValueRepository.query(
          `DELETE FROM attribute_values WHERE "attributeId" IN (${attributeIdsString})`
        );
        
        // Then delete attributes
        await this.attributeRepository.query(
          `DELETE FROM attributes WHERE "productId" = $1`,
          [id]
        );
        
        console.log(`Cleared ${existingAttributes.length} existing attributes and their values`);
      }
      
      const attributeGroups = new Map<string, any[]>();
      
      for (const v of variations) {
        if (!v.name) {
          throw new Error('Variation name is required');
        }
        
        if (!attributeGroups.has(v.name)) {
          attributeGroups.set(v.name, []);
        }
        attributeGroups.get(v.name)!.push(v);
      }
      
      for (const [attributeName, variations] of attributeGroups) {
        console.log(`Processing attribute: ${attributeName} with ${variations.length} variations`);
        
        // Create new attribute
        const attributeInsertQuery = `
          INSERT INTO attributes (name, "productId", "createdAt", "updatedAt")
          VALUES ($1, $2, $3, $4)
          RETURNING *
        `;
        const attribute = await this.attributeRepository.query(attributeInsertQuery, [
          attributeName,
          id,
          new Date(),
          new Date()
        ]);

        const attributeId = attribute[0].id;

        for (const v of variations) {
          console.log(`Creating attribute value: ${v.variant} for ${attributeName}`);
          
          const valueInsertQuery = `
            INSERT INTO attribute_values (
              "attributeId", variant, sku, price, quantity, "imageId", 
              "createdAt", "updatedAt"
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
          `;
          
          await this.attributeValueRepository.query(valueInsertQuery, [
            attributeId,
            v.variant,
            v.sku,
            v.price,
            v.quantity,
            v.imageId,
            new Date(),
            new Date()
          ]);
        }
      }
    }

    return await this.findOne(id);
  }

  async removeProduct(id: string): Promise<void> {
    const product = await this.productRepository.query('SELECT * FROM products WHERE id = $1', [id]);
    if (!product || product.length === 0) throw new Error('Product not found');
    
    const attributes = await this.attributeRepository.query('SELECT * FROM attributes WHERE "productId" = $1', [id]);
    if (attributes.length > 0) {
      const attributeIds = attributes.map((attr: any) => attr.id);
      const attributeIdsString = attributeIds.map((id: string) => `'${id}'`).join(',');
      await this.attributeValueRepository.query(`DELETE FROM attribute_values WHERE "attributeId" IN (${attributeIdsString})`);
    }
    
    await this.attributeRepository.query('DELETE FROM attributes WHERE "productId" = $1', [id]);
    await this.productRepository.query('DELETE FROM products WHERE id = $1', [id]);
  }
}
