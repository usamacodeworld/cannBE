import { MigrationInterface, QueryRunner } from "typeorm";

export class FixAttributeUniqueConstraint1752000000004 implements MigrationInterface {
    name = 'FixAttributeUniqueConstraint1752000000004'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Drop the existing unique constraint on name column
        await queryRunner.query(`ALTER TABLE "attributes" DROP CONSTRAINT "UQ_89afb34fd1fdb2ceb1cea6c57df"`);
        
        // Add composite unique constraint on name and productId
        await queryRunner.query(`ALTER TABLE "attributes" ADD CONSTRAINT "UQ_attributes_name_productId" UNIQUE ("name", "productId")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop the composite unique constraint
        await queryRunner.query(`ALTER TABLE "attributes" DROP CONSTRAINT "UQ_attributes_name_productId"`);
        
        // Restore the original unique constraint on name column
        await queryRunner.query(`ALTER TABLE "attributes" ADD CONSTRAINT "UQ_89afb34fd1fdb2ceb1cea6c57df" UNIQUE ("name")`);
    }
} 