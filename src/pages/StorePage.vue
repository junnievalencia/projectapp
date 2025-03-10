<template>
  <q-page class="bg-grey-1">
    <!-- Header with Back Button -->
    <div class="q-pa-md bg-white">
      <div class="row items-center q-mb-sm">
        <div class="col-12">
          <div class="row items-center">
            <q-btn flat round icon="arrow_back" color="black" @click="$router.go(-1)" />
            <div class="text-h6 text-weight-bold q-ml-sm">STORES</div>
            <q-badge v-if="selectedCategory" color="orange" class="q-ml-sm">
              {{ selectedCategory }}
              <q-btn round flat dense size="xs" icon="close" color="white" @click="setCategory('')" class="q-ml-xs" />
            </q-badge>
          </div>
        </div>
      </div>
      <!-- Search Bar -->
      <q-input
        v-model="search"
        placeholder="Search Store"
        outlined
        rounded
        bg-color="grey-2"
        class="q-mt-sm"
      >
        <template v-slot:prepend>
          <q-icon name="search" color="grey" />
        </template>
        <template v-slot:append v-if="search">
          <q-icon name="close" color="grey" class="cursor-pointer" @click="search = ''" />
        </template>
      </q-input>
    </div>

    <!-- Category Filters -->
    <div class="q-pa-md q-pb-none">
      <div class="row items-center q-mb-sm">
        <q-icon name="filter_list" color="orange" size="sm" class="q-mr-sm" />
        <div class="text-subtitle1 text-weight-medium">Filter by Category</div>
      </div>
      <div class="row no-wrap overflow-auto q-gutter-sm">
        <q-chip
          clickable
          :color="selectedCategory === '' ? 'orange' : 'grey-3'"
          :text-color="selectedCategory === '' ? 'white' : 'black'"
          icon="category"
          @click="setCategory('')"
        >
          All Categories <q-badge color="white" text-color="black" class="q-ml-sm">{{ stores.length }}</q-badge>
        </q-chip>
        <q-chip
          v-for="category in categoryList"
          :key="category"
          clickable
          :color="selectedCategory === category ? 'orange' : 'grey-3'"
          :text-color="selectedCategory === category ? 'white' : 'black'"
          @click="setCategory(category)"
        >
          {{ category }} <q-badge color="white" text-color="black" class="q-ml-sm">{{ getCategoryCount(category) }}</q-badge>
        </q-chip>
      </div>
    </div>

    <!-- Store List -->
    <div class="q-pa-md">
      <div v-if="filteredStores.length === 0" class="text-center q-pa-lg">
        <q-icon name="search_off" size="48px" color="grey-6" />
        <div class="text-h6 text-grey-6 q-mt-md">No stores found</div>
        <div class="text-grey-6">Try different category or search</div>
      </div>
      <transition-group
        name="list"
        tag="div"
        appear
      >
        <q-item
          v-for="store in filteredStores"
          :key="store.id"
          clickable
          v-ripple
          class="q-mb-sm store-item"
          @click="selectStore(store)"
        >
          <q-item-section avatar>
            <q-avatar rounded>
              <img :src="store.image">
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <q-item-label class="text-weight-bold">{{ store.name }}</q-item-label>
            <q-item-label caption>
              <q-badge color="orange" class="q-mr-sm">{{ store.category }}</q-badge>
              <span>{{ store.rating }} <q-icon name="star" size="xs" /></span>
            </q-item-label>
          </q-item-section>

          <q-item-section side>
            <q-btn
              flat
              round
              :color="store.isFavorite ? 'red' : 'grey'"
              :icon="store.isFavorite ? 'favorite' : 'favorite_border'"
              @click.stop="toggleFavorite(store)"
            />
          </q-item-section>
        </q-item>
      </transition-group>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

export default defineComponent({
  name: 'StorePage',

  setup () {
    const router = useRouter()
    const search = ref('')
    const selectedCategory = ref('')

    // Get category from localStorage on mount
    onMounted(() => {
      const storedCategory = localStorage.getItem('selectedCategory')
      if (storedCategory) {
        selectedCategory.value = storedCategory
        // Clear the localStorage item to prevent persistence across sessions
        localStorage.removeItem('selectedCategory')
      }
    })

    // Set category filter
    const setCategory = (category) => {
      selectedCategory.value = category
    }

    // Sample store data with categories
    const stores = ref([
      {
        id: 1,
        name: 'CANTEEN',
        image: require('../assets/burger.png'),
        isFavorite: true,
        category: 'Meal',
        rating: 4.5
      },
      {
        id: 2,
        name: 'Coffee Shop',
        image: require('../assets/burger.png'),
        isFavorite: false,
        category: 'Drinks',
        rating: 4.2
      },
      {
        id: 3,
        name: 'Burger King',
        image: require('../assets/burger.png'),
        isFavorite: false,
        category: 'Burgers',
        rating: 4.7
      },
      {
        id: 4,
        name: 'MILKTEA SHOP',
        image: require('../assets/burger.png'),
        isFavorite: false,
        category: 'Drinks',
        rating: 4.0
      },
      {
        id: 5,
        name: 'Sario Eatery',
        image: require('../assets/burger.png'),
        isFavorite: false,
        category: 'Meal',
        rating: 4.3
      },
      {
        id: 6,
        name: 'Dessert Haven',
        image: require('../assets/burger.png'),
        isFavorite: false,
        category: 'Desserts',
        rating: 4.8
      },
      {
        id: 7,
        name: 'Snack Attack',
        image: require('../assets/burger.png'),
        isFavorite: false,
        category: 'Snacks',
        rating: 4.1
      }
    ])

    // Get unique list of categories
    const categoryList = computed(() => {
      const categories = stores.value.map(store => store.category)
      return [...new Set(categories)].sort()
    })

    // Get count of stores by category
    const getCategoryCount = (category) => {
      return stores.value.filter(store => store.category === category).length
    }

    // Filter stores based on search and selected category
    const filteredStores = computed(() => {
      return stores.value.filter(store => {
        const matchesSearch = store.name.toLowerCase().includes(search.value.toLowerCase())
        const matchesCategory = selectedCategory.value === '' || store.category === selectedCategory.value
        return matchesSearch && matchesCategory
      })
    })

    // Toggle store favorite status
    const toggleFavorite = (store) => {
      store.isFavorite = !store.isFavorite
      // In a real app, you would save this to your backend
    }

    // Navigate to store detail page
    const selectStore = (store) => {
      router.push(`/store/${store.id}`)
      // In a real app, you would load the store's menu/items
    }

    return {
      search,
      selectedCategory,
      categoryList,
      filteredStores,
      toggleFavorite,
      selectStore,
      setCategory,
      getCategoryCount
    }
  }
})
</script>

<style lang="scss" scoped>
.store-item {
  border-radius: 12px;
  background: white;
  margin-bottom: 12px;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
}

.q-chip {
  margin-right: 8px;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.05);
  }
}

.q-badge {
  font-size: 0.8em;
  padding: 5px 8px;
}

// List transitions
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}
</style>
