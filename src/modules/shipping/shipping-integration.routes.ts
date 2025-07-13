import { Router } from "express";
import { shippingIntegrationController } from "./shipping-integration.controller";
import { AppDataSource } from "../../config/database";

const router = Router();
const controller = shippingIntegrationController(AppDataSource);

// Public endpoints for checkout shipping calculations
router.post("/calculate-options", controller.calculateShippingOptions);
router.post("/default-option", controller.getDefaultShippingOption);
router.post("/validate/:methodId", controller.validateShippingMethodForAddress);
router.post("/method/:methodId/cost", controller.getShippingCostForMethod);

export default router;
