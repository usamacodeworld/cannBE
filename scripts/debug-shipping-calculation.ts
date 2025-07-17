import { AppDataSource } from '../src/config/database';
import { ShippingMethod } from '../src/modules/shipping/shipping-method.entity';
import { ShippingRate } from '../src/modules/shipping/shipping-rate.entity';
import { ShippingZone } from '../src/modules/shipping/shipping-zone.entity';
import { ShippingMethodService } from '../src/modules/shipping/shipping-method.service';
import { ShippingRateService } from '../src/modules/shipping/shipping-rate.service';
import { ShippingIntegrationService } from '../src/modules/shipping/shipping-integration.service';

async function debugShippingCalculation() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connected successfully');

    // Get repositories
    const shippingMethodRepository = AppDataSource.getRepository(ShippingMethod);
    const shippingRateRepository = AppDataSource.getRepository(ShippingRate);
    const shippingZoneRepository = AppDataSource.getRepository(ShippingZone);

    // Check if we have data
    console.log('\n=== Checking Seeded Data ===');
    
    const zones = await shippingZoneRepository.find();
    console.log(`Zones found: ${zones.length}`);
    zones.forEach(zone => {
      console.log(`- Zone: ${zone.name} (${zone.slug}) - Countries: ${zone.countries?.join(', ')} - States: ${zone.states?.length || 0} states`);
    });

    const methods = await shippingMethodRepository.find({ relations: ['zone'] });
    console.log(`\nMethods found: ${methods.length}`);
    methods.forEach(method => {
      console.log(`- Method: ${method.name} (${method.slug}) - Active: ${method.isActive} - Zone: ${method.zone?.name || 'None'}`);
    });

    const rates = await shippingRateRepository.find({ relations: ['method'] });
    console.log(`\nRates found: ${rates.length}`);
    rates.forEach(rate => {
      console.log(`- Rate: ${rate.name} - Type: ${rate.rateType} - Active: ${rate.isActive} - Method: ${rate.method?.name || 'None'}`);
      console.log(`  Base Rate: $${rate.baseRate}, Additional Rate: $${rate.additionalRate}`);
      console.log(`  First Item Count: ${rate.firstItemCount}, Additional Item Rate: $${rate.additionalItemRate}`);
      console.log(`  Min Weight: ${rate.minWeight}, Max Weight: ${rate.maxWeight}`);
      console.log(`  Min Order Value: ${rate.minOrderValue}, Max Order Value: ${rate.maxOrderValue}`);
      console.log(`  Applies to all products: ${rate.appliesToAllProducts}`);
      console.log(`  Product IDs: ${rate.productIds?.join(', ') || 'None'}`);
      console.log(`  Category IDs: ${rate.categoryIds?.join(', ') || 'None'}`);
      console.log(`  Valid From: ${rate.validFrom}, Valid To: ${rate.validTo}`);
      console.log(`  Is Holiday Rate: ${rate.isHolidayRate}`);
      console.log(`  Additional Rate: ${rate.additionalRate}, Additional Item Rate: ${rate.additionalItemRate}`);
      console.log(`  Handling Fee: ${rate.handlingFee}, Insurance Fee: ${rate.insuranceFee}, Signature Fee: ${rate.signatureFee}`);
    });

    // Test shipping method service
    console.log('\n=== Testing Shipping Method Service ===');
    const methodService = new ShippingMethodService(shippingMethodRepository);
    const activeMethods = await methodService.getActiveMethods();
    console.log(`Active methods: ${activeMethods.length}`);
    activeMethods.forEach(method => {
      console.log(`- ${method.name} (${method.slug}) - Zone: ${method.zone?.name || 'None'}`);
    });

    // Test shipping rate service
    console.log('\n=== Testing Shipping Rate Service ===');
    const rateService = new ShippingRateService(shippingRateRepository);
    
    if (activeMethods.length > 0) {
      const firstMethod = activeMethods[0];
      console.log(`Testing rate calculation for method: ${firstMethod.name}`);
      
      // Get all rates for this method
      const methodRates = await shippingRateRepository.find({
        where: { methodId: firstMethod.id, isActive: true },
        relations: ["method"],
        order: { baseRate: "asc" },
      });
      
      console.log(`Found ${methodRates.length} active rates for method ${firstMethod.name}`);
      
      // Test each rate individually
      for (const rate of methodRates) {
        console.log(`\n--- Testing Rate: ${rate.name} ---`);
        
        // Manually test the rate matching logic
        const params = {
          weight: 1.5,
          orderValue: 129.99,
          itemCount: 1,
          productIds: ['5052b39f-1582-4c37-b7ad-8cb41b355003'],
          categoryIds: [] as string[],
          isHoliday: false
        };
        
        console.log('Rate params:', params);
        console.log('Rate config:', {
          validFrom: rate.validFrom,
          validTo: rate.validTo,
          isHolidayRate: rate.isHolidayRate,
          appliesToAllProducts: rate.appliesToAllProducts,
          productIds: rate.productIds || [],
          categoryIds: rate.categoryIds || [],
          minWeight: rate.minWeight,
          maxWeight: rate.maxWeight,
          minOrderValue: rate.minOrderValue,
          maxOrderValue: rate.maxOrderValue,
          minDistance: rate.minDistance,
          maxDistance: rate.maxDistance
        });
        
        // Test validity
        const now = new Date();
        if (rate.validFrom && now < rate.validFrom) {
          console.log('❌ Rate not valid yet (validFrom)');
          continue;
        }
        if (rate.validTo && now > rate.validTo) {
          console.log('❌ Rate expired (validTo)');
          continue;
        }
        
        // Test holiday
        if (rate.isHolidayRate && !params.isHoliday) {
          console.log('❌ Holiday rate but not holiday');
          continue;
        }
        
        // Test product matching
        if (params.productIds && params.productIds.length > 0) {
          if (rate.appliesToAllProducts) {
            console.log('✅ Applies to all products');
          } else if (rate.productIds && rate.productIds.some(id => params.productIds!.includes(id))) {
            console.log('✅ Product ID match');
          } else if (rate.categoryIds && params.categoryIds && rate.categoryIds.some(id => params.categoryIds.includes(id))) {
            console.log('✅ Category ID match');
          } else {
            console.log('❌ No product/category match');
            continue;
          }
        }
        
        // Test weight constraints
        if (params.weight !== undefined && rate.minWeight !== undefined && rate.maxWeight !== undefined) {
          if (params.weight >= rate.minWeight && params.weight <= rate.maxWeight) {
            console.log('✅ Weight within range');
          } else {
            console.log('❌ Weight outside range');
            continue;
          }
        } else if (rate.minWeight !== undefined || rate.maxWeight !== undefined) {
          console.log('❌ Rate has weight constraints but params missing weight');
          continue;
        }
        
        // Test order value constraints
        if (params.orderValue !== undefined && rate.minOrderValue !== undefined && rate.maxOrderValue !== undefined) {
          if (params.orderValue >= rate.minOrderValue && params.orderValue <= rate.maxOrderValue) {
            console.log('✅ Order value within range');
          } else {
            console.log('❌ Order value outside range');
            continue;
          }
        } else if (rate.minOrderValue !== undefined || rate.maxOrderValue !== undefined) {
          console.log('❌ Rate has order value constraints but params missing order value');
          continue;
        }
        
        console.log('✅ Rate passed all checks!');
        
        // Calculate cost
        const calculation = await rateService.calculateShippingCost({
          methodId: firstMethod.id,
          weight: 1.5,
          orderValue: 129.99,
          itemCount: 1,
          productIds: ['5052b39f-1582-4c37-b7ad-8cb41b355003'],
          categoryIds: [],
          isHoliday: false
        });

        if (calculation) {
          console.log('✅ Rate calculation successful:');
          console.log(`- Total cost: $${calculation.totalCost}`);
          console.log(`- Base rate: $${calculation.breakdown.baseRate}`);
          console.log(`- Additional cost: $${calculation.breakdown.additionalCost}`);
        } else {
          console.log('❌ No rate calculation found');
        }
      }
    }

    // Test shipping integration service
    console.log('\n=== Testing Shipping Integration Service ===');
    const integrationService = new ShippingIntegrationService(
      AppDataSource,
      rateService,
      methodService
    );

    const request = {
      items: [
        {
          id: "a6a48e77-c117-4c52-bf19-ec2c21ef830c",
          productId: "5052b39f-1582-4c37-b7ad-8cb41b355003",
          quantity: 1,
          price: 129.99,
          weight: 0,
          categoryIds: []
        }
      ],
      shippingAddress: {
        country: "US",
        state: "FL",
        city: "Wildwood",
        postalCode: "63040"
      },
      orderValue: 129.99,
      isHoliday: false
    };

    const options = await integrationService.calculateShippingOptions(request);
    console.log(`Shipping options found: ${options.length}`);
    options.forEach(option => {
      console.log(`- ${option.methodName}: $${option.totalCost}`);
    });

    await AppDataSource.destroy();
    console.log('\n✅ Debug completed');

  } catch (error) {
    console.error('❌ Error during debug:', error);
    await AppDataSource.destroy();
  }
}

debugShippingCalculation(); 