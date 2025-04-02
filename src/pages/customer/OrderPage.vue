<template>
  <q-page padding>
    <div class="row q-mb-md items-center">
      <div class="col">
        <h4 class="q-my-xs">Your Orders</h4>
        <p class="text-grey-8 q-my-none">View and track your orders</p>
      </div>
      <div>
        <q-btn
          flat
          round
          color="primary"
          icon="refresh"
          @click="refreshOrders"
          :loading="loading"
        />
      </div>
    </div>

    <!-- Order Filters -->
    <div class="q-mb-md">
      <q-btn-toggle
        v-model="activeTab"
        toggle-color="primary"
        :options="[
          { label: 'All Orders', value: 'all' },
          { label: 'Active', value: 'active' },
          { label: 'Completed', value: 'completed' },
        ]"
        class="q-mb-md"
      />
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="column items-center q-pa-lg">
      <q-spinner color="primary" size="3em" />
      <p class="text-grey q-mt-md">Loading your orders...</p>
    </div>

    <!-- Empty State -->
    <q-card v-else-if="filteredOrders.length === 0" class="text-center q-pa-lg">
      <q-icon name="receipt_long" size="5rem" color="grey-4" />
      <p class="text-h6 text-grey-8 q-mt-md">No orders found</p>
      <p class="text-grey">
        {{
          activeTab === "all"
            ? "You haven't placed any orders yet"
            : activeTab === "active"
            ? "You don't have any active orders"
            : "You don't have any completed orders"
        }}
      </p>
      <q-btn
        color="primary"
        label="Order Now"
        to="/customer/stores"
        class="q-mt-md"
      />
    </q-card>

    <!-- Orders List -->
    <div v-else>
      <q-list separator>
        <q-item v-for="order in filteredOrders" :key="order.id" class="q-py-md">
          <q-item-section>
            <q-card class="order-card">
              <q-card-section>
                <div class="row justify-between items-start">
                  <div>
                    <div class="text-subtitle1 text-weight-bold">
                      {{ order.storeName }}
                    </div>
                    <div class="text-caption text-grey">
                      Order #{{ order.id }}
                    </div>
                    <div class="text-caption text-grey">
                      Placed on {{ formatDate(order.createdAt) }}
                    </div>
                  </div>
                  <div>
                    <q-chip
                      :color="getStatusColor(order.status)"
                      text-color="white"
                      size="sm"
                    >
                      {{ getStatusLabel(order.status) }}
                    </q-chip>
                  </div>
                </div>
              </q-card-section>

              <q-separator />

              <!-- Order Items -->
              <q-card-section>
                <div class="text-subtitle2 q-mb-sm">Order Items:</div>
                <q-list dense>
                  <q-item v-for="(item, idx) in order.items" :key="idx">
                    <q-item-section>
                      <q-item-label>
                        <span class="text-weight-medium"
                          >{{ item.quantity }}x</span
                        >
                        {{ item.name }}
                      </q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      ₱{{ (item.price * item.quantity).toFixed(2) }}
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-card-section>

              <q-separator />

              <!-- Order Summary -->
              <q-card-section>
                <div class="row justify-between q-py-xs">
                  <div>Subtotal:</div>
                  <div>₱{{ order.subtotal.toFixed(2) }}</div>
                </div>
                <div class="row justify-between q-py-xs">
                  <div>Delivery Fee:</div>
                  <div>₱{{ order.deliveryFee.toFixed(2) }}</div>
                </div>
                <div class="row justify-between q-py-xs">
                  <div>Platform Fee:</div>
                  <div>₱{{ order.platformFee.toFixed(2) }}</div>
                </div>
                <div class="row justify-between q-py-xs text-weight-bold">
                  <div>Total:</div>
                  <div class="text-primary">₱{{ order.total.toFixed(2) }}</div>
                </div>
              </q-card-section>

              <!-- If order is active, show tracking -->
              <template v-if="isOrderActive(order.status)">
                <q-separator />
                <q-card-section>
                  <div class="text-subtitle2 q-mb-sm">Order Tracking:</div>
                  <q-stepper
                    v-model="order.currentStep"
                    vertical
                    color="primary"
                    :contracted="true"
                    inactive-color="grey-7"
                  >
                    <q-step
                      :name="1"
                      :done="getStepDone(order.status, 1)"
                      title="Order Placed"
                      :caption="
                        order.timeline?.orderPlaced
                          ? formatDateTime(order.timeline.orderPlaced)
                          : ''
                      "
                      icon="receipt"
                    />
                    <q-step
                      :name="2"
                      :done="getStepDone(order.status, 2)"
                      title="Order Confirmed"
                      :caption="
                        order.timeline?.orderConfirmed
                          ? formatDateTime(order.timeline.orderConfirmed)
                          : ''
                      "
                      icon="thumb_up"
                    />
                    <q-step
                      :name="3"
                      :done="getStepDone(order.status, 3)"
                      title="Preparing Order"
                      :caption="
                        order.timeline?.preparingOrder
                          ? formatDateTime(order.timeline.preparingOrder)
                          : ''
                      "
                      icon="restaurant"
                    />
                    <q-step
                      :name="4"
                      :done="getStepDone(order.status, 4)"
                      title="Out for Delivery"
                      :caption="
                        order.timeline?.outForDelivery
                          ? formatDateTime(order.timeline.outForDelivery)
                          : ''
                      "
                      icon="delivery_dining"
                    />
                    <q-step
                      :name="5"
                      :done="getStepDone(order.status, 5)"
                      title="Delivered"
                      :caption="
                        order.timeline?.delivered
                          ? formatDateTime(order.timeline.delivered)
                          : ''
                      "
                      icon="check_circle"
                    />
                  </q-stepper>
                </q-card-section>

                <q-separator />

                <!-- Map View Button -->
                <q-card-actions align="right">
                  <q-btn
                    flat
                    color="primary"
                    icon="map"
                    label="View on Map"
                    @click="viewOrderOnMap(order)"
                    v-if="order.status === 'out_for_delivery'"
                  />
                  <q-btn
                    flat
                    color="primary"
                    icon="receipt_long"
                    label="Order Details"
                    @click="viewOrderDetails(order)"
                  />
                </q-card-actions>
              </template>

              <!-- If order is completed or cancelled -->
              <template v-else>
                <q-separator />
                <q-card-actions align="right">
                  <q-btn
                    flat
                    color="primary"
                    icon="receipt_long"
                    label="Order Details"
                    @click="viewOrderDetails(order)"
                  />
                  <q-btn
                    v-if="order.status === 'delivered'"
                    flat
                    color="primary"
                    icon="rate_review"
                    label="Leave Review"
                    @click="leaveReview(order)"
                  />
                  <q-btn
                    v-if="order.status === 'delivered'"
                    flat
                    color="primary"
                    icon="replay"
                    label="Reorder"
                    @click="reorder(order)"
                  />
                </q-card-actions>
              </template>
            </q-card>
          </q-item-section>
        </q-item>
      </q-list>
    </div>

    <!-- Map Dialog -->
    <q-dialog v-model="mapDialog">
      <q-card style="width: 90vw; max-width: 600px">
        <q-card-section class="row items-center">
          <div class="text-h6">Delivery Tracking</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <div class="text-subtitle2">Your order is on the way!</div>
          <div class="text-caption q-mb-md">
            Expected delivery time: {{ selectedOrder?.estimatedDeliveryTime }}
          </div>

          <!-- Map would go here in a real app -->
          <div class="map-placeholder">
            <q-img
              src="https://via.placeholder.com/600x400?text=Map+View"
              style="height: 300px; width: 100%"
            />
            <div class="absolute-center text-center">
              <q-icon name="map" size="4rem" color="primary" />
              <div class="text-subtitle1 q-mt-sm">
                Delivery tracking map would appear here
              </div>
              <div class="text-caption">
                This is a placeholder for demo purposes
              </div>
            </div>
          </div>

          <div class="row q-mt-md">
            <div class="col">
              <div class="text-subtitle2">Delivery Address:</div>
              <div>{{ selectedOrder?.deliveryAddress }}</div>
            </div>
            <div class="col">
              <div class="text-subtitle2">Contact Number:</div>
              <div>{{ selectedOrder?.contactNumber }}</div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            flat
            color="primary"
            icon="phone"
            label="Call Driver"
            @click="callDriver"
          />
          <q-btn
            color="primary"
            label="Get Directions"
            @click="getDirections"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Order Details Dialog -->
    <q-dialog v-model="detailsDialog">
      <q-card style="width: 90vw; max-width: 600px">
        <q-card-section class="row items-center">
          <div class="text-h6">Order Details</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section v-if="selectedOrder">
          <div class="text-subtitle1 text-weight-bold">
            {{ selectedOrder.storeName }}
          </div>
          <div class="text-caption text-grey">
            Order #{{ selectedOrder.id }}
          </div>
          <div class="text-caption text-grey">
            Placed on {{ formatDate(selectedOrder.createdAt) }}
          </div>

          <q-separator class="q-my-md" />

          <!-- Items -->
          <div class="text-subtitle2 q-mb-sm">Order Items:</div>
          <q-list dense>
            <q-item v-for="(item, idx) in selectedOrder.items" :key="idx">
              <q-item-section>
                <q-item-label>
                  <span class="text-weight-medium">{{ item.quantity }}x</span>
                  {{ item.name }}
                </q-item-label>
                <q-item-label caption v-if="item.specialInstructions">
                  <span class="text-italic"
                    >Note: {{ item.specialInstructions }}</span
                  >
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                ₱{{ (item.price * item.quantity).toFixed(2) }}
              </q-item-section>
            </q-item>
          </q-list>

          <q-separator class="q-my-md" />

          <!-- Summary -->
          <div class="row justify-between q-py-xs">
            <div>Subtotal:</div>
            <div>₱{{ selectedOrder.subtotal.toFixed(2) }}</div>
          </div>
          <div class="row justify-between q-py-xs">
            <div>Delivery Fee:</div>
            <div>₱{{ selectedOrder.deliveryFee.toFixed(2) }}</div>
          </div>
          <div class="row justify-between q-py-xs">
            <div>Platform Fee:</div>
            <div>₱{{ selectedOrder.platformFee.toFixed(2) }}</div>
          </div>

          <q-separator class="q-my-sm" />

          <div class="row justify-between q-py-xs text-weight-bold">
            <div>Total:</div>
            <div class="text-primary">
              ₱{{ selectedOrder.total.toFixed(2) }}
            </div>
          </div>

          <q-separator class="q-my-md" />

          <!-- Delivery Info -->
          <div class="text-subtitle2">Delivery Information:</div>
          <div class="q-ml-sm q-mt-xs">
            <div>
              <span class="text-weight-medium">Address:</span>
              {{ selectedOrder.deliveryAddress }}
            </div>
            <div>
              <span class="text-weight-medium">Contact:</span>
              {{ selectedOrder.contactNumber }}
            </div>
            <div v-if="selectedOrder.specialInstructions">
              <span class="text-weight-medium">Instructions:</span>
              {{ selectedOrder.specialInstructions }}
            </div>
          </div>

          <q-separator class="q-my-md" />

          <!-- Payment Info -->
          <div class="text-subtitle2">Payment Information:</div>
          <div class="q-ml-sm q-mt-xs">
            <div>
              <span class="text-weight-medium">Method:</span>
              {{ getPaymentMethodLabel(selectedOrder.paymentMethod) }}
            </div>
            <div><span class="text-weight-medium">Status:</span> Paid</div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            v-if="selectedOrder?.status === 'delivered'"
            flat
            color="primary"
            icon="replay"
            label="Reorder"
            @click="reorderFromDetails"
          />
          <q-btn flat color="primary" label="Close" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Review Dialog -->
    <q-dialog v-model="reviewDialog">
      <q-card style="width: 90vw; max-width: 500px">
        <q-card-section class="row items-center">
          <div class="text-h6">Leave a Review</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <div class="text-subtitle1 q-mb-md">
            How was your order from {{ selectedOrder?.storeName }}?
          </div>

          <div class="q-mb-md text-center">
            <q-rating
              v-model="reviewRating"
              size="3em"
              color="amber"
              icon="star_border"
              icon-selected="star"
              max="5"
            />
          </div>

          <q-input
            v-model="reviewComment"
            type="textarea"
            label="Your comments"
            hint="Share your experience with the food and service"
            outlined
            autogrow
            class="q-mb-md"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="grey-7" v-close-popup />
          <q-btn
            color="primary"
            label="Submit Review"
            @click="submitReview"
            :loading="submittingReview"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { defineComponent, ref, computed, onMounted } from "vue";
