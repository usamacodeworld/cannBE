import { Request, Response, NextFunction } from 'express';

export function parseVariationsMiddleware(req: Request, res: Response, next: NextFunction) {
  if (req.body && req.body.variations && typeof req.body.variations === 'string') {
    try {
      const parsed = JSON.parse(req.body.variations);
      if (Array.isArray(parsed)) {
        req.body.variations = parsed;
      } else if (typeof parsed === 'object') {
        req.body.variations = [parsed];
      } else {
        req.body.variations = [];
      }
    } catch (e) {
      req.body.variations = [];
    }
  }
  next();
} 