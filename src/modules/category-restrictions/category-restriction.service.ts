import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { CategoryStateRestriction } from './category-restriction.entity';
import { CreateCategoryRestrictionDto } from './dto/create-category-restriction.dto';
import { UpdateCategoryRestrictionDto } from './dto/update-category-restriction.dto';
import { GetCategoryRestrictionsQueryDto } from './dto/get-category-restrictions-query.dto';
import { CategoryRestrictionResponseDto } from './dto/category-restriction-response.dto';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { AppDataSource } from '../../config/database';

export class CategoryRestrictionService {
  private categoryRestrictionRepository: Repository<CategoryStateRestriction>;

  constructor(categoryRestrictionRepository: Repository<CategoryStateRestriction>) {
    this.categoryRestrictionRepository = categoryRestrictionRepository;
  }

  async create(createDto: CreateCategoryRestrictionDto): Promise<CategoryRestrictionResponseDto> {
    // Check if category restriction already exists
    const existingRestriction = await this.categoryRestrictionRepository.findOne({
      where: { categoryId: createDto.categoryId }
    });

    if (existingRestriction) {
      throw new Error('Category restriction already exists for this category');
    }

    // Validate state codes
    this.validateStateCodes(createDto.states);

    const restriction = this.categoryRestrictionRepository.create(createDto);
    const savedRestriction = await this.categoryRestrictionRepository.save(restriction);

    return this.mapToResponseDto(savedRestriction);
  }

