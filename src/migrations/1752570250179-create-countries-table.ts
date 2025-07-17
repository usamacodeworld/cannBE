import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCountriesTable1752570250179 implements MigrationInterface {
    name = 'CreateCountriesTable1752570250179'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "countries" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "countries" ADD "isActive" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "countries" DROP CONSTRAINT "PK_b2d7006793e8697ab3ae2deff18"`);
        await queryRunner.query(`ALTER TABLE "countries" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "countries" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "countries" ADD CONSTRAINT "PK_b2d7006793e8697ab3ae2deff18" PRIMARY KEY ("id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "countries" DROP CONSTRAINT "PK_b2d7006793e8697ab3ae2deff18"`);
        await queryRunner.query(`ALTER TABLE "countries" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "countries" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "countries" ADD CONSTRAINT "PK_b2d7006793e8697ab3ae2deff18" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "countries" DROP COLUMN "isActive"`);
        await queryRunner.query(`ALTER TABLE "countries" ADD "status" integer NOT NULL DEFAULT '1'`);
    }

}
