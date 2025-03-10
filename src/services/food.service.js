import api from './api'

export default {
  /**
   * Get featured restaurants
   * @returns {Promise} - API response with featured restaurants
   */
  getFeaturedRestaurants () {
    return api.get('/restaurants/featured')
  },

  /**
   * Get all restaurants
   * @param {Object} params - Query parameters (category, search term, etc.)
   * @returns {Promise} - API response with restaurants
   */
  getRestaurants (params = {}) {
    return api.get('/restaurants', { params })
  },

  /**
   * Get restaurant details by ID
   * @param {Number} id - Restaurant ID
   * @returns {Promise} - API response with restaurant details
   */
  getRestaurantById (id) {
    return api.get(`/restaurants/${id}`)
  },

  /**
   * Get menu items for a restaurant
   * @param {Number} restaurantId - Restaurant ID
   * @param {Object} params - Query parameters (category, search term, etc.)
   * @returns {Promise} - API response with menu items
   */
  getMenuItems (restaurantId, params = {}) {
    return api.get(`/restaurants/${restaurantId}/menu`, { params })
  },

  /**
   * Get food item details
   * @param {Number} itemId - Food item ID
   * @returns {Promise} - API response with food item details
   */
  getFoodItemById (itemId) {
    return api.get(`/food/${itemId}`)
  },

  /**
   * Get food categories
   * @returns {Promise} - API response with food categories
   */
  getCategories () {
    return api.get('/categories')
  },

  /**
   * Search food items
   * @param {String} query - Search query
   * @returns {Promise} - API response with search results
   */
  searchFood (query) {
    return api.get('/food/search', { params: { q: query } })
  }
}
