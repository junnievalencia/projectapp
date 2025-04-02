<template>
  <q-page padding>
    <div class="row q-mb-md items-center">
      <div class="col">
        <h4 class="q-my-xs">Your Favorites</h4>
        <p class="text-grey-8 q-my-none">
          Quickly access your favorite stores and dishes
        </p>
      </div>
      <div>
        <q-btn
          flat
          round
          color="primary"
          icon="refresh"
          @click="refreshFavorites"
          :loading="loading"
        />
      </div>
    </div>

    <!-- Tabs -->
    <div>
      <q-tabs
        v-model="activeTab"
        class="text-primary"
        inline-label
        active-color="primary"
        indicator-color="primary"
      >
        <q-tab name="stores" icon="storefront" label="Favorite Stores" />
        <q-tab name="dishes" icon="restaurant" label="Favorite Dishes" />
      </q-tabs>

      <q-separator />

      <!-- Loading State -->
      <div v-if="loading" class="column items-center q-pa-lg">
        <q-spinner color="primary" size="3em" />
        <p class="text-grey q-mt-md">Loading your favorites...</p>
      </div>

      <!-- Favorite Stores Tab -->
      <q-tab-panel name="stores">
        <div
          v-if="!loading && favoriteStores.length === 0"
          class="column items-center q-py-xl"
        >
          <q-icon name="storefront" size="5rem" color="grey-4" />
          <p class="text-h6 text-grey-8 q-mt-md">No favorite stores yet</p>
          <p class="text-grey text-center">
            Add stores to your favorites for quick access
          </p>
          <q-btn
            color="primary"
            label="Browse Stores"
            to="/customer/stores"
            class="q-mt-md"
          />
        </div>

        <div v-else>
          <div class="row q-col-gutter-md">
            <div
              v-for="store in favoriteStores"
              :key="store.id"
              class="col-12 col-sm-6 col-md-4"
            >
              <q-card class="store-card">
                <q-img
                  :src="
                    store.coverImage ||
                    'https://via.placeholder.com/500x200?text=Store+Cover'
                  "
                  height="150px"
                  :ratio="16 / 9"
                  style="border-radius: 4px 4px 0 0"
                >
                  <div class="absolute-top-right q-pa-xs">
                    <q-btn
                      round
                      flat
                      color="negative"
                      icon="favorite"
                      size="sm"
                      @click.stop="removeFromFavorites('store', store.id)"
                    />
                  </div>
                </q-img>

                <q-card-section class="q-pb-xs">
                  <div class="row items-center no-wrap">
                    <div class="col">
                      <div class="text-subtitle1 text-weight-bold ellipsis">
                        {{ store.name }}
                      </div>
                    </div>
                    <div class="col-auto">
                      <q-rating
                        v-model="store.rating"
                        size="1em"
                        color="amber"
                        icon="star"
                        readonly
                      />
                      <span class="text-grey-7 q-ml-xs">{{
                        store.reviewCount
                      }}</span>
                    </div>
                  </div>
                </q-card-section>

                <q-card-section class="q-pt-none q-pb-xs">
                  <div class="text-caption text-grey">
                    {{ store.categories.join(", ") }}
                  </div>
                </q-card-section>

                <q-card-section class="q-pt-none">
                  <div class="row items-center text-grey-8">
                    <div class="col">
                      <q-icon name="schedule" size="xs" class="q-mr-xs" />
                      {{ store.isOpen ? "Open Now" : "Closed" }}
                    </div>
                    <div class="col text-right">
                      <q-icon
                        name="delivery_dining"
                        size="xs"
                        class="q-mr-xs"
                      />
                      {{ store.deliveryTime }}
                    </div>
                  </div>
                </q-card-section>

                <q-separator />

                <q-card-actions>
                  <q-btn
                    flat
                    color="primary"
                    label="View Menu"
                    :to="`/customer/store/${store.id}`"
                    class="full-width"
                  />
                </q-card-actions>
              </q-card>
            </div>
          </div>
        </div>
      </q-tab-panel>

      <!-- Favorite Dishes Tab -->
      <q-tab-panel name="dishes">
        <div
          v-if="!loading && favoriteDishes.length === 0"
          class="column items-center q-py-xl"
        >
          <q-icon name="restaurant" size="5rem" color="grey-4" />
          <p class="text-h6 text-grey-8 q-mt-md">No favorite dishes yet</p>
          <p class="text-grey text-center">
            Add dishes to your favorites for quick reordering
          </p>
          <q-btn
            color="primary"
            label="Browse Stores"
            to="/customer/stores"
            class="q-mt-md"
          />
        </div>

        <div v-else>
          <div class="row q-col-gutter-md">
            <div
              v-for="dish in favoriteDishes"
              :key="dish.id"
              class="col-12 col-sm-6 col-md-4"
            >
              <q-card class="dish-card">
                <div class="row no-wrap">
                  <div class="col-auto">
                    <q-img
                      :src="
                        dish.imageUrl ||
                        'https://via.placeholder.com/100x100?text=Food'
                      "
                      style="
                        width: 100px;
                        height: 100px;
                        border-radius: 4px 0 0 4px;
                      "
                    />
                  </div>

                  <div class="col q-pa-md">
                    <div class="row items-start no-wrap">
                      <div class="col">
                        <div class="text-subtitle2 text-weight-bold ellipsis">
                          {{ dish.name }}
                        </div>
                        <div class="text-caption text-grey q-mt-xs">
                          {{ dish.storeName }}
                        </div>
                      </div>
                      <div class="col-auto">
                        <q-btn
                          round
                          flat
                          color="negative"
                          icon="favorite"
                          size="sm"
                          @click.stop="removeFromFavorites('dish', dish.id)"
                        />
                      </div>
                    </div>

                    <div class="text-caption ellipsis-2-lines q-mt-sm">
                      {{ dish.description }}
                    </div>

                    <div class="row items-center justify-between q-mt-md">
                      <div class="text-subtitle2 text-weight-bold text-primary">
                        ₱{{ dish.price.toFixed(2) }}
                      </div>
                      <q-btn
                        color="primary"
                        dense
                        outline
                        label="Add to Cart"
                        @click="addToCart(dish)"
                      />
                    </div>
                  </div>
                </div>
              </q-card>
            </div>
          </div>
        </div>
      </q-tab-panel>
    </div>

    <!-- Confirmation Dialog -->
    <q-dialog v-model="confirmDialog.show" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="favorite" color="negative" text-color="white" />
          <span class="q-ml-sm">Remove from favorites?</span>
        </q-card-section>

        <q-card-section>
          <p>
            Are you sure you want to remove this {{ confirmDialog.type }} from
            your favorites?
          </p>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="grey-7" v-close-popup />
          <q-btn
            flat
            label="Remove"
            color="negative"
            @click="confirmRemoveFavorite"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted } from "vue";
