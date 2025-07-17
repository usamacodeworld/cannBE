import { Router } from 'express';
import { HomeController } from './home.controller';
import { HomeService } from './home.service';
import { validateDto } from '../../common/middlewares/validation.middleware';
import { GetHomeDataQueryDto } from './dto/get-home-data-query.dto';
import { AppDataSource } from '../../config/database';
import { Product } from '../products/entities/product.entity';
import { Category } from '../category/category.entity';
import { MediaFile } from '../media/media-file.entity';

const router = Router();

// Initialize repositories
const productRepository = AppDataSource.getRepository(Product);
const categoryRepository = AppDataSource.getRepository(Category);
const mediaRepository = AppDataSource.getRepository(MediaFile);

// Initialize service and controller
const homeService = new HomeService(productRepository, categoryRepository, mediaRepository);
const homeController = new HomeController(homeService);

// Home page data endpoint - returns all sections in one call
router.get(
  '/',
  validateDto(GetHomeDataQueryDto),
  homeController.getHomeData.bind(homeController)
);

// Individual section endpoints for chunked loading
router.get(
  '/featured-products',
  validateDto(GetHomeDataQueryDto),
  homeController.getFeaturedProducts.bind(homeController)
);

router.get(
  '/new-arrivals',
  validateDto(GetHomeDataQueryDto),
  homeController.getNewArrivals.bind(homeController)
);

router.get(
  '/deals',
  validateDto(GetHomeDataQueryDto),
  homeController.getDeals.bind(homeController)
);

router.get(
  '/products',
  validateDto(GetHomeDataQueryDto),
  homeController.getProducts.bind(homeController)
);

export default router; 