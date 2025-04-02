<template>
  <q-page>
    <div v-if="loading" class="column items-center q-pa-xl">
      <q-spinner color="primary" size="3em" />
      <p class="text-grey q-mt-md">Loading store details...</p>
    </div>

    <div v-else>
      <!-- Store Header -->
      <div class="store-header relative-position">
        <q-img
          :src="
            store.coverImage ||
            'https://via.placeholder.com/1200x400?text=Store+Cover'
          "
          height="200px"
          class="store-cover"
        >
          <div class="absolute-bottom bg-black-6">
            <div class="q-pa-md">
              <div class="row items-center">
                <div class="col">
                  <div class="text-h5 text-white">{{ store.name }}</div>
                  <div class="text-subtitle2 text-white">
                    {{ store.categories.join(", ") }}
                  </div>
                </div>
                <div class="col-auto">
                  <q-btn
                    round
                    :color="store.isFavorite ? 'negative' : 'white'"
                    :text-color="store.isFavorite ? 'white' : 'grey-8'"
                    :icon="store.isFavorite ? 'favorite' : 'favorite_border'"
                    @click="toggleFavorite"
                  />
                </div>
              </div>
            </div>
          </div>
        </q-img>

        <div class="store-info-card q-mx-md q-mt-sm q-mb-lg">
          <q-card flat>
            <q-card-section>
              <div class="row items-center q-mb-md">
                <div class="col">
                  <q-rating
                    v-model="store.rating"
                    size="1em"
                    color="amber"
                    icon="star"
                    readonly
                  />
                  <span class="text-subtitle2 q-ml-sm"
                    >{{ store.rating }} ({{ store.reviewCount }} reviews)</span
                  >
                </div>
                <div class="col-auto">
                  <q-chip
                    :color="store.isOpen ? 'positive' : 'negative'"
                    text-color="white"
                    size="sm"
                    class="q-mx-sm"
                  >
                    {{ store.isOpen ? "Open Now" : "Closed" }}
                  </q-chip>
                </div>
              </div>

              <div class="row q-col-gutter-md">
                <div class="col-12 col-sm-6">
                  <q-item dense>
                    <q-item-section avatar>
                      <q-icon name="location_on" color="primary" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ store.address }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </div>

                <div class="col-12 col-sm-6">
                  <q-item dense>
                    <q-item-section avatar>
                      <q-icon name="delivery_dining" color="primary" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label
                        >{{ store.deliveryTime }} · ₱{{
                          store.deliveryFee
                        }}
                        delivery fee</q-item-label
                      >
                    </q-item-section>
                  </q-item>
                </div>

                <div class="col-12 col-sm-6">
                  <q-item dense>
                    <q-item-section avatar>
                      <q-icon name="schedule" color="primary" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ store.operatingHours }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </div>

                <div class="col-12 col-sm-6">
                  <q-item dense>
                    <q-item-section avatar>
                      <q-icon name="phone" color="primary" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ store.contactNumber }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </div>
              </div>

              <q-item v-if="store.description" class="q-px-none q-mt-md">
                <q-item-section>
                  <q-item-label header>About</q-item-label>
                  <q-item-label>{{ store.description }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Menu Categories and Search -->
      <div class="q-px-md q-pb-md">
        <div class="row items-center q-mb-md">
          <div class="col">
            <q-input
              v-model="searchQuery"
              outlined
              dense
              placeholder="Search menu items"
              clearable
              class="menu-search"
            >
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
        </div>

        <q-tabs
          v-model="activeCategory"
          dense
          class="text-primary"
          align="left"
          narrow-indicator
          no-caps
          active-color="primary"
          indicator-color="primary"
          :breakpoint="0"
        >
          <q-tab
            v-for="category in store.categories"
            :key="category"
            :name="category"
            :label="category"
          />
          <q-tab name="all" label="All Items" />
        </q-tabs>

        <q-separator class="q-mb-md" />
      </div>

      <!-- Menu Items -->
      <div class="q-px-md q-pb-xl">
        <div v-for="category in displayedCategories" :key="category">
          <div v-if="filteredMenuItems(category).length > 0">
            <h5 class="q-mb-md q-mt-lg">{{ category }}</h5>

            <div class="row q-col-gutter-md">
              <div
                v-for="item in filteredMenuItems(category)"
                :key="item.id"
                class="col-12 col-sm-6 col-md-4"
              >
                <q-card class="menu-item-card">
                  <div class="row no-wrap">
                    <div class="col">
                      <q-card-section class="q-pb-xs">
                        <div class="text-subtitle1 text-weight-bold ellipsis">
                          {{ item.name }}
                        </div>
                        <div class="text-caption ellipsis-2-lines">
                          {{ item.description }}
                        </div>
                        <div class="text-subtitle2 text-primary q-mt-sm">
                          ₱{{ item.price.toFixed(2) }}
                        </div>
                      </q-card-section>

                      <q-card-actions>
                        <q-btn
                          flat
                          color="primary"
                          icon="add_shopping_cart"
                          label="Add to Cart"
                          @click="showItemDialog(item)"
                        />
                        <q-btn
                          flat
                          round
                          :color="item.isFavorite ? 'negative' : 'grey'"
                          :icon="
                            item.isFavorite ? 'favorite' : 'favorite_border'
                          "
                          @click="toggleItemFavorite(item)"
                        />
                      </q-card-actions>
                    </div>

                    <div class="col-auto">
                      <q-img
                        :src="
                          item.imageUrl ||
                          'https://via.placeholder.com/120x120?text=Food'
                        "
                        style="width: 120px; height: 120px"
                        fit="cover"
                      />
                    </div>
                  </div>
                </q-card>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty Search Results -->
        <div
          v-if="searchQuery && !hasSearchResults"
          class="column items-center q-py-xl"
        >
          <q-icon name="search_off" size="5rem" color="grey-4" />
          <p class="text-h6 text-grey-8 q-mt-md">No items match your search</p>
          <p class="text-grey text-center">
            Try different keywords or browse categories
          </p>
          <q-btn
            color="primary"
            label="Clear Search"
            @click="searchQuery = ''"
            class="q-mt-md"
          />
        </div>
      </div>
    </div>

    <!-- Fixed Cart Summary Button -->
    <q-page-sticky
      position="bottom-right"
      :offset="[18, 18]"
      v-if="cartItemCount > 0"
    >
      <q-btn
        color="primary"
        icon="shopping_cart"
        padding="sm"
        class="cart-summary-btn"
        @click="goToCart"
      >
        {{ cartItemCount }} items · ₱{{ cartTotal.toFixed(2) }}
      </q-btn>
    </q-page-sticky>

    <!-- Item Dialog -->
    <q-dialog v-model="itemDialog" persistent>
      <q-card style="width: 90vw; max-width: 500px">
        <q-card-section class="row items-center">
          <div class="text-h6">{{ selectedItem?.name }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-img
          :src="
            selectedItem?.imageUrl ||
            'https://via.placeholder.com/500x300?text=Food'
          "
          style="height: 200px"
        />

        <q-card-section>
          <div class="text-caption text-grey">{{ selectedItem?.category }}</div>
          <div class="text-body2 q-mt-sm">{{ selectedItem?.description }}</div>
          <div class="text-subtitle1 text-primary q-mt-md">
            ₱{{ selectedItem?.price.toFixed(2) }}
          </div>
        </q-card-section>

        <q-card-section>
          <q-input
            v-model="itemSpecialInstructions"
            type="textarea"
            label="Special Instructions"
            hint="Any special requests for this item?"
            outlined
            autogrow
          />
        </q-card-section>

        <q-card-section class="row items-center">
          <div class="text-subtitle1">Quantity:</div>
          <q-space />
          <q-btn-group flat>
            <q-btn
              flat
              round
              dense
              icon="remove"
              @click="decreaseQuantity"
              :disable="itemQuantity <= 1"
            />
            <q-btn flat dense class="no-padding" style="min-width: 40px">
              {{ itemQuantity }}
            </q-btn>
            <q-btn flat round dense icon="add" @click="increaseQuantity" />
          </q-btn-group>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="grey-7" v-close-popup />
          <q-btn
            color="primary"
            label="Add to Cart - ₱{{ (selectedItem?.price * itemQuantity).toFixed(2) }}"
            @click="addToCart"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { defineComponent, ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useQuasar } from "quasar";

export default defineComponent({
  name: "StorePage",

  setup() {
    const $q = useQuasar();
    const route = useRoute();
    const router = useRouter();

    const loading = ref(true);
    const store = ref({});
    const searchQuery = ref("");
    const activeCategory = ref("all");
    const itemDialog = ref(false);
    const selectedItem = ref(null);
    const itemQuantity = ref(1);
    const itemSpecialInstructions = ref("");

    // In a real app, these would be managed via a store or API
    const cartItemCount = ref(0);
    const cartTotal = ref(0);

    // Load store data
    const fetchStoreData = async () => {
      loading.value = true;

      try {
        const storeId = route.params.id;

        // This would be an API call in a real app
        // const response = await api.get(`/stores/${storeId}`)

        // Mock data for now
        setTimeout(() => {
          store.value = {
            id: "store1",
            name: "Juan's Filipino Cuisine",
            rating: 4.5,
            reviewCount: 102,
            categories: ["Breakfast", "Lunch", "Dinner", "Desserts", "Drinks"],
            isOpen: true,
            isFavorite: false,
            deliveryTime: "30-45 min",
            deliveryFee: 50,
            address: "123 Main St, Makati City, Metro Manila",
            contactNumber: "(02) 8123 4567",
            operatingHours: "Open daily 9:00 AM - 9:00 PM",
            description:
              "Juan's Filipino Cuisine offers authentic, home-style Filipino dishes made with the freshest local ingredients. Our recipes have been passed down through generations, bringing you the true taste of the Philippines.",
            coverImage:
              "https://via.placeholder.com/1200x400?text=Filipino+Restaurant",
            menuItems: [
              // Breakfast
              {
                id: "item1",
                name: "Tapsilog",
                category: "Breakfast",
                price: 120.0,
                description: "Beef tapa with garlic fried rice and fried egg.",
                imageUrl: "https://via.placeholder.com/120x120?text=Tapsilog",
                isFavorite: true,
              },
              {
                id: "item2",
                name: "Tosilog",
                category: "Breakfast",
                price: 110.0,
                description:
                  "Sweet pork tocino with garlic fried rice and fried egg.",
                imageUrl: "https://via.placeholder.com/120x120?text=Tosilog",
                isFavorite: false,
              },
              {
                id: "item3",
                name: "Longsilog",
                category: "Breakfast",
                price: 100.0,
                description:
                  "Filipino sausage with garlic fried rice and fried egg.",
                imageUrl: "https://via.placeholder.com/120x120?text=Longsilog",
                isFavorite: false,
              },
              // Lunch
              {
                id: "item4",
                name: "Chicken Adobo",
                category: "Lunch",
                price: 150.0,
                description:
                  "Chicken marinated in soy sauce, vinegar, and garlic, served with steamed rice.",
                imageUrl:
                  "https://via.placeholder.com/120x120?text=Chicken+Adobo",
                isFavorite: false,
              },
              {
                id: "item5",
                name: "Sinigang na Baboy",
                category: "Lunch",
                price: 180.0,
                description: "Pork in sour tamarind soup with vegetables.",
                imageUrl: "https://via.placeholder.com/120x120?text=Sinigang",
                isFavorite: false,
              },
              {
                id: "item6",
                name: "Kare-Kare",
                category: "Lunch",
                price: 200.0,
                description:
                  "Oxtail and vegetables in peanut sauce, served with shrimp paste.",
                imageUrl: "https://via.placeholder.com/120x120?text=Kare+Kare",
                isFavorite: true,
              },
              // Dinner
              {
                id: "item7",
                name: "Crispy Pata",
                category: "Dinner",
                price: 350.0,
                description:
                  "Deep-fried pork knuckle served with soy-vinegar dipping sauce.",
                imageUrl:
                  "https://via.placeholder.com/120x120?text=Crispy+Pata",
                isFavorite: false,
              },
              {
                id: "item8",
                name: "Lechon Kawali",
                category: "Dinner",
                price: 220.0,
                description:
                  "Crispy deep-fried pork belly served with liver sauce.",
                imageUrl:
                  "https://via.placeholder.com/120x120?text=Lechon+Kawali",
                isFavorite: false,
              },
              // Desserts
              {
                id: "item9",
                name: "Halo-Halo Special",
                category: "Desserts",
                price: 95.0,
                description:
                  "Shaved ice with sweet beans, fruits, jelly, flan, purple yam, and ice cream.",
                imageUrl: "https://via.placeholder.com/120x120?text=Halo+Halo",
                isFavorite: false,
              },
              {
                id: "item10",
                name: "Leche Flan",
                category: "Desserts",
                price: 80.0,
                description:
                  "Filipino caramel custard made with egg yolks and condensed milk.",
                imageUrl: "https://via.placeholder.com/120x120?text=Leche+Flan",
                isFavorite: false,
              },
              // Drinks
              {
                id: "item11",
                name: "Calamansi Juice",
                category: "Drinks",
                price: 50.0,
                description:
                  "Refreshing juice made from Filipino citrus fruit.",
                imageUrl:
                  "https://via.placeholder.com/120x120?text=Calamansi+Juice",
                isFavorite: false,
              },
              {
                id: "item12",
                name: "Sago't Gulaman",
                category: "Drinks",
                price: 60.0,
                description: "Sweet drink with tapioca pearls and grass jelly.",
                imageUrl:
                  "https://via.placeholder.com/120x120?text=Sagot+Gulaman",
                isFavorite: false,
              },
            ],
          };

          loading.value = false;
        }, 1000);
      } catch (error) {
        console.error("Error loading store data:", error);
        $q.notify({
          color: "negative",
          message: "Failed to load store data",
          icon: "error",
        });
        loading.value = false;
      }
    };

    // Filter menu items based on search query and category
    const filteredMenuItems = (category) => {
      const items = store.value.menuItems || [];

      return items.filter((item) => {
        const matchesCategory =
          category === "all" || item.category === category;
        const matchesSearch =
          !searchQuery.value ||
          item.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          item.description
            .toLowerCase()
            .includes(searchQuery.value.toLowerCase());

        return matchesCategory && matchesSearch;
      });
    };

    // Check if there are any search results
    const hasSearchResults = computed(() => {
      if (!searchQuery.value) return true;

      const allCategories = ["all", ...(store.value.categories || [])];

      for (const category of allCategories) {
        if (filteredMenuItems(category).length > 0) {
          return true;
        }
      }

      return false;
    });

    // Get displayed categories based on active category
    const displayedCategories = computed(() => {
      if (activeCategory.value === "all") {
        return store.value.categories || [];
      } else {
        return [activeCategory.value];
      }
    });

    // Toggle store favorite
    const toggleFavorite = async () => {
      try {
        store.value.isFavorite = !store.value.isFavorite;

        // This would be an API call in a real app
        // await api.post(`/customer/favorites/stores/${store.value.id}`, {
        //   isFavorite: store.value.isFavorite
        // })

        $q.notify({
          color: store.value.isFavorite ? "positive" : "grey-8",
          message: store.value.isFavorite
            ? "Added to favorites"
            : "Removed from favorites",
          icon: store.value.isFavorite ? "favorite" : "favorite_border",
        });
      } catch (error) {
        console.error("Error toggling favorite:", error);
        store.value.isFavorite = !store.value.isFavorite; // Revert on error

        $q.notify({
          color: "negative",
          message: "Failed to update favorites",
          icon: "error",
        });
      }
    };

    // Toggle item favorite
    const toggleItemFavorite = async (item) => {
      try {
        item.isFavorite = !item.isFavorite;

        // This would be an API call in a real app
        // await api.post(`/customer/favorites/dishes/${item.id}`, {
        //   isFavorite: item.isFavorite
        // })

        $q.notify({
          color: item.isFavorite ? "positive" : "grey-8",
          message: item.isFavorite
            ? `${item.name} added to favorites`
            : `${item.name} removed from favorites`,
          icon: item.isFavorite ? "favorite" : "favorite_border",
        });
      } catch (error) {
        console.error("Error toggling favorite:", error);
        item.isFavorite = !item.isFavorite; // Revert on error

        $q.notify({
          color: "negative",
          message: "Failed to update favorites",
          icon: "error",
        });
      }
    };

    // Show item dialog
    const showItemDialog = (item) => {
      selectedItem.value = item;
      itemQuantity.value = 1;
      itemSpecialInstructions.value = "";
      itemDialog.value = true;
    };

    // Item quantity controls
    const increaseQuantity = () => {
      itemQuantity.value++;
    };

    const decreaseQuantity = () => {
      if (itemQuantity.value > 1) {
        itemQuantity.value--;
      }
    };

    // Add to cart
    const addToCart = async () => {
      try {
        // This would be an API call in a real app
        // await api.post('/customer/cart', {
        //   itemId: selectedItem.value.id,
        //   quantity: itemQuantity.value,
        //   specialInstructions: itemSpecialInstructions.value
        // })

        // Update cart count and total
        cartItemCount.value += itemQuantity.value;
        cartTotal.value += selectedItem.value.price * itemQuantity.value;

        $q.notify({
          color: "positive",
          message: `${itemQuantity.value} x ${selectedItem.value.name} added to cart`,
          icon: "shopping_cart",
        });

        itemDialog.value = false;
      } catch (error) {
        console.error("Error adding to cart:", error);
        $q.notify({
          color: "negative",
          message: "Failed to add item to cart",
          icon: "error",
        });
      }
    };

    // Go to cart page
    const goToCart = () => {
      router.push("/customer/cart");
    };

    // Reset search when changing category
    watch(activeCategory, () => {
      searchQuery.value = "";
    });

    onMounted(() => {
      fetchStoreData();
    });

    return {
      loading,
      store,
      searchQuery,
      activeCategory,
      itemDialog,
      selectedItem,
      itemQuantity,
      itemSpecialInstructions,
      cartItemCount,
      cartTotal,
      displayedCategories,
      hasSearchResults,
      filteredMenuItems,
      toggleFavorite,
      toggleItemFavorite,
      showItemDialog,
      increaseQuantity,
      decreaseQuantity,
      addToCart,
      goToCart,
    };
  },
});
</script>

<style lang="scss" scoped>
.store-cover {
  width: 100%;
}

.store-info-card {
  position: relative;
  margin-top: -20px;
  z-index: 1;
}

.bg-black-6 {
  background-color: rgba(0, 0, 0, 0.6);
}

.menu-search {
  max-width: 400px;
}

.menu-item-card {
  transition: transform 0.2s;
  overflow: hidden;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
  }
}

.cart-summary-btn {
  border-radius: 28px;
  min-width: 180px;
}

.ellipsis-2-lines {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
