import { MigrationInterface, QueryRunner } from "typeorm";

export class AddVariantsToCart1752000000008 implements MigrationInterface {
    name = 'AddVariantsToCart1752000000008'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "carts" ADD "variants" json`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "carts" DROP COLUMN "variants"`);
    }
} 