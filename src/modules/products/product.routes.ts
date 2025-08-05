import { Router } from 'express';
import { AppDataSource } from '../../config/database';
import { Product } from './entities/product.entity';
import { Attribute } from '../attributes/entities/attribute.entity';
import { AttributeValue } from '../attributes/entities/attribute-value.entity';
import { Category } from '../category/category.entity';
import { MediaFile } from '../media/media-file.entity';
import { Seller } from '../seller/entities/seller.entity';
import { User } from '../user/user.entity';
import { SellerService } from '../seller/seller.service';
import { productController } from './product.controller';
import { validateDto } from '../../common/middlewares/validation.middleware';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { authenticate } from '../auth/middlewares/auth.middleware';
import { upload } from '../../common/middlewares/upload.middleware';
import { globalFormDataBoolean } from '../../common/middlewares/global-formdata-boolean';

const router = Router();

// Initialize repositories and services
const productRepository = AppDataSource.getRepository(Product);
const attributeRepository = AppDataSource.getRepository(Attribute);
const attributeValueRepository = AppDataSource.getRepository(AttributeValue);
const categoryRepository = AppDataSource.getRepository(Category);
const mediaRepository = AppDataSource.getRepository(MediaFile);
const sellerRepository = AppDataSource.getRepository(Seller);
const userRepository = AppDataSource.getRepository(User);

// Initialize seller service
const sellerService = new SellerService(
  sellerRepository,
  userRepository,
  productRepository,
  AppDataSource
);

// Initialize controller with seller service
const ctrl = productController(
  productRepository, 
  attributeRepository, 
  attributeValueRepository, 
  categoryRepository, 
  mediaRepository, 
  sellerRepository,
  sellerService
);

// Product CRUD routes
router.post('/store', 
  authenticate, 
  upload.fields([
    { name: 'thumbnailImg', maxCount: 1 },
    { name: 'photos', maxCount: 10 }
  ]), 
  globalFormDataBoolean, 
  validateDto(CreateProductDto), 
  ctrl.createProduct
);

router.get('/all', ctrl.getProducts);

router.get('/category/:categoryId', ctrl.getProductsByCategory);

router.get('/seller/:sellerId', ctrl.getProductsBySeller);

router.get('/slug/:slug', ctrl.getProductBySlug);

router.get('/:id', ctrl.getProduct);

router.put('/update/:id', 
  authenticate, 
  upload.fields([
    { name: 'thumbnailImg', maxCount: 1 },
    { name: 'photos', maxCount: 10 }
  ]), 
  globalFormDataBoolean, 
  validateDto(UpdateProductDto), 
  ctrl.updateProduct
);

router.delete('/:id', authenticate, ctrl.deleteProduct);

export default router; 