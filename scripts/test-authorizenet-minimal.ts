import * as dotenv from "dotenv";
dotenv.config();
import { PaymentService } from "../src/common/services/payment.service";
import { PAYMENT_METHOD } from "../src/modules/checkout/entities/order.enums";

/**
 * Minimal Authorize.net Test
 *
 * This script tests only the Authorize.net payment processing
 * without requiring other services (database, Redis, etc.)
 */

async function testAuthorizeNetMinimal() {
  console.log("🧪 Minimal Authorize.net Payment Test\n");

  // Check if environment variables are set
  const requiredEnvVars = [
    "AUTHORIZE_NET_API_LOGIN_ID",
    "AUTHORIZE_NET_TRANSACTION_KEY",
    "AUTHORIZE_NET_ENVIRONMENT",
  ];

  console.log("📋 Checking environment variables...");
  for (const envVar of requiredEnvVars) {
    const value = process.env[envVar];
    if (!value) {
      console.log(`❌ Missing: ${envVar}`);
    } else {
      console.log(
        `✅ Found: ${envVar} = ${
          envVar.includes("KEY") ? "***" + value.slice(-4) : value
        }`
      );
    }
  }

  // Check if all required variables are present
  const missingVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);
  if (missingVars.length > 0) {
    console.log("\n❌ Missing required environment variables!");
    console.log("Please create a .env file with the following variables:");
    console.log("");
    missingVars.forEach((envVar) => {
      console.log(`${envVar}=your_value_here`);
    });
    console.log(
      "\nYou can copy the content from env-setup.txt to create your .env file."
    );
    return;
  }

  console.log("\n✅ All required environment variables are set!\n");

  const paymentService = new PaymentService();

  // Test payment request
  const paymentRequest = {
    amount: 99.99,
    currency: "USD",
    paymentMethod: PAYMENT_METHOD.CREDIT_CARD,
    paymentData: {
      cardNumber: "4242424242424242", // Test Visa card
      expiryMonth: "12",
      expiryYear: "2025",
      cvv: "123",
      cardholderName: "John Doe",
      billingAddress: {
        addressLine1: "123 Test Street",
        city: "Test City",
        state: "CA",
        postalCode: "12345",
        country: "USA",
      },
    },
    orderId: "test-order-123",
    orderNumber: "INV-12345",
    customerEmail: "test@example.com",
    customerName: "John Doe",
    description: "Test payment for Authorize.net integration",
  };

  try {
    console.log("💳 Processing payment...");
    console.log(`   Amount: $${paymentRequest.amount}`);
    console.log(`   Card: ${paymentRequest.paymentData.cardNumber.slice(-4)}`);
    console.log(`   Customer: ${paymentRequest.customerName}`);

    const result = await paymentService.processPayment(paymentRequest);

    console.log("\n📊 Payment Result:");
    console.log("Success:", result.success);
    console.log("Transaction ID:", result.transactionId);
    console.log("Payment Status:", result.paymentStatus);

    if (result.error) {
      console.log("Error:", result.error);
    }

    if (result.success && result.transactionId) {
      console.log("\n🔄 Testing refund...");
      const refundRequest = {
        transactionId: result.transactionId,
        amount: 99.99,
        reason: "Test refund",
        orderId: "test-order-123",
      };

      const refundResult = await paymentService.refundPayment(refundRequest);
      console.log("Refund Result:");
      console.log("Success:", refundResult.success);
      console.log("Refund ID:", refundResult.refundId);

      if (refundResult.error) {
        console.log("Refund Error:", refundResult.error);
      }
    }
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Run the test
testAuthorizeNetMinimal()
  .then(() => {
    console.log("\n✅ Minimal test completed.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Test failed:", error);
    process.exit(1);
  });
