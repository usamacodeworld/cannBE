import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatedSchemaCategories1751005722683 implements MigrationInterface {
    name = 'UpdatedSchemaCategories1751005722683'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "categories" ADD "thumbnailImageId" uuid`);
        await queryRunner.query(`ALTER TABLE "categories" ADD "coverImageId" uuid`);
        await queryRunner.query(`ALTER TABLE "categories" ADD CONSTRAINT "FK_69d45adbc59b8f44730cc411ca1" FOREIGN KEY ("thumbnailImageId") REFERENCES "media_files"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "categories" ADD CONSTRAINT "FK_2c1f40c7ab98d13a79214436d81" FOREIGN KEY ("coverImageId") REFERENCES "media_files"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "categories" DROP CONSTRAINT "FK_2c1f40c7ab98d13a79214436d81"`);
        await queryRunner.query(`ALTER TABLE "categories" DROP CONSTRAINT "FK_69d45adbc59b8f44730cc411ca1"`);
        await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "coverImageId"`);
        await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "thumbnailImageId"`);
    }

}
