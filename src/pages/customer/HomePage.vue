<template>
  <q-page padding>
    <div class="q-mb-lg">
      <h4 class="q-my-sm">Welcome to BuFood!</h4>
      <p class="text-grey-8">
        Order your favorite food with just a few clicks.
      </p>
    </div>

    <!-- Search bar -->
    <q-input
      v-model="searchQuery"
      filled
      placeholder="Search for food or restaurants"
      class="q-mb-md"
      bg-color="white"
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

    <!-- Food Categories -->
    <div class="q-mb-md">
      <div class="text-h6 q-mb-sm">Categories</div>
      <div class="row q-col-gutter-md">
        <div
          v-for="category in categories"
          :key="category.id"
          class="col-4 col-sm-3 col-md-2"
        >
          <q-card
            class="category-card text-center"
            clickable
            @click="navigateToCategory(category)"
          >
            <q-img :src="category.image" :ratio="1" />
            <q-card-section class="q-py-sm">
              <div class="text-subtitle2">{{ category.name }}</div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <!-- Featured Restaurants -->
    <div class="q-mb-md">
      <div class="text-h6 q-mb-sm">Featured Restaurants</div>
      <div class="row q-col-gutter-md">
        <div
          v-for="store in featuredStores"
          :key="store.id"
          class="col-12 col-sm-6 col-md-4"
        >
          <q-card class="store-card" clickable @click="navigateToStore(store)">
            <q-img :src="store.image" height="150px" />
            <q-card-section>
              <div class="text-h6">{{ store.name }}</div>
              <div class="text-subtitle2">{{ store.cuisine }}</div>
              <div class="row items-center q-mt-xs">
                <q-icon name="star" color="amber" size="xs" />
                <span class="q-ml-xs text-grey-8"
                  >{{ store.rating }} ({{ store.reviewCount }})</span
                >
                <q-space />
                <q-icon name="delivery_dining" size="xs" />
                <span class="q-ml-xs text-grey-8">{{
                  store.deliveryTime
                }}</span>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <!-- Recommended for You -->
    <div class="q-mb-md">
      <div class="text-h6 q-mb-sm">Recommended for You</div>
      <div class="row q-col-gutter-md">
        <div
          v-for="food in recommendedFoods"
          :key="food.id"
          class="col-6 col-md-3"
        >
          <q-card class="food-card" clickable @click="navigateToFood(food)">
            <q-img :src="food.image" height="120px" />
            <q-card-section class="q-py-sm">
              <div class="text-subtitle1">{{ food.name }}</div>
              <div class="text-grey-8 text-caption">{{ food.storeName }}</div>
              <div class="row justify-between items-center q-mt-xs">
                <div class="text-weight-bold">₱{{ food.price.toFixed(2) }}</div>
                <q-btn
                  round
                  flat
                  color="primary"
                  size="sm"
                  icon="add_shopping_cart"
                  @click.stop="addToCart(food)"
                />
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import ProductService from "src/services/ProductService";
import CustomerService from "src/services/CustomerService";
import AuthService from "src/services/AuthService";

export default defineComponent({
  name: "HomePage",

  setup() {
    const router = useRouter();
    const loading = ref(true);
    const error = ref(false);
    const searchQuery = ref("");
    const stores = ref([]);
    const popularItems = ref([]);
    const userName = ref("");

    // Load user data
    const loadUserData = () => {
      const userData = AuthService.getUserData();
      if (userData) {
        userName.value = userData.name;
      }
    };

    // Fetch stores from the backend
    const fetchStores = async () => {
      try {
        loading.value = true;
        const response = await CustomerService.getStores();
        stores.value = response.data;
      } catch (err) {
        console.error("Error fetching stores:", err);
        error.value = true;
      } finally {
        loading.value = false;
      }
    };

    // Fetch popular items
    const fetchPopularItems = async () => {
      try {
        loading.value = true;
        const response = await ProductService.getProducts();
        // In a real app, you would filter by popularity or have a dedicated endpoint
        // For now, just use the first few products
        popularItems.value = response.data.slice(0, 6);
      } catch (err) {
        console.error("Error fetching popular items:", err);
        error.value = true;
      } finally {
        loading.value = false;
      }
    };

    // Filtered stores based on search query
    const filteredStores = computed(() => {
      if (!searchQuery.value) return stores.value;
      const query = searchQuery.value.toLowerCase();
      return stores.value.filter(
        (store) =>
          store.name.toLowerCase().includes(query) ||
          store.description.toLowerCase().includes(query) ||
          (store.categories &&
            store.categories.some((cat) => cat.toLowerCase().includes(query)))
      );
    });

    // Navigate to store details
    const goToStore = (storeId) => {
      router.push(`/customer/store/${storeId}`);
    };

    // Navigate to stores listing
    const viewAllStores = () => {
      router.push("/customer/stores");
    };

    onMounted(() => {
      loadUserData();
      fetchStores();
      fetchPopularItems();
    });

    return {
      loading,
      error,
      searchQuery,
      stores: filteredStores,
      popularItems,
      userName,
      goToStore,
      viewAllStores,
    };
  },
});
</script>

<style lang="scss" scoped>
.category-card {
  border-radius: 12px;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-5px);
  }
}

.store-card,
.food-card {
  border-radius: 12px;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }
}
</style>
