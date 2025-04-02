<template>
  <q-page padding>
    <div class="row q-mb-md items-center">
      <div class="col">
        <h4 class="q-my-xs">Manage Products</h4>
        <p class="text-grey-8 q-my-none">
          Add new products or edit existing ones
        </p>
      </div>
      <div class="col-auto">
        <q-btn
          color="secondary"
          icon="list"
          label="View All Products"
          :to="'/seller/view-all-items'"
          flat
        />
      </div>
    </div>

    <q-card class="product-form q-mb-lg">
      <q-card-section>
        <div class="text-h6">
          {{ isEditing ? "Edit Product" : "Add New Product" }}
        </div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="saveProduct" class="q-gutter-md">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-input
                v-model="productForm.name"
                label="Product Name"
                :rules="[(val) => !!val || 'Product name is required']"
                outlined
              />
            </div>

            <div class="col-12 col-md-6">
              <q-select
                v-model="productForm.category"
                :options="categoryOptions"
                label="Category"
                outlined
                emit-value
                map-options
                :rules="[(val) => !!val || 'Category is required']"
              />
            </div>
          </div>

          <q-input
            v-model="productForm.description"
            label="Description"
            type="textarea"
            outlined
            :rules="[(val) => !!val || 'Description is required']"
          />

          <div class="row q-col-gutter-md">
            <div class="col-12 col-sm-6 col-md-4">
              <q-input
                v-model.number="productForm.price"
                label="Price (₱)"
                type="number"
                outlined
                :rules="[
                  (val) => val !== null || 'Price is required',
                  (val) => val > 0 || 'Price must be greater than 0',
                ]"
              />
            </div>
            
            <div class="col-12 col-sm-6 col-md-4">
              <q-input
                v-model.number="productForm.stock"
                label="Stock"
                type="number"
                outlined
                :rules="[
                  (val) => val !== null || 'Stock is required',
                  (val) => val >= 0 || 'Stock cannot be negative',
                ]"
              />
            </div>
          </div>

          <q-file
            v-model="productForm.image"
            label="Product Image"
            outlined
            accept=".jpg, .png, .jpeg"
            max-file-size="5242880"
            @rejected="onFileRejected"
          >
            <template v-slot:prepend>
              <q-icon name="photo" />
            </template>
          </q-file>

          <div v-if="imagePreview" class="q-mt-md">
            <p class="q-mb-xs text-caption text-grey">Image Preview:</p>
            <q-img
              :src="imagePreview"
              style="max-height: 200px; max-width: 300px"
              class="rounded-borders"
            />
          </div>

          <div class="row q-mt-lg">
            <q-space />
            <q-btn
              v-if="isEditing"
              label="Cancel"
              color="grey-7"
              flat
              class="q-mr-sm"
              @click="resetForm"
            />
            <q-btn
              type="submit"
              color="primary"
              :label="isEditing ? 'Update Product' : 'Add Product'"
              :loading="saving"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import { defineComponent, ref, computed, onMounted, watch } from "vue";
import { useQuasar } from "quasar";
import { useRouter, useRoute } from "vue-router";
import ProductService from "src/services/ProductService";
import AuthService from "src/services/AuthService";

export default defineComponent({
  name: "AddMenuPage",

  setup() {
    const $q = useQuasar();
    const router = useRouter();
    const route = useRoute();
    
    const productId = ref(null);
    const isEditing = ref(false);
    const saving = ref(false);
    const imagePreview = ref(null);

    // Product form
    const productForm = ref({
      name: "",
      description: "",
      price: null,
      stock: 0,
      category: "",
      image: null,
    });

    // Get product categories from service
    const categoryOptions = computed(() => {
      return ProductService.getProductCategories().map(category => ({
        label: category,
        value: category
      }));
    });

    // Check if we're editing an existing product
    const checkForEditMode = async () => {
      const id = route.query.id;
      if (id) {
        productId.value = id;
        isEditing.value = true;
        
        try {
          const response = await ProductService.getProduct(id);
          const product = response.data;
          
          productForm.value = {
            name: product.name,
            description: product.description,
            price: Number(product.price),
            stock: Number(product.stock) || 0,
            category: product.category,
            image: null // Can't set File object from existing image URL
          };
          
          // Set image preview if there's an existing image
          if (product.image) {
            imagePreview.value = product.image;
          }
          
        } catch (error) {
          console.error("Error loading product:", error);
          $q.notify({
            color: "negative",
            message: "Failed to load product details",
            icon: "error",
          });
          isEditing.value = false;
        }
      }
    };

    // Reset the form
    const resetForm = () => {
      productForm.value = {
        name: "",
        description: "",
        price: null,
        stock: 0,
        category: "",
        image: null,
      };
      imagePreview.value = null;
      isEditing.value = false;
      productId.value = null;
      router.replace({path: route.path}); // Remove query params
    };

    // Handle file rejection
    const onFileRejected = (rejectedEntries) => {
      rejectedEntries.forEach((entry) => {
        let msg = "";
        if (entry.failedPropValidation === "accept") {
          msg = "Please upload an image file (JPG, PNG, JPEG)";
        } else if (entry.failedPropValidation === "max-file-size") {
          msg = "Image is too large. Maximum size is 5MB";
        } else {
          msg = "File upload failed";
        }
        
        $q.notify({
          color: "negative",
          message: msg,
          icon: "error",
        });
      });
    };

    // Save product
    const saveProduct = async () => {
      saving.value = true;
      
      try {
        // Check authentication
        const userData = AuthService.getUserData();
        if (!userData || !userData.uid) {
          $q.notify({
            color: "negative",
            message: "You must be logged in to add products",
            icon: "error",
          });
          router.push("/login");
          return;
        }

        // Validate form
        if (!productForm.value.name || 
            !productForm.value.description || 
            productForm.value.price === null || 
            !productForm.value.category) {
          $q.notify({
            color: "negative",
            message: "Please fill in all required fields",
            icon: "error",
          });
          saving.value = false;
          return;
        }

        let response;
        if (isEditing.value && productId.value) {
          // Update existing product
          response = await ProductService.updateProduct(productId.value, productForm.value);
          $q.notify({
            color: "positive",
            message: "Product updated successfully",
            icon: "check_circle",
          });
        } else {
          // Add new product
          response = await ProductService.addProduct(productForm.value);
          $q.notify({
            color: "positive",
            message: "Product added successfully",
            icon: "check_circle",
          });
        }
        
        // Reset form and navigate back to product list
        resetForm();
        router.push("/seller/view-all-items");
        
      } catch (error) {
        console.error("Error saving product:", error);
        $q.notify({
          color: "negative",
          message: error.message || "Failed to save product",
          icon: "error",
        });
      } finally {
        saving.value = false;
      }
    };

    // Generate image preview when file is selected
    watch(() => productForm.value.image, (newImage) => {
      if (newImage instanceof File) {
        const reader = new FileReader();
        reader.onload = (e) => {
          imagePreview.value = e.target.result;
        };
        reader.readAsDataURL(newImage);
      } else if (!newImage) {
        // If image is cleared, clear the preview as well
        // but keep preview if editing with existing remote image
        if (!isEditing.value) {
          imagePreview.value = null;
        }
      }
    });

    onMounted(() => {
      checkForEditMode();
    });

    return {
      productForm,
      isEditing,
      saving,
      categoryOptions,
      imagePreview,
      onFileRejected,
      saveProduct,
      resetForm
    };
  },
});
</script>

<style lang="scss" scoped>
.product-form {
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }
}
</style>
