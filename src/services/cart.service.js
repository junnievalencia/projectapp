import api from './api'

export default {
  /**
   * Get current user's cart
   * @returns {Promise} - API response with cart items
   */
  getCart () {
    return api.get('/cart')
  },

  /**
   * Add item to cart
   * @param {Object} item - Item to add to cart
   * @returns {Promise} - API response
   */
  addToCart (item) {
    return api.post('/cart/items', item)
  },

  /**
   * Update cart item quantity
   * @param {Number} itemId - ID of the item to update
   * @param {Number} quantity - New quantity
   * @returns {Promise} - API response
   */
  updateQuantity (itemId, quantity) {
    return api.put(`/cart/items/${itemId}`, { quantity })
  },

  /**
   * Remove item from cart
   * @param {Number} itemId - ID of the item to remove
   * @returns {Promise} - API response
   */
  removeItem (itemId) {
    return api.delete(`/cart/items/${itemId}`)
  },

  /**
   * Clear all items from cart
   * @returns {Promise} - API response
   */
  clearCart () {
    return api.delete('/cart')
  },

  /**
   * Get cart total
   * @returns {Promise} - API response with cart totals
   */
  getCartTotal () {
    return api.get('/cart/total')
  },

  /**
   * Checkout the cart
   * @param {Object} checkoutData - Payment and delivery details
   * @returns {Promise} - API response
   */
  checkout (checkoutData) {
    return api.post('/orders/checkout', checkoutData)
  }
}
