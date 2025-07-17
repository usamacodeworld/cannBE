import { DataSource } from "typeorm";
import { BaseSeeder } from "../../../common/seeders/base.seeder";
import { ShippingRate, RATE_TYPE } from "../shipping-rate.entity";
import { ShippingMethod } from "../shipping-method.entity";

export class ShippingRateSeeder extends BaseSeeder {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async run(): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      // Truncate shipping rates with CASCADE
      await queryRunner.query('TRUNCATE TABLE "shipping_rates" CASCADE');
      console.log("Truncated shipping rates with CASCADE");
    } finally {
      await queryRunner.release();
    }

    // Get the flat rate shipping method
    const shippingMethodRepository = this.dataSource.getRepository(ShippingMethod);
    const flatRateMethod = await shippingMethodRepository.findOne({
      where: { slug: "standard-flat-rate" }
    });

    if (!flatRateMethod) {
      throw new Error("Standard flat rate shipping method not found. Please run shipping method seeder first.");
    }

    // Create item-based shipping rate
    const itemBasedRate = {
      methodId: flatRateMethod.id,
      rateType: RATE_TYPE.ITEM_BASED,
      baseRate: 4.99, // Base rate for first 3 items
      additionalRate: 1.99, // Rate for each additional item
      firstItemCount: 3, // First 3 items at base rate
      additionalItemRate: 1.99, // Each additional item costs $1.99
      isActive: true,
      priority: 1,
      name: "Standard Item-Based Rate",
      description: "First 3 items at $4.99, each additional item at $1.99",
      isFreeShipping: false,
      appliesToAllProducts: true,
      handlingFee: 0,
      insuranceFee: 0,
      signatureFee: 0,
    };

    const itemBasedRateEntity = this.dataSource.getRepository(ShippingRate).create(itemBasedRate);
    await this.save(itemBasedRateEntity, ShippingRate);
    console.log("Item-based shipping rate seeded successfully");
  }
} 