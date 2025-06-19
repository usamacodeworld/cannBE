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

    const attributes = await attributeRepository.find();
    const attributeMap = new Map(attributes.map(attr => [attr.name, attr]));

    const getAttr = (name: string) => attributeMap.get(name);

    const values = [
      // Fabric
      { attribute: getAttr('Fabric'), value: 'Linen' },
      { attribute: getAttr('Fabric'), value: 'Cotton' },
      { attribute: getAttr('Fabric'), value: 'Khaddar' },
      { attribute: getAttr('Fabric'), value: 'Chiffon' },
      { attribute: getAttr('Fabric'), value: 'Velvet' },
      { attribute: getAttr('Fabric'), value: 'Lawn' },
      { attribute: getAttr('Fabric'), value: 'Cambric' },
      { attribute: getAttr('Fabric'), value: 'Net' },
      { attribute: getAttr('Fabric'), value: 'Silk' },
      { attribute: getAttr('Fabric'), value: 'Organza' },
      { attribute: getAttr('Fabric'), value: 'Milai' },
      { attribute: getAttr('Fabric'), value: 'Cotton Satin' },
      { attribute: getAttr('Fabric'), value: 'Jersey' },
      { attribute: getAttr('Fabric'), value: 'Boski' },
      { attribute: getAttr('Fabric'), value: 'Parachute' },
      { attribute: getAttr('Fabric'), value: 'Leather' },
      { attribute: getAttr('Fabric'), value: 'Dhanak' },
      { attribute: getAttr('Fabric'), value: 'Kasturi' },
      { attribute: getAttr('Fabric'), value: 'Vip Lawn' },
      { attribute: getAttr('Fabric'), value: 'Wash n wear' },
      // Color
      { attribute: getAttr('Color'), value: 'Orange' },
      { attribute: getAttr('Color'), value: 'Red' },
      { attribute: getAttr('Color'), value: 'Green blue' },
      { attribute: getAttr('Color'), value: 'Green' },
      { attribute: getAttr('Color'), value: 'Skin' },
      { attribute: getAttr('Color'), value: 'Black' },
      { attribute: getAttr('Color'), value: 'White' },
      { attribute: getAttr('Color'), value: 'Blue' },
      { attribute: getAttr('Color'), value: 'Off-white' },
      { attribute: getAttr('Color'), value: 'Purple' },
      { attribute: getAttr('Color'), value: 'Yellow' },
      { attribute: getAttr('Color'), value: 'Skyblue' },
      { attribute: getAttr('Color'), value: 'Light green' },
      { attribute: getAttr('Color'), value: 'Mustard' },
      { attribute: getAttr('Color'), value: 'Silver' },
      { attribute: getAttr('Color'), value: 'Golden' },
      { attribute: getAttr('Color'), value: 'Brown' },
      { attribute: getAttr('Color'), value: 'Gray' },
      { attribute: getAttr('Color'), value: 'Maroon' },
      { attribute: getAttr('Color'), value: 'Light blue' },
      { attribute: getAttr('Color'), value: 'Tasty Nude' },
      { attribute: getAttr('Color'), value: 'Soft Pink' },
      { attribute: getAttr('Color'), value: 'Cherry Burgundy' },
      { attribute: getAttr('Color'), value: 'Vivid Rasberry' },
      // Size
      { attribute: getAttr('Size'), value: 'Small' },
      { attribute: getAttr('Size'), value: 'Medium' },
      { attribute: getAttr('Size'), value: 'Large' },
      { attribute: getAttr('Size'), value: 'Extra large' },
      // Seater
      { attribute: getAttr('Seater'), value: '5' },
      { attribute: getAttr('Seater'), value: '6' },
      { attribute: getAttr('Seater'), value: '7' },
      // Shoe size
      { attribute: getAttr('Shoe size'), value: '36' },
      { attribute: getAttr('Shoe size'), value: '37' },
      { attribute: getAttr('Shoe size'), value: '38' },
      { attribute: getAttr('Shoe size'), value: '39' },
      { attribute: getAttr('Shoe size'), value: '40' },
      { attribute: getAttr('Shoe size'), value: '41' },
      { attribute: getAttr('Shoe size'), value: '42' },
      // Flavours
      { attribute: getAttr('Flavours'), value: 'Strawberry' },
      { attribute: getAttr('Flavours'), value: 'Lemon' },
      { attribute: getAttr('Flavours'), value: 'Rose' },
      { attribute: getAttr('Flavours'), value: 'Peach' },
      { attribute: getAttr('Flavours'), value: 'Mint' },
      { attribute: getAttr('Flavours'), value: 'Rasberry' },
      { attribute: getAttr('Flavours'), value: 'Orange' },
      { attribute: getAttr('Flavours'), value: 'Pink Rose' },
      { attribute: getAttr('Flavours'), value: 'Lavender' },
      { attribute: getAttr('Flavours'), value: 'Jasmine' },
      { attribute: getAttr('Flavours'), value: 'Flora' },
      { attribute: getAttr('Flavours'), value: 'Oud' },
      { attribute: getAttr('Flavours'), value: 'Bakhoor' },
      { attribute: getAttr('Flavours'), value: 'Cinnamon' },
      { attribute: getAttr('Flavours'), value: 'Vanilla' },
      { attribute: getAttr('Flavours'), value: 'Coffee chocolate' },
      { attribute: getAttr('Flavours'), value: 'Succulent Mango' },
      { attribute: getAttr('Flavours'), value: 'Green Apple' },
      { attribute: getAttr('Flavours'), value: 'Strawberry Bubblegum' },
      { attribute: getAttr('Flavours'), value: 'Cozy Orange' },
      { attribute: getAttr('Flavours'), value: 'Peachy Punch' },
      { attribute: getAttr('Flavours'), value: 'Fruity' },
      // Material
      { attribute: getAttr('Material'), value: 'Steel' },
      { attribute: getAttr('Material'), value: 'Iron' },
      { attribute: getAttr('Material'), value: 'Plastic' },
      // Undergarments size
      { attribute: getAttr('Undergarments size'), value: '32' },
      { attribute: getAttr('Undergarments size'), value: '34' },
      { attribute: getAttr('Undergarments size'), value: '38' },
      { attribute: getAttr('Undergarments size'), value: '40' },
      { attribute: getAttr('Undergarments size'), value: '42' },
      { attribute: getAttr('Undergarments size'), value: '46' },
      { attribute: getAttr('Undergarments size'), value: '50' },
      // Shades
      { attribute: getAttr('Shades'), value: 'Light Rose Cool' },
      { attribute: getAttr('Shades'), value: 'Light Sand Warm' },
      { attribute: getAttr('Shades'), value: 'Beige warm' },
      { attribute: getAttr('Shades'), value: 'Golden beige warm' },
      { attribute: getAttr('Shades'), value: 'Light beige neutral' },
      { attribute: getAttr('Shades'), value: 'Light Ivory Neutral' },
      { attribute: getAttr('Shades'), value: 'Sun Beige Warm' },
      // Quantity
      { attribute: getAttr('Quantity'), value: '500 grams' },
      { attribute: getAttr('Quantity'), value: '1 kg' },
      { attribute: getAttr('Quantity'), value: '500 ML' },
      { attribute: getAttr('Quantity'), value: '250 ML' },
      { attribute: getAttr('Quantity'), value: '120 ML' },
      { attribute: getAttr('Quantity'), value: 'Single' },
      { attribute: getAttr('Quantity'), value: 'Couple' },
      // Packaging
      { attribute: getAttr('Packaging'), value: 'Normal' },
      { attribute: getAttr('Packaging'), value: 'Zip lock bag' },
      // shapes
      { attribute: getAttr('shapes'), value: 'Round glass dried flower pandant' },
      { attribute: getAttr('shapes'), value: 'Tear drop tree pandant' },
      { attribute: getAttr('shapes'), value: 'Heart pandant' },
      { attribute: getAttr('shapes'), value: 'Tringle with red flowers pandant' },
      { attribute: getAttr('shapes'), value: 'Heart with real dried flower pandant' },
      { attribute: getAttr('shapes'), value: 'Dimond shap pandant' },
      { attribute: getAttr('shapes'), value: 'Tear drop with golden frame' },
      // Food Item
      { attribute: getAttr('Food Item'), value: 'Nutella brownie, Fudge brownie, Oreo brownie, Walnut brownie, Cakey brownie' },
      { attribute: getAttr('Food Item'), value: 'Cakey brownie' },
      { attribute: getAttr('Food Item'), value: 'Walnut brownie' },
      { attribute: getAttr('Food Item'), value: 'Oreo brownie' },
      { attribute: getAttr('Food Item'), value: 'Fudge brownie' },
      { attribute: getAttr('Food Item'), value: 'Nutella brownie' },
      // Add more as needed from the prompt
    ];

    const validValues = values.filter(v => v.attribute);
    const valueEntities = attributeValueRepository.create(validValues);
    await this.saveMany(valueEntities, AttributeValue);
    console.log('Attribute values seeded successfully');
  }
} 