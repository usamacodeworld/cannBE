import { Request, Response } from "express";
import { Repository } from "typeorm";
import { Product } from "./entities/product.entity";
import { Attribute } from "../attributes/entities/attribute.entity";
import { AttributeValue } from "../attributes/entities/attribute-value.entity";
import { Category } from "../category/category.entity";
import { MediaFile } from "../media/media-file.entity";
import { Seller } from "../seller/entities/seller.entity";
import { ProductService } from "./product.service";
import { SellerService } from "../seller/seller.service";
import { cuid } from "../../libs/cuid";
import slug from "slug";
import { GetProductsQueryDto } from "./dto/get-products-query.dto";
import { Router } from "express";
import { AppDataSource } from "../../config/database";
import { validateDto } from "../../common/middlewares/validation.middleware";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { authenticate } from "../auth/middlewares/auth.middleware";
import { upload } from "../../common/middlewares/upload.middleware";
import { globalFormDataBoolean } from "../../common/middlewares/global-formdata-boolean";
import { BaseController } from "../../common/controllers/base.controller";
import { User } from "../user/user.entity";

class ProductController extends BaseController {
  private productService: ProductService;

  constructor(
    productRepository: Repository<Product>,
    attributeRepository: Repository<Attribute>,
    attributeValueRepository: Repository<AttributeValue>,
    categoryRepository: Repository<Category>,
    mediaRepository: Repository<MediaFile>,
    sellerRepository: Repository<Seller>,
    sellerService: SellerService
  ) {
    super();
    this.productService = new ProductService(
      productRepository,
      attributeRepository,
      attributeValueRepository,
      categoryRepository,
      mediaRepository,
      sellerRepository,
      sellerService
    );
  }

  createProduct = async (req: Request, res: Response) => {
    try {
      const productData = this.parseRequestData(req);
      const user = this.checkAuthentication(req);
      const slugToUse =
        productData.slug || slug(productData.name, { lower: true });

      const { thumbnailImg: thumbnailFile, photos: photosFiles } =
        this.extractFiles(req, ["thumbnailImg", "photos"]);

      const product = await this.productService.createProduct(
        productData,
        user,
        slugToUse
      );

      this.createSuccessResponse(
        res,
        "Product created successfully",
        product,
        201
      );
    } catch (error: any) {
      this.handleAsyncError(res, error, "Failed to create product");
    }
  };

  getProducts = async (req: Request, res: Response) => {
    try {
      const query = req.query as unknown as GetProductsQueryDto;
      const products = await this.productService.findAll(query);

      this.createSuccessResponse(
        res,
        "Products retrieved successfully",
        products
      );
    } catch (error: any) {
      this.handleAsyncError(res, error, "Failed to retrieve products", 500);
    }
  };

  getProduct = async (req: Request, res: Response) => {
    try {
      const product = await this.productService.findOne(req.params.id);

      this.createSuccessResponse(
        res,
        "Product retrieved successfully",
        product
      );
    } catch (error: any) {
      this.handleAsyncError(res, error, "Product not found", 404);
    }
  };

  updateProduct = async (req: Request, res: Response) => {
    try {
      const updateData = this.parseRequestData(req);

      const product = await this.productService.updateProduct(
        req.params.id,
        updateData
      );

      this.createSuccessResponse(res, "Product updated successfully", product);
    } catch (error: any) {
      this.handleAsyncError(res, error, "Failed to update product");
    }
  };

  deleteProduct = async (req: Request, res: Response) => {
    try {
      await this.productService.removeProduct(req.params.id);

      this.createSuccessResponse(res, "Product deleted successfully", null);
    } catch (error: any) {
      this.handleAsyncError(res, error, "Failed to delete product", 404);
    }
  };

  getProductsByCategory = async (req: Request, res: Response) => {
    try {
      const { categoryId } = req.params;
      const query = req.query as unknown as GetProductsQueryDto;
      const products = await this.productService.findByCategoryId(categoryId, query);
      this.createSuccessResponse(res, "Products retrieved successfully", products);
    } catch (error: any) {
      this.handleAsyncError(res, error, "Failed to retrieve products for category", 500);
    }
  };

  getProductBySlug = async (req: Request, res: Response) => {
    try {
      const product = await this.productService.findBySlug(req.params.slug);
      this.createSuccessResponse(res, "Product retrieved successfully", product);
    } catch (error: any) {
      this.handleAsyncError(res, error, "Product not found", 404);
    }
  };

  getProductsBySeller = async (req: Request, res: Response) => {
    try {
      const { sellerId } = req.params;
      const query = req.query as unknown as GetProductsQueryDto;
      const products = await this.productService.findBySellerId(sellerId, query);
      this.createSuccessResponse(res, "Products retrieved successfully", products);
    } catch (error: any) {
      this.handleAsyncError(res, error, "Failed to retrieve products for seller", 500);
    }
  };
}

export function productController(
  productRepository: Repository<Product>,
  attributeRepository: Repository<Attribute>,
  attributeValueRepository: Repository<AttributeValue>,
  categoryRepository: Repository<Category>,
  mediaRepository: Repository<MediaFile>,
  sellerRepository: Repository<Seller>,
  sellerService: SellerService
) {
  const controller = new ProductController(
    productRepository,
    attributeRepository,
    attributeValueRepository,
    categoryRepository,
    mediaRepository,
    sellerRepository,
    sellerService
  );

  return {
    createProduct: controller.createProduct,
    getProducts: controller.getProducts,
    getProduct: controller.getProduct,
    updateProduct: controller.updateProduct,
    deleteProduct: controller.deleteProduct,
    getProductsByCategory: controller.getProductsByCategory,
    getProductBySlug: controller.getProductBySlug,
    getProductsBySeller: controller.getProductsBySeller,
  };
}

const router = Router();

export default router;
