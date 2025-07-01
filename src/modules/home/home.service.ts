import { Repository } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import { Category } from '../category/category.entity';
import { MediaFile } from '../media/media-file.entity';
import { GetHomeDataQueryDto } from './dto/get-home-data-query.dto';
import { HomeDataResponseDto } from './dto/home-data-response.dto';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';

export class HomeService {
  private productRepository: Repository<Product>;
  private categoryRepository: Repository<Category>;
  private mediaRepository: Repository<MediaFile>;

  constructor(
    productRepository: Repository<Product>,
    categoryRepository: Repository<Category>,
    mediaRepository: Repository<MediaFile>
  ) {
    this.productRepository = productRepository;
    this.categoryRepository = categoryRepository;
    this.mediaRepository = mediaRepository;
  }

  private async getProductWithThumbnail(product: any): Promise<any> {
    if (product.thumbnailImgId) {
      try {
        const thumbnailQuery = 'SELECT * FROM media_files WHERE id = $1';
        const thumbnailResult = await this.productRepository.query(thumbnailQuery, [product.thumbnailImgId]);
        product.thumbnailImg = thumbnailResult[0] || null;
      } catch (error) {
        console.log('Error fetching thumbnail for product:', product.id, error);
        product.thumbnailImg = null;
      }
    } else {
      product.thumbnailImg = null;
    }
    return product;
  }

  private async getCategoryWithThumbnail(category: any): Promise<any> {
    if (category.thumbnailImageId) {
      try {
        const thumbnailQuery = 'SELECT * FROM media_files WHERE id = $1';
        const thumbnailResult = await this.categoryRepository.query(thumbnailQuery, [category.thumbnailImageId]);
        category.thumbnailImage = thumbnailResult[0] || null;
      } catch (error) {
        console.log('Error fetching thumbnail for category:', category.id, error);
        category.thumbnailImage = null;
      }
    } else {
      category.thumbnailImage = null;
    }
    return category;
  }

