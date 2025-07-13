import { DataSource } from "typeorm";
import { BaseSeeder } from "../../../common/seeders/base.seeder";
import { ShippingMethod, METHOD_TYPE, CARRIER_TYPE } from "../shipping-method.entity";
import { ShippingZone } from "../shipping-zone.entity";

export class ShippingMethodSeeder extends BaseSeeder {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async run(): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      // Truncate shipping methods with CASCADE
      await queryRunner.query('TRUNCATE TABLE "shipping_methods" CASCADE');
      console.log("Truncated shipping methods with CASCADE");
    } finally {
      await queryRunner.release();
    }

    // Get the US shipping zone
    const shippingZoneRepository = this.dataSource.getRepository(ShippingZone);
    const usZone = await shippingZoneRepository.findOne({
      where: { slug: "us" }
    });

    if (!usZone) {
      throw new Error("US shipping zone not found. Please run shipping zone seeder first.");
    }

    // Create flat rate shipping method
    const flatRateMethod = {
      name: "Standard Flat Rate",
      slug: "standard-flat-rate",
      description: "Standard flat rate shipping for all US orders",
      methodType: METHOD_TYPE.FLAT_RATE,
      carrierType: CARRIER_TYPE.STANDARD,
      zoneId: usZone.id,
      isActive: true,
      priority: 1,
      estimatedDays: 5,
      isDefault: true,
      requiresSignature: false,
      isInsured: false,
    };

    const flatRateMethodEntity = this.dataSource.getRepository(ShippingMethod).create(flatRateMethod);
    await this.save(flatRateMethodEntity, ShippingMethod);
    console.log("Standard flat rate shipping method seeded successfully");
  }
} 