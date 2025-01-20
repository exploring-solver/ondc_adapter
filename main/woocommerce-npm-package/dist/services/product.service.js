class ProductService {
  constructor(wc) {
    this.wc = wc;
  }
  async search(params) {
    try {
      const response = await this.wc.get("products", params);
      return this.transformToONDCFormat(response.data);
    } catch (error) {
      throw new Error(`Product search failed: ${error.message}`);
    }
  }
  async create(product) {
    try {
      const wooProduct = this.transformFromONDCFormat(product);
      return await this.wc.post("products", wooProduct);
    } catch (error) {
      throw new Error(`Product creation failed: ${error.message}`);
    }
  }
  transformToONDCFormat(products) {
    return products.map(product => ({
      id: product.id,
      descriptor: {
        name: product.name,
        description: product.description,
        images: product.images.map(img => img.src)
      },
      price: {
        currency: "INR",
        value: product.price
      },
      quantity: {
        available: product.stock_quantity,
        maximum: product.manage_stock ? product.stock_quantity : null
      }
    }));
  }
  transformFromONDCFormat(ondcProduct) {
    return {
      name: ondcProduct.descriptor.name,
      description: ondcProduct.descriptor.description,
      regular_price: ondcProduct.price.value.toString(),
      stock_quantity: ondcProduct.quantity.available,
      manage_stock: true
    };
  }
}
module.exports = {
  ProductService
};