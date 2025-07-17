import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getRepository } from 'typeorm';
import { User } from '../../user/user.entity';

export const JwtAuthGuard = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
        const userRepository = getRepository(User);
        const user = await userRepository.findOne({ 
            where: { id: decoded.userId },
            relations: ['roles', 'roles.permissions']
        });

        if (!user) {
            return res.status(401).json({ message: 'Invalid token' });
        }

        (req as any).user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
}; 