  async getHomeData(query: GetHomeDataQueryDto): Promise<HomeDataResponseDto> {
    try {
      const {
        featuredProductsLimit = 8,
        newArrivalsLimit = 6,
        popularCategoriesLimit = 6,
        trendingProductsLimit = 4,
        dealsLimit = 4
      } = query;

      // Get featured products
      const featuredProductsQuery = `
        SELECT p.*, 
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
        FROM products p
        LEFT JOIN media_files mf ON p."thumbnailImgId" = mf.id
        WHERE p.featured = true 
          AND p.published = true 
          AND p.approved = true
        ORDER BY p."numOfSales" DESC, p."createdAt" DESC
        LIMIT $1
      `;
      const featuredProducts = await this.productRepository.query(featuredProductsQuery, [featuredProductsLimit]);

      // Get new arrivals
      const newArrivalsQuery = `
        SELECT p.*, 
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
        FROM products p
        LEFT JOIN media_files mf ON p."thumbnailImgId" = mf.id
        WHERE p.published = true 
          AND p.approved = true
        ORDER BY p."createdAt" DESC
        LIMIT $1
      `;
      const newArrivals = await this.productRepository.query(newArrivalsQuery, [newArrivalsLimit]);

      // Get popular categories
      const popularCategoriesQuery = `
        SELECT c.*, 
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
        FROM categories c
        LEFT JOIN media_files mf ON c."thumbnailImageId" = mf.id
        WHERE c."isActive" = true 
          AND c."isPopular" = true
        ORDER BY c."updatedAt" DESC
        LIMIT $1
      `;
      const popularCategories = await this.categoryRepository.query(popularCategoriesQuery, [popularCategoriesLimit]);

      // Get trending products (based on sales and rating)
      const trendingProductsQuery = `
        SELECT p.*, 
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
        FROM products p
        LEFT JOIN media_files mf ON p."thumbnailImgId" = mf.id
        WHERE p.published = true 
          AND p.approved = true
          AND p.rating >= 4.0
        ORDER BY p."numOfSales" DESC, p.rating DESC
        LIMIT $1
      `;
      const trendingProducts = await this.productRepository.query(trendingProductsQuery, [trendingProductsLimit]);

      // Get deals (products with discount)
      const dealsQuery = `
        SELECT p.*, 
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
        FROM products p
        LEFT JOIN media_files mf ON p."thumbnailImgId" = mf.id
        WHERE p.published = true 
          AND p.approved = true
          AND p.discount > 0
          AND p."discountStartDate" <= NOW()
          AND p."discountEndDate" >= NOW()
        ORDER BY p.discount DESC, p."numOfSales" DESC
        LIMIT $1
      `;
      const deals = await this.productRepository.query(dealsQuery, [dealsLimit]);

      // Format products with thumbnails
      const formatProducts = (products: any[]) => {
        return products.map((product: any) => ({
          id: product.id,
          name: product.name,
          slug: product.slug,
          shortDescription: product.shortDescription,
          regularPrice: product.regularPrice,
          salePrice: product.salePrice,
          discount: product.discount,
          discountType: product.discountType,
          rating: product.rating,
          numOfSales: product.numOfSales,
          stock: product.stock,
          thumbnailImgId: product.thumbnailImgId,
          thumbnailImg: product.thumbnail_id ? {
            id: product.thumbnail_id,
            scope: product.thumbnail_scope,
            uri: product.thumbnail_uri,
            url: product.thumbnail_url,
            fileName: product.thumbnail_fileName,
            mimetype: product.thumbnail_mimetype,
            size: product.thumbnail_size,
            userId: product.thumbnail_userId,
            createdAt: product.thumbnail_createdAt,
            updatedAt: product.thumbnail_updatedAt
          } : null,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt
        }));
      };

      // Format deals with additional discount date fields
      const formatDeals = (products: any[]) => {
        return products.map((product: any) => ({
          id: product.id,
          name: product.name,
          slug: product.slug,
          shortDescription: product.shortDescription,
          regularPrice: product.regularPrice,
          salePrice: product.salePrice,
          discount: product.discount,
          discountType: product.discountType,
          discountStartDate: product.discountStartDate,
          discountEndDate: product.discountEndDate,
          rating: product.rating,
          numOfSales: product.numOfSales,
          stock: product.stock,
          thumbnailImgId: product.thumbnailImgId,
          thumbnailImg: product.thumbnail_id ? {
            id: product.thumbnail_id,
            scope: product.thumbnail_scope,
            uri: product.thumbnail_uri,
            url: product.thumbnail_url,
            fileName: product.thumbnail_fileName,
            mimetype: product.thumbnail_mimetype,
            size: product.thumbnail_size,
            userId: product.thumbnail_userId,
            createdAt: product.thumbnail_createdAt,
            updatedAt: product.thumbnail_updatedAt
          } : null,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt
        }));
      };

      // Format categories with thumbnails
      const formatCategories = (categories: any[]) => {
        return categories.map(category => ({
          id: category.id,
          name: category.name,
          slug: category.slug,
          description: category.description,
          isActive: category.isActive,
          isFeatured: category.isFeatured,
          isPopular: category.isPopular,
          parentId: category.parentId,
          thumbnailImageId: category.thumbnailImageId,
          thumbnailImage: category.thumbnail_id ? {
            id: category.thumbnail_id,
            scope: category.thumbnail_scope,
            uri: category.thumbnail_uri,
            url: category.thumbnail_url,
            fileName: category.thumbnail_fileName,
            mimetype: category.thumbnail_mimetype,
            size: category.thumbnail_size,
            userId: category.thumbnail_userId,
            createdAt: category.thumbnail_createdAt,
            updatedAt: category.thumbnail_updatedAt
          } : null,
          createdAt: category.createdAt,
          updatedAt: category.updatedAt
        }));
      };

      return {
        featuredProducts: formatProducts(featuredProducts),
        newArrivals: formatProducts(newArrivals),
        popularCategories: formatCategories(popularCategories),
        trendingProducts: formatProducts(trendingProducts),
        deals: formatDeals(deals),
        meta: {
          featuredProductsCount: featuredProducts.length,
          newArrivalsCount: newArrivals.length,
          popularCategoriesCount: popularCategories.length,
          trendingProductsCount: trendingProducts.length,
          dealsCount: deals.length
        }
      };
    } catch (error: any) {
      throw new Error(`Error fetching home data: ${error.message}`);
    }
  }

  async getFeaturedProducts(query: GetHomeDataQueryDto): Promise<PaginatedResponseDto<any>> {
    try {
      const { page = 1, limit = 12 } = query;
      const skip = (page - 1) * limit;

      const countQuery = `
        SELECT COUNT(*) as total
        FROM products p
        WHERE p.featured = true 
          AND p.published = true 
          AND p.approved = true
      `;
      const countResult = await this.productRepository.query(countQuery);
      const total = parseInt(countResult[0].total);

      const productsQuery = `
        SELECT p.*, 
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
        FROM products p
        LEFT JOIN media_files mf ON p."thumbnailImgId" = mf.id
        WHERE p.featured = true 
          AND p.published = true 
          AND p.approved = true
        ORDER BY p."numOfSales" DESC, p."createdAt" DESC
        LIMIT $1 OFFSET $2
      `;
      const products = await this.productRepository.query(productsQuery, [limit, skip]);

      const formattedProducts = products.map((product: any) => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
        shortDescription: product.shortDescription,
        regularPrice: product.regularPrice,
        salePrice: product.salePrice,
        discount: product.discount,
        discountType: product.discountType,
        rating: product.rating,
        numOfSales: product.numOfSales,
        stock: product.stock,
        thumbnailImgId: product.thumbnailImgId,
        thumbnailImg: product.thumbnail_id ? {
          id: product.thumbnail_id,
          scope: product.thumbnail_scope,
          uri: product.thumbnail_uri,
          url: product.thumbnail_url,
          fileName: product.thumbnail_fileName,
          mimetype: product.thumbnail_mimetype,
          size: product.thumbnail_size,
          userId: product.thumbnail_userId,
          createdAt: product.thumbnail_createdAt,
          updatedAt: product.thumbnail_updatedAt
        } : null,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt
      }));

