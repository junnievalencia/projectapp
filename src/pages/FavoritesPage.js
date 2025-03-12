import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

export function useFavoritesPage () {
  const search = ref('')
  const activeTab = ref('products')
  const tab = ref('favorites')
  const router = useRouter()
  const route = useRoute()
  const favoriteProducts = ref([])
  const favoriteStores = ref([])
  const isLoading = ref(false)

  // Load favorites from localStorage
  const loadFavorites = () => {
    try {
      // Load favorite products
      const favProductsString = localStorage.getItem('favoriteProducts')
      if (favProductsString) {
        favoriteProducts.value = JSON.parse(favProductsString)
        console.log('Loaded favorite products:', favoriteProducts.value)
      }

      // Load favorite stores
      const favStoresString = localStorage.getItem('favoriteStores')
      if (favStoresString) {
        favoriteStores.value = JSON.parse(favStoresString)
        console.log('Loaded favorite stores:', favoriteStores.value)
      }
    } catch (error) {
      console.error('Error loading favorites:', error)
    }
  }

  // Refresh functions for pull-to-refresh
  const refreshProducts = (done) => {
    isLoading.value = true

    // Simulate refresh with a delay for better UX
    setTimeout(() => {
      loadFavorites()
      isLoading.value = false

      // Show toast notification (if in real app)
      console.log('Products refreshed')

      // Complete the refresh
      done()
    }, 1000)
  }

  const refreshStores = (done) => {
    isLoading.value = true

    // Simulate refresh with a delay for better UX
    setTimeout(() => {
      loadFavorites()
      isLoading.value = false

      // Show toast notification (if in real app)
      console.log('Stores refreshed')

      // Complete the refresh
      done()
    }, 1000)
  }

  // Filter favorites based on search
  const filteredProducts = computed(() => {
    if (!search.value) return favoriteProducts.value
    const searchLower = search.value.toLowerCase()
    return favoriteProducts.value.filter(item =>
      item.name.toLowerCase().includes(searchLower) ||
      item.restaurant.toLowerCase().includes(searchLower)
    )
  })

  const filteredStores = computed(() => {
    if (!search.value) return favoriteStores.value
    const searchLower = search.value.toLowerCase()
    return favoriteStores.value.filter(store =>
      store.name.toLowerCase().includes(searchLower)
    )
  })

  // Check if we have favorites
  const hasFavoriteProducts = () => {
    return favoriteProducts.value.length > 0
  }

  const hasFavoriteStores = () => {
    return favoriteStores.value.length > 0
  }

  // Remove item from favorites
  const removeFromFavorites = (itemId) => {
    favoriteProducts.value = favoriteProducts.value.filter(item => item.id !== itemId)
    localStorage.setItem('favoriteProducts', JSON.stringify(favoriteProducts.value))
  }

  // Remove store from favorites
  const removeStoreFromFavorites = (storeId) => {
    favoriteStores.value = favoriteStores.value.filter(store => store.id !== storeId)
    localStorage.setItem('favoriteStores', JSON.stringify(favoriteStores.value))
  }

  // Add item to cart
  const addToCart = (item) => {
    try {
      const cartString = localStorage.getItem('cart')
      let cart = []

      if (cartString) {
        cart = JSON.parse(cartString)
        const existingItemIndex = cart.findIndex(cartItem => cartItem.id === item.id)

        if (existingItemIndex !== -1) {
          cart[existingItemIndex].quantity += 1
        } else {
          cart.push({
            ...item,
            quantity: 1
          })
        }
      } else {
        cart = [{
          ...item,
          quantity: 1
        }]
      }

      localStorage.setItem('cart', JSON.stringify(cart))
      alert('Item added to cart!')
    } catch (error) {
      console.error('Error adding item to cart:', error)
    }
  }

  // Helper function to handle different image source formats
  const getImageSrc = (image) => {
    // If image is null or undefined, return default image
    if (!image) {
      return require('../assets/burger.png') // Using an existing image from the project
    }

    // If image is already a string URL, return it
    if (typeof image === 'string') {
      return image
    }

    // For images that may be loaded from require()
    try {
      return image
    } catch (e) {
      console.error('Error loading image:', e)
      return require('../assets/burger.png') // Using an existing image from the project
    }
  }

  // Set the active tab based on the current route
  onMounted(() => {
    loadFavorites()

    const path = route.path.substring(1) // Remove the leading slash
    if (['home', 'favorites', 'cart', 'profile'].includes(path)) {
      tab.value = path
    }
  })

  // Watch for tab changes and navigate accordingly
  watch(tab, (newValue) => {
    if (newValue && route.path !== `/${newValue}`) {
      router.push(`/${newValue}`)
    }
  })

  return {
    search,
    activeTab,
    tab,
    favoriteProducts,
    favoriteStores,
    filteredProducts,
    filteredStores,
    hasFavoriteProducts,
    hasFavoriteStores,
    removeFromFavorites,
    removeStoreFromFavorites,
    addToCart,
    refreshProducts,
    refreshStores,
    isLoading,
    getImageSrc
  }
}
