import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCategoryIdsToProducts1752000000005 implements MigrationInterface {
    name = 'AddCategoryIdsToProducts1752000000005'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" ADD "categoryIds" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "categoryIds"`);
    }
} 