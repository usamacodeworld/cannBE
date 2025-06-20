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
  // console.log("Incoming Request ===> ", req.headers);
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  // console.log("Auth:", authDiagnostic);
  // console.log("Headers:", {
  //   "content-type": req.headers["content-type"],
  //   "user-agent": req.headers["user-agent"],
  //   origin: req.headers["origin"],
  //   "content-length": req.headers["content-length"],
  //   host: req.headers["host"],
  // });

  // Capture response details
  // res.on("finish", () => {
  //   const duration = Date.now() - start;
  //   console.log(
  //     `[${new Date().toISOString()}] Response: ${
  //       res.statusCode
  //     } - ${duration}ms`
  //   );

  //   // Log auth error details
  //   if (res.statusCode === 401 && res.locals.authError) {
  //     console.log("Auth Error:", res.locals.authError);
  //   }

  //   console.log("=== End Request ===\n");
  // });

  next();
};
