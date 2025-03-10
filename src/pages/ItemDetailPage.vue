<template>
  <q-page class="bg-white">
    <!-- Header with back button -->
    <div class="q-pa-sm bg-white">
      <q-btn
        flat
        round
        color="black"
        icon="arrow_back"
        @click="goBack"
        class="q-ml-sm"
      />
    </div>

    <!-- Product Image -->
    <q-img
      :src="item.image || '../assets/chicken.png'"
      height="300px"
      fit="cover"
      class="product-image"
    />

    <!-- Product Info Section -->
    <div class="q-px-md q-py-md">
      <div class="row justify-between items-center">
        <div class="text-h5 text-weight-bold">{{ item.name }}</div>
        <div class="text-h5 text-weight-bold">P{{ item.price }}</div>
      </div>
      <div class="text-subtitle1 text-grey q-mt-sm">{{ item.restaurant }}</div>

      <!-- Delivery Time -->
      <div class="row items-center q-mt-md">
        <q-icon name="schedule" color="orange" size="sm" />
        <span class="q-ml-sm text-body1">{{ item.time || '15-20' }} min</span>
      </div>
    </div>

    <q-separator />

    <!-- Details Section -->
    <div class="q-px-md q-py-md">
      <div class="text-h6 q-mb-md">Details</div>
      <p class="text-body1 text-grey-8">
        {{ item.description || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.' }}
      </p>
    </div>

    <q-separator />

    <!-- Comments Section -->
    <div class="q-px-md q-py-md">
      <div class="text-h6 q-mb-md">Comments</div>

      <div v-if="comments.length === 0" class="text-grey text-center q-py-md">
        No comments yet
      </div>

      <div v-for="comment in comments" :key="comment.id" class="q-mb-md">
        <div class="row no-wrap items-center">
          <q-avatar>
            <img :src="comment.avatar || 'https://cdn.quasar.dev/img/avatar.png'">
          </q-avatar>
          <div class="q-ml-md">
            <div class="text-subtitle1">{{ comment.userName }}</div>
            <div class="text-body2 text-grey-8">{{ comment.text }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Actions -->
    <div class="fixed-bottom q-pa-md bg-white">
      <div class="row no-wrap q-col-gutter-md">
        <div class="col">
          <q-btn
            color="orange"
            class="full-width"
            label="ADD TO CART"
            @click="addToCart"
            no-caps
            unelevated
            rounded
            size="lg"
          />
        </div>
        <div>
          <q-btn
            round
            flat
            color="grey"
            :icon="isFavorite ? 'favorite' : 'favorite_border'"
            @click="toggleFavorite"
            :class="{ 'text-red': isFavorite }"
            size="lg"
          />
        </div>
      </div>
    </div>

    <!-- Extra space for fixed bottom bar -->
    <div style="height: 70px"></div>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

export default defineComponent({
  name: 'ItemDetailPage',

  setup () {
    const router = useRouter()
    const route = useRoute()
    const itemId = ref(null)
    const isFavorite = ref(false)

    // Sample item data - in a real app, you would fetch this from an API
    const item = ref({
      id: 1,
      name: 'Chicken With Rice',
      restaurant: 'CANTEEN',
      price: 49,
      time: '15-20',
      rating: 4.5,
      image: require('../assets/chicken.png'),
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'
    })

    // Sample comments
    const comments = ref([
      {
        id: 1,
        userName: 'Juan Dela Cruz',
        text: 'Ang sarap at di masakit sa bulsa napaka sulit',
        avatar: null
      }
    ])

    // Fetch item data based on ID from route
    onMounted(() => {
      if (route.params.id) {
        itemId.value = route.params.id
        // In a real app, you would fetch the item data here
        // fetchItemData(itemId.value)
      }

      // Check if this item is already in favorites
      try {
        const favProductsString = localStorage.getItem('favoriteProducts')
        if (favProductsString) {
          const favProducts = JSON.parse(favProductsString)
          const isItemFavorite = favProducts.some(p => p.id === item.value.id)
          isFavorite.value = isItemFavorite
        }
      } catch (error) {
        console.error('Error checking favorite status:', error)
      }
    })

    // Go back to previous page
    const goBack = () => {
      router.go(-1)
    }

    // Toggle favorite status
    const toggleFavorite = () => {
      isFavorite.value = !isFavorite.value

      try {
        // Save item to favorites in localStorage
        if (isFavorite.value) {
          // Add to favorites
          const favProductsString = localStorage.getItem('favoriteProducts')
          let favProducts = []

          if (favProductsString) {
            favProducts = JSON.parse(favProductsString)
            // Check if item already exists in favorites
            const itemIndex = favProducts.findIndex(p => p.id === item.value.id)
            if (itemIndex === -1) {
              // Only add if not already in favorites
              favProducts.push(item.value)
            }
          } else {
            favProducts = [item.value]
          }

          localStorage.setItem('favoriteProducts', JSON.stringify(favProducts))
          alert('Item added to favorites!')
        } else {
          // Remove from favorites
          const favProductsString = localStorage.getItem('favoriteProducts')
          if (favProductsString) {
            let favProducts = JSON.parse(favProductsString)
            favProducts = favProducts.filter(p => p.id !== item.value.id)
            localStorage.setItem('favoriteProducts', JSON.stringify(favProducts))
            alert('Item removed from favorites!')
          }
        }
      } catch (error) {
        console.error('Error updating favorites:', error)
      }
    }

    // Add item to cart
    const addToCart = () => {
      // In a real app, you would call your cart service
      // For now, we'll work with localStorage
      try {
        // Get existing cart from localStorage
        const cartString = localStorage.getItem('cart')
        let cart = []

        if (cartString) {
          cart = JSON.parse(cartString)

          // Check if item already exists in cart
          const existingItemIndex = cart.findIndex(cartItem => cartItem.id === item.value.id)

          if (existingItemIndex !== -1) {
            // If item already exists, increment quantity
            cart[existingItemIndex].quantity += 1
          } else {
            // Otherwise add it to the cart
            cart.push({
              ...item.value,
              quantity: 1
            })
          }
        } else {
          // If cart doesn't exist, create it with this item
          cart = [{
            ...item.value,
            quantity: 1
          }]
        }

        // Save updated cart to localStorage
        localStorage.setItem('cart', JSON.stringify(cart))

        // Show success notification
        // In a real app, you would use a proper notification system
        alert('Item added to cart successfully!')

        // Optionally navigate to cart
        // router.push('/cart')
      } catch (error) {
        console.error('Error adding item to cart:', error)
        alert('Failed to add item to cart')
      }
    }

    return {
      item,
      comments,
      isFavorite,
      goBack,
      toggleFavorite,
      addToCart
    }
  }
})
</script>

<style lang="scss" scoped>
.product-image {
  width: 100%;
}

.q-btn {
  &.rounded {
    border-radius: 8px;
  }
}
</style>
