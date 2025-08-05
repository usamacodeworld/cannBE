# Professional Email Templates Documentation

## Overview

The CannBE e-commerce platform now features professional, modern email templates that provide an excellent user experience for order-related communications. These templates are responsive, visually appealing, and follow e-commerce best practices.

## 🎨 Template Features

### Design Highlights
- **Modern & Professional**: Clean, contemporary design with gradient headers
- **Fully Responsive**: Optimized for desktop, tablet, and mobile devices
- **Brand Consistent**: Uses CannBE brand colors and styling
- **Accessibility**: High contrast ratios and readable typography
- **Cross-Client Compatible**: Works across major email clients

### Visual Elements
- **Gradient Headers**: Eye-catching purple gradient backgrounds
- **Success Icons**: Visual confirmation indicators (✓, 🚚, etc.)
- **Product Images**: Support for product thumbnails
- **Call-to-Action Buttons**: Prominent, styled action buttons
- **Social Media Links**: Branded social media integration
- **Professional Footer**: Complete contact information and branding

## 📧 Available Templates

### 1. Order Confirmation Email
**Trigger**: When a customer completes a purchase
**Purpose**: Confirm order receipt and provide order details

**Features**:
- ✅ Success confirmation with checkmark icon
- 📋 Complete order summary with order number
- 📦 Product list with images, SKUs, and pricing
- 💰 Detailed cost breakdown (subtotal, tax, shipping, discounts)
- 📍 Shipping address display
- 🔗 "View Order Details" CTA button
- 📱 "What's Next?" information section

### 2. Order Shipped Email
**Trigger**: When an order is marked as shipped
**Purpose**: Notify customer of shipment and provide tracking info

**Features**:
- 🚚 Shipping truck icon and green gradient header
- 📦 Tracking information section
- 📍 Shipping address confirmation
- 🔗 "Track Package" and "View Order Details" buttons
- 📋 "What to Expect" delivery information
- 📅 Estimated delivery date display

## 🛠️ Technical Implementation

### File Structure
```
src/common/services/email.service.ts
├── generateOrderConfirmationEmail()
├── generateOrderShippedEmail()
├── generateOrderDeliveredEmail()
├── generateOrderCancelledEmail()
└── generateOrderRefundedEmail()
```

### CSS Features
- **CSS Grid & Flexbox**: Modern layout techniques
- **Media Queries**: Mobile-responsive design
- **CSS Variables**: Consistent color scheme
- **Hover Effects**: Interactive button states
- **Box Shadows**: Depth and visual hierarchy

### Email Client Compatibility
- ✅ Gmail (Web & Mobile)
- ✅ Outlook (Desktop & Web)
- ✅ Apple Mail
- ✅ Yahoo Mail
- ✅ Thunderbird
- ✅ Mobile email apps

## 🎯 Customization Options

### Brand Colors
```css
/* Primary Brand Colors */
--primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
--success-gradient: linear-gradient(135deg, #28a745 0%, #20c997 100%);
--primary-color: #667eea;
--success-color: #28a745;
```

### Content Customization
- **Company Logo**: Replace placeholder with actual logo
- **Contact Information**: Update support email and phone
- **Social Media Links**: Add actual social media URLs
- **Frontend URL**: Set `FRONTEND_URL` environment variable
- **Carrier Tracking**: Update tracking URL patterns

### Template Variables
```typescript
interface EmailData {
  order: Order;
  customerName: string;
  customerEmail: string;
  orderNumber: string;
  totalAmount: number;
  items: Array<{
    productName: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    productImage?: string;
  }>;
  shippingAddress: ShippingAddress;
  trackingNumber?: string;
  estimatedDelivery?: Date;
  invoiceUrl?: string;
}
```

## 📱 Responsive Design

### Breakpoints
- **Desktop**: 600px+ (full layout)
- **Tablet**: 600px (stacked layout)
- **Mobile**: <600px (single column)

### Mobile Optimizations
- Single-column layout for small screens
- Larger touch targets for buttons
- Optimized typography scaling
- Simplified product item display