import { useQuasar } from "quasar";

export default defineComponent({
  name: "FavoritePage",

  setup() {
    const $q = useQuasar();

    const loading = ref(true);
    const activeTab = ref("stores");
    const favoriteStores = ref([]);
    const favoriteDishes = ref([]);
    const confirmDialog = ref({
      show: false,
      type: "",
      id: null,
    });

    // Load favorite data
    const fetchFavorites = async () => {
      loading.value = true;

      try {
        // This would be API calls in a real app
        // const storesResponse = await api.get('/customer/favorites/stores')
        // const dishesResponse = await api.get('/customer/favorites/dishes')

        // Using mock data for now
        setTimeout(() => {
          favoriteStores.value = [
            {
              id: "store1",
              name: "Juan's Filipino Cuisine",
              rating: 4.5,
              reviewCount: "(102)",
              categories: ["Filipino", "Traditional"],
              isOpen: true,
              deliveryTime: "30-45 min",
              coverImage:
                "https://via.placeholder.com/500x200?text=Filipino+Cuisine",
            },
            {
              id: "store2",
              name: "Maria's Panciteria",
              rating: 4.3,
              reviewCount: "(87)",
              categories: ["Filipino", "Noodles"],
              isOpen: true,
              deliveryTime: "20-35 min",
              coverImage:
                "https://via.placeholder.com/500x200?text=Pancit+House",
            },
            {
              id: "store3",
              name: "Sweet Delights Bakery",
              rating: 4.7,
              reviewCount: "(156)",
              categories: ["Bakery", "Desserts", "Cakes"],
              isOpen: false,
              deliveryTime: "25-40 min",
              coverImage: "https://via.placeholder.com/500x200?text=Bakery",
            },
          ];

          favoriteDishes.value = [
            {
              id: "dish1",
              name: "Adobo Rice Bowl",
              storeName: "Juan's Filipino Cuisine",
              storeId: "store1",
              price: 180.5,
              description:
                "Traditional Filipino adobo with garlic rice, topped with fried garlic and spring onions.",
              imageUrl: "https://via.placeholder.com/100x100?text=Adobo",
            },
            {
              id: "dish2",
              name: "Halo-Halo Special",
              storeName: "Juan's Filipino Cuisine",
              storeId: "store1",
              price: 95.75,
              description:
                "Refreshing Filipino dessert with shaved ice, sweet beans, fruits, and ube ice cream.",
              imageUrl: "https://via.placeholder.com/100x100?text=Halo+Halo",
            },
            {
              id: "dish3",
              name: "Pancit Canton - Family Size",
              storeName: "Maria's Panciteria",
              storeId: "store2",
              price: 250.0,
              description:
                "Stir-fried egg noodles with shrimp, chicken, vegetables, and special sauce.",
              imageUrl: "https://via.placeholder.com/100x100?text=Pancit",
            },
            {
              id: "dish4",
              name: "Ube Ensaymada (3 pcs)",
              storeName: "Sweet Delights Bakery",
              storeId: "store3",
              price: 160.0,
              description:
                "Soft Filipino brioche pastry topped with butter, sugar, and purple yam filling.",
              imageUrl: "https://via.placeholder.com/100x100?text=Ensaymada",
            },
          ];

          loading.value = false;
        }, 1000);
      } catch (error) {
        console.error("Error loading favorites:", error);
        $q.notify({
          color: "negative",
          message: "Failed to load favorites",
          icon: "error",
        });
        loading.value = false;
      }
    };

    const refreshFavorites = () => {
      fetchFavorites();
    };

    // Favorite actions
    const removeFromFavorites = (type, id) => {
      confirmDialog.value = {
        show: true,
        type: type === "store" ? "store" : "dish",
        id,
      };
    };

    const confirmRemoveFavorite = async () => {
      const { type, id } = confirmDialog.value;

      try {
        // This would be an API call in a real app
        // await api.delete(`/customer/favorites/${type}s/${id}`)

        // Update local state for now
        if (type === "store") {
          favoriteStores.value = favoriteStores.value.filter(
            (store) => store.id !== id
          );
        } else {
          favoriteDishes.value = favoriteDishes.value.filter(
            (dish) => dish.id !== id
          );
        }

        $q.notify({
          color: "positive",
          message: `${
            type === "store" ? "Store" : "Dish"
          } removed from favorites`,
          icon: "check_circle",
        });
      } catch (error) {
        console.error("Error removing from favorites:", error);
        $q.notify({
          color: "negative",
          message: `Failed to remove ${type} from favorites`,
          icon: "error",
        });
      }
    };

    const addToCart = async (dish) => {
      try {
        // This would be an API call in a real app
        // await api.post('/customer/cart', {
        //   itemId: dish.id,
        //   quantity: 1
        // })

        $q.notify({
          color: "positive",
          message: `${dish.name} added to cart`,
          icon: "shopping_cart",
        });
      } catch (error) {
        console.error("Error adding to cart:", error);
        $q.notify({
          color: "negative",
          message: "Failed to add item to cart",
          icon: "error",
        });
      }
    };

    onMounted(() => {
      fetchFavorites();
    });

    return {
      loading,
      activeTab,
      favoriteStores,
      favoriteDishes,
      confirmDialog,
      refreshFavorites,
      removeFromFavorites,
      confirmRemoveFavorite,
      addToCart,
    };
  },
});
</script>

<style lang="scss" scoped>
.store-card,
.dish-card {
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
  }
}

.ellipsis-2-lines {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
