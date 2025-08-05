import { Repository } from "typeorm";
import { Product } from "../products/entities/product.entity";
import { Category } from "../category/category.entity";
import { MediaFile } from "../media/media-file.entity";
import { GetHomeDataQueryDto } from "./dto/get-home-data-query.dto";
import { HomeDataResponseDto } from "./dto/home-data-response.dto";
import { PaginatedResponseDto } from "../../common/dto/paginated-response.dto";
import { cacheService } from "../../common/services/cache.service";

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
        const thumbnailQuery = "SELECT * FROM media_files WHERE id = $1";
        const thumbnailResult = await this.productRepository.query(
          thumbnailQuery,
          [product.thumbnailImgId]
        );
        product.thumbnailImg = thumbnailResult[0] || null;
      } catch (error) {
        console.log("Error fetching thumbnail for product:", product.id, error);
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
        const thumbnailQuery = "SELECT * FROM media_files WHERE id = $1";
        const thumbnailResult = await this.categoryRepository.query(
          thumbnailQuery,
          [category.thumbnailImageId]
        );
        category.thumbnailImage = thumbnailResult[0] || null;
      } catch (error) {
        console.log(
          "Error fetching thumbnail for category:",
          category.id,
          error
        );
        category.thumbnailImage = null;
      }
    } else {
      category.thumbnailImage = null;
    }
    return category;
  }

  async getHomeData(query: GetHomeDataQueryDto): Promise<HomeDataResponseDto> {
    // Create cache key based on query parameters
    const cacheKey = `home:data:${JSON.stringify(query)}`;

    // Use cache wrapper for automatic caching (30 minutes TTL)
    return await cacheService.cacheWrapper(
      cacheKey,
      async () => {
        try {
          const {
            featuredProductsLimit = 8,
            newArrivalsLimit = 6,
            popularCategoriesLimit = 6,
            trendingProductsLimit = 4,
            dealsLimit = 4,
          } = query;

          // Get featured products using TypeORM
          const featuredProducts = await this.productRepository
            .createQueryBuilder("product")
            .leftJoinAndSelect("product.thumbnailImg", "thumbnailImg")
            .where("product.featured = :featured", { featured: true })
            .andWhere("product.published = :published", { published: true })
            .andWhere("product.approved = :approved", { approved: true })
            .orderBy("product.numOfSales", "DESC")
            .addOrderBy("product.createdAt", "DESC")
            .take(featuredProductsLimit)
            .getMany();

          // Get new arrivals using TypeORM
          const newArrivals = await this.productRepository
            .createQueryBuilder("product")
            .leftJoinAndSelect("product.thumbnailImg", "thumbnailImg")
            .where("product.published = :published", { published: true })
            .andWhere("product.approved = :approved", { approved: true })
            .orderBy("product.createdAt", "DESC")
            .take(newArrivalsLimit)
            .getMany();

          // Get popular categories using TypeORM
          const popularCategories = await this.categoryRepository
            .createQueryBuilder("category")
            .leftJoinAndSelect("category.thumbnailImage", "thumbnailImage")
            .where("category.isActive = :isActive", { isActive: true })
            .andWhere("category.isPopular = :isPopular", { isPopular: true })
            .orderBy("category.updatedAt", "DESC")
            .take(popularCategoriesLimit)
            .getMany();

          // Get trending products using TypeORM (based on sales and rating)
          const trendingProducts = await this.productRepository
            .createQueryBuilder("product")
            .leftJoinAndSelect("product.thumbnailImg", "thumbnailImg")
            .where("product.published = :published", { published: true })
            .andWhere("product.approved = :approved", { approved: true })
            .andWhere("product.rating >= :rating", { rating: 4.0 })
            .orderBy("product.numOfSales", "DESC")
            .addOrderBy("product.rating", "DESC")
            .take(trendingProductsLimit)
            .getMany();

          // Get deals using TypeORM (products with discount)
          const deals = await this.productRepository
            .createQueryBuilder("product")
            .leftJoinAndSelect("product.thumbnailImg", "thumbnailImg")
            .where("product.published = :published", { published: true })
            .andWhere("product.approved = :approved", { approved: true })
            .andWhere("product.discount > :discount", { discount: 0 })
            .andWhere("product.discountStartDate <= :now", { now: new Date() })
            .andWhere("product.discountEndDate >= :now", { now: new Date() })
            .orderBy("product.discount", "DESC")
            .addOrderBy("product.numOfSales", "DESC")
            .take(dealsLimit)
            .getMany();

          // Format products with thumbnails (simplified for TypeORM entities)
          const formatProducts = (products: Product[]) => {
            return products.map((product: Product) => ({
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
              thumbnailImg: product.thumbnailImg
                ? {
                    id: product.thumbnailImg.id,
                    scope: product.thumbnailImg.scope.toString(),
                    uri: product.thumbnailImg.uri || "",
                    url: product.thumbnailImg.url || "",
                    fileName: product.thumbnailImg.fileName,
                    mimetype: product.thumbnailImg.mimetype,
                    size: product.thumbnailImg.size,
                    userId: product.thumbnailImg.userId || "",
                    createdAt: product.thumbnailImg.createdAt,
                    updatedAt: product.thumbnailImg.updatedAt,
                  }
                : null,
              createdAt: product.createdAt,
              updatedAt: product.updatedAt,
            }));
          };

          // Format deals with additional discount date fields
          const formatDeals = (products: Product[]) => {
            return products.map((product: Product) => ({
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
              thumbnailImg: product.thumbnailImg
                ? {
                    id: product.thumbnailImg.id,
                    scope: product.thumbnailImg.scope.toString(),
                    uri: product.thumbnailImg.uri || "",
                    url: product.thumbnailImg.url || "",
                    fileName: product.thumbnailImg.fileName,
                    mimetype: product.thumbnailImg.mimetype,
                    size: product.thumbnailImg.size,
                    userId: product.thumbnailImg.userId || "",
                    createdAt: product.thumbnailImg.createdAt,
                    updatedAt: product.thumbnailImg.updatedAt,
                  }
                : null,
              createdAt: product.createdAt,
              updatedAt: product.updatedAt,
            }));
          };

          // Format categories with thumbnails
          const formatCategories = (categories: any[]) => {
            return categories.map((category) => ({
              id: category.id,
              name: category.name,
              slug: category.slug,
              description: category.description,
              isActive: category.isActive,
              isFeatured: category.isFeatured,
              isPopular: category.isPopular,
              parentId: category.parentId,
              thumbnailImageId: category.thumbnailImageId,
              thumbnailImage: category.thumbnail_id
                ? {
                    id: category.thumbnail_id,
                    scope: category.thumbnail_scope,
                    uri: category.thumbnail_uri,
                    url: category.thumbnail_url,
                    fileName: category.thumbnail_fileName,
                    mimetype: category.thumbnail_mimetype,
                    size: category.thumbnail_size,
                    userId: category.thumbnail_userId,
                    createdAt: category.thumbnail_createdAt,
                    updatedAt: category.thumbnail_updatedAt,
                  }
                : null,
              createdAt: category.createdAt,
              updatedAt: category.updatedAt,
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
              dealsCount: deals.length,
            },
          };
        } catch (error: any) {
          throw new Error(`Error fetching home data: ${error.message}`);
        }
      },
      { ttl: 1800 } // 30 minutes cache
    );
  }

  async getFeaturedProducts(
    query: GetHomeDataQueryDto
  ): Promise<PaginatedResponseDto<any>> {
    try {
      const { page = 1, limit = 12 } = query;
      const skip = (page - 1) * limit;

      // Get total count using TypeORM
      const total = await this.productRepository
        .createQueryBuilder("product")
        .where("product.featured = :featured", { featured: true })
        .andWhere("product.published = :published", { published: true })
        .andWhere("product.approved = :approved", { approved: true })
        .getCount();

      // Get products using TypeORM
      const products = await this.productRepository
        .createQueryBuilder("product")
        .leftJoinAndSelect("product.thumbnailImg", "thumbnailImg")
        .where("product.featured = :featured", { featured: true })
        .andWhere("product.published = :published", { published: true })
        .andWhere("product.approved = :approved", { approved: true })
        .orderBy("product.numOfSales", "DESC")
        .addOrderBy("product.createdAt", "DESC")
        .skip(skip)
        .take(limit)
        .getMany();

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
        thumbnailImg: product.thumbnail_id
          ? {
              id: product.thumbnail_id,
              scope: product.thumbnail_scope,
              uri: product.thumbnail_uri,
              url: product.thumbnail_url,
              fileName: product.thumbnail_fileName,
              mimetype: product.thumbnail_mimetype,
              size: product.thumbnail_size,
              userId: product.thumbnail_userId,
              createdAt: product.thumbnail_createdAt,
              updatedAt: product.thumbnail_updatedAt,
            }
          : null,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      }));

      return {
        data: formattedProducts,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error: any) {
      throw new Error(`Error fetching featured products: ${error.message}`);
    }
  }

  async getNewArrivals(
    query: GetHomeDataQueryDto
  ): Promise<PaginatedResponseDto<any>> {
    try {
      const { page = 1, limit = 12 } = query;
      const skip = (page - 1) * limit;

      // Get total count using TypeORM
      const total = await this.productRepository
        .createQueryBuilder("product")
        .where("product.published = :published", { published: true })
        .andWhere("product.approved = :approved", { approved: true })
        .getCount();

      // Get products using TypeORM
      const products = await this.productRepository
        .createQueryBuilder("product")
        .leftJoinAndSelect("product.thumbnailImg", "thumbnailImg")
        .where("product.published = :published", { published: true })
        .andWhere("product.approved = :approved", { approved: true })
        .orderBy("product.createdAt", "DESC")
        .skip(skip)
        .take(limit)
        .getMany();

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
        thumbnailImg: product.thumbnail_id
          ? {
              id: product.thumbnail_id,
              scope: product.thumbnail_scope,
              uri: product.thumbnail_uri,
              url: product.thumbnail_url,
              fileName: product.thumbnail_fileName,
              mimetype: product.thumbnail_mimetype,
              size: product.thumbnail_size,
              userId: product.thumbnail_userId,
              createdAt: product.thumbnail_createdAt,
              updatedAt: product.thumbnail_updatedAt,
            }
          : null,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      }));

      return {
        data: formattedProducts,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error: any) {
      throw new Error(`Error fetching new arrivals: ${error.message}`);
    }
  }

  async getDeals(
    query: GetHomeDataQueryDto
  ): Promise<PaginatedResponseDto<any>> {
    try {
      const { page = 1, limit = 12 } = query;
      const skip = (page - 1) * limit;

      // Get total count using TypeORM
      const total = await this.productRepository
        .createQueryBuilder("product")
        .where("product.published = :published", { published: true })
        .andWhere("product.approved = :approved", { approved: true })
        .andWhere("product.discount > :discount", { discount: 0 })
        .andWhere("product.discountStartDate <= :now", { now: new Date() })
        .andWhere("product.discountEndDate >= :now", { now: new Date() })
        .getCount();

      // Get products using TypeORM
      const products = await this.productRepository
        .createQueryBuilder("product")
        .leftJoinAndSelect("product.thumbnailImg", "thumbnailImg")
        .where("product.published = :published", { published: true })
        .andWhere("product.approved = :approved", { approved: true })
        .andWhere("product.discount > :discount", { discount: 0 })
        .andWhere("product.discountStartDate <= :now", { now: new Date() })
        .andWhere("product.discountEndDate >= :now", { now: new Date() })
        .orderBy("product.discount", "DESC")
        .addOrderBy("product.numOfSales", "DESC")
        .skip(skip)
        .take(limit)
        .getMany();

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
        thumbnailImg: product.thumbnail_id
          ? {
              id: product.thumbnail_id,
              scope: product.thumbnail_scope,
              uri: product.thumbnail_uri,
              url: product.thumbnail_url,
              fileName: product.thumbnail_fileName,
              mimetype: product.thumbnail_mimetype,
              size: product.thumbnail_size,
              userId: product.thumbnail_userId,
              createdAt: product.thumbnail_createdAt,
              updatedAt: product.thumbnail_updatedAt,
            }
          : null,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      }));

      return {
        data: formattedProducts,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error: any) {
      throw new Error(`Error fetching deals: ${error.message}`);
    }
  }

  async getCustomHomeData(query: GetHomeDataQueryDto): Promise<any> {
    try {
      const {
        featuredProductsLimit = 8,
        newArrivalsLimit = 6,
        dealsLimit = 6,
      } = query;

      // -----------------------------
      // Helper: Format Image Object
      // -----------------------------
      const formatImage = (img?: MediaFile) =>
        img
          ? {
              id: img.id,
              scope: img.scope.toString(),
              uri: img.uri || "",
              url: img.url || "",
              fileName: img.fileName,
              mimetype: img.mimetype,
              size: img.size,
              userId: img.userId || "",
              createdAt: img.createdAt,
              updatedAt: img.updatedAt,
            }
          : null;

      // -----------------------------
      // Query: Featured Products
      // -----------------------------
      const featuredProducts = await this.productRepository
        .createQueryBuilder("product")
        .leftJoinAndSelect("product.thumbnailImg", "thumbnailImg")
        .where("product.featured = :featured", { featured: true })
        .andWhere("product.published = :published", { published: true })
        .andWhere("product.approved = :approved", { approved: true })
        .orderBy("product.numOfSales", "DESC")
        .addOrderBy("product.createdAt", "DESC")
        .take(featuredProductsLimit)
        .getMany();

      // -----------------------------
      // Query: Random New Arrivals
      // -----------------------------
      const totalProducts = await this.productRepository
        .createQueryBuilder("product")
        .where("product.published = :published", { published: true })
        .andWhere("product.approved = :approved", { approved: true })
        .getCount();

      const newArrivalsToFetch = Math.min(newArrivalsLimit, totalProducts);
      const randomOffset = Math.floor(
        Math.random() * Math.max(0, totalProducts - newArrivalsToFetch)
      );

      const newProducts = await this.productRepository
        .createQueryBuilder("product")
        .leftJoinAndSelect("product.thumbnailImg", "thumbnailImg")
        .where("product.published = :published", { published: true })
        .andWhere("product.approved = :approved", { approved: true })
        .skip(randomOffset)
        .take(newArrivalsToFetch)
        .getMany();

      // -----------------------------
      // Query: Variant Products
      // -----------------------------
      const variantProducts = await this.productRepository
        .createQueryBuilder("product")
        .leftJoinAndSelect("product.thumbnailImg", "thumbnailImg")
        .where("product.isVariant = :isVariant", { isVariant: true })
        .andWhere("product.published = :published", { published: true })
        .andWhere("product.approved = :approved", { approved: true })
        .orderBy("product.createdAt", "DESC")
        .take(dealsLimit)
        .getMany();

      // -----------------------------
      // Query: Popular Categories
      // -----------------------------
      const categories = await this.categoryRepository
        .createQueryBuilder("category")
        .leftJoinAndSelect("category.thumbnailImage", "thumbnailImage")
        .where("category.isActive = :isActive", { isActive: true })
        .andWhere("category.isFeatured = :isFeatured", { isFeatured: true })
        .orderBy("category.updatedAt", "DESC")
        .take(20)
        .getMany();

      // -----------------------------
      // Formatter: Products
      // -----------------------------
      const formatProducts = (products: Product[]) =>
        products.map((product: Product) => ({
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
          thumbnailImg: formatImage(product.thumbnailImg),
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
        }));

      // -----------------------------
      // Formatter: Categories
      // -----------------------------
      const formatCategories = (categories: Category[]) =>
        categories.map((category: Category) => ({
          id: category.id,
          name: category.name,
          slug: category.slug,
          description: category.description,
          isActive: category.isActive,
          isFeatured: category.isFeatured,
          isPopular: category.isPopular,
          thumbnailImageId: category.thumbnailImageId,
          thumbnailImage: formatImage(category.thumbnailImage),
          createdAt: category.createdAt,
          updatedAt: category.updatedAt,
        }));

      // -----------------------------
      // Final Response
      // -----------------------------
      return {
        featured: formatProducts(featuredProducts),
        new: formatProducts(newProducts),
        variant: formatProducts(variantProducts),
        categories: formatCategories(categories),
      };
    } catch (error) {
      console.error("Error fetching custom home data:", error);
      throw error; // preserve stack trace
    }
  }
}
