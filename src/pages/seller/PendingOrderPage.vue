<template>
  <q-page padding>
    <div class="row q-mb-md items-center">
      <div class="col">
        <h4 class="q-my-xs">Pending Orders</h4>
        <p class="text-grey-8 q-my-none">Manage your incoming orders</p>
      </div>
      <div class="col-auto">
        <q-btn
          color="primary"
          icon="refresh"
          label="Refresh"
          @click="refreshOrders"
        />
      </div>
    </div>

    <q-card class="q-mb-md">
      <q-card-section>
        <div class="row items-center">
          <div class="col">
            <q-input
              dense
              outlined
              v-model="search"
              label="Search orders"
              class="q-mb-md"
            >
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
          <div class="col-auto q-ml-md">
            <q-select
              v-model="orderStatus"
              :options="statusOptions"
              label="Filter by Status"
              outlined
              dense
              options-dense
              emit-value
              map-options
              class="q-ml-sm"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Loading State -->
    <div v-if="loading" class="column items-center q-pa-lg">
      <q-spinner color="primary" size="3em" />
      <p class="text-grey q-mt-md">Loading orders...</p>
    </div>

    <!-- Empty State -->
    <q-card v-else-if="filteredOrders.length === 0" class="text-center q-pa-lg">
      <q-icon name="pending_actions" size="5rem" color="grey-4" />
      <p class="text-h6 text-grey-8 q-mt-md">No pending orders found</p>
      <p class="text-grey">
        When customers place orders, they will appear here
      </p>
    </q-card>

    <!-- Order List -->
    <div v-else>
      <q-list bordered separator>
        <q-item v-for="order in filteredOrders" :key="order.id" class="q-my-sm">
          <q-item-section>
            <q-item-label header>Order #{{ order.orderNumber }}</q-item-label>
            <q-item-label caption>
              <span class="text-weight-bold">Placed:</span>
              {{ formatDate(order.orderDate) }}
            </q-item-label>
            <q-item-label>
              <span class="text-weight-bold">Customer:</span>
              {{ order.customerName }}
            </q-item-label>
            <q-item-label>
              <span class="text-weight-bold">Items:</span>
              {{ order.items.length }}
            </q-item-label>
            <q-item-label>
              <span class="text-weight-bold">Total:</span> ₱{{
                order.totalAmount.toFixed(2)
              }}
            </q-item-label>

            <q-expansion-item
              icon="list"
              label="Order Details"
              caption="Tap to see items"
              header-class="text-primary"
            >
              <q-card>
                <q-card-section>
                  <q-list dense>
                    <q-item v-for="(item, index) in order.items" :key="index">
                      <q-item-section>
                        <q-item-label>{{ item.name }}</q-item-label>
                        <q-item-label caption
                          >Quantity: {{ item.quantity }}</q-item-label
                        >
                      </q-item-section>
                      <q-item-section side>
                        ₱{{ item.price.toFixed(2) }}
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-card-section>
              </q-card>
            </q-expansion-item>
          </q-item-section>

          <q-item-section side>
            <div class="column items-center q-gutter-y-sm">
              <q-badge
                :color="getStatusColor(order.status)"
                class="q-py-xs q-px-md"
              >
                {{ order.status }}
              </q-badge>

              <q-btn
                color="primary"
                label="Accept"
                @click="acceptOrder(order.id)"
                v-if="order.status === 'Pending'"
              />
              <q-btn
                color="negative"
                label="Reject"
                @click="rejectOrder(order.id)"
                v-if="order.status === 'Pending'"
                flat
              />
              <q-btn
                color="orange"
                label="Prepare"
                @click="prepareOrder(order.id)"
                v-if="order.status === 'Accepted'"
              />
            </div>
          </q-item-section>
        </q-item>
      </q-list>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref, computed, onMounted } from "vue";
import { date } from "quasar";
import { useQuasar } from "quasar";
import OrderService from "src/services/OrderService";
import AuthService from "src/services/AuthService";

