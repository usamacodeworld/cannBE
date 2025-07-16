import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCategoryRestrictionsTable1752472754462 implements MigrationInterface {
    name = 'CreateCategoryRestrictionsTable1752472754462'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Drop existing table if it exists
        await queryRunner.query(`DROP TABLE IF EXISTS "category_state_restrictions"`);
        
        // Create new table with states as JSON array
        await queryRunner.query(`
            CREATE TABLE "category_state_restrictions" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "categoryId" uuid NOT NULL,
                "states" json NOT NULL,
                "isRestricted" boolean NOT NULL DEFAULT true,
                "reason" text,
                "customMessage" text,
                "isActive" boolean NOT NULL DEFAULT true,
                "createdBy" uuid,
                "notes" text,
                CONSTRAINT "PK_category_state_restrictions" PRIMARY KEY ("id")
            )
        `);
        
        // Create unique index on categoryId
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_category_state_restrictions_categoryId" 
            ON "category_state_restrictions" ("categoryId")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_category_state_restrictions_categoryId"`);
        await queryRunner.query(`DROP TABLE "category_state_restrictions"`);
    }
} 