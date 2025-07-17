import { BaseSeeder } from '../../../common/seeders/base.seeder';
import { Coupon, COUPON_TYPE } from '../../coupon/coupon.entity';

export class CouponSeeder extends BaseSeeder {
  async run(): Promise<void> {
    const couponRepository = this.dataSource.getRepository(Coupon);

    const coupons = [
      {
        code: 'WELCOME20',
        name: '20% Off Welcome Discount',
        description: 'Welcome new customers with 20% off their first order',
        type: COUPON_TYPE.PERCENTAGE,
        value: 20,
        minimumAmount: 50,
        maximumDiscount: 100,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        usageLimit: 1000,
        usageCount: 0,
        usageLimitPerUser: 1,
        isActive: true,
        applicableCategories: [],
        applicableProducts: []
      },
      {
        code: 'SAVE10',
        name: '$10 Off Orders Over $100',
        description: 'Save $10 on orders over $100',
        type: COUPON_TYPE.FIXED_AMOUNT,
        value: 10,
        minimumAmount: 100,
        maximumDiscount: null,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        usageLimit: 500,
        usageCount: 0,
        usageLimitPerUser: 5,
        isActive: true,
        applicableCategories: [],
        applicableProducts: []
      },
      {
        code: 'FREESHIP',
        name: 'Free Shipping',
        description: 'Free shipping on all orders',
        type: COUPON_TYPE.FREE_SHIPPING,
        value: 0,
        minimumAmount: 25,
        maximumDiscount: null,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        usageLimit: null,
        usageCount: 0,
        usageLimitPerUser: null,
        isActive: true,
        applicableCategories: [],
        applicableProducts: []
      },
      {
        code: 'SUMMER15',
        name: 'Summer Sale 15% Off',
        description: '15% off all summer items',
        type: COUPON_TYPE.PERCENTAGE,
        value: 15,
        minimumAmount: 30,
        maximumDiscount: 50,
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-08-31'),
        usageLimit: 200,
        usageCount: 0,
        usageLimitPerUser: 2,
        isActive: true,
        applicableCategories: [],
        applicableProducts: []
      }
    ];

    await this.saveMany(coupons, Coupon);
    console.log('Coupons seeded successfully');
  }
} 