import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateShippingTables1752312654142 implements MigrationInterface {
    name = 'CreateShippingTables1752312654142'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create zone_type_enum
        await queryRunner.query(`
            CREATE TYPE "public"."zone_type_enum" AS ENUM('country', 'state', 'city', 'postal_code', 'custom')
        `);

        // Create method_type_enum
        await queryRunner.query(`
            CREATE TYPE "public"."method_type_enum" AS ENUM('flat_rate', 'free_shipping', 'weight_based', 'price_based', 'distance_based')
        `);

        // Create carrier_type_enum
        await queryRunner.query(`
            CREATE TYPE "public"."carrier_type_enum" AS ENUM('standard', 'express', 'premium', 'economy', 'same_day', 'next_day')
        `);

        // Create rate_type_enum
        await queryRunner.query(`
            CREATE TYPE "public"."rate_type_enum" AS ENUM('flat_rate', 'weight_based', 'price_based', 'distance_based', 'free', 'item_based')
        `);

        // Create shipping_zones table
        await queryRunner.query(`
            CREATE TABLE "shipping_zones" (
                "id" character varying NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "name" character varying NOT NULL,
                "slug" character varying NOT NULL,
                "description" character varying,
                "zoneType" "public"."zone_type_enum" NOT NULL DEFAULT 'country',
                "countries" json,
                "states" json,
                "cities" json,
                "postalCodes" json,
                "isActive" boolean NOT NULL DEFAULT true,
                "priority" integer NOT NULL DEFAULT '0',
                "color" character varying,
                CONSTRAINT "UQ_shipping_zones_slug" UNIQUE ("slug"),
                CONSTRAINT "PK_shipping_zones" PRIMARY KEY ("id")
            )
        `);

        // Create shipping_methods table
        await queryRunner.query(`
            CREATE TABLE "shipping_methods" (
                "id" character varying NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "name" character varying NOT NULL,
                "slug" character varying NOT NULL,
                "description" character varying,
                "methodType" "public"."method_type_enum" NOT NULL DEFAULT 'flat_rate',
                "carrierType" "public"."carrier_type_enum" NOT NULL DEFAULT 'standard',
                "zoneId" character varying,
                "isActive" boolean NOT NULL DEFAULT true,
                "priority" integer NOT NULL DEFAULT '0',
                "estimatedDays" integer,
                "icon" character varying,
                "color" character varying,
                "isDefault" boolean NOT NULL DEFAULT false,
                "requiresSignature" boolean NOT NULL DEFAULT false,
                "isInsured" boolean NOT NULL DEFAULT false,
                "insuranceAmount" numeric(10,2),
                CONSTRAINT "UQ_shipping_methods_slug" UNIQUE ("slug"),
                CONSTRAINT "PK_shipping_methods" PRIMARY KEY ("id")
            )
        `);

        // Create shipping_rates table
        await queryRunner.query(`
            CREATE TABLE "shipping_rates" (
                "id" character varying NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "methodId" character varying,
                "rateType" "public"."rate_type_enum" NOT NULL DEFAULT 'flat_rate',
                "baseRate" numeric(10,2) NOT NULL DEFAULT '0',
                "additionalRate" numeric(10,2) NOT NULL DEFAULT '0',
                "minWeight" numeric(8,2),
                "maxWeight" numeric(8,2),
                "weightUnit" numeric(8,2),
                "minOrderValue" numeric(10,2),
                "maxOrderValue" numeric(10,2),
                "minDistance" numeric(8,2),
                "maxDistance" numeric(8,2),
                "distanceUnit" numeric(8,2),
                "firstItemCount" integer,
                "additionalItemRate" numeric(10,2),
                "maxItems" integer,
                "maxShippingCost" numeric(10,2),
                "isActive" boolean NOT NULL DEFAULT true,
                "priority" integer NOT NULL DEFAULT '0',
                "name" character varying,
                "description" character varying,
                "isFreeShipping" boolean NOT NULL DEFAULT false,
                "freeShippingThreshold" numeric(10,2),
                "appliesToAllProducts" boolean NOT NULL DEFAULT false,
                "productIds" json,
                "categoryIds" json,
                "excludedProductIds" json,
                "excludedCategoryIds" json,
                "validFrom" TIMESTAMP,
                "validTo" TIMESTAMP,
                "isHolidayRate" boolean NOT NULL DEFAULT false,
                "holidayDates" json,
                "handlingFee" numeric(10,2) NOT NULL DEFAULT '0',
                "insuranceFee" numeric(10,2) NOT NULL DEFAULT '0',
                "signatureFee" numeric(10,2) NOT NULL DEFAULT '0',
                CONSTRAINT "PK_shipping_rates" PRIMARY KEY ("id")
            )
        `);

        // Add foreign key constraints
        await queryRunner.query(`
            ALTER TABLE "shipping_methods" 
            ADD CONSTRAINT "FK_shipping_methods_zone" 
            FOREIGN KEY ("zoneId") REFERENCES "shipping_zones"("id") ON DELETE SET NULL ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "shipping_rates" 
            ADD CONSTRAINT "FK_shipping_rates_method" 
            FOREIGN KEY ("methodId") REFERENCES "shipping_methods"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        // Create indexes for better performance
        await queryRunner.query(`
            CREATE INDEX "IDX_shipping_zones_isActive" ON "shipping_zones" ("isActive")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_shipping_zones_priority" ON "shipping_zones" ("priority")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_shipping_methods_zoneId" ON "shipping_methods" ("zoneId")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_shipping_methods_isActive" ON "shipping_methods" ("isActive")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_shipping_methods_isDefault" ON "shipping_methods" ("isDefault")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_shipping_rates_methodId" ON "shipping_rates" ("methodId")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_shipping_rates_isActive" ON "shipping_rates" ("isActive")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_shipping_rates_priority" ON "shipping_rates" ("priority")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes
        await queryRunner.query(`DROP INDEX "IDX_shipping_rates_priority"`);
        await queryRunner.query(`DROP INDEX "IDX_shipping_rates_isActive"`);
        await queryRunner.query(`DROP INDEX "IDX_shipping_rates_methodId"`);
        await queryRunner.query(`DROP INDEX "IDX_shipping_methods_isDefault"`);
        await queryRunner.query(`DROP INDEX "IDX_shipping_methods_isActive"`);
        await queryRunner.query(`DROP INDEX "IDX_shipping_methods_zoneId"`);
        await queryRunner.query(`DROP INDEX "IDX_shipping_zones_priority"`);
        await queryRunner.query(`DROP INDEX "IDX_shipping_zones_isActive"`);

        // Drop foreign key constraints
        await queryRunner.query(`ALTER TABLE "shipping_rates" DROP CONSTRAINT "FK_shipping_rates_method"`);
        await queryRunner.query(`ALTER TABLE "shipping_methods" DROP CONSTRAINT "FK_shipping_methods_zone"`);

        // Drop tables
        await queryRunner.query(`DROP TABLE "shipping_rates"`);
        await queryRunner.query(`DROP TABLE "shipping_methods"`);
        await queryRunner.query(`DROP TABLE "shipping_zones"`);

        // Drop enums
        await queryRunner.query(`DROP TYPE "public"."rate_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."carrier_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."method_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."zone_type_enum"`);
    }
} 