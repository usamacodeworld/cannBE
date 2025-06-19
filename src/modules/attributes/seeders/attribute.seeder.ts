import { DataSource } from 'typeorm';
import { BaseSeeder } from '../../../common/seeders/base.seeder';
import { Attribute } from '../entities/attribute.entity';
import { AttributeValue } from '../entities/attribute-value.entity';

export class AttributeSeeder extends BaseSeeder {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async run(): Promise<void> {
    await this.dataSource.query('TRUNCATE TABLE "attribute_values" CASCADE');
    await this.dataSource.query('TRUNCATE TABLE "attributes" CASCADE');
    console.log('Cleared existing attributes and attribute values');

    const attributeRepository = this.dataSource.getRepository(Attribute);
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
    await this.saveMany(attributeEntities, Attribute);
    console.log('Attributes seeded successfully');
  }
} 