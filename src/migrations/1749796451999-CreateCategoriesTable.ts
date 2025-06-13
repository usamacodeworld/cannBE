import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCategoriesTable1749796451999 implements MigrationInterface {
    name = 'CreateCategoriesTable1749796451999'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "categories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, "slug" character varying NOT NULL, "description" character varying, "image" character varying, "isActive" boolean DEFAULT false, "isDeleted" boolean DEFAULT false, "isFeatured" boolean DEFAULT false, "isPopular" boolean DEFAULT false, CONSTRAINT "UQ_420d9f679d41281f282f5bc7d09" UNIQUE ("slug"), CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "categories"`);
    }

}
