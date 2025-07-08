import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatedschemaWithAddressEmail1751963403052 implements MigrationInterface {
    name = 'UpdatedschemaWithAddressEmail1751963403052'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "addresses" ADD "email" character varying(255)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "addresses" DROP COLUMN "email"`);
    }

}
