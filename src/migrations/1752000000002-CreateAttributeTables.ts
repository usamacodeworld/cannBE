import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAttributeTables1752000000002 implements MigrationInterface {
    name = 'CreateAttributeTables1752000000002'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create attributes table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "attributes" (
                "id" character varying NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "name" character varying NOT NULL,
                "productId" character varying,
                CONSTRAINT "UQ_attributes_name" UNIQUE ("name"),
                CONSTRAINT "PK_attributes" PRIMARY KEY ("id")
            )
        `);

        // Create attribute_values table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "attribute_values" (
                "id" character varying NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "variant" character varying,
                "sku" character varying,
                "price" decimal,
                "quantity" integer,
                "imageId" character varying,
                "attributeId" character varying,
                CONSTRAINT "PK_attribute_values" PRIMARY KEY ("id")
            )
        `);

        // Add foreign key constraints
        await queryRunner.query(`
            ALTER TABLE "attributes" 
            ADD CONSTRAINT "FK_attributes_product" 
            FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "attribute_values" 
            ADD CONSTRAINT "FK_attribute_values_attribute" 
            FOREIGN KEY ("attributeId") REFERENCES "attributes"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "attribute_values" 
            ADD CONSTRAINT "FK_attribute_values_image" 
            FOREIGN KEY ("imageId") REFERENCES "media_files"("id") ON DELETE SET NULL ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign key constraints
        await queryRunner.query(`ALTER TABLE "attribute_values" DROP CONSTRAINT "FK_attribute_values_image"`);
        await queryRunner.query(`ALTER TABLE "attribute_values" DROP CONSTRAINT "FK_attribute_values_attribute"`);
        await queryRunner.query(`ALTER TABLE "attributes" DROP CONSTRAINT "FK_attributes_product"`);

        // Drop tables
        await queryRunner.query(`DROP TABLE "attribute_values"`);
        await queryRunner.query(`DROP TABLE "attributes"`);
    }
} 