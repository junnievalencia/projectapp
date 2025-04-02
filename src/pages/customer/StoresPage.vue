<template>
  <q-page padding>
    <div class="q-mb-lg">
      <h4 class="q-my-sm">Restaurants</h4>
      <p class="text-grey-8">Find your favorite places to eat</p>
    </div>

    <!-- Search and Filters -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-md-8">
        <q-input
          v-model="searchQuery"
          filled
          placeholder="Search restaurants"
          class="full-width"
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
          <template v-slot:append>
            <q-icon
              v-if="searchQuery"
              name="close"
              @click="searchQuery = ''"
              class="cursor-pointer"
            />
          </template>
        </q-input>
      </div>

      <div class="col-12 col-md-4">
        <q-select
          v-model="selectedCategory"
          :options="categoryOptions"
          filled
          label="Category"
          class="full-width"
          clearable
          emit-value
          map-options
        />
      </div>
    </div>

    <!-- Sort options -->
    <div class="row items-center q-mb-md">
      <div class="text-subtitle1 q-mr-md">Sort by:</div>
      <q-btn-toggle
        v-model="sortOption"
        :options="[
          { label: 'Recommended', value: 'recommended' },
          { label: 'Rating', value: 'rating' },
          { label: 'Delivery Time', value: 'deliveryTime' },
        ]"
        spread
        unelevated
        toggle-color="primary"
        class="q-mr-md"
      />
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="q-pa-lg flex flex-center">
      <q-spinner color="primary" size="3em" />
      <div class="q-ml-md text-subtitle1">Loading restaurants...</div>
    </div>

    <!-- Empty state -->
    <div
      v-else-if="filteredStores.length === 0"
      class="q-pa-lg flex flex-center column"
    >
      <q-icon name="sentiment_dissatisfied" size="4em" color="grey-7" />
      <div class="text-h6 q-mt-md">No restaurants found</div>
      <div class="text-grey-8 q-mt-sm">
        Try changing your filters or search query
      </div>
    </div>

    <!-- Store listing -->
    <div v-else class="row q-col-gutter-md">
      <div
        v-for="store in filteredStores"
        :key="store.id"
        class="col-12 col-sm-6 col-lg-4"
      >
        <q-card class="store-card" clickable @click="navigateToStore(store)">
          <q-img :src="store.image" height="150px">
            <div class="absolute-bottom text-subtitle2 bg-black-6">
              <q-badge v-if="store.promotion" color="red">{{
                store.promotion
              }}</q-badge>
            </div>
          </q-img>
          <q-card-section>
            <div class="row items-center no-wrap">
              <div class="col">
                <div class="text-h6 ellipsis">{{ store.name }}</div>
                <div class="text-subtitle2">{{ store.cuisine }}</div>
              </div>
              <div class="col-auto">
                <q-badge color="green" v-if="store.isOpen">Open</q-badge>
                <q-badge color="grey" v-else>Closed</q-badge>
              </div>
            </div>
            <div class="row items-center q-mt-xs">
              <q-icon name="star" color="amber" size="xs" />
              <span class="q-ml-xs text-grey-8"
                >{{ store.rating }} ({{ store.reviewCount }})</span
              >
              <q-space />
              <q-icon name="delivery_dining" size="xs" />
              <span class="q-ml-xs text-grey-8">{{ store.deliveryTime }}</span>
            </div>
          </q-card-section>
          <q-card-section class="q-pt-none">
            <q-chip
              v-for="tag in store.tags"
              :key="tag"
              size="sm"
              class="q-mr-xs"
            >
              {{ tag }}
            </q-chip>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";

