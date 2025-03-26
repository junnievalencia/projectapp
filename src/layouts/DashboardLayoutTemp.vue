<template>
  <q-layout view="lHh Lpr lFf">
    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      :width="240"
      :breakpoint="400"
    >
      <!-- Drawer Header -->
      <q-toolbar class="bg-primary text-white">
        <q-toolbar-title>
          BuFood Admin
        </q-toolbar-title>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
          class="q-mr-sm"
        />
      </q-toolbar>

      <q-scroll-area style="height: calc(100% - 50px); margin-top: 50px;">
        <q-list padding>
          <q-item
            clickable
            v-ripple
            :to="{ name: 'dashboard' }"
            exact
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
          >
            <q-item-section avatar>
              <q-icon name="settings" />
            </q-item-section>
            <q-item-section>
              Settings
            </q-item-section>
          </q-item>

          <!-- Profile and Logout -->
          <q-separator class="q-my-md" />
          
          <q-item
            clickable
            v-ripple
            @click="onProfile"
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
            @click="onLogout"
          >
            <q-item-section avatar>
              <q-icon name="logout" />
            </q-item-section>
            <q-item-section>
              Logout
            </q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>

      <q-img
        class="absolute-top"
        src="https://cdn.quasar.dev/img/material.png"
        style="height: 50px"
      />
    </q-drawer>

    <!-- Floating Menu Button (only visible when drawer is closed) -->
    <q-page-sticky position="top-left" :offset="[18, 18]" v-if="!leftDrawerOpen">
      <q-btn
        round
        color="primary"
        icon="menu"
        size="md"
        @click="toggleLeftDrawer"
      />
    </q-page-sticky>

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
    const leftDrawerOpen = ref(false)

    const toggleLeftDrawer = () => {
      leftDrawerOpen.value = !leftDrawerOpen.value
    }

    const onProfile = () => {
      router.push('/profile')
    }

    const onLogout = async () => {
      try {
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
      leftDrawerOpen,
      toggleLeftDrawer,
      onProfile,
      onLogout
    }
  }
})
</script> 