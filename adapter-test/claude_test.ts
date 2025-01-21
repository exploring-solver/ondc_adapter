// index.ts
import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";
import { 
  BuyerPayload, 
  SellerPayload, 
  ONDCContext,
  PayloadTransformer,
  WooCommerceConfig
} from "./types";

class ONDCWooCommerceSDK {
  private woocommerce: WooCommerceRestApi;
  private transformer: PayloadTransformer;
  private context: ONDCContext;

  constructor(config: WooCommerceConfig, context: ONDCContext) {
    this.woocommerce = new WooCommerceRestApi({
      url: config.url,
      consumerKey: config.consumerKey,
      consumerSecret: config.consumerSecret,
      version: "wc/v3"
    });
    this.context = context;
    this.transformer = new PayloadTransformer();
  }

  // Buyer App Methods
  async search(buyerPayload: BuyerPayload) {
    try {
      // Transform ONDC search payload to WooCommerce format
      const wooQuery = this.transformer.buyerToWooCommerce(buyerPayload);
      
      // Search products in WooCommerce
      const response = await this.woocommerce.get("products", wooQuery);
      
      // Transform WooCommerce response to ONDC format
      return this.transformer.wooCommerceToBuyer(response.data);
    } catch (error) {
      throw new Error(Search failed: ${error.message});
    }
  }

  // Seller App Methods
  async listProducts(sellerPayload: SellerPayload) {
    try {
      // Transform ONDC catalog payload to WooCommerce format
      const wooProduct = this.transformer.sellerToWooCommerce(sellerPayload);
      
      // Create/Update products in WooCommerce
      const response = await this.woocommerce.post("products", wooProduct);
      
      // Transform WooCommerce response to ONDC format
      return this.transformer.wooCommerceToSeller(response.data);
    } catch (error) {
      throw new Error(Product listing failed: ${error.message});
    }
  }

  // Order Management
  async createOrder(orderPayload: any) {
    try {
      const wooOrder = this.transformer.orderToWooCommerce(orderPayload);
      const response = await this.woocommerce.post("orders", wooOrder);
      return this.transformer.wooCommerceToOrder(response.data);
    } catch (error) {
      throw new Error(Order creation failed: ${error.message});
    }
  }

  // Logistics Integration
  async updateShipment(shipmentPayload: any) {
    try {
      const wooShipment = this.transformer.shipmentToWooCommerce(shipmentPayload);
      const response = await this.woocommerce.put(orders/${shipmentPayload.orderId}, wooShipment);
      return this.transformer.wooCommerceToShipment(response.data);
    } catch (error) {
      throw new Error(Shipment update failed: ${error.message});
    }
  }
}

// types.ts
export interface WooCommerceConfig {
  url: string;
  consumerKey: string;
  consumerSecret: string;
}

export interface ONDCContext {
  domain: string;
  country: string;
  city: string;
  action: string;
  coreVersion: string;
  messageId: string;
}

export interface BuyerPayload {
  product: string;
  location: {
    city: string;
    pincode: string;
  };
  quantity: number;
}

export interface SellerPayload {
  item: string;
  delivery_area: string;
  units_required: number;
}

// transformer.ts
export class PayloadTransformer {
  buyerToWooCommerce(buyerPayload: BuyerPayload) {
    return {
      search: buyerPayload.product,
      per_page: 20,
      meta_query: [
        {
          key: '_stock',
          value: buyerPayload.quantity,
          compare: '>=',
          type: 'NUMERIC'
        }
      ]
    };
  }

  wooCommerceToBuyer(wooProducts: any[]) {
    return wooProducts.map(product => ({
      id: product.id,
      name: product.name,
      price: product.price,
      stock_quantity: product.stock_quantity,
      description: product.description,
      images: product.images
    }));
  }

  sellerToWooCommerce(sellerPayload: SellerPayload) {
    return {
      name: sellerPayload.item,
      type: 'simple',
      regular_price: '0',
      stock_quantity: sellerPayload.units_required,
      manage_stock: true,
      meta_data: [
        {
          key: 'delivery_area',
          value: sellerPayload.delivery_area
        }
      ]
    };
  }

  wooCommerceToSeller(wooProduct: any) {
    return {
      item: wooProduct.name,
      stock: wooProduct.stock_quantity,
      id: wooProduct.id
    };
  }

  orderToWooCommerce(orderPayload: any) {
    // Transform ONDC order format to WooCommerce order
    return {
      payment_method: orderPayload.payment.type,
      payment_method_title: orderPayload.payment.method,
      set_paid: true,
      billing: orderPayload.billing,
      shipping: orderPayload.shipping,
      line_items: orderPayload.items.map((item: any) => ({
        product_id: item.id,
        quantity: item.quantity
      }))
    };
  }

  wooCommerceToOrder(wooOrder: any) {
    // Transform WooCommerce order to ONDC format
    return {
      order_id: wooOrder.id,
      status: wooOrder.status,
      total: wooOrder.total,
      items: wooOrder.line_items,
      shipping_details: wooOrder.shipping
    };
  }
}

export default ONDCWooCommerceSDK;