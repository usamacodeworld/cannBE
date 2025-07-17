import { ADDRESS_TYPE, ADDRESS_STATUS } from '../address.entity';

export class AddressResponseDto {
  id: string;
  userId: string;
  type: ADDRESS_TYPE;
  status: ADDRESS_STATUS;
  firstName: string;
  lastName: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  email?: string;
  isDefault: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
} 