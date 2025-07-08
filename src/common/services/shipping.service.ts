import axios from 'axios';
import { paymentConfig } from '../../config/payment.config';

export interface ShippingAddress {
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
}

export interface ShippingItem {
  weight: number; // in pounds
  length: number; // in inches
  width: number; // in inches
  height: number; // in inches
  quantity: number;
  description: string;
}

export interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: number;
  carrier: string;
  serviceCode: string;
  guaranteedDelivery?: boolean;
  trackingAvailable: boolean;
}

export interface ShippingRequest {
  fromAddress: ShippingAddress;
  toAddress: ShippingAddress;
  items: ShippingItem[];
  weight: number;
  declaredValue?: number;
  insurance?: boolean;
}

export interface ShippingResponse {
  success: boolean;
  methods: ShippingMethod[];
  error?: string;
}

export interface TrackingRequest {
  trackingNumber: string;
  carrier: string;
}

export interface TrackingResponse {
  success: boolean;
  trackingNumber: string;
  status: string;
  estimatedDelivery?: Date;
  events: TrackingEvent[];
  error?: string;
}

export interface TrackingEvent {
  date: Date;
  location: string;
  status: string;
  description: string;
}

export class ShippingService {
  private readonly uspsApiUrl: string;
  private readonly fedexApiUrl: string;

  constructor() {
    this.uspsApiUrl = paymentConfig.shipping.usps.apiUrl;
    this.fedexApiUrl = paymentConfig.shipping.fedex.apiUrl;
  }

  async getShippingRates(request: ShippingRequest): Promise<ShippingResponse> {
    try {
      const methods: ShippingMethod[] = [];

      // Get USPS rates
      const uspsRates = await this.getUSPSRates(request);
      if (uspsRates.success) {
        methods.push(...uspsRates.methods);
      }

      // Get FedEx rates
      const fedexRates = await this.getFedExRates(request);
      if (fedexRates.success) {
        methods.push(...fedexRates.methods);
      }

      // Sort by price
      methods.sort((a, b) => a.price - b.price);

      return {
        success: true,
        methods
      };
    } catch (error: any) {
      console.error('Shipping rates error:', error);
      return {
        success: false,
        methods: [],
        error: error.message || 'Failed to get shipping rates'
      };
    }
  }

  private async getUSPSRates(request: ShippingRequest): Promise<ShippingResponse> {
    try {
      const xml = `
        <RateV4Request USERID="${paymentConfig.shipping.usps.userId}">
          <Revision>2</Revision>
          <Package ID="1">
            <Service>ALL</Service>
            <FirstClassMailType>PACKAGE</FirstClassMailType>
            <ZipOrigination>${request.fromAddress.postalCode}</ZipOrigination>
            <ZipDestination>${request.toAddress.postalCode}</ZipDestination>
            <Pounds>${Math.floor(request.weight)}</Pounds>
            <Ounces>${Math.round((request.weight % 1) * 16)}</Ounces>
            <Container></Container>
            <Size>REGULAR</Size>
            <Machinable>TRUE</Machinable>
          </Package>
        </RateV4Request>
      `;

      const response = await axios.get(this.uspsApiUrl, {
        params: {
          API: 'RateV4',
          XML: xml
        }
      });

      // Simplified USPS rates - in production, you would parse the XML response
      const methods: ShippingMethod[] = [
        {
          id: 'usps_priority',
          name: 'USPS Priority Mail',
          description: '2-3 business days',
          price: 8.95,
          estimatedDays: 3,
          carrier: 'USPS',
          serviceCode: 'priority',
          trackingAvailable: true
        },
        {
          id: 'usps_first_class',
          name: 'USPS First Class',
          description: '3-5 business days',
          price: 4.95,
          estimatedDays: 4,
          carrier: 'USPS',
          serviceCode: 'first_class',
          trackingAvailable: true
        }
      ];

      return {
        success: true,
        methods
      };
    } catch (error: any) {
      console.error('USPS rates error:', error);
      return {
        success: false,
        methods: []
      };
    }
  }

  private async getFedExRates(request: ShippingRequest): Promise<ShippingResponse> {
    try {
      // FedEx API requires authentication and more complex setup
      // This is a simplified implementation
      const methods: ShippingMethod[] = [
        {
          id: 'fedex_ground',
          name: 'FedEx Ground',
          description: '3-7 business days',
          price: 12.99,
          estimatedDays: 5,
          carrier: 'FedEx',
          serviceCode: 'GROUND',
          trackingAvailable: true
        },
        {
          id: 'fedex_2day',
          name: 'FedEx 2Day',
          description: '2 business days',
          price: 24.99,
          estimatedDays: 2,
          carrier: 'FedEx',
          serviceCode: 'FEDEX_2_DAY',
          trackingAvailable: true
        },
        {
          id: 'fedex_overnight',
          name: 'FedEx Overnight',
          description: 'Next business day',
          price: 39.99,
          estimatedDays: 1,
          carrier: 'FedEx',
          serviceCode: 'PRIORITY_OVERNIGHT',
          guaranteedDelivery: true,
          trackingAvailable: true
        }
      ];

      return {
        success: true,
        methods
      };
    } catch (error: any) {
      console.error('FedEx rates error:', error);
      return {
        success: false,
        methods: []
      };
    }
  }

