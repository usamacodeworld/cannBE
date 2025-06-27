import "reflect-metadata";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { AppDataSource } from "./config/database";
import { Router as V1Router } from "./apiV1.routes";
import authRoutes from "./modules/auth/routes/auth.routes";
import { requestLogger } from "./common/middlewares/request-logger.middleware";
import { filtersToWhereJson } from "./common/middlewares/filtersToWhereJson";
import qs from "qs";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/v1", V1Router);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});
app.get("/", (req, res) => {
  res.json({ status: "ok" });
});

// Error handling middleware (must be after routes)
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    // Log the error details
    console.error("=== Error Handler ===");
    console.error("Error:", err.message);
    console.error("Stack:", err.stack);
    console.error("URL:", req.originalUrl);
    console.error("Method:", req.method);
    console.error("Body:", req.body);
    console.error("Query:", req.query);
    console.error("Params:", req.params);
    console.error("=== End Error Handler ===");

    // Set error information in res.locals for the request logger
    res.locals.error = {
      message: err.message,
      stack: err.stack,
      name: err.name
    };

    // Determine status code
    let statusCode = 500;
    if (err.statusCode) {
      statusCode = err.statusCode;
    } else if (err.status) {
      statusCode = err.status;
    }

    // Send error response
    res.status(statusCode).json({ 
      message: err.message || "Something went wrong!",
      status: "error",
      code: statusCode,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }
);

// Initialize TypeORM
AppDataSource.initialize()
  .then(() => {
    console.log("Database connected successfully");

    // Start servers
    const PORT_IP = Number(process.env.PORT_IP) || 3001;
    const PORT_LOCAL = Number(process.env.PORT_LOCAL) || 3001;
    const HOST_IP = process.env.HOST_IP || "192.168.100.79";

    // Start server on IP address
    app.listen(PORT_IP, HOST_IP, () => {
      console.log(`Server is running on http://${HOST_IP}:${PORT_IP}`);
    });

    // Start server on localhost
    app.listen(PORT_LOCAL, "localhost", () => {
      console.log(`Server is running on http://localhost:${PORT_LOCAL}`);
    });
  })
  .catch((error) => console.error("Error connecting to database:", error));
