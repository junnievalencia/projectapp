<template>
  <q-page class="bg-grey-1">
    <!-- Header with Back Button -->
    <div class="q-pa-md bg-white">
      <div class="row items-center q-mb-sm">
        <div class="col-12">
          <div class="row items-center">
            <q-btn flat round icon="arrow_back" color="black" @click="$router.go(-1)" />
            <div class="text-h6 text-weight-bold q-ml-sm">STORES</div>
          </div>
        </div>
      </div>

      <!-- Search Bar -->
      <div class="search-container q-mt-md">
        <q-input
          v-model="search"
          placeholder="Search by store name, category, or cuisine"
          outlined
          rounded
          bg-color="grey-2"
          class="search-input"
          dense
          debounce="300"
          :loading="isSearching"
          clearable
        >
          <template v-slot:prepend>
            <q-icon name="search" color="grey" />
          </template>
          <template v-slot:append>
            <q-icon v-if="search" name="close" color="grey" class="cursor-pointer" @click="clearSearch" />
          </template>
        </q-input>
      </div>
    </div>

    <!-- Store Listings -->
    <div class="q-pa-md">
      <!-- No Results Message -->
      <div v-if="search && filteredStores.length === 0" class="text-center q-pa-md">
        <q-icon name="search_off" size="48px" color="grey" />
        <div class="text-subtitle1 text-grey q-mt-sm">No stores found matching "{{ search }}"</div>
        <div class="text-caption text-grey">Try adjusting your search terms</div>
      </div>

      <!-- Store List -->
      <div v-else class="row q-col-gutter-md">
        <div v-for="store in filteredStores" :key="store.id" class="col-12">
          <q-card class="store-card cursor-pointer" flat bordered @click="selectStore(store)">
            <q-card-section horizontal class="q-pa-sm">
              <q-img
                :src="store.image || '../assets/burger.png'"
                style="width: 70px; height: 70px"
                class="rounded-borders"
              />
              <q-card-section class="q-pl-md col">
                <div class="text-subtitle1 text-weight-bold">{{ store.name }}</div>
                <div class="text-caption text-grey">{{ store.category }}</div>
                <div class="text-caption text-grey" v-if="store.cuisine">{{ store.cuisine }}</div>
              </q-card-section>
              <q-card-section class="col-auto self-center">
                <q-btn
                  flat
                  round
                  dense
                  :color="store.isFavorite ? 'red' : 'grey'"
                  :icon="store.isFavorite ? 'favorite' : 'favorite_border'"
                  @click.stop="toggleFavorite(store)"
                >
                  <q-tooltip>{{ store.isFavorite ? 'Remove from favorites' : 'Add to favorites' }}</q-tooltip>
                </q-btn>
              </q-card-section>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

export default defineComponent({
  name: 'StorePage',

  setup () {
    const router = useRouter()
    const $q = useQuasar()
    const search = ref('')
    const isSearching = ref(false)

    // Sample store data with categories and cuisines
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

    // Enhanced filter function with multiple criteria
    const filteredStores = computed(() => {
      if (!search.value) return stores.value

      const searchTerm = search.value.toLowerCase()
      return stores.value.filter(store => {
        return (
          store.name.toLowerCase().includes(searchTerm) ||
          store.category.toLowerCase().includes(searchTerm) ||
          (store.cuisine && store.cuisine.toLowerCase().includes(searchTerm))
        )
      })
    })

    // Clear search
    const clearSearch = () => {
      search.value = ''
    }

    // Navigate to store detail page
    const selectStore = (store) => {
      router.push(`/store/${store.id}`)
    }

    // Toggle favorite status with notification
    const toggleFavorite = (store) => {
      store.isFavorite = !store.isFavorite

      // Save to localStorage
      try {
        const favorites = stores.value
          .filter(s => s.isFavorite)
          .map(s => s.id)
        localStorage.setItem('favoriteStores', JSON.stringify(favorites))

        // Show notification
        $q.notify({
          message: store.isFavorite
            ? `Added ${store.name} to favorites`
            : `Removed ${store.name} from favorites`,
          color: store.isFavorite ? 'positive' : 'info',
          icon: store.isFavorite ? 'favorite' : 'favorite_border',
          position: 'bottom',
          timeout: 2000
        })
      } catch (error) {
        console.error('Error saving favorites:', error)
        $q.notify({
          message: 'Error saving favorite',
          color: 'negative',
          icon: 'error',
          position: 'bottom'
        })
      }
    }

    // Watch search input for loading state
    watch(search, () => {
      isSearching.value = true
      setTimeout(() => {
        isSearching.value = false
      }, 300)
    })

    onMounted(() => {
      // Load favorites from localStorage
      try {
        const favoritesStr = localStorage.getItem('favoriteStores')
        if (favoritesStr) {
          const favorites = JSON.parse(favoritesStr)
          stores.value = stores.value.map(store => ({
            ...store,
            isFavorite: favorites.includes(store.id)
          }))
        }
      } catch (error) {
        console.error('Error loading favorites:', error)
      }
    })

    return {
      stores,
      search,
      isSearching,
      filteredStores,
      selectStore,
      toggleFavorite,
      clearSearch
    }
  }
})
</script>

<style lang="scss" scoped>
.search-container {
  position: relative;
  margin-bottom: 8px;
}

.search-input {
  .q-field__control {
    height: 45px;
    background-color: #f5f5f5;
    border-radius: 8px;
  }
}

.store-card {
  background: white;
  border-radius: 8px;
  margin-bottom: 8px;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .q-img {
    border-radius: 4px;
    object-fit: cover;
  }
}

.text-subtitle1 {
  font-size: 1rem;
  line-height: 1.2;
  margin-bottom: 4px;
}

.text-caption {
  font-size: 0.85rem;
  color: #666;
}

// Add bottom margin to the header section
.bg-white {
  margin-bottom: 8px;
}
</style>
