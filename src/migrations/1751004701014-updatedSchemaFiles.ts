import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatedSchemaFiles1751004701014 implements MigrationInterface {
    name = 'UpdatedSchemaFiles1751004701014'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`COMMENT ON COLUMN "media_files"."scope" IS 'Resource scope e.g. admin, seller, buyer'`);
        await queryRunner.query(`ALTER TABLE "media_files" ALTER COLUMN "scope" SET DEFAULT 'admin'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "media_files" ALTER COLUMN "scope" SET DEFAULT 'marketplace'`);
        await queryRunner.query(`COMMENT ON COLUMN "media_files"."scope" IS 'Resource scope e.g. marketplace, seller, buyer'`);
    }

}
