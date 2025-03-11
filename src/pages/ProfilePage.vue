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
      <!-- Profile content -->
    </div>
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

.q-page {
  padding: 10px;
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
