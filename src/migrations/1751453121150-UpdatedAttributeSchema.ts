import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatedAttributeSchema1751453121150 implements MigrationInterface {
    name = 'UpdatedAttributeSchema1751453121150'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "carts" DROP COLUMN "variants"`);
        await queryRunner.query(`ALTER TABLE "carts" ADD "variants" text`);
        await queryRunner.query(`ALTER TABLE "attributes" DROP CONSTRAINT "UQ_89afb34fd1fdb2ceb1cea6c57df"`);
        await queryRunner.query(`ALTER TABLE "attributes" ADD CONSTRAINT "UQ_da1145d1b3ffb26e0eacedee627" UNIQUE ("name", "productId")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "attributes" DROP CONSTRAINT "UQ_da1145d1b3ffb26e0eacedee627"`);
        await queryRunner.query(`ALTER TABLE "attributes" ADD CONSTRAINT "UQ_89afb34fd1fdb2ceb1cea6c57df" UNIQUE ("name")`);
        await queryRunner.query(`ALTER TABLE "carts" DROP COLUMN "variants"`);
        await queryRunner.query(`ALTER TABLE "carts" ADD "variants" json`);
    }

}
