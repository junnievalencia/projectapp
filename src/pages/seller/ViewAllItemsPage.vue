<template>
  <q-page padding>
    <div class="row q-mb-md items-center">
      <div class="col">
        <h4 class="q-my-xs">My Products</h4>
        <p class="text-grey-8 q-my-none">Manage your product inventory</p>
      </div>
      <div class="col-auto">
        <q-btn
          color="primary"
          icon="add"
          label="Add New Product"
          :to="'/seller/add-menu'"
        />
      </div>
    </div>

    <q-card class="q-mb-md">
      <q-card-section>
        <div class="row items-center q-col-gutter-md">
          <div class="col-12 col-sm-6">
            <q-input
              dense
              outlined
              v-model="search"
              label="Search products"
              class="q-mb-sm"
            >
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-sm-3">
            <q-select
              v-model="categoryFilter"
              :options="categoryOptions"
              label="Filter by Category"
              outlined
              dense
              options-dense
              emit-value
              map-options
            />
          </div>
          <div class="col-12 col-sm-3">
            <q-select
              v-model="stockFilter"
              :options="stockOptions"
              label="Stock Status"
              outlined
              dense
              options-dense
              emit-value
              map-options
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Loading State -->
    <div v-if="loading" class="column items-center q-pa-lg">
      <q-spinner color="primary" size="3em" />
      <p class="text-grey q-mt-md">Loading products...</p>
    </div>

    <!-- Empty State -->
    <q-card v-else-if="filteredItems.length === 0" class="text-center q-pa-lg">
      <q-icon name="inventory_2" size="5rem" color="grey-4" />
      <p class="text-h6 text-grey-8 q-mt-md">No products found</p>
      <p class="text-grey" v-if="hasFilters">
        Try removing filters or adjusting your search
      </p>
      <p class="text-grey" v-else>Add your first product to get started</p>
      <q-btn
        color="primary"
        label="Add New Product"
        class="q-mt-md"
        :to="'/seller/add-menu'"
      />
    </q-card>

    <!-- Items Grid -->
    <div v-else>
      <div class="row q-col-gutter-md">
        <div
          v-for="item in filteredItems"
          :key="item.id"
          class="col-12 col-sm-6 col-md-4 col-lg-3"
        >
          <q-card class="product-card">
            <q-img
              :src="item.image || 'https://via.placeholder.com/300x200?text=No+Image'"
              height="200px"
              class="product-image"
            >
              <template v-slot:error>
                <div class="absolute-full flex flex-center bg-grey-3">
                  <q-icon
                    name="image_not_supported"
                    size="3rem"
                    color="grey-7"
                  />
                </div>
              </template>

              <div class="absolute-top-right q-pa-xs">
                <q-badge
                  :color="getStockColor(item.stock)"
                  class="q-py-xs q-px-sm"
                >
                  {{ getStockStatus(item.stock) }}
                </q-badge>
              </div>
            </q-img>

            <q-card-section>
              <div class="row items-center no-wrap">
                <div class="col">
                  <div class="text-subtitle1 text-weight-bold">
                    {{ item.name }}
                  </div>
                  <div class="text-caption text-primary">
                    {{ item.category }}
                  </div>
                </div>
                <div class="col-auto text-h6 text-primary">
                  ₱{{ Number(item.price).toFixed(2) }}
                </div>
              </div>

              <q-separator class="q-my-sm" />

              <div class="text-caption text-grey-8 ellipsis-2-lines">
                {{ item.description || "No description available" }}
              </div>
              
              <div class="row items-center q-mt-sm">
                <div class="col">
                  <span class="text-caption text-grey-8">Stock:</span>
                </div>
                <div class="col-auto">
                  <q-badge :color="getStockColor(item.stock)" text-color="white">
                    {{ item.stock }} in stock
                  </q-badge>
                </div>
              </div>
            </q-card-section>

            <q-card-actions align="between">
              <q-btn
                flat
                color="primary"
                icon="edit"
                label="Edit"
                @click="editItem(item.id)"
              />
              <q-btn-dropdown flat color="grey" icon="more_vert" label="">
                <q-list>
                  <q-item clickable v-close-popup @click="updateStock(item)">
                    <q-item-section avatar>
                      <q-icon name="inventory" color="primary" />
                    </q-item-section>
                    <q-item-section>Update Stock</q-item-section>
                  </q-item>
                  
                  <q-item clickable v-close-popup @click="confirmDelete(item)">
                    <q-item-section avatar>
                      <q-icon name="delete" color="negative" />
                    </q-item-section>
                    <q-item-section>Delete Product</q-item-section>
                  </q-item>
                </q-list>
              </q-btn-dropdown>
            </q-card-actions>
          </q-card>
        </div>
      </div>
    </div>
    
    <!-- Stock Update Dialog -->
    <q-dialog v-model="stockDialog.show" persistent>
      <q-card style="min-width: 350px">
        <q-card-section class="row items-center">
          <div class="text-h6">Update Stock</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        
        <q-card-section>
          <q-input
            v-model.number="stockDialog.stock"
            type="number"
            label="Stock Quantity"
            outlined
            min="0"
            :rules="[val => val >= 0 || 'Stock cannot be negative']"
          />
        </q-card-section>
        
        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="grey" v-close-popup />
          <q-btn 
            flat 
            label="Save" 
            color="primary" 
            @click="saveStock" 
            :disable="stockDialog.stock < 0"
            :loading="stockDialog.loading"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
    
    <!-- Delete Confirmation Dialog -->
    <q-dialog v-model="deleteDialog.show" persistent>
      <q-card style="min-width: 350px">
        <q-card-section class="row items-center">
          <div class="text-h6">Confirm Deletion</div>
        </q-card-section>
        
        <q-card-section v-if="deleteDialog.item">
          <p>Are you sure you want to delete <strong>{{ deleteDialog.item.name }}</strong>?</p>
          <p class="text-negative text-caption q-mb-none">This action cannot be undone.</p>
        </q-card-section>
        
        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="grey" v-close-popup />
          <q-btn 
            flat 
            label="Delete" 
            color="negative" 
            @click="deleteProduct" 
            :loading="deleteDialog.loading"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { defineComponent, ref, computed, onMounted } from "vue";
