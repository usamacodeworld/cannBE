# 🚀 Production-Ready Checkout System - Environment Setup

## 📋 Required Environment Variables

Create a `.env` file in your project root with the following variables:

### Database Configuration
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=cannbe_db
```

### Redis Configuration
```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
```

### JWT Configuration
```env
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
```

### Server Configuration
```env
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### Authorize.net Configuration
```env
AUTHORIZE_NET_API_LOGIN_ID=your_authorize_net_api_login_id
AUTHORIZE_NET_TRANSACTION_KEY=your_authorize_net_transaction_key
AUTHORIZE_NET_SIGNATURE_KEY=your_authorize_net_signature_key
AUTHORIZE_NET_ENVIRONMENT=sandbox
AUTHORIZE_NET_WEBHOOK_SECRET=your_authorize_net_webhook_secret
```

### Stripe Configuration
```env
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret
```

### PayPal Configuration
```env
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_ENVIRONMENT=sandbox
```

### Email Configuration
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
EMAIL_FROM=noreply@cannbe.com
```

### USPS Shipping Configuration
```env
USPS_USER_ID=your_usps_user_id
USPS_API_URL=http://production.shippingapis.com/ShippingAPI.dll
```

### FedEx Shipping Configuration
```env
FEDEX_KEY=your_fedex_key
FEDEX_PASSWORD=your_fedex_password
FEDEX_ACCOUNT_NUMBER=your_fedex_account_number
FEDEX_METER_NUMBER=your_fedex_meter_number
FEDEX_API_URL=https://apis-sandbox.fedex.com
```

### TaxJar Configuration
```env
TAXJAR_API_KEY=your_taxjar_api_key
TAXJAR_API_URL=https://api.taxjar.com
```

### AWS S3 Configuration
```env
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your_s3_bucket_name
```

### Application Configuration
```env
APP_NAME=CannBE
APP_VERSION=1.0.0
LOG_LEVEL=info
CORS_ORIGIN=http://localhost:3000
```

### Security Configuration
```env
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 🔧 Setup Instructions

### 1. Install Dependencies
```bash
yarn install
```

### 2. Database Setup
```bash
# Create database
createdb cannbe_db

# Run migrations
yarn migration:run

# Run seeders
yarn seed
```

### 3. Redis Setup
```bash
# Install Redis (Ubuntu/Debian)
sudo apt-get install redis-server

# Start Redis
sudo systemctl start redis-server

# Test Redis connection
redis-cli ping
```

### 4. Payment Gateway Setup

#### Authorize.net
1. Create an Authorize.net account
2. Get your API Login ID and Transaction Key
3. Set up webhook endpoints in your Authorize.net dashboard
4. Configure webhook URL: `https://yourdomain.com/api/v1/checkout/webhooks/authorize-net`

#### Stripe (Alternative)
1. Create a Stripe account
2. Get your API keys from the Stripe dashboard
3. Set up webhook endpoints
4. Configure webhook URL: `https://yourdomain.com/api/v1/checkout/webhooks/stripe`

### 5. Shipping Provider Setup

#### USPS
1. Register for USPS Web Tools API
2. Get your User ID
3. Test API access

#### FedEx
1. Create a FedEx developer account
2. Get your API credentials
3. Set up test environment

### 6. Tax Service Setup

#### TaxJar
1. Create a TaxJar account
2. Get your API key
3. Configure nexus locations

### 7. Email Service Setup

#### Gmail SMTP
1. Enable 2-factor authentication
2. Generate app password
3. Use app password in EMAIL_PASS

### 8. Build and Run
```bash
# Build the project
yarn build

# Start development server
yarn dev

# Start production server
yarn start
```

## 🧪 Testing the Checkout System

### 1. Test Payment Processing
```bash
# Test Authorize.net payment
curl -X POST http://localhost:3000/api/v1/checkout/confirm-order \
  -H "Content-Type: application/json" \
  -d '{
    "checkoutId": "test-checkout-id",
    "customerInfo": {
      "email": "test@example.com",
      "firstName": "John",
      "lastName": "Doe"
    },
    "paymentMethod": "credit_card",
    "paymentData": {
      "cardNumber": "4111111111111111",
      "expiryMonth": "12",
      "expiryYear": "2025",
      "cvv": "123"
    }
  }'
```

### 2. Test Shipping Calculation
```bash
curl -X POST http://localhost:3000/api/v1/checkout/calculate-shipping \
  -H "Content-Type: application/json" \
  -d '{
    "checkoutId": "test-checkout-id",
    "shippingAddress": {
      "firstName": "John",
      "lastName": "Doe",
      "addressLine1": "123 Main St",
      "city": "New York",
      "state": "NY",
      "postalCode": "10001",
      "country": "US"
    }
  }'
```

### 3. Test Tax Calculation
```bash
curl -X POST http://localhost:3000/api/v1/checkout/calculate-tax \
  -H "Content-Type: application/json" \
  -d '{
    "checkoutId": "test-checkout-id",
    "shippingAddress": {
      "firstName": "John",
      "lastName": "Doe",
      "addressLine1": "123 Main St",
      "city": "New York",
      "state": "NY",
      "postalCode": "10001",
      "country": "US"
    }
  }'
```

## 🔒 Security Considerations

1. **Environment Variables**: Never commit `.env` files to version control
2. **API Keys**: Rotate API keys regularly
3. **Webhook Security**: Verify webhook signatures
4. **Rate Limiting**: Implement proper rate limiting
5. **Input Validation**: Validate all user inputs
6. **HTTPS**: Use HTTPS in production
7. **Database Security**: Use strong database passwords
8. **Redis Security**: Configure Redis authentication

## 📊 Monitoring and Logging

1. **Application Logs**: Monitor application logs for errors
2. **Payment Logs**: Track payment processing logs
3. **Database Logs**: Monitor database performance
4. **Redis Logs**: Check Redis connection status
5. **Webhook Logs**: Monitor webhook delivery status

## 🚀 Production Deployment

1. **Environment**: Set NODE_ENV=production
2. **SSL**: Configure SSL certificates
3. **Load Balancer**: Set up load balancing
4. **Monitoring**: Implement application monitoring
5. **Backup**: Set up database backups
6. **CDN**: Configure CDN for static assets

## 📞 Support

For issues or questions:
- Check the logs for error messages
- Verify all environment variables are set correctly
- Test each service individually
- Contact support with specific error details 