import { MigrationInterface, QueryRunner } from "typeorm";

export class DropProductVariantsTable1752000000003 implements MigrationInterface {
    name = 'DropProductVariantsTable1752000000003'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Drop the product_variants table
        await queryRunner.query(`DROP TABLE IF EXISTS "product_variants" CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Recreate the product_variants table (if needed for rollback)
        await queryRunner.query(`
            CREATE TABLE "product_variants" (
                "id" character varying NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "variant" character varying NOT NULL,
                "sku" character varying NOT NULL,
                "price" decimal NOT NULL,
                "quantity" integer NOT NULL,
                "image" character varying,
                "productId" character varying,
                CONSTRAINT "PK_product_variants" PRIMARY KEY ("id")
            )
        `);
        
        // Add foreign key constraint
        await queryRunner.query(`
            ALTER TABLE "product_variants" 
            ADD CONSTRAINT "FK_product_variants_product" 
            FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }
} 