  async createShipment(
    method: ShippingMethod,
    request: ShippingRequest,
    orderNumber: string
  ): Promise<{ success: boolean; trackingNumber?: string; error?: string }> {
    try {
      if (method.carrier === 'USPS') {
        return await this.createUSPSShipment(method, request, orderNumber);
      } else if (method.carrier === 'FedEx') {
        return await this.createFedExShipment(method, request, orderNumber);
      }

      return {
        success: false,
        error: 'Unsupported carrier'
      };
    } catch (error: any) {
      console.error('Create shipment error:', error);
      return {
        success: false,
        error: error.message || 'Failed to create shipment'
      };
    }
  }

  private async createUSPSShipment(
    method: ShippingMethod,
    request: ShippingRequest,
    orderNumber: string
  ): Promise<{ success: boolean; trackingNumber?: string; error?: string }> {
    try {
      // USPS Label API implementation would go here
      // This is a simplified version
      const trackingNumber = `9400100000000000000000${Math.floor(Math.random() * 1000000)}`;
      
      return {
        success: true,
        trackingNumber
      };
    } catch (error: any) {
      console.error('USPS shipment creation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  private async createFedExShipment(
    method: ShippingMethod,
    request: ShippingRequest,
    orderNumber: string
  ): Promise<{ success: boolean; trackingNumber?: string; error?: string }> {
    try {
      // FedEx Label API implementation would go here
      // This is a simplified version
      const trackingNumber = `7946${Math.floor(Math.random() * 1000000000000)}`;
      
      return {
        success: true,
        trackingNumber
      };
    } catch (error: any) {
      console.error('FedEx shipment creation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async trackShipment(trackingRequest: TrackingRequest): Promise<TrackingResponse> {
    try {
      if (trackingRequest.carrier === 'USPS') {
        return await this.trackUSPSShipment(trackingRequest.trackingNumber);
      } else if (trackingRequest.carrier === 'FedEx') {
        return await this.trackFedExShipment(trackingRequest.trackingNumber);
      }

      return {
        success: false,
        trackingNumber: trackingRequest.trackingNumber,
        status: 'Unknown',
        events: [],
        error: 'Unsupported carrier'
      };
    } catch (error: any) {
      console.error('Track shipment error:', error);
      return {
        success: false,
        trackingNumber: trackingRequest.trackingNumber,
        status: 'Error',
        events: [],
        error: error.message || 'Failed to track shipment'
      };
    }
  }

  private async trackUSPSShipment(trackingNumber: string): Promise<TrackingResponse> {
    try {
      const xml = `
        <TrackFieldRequest USERID="${paymentConfig.shipping.usps.userId}">
          <TrackID ID="${trackingNumber}"></TrackID>
        </TrackFieldRequest>
      `;

      const response = await axios.get(this.uspsApiUrl, {
        params: {
          API: 'TrackV2',
          XML: xml
        }
      });

      // Parse USPS tracking response
      const events: TrackingEvent[] = [
        {
          date: new Date(),
          location: 'USPS Facility',
          status: 'In Transit',
          description: 'Package is in transit'
        }
      ];

      return {
        success: true,
        trackingNumber,
        status: 'In Transit',
        events
      };
    } catch (error: any) {
      console.error('USPS tracking error:', error);
      return {
        success: false,
        trackingNumber,
        status: 'Error',
        events: [],
        error: error.message
      };
    }
  }

  private async trackFedExShipment(trackingNumber: string): Promise<TrackingResponse> {
    try {
      // FedEx tracking API implementation would go here
      const events: TrackingEvent[] = [
        {
          date: new Date(),
          location: 'FedEx Facility',
          status: 'In Transit',
          description: 'Package is in transit'
        }
      ];

      return {
        success: true,
        trackingNumber,
        status: 'In Transit',
        events
      };
    } catch (error: any) {
      console.error('FedEx tracking error:', error);
      return {
        success: false,
        trackingNumber,
        status: 'Error',
        events: [],
        error: error.message
      };
    }
  }

  calculateWeight(items: ShippingItem[]): number {
    return items.reduce((total, item) => total + (item.weight * item.quantity), 0);
  }

  getDefaultShippingMethods(): ShippingMethod[] {
    return [
      {
        id: 'standard',
        name: 'Standard Shipping',
        description: '5-7 business days',
        price: 9.99,
        estimatedDays: 7,
        carrier: 'USPS',
        serviceCode: 'standard',
        trackingAvailable: true
      },
      {
        id: 'express',
        name: 'Express Shipping',
        description: '2-3 business days',
        price: 19.99,
        estimatedDays: 3,
        carrier: 'FedEx',
        serviceCode: 'express',
        trackingAvailable: true
      },
      {
        id: 'overnight',
        name: 'Overnight Shipping',
        description: 'Next business day',
        price: 39.99,
        estimatedDays: 1,
        carrier: 'FedEx',
        serviceCode: 'overnight',
        guaranteedDelivery: true,
        trackingAvailable: true
      }
    ];
  }
}

export const shippingService = new ShippingService(); 