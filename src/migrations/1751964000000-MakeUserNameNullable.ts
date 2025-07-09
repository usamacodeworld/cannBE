import { MigrationInterface, QueryRunner } from "typeorm";

export class MakeUserNameNullable1751964000000 implements MigrationInterface {
    name = 'MakeUserNameNullable1751964000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "userName" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "userName" SET NOT NULL`);
    }
} 