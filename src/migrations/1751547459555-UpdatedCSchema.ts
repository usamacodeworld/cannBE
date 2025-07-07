import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatedCSchema1751547459555 implements MigrationInterface {
    name = 'UpdatedCSchema1751547459555'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "products_photos_media_files" ("productsId" uuid NOT NULL, "mediaFilesId" uuid NOT NULL, CONSTRAINT "PK_7d52b028c70c525fa8d0a61fe69" PRIMARY KEY ("productsId", "mediaFilesId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_4df1b7c7386e71711941ac06b4" ON "products_photos_media_files" ("productsId") `);
        await queryRunner.query(`CREATE INDEX "IDX_6a7082c3fa6b04083df2a0107b" ON "products_photos_media_files" ("mediaFilesId") `);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "photosIds"`);
        await queryRunner.query(`ALTER TABLE "products_photos_media_files" ADD CONSTRAINT "FK_4df1b7c7386e71711941ac06b4a" FOREIGN KEY ("productsId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "products_photos_media_files" ADD CONSTRAINT "FK_6a7082c3fa6b04083df2a0107b8" FOREIGN KEY ("mediaFilesId") REFERENCES "media_files"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products_photos_media_files" DROP CONSTRAINT "FK_6a7082c3fa6b04083df2a0107b8"`);
        await queryRunner.query(`ALTER TABLE "products_photos_media_files" DROP CONSTRAINT "FK_4df1b7c7386e71711941ac06b4a"`);
        await queryRunner.query(`ALTER TABLE "products" ADD "photosIds" text`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6a7082c3fa6b04083df2a0107b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4df1b7c7386e71711941ac06b4"`);
        await queryRunner.query(`DROP TABLE "products_photos_media_files"`);
    }

}
