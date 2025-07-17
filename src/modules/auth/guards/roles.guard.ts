import { Request, Response, NextFunction } from 'express';

export const RolesGuard = (requiredRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!requiredRoles || requiredRoles.length === 0) {
            return next();
        }

        const user = req.user as any;
        if (!user) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const hasRole = user.roles?.some((role: any) => 
            requiredRoles.includes(role.name)
        );

        if (!hasRole) {
            return res.status(403).json({ message: 'Insufficient permissions' });
        }

        next();
    };
}; 