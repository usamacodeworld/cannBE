import { MigrationInterface, QueryRunner } from "typeorm";

export class FixEnum1752743713928 implements MigrationInterface {
    name = 'FixEnum1752743713928'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_status_history" ALTER COLUMN "status" SET DEFAULT 'pending'`);
        await queryRunner.query(`ALTER TABLE "order_status_history" ALTER COLUMN "previousStatus" SET DEFAULT 'pending'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_status_history" ALTER COLUMN "previousStatus" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "order_status_history" ALTER COLUMN "status" DROP DEFAULT`);
    }

}
