<template>
  <q-page class="dispatch-orders-page q-pa-md">
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
      <div class="text-h6">Dispatch Orders</div>
      <q-space />
      <q-btn
        icon="refresh"
        flat
        round
        color="primary"
        @click="refreshData"
        :loading="loading"
      />
    </div>

    <!-- Search Bar -->
    <div class="search-container q-mb-md">
      <q-input
        v-model="search"
        placeholder="Search orders..."
        outlined
        dense
        clearable
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

    <!-- Loading Indicator -->
    <div v-if="loading" class="loading-container q-my-xl">
      <q-spinner-dots color="primary" size="40px" />
      <div class="q-mt-sm text-grey text-body1">Loading orders...</div>
    </div>

    <!-- No Orders Message -->
    <div v-else-if="filteredOrders.length === 0" class="no-orders-container q-my-xl text-center">
      <q-icon name="local_shipping" size="80px" color="grey-5" />
      <div class="text-h6 q-mt-md text-grey-8">No Dispatch Orders</div>
      <div class="text-body1 text-grey q-mt-sm">There are no orders ready for dispatch at this time.</div>
    </div>

    <!-- Orders List -->
    <div v-else class="orders-container">
      <q-list separator>
        <q-item
          v-for="order in filteredOrders"
          :key="order.id"
          class="order-item q-mb-md"
          clickable
          v-ripple
        >
          <q-item-section>
            <!-- Order Header -->
            <div class="order-header row items-center justify-between q-mb-sm">
              <div class="text-subtitle1 text-weight-bold">Order #{{ order.orderNumber }}</div>
              <q-badge
                :color="getStatusColor(order.status)"
                text-color="white"
                class="status-badge"
              >
                {{ order.status === 'out_for_delivery' ? 'OUT FOR DELIVERY' : order.status.toUpperCase() }}
              </q-badge>
            </div>

            <!-- Order Info -->
            <div class="order-info row items-start q-gutter-y-sm">
              <div class="col-12 col-sm-6">
                <div class="detail-label">Customer</div>
                <div class="detail-value">{{ order.customerName }}</div>
              </div>
              <div class="col-12 col-sm-6">
                <div class="detail-label">Date</div>
                <div class="detail-value">{{ order.orderDate }}</div>
              </div>
              <div class="col-12">
                <div class="detail-label">Delivery Address</div>
                <div class="detail-value">{{ order.deliveryAddress }}</div>
              </div>
              <div class="col-12 col-sm-6">
                <div class="detail-label">Contact</div>
                <div class="detail-value">{{ order.deliveryContact }}</div>
              </div>
              <div class="col-12 col-sm-6">
                <div class="detail-label">Payment</div>
                <div class="detail-value">{{ order.paymentMethod }}</div>
              </div>
              <div class="col-12 col-sm-6">
                <div class="detail-label">Total</div>
                <div class="detail-value text-weight-bold">₱{{ order.total.toFixed(2) }}</div>
              </div>
              <div v-if="order.rider" class="col-12 col-sm-6">
                <div class="detail-label">Rider</div>
                <div class="detail-value text-primary">{{ order.rider }}</div>
              </div>
            </div>

            <!-- Order Items -->
            <q-expansion-item
              label="Order Items"
              header-class="text-primary q-mt-sm"
              expand-icon-class="text-primary"
            >
              <q-list dense padding>
                <q-item v-for="(item, index) in order.items" :key="index">
                  <q-item-section>
                    <q-item-label>{{ item.name }}</q-item-label>
                    <q-item-label caption>
                      ₱{{ item.price.toFixed(2) }} x {{ item.quantity }}
                    </q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    ₱{{ (item.price * item.quantity).toFixed(2) }}
                  </q-item-section>
                </q-item>

                <q-separator class="q-my-sm" />

                <q-item>
                  <q-item-section>
                    <q-item-label class="text-weight-bold">Total</q-item-label>
                  </q-item-section>
                  <q-item-section side class="text-weight-bold">
                    ₱{{ calculateOrderTotal(order.items).toFixed(2) }}
                  </q-item-section>
                </q-item>
              </q-list>
            </q-expansion-item>

            <!-- Action Buttons -->
            <div class="order-actions row q-gutter-sm q-mt-md">
              <q-btn 
                v-if="order.status === 'dispatched'" 
                color="primary" 
                label="Mark Ready"
                icon="inventory_2" 
                dense
                @click.stop="markAsReady(order)" 
              />
              <q-btn 
                v-if="order.status === 'ready'" 
                color="primary" 
                label="Dispatch Order"
                icon="directions_bike" 
                dense
                @click.stop="markOutForDelivery(order)" 
              />
              <q-btn 
                v-if="order.status === 'out_for_delivery'" 
                color="positive" 
                label="Mark Delivered"
                icon="check_circle" 
                dense
                @click.stop="markAsDelivered(order)" 
              />
              <q-btn 
                v-if="['ready', 'out_for_delivery'].includes(order.status)" 
                color="negative" 
                label="Cancel" 
                icon="cancel"
                dense
                @click.stop="cancelOrder(order)" 
              />
            </div>
          </q-item-section>
        </q-item>
      </q-list>
    </div>

    <!-- Pagination -->
    <div class="pagination-container q-mt-lg">
      <q-pagination
        v-model="pagination.page"
        :max="Math.ceil(filteredOrders.length / pagination.rowsPerPage)"
        direction-links
        boundary-links
        color="primary"
        :disabled="filteredOrders.length <= pagination.rowsPerPage"
      />
    </div>
  </q-page>
</template>

<script>
import { defineComponent } from 'vue'
import { useDispatchOrdersPage } from './DispatchOrdersPage.js'

export default defineComponent({
  name: 'DispatchOrdersPage',
  setup() {
    const {
      dispatchOrders,
      filteredOrders,
      loading,
      search,
      pagination,
      getStatusColor,
      markOutForDelivery,
      markAsDelivered,
      markAsReady,
      cancelOrder,
      calculateOrderTotal,
      goBack,
      refreshData
    } = useDispatchOrdersPage()

    return {
      dispatchOrders,
      filteredOrders,
      loading,
      search,
      pagination,
      getStatusColor,
      markOutForDelivery,
      markAsDelivered,
      markAsReady,
      cancelOrder,
      calculateOrderTotal,
      goBack,
      refreshData
    }
  }
})
</script>

<style lang="scss" scoped>
.dispatch-orders-page {
  background-color: #f5f5f5;
  min-height: 100vh;
}

.page-header {
  display: flex;
  align-items: center;
}

.search-container {
  .search-input {
    border-radius: 8px;
  }
}

.loading-container,
.no-orders-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 50vh;
}

.orders-container {
  .order-item {
    background-color: white;
    border-radius: 8px;
    transition: transform 0.2s;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    padding: 16px;

    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
  }

  .order-header {
    padding-bottom: 8px;
    border-bottom: 1px solid #f0f0f0;
  }

  .status-badge {
    font-size: 10px;
    padding: 4px 8px;
  }

  .order-info {
    margin-top: 8px;
  }

  .detail-label {
    font-size: 12px;
    color: #666;
    margin-bottom: 4px;
  }
  
  .detail-value {
    font-size: 14px;
  }

  .order-actions {
    margin-top: 8px;
  }
}

.pagination-container {
  display: flex;
  justify-content: center;
}
</style> 