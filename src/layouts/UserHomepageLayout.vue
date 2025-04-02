<template>
  <q-layout view="hHh LpR fFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="leftDrawerOpen = !leftDrawerOpen"
          class="gt-sm"
        />

        <q-toolbar-title>
          <div class="row items-center">
            <q-avatar size="32px" class="q-mr-sm">
              <img src="https://via.placeholder.com/32x32?text=BF" />
            </q-avatar>
            <span>BuFood</span>
          </div>
        </q-toolbar-title>

        <q-input
          outlined
          dense
          v-model="searchQuery"
          placeholder="Search for restaurants and dishes"
          class="header-search gt-xs"
          bg-color="white"
          clearable
          @click="showSearch"
        >
          <template v-slot:prepend>
            <q-icon name="search" color="primary" />
          </template>
        </q-input>

        <q-space />

        <q-btn
          flat
          round
          dense
          icon="search"
          @click="showMobileSearch = true"
          class="lt-sm"
        />

        <q-btn-dropdown
          flat
          round
          icon="notifications"
          :count="notificationCount"
          color="white"
        >
          <q-list style="min-width: 300px">
            <q-item-label header>Notifications</q-item-label>
            <q-separator />

            <template v-if="notifications.length === 0">
              <q-item>
                <q-item-section>
                  <q-item-label>No new notifications</q-item-label>
                </q-item-section>
              </q-item>
            </template>

            <template v-else>
              <q-item
                v-for="notification in notifications"
                :key="notification.id"
                clickable
                v-close-popup
              >
                <q-item-section avatar>
                  <q-icon
                    :name="getNotificationIcon(notification.type)"
                    :color="getNotificationColor(notification.type)"
                  />
                </q-item-section>

                <q-item-section>
                  <q-item-label>{{ notification.title }}</q-item-label>
                  <q-item-label caption>{{
                    notification.message
                  }}</q-item-label>
                  <q-item-label caption>{{
                    formatTimeAgo(notification.timestamp)
                  }}</q-item-label>
                </q-item-section>

                <q-item-section side>
                  <q-btn
                    flat
                    round
                    dense
                    icon="close"
                    @click.stop="dismissNotification(notification.id)"
                    size="sm"
                  />
                </q-item-section>
              </q-item>
            </template>

            <q-separator />
            <q-item
              v-if="notifications.length > 0"
              clickable
              v-close-popup
              @click="clearAllNotifications"
            >
              <q-item-section class="text-center text-primary"
                >Clear All</q-item-section
              >
            </q-item>
          </q-list>
        </q-btn-dropdown>

        <q-btn flat round color="white" to="/customer/cart" class="q-mr-sm">
          <q-icon name="shopping_cart" />
          <q-badge color="negative" floating rounded v-if="cartCount > 0">
            {{ cartCount }}
          </q-badge>
        </q-btn>

        <q-btn-dropdown flat round icon="account_circle">
          <q-list>
            <q-item
              clickable
              v-close-popup
              @click="navigateTo('/customer/profile')"
            >
              <q-item-section avatar>
                <q-icon name="person" />
              </q-item-section>
              <q-item-section>
                <q-item-label>My Profile</q-item-label>
              </q-item-section>
            </q-item>

            <q-item clickable v-close-popup @click="logout">
              <q-item-section avatar>
                <q-icon name="logout" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Logout</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </q-toolbar>

      <!-- Mobile Search Toolbar (Only appears when search is activated) -->
      <q-toolbar v-if="showMobileSearch" class="bg-white text-primary lt-sm">
        <q-input
          outlined
          dense
          v-model="searchQuery"
          placeholder="Search for restaurants and dishes"
          class="full-width"
          bg-color="white"
          clearable
          autofocus
          @blur="onSearchBlur"
        >
          <template v-slot:prepend>
            <q-icon name="search" color="primary" />
          </template>
          <template v-slot:append>
            <q-btn
              flat
              round
              dense
              icon="close"
              @click="showMobileSearch = false"
            />
          </template>
        </q-input>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      bordered
      :width="240"
      :breakpoint="700"
      class="gt-sm"
    >
      <q-scroll-area class="fit">
        <q-list>
          <q-item-label header class="text-grey-8"> MAIN MENU </q-item-label>

          <EssentialLink
            v-for="link in essentialLinks"
            :key="link.title"
            v-bind="link"
          />

          <q-separator class="q-my-md" />

          <q-item-label header class="text-grey-8"> ACCOUNT </q-item-label>

          <EssentialLink
            v-for="link in accountLinks"
            :key="link.title"
            v-bind="link"
          />
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <!-- Bottom Navigation for Mobile -->
    <q-footer class="bg-white lt-md">
      <q-tabs
        v-model="currentRoute"
        class="text-primary"
        active-color="primary"
        indicator-color="transparent"
        switch-indicator
      >
        <q-tab
          name="home"
          icon="home"
          label="Home"
          @click="navigateTo('/customer/home')"
        />
        <q-tab
          name="stores"
          icon="storefront"
          label="Stores"
          @click="navigateTo('/customer/stores')"
        />
        <q-tab
          name="orders"
          icon="receipt_long"
          label="Orders"
          @click="navigateTo('/customer/orders')"
        />
        <q-tab
          name="favorites"
          icon="favorite"
          label="Favorites"
          @click="navigateTo('/customer/favorites')"
        />
        <q-tab
          name="profile"
          icon="person"
          label="Profile"
          @click="navigateTo('/customer/profile')"
        />
      </q-tabs>
    </q-footer>

    <!-- Search Dialog (would be used in a real app) -->
    <q-dialog v-model="searchDialog" position="top">
      <q-card style="width: 500px; max-width: 90vw">
        <q-card-section>
          <div class="text-h6">Search Results</div>
        </q-card-section>

        <q-card-section v-if="searchQuery.length < 2">
          <q-item>
            <q-item-section>
              <q-item-label>Enter at least 2 characters to search</q-item-label>
            </q-item-section>
          </q-item>
        </q-card-section>

        <q-card-section v-else>
          <q-list separator>
            <q-item clickable v-close-popup @click="navigateToStore('store1')">
              <q-item-section avatar>
                <q-icon name="storefront" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Juan's Filipino Cuisine</q-item-label>
                <q-item-label caption>Filipino, Traditional</q-item-label>
              </q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="navigateToFood('item1')">
              <q-item-section avatar>
                <q-icon name="restaurant" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Adobo Rice Bowl</q-item-label>
                <q-item-label caption>Juan's Filipino Cuisine</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Close" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script>
