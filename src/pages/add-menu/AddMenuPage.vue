<template>
  <q-page class="add-menu-page q-pa-md">
    <!-- Page Header with Back Button -->
    <div class="page-header q-mb-md">
      <q-btn
        icon="arrow_back"
        flat
        round
        color="primary"
        @click="goBack"
        class="q-mr-sm"
      />
      <div class="text-h6">Menu Management</div>
    </div>

    <!-- Search and Add Category Section -->
    <div class="toolbar-section q-mb-lg">
      <div class="row justify-between items-center">
        <q-input
          v-model="search"
          placeholder="Search categories..."
          outlined
          dense
          class="col-grow search-input q-mr-md"
          style="max-width: 300px"
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
          <template v-slot:append v-if="search">
            <q-icon name="close" @click="search = ''" class="cursor-pointer" />
          </template>
        </q-input>
        
        <q-btn
          color="primary"
          icon="add_circle"
          label="Add Category"
          @click="categoryDialog = true"
        />
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container q-my-xl">
      <q-spinner-dots color="primary" size="40px" />
      <div class="q-mt-sm text-grey text-body1">Loading menu data...</div>
    </div>

    <!-- No Categories State -->
    <div v-else-if="filteredCategories.length === 0" class="no-data-container q-my-xl text-center">
      <q-icon name="restaurant_menu" size="80px" color="grey-5" />
      <div class="text-h6 q-mt-md text-grey-8">No Categories</div>
      <div class="text-body1 text-grey q-mt-sm">
        There are no food categories yet.
        <br>
        <q-btn
          color="primary"
          label="Add Your First Category"
          class="q-mt-md"
          @click="categoryDialog = true"
        />
      </div>
    </div>

    <!-- Categories List -->
    <div v-else class="categories-container">
      <q-list separator>
        <div v-for="category in filteredCategories" :key="category.id" class="category-section q-mb-lg">
          <!-- Category Header -->
          <div class="category-header row items-center q-mb-md">
            <div class="row items-center col-grow">
              <q-avatar size="40px" class="q-mr-md">
                <img 
                  :src="category.imageUrl" 
                  v-if="category.imageUrl && category.imageUrl.length > 0" 
                  @error="handleImageError($event, 'category')"
                />
                <q-icon name="category" size="40px" v-else />
              </q-avatar>
              <div>
                <div class="text-h6">{{ category.name }}</div>
                <div class="text-caption text-grey">{{ category.description || 'No description' }}</div>
              </div>
            </div>
            <div class="row q-gutter-sm">
              <q-btn 
                color="primary" 
                icon="add" 
                flat 
                dense 
                round
                @click="openFoodItemDialog(category.id)"
              >
                <q-tooltip>Add Food Item</q-tooltip>
              </q-btn>
              <q-btn 
                color="negative" 
                icon="delete" 
                flat 
                dense 
                round
                @click="deleteCategory(category)"
              >
                <q-tooltip>Delete Category</q-tooltip>
              </q-btn>
            </div>
          </div>

          <!-- Food Items -->
          <div v-if="category.foodItems.length === 0" class="no-food-items q-mb-sm text-center text-grey q-py-md">
            <q-icon name="restaurant" size="24px" class="q-mr-xs" />
            No food items in this category.
            <q-btn flat color="primary" label="Add Item" @click="openFoodItemDialog(category.id)" />
          </div>
          
          <div v-else class="food-items-grid row q-col-gutter-md">
            <div 
              v-for="foodItem in category.foodItems" 
              :key="foodItem.id" 
              class="col-12 col-sm-6 col-md-4 col-lg-3"
            >
              <q-card class="food-item-card" :class="{ 'unavailable': !foodItem.isAvailable }">
                <q-img
                  :src="foodItem.imageUrl"
                  v-if="foodItem.imageUrl && foodItem.imageUrl.length > 0"
                  basic
                  height="180px"
                  @error="handleImageError($event, 'food', foodItem)"
                >
                  <div class="absolute-top-right q-pa-xs">
                    <q-badge 
                      :color="foodItem.isAvailable ? 'green' : 'red'" 
                      :label="foodItem.isAvailable ? 'Available' : 'Unavailable'"
                    />
                  </div>
                </q-img>
                <q-img
                  src="https://placehold.co/400x300/e0e0e0/cccccc?text=No+Image"
                  v-else
                  basic
                  height="180px"
                >
                  <div class="absolute-top-right q-pa-xs">
                    <q-badge 
                      :color="foodItem.isAvailable ? 'green' : 'red'" 
                      :label="foodItem.isAvailable ? 'Available' : 'Unavailable'"
                    />
                  </div>
                </q-img>
                
                <q-card-section>
                  <div class="text-subtitle1 text-weight-bold">{{ foodItem.name }}</div>
                  <div class="text-caption text-grey q-mb-sm">{{ foodItem.description || 'No description' }}</div>
                  <div class="text-h6 text-primary">₱{{ foodItem.price.toFixed(2) }}</div>
                </q-card-section>
                
                <q-card-actions align="right">
                  <q-btn 
                    flat 
                    round 
                    :color="foodItem.isAvailable ? 'red' : 'green'" 
                    :icon="foodItem.isAvailable ? 'cancel' : 'check_circle'" 
                    @click="toggleFoodItemAvailability(category.id, foodItem)"
                  >
                    <q-tooltip>{{ foodItem.isAvailable ? 'Mark as Unavailable' : 'Mark as Available' }}</q-tooltip>
                  </q-btn>
                  <q-btn 
                    flat 
                    round 
                    color="negative" 
                    icon="delete" 
                    @click="deleteFoodItem(category.id, foodItem)"
                  >
                    <q-tooltip>Delete</q-tooltip>
                  </q-btn>
                </q-card-actions>
              </q-card>
            </div>
          </div>
        </div>
      </q-list>
    </div>

    <!-- Add Category Dialog -->
    <q-dialog v-model="categoryDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Add New Category</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup @click="resetCategoryForm" />
        </q-card-section>

        <q-card-section>
          <q-form @submit="addCategory">
            <q-input
              v-model="newCategory.name"
              label="Category Name *"
              :rules="[val => !!val.trim() || 'Name is required']"
              outlined
              class="q-mb-md"
            />
            
            <q-input
              v-model="newCategory.description"
              label="Description"
              type="textarea"
              outlined
              class="q-mb-md"
            />
            
            <div class="text-caption q-mb-xs">Category Image</div>
            <div class="image-upload-area q-mb-md">
              <template v-if="newCategory.imagePreview">
                <div class="preview-container">
                  <img :src="newCategory.imagePreview" class="preview-image">
                  <q-btn
                    round
                    dense
                    color="red"
                    icon="delete"
                    class="remove-image-btn"
                    @click="newCategory.imagePreview = null; newCategory.imageFile = null"
                  />
                </div>
              </template>
              <template v-else>
                <q-file
                  v-model="newCategory.image"
                  label="Choose Image"
                  filled
                  accept="image/jpeg, image/png, image/jpg"
                  @update:model-value="onCategoryImageSelected"
                >
                  <template v-slot:prepend>
                    <q-icon name="add_photo_alternate" />
                  </template>
                  <template v-slot:hint>
                    Select a JPG or PNG image (max 5MB)
                  </template>
                </q-file>
              </template>
            </div>
            
            <div class="row justify-end q-mt-md">
              <q-btn label="Cancel" color="grey" flat v-close-popup @click="resetCategoryForm" class="q-mr-sm" />
              <q-btn
                label="Add Category"
                type="submit"
                color="primary"
                :loading="uploading"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Add Food Item Dialog -->
    <q-dialog v-model="foodItemDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Add New Food Item</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup @click="resetFoodItemForm" />
        </q-card-section>

        <q-card-section>
          <q-form @submit="addFoodItem">
            <q-input
              v-model="newFoodItem.name"
              label="Food Name *"
              :rules="[val => !!val.trim() || 'Name is required']"
              outlined
              class="q-mb-md"
            />
            
            <q-input
              v-model="newFoodItem.description"
              label="Description"
              type="textarea"
              outlined
              class="q-mb-md"
            />
            
            <q-input
              v-model.number="newFoodItem.price"
              label="Price *"
              type="number"
              prefix="₱"
              :rules="[
                val => val > 0 || 'Price must be greater than 0'
              ]"
              outlined
              class="q-mb-md"
            />
            
            <q-toggle
              v-model="newFoodItem.isAvailable"
              label="Available for ordering"
              color="green"
              class="q-mb-md"
            />
            
            <div class="text-caption q-mb-xs">Food Image</div>
            <div class="image-upload-area q-mb-md">
              <template v-if="newFoodItem.imagePreview">
                <div class="preview-container">
                  <img :src="newFoodItem.imagePreview" class="preview-image">
                  <q-btn
                    round
                    dense
                    color="red"
                    icon="delete"
                    class="remove-image-btn"
                    @click="newFoodItem.imagePreview = null; newFoodItem.imageFile = null"
                  />
                </div>
              </template>
              <template v-else>
                <q-file
                  v-model="newFoodItem.image"
                  label="Choose Image"
                  filled
                  accept="image/jpeg, image/png, image/jpg"
                  @update:model-value="onFoodItemImageSelected"
                >
                  <template v-slot:prepend>
                    <q-icon name="add_photo_alternate" />
                  </template>
                  <template v-slot:hint>
                    Select a JPG or PNG image (max 5MB)
                  </template>
                </q-file>
              </template>
            </div>
            
            <div class="row justify-end q-mt-md">
              <q-btn label="Cancel" color="grey" flat v-close-popup @click="resetFoodItemForm" class="q-mr-sm" />
              <q-btn
                label="Add Food Item"
                type="submit"
                color="primary"
                :loading="uploading"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { defineComponent } from 'vue'
