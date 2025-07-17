import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { ShippingZone } from './shipping-zone.entity';
import { CreateShippingZoneDto } from './dto/create-shipping-zone.dto';
import { UpdateShippingZoneDto } from './dto/update-shipping-zone.dto';
import { ShippingZoneResponseDto } from './dto/shipping-zone-response.dto';
import { GetShippingZonesQueryDto } from './dto/get-shipping-zones-query.dto';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';

export class ShippingZoneService {
  private shippingZoneRepository: Repository<ShippingZone>;

  constructor(shippingZoneRepository: Repository<ShippingZone>) {
    this.shippingZoneRepository = shippingZoneRepository;
  }

  private transformToResponseDto(zone: ShippingZone): ShippingZoneResponseDto {
    return {
      id: zone.id,
      name: zone.name,
      slug: zone.slug,
      description: zone.description || '',
      zoneType: zone.zoneType,
      countries: zone.countries || [],
      states: zone.states || [],
      cities: zone.cities || [],
      postalCodes: zone.postalCodes || [],
      isActive: zone.isActive,
      priority: zone.priority,
      color: zone.color,
      createdAt: zone.createdAt,
      updatedAt: zone.updatedAt,
      methodsCount: zone.methods?.length || 0,
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
      await this.shippingZoneRepository.findOne({ where: { slug: uniqueSlug } })
    ) {
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }

    return uniqueSlug;
  }

  async create(
    createZoneDto: CreateShippingZoneDto,
    userId?: string
  ): Promise<ShippingZoneResponseDto> {
    const slug = await this.generateUniqueSlug(
      createZoneDto.slug || createZoneDto.name
    );

    const zone = this.shippingZoneRepository.create({
      ...createZoneDto,
      slug,
    });

    const savedZone = await this.shippingZoneRepository.save(zone);
    return this.transformToResponseDto(savedZone);
  }

  async findAll(
    query: GetShippingZonesQueryDto
  ): Promise<PaginatedResponseDto<ShippingZoneResponseDto>> {
    const {
      page = 1,
      limit = 10,
      sort = 'priority',
      order = 'asc',
    } = query;
    const skip = (page - 1) * limit;
    const { search, zoneType, isActive, country, state, city, postalCode } = query;

    // Build where conditions
    const baseConditions: FindOptionsWhere<any> = {};

    if (zoneType) baseConditions.zoneType = zoneType;
    if (isActive !== undefined) baseConditions.isActive = isActive;

    let where: FindOptionsWhere<any>[] | FindOptionsWhere<any> = baseConditions;

    if (search) {
      where = [
        { ...baseConditions, name: Like(`%${search}%`) },
        { ...baseConditions, slug: Like(`%${search}%`) },
        { ...baseConditions, description: Like(`%${search}%`) },
      ];
    }

    // Get total count
    const [zones, total] = await this.shippingZoneRepository.findAndCount({
      relations: ['methods'],
      where,
      skip,
      take: limit,
      order: {
        [sort]: order,
      },
    });

    // Transform zones to response DTO
    const zoneDtos = zones.map((zone) => this.transformToResponseDto(zone));

    return {
      data: zoneDtos,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<ShippingZoneResponseDto> {
    const zone = await this.shippingZoneRepository.findOne({
      where: { id },
      relations: ['methods'],
    });

    if (!zone) {
      throw new Error('Shipping zone not found');
    }

    return this.transformToResponseDto(zone);
  }

  async findBySlug(slug: string): Promise<ShippingZoneResponseDto> {
    const zone = await this.shippingZoneRepository.findOne({
      where: { slug },
      relations: ['methods'],
    });

    if (!zone) {
      throw new Error('Shipping zone not found');
    }

    return this.transformToResponseDto(zone);
  }

  async update(
    id: string,
    updateZoneDto: UpdateShippingZoneDto,
    userId?: string
  ): Promise<ShippingZoneResponseDto> {
    const zone = await this.shippingZoneRepository.findOne({
      where: { id },
    });

    if (!zone) {
      throw new Error('Shipping zone not found');
    }

    // Handle slug generation if name is being updated
    let slug = zone.slug;
    if (updateZoneDto.name && updateZoneDto.name !== zone.name) {
      slug = await this.generateUniqueSlug(
        updateZoneDto.slug || updateZoneDto.name
      );
    }

    // Update zone
    Object.assign(zone, {
      ...updateZoneDto,
      slug,
    });

    const updatedZone = await this.shippingZoneRepository.save(zone);

    // Reload the zone with relations
    const zoneWithRelations = await this.shippingZoneRepository.findOne({
      where: { id: updatedZone.id },
      relations: ['methods'],
    });

    return this.transformToResponseDto(zoneWithRelations!);
  }

  async remove(id: string): Promise<void> {
    const zone = await this.shippingZoneRepository.findOne({
      where: { id },
      relations: ['methods'],
    });

    if (!zone) {
      throw new Error('Shipping zone not found');
    }

    if (zone.methods && zone.methods.length > 0) {
      throw new Error('Cannot delete zone with active shipping methods');
    }

    await this.shippingZoneRepository.remove(zone);
  }

  async findMatchingZone(
    country: string,
    state?: string,
    city?: string,
    postalCode?: string
  ): Promise<ShippingZoneResponseDto | null> {
    const zones = await this.shippingZoneRepository.find({
      where: { isActive: true },
      relations: ['methods'],
      order: { priority: 'asc' },
    });

    for (const zone of zones) {
      if (this.isAddressInZone(zone, country, state, city, postalCode)) {
        return this.transformToResponseDto(zone);
      }
    }

    return null;
  }

  private isAddressInZone(
    zone: ShippingZone,
    country: string,
    state?: string,
    city?: string,
    postalCode?: string
  ): boolean {
    // Check country
    if (zone.countries && zone.countries.length > 0) {
      if (!zone.countries.includes(country)) {
        return false;
      }
    }

    // Check state
    if (state && zone.states && zone.states.length > 0) {
      if (!zone.states.includes(state)) {
        return false;
      }
    }

    // Check city
    if (city && zone.cities && zone.cities.length > 0) {
      if (!zone.cities.includes(city)) {
        return false;
      }
    }

    // Check postal code
    if (postalCode && zone.postalCodes && zone.postalCodes.length > 0) {
      if (!zone.postalCodes.includes(postalCode)) {
        return false;
      }
    }

    return true;
  }

  async getActiveZones(): Promise<ShippingZoneResponseDto[]> {
    const zones = await this.shippingZoneRepository.find({
      where: { isActive: true },
      relations: ['methods'],
      order: { priority: 'asc' },
    });

    return zones.map((zone) => this.transformToResponseDto(zone));
  }
} 