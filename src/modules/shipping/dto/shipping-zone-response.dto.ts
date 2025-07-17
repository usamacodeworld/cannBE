import { ZONE_TYPE } from '../shipping-zone.entity';

export class ShippingZoneResponseDto {
  id: string;
  name: string;
  slug: string;
  description?: string;
  zoneType: ZONE_TYPE;
  countries?: string[];
  states?: string[];
  cities?: string[];
  postalCodes?: string[];
  isActive: boolean;
  priority: number;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
  methodsCount?: number;
} 