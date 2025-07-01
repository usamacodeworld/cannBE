import { MigrationInterface, QueryRunner } from "typeorm";

export class AddToCart1751351686689 implements MigrationInterface {
    name = 'AddToCart1751351686689'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "attribute_values" DROP CONSTRAINT "FK_attribute_values_attribute"`);
        await queryRunner.query(`ALTER TABLE "attribute_values" DROP CONSTRAINT "FK_attribute_values_image"`);
        await queryRunner.query(`ALTER TABLE "attributes" DROP CONSTRAINT "FK_attributes_product"`);
        await queryRunner.query(`ALTER TABLE "attributes" DROP CONSTRAINT "UQ_attributes_name_productId"`);
        await queryRunner.query(`CREATE TABLE "carts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "guestId" character varying, "userId" character varying, "productId" uuid NOT NULL, "quantity" integer NOT NULL DEFAULT '1', "price" numeric, "selectedAttributes" character varying, "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_b5f695a59f5ebb50af3c8160816" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "thumbnailImgId"`);
        await queryRunner.query(`ALTER TABLE "products" ADD "thumbnailImgId" uuid`);
        await queryRunner.query(`ALTER TABLE "attributes" ADD CONSTRAINT "UQ_89afb34fd1fdb2ceb1cea6c57df" UNIQUE ("name")`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_220faed55dfcb27da93f7ac5421" FOREIGN KEY ("thumbnailImgId") REFERENCES "media_files"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "carts" ADD CONSTRAINT "FK_9c77aaa5bc26f66159661ffd808" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "carts" DROP CONSTRAINT "FK_9c77aaa5bc26f66159661ffd808"`);
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_220faed55dfcb27da93f7ac5421"`);
        await queryRunner.query(`ALTER TABLE "attributes" DROP CONSTRAINT "UQ_89afb34fd1fdb2ceb1cea6c57df"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "thumbnailImgId"`);
        await queryRunner.query(`ALTER TABLE "products" ADD "thumbnailImgId" character varying`);
        await queryRunner.query(`DROP TABLE "carts"`);
        await queryRunner.query(`ALTER TABLE "attributes" ADD CONSTRAINT "UQ_attributes_name_productId" UNIQUE ("name", "productId")`);
        await queryRunner.query(`ALTER TABLE "attributes" ADD CONSTRAINT "FK_attributes_product" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "attribute_values" ADD CONSTRAINT "FK_attribute_values_image" FOREIGN KEY ("imageId") REFERENCES "media_files"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "attribute_values" ADD CONSTRAINT "FK_attribute_values_attribute" FOREIGN KEY ("attributeId") REFERENCES "attributes"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
