// src/common/middlewares/global-formdata-boolean.ts
import { Request, Response, NextFunction } from "express";

export const globalFormDataBoolean = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const booleanFields = ["isActive", "isFeatured", "isPopular", "isParent", "approved", "published", "featured", "cashOnDelivery", "isVariant"];

  // Handle both JSON and FormData bodies
  const body = req.body as Record<string, any>;

  for (const field of booleanFields) {
    if (body[field] !== undefined) {
      // Handle both string and boolean values
      const value = body[field];

      if (typeof value === "string") {
        body[field] = value.toLowerCase() === "true" || value === "1";
      } else if (typeof value === "boolean") {
        // Already boolean, no conversion needed
        body[field] = value;
      } else {
        // Fallback to false for unexpected types
        body[field] = false;
      }
    }
  }
  next();
};
