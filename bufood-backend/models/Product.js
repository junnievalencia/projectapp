class Product {
  constructor(name, description, price, image, category, sellerId, stock = 0) {
    this.name = name;
    this.description = description || "";
    this.price = Number(price); // Ensure price is a number
    this.image = image || "";
    this.category = category;
    this.sellerId = sellerId; // Store owner ID
    this.stock = Number(stock); // Available inventory
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
}

module.exports = Product;