export default defineComponent({
  name: "PendingOrderPage",

  setup() {
    const $q = useQuasar();
    const loading = ref(true);
    const orders = ref([]);
    const search = ref("");
    const orderStatus = ref("Pending");

    const statusOptions = [
      { label: "All Orders", value: "All" },
      { label: "Pending", value: "Pending" },
      { label: "Accepted", value: "Accepted" },
      { label: "Preparing", value: "Preparing" },
    ];

    // Filter orders based on search and status
    const filteredOrders = computed(() => {
      let result = orders.value;

      // Filter by search term
      if (search.value) {
        const searchLower = search.value.toLowerCase();
        result = result.filter(
          (order) =>
            order.orderNumber?.toString().includes(searchLower) ||
            order.customerName?.toLowerCase().includes(searchLower)
        );
      }

      // Filter by status
      if (orderStatus.value !== "All") {
        result = result.filter((order) => order.status === orderStatus.value);
      }

      return result;
    });

    // Format date
    const formatDate = (dateString) => {
      return date.formatDate(dateString, "MMM D, YYYY h:mm A");
    };

    // Get status color
    const getStatusColor = (status) => {
      switch (status) {
        case "Pending":
          return "orange";
        case "Accepted":
          return "blue";
        case "Preparing":
          return "green";
        case "Ready":
          return "purple";
        case "Delivered":
          return "positive";
        case "Cancelled":
          return "negative";
        default:
          return "grey";
      }
    };

    // Fetch orders using OrderService
    const fetchOrders = async () => {
      loading.value = true;

      try {
        // Check if this is a new account
        const userData = AuthService.getUserData();
        const isNewAccount = userData && userData.firstLogin;
        
        if (isNewAccount) {
          // New account - empty orders
          console.log("New seller account detected, showing empty orders");
          orders.value = [];
        } else {
          // Use OrderService to get pending orders
          const response = await OrderService.getPendingOrders();
          if (response && response.data) {
            // Map the data to our order format if needed
            orders.value = response.data.map(order => ({
              id: order.id || order.orderNumber,
              orderNumber: order.orderNumber || order.id,
              customerName: order.customerName || order.customer,
              orderDate: order.orderDate || order.createdAt || new Date(),
              status: order.status || "Pending",
              totalAmount: order.totalAmount || order.total || 0,
              items: order.items || []
            }));
          } else {
            orders.value = [];
          }
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
        orders.value = [];
        $q.notify({
          color: "negative",
          message: "Failed to load orders",
          icon: "error",
        });
      } finally {
        loading.value = false;
      }
    };

    // Refresh orders
    const refreshOrders = () => {
      fetchOrders();
      $q.notify({
        color: "positive",
        message: "Orders refreshed",
        icon: "refresh",
      });
    };

    // Order actions
    const acceptOrder = (orderId) => {
      // This would be an API call in a real app
      // await api.post(`/seller/orders/${orderId}/accept`)

      const order = orders.value.find((o) => o.id === orderId);
      if (order) {
        order.status = "Accepted";
        $q.notify({
          color: "positive",
          message: `Order #${order.orderNumber} accepted`,
          icon: "check_circle",
        });
      }
    };

    const rejectOrder = (orderId) => {
      $q.dialog({
        title: "Reject Order",
        message: "Are you sure you want to reject this order?",
        cancel: true,
        persistent: true,
      }).onOk(() => {
        // This would be an API call in a real app
        // await api.post(`/seller/orders/${orderId}/reject`)

        const order = orders.value.find((o) => o.id === orderId);
        if (order) {
          order.status = "Cancelled";
          $q.notify({
            color: "negative",
            message: `Order #${order.orderNumber} rejected`,
            icon: "cancel",
          });
        }
      });
    };

    const prepareOrder = (orderId) => {
      // This would be an API call in a real app
      // await api.post(`/seller/orders/${orderId}/prepare`)

      const order = orders.value.find((o) => o.id === orderId);
      if (order) {
        order.status = "Preparing";
        $q.notify({
          color: "blue",
          message: `Order #${order.orderNumber} is now being prepared`,
          icon: "restaurant",
        });
      }
    };

    // Fetch orders on component mount
    onMounted(() => {
      fetchOrders();
    });

    return {
      loading,
      orders,
      search,
      orderStatus,
      statusOptions,
      filteredOrders,
      formatDate,
      getStatusColor,
      refreshOrders,
      acceptOrder,
      rejectOrder,
      prepareOrder,
    };
  },
});
</script>

<style lang="scss" scoped>
.q-item {
  border-radius: 8px;
  transition: all 0.3s ease;

  &:hover {
    background-color: rgba(0, 0, 0, 0.03);
  }
}
</style>
