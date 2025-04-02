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
        />

        <q-toolbar-title>
          <div class="row items-center">
            <q-avatar size="32px" class="q-mr-sm">
              <img src="https://via.placeholder.com/32x32?text=BF" />
            </q-avatar>
            <span>BuFood Seller Dashboard</span>
          </div>
        </q-toolbar-title>

        <q-space />

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

        <q-btn-dropdown flat round icon="account_circle">
          <q-list>
            <q-item
              clickable
              v-close-popup
              @click="navigateTo('/seller/profile')"
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
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      :width="240"
      :breakpoint="700"
    >
      <q-scroll-area class="fit">
        <q-list>
          <q-item-label header class="text-grey-8"> NAVIGATION </q-item-label>

          <EssentialLink
            v-for="link in essentialLinks"
            :key="link.title"
            v-bind="link"
          />

          <q-separator class="q-my-md" />

          <q-item-label header class="text-grey-8">
            STORE MANAGEMENT
          </q-item-label>

          <EssentialLink
            v-for="link in managementLinks"
            :key="link.title"
            v-bind="link"
          />
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer elevated class="bg-primary text-white">
      <q-toolbar class="justify-center">
        <div class="text-caption">
          BuFood Seller Dashboard &copy; {{ new Date().getFullYear() }}
        </div>
      </q-toolbar>
    </q-footer>
  </q-layout>
</template>

<script>
import { defineComponent, ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";
import { date } from "quasar";
import EssentialLink from "components/EssentialLink.vue";

export default defineComponent({
  name: "SellerDashboardLayout",

  components: {
    EssentialLink,
  },

  setup() {
    const router = useRouter();
    const $q = useQuasar();

    const leftDrawerOpen = ref(false);
    const notifications = ref([
      {
        id: 1,
        type: "order",
        title: "New Order Received",
        message: "You have received a new order #ORD10001",
        timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
      },
      {
        id: 2,
        type: "alert",
        title: "Low Stock Alert",
        message: "Adobo Rice Bowl is running low on stock",
        timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
      },
      {
        id: 3,
        type: "info",
        title: "Daily Summary",
        message: "You received 12 orders and earned ₱3,568 today",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
      },
    ]);

    const essentialLinks = [
      {
        title: "Dashboard",
        caption: "Overview of your business",
        icon: "dashboard",
        to: "/seller/dashboard",
      },
      {
        title: "Pending Orders",
        caption: "Process incoming orders",
        icon: "receipt_long",
        to: "/seller/pending-orders",
      },
      {
        title: "Dispatch Orders",
        caption: "Manage deliveries and pickups",
        icon: "delivery_dining",
        to: "/seller/dispatch-orders",
      },
    ];

    const managementLinks = [
      {
        title: "Add Menu Item",
        caption: "Add new dishes and categories",
        icon: "restaurant_menu",
        to: "/seller/add-menu",
      },
      {
        title: "View All Items",
        caption: "Manage your menu items",
        icon: "menu_book",
        to: "/seller/view-items",
      },
      {
        title: "Profile Settings",
        caption: "Manage your store information",
        icon: "storefront",
        to: "/seller/profile",
      },
    ];

    const notificationCount = computed(() => notifications.value.length);

    const getNotificationIcon = (type) => {
      const icons = {
        order: "shopping_bag",
        alert: "warning",
        info: "info",
      };
      return icons[type] || "notifications";
    };

    const getNotificationColor = (type) => {
      const colors = {
        order: "primary",
        alert: "negative",
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

    const logout = () => {
      // Clear authentication data
      import("src/services/AuthService").then(({ default: AuthService }) => {
        AuthService.clearToken();
        
        $q.notify({
          color: "positive",
          message: "You have been logged out successfully",
          icon: "check_circle",
        });
  
        // Redirect to login page
        router.push("/auth/login");
      });
    };

    return {
      leftDrawerOpen,
      essentialLinks,
      managementLinks,
      notifications,
      notificationCount,
      getNotificationIcon,
      getNotificationColor,
      formatTimeAgo,
      dismissNotification,
      clearAllNotifications,
      navigateTo,
      logout,
    };
  },
});
</script>

<style lang="scss">
.q-drawer {
  .q-item {
    border-radius: 0 12px 12px 0;
    margin-right: 12px;
    margin-bottom: 4px;

    &.q-router-link--active {
      background-color: #0000001a;
      color: $primary;
      font-weight: 500;
    }
  }
}

@media (max-width: 600px) {
  .q-toolbar-title {
    font-size: 1rem;
  }
}
</style>
