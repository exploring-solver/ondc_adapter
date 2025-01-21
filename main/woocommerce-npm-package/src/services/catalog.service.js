class CatalogService {
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
      throw new Error(`Search handler failed: ${error.message}`);
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
      throw new Error(`Full catalog export failed: ${error.message}`);
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
};