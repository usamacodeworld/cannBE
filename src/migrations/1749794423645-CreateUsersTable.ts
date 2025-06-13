import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUsersTable1749794423645 implements MigrationInterface {
    name = 'CreateUsersTable1749794423645'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "accountType" character varying NOT NULL, "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "userName" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "phone" character varying, "emailVerified" boolean DEFAULT false, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")); COMMENT ON COLUMN "users"."phone" IS 'Phone number'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "users"`);
    }

}
