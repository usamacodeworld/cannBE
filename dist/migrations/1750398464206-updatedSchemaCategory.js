"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatedSchemaCategory1750398464206 = void 0;
class UpdatedSchemaCategory1750398464206 {
    constructor() {
        this.name = 'UpdatedSchemaCategory1750398464206';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "categories" RENAME COLUMN "parent_id" TO "parentId"`);
        await queryRunner.query(`CREATE INDEX "IDX_9a6f051e66982b5f0318981bca" ON "categories" ("parentId") `);
        await queryRunner.query(`ALTER TABLE "categories" ADD CONSTRAINT "FK_9a6f051e66982b5f0318981bcaa" FOREIGN KEY ("parentId") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "categories" DROP CONSTRAINT "FK_9a6f051e66982b5f0318981bcaa"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9a6f051e66982b5f0318981bca"`);
        await queryRunner.query(`ALTER TABLE "categories" RENAME COLUMN "parentId" TO "parent_id"`);
    }
}
exports.UpdatedSchemaCategory1750398464206 = UpdatedSchemaCategory1750398464206;