import { useQuasar } from "quasar";
import { useRouter } from "vue-router";
import ProductService from "src/services/ProductService";
import AuthService from "src/services/AuthService";

export default defineComponent({
  name: "ViewAllItemsPage",

  setup() {
    const $q = useQuasar();
    const router = useRouter();
    const loading = ref(true);
    const products = ref([]);
    
    // Filters
    const search = ref("");
    const categoryFilter = ref("all");
    const stockFilter = ref("all");

    // Dialogs
    const stockDialog = ref({
      show: false,
      item: null,
      stock: 0,
      loading: false
    });
    
    const deleteDialog = ref({
      show: false,
      item: null,
      loading: false
    });

    const stockOptions = [
      { label: "All Products", value: "all" },
      { label: "In Stock", value: "inStock" },
      { label: "Low Stock", value: "lowStock" },
      { label: "Out of Stock", value: "outOfStock" },
    ];

    // Computed properties
    const categoryOptions = computed(() => {
      // Get unique categories from products
      const categories = [...new Set(products.value.map(p => p.category))];
      
      return [
        { label: "All Categories", value: "all" },
        ...categories.map(category => ({
          label: category,
          value: category,
        })),
      ];
    });

    const hasFilters = computed(() => {
      return (
        search.value.trim() !== "" ||
        categoryFilter.value !== "all" ||
        stockFilter.value !== "all"
      );
    });

    const filteredItems = computed(() => {
      let result = products.value;

      // Filter by search term
      if (search.value.trim() !== "") {
        const searchLower = search.value.toLowerCase();
        result = result.filter(
          (item) =>
            item.name.toLowerCase().includes(searchLower) ||
            (item.description &&
              item.description.toLowerCase().includes(searchLower))
        );
      }

      // Filter by category
      if (categoryFilter.value !== "all") {
        result = result.filter(
          (item) => item.category === categoryFilter.value
        );
      }

      // Filter by stock status
      if (stockFilter.value !== "all") {
        if (stockFilter.value === "inStock") {
          result = result.filter((item) => item.stock > 5);
        } else if (stockFilter.value === "lowStock") {
          result = result.filter((item) => item.stock > 0 && item.stock <= 5);
        } else if (stockFilter.value === "outOfStock") {
          result = result.filter((item) => item.stock === 0);
        }
      }

      return result;
    });

    // Fetch products from API
    const fetchProducts = async () => {
      loading.value = true;

      try {
        // Get seller ID from AuthService
        const userData = AuthService.getUserData();
        if (!userData || !userData.uid) {
          $q.notify({
            color: "negative",
            message: "Authentication error. Please login again.",
            icon: "error",
          });
          router.push("/login");
          return;
        }
        
        const sellerId = userData.uid;
        const response = await ProductService.getProductsBySeller(sellerId);
        
        if (response && response.data) {
          products.value = response.data;
        } else {
          products.value = [];
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        $q.notify({
          color: "negative",
          message: "Failed to load products",
          icon: "error",
        });
        products.value = [];
      } finally {
        loading.value = false;
      }
    };

    const getStockStatus = (stock) => {
      if (stock === 0) return "Out of Stock";
      if (stock <= 5) return "Low Stock";
      return "In Stock";
    };

    const getStockColor = (stock) => {
      if (stock === 0) return "negative";
      if (stock <= 5) return "orange";
      return "positive";
    };

    const editItem = (itemId) => {
      // Navigate to the edit page with the item ID
      router.push(`/seller/add-menu?id=${itemId}`);
    };

    const updateStock = (item) => {
      stockDialog.value = {
        show: true,
        item: item,
        stock: item.stock,
        loading: false
      };
    };
    
    const saveStock = async () => {
      if (!stockDialog.value.item) return;
      
      stockDialog.value.loading = true;
      
      try {
        const response = await ProductService.updateProductStock(
          stockDialog.value.item.id, 
          stockDialog.value.stock
        );
        
        // Update the local state
        const index = products.value.findIndex(p => p.id === stockDialog.value.item.id);
        if (index !== -1) {
          products.value[index].stock = stockDialog.value.stock;
        }
        
        $q.notify({
          color: "positive",
          message: "Stock updated successfully",
          icon: "check_circle",
        });
        
        stockDialog.value.show = false;
      } catch (error) {
        console.error("Error updating stock:", error);
        $q.notify({
          color: "negative",
          message: "Failed to update stock",
          icon: "error",
        });
      } finally {
        stockDialog.value.loading = false;
      }
    };
    
    const confirmDelete = (item) => {
      deleteDialog.value = {
        show: true,
        item: item,
        loading: false
      };
    };
    
    const deleteProduct = async () => {
      if (!deleteDialog.value.item) return;
      
      deleteDialog.value.loading = true;
      
      try {
        await ProductService.deleteProduct(deleteDialog.value.item.id);
        
        // Remove from local state
        products.value = products.value.filter(p => p.id !== deleteDialog.value.item.id);
        
        $q.notify({
          color: "positive",
          message: "Product deleted successfully",
          icon: "check_circle",
        });
        
        deleteDialog.value.show = false;
      } catch (error) {
        console.error("Error deleting product:", error);
        $q.notify({
          color: "negative",
          message: "Failed to delete product",
          icon: "error",
        });
      } finally {
        deleteDialog.value.loading = false;
      }
    };

    onMounted(() => {
      fetchProducts();
    });

    return {
      loading,
      products,
      search,
      categoryFilter,
      stockFilter,
      categoryOptions,
      stockOptions,
      hasFilters,
      filteredItems,
      stockDialog,
      deleteDialog,
      getStockStatus,
      getStockColor,
      editItem,
      updateStock,
      saveStock,
      confirmDelete,
      deleteProduct
    };
  },
});
</script>

<style lang="scss" scoped>
.product-card {
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }

  .product-image {
    border-top-left-radius: inherit;
    border-top-right-radius: inherit;
  }
}

.ellipsis-2-lines {
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  min-height: 38px;
}
</style>
