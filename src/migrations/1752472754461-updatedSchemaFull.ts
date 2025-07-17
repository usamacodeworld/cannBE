import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatedSchemaFull1752472754461 implements MigrationInterface {
    name = 'UpdatedSchemaFull1752472754461'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."zone_type_enum" AS ENUM('country', 'state', 'city', 'postal_code', 'custom')`);
        await queryRunner.query(`CREATE TABLE "shipping_zones" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, "slug" character varying NOT NULL, "description" character varying, "zoneType" "public"."zone_type_enum" NOT NULL DEFAULT 'country', "countries" text, "states" text, "cities" text, "postalCodes" text, "isActive" boolean NOT NULL DEFAULT true, "priority" integer NOT NULL DEFAULT '0', "color" character varying, CONSTRAINT "UQ_d5d063e075b556ca3108e5da498" UNIQUE ("slug"), CONSTRAINT "PK_e55857b9198ec611b75d72ff958" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."method_type_enum" AS ENUM('flat_rate', 'free_shipping', 'weight_based', 'price_based', 'distance_based')`);
        await queryRunner.query(`CREATE TYPE "public"."carrier_type_enum" AS ENUM('standard', 'express', 'premium', 'economy', 'same_day', 'next_day')`);
        await queryRunner.query(`CREATE TABLE "shipping_methods" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, "slug" character varying NOT NULL, "description" character varying, "methodType" "public"."method_type_enum" NOT NULL DEFAULT 'flat_rate', "carrierType" "public"."carrier_type_enum" NOT NULL DEFAULT 'standard', "zoneId" uuid, "isActive" boolean NOT NULL DEFAULT true, "priority" integer NOT NULL DEFAULT '0', "estimatedDays" integer, "icon" character varying, "color" character varying, "isDefault" boolean NOT NULL DEFAULT false, "requiresSignature" boolean NOT NULL DEFAULT false, "isInsured" boolean NOT NULL DEFAULT false, "insuranceAmount" numeric(10,2), CONSTRAINT "UQ_f13ccce04f84b993b7dd256a134" UNIQUE ("slug"), CONSTRAINT "PK_5bee9dd62a8b72d6d9caabd63cf" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."rate_type_enum" AS ENUM('flat_rate', 'weight_based', 'price_based', 'distance_based', 'free', 'item_based')`);
        await queryRunner.query(`CREATE TABLE "shipping_rates" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "methodId" uuid, "rateType" "public"."rate_type_enum" NOT NULL DEFAULT 'flat_rate', "baseRate" numeric(10,2) NOT NULL DEFAULT '0', "additionalRate" numeric(10,2) NOT NULL DEFAULT '0', "minWeight" numeric(8,2), "maxWeight" numeric(8,2), "weightUnit" numeric(8,2), "minOrderValue" numeric(10,2), "maxOrderValue" numeric(10,2), "minDistance" numeric(8,2), "maxDistance" numeric(8,2), "distanceUnit" numeric(8,2), "firstItemCount" integer, "additionalItemRate" numeric(10,2), "maxItems" integer, "isActive" boolean NOT NULL DEFAULT true, "name" character varying, "description" character varying, "isFreeShipping" boolean NOT NULL DEFAULT false, "freeShippingThreshold" numeric(10,2), "appliesToAllProducts" boolean NOT NULL DEFAULT false, "productIds" text, "categoryIds" text, "excludedProductIds" text, "excludedCategoryIds" text, "validFrom" TIMESTAMP, "validTo" TIMESTAMP, "isHolidayRate" boolean NOT NULL DEFAULT false, "holidayDates" text, "handlingFee" numeric(10,2) NOT NULL DEFAULT '0', "insuranceFee" numeric(10,2) NOT NULL DEFAULT '0', "signatureFee" numeric(10,2) NOT NULL DEFAULT '0', CONSTRAINT "PK_c97b830633433697b24df68885a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."sellers_status_enum" AS ENUM('pending', 'approved', 'rejected', 'suspended', 'inactive')`);
        await queryRunner.query(`CREATE TYPE "public"."sellers_verificationstatus_enum" AS ENUM('unverified', 'pending', 'verified', 'rejected')`);
        await queryRunner.query(`CREATE TABLE "sellers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid NOT NULL, "businessName" character varying, "businessDescription" character varying, "businessPhone" character varying, "businessEmail" character varying, "businessWebsite" character varying, "businessAddress" character varying, "businessCity" character varying, "businessState" character varying, "businessPostalCode" character varying, "businessCountry" character varying, "taxId" character varying, "licenseNumber" character varying, "licenseExpiryDate" TIMESTAMP, "status" "public"."sellers_status_enum" NOT NULL DEFAULT 'pending', "verificationStatus" "public"."sellers_verificationstatus_enum" NOT NULL DEFAULT 'unverified', "verificationDocuments" character varying, "profileImage" character varying, "bannerImage" character varying, "totalProducts" integer NOT NULL DEFAULT '0', "totalSales" integer NOT NULL DEFAULT '0', "totalOrders" integer NOT NULL DEFAULT '0', "totalRevenue" integer NOT NULL DEFAULT '0', "rating" integer NOT NULL DEFAULT '0', "reviewCount" integer NOT NULL DEFAULT '0', "commissionRate" integer, "payoutMethod" character varying, "payoutDetails" character varying, "approvedAt" TIMESTAMP, "approvedBy" character varying, "rejectionReason" character varying, "notes" character varying, CONSTRAINT "UQ_4c1c59db4ac1ed90a1a7c0ff3df" UNIQUE ("userId"), CONSTRAINT "REL_4c1c59db4ac1ed90a1a7c0ff3d" UNIQUE ("userId"), CONSTRAINT "PK_97337ccbf692c58e6c7682de8a2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "products" ADD "sellerId" uuid`);
        await queryRunner.query(`ALTER TABLE "shipping_methods" ADD CONSTRAINT "FK_6ed579b650f6a9e19b7de645139" FOREIGN KEY ("zoneId") REFERENCES "shipping_zones"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "shipping_rates" ADD CONSTRAINT "FK_df3c39d5a23460782a9fb153b81" FOREIGN KEY ("methodId") REFERENCES "shipping_methods"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sellers" ADD CONSTRAINT "FK_4c1c59db4ac1ed90a1a7c0ff3df" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_e40a1dd2909378f0da1f34f7bd6" FOREIGN KEY ("sellerId") REFERENCES "sellers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_e40a1dd2909378f0da1f34f7bd6"`);
        await queryRunner.query(`ALTER TABLE "sellers" DROP CONSTRAINT "FK_4c1c59db4ac1ed90a1a7c0ff3df"`);
        await queryRunner.query(`ALTER TABLE "shipping_rates" DROP CONSTRAINT "FK_df3c39d5a23460782a9fb153b81"`);
        await queryRunner.query(`ALTER TABLE "shipping_methods" DROP CONSTRAINT "FK_6ed579b650f6a9e19b7de645139"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "sellerId"`);
        await queryRunner.query(`DROP TABLE "sellers"`);
        await queryRunner.query(`DROP TYPE "public"."sellers_verificationstatus_enum"`);
        await queryRunner.query(`DROP TYPE "public"."sellers_status_enum"`);
        await queryRunner.query(`DROP TABLE "shipping_rates"`);
        await queryRunner.query(`DROP TYPE "public"."rate_type_enum"`);
        await queryRunner.query(`DROP TABLE "shipping_methods"`);
        await queryRunner.query(`DROP TYPE "public"."carrier_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."method_type_enum"`);
        await queryRunner.query(`DROP TABLE "shipping_zones"`);
        await queryRunner.query(`DROP TYPE "public"."zone_type_enum"`);
    }

}
