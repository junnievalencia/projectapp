import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

export function useCartPage () {
  const router = useRouter()
  const route = useRoute()
  const tab = ref('cart')

  // Cart items data - initialize as empty and load from localStorage
  const cartItems = ref([])

  // Load cart items from localStorage
  const loadCartItems = () => {
    try {
      const cartString = localStorage.getItem('cart')
      if (cartString) {
        cartItems.value = JSON.parse(cartString)
      }
    } catch (error) {
      console.error('Error loading cart items:', error)
    }
  }

  // Save cart items to localStorage
  const saveCartItems = () => {
    try {
      localStorage.setItem('cart', JSON.stringify(cartItems.value))
    } catch (error) {
      console.error('Error saving cart items:', error)
    }
  }

  // Calculate subtotal, delivery fee, and total
  const subtotal = computed(() => {
    return cartItems.value.reduce((total, item) => {
      return total + (item.price * item.quantity)
    }, 0)
  })

  const deliveryFee = computed(() => {
    // Free delivery for orders over 200
    return subtotal.value > 200 ? 0 : 50
  })

  const total = computed(() => {
    return subtotal.value + deliveryFee.value
  })

  // Cart item methods
  const removeItem = (item) => {
    const index = cartItems.value.findIndex(cartItem => cartItem.id === item.id)
    if (index !== -1) {
      cartItems.value.splice(index, 1)
      saveCartItems()
    }
  }

  const increaseQuantity = (item) => {
    const index = cartItems.value.findIndex(cartItem => cartItem.id === item.id)
    if (index !== -1) {
      cartItems.value[index].quantity++
      saveCartItems()
    }
  }

  const decreaseQuantity = (item) => {
    const index = cartItems.value.findIndex(cartItem => cartItem.id === item.id)
    if (index !== -1 && cartItems.value[index].quantity > 1) {
      cartItems.value[index].quantity--
      saveCartItems()
    }
  }

  const checkout = () => {
    if (cartItems.value.length > 0) {
      router.push('/checkout')
    } else {
      alert('Your cart is empty!')
    }
  }

  // Go to track order page for the most recent order
  const goToTrackOrder = () => {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]')
    if (orders.length > 0) {
      // Navigate to the most recent order
      router.push(`/track-order/${orders[orders.length - 1].id}`)
    } else {
      alert('You have no active orders to track')
    }
  }

  // Go to order history page
  const goToHistory = () => {
    router.push('/history')
  }

  // Set the active tab based on the current route
  onMounted(() => {
    // Load cart items from localStorage
    loadCartItems()

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
    tab,
    cartItems,
    subtotal,
    deliveryFee,
    total,
    removeItem,
    increaseQuantity,
    decreaseQuantity,
    checkout,
    loadCartItems,
    saveCartItems,
    goToTrackOrder,
    goToHistory
  }
}