  async findAll(query: GetCategoryRestrictionsQueryDto): Promise<PaginatedResponseDto<CategoryRestrictionResponseDto>> {
    const { page = 1, limit = 10, categoryId, state, isRestricted, isActive, reason, search } = query;
    const skip = (page - 1) * limit;

    // Build where conditions
    const baseConditions: FindOptionsWhere<any> = {};

    if (categoryId) baseConditions.categoryId = categoryId;
    if (isRestricted !== undefined) baseConditions.isRestricted = isRestricted;
    if (isActive !== undefined) baseConditions.isActive = isActive;
    if (reason) baseConditions.reason = Like(`%${reason}%`);

    let where: FindOptionsWhere<any>[] | FindOptionsWhere<any> = baseConditions;

    // Handle search in multiple fields
    if (search) {
      where = [
        { ...baseConditions, reason: Like(`%${search}%`) },
        { ...baseConditions, customMessage: Like(`%${search}%`) },
        { ...baseConditions, notes: Like(`%${search}%`) }
      ];
    }

    // Get restrictions with pagination
    const [restrictions, total] = await this.categoryRestrictionRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: {
        createdAt: 'DESC'
      }
    });

    // Filter by state if provided (since it's stored as JSON array)
    let filteredRestrictions = restrictions;
    if (state) {
      filteredRestrictions = restrictions.filter(restriction => 
        restriction.states.includes(state)
      );
    }

    const data = filteredRestrictions.map(restriction => this.mapToResponseDto(restriction));

    return {
      data,
      meta: {
        page,
        limit,
        total: state ? filteredRestrictions.length : total,
        totalPages: Math.ceil((state ? filteredRestrictions.length : total) / limit)
      }
    };
  }

  async findOne(id: string): Promise<CategoryRestrictionResponseDto> {
    const restriction = await this.categoryRestrictionRepository.findOne({
      where: { id }
    });

    if (!restriction) {
      throw new Error('Category restriction not found');
    }

    return this.mapToResponseDto(restriction);
  }

  async findByCategory(categoryId: string): Promise<CategoryRestrictionResponseDto | null> {
    const restriction = await this.categoryRestrictionRepository.findOne({
      where: { categoryId }
    });

    return restriction ? this.mapToResponseDto(restriction) : null;
  }

  async update(id: string, updateDto: UpdateCategoryRestrictionDto): Promise<CategoryRestrictionResponseDto> {
    const restriction = await this.categoryRestrictionRepository.findOne({
      where: { id }
    });

    if (!restriction) {
      throw new Error('Category restriction not found');
    }

    // If updating categoryId, check for conflicts
    if (updateDto.categoryId && updateDto.categoryId !== restriction.categoryId) {
      const existingRestriction = await this.categoryRestrictionRepository.findOne({
        where: { categoryId: updateDto.categoryId }
      });

      if (existingRestriction) {
        throw new Error('Category restriction already exists for this category');
      }
    }

    // Validate state codes if provided
    if (updateDto.states) {
      this.validateStateCodes(updateDto.states);
    }

    Object.assign(restriction, updateDto);
    const updatedRestriction = await this.categoryRestrictionRepository.save(restriction);

    return this.mapToResponseDto(updatedRestriction);
  }

  async remove(id: string): Promise<void> {
    const restriction = await this.categoryRestrictionRepository.findOne({
      where: { id }
    });

    if (!restriction) {
      throw new Error('Category restriction not found');
    }

    await this.categoryRestrictionRepository.remove(restriction);
  }

  async isProductRestrictedInState(productCategoryIds: string[], state: string): Promise<{
    isRestricted: boolean;
    restrictedCategories: Array<{
      categoryId: string;
      reason?: string;
      customMessage?: string;
    }>;
  }> {
    if (!productCategoryIds || productCategoryIds.length === 0) {
      return { isRestricted: false, restrictedCategories: [] };
    }

    const restrictedCategories = [];

    for (const categoryId of productCategoryIds) {
      const restriction = await this.categoryRestrictionRepository.findOne({
        where: { categoryId, isActive: true, isRestricted: true }
      });

      if (restriction && restriction.states.includes(state)) {
        restrictedCategories.push({
          categoryId,
          reason: restriction.reason,
          customMessage: restriction.customMessage
        });
      }
    }

    return {
      isRestricted: restrictedCategories.length > 0,
      restrictedCategories
    };
  }

  async validateProductsForState(productCategoryIds: string[], state: string): Promise<void> {
    const { isRestricted, restrictedCategories } = await this.isProductRestrictedInState(productCategoryIds, state);

    if (isRestricted) {
      const messages = restrictedCategories.map(cat => 
        cat.customMessage || cat.reason || 'This product cannot be shipped to your state'
      );
      throw new Error(`Products cannot be shipped to ${state}: ${messages.join(', ')}`);
    }
  }

  async checkCategoryRestriction(categoryId: string, state: string): Promise<{
    isRestricted: boolean;
    reason?: string;
    customMessage?: string;
  }> {
    const restriction = await this.categoryRestrictionRepository.findOne({
      where: { categoryId, isActive: true, isRestricted: true }
    });

    if (!restriction || !restriction.states.includes(state)) {
      return { isRestricted: false };
    }

    return {
      isRestricted: true,
      reason: restriction.reason,
      customMessage: restriction.customMessage
    };
  }

  getUSStates(): Array<{ code: string; name: string }> {
    return [
      { code: 'AL', name: 'Alabama' },
      { code: 'AK', name: 'Alaska' },
      { code: 'AZ', name: 'Arizona' },
      { code: 'AR', name: 'Arkansas' },
      { code: 'CA', name: 'California' },
      { code: 'CO', name: 'Colorado' },
      { code: 'CT', name: 'Connecticut' },
      { code: 'DE', name: 'Delaware' },
      { code: 'FL', name: 'Florida' },
      { code: 'GA', name: 'Georgia' },
      { code: 'HI', name: 'Hawaii' },
      { code: 'ID', name: 'Idaho' },
      { code: 'IL', name: 'Illinois' },
      { code: 'IN', name: 'Indiana' },
      { code: 'IA', name: 'Iowa' },
      { code: 'KS', name: 'Kansas' },
      { code: 'KY', name: 'Kentucky' },
      { code: 'LA', name: 'Louisiana' },
      { code: 'ME', name: 'Maine' },
      { code: 'MD', name: 'Maryland' },
      { code: 'MA', name: 'Massachusetts' },
      { code: 'MI', name: 'Michigan' },
      { code: 'MN', name: 'Minnesota' },
      { code: 'MS', name: 'Mississippi' },
      { code: 'MO', name: 'Missouri' },
      { code: 'MT', name: 'Montana' },
      { code: 'NE', name: 'Nebraska' },
      { code: 'NV', name: 'Nevada' },
      { code: 'NH', name: 'New Hampshire' },
      { code: 'NJ', name: 'New Jersey' },
      { code: 'NM', name: 'New Mexico' },
      { code: 'NY', name: 'New York' },
      { code: 'NC', name: 'North Carolina' },
      { code: 'ND', name: 'North Dakota' },
      { code: 'OH', name: 'Ohio' },
      { code: 'OK', name: 'Oklahoma' },
      { code: 'OR', name: 'Oregon' },
      { code: 'PA', name: 'Pennsylvania' },
      { code: 'RI', name: 'Rhode Island' },
      { code: 'SC', name: 'South Carolina' },
      { code: 'SD', name: 'South Dakota' },
      { code: 'TN', name: 'Tennessee' },
      { code: 'TX', name: 'Texas' },
      { code: 'UT', name: 'Utah' },
      { code: 'VT', name: 'Vermont' },
      { code: 'VA', name: 'Virginia' },
      { code: 'WA', name: 'Washington' },
      { code: 'WV', name: 'West Virginia' },
      { code: 'WI', name: 'Wisconsin' },
      { code: 'WY', name: 'Wyoming' }
    ];
  }

  private validateStateCodes(states: string[]): void {
    const validStates = this.getUSStates().map(state => state.code);
    const invalidStates = states.filter(state => !validStates.includes(state));

    if (invalidStates.length > 0) {
      throw new Error(`Invalid state codes: ${invalidStates.join(', ')}`);
    }
  }

  private mapToResponseDto(restriction: CategoryStateRestriction): CategoryRestrictionResponseDto {
    return {
      id: restriction.id,
      categoryId: restriction.categoryId,
      states: restriction.states,
      isRestricted: restriction.isRestricted,
      reason: restriction.reason,
      customMessage: restriction.customMessage,
      isActive: restriction.isActive,
      createdBy: restriction.createdBy,
      notes: restriction.notes,
      createdAt: restriction.createdAt,
      updatedAt: restriction.updatedAt
    };
  }
} 