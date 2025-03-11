<template>
  <q-page class="bg-grey-1">
    <!-- Header -->
    <div class="q-pa-md bg-white">
      <div class="row items-center q-mb-sm">
        <div class="col-12">
          <div class="text-h6 text-weight-bold">My Profile</div>
        </div>
      </div>
    </div>

    <!-- Profile Sections -->
    <div class="q-pa-md">
      <q-tabs
        v-model="activeSection"
        class="text-grey"
        active-color="orange"
        indicator-color="orange"
        align="justify"
        narrow-indicator
        dense
      >
        <q-tab name="personal" label="Personal" />
        <q-tab name="orders" label="Orders" />
        <q-tab name="payment" label="Payment" />
        <q-tab name="settings" label="Settings" />
      </q-tabs>

      <q-separator />

      <!-- Personal Information Section -->
      <q-tab-panel name="personal" class="q-pa-none">
        <q-card flat bordered class="q-mt-md">
          <q-card-section>
            <div class="row items-center">
              <div class="col-auto">
                <q-avatar size="80px">
                  <img :src="userProfile.avatar">
                </q-avatar>
              </div>
              <div class="col q-ml-md">
                <div class="text-h6">{{ userProfile.name }}</div>
                <div class="text-subtitle2 text-grey">{{ userProfile.email }}</div>
                <div class="text-subtitle2 text-grey">{{ userProfile.phone }}</div>
              </div>
              <div class="col-auto">
                <q-btn flat round color="grey" icon="edit" />
              </div>
            </div>
          </q-card-section>
          <q-separator />
        </q-card>

        <!-- Logout button -->
        <div class="q-mt-lg">
          <q-btn
            color="negative"
            class="full-width"
            label="Logout"
            @click="logout"
            :loading="isLoading"
          />
        </div>
      </q-tab-panel>

      <!-- Order History Section -->
      <q-tab-panel name="orders" class="q-pa-none">
        <div class="text-subtitle1 text-weight-medium q-mt-md q-mb-sm">Recent Orders</div>
        <q-card v-for="order in orderHistory" :key="order.id" flat bordered class="q-mb-md">
          <q-card-section>
            <div class="row justify-between items-center">
              <div class="text-subtitle1 text-weight-medium">{{ order.restaurant }}</div>
              <q-badge :color="order.status === 'Delivered' ? 'green' : 'orange'">
                {{ order.status }}
              </q-badge>
            </div>
            <div class="text-caption text-grey">{{ order.date }} • Order #{{ order.id }}</div>
            <q-separator class="q-my-sm" />
            <div class="text-body2">
              <div v-for="(item, index) in order.items" :key="index">{{ item }}</div>
            </div>
          </q-card-section>
          <q-card-section class="q-pt-none">
            <div class="row justify-between items-center">
              <div class="text-subtitle1 text-weight-bold">₱{{ order.total.toFixed(2) }}</div>
              <q-btn flat color="orange" label="Reorder" />
            </div>
          </q-card-section>
        </q-card>
      </q-tab-panel>

      <!-- Payment Methods Section -->
      <q-tab-panel name="payment" class="q-pa-none">
        <div class="row justify-between items-center q-mt-md q-mb-sm">
          <div class="text-subtitle1 text-weight-medium">Payment Methods</div>
          <q-btn flat color="orange" icon="add" label="Add New" />
        </div>
        <q-card v-for="method in paymentMethods" :key="method.id" flat bordered class="q-mb-md">
          <q-card-section>
            <div class="row items-center">
              <div class="col-auto">
                <q-icon
                  :name="method.type === 'Credit Card' ? 'credit_card' : 'account_balance_wallet'"
                  size="md"
                  color="orange"
                />
              </div>
              <div class="col q-ml-md">
                <div class="text-subtitle1">{{ method.type }}</div>
                <div class="text-body2 text-grey">{{ method.details }}</div>
                <div v-if="method.expiry" class="text-caption text-grey">Expires: {{ method.expiry }}</div>
              </div>
              <div class="col-auto">
                <q-badge v-if="method.isDefault" color="green">Default</q-badge>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </q-tab-panel>

      <!-- Account Settings Section -->
      <q-tab-panel name="settings" class="q-pa-none">
        <q-list separator class="q-mt-md">
          <q-item v-for="setting in accountSettings" :key="setting.id" clickable v-ripple>
            <q-item-section avatar>
              <q-icon :name="setting.icon || 'settings'" color="orange" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ setting.name }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-toggle
                v-if="'enabled' in setting"
                v-model="setting.enabled"
                color="orange"
                @update:model-value="updateSettings(setting.id, setting.enabled)"
              />
              <q-item-label v-else-if="'value' in setting" caption>{{ setting.value }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>

        <!-- Logout button -->
        <div class="q-pa-md q-mt-md">
          <q-btn
            color="negative"
            class="full-width"
            label="Logout"
            @click="logout"
            :loading="isLoading"
          />
        </div>
      </q-tab-panel>
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
        <q-tab name="favorites" icon="favorite_border" label="Favorites" to="/favorites" />
        <q-tab name="cart" icon="shopping_cart" label="Cart" to="/cart" />
        <q-tab name="profile" icon="person" label="Profile" to="/profile" />
      </q-tabs>
    </q-footer>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted, watch } from 'vue'
import useProfilePage from './ProfilePage.js'
import { useRouter, useRoute } from 'vue-router'

export default defineComponent({
  name: 'ProfilePage',
  setup () {
    const tab = ref('profile')
    const {
      activeSection,
      userProfile,
      orderHistory,
      paymentMethods,
      accountSettings,
      isLoading,
      error,
      fetchOrders,
      savedAddresses,
      showAddAddressDialog,
      fetchUserProfile,
      logout,
      updateSettings
    } = useProfilePage()
    const router = useRouter()
    const route = useRoute()

    // Set the active tab based on the current route
    onMounted(() => {
      const path = route.path.substring(1) // Remove the leading slash
      if (['home', 'favorites', 'cart', 'profile'].includes(path)) {
        tab.value = path
      }
      fetchUserProfile()
      fetchOrders()
    })

    // Watch for tab changes and navigate accordingly
    watch(tab, (newValue) => {
      if (newValue && route.path !== `/${newValue}`) {
        router.push(`/${newValue}`)
      }
    })

    return {
      tab,
      activeSection,
      userProfile,
      orderHistory,
      paymentMethods,
      accountSettings,
      savedAddresses,
      showAddAddressDialog,
      isLoading,
      error,
      logout,
      updateSettings
    }
  }
})
</script>

<style lang="scss" scoped>
.q-tab-panel {
  padding: 0;
}

.q-card {
  border-radius: 12px;
  transition: transform 0.2s;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
}
</style>
