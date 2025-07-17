import { Router } from 'express';
import { AppDataSource } from '../../config/database';
import { Cart } from './entities/cart.entity';
import { Product } from '../products/entities/product.entity';
import { Attribute } from '../attributes/entities/attribute.entity';
import { AttributeValue } from '../attributes/entities/attribute-value.entity';
import { cartController } from './cart.controller';
import { validateDto } from '../../common/middlewares/validation.middleware';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { authenticate } from '../auth/middlewares/auth.middleware';

const router = Router();
const cartRepository = AppDataSource.getRepository(Cart);
const productRepository = AppDataSource.getRepository(Product);
const attributeRepository = AppDataSource.getRepository(Attribute);
const attributeValueRepository = AppDataSource.getRepository(AttributeValue);
const ctrl = cartController(cartRepository, productRepository, attributeRepository, attributeValueRepository);

// Cart routes
router.post('/add', validateDto(AddToCartDto), ctrl.addToCart);

router.get('/items', ctrl.getCart);
router.get('/summary', ctrl.getCartSummary);
router.get('/coupon-validation', ctrl.getCartForCouponValidation);
router.put('/:id', validateDto(UpdateCartDto), ctrl.updateCartItem);

router.delete('/remove/:id', ctrl.removeFromCart);

router.delete('/clear', ctrl.clearCart);

export default router; 