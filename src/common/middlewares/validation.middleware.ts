import { Request, Response, NextFunction } from "express";
import { validate, ValidationError } from "class-validator";
import { plainToInstance } from "class-transformer";

export const validateDto = (dtoClass: any) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // console.log("=== Validation Debug ===");
    // console.log("Request body:", req.body);
    // console.log("DTO Class:", dtoClass.name);

    const dtoObject = plainToInstance(dtoClass, req.body);
    // console.log("Transformed DTO object:", dtoObject);

    const errors = await validate(dtoObject, {
      whitelist: true,
      forbidNonWhitelisted: true,
      validationError: { target: false },
    });

    // console.log("Validation errors:", errors);

    if (errors.length > 0) {
      const formattedErrors = errors.map((error: ValidationError) => {
        // console.log("Processing error:", error);
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

      // console.log("Formatted errors:", formattedErrors);
      res.status(400).json({
        status: "error",
        message: "Validation failed",
        errors: formattedErrors,
      });
      return;
    }

    // console.log("Validation passed, proceeding to next middleware");
    req.body = dtoObject;
    next();
  };
};
