import { DataSource } from 'typeorm';
import { Seller, SELLER_STATUS, SELLER_VERIFICATION_STATUS } from '../entities/seller.entity';
import { User } from '../../user/user.entity';
import { BaseSeeder } from '../../../common/seeders/base.seeder';

export class SellerSeeder extends BaseSeeder {
  // Store created seller IDs for use in product seeder
  static createdSellerIds: string[] = [];

  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async run(): Promise<void> {
    const sellerRepository = this.dataSource.getRepository(Seller);
    const userRepository = this.dataSource.getRepository(User);

    // Check if sellers already exist
    const existingSellers = await sellerRepository.count();
    if (existingSellers > 0) {
      console.log('Sellers already exist, skipping seeder');
      return;
    }

    // Get or create test users
    const testUsers = await userRepository.find({
      where: { type: 'buyer' },
      take: 5
    });

    if (testUsers.length === 0) {
      console.log('No test users found, creating sellers without users');
      return;
    }

    const sellersData = [
      {
        userId: testUsers[0]?.id,
        businessName: 'Green Valley Farms',
        businessDescription: 'Premium cannabis products from sustainable farming practices',
        businessPhone: '+1-555-0101',
        businessEmail: 'contact@greenvalleyfarms.com',
        businessWebsite: 'https://greenvalleyfarms.com',
        businessAddress: '123 Farm Road',
        businessCity: 'Denver',
        businessState: 'CO',
        businessPostalCode: '80202',
        businessCountry: 'USA',
        taxId: 'TAX123456789',
        licenseNumber: 'LIC001',
        licenseExpiryDate: new Date('2025-12-31'),
        status: SELLER_STATUS.APPROVED,
        verificationStatus: SELLER_VERIFICATION_STATUS.VERIFIED,
        commissionRate: 10.0,
        payoutMethod: 'bank_transfer',
        payoutDetails: JSON.stringify({
          bankName: 'First National Bank',
          accountNumber: '****1234',
          routingNumber: '123456789'
        })
      },
      {
        userId: testUsers[1]?.id,
        businessName: 'Organic Cannabis Co.',
        businessDescription: '100% organic cannabis products for health-conscious consumers',
        businessPhone: '+1-555-0102',
        businessEmail: 'info@organiccannabis.com',
        businessWebsite: 'https://organiccannabis.com',
        businessAddress: '456 Organic Street',
        businessCity: 'Portland',
        businessState: 'OR',
        businessPostalCode: '97201',
        businessCountry: 'USA',
        taxId: 'TAX987654321',
        licenseNumber: 'LIC002',
        licenseExpiryDate: new Date('2025-06-30'),
        status: SELLER_STATUS.PENDING,
        verificationStatus: SELLER_VERIFICATION_STATUS.PENDING,
        commissionRate: 12.0,
        payoutMethod: 'paypal',
        payoutDetails: JSON.stringify({
          paypalEmail: 'payments@organiccannabis.com'
        })
      },
      {
        userId: testUsers[2]?.id,
        businessName: 'CBD Wellness Solutions',
        businessDescription: 'Premium CBD products for wellness and therapeutic use',
        businessPhone: '+1-555-0103',
        businessEmail: 'hello@cbdwellness.com',
        businessWebsite: 'https://cbdwellness.com',
        businessAddress: '789 Wellness Blvd',
        businessCity: 'Seattle',
        businessState: 'WA',
        businessPostalCode: '98101',
        businessCountry: 'USA',
        taxId: 'TAX456789123',
        licenseNumber: 'LIC003',
        licenseExpiryDate: new Date('2025-09-15'),
        status: SELLER_STATUS.APPROVED,
        verificationStatus: SELLER_VERIFICATION_STATUS.VERIFIED,
        commissionRate: 8.5,
        payoutMethod: 'stripe',
        payoutDetails: JSON.stringify({
          stripeAccountId: 'acct_stripe123'
        })
      }
    ];

    for (const sellerData of sellersData) {
      if (sellerData.userId) {
        const seller = sellerRepository.create(sellerData);
        const savedSeller = await sellerRepository.save(seller);
        SellerSeeder.createdSellerIds.push(savedSeller.id);

        // Update user type to seller
        const user = await userRepository.findOne({
          where: { id: sellerData.userId }
        });
        if (user) {
          user.type = 'seller';
          await userRepository.save(user);
        }
      }
    }

    console.log(`✅ Created ${sellersData.length} sellers`);
  }
} 