import { Router as r } from "express";
import userRoutes from "./modules/role/routes/user.routes";
import categoryRoutes from "./modules/category/category.routes";
import attributeRoutes from "./modules/attributes/attribute.routes";
import productRoutes from "./modules/products/product.routes";
import mediaRoutes from "./modules/media/media.routes";

const Router = r();

Router.use("/", userRoutes, attributeRoutes);
Router.use("/categories", categoryRoutes);
Router.use("/products", productRoutes);
Router.use("/media", mediaRoutes);

export { Router };
