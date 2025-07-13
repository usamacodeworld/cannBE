import { METHOD_TYPE, CARRIER_TYPE } from '../shipping-method.entity';

export class ShippingMethodResponseDto {
  id: string;
  name: string;
  slug: string;
  description?: string;
  methodType: METHOD_TYPE;
  carrierType: CARRIER_TYPE;
  zoneId?: string;
  zone?: {
    id: string;
    name: string;
    slug: string;
  };
  isActive: boolean;
  priority: number;
  estimatedDays?: number;
  icon?: string;
  color?: string;
  isDefault: boolean;
  requiresSignature: boolean;
  isInsured: boolean;
  insuranceAmount?: number;
  createdAt: Date;
  updatedAt: Date;
  ratesCount?: number;
} 