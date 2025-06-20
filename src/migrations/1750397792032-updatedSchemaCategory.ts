import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatedSchemaCategory1750397792032 implements MigrationInterface {
    name = 'UpdatedSchemaCategory1750397792032'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "product_variants" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "variant" character varying NOT NULL, "sku" character varying NOT NULL, "price" numeric NOT NULL, "quantity" integer NOT NULL, "image" character varying, "productId" uuid, CONSTRAINT "UQ_46f236f21640f9da218a063a866" UNIQUE ("sku"), CONSTRAINT "PK_281e3f2c55652d6a22c0aa59fd7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "products" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "added_by" character varying, "user_id" character varying, "category_id" character varying, "name" character varying NOT NULL, "slug" character varying NOT NULL, "photos" text, "thumbnail_img" character varying, "tags" text, "short_description" character varying, "long_description" character varying, "regular_price" numeric, "sale_price" numeric, "is_variant" boolean NOT NULL DEFAULT false, "published" boolean NOT NULL DEFAULT false, "approved" boolean NOT NULL DEFAULT false, "stock" integer, "cash_on_delivery" boolean NOT NULL DEFAULT false, "featured" boolean NOT NULL DEFAULT false, "discount" numeric, "discount_type" character varying, "discount_start_date" TIMESTAMP, "discount_end_date" TIMESTAMP, "tax" numeric, "tax_type" character varying, "shipping_type" character varying, "shipping_cose" numeric, "est_shipping_days" integer, "num_of_sales" integer, "meta_title" character varying, "meta_description" character varying, "rating" numeric, "external_link" character varying, "external_link_btn" character varying, CONSTRAINT "UQ_464f927ae360106b783ed0b4106" UNIQUE ("slug"), CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "attribute_values" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "value" character varying NOT NULL, "colorCode" character varying, "attributeId" uuid, CONSTRAINT "PK_3babf93d1842d73e7ba849c0160" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "attributes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, CONSTRAINT "UQ_89afb34fd1fdb2ceb1cea6c57df" UNIQUE ("name"), CONSTRAINT "PK_32216e2e61830211d3a5d7fa72c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "categories" ADD "isParent" boolean DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "categories" ADD "parent_id" uuid`);
        await queryRunner.query(`ALTER TABLE "product_variants" ADD CONSTRAINT "FK_f515690c571a03400a9876600b5" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "attribute_values" ADD CONSTRAINT "FK_b8f8e1d9141248b538c9285574e" FOREIGN KEY ("attributeId") REFERENCES "attributes"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "attribute_values" DROP CONSTRAINT "FK_b8f8e1d9141248b538c9285574e"`);
        await queryRunner.query(`ALTER TABLE "product_variants" DROP CONSTRAINT "FK_f515690c571a03400a9876600b5"`);
        await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "parent_id"`);
        await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "isParent"`);
        await queryRunner.query(`DROP TABLE "attributes"`);
        await queryRunner.query(`DROP TABLE "attribute_values"`);
        await queryRunner.query(`DROP TABLE "products"`);
        await queryRunner.query(`DROP TABLE "product_variants"`);
    }

}
