import { DataSource } from "typeorm";
import { Address, ADDRESS_TYPE, ADDRESS_STATUS } from "./address.entity";
import { User } from "../user/user.entity";
import { BaseSeeder } from "../../common/seeders/base.seeder";

export class AddressSeeder extends BaseSeeder {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async run(): Promise<void> {
    const addressRepository = this.dataSource.getRepository(Address);
    const userRepository = this.dataSource.getRepository(User);

    // Get existing users
    const users = await userRepository.find({ take: 5 });

    if (users.length === 0) {
      console.log("No users found. Please run user seeder first.");
      return;
    }

    const addresses = [];

    for (const user of users) {
      // Create shipping addresses
      addresses.push(
        addressRepository.create({
          userId: user.id,
          type: ADDRESS_TYPE.SHIPPING,
          status: ADDRESS_STATUS.ACTIVE,
          firstName: user.firstName,
          lastName: user.lastName,
          email: `${user.firstName}${user.lastName}@gmail.com`,
          addressLine1: "123 Main Street",
          addressLine2: "Apt 4B",
          city: "New York",
          state: "NY",
          postalCode: "10001",
          country: "US",
          phone: "+1-555-0123",
          isDefault: true,
          notes: "Home address",
        })
      );

      addresses.push(
        addressRepository.create({
          userId: user.id,
          type: ADDRESS_TYPE.SHIPPING,
          status: ADDRESS_STATUS.ACTIVE,
          firstName: user.firstName,
          lastName: user.lastName,
          email: `${user.firstName}${user.lastName}@gmail.com`,
          company: "Work Office",
          addressLine1: "456 Business Ave",
          city: "New York",
          state: "NY",
          postalCode: "10002",
          country: "US",
          phone: "+1-555-0456",
          isDefault: false,
          notes: "Work address",
        })
      );

      // Create billing addresses
      addresses.push(
        addressRepository.create({
          userId: user.id,
          type: ADDRESS_TYPE.BILLING,
          status: ADDRESS_STATUS.ACTIVE,
          firstName: user.firstName,
          lastName: user.lastName,
          email: `${user.firstName}${user.lastName}@gmail.com`,
          addressLine1: "123 Main Street",
          addressLine2: "Apt 4B",
          city: "New York",
          state: "NY",
          postalCode: "10001",
          country: "US",
          phone: "+1-555-0123",
          isDefault: true,
          notes: "Primary billing address",
        })
      );

      // Create a "both" type address
      addresses.push(
        addressRepository.create({
          userId: user.id,
          type: ADDRESS_TYPE.BOTH,
          status: ADDRESS_STATUS.ACTIVE,
          email: `${user.firstName}${user.lastName}@gmail.com`,
          firstName: user.firstName,
          lastName: user.lastName,
          addressLine1: "789 Summer House",
          city: "Los Angeles",
          state: "CA",
          postalCode: "90210",
          country: "US",
          phone: "+1-555-0789",
          isDefault: false,
          notes: "Vacation home",
        })
      );
    }

    // Save all addresses
    await addressRepository.save(addresses);

    console.log(
      `✅ Seeded ${addresses.length} addresses for ${users.length} users`
    );
  }

  async clear(): Promise<void> {
    const addressRepository = this.dataSource.getRepository(Address);
    await addressRepository.clear();
    console.log("✅ Cleared all addresses");
  }
}
