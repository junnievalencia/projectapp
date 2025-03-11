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
          placeholder="Search Store"
          outlined
          rounded
          bg-color="grey-2"
          class="search-input"
          dense
        >
          <template v-slot:prepend>
            <q-icon name="search" color="grey" />
          </template>
        </q-input>
      </div>
    </div>

    <!-- Store Listings -->
    <div class="q-pa-md">
      <div class="row q-col-gutter-md">
        <div v-for="store in filteredStores" :key="store.id" class="col-12">
          <q-card class="store-card cursor-pointer" flat bordered @click="selectStore(store)">
            <q-card-section horizontal class="q-pa-sm">
              <q-img
                :src="store.image || '../assets/food.png'"
                style="width: 70px; height: 70px"
                class="rounded-borders"
              />
              <q-card-section class="q-pl-md col">
                <div class="text-subtitle1 text-weight-bold">{{ store.name }}</div>
                <div class="text-caption text-grey">{{ store.category }}</div>
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
import { defineComponent, ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

export default defineComponent({
  name: 'StorePage',

  setup () {
    const router = useRouter()
    const search = ref('')

    // Sample store data with categories
    const stores = ref([
      {
        id: 1,
        name: 'CANTEEN',
        category: 'Meal',
        isFavorite: true,
        image: '../assets/food.png'
      },
      {
        id: 2,
        name: 'Coffee Shope',
        category: 'Drinks',
        isFavorite: false,
        image: '../assets/food.png'
      },
      {
        id: 3,
        name: 'Burger King',
        category: 'Burgers',
        isFavorite: false,
        image: '../assets/food.png'
      },
      {
        id: 4,
        name: 'MILKTEA SHOP',
        category: 'Drinks',
        isFavorite: false,
        image: '../assets/food.png'
      },
      {
        id: 5,
        name: 'Sario Eatery',
        category: 'Meal',
        isFavorite: false,
        image: '../assets/food.png'
      }
    ])

    // Filter stores based on search
    const filteredStores = computed(() => {
      return stores.value.filter(store =>
        store.name.toLowerCase().includes(search.value.toLowerCase()) ||
        store.category.toLowerCase().includes(search.value.toLowerCase())
      )
    })

    // Navigate to store detail page
    const selectStore = (store) => {
      router.push(`/store/${store.id}`)
    }

    // Toggle favorite status
    const toggleFavorite = (store) => {
      store.isFavorite = !store.isFavorite
    }

    onMounted(() => {
      // Load favorites from localStorage if needed
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
      filteredStores,
      selectStore,
      toggleFavorite
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
