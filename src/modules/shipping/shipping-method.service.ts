import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { ShippingMethod } from './shipping-method.entity';
import { CreateShippingMethodDto } from './dto/create-shipping-method.dto';
import { UpdateShippingMethodDto } from './dto/update-shipping-method.dto';
import { ShippingMethodResponseDto } from './dto/shipping-method-response.dto';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';

export class ShippingMethodService {
  private shippingMethodRepository: Repository<ShippingMethod>;

  constructor(shippingMethodRepository: Repository<ShippingMethod>) {
    this.shippingMethodRepository = shippingMethodRepository;
  }

  private transformToResponseDto(method: ShippingMethod): ShippingMethodResponseDto {
    return {
      id: method.id,
      name: method.name,
      slug: method.slug,
      description: method.description || '',
      methodType: method.methodType,
      carrierType: method.carrierType,
      zoneId: method.zoneId,
      zone: method.zone ? {
        id: method.zone.id,
        name: method.zone.name,
        slug: method.zone.slug,
      } : undefined,
      isActive: method.isActive,
      priority: method.priority,
      estimatedDays: method.estimatedDays,
      icon: method.icon,
      color: method.color,
      isDefault: method.isDefault,
      requiresSignature: method.requiresSignature,
      isInsured: method.isInsured,
      insuranceAmount: method.insuranceAmount,
      createdAt: method.createdAt,
      updatedAt: method.updatedAt,
      ratesCount: 0, // We're not loading rates in findAll for performance
    };
  }

  private slugify(text: string): string {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  }

  private async generateUniqueSlug(name: string): Promise<string> {
    let slug = this.slugify(name);
    let counter = 1;
    let uniqueSlug = slug;

    while (
      await this.shippingMethodRepository.findOne({ where: { slug: uniqueSlug } })
    ) {
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }

    return uniqueSlug;
  }

  async create(
    createMethodDto: CreateShippingMethodDto,
    userId?: string
  ): Promise<ShippingMethodResponseDto> {
    const slug = await this.generateUniqueSlug(
      createMethodDto.slug || createMethodDto.name
    );

    const method = this.shippingMethodRepository.create({
      ...createMethodDto,
      slug,
    });

    const savedMethod = await this.shippingMethodRepository.save(method);
    
    // Reload with relations
    const methodWithRelations = await this.shippingMethodRepository.findOne({
      where: { id: savedMethod.id },
      relations: ['zone', 'rates'],
    });

    return this.transformToResponseDto(methodWithRelations!);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    // zoneId?: string,
    methodType?: string,
    // isActive?: boolean
  ): Promise<PaginatedResponseDto<ShippingMethodResponseDto>> {
    const skip = (page - 1) * limit;

    // Build where conditions
    const baseConditions: FindOptionsWhere<any> = {};

    // if (zoneId) baseConditions.zoneId = zoneId;
    if (methodType) baseConditions.methodType = methodType;
    // if (isActive !== undefined) baseConditions.isActive = isActive;

    let where: FindOptionsWhere<any>[] | FindOptionsWhere<any> = baseConditions;

    if (search) {
      where = [
        { ...baseConditions, name: Like(`%${search}%`) },
        { ...baseConditions, slug: Like(`%${search}%`) },
        { ...baseConditions, description: Like(`%${search}%`) },
      ];
    }

    // Get total count
    const [methods, total] = await this.shippingMethodRepository.findAndCount({
      relations: ['zone'],
      where,
      skip,
      take: limit,
      order: {
        priority: 'asc',
        name: 'asc',
      },
    });
console.log('Methods ==> ', methods)
    // Transform methods to response DTO
    const methodDtos = methods.map((method) => this.transformToResponseDto(method));

    return {
      data: methodDtos,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<ShippingMethodResponseDto> {
    const method = await this.shippingMethodRepository.findOne({
      where: { id },
      relations: ['zone', 'rates'],
    });

    if (!method) {
      throw new Error('Shipping method not found');
    }

    return this.transformToResponseDto(method);
  }

  async findBySlug(slug: string): Promise<ShippingMethodResponseDto> {
    const method = await this.shippingMethodRepository.findOne({
      where: { slug },
      relations: ['zone', 'rates'],
    });

    if (!method) {
      throw new Error('Shipping method not found');
    }

    return this.transformToResponseDto(method);
  }

  async update(
    id: string,
    updateMethodDto: UpdateShippingMethodDto,
    userId?: string
  ): Promise<ShippingMethodResponseDto> {
    const method = await this.shippingMethodRepository.findOne({
      where: { id },
    });

    if (!method) {
      throw new Error('Shipping method not found');
    }

    // Handle slug generation if name is being updated
    let slug = method.slug;
    if (updateMethodDto.name && updateMethodDto.name !== method.name) {
      slug = await this.generateUniqueSlug(
        updateMethodDto.slug || updateMethodDto.name
      );
    }

    // Update method
    Object.assign(method, {
      ...updateMethodDto,
      slug,
    });

    const updatedMethod = await this.shippingMethodRepository.save(method);

    // Reload the method with relations
    const methodWithRelations = await this.shippingMethodRepository.findOne({
      where: { id: updatedMethod.id },
      relations: ['zone', 'rates'],
    });

    return this.transformToResponseDto(methodWithRelations!);
  }

  async remove(id: string): Promise<void> {
    const method = await this.shippingMethodRepository.findOne({
      where: { id },
      relations: ['rates'],
    });

    if (!method) {
      throw new Error('Shipping method not found');
    }

    if (method.rates && method.rates.length > 0) {
      throw new Error('Cannot delete method with active shipping rates');
    }

    await this.shippingMethodRepository.remove(method);
  }

  async findByZone(zoneId: string): Promise<ShippingMethodResponseDto[]> {
    const methods = await this.shippingMethodRepository.find({
      where: { zoneId, isActive: true },
      relations: ['zone', 'rates'],
      order: { priority: 'asc' },
    });

    return methods.map((method) => this.transformToResponseDto(method));
  }

  async getActiveMethods(): Promise<ShippingMethodResponseDto[]> {
    const methods = await this.shippingMethodRepository.find({
      where: { isActive: true },
      relations: ['zone', 'rates'],
      order: { priority: 'asc' },
    });

    return methods.map((method) => this.transformToResponseDto(method));
  }

  async setDefaultMethod(id: string): Promise<void> {
    // First, remove default from all methods
    await this.shippingMethodRepository.update(
      { isDefault: true },
      { isDefault: false }
    );

    // Set the new default method
    await this.shippingMethodRepository.update(id, { isDefault: true });
  }

  async getDefaultMethod(): Promise<ShippingMethodResponseDto | null> {
    const method = await this.shippingMethodRepository.findOne({
      where: { isDefault: true, isActive: true },
      relations: ['zone', 'rates'],
    });

    return method ? this.transformToResponseDto(method) : null;
  }
} 