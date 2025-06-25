import { Request, Response } from 'express';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { ProductService } from './product.service';
import { v4 as uuidv4 } from 'uuid';
import slug from 'slug';
import { GetProductsQueryDto } from './dto/get-products-query.dto';
import { Router } from 'express';
import { AppDataSource } from '../../config/database';
import { validateDto } from '../../common/middlewares/validation.middleware';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';
import { authenticate } from '../auth/middlewares/auth.middleware';
import { upload } from '../../common/middlewares/upload.middleware';
import { globalFormDataBoolean } from '../../common/middlewares/global-formdata-boolean';

export function productController(
  productRepository: Repository<Product>,
  variantRepository: Repository<ProductVariant>
) {
  const productService = new ProductService(productRepository, variantRepository);

  return {
    createProduct: async (req: Request, res: Response) => {
      try {
        // Handle both JSON and form-data
        let productData: any;
        
        // Check if data is sent as JSON in body or as form field
        if (req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0) {
          // If body has data field, use that, otherwise use the whole body
          if (req.body.data) {
            try {
              productData = typeof req.body.data === 'string' ? JSON.parse(req.body.data) : req.body.data;
            } catch {
              productData = req.body;
            }
          } else {
            productData = req.body;
          }
        } else {
          res.status(400).json({
            message: 'Product data is required',
            requestId: uuidv4(),
            data: null,
            code: 1
          });
          return;
        }

        const user = req.user;

        if (!user) {
          res.status(401).json({
            message: 'Authentication required',
            requestId: uuidv4(),
            data: null,
            code: 1
          });
          return;
        }

        const slugToUse = productData.slug ? productData.slug : slug(productData.name, { lower: true });

        // Extract files from the flexible multer configuration
        const files = req.files as Express.Multer.File[];
        const thumbnailFile = files?.find(f => f.fieldname === 'thumbnailImg' || f.fieldname === 'thumbnail_img' || f.fieldname === 'thumbnail');
        const photosFiles = files?.filter(f => f.fieldname === 'photos' || f.fieldname.startsWith('photos'));
        const variantImageFiles = files?.filter(f => f.fieldname === 'variant_images' || f.fieldname.startsWith('variant_images'));

        const product = await productService.createProduct(
          productData,
          user,
          slugToUse,
          thumbnailFile,
          photosFiles,
          variantImageFiles
        );
        res.status(201).json({
          message: 'Product created successfully',
          requestId: uuidv4(),
          data: product,
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
    getProducts: async (req: Request, res: Response) => {
      try {
        const query = req.query as unknown as GetProductsQueryDto;
        const products = await productService.findAll(query);
        res.json({
          message: 'Products retrieved successfully',
          requestId: uuidv4(),
          data: products,
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
    getProduct: async (req: Request, res: Response) => {
      try {
        const product = await productService.findOne(req.params.id);
        res.json({
          message: 'Product retrieved successfully',
          requestId: uuidv4(),
          data: product,
          code: 0
        });
      } catch (error: any) {
        res.status(404).json({
          message: error.message,
          requestId: uuidv4(),
          data: null,
          code: 1
        });
      }
    },
    updateProduct: async (req: Request, res: Response) => {
      try {
        // Handle both JSON and form-data
        let updateData: any;
        
        // Check if data is sent as JSON in body or as form field
        if (req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0) {
          // If body has data field, use that, otherwise use the whole body
          if (req.body.data) {
            try {
              updateData = typeof req.body.data === 'string' ? JSON.parse(req.body.data) : req.body.data;
            } catch {
              updateData = req.body;
            }
          } else {
            updateData = req.body;
          }
        } else {
          updateData = {};
        }

        // Extract files from the flexible multer configuration
        const files = req.files as Express.Multer.File[];
        const thumbnailFile = files?.find(f => f.fieldname === 'thumbnailImg' || f.fieldname === 'thumbnail_img' || f.fieldname === 'thumbnail');
        const photosFiles = files?.filter(f => f.fieldname === 'photos' || f.fieldname.startsWith('photos'));
        const variantImageFiles = files?.filter(f => f.fieldname === 'variant_images' || f.fieldname.startsWith('variant_images'));

        const product = await productService.updateProduct(
          req.params.id,
          updateData,
          thumbnailFile,
          photosFiles,
          variantImageFiles
        );
        res.json({
          message: 'Product updated successfully',
          requestId: uuidv4(),
          data: product,
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
    deleteProduct: async (req: Request, res: Response) => {
      try {
        await productService.removeProduct(req.params.id);
        res.status(200).json({
          message: 'Product deleted successfully',
          requestId: uuidv4(),
          data: null,
          code: 0
        });
      } catch (error: any) {
        res.status(404).json({
          message: error.message,
          requestId: uuidv4(),
          data: null,
          code: 1
        });
      }
    },
    // Variant endpoints
    createVariant: async (req: Request, res: Response) => {
      try {
        const variant = await productService.createVariant(req.params.productId, req.body);
        res.status(201).json({
          message: 'Variant created successfully',
          requestId: uuidv4(),
          data: variant,
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
    getVariants: async (req: Request, res: Response) => {
      try {
        const variants = await productService.findAllVariants(req.params.productId);
        res.json({
          message: 'Variants retrieved successfully',
          requestId: uuidv4(),
          data: variants,
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
    getVariant: async (req: Request, res: Response) => {
      try {
        const variant = await productService.findVariant(req.params.variantId);
        res.json({
          message: 'Variant retrieved successfully',
          requestId: uuidv4(),
          data: variant,
          code: 0
        });
      } catch (error: any) {
        res.status(404).json({
          message: error.message,
          requestId: uuidv4(),
          data: null,
          code: 1
        });
      }
    },
    updateVariant: async (req: Request, res: Response) => {
      try {
        const variant = await productService.updateVariant(req.params.variantId, req.body);
        res.json({
          message: 'Variant updated successfully',
          requestId: uuidv4(),
          data: variant,
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
    deleteVariant: async (req: Request, res: Response) => {
      try {
        await productService.removeVariant(req.params.variantId);
        res.status(200).json({
          message: 'Variant deleted successfully',
          requestId: uuidv4(),
          data: null,
          code: 0
        });
      } catch (error: any) {
        res.status(404).json({
          message: error.message,
          requestId: uuidv4(),
          data: null,
          code: 1
        });
      }
    },
  };
}

const router = Router();
const productRepository = AppDataSource.getRepository(Product);
const variantRepository = AppDataSource.getRepository(ProductVariant);
const ctrl = productController(productRepository, variantRepository); 