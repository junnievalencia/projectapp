import { api } from "boot/axios";

export default {
  // Get user cart
  getUserCart() {
    return api.get("/cart");
  },

  // Add item to cart
  addToCart(productId, quantity = 1) {
    return api.post("/cart/add", { productId, quantity });
  },

  // Update cart item quantity
  updateQuantity(productId, quantity) {
    return api.put("/cart/update", { productId, quantity });
  },
};
