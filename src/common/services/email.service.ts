import nodemailer from 'nodemailer';
import handlebars from 'handlebars';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { paymentConfig } from '../../config/payment.config';
import { Order, ORDER_STATUS } from '../../modules/checkout/entities/order.entity';

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
    this.transporter = nodemailer.createTransport({
      host: paymentConfig.email.host,
      port: paymentConfig.email.port,
      secure: paymentConfig.email.secure,
      auth: {
        user: paymentConfig.email.user,
        pass: paymentConfig.email.pass
      }
    });
  }

  async sendOrderConfirmation(data: EmailData): Promise<boolean> {
    try {
      const subject = `Order Confirmation - ${data.orderNumber}`;
      const html = this.generateOrderConfirmationEmail(data);

      await this.transporter.sendMail({
        from: paymentConfig.email.from,
        to: data.customerEmail,
        subject,
        html
      });

      return true;
    } catch (error) {
      console.error('Send order confirmation error:', error);
      return false;
    }
  }

  async sendOrderStatusUpdate(data: EmailData, status: ORDER_STATUS): Promise<boolean> {
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
        html
      });

      return true;
    } catch (error) {
      console.error('Send order status update error:', error);
      return false;
    }
  }

  private generateOrderConfirmationEmail(data: EmailData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Order Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; background: #f8f9fa; padding: 20px; border-radius: 5px; }
          .order-details { background: #fff; padding: 20px; margin: 20px 0; border: 1px solid #ddd; border-radius: 5px; }
          .item { border-bottom: 1px solid #eee; padding: 10px 0; }
          .total { font-weight: bold; font-size: 18px; text-align: right; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Confirmation</h1>
            <p>Thank you for your order!</p>
          </div>
          
          <div class="order-details">
            <h2>Order #${data.orderNumber}</h2>
            <p><strong>Date:</strong> ${new Date(data.order.createdAt).toLocaleDateString()}</p>
            <p><strong>Customer:</strong> ${data.customerName}</p>
            <p><strong>Email:</strong> ${data.customerEmail}</p>
            
            <h3>Items Ordered:</h3>
            ${data.items.map(item => `
              <div class="item">
                <strong>${item.productName}</strong><br>
                Quantity: ${item.quantity} | Price: $${item.unitPrice} | Total: $${item.totalPrice}
              </div>
            `).join('')}
            
            <div class="total">
              <p>Subtotal: $${data.order.subtotal}</p>
              <p>Tax: $${data.order.taxAmount}</p>
              <p>Shipping: $${data.order.shippingAmount}</p>
              ${data.order.discountAmount > 0 ? `<p>Discount: -$${data.order.discountAmount}</p>` : ''}
              <p><strong>Total: $${data.order.totalAmount}</strong></p>
            </div>
          </div>
          
          <div class="footer">
            <p>If you have any questions, please contact us at support@cannbe.com</p>
            <p>© 2024 CannBE. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateOrderShippedEmail(data: EmailData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Order Shipped</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; background: #e8f5e8; padding: 20px; border-radius: 5px; }
          .tracking { background: #fff; padding: 20px; margin: 20px 0; border: 1px solid #ddd; border-radius: 5px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Your Order Has Been Shipped!</h1>
            <p>Order #${data.orderNumber} is on its way to you.</p>
          </div>
          
          <div class="tracking">
            <h3>Tracking Information:</h3>
            ${data.trackingNumber ? `<p><strong>Tracking Number:</strong> ${data.trackingNumber}</p>` : ''}
            ${data.estimatedDelivery ? `<p><strong>Estimated Delivery:</strong> ${data.estimatedDelivery.toLocaleDateString()}</p>` : ''}
            <p><strong>Shipping Address:</strong></p>
            <p>${data.shippingAddress.firstName} ${data.shippingAddress.lastName}<br>
            ${data.shippingAddress.addressLine1}<br>
            ${data.shippingAddress.addressLine2 ? `${data.shippingAddress.addressLine2}<br>` : ''}
            ${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.postalCode}<br>
            ${data.shippingAddress.country}</p>
          </div>
          
          <div class="footer">
            <p>Track your package using the tracking number above.</p>
            <p>If you have any questions, please contact us at support@cannbe.com</p>
            <p>© 2024 CannBE. All rights reserved.</p>
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
          
          <p>Your refund of $${data.order.totalAmount} has been processed. Please allow 3-5 business days for the refund to appear in your account.</p>
          
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