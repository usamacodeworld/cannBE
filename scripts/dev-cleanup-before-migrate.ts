// DEV-ONLY: Truncate problematic tables before running migrations
// WARNING: This will delete all data in the listed tables. DO NOT USE IN PRODUCTION.
import { AppDataSource } from '../src/config/database';

async function main() {
  const dataSource = AppDataSource;
  await dataSource.initialize();
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  try {
    // Truncate tables that often cause migration issues
    await queryRunner.query('TRUNCATE TABLE "media_connect", "media_files", "product_categories", "categories", "products" CASCADE');
    console.log('Truncated media_connect, media_files, product_categories, categories, products (CASCADE)');
  } finally {
    await queryRunner.release();
    await dataSource.destroy();
  }
}

main().catch((err) => {
  console.error('Error during dev cleanup:', err);
  process.exit(1);
}); 