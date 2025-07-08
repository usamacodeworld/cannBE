import axios from 'axios';
import { paymentConfig } from '../../config/payment.config';

export interface TaxAddress {
  country: string;
  state: string;
  city: string;
  postalCode: string;
  addressLine1?: string;
  addressLine2?: string;
}

export interface TaxItem {
  id: string;
  quantity: number;
  unitPrice: number;
  productTaxCode?: string;
  description?: string;
}

export interface TaxRequest {
  fromAddress: TaxAddress;
  toAddress: TaxAddress;
  items: TaxItem[];
  shippingAmount: number;
  customerId?: string;
  exemptionType?: string;
}

export interface TaxCalculation {
  taxAmount: number;
  taxRate: number;
  taxableAmount: number;
  breakdown: TaxBreakdown[];
  totalAmount: number;
  currency: string;
}

export interface TaxBreakdown {
  type: string;
  rate: number;
  amount: number;
  description: string;
}

export interface TaxExemption {
  type: string;
  certificateNumber?: string;
  description?: string;
}

export class TaxService {
  private readonly taxjarApiUrl: string;
  private readonly taxjarApiKey: string;

  constructor() {
    this.taxjarApiUrl = paymentConfig.tax.taxjar.apiUrl;
    this.taxjarApiKey = paymentConfig.tax.taxjar.apiKey;
  }

  async calculateTax(request: TaxRequest): Promise<TaxCalculation> {
    try {
      if (!this.taxjarApiKey) {
        // Fallback to basic tax calculation
        return this.calculateBasicTax(request);
      }

      return await this.calculateTaxJarTax(request);
    } catch (error: any) {
      console.error('Tax calculation error:', error);
      // Fallback to basic calculation
      return this.calculateBasicTax(request);
    }
  }

