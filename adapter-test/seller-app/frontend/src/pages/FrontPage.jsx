import { Architecture, Security, Api, ShoppingCart } from '@mui/icons-material';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import CodeEditor from '../components/CodeEditor'
import { ExternalLink, Package, Video, ShoppingBag, Store } from 'lucide-react';
import { FormControl } from '@mui/material';
const FrontPage = () => {
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    cssEase: "linear",
    arrows: true,
    adaptiveHeight: true,
    className: "center",
    centerMode: true,
    centerPadding: "0px"
  };

  const diagrams = [
    {
      image: 'diagram2.png',
      title: "System Architecture",
      description: "ONDC-WooCommerce Integration Architecture"
    },
    {
      image: 'diagram.png',
      title: "Data Flow",
      description: "Request-Response Flow Between Components"
    }
  ];

  const codeExamples = [
    {
      title: "Authorization & Verification",
      subtitle: "protocol-handler.js",
      description: "Implements ONDC's authentication with Ed25519 signatures",
      icon: <Security />,
      image: 'diagram.png',
      code: `const crypto = require('crypto');
const axios = require('axios');
const { createHash } = require('crypto');
const ed25519 = require('@noble/ed25519');

class ONDCProtocolHandler {
  constructor(config) {
    this.config = config;
    this.baseUrl = config.gatewayUrl || 'https://gateway.ondc.org';
    this.subscriberId = config.subscriberId;
    this.uniqueKeyId = config.uniqueKeyId;
    this.signingPrivateKey = Buffer.from(config.signingPrivateKey, 'base64');
  }

  async createSigningString(requestBody, created, expires) {
    // Generate BLAKE-512 digest of request body
    const digest = await this.generateBlakeHash(JSON.stringify(requestBody));
    
    // Create signing string
  }

  async generateBlakeHash(data) {
    const hash = createHash('blake2b512');
    hash.update(Buffer.from(data));
    return hash.digest('base64');
  }

  async createAuthHeader(requestBody) {
    try {
      const created = Math.floor(Date.now() / 1000); // Current timestamp in seconds
      const expires = created + 3600; // 1 hour expiry
      
      // Create signing string
      const signingString = await this.createSigningString(requestBody, created, expires);
      
      // Sign the string using Ed25519
      const signature = await ed25519.sign(
        Buffer.from(signingString),
        this.signingPrivateKey
      );

      // Create authorization header
      return {
      };
    } catch (error) {
      throw new Error('Auth header creation failed: {error.message}');
    }
  }

  async sendToNetwork(action, payload) {
    try {
      // Create context for the request
      const context = {
        domain: payload.domain || "ONDC:RET10",
        action: action,
        country: "IND",
        city: payload.city || "std:080",
        core_version: "1.2.0",
        bap_id: this.subscriberId,
        bap_uri: this.config.subscriberUrl,
        transaction_id: crypto.randomUUID(),
        message_id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        ttl: "PT30S"
      };

      const requestBody = {
        context,
        message: payload
      };

      // Create authorization header
      const headers = await this.createAuthHeader(requestBody);

      // Send request to ONDC gateway
      const response = await axios.post(
        '{this.baseUrl}/{action}',
        requestBody,
        { headers }
      );

      // Verify gateway signature if present
      if (response.headers['x-gateway-authorization']) {
        await this.verifyGatewaySignature(response);
      }

      return response.data;

    } catch (error) {
      throw new Error('ONDC Network Error: {error.message}');
    }
  }

  async verifyGatewaySignature(response) {
    // Extract signature components from header
    const gatewayAuth = response.headers['x-gateway-authorization'];
    const matches = gatewayAuth.match(/keyId="([^"]+)"/);
    if (!matches) {
      throw new Error('Invalid gateway signature format');
    }

    const [subscriberId, uniqueKeyId] = matches[1].split('|');

    // In production, you would:
    // 1. Lookup gateway's public key from registry using subscriberId and uniqueKeyId
    // 2. Verify the signature using the public key
    // 3. Verify timestamp and expiry
    // 4. Verify digest matches response body

    // For now, we'll just validate the presence of the signature
    if (!gatewayAuth.includes('signature=')) {
      throw new Error('Missing gateway signature');
    }
  }

  async search(searchParams) {
    const searchPayload = {
      intent: {
        category: {
          id: searchParams.category || "Foodgrains"
        },
        fulfillment: {
          type: "Delivery"
        },
        payment: {
          "@ondc/org/buyer_app_finder_fee_type": "percent",
          "@ondc/org/buyer_app_finder_fee_amount": "3"
        },
        tags: [
          {
            code: "bap_terms",
            list: [
              {
                code: "static_terms",
                value: ""
              },
              {
                code: "static_terms_new",
                value: this.config.staticTermsUrl
              },
              {
                code: "effective_date",
                value: new Date().toISOString()
              }
            ]
          }
        ]
      }
    };

    return this.sendToNetwork('search', searchPayload);
  }
}

module.exports = ONDCProtocolHandler;`
    },
    {
      title: "API Contract Implementation",
      subtitle: "catalog-service.js",
      description: "Handles catalog integration and ONDC compliance",
      icon: <Api />,
      image: 'diagram.png',
      code: `class CatalogService {
  constructor(wc) {
    this.wc = wc;
  }

  async handleSearch(searchRequest) {
    try {
      const { category, location } = searchRequest.message.intent;
      
      // Get products from WooCommerce based on search criteria
      const params = {
        per_page: 100,
        category: category?.id
      };

      const products = await this.wc.get("products", params);
      
      // Transform to ONDC catalog format
      return {
        catalog: {
          "bpp/descriptor": {
            name: "WooCommerce Store"
          },
          "bpp/providers": [{
            id: "provider_id", // Should come from config
            descriptor: {
              name: "Store Name", // Should come from config
              short_desc: "Store Description",
              images: ["store_image_url"]
            },
            items: this.transformToONDCFormat(products.data)
          }]
        }
      };
    } catch (error) {
      throw new Error('Search handler failed: {error.message}');
    }
  }

  async getFullCatalog(params = {}) {
    try {
      // Get all products with pagination
      let allProducts = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const response = await this.wc.get("products", {
          per_page: 100,
          page: page,
          category: params.category_id
        });

        allProducts = [...allProducts, ...response.data];
        
        // Check if there are more pages
        hasMore = response.headers['x-wp-totalpages'] > page;
        page++;
      }

      return {
        catalog: {
          "bpp/descriptor": {
            name: params.storeName || "WooCommerce Store"
          },
          "bpp/providers": [{
            id: params.providerId,
            items: this.transformToONDCFormat(allProducts)
          }]
        }
      };
    } catch (error) {
      throw new Error('Full catalog export failed: {error.message}');
    }
  }

  transformToONDCFormat(items) {
    return items.map(item => ({
      id: item.id.toString(),
      descriptor: {
        name: item.name,
        long_desc: item.description,
        images: item.images.map(img => img.src),
        symbol: item.sku || null,
        short_desc: item.short_description || null
      },
      price: {
        currency: "INR",
        value: item.price,
        maximum_value: item.regular_price || item.price
      },
      quantity: {
        available: {
          count: item.stock_quantity || 0
        },
        maximum: {
          count: item.manage_stock ? item.stock_quantity : null
        }
      },
      category_id: item.categories?.[0]?.id?.toString(),
      "@ondc/org/returnable": item.meta_data?.find(m => m.key === "_ondc_returnable")?.value || false,
      "@ondc/org/cancellable": item.meta_data?.find(m => m.key === "_ondc_cancellable")?.value || false,
      "@ondc/org/return_window": item.meta_data?.find(m => m.key === "_ondc_return_window")?.value || "P7D",
      "@ondc/org/seller_pickup_return": item.meta_data?.find(m => m.key === "_ondc_seller_pickup")?.value || false,
      "@ondc/org/time_to_ship": item.meta_data?.find(m => m.key === "_ondc_time_to_ship")?.value || "P1D",
      "@ondc/org/available_on_cod": item.meta_data?.find(m => m.key === "_ondc_cod_available")?.value || false,
      "@ondc/org/contact_details_consumer_care": item.meta_data?.find(m => m.key === "_ondc_support_contact")?.value || "",
      "@ondc/org/statutory_reqs_packaged_commodities": {
        manufacturer_or_packer_name: item.meta_data?.find(m => m.key === "_ondc_manufacturer_name")?.value || "",
        manufacturer_or_packer_address: item.meta_data?.find(m => m.key === "_ondc_manufacturer_address")?.value || "",
        common_or_generic_name_of_commodity: item.name,
        net_quantity_or_measure_of_commodity_in_pkg: item.meta_data?.find(m => m.key === "_ondc_net_quantity")?.value || ""
      },
      "@ondc/org/statutory_reqs_prepackaged_food": {
        nutritional_info: item.meta_data?.find(m => m.key === "_ondc_nutritional_info")?.value || "",
        additives_info: item.meta_data?.find(m => m.key === "_ondc_additives_info")?.value || "",
        brand_owner_FSSAI_license_no: item.meta_data?.find(m => m.key === "_ondc_fssai_license_no")?.value || "",
        other_FSSAI_license_no: item.meta_data?.find(m => m.key === "_ondc_other_fssai_license_no")?.value || ""
      }
    }));
  }

  transformFromONDCFormat(item) {
    return {
      name: item.descriptor.name,
      description: item.descriptor.long_desc,
      short_description: item.descriptor.short_desc,
      regular_price: item.price.value.toString(),
      stock_quantity: item.quantity.available.count,
      manage_stock: true,
      sku: item.descriptor.symbol,
      meta_data: [
        { key: "_ondc_returnable", value: item["@ondc/org/returnable"] },
        { key: "_ondc_cancellable", value: item["@ondc/org/cancellable"] },
        { key: "_ondc_return_window", value: item["@ondc/org/return_window"] },
        { key: "_ondc_seller_pickup", value: item["@ondc/org/seller_pickup_return"] },
        { key: "_ondc_time_to_ship", value: item["@ondc/org/time_to_ship"] },
        { key: "_ondc_cod_available", value: item["@ondc/org/available_on_cod"] },
        { key: "_ondc_support_contact", value: item["@ondc/org/contact_details_consumer_care"] },
        { key: "_ondc_manufacturer_name", value: item["@ondc/org/statutory_reqs_packaged_commodities"]?.manufacturer_or_packer_name },
        { key: "_ondc_manufacturer_address", value: item["@ondc/org/statutory_reqs_packaged_commodities"]?.manufacturer_or_packer_address },
        { key: "_ondc_net_quantity", value: item["@ondc/org/statutory_reqs_packaged_commodities"]?.net_quantity_or_measure_of_commodity_in_pkg },
        { key: "_ondc_nutritional_info", value: item["@ondc/org/statutory_reqs_prepackaged_food"]?.nutritional_info },
        { key: "_ondc_additives_info", value: item["@ondc/org/statutory_reqs_prepackaged_food"]?.additives_info },
        { key: "_ondc_fssai_license_no", value: item["@ondc/org/statutory_reqs_prepackaged_food"]?.brand_owner_FSSAI_license_no },
        { key: "_ondc_other_fssai_license_no", value: item["@ondc/org/statutory_reqs_prepackaged_food"]?.other_FSSAI_license_no }
      ]
    };
  }
}

module.exports = {
  CatalogService,
};`
    }
  ];

  return (
    <div>
      {/* Navigation Bar */}
      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0">
              <span className="text-xl font-bold text-gray-800 flex items-center gap-2"><span><img src="logo.png" className='w-10' alt="" /></span>ONDC Adapter</span>
            </div>
            <div className="flex space-x-4">
              <a target='_blank'
                href="/buyer"
                className="flex items-center px-4 py-2 rounded-md text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                Buyer Perspective
              </a>
              <a
                href="/seller" target='_blank'
                className="flex items-center px-4 py-2 rounded-md text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              >
                <Store className="w-5 h-5 mr-2" />
                Seller Perspective
              </a>
              <a target='_blank'
                href="/register"
                className="flex items-center px-4 py-2 rounded-md text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              >
                <FormControl className="w-5 h-5 mr-2" />
                Register
              </a>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 animate-fade-in bg-gray-50">
        {/* Action Buttons */}
        <div className="flex justify-center space-x-6 my-8">
          <a
            href="https://drive.google.com/drive/folders/1d5jPVZnj79-01zUEA3_9bUE21RtoamuO?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors shadow-md"
          >
            <Video className="w-5 h-5 mr-2" />
            Watch Demo Video
            <ExternalLink className="w-4 h-4 ml-2" />
          </a>
          <a
            href="https://www.npmjs.com/package/woocommerce-ondc-adapter"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md"
          >
            <Package className="w-5 h-5 mr-2" />
            NPM Adapter Package
            <ExternalLink className="w-4 h-4 ml-2" />
          </a>
        </div>
        <div className="text-center my-8">
          <h2 className="text-4xl font-bold mb-4 transition-all duration-300 ease-in-out text-gray-800">
            WooCommerce ONDC Adapter
          </h2>
          <p className="text-lg text-gray-600 transition-all duration-300 ease-in-out">
            Seamlessly connect your WooCommerce store to ONDC Network
          </p>
        </div>

        {/* Architecture Carousel */}
        <div className="bg-white shadow-md rounded-lg p-8 my-8 transition-all duration-300 ease-in-out">
          <h3 className="text-2xl font-semibold mb-8 flex items-center text-gray-800">
            <Architecture className="mr-2 text-blue-500" /> System Overview
          </h3>
          <div className="max-w-4xl mx-auto">
            <Slider {...sliderSettings}>
              {diagrams.map((item, index) => (
                <div key={index} className="px-4 focus:outline-none">
                  <div className="bg-white rounded-xl p-6 shadow-lg">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full max-h-[400px] object-contain mb-6 rounded-lg"
                    />
                    <h4 className="text-xl font-semibold text-center text-gray-800 mb-2">
                      {item.title}
                    </h4>
                    <p className="text-center text-gray-600">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </Slider>
          </div>
        </div>

        {/* Code Examples */}
        <div className="my-12">
          <h3 className="text-2xl font-semibold mb-8 flex items-center text-gray-800">
            <ShoppingCart className="mr-2 text-blue-500" /> Implementation Details
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {codeExamples.map((example, index) => (
              <div
                key={index}
                className="bg-white shadow-lg rounded-xl overflow-hidden hover:shadow-xl text-black"
              >
                <div className="p-8">
                  <div className="bg-blue-500 text-white rounded-full p-4 inline-block mb-6 shadow-md">
                    {example.icon}
                  </div>
                  <h4 className="text-2xl font-semibold mb-3 text-gray-800">
                    {example.title}
                  </h4>
                  <p className="text-blue-500 text-sm font-medium mb-3">
                    {example.subtitle}
                  </p>
                  <p className="text-gray-600 mb-6">
                    {example.description}
                  </p>
                  <CodeEditor code={example.code} language="javascript" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FrontPage;