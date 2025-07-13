import { Repository, DataSource } from 'typeorm';
import { ShippingMethod } from './shipping-method.entity';
import { ShippingRate } from './shipping-rate.entity';
import { ShippingZone } from './shipping-zone.entity';
import { ShippingRateService } from './shipping-rate.service';
import { ShippingMethodService } from './shipping-method.service';

export interface CheckoutItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  weight?: number;
  categoryIds?: string[];
}

export interface CheckoutAddress {
  country: string;
  state: string;
  city: string;
  postalCode: string;
}

export interface ShippingCalculationRequest {
  items: CheckoutItem[];
  shippingAddress: CheckoutAddress;
  orderValue: number;
  isHoliday?: boolean;
}

export interface ShippingCalculationResult {
  methodId: string;
  methodName: string;
  methodSlug: string;
  rateId: string;
  rateName: string;
  rateType: string;
  baseRate: number;
  additionalCost: number;
  totalCost: number;
  estimatedDays?: number;
  isDefault: boolean;
  requiresSignature: boolean;
  isInsured: boolean;
  insuranceAmount?: number;
  breakdown: {
    baseRate: number;
    additionalCost: number;
    handlingFee: number;
    insuranceFee: number;
    signatureFee: number;
  };
}

export class ShippingIntegrationService {
  private shippingMethodRepository: Repository<ShippingMethod>;
  private shippingRateRepository: Repository<ShippingRate>;
  private shippingZoneRepository: Repository<ShippingZone>;
  private shippingRateService: ShippingRateService;
  private shippingMethodService: ShippingMethodService;

  constructor(
    dataSource: DataSource,
    shippingRateService: ShippingRateService,
    shippingMethodService: ShippingMethodService
  ) {
    this.shippingMethodRepository = dataSource.getRepository(ShippingMethod);
    this.shippingRateRepository = dataSource.getRepository(ShippingRate);
    this.shippingZoneRepository = dataSource.getRepository(ShippingZone);
    this.shippingRateService = shippingRateService;
    this.shippingMethodService = shippingMethodService;
  }

  /**
   * Calculate shipping options for checkout
   */
  async calculateShippingOptions(
    request: ShippingCalculationRequest
  ): Promise<ShippingCalculationResult[]> {
    try {
      // Get all active shipping methods
      const methods = await this.shippingMethodService.getActiveMethods();
      
      if (!methods || methods.length === 0) {
        return [];
      }

      const results: ShippingCalculationResult[] = [];

      for (const method of methods) {
        // Calculate shipping cost for this method
        const calculation = await this.shippingRateService.calculateShippingCost({
          methodId: method.id,
          weight: this.calculateTotalWeight(request.items),
          orderValue: request.orderValue,
          itemCount: this.calculateTotalItems(request.items),
          productIds: request.items.map(item => item.productId),
          categoryIds: this.getUniqueCategoryIds(request.items),
          isHoliday: request.isHoliday
        });

        if (calculation) {
          results.push({
            methodId: method.id,
            methodName: method.name,
            methodSlug: method.slug,
            rateId: calculation.rate.id,
            rateName: calculation.rate.name || method.name,
            rateType: calculation.rate.rateType,
            baseRate: calculation.breakdown.baseRate,
            additionalCost: calculation.breakdown.additionalCost,
            totalCost: calculation.totalCost,
            estimatedDays: method.estimatedDays,
            isDefault: method.isDefault,
            requiresSignature: method.requiresSignature,
            isInsured: method.isInsured,
            insuranceAmount: method.insuranceAmount,
            breakdown: calculation.breakdown
          });
        }
      }

      // Sort by total cost (cheapest first)
      results.sort((a, b) => a.totalCost - b.totalCost);

      return results;
    } catch (error) {
      console.error('Error calculating shipping options:', error);
      return [];
    }
  }

