import { Repository, Like, FindOptionsWhere, MoreThanOrEqual, LessThanOrEqual, In } from 'typeorm';
import { Coupon, COUPON_TYPE } from './coupon.entity';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { GetCouponsQueryDto } from './dto/get-coupons-query.dto';
import { ValidateCouponDto } from './dto/validate-coupon.dto';
import { CouponResponseDto, CouponValidationResponseDto, CouponUsageStatsDto } from './dto/coupon-response.dto';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';

export class CouponService {
  private couponRepository: Repository<Coupon>;

  constructor(couponRepository: Repository<Coupon>) {
    this.couponRepository = couponRepository;
  }

  async create(createDto: CreateCouponDto): Promise<CouponResponseDto> {
    // Check if coupon code already exists
    const existingCoupon = await this.couponRepository.findOne({
      where: { code: createDto.code }
    });

    if (existingCoupon) {
      throw new Error('Coupon code already exists');
    }

    // Validate business rules
    this.validateCouponRules(createDto);

    // Convert date strings to Date objects
    const couponData = {
      ...createDto,
      startDate: createDto.startDate ? new Date(createDto.startDate) : undefined,
      endDate: createDto.endDate ? new Date(createDto.endDate) : undefined,
      usageCount: 0,
      applicableCategories: createDto.applicableCategories || [],
      applicableProducts: createDto.applicableProducts || []
    };

    const coupon = this.couponRepository.create(couponData);
    const savedCoupon = await this.couponRepository.save(coupon);

    return this.mapToResponseDto(savedCoupon);
  }

