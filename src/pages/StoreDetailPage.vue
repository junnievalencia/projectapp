<template>
  <q-page class="bg-grey-1">
    <!-- Header with Back Button -->
    <div class="q-pa-md bg-white">
      <div class="row items-center q-mb-sm">
        <div class="col">
          <div class="row items-center">
            <q-btn flat round icon="arrow_back" color="black" @click="$router.go(-1)" />
            <div class="text-h6 text-weight-bold q-ml-sm">{{ store.name }}</div>
          </div>
        </div>
        <div class="col-auto">
          <q-btn
            flat
            round
            :color="store.isFavorite ? 'red' : 'grey'"
            :icon="store.isFavorite ? 'favorite' : 'favorite_border'"
            @click="toggleFavorite"
            size="md"
          >
            <q-tooltip>{{ store.isFavorite ? 'Remove from favorites' : 'Add to favorites' }}</q-tooltip>
          </q-btn>
        </div>
      </div>
    </div>

    <!-- Store Info -->
    <div class="q-pa-md">
      <q-card flat bordered>
        <q-card-section>
          <div class="row items-center">
            <q-avatar size="80px" class="q-mr-md">
              <img :src="store.image">
            </q-avatar>
            <div>
              <div class="text-h6">{{ store.name }}</div>
              <div class="text-subtitle2 text-grey">{{ store.description || 'No description available' }}</div>
              <div class="row items-center q-mt-sm">
                <q-icon name="star" color="orange" size="sm" />
                <span class="q-ml-sm">{{ store.rating || '4.5' }}</span>
                <q-separator vertical inset class="q-mx-md" />
                <span>{{ store.openStatus || 'Open' }}</span>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Menu Categories -->
    <div class="q-px-md">
      <q-input
        v-model="searchQuery"
        placeholder="Search menu items"
        outlined
        dense
        class="q-mb-md"
        bg-color="white"
      >
        <template v-slot:prepend>
          <q-icon name="search" />
        </template>
        <template v-slot:append>
          <q-icon name="clear" v-if="searchQuery" class="cursor-pointer" @click="searchQuery = ''" />
        </template>
      </q-input>

      <q-tabs
        v-model="activeTab"
        dense
        class="text-grey category-tabs"
        active-color="orange"
        indicator-color="orange"
        align="justify"
        narrow-indicator
      >
        <q-tab name="all" class="category-tab">
          <q-item-section>
            <div>All</div>
            <q-badge color="orange" floating v-if="menuItems.length">
              {{ menuItems.length }}
            </q-badge>
          </q-item-section>
        </q-tab>

        <q-tab name="meals" class="category-tab">
          <q-item-section>
            <div>Meals</div>
            <q-badge color="orange" floating v-if="categoryCount.meals">
              {{ categoryCount.meals }}
            </q-badge>
          </q-item-section>
        </q-tab>

        <q-tab name="drinks" class="category-tab">
          <q-item-section>
            <div>Drinks</div>
            <q-badge color="orange" floating v-if="categoryCount.drinks">
              {{ categoryCount.drinks }}
            </q-badge>
          </q-item-section>
        </q-tab>

        <q-tab name="snacks" class="category-tab">
          <q-item-section>
            <div>Snacks</div>
            <q-badge color="orange" floating v-if="categoryCount.snacks">
              {{ categoryCount.snacks }}
            </q-badge>
          </q-item-section>
        </q-tab>
      </q-tabs>
    </div>

    <!-- Menu Items -->
    <div class="q-pa-md">
      <div class="row q-col-gutter-md">
        <div v-for="item in filteredMenuItems" :key="item.id" class="col-6">
          <q-card class="menu-item">
            <q-img :src="item.image" height="120px">
              <div class="absolute-bottom text-subtitle2 text-center bg-transparent">
                <q-badge color="orange" class="q-mr-sm">
                  {{ item.rating }} <q-icon name="star" size="xs" />
                </q-badge>
                {{ item.time }} min
              </div>
              <div class="absolute-top-right q-pa-xs">
                <q-badge
                  color="green"
                  v-if="item.category"
                  class="cursor-pointer"
                  @click.stop="setCategory(item.category)"
                >
                  {{ getCategoryLabel(item.category) }}
                </q-badge>
              </div>
            </q-img>
            <q-card-section>
              <div class="text-subtitle1 ellipsis">{{ item.name }}</div>
              <div class="row justify-between items-center q-mt-sm">
                <div class="text-subtitle1 text-weight-bold">₱{{ item.price.toFixed(2) }}</div>
                <q-btn round color="orange" icon="add_shopping_cart" size="sm" @click="addToCart(item)" />
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'

