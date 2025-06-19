import "reflect-metadata";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { AppDataSource } from "./config/database";
import authRoutes from "./modules/auth/routes/auth.routes";
import userRoutes from "./modules/role/routes/user.routes";
import categoryRoutes from "./modules/category/category.routes";
import attributeRoutes from "./modules/attributes/attribute.routes";
import productRoutes from "./modules/products/product.routes";
import { requestLogger } from "./common/middlewares/request-logger.middleware";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(requestLogger);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/attributes", attributeRoutes);
app.use("/api/products", productRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});
app.get("/", (req, res) => {
  res.json({ status: "ok" });
});

// Error handling
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).json({ message: "Something went wrong!" });
  }
);

// Initialize TypeORM
AppDataSource.initialize()
  .then(() => {
    console.log("Database connected successfully");

    // Start servers
    const PORT_IP = Number(process.env.PORT_IP) || 3001;
    const PORT_LOCAL = Number(process.env.PORT_LOCAL) || 3001;
    const HOST_IP = process.env.HOST_IP || '192.168.100.79';

    // Start server on IP address
    app.listen(PORT_IP, HOST_IP, () => {
      console.log(`Server is running on http://${HOST_IP}:${PORT_IP}`);
    });

    // Start server on localhost
    app.listen(PORT_LOCAL, 'localhost', () => {
      console.log(`Server is running on http://localhost:${PORT_LOCAL}`);
    });
  })
  .catch((error) => console.error("Error connecting to database:", error));
