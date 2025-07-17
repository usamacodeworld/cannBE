import { Request, Response, NextFunction } from 'express';
import { PERMISSION_TYPE } from '../entities/permission.entity';
import { User } from '../../user/user.entity';
import { getResponseAPI } from '../../../common/getResponseAPI';
import { RES_CODE } from '../../../constants/responseCode';

export const requirePermissions = (requiredPermissions: PERMISSION_TYPE[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as any).user as User;
    
    if (!user) {
      res.status(401).json(
        getResponseAPI(RES_CODE[401], { message: 'Authentication required' })
      );
      return;
    }

    if (!user.roles) {
      res.status(403).json(
        getResponseAPI(RES_CODE[403], { message: 'No roles assigned' })
      );
      return;
    }

    const userPermissions = new Set<PERMISSION_TYPE>();
    
    // Collect all permissions from user's roles
    user.roles.forEach((role: any) => {
      if (role.permissions) {
        role.permissions.forEach((permission: any) => {
          userPermissions.add(permission.name);
        });
      }
    });

    // Check if user has all required permissions
    const hasAllPermissions = requiredPermissions.every(permission => 
      userPermissions.has(permission)
    );

    if (!hasAllPermissions) {
      res.status(403).json(
        getResponseAPI(RES_CODE[403], { 
          message: 'Insufficient permissions',
          requiredPermissions
        })
      );
      return;
    }

    next();
  };
}; 