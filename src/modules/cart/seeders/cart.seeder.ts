import { BaseSeeder } from '../../../common/seeders/base.seeder';
import { Cart } from '../entities/cart.entity';

export class CartSeeder extends BaseSeeder {
  async run(): Promise<void> {
    const cartRepository = this.dataSource.getRepository(Cart);

    const carts = [
      {
        guestId: 'guest-123',
        userId: null,
        productId: '1', // This should be a valid product ID from your products table
        quantity: 2,
        price: 79.99,
        selectedAttributes: JSON.stringify({ color: 'red', size: 'M' }),
        isActive: true,
      },
      {
        guestId: 'guest-123',
        userId: null,
        productId: '2', // This should be a valid product ID from your products table
        quantity: 1,
        price: 129.99,
        selectedAttributes: JSON.stringify({ color: 'blue', size: 'L' }),
        isActive: true,
      },
      {
        guestId: null,
        userId: 'user-456',
        productId: '1', // This should be a valid product ID from your products table
        quantity: 3,
        price: 79.99,
        selectedAttributes: null,
        isActive: true,
      },
    ];

    await this.saveMany(carts, Cart);
  }
} 