import { Repository, Like, FindOptionsWhere, Between } from "typeorm";
import { ShippingRate } from "./shipping-rate.entity";
import { CreateShippingRateDto } from "./dto/create-shipping-rate.dto";
import { UpdateShippingRateDto } from "./dto/update-shipping-rate.dto";
import { ShippingRateResponseDto } from "./dto/shipping-rate-response.dto";
import { PaginatedResponseDto } from "../../common/dto/paginated-response.dto";

export interface ShippingCalculationParams {
  methodId: string;
  weight?: number;
  orderValue?: number;
  distance?: number;
  itemCount?: number; // NEW: Number of items in the order
  productIds?: string[];
  categoryIds?: string[];
  isHoliday?: boolean;
}

export interface ShippingCalculationResult {
  rate: ShippingRateResponseDto;
  totalCost: number;
  breakdown: {
    baseRate: number;
    additionalCost: number;
    handlingFee: number;
    insuranceFee: number;
    signatureFee: number;
  };
}

export class ShippingRateService {
  private shippingRateRepository: Repository<ShippingRate>;

  constructor(shippingRateRepository: Repository<ShippingRate>) {
    this.shippingRateRepository = shippingRateRepository;
  }

  private transformToResponseDto(rate: ShippingRate): ShippingRateResponseDto {
    return {
      id: rate.id,
      methodId: rate.methodId,
      method: rate.method
        ? {
            id: rate.method.id,
            name: rate.method.name,
            slug: rate.method.slug,
          }
        : undefined,
      rateType: rate.rateType,
      baseRate: rate.baseRate,
      additionalRate: rate.additionalRate,
      additionalItemRate: rate.additionalItemRate,
      firstItemCount: rate.firstItemCount,
      minWeight: rate.minWeight,
      maxWeight: rate.maxWeight,
      weightUnit: rate.weightUnit,
      minOrderValue: rate.minOrderValue,
      maxOrderValue: rate.maxOrderValue,
      minDistance: rate.minDistance,
      maxDistance: rate.maxDistance,
      distanceUnit: rate.distanceUnit,
      isActive: rate.isActive,
      name: rate.name,
      description: rate.description,
      isFreeShipping: rate.isFreeShipping,
      freeShippingThreshold: rate.freeShippingThreshold,
      appliesToAllProducts: rate.appliesToAllProducts,
      productIds: rate.productIds || [],
      categoryIds: rate.categoryIds || [],
      excludedProductIds: rate.excludedProductIds || [],
      excludedCategoryIds: rate.excludedCategoryIds || [],
      validFrom: rate.validFrom,
      validTo: rate.validTo,
      isHolidayRate: rate.isHolidayRate,
      holidayDates: rate.holidayDates || [],
      handlingFee: rate.handlingFee,
      insuranceFee: rate.insuranceFee,
      signatureFee: rate.signatureFee,
      createdAt: rate.createdAt,
      updatedAt: rate.updatedAt,
    };
  }

