import { Request, Response, NextFunction } from "express";

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const start = Date.now();
  const authHeader = req.headers.authorization;

  // Enhanced auth diagnostics
  let authDiagnostic = "No auth header";
  let tokenLength = 0;

  if (authHeader) {
    const [scheme, token] = authHeader.trim().split(/\s+/);
    tokenLength = token?.length || 0;

    authDiagnostic = scheme ? `Scheme: ${scheme}` : "Invalid scheme";
    authDiagnostic += token ? ` | Token length: ${tokenLength}` : "";
  }

  console.log("\n=== Incoming Request ===");
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  
  // Log request headers
  console.log("Headers:", {
    "content-type": req.headers["content-type"],
    "user-agent": req.headers["user-agent"],
    origin: req.headers["origin"],
    "content-length": req.headers["content-length"],
    host: req.headers["host"],
  });

  // Log auth information
  console.log("Auth:", authDiagnostic);

  // Log request body (for non-GET requests)
  if (req.method !== 'GET' && req.body && Object.keys(req.body).length > 0) {
    console.log("Request Body:", JSON.stringify(req.body, null, 2));
  }

  // Log query parameters
  if (req.query && Object.keys(req.query).length > 0) {
    console.log("Query Parameters:", req.query);
  }

  // Log URL parameters
  if (req.params && Object.keys(req.params).length > 0) {
    console.log("URL Parameters:", req.params);
  }

  // Capture response details
  res.on("finish", () => {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    const statusMessage = res.statusMessage || '';
    
    console.log(`[${new Date().toISOString()}] Response: ${statusCode} ${statusMessage} - ${duration}ms`);

    // Log response body for errors (if available)
    if (statusCode >= 400) {
      console.log("Error Status Code:", statusCode);
      
      // Log auth error details
      if (statusCode === 401 && res.locals.authError) {
        console.log("Auth Error:", res.locals.authError);
      }

      // Log validation errors if available
      if (res.locals.validationErrors) {
        console.log("Validation Errors:", res.locals.validationErrors);
      }

      // Log error information from error handler
      if (res.locals.error) {
        console.log("Error Details:", {
          message: res.locals.error.message,
          name: res.locals.error.name,
          stack: res.locals.error.stack
        });
      }
    }

    // Log response headers for debugging
    console.log("Response Headers:", {
      "content-type": res.getHeader("content-type"),
      "content-length": res.getHeader("content-length"),
    });

    console.log("=== End Request ===\n");
  });

  // Handle response errors
  res.on("error", (error) => {
    console.error("Response Error:", error);
    console.log("=== End Request with Error ===\n");
  });

  next();
};
