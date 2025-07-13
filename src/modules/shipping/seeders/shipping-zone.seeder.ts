import { DataSource } from "typeorm";
import { BaseSeeder } from "../../../common/seeders/base.seeder";
import { ShippingZone, ZONE_TYPE } from "../shipping-zone.entity";

// All US state codes
const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

export class ShippingZoneSeeder extends BaseSeeder {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async run(): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      // Truncate shipping zones with CASCADE
      await queryRunner.query('TRUNCATE TABLE "shipping_zones" CASCADE');
      console.log("Truncated shipping zones with CASCADE");
    } finally {
      await queryRunner.release();
    }

    // Create the US zone
    const usZone = {
      name: "United States",
      slug: "us",
      description: "Covers all US states",
      zoneType: ZONE_TYPE.STATE,
      countries: ["US"],
      states: US_STATES,
      isActive: true,
      priority: 1,
    };

    const usZoneEntity = this.dataSource.getRepository(ShippingZone).create(usZone);
    await this.save(usZoneEntity, ShippingZone);
    console.log("US shipping zone seeded successfully");
  }
} 