import { useAddMenuPage } from './AddMenuPage.js'

export default defineComponent({
  name: 'AddMenuPage',
  setup() {
    const {
      categories,
      filteredCategories,
      loading,
      uploading,
      search,
      newCategory,
      newFoodItem,
      categoryDialog,
      foodItemDialog,
      selectedCategoryId,
      fetchCategories,
      onCategoryImageSelected,
      onFoodItemImageSelected,
      addCategory,
      deleteCategory,
      openFoodItemDialog,
      addFoodItem,
      deleteFoodItem,
      toggleFoodItemAvailability,
      resetCategoryForm,
      resetFoodItemForm,
      goBack,
      handleImageError
    } = useAddMenuPage()

    return {
      categories,
      filteredCategories,
      loading,
      uploading,
      search,
      newCategory,
      newFoodItem,
      categoryDialog,
      foodItemDialog,
      selectedCategoryId,
      fetchCategories,
      onCategoryImageSelected,
      onFoodItemImageSelected,
      addCategory,
      deleteCategory,
      openFoodItemDialog,
      addFoodItem,
      deleteFoodItem,
      toggleFoodItemAvailability,
      resetCategoryForm,
      resetFoodItemForm,
      goBack,
      handleImageError
    }
  }
})
</script>

<style lang="scss" scoped>
.add-menu-page {
  background-color: #f5f5f5;
  min-height: 100vh;
}

.page-header {
  display: flex;
  align-items: center;
}

.toolbar-section {
  margin-bottom: 20px;
}

.loading-container,
.no-data-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 50vh;
}

.category-section {
  background-color: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.08);
}

.category-header {
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 12px;
}

.no-food-items {
  background-color: #f9f9f9;
  border-radius: 8px;
}

.food-item-card {
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  }
  
  &.unavailable {
    opacity: 0.7;
    
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.1);
      z-index: 1;
    }
  }
}

.preview-container {
  position: relative;
  width: 100%;
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed #ccc;
  border-radius: 8px;
  overflow: hidden;
  
  .preview-image {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
  
  .remove-image-btn {
    position: absolute;
    top: 8px;
    right: 8px;
    z-index: 2;
    background-color: rgba(255, 255, 255, 0.7);
  }
}

.image-upload-area {
  display: flex;
  flex-direction: column;
}
</style> 