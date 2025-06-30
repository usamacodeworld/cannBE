import { DataSource } from 'typeorm';
import { BaseSeeder } from '../../../common/seeders/base.seeder';
import { Attribute } from '../entities/attribute.entity';
import { AttributeValue } from '../entities/attribute-value.entity';

export class AttributeValueSeeder extends BaseSeeder {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async run(): Promise<void> {
    const attributeRepository = this.dataSource.getRepository(Attribute);
    const attributeValueRepository = this.dataSource.getRepository(AttributeValue);
    await attributeValueRepository.clear();
    console.log('Cleared existing attribute values');

    // Fetch the Size attribute
    const sizeAttribute = await attributeRepository.findOne({ where: { name: 'Size' } });
    
    if (!sizeAttribute) {
      console.log('Size attribute not found, skipping attribute value seeding');
      return;
    }

    const values = [
      {
        attribute: sizeAttribute,
        variant: 'Small Size',
        sku: 'SIZE-SM-001',
        price: 29.99,
        quantity: 100
      }
    ];

    const valueEntities = attributeValueRepository.create(values);
    await this.saveMany(valueEntities, AttributeValue);
    console.log('Attribute values seeded successfully');
  }
} 