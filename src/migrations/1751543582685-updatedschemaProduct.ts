import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatedschemaProduct1751543582685 implements MigrationInterface {
    name = 'UpdatedschemaProduct1751543582685'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products_photos_media_files" DROP CONSTRAINT "FK_products_photos_media_files_media_filesId"`);
        await queryRunner.query(`ALTER TABLE "products_photos_media_files" DROP CONSTRAINT "FK_products_photos_media_files_productsId"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_products_photos_media_files_media_filesId"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_products_photos_media_files_productsId"`);
        await queryRunner.query(`ALTER TABLE "products_photos_media_files" RENAME COLUMN "media_filesId" TO "mediaFilesId"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "photosIds"`);
        await queryRunner.query(`CREATE INDEX "IDX_4df1b7c7386e71711941ac06b4" ON "products_photos_media_files" ("productsId") `);
        await queryRunner.query(`CREATE INDEX "IDX_6a7082c3fa6b04083df2a0107b" ON "products_photos_media_files" ("mediaFilesId") `);
        await queryRunner.query(`ALTER TABLE "products_photos_media_files" ADD CONSTRAINT "FK_4df1b7c7386e71711941ac06b4a" FOREIGN KEY ("productsId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "products_photos_media_files" ADD CONSTRAINT "FK_6a7082c3fa6b04083df2a0107b8" FOREIGN KEY ("mediaFilesId") REFERENCES "media_files"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products_photos_media_files" DROP CONSTRAINT "FK_6a7082c3fa6b04083df2a0107b8"`);
        await queryRunner.query(`ALTER TABLE "products_photos_media_files" DROP CONSTRAINT "FK_4df1b7c7386e71711941ac06b4a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6a7082c3fa6b04083df2a0107b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4df1b7c7386e71711941ac06b4"`);
        await queryRunner.query(`ALTER TABLE "products" ADD "photosIds" text`);
        await queryRunner.query(`ALTER TABLE "products_photos_media_files" RENAME COLUMN "mediaFilesId" TO "media_filesId"`);
        await queryRunner.query(`CREATE INDEX "IDX_products_photos_media_files_productsId" ON "products_photos_media_files" ("productsId") `);
        await queryRunner.query(`CREATE INDEX "IDX_products_photos_media_files_media_filesId" ON "products_photos_media_files" ("media_filesId") `);
        await queryRunner.query(`ALTER TABLE "products_photos_media_files" ADD CONSTRAINT "FK_products_photos_media_files_productsId" FOREIGN KEY ("productsId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "products_photos_media_files" ADD CONSTRAINT "FK_products_photos_media_files_media_filesId" FOREIGN KEY ("media_filesId") REFERENCES "media_files"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

}
