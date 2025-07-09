import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { validateDto } from '../../../common/middlewares/validation.middleware';
import { LoginDto } from '../dto/login.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { authenticate } from '../middlewares/auth.middleware';
import { requireAdmin, requireSeller, requireBuyer } from '../middlewares/user-type.middleware';

const router = Router();

// Public routes
router.post('/login', validateDto(LoginDto), authController.login);
router.post('/refresh-token', validateDto(RefreshTokenDto), authController.refreshToken);



router.get('/admin-only', authenticate, requireAdmin, (req, res) => {
  res.json({ message: 'Admin only endpoint', user: req.user });
});

router.get('/seller-only', authenticate, requireSeller, (req, res) => {
  res.json({ message: 'Seller only endpoint', user: req.user });
});

router.get('/buyer-only', authenticate, requireBuyer, (req, res) => {
  res.json({ message: 'Buyer only endpoint', user: req.user });
});

export default router; 