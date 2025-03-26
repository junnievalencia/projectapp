<template>
  <q-layout view="lHh Lpr lFf">
    <!-- Floating Menu Button -->
    <q-page-sticky position="top-left" :offset="[18, 18]">
      <q-btn
        round
        color="primary"
        icon="menu"
        size="md"
        @click="openMenu"
      />
    </q-page-sticky>

    <!-- Slide-in Menu Dialog -->
    <q-dialog
      v-model="menuOpen"
      position="left"
      full-height
    >
      <q-card style="width: 250px; max-width: 100vw;" class="column no-wrap">
        <q-card-section class="column q-pa-none">
          <q-list padding>
            <q-item
              clickable
              v-ripple
              :to="{ name: 'dashboard' }"
              exact
              @click="menuOpen = false"
            >
              <q-item-section avatar>
                <q-icon name="dashboard" />
              </q-item-section>
              <q-item-section>
                Dashboard
              </q-item-section>
            </q-item>

            <q-expansion-item
              expand-separator
              icon="fastfood"
              label="Food Management"
            >
              <q-item
                clickable
                v-ripple
                :to="{ name: 'food-items' }"
                exact
                @click="menuOpen = false"
              >
                <q-item-section avatar>
                  <q-icon name="restaurant_menu" />
                </q-item-section>
                <q-item-section>
                  Food Items
                </q-item-section>
              </q-item>
              <q-item
                clickable
                v-ripple
                :to="{ name: 'food-categories' }"
                exact
                @click="menuOpen = false"
              >
                <q-item-section avatar>
                  <q-icon name="category" />
                </q-item-section>
                <q-item-section>
                  Categories
                </q-item-section>
              </q-item>
            </q-expansion-item>

            <q-expansion-item
              expand-separator
              icon="store"
              label="Vendor Management"
            >
              <q-item
                clickable
                v-ripple
                :to="{ name: 'vendors' }"
                exact
                @click="menuOpen = false"
              >
                <q-item-section avatar>
                  <q-icon name="business" />
                </q-item-section>
                <q-item-section>
                  Vendors
                </q-item-section>
              </q-item>
              <q-item
                clickable
                v-ripple
                :to="{ name: 'vendor-categories' }"
                exact
                @click="menuOpen = false"
              >
                <q-item-section avatar>
                  <q-icon name="category" />
                </q-item-section>
                <q-item-section>
                  Vendor Categories
                </q-item-section>
              </q-item>
            </q-expansion-item>

            <q-item
              clickable
              v-ripple
              :to="{ name: 'orders' }"
              exact
              @click="menuOpen = false"
            >
              <q-item-section avatar>
                <q-icon name="shopping_cart" />
              </q-item-section>
              <q-item-section>
                Orders
              </q-item-section>
            </q-item>

            <q-item
              clickable
              v-ripple
              :to="{ name: 'users' }"
              exact
              @click="menuOpen = false"
            >
              <q-item-section avatar>
                <q-icon name="people" />
              </q-item-section>
              <q-item-section>
                Users
              </q-item-section>
            </q-item>

            <q-item
              clickable
              v-ripple
              :to="{ name: 'settings' }"
              exact
              @click="menuOpen = false"
            >
              <q-item-section avatar>
                <q-icon name="settings" />
              </q-item-section>
              <q-item-section>
                Settings
              </q-item-section>
            </q-item>

            <q-item
              to="/sample-data"
              clickable
              v-ripple
              exact
              active-class="text-primary"
              @click="menuOpen = false"
            >
              <q-item-section avatar>
                <q-icon name="data_object" />
              </q-item-section>
              <q-item-section>Sample Data</q-item-section>
            </q-item>

            <!-- Profile and Logout -->
            <q-separator class="q-my-md" />
            
            <q-item
              clickable
              v-ripple
              @click="onProfileClick"
            >
              <q-item-section avatar>
                <q-icon name="person" />
              </q-item-section>
              <q-item-section>
                Profile
              </q-item-section>
            </q-item>
            
            <q-item
              clickable
              v-ripple
              @click="onLogoutClick"
            >
              <q-item-section avatar>
                <q-icon name="logout" />
              </q-item-section>
              <q-item-section>
                Logout
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { auth } from 'boot/firebase'
import { signOut } from 'firebase/auth'

export default defineComponent({
  name: 'DashboardLayout',

  setup() {
    const router = useRouter()
    const $q = useQuasar()
    const menuOpen = ref(false)

    const openMenu = () => {
      menuOpen.value = true
    }

    const onProfileClick = () => {
      menuOpen.value = false
      router.push('/profile')
    }

    const onLogoutClick = async () => {
      try {
        menuOpen.value = false
        await signOut(auth)
        router.push('/login')
      } catch (error) {
        $q.notify({
          color: 'negative',
          message: 'Failed to logout',
          icon: 'error'
        })
      }
    }

    return {
      menuOpen,
      openMenu,
      onProfileClick,
      onLogoutClick
    }
  }
})
</script> 