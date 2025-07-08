export interface PaymentConfig {
  authorizeNet: {
    apiLoginId: string;
    transactionKey: string;
    signatureKey: string;
    environment: 'sandbox' | 'production';
    webhookSecret: string;
  };
  stripe: {
    secretKey: string;
    publishableKey: string;
    webhookSecret: string;
  };
  paypal: {
    clientId: string;
    clientSecret: string;
    environment: 'sandbox' | 'production';
  };
  email: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    pass: string;
    from: string;
  };
  shipping: {
    usps: {
      userId: string;
      apiUrl: string;
    };
    fedex: {
      key: string;
      password: string;
      accountNumber: string;
      meterNumber: string;
      apiUrl: string;
    };
  };
  tax: {
    taxjar: {
      apiKey: string;
      apiUrl: string;
    };
  };
}

export const paymentConfig: PaymentConfig = {
  authorizeNet: {
    apiLoginId: process.env.AUTHORIZE_NET_API_LOGIN_ID || '',
    transactionKey: process.env.AUTHORIZE_NET_TRANSACTION_KEY || '',
    signatureKey: process.env.AUTHORIZE_NET_SIGNATURE_KEY || '',
    environment: (process.env.AUTHORIZE_NET_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox',
    webhookSecret: process.env.AUTHORIZE_NET_WEBHOOK_SECRET || ''
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || ''
  },
  paypal: {
    clientId: process.env.PAYPAL_CLIENT_ID || '',
    clientSecret: process.env.PAYPAL_CLIENT_SECRET || '',
    environment: (process.env.PAYPAL_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox'
  },
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true',
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || '',
    from: process.env.EMAIL_FROM || 'noreply@cannbe.com'
  },
  shipping: {
    usps: {
      userId: process.env.USPS_USER_ID || '',
      apiUrl: process.env.USPS_API_URL || 'http://production.shippingapis.com/ShippingAPI.dll'
    },
    fedex: {
      key: process.env.FEDEX_KEY || '',
      password: process.env.FEDEX_PASSWORD || '',
      accountNumber: process.env.FEDEX_ACCOUNT_NUMBER || '',
      meterNumber: process.env.FEDEX_METER_NUMBER || '',
      apiUrl: process.env.FEDEX_API_URL || 'https://apis-sandbox.fedex.com'
    }
  },
  tax: {
    taxjar: {
      apiKey: process.env.TAXJAR_API_KEY || '',
      apiUrl: process.env.TAXJAR_API_URL || 'https://api.taxjar.com'
    }
  }
}; 