  async create(
    createRateDto: CreateShippingRateDto,
    userId?: string
  ): Promise<ShippingRateResponseDto> {
    const rate = this.shippingRateRepository.create(createRateDto);
    const savedRate = await this.shippingRateRepository.save(rate);

    // Reload with relations
    const rateWithRelations = await this.shippingRateRepository.findOne({
      where: { id: savedRate.id },
      relations: ["method"],
    });

    return this.transformToResponseDto(rateWithRelations!);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string
    // methodId?: string,
    // rateType?: string,
    // isActive?: boolean
  ): Promise<PaginatedResponseDto<ShippingRateResponseDto>> {
    const skip = (page - 1) * limit;

    // Build where conditions
    const baseConditions: FindOptionsWhere<any> = {};

    // if (methodId) baseConditions.methodId = methodId;
    // if (rateType) baseConditions.rateType = rateType;
    // if (isActive !== undefined) baseConditions.isActive = isActive;

    let where: FindOptionsWhere<any>[] | FindOptionsWhere<any> = baseConditions;

    if (search) {
      where = [
        { ...baseConditions, name: Like(`%${search}%`) },
        { ...baseConditions, description: Like(`%${search}%`) },
      ];
    }

    // Get total count
    const [rates, total] = await this.shippingRateRepository.findAndCount({
      relations: ["method"],
      where,
      skip,
      take: limit,
      order: {
        baseRate: "asc",
      },
    });

    // Transform rates to response DTO
    const rateDtos = rates.map((rate) => this.transformToResponseDto(rate));

    return {
      data: rateDtos,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<ShippingRateResponseDto> {
    const rate = await this.shippingRateRepository.findOne({
      where: { id },
      relations: ["method"],
    });

    if (!rate) {
      throw new Error("Shipping rate not found");
    }

    return this.transformToResponseDto(rate);
  }

  async update(
    id: string,
    updateRateDto: UpdateShippingRateDto,
    userId?: string
  ): Promise<ShippingRateResponseDto> {
    const rate = await this.shippingRateRepository.findOne({
      where: { id },
    });

    if (!rate) {
      throw new Error("Shipping rate not found");
    }

    // Update rate
    Object.assign(rate, updateRateDto);
    const updatedRate = await this.shippingRateRepository.save(rate);

    // Reload the rate with relations
    const rateWithRelations = await this.shippingRateRepository.findOne({
      where: { id: updatedRate.id },
      relations: ["method"],
    });

    return this.transformToResponseDto(rateWithRelations!);
  }

  async remove(id: string): Promise<void> {
    const rate = await this.shippingRateRepository.findOne({
      where: { id },
    });

    if (!rate) {
      throw new Error("Shipping rate not found");
    }

    await this.shippingRateRepository.remove(rate);
  }

  async findByMethod(methodId: string): Promise<ShippingRateResponseDto[]> {
    const rates = await this.shippingRateRepository.find({
      where: { methodId, isActive: true },
      relations: ["method"],
      order: { baseRate: "asc" },
    });

    return rates.map((rate) => this.transformToResponseDto(rate));
  }

  async calculateShippingCost(
    params: ShippingCalculationParams
  ): Promise<ShippingCalculationResult | null> {
    const {
      methodId,
      weight,
      orderValue,
      distance,
      itemCount,
      productIds,
      categoryIds,
      isHoliday,
    } = params;

    // Get all active rates for the method
    const rates = await this.shippingRateRepository.find({
      where: { methodId, isActive: true },
      relations: ["method"],
      order: { baseRate: "asc" },
    });

    // Find the best matching rate
    let bestRate: ShippingRate | null = null;
    let bestScore = -1;

    for (const rate of rates) {
      const score = this.calculateRateMatchScore(rate, {
        weight,
        orderValue,
        distance,
        itemCount,
        productIds,
        categoryIds,
        isHoliday,
      });

      if (score > bestScore) {
        bestScore = score;
        bestRate = rate;
      }
    }

    if (!bestRate) {
      return null;
    }

    // Calculate the total cost
    const totalCost = this.calculateTotalCost(bestRate, {
      weight,
      orderValue,
      distance,
      itemCount,
    });

    const breakdown = this.calculateCostBreakdown(bestRate, {
      weight,
      orderValue,
      distance,
      itemCount,
    });

    // Debug logging to check for calculation consistency
    console.log("🔍 Shipping Rate Debug - calculateShippingCost:", {
      methodId,
      rateName: bestRate.name,
      rateType: bestRate.rateType,
      totalCost,
      breakdown,
      calculatedTotalFromBreakdown:
        breakdown.baseRate +
        breakdown.additionalCost +
        breakdown.handlingFee +
        breakdown.insuranceFee +
        breakdown.signatureFee,
      isConsistent:
        Math.abs(
          totalCost -
            (breakdown.baseRate +
              breakdown.additionalCost +
              breakdown.handlingFee +
              breakdown.insuranceFee +
              breakdown.signatureFee)
        ) < 0.01,
    });

    return {
      rate: this.transformToResponseDto(bestRate),
      totalCost,
      breakdown,
    };
  }

  private calculateRateMatchScore(
    rate: ShippingRate,
    params: {
      weight?: number;
      orderValue?: number;
      distance?: number;
      itemCount?: number;
      productIds?: string[];
      categoryIds?: string[];
      isHoliday?: boolean;
    }
  ): number {
    let score = 0;

    // Check if rate is currently valid
    const now = new Date();
    if (rate.validFrom && now < rate.validFrom) {
      console.log("[RateMatch] Skipped: Not valid yet (validFrom)", rate.name);
      return -1;
    }
    if (rate.validTo && now > rate.validTo) {
      console.log("[RateMatch] Skipped: Expired (validTo)", rate.name);
      return -1;
    }

    // Holiday rate check
    if (rate.isHolidayRate && !params.isHoliday) {
      console.log(
        "[RateMatch] Skipped: Holiday rate but not holiday",
        rate.name
      );
      return -1;
    }
    if (!rate.isHolidayRate && params.isHoliday) {
      score -= 10;
    }

    // Product/category matching
    if (params.productIds && params.productIds.length > 0) {
      if (rate.appliesToAllProducts) {
        score += 5;
        console.log(
          "[RateMatch] Applies to all products (productIds present)",
          rate.name
        );
      } else if (
        rate.productIds &&
        rate.productIds.some((id) => params.productIds!.includes(id))
      ) {
        score += 3;
        console.log("[RateMatch] Product ID match", rate.name);
      } else if (
        rate.categoryIds &&
        params.categoryIds &&
        rate.categoryIds.some((id) => params.categoryIds!.includes(id))
      ) {
        score += 2;
        console.log("[RateMatch] Category ID match", rate.name);
      } else {
        console.log(
          "[RateMatch] Skipped: No product/category match",
          rate.name
        );
        return -1; // No match
      }
    } else if (rate.appliesToAllProducts && rate.rateType === "item_based") {
      // PATCH: Always allow item-based rates with appliesToAllProducts, even if productIds are present
      score += 5;
      console.log(
        "[RateMatch] Applies to all products (item_based fallback)",
        rate.name
      );
    }

    // Check exclusions
    if (
      params.productIds &&
      rate.excludedProductIds &&
      rate.excludedProductIds.some((id) => params.productIds!.includes(id))
    ) {
      console.log("[RateMatch] Skipped: Excluded product", rate.name);
      return -1;
    }
    if (
      params.categoryIds &&
      rate.excludedCategoryIds &&
      rate.excludedCategoryIds.some((id) => params.categoryIds!.includes(id))
    ) {
      console.log("[RateMatch] Skipped: Excluded category", rate.name);
      return -1;
    }

    // Weight-based matching - only check for weight-based rates
    if (rate.rateType === "weight_based") {
      if (
        params.weight !== undefined &&
        rate.minWeight !== undefined &&
        rate.maxWeight !== undefined
      ) {
        if (
          params.weight >= rate.minWeight &&
          params.weight <= rate.maxWeight
        ) {
          score += 10;
          console.log("[RateMatch] Weight within range", rate.name);
        } else {
          console.log("[RateMatch] Skipped: Weight outside range", rate.name);
          return -1;
        }
      } else if (rate.minWeight !== undefined || rate.maxWeight !== undefined) {
        // If rate has weight constraints but params don't have weight, skip this rate
        console.log(
          "[RateMatch] Skipped: Rate has weight constraints but params missing weight",
          rate.name
        );
        return -1;
      }
    }

    // Order value matching - only check for price-based rates
    if (rate.rateType === "price_based") {
      if (
        params.orderValue !== undefined &&
        rate.minOrderValue !== undefined &&
        rate.maxOrderValue !== undefined
      ) {
        if (
          params.orderValue >= rate.minOrderValue &&
          params.orderValue <= rate.maxOrderValue
        ) {
          score += 8;
          console.log("[RateMatch] Order value within range", rate.name);
        } else {
          console.log(
            "[RateMatch] Skipped: Order value outside range",
            rate.name
          );
          return -1;
        }
      } else if (
        rate.minOrderValue !== undefined ||
        rate.maxOrderValue !== undefined
      ) {
        // If rate has order value constraints but params don't have order value, skip this rate
        console.log(
          "[RateMatch] Skipped: Rate has order value constraints but params missing order value",
          rate.name
        );
        return -1;
      }
    }

    // Distance matching - only check for distance-based rates
    if (rate.rateType === "distance_based") {
      if (
        params.distance !== undefined &&
        rate.minDistance !== undefined &&
        rate.maxDistance !== undefined
      ) {
        if (
          params.distance >= rate.minDistance &&
          params.distance <= rate.maxDistance
        ) {
          score += 6;
          console.log("[RateMatch] Distance within range", rate.name);
        } else {
          console.log("[RateMatch] Skipped: Distance outside range", rate.name);
          return -1;
        }
      } else if (
        rate.minDistance !== undefined ||
        rate.maxDistance !== undefined
      ) {
        // If rate has distance constraints but params don't have distance, skip this rate
        console.log(
          "[RateMatch] Skipped: Rate has distance constraints but params missing distance",
          rate.name
        );
        return -1;
      }
    }

    // Free shipping check
    if (
      rate.isFreeShipping &&
      params.orderValue !== undefined &&
      rate.freeShippingThreshold !== undefined
    ) {
      if (params.orderValue >= rate.freeShippingThreshold) {
        score += 20; // High priority for free shipping
        console.log("[RateMatch] Free shipping threshold met", rate.name);
      }
    }

    console.log("[RateMatch] Final score", score, rate.name);
    return score;
  }

  private calculateTotalCost(
    rate: ShippingRate,
    params: {
      weight?: number;
      orderValue?: number;
      distance?: number;
      itemCount?: number;
    }
  ): number {
    let totalCost = rate.baseRate;
    console.log(
      "[CostCalc] Starting calculation for",
      rate.name,
      "Base rate:",
      rate.baseRate
    );

    // Calculate additional costs based on rate type
    switch (rate.rateType) {
      case "weight_based":
        if (params.weight && rate.weightUnit && rate.additionalRate) {
          const additionalUnits = Math.ceil(
            (params.weight - (rate.minWeight || 0)) / rate.weightUnit
          );
          totalCost += additionalUnits * rate.additionalRate;
        }
        break;

      case "price_based":
        if (params.orderValue && rate.additionalRate) {
          const additionalAmount =
            params.orderValue - (rate.minOrderValue || 0);
          totalCost += additionalAmount * (rate.additionalRate / 100); // Assuming percentage
        }
        break;

      case "distance_based":
        if (params.distance && rate.distanceUnit && rate.additionalRate) {
          const additionalUnits = Math.ceil(
            (params.distance - (rate.minDistance || 0)) / rate.distanceUnit
          );
          totalCost += additionalUnits * rate.additionalRate;
        }
        break;

      case "item_based":
        console.log("[CostCalc] Item-based calculation:", {
          itemCount: params.itemCount,
          firstItemCount: rate.firstItemCount,
          additionalItemRate: rate.additionalItemRate,
          baseRate: rate.baseRate,
        });

        if (
          params.itemCount &&
          rate.firstItemCount &&
          rate.additionalItemRate
        ) {
          // For item-based rates, base rate is fixed regardless of item count
          // Additional charges only apply when item count exceeds firstItemCount
          const additionalItems = Math.max(
            0,
            params.itemCount - rate.firstItemCount
          );

          console.log("[CostCalc] Additional items:", additionalItems);

          // Base rate stays the same, only add charges for additional items
          totalCost =
            (Number(rate.baseRate) || 0) +
            additionalItems * rate.additionalItemRate;
          console.log("[CostCalc] Total cost calculated:", totalCost);
        } else {
          console.log(
            "[CostCalc] Missing required fields for item-based calculation"
          );
        }
        break;

      case "free":
        return 0;
    }

    // Add additional fees
    const handlingFee = Number(rate.handlingFee) || 0;
    const insuranceFee = Number(rate.insuranceFee) || 0;
    const signatureFee = Number(rate.signatureFee) || 0;

    totalCost += handlingFee + insuranceFee + signatureFee;
    console.log("[CostCalc] Final total cost:", totalCost, "Fees:", {
      handlingFee,
      insuranceFee,
      signatureFee,
    });

    return Math.max(0, totalCost);
  }

  private calculateCostBreakdown(
    rate: ShippingRate,
    params: {
      weight?: number;
      orderValue?: number;
      distance?: number;
      itemCount?: number;
    }
  ): {
    baseRate: number;
    additionalCost: number;
    handlingFee: number;
    insuranceFee: number;
    signatureFee: number;
  } {
    let additionalCost = 0;

    // Calculate additional costs based on rate type
    switch (rate.rateType) {
      case "weight_based":
        if (params.weight && rate.weightUnit && rate.additionalRate) {
          const additionalUnits = Math.ceil(
            (params.weight - (rate.minWeight || 0)) / rate.weightUnit
          );
          additionalCost = additionalUnits * rate.additionalRate;
        }
        break;

      case "price_based":
        if (params.orderValue && rate.additionalRate) {
          const additionalAmount =
            params.orderValue - (rate.minOrderValue || 0);
          additionalCost = additionalAmount * (rate.additionalRate / 100);
        }
        break;

      case "distance_based":
        if (params.distance && rate.distanceUnit && rate.additionalRate) {
          const additionalUnits = Math.ceil(
            (params.distance - (rate.minDistance || 0)) / rate.distanceUnit
          );
          additionalCost = additionalUnits * rate.additionalRate;
        }
        break;

      case "item_based":
        if (
          params.itemCount &&
          rate.firstItemCount &&
          rate.additionalItemRate
        ) {
          const additionalItems = Math.max(
            0,
            params.itemCount - rate.firstItemCount
          );
          additionalCost = additionalItems * rate.additionalItemRate;
        }
        break;
    }

    return {
      baseRate: Number(rate.baseRate),
      additionalCost,
      handlingFee: Number(rate.handlingFee) || 0,
      insuranceFee: Number(rate.insuranceFee) || 0,
      signatureFee: Number(rate.signatureFee) || 0,
    };
  }
}
