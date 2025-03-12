<template>
  <q-page class="bg-grey-1">
    <!-- Header -->
    <div class="q-pa-md bg-white">
      <div class="row items-center">
        <q-btn flat round icon="arrow_back" color="black" @click="$router.go(-1)" />
        <div class="text-h6 text-weight-bold q-ml-sm">FAVORITES</div>
      </div>

      <!-- Search Bar -->
      <div class="q-mt-md">
        <q-input
          v-model="search"
          placeholder="Search Store"
          outlined
          rounded
          bg-color="grey-2"
          dense
        >
          <template v-slot:prepend>
            <q-icon name="search" color="grey" />
          </template>
        </q-input>
      </div>

      <!-- Tabs -->
      <div class="row q-mt-md q-col-gutter-md">
        <div class="col-6">
          <q-btn
            :color="activeTab === 'products' ? 'orange' : 'white'"
            :text-color="activeTab === 'products' ? 'white' : 'black'"
            label="Products"
            class="full-width"
            rounded
            unelevated
            @click="activeTab = 'products'"
          />
        </div>
        <div class="col-6">
          <q-btn
            :color="activeTab === 'stores' ? 'orange' : 'white'"
            :text-color="activeTab === 'stores' ? 'white' : 'black'"
            label="Stores"
            class="full-width"
            rounded
            unelevated
            @click="activeTab = 'stores'"
          />
        </div>
      </div>
    </div>

    <!-- Favorites Content -->
    <div class="q-pa-md">
      <!-- Products Tab -->
      <div v-if="activeTab === 'products'">
        <q-pull-to-refresh @refresh="refreshProducts">
          <!-- Empty state when no favorite products -->
          <div v-if="!hasFavoriteProducts()" class="column items-center justify-center q-py-xl">
            <q-icon name="favorite_border" size="100px" color="grey-4" />
            <div class="text-h6 text-grey q-mt-md">No favorite products yet</div>
            <div class="text-subtitle1 text-grey text-center q-mt-sm">
              Products you mark as favorite will appear here
            </div>
            <q-btn
              color="orange"
              label="Browse Food"
              class="q-mt-lg"
              to="/home"
              rounded
              unelevated
            />
          </div>

          <!-- Favorite Products Grid -->
          <div v-else class="row q-col-gutter-md">
            <div v-for="item in filteredProducts" :key="item.id" class="col-6">
              <q-card class="food-card">
                <q-img :src="item.image" height="120px">
                  <div class="absolute-top-right q-pa-xs">
                    <q-btn
                      round
                      flat
                      color="orange"
                      icon="favorite"
                      size="sm"
                      @click="removeFromFavorites(item.id)"
                    />
                  </div>
                </q-img>
                <q-card-section class="q-pa-sm">
                  <div class="text-subtitle1 ellipsis">{{ item.name }}</div>
                  <div class="text-caption text-grey">{{ item.restaurant }}</div>
                  <div class="row justify-between items-center q-mt-xs">
                    <div class="text-subtitle1 text-weight-bold">₱{{ item.price }}</div>
                    <q-btn
                      round
                      color="orange"
                      icon="add_shopping_cart"
                      size="sm"
                      flat
                      @click="addToCart(item)"
                    />
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </q-pull-to-refresh>
      </div>

      <!-- Stores Tab -->
      <div v-if="activeTab === 'stores'">
        <q-pull-to-refresh @refresh="refreshStores">
          <!-- Empty state when no favorite stores -->
          <div v-if="!hasFavoriteStores()" class="column items-center justify-center q-py-xl">
            <q-icon name="favorite_border" size="100px" color="grey-4" />
            <div class="text-h6 text-grey q-mt-md">No favorite stores yet</div>
            <div class="text-subtitle1 text-grey text-center q-mt-sm">
              Stores you mark as favorite will appear here
            </div>
            <q-btn
              color="orange"
              label="Browse Stores"
              class="q-mt-lg"
              to="/stores"
              rounded
              unelevated
            />
          </div>

          <!-- Favorite Stores List -->
          <div v-else>
            <q-card v-for="store in filteredStores" :key="store.id" class="q-mb-md store-card">
              <q-card-section class="row items-center q-pa-md">
                <q-avatar size="50px" class="q-mr-md">
                  <img :src="getImageSrc(store.image)" alt="Store Image">
                </q-avatar>
                <div class="col">
                  <div class="text-h6">{{ store.name }}</div>
                </div>
                <div class="col-auto">
                  <q-btn
                    round
                    flat
                    color="orange"
                    icon="favorite"
                    @click="removeStoreFromFavorites(store.id)"
                  />
                </div>
              </q-card-section>
            </q-card>
          </div>
        </q-pull-to-refresh>
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
        <q-tab name="favorites" icon="favorite" label="Favorites" to="/favorites" />
        <q-tab name="cart" icon="shopping_cart" label="Cart" to="/cart" />
        <q-tab name="profile" icon="person" label="Profile" to="/profile" />
      </q-tabs>
    </q-footer>
  </q-page>
</template>

<script>
import { defineComponent } from 'vue'
import { useFavoritesPage } from './FavoritesPage.js'

export default defineComponent({
  name: 'FavoritesPage',
  setup () {
    const {
      search,
      activeTab,
      tab,
      favoriteProducts,
      favoriteStores,
      filteredProducts,
      filteredStores,
      hasFavoriteProducts,
      hasFavoriteStores,
      removeFromFavorites,
      removeStoreFromFavorites,
      addToCart,
      refreshProducts,
      refreshStores,
      isLoading,
      getImageSrc
    } = useFavoritesPage()

    return {
      search,
      activeTab,
      tab,
      favoriteProducts,
      favoriteStores,
      filteredProducts,
      filteredStores,
      hasFavoriteProducts,
      hasFavoriteStores,
      removeFromFavorites,
      removeStoreFromFavorites,
      addToCart,
      refreshProducts,
      refreshStores,
      isLoading,
      getImageSrc
    }
  }
})
</script>

<style lang="scss" scoped>
.food-card {
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.2s;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
}

.store-card {
  border-radius: 16px;
  overflow: hidden;
  transition: transform 0.2s;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
}

.ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
