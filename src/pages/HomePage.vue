<template>
  <q-page class="bg-grey-1">
    <!-- Header with Search Bar -->
    <div class="q-pa-md bg-white">
      <div class="row items-center q-mb-sm">
        <div class="col-8">
          <!-- Dynamic user greeting based on authenticated user -->
          <div class="text-h6 text-weight-bold">Hello, {{ userName }}</div>
          <div class="text-subtitle2 text-grey">What do you want to eat today?</div>
        </div>
        <div class="col-4 flex justify-end">
          <!-- Removed store button from here -->
        </div>
      </div>
      <div class="search-container q-mt-md">
        <div class="row no-wrap items-center">
          <q-input
            v-model="search"
            placeholder="Search"
            class="search-input col"
            outlined
            rounded
            bg-color="grey-2"
          >
            <template v-slot:prepend>
              <q-icon name="search" color="grey" />
            </template>
            <template v-slot:append>
              <q-btn round flat color="orange" icon="tune" size="sm" />
            </template>
          </q-input>
          <q-btn round color="orange" icon="store" class="store-btn q-ml-md" to="/stores" />
        </div>
      </div>
    </div>

     <!-- Special Offers -->
     <div class="q-pa-md">
      <div class="text-h6 q-mb-md">Special Offers</div>
      <q-carousel
        v-model="slide"
        animated
        swipeable
        infinite
        :autoplay="autoplay"
        arrows
        transition-prev="slide-right"
        transition-next="slide-left"
        @mouseenter="autoplay = false"
        @mouseleave="autoplay = true"
        height="200px"
        class="rounded-borders"
      >
        <q-carousel-slide v-for="offer in specialOffers" :key="offer.id" :name="offer.id.toString()" class="column no-wrap">
          <q-card class="full-width full-height" style="background: linear-gradient(135deg, #FF9800, #FF5722);">
            <q-card-section class="flex column justify-center items-center text-white full-height">
              <div class="text-h5">{{ offer.title }}</div>
              <div class="text-subtitle1 q-mt-md">{{ offer.description }}</div>
              <q-btn color="white" text-color="orange" label="Order Now" class="q-mt-md" />
            </q-card-section>
          </q-card>
        </q-carousel-slide>
      </q-carousel>
    </div>

    <!-- Categories Scrollable -->
    <div class="q-pa-md">
      <div class="text-h6 q-mb-md">Categories</div>
      <div class="row no-wrap overflow-auto q-gutter-md">
        <q-card
          v-for="category in categories"
          :key="category.id"
          class="category-card"
          flat bordered
          clickable
          @click="navigateToCategory(category)"
        >
          <q-card-section class="text-center">
            <q-avatar size="45px" color="grey-3">
              <q-icon :name="category.icon" color="orange" size="32px" />
            </q-avatar>
            <div class="text-caption q-mt-sm">{{ category.name }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Popular Items -->
    <div class="q-pa-md">
      <div class="text-h6 q-mb-md">Popular Items</div>
      <div class="row q-col-gutter-md">
        <div v-for="item in popularItems" :key="item.id" class="col-6 col-md-3">
          <q-card class="food-card cursor-pointer" @click="viewItemDetail(item.id)">
            <q-img src="../assets/burger.png" height="150px">
              <div class="absolute-bottom text-subtitle2 text-center bg-transparent">
                <q-badge color="orange" class="q-mr-sm">
                  {{ item.rating }} <q-icon name="star" size="xs" />
                </q-badge>
                {{ item.time }} min
              </div>
            </q-img>
            <q-card-section>
              <div class="text-h6 ellipsis">{{ item.name }}</div>
              <div class="text-subtitle2 text-grey">{{ item.restaurant }}</div>
              <div class="row justify-between items-center q-mt-sm">
                <div class="text-subtitle1 text-weight-bold">₱{{ item.price.toFixed(2) }}</div>
                <q-btn round color="orange" icon="add_shopping_cart" size="sm" @click.stop="addToCart(item)" />
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <!-- Recently Viewed -->
    <div class="q-pa-md">
      <div class="text-h6 q-mb-md">Recently Viewed</div>
      <div class="row no-wrap overflow-auto q-gutter-md">
        <q-card
          v-for="item in recentItems"
          :key="item.id"
          class="recent-card cursor-pointer"
          style="min-width: 200px"
          @click="viewItemDetail(item.id)"
        >
          <q-img src="../assets/fries.png" height="100px">
          </q-img>
          <q-card-section class="q-pa-sm">
            <div class="text-subtitle2 ellipsis">{{ item.name }}</div>
            <div class="text-caption text-grey">{{ item.restaurant }}</div>
            <div class="row justify-between items-center q-mt-xs">
              <div class="text-subtitle2 text-weight-bold">₱{{ item.price.toFixed(2) }}</div>
              <q-btn flat round color="orange" icon="replay" size="xs" @click.stop />
            </div>
          </q-card-section>
        </q-card>
      </div>
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
import { defineComponent, ref, onMounted, watch } from 'vue'
import useHomePage from './HomePage.js'
import { useRouter, useRoute } from 'vue-router'

export default defineComponent({
  name: 'HomePage',
  setup () {
    const homePageData = useHomePage()
    const tab = ref('home')
    const router = useRouter()
    const route = useRoute()
    const userName = ref('Guest')

    // Function to get user name from localStorage
    const getUserName = () => {
      try {
        const userStr = localStorage.getItem('user')
        if (userStr) {
          const userData = JSON.parse(userStr)
          userName.value = userData.name || userData.username || userData.email || 'User'
        }
      } catch (error) {
        console.error('Error getting user name:', error)
      }
    }

    // Navigate by category
    const navigateToCategory = (category) => {
      // Store the selected category in localStorage
      localStorage.setItem('selectedCategory', category.name)
      // Navigate to the stores page
      router.push('/stores')
    }

    // Navigate to item detail page
    const viewItemDetail = (itemId) => {
      router.push(`/item/${itemId}`)
    }

    // Add item to cart
    const addToCart = (item) => {
      try {
        // Get existing cart from localStorage
        const cartString = localStorage.getItem('cart')
        let cart = []

        if (cartString) {
          cart = JSON.parse(cartString)

          // Check if item already exists in cart
          const existingItemIndex = cart.findIndex(cartItem => cartItem.id === item.id)

          if (existingItemIndex !== -1) {
            // If item already exists, increment quantity
            cart[existingItemIndex].quantity += 1
          } else {
            // Otherwise add it to the cart
            cart.push({
              ...item,
              quantity: 1
            })
          }
        } else {
          // If cart doesn't exist, create it with this item
          cart = [{
            ...item,
            quantity: 1
          }]
        }

        // Save updated cart to localStorage
        localStorage.setItem('cart', JSON.stringify(cart))

        // Show success notification (in a real app, use a proper notification system)
        alert('Item added to cart successfully!')
      } catch (error) {
        console.error('Error adding item to cart:', error)
      }
    }

    // Set the active tab based on the current route
    onMounted(() => {
      // Get path and set active tab
      const path = route.path.substring(1) // Remove the leading slash
      if (['home', 'favorites', 'cart', 'profile'].includes(path)) {
        tab.value = path
      }

      // Get user name on component mount
      getUserName()
    })

    // Watch for tab changes and navigate accordingly
    watch(tab, (newValue) => {
      if (newValue && route.path !== `/${newValue}`) {
        router.push(`/${newValue}`)
      }
    })

    return {
      ...homePageData,
      tab,
      userName,
      viewItemDetail,
      addToCart,
      navigateToCategory
    }
  }
})
</script>

<style lang="scss" scoped>
.search-container {
  position: relative;
}

.search-input:deep(.q-field__control) {
  border-radius: 15px;
  height: 56px;
  background-color: #ebebeb;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.store-btn {
  height: 50px;
  width: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.category-card {
  width: 80px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
}

.food-card {
  border-radius: 12px;
  transition: transform 0.2s;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }
}

.row {
  padding-bottom: 5px;
}

.add-to-cart-btn {
  font-size: 12px;
  padding: 0 10px;
  height: 28px;
  border-radius: 15px;
  box-shadow: 0 2px 5px rgba(255, 140, 0, 0.3);
}

.banner-container {
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
}

.recent-card {
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.22);
}

.ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
