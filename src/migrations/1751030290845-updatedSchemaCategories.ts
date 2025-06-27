import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatedSchemaCategories1751030290845 implements MigrationInterface {
    name = 'UpdatedSchemaCategories1751030290845'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "product_variants" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "variant" character varying NOT NULL, "sku" character varying NOT NULL, "price" numeric NOT NULL, "quantity" integer NOT NULL, "image" character varying, "productId" uuid, CONSTRAINT "UQ_46f236f21640f9da218a063a866" UNIQUE ("sku"), CONSTRAINT "PK_281e3f2c55652d6a22c0aa59fd7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "products" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "addedBy" character varying, "userId" character varying, "name" character varying NOT NULL, "slug" character varying NOT NULL, "photos" text, "thumbnailImg" character varying, "tags" text, "shortDescription" character varying, "longDescription" character varying, "regularPrice" numeric, "salePrice" numeric, "isVariant" boolean NOT NULL DEFAULT false, "published" boolean NOT NULL DEFAULT false, "approved" boolean NOT NULL DEFAULT false, "stock" integer, "cashOnDelivery" boolean NOT NULL DEFAULT false, "featured" boolean NOT NULL DEFAULT false, "discount" numeric, "discountType" character varying, "discountStartDate" TIMESTAMP, "discountEndDate" TIMESTAMP, "tax" numeric, "taxType" character varying, "shippingType" character varying, "shippingCost" numeric, "estShippingDays" integer, "numOfSales" integer, "metaTitle" character varying, "metaDescription" character varying, "rating" numeric, "externalLink" character varying, "externalLinkBtn" character varying, CONSTRAINT "UQ_464f927ae360106b783ed0b4106" UNIQUE ("slug"), CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "media_files" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "scope" character varying NOT NULL DEFAULT 'admin', "uri" character varying, "url" text, "fileName" character varying NOT NULL, "mimetype" character varying NOT NULL, "size" integer NOT NULL, "userId" character varying, CONSTRAINT "UQ_3056d1c65dae9bacd8fa978d266" UNIQUE ("uri"), CONSTRAINT "PK_93b4da6741cd150e76f9ac035d8" PRIMARY KEY ("id")); COMMENT ON COLUMN "media_files"."scope" IS 'Resource scope e.g. admin, seller, buyer'; COMMENT ON COLUMN "media_files"."uri" IS 'File path in S3 bucket for internal files. The URL should be composed on retrieval using a pre-signed URL.'; COMMENT ON COLUMN "media_files"."url" IS 'File URL for public media files (products, blog posts)'`);
        await queryRunner.query(`CREATE TABLE "categories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "isParent" boolean DEFAULT false, "parentId" uuid, "name" character varying NOT NULL, "slug" character varying NOT NULL, "description" character varying, "isActive" boolean DEFAULT false, "thumbnailImageId" uuid, "coverImageId" uuid, "isFeatured" boolean DEFAULT false, "isPopular" boolean DEFAULT false, CONSTRAINT "UQ_420d9f679d41281f282f5bc7d09" UNIQUE ("slug"), CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_9a6f051e66982b5f0318981bca" ON "categories" ("parentId") `);
        await queryRunner.query(`CREATE TABLE "permissions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, "description" character varying, CONSTRAINT "UQ_48ce552495d14eae9b187bb6716" UNIQUE ("name"), CONSTRAINT "PK_920331560282b8bd21bb02290df" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "roles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, "description" character varying, CONSTRAINT "UQ_648e3f5447f725579d7d4ffdfb7" UNIQUE ("name"), CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "type" character varying NOT NULL, "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "userName" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "phone" character varying, "emailVerified" boolean DEFAULT false, "isActive" boolean DEFAULT false, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")); COMMENT ON COLUMN "users"."type" IS 'admin, seller, buyer. Roles outside of the scope has no effect'; COMMENT ON COLUMN "users"."phone" IS 'Phone number'`);
        await queryRunner.query(`CREATE TABLE "attributes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, CONSTRAINT "UQ_89afb34fd1fdb2ceb1cea6c57df" UNIQUE ("name"), CONSTRAINT "PK_32216e2e61830211d3a5d7fa72c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "attribute_values" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "value" character varying NOT NULL, "colorCode" character varying, "attributeId" uuid, CONSTRAINT "PK_3babf93d1842d73e7ba849c0160" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "products_categories_categories" ("productsId" uuid NOT NULL, "categoriesId" uuid NOT NULL, CONSTRAINT "PK_8fd95511a998d598ff66d500933" PRIMARY KEY ("productsId", "categoriesId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_40e7da0284a5389344605de8da" ON "products_categories_categories" ("productsId") `);
        await queryRunner.query(`CREATE INDEX "IDX_e1d833224b5be535323207473f" ON "products_categories_categories" ("categoriesId") `);
        await queryRunner.query(`CREATE TABLE "role_permissions" ("roleId" uuid NOT NULL, "permissionName" character varying NOT NULL, CONSTRAINT "PK_ac47b71a830e90c75f41040ba1a" PRIMARY KEY ("roleId", "permissionName"))`);
        await queryRunner.query(`CREATE INDEX "IDX_b4599f8b8f548d35850afa2d12" ON "role_permissions" ("roleId") `);
        await queryRunner.query(`CREATE INDEX "IDX_b4f3a5b54478bd9a66cb6ad8e4" ON "role_permissions" ("permissionName") `);
        await queryRunner.query(`CREATE TABLE "user_roles" ("userId" uuid NOT NULL, "roleId" uuid NOT NULL, CONSTRAINT "PK_88481b0c4ed9ada47e9fdd67475" PRIMARY KEY ("userId", "roleId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_472b25323af01488f1f66a06b6" ON "user_roles" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_86033897c009fcca8b6505d6be" ON "user_roles" ("roleId") `);
        await queryRunner.query(`ALTER TABLE "product_variants" ADD CONSTRAINT "FK_f515690c571a03400a9876600b5" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "categories" ADD CONSTRAINT "FK_9a6f051e66982b5f0318981bcaa" FOREIGN KEY ("parentId") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "categories" ADD CONSTRAINT "FK_69d45adbc59b8f44730cc411ca1" FOREIGN KEY ("thumbnailImageId") REFERENCES "media_files"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "categories" ADD CONSTRAINT "FK_2c1f40c7ab98d13a79214436d81" FOREIGN KEY ("coverImageId") REFERENCES "media_files"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "attribute_values" ADD CONSTRAINT "FK_b8f8e1d9141248b538c9285574e" FOREIGN KEY ("attributeId") REFERENCES "attributes"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "products_categories_categories" ADD CONSTRAINT "FK_40e7da0284a5389344605de8dab" FOREIGN KEY ("productsId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "products_categories_categories" ADD CONSTRAINT "FK_e1d833224b5be535323207473f1" FOREIGN KEY ("categoriesId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_b4599f8b8f548d35850afa2d12c" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_b4f3a5b54478bd9a66cb6ad8e4a" FOREIGN KEY ("permissionName") REFERENCES "permissions"("name") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_roles" ADD CONSTRAINT "FK_472b25323af01488f1f66a06b67" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_roles" ADD CONSTRAINT "FK_86033897c009fcca8b6505d6be2" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_roles" DROP CONSTRAINT "FK_86033897c009fcca8b6505d6be2"`);
        await queryRunner.query(`ALTER TABLE "user_roles" DROP CONSTRAINT "FK_472b25323af01488f1f66a06b67"`);
        await queryRunner.query(`ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_b4f3a5b54478bd9a66cb6ad8e4a"`);
        await queryRunner.query(`ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_b4599f8b8f548d35850afa2d12c"`);
        await queryRunner.query(`ALTER TABLE "products_categories_categories" DROP CONSTRAINT "FK_e1d833224b5be535323207473f1"`);
        await queryRunner.query(`ALTER TABLE "products_categories_categories" DROP CONSTRAINT "FK_40e7da0284a5389344605de8dab"`);
        await queryRunner.query(`ALTER TABLE "attribute_values" DROP CONSTRAINT "FK_b8f8e1d9141248b538c9285574e"`);
        await queryRunner.query(`ALTER TABLE "categories" DROP CONSTRAINT "FK_2c1f40c7ab98d13a79214436d81"`);
        await queryRunner.query(`ALTER TABLE "categories" DROP CONSTRAINT "FK_69d45adbc59b8f44730cc411ca1"`);
        await queryRunner.query(`ALTER TABLE "categories" DROP CONSTRAINT "FK_9a6f051e66982b5f0318981bcaa"`);
        await queryRunner.query(`ALTER TABLE "product_variants" DROP CONSTRAINT "FK_f515690c571a03400a9876600b5"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_86033897c009fcca8b6505d6be"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_472b25323af01488f1f66a06b6"`);
        await queryRunner.query(`DROP TABLE "user_roles"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b4f3a5b54478bd9a66cb6ad8e4"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b4599f8b8f548d35850afa2d12"`);
        await queryRunner.query(`DROP TABLE "role_permissions"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e1d833224b5be535323207473f"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_40e7da0284a5389344605de8da"`);
        await queryRunner.query(`DROP TABLE "products_categories_categories"`);
        await queryRunner.query(`DROP TABLE "attribute_values"`);
        await queryRunner.query(`DROP TABLE "attributes"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "roles"`);
        await queryRunner.query(`DROP TABLE "permissions"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9a6f051e66982b5f0318981bca"`);
        await queryRunner.query(`DROP TABLE "categories"`);
        await queryRunner.query(`DROP TABLE "media_files"`);
        await queryRunner.query(`DROP TABLE "products"`);
        await queryRunner.query(`DROP TABLE "product_variants"`);
    }

}
