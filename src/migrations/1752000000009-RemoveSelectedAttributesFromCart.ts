import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveSelectedAttributesFromCart1752000000009 implements MigrationInterface {
    name = 'RemoveSelectedAttributesFromCart1752000000009'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "carts" DROP COLUMN "selectedAttributes"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "carts" ADD "selectedAttributes" character varying`);
    }
} 