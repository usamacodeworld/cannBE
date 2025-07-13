import { MigrationInterface, QueryRunner } from "typeorm";

export class ProductUpdate1752312654139 implements MigrationInterface {
    name = 'ProductUpdate1752312654139'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_e40a1dd2909378f0da1f34f7bd6"`);
        await queryRunner.query(`ALTER TABLE "sellers" DROP CONSTRAINT "FK_4c1c59db4ac1ed90a1a7c0ff3df"`);
        await queryRunner.query(`ALTER TABLE "sellers" DROP COLUMN "businessDescription"`);
        await queryRunner.query(`ALTER TABLE "sellers" ADD "businessDescription" character varying`);
        // No need to rename enum types, just alter them directly
        await queryRunner.query(`CREATE TYPE "public"."_tmp_sellers_status_enum" AS ENUM('pending', 'approved', 'rejected', 'suspended', 'inactive')`);
        await queryRunner.query(`ALTER TABLE "sellers" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "sellers" ALTER COLUMN "status" TYPE "public"."_tmp_sellers_status_enum" USING "status"::text::"public"."_tmp_sellers_status_enum"`);
        await queryRunner.query(`ALTER TABLE "sellers" ALTER COLUMN "status" SET DEFAULT 'pending'`);
        await queryRunner.query(`DROP TYPE "public"."sellers_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."_tmp_sellers_status_enum" RENAME TO "sellers_status_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."_tmp_sellers_verificationstatus_enum" AS ENUM('unverified', 'pending', 'verified', 'rejected')`);
        await queryRunner.query(`ALTER TABLE "sellers" ALTER COLUMN "verificationStatus" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "sellers" ALTER COLUMN "verificationStatus" TYPE "public"."_tmp_sellers_verificationstatus_enum" USING "verificationStatus"::text::"public"."_tmp_sellers_verificationstatus_enum"`);
        await queryRunner.query(`ALTER TABLE "sellers" ALTER COLUMN "verificationStatus" SET DEFAULT 'unverified'`);
        await queryRunner.query(`DROP TYPE "public"."sellers_verificationstatus_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."_tmp_sellers_verificationstatus_enum" RENAME TO "sellers_verificationstatus_enum"`);
        await queryRunner.query(`ALTER TABLE "sellers" DROP COLUMN "verificationDocuments"`);
        await queryRunner.query(`ALTER TABLE "sellers" ADD "verificationDocuments" character varying`);
        await queryRunner.query(`ALTER TABLE "sellers" DROP COLUMN "totalRevenue"`);
        await queryRunner.query(`ALTER TABLE "sellers" ADD "totalRevenue" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "sellers" DROP COLUMN "rating"`);
        await queryRunner.query(`ALTER TABLE "sellers" ADD "rating" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "sellers" DROP COLUMN "commissionRate"`);
        await queryRunner.query(`ALTER TABLE "sellers" ADD "commissionRate" integer`);
        await queryRunner.query(`ALTER TABLE "sellers" DROP COLUMN "payoutDetails"`);
        await queryRunner.query(`ALTER TABLE "sellers" ADD "payoutDetails" character varying`);
        await queryRunner.query(`ALTER TABLE "sellers" DROP COLUMN "rejectionReason"`);
        await queryRunner.query(`ALTER TABLE "sellers" ADD "rejectionReason" character varying`);
        await queryRunner.query(`ALTER TABLE "sellers" DROP COLUMN "notes"`);
        await queryRunner.query(`ALTER TABLE "sellers" ADD "notes" character varying`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_e40a1dd2909378f0da1f34f7bd6" FOREIGN KEY ("sellerId") REFERENCES "sellers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sellers" ADD CONSTRAINT "FK_4c1c59db4ac1ed90a1a7c0ff3df" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sellers" DROP CONSTRAINT "FK_4c1c59db4ac1ed90a1a7c0ff3df"`);
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_e40a1dd2909378f0da1f34f7bd6"`);
        await queryRunner.query(`ALTER TABLE "sellers" DROP COLUMN "notes"`);
        await queryRunner.query(`ALTER TABLE "sellers" ADD "notes" text`);
        await queryRunner.query(`ALTER TABLE "sellers" DROP COLUMN "rejectionReason"`);
        await queryRunner.query(`ALTER TABLE "sellers" ADD "rejectionReason" text`);
        await queryRunner.query(`ALTER TABLE "sellers" DROP COLUMN "payoutDetails"`);
        await queryRunner.query(`ALTER TABLE "sellers" ADD "payoutDetails" text`);
        await queryRunner.query(`ALTER TABLE "sellers" DROP COLUMN "commissionRate"`);
        await queryRunner.query(`ALTER TABLE "sellers" ADD "commissionRate" numeric(5,2)`);
        await queryRunner.query(`ALTER TABLE "sellers" DROP COLUMN "rating"`);
        await queryRunner.query(`ALTER TABLE "sellers" ADD "rating" numeric(3,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "sellers" DROP COLUMN "totalRevenue"`);
        await queryRunner.query(`ALTER TABLE "sellers" ADD "totalRevenue" numeric(10,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "sellers" DROP COLUMN "verificationDocuments"`);
        await queryRunner.query(`ALTER TABLE "sellers" ADD "verificationDocuments" text`);
        // No need to rename enum types, just alter them directly
        await queryRunner.query(`CREATE TYPE "public"."_tmp_sellers_verificationstatus_enum" AS ENUM('unverified', 'pending', 'verified', 'rejected')`);
        await queryRunner.query(`ALTER TABLE "sellers" ALTER COLUMN "verificationStatus" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "sellers" ALTER COLUMN "verificationStatus" TYPE "public"."_tmp_sellers_verificationstatus_enum" USING "verificationStatus"::text::"public"."_tmp_sellers_verificationstatus_enum"`);
        await queryRunner.query(`ALTER TABLE "sellers" ALTER COLUMN "verificationStatus" SET DEFAULT 'unverified'`);
        await queryRunner.query(`DROP TYPE "public"."sellers_verificationstatus_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."_tmp_sellers_verificationstatus_enum" RENAME TO "sellers_verificationstatus_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."_tmp_sellers_status_enum" AS ENUM('pending', 'approved', 'rejected', 'suspended', 'inactive')`);
        await queryRunner.query(`ALTER TABLE "sellers" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "sellers" ALTER COLUMN "status" TYPE "public"."_tmp_sellers_status_enum" USING "status"::text::"public"."_tmp_sellers_status_enum"`);
        await queryRunner.query(`ALTER TABLE "sellers" ALTER COLUMN "status" SET DEFAULT 'pending'`);
        await queryRunner.query(`DROP TYPE "public"."sellers_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."_tmp_sellers_status_enum" RENAME TO "sellers_status_enum"`);
        await queryRunner.query(`ALTER TABLE "sellers" DROP COLUMN "businessDescription"`);
        await queryRunner.query(`ALTER TABLE "sellers" ADD "businessDescription" text`);
        await queryRunner.query(`ALTER TABLE "sellers" ADD CONSTRAINT "FK_4c1c59db4ac1ed90a1a7c0ff3df" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_e40a1dd2909378f0da1f34f7bd6" FOREIGN KEY ("sellerId") REFERENCES "sellers"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }
}