import { useQuasar } from "quasar";
import { date } from "quasar";

export default defineComponent({
  name: "OrderPage",

  setup() {
    const $q = useQuasar();

    const loading = ref(true);
    const orders = ref([]);
    const activeTab = ref("all");
    const mapDialog = ref(false);
    const detailsDialog = ref(false);
    const reviewDialog = ref(false);
    const selectedOrder = ref(null);
    const reviewRating = ref(0);
    const reviewComment = ref("");
    const submittingReview = ref(false);

    // Computed properties
    const filteredOrders = computed(() => {
      if (activeTab.value === "all") {
        return orders.value;
      } else if (activeTab.value === "active") {
        return orders.value.filter((order) => isOrderActive(order.status));
      } else {
        return orders.value.filter((order) => !isOrderActive(order.status));
      }
    });

    // Load orders
    const fetchOrders = async () => {
      loading.value = true;

      try {
        // This would be an API call in a real app
        // const response = await api.get('/customer/orders')

        // Using mock data for now
        setTimeout(() => {
          orders.value = generateMockOrders();
          loading.value = false;
        }, 1000);
      } catch (error) {
        console.error("Error loading orders:", error);
        $q.notify({
          color: "negative",
          message: "Failed to load orders",
          icon: "error",
        });
        loading.value = false;
      }
    };

    const refreshOrders = () => {
      fetchOrders();
    };

    // Helper functions
    const formatDate = (dateString) => {
      const dateObj = new Date(dateString);
      return date.formatDate(dateObj, "MMM D, YYYY");
    };

    const formatDateTime = (dateString) => {
      const dateObj = new Date(dateString);
      return date.formatDate(dateObj, "MMM D, YYYY h:mm A");
    };

    const getStatusColor = (status) => {
      const statusColors = {
        pending: "grey",
        confirmed: "blue",
        preparing: "orange",
        ready_for_pickup: "teal",
        out_for_delivery: "purple",
        delivered: "positive",
        cancelled: "negative",
      };
      return statusColors[status] || "grey";
    };

    const getStatusLabel = (status) => {
      const statusLabels = {
        pending: "Pending",
        confirmed: "Confirmed",
        preparing: "Preparing",
        ready_for_pickup: "Ready for Pickup",
        out_for_delivery: "Out for Delivery",
        delivered: "Delivered",
        cancelled: "Cancelled",
      };
      return statusLabels[status] || "Unknown";
    };

    const getPaymentMethodLabel = (method) => {
      const methodLabels = {
        cod: "Cash on Delivery",
        card: "Credit/Debit Card",
        gcash: "GCash",
      };
      return methodLabels[method] || "Unknown";
    };

    const isOrderActive = (status) => {
      return [
        "pending",
        "confirmed",
        "preparing",
        "ready_for_pickup",
        "out_for_delivery",
      ].includes(status);
    };

    const getStepDone = (status, step) => {
      const statuses = [
        "pending",
        "confirmed",
        "preparing",
        "out_for_delivery",
        "delivered",
      ];
      const currentStatusIndex = statuses.indexOf(status);
      return step - 1 <= currentStatusIndex;
    };

    // Actions
    const viewOrderOnMap = (order) => {
      selectedOrder.value = order;
      mapDialog.value = true;
    };

    const viewOrderDetails = (order) => {
      selectedOrder.value = order;
      detailsDialog.value = true;
    };

    const callDriver = () => {
      $q.notify({
        color: "positive",
        message: "Calling driver...",
        icon: "phone",
      });
    };

    const getDirections = () => {
      $q.notify({
        color: "positive",
        message: "Opening directions in maps...",
        icon: "directions",
      });
    };

    const leaveReview = (order) => {
      selectedOrder.value = order;
      reviewRating.value = 0;
      reviewComment.value = "";
      reviewDialog.value = true;
    };

    const submitReview = async () => {
      if (reviewRating.value === 0) {
        $q.notify({
          color: "negative",
          message: "Please provide a rating",
          icon: "error",
        });
        return;
      }

      submittingReview.value = true;

      try {
        // This would be an API call in a real app
        // await api.post('/customer/reviews', {
        //   orderId: selectedOrder.value.id,
        //   storeId: selectedOrder.value.storeId,
        //   rating: reviewRating.value,
        //   comment: reviewComment.value
        // });

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        $q.notify({
          color: "positive",
          message: "Thank you for your review!",
          icon: "check_circle",
        });

        reviewDialog.value = false;
      } catch (error) {
        console.error("Error submitting review:", error);
        $q.notify({
          color: "negative",
          message: "Failed to submit review",
          icon: "error",
        });
      } finally {
        submittingReview.value = false;
      }
    };

    const reorder = (order) => {
      // This would add all items from previous order to cart
      $q.notify({
        color: "positive",
        message: "Items added to cart",
        icon: "shopping_cart",
      });
    };

    const reorderFromDetails = () => {
      reorder(selectedOrder.value);
      detailsDialog.value = false;
    };

    // Mock data generator
    const generateMockOrders = () => {
      const now = new Date();

      return [
        {
          id: "ORD10001",
          storeId: "store1",
          storeName: "Juan's Filipino Cuisine",
          status: "out_for_delivery",
          createdAt: date.subtractFromDate(now, { hours: 1 }),
          items: [
            {
              id: "item1",
              name: "Adobo Rice Bowl",
              price: 180.5,
              quantity: 1,
            },
            {
              id: "item2",
              name: "Halo-Halo Special",
              price: 95.75,
              quantity: 2,
              specialInstructions: "Less ice please",
            },
          ],
          subtotal: 372.0,
          deliveryFee: 50.0,
          platformFee: 18.6,
          total: 440.6,
          deliveryAddress: "123 Main St, Makati City",
          contactNumber: "09123456789",
          paymentMethod: "cod",
          specialInstructions: "Please ring the doorbell",
          estimatedDeliveryTime: "30-45 minutes",
          currentStep: 4,
          timeline: {
            orderPlaced: date.subtractFromDate(now, { hours: 1 }),
            orderConfirmed: date.subtractFromDate(now, { minutes: 55 }),
            preparingOrder: date.subtractFromDate(now, { minutes: 35 }),
            outForDelivery: date.subtractFromDate(now, { minutes: 15 }),
          },
        },
        {
          id: "ORD10002",
          storeId: "store2",
          storeName: "Maria's Panciteria",
          status: "delivered",
          createdAt: date.subtractFromDate(now, { days: 1 }),
          items: [
            {
              id: "item3",
              name: "Pancit Canton - Family Size",
              price: 250.0,
              quantity: 1,
            },
            {
              id: "item4",
              name: "Lumpiang Shanghai (10 pcs)",
              price: 120.0,
              quantity: 2,
            },
          ],
          subtotal: 490.0,
          deliveryFee: 0.0, // Free delivery over 400
          platformFee: 24.5,
          total: 514.5,
          deliveryAddress: "123 Main St, Makati City",
          contactNumber: "09123456789",
          paymentMethod: "gcash",
          timeline: {
            orderPlaced: date.subtractFromDate(now, { days: 1, hours: 2 }),
            orderConfirmed: date.subtractFromDate(now, {
              days: 1,
              hours: 1,
              minutes: 55,
            }),
            preparingOrder: date.subtractFromDate(now, {
              days: 1,
              hours: 1,
              minutes: 30,
            }),
            outForDelivery: date.subtractFromDate(now, { days: 1, hours: 1 }),
            delivered: date.subtractFromDate(now, { days: 1, minutes: 30 }),
          },
        },
        {
          id: "ORD10003",
          storeId: "store3",
          storeName: "Sweet Delights Bakery",
          status: "preparing",
          createdAt: date.subtractFromDate(now, { minutes: 20 }),
          items: [
            {
              id: "item5",
              name: "Ube Ensaymada (3 pcs)",
              price: 160.0,
              quantity: 1,
            },
            {
              id: "item6",
              name: "Mango Cake - Small",
              price: 350.0,
              quantity: 1,
            },
          ],
          subtotal: 510.0,
          deliveryFee: 0.0, // Free delivery over 400
          platformFee: 25.5,
          total: 535.5,
          deliveryAddress: "123 Main St, Makati City",
          contactNumber: "09123456789",
          paymentMethod: "card",
          specialInstructions: "Happy Birthday message on the cake please",
          currentStep: 3,
          timeline: {
            orderPlaced: date.subtractFromDate(now, { minutes: 20 }),
            orderConfirmed: date.subtractFromDate(now, { minutes: 15 }),
            preparingOrder: date.subtractFromDate(now, { minutes: 10 }),
          },
        },
        {
          id: "ORD10004",
          storeId: "store4",
          storeName: "Mang Inasal Express",
          status: "cancelled",
          createdAt: date.subtractFromDate(now, { days: 2 }),
          items: [
            {
              id: "item7",
              name: "Chicken Inasal - 1 pc",
              price: 120.0,
              quantity: 2,
            },
            {
              id: "item8",
              name: "Halo-Halo Regular",
              price: 80.0,
              quantity: 1,
            },
          ],
          subtotal: 320.0,
          deliveryFee: 50.0,
          platformFee: 16.0,
          total: 386.0,
          deliveryAddress: "123 Main St, Makati City",
          contactNumber: "09123456789",
          paymentMethod: "cod",
          timeline: {
            orderPlaced: date.subtractFromDate(now, { days: 2, hours: 1 }),
            orderConfirmed: date.subtractFromDate(now, {
              days: 2,
              minutes: 55,
            }),
          },
        },
      ];
    };

    onMounted(() => {
      fetchOrders();
    });

    return {
      loading,
      orders,
      activeTab,
      filteredOrders,
      mapDialog,
      detailsDialog,
      reviewDialog,
      selectedOrder,
      reviewRating,
      reviewComment,
      submittingReview,
      refreshOrders,
      formatDate,
      formatDateTime,
      getStatusColor,
      getStatusLabel,
      getPaymentMethodLabel,
      isOrderActive,
      getStepDone,
      viewOrderOnMap,
      viewOrderDetails,
      callDriver,
      getDirections,
      leaveReview,
      submitReview,
      reorder,
      reorderFromDetails,
    };
  },
});
</script>

<style lang="scss" scoped>
.order-card {
  width: 100%;
}

.map-placeholder {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
}
</style>
