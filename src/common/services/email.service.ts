import nodemailer from "nodemailer";
import handlebars from "handlebars";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { paymentConfig } from "../../config/payment.config";
import { Order } from "../../modules/checkout/entities/order.entity";
import { ORDER_STATUS } from "../../modules/checkout/entities/order.enums";

export interface EmailData {
  order: Order;
  customerName: string;
  customerEmail: string;
  orderNumber: string;
  totalAmount: number;
  items: any[];
  shippingAddress: any;
  trackingNumber?: string;
  estimatedDelivery?: Date;
  invoiceUrl?: string;
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: any[];
}

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // if (
    //   process.env.NODE_ENV === "development" ||
    //   process.env.USE_ETHEREAL === "true"
    // ) {
    // Use Ethereal for testing
    //   nodemailer.createTestAccount().then((testAccount) => {
    //     this.transporter = nodemailer.createTransport({
    //       host: testAccount.smtp.host,
    //       port: testAccount.smtp.port,
    //       secure: testAccount.smtp.secure,
    //       auth: {
    //         user: testAccount.user,
    //         pass: testAccount.pass,
    //       },
    //     });
    //     console.log("Ethereal test account created. Login:", testAccount.user);
    //     console.log("Ethereal test account password:", testAccount.pass);
    //   });
    // } else {
    this.transporter = nodemailer.createTransport({
      host: paymentConfig.email.host,
      port: paymentConfig.email.port,
      secure: paymentConfig.email.secure,
      auth: {
        user: paymentConfig.email.user,
        pass: paymentConfig.email.pass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
    // }
  }

  async sendOrderConfirmation(data: EmailData): Promise<boolean> {
    try {
      const subject = `Order Confirmation - ${data.orderNumber}`;
      const html = this.generateOrderConfirmationEmail(data);

      await this.transporter.sendMail({
        from: paymentConfig.email.from,
        to: data.customerEmail,
        subject,
        html,
      });

      return true;
    } catch (error) {
      console.error("Send order confirmation error:", error);
      return false;
    }
  }

  async sendOrderStatusUpdate(
    data: EmailData,
    status: ORDER_STATUS
  ): Promise<boolean> {
    try {
      let subject: string;
      let html: string;

      switch (status) {
        case ORDER_STATUS.SHIPPED:
          subject = `Your Order Has Been Shipped - ${data.orderNumber}`;
          html = this.generateOrderShippedEmail(data);
          break;
        case ORDER_STATUS.DELIVERED:
          subject = `Your Order Has Been Delivered - ${data.orderNumber}`;
          html = this.generateOrderDeliveredEmail(data);
          break;
        case ORDER_STATUS.CANCELLED:
          subject = `Order Cancelled - ${data.orderNumber}`;
          html = this.generateOrderCancelledEmail(data);
          break;
        case ORDER_STATUS.REFUNDED:
          subject = `Order Refunded - ${data.orderNumber}`;
          html = this.generateOrderRefundedEmail(data);
          break;
        default:
          return false;
      }

      await this.transporter.sendMail({
        from: paymentConfig.email.from,
        to: data.customerEmail,
        subject,
        html,
      });

      return true;
    } catch (error) {
      console.error("Send order status update error:", error);
      return false;
    }
  }

  private generateOrderConfirmationEmail(data: EmailData): string {
    // Helper function to safely convert to number and format
    const formatCurrency = (value: any): string => {
      const num = typeof value === 'string' ? parseFloat(value) : Number(value);
      return isNaN(num) ? '0.00' : num.toFixed(2);
    };

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation - Aura Well USA</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8f9fa;
          }
          
          .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
          }
          
          .header h1 {
            font-size: 28px;
            font-weight: 600;
            margin-bottom: 10px;
          }
          
          .header p {
            font-size: 16px;
            opacity: 0.9;
          }
          
          .success-icon {
            width: 60px;
            height: 60px;
            background-color: #28a745;
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 20px;
            font-size: 30px;
            color: white;
          }
          
          .content {
            padding: 40px 30px;
          }
          
          .order-summary {
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 25px;
            margin-bottom: 30px;
            border-left: 4px solid #667eea;
          }
          
          .order-number {
            font-size: 24px;
            font-weight: 600;
            color: #667eea;
            margin-bottom: 15px;
          }
          
          .order-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
          }
          
          .detail-item {
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #e9ecef;
          }
          
          .detail-item h3 {
            color: #667eea;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
          }
          
          .detail-item p {
            font-size: 16px;
            font-weight: 500;
          }
          
          .products-section {
            margin-bottom: 30px;
          }
          
          .products-section h2 {
            color: #333;
            font-size: 20px;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #e9ecef;
          }
          
          .product-item {
            display: flex;
            align-items: center;
            padding: 20px;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            margin-bottom: 15px;
            background-color: white;
          }
          
          .product-image {
            width: 80px;
            height: 80px;
            background-color: #f8f9fa;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 20px;
            flex-shrink: 0;
          }
          
          .product-image img {
            max-width: 100%;
            max-height: 100%;
            border-radius: 4px;
          }
          
          .product-info {
            flex: 1;
          }
          
          .product-name {
            font-size: 16px;
            font-weight: 600;
            color: #333;
            margin-bottom: 5px;
          }
          
          .product-meta {
            font-size: 14px;
            color: #6c757d;
            margin-bottom: 8px;
          }
          
          .product-price {
            font-size: 16px;
            font-weight: 600;
            color: #667eea;
          }
          
          .order-totals {
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 25px;
            margin-bottom: 30px;
          }
          
          .total-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            border-bottom: 1px solid #e9ecef;
          }
          
          .total-row:last-child {
            border-bottom: none;
            font-weight: 600;
            font-size: 18px;
            color: #667eea;
            padding-top: 15px;
            margin-top: 10px;
            border-top: 2px solid #e9ecef;
          }
          
          .shipping-address {
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 25px;
            margin-bottom: 30px;
          }
          
          .shipping-address h3 {
            color: #333;
            font-size: 18px;
            margin-bottom: 15px;
          }
          
          .address-details {
            line-height: 1.8;
            color: #6c757d;
          }
          
          .cta-section {
            text-align: center;
            margin-bottom: 30px;
          }
          
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            padding: 15px 30px;
            border-radius: 25px;
            font-weight: 600;
            font-size: 16px;
            transition: all 0.3s ease;
          }
          
          .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
          }
          
          .footer {
            background-color: #2c3e50;
            color: white;
            padding: 30px;
            text-align: center;
          }
          
          .footer h3 {
            font-size: 18px;
            margin-bottom: 15px;
          }
          
          .footer p {
            font-size: 14px;
            opacity: 0.8;
            margin-bottom: 10px;
          }
          
          .social-links {
            margin-top: 20px;
          }
          
          .social-links a {
            display: inline-block;
            width: 40px;
            height: 40px;
            background-color: #667eea;
            color: white;
            text-decoration: none;
            border-radius: 50%;
            margin: 0 5px;
            line-height: 40px;
            font-size: 16px;
          }
          
          @media (max-width: 600px) {
            .order-details {
              grid-template-columns: 1fr;
            }
            
            .product-item {
              flex-direction: column;
              text-align: center;
            }
            
            .product-image {
              margin-right: 0;
              margin-bottom: 15px;
            }
            
            .header {
              padding: 30px 20px;
            }
            
            .content {
              padding: 30px 20px;
            }
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <!-- Header -->
          <div class="header">
            <div class="success-icon">✓</div>
            <h1>Order Confirmed!</h1>
            <p>Thank you for your purchase. We're excited to get your order ready!</p>
          </div>
          
          <!-- Content -->
          <div class="content">
            <!-- Order Summary -->
            <div class="order-summary">
              <div class="order-number">Order #${data.orderNumber}</div>
              <p>We've received your order and will begin processing it right away.</p>
            </div>
            
            <!-- Order Details -->
            <div class="order-details">
              <div class="detail-item">
                <h3>Order Date</h3>
                <p>${new Date(data.order.createdAt).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</p>
              </div>
              <div class="detail-item">
                <h3>Order Status</h3>
                <p>Processing</p>
              </div>
              <div class="detail-item">
                <h3>Payment Method</h3>
                <p>${data.order.paymentMethod || 'Credit Card'}</p>
              </div>
              <div class="detail-item">
                <h3>Total Amount</h3>
                <p>$${formatCurrency(data.order.totalAmount)}</p>
              </div>
            </div>
            
            <!-- Products Section -->
            <div class="products-section">
              <h2>Items Ordered</h2>
              ${data.items.map(item => `
                <div class="product-item">
                  <div class="product-image">
                    ${item.productImage ? `<img src="${item.productImage}" alt="${item.productName}">` : '📦'}
                  </div>
                  <div class="product-info">
                    <div class="product-name">${item.productName}</div>
                    <div class="product-meta">SKU: ${item.sku || 'N/A'} | Qty: ${item.quantity}</div>
                    <div class="product-price">$${formatCurrency(item.totalPrice)}</div>
                  </div>
                </div>
              `).join('')}
            </div>
            
            <!-- Order Totals -->
            <div class="order-totals">
              <div class="total-row">
                <span>Subtotal</span>
                <span>$${formatCurrency(data.order.subtotal)}</span>
              </div>
              <div class="total-row">
                <span>Shipping</span>
                <span>$${formatCurrency(data.order.shippingAmount)}</span>
              </div>
              <div class="total-row">
                <span>Tax</span>
                <span>$${formatCurrency(data.order.taxAmount)}</span>
              </div>
              ${Number(data.order.discountAmount) > 0 ? `
                <div class="total-row">
                  <span>Discount</span>
                  <span style="color: #28a745;">-$${formatCurrency(data.order.discountAmount)}</span>
                </div>
              ` : ''}
              <div class="total-row">
                <span>Total</span>
                <span>$${formatCurrency(data.order.totalAmount)}</span>
              </div>
            </div>
            
            <!-- Shipping Address -->
            <div class="shipping-address">
              <h3>Shipping Address</h3>
              <div class="address-details">
                ${data.shippingAddress.firstName} ${data.shippingAddress.lastName}<br>
                ${data.shippingAddress.addressLine1}<br>
                ${data.shippingAddress.addressLine2 ? `${data.shippingAddress.addressLine2}<br>` : ''}
                ${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.postalCode}<br>
                ${data.shippingAddress.country}
              </div>
            </div>
            
            <!-- CTA Section -->
           
            <!-- Additional Info -->
           
          </div>
          
          <!-- Footer -->
          <div class="footer">
            <h3>Aura Well USA</h3>
            <p>Thank you for choosing us!</p>
            <p>If you have any questions, please contact our support team</p>
            <p>Email: info@canngroupusa.com | Phone: +1 (734) 664-1147</p>
           
            <p style="margin-top: 20px; font-size: 12px; opacity: 0.6;">
              © 2025 Aura Well USA. All rights reserved.<br>
              This email was sent to ${data.customerEmail}
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateOrderShippedEmail(data: EmailData): string {
    // Helper function to safely convert to number and format
    const formatCurrency = (value: any): string => {
      const num = typeof value === 'string' ? parseFloat(value) : Number(value);
      return isNaN(num) ? '0.00' : num.toFixed(2);
    };

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Shipped - CannBE</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8f9fa;
          }
          
          .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          
          .header {
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
          }
          
          .header h1 {
            font-size: 28px;
            font-weight: 600;
            margin-bottom: 10px;
          }
          
          .header p {
            font-size: 16px;
            opacity: 0.9;
          }
          
          .shipping-icon {
            width: 60px;
            height: 60px;
            background-color: #28a745;
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 20px;
            font-size: 30px;
            color: white;
          }
          
          .content {
            padding: 40px 30px;
          }
          
          .order-summary {
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 25px;
            margin-bottom: 30px;
            border-left: 4px solid #28a745;
          }
          
          .order-number {
            font-size: 24px;
            font-weight: 600;
            color: #28a745;
            margin-bottom: 15px;
          }
          
          .tracking-section {
            background-color: #e8f5e8;
            border-radius: 8px;
            padding: 25px;
            margin-bottom: 30px;
            border: 1px solid #28a745;
          }
          
          .tracking-section h3 {
            color: #155724;
            font-size: 18px;
            margin-bottom: 15px;
          }
          
          .tracking-info {
            background-color: white;
            border-radius: 6px;
            padding: 20px;
            margin-bottom: 20px;
          }
          
          .tracking-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            border-bottom: 1px solid #e9ecef;
          }
          
          .tracking-row:last-child {
            border-bottom: none;
          }
          
          .tracking-label {
            font-weight: 600;
            color: #155724;
          }
          
          .tracking-value {
            color: #333;
          }
          
          .shipping-address {
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 25px;
            margin-bottom: 30px;
          }
          
          .shipping-address h3 {
            color: #333;
            font-size: 18px;
            margin-bottom: 15px;
          }
          
          .address-details {
            line-height: 1.8;
            color: #6c757d;
          }
          
          .cta-section {
            text-align: center;
            margin-bottom: 30px;
          }
          
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
            color: white;
            text-decoration: none;
            padding: 15px 30px;
            border-radius: 25px;
            font-weight: 600;
            font-size: 16px;
            transition: all 0.3s ease;
          }
          
          .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(40, 167, 69, 0.4);
          }
          
          .footer {
            background-color: #2c3e50;
            color: white;
            padding: 30px;
            text-align: center;
          }
          
          .footer h3 {
            font-size: 18px;
            margin-bottom: 15px;
          }
          
          .footer p {
            font-size: 14px;
            opacity: 0.8;
            margin-bottom: 10px;
          }
          
          .social-links {
            margin-top: 20px;
          }
          
          .social-links a {
            display: inline-block;
            width: 40px;
            height: 40px;
            background-color: #28a745;
            color: white;
            text-decoration: none;
            border-radius: 50%;
            margin: 0 5px;
            line-height: 40px;
            font-size: 16px;
          }
          
          @media (max-width: 600px) {
            .tracking-row {
              flex-direction: column;
              align-items: flex-start;
              gap: 5px;
            }
            
            .header {
              padding: 30px 20px;
            }
            
            .content {
              padding: 30px 20px;
            }
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <!-- Header -->
          <div class="header">
            <div class="shipping-icon">🚚</div>
            <h1>Your Order Has Been Shipped!</h1>
            <p>Order #${data.orderNumber} is on its way to you.</p>
          </div>
          
          <!-- Content -->
          <div class="content">
            <!-- Order Summary -->
            <div class="order-summary">
              <div class="order-number">Order #${data.orderNumber}</div>
              <p>Your order has been shipped and is now in transit. You can track its progress using the information below.</p>
            </div>
            
            <!-- Tracking Information -->
            <div class="tracking-section">
              <h3>📦 Tracking Information</h3>
              <div class="tracking-info">
                ${data.trackingNumber ? `
                  <div class="tracking-row">
                    <span class="tracking-label">Tracking Number:</span>
                    <span class="tracking-value">${data.trackingNumber}</span>
                  </div>
                ` : ''}
                ${data.estimatedDelivery ? `
                  <div class="tracking-row">
                    <span class="tracking-label">Estimated Delivery:</span>
                    <span class="tracking-value">${data.estimatedDelivery.toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                  </div>
                ` : ''}
                <div class="tracking-row">
                  <span class="tracking-label">Shipping Method:</span>
                  <span class="tracking-value">Standard Shipping</span>
                </div>
                <div class="tracking-row">
                  <span class="tracking-label">Status:</span>
                  <span class="tracking-value" style="color: #28a745; font-weight: 600;">In Transit</span>
                </div>
              </div>
            </div>
            
            <!-- Shipping Address -->
            <div class="shipping-address">
              <h3>📍 Shipping Address</h3>
              <div class="address-details">
                ${data.shippingAddress.firstName} ${data.shippingAddress.lastName}<br>
                ${data.shippingAddress.addressLine1}<br>
                ${data.shippingAddress.addressLine2 ? `${data.shippingAddress.addressLine2}<br>` : ''}
                ${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.postalCode}<br>
                ${data.shippingAddress.country}
              </div>
            </div>
            
            <!-- CTA Section -->
            <div class="cta-section">
              ${data.trackingNumber ? `
                <a href="https://tracking.carrier.com/${data.trackingNumber}" class="cta-button" style="margin-right: 15px;">
                  Track Package
                </a>
              ` : ''}
              <a href="${process.env.FRONTEND_URL || 'https://cannbe.com'}/orders/${data.orderNumber}" class="cta-button">
                View Order Details
              </a>
            </div>
            
            <!-- Additional Info -->
            <div style="background-color: #e8f5e8; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
              <h3 style="color: #155724; margin-bottom: 10px;">📋 What to Expect</h3>
              <ul style="color: #155724; padding-left: 20px;">
                <li>Your package will be delivered to the address above</li>
                <li>You'll receive a delivery notification when it arrives</li>
                <li>If you're not home, the carrier will leave a delivery notice</li>
                <li>Please allow 1-2 business days for delivery</li>
              </ul>
            </div>
          </div>
          
          <!-- Footer -->
          <div class="footer">
            <h3>CannBE</h3>
            <p>Thank you for choosing us!</p>
            <p>If you have any questions about your shipment, please contact our support team</p>
            <p>Email: support@cannbe.com | Phone: +1 (555) 123-4567</p>
            <div class="social-links">
              <a href="#" title="Facebook">f</a>
              <a href="#" title="Twitter">t</a>
              <a href="#" title="Instagram">i</a>
            </div>
            <p style="margin-top: 20px; font-size: 12px; opacity: 0.6;">
              © 2024 CannBE. All rights reserved.<br>
              This email was sent to ${data.customerEmail}
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateOrderDeliveredEmail(data: EmailData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Order Delivered</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; background: #e8f5e8; padding: 20px; border-radius: 5px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Your Order Has Been Delivered!</h1>
            <p>Order #${data.orderNumber} has been successfully delivered.</p>
          </div>
          
          <p>We hope you enjoy your purchase! If you have any issues or questions, please don't hesitate to contact us.</p>
          
          <div class="footer">
            <p>Thank you for choosing CannBE!</p>
            <p>If you have any questions, please contact us at support@cannbe.com</p>
            <p>© 2024 CannBE. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateOrderCancelledEmail(data: EmailData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Order Cancelled</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; background: #ffe6e6; padding: 20px; border-radius: 5px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Cancelled</h1>
            <p>Order #${data.orderNumber} has been cancelled.</p>
          </div>
          
          <p>If you have any questions about this cancellation, please contact our customer service team.</p>
          
          <div class="footer">
            <p>If you have any questions, please contact us at support@cannbe.com</p>
            <p>© 2024 CannBE. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateOrderRefundedEmail(data: EmailData): string {
    // Helper function to safely convert to number and format
    const formatCurrency = (value: any): string => {
      const num = typeof value === 'string' ? parseFloat(value) : Number(value);
      return isNaN(num) ? '0.00' : num.toFixed(2);
    };

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Order Refunded</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; background: #e8f5e8; padding: 20px; border-radius: 5px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Refunded</h1>
            <p>Order #${data.orderNumber} has been refunded.</p>
          </div>
          
          <p>Your refund of $${formatCurrency(data.order.totalAmount)} has been processed. Please allow 3-5 business days for the refund to appear in your account.</p>
          
          <div class="footer">
            <p>If you have any questions, please contact us at support@cannbe.com</p>
            <p>© 2024 CannBE. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

export const emailService = new EmailService();
