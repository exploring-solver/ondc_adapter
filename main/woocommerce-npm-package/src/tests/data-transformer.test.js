const DataTransformerService = require('../services/data-transformer.service');

// Configuration for the transformer
const config = {
  providerId: 'P1',
  locationId: 'L1',
  subscriberId: 'buyerNP.com',
  subscriberUrl: 'https://buyerNP.com/ondc',
  providerUrl: 'https://sellerNP.com/ondc',
  domain: 'ONDC:RET10',
  city: 'std:080'
};

// Mock WooCommerce order data
const mockWooCommerceOrder = {
  payment_method: "bacs",
  payment_method_title: "Direct Bank Transfer",
  set_paid: true,
  billing: {
    first_name: "John",
    last_name: "Doe",
    address_1: "969 Market",
    address_2: "Floor 3",
    city: "Bengaluru",
    state: "Karnataka",
    postcode: "560037",
    country: "IND",
    email: "john.doe@example.com",
    phone: "9886098860"
  },
  shipping: {
    first_name: "John",
    last_name: "Doe",
    address_1: "969 Market",
    address_2: "Floor 3",
    city: "Bengaluru",
    state: "Karnataka",
    postcode: "560037",
    country: "IND",
    phone: "9886098860"
  },
  line_items: [
    {
      product_id: 93,
      quantity: 2
    },
    {
      product_id: 22,
      variation_id: 23,
      quantity: 1
    }
  ],
  shipping_lines: [
    {
      method_id: "flat_rate",
      method_title: "Flat Rate",
      total: "10.00"
    }
  ],
  coupon_lines: [
    {
      code: "BUY2GET3"
    }
  ]
};

// Mock ONDC order data
const mockONDCOrder = {
  context: {
    domain: "ONDC:RET10",
    action: "init",
    core_version: "1.2.0",
    bap_id: "buyerNP.com",
    bap_uri: "https://buyerNP.com/ondc",
    bpp_id: "sellerNP.com",
    bpp_uri: "https://sellerNP.com/ondc",
    transaction_id: "T2",
    message_id: "M3",
    city: "std:080",
    country: "IND",
    timestamp: "2023-06-03T09:00:00.000Z",
    ttl: "PT30S"
  },
  message: {
    order: {
      provider: {
        id: "P1",
        locations: [
          {
            id: "L1"
          }
        ]
      },
      items: [
        {
          id: "I1",
          fulfillment_id: "F1",
          quantity: {
            count: 2
          }
        }
      ],
      offers: [
        {
          id: "BUY2GET3"
        }
      ],
      billing: {
        name: "ONDC buyer",
        address: {
          name: "my house or door or floor #",
          building: "my building name or house #",
          locality: "my street name",
          city: "Bengaluru",
          state: "Karnataka",
          country: "IND",
          area_code: "560037"
        },
        tax_number: "XXXXXXXXXXXXXXX",
        email: "nobody@nomail.com",
        phone: "9886098860",
        created_at: "2023-06-03T09:00:00.000Z",
        updated_at: "2023-06-03T09:00:00.000Z"
      },
      fulfillments: [
        {
          id: "F1",
          type: "Delivery",
          end: {
            location: {
              gps: "12.453544,77.928379",
              address: {
                name: "my house or door or floor #",
                building: "my building name or house #",
                locality: "my street name",
                city: "Bengaluru",
                state: "Karnataka",
                country: "IND",
                area_code: "560037"
              }
            },
            contact: {
              phone: "9886098860"
            }
          }
        }
      ]
    }
  }
};

// Test the transformations
function runTransformationTest() {
  const transformer = new DataTransformerService(config);

  console.log('\n=== Testing WooCommerce to ONDC Transformation ===\n');
  console.log('Input WooCommerce Order:');
  console.log(JSON.stringify(mockWooCommerceOrder, null, 2));
  
  const ondcTransformed = transformer.wooCommerceToONDC(mockWooCommerceOrder);
  console.log('\nTransformed to ONDC Format:');
  console.log(JSON.stringify(ondcTransformed, null, 2));

  console.log('\n=== Testing ONDC to WooCommerce Transformation ===\n');
  console.log('Input ONDC Order:');
  console.log(JSON.stringify(mockONDCOrder, null, 2));
  
  const wcTransformed = transformer.ondcToWooCommerce(mockONDCOrder.message.order);
  console.log('\nTransformed to WooCommerce Format:');
  console.log(JSON.stringify(wcTransformed, null, 2));
}

// Run the test
runTransformationTest();

// Export for use in other tests
module.exports = {
  mockWooCommerceOrder,
  mockONDCOrder
}; 