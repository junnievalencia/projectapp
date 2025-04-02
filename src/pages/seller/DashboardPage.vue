<template>
  <q-page padding>
    <div class="q-mb-lg">
      <h4 class="q-my-sm">Dashboard</h4>
      <p class="text-grey-8">Welcome back, {{ storeName }}</p>
    </div>

    <!-- Stats Cards -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="stats-card bg-primary text-white">
          <q-card-section>
            <div class="text-h6">Total Orders</div>
            <div class="text-h3">{{ stats.totalOrders }}</div>
            <div class="text-caption q-mt-sm">
              <q-icon name="trending_up" v-if="stats.ordersTrend > 0" />
              <q-icon name="trending_down" v-else />
              {{ Math.abs(stats.ordersTrend) }}% from yesterday
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="stats-card bg-positive text-white">
          <q-card-section>
            <div class="text-h6">Revenue</div>
            <div class="text-h3">₱{{ formatCurrency(stats.revenue) }}</div>
            <div class="text-caption q-mt-sm">
              <q-icon name="trending_up" v-if="stats.revenueTrend > 0" />
              <q-icon name="trending_down" v-else />
              {{ Math.abs(stats.revenueTrend) }}% from yesterday
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="stats-card bg-warning text-white">
          <q-card-section>
            <div class="text-h6">Pending Orders</div>
            <div class="text-h3">{{ stats.pendingOrders }}</div>
            <div class="text-caption q-mt-sm">
              <q-btn
                flat
                dense
                color="white"
                label="View All"
                @click="navigateTo('/seller/pending-orders')"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="stats-card bg-info text-white">
          <q-card-section>
            <div class="text-h6">Rating</div>
            <div class="text-h3">{{ stats.rating.toFixed(1) }}</div>
            <div class="text-caption q-mt-sm">
              <q-rating
                v-model="stats.rating"
                size="1em"
                color="white"
                readonly
              />
              ({{ stats.reviewCount }} reviews)
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Recent Orders and Top Items -->
    <div class="row q-col-gutter-md">
      <!-- Recent Orders -->
      <div class="col-12 col-lg-8">
        <q-card>
          <q-card-section>
            <div class="text-h6">Recent Orders</div>
          </q-card-section>

          <q-separator />

          <q-list bordered separator>
            <q-item
              v-for="order in recentOrders"
              :key="order.id"
              clickable
              @click="viewOrderDetails(order.id)"
            >
              <q-item-section avatar>
                <q-avatar color="primary" text-color="white">
                  {{ order.id.substring(order.id.length - 2) }}
                </q-avatar>
              </q-item-section>

              <q-item-section>
                <q-item-label>{{ order.customer }}</q-item-label>
                <q-item-label caption
                  >{{ order.items.length }} items • ₱{{
                    formatCurrency(order.total)
                  }}</q-item-label
                >
              </q-item-section>

              <q-item-section side>
                <q-chip
                  :color="getStatusColor(order.status)"
                  text-color="white"
                  size="sm"
                >
                  {{ order.status }}
                </q-chip>
              </q-item-section>

              <q-item-section side>
                <q-item-label caption>{{
                  formatTime(order.time)
                }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-item v-if="recentOrders.length === 0">
              <q-item-section class="text-center">
                <q-item-label>No recent orders</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>

          <q-card-actions align="center">
            <q-btn
              flat
              color="primary"
              label="View All Orders"
              @click="navigateTo('/seller/pending-orders')"
            />
          </q-card-actions>
        </q-card>
      </div>

      <!-- Top Items -->
      <div class="col-12 col-lg-4">
        <q-card>
          <q-card-section>
            <div class="text-h6">Top Selling Items</div>
          </q-card-section>

          <q-separator />

          <q-list bordered separator>
            <q-item v-for="(item, index) in topItems" :key="item.id">
              <q-item-section avatar>
                <q-avatar color="primary" text-color="white">
                  {{ index + 1 }}
                </q-avatar>
              </q-item-section>

              <q-item-section>
                <q-item-label>{{ item.name }}</q-item-label>
                <q-item-label caption
                  >{{ item.orderCount }} orders</q-item-label
                >
              </q-item-section>

              <q-item-section side>
                <div class="text-weight-bold">
                  ₱{{ formatCurrency(item.price) }}
                </div>
              </q-item-section>
            </q-item>
          </q-list>

          <q-card-actions align="center">
            <q-btn
              flat
              color="primary"
              label="View All Items"
              @click="navigateTo('/seller/view-items')"
            />
          </q-card-actions>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { date } from "quasar";
import SellerService from "src/services/SellerService";
import OrderService from "src/services/OrderService";
import AuthService from "src/services/AuthService";

export default defineComponent({
  name: "SellerDashboardPage",

  setup() {
    const router = useRouter();
    const loading = ref(true);
    const error = ref(false);
    const dashboardStats = ref({
      totalOrders: 0,
      ordersTrend: 0,
      revenue: 0,
      revenueTrend: 0,
      pendingOrders: 0,
      rating: 0,
      reviewCount: 0
    });
    const orders = ref([]);
    const loadingOrders = ref(true);
    const sellerName = ref("");
    const storeName = ref("");

    // Computed property for stats
    const stats = computed(() => dashboardStats.value);

    // Mock data for top items
    const topItems = ref([]);

    // Mock data for recent orders
    const recentOrders = ref([]);

    // Load seller data
    const loadSellerData = () => {
      const userData = AuthService.getUserData();
      if (userData) {
        sellerName.value = userData.name;
        storeName.value = userData.storeName || "Your Store";
      }
    };

    // Fetch dashboard statistics
    const fetchDashboardStats = async () => {
      try {
        loading.value = true;
        
        // Check if this is a new account or first login
        const userData = AuthService.getUserData();
        const isNewAccount = userData && userData.firstLogin;
        
        if (isNewAccount) {
          // Use zeros for new accounts
          dashboardStats.value = {
            totalOrders: 0,
            ordersTrend: 0,
            revenue: 0,
            revenueTrend: 0,
            pendingOrders: 0,
            rating: 0,
            reviewCount: 0
          };
        } else {
          // Using mock data for existing accounts:
          dashboardStats.value = {
            totalOrders: 42,
            ordersTrend: 5,
            revenue: 6850,
            revenueTrend: 3,
            pendingOrders: 8,
            rating: 4.7,
            reviewCount: 24
          };
        }
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
        error.value = true;
      } finally {
        loading.value = false;
      }
    };

    // Fetch recent orders
    const fetchRecentOrders = async () => {
      try {
        loadingOrders.value = true;
        // In a real app, you would uncomment this:
        // const response = await OrderService.getSellerOrders();
        // Sort by date (newest first) and take the first 5
        // orders.value = response.data
        //  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        //  .slice(0, 5);
        
        // Using mock data for now
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        loadingOrders.value = false;
      }
    };

    // Format date for display
    const formatDate = (dateString) => {
      return date.formatDate(dateString, "MMM D, YYYY h:mm A");
    };

    // Go to order details
    const viewOrder = (orderId) => {
      router.push(`/seller/pending-orders?orderid=${orderId}`);
    };

    // Go to pending orders
    const viewAllOrders = () => {
      router.push("/seller/pending-orders");
    };

    // Format currency
    const formatCurrency = (value) => {
      return value.toLocaleString();
    };

    // Format time
    const formatTime = (timestamp) => {
      return date.formatDate(timestamp, "HH:mm");
    };

    // Get status color
    const getStatusColor = (status) => {
      switch (status.toLowerCase()) {
        case "new":
          return "blue";
        case "preparing":
          return "orange";
        case "ready":
          return "green";
        case "delivered":
          return "positive";
        default:
          return "grey";
      }
    };

    // View order details
    const viewOrderDetails = (orderId) => {
      // Navigate to order details page
      router.push(`/seller/order/${orderId}`);
    };

    // Navigate to a specific page
    const navigateTo = (path) => {
      router.push(path);
    };

    onMounted(() => {
      loadSellerData();
      fetchDashboardStats();
      fetchRecentOrders();
    });

    return {
      loading,
      error,
      loadingOrders,
      stats,
      dashboardStats,
      orders,
      sellerName,
      storeName,
      formatDate,
      viewOrder,
      viewAllOrders,
      formatCurrency,
      formatTime,
      getStatusColor,
      viewOrderDetails,
      navigateTo,
      topItems,
      recentOrders
    };
  },
});
</script>

<style lang="scss" scoped>
.stats-card {
  border-radius: 12px;

  .text-h3 {
    font-weight: 700;
  }
}
</style>