export default defineComponent({
  name: "StoresPage",

  setup() {
    const router = useRouter();
    const route = useRoute();

    const loading = ref(true);
    const searchQuery = ref("");
    const selectedCategory = ref(null);
    const sortOption = ref("recommended");

    // Mock data for categories
    const categories = ref([
      { id: 1, name: "Filipino" },
      { id: 2, name: "Fast Food" },
      { id: 3, name: "Japanese" },
      { id: 4, name: "Chinese" },
      { id: 5, name: "Italian" },
      { id: 6, name: "Desserts" },
    ]);

    // Mock data for stores
    const stores = ref([
      {
        id: 1,
        name: "Juan's Filipino Cuisine",
        cuisine: "Filipino",
        rating: 4.7,
        reviewCount: 253,
        deliveryTime: "20-30 min",
        isOpen: true,
        image: "https://via.placeholder.com/300x150?text=Filipino+Food",
        tags: ["Adobo", "Sinigang", "Bestseller"],
      },
      {
        id: 2,
        name: "Tokyo Ramen House",
        cuisine: "Japanese",
        rating: 4.5,
        reviewCount: 187,
        deliveryTime: "25-35 min",
        isOpen: true,
        image: "https://via.placeholder.com/300x150?text=Japanese+Food",
        tags: ["Ramen", "Sushi", "Authentic"],
        promotion: "20% OFF",
      },
      {
        id: 3,
        name: "Mama Mia Pizza",
        cuisine: "Italian",
        rating: 4.3,
        reviewCount: 142,
        deliveryTime: "30-40 min",
        isOpen: true,
        image: "https://via.placeholder.com/300x150?text=Italian+Food",
        tags: ["Pizza", "Pasta", "Free Delivery"],
      },
      {
        id: 4,
        name: "Beijing House",
        cuisine: "Chinese",
        rating: 4.1,
        reviewCount: 98,
        deliveryTime: "35-45 min",
        isOpen: false,
        image: "https://via.placeholder.com/300x150?text=Chinese+Food",
        tags: ["Dimsum", "Noodles"],
      },
      {
        id: 5,
        name: "Sweet Delights",
        cuisine: "Desserts",
        rating: 4.8,
        reviewCount: 312,
        deliveryTime: "15-25 min",
        isOpen: true,
        image: "https://via.placeholder.com/300x150?text=Desserts",
        tags: ["Cakes", "Ice Cream", "Bestseller"],
        promotion: "Buy 1 Get 1",
      },
      {
        id: 6,
        name: "Burger Shack",
        cuisine: "Fast Food",
        rating: 4.0,
        reviewCount: 203,
        deliveryTime: "20-30 min",
        isOpen: true,
        image: "https://via.placeholder.com/300x150?text=Fast+Food",
        tags: ["Burgers", "Fries", "Quick Service"],
      },
    ]);

    // Convert categories to options for q-select
    const categoryOptions = computed(() => {
      return categories.value.map((cat) => ({
        label: cat.name,
        value: cat.id,
      }));
    });

    // Filter and sort stores
    const filteredStores = computed(() => {
      let result = stores.value;

      // Filter by search query
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        result = result.filter(
          (store) =>
            store.name.toLowerCase().includes(query) ||
            store.cuisine.toLowerCase().includes(query) ||
            store.tags.some((tag) => tag.toLowerCase().includes(query))
        );
      }

      // Filter by category
      if (selectedCategory.value) {
        const categoryName = categories.value.find(
          (c) => c.id === selectedCategory.value
        )?.name;
        if (categoryName) {
          result = result.filter((store) => store.cuisine === categoryName);
        }
      }

      // Sort results
      if (sortOption.value === "rating") {
        result = [...result].sort((a, b) => b.rating - a.rating);
      } else if (sortOption.value === "deliveryTime") {
        result = [...result].sort((a, b) => {
          const aTime = parseInt(a.deliveryTime.split("-")[0]);
          const bTime = parseInt(b.deliveryTime.split("-")[0]);
          return aTime - bTime;
        });
      }
      // 'recommended' is the default order, no sorting needed

      return result;
    });

    // Navigate to store detail page
    const navigateToStore = (store) => {
      router.push(`/customer/store/${store.id}`);
    };

    // Check if a category was specified in the route query
    onMounted(() => {
      const categoryId = parseInt(route.query.category);
      if (categoryId) {
        selectedCategory.value = categoryId;
      }

      // Simulate loading delay
      setTimeout(() => {
        loading.value = false;
      }, 1000);
    });

    return {
      loading,
      searchQuery,
      selectedCategory,
      sortOption,
      categories,
      stores,
      categoryOptions,
      filteredStores,
      navigateToStore,
    };
  },
});
</script>

<style lang="scss" scoped>
.store-card {
  border-radius: 12px;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }
}

.black-6 {
  background: rgba(0, 0, 0, 0.6);
}
</style>