  /**
   * Get shipping cost for a specific method
   */
  async getShippingCostForMethod(
    methodId: string,
    request: ShippingCalculationRequest
  ): Promise<ShippingCalculationResult | null> {
    try {
      const calculation = await this.shippingRateService.calculateShippingCost({
        methodId,
        weight: this.calculateTotalWeight(request.items),
        orderValue: request.orderValue,
        itemCount: this.calculateTotalItems(request.items),
        productIds: request.items.map(item => item.productId),
        categoryIds: this.getUniqueCategoryIds(request.items),
        isHoliday: request.isHoliday
      });

      if (!calculation) {
        return null;
      }

      // Get method details
      const method = await this.shippingMethodService.findOne(methodId);
      if (!method) {
        return null;
      }

      // Debug logging to check for totalCost calculation issues
      console.log('🔍 Shipping Debug - getShippingCostForMethod:', {
        methodId,
        methodName: method.name,
        calculationTotalCost: calculation.totalCost,
        breakdown: calculation.breakdown,
        calculatedTotalFromBreakdown: calculation.breakdown.baseRate + 
          calculation.breakdown.additionalCost + 
          calculation.breakdown.handlingFee + 
          calculation.breakdown.insuranceFee + 
          calculation.breakdown.signatureFee
      });

      return {
        methodId: method.id,
        methodName: method.name,
        methodSlug: method.slug,
        rateId: calculation.rate.id,
        rateName: calculation.rate.name || method.name,
        rateType: calculation.rate.rateType,
        baseRate: calculation.breakdown.baseRate,
        additionalCost: calculation.breakdown.additionalCost,
        totalCost: calculation.totalCost,
        estimatedDays: method.estimatedDays,
        isDefault: method.isDefault,
        requiresSignature: method.requiresSignature,
        isInsured: method.isInsured,
        insuranceAmount: method.insuranceAmount,
        breakdown: calculation.breakdown
      };
    } catch (error) {
      console.error('Error getting shipping cost for method:', error);
      return null;
    }
  }

  /**
   * Get default shipping method and cost
   */
  async getDefaultShippingOption(
    request: ShippingCalculationRequest
  ): Promise<ShippingCalculationResult | null> {
    try {
      const defaultMethod = await this.shippingMethodService.getDefaultMethod();
      if (!defaultMethod) {
        return null;
      }

      return await this.getShippingCostForMethod(defaultMethod.id, request);
    } catch (error) {
      console.error('Error getting default shipping option:', error);
      return null;
    }
  }

  /**
   * Calculate total weight of items
   */
  private calculateTotalWeight(items: CheckoutItem[]): number {
    return items.reduce((total, item) => {
      const itemWeight = item.weight || 0.5; // Default 0.5 lbs if not specified
      return total + (itemWeight * item.quantity);
    }, 0);
  }

  /**
   * Calculate total number of items
   */
  private calculateTotalItems(items: CheckoutItem[]): number {
    return items.reduce((total, item) => total + item.quantity, 0);
  }

  /**
   * Get unique category IDs from items
   */
  private getUniqueCategoryIds(items: CheckoutItem[]): string[] {
    const categoryIds = new Set<string>();
    items.forEach(item => {
      if (item.categoryIds) {
        item.categoryIds.forEach(id => categoryIds.add(id));
      }
    });
    return Array.from(categoryIds);
  }

  /**
   * Validate if shipping method is available for the given address
   */
  async validateShippingMethodForAddress(
    methodId: string,
    address: CheckoutAddress
  ): Promise<boolean> {
    try {
      const method = await this.shippingMethodRepository.findOne({
        where: { id: methodId, isActive: true },
        relations: ['zone']
      });

      if (!method) {
        return false;
      }

      // If method has no zone restriction, it's available everywhere
      if (!method.zone) {
        return true;
      }

      // Check if address matches the zone criteria
      return this.addressMatchesZone(address, method.zone);
    } catch (error) {
      console.error('Error validating shipping method for address:', error);
      return false;
    }
  }

  /**
   * Check if address matches shipping zone criteria
   */
  private addressMatchesZone(
    address: CheckoutAddress,
    zone: ShippingZone
  ): boolean {
    switch (zone.zoneType) {
      case 'country':
        return this.matchesCountry(address.country, zone.countries);
      
      case 'state':
        return this.matchesState(address.state, zone.states);
      
      case 'city':
        return this.matchesCity(address.city, zone.cities);
      
      case 'postal_code':
        return this.matchesPostalCode(address.postalCode, zone.postalCodes);
      
      case 'custom':
        // Custom zones can have complex logic - implement as needed
        return true;
      
      default:
        return false;
    }
  }

  private matchesCountry(country: string, zoneCountries?: string[]): boolean {
    if (!zoneCountries || zoneCountries.length === 0) {
      return true; // No restriction means all countries
    }
    return zoneCountries.includes(country);
  }

  private matchesState(state: string, zoneStates?: string[]): boolean {
    if (!zoneStates || zoneStates.length === 0) {
      return true;
    }
    return zoneStates.includes(state);
  }

  private matchesCity(city: string, zoneCities?: string[]): boolean {
    if (!zoneCities || zoneCities.length === 0) {
      return true;
    }
    return zoneCities.includes(city);
  }

  private matchesPostalCode(postalCode: string, zonePostalCodes?: string[]): boolean {
    if (!zonePostalCodes || zonePostalCodes.length === 0) {
      return true;
    }
    return zonePostalCodes.includes(postalCode);
  }
} 