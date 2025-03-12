import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

export function useCheckoutPage () {
  const router = useRouter()
  const cartItems = ref([])
  const formData = ref({
    name: '',
    department: '',
    number: '',
    paymentMethod: 'cod',
    otherDetails: ''
  })

  // Load cart items and calculate totals
  onMounted(() => {
    const cartString = localStorage.getItem('cart')
    if (cartString) {
      cartItems.value = JSON.parse(cartString)
    } else {
      // Redirect to cart if no items
      router.push('/cart')
    }
  })

  const subtotal = computed(() => {
    return cartItems.value.reduce((total, item) => {
      return total + (item.price * item.quantity)
    }, 0)
  })

  const deliveryCharge = ref(10.00)

  const total = computed(() => {
    return subtotal.value + deliveryCharge.value
  })

  const onSubmit = () => {
    try {
      // Generate a unique order ID
      const orderId = 'ORD-' + Date.now()

      // Set payment status based on payment method
      const paymentStatus = formData.value.paymentMethod === 'gcash'
        ? 'Paid'
        : 'Cash On Delivery'

      // Create order object
      const order = {
        id: orderId,
        ...formData.value,
        items: cartItems.value,
        subtotal: subtotal.value,
        deliveryCharge: deliveryCharge.value,
        total: total.value,
        orderDate: new Date().toISOString(),
        status: 'Preparing',
        storeNumber: '09XX XXX XXXX',
        deliveryNumber: '09XX XXX XXXX',
        paymentStatus
      }

      // Save order to localStorage
      const orders = JSON.parse(localStorage.getItem('orders') || '[]')
      orders.push(order)
      localStorage.setItem('orders', JSON.stringify(orders))

      // Clear cart
      localStorage.removeItem('cart')

      // Navigate to success page
      router.push('/order-success')
    } catch (error) {
      console.error('Error submitting order:', error)
      alert('Failed to place order. Please try again.')
    }
  }

  return {
    formData,
    subtotal,
    deliveryCharge,
    total,
    onSubmit
  }
}