  private async calculateTaxJarTax(request: TaxRequest): Promise<TaxCalculation> {
    try {
      const payload = {
        from_country: request.fromAddress.country,
        from_state: request.fromAddress.state,
        from_city: request.fromAddress.city,
        from_zip: request.fromAddress.postalCode,
        from_street: request.fromAddress.addressLine1,
        to_country: request.toAddress.country,
        to_state: request.toAddress.state,
        to_city: request.toAddress.city,
        to_zip: request.toAddress.postalCode,
        to_street: request.toAddress.addressLine1,
        amount: request.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0),
        shipping: request.shippingAmount,
        line_items: request.items.map(item => ({
          id: item.id,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          product_tax_code: item.productTaxCode || 'P0000000',
          description: item.description
        })),
        customer_id: request.customerId,
        exemption_type: request.exemptionType
      };

      const response = await axios.post(`${this.taxjarApiUrl}/v2/taxes`, payload, {
        headers: {
          'Authorization': `Bearer ${this.taxjarApiKey}`,
          'Content-Type': 'application/json'
        }
      });

      const result = response.data.tax;

      const breakdown: TaxBreakdown[] = [];
      if (result.breakdown) {
        if (result.breakdown.state_tax_collectable) {
          breakdown.push({
            type: 'state_tax',
            rate: result.breakdown.state_tax_rate || 0,
            amount: result.breakdown.state_tax_collectable,
            description: 'State Tax'
          });
        }

        if (result.breakdown.county_tax_collectable) {
          breakdown.push({
            type: 'county_tax',
            rate: result.breakdown.county_tax_rate || 0,
            amount: result.breakdown.county_tax_collectable,
            description: 'County Tax'
          });
        }

        if (result.breakdown.city_tax_collectable) {
          breakdown.push({
            type: 'city_tax',
            rate: result.breakdown.city_tax_rate || 0,
            amount: result.breakdown.city_tax_collectable,
            description: 'City Tax'
          });
        }

        if (result.breakdown.special_district_tax_collectable) {
          breakdown.push({
            type: 'special_district_tax',
            rate: result.breakdown.special_district_tax_rate || 0,
            amount: result.breakdown.special_district_tax_collectable,
            description: 'Special District Tax'
          });
        }
      }

      return {
        taxAmount: result.tax_collectable,
        taxRate: result.rate || 0,
        taxableAmount: result.taxable_amount,
        breakdown,
        totalAmount: result.tax_collectable + result.taxable_amount + request.shippingAmount,
        currency: 'USD'
      };
    } catch (error: any) {
      console.error('TaxJar calculation error:', error);
      throw new Error('Failed to calculate tax with TaxJar');
    }
  }

  private calculateBasicTax(request: TaxRequest): TaxCalculation {
    const taxableAmount = request.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    
    // Basic tax calculation based on state
    const taxRates: { [key: string]: number } = {
      'CA': 0.085, // California
      'NY': 0.08,  // New York
      'TX': 0.0625, // Texas
      'FL': 0.06,  // Florida
      'WA': 0.065, // Washington
      'IL': 0.0625, // Illinois
      'PA': 0.06,  // Pennsylvania
      'OH': 0.0575, // Ohio
      'GA': 0.04,  // Georgia
      'NC': 0.0475, // North Carolina
      'MI': 0.06,  // Michigan
      'NJ': 0.06625, // New Jersey
      'VA': 0.053, // Virginia
      'AZ': 0.056, // Arizona
      'MA': 0.0625, // Massachusetts
      'TN': 0.07,  // Tennessee
      'IN': 0.07,  // Indiana
      'MO': 0.04225, // Missouri
      'MD': 0.06,  // Maryland
      'CO': 0.029, // Colorado
      'MN': 0.06875, // Minnesota
      'WI': 0.05,  // Wisconsin
      'AL': 0.04,  // Alabama
      'SC': 0.06,  // South Carolina
      'LA': 0.0445, // Louisiana
      'KY': 0.06,  // Kentucky
      'OR': 0,     // Oregon (no sales tax)
      'OK': 0.045, // Oklahoma
      'CT': 0.0635, // Connecticut
      'UT': 0.061, // Utah
      'IA': 0.06,  // Iowa
      'NV': 0.0685, // Nevada
      'AR': 0.065, // Arkansas
      'MS': 0.07,  // Mississippi
      'KS': 0.065, // Kansas
      'WV': 0.06,  // West Virginia
      'NE': 0.055, // Nebraska
      'ID': 0.06,  // Idaho
      'HI': 0.04,  // Hawaii
      'NH': 0,     // New Hampshire (no sales tax)
      'DE': 0,     // Delaware (no sales tax)
      'MT': 0,     // Montana (no sales tax)
      'AK': 0,     // Alaska (no sales tax)
      'VT': 0.06,  // Vermont
      'RI': 0.07,  // Rhode Island
      'ND': 0.05,  // North Dakota
      'SD': 0.045, // South Dakota
      'WY': 0.04,  // Wyoming
      'ME': 0.055  // Maine
    };

    const state = request.toAddress.state.toUpperCase();
    const taxRate = taxRates[state] || 0.06; // Default 6% if state not found
    const taxAmount = Math.round(taxableAmount * taxRate * 100) / 100;

    const breakdown: TaxBreakdown[] = [
      {
        type: 'state_tax',
        rate: taxRate * 100,
        amount: taxAmount,
        description: `${state} State Tax`
      }
    ];

    return {
      taxAmount,
      taxRate: taxRate * 100,
      taxableAmount,
      breakdown,
      totalAmount: taxableAmount + taxAmount + request.shippingAmount,
      currency: 'USD'
    };
  }

  async validateAddress(address: TaxAddress): Promise<{ valid: boolean; normalized?: TaxAddress; error?: string }> {
    try {
      if (!this.taxjarApiKey) {
        return { valid: true }; // Skip validation if no API key
      }

      const response = await axios.post(`${this.taxjarApiUrl}/v2/validation`, {
        country: address.country,
        state: address.state,
        city: address.city,
        zip: address.postalCode,
        street: address.addressLine1
      }, {
        headers: {
          'Authorization': `Bearer ${this.taxjarApiKey}`,
          'Content-Type': 'application/json'
        }
      });

      const result = response.data.addresses[0];

      if (result.valid) {
        return {
          valid: true,
          normalized: {
            country: result.country,
            state: result.state,
            city: result.city,
            postalCode: result.zip,
            addressLine1: result.street
          }
        };
      } else {
        return {
          valid: false,
          error: 'Invalid address'
        };
      }
    } catch (error: any) {
      console.error('Address validation error:', error);
      return {
        valid: true // Assume valid if validation fails
      };
    }
  }

  getTaxExemptions(): TaxExemption[] {
    return [
      {
        type: 'government',
        description: 'Government entities'
      },
      {
        type: 'nonprofit',
        description: 'Non-profit organizations'
      },
      {
        type: 'reseller',
        description: 'Reseller certificate'
      },
      {
        type: 'diplomatic',
        description: 'Diplomatic entities'
      },
      {
        type: 'foreign',
        description: 'Foreign entities'
      }
    ];
  }

  isTaxExempt(address: TaxAddress, exemptionType?: string): boolean {
    // Check for tax-exempt states
    const taxExemptStates = ['OR', 'NH', 'DE', 'MT', 'AK'];
    
    if (taxExemptStates.includes(address.state.toUpperCase())) {
      return true;
    }

    // Check for exemption types
    if (exemptionType && ['government', 'nonprofit', 'reseller', 'diplomatic', 'foreign'].includes(exemptionType)) {
      return true;
    }

    return false;
  }

  calculateInternationalTax(address: TaxAddress, amount: number): TaxCalculation {
    // Basic international tax calculation
    const taxRate = 0.05; // 5% for international
    const taxAmount = Math.round(amount * taxRate * 100) / 100;

    return {
      taxAmount,
      taxRate: taxRate * 100,
      taxableAmount: amount,
      breakdown: [
        {
          type: 'international_tax',
          rate: taxRate * 100,
          amount: taxAmount,
          description: 'International Tax'
        }
      ],
      totalAmount: amount + taxAmount,
      currency: 'USD'
    };
  }
}

export const taxService = new TaxService(); 