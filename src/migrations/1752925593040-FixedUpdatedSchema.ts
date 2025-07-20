import { MigrationInterface, QueryRunner } from "typeorm";

export class FixedUpdatedSchema1752925593040 implements MigrationInterface {
    name = 'FixedUpdatedSchema1752925593040'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "category_state_restrictions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "categoryId" uuid NOT NULL, "states" json NOT NULL, "isRestricted" boolean NOT NULL DEFAULT true, "reason" text, "customMessage" text, "isActive" boolean NOT NULL DEFAULT true, "createdBy" uuid, "notes" text, CONSTRAINT "PK_8c86e9d7cb68203723064429089" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_16ee15e8be5bdf693084ada0d6" ON "category_state_restrictions" ("categoryId") `);
        await queryRunner.query(`ALTER TABLE "countries" DROP COLUMN "phoneCode"`);
        await queryRunner.query(`ALTER TABLE "countries" DROP COLUMN "currency"`);
        await queryRunner.query(`ALTER TABLE "countries" DROP COLUMN "currencySymbol"`);
        await queryRunner.query(`ALTER TABLE "countries" DROP COLUMN "flagUrl"`);
        await queryRunner.query(`ALTER TABLE "countries" DROP CONSTRAINT "UQ_countries_code"`);
        await queryRunner.query(`ALTER TABLE "countries" DROP COLUMN "code"`);
        await queryRunner.query(`ALTER TABLE "countries" ADD "code" character varying(2) NOT NULL DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "countries" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "countries" ADD "name" character varying(100) NOT NULL DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "countries" ALTER COLUMN "isActive" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "countries" ALTER COLUMN "updated_at" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "order_status_history" ALTER COLUMN "status" SET DEFAULT 'pending'`);
        await queryRunner.query(`ALTER TABLE "order_status_history" ALTER COLUMN "previousStatus" SET DEFAULT 'pending'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_status_history" ALTER COLUMN "previousStatus" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "order_status_history" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "countries" ALTER COLUMN "updated_at" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "countries" ALTER COLUMN "isActive" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "countries" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "countries" ADD "name" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "countries" DROP COLUMN "code"`);
        await queryRunner.query(`ALTER TABLE "countries" ADD "code" character varying(10) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "countries" ADD CONSTRAINT "UQ_countries_code" UNIQUE ("code")`);
        await queryRunner.query(`ALTER TABLE "countries" ADD "flagUrl" character varying`);
        await queryRunner.query(`ALTER TABLE "countries" ADD "currencySymbol" character varying(5)`);
        await queryRunner.query(`ALTER TABLE "countries" ADD "currency" character varying(10)`);
        await queryRunner.query(`ALTER TABLE "countries" ADD "phoneCode" character varying(10)`);
        await queryRunner.query(`DROP INDEX "public"."IDX_16ee15e8be5bdf693084ada0d6"`);
        await queryRunner.query(`DROP TABLE "category_state_restrictions"`);
    }

}
