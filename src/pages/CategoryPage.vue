<template>
  <q-page class="bg-grey-1">
    <!-- Header with Title -->
    <div class="q-pa-md bg-white">
      <div class="row items-center q-mb-sm">
        <div class="col-12">
          <div class="text-h6 text-weight-bold">Categories</div>
          <div class="text-subtitle2 text-grey">Browse by food category</div>
        </div>
      </div>
    </div>

    <!-- Categories Grid -->
    <div class="q-pa-md">
      <div class="row q-col-gutter-md">
        <div v-for="category in categories" :key="category.id" class="col-6 col-sm-4 col-md-3">
          <q-card class="category-card cursor-pointer" flat bordered @click="navigateToCategory(category)">
            <q-card-section class="text-center">
              <q-avatar size="60px" color="grey-3">
                <q-icon :name="category.icon" color="orange" size="40px" />
              </q-avatar>
              <div class="text-subtitle1 q-mt-sm">{{ category.name }}</div>
              <div class="text-caption text-grey">{{ getStoreCount(category) }} stores</div>
            </q-card-section>
          </q-card>
        </div>
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
        <q-tab name="category" icon="category" label="Category" to="/categories" />
        <q-tab name="favorites" icon="favorite_border" label="Favorites" to="/favorites" />
        <q-tab name="cart" icon="shopping_cart" label="Cart" to="/cart" />
        <q-tab name="profile" icon="person" label="Profile" to="/profile" />
      </q-tabs>
    </q-footer>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import useHomePage from './HomePage.js'

export default defineComponent({
  name: 'CategoryPage',

  setup () {
    const router = useRouter()
    const route = useRoute()
    const homePageData = useHomePage()
    const tab = ref('category')

    // Get categories from HomePage.js
    const categories = ref([...homePageData.categories])

    // Sample store data with categories
    const stores = ref([
      {
        id: 1,
        name: 'CANTEEN',
        category: 'Meal',
        cuisine: 'Filipino',
        isFavorite: true,
        image: '../assets/burger.png'
      },
      {
        id: 2,
        name: 'Coffee Shope',
        category: 'Drinks',
        cuisine: 'Beverages',
        isFavorite: false,
        image: '../assets/burger.png'
      },
      {
        id: 3,
        name: 'Burger King',
        category: 'Burgers',
        cuisine: 'Fast Food',
        isFavorite: false,
        image: '../assets/burger.png'
      },
      {
        id: 4,
        name: 'MILKTEA SHOP',
        category: 'Drinks',
        cuisine: 'Beverages',
        isFavorite: false,
        image: '../assets/burger.png'
      },
      {
        id: 5,
        name: 'Sario Eatery',
        category: 'Meal',
        cuisine: 'Filipino',
        isFavorite: false,
        image: '../assets/burger.png'
      }
    ])

    // Get store count for each category
    const getStoreCount = (category) => {
      return stores.value.filter(store =>
        store.category.toLowerCase() === category.name.toLowerCase()
      ).length
    }

    // Navigate by category (same function as in HomePage)
    const navigateToCategory = (category) => {
      // Store the selected category in localStorage
      localStorage.setItem('selectedCategory', category.name)
      // Navigate to the stores page
      router.push('/stores')
    }

    onMounted(() => {
      // Set active tab
      const path = route.path.substring(1) // Remove the leading slash
      if (['home', 'category', 'favorites', 'cart', 'profile'].includes(path)) {
        tab.value = path
      }
    })

    return {
      tab,
      categories,
      navigateToCategory,
      getStoreCount
    }
  }
})
</script>

<style lang="scss" scoped>
.category-card {
  background: white;
  border-radius: 12px;
  transition: all 0.2s ease;
  height: 100%;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }
}
</style>
