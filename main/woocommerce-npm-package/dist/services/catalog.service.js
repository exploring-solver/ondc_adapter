class CatalogService {
  constructor(wc) {
    this.wc = wc;
  }
  async sync(catalog) {
    try {
      const promises = catalog.items.map(item => this.wc.post("products", this.transformFromONDCFormat(item)));
      return await Promise.all(promises);
    } catch (error) {
      throw new Error(`Catalog sync failed: ${error.message}`);
    }
  }
  async updateInventory(productId, quantity) {
    try {
      return await this.wc.put(`products/${productId}`, {
        stock_quantity: quantity
      });
    } catch (error) {
      throw new Error(`Inventory update failed: ${error.message}`);
    }
  }
  transformFromONDCFormat(item) {
    return {
      name: item.descriptor.name,
      description: item.descriptor.description,
      regular_price: item.price.value.toString(),
      stock_quantity: item.quantity.available,
      manage_stock: true
    };
  }
}
module.exports = {
  CatalogService
};