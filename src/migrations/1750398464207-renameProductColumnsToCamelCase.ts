import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameProductColumnsToCamelCase1750398464207 implements MigrationInterface {
    name = 'RenameProductColumnsToCamelCase1750398464207'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Rename all product columns from snake_case to camelCase
        await queryRunner.query(`
            ALTER TABLE "products" 
            RENAME COLUMN "added_by" TO "addedBy"
        `);
        
        await queryRunner.query(`
            ALTER TABLE "products" 
            RENAME COLUMN "user_id" TO "userId"
        `);
        
        await queryRunner.query(`
            ALTER TABLE "products" 
            RENAME COLUMN "category_id" TO "categoryId"
        `);
        
        await queryRunner.query(`
            ALTER TABLE "products" 
            RENAME COLUMN "thumbnail_img" TO "thumbnailImg"
        `);
        
        await queryRunner.query(`
            ALTER TABLE "products" 
            RENAME COLUMN "short_description" TO "shortDescription"
        `);
        
        await queryRunner.query(`
            ALTER TABLE "products" 
            RENAME COLUMN "long_description" TO "longDescription"
        `);
        
        await queryRunner.query(`
            ALTER TABLE "products" 
            RENAME COLUMN "regular_price" TO "regularPrice"
        `);
        
        await queryRunner.query(`
            ALTER TABLE "products" 
            RENAME COLUMN "sale_price" TO "salePrice"
        `);
        
        await queryRunner.query(`
            ALTER TABLE "products" 
            RENAME COLUMN "is_variant" TO "isVariant"
        `);
        
        await queryRunner.query(`
            ALTER TABLE "products" 
            RENAME COLUMN "cash_on_delivery" TO "cashOnDelivery"
        `);
        
        await queryRunner.query(`
            ALTER TABLE "products" 
            RENAME COLUMN "discount_type" TO "discountType"
        `);
        
        await queryRunner.query(`
            ALTER TABLE "products" 
            RENAME COLUMN "discount_start_date" TO "discountStartDate"
        `);
        
        await queryRunner.query(`
            ALTER TABLE "products" 
            RENAME COLUMN "discount_end_date" TO "discountEndDate"
        `);
        
        await queryRunner.query(`
            ALTER TABLE "products" 
            RENAME COLUMN "tax_type" TO "taxType"
        `);
        
        await queryRunner.query(`
            ALTER TABLE "products" 
            RENAME COLUMN "shipping_type" TO "shippingType"
        `);
        
        await queryRunner.query(`
            ALTER TABLE "products" 
            RENAME COLUMN "shipping_cose" TO "shippingCost"
        `);
        
        await queryRunner.query(`
            ALTER TABLE "products" 
            RENAME COLUMN "est_shipping_days" TO "estShippingDays"
        `);
        
        await queryRunner.query(`
            ALTER TABLE "products" 
            RENAME COLUMN "num_of_sales" TO "numOfSales"
        `);
        
        await queryRunner.query(`
            ALTER TABLE "products" 
            RENAME COLUMN "meta_title" TO "metaTitle"
        `);
        
        await queryRunner.query(`
            ALTER TABLE "products" 
            RENAME COLUMN "meta_description" TO "metaDescription"
        `);
        
        await queryRunner.query(`
            ALTER TABLE "products" 
            RENAME COLUMN "external_link" TO "externalLink"
        `);
        
        await queryRunner.query(`
            ALTER TABLE "products" 
            RENAME COLUMN "external_link_btn" TO "externalLinkBtn"
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert all column names back to snake_case
        await queryRunner.query(`
            ALTER TABLE "products" 
            RENAME COLUMN "addedBy" TO "added_by"
        `);
        
        await queryRunner.query(`
            ALTER TABLE "products" 
            RENAME COLUMN "userId" TO "user_id"
        `);
        
        await queryRunner.query(`
            ALTER TABLE "products" 
            RENAME COLUMN "categoryId" TO "category_id"
        `);
        
        await queryRunner.query(`
            ALTER TABLE "products" 
            RENAME COLUMN "thumbnailImg" TO "thumbnail_img"
        `);
        
        await queryRunner.query(`
            ALTER TABLE "products" 
            RENAME COLUMN "shortDescription" TO "short_description"
        `);
        
        await queryRunner.query(`
            ALTER TABLE "products" 
            RENAME COLUMN "longDescription" TO "long_description"
        `);
        
        await queryRunner.query(`
            ALTER TABLE "products" 
            RENAME COLUMN "regularPrice" TO "regular_price"
        `);
        
        await queryRunner.query(`
            ALTER TABLE "products" 
            RENAME COLUMN "salePrice" TO "sale_price"
        `);
        
        await queryRunner.query(`
            ALTER TABLE "products" 
            RENAME COLUMN "isVariant" TO "is_variant"
        `);
        
        await queryRunner.query(`
            ALTER TABLE "products" 
            RENAME COLUMN "cashOnDelivery" TO "cash_on_delivery"
        `);
        
        await queryRunner.query(`
            ALTER TABLE "products" 
            RENAME COLUMN "discountType" TO "discount_type"
        `);
        
        await queryRunner.query(`
            ALTER TABLE "products" 
            RENAME COLUMN "discountStartDate" TO "discount_start_date"
        `);
        
        await queryRunner.query(`
            ALTER TABLE "products" 
            RENAME COLUMN "discountEndDate" TO "discount_end_date"
        `);
        
        await queryRunner.query(`
            ALTER TABLE "products" 
            RENAME COLUMN "taxType" TO "tax_type"
        `);
        
        await queryRunner.query(`
            ALTER TABLE "products" 
            RENAME COLUMN "shippingType" TO "shipping_type"
        `);
        
        await queryRunner.query(`
            ALTER TABLE "products" 
            RENAME COLUMN "shippingCost" TO "shipping_cose"
        `);
        
        await queryRunner.query(`
            ALTER TABLE "products" 
            RENAME COLUMN "estShippingDays" TO "est_shipping_days"
        `);
        
        await queryRunner.query(`
            ALTER TABLE "products" 
            RENAME COLUMN "numOfSales" TO "num_of_sales"
        `);
        
        await queryRunner.query(`
            ALTER TABLE "products" 
            RENAME COLUMN "metaTitle" TO "meta_title"
        `);
        
        await queryRunner.query(`
            ALTER TABLE "products" 
            RENAME COLUMN "metaDescription" TO "meta_description"
        `);
        
        await queryRunner.query(`
            ALTER TABLE "products" 
            RENAME COLUMN "externalLink" TO "external_link"
        `);
        
        await queryRunner.query(`
            ALTER TABLE "products" 
            RENAME COLUMN "externalLinkBtn" TO "external_link_btn"
        `);
    }
} 