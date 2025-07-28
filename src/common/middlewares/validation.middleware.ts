import { Request, Response, NextFunction } from "express";
import { validate, ValidationError } from "class-validator";
import { plainToInstance } from "class-transformer";
import { ParsedQs } from "qs";

// Extend Express Request type to include validatedQuery
declare global {
  namespace Express {
    interface Request {
      validatedQuery?: any;
    }
  }
}

export const validateDto = (
  dtoClass: any,
  source: "body" | "query" = "body"
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    console.log("=== Validation Debug ===");
    console.log("Request body:", req.body);
    console.log("DTO Class:", dtoClass.name);

    // Get data from the specified source
    const data = source === "body" ? req.body : req.query;

    // If no data is provided, create an empty instance with default values
    const dtoObject = plainToInstance(dtoClass, data || {});
    console.log("Transformed DTO object:", dtoObject);

    const errors = await validate(dtoObject, {
      whitelist: true,
      forbidNonWhitelisted: true,
      validationError: { target: false },
    });

    console.log("Validation errors:", errors);

    if (errors.length > 0) {
      const formattedErrors = errors.map((error: ValidationError) => {
        console.log("Processing error:", error);
        if (error.constraints) {
          return {
            field: error.property,
            message: Object.values(error.constraints)[0],
          };
        }
        return {
          field: error.property,
          message: "Invalid value",
        };
      });

      // Store validation errors in res.locals for logging
      res.locals.validationErrors = formattedErrors;

      console.log("Formatted errors:", formattedErrors);
      res.status(400).json({
        status: "error",
        message: "Validation failed",
        errors: formattedErrors,
      });
      return;
    }

    console.log("Validation passed, proceeding to next middleware");
    // Store validated data in the appropriate request property
    if (source === "body") {
      req.body = dtoObject;
    } else {
      req.validatedQuery = dtoObject;
    }
    next();
  };
};
