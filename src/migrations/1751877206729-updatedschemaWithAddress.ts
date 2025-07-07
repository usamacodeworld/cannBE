import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatedschemaWithAddress1751877206729 implements MigrationInterface {
    name = 'UpdatedschemaWithAddress1751877206729'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "addresses" DROP CONSTRAINT "FK_7701a023bc46a8a80f19e2a1cf0"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_addresses_userid"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_addresses_type"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_addresses_status"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_addresses_isdefault"`);
        await queryRunner.query(`CREATE TABLE "shipping_addresses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "company" character varying, "addressLine1" character varying NOT NULL, "addressLine2" character varying, "city" character varying NOT NULL, "state" character varying NOT NULL, "postalCode" character varying NOT NULL, "country" character varying NOT NULL, "phone" character varying, "isDefault" boolean NOT NULL DEFAULT false, "isActive" boolean NOT NULL DEFAULT true, "label" character varying, CONSTRAINT "PK_cced78984eddbbe24470f226692" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "order_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "orderId" uuid NOT NULL, "productId" uuid NOT NULL, "productName" character varying NOT NULL, "productSlug" character varying, "quantity" integer NOT NULL, "unitPrice" numeric(10,2) NOT NULL, "totalPrice" numeric(10,2) NOT NULL, "productSnapshot" text, "selectedVariants" text, "sku" character varying, "taxAmount" numeric(10,2) NOT NULL DEFAULT '0', "discountAmount" numeric(10,2) NOT NULL DEFAULT '0', "thumbnailImage" character varying, CONSTRAINT "PK_005269d8574e6fac0493715c308" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."order_status_enum" AS ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded', 'returned')`);
        await queryRunner.query(`CREATE TYPE "public"."payment_status_enum" AS ENUM('pending', 'authorized', 'captured', 'failed', 'cancelled', 'refunded', 'partially_refunded')`);
        await queryRunner.query(`CREATE TYPE "public"."payment_method_enum" AS ENUM('credit_card', 'debit_card', 'paypal', 'stripe', 'cash_on_delivery', 'bank_transfer', 'wallet')`);
        await queryRunner.query(`CREATE TABLE "orders" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "orderNumber" character varying NOT NULL, "userId" uuid, "guestId" character varying, "status" "public"."order_status_enum" NOT NULL DEFAULT 'pending', "subtotal" numeric(10,2) NOT NULL, "taxAmount" numeric(10,2) NOT NULL DEFAULT '0', "shippingAmount" numeric(10,2) NOT NULL DEFAULT '0', "discountAmount" numeric(10,2) NOT NULL DEFAULT '0', "totalAmount" numeric(10,2) NOT NULL, "paymentStatus" "public"."payment_status_enum" NOT NULL DEFAULT 'pending', "paymentMethod" "public"."payment_method_enum", "paymentTransactionId" character varying, "paymentGatewayResponse" text, "shippingAddress" text NOT NULL, "billingAddress" text, "shippingMethod" character varying, "trackingNumber" character varying, "estimatedDeliveryDate" TIMESTAMP, "actualDeliveryDate" TIMESTAMP, "notes" text, "adminNotes" text, "couponCode" character varying, "emailSent" boolean NOT NULL DEFAULT false, "cancelledAt" TIMESTAMP, "cancelReason" character varying, "customerEmail" character varying, "customerFirstName" character varying, "customerLastName" character varying, "customerPhone" character varying, CONSTRAINT "UQ_59b0c3b34ea0fa5562342f24143" UNIQUE ("orderNumber"), CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "order_status_history" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "orderId" uuid NOT NULL, "status" "public"."order_status_enum" NOT NULL, "changedBy" uuid, "notes" text, "notificationSent" boolean NOT NULL DEFAULT false, "previousStatus" "public"."order_status_enum", CONSTRAINT "PK_e6c66d853f155531985fc4f6ec8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."coupon_type_enum" AS ENUM('percentage', 'fixed_amount', 'free_shipping')`);
        await queryRunner.query(`CREATE TABLE "coupons" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "code" character varying NOT NULL, "name" character varying NOT NULL, "description" character varying, "type" "public"."coupon_type_enum" NOT NULL DEFAULT 'percentage', "value" numeric(10,2) NOT NULL, "minimumAmount" numeric(10,2), "maximumDiscount" numeric(10,2), "startDate" TIMESTAMP, "endDate" TIMESTAMP, "usageLimit" integer, "usageCount" integer NOT NULL DEFAULT '0', "usageLimitPerUser" integer, "isActive" boolean NOT NULL DEFAULT true, "createdBy" uuid, "applicableCategories" text, "applicableProducts" text, CONSTRAINT "UQ_e025109230e82925843f2a14c48" UNIQUE ("code"), CONSTRAINT "PK_d7ea8864a0150183770f3e9a8cb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "addresses" DROP COLUMN "updatedat"`);
        await queryRunner.query(`ALTER TABLE "addresses" DROP COLUMN "userid"`);
        await queryRunner.query(`ALTER TABLE "addresses" DROP COLUMN "isdefault"`);
        await queryRunner.query(`ALTER TABLE "addresses" DROP COLUMN "createdat"`);
        await queryRunner.query(`ALTER TABLE "addresses" DROP COLUMN "addressline2"`);
        await queryRunner.query(`ALTER TABLE "addresses" DROP COLUMN "postalcode"`);
        await queryRunner.query(`ALTER TABLE "addresses" DROP COLUMN "firstname"`);
        await queryRunner.query(`ALTER TABLE "addresses" DROP COLUMN "lastname"`);
        await queryRunner.query(`ALTER TABLE "addresses" DROP COLUMN "addressline1"`);
        await queryRunner.query(`ALTER TABLE "addresses" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "addresses" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "addresses" ADD "userId" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "addresses" ADD "firstName" character varying(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "addresses" ADD "lastName" character varying(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "addresses" ADD "addressLine1" character varying(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "addresses" ADD "addressLine2" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "addresses" ADD "postalCode" character varying(20) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "addresses" ADD "isDefault" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "addresses" ADD CONSTRAINT "FK_95c93a584de49f0b0e13f753630" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "shipping_addresses" ADD CONSTRAINT "FK_6f522735551c716dc489635b5b7" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD CONSTRAINT "FK_f1d359a55923bb45b057fbdab0d" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD CONSTRAINT "FK_cdb99c05982d5191ac8465ac010" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_151b79a83ba240b0cb31b2302d1" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_status_history" ADD CONSTRAINT "FK_689db3835e5550e68d26ca32676" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_status_history" ADD CONSTRAINT "FK_e8c23988e2e618bbff2b4b43a59" FOREIGN KEY ("changedBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "coupons" ADD CONSTRAINT "FK_b8e8b137019c03c958da9b62a28" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "coupons" DROP CONSTRAINT "FK_b8e8b137019c03c958da9b62a28"`);
        await queryRunner.query(`ALTER TABLE "order_status_history" DROP CONSTRAINT "FK_e8c23988e2e618bbff2b4b43a59"`);
        await queryRunner.query(`ALTER TABLE "order_status_history" DROP CONSTRAINT "FK_689db3835e5550e68d26ca32676"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_151b79a83ba240b0cb31b2302d1"`);
        await queryRunner.query(`ALTER TABLE "order_items" DROP CONSTRAINT "FK_cdb99c05982d5191ac8465ac010"`);
        await queryRunner.query(`ALTER TABLE "order_items" DROP CONSTRAINT "FK_f1d359a55923bb45b057fbdab0d"`);
        await queryRunner.query(`ALTER TABLE "shipping_addresses" DROP CONSTRAINT "FK_6f522735551c716dc489635b5b7"`);
        await queryRunner.query(`ALTER TABLE "addresses" DROP CONSTRAINT "FK_95c93a584de49f0b0e13f753630"`);
        await queryRunner.query(`ALTER TABLE "addresses" DROP COLUMN "isDefault"`);
        await queryRunner.query(`ALTER TABLE "addresses" DROP COLUMN "postalCode"`);
        await queryRunner.query(`ALTER TABLE "addresses" DROP COLUMN "addressLine2"`);
        await queryRunner.query(`ALTER TABLE "addresses" DROP COLUMN "addressLine1"`);
        await queryRunner.query(`ALTER TABLE "addresses" DROP COLUMN "lastName"`);
        await queryRunner.query(`ALTER TABLE "addresses" DROP COLUMN "firstName"`);
        await queryRunner.query(`ALTER TABLE "addresses" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "addresses" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "addresses" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "addresses" ADD "addressline1" character varying(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "addresses" ADD "lastname" character varying(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "addresses" ADD "firstname" character varying(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "addresses" ADD "postalcode" character varying(20) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "addresses" ADD "addressline2" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "addresses" ADD "createdat" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "addresses" ADD "isdefault" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "addresses" ADD "userid" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "addresses" ADD "updatedat" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`DROP TABLE "coupons"`);
        await queryRunner.query(`DROP TYPE "public"."coupon_type_enum"`);
        await queryRunner.query(`DROP TABLE "order_status_history"`);
        await queryRunner.query(`DROP TYPE "public"."order_status_enum"`);
        await queryRunner.query(`DROP TABLE "orders"`);
        await queryRunner.query(`DROP TYPE "public"."payment_method_enum"`);
        await queryRunner.query(`DROP TYPE "public"."payment_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."order_status_enum"`);
        await queryRunner.query(`DROP TABLE "order_items"`);
        await queryRunner.query(`DROP TABLE "shipping_addresses"`);
        await queryRunner.query(`CREATE INDEX "IDX_addresses_isdefault" ON "addresses" ("isdefault") `);
        await queryRunner.query(`CREATE INDEX "IDX_addresses_status" ON "addresses" ("status") `);
        await queryRunner.query(`CREATE INDEX "IDX_addresses_type" ON "addresses" ("type") `);
        await queryRunner.query(`CREATE INDEX "IDX_addresses_userid" ON "addresses" ("userid") `);
        await queryRunner.query(`ALTER TABLE "addresses" ADD CONSTRAINT "FK_7701a023bc46a8a80f19e2a1cf0" FOREIGN KEY ("userid") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
