import { Router } from "express";
import { AppDataSource } from "../../config/database";
import { Order } from "../checkout/entities/order.entity";
import { orderController } from "./order.controller";
import { authenticate } from "../auth/middlewares/auth.middleware";
import { RequirePermissions } from "../permissions/decorators/require-permissions.decorator";
import { PERMISSION_TYPE } from "../permissions/entities/permission.entity";
import { OrderService } from "./order.service";

const router = Router();
const orderRepository = AppDataSource.getRepository(Order);
const ctrl = orderController(new OrderService(orderRepository));

// Admin: Get all orders
router.get(
  "/",
  authenticate,
  RequirePermissions(PERMISSION_TYPE.MANAGE_ORDERS),
  ctrl.getAllOrders
);

// Admin: Get order stats
router.get(
  "/stats",
  authenticate,
  RequirePermissions(PERMISSION_TYPE.MANAGE_ORDERS),
  ctrl.getStats
);

// Admin: Get order by ID
router.get(
  "/:id",
  authenticate,
  RequirePermissions(PERMISSION_TYPE.MANAGE_ORDERS),
  ctrl.getOrderById
);

// Admin: Update order status
router.put(
  "/:id/status",
  authenticate,
  RequirePermissions(PERMISSION_TYPE.MANAGE_ORDERS),
  ctrl.updateOrderStatus
);

export default router;
