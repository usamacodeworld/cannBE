import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api/v1';

async function testMinimalProduct() {
  try {
    console.log('🚀 Testing Minimal Product Creation (Name Only)...\n');

    // Login to get authentication token
    console.log('🔐 Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@example.com',
      password: 'password123',
      userType: 'admin'
    });

    const token = loginResponse.data.data.accessToken;
    console.log('✅ Login successful');

    // Test 1: Minimal product with only name
    console.log('\n📤 Test 1: Creating product with only name...');
    try {
      const minimalProduct = {
        name: 'Minimal Test Product'
      };

      const response = await axios.post(`${BASE_URL}/products`, minimalProduct, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Minimal product created successfully!');
      console.log('Product ID:', response.data.data.id);
      console.log('Name:', response.data.data.name);
      console.log('Slug:', response.data.data.slug);
      console.log('Categories:', response.data.data.categories.length);
      console.log('Variants:', response.data.data.variants.length);
    } catch (error: any) {
      console.log('❌ Minimal product creation failed:', error.response?.data?.message || error.message);
    }

    // Test 2: Product with name and optional fields
    console.log('\n📤 Test 2: Creating product with name and some optional fields...');
    try {
      const productWithOptions = {
        name: 'Product with Options',
        shortDescription: 'This is a test product with some optional fields',
        tags: ['test', 'optional'],
        regularPrice: 99.99,
        salePrice: 79.99
      };

      const response = await axios.post(`${BASE_URL}/products`, productWithOptions, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Product with options created successfully!');
      console.log('Product ID:', response.data.data.id);
      console.log('Name:', response.data.data.name);
      console.log('Price:', response.data.data.regularPrice);
      console.log('Sale Price:', response.data.data.salePrice);
      console.log('Tags:', response.data.data.tags);
    } catch (error: any) {
      console.log('❌ Product with options creation failed:', error.response?.data?.message || error.message);
    }

    // Test 3: Product with name and minimal variants
    console.log('\n📤 Test 3: Creating product with name and minimal variants...');
    try {
      const productWithVariants = {
        name: 'Product with Variants',
        variations: [
          {
            // No fields provided - should use defaults
          },
          {
            variant: 'Custom Variant',
            price: 50.00
            // Missing SKU and quantity - should use defaults
          }
        ]
      };

      const response = await axios.post(`${BASE_URL}/products`, productWithVariants, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Product with variants created successfully!');
      console.log('Product ID:', response.data.data.id);
      console.log('Name:', response.data.data.name);
      console.log('Variants:', response.data.data.variants.length);
      response.data.data.variants.forEach((variant: any, index: number) => {
        console.log(`  Variant ${index + 1}:`, {
          variant: variant.variant,
          sku: variant.sku,
          price: variant.price,
          quantity: variant.quantity
        });
      });
    } catch (error: any) {
      console.log('❌ Product with variants creation failed:', error.response?.data?.message || error.message);
    }

    // Test 4: Product with name and categories
    console.log('\n📤 Test 4: Creating product with name and categories...');
    try {
      // First get some categories
      const categoriesResponse = await axios.get(`${BASE_URL}/categories/all`);
      const categoryIds = categoriesResponse.data.data.slice(0, 2).map((cat: any) => cat.id);
      
      const productWithCategories = {
        name: 'Product with Categories',
        categoryIds: categoryIds
      };

      const response = await axios.post(`${BASE_URL}/products`, productWithCategories, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Product with categories created successfully!');
      console.log('Product ID:', response.data.data.id);
      console.log('Name:', response.data.data.name);
      console.log('Categories:', response.data.data.categories.map((cat: any) => cat.name).join(', '));
    } catch (error: any) {
      console.log('❌ Product with categories creation failed:', error.response?.data?.message || error.message);
    }

    console.log('\n🎉 Minimal product tests completed!');

  } catch (error: any) {
    console.error('❌ Error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 Tip: Make sure you have valid authentication credentials');
      console.log('You may need to create a user account first or update the login credentials in the script');
    }
  }
}

if (require.main === module) {
  testMinimalProduct();
}

export { testMinimalProduct }; 