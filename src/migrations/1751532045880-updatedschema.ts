import { MigrationInterface, QueryRunner } from "typeorm";

export class Updatedschema1751532045880 implements MigrationInterface {
    name = 'Updatedschema1751532045880'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "categoryIds"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" ADD "categoryIds" text`);
    }

}
