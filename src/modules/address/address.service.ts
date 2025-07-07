import { AppDataSource } from "../../config/database";
import { Address, ADDRESS_TYPE, ADDRESS_STATUS } from './address.entity';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { GetAddressesQueryDto } from './dto/get-addresses-query.dto';
import { AddressResponseDto } from './dto/address-response.dto';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { Like } from 'typeorm';

const addressRepository = AppDataSource.getRepository(Address);

export const createAddress = async (
  userId: string,
  createAddressDto: CreateAddressDto
): Promise<AddressResponseDto> => {
  const { isDefault, type } = createAddressDto;

  // If this is set as default, remove default from other addresses of the same type
  if (isDefault) {
    await removeDefaultFromOtherAddresses(userId, type);
  }

  const address = addressRepository.create({
    ...createAddressDto,
    userId,
    status: ADDRESS_STATUS.ACTIVE
  });

  const savedAddress = await addressRepository.save(address);
  return mapToResponseDto(savedAddress);
};

export const getAddresses = async (
  userId: string,
  query: GetAddressesQueryDto
): Promise<PaginatedResponseDto<AddressResponseDto>> => {
  const { page = 1, limit = 10, type, status, isDefault } = query;
  const skip = (page - 1) * limit;

  // Build where conditions
  const whereConditions: any = { userId };

  if (type) {
    whereConditions.type = type;
  }

  if (status) {
    whereConditions.status = status;
  }

  if (isDefault !== undefined) {
    whereConditions.isDefault = isDefault;
  }

  // Get total count
  const [addresses, total] = await addressRepository.findAndCount({
    where: whereConditions,
    skip,
    take: limit,
    order: {
      isDefault: 'DESC',
      createdAt: 'DESC'
    }
  });

  return {
    data: addresses.map(address => mapToResponseDto(address)),
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};

export const getAddressById = async (
  userId: string,
  addressId: string
): Promise<AddressResponseDto> => {
  const address = await addressRepository.findOne({
    where: { id: addressId, userId }
  });

  if (!address) {
    throw new Error('Address not found');
  }

  return mapToResponseDto(address);
};

export const updateAddress = async (
  userId: string,
  addressId: string,
  updateAddressDto: UpdateAddressDto
): Promise<AddressResponseDto> => {
  const address = await addressRepository.findOne({
    where: { id: addressId, userId }
  });

  if (!address) {
    throw new Error('Address not found');
  }

  const { isDefault, type } = updateAddressDto;

  // If this is being set as default, remove default from other addresses of the same type
  if (isDefault && !address.isDefault) {
    await removeDefaultFromOtherAddresses(userId, type || address.type);
  }

  Object.assign(address, updateAddressDto);
  const updatedAddress = await addressRepository.save(address);
  
  return mapToResponseDto(updatedAddress);
};

export const deleteAddress = async (
  userId: string,
  addressId: string
): Promise<void> => {
  const address = await addressRepository.findOne({
    where: { id: addressId, userId }
  });

  if (!address) {
    throw new Error('Address not found');
  }

  // Don't allow deletion of default addresses
  if (address.isDefault) {
    throw new Error('Cannot delete default address. Set another address as default first.');
  }

  await addressRepository.remove(address);
};

export const setDefaultAddress = async (
  userId: string,
  addressId: string
): Promise<AddressResponseDto> => {
  const address = await addressRepository.findOne({
    where: { id: addressId, userId }
  });

  if (!address) {
    throw new Error('Address not found');
  }

  // Remove default from other addresses of the same type
  await removeDefaultFromOtherAddresses(userId, address.type);

  // Set this address as default
  address.isDefault = true;
  const updatedAddress = await addressRepository.save(address);
  
  return mapToResponseDto(updatedAddress);
};

export const getDefaultAddress = async (
  userId: string,
  type: ADDRESS_TYPE
): Promise<AddressResponseDto | null> => {
  const address = await addressRepository.findOne({
    where: { userId, type, isDefault: true, status: ADDRESS_STATUS.ACTIVE }
  });

  return address ? mapToResponseDto(address) : null;
};

export const getAddressesByType = async (
  userId: string,
  type: ADDRESS_TYPE
): Promise<AddressResponseDto[]> => {
  const addresses = await addressRepository.find({
    where: { userId, type, status: ADDRESS_STATUS.ACTIVE },
    order: { isDefault: 'DESC', createdAt: 'DESC' }
  });

  return addresses.map(address => mapToResponseDto(address));
};

export const validateAddressExists = async (
  userId: string,
  addressId: string
): Promise<boolean> => {
  const count = await addressRepository.count({
    where: { id: addressId, userId, status: ADDRESS_STATUS.ACTIVE }
  });
  return count > 0;
};

export const getAddressForOrder = async (
  userId: string,
  addressId: string
): Promise<Address> => {
  const address = await addressRepository.findOne({
    where: { id: addressId, userId, status: ADDRESS_STATUS.ACTIVE }
  });

  if (!address) {
    throw new Error('Address not found or inactive');
  }

  return address;
};

const removeDefaultFromOtherAddresses = async (
  userId: string,
  type: ADDRESS_TYPE
): Promise<void> => {
  await addressRepository
    .createQueryBuilder()
    .update(Address)
    .set({ isDefault: false })
    .where('userId = :userId AND type = :type AND isDefault = :isDefault', {
      userId,
      type,
      isDefault: true
    })
    .execute();
};

const mapToResponseDto = (address: Address): AddressResponseDto => {
  return {
    id: address.id,
    userId: address.userId,
    type: address.type,
    status: address.status,
    firstName: address.firstName,
    lastName: address.lastName,
    company: address.company,
    addressLine1: address.addressLine1,
    addressLine2: address.addressLine2,
    city: address.city,
    state: address.state,
    postalCode: address.postalCode,
    country: address.country,
    phone: address.phone,
    isDefault: address.isDefault,
    notes: address.notes,
    createdAt: address.createdAt,
    updatedAt: address.updatedAt
  };
}; 