import { defineComponent, ref, computed, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useQuasar } from "quasar";
import { date } from "quasar";
import EssentialLink from "components/EssentialLink.vue";

export default defineComponent({
  name: "UserHomepageLayout",

  components: {
    EssentialLink,
  },

  setup() {
    const router = useRouter();
    const route = useRoute();
    const $q = useQuasar();

    const leftDrawerOpen = ref(false);
    const searchQuery = ref("");
    const searchDialog = ref(false);
    const showMobileSearch = ref(false);
    const cartCount = ref(3); // This would be fetched from a store in a real app

    // Set the active tab based on current route
    const currentRoute = ref(getCurrentTab(route.path));

    const notifications = ref([
      {
        id: 1,
        type: "order",
        title: "Order Delivered",
        message: "Your order #ORD10002 has been delivered",
        timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
      },
      {
        id: 2,
        type: "promo",
        title: "Special Offer",
        message: "Get 20% off on your next order with code WELCOME20",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      },
    ]);

    const essentialLinks = [
      {
        title: "Home",
        caption: "Back to homepage",
        icon: "home",
        to: "/customer/home",
      },
      {
        title: "Stores",
        caption: "Browse all restaurants",
        icon: "storefront",
        to: "/customer/stores",
      },
      {
        title: "Cart",
        caption: "View your cart",
        icon: "shopping_cart",
        to: "/customer/cart",
      },
      {
        title: "Orders",
        caption: "Track your orders",
        icon: "receipt_long",
        to: "/customer/orders",
      },
      {
        title: "Favorites",
        caption: "Your favorite items",
        icon: "favorite",
        to: "/customer/favorites",
      },
    ];

    // Move logout function before it's used in accountLinks
    const logout = () => {
      // This would call your authentication service to logout
      // For now, we'll just show a notification and redirect

      $q.notify({
        color: "info",
        message: "Logging out...",
        icon: "logout",
      });

      // Redirect to login after a short delay
      setTimeout(() => {
        router.push("/auth/login");
      }, 1000);
    };

    const accountLinks = [
      {
        title: "Profile",
        caption: "Manage your account",
        icon: "person",
        to: "/customer/profile",
      },
      {
        title: "Log Out",
        caption: "Sign out from your account",
        icon: "logout",
        click: logout,
      },
    ];

    const notificationCount = computed(() => notifications.value.length);

    // Update currentRoute when route changes
    watch(
      () => route.path,
      (newPath) => {
        currentRoute.value = getCurrentTab(newPath);
      }
    );

    function getCurrentTab(path) {
      if (path.includes("/customer/home")) return "home";
      if (path.includes("/customer/stores")) return "stores";
      if (path.includes("/customer/orders")) return "orders";
      if (path.includes("/customer/favorites")) return "favorites";
      if (path.includes("/customer/profile")) return "profile";
      return "home";
    }

    const getNotificationIcon = (type) => {
      const icons = {
        order: "local_shipping",
        promo: "local_offer",
        info: "info",
      };
      return icons[type] || "notifications";
    };

    const getNotificationColor = (type) => {
      const colors = {
        order: "positive",
        promo: "purple",
        info: "info",
      };
      return colors[type] || "grey";
    };

    const formatTimeAgo = (timestamp) => {
      return date.formatDate(timestamp, "from-now");
    };

    const dismissNotification = (id) => {
      notifications.value = notifications.value.filter((n) => n.id !== id);
    };

    const clearAllNotifications = () => {
      notifications.value = [];
    };

    const navigateTo = (route) => {
      router.push(route);
    };

    const navigateToStore = (storeId) => {
      router.push(`/customer/store/${storeId}`);
    };

    const navigateToFood = (foodId) => {
      // In a real app, this would navigate to the food item
      // For now, we'll just navigate to a mock store
      router.push("/customer/store/store1");
    };

    const showSearch = () => {
      if (searchQuery.value.length >= 2) {
        searchDialog.value = true;
      }
    };

    const onSearchBlur = () => {
      // Only close the mobile search if no text has been entered
      if (!searchQuery.value) {
        showMobileSearch.value = false;
      }
    };

    onMounted(() => {
      // Check screen size on mount
      adjustDrawerState();

      // Listen for resize events
      window.addEventListener("resize", adjustDrawerState);
    });

    function adjustDrawerState() {
      // Only open drawer by default on large screens
      if (window.innerWidth > 1023) {
        leftDrawerOpen.value = true;
      } else {
        leftDrawerOpen.value = false;
      }
    }

    return {
      leftDrawerOpen,
      essentialLinks,
      accountLinks,
      searchQuery,
      searchDialog,
      showMobileSearch,
      notifications,
      notificationCount,
      currentRoute,
      cartCount,
      getNotificationIcon,
      getNotificationColor,
      formatTimeAgo,
      dismissNotification,
      clearAllNotifications,
      navigateTo,
      navigateToStore,
      navigateToFood,
      showSearch,
      onSearchBlur,
      logout,
    };
  },
});
</script>

<style lang="scss" scoped>
.header-search {
  width: 300px;
  margin: 0 16px;
}

.q-tabs {
  height: 60px;
}
</style>
