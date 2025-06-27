import { DataSource } from "typeorm";
import { BaseSeeder } from "../../common/seeders/base.seeder";
import { Category } from "./category.entity";

export class CategorySeeder extends BaseSeeder {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  private slugify(text: string): string {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-") // Replace spaces with -
      .replace(/[^\w\-]+/g, "") // Remove all non-word chars
      .replace(/\-\-+/g, "-") // Replace multiple - with single -
      .replace(/^-+/, "") // Trim - from start of text
      .replace(/-+$/, ""); // Trim - from end of text
  }

  async run(): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      // Truncate join table and categories with CASCADE
      await queryRunner.query('TRUNCATE TABLE "categories", "categories" CASCADE');
      console.log("Truncated categories and categories with CASCADE");
    } finally {
      await queryRunner.release();
    }

    const categoryRepository = this.dataSource.getRepository(Category);

    // Define single dummy category
    const dummyCategory = {
      name: "Dummy Category",
      description: "This is a dummy category for testing purposes",
    };

    // Create category record
    const categoryEntity = categoryRepository.create({
      isParent: false,
      name: dummyCategory.name,
      slug: this.slugify(dummyCategory.name),
      description: dummyCategory.description,
      isActive: true,
      isFeatured: true,
      isPopular: true,
    });

    await this.saveMany([categoryEntity], Category);
    console.log("Dummy category seeded successfully");
  }
}
