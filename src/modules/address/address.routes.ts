import { Router } from 'express';
import { authenticate } from '../auth/middlewares/auth.middleware';
import { validateDto } from '../../common/middlewares/validation.middleware';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { GetAddressesQueryDto } from './dto/get-addresses-query.dto';
import * as addressController from './address.controller';

const router = Router();

// Create a new address
router.post(
  '/',
  authenticate,
  validateDto(CreateAddressDto),
  addressController.createAddress
);

// Get all addresses for the authenticated user
router.get(
  '/',
  authenticate,
  validateDto(GetAddressesQueryDto, 'query'),
  addressController.getAddresses
);

// Get a specific address by ID
router.get(
  '/:addressId',
  authenticate,
  addressController.getAddressById
);

// Update an address
router.put(
  '/:addressId',
  authenticate,
  validateDto(UpdateAddressDto),
  addressController.updateAddress
);

// Delete an address
router.delete(
  '/:addressId',
  authenticate,
  addressController.deleteAddress
);

// Set an address as default
router.patch(
  '/:addressId/default',
  authenticate,
  addressController.setDefaultAddress
);

// Get default address by type
router.get(
  '/default/:type',
  authenticate,
  addressController.getDefaultAddress
);

// Get addresses by type
router.get(
  '/type/:type',
  authenticate,
  addressController.getAddressesByType
);

export default router; 