class DataTransformerService {
  constructor(config) {
    this.config = config;
  }

  wooCommerceToONDC(wcOrder) {
    return {
      context: this.createContext(),
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
          items: this.transformLineItems(wcOrder.line_items),
          billing: this.transformBillingAddress(wcOrder.billing),
          fulfillments: this.transformShipping(wcOrder.shipping, wcOrder.shipping_lines),
          ...(wcOrder.coupon_lines && {
            offers: this.transformOffers(wcOrder.coupon_lines)
          })
        }
      }
    };
  }

  ondcToWooCommerce(ondcOrder) {
    return {
      payment_method: this.mapPaymentMethod(ondcOrder.payment),
      payment_method_title: "ONDC Payment",
      set_paid: false, // Will be updated based on payment status
      billing: this.transformONDCBilling(ondcOrder.billing),
      shipping: this.transformONDCShipping(ondcOrder.fulfillments),
      line_items: this.transformONDCItems(ondcOrder.items),
      shipping_lines: this.transformONDCFulfillment(ondcOrder.fulfillments),
      meta_data: [
        {
          key: 'ondc_order_id',
          value: ondcOrder.id
        },
        {
          key: 'ondc_transaction_id',
          value: ondcOrder.context?.transaction_id
        }
      ]
    };
  }

  createContext() {
    return {
      domain: this.config.domain || "ONDC:RET10",
      action: "init",
      core_version: "1.2.0",
      bap_id: this.config.subscriberId,
      bap_uri: this.config.subscriberUrl,
      bpp_id: this.config.providerId,
      bpp_uri: this.config.providerUrl,
      transaction_id: this.generateUUID(),
      message_id: this.generateUUID(),
      city: this.config.city || "std:080",
      country: "IND",
      timestamp: new Date().toISOString(),
      ttl: "PT30S"
    };
  }

  transformLineItems(lineItems) {
    return lineItems.map(item => ({
      id: item.product_id.toString(),
      fulfillment_id: "F1", // Default fulfillment ID
      quantity: {
        count: item.quantity
      },
      ...(item.variation_id && {
        parent_item_id: item.product_id.toString(),
        tags: [
          {
            code: "type",
            list: [
              {
                code: "type",
                value: "customization"
              }
            ]
          }
        ]
      })
    }));
  }

  transformBillingAddress(billing) {
    return {
      name: `${billing.first_name} ${billing.last_name}`,
      address: {
        name: billing.address_1,
        building: billing.address_2 || billing.address_1,
        locality: billing.city,
        city: billing.city,
        state: billing.state,
        country: billing.country,
        area_code: billing.postcode
      },
      email: billing.email,
      phone: billing.phone,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  transformShipping(shipping, shippingLines) {
    return [{
      id: "F1",
      type: "Delivery",
      end: {
        location: {
          gps: shipping.gps || "", // Would need to be added to WC data
          address: {
            name: shipping.address_1,
            building: shipping.address_2 || shipping.address_1,
            locality: shipping.city,
            city: shipping.city,
            state: shipping.state,
            country: shipping.country,
            area_code: shipping.postcode
          }
        },
        contact: {
          phone: shipping.phone || ""
        }
      },
      tags: [
        {
          code: "shipping_method",
          list: shippingLines.map(line => ({
            code: line.method_id,
            value: line.method_title
          }))
        }
      ]
    }];
  }

  transformOffers(couponLines) {
    return couponLines.map(coupon => ({
      id: coupon.code
    }));
  }

  transformONDCBilling(ondcBilling) {
    const names = ondcBilling.name.split(' ');
    return {
      first_name: names[0],
      last_name: names.slice(1).join(' '),
      address_1: ondcBilling.address.name,
      address_2: ondcBilling.address.building,
      city: ondcBilling.address.city,
      state: ondcBilling.address.state,
      postcode: ondcBilling.address.area_code,
      country: ondcBilling.address.country,
      email: ondcBilling.email,
      phone: ondcBilling.phone
    };
  }

  transformONDCItems(ondcItems) {
    return ondcItems.map(item => ({
      product_id: parseInt(item.id),
      quantity: item.quantity.count,
      ...(item.parent_item_id && {
        variation_id: parseInt(item.id)
      })
    }));
  }

  transformONDCFulfillment(fulfillments) {
    return fulfillments.map(fulfillment => ({
      method_id: "flat_rate", // Default to flat rate
      method_title: fulfillment.type,
      total: "0.00" // Would need to be calculated based on actual shipping cost
    }));
  }

  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  mapPaymentMethod(ondcPayment) {
    // Map ONDC payment methods to WooCommerce payment methods
    const paymentMethodMap = {
      'PRE-FULFILLMENT': 'bacs',
      'POST-FULFILLMENT': 'cod',
      // Add more mappings as needed
    };
    return paymentMethodMap[ondcPayment?.type] || 'bacs';
  }
}

module.exports = DataTransformerService; 