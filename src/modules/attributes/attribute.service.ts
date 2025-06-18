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
} 