<template>
  <q-page class="view-items-page q-pa-md">
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
      <div class="text-h6">All Menu Items</div>
    </div>

    <!-- Filters and Actions Bar -->
    <div class="filters-bar q-mb-lg">
      <div class="row q-col-gutter-md">
        <!-- Search Input -->
        <div class="col-12 col-sm-6 col-md-4">
          <q-input
            v-model="search"
            placeholder="Search items..."
            outlined
            dense
            class="search-input"
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
            <template v-slot:append v-if="search">
              <q-icon name="close" @click="search = ''" class="cursor-pointer" />
            </template>
          </q-input>
        </div>

        <!-- Category Filter -->
        <div class="col-12 col-sm-6 col-md-3">
          <q-select
            v-model="selectedCategory"
            :options="[
              { value: 'all', label: 'All Categories' },
              ...categories.map(c => ({ value: c.id, label: c.name }))
            ]"
            option-value="value"
            option-label="label"
            outlined
            dense
            emit-value
            map-options
            label="Filter by Category"
          />
        </div>

        <!-- Sort Controls -->
        <div class="col-12 col-sm-6 col-md-3">
          <q-select
            v-model="sortBy"
            :options="[
              { value: 'name', label: 'Name' },
              { value: 'price', label: 'Price' },
              { value: 'category', label: 'Category' },
              { value: 'date', label: 'Date Added' }
            ]"
            option-value="value"
            option-label="label"
            outlined
            dense
            emit-value
            map-options
            label="Sort by"
          >
            <template v-slot:append>
              <q-btn
                round
                flat
                dense
                :icon="sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward'"
                @click.stop="sortDirection = sortDirection === 'asc' ? 'desc' : 'asc'"
              />
            </template>
          </q-select>
        </div>

        <!-- Add New Item Button -->
        <div class="col-12 col-sm-6 col-md-2 flex items-center justify-end">
          <q-btn
            color="primary"
            icon="add"
            label="Add Item"
            @click="goToAddMenu"
          />
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container q-my-xl">
      <q-spinner-dots color="primary" size="40px" />
      <div class="q-mt-sm text-grey text-body1">Loading menu items...</div>
    </div>

    <!-- No Items State -->
    <div v-else-if="filteredAndSortedItems.length === 0" class="no-data-container q-my-xl text-center">
      <q-icon name="restaurant_menu" size="80px" color="grey-5" />
      <div class="text-h6 q-mt-md text-grey-8">No Items Found</div>
      <div class="text-body1 text-grey q-mt-sm">
        <template v-if="search || selectedCategory !== 'all'">
          No items match your search criteria. Try adjusting your filters.
        </template>
        <template v-else>
          There are no food items yet.
          <br>
          <q-btn
            color="primary"
            label="Add Your First Item"
            class="q-mt-md"
            @click="goToAddMenu"
          />
        </template>
      </div>
    </div>

    <!-- Items Grid -->
    <div v-else>
      <div class="row q-col-gutter-md">
        <div
          v-for="item in paginatedItems"
          :key="`${item.categoryId}-${item.id}`"
          class="col-12 col-sm-6 col-md-4 col-lg-3"
        >
          <q-card class="food-item-card" :class="{ 'unavailable': !item.isAvailable }">
            <q-img
              :src="item.imageUrl || 'https://cdn.quasar.dev/img/parallax2.jpg'"
              height="180px"
            >
              <div class="absolute-top-right q-pa-xs">
                <q-badge
                  :color="item.isAvailable ? 'green' : 'red'"
                  :label="item.isAvailable ? 'Available' : 'Unavailable'"
                />
              </div>
              <div class="absolute-bottom-left q-pa-xs">
                <q-badge color="blue">{{ item.categoryName }}</q-badge>
              </div>
            </q-img>

            <q-card-section>
              <div class="text-subtitle1 text-weight-bold">{{ item.name }}</div>
              <div class="text-caption text-grey q-mb-sm text-ellipsis" style="max-height: 40px; overflow: hidden;">
                {{ item.description || 'No description' }}
              </div>
              <div class="text-h6 text-primary">₱{{ item.price.toFixed(2) }}</div>
            </q-card-section>

            <q-separator />

            <q-card-actions>
              <q-btn flat round icon="visibility" @click="viewItemDetails(item)">
                <q-tooltip>View Details</q-tooltip>
              </q-btn>
              <q-btn flat round icon="edit" @click="editItem(item)">
                <q-tooltip>Edit</q-tooltip>
              </q-btn>
              <q-space />
              <q-btn
                flat
                round
                :color="item.isAvailable ? 'red' : 'green'"
                :icon="item.isAvailable ? 'cancel' : 'check_circle'"
                @click="toggleItemAvailability(item)"
              >
                <q-tooltip>{{ item.isAvailable ? 'Mark as Unavailable' : 'Mark as Available' }}</q-tooltip>
              </q-btn>
              <q-btn flat round color="negative" icon="delete" @click="deleteItem(item)">
                <q-tooltip>Delete</q-tooltip>
              </q-btn>
            </q-card-actions>
          </q-card>
        </div>
      </div>

      <!-- Pagination -->
      <div class="pagination-container q-mt-lg flex justify-center items-center">
        <span class="q-mr-md text-grey">
          Showing {{ ((pagination.page - 1) * pagination.rowsPerPage) + 1 }} - 
          {{ Math.min(pagination.page * pagination.rowsPerPage, filteredAndSortedItems.length) }} 
          of {{ filteredAndSortedItems.length }}
        </span>
        <q-pagination
          v-model="pagination.page"
          :max="Math.ceil(filteredAndSortedItems.length / pagination.rowsPerPage)"
          direction-links
          boundary-links
          color="primary"
          :disabled="filteredAndSortedItems.length <= pagination.rowsPerPage"
        />
        <q-select
          v-model="pagination.rowsPerPage"
          :options="[8, 12, 16, 24, 36]"
          label="Per Page"
          dense
          outlined
          class="q-ml-md"
          style="width: 120px;"
        />
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent } from 'vue'
import { useViewItemsPage } from './ViewItemsPage.js'

export default defineComponent({
  name: 'ViewItemsPage',
  setup() {
    const {
      allItems,
      filteredAndSortedItems,
      paginatedItems,
      loading,
      search,
      selectedCategory,
      categories,
      sortBy,
      sortDirection,
      pagination,
      toggleSort,
      toggleItemAvailability,
      deleteItem,
      viewItemDetails,
      editItem,
      goBack,
      goToAddMenu
    } = useViewItemsPage()

    return {
      allItems,
      filteredAndSortedItems,
      paginatedItems,
      loading,
      search,
      selectedCategory,
      categories,
      sortBy,
      sortDirection,
      pagination,
      toggleSort,
      toggleItemAvailability,
      deleteItem,
      viewItemDetails,
      editItem,
      goBack,
      goToAddMenu
    }
  }
})
</script>

<style lang="scss" scoped>
.view-items-page {
  background-color: #f5f5f5;
  min-height: 100vh;
}

.page-header {
  display: flex;
  align-items: center;
}

.filters-bar {
  padding: 16px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.loading-container,
.no-data-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 50vh;
}

.food-item-card {
  height: 100%;
  display: flex;
  flex-direction: column;
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
  
  .q-card-section {
    flex: 1;
  }
}

.pagination-container {
  padding: 16px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
</style> 