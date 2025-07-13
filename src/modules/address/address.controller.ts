import { Request, Response, NextFunction } from 'express';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { GetAddressesQueryDto } from './dto/get-addresses-query.dto';
import { AddressResponseDto } from './dto/address-response.dto';
import { ADDRESS_TYPE } from './address.entity';
import { getResponseAPI } from '../../common/getResponseAPI';
import * as addressService from './address.service';

export const createAddress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json(getResponseAPI('401', { additionalMsg: 'User not authenticated' }));
      return;
    }

    const createAddressDto: CreateAddressDto = req.body;
    const address = await addressService.createAddress(userId, createAddressDto);

    res.status(201).json(getResponseAPI('0', address));
  } catch (error: any) {
    next(error);
  }
};

export const getAddresses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json(getResponseAPI('401', { additionalMsg: 'User not authenticated' }));
      return;
    }

    const query: GetAddressesQueryDto = req.validatedQuery || req.query as any;
    const addresses = await addressService.getAddresses(userId, query);

    res.json(getResponseAPI('0', addresses));
  } catch (error: any) {
    next(error);
  }
};

export const getAddressById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json(getResponseAPI('401', { additionalMsg: 'User not authenticated' }));
      return;
    }

    const { addressId } = req.params;
    const address = await addressService.getAddressById(userId, addressId);

    res.json(getResponseAPI('0', address));
  } catch (error: any) {
    next(error);
  }
};

export const updateAddress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json(getResponseAPI('401', { additionalMsg: 'User not authenticated' }));
      return;
    }

    const { addressId } = req.params;
    const updateAddressDto: UpdateAddressDto = req.body;
    const address = await addressService.updateAddress(userId, addressId, updateAddressDto);

    res.json(getResponseAPI('0', address));
  } catch (error: any) {
    next(error);
  }
};

export const deleteAddress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json(getResponseAPI('401', { additionalMsg: 'User not authenticated' }));
      return;
    }

    const { addressId } = req.params;
    await addressService.deleteAddress(userId, addressId);

    res.json(getResponseAPI('0', { additionalMsg: 'Address deleted successfully' }));
  } catch (error: any) {
    next(error);
  }
};

export const setDefaultAddress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json(getResponseAPI('401', { additionalMsg: 'User not authenticated' }));
      return;
    }

    const { addressId } = req.params;
    const address = await addressService.setDefaultAddress(userId, addressId);

    res.json(getResponseAPI('0', address));
  } catch (error: any) {
    next(error);
  }
};

export const getDefaultAddress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json(getResponseAPI('401', { additionalMsg: 'User not authenticated' }));
      return;
    }

    const { type } = req.params;
    if (!Object.values(ADDRESS_TYPE).includes(type as ADDRESS_TYPE)) {
      res.status(400).json(getResponseAPI('400', { additionalMsg: 'Invalid address type' }));
      return;
    }

    const address = await addressService.getDefaultAddress(userId, type as ADDRESS_TYPE);

    if (!address) {
      res.status(404).json(getResponseAPI('404', { additionalMsg: 'No default address found for this type' }));
      return;
    }

    res.json(getResponseAPI('0', address));
  } catch (error: any) {
    next(error);
  }
};

export const getAddressesByType = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json(getResponseAPI('401', { additionalMsg: 'User not authenticated' }));
      return;
    }

    const { type } = req.params;
    if (!Object.values(ADDRESS_TYPE).includes(type as ADDRESS_TYPE)) {
      res.status(400).json(getResponseAPI('400', { additionalMsg: 'Invalid address type' }));
      return;
    }

    const addresses = await addressService.getAddressesByType(userId, type as ADDRESS_TYPE);

    res.json(getResponseAPI('0', addresses));
  } catch (error: any) {
    next(error);
  }
}; 