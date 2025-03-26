<template>
  <q-page class="dashboard-page">
    <!-- Orange Header -->
    <div class="header-section bg-orange text-white q-pa-md shadow-10">
      <div class="row justify-between q-mb-lg">
        <div class="text-h5">CANTEEN</div>
        <q-btn 
          round 
          flat 
          color="white" 
          icon="refresh" 
          @click="refreshData" 
          :loading="refreshing"
        />
      </div>
      
      <div class="row q-col-gutter-md">
        <!-- Completed Orders Stat -->
        <div class="col-6 text-center">
          <div class="stat-label q-mb-sm">Completed Order</div>
          <div class="stat-value-container">
            <div v-if="loading" class="text-center">
              <q-spinner color="black" size="1.5rem" />
            </div>
            <div v-else class="text-h4 text-weight-bold text-black">{{ completedOrders }}</div>
          </div>
        </div>
        
        <!-- Earnings Stat -->
        <div class="col-6 text-center">
          <div class="stat-label q-mb-sm">Whole Time Earning</div>
          <div class="stat-value-container">
            <div v-if="loading" class="text-center">
              <q-spinner color="black" size="1.5rem" />
            </div>
            <div v-else class="text-h4 text-weight-bold text-black">P {{ totalEarnings }}</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Dashboard Section -->
    <div class="dashboard-content q-pa-md">
      <div class="text-h6 q-mb-md">DASHBOARD</div>
      
      <div class="row q-col-gutter-md">
        <!-- Pending Orders Card -->
        <div class="col-6">
          <q-card class="dashboard-card shadow-5 text-center" @click="navigateTo('pending-orders')">
            <q-card-section>
              <q-icon name="notifications" size="2rem" color="red" />
              <div v-if="loading" class="q-my-sm">
                <q-spinner color="grey" size="1.5rem" />
              </div>
              <div v-else class="text-h4 q-my-sm">{{ pendingOrders }}</div>
              <div class="text-subtitle1">Pending Order</div>
            </q-card-section>
          </q-card>
        </div>
        
        <!-- Dispatch Orders Card -->
        <div class="col-6">
          <q-card class="dashboard-card shadow-5 text-center" @click="navigateTo('dispatch-orders')">
            <q-card-section>
              <q-icon name="shopping_bag" size="2rem" color="orange" />
              <div v-if="loading" class="q-my-sm">
                <q-spinner color="grey" size="1.5rem" />
              </div>
              <div v-else class="text-h4 q-my-sm">{{ dispatchOrders }}</div>
              <div class="text-subtitle1">Dispatch Order</div>
            </q-card-section>
          </q-card>
        </div>
        
        <!-- Add Menu Card -->
        <div class="col-6">
          <q-card class="dashboard-card shadow-5 text-center" @click="navigateTo('add-menu')">
            <q-card-section>
              <q-icon name="add_circle_outline" size="2rem" color="green" />
              <div class="text-h4 q-my-sm invisible">0</div>
              <div class="text-subtitle1">Add Menu</div>
            </q-card-section>
          </q-card>
        </div>
        
        <!-- View Items Card -->
        <div class="col-6">
          <q-card class="dashboard-card shadow-5 text-center" @click="navigateTo('view-items')">
            <q-card-section>
              <q-icon name="visibility" size="2rem" color="green" />
              <div class="text-h4 q-my-sm invisible">0</div>
              <div class="text-subtitle1">View All Items</div>
            </q-card-section>
          </q-card>
        </div>
      </div>
      
      <!-- Store Profile Button -->
      <div class="store-profile-container">
        <q-btn 
          color="orange" 
          class="store-profile-btn" 
          size="lg" 
          label="STORE PROFILE"
          @click="navigateTo('profile')"
        />
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref } from 'vue'
import { useDashboardPage } from './DashboardPage.js'

export default defineComponent({
  name: 'DashboardPage',
  setup () {
    const refreshing = ref(false)
    
    const {
      adminName,
      totalItems,
      pendingOrders,
      completedOrders,
      dispatchOrders,
      totalEarnings,
      loading,
      navigateTo,
      fetchDashboardData
    } = useDashboardPage()

    const refreshData = async () => {
      refreshing.value = true
      await fetchDashboardData()
      refreshing.value = false
    }

    return {
      adminName,
      totalItems,
      pendingOrders,
      completedOrders,
      dispatchOrders,
      totalEarnings,
      loading,
      navigateTo,
      refreshData,
      refreshing
    }
  }
})
</script>

<style lang="scss" scoped>
.dashboard-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #f5f5f5;
}

.header-section {
  border-radius: 0 0 30px 30px;
  padding-bottom: 30px;
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2);
}

.stat-label {
  font-size: 1rem;
  opacity: 0.9;
}

.stat-value-container {
  background-color: white;
  border-radius: 10px;
  padding: 3px;
  margin: 0 5px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  
  .text-h4 {
    font-size: 1.15rem;
  }
}

.dashboard-content {
  flex: 1;
  padding-bottom: 80px; /* Make space for fixed button */
  position: relative;
}

.dashboard-card {
  border-radius: 12px;
  box-shadow: 0 6px 10px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  cursor: pointer;
  background-color: white;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2);
  }
}

.store-profile-container {
  position: fixed;
  bottom: 20px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  z-index: 10;
  padding: 0 20px;
}

.store-profile-btn {
  border-radius: 15px;
  height: 56px;
  font-weight: bold;
  box-shadow: 0 4px 8px rgba(255, 100, 0, 0.3);
  transition: all 0.3s ease;
  width: 100%;
  max-width: 500px;
  
  &:hover {
    box-shadow: 0 6px 12px rgba(255, 140, 0, 0.3);
    transform: translateY(-2px);
  }
}
</style> 