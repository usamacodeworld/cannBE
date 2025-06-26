import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserIdToMediaFiles1751000000003 implements MigrationInterface {
    name = 'AddUserIdToMediaFiles1751000000003'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "media_files" ADD "userId" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "media_files" DROP COLUMN "userId"`);
    }
} 