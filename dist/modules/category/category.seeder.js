"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategorySeeder = void 0;
const base_seeder_1 = require("../../common/seeders/base.seeder");
const category_entity_1 = require("./category.entity");
class CategorySeeder extends base_seeder_1.BaseSeeder {
    constructor(dataSource) {
        super(dataSource);
    }
    slugify(text) {
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
    async run() {
        const categoryRepository = this.dataSource.getRepository(category_entity_1.Category);
        // Clear existing categories
        await categoryRepository.clear();
        console.log("Cleared existing categories");
        // Define categories
        const categories = [
            {
                name: "Flowers",
                description: "Premium quality cannabis flowers and buds",
                image: "path/to/flowers-image.jpg",
            },
            {
                name: "Capsules",
                description: "Precisely dosed cannabis capsules for consistent effects",
                image: "path/to/capsules-image.jpg",
            },
            {
                name: "Vapes",
                description: "High-quality vaporizer cartridges and devices",
                image: "path/to/vapes-image.jpg",
            },
            {
                name: "Distillate",
                description: "Pure cannabis distillate products",
                image: "path/to/distillate-image.jpg",
            },
            {
                name: "Edibles",
                description: "Delicious cannabis-infused edible products",
                image: "path/to/edibles-image.jpg",
            },
            {
                name: "Gummies",
                description: "Tasty cannabis-infused gummy treats",
                image: "path/to/gummies-image.jpg",
            },
            {
                name: "Pre-Rolls",
                description: "Professionally rolled cannabis products",
                image: "path/to/pre-rolls-image.jpg",
            },
            {
                name: "Moonrocks",
                description: "Premium moonrock cannabis products",
                image: "path/to/moonrocks-image.jpg",
            },
            {
                name: "Oil",
                description: "Cannabis oils for various applications",
                image: "path/to/oil-image.jpg",
            },
            {
                name: "Pet Supplies",
                description: "Cannabis-based products for pets",
                image: "path/to/pet-supplies-image.jpg",
            },
            {
                name: "Topicals",
                description: "Cannabis-infused topical creams and lotions",
                image: "path/to/topicals-image.jpg",
            },
        ];
        // Create category records
        const categoryEntities = categories.map((category) => {
            return categoryRepository.create({
                isParent: false,
                name: category.name,
                slug: this.slugify(category.name),
                description: category.description,
                image: category.image,
                isActive: true,
                isDeleted: false,
                isFeatured: true,
                isPopular: true,
            });
        });
        await this.saveMany(categoryEntities, category_entity_1.Category);
        console.log("Categories seeded successfully");
    }
}
exports.CategorySeeder = CategorySeeder;
