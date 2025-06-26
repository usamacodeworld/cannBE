import { Router } from 'express';
import { AppDataSource } from '../../config/database';
import { Product } from './entities/product.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { productController } from './product.controller';
import { validateDto } from '../../common/middlewares/validation.middleware';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';
import { authenticate } from '../auth/middlewares/auth.middleware';
import { upload } from '../../common/middlewares/upload.middleware';
import { globalFormDataBoolean } from '../../common/middlewares/global-formdata-boolean';
import { parseVariationsMiddleware } from '../../common/middlewares/parse-variations.middleware';

const router = Router();
const productRepository = AppDataSource.getRepository(Product);
const variantRepository = AppDataSource.getRepository(ProductVariant);
const ctrl = productController(productRepository, variantRepository);

// More flexible multer configuration that accepts any field
export const uploadProductImages = upload.any();

// Product CRUD
router.post(
  '/store',
  authenticate,
  uploadProductImages,
  globalFormDataBoolean,
  parseVariationsMiddleware,
  validateDto(CreateProductDto),
  ctrl.createProduct
);
router.get('/all', authenticate, ctrl.getProducts);
router.get('/:id', ctrl.getProduct);
router.put(
  '/update/:id',
  uploadProductImages,
  globalFormDataBoolean,
  parseVariationsMiddleware,
  validateDto(UpdateProductDto),
  ctrl.updateProduct
);
router.delete('/:id', ctrl.deleteProduct);

// Product Variant CRUD (nested under product)
router.post('/:productId/variants', validateDto(CreateProductVariantDto), ctrl.createVariant);
router.get('/:productId/variants', ctrl.getVariants);

// Single variant endpoints
router.get('/variants/:variantId', ctrl.getVariant);
router.put('/variants/:variantId', validateDto(UpdateProductVariantDto), ctrl.updateVariant);
router.delete('/variants/:variantId', ctrl.deleteVariant);

export default router; 