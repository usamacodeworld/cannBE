"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategorySeeder = void 0;
const base_seeder_1 = require("../../../common/seeders/base.seeder");
const category_entity_1 = require("../entities/category.entity");
class CategorySeeder extends base_seeder_1.BaseSeeder {
    constructor(dataSource) {
        super(dataSource);
    }
    async run() {
        const categoryRepository = this.dataSource.getRepository(category_entity_1.Category);
        // Clear existing users
        await categoryRepository.clear();
        console.log("Cleared existing categories");
        // Create Category Record
        const categoryCreate = categoryRepository.create({
            isParent: false,
            parent_id: null,
            name: "Electronics",
            slug: "electronics",
            description: "All kinds of electronic items",
            image: "https://photo-cdn2.icons8.com/ZZBm2hrdBYVaAQmGu5azWSzGgIR7XkD6nzdaK45CQ70/rs:fit:1606:1072/wm:1:re:0:0:0.65/wmid:moose/q:98/czM6Ly9pY29uczgu/bW9vc2UtcHJvZC5h/c3NldHMvYXNzZXRz/L3NhdGEvb3JpZ2lu/YWwvMTE1LzY0MjFh/MTRlLWU5MWItNDUy/ZS1hMGNhLTAxY2Ji/MzFjMjMyNi5qcGc.jpg",
            isActive: true,
            isDeleted: false,
            isFeatured: true,
            isPopular: true
        });
        await this.saveMany([categoryCreate], category_entity_1.Category);
        console.log("Category seeded successfully");
    }
}
exports.CategorySeeder = CategorySeeder;
