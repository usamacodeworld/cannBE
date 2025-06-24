import { Request, Response } from 'express';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { ProductService } from './product.service';
import { v4 as uuidv4 } from 'uuid';
import slug from 'slug';
import { GetProductsQueryDto } from './dto/get-products-query.dto';

export function productController(
  productRepository: Repository<Product>,
  variantRepository: Repository<ProductVariant>
) {
  const productService = new ProductService(productRepository, variantRepository);

  return {
    createProduct: async (req: Request, res: Response) => {
      try {
        const productData = req.body;
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

        const product = await productService.createProduct(
          productData,
          user,
          slugToUse,
          req.file,
          req.files && Array.isArray(req.files) ? req.files : req.files?.['photos'] || []
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
        const product = await productService.updateProduct(
          req.params.id,
          req.body,
          req.file,
          req.files && Array.isArray(req.files) ? req.files : req.files?.['photos'] || []
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