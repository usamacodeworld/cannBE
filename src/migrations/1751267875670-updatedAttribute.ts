import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatedAttribute1751267875670 implements MigrationInterface {
    name = 'UpdatedAttribute1751267875670'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "attribute_values" ADD "value" character varying`);
        await queryRunner.query(`ALTER TABLE "attribute_values" ADD "colorCode" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "attribute_values" DROP COLUMN "colorCode"`);
        await queryRunner.query(`ALTER TABLE "attribute_values" DROP COLUMN "value"`);
    }

}