## 🧪 Testing & Preview

### Preview Generation
```bash
yarn ts-node scripts/test-email-templates.ts
```

This generates preview files in the `email-previews/` directory:
- `order-confirmation.html` - Order confirmation template
- `order-shipped.html` - Order shipped template
- `preview.html` - Combined preview page

### Email Testing
- **Ethereal Email**: Built-in testing for development
- **Real Email Clients**: Test across different platforms
- **Mobile Testing**: Verify mobile responsiveness
- **Accessibility Testing**: Ensure screen reader compatibility

## 🔧 Configuration

### Environment Variables
```env
# Email Configuration
FRONTEND_URL=https://cannbe.com
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your-email@example.com
EMAIL_PASS=your-password
EMAIL_FROM=noreply@cannbe.com
```

### Email Service Setup
```typescript
// Initialize email service
const emailService = new EmailService();

// Send order confirmation
await emailService.sendOrderConfirmation(emailData);

// Send order status update
await emailService.sendOrderStatusUpdate(emailData, ORDER_STATUS.SHIPPED);
```

## 📊 Performance & Best Practices

### Optimization Tips
- **Image Optimization**: Compress product images
- **CSS Inlining**: Critical styles are inline
- **Minimal External Dependencies**: Self-contained templates
- **Fast Loading**: Optimized for quick rendering

### Email Deliverability
- **SPF/DKIM**: Configure proper email authentication
- **Consistent Sending**: Use dedicated sending domain
- **List Hygiene**: Maintain clean email lists
- **Engagement Monitoring**: Track open and click rates

## 🎨 Design System

### Typography
- **Primary Font**: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif
- **Headings**: 28px, 24px, 20px, 18px
- **Body Text**: 16px, 14px, 12px
- **Line Height**: 1.6 for readability

### Color Palette
- **Primary**: #667eea (Purple)
- **Success**: #28a745 (Green)
- **Text**: #333 (Dark Gray)
- **Secondary Text**: #6c757d (Medium Gray)
- **Background**: #f8f9fa (Light Gray)
- **Borders**: #e9ecef (Light Border)

### Spacing System
- **Container Padding**: 40px (desktop), 30px (mobile)
- **Section Margins**: 30px between sections
- **Element Padding**: 20px, 25px for content areas
- **Border Radius**: 8px for cards, 25px for buttons

## 🚀 Future Enhancements

### Planned Features
- **Dynamic Content**: Personalized product recommendations
- **A/B Testing**: Template variation testing
- **Analytics Integration**: Click and open tracking
- **Multi-language Support**: Internationalization
- **Template Builder**: Visual template editor

### Integration Opportunities
- **Marketing Automation**: Drip campaign integration
- **Customer Segmentation**: Personalized templates
- **Review Requests**: Post-purchase feedback emails
- **Abandoned Cart**: Recovery email templates

## 📞 Support & Maintenance

### Troubleshooting
- **Email Not Sending**: Check SMTP configuration
- **Template Not Rendering**: Verify HTML structure
- **Mobile Issues**: Test responsive breakpoints
- **Image Not Loading**: Check image URLs and hosting

### Maintenance Tasks
- **Regular Testing**: Monthly email client testing
- **Content Updates**: Quarterly content review
- **Performance Monitoring**: Track delivery rates
- **User Feedback**: Collect customer feedback

---

## 📋 Quick Reference

### Send Order Confirmation
```typescript
const emailData = {
  order: orderEntity,
  customerName: "John Doe",
  customerEmail: "john@example.com",
  orderNumber: "ORD-2024-001",
  totalAmount: 299.99,
  items: [...],
  shippingAddress: {...}
};

await emailService.sendOrderConfirmation(emailData);
```

### Send Order Shipped
```typescript
await emailService.sendOrderStatusUpdate(emailData, ORDER_STATUS.SHIPPED);
```

### Preview Templates
```bash
yarn ts-node scripts/test-email-templates.ts
# Open email-previews/preview.html in browser
```

---

**Last Updated**: December 2024  
**Version**: 2.0  
**Maintainer**: CannBE Development Team 