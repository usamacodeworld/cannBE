import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUserSchema1752046899019 implements MigrationInterface {
    name = 'UpdateUserSchema1752046899019'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "userName" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "userName" SET NOT NULL`);
    }

}
