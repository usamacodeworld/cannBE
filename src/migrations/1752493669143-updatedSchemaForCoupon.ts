import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatedSchemaForCoupon1752493669143 implements MigrationInterface {
    name = 'UpdatedSchemaForCoupon1752493669143'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_category_state_restrictions_categoryId"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_16ee15e8be5bdf693084ada0d6" ON "category_state_restrictions" ("categoryId") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_16ee15e8be5bdf693084ada0d6"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_category_state_restrictions_categoryId" ON "category_state_restrictions" ("categoryId") `);
    }

}
