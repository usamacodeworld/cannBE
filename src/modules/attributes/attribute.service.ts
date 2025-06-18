import { Repository } from 'typeorm';
import { Attribute } from './entities/attribute.entity';
import { AttributeValue } from './entities/attribute-value.entity';

export class AttributeService {
  private attributeRepository: Repository<Attribute>;
  private attributeValueRepository: Repository<AttributeValue>;

  constructor(attributeRepository: Repository<Attribute>, attributeValueRepository: Repository<AttributeValue>) {
    this.attributeRepository = attributeRepository;
    this.attributeValueRepository = attributeValueRepository;
  }

  async getAllAttributes(): Promise<Attribute[]> {
    return this.attributeRepository.find();
  }

  async getAttributeValues(attributeId: string): Promise<AttributeValue[]> {
    return this.attributeValueRepository.find({
      where: { attribute: { id: attributeId } },
      relations: ['attribute']
    });
  }

  async getAttributeById(id: string): Promise<Attribute | null> {
    return this.attributeRepository.findOne({ where: { id } });
  }

  async createAttribute(data: { name: string }): Promise<Attribute> {
    const attribute = this.attributeRepository.create(data);
    return this.attributeRepository.save(attribute);
  }

  async updateAttribute(id: string, data: { name?: string }): Promise<Attribute> {
    const attribute = await this.getAttributeById(id);
    if (!attribute) throw new Error('Attribute not found');
    Object.assign(attribute, data);
    return this.attributeRepository.save(attribute);
  }

  async deleteAttribute(id: string): Promise<void> {
    const attribute = await this.getAttributeById(id);
    if (!attribute) throw new Error('Attribute not found');
    await this.attributeRepository.remove(attribute);
  }

  async getAttributeValueById(id: string): Promise<AttributeValue | null> {
    return this.attributeValueRepository.findOne({ where: { id }, relations: ['attribute'] });
  }

  async createAttributeValue(attributeId: string, data: { value: string; colorCode?: string }): Promise<AttributeValue> {
    const attribute = await this.getAttributeById(attributeId);
    if (!attribute) throw new Error('Attribute not found');
    const attributeValue = this.attributeValueRepository.create({ ...data, attribute });
    return this.attributeValueRepository.save(attributeValue);
  }

  async updateAttributeValue(id: string, data: { value?: string; colorCode?: string }): Promise<AttributeValue> {
    const attributeValue = await this.getAttributeValueById(id);
    if (!attributeValue) throw new Error('Attribute value not found');
    Object.assign(attributeValue, data);
    return this.attributeValueRepository.save(attributeValue);
  }

  async deleteAttributeValue(id: string): Promise<void> {
    const attributeValue = await this.getAttributeValueById(id);
    if (!attributeValue) throw new Error('Attribute value not found');
    await this.attributeValueRepository.remove(attributeValue);
  }
} 