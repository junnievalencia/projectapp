import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

export function useOrderSuccessPage () {
  const router = useRouter()
  const orderId = ref(null)

  onMounted(() => {
    // Get the latest order from localStorage
    const orders = JSON.parse(localStorage.getItem('orders') || '[]')
    if (orders.length > 0) {
      orderId.value = orders[orders.length - 1].id
    } else {
      // If no order found, redirect to home
      router.push('/home')
    }
  })

  return {
    orderId
  }
}
