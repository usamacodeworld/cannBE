import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatedSchema1751004198284 implements MigrationInterface {
    name = 'UpdatedSchema1751004198284'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "media_files" ALTER COLUMN "createdAt" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "media_files" ALTER COLUMN "updatedAt" SET DEFAULT now()`);
        await queryRunner.query(`COMMENT ON COLUMN "media_files"."uri" IS 'File path in S3 bucket for internal files. The URL should be composed on retrieval using a pre-signed URL.'`);
        await queryRunner.query(`COMMENT ON COLUMN "media_files"."url" IS 'File URL for public media files (products, blog posts)'`);
        await queryRunner.query(`ALTER TABLE "media_connect" DROP CONSTRAINT "PK_fd37fc5a35481eca704ed08d289"`);
        await queryRunner.query(`ALTER TABLE "media_connect" ADD CONSTRAINT "PK_7f5cf334c2e2238686ea2cd95f5" PRIMARY KEY ("mediaFileId", "entityType")`);
        await queryRunner.query(`ALTER TABLE "media_connect" DROP COLUMN "entityId"`);
        await queryRunner.query(`ALTER TABLE "media_connect" ADD "entityId" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "media_connect" DROP CONSTRAINT "PK_7f5cf334c2e2238686ea2cd95f5"`);
        await queryRunner.query(`ALTER TABLE "media_connect" ADD CONSTRAINT "PK_fd37fc5a35481eca704ed08d289" PRIMARY KEY ("mediaFileId", "entityType", "entityId")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "media_connect" DROP CONSTRAINT "PK_fd37fc5a35481eca704ed08d289"`);
        await queryRunner.query(`ALTER TABLE "media_connect" ADD CONSTRAINT "PK_7f5cf334c2e2238686ea2cd95f5" PRIMARY KEY ("mediaFileId", "entityType")`);
        await queryRunner.query(`ALTER TABLE "media_connect" DROP COLUMN "entityId"`);
        await queryRunner.query(`ALTER TABLE "media_connect" ADD "entityId" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "media_connect" DROP CONSTRAINT "PK_7f5cf334c2e2238686ea2cd95f5"`);
        await queryRunner.query(`ALTER TABLE "media_connect" ADD CONSTRAINT "PK_fd37fc5a35481eca704ed08d289" PRIMARY KEY ("entityId", "mediaFileId", "entityType")`);
        await queryRunner.query(`COMMENT ON COLUMN "media_files"."url" IS 'File URL for public media files'`);
        await queryRunner.query(`COMMENT ON COLUMN "media_files"."uri" IS 'File path in S3 bucket for internal files'`);
        await queryRunner.query(`ALTER TABLE "media_files" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "media_files" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP`);
    }

}