  async findAll(query: GetCouponsQueryDto): Promise<PaginatedResponseDto<CouponResponseDto>> {
    const { page = 1, limit = 10, search, code, type, isActive, isExpired, hasUsageLimit, 
           startDateFrom, startDateTo, endDateFrom, endDateTo, createdBy, categoryId, productId } = query;
    const skip = (page - 1) * limit;

    // Build where conditions
    const baseConditions: FindOptionsWhere<any> = {};

    if (code) baseConditions.code = Like(`%${code}%`);
    if (type) baseConditions.type = type;
    if (isActive !== undefined) baseConditions.isActive = isActive;
    if (createdBy) baseConditions.createdBy = createdBy;

    let where: FindOptionsWhere<any>[] | FindOptionsWhere<any> = baseConditions;

    // Handle search in multiple fields
    if (search) {
      where = [
        { ...baseConditions, code: Like(`%${search}%`) },
        { ...baseConditions, name: Like(`%${search}%`) },
        { ...baseConditions, description: Like(`%${search}%`) }
      ];
    }

    // Date range filters
    if (startDateFrom) baseConditions.startDate = MoreThanOrEqual(new Date(startDateFrom));
    if (startDateTo) baseConditions.startDate = LessThanOrEqual(new Date(startDateTo));
    if (endDateFrom) baseConditions.endDate = MoreThanOrEqual(new Date(endDateFrom));
    if (endDateTo) baseConditions.endDate = LessThanOrEqual(new Date(endDateTo));

    // Get coupons with pagination
    let [coupons, total] = await this.couponRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: {
        createdAt: 'DESC'
      }
    });

    // Apply additional filters that require JS logic
    if (isExpired !== undefined) {
      coupons = coupons.filter(coupon => this.isCouponExpired(coupon) === isExpired);
    }

    if (hasUsageLimit !== undefined) {
      coupons = coupons.filter(coupon => (coupon.usageLimit !== null) === hasUsageLimit);
    }

    if (categoryId) {
      coupons = coupons.filter(coupon => 
        !coupon.applicableCategories.length || coupon.applicableCategories.includes(categoryId)
      );
    }

    if (productId) {
      coupons = coupons.filter(coupon => 
        !coupon.applicableProducts.length || coupon.applicableProducts.includes(productId)
      );
    }

    const data = coupons.map(coupon => this.mapToResponseDto(coupon));

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async findOne(id: string): Promise<CouponResponseDto> {
    const coupon = await this.couponRepository.findOne({
      where: { id }
    });

    if (!coupon) {
      throw new Error('Coupon not found');
    }

    return this.mapToResponseDto(coupon);
  }

  async findByCode(code: string): Promise<CouponResponseDto | null> {
    const coupon = await this.couponRepository.findOne({
      where: { code }
    });

    return coupon ? this.mapToResponseDto(coupon) : null;
  }

  async update(id: string, updateDto: UpdateCouponDto): Promise<CouponResponseDto> {
    const coupon = await this.couponRepository.findOne({
      where: { id }
    });

    if (!coupon) {
      throw new Error('Coupon not found');
    }

    // Check for code conflicts if code is being updated
    if (updateDto.code && updateDto.code !== coupon.code) {
      const existingCoupon = await this.couponRepository.findOne({
        where: { code: updateDto.code }
      });

      if (existingCoupon) {
        throw new Error('Coupon code already exists');
      }
    }

    // Validate business rules for updates
    const mergedData = { ...coupon, ...updateDto };
    this.validateCouponRules(mergedData);

    // Convert date strings to Date objects
    const updateData = {
      ...updateDto,
      startDate: updateDto.startDate ? new Date(updateDto.startDate) : undefined,
      endDate: updateDto.endDate ? new Date(updateDto.endDate) : undefined
    };

    Object.assign(coupon, updateData);
    const updatedCoupon = await this.couponRepository.save(coupon);

    return this.mapToResponseDto(updatedCoupon);
  }

  async remove(id: string): Promise<void> {
    const coupon = await this.couponRepository.findOne({
      where: { id }
    });

    if (!coupon) {
      throw new Error('Coupon not found');
    }

    // Check if coupon has been used
    if (coupon.usageCount > 0) {
      throw new Error('Cannot delete coupon that has been used. Consider deactivating it instead.');
    }

    await this.couponRepository.remove(coupon);
  }

  async validateCoupon(validationDto: ValidateCouponDto): Promise<CouponValidationResponseDto> {
    const { couponCode, items, subtotal, userId } = validationDto;

    // Find coupon
    const coupon = await this.couponRepository.findOne({
      where: { code: couponCode }
    });

    if (!coupon) {
      return {
        isValid: false,
        message: 'Coupon not found',
        errors: ['Invalid coupon code']
      };
    }

    // Validate coupon
    const validation = await this.validateCouponAgainstCriteria(coupon, items, subtotal, userId);

    if (!validation.isValid) {
      return validation;
    }

    // Calculate discount
    const discountAmount = this.calculateDiscount(coupon, items, subtotal);

    return {
      isValid: true,
      coupon: this.mapToResponseDto(coupon),
      discountAmount,
      message: 'Coupon is valid'
    };
  }

  async deactivateCoupon(id: string): Promise<CouponResponseDto> {
    const coupon = await this.couponRepository.findOne({
      where: { id }
    });

    if (!coupon) {
      throw new Error('Coupon not found');
    }

    coupon.isActive = false;
    const updatedCoupon = await this.couponRepository.save(coupon);

    return this.mapToResponseDto(updatedCoupon);
  }

  async activateCoupon(id: string): Promise<CouponResponseDto> {
    const coupon = await this.couponRepository.findOne({
      where: { id }
    });

    if (!coupon) {
      throw new Error('Coupon not found');
    }

    coupon.isActive = true;
    const updatedCoupon = await this.couponRepository.save(coupon);

    return this.mapToResponseDto(updatedCoupon);
  }

  async getUsageStats(): Promise<CouponUsageStatsDto> {
    const totalCoupons = await this.couponRepository.count();
    const activeCoupons = await this.couponRepository.count({ where: { isActive: true } });
    
    const now = new Date();
    const expiredCoupons = await this.couponRepository.count({
      where: {
        endDate: LessThanOrEqual(now)
      }
    });

    const coupons = await this.couponRepository.find();
    const totalUsage = coupons.reduce((sum, coupon) => sum + coupon.usageCount, 0);

    // Get most used coupons (top 5)
    const mostUsedCoupons = coupons
      .filter(c => c.usageCount > 0)
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 5)
      .map(c => ({
        code: c.code,
        name: c.name,
        usageCount: c.usageCount
      }));

    return {
      totalCoupons,
      activeCoupons,
      expiredCoupons,
      totalUsage,
      totalDiscountGiven: 0, // This would need to be tracked separately in order history
      mostUsedCoupons
    };
  }

  async incrementUsage(couponId: string): Promise<void> {
    await this.couponRepository.increment({ id: couponId }, 'usageCount', 1);
  }

  private validateCouponRules(couponData: any): void {
    // Validate percentage values
    if (couponData.type === COUPON_TYPE.PERCENTAGE && (couponData.value < 0 || couponData.value > 100)) {
      throw new Error('Percentage discount must be between 0 and 100');
    }

    // Validate fixed amount
    if (couponData.type === COUPON_TYPE.FIXED_AMOUNT && couponData.value < 0) {
      throw new Error('Fixed amount discount must be positive');
    }

    // Validate date ranges
    if (couponData.startDate && couponData.endDate && 
        new Date(couponData.startDate) >= new Date(couponData.endDate)) {
      throw new Error('Start date must be before end date');
    }

    // Validate usage limits
    if (couponData.usageLimit && couponData.usageLimit < 1) {
      throw new Error('Usage limit must be at least 1');
    }

    if (couponData.usageLimitPerUser && couponData.usageLimitPerUser < 1) {
      throw new Error('Usage limit per user must be at least 1');
    }
  }

  private async validateCouponAgainstCriteria(
    coupon: Coupon, 
    items: any[], 
    subtotal: number, 
    userId?: string
  ): Promise<CouponValidationResponseDto> {
    const errors: string[] = [];

    // Check if coupon is active
    if (!coupon.isActive) {
      errors.push('Coupon is not active');
    }

    // Check date validity
    const now = new Date();
    if (coupon.startDate && now < coupon.startDate) {
      errors.push('Coupon is not yet valid');
    }

    if (coupon.endDate && now > coupon.endDate) {
      errors.push('Coupon has expired');
    }

    // Check minimum amount
    if (coupon.minimumAmount && subtotal < coupon.minimumAmount) {
      errors.push(`Minimum order amount of $${coupon.minimumAmount} required`);
    }

    // Check usage limits
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      errors.push('Coupon usage limit exceeded');
    }

    // Check category/product applicability
    if (coupon.applicableCategories.length > 0 || coupon.applicableProducts.length > 0) {
      const hasApplicableItems = items.some(item => 
        (coupon.applicableProducts.length === 0 || coupon.applicableProducts.includes(item.productId)) &&
        (coupon.applicableCategories.length === 0 || 
         (item.categoryId && coupon.applicableCategories.includes(item.categoryId)))
      );

      if (!hasApplicableItems) {
        errors.push('Coupon is not applicable to items in your cart');
      }
    }

    // TODO: Check per-user usage limit (would need order history)

    return {
      isValid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
      message: errors.length > 0 ? errors.join(', ') : undefined
    };
  }

  private calculateDiscount(coupon: Coupon, items: any[], subtotal: number): number {
    let discountAmount = 0;

    // Calculate applicable amount (only for applicable products/categories)
    let applicableAmount = subtotal;
    if (coupon.applicableCategories.length > 0 || coupon.applicableProducts.length > 0) {
      applicableAmount = items
        .filter(item => 
          (coupon.applicableProducts.length === 0 || coupon.applicableProducts.includes(item.productId)) &&
          (coupon.applicableCategories.length === 0 || 
           (item.categoryId && coupon.applicableCategories.includes(item.categoryId)))
        )
        .reduce((sum, item) => sum + item.totalPrice, 0);
    }

    switch (coupon.type) {
      case COUPON_TYPE.PERCENTAGE:
        discountAmount = (applicableAmount * coupon.value) / 100;
        break;
      case COUPON_TYPE.FIXED_AMOUNT:
        discountAmount = Math.min(coupon.value, applicableAmount);
        break;
      case COUPON_TYPE.FREE_SHIPPING:
        discountAmount = 0; // Shipping cost would be handled separately
        break;
    }

    // Apply maximum discount limit
    if (coupon.maximumDiscount && discountAmount > coupon.maximumDiscount) {
      discountAmount = coupon.maximumDiscount;
    }

    return Math.round(discountAmount * 100) / 100; // Round to 2 decimal places
  }

  private isCouponExpired(coupon: Coupon): boolean {
    return coupon.endDate ? new Date() > coupon.endDate : false;
  }

  private mapToResponseDto(coupon: Coupon): CouponResponseDto {
    const remainingUses = coupon.usageLimit ? coupon.usageLimit - coupon.usageCount : undefined;
    const isExpired = this.isCouponExpired(coupon);
    const isValid = coupon.isActive && !isExpired && 
                   (coupon.usageLimit ? coupon.usageCount < coupon.usageLimit : true);

    return {
      id: coupon.id,
      code: coupon.code,
      name: coupon.name,
      description: coupon.description,
      type: coupon.type,
      value: coupon.value,
      minimumAmount: coupon.minimumAmount,
      maximumDiscount: coupon.maximumDiscount,
      startDate: coupon.startDate,
      endDate: coupon.endDate,
      usageLimit: coupon.usageLimit,
      usageCount: coupon.usageCount,
      usageLimitPerUser: coupon.usageLimitPerUser,
      isActive: coupon.isActive,
      applicableCategories: coupon.applicableCategories,
      applicableProducts: coupon.applicableProducts,
      createdBy: coupon.createdBy,
      createdAt: coupon.createdAt,
      updatedAt: coupon.updatedAt,
      remainingUses,
      isExpired,
      isValid
    };
  }
} 