export default defineComponent({
  name: 'StoreDetailPage',

  setup () {
    const route = useRoute()
    const activeTab = ref('all')
    const searchQuery = ref('')

    // Sample store data - in a real app, fetch this based on route.params.id
    const store = ref({
      id: 1,
      name: 'CANTEEN',
      image: require('../assets/burger.png'),
      description: 'Best food in campus',
      rating: 4.5,
      openStatus: 'Open',
      isFavorite: true
    })

    // Sample menu items - in a real app, fetch this from your backend
    const menuItems = ref([
      {
        id: 1,
        name: 'Chicken With Rice',
        price: 49,
        rating: 4.5,
        time: 15,
        image: require('../assets/chicken.png'),
        category: 'meals'
      },
      {
        id: 2,
        name: 'Beef Cheesy Burger',
        price: 59,
        rating: 4.7,
        time: 20,
        image: require('../assets/burger.png'),
        category: 'meals'
      },
      {
        id: 3,
        name: 'Coca Cola',
        price: 25,
        rating: 4.3,
        time: 5,
        image: require('../assets/burger.png'),
        category: 'drinks'
      },
      {
        id: 4,
        name: 'French Fries',
        price: 35,
        rating: 4.6,
        time: 10,
        image: require('../assets/chicken.png'),
        category: 'snacks'
      }
    ])

    // Filtered menu items based on active tab
    const filteredMenuItems = computed(() => {
      // First filter by category
      let result = menuItems.value
      if (activeTab.value !== 'all') {
        result = result.filter(item => item.category === activeTab.value)
      }

      // Then filter by search query
      if (searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase().trim()
        result = result.filter(item =>
          item.name.toLowerCase().includes(query) ||
          (item.description && item.description.toLowerCase().includes(query))
        )
      }

      return result
    })

    const toggleFavorite = () => {
      store.value.isFavorite = !store.value.isFavorite

      try {
        // Save store to favorites in localStorage
        if (store.value.isFavorite) {
          // Add to favorites
          const favStoresString = localStorage.getItem('favoriteStores')
          let favStores = []

          if (favStoresString) {
            favStores = JSON.parse(favStoresString)
            // Check if store already exists in favorites
            const storeIndex = favStores.findIndex(s => s.id === store.value.id)
            if (storeIndex === -1) {
              // Only add if not already in favorites
              // Create a clean copy of the store with necessary properties
              const storeToSave = {
                id: store.value.id,
                name: store.value.name,
                image: store.value.image,
                description: store.value.description,
                rating: store.value.rating,
                openStatus: store.value.openStatus,
                isFavorite: true
              }
              favStores.push(storeToSave)
              console.log('Added store to favorites:', storeToSave)
            }
          } else {
            // Create a clean copy of the store with necessary properties
            const storeToSave = {
              id: store.value.id,
              name: store.value.name,
              image: store.value.image,
              description: store.value.description,
              rating: store.value.rating,
              openStatus: store.value.openStatus,
              isFavorite: true
            }
            favStores = [storeToSave]
            console.log('Created favorites with store:', storeToSave)
          }

          localStorage.setItem('favoriteStores', JSON.stringify(favStores))
          console.log('Saved favorites to localStorage:', favStores)
          alert('Store added to favorites!')
        } else {
          // Remove from favorites
          const favStoresString = localStorage.getItem('favoriteStores')
          if (favStoresString) {
            let favStores = JSON.parse(favStoresString)
            const initialCount = favStores.length
            favStores = favStores.filter(s => s.id !== store.value.id)
            const removed = initialCount - favStores.length
            console.log(`Removed ${removed} store(s) from favorites`)

            localStorage.setItem('favoriteStores', JSON.stringify(favStores))
            alert('Store removed from favorites!')
          }
        }
      } catch (error) {
        console.error('Error updating favorites:', error)
      }
    }

    const addToCart = (item) => {
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
              quantity: 1,
              restaurant: store.value.name
            })
          }
        } else {
          cart = [{
            ...item,
            quantity: 1,
            restaurant: store.value.name
          }]
        }

        localStorage.setItem('cart', JSON.stringify(cart))
        alert('Item added to cart successfully!')
      } catch (error) {
        console.error('Error adding item to cart:', error)
      }
    }

    const getCategoryLabel = (category) => {
      switch (category) {
        case 'meals':
          return 'Meal'
        case 'drinks':
          return 'Drink'
        case 'snacks':
          return 'Snack'
        default:
          return 'Unknown'
      }
    }

    // Function to set active category when badge is clicked
    const setCategory = (category) => {
      // Set the active tab to the selected category
      activeTab.value = category

      // Scroll to the top of menu items section for better UX
      const menuSection = document.querySelector('.q-tabs')
      if (menuSection) {
        menuSection.scrollIntoView({ behavior: 'smooth' })
      }
    }

    const categoryCount = ref({
      meals: 0,
      drinks: 0,
      snacks: 0
    })

    onMounted(() => {
      // In a real app, fetch store details and menu items based on route.params.id
      console.log('Store ID:', route.params.id)

      // Check if this store is already in favorites
      try {
        const favStoresString = localStorage.getItem('favoriteStores')
        if (favStoresString) {
          const favStores = JSON.parse(favStoresString)
          const isStoreFavorite = favStores.some(s => s.id === store.value.id)
          store.value.isFavorite = isStoreFavorite
        }
      } catch (error) {
        console.error('Error checking favorite status:', error)
      }

      // Calculate category counts
      menuItems.value.forEach(item => {
        if (item.category) {
          categoryCount.value[item.category] += 1
        }
      })
    })

    return {
      store,
      menuItems,
      activeTab,
      filteredMenuItems,
      toggleFavorite,
      addToCart,
      getCategoryLabel,
      categoryCount,
      searchQuery,
      setCategory
    }
  }
})
</script>

<style lang="scss" scoped>
.menu-item {
  border-radius: 12px;
  transition: transform 0.2s;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.2);
  }
}

.ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.category-tabs {
  .q-tab {
    padding: 8px 4px;

    &--active {
      font-weight: bold;
    }
  }
}

.cursor-pointer {
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.05);
  }
}
</style>
