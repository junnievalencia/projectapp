<template>
  <q-page class="bg-grey-1">
    <!-- Header -->
    <div class="q-pa-md bg-white">
      <div class="row items-center q-mb-sm">
        <div class="col">
          <div class="row items-center">
            <q-btn flat round icon="arrow_back" color="black" @click="$router.go(-1)" />
            <div class="text-h6 text-weight-bold q-ml-sm">CART</div>
          </div>
        </div>
        <div class="col-auto">
          <q-btn rounded color="orange" label="Track Order" @click="goToTrackOrder" />
          <q-btn flat round icon="history" class="q-ml-sm" @click="goToHistory" />
        </div>
      </div>
    </div>

    <!-- Cart Items -->
    <div class="q-pa-md">
      <template v-if="cartItems.length > 0">
        <q-card v-for="item in cartItems" :key="item.id" flat bordered class="q-mb-md cart-item">
          <q-card-section>
            <div class="row items-center">
              <div class="col-auto">
                <q-img :src="item.image" width="80px" height="80px" class="rounded-borders" />
              </div>
              <div class="col q-ml-md">
                <div class="text-subtitle1 text-weight-medium">{{ item.name }}</div>
                <div class="text-caption text-grey">{{ item.restaurant }}</div>
              </div>
              <div class="col-auto text-right">
                <div class="row justify-end">
                  <div class="text-subtitle1 text-weight-bold">₱{{ item.price.toFixed(2) }}</div>
                  <q-btn flat round dense color="negative" icon="delete" size="sm" class="remove-btn" @click="removeItem(item)" />
                </div>
                <div class="row items-center quantity-controls q-mt-sm justify-end">
                  <q-btn flat round dense color="orange" icon="remove" @click="decreaseQuantity(item)" :disable="item.quantity <= 1" />
                  <div class="text-subtitle1 q-mx-sm">{{ item.quantity }}</div>
                  <q-btn flat round dense color="orange" icon="add" @click="increaseQuantity(item)" />
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Order Summary -->
        <q-card flat bordered class="q-mt-lg">
          <q-card-section>
            <div class="text-subtitle1 text-weight-bold q-mb-md">Order Summary</div>
            <div class="row justify-between q-mb-sm">
              <div class="text-body1">Subtotal</div>
              <div class="text-body1">₱{{ subtotal.toFixed(2) }}</div>
            </div>
            <div class="row justify-between q-mb-sm">
              <div class="text-body1">Delivery Fee</div>
              <div class="text-body1">₱{{ deliveryFee.toFixed(2) }}</div>
            </div>
            <q-separator class="q-my-md" />
            <div class="row justify-between text-weight-bold">
              <div class="text-subtitle1">Total</div>
              <div class="text-subtitle1">₱{{ total.toFixed(2) }}</div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Checkout Button -->
        <div class="q-mt-lg">
          <q-btn color="orange" class="full-width checkout-btn" label="Proceed to Checkout" @click="checkout" />
        </div>
      </template>

      <!-- Empty Cart -->
      <template v-else>
        <div class="empty-cart-container text-center q-pa-xl">
          <img src="../assets/hungry.png" alt="Hungry" class="cart-illustration"/>
          <div class="text-h6 q-mt-md">HUNGRY?</div>
          <div class="text-subtitle1 text-grey q-mb-lg">You Haven't added anything on your cart!</div>
          <q-btn color="orange" label="Browse Food" icon="restaurant" to="/home" />
        </div>
      </template>
    </div>

    <!-- Bottom Navigation -->
    <q-footer class="bg-white">
      <q-tabs
        v-model="tab"
        class="text-grey"
        active-color="orange"
        indicator-color="transparent"
        align="justify"
        no-scroll
      >
        <q-tab name="home" icon="home" label="Home" to="/home" />
        <q-tab name="favorites" icon="favorite_border" label="Favorites" to="/favorites" />
        <q-tab name="cart" icon="shopping_cart" label="Cart" to="/cart" />
        <q-tab name="profile" icon="person" label="Profile" to="/profile" />
      </q-tabs>
    </q-footer>
  </q-page>
</template>

<script>
import { defineComponent, ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

export default defineComponent({
  name: 'CartPage',

  setup () {
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
})
</script>

<style lang="scss" scoped>
.cart-item {
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  }
}

.cart-illustration {
  width: 250px;
  height: 250px;
  object-fit: contain;
}

.quantity-controls {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.remove-btn {
  margin-left: 8px;
  opacity: 0.7;
  &:hover {
    opacity: 1;
  }
}

.checkout-btn {
  height: 56px;
  font-size: 16px;
  font-weight: bold;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(255, 140, 0, 0.3);
}

.empty-cart-container {
  margin-top: 40px;
  padding: 40px;
}
</style>
