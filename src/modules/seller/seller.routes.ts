import { Router } from 'express';
import { AppDataSource } from '../../config/database';
import { Seller } from './entities/seller.entity';
import { User } from '../user/user.entity';
import { Product } from '../products/entities/product.entity';
import { sellerController } from './seller.controller';
import { validateDto } from '../../common/middlewares/validation.middleware';
import { CreateSellerDto } from './dto/create-seller.dto';
import { UpdateSellerDto } from './dto/update-seller.dto';
import { GetSellersQueryDto } from './dto/get-sellers-query.dto';
// import { authenticate } from '../auth/middlewares/auth.middleware';
// import { RolesGuard } from '../auth/guards/roles.guard';
// import { USER_TYPE } from '../../constants/user';

const router = Router();

// Initialize repositories
const sellerRepository = AppDataSource.getRepository(Seller);
const userRepository = AppDataSource.getRepository(User);
const productRepository = AppDataSource.getRepository(Product);

// Initialize controller
const controller = sellerController(sellerRepository, userRepository, productRepository);

// Public routes
router.post('/', validateDto(CreateSellerDto), controller.createSeller);
router.get('/', validateDto(GetSellersQueryDto, 'query'), controller.getSellers);
router.get('/:id', controller.getSellerById);
router.get('/user/:userId', controller.getSellerByUserId);

// Protected routes - require authentication
// router.use(authenticate);

// Seller dashboard routes (seller can access their own data)
router.get('/profile/me', controller.getSellerByUserId);
router.put('/profile/me', validateDto(UpdateSellerDto), controller.updateSeller);
router.get('/profile/me/stats', controller.getSellerStats);

// Admin routes - require admin role
router.put('/:id', validateDto(UpdateSellerDto), controller.updateSeller);
router.post('/:id/approve', controller.approveSeller);
router.post('/:id/reject', controller.rejectSeller);
router.post('/:id/suspend', controller.suspendSeller);
router.delete('/:id', controller.deleteSeller);
router.get('/:id/stats', controller.getSellerStats);
router.post('/sync-product-counts', controller.syncAllSellerProductCounts);

export default router; 