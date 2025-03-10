import api from './api'

const ordersService = {
  /**
   * Get all orders for the current user
   * @returns {Promise} - API response
   */
  getOrders () {
    return api.get('/orders')
      .then(response => {
        if (!Array.isArray(response.data)) {
          throw new Error('Invalid response format')
        }
        return response
      })
  },

  /**
   * Get order details by ID
   * @param {string} orderId - The order ID
   * @returns {Promise} - API response
   */
  getOrderById (orderId) {
    return api.get(`/orders/${orderId}`)
  },

  /**
   * Create a new order
   * @param {Object} orderData - The order data
   * @returns {Promise} - API response
   */
  createOrder (orderData) {
    return api.post('/orders', orderData)
  },

  /**
   * Cancel an order
   * @param {string} orderId - The order ID
   * @returns {Promise} - API response
   */
  cancelOrder (orderId) {
    return api.put(`/orders/${orderId}/cancel`)
  },

  /**
   * Track order status
   * @param {string} orderId - The order ID
   * @returns {Promise} - API response
   */
  trackOrder (orderId) {
    return api.get(`/orders/${orderId}/track`)
  },

  /**
   * Reorder items from a previous order
   * @param {string} orderId - The order ID to reorder from
   * @returns {Promise} - API response
   */
  reorderFromPast (orderId) {
    return api.post(`/orders/${orderId}/reorder`)
  }
}

export default ordersService
