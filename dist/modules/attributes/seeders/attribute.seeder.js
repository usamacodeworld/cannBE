"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttributeSeeder = void 0;
const base_seeder_1 = require("../../../common/seeders/base.seeder");
const attribute_entity_1 = require("../entities/attribute.entity");
class AttributeSeeder extends base_seeder_1.BaseSeeder {
    constructor(dataSource) {
        super(dataSource);
    }
    async run() {
        await this.dataSource.query('TRUNCATE TABLE "attribute_values" CASCADE');
        await this.dataSource.query('TRUNCATE TABLE "attributes" CASCADE');
        console.log('Cleared existing attributes and attribute values');
        const attributeRepository = this.dataSource.getRepository(attribute_entity_1.Attribute);
        const attributes = [
            { name: 'Size' },
            { name: 'Fabric' },
            { name: 'Color' },
            { name: 'Seater' },
            { name: 'Shoe size' },
            { name: 'Flavours' },
            { name: 'Material' },
            { name: 'Undergarments size' },
            { name: 'Shades' },
            { name: 'Quantity' },
            { name: 'Packaging' },
            { name: 'shapes' },
            { name: 'Food Item' },
        ];
        const attributeEntities = attributeRepository.create(attributes);
        await this.saveMany(attributeEntities, attribute_entity_1.Attribute);
        console.log('Attributes seeded successfully');
    }
}
exports.AttributeSeeder = AttributeSeeder;
