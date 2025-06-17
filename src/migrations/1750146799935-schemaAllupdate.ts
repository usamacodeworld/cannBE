import { MigrationInterface, QueryRunner } from "typeorm";

export class SchemaAllupdate1750146799935 implements MigrationInterface {
    name = 'SchemaAllupdate1750146799935'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "role_permissions" ("roleId" uuid NOT NULL, "permissionName" character varying NOT NULL, CONSTRAINT "PK_ac47b71a830e90c75f41040ba1a" PRIMARY KEY ("roleId", "permissionName"))`);
        await queryRunner.query(`CREATE INDEX "IDX_b4599f8b8f548d35850afa2d12" ON "role_permissions" ("roleId") `);
        await queryRunner.query(`CREATE INDEX "IDX_b4f3a5b54478bd9a66cb6ad8e4" ON "role_permissions" ("permissionName") `);
        await queryRunner.query(`ALTER TABLE "permissions" DROP CONSTRAINT "PK_dc1a879c3789b77db216399198d"`);
        await queryRunner.query(`ALTER TABLE "permissions" ADD CONSTRAINT "PK_920331560282b8bd21bb02290df" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_b4599f8b8f548d35850afa2d12c" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_b4f3a5b54478bd9a66cb6ad8e4a" FOREIGN KEY ("permissionName") REFERENCES "permissions"("name") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_roles" ADD CONSTRAINT "FK_86033897c009fcca8b6505d6be2" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_roles" DROP CONSTRAINT "FK_86033897c009fcca8b6505d6be2"`);
        await queryRunner.query(`ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_b4f3a5b54478bd9a66cb6ad8e4a"`);
        await queryRunner.query(`ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_b4599f8b8f548d35850afa2d12c"`);
        await queryRunner.query(`ALTER TABLE "permissions" DROP CONSTRAINT "PK_920331560282b8bd21bb02290df"`);
        await queryRunner.query(`ALTER TABLE "permissions" ADD CONSTRAINT "PK_dc1a879c3789b77db216399198d" PRIMARY KEY ("id", "name")`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b4f3a5b54478bd9a66cb6ad8e4"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b4599f8b8f548d35850afa2d12"`);
        await queryRunner.query(`DROP TABLE "role_permissions"`);
    }

}