      return {
        data: formattedProducts,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error: any) {
      throw new Error(`Error fetching featured products: ${error.message}`);
    }
  }

  async getNewArrivals(query: GetHomeDataQueryDto): Promise<PaginatedResponseDto<any>> {
    try {
      const { page = 1, limit = 12 } = query;
      const skip = (page - 1) * limit;

      const countQuery = `
        SELECT COUNT(*) as total
        FROM products p
        WHERE p.published = true 
          AND p.approved = true
      `;
      const countResult = await this.productRepository.query(countQuery);
      const total = parseInt(countResult[0].total);

      const productsQuery = `
        SELECT p.*, 
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
        FROM products p
        LEFT JOIN media_files mf ON p."thumbnailImgId" = mf.id
        WHERE p.published = true 
          AND p.approved = true
        ORDER BY p."createdAt" DESC
        LIMIT $1 OFFSET $2
      `;
      const products = await this.productRepository.query(productsQuery, [limit, skip]);

      const formattedProducts = products.map((product: any) => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
        shortDescription: product.shortDescription,
        regularPrice: product.regularPrice,
        salePrice: product.salePrice,
        discount: product.discount,
        discountType: product.discountType,
        rating: product.rating,
        numOfSales: product.numOfSales,
        stock: product.stock,
        thumbnailImgId: product.thumbnailImgId,
        thumbnailImg: product.thumbnail_id ? {
          id: product.thumbnail_id,
          scope: product.thumbnail_scope,
          uri: product.thumbnail_uri,
          url: product.thumbnail_url,
          fileName: product.thumbnail_fileName,
          mimetype: product.thumbnail_mimetype,
          size: product.thumbnail_size,
          userId: product.thumbnail_userId,
          createdAt: product.thumbnail_createdAt,
          updatedAt: product.thumbnail_updatedAt
        } : null,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt
      }));

      return {
        data: formattedProducts,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error: any) {
      throw new Error(`Error fetching new arrivals: ${error.message}`);
    }
  }

  async getDeals(query: GetHomeDataQueryDto): Promise<PaginatedResponseDto<any>> {
    try {
      const { page = 1, limit = 12 } = query;
      const skip = (page - 1) * limit;

      const countQuery = `
        SELECT COUNT(*) as total
        FROM products p
        WHERE p.published = true 
          AND p.approved = true
          AND p.discount > 0
          AND p."discountStartDate" <= NOW()
          AND p."discountEndDate" >= NOW()
      `;
      const countResult = await this.productRepository.query(countQuery);
      const total = parseInt(countResult[0].total);

      const productsQuery = `
        SELECT p.*, 
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
        FROM products p
        LEFT JOIN media_files mf ON p."thumbnailImgId" = mf.id
        WHERE p.published = true 
          AND p.approved = true
          AND p.discount > 0
          AND p."discountStartDate" <= NOW()
          AND p."discountEndDate" >= NOW()
        ORDER BY p.discount DESC, p."numOfSales" DESC
        LIMIT $1 OFFSET $2
      `;
      const products = await this.productRepository.query(productsQuery, [limit, skip]);

      const formattedProducts = products.map((product: any) => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
        shortDescription: product.shortDescription,
        regularPrice: product.regularPrice,
        salePrice: product.salePrice,
        discount: product.discount,
        discountType: product.discountType,
        discountStartDate: product.discountStartDate,
        discountEndDate: product.discountEndDate,
        rating: product.rating,
        numOfSales: product.numOfSales,
        stock: product.stock,
        thumbnailImgId: product.thumbnailImgId,
        thumbnailImg: product.thumbnail_id ? {
          id: product.thumbnail_id,
          scope: product.thumbnail_scope,
          uri: product.thumbnail_uri,
          url: product.thumbnail_url,
          fileName: product.thumbnail_fileName,
          mimetype: product.thumbnail_mimetype,
          size: product.thumbnail_size,
          userId: product.thumbnail_userId,
          createdAt: product.thumbnail_createdAt,
          updatedAt: product.thumbnail_updatedAt
        } : null,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt
      }));

      return {
        data: formattedProducts,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error: any) {
      throw new Error(`Error fetching deals: ${error.message}`);
    }
  }
} 