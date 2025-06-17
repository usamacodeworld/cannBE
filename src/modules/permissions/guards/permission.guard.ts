import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSION_TYPE } from '../entities/permission.entity';
import { User } from '../../user/entities/user.entity';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<PERMISSION_TYPE[]>('permissions', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      return false;
    }

    return this.hasPermissions(user, requiredPermissions);
  }

  private hasPermissions(user: User, requiredPermissions: PERMISSION_TYPE[]): boolean {
    if (!user.roles) {
      return false;
    }

    const userPermissions = new Set<PERMISSION_TYPE>();
    
    // Collect all permissions from user's roles
    user.roles.forEach(role => {
      if (role.permissions) {
        role.permissions.forEach(permission => {
          userPermissions.add(permission.name);
        });
      }
    });

    // Check if user has all required permissions
    return requiredPermissions.every(permission => userPermissions.has(permission));
  }
} 