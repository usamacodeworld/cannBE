import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPhotosRelationToProducts1752000000006 implements MigrationInterface {
    name = 'AddPhotosRelationToProducts1752000000006'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "products_photos_media_files" ("productsId" uuid NOT NULL, "media_filesId" uuid NOT NULL, CONSTRAINT "PK_products_photos_media_files" PRIMARY KEY ("productsId", "media_filesId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_products_photos_media_files_productsId" ON "products_photos_media_files" ("productsId") `);
        await queryRunner.query(`CREATE INDEX "IDX_products_photos_media_files_media_filesId" ON "products_photos_media_files" ("media_filesId") `);
        await queryRunner.query(`ALTER TABLE "products_photos_media_files" ADD CONSTRAINT "FK_products_photos_media_files_productsId" FOREIGN KEY ("productsId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "products_photos_media_files" ADD CONSTRAINT "FK_products_photos_media_files_media_filesId" FOREIGN KEY ("media_filesId") REFERENCES "media_files"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products_photos_media_files" DROP CONSTRAINT "FK_products_photos_media_files_media_filesId"`);
        await queryRunner.query(`ALTER TABLE "products_photos_media_files" DROP CONSTRAINT "FK_products_photos_media_files_productsId"`);
        await queryRunner.query(`DROP INDEX "IDX_products_photos_media_files_media_filesId"`);
        await queryRunner.query(`DROP INDEX "IDX_products_photos_media_files_productsId"`);
        await queryRunner.query(`DROP TABLE "products_photos_media_files"`);
    }
} 