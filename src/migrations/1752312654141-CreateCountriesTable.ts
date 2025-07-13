import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCountriesTable1752312654141 implements MigrationInterface {
    name = 'CreateCountriesTable1752312654141'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "countries" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "name" character varying NOT NULL,
            "code" character varying(10) NOT NULL,
            "phoneCode" character varying(10),
            "currency" character varying(10),
            "currencySymbol" character varying(5),
            "flagUrl" character varying,
            "isActive" boolean DEFAULT true,
            "created_at" TIMESTAMP NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
            "deleted_at" TIMESTAMP,
            CONSTRAINT "PK_countries_id" PRIMARY KEY ("id"),
            CONSTRAINT "UQ_countries_code" UNIQUE ("code")
        )`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "countries"`);
    }
} 