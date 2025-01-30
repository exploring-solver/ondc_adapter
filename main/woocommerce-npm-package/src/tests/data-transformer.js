// Data Transformer Service class definition
class DataTransformerService {
    constructor(config) {
      this.config = config;
    }
  
    wooCommerceToONDC(wcOrder) {
      // Generate unique IDs
      const transactionId = 'T' + Math.random().toString(36).substr(2, 9);
      const messageId = 'M' + Math.random().toString(36).substr(2, 9);
      
      return {
        context: {
          domain: this.config.domain,
          action: "init",
          core_version: "1.2.0",
          bap_id: this.config.subscriberId,
          bap_uri: this.config.subscriberUrl,
          bpp_id: this.config.providerId,
          bpp_uri: this.config.providerUrl,
          transaction_id: transactionId,
          message_id: messageId,
          city: this.config.city,
          country: wcOrder.billing.country,
          timestamp: new Date().toISOString(),
          ttl: "PT30S"
        },
        message: {
          order: {
            provider: {
              id: this.config.providerId,
              locations: [
                {
                  id: this.config.locationId
                }
              ]
            },
            items: wcOrder.line_items.map((item, index) => ({
              id: `I${index + 1}`,
              fulfillment_id: "F1",
              quantity: {
                count: item.quantity
              }
            })),
            offers: wcOrder.coupon_lines?.map(coupon => ({
              id: coupon.code
            })) || [],
            billing: {
              name: `${wcOrder.billing.first_name} ${wcOrder.billing.last_name}`,
              address: {
                name: wcOrder.billing.address_2,
                building: wcOrder.billing.address_1,
                locality: wcOrder.billing.city,
                city: wcOrder.billing.city,
                state: wcOrder.billing.state,
                country: wcOrder.billing.country,
                area_code: wcOrder.billing.postcode
              },
              email: wcOrder.billing.email,
              phone: wcOrder.billing.phone,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            fulfillments: [
              {
                id: "F1",
                type: "Delivery",
                end: {
                  location: {
                    gps: "12.453544,77.928379", // Example GPS coordinates
                    address: {
                      name: wcOrder.shipping.address_2,
                      building: wcOrder.shipping.address_1,
                      locality: wcOrder.shipping.city,
                      city: wcOrder.shipping.city,
                      state: wcOrder.shipping.state,
                      country: wcOrder.shipping.country,
                      area_code: wcOrder.shipping.postcode
                    }
                  },
                  contact: {
                    phone: wcOrder.shipping.phone
                  }
                }
              }
            ]
          }
        }
      };
    }
  
    ondcToWooCommerce(ondcOrder) {
      return {
        payment_method: "bacs",
        payment_method_title: "Direct Bank Transfer",
        set_paid: true,
        billing: {
          first_name: ondcOrder.billing.name.split(' ')[0],
          last_name: ondcOrder.billing.name.split(' ').slice(1).join(' '),
          address_1: ondcOrder.billing.address.building,
          address_2: ondcOrder.billing.address.name,
          city: ondcOrder.billing.address.city,
          state: ondcOrder.billing.address.state,
          postcode: ondcOrder.billing.address.area_code,
          country: ondcOrder.billing.address.country,
          email: ondcOrder.billing.email,
          phone: ondcOrder.billing.phone
        },
        shipping: {
          first_name: ondcOrder.billing.name.split(' ')[0],
          last_name: ondcOrder.billing.name.split(' ').slice(1).join(' '),
          address_1: ondcOrder.fulfillments[0].end.location.address.building,
          address_2: ondcOrder.fulfillments[0].end.location.address.name,
          city: ondcOrder.fulfillments[0].end.location.address.city,
          state: ondcOrder.fulfillments[0].end.location.address.state,
          postcode: ondcOrder.fulfillments[0].end.location.address.area_code,
          country: ondcOrder.fulfillments[0].end.location.address.country,
          phone: ondcOrder.fulfillments[0].end.contact.phone
        },
        line_items: ondcOrder.items.map(item => ({
          product_id: parseInt(item.id.replace('I', '')),
          quantity: item.quantity.count
        })),
        shipping_lines: [
          {
            method_id: "flat_rate",
            method_title: "Flat Rate",
            total: "10.00"
          }
        ],
        coupon_lines: ondcOrder.offers?.map(offer => ({
          code: offer.id
        })) || []
      };
    }
  }
  
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
  
  // Run the transformations
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
    const mockONDCOrder = ondcTransformed; // Use the transformed order as input
    console.log(JSON.stringify(mockONDCOrder, null, 2));
    
    const wcTransformed = transformer.ondcToWooCommerce(mockONDCOrder.message.order);
    console.log('\nTransformed to WooCommerce Format:');
    console.log(JSON.stringify(wcTransformed, null, 2));
  }
  
  // Run the test
  runTransformationTest();