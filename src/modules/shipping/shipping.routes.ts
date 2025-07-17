import { Router } from 'express';
import shippingZoneRoutes from './shipping-zone.routes';
import shippingMethodRoutes from './shipping-method.routes';
import shippingRateRoutes from './shipping-rate.routes';
import shippingIntegrationRoutes from './shipping-integration.routes';

const router = Router();

// Mount shipping zone routes
router.use('/zones', shippingZoneRoutes);

// Mount shipping method routes
router.use('/methods', shippingMethodRoutes);

// Mount shipping rate routes
router.use('/rates', shippingRateRoutes);

// Mount shipping integration routes for checkout
router.use('/checkout', shippingIntegrationRoutes);

export default router; 