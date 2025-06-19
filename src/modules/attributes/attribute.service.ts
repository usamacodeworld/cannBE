import { Repository, Like } from 'typeorm';
import { Attribute } from './entities/attribute.entity';
import { AttributeValue } from './entities/attribute-value.entity';
import { GetAttributesQueryDto } from './dto/get-attributes-query.dto';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';

export class AttributeService {
  private attributeRepository: Repository<Attribute>;
  private attributeValueRepository: Repository<AttributeValue>;

  constructor(attributeRepository: Repository<Attribute>, attributeValueRepository: Repository<AttributeValue>) {
    this.attributeRepository = attributeRepository;
    this.attributeValueRepository = attributeValueRepository;
  }

  async getAllAttributes(query: GetAttributesQueryDto = {}): Promise<PaginatedResponseDto<Attribute>> {
    const { page = 1, limit = 10, search } = query;
    const skip = (page - 1) * limit;

    // Build where conditions
    const whereConditions: any = {};
    if (search) {
      whereConditions.name = Like(`%${search}%`);
    }

    // Get total count
    const [attributes, total] = await this.attributeRepository.findAndCount({
      where: whereConditions,
      skip,
      take: limit,
      order: {
        createdAt: 'DESC'
      }
    });

    return {
      data: attributes,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getAttributeValues(attributeId: string, query: GetAttributesQueryDto = {}): Promise<PaginatedResponseDto<AttributeValue>> {
    const { page = 1, limit = 10, search } = query;
    const skip = (page - 1) * limit;

    // Build where conditions
    const whereConditions: any = { attribute: { id: attributeId } };
    if (search) {
      whereConditions.value = Like(`%${search}%`);
    }

    // Get total count
    const [values, total] = await this.attributeValueRepository.findAndCount({
      where: whereConditions,
      relations: ['attribute'],
      skip,
      take: limit,
      order: {
        createdAt: 'DESC'
      }
    });

    return {
      data: values,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
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