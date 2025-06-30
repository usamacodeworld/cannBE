import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateProductImageFields1752000000001 implements MigrationInterface {
    name = 'UpdateProductImageFields1752000000001'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Rename photos to photosIds
        await queryRunner.query(`ALTER TABLE "products" RENAME COLUMN "photos" TO "photosIds"`);
        
        // Rename thumbnailImg to thumbnailImgId
        await queryRunner.query(`ALTER TABLE "products" RENAME COLUMN "thumbnailImg" TO "thumbnailImgId"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert photosIds back to photos
        await queryRunner.query(`ALTER TABLE "products" RENAME COLUMN "photosIds" TO "photos"`);
        
        // Revert thumbnailImgId back to thumbnailImg
        await queryRunner.query(`ALTER TABLE "products" RENAME COLUMN "thumbnailImgId" TO "thumbnailImg"`);
    }
} 