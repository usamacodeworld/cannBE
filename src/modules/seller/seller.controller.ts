import { Request, Response, NextFunction } from 'express';
import { Repository } from 'typeorm';
import { Seller } from './entities/seller.entity';
import { User } from '../user/user.entity';
import { Product } from '../products/entities/product.entity';
import { SellerService } from './seller.service';
import { validateDto } from '../../common/middlewares/validation.middleware';
import { CreateSellerDto } from './dto/create-seller.dto';
import { UpdateSellerDto } from './dto/update-seller.dto';
import { GetSellersQueryDto } from './dto/get-sellers-query.dto';
import { getResponseAPI } from '../../common/getResponseAPI';

export function sellerController(
  sellerRepository: Repository<Seller>,
  userRepository: Repository<User>,
  productRepository: Repository<Product>
) {
  const sellerService = new SellerService(
    sellerRepository,
    userRepository,
    productRepository,
    sellerRepository.manager.connection
  );

  return {
    // Create a new seller
    createSeller: async (req: Request, res: Response, next: NextFunction) => {
      try {
        const seller = await sellerService.createSeller(req.body);
        res.json(getResponseAPI("0", seller));
      } catch (error) {
        next(error);
      }
    },

    // Get all sellers with pagination and filters
    getSellers: async (req: Request, res: Response, next: NextFunction) => {
      try {
        const query = req.validatedQuery || req.query as unknown as GetSellersQueryDto;
        const result = await sellerService.getSellers(query);
        res.json(getResponseAPI("0", result));
      } catch (error) {
        next(error);
      }
    },

    // Get seller by ID
    getSellerById: async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { id } = req.params;
        const { includeUser, includeProducts } = req.query;
        
        const seller = await sellerService.getSellerById(
          id,
          includeUser === 'true',
          includeProducts === 'true'
        );
        
        res.json(getResponseAPI("0", seller));
      } catch (error) {
        next(error);
      }
    },

    // Get seller by user ID
    getSellerByUserId: async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { userId } = req.params;
        const seller = await sellerService.getSellerByUserId(userId);
        res.json(getResponseAPI("0", seller));
      } catch (error) {
        next(error);
      }
    },

    // Update seller
    updateSeller: async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { id } = req.params;
        const seller = await sellerService.updateSeller(id, req.body);
        res.json(getResponseAPI("0", seller));
      } catch (error) {
        next(error);
      }
    },

    // Approve seller
    approveSeller: async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { id } = req.params;
        const user = (req as any).user;
        const seller = await sellerService.approveSeller(id, user?.id || 'admin');
        res.json(getResponseAPI("0", seller));
      } catch (error) {
        next(error);
      }
    },

    // Reject seller
    rejectSeller: async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { id } = req.params;
        const { rejectionReason } = req.body;
        const user = (req as any).user;
        
        if (!rejectionReason) {
          throw new Error('Rejection reason is required');
        }
        
        const seller = await sellerService.rejectSeller(id, rejectionReason, user?.id || 'admin');
        res.json(getResponseAPI("0", seller));
      } catch (error) {
        next(error);
      }
    },

    // Suspend seller
    suspendSeller: async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { id } = req.params;
        const { reason } = req.body;
        
        if (!reason) {
          throw new Error('Suspension reason is required');
        }
        
        const seller = await sellerService.suspendSeller(id, reason);
        res.json(getResponseAPI("0", seller));
      } catch (error) {
        next(error);
      }
    },

    // Delete seller
    deleteSeller: async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { id } = req.params;
        await sellerService.deleteSeller(id);
        res.json(getResponseAPI("0", { message: 'Seller deleted successfully' }));
      } catch (error) {
        next(error);
      }
    },

    // Get seller statistics
    getSellerStats: async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { id } = req.params;
        const stats = await sellerService.getSellerStats(id);
        res.json(getResponseAPI("0", stats));
      } catch (error) {
        next(error);
      }
    },

    // Sync all sellers' product counts (Admin only)
    syncAllSellerProductCounts: async (req: Request, res: Response, next: NextFunction) => {
      try {
        await sellerService.updateAllSellersProductCounts();
        res.json(getResponseAPI("0", { message: "All seller product counts synced successfully" }));
      } catch (error) {
        next(error);
      }
    }
  };
} 