import { Router as r } from "express";
import userRoutes from "./modules/user/user.routes";
import categoryRoutes from "./modules/category/category.routes";
import attributeRoutes from "./modules/attributes/attribute.routes";
import productRoutes from "./modules/products/product.routes";
import mediaRoutes from "./modules/media/media.routes";
import cartRoutes from "./modules/cart/cart.routes";
import homeRoutes from "./modules/home/home.routes";
import checkoutRoutes from "./modules/checkout/checkout.routes";
import addressRoutes from "./modules/address/address.routes";
import sellerRoutes from "./modules/seller/seller.routes";
import { shippingRoutes } from "./modules/shipping";
import categoryRestrictionRoutes from "./modules/category-restrictions/category-restriction.routes";
import couponRoutes from "./modules/coupon/coupon.routes";
import orderRoutes from "./modules/order/order.routes";

const Router = r();

Router.use("/users", userRoutes);
Router.use("/attributes", attributeRoutes);
Router.use("/categories", categoryRoutes);
Router.use("/products", productRoutes);
Router.use("/media", mediaRoutes);
Router.use("/cart", cartRoutes);
Router.use("/home", homeRoutes);
Router.use("/checkout", checkoutRoutes);
Router.use("/addresses", addressRoutes);
Router.use("/sellers", sellerRoutes);
Router.use("/shipping", shippingRoutes);
Router.use("/category-restrictions", categoryRestrictionRoutes);
Router.use("/coupons", couponRoutes);
Router.use("/orders", orderRoutes);

export { Router };
