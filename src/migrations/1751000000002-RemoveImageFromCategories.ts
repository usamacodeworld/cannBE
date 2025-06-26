import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveImageFromCategories1751000000002 implements MigrationInterface {
    name = 'RemoveImageFromCategories1751000000002'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "image"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "categories" ADD "image" character varying`);
    }
} 