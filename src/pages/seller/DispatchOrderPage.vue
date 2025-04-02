<template>
  <q-page padding>
    <div class="row q-mb-md items-center">
      <div class="col">
        <h4 class="q-my-xs">Dispatch Orders</h4>
        <p class="text-grey-8 q-my-none">Process and deliver customer orders</p>
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
              class="q-mb-sm"
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
      <q-icon name="local_shipping" size="5rem" color="grey-4" />
      <p class="text-h6 text-grey-8 q-mt-md">No orders to dispatch</p>
      <p class="text-grey">
        When orders are ready for dispatch, they will appear here
      </p>
    </q-card>

    <!-- Order List -->
    <div v-else>
      <q-list bordered separator>
        <q-item v-for="order in filteredOrders" :key="order.id" class="q-my-sm">
          <q-item-section>
            <q-item-label header>Order #{{ order.orderNumber }}</q-item-label>
            <q-item-label caption>
              <span class="text-weight-bold">Customer:</span>
              {{ order.customerName }}
            </q-item-label>
            <q-item-label>
              <span class="text-weight-bold">Phone:</span>
              {{ order.customerPhone }}
            </q-item-label>
            <q-item-label>
              <span class="text-weight-bold">Address:</span>
              {{ order.deliveryAddress }}
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

              <template v-if="order.status === 'Preparing'">
                <q-btn
                  color="purple"
                  label="Ready for Pickup"
                  @click="markAsReady(order.id)"
                />
              </template>

              <template v-if="order.status === 'Ready'">
                <q-btn
                  color="green"
                  label="Start Delivery"
                  @click="startDelivery(order.id)"
                />
              </template>

              <template v-if="order.status === 'Out for Delivery'">
                <q-btn
                  color="positive"
                  label="Mark as Delivered"
                  @click="markAsDelivered(order.id)"
                />
              </template>

              <q-btn
                v-if="
                  ['Preparing', 'Ready', 'Out for Delivery'].includes(
                    order.status
                  )
                "
                icon="map"
                color="blue"
                flat
                label="View Map"
                @click="viewMap(order)"
              />
            </div>
          </q-item-section>
        </q-item>
      </q-list>
    </div>

    <!-- Map Dialog -->
    <q-dialog v-model="mapDialog">
      <q-card style="width: 90vw; max-width: 600px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Delivery Location</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <div v-if="selectedOrder" class="q-mb-md">
            <p class="q-mb-xs">
              <strong>Customer:</strong> {{ selectedOrder.customerName }}
            </p>
            <p class="q-mb-xs">
              <strong>Address:</strong> {{ selectedOrder.deliveryAddress }}
            </p>
            <p class="q-my-xs">
              <strong>Phone:</strong> {{ selectedOrder.customerPhone }}
            </p>
          </div>
          <div
            class="map-container"
            style="height: 300px; background-color: #e0e0e0; border-radius: 4px"
          >
            <!-- This would be a real map in a production app -->
            <div class="flex flex-center full-height">
              <div class="text-center">
                <q-icon name="map" size="5rem" color="grey-6" />
                <p>Map would display here in a real application</p>
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            v-if="selectedOrder"
            color="primary"
            label="Get Directions"
            @click="getDirections(selectedOrder.deliveryAddress)"
          />
          <q-btn flat label="Close" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { defineComponent, ref, computed, onMounted } from "vue";
import { date } from "quasar";
import { useQuasar } from "quasar";
import OrderService from "src/services/OrderService";
import AuthService from "src/services/AuthService";

export default defineComponent({
  name: "DispatchOrderPage",

  setup() {
    const $q = useQuasar();
    const loading = ref(true);
    const orders = ref([]);
    const search = ref("");
    const orderStatus = ref("All");
    const mapDialog = ref(false);
    const selectedOrder = ref(null);

    const statusOptions = [
      { label: "All Orders", value: "All" },
      { label: "Preparing", value: "Preparing" },
      { label: "Ready for Pickup", value: "Ready" },
      { label: "Out for Delivery", value: "Out for Delivery" },
      { label: "Delivered", value: "Delivered" },
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
            order.customerName?.toLowerCase().includes(searchLower) ||
            (order.deliveryAddress && order.deliveryAddress.toLowerCase().includes(searchLower))
        );
      }

      // Filter by status
      if (orderStatus.value !== "All") {
        result = result.filter((order) => order.status === orderStatus.value);
      }

      return result;
    });

    // Get status color
    const getStatusColor = (status) => {
      switch (status) {
        case "Preparing":
          return "green";
        case "Ready":
          return "purple";
        case "Out for Delivery":
          return "blue";
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
          console.log("New seller account detected, showing empty orders for dispatch");
          orders.value = [];
        } else {
          // Get orders that are in dispatch state (Preparing, Ready, Out for Delivery)
          const response = await OrderService.getSellerOrders();
          if (response && response.data) {
            // Filter and map orders that are in dispatch state
            const dispatchStates = ["Preparing", "Ready", "Out for Delivery", "Delivered"];
            orders.value = response.data
              .filter(order => dispatchStates.includes(order.status))
              .map(order => ({
                id: order.id || order.orderNumber,
                orderNumber: order.orderNumber || order.id,
                customerName: order.customerName || order.customer || "Customer",
                customerPhone: order.customerPhone || order.phone || "No phone provided",
                deliveryAddress: order.deliveryAddress || order.address || "No address provided",
                orderDate: order.orderDate || order.createdAt || new Date(),
                status: order.status || "Preparing",
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
    const markAsReady = (orderId) => {
      // This would be an API call in a real app
      // await api.post(`/seller/orders/${orderId}/ready`)

      const order = orders.value.find((o) => o.id === orderId);
      if (order) {
        order.status = "Ready";
        $q.notify({
          color: "purple",
          message: `Order #${order.orderNumber} is ready for pickup`,
          icon: "check_circle",
        });
      }
    };

    const startDelivery = (orderId) => {
      // This would be an API call in a real app
      // await api.post(`/seller/orders/${orderId}/deliver`)

      const order = orders.value.find((o) => o.id === orderId);
      if (order) {
        order.status = "Out for Delivery";
        $q.notify({
          color: "blue",
          message: `Order #${order.orderNumber} is out for delivery`,
          icon: "local_shipping",
        });
      }
    };

    const markAsDelivered = (orderId) => {
      $q.dialog({
        title: "Confirm Delivery",
        message: "Has this order been successfully delivered to the customer?",
        cancel: true,
        persistent: true,
      }).onOk(() => {
        // This would be an API call in a real app
        // await api.post(`/seller/orders/${orderId}/complete`)

        const order = orders.value.find((o) => o.id === orderId);
        if (order) {
          order.status = "Delivered";
          $q.notify({
            color: "positive",
            message: `Order #${order.orderNumber} has been delivered successfully`,
            icon: "check_circle",
          });
        }
      });
    };

    const viewMap = (order) => {
      selectedOrder.value = order;
      mapDialog.value = true;
    };

    const getDirections = (address) => {
      // In a real app, this would open Google Maps or a similar service
      const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        address
      )}`;
      window.open(googleMapsUrl, "_blank");

      $q.notify({
        color: "blue",
        message: "Opening map directions in a new tab",
        icon: "directions",
      });
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
      mapDialog,
      selectedOrder,
      getStatusColor,
      refreshOrders,
      markAsReady,
      startDelivery,
      markAsDelivered,
      viewMap,
      getDirections,
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
