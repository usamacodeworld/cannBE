import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveMaxShippingCostAndPriority1752394700435 implements MigrationInterface {
    name = 'RemoveMaxShippingCostAndPriority1752394700435'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "shipping_rates" DROP COLUMN "priority"`);
        await queryRunner.query(`ALTER TABLE "shipping_rates" DROP COLUMN "maxShippingCost"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "shipping_rates" ADD "maxShippingCost" numeric(10,2)`);
        await queryRunner.query(`ALTER TABLE "shipping_rates" ADD "priority" integer NOT NULL DEFAULT '0'`);
    }

}
