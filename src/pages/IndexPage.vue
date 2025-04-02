<template>
  <q-page class="q-pa-md">
    <h1 class="text-h4 q-mb-lg text-center">BuFood - Food Delivery App</h1>

    <div class="row justify-center q-mb-md">
      <div class="col-12 col-md-8">
        <q-input
          v-model="searchTerm"
          outlined
          dense
          placeholder="Search for your favorite food..."
          class="search-input"
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
    </div>

    <div class="category-tabs q-mb-lg">
      <q-tabs
        v-model="selectedCategory"
        dense
        class="text-primary"
        active-color="primary"
        indicator-color="primary"
        align="justify"
        narrow-indicator
      >
        <q-tab name="all" label="All" />
        <q-tab name="main" label="Main Dishes" />
        <q-tab name="dessert" label="Desserts" />
        <q-tab name="drink" label="Drinks" />
        <q-tab name="snack" label="Snacks" />
      </q-tabs>
    </div>

    <div v-if="loading" class="row justify-center q-py-lg">
      <q-spinner-dots color="primary" size="40px" />
    </div>

    <div v-else-if="filteredProducts.length === 0" class="row justify-center q-py-lg">
      <div class="text-h6 text-grey">No products found</div>
    </div>

    <div v-else class="row q-col-gutter-md">
      <div
        v-for="product in filteredProducts"
        :key="product.id"
        class="col-12 col-sm-6 col-md-4 col-lg-3"
      >
        <product-card :product="product" />
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref, computed, onMounted } from 'vue';
import ProductCard from 'components/ProductCard.vue';
import ProductService from 'src/services/ProductService';
import { useQuasar } from 'quasar';

export default defineComponent({
  name: 'IndexPage',

  components: {
    ProductCard
  },

  setup() {
    const $q = useQuasar();
    const products = ref([]);
    const loading = ref(true);
    const searchTerm = ref('');
    const selectedCategory = ref('all');

    const fetchProducts = async () => {
      try {
        loading.value = true;
        const response = await ProductService.getProducts();
        products.value = response.data;
      } catch (error) {
        console.error('Error fetching products:', error);
        $q.notify({
          color: 'negative',
          message: 'Failed to load products',
          icon: 'error'
        });
      } finally {
        loading.value = false;
      }
    };

    const filteredProducts = computed(() => {
      let result = products.value;

      // Filter by category
      if (selectedCategory.value !== 'all') {
        result = result.filter(p => p.category === selectedCategory.value);
      }

      // Filter by search term
      if (searchTerm.value) {
        const term = searchTerm.value.toLowerCase();
        result = result.filter(p =>
          p.name.toLowerCase().includes(term) ||
          (p.description && p.description.toLowerCase().includes(term))
        );
      }

      return result;
    });

    onMounted(fetchProducts);

    return {
      products,
      loading,
      searchTerm,
      selectedCategory,
      filteredProducts
    };
  }
});
</script>

<style lang="scss" scoped>
.search-input {
  transition: all 0.3s;

  &:focus-within {
    transform: scale(1.02);
  }
}

.category-tabs {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.1);
}
</style>
