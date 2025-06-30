import { DataSource } from 'typeorm';
import { BaseSeeder } from '../../../common/seeders/base.seeder';
import { Attribute } from '../entities/attribute.entity';

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
      { 
        name: 'Size'
      }
    ];

    const attributeEntities = attributeRepository.create(attributes);
    await this.saveMany(attributeEntities, Attribute);
    console.log('Attributes seeded successfully');
  }
} 