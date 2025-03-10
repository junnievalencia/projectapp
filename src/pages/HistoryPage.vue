<template>
  <q-page class="bg-grey-1">
    <!-- Header -->
    <div class="q-pa-md bg-white">
      <div class="row items-center">
        <q-btn flat round icon="arrow_back" color="black" @click="$router.go(-1)" />
        <div class="text-h6 text-weight-bold q-ml-sm">HISTORY</div>
      </div>
    </div>

    <div class="q-pa-md">
      <!-- History Items -->
      <template v-if="orders.length > 0">
        <q-card v-for="order in orders" :key="order.id" flat bordered class="q-mb-lg order-card">
          <!-- Order Status -->
          <div class="row q-pa-md items-center">
            <div class="text-subtitle1 text-weight-bold">Status</div>
            <div class="text-subtitle1 text-green q-ml-auto">{{ order.status || 'Delivered' }}</div>
          </div>

          <q-separator />

          <!-- Order Items -->
          <div class="q-pa-md" v-for="item in order.items" :key="item.id">
            <div class="row items-center">
              <!-- Item Image -->
              <q-img
                :src="item.image"
                width="70px"
                height="70px"
                class="rounded-borders cursor-pointer"
                @click="viewOrderDetails(order.id)"
              />

              <!-- Item Details -->
              <div class="col q-ml-md cursor-pointer" @click="viewOrderDetails(order.id)">
                <div class="text-subtitle1 text-weight-bold">{{ item.name }}</div>
                <div class="text-caption text-grey">{{ item.restaurant }}</div>
                <div class="text-subtitle1 q-mt-sm">₱{{ item.price }}</div>
              </div>

              <!-- Item Quantity & Buy Again -->
              <div class="col-auto text-right">
                <div class="text-subtitle1 text-weight-bold">{{ item.quantity }}</div>
                <q-btn
                  rounded
                  color="orange"
                  label="Buy Again"
                  class="q-mt-sm q-btn-item"
                  size="sm"
                  @click="buyAgain(item)"
                />
              </div>
            </div>

            <!-- Comment Section -->
            <div class="q-mt-sm">
              <q-input
                outlined
                rounded
                dense
                bg-color="grey-2"
                placeholder="Leave a comment"
                :value="item.comment || ''"
                @change="updateComment(item, $event)"
              >
                <template v-slot:append>
                  <q-icon name="send" color="primary" />
                </template>
              </q-input>
            </div>
          </div>
        </q-card>
      </template>

      <!-- No Orders -->
      <template v-else>
        <div class="text-center q-pa-xl">
          <q-icon name="history" size="100px" color="grey-4" />
          <div class="text-h6 q-mt-md">No Order History</div>
          <div class="text-subtitle1 text-grey q-mb-lg">You haven't placed any orders yet</div>
          <q-btn color="orange" label="Browse Food" icon="restaurant" to="/home" />
        </div>
      </template>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

export default defineComponent({
  name: 'HistoryPage',

  setup () {
    const router = useRouter()
    const orders = ref([])

    onMounted(() => {
      // Load orders from localStorage
      const savedOrders = JSON.parse(localStorage.getItem('orders') || '[]')

      if (savedOrders.length === 0) {
        // If no orders, wait a bit and redirect to home
        setTimeout(() => {
          router.push('/home')
        }, 3000)
      }

      // Mark all completed orders as "Delivered"
      orders.value = savedOrders.map(order => {
        if (order.status === 'Preparing' || order.status === 'Out for delivery') {
          return { ...order, status: 'Delivered' }
        }
        return order
      })
    })

    // Add a navigation function that uses router
    const viewOrderDetails = (orderId) => {
      router.push(`/track-order/${orderId}`)
    }

    const buyAgain = (item) => {
      try {
        // Get existing cart from localStorage
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

        // Ask if user wants to go to cart
        if (confirm('Item added to cart! Go to cart now?')) {
          router.push('/cart')
        }
      } catch (error) {
        console.error('Error adding item to cart:', error)
      }
    }

    const updateComment = (item, comment) => {
      // Find the order containing this item
      const orderIndex = orders.value.findIndex(order =>
        order.items.some(orderItem => orderItem.id === item.id)
      )

      if (orderIndex !== -1) {
        // Find the item in the order
        const itemIndex = orders.value[orderIndex].items.findIndex(orderItem =>
          orderItem.id === item.id
        )

        if (itemIndex !== -1) {
          // Update the comment
          orders.value[orderIndex].items[itemIndex].comment = comment

          // Save back to localStorage
          localStorage.setItem('orders', JSON.stringify(orders.value))
        }
      }
    }

    return {
      orders,
      buyAgain,
      updateComment,
      viewOrderDetails
    }
  }
})
</script>

<style lang="scss" scoped>
.order-card {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
  }
}

.cursor-pointer {
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.85;
  }
}

// Animation for "Buy Again" button
@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.q-btn-item {
  animation: pulse 2s infinite;
}
</style>
