import { Request, Response, NextFunction } from 'express';
import { USER_TYPE } from '../../../constants/user';
import { AuthError } from '../errors/auth.error';

export function requireUserType(allowedTypes: USER_TYPE[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user as any;
      
      if (!user) {
        throw new AuthError('Authentication required', 401);
      }

      if (!user.type) {
        throw new AuthError('User type not found', 403);
      }

      if (!allowedTypes.includes(user.type)) {
        throw new AuthError(
          `Access denied. This endpoint is only available for: ${allowedTypes.join(', ')}`, 
          403
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

// Convenience middlewares for specific user types
export const requireAdmin = requireUserType([USER_TYPE.ADMIN]);
export const requireSeller = requireUserType([USER_TYPE.SELLER]);
export const requireBuyer = requireUserType([USER_TYPE.BUYER]);
export const requireAdminOrSeller = requireUserType([USER_TYPE.ADMIN, USER_TYPE.SELLER]);
export const requireAdminOrBuyer = requireUserType([USER_TYPE.ADMIN, USER_TYPE.BUYER]); 