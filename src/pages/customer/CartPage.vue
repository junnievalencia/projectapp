<template>
  <q-page padding>
    <div class="row q-mb-md items-center">
      <div class="col">
        <h4 class="q-my-xs">Your Cart</h4>
        <p class="text-grey-8 q-my-none">Review and checkout your order</p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="column items-center q-pa-lg">
      <q-spinner color="primary" size="3em" />
      <p class="text-grey q-mt-md">Loading your cart...</p>
    </div>

    <!-- Empty Cart -->
    <q-card v-else-if="cartItems.length === 0" class="text-center q-pa-lg">
      <q-icon name="shopping_cart" size="5rem" color="grey-4" />
      <p class="text-h6 text-grey-8 q-mt-md">Your cart is empty</p>
      <p class="text-grey">Add items to your cart to start an order</p>
      <q-btn
        color="primary"
        label="Browse Stores"
        to="/customer/stores"
        class="q-mt-md"
      />
    </q-card>

    <!-- Cart Items -->
    <div v-else class="row q-col-gutter-md">
      <div class="col-12 col-md-8">
        <q-card>
          <q-card-section>
            <div class="text-h6">Cart Items</div>
          </q-card-section>

          <q-separator />

          <q-list separator>
            <q-item
              v-for="(item, index) in cartItems"
              :key="index"
              class="q-py-md"
            >
              <q-item-section thumbnail style="min-width: 100px">
                <img
                  :src="
                    item.imageUrl ||
                    'https://via.placeholder.com/100x100?text=Food'
                  "
                  style="width: 100px; height: 100px; object-fit: cover"
                />
              </q-item-section>

              <q-item-section>
                <q-item-label class="text-weight-bold">{{
                  item.name
                }}</q-item-label>
                <q-item-label caption>{{ item.storeName }}</q-item-label>
                <q-item-label caption v-if="item.specialInstructions">
                  <span class="text-italic"
                    >Instructions: {{ item.specialInstructions }}</span
                  >
                </q-item-label>

                <div class="row items-center q-mt-sm">
                  <q-btn-group flat>
                    <q-btn
                      flat
                      round
                      dense
                      icon="remove"
                      @click="decreaseQuantity(index)"
                      :disable="item.quantity <= 1"
                    />
                    <q-btn
                      flat
                      dense
                      class="no-padding"
                      style="min-width: 40px"
                    >
                      {{ item.quantity }}
                    </q-btn>
                    <q-btn
                      flat
                      round
                      dense
                      icon="add"
                      @click="increaseQuantity(index)"
                    />
                  </q-btn-group>

                  <q-space />

                  <div
                    class="text-subtitle1 text-weight-bold text-primary q-mx-md"
                  >
                    ₱{{ (item.price * item.quantity).toFixed(2) }}
                  </div>

                  <q-btn
                    flat
                    round
                    color="negative"
                    icon="delete"
                    @click="removeItem(index)"
                  />
                </div>
              </q-item-section>
            </q-item>
          </q-list>

          <q-card-section>
            <div class="row justify-end">
              <q-btn
                outline
                color="negative"
                label="Clear Cart"
                @click="confirmClearCart"
                class="q-mr-sm"
              />
              <q-btn
                outline
                color="primary"
                label="Continue Shopping"
                to="/customer/stores"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Order Summary -->
      <div class="col-12 col-md-4">
        <q-card class="order-summary">
          <q-card-section>
            <div class="text-h6">Order Summary</div>
          </q-card-section>

          <q-separator />

          <q-card-section>
            <div class="row justify-between q-py-sm">
              <div>Subtotal:</div>
              <div>₱{{ subtotal.toFixed(2) }}</div>
            </div>
            <div class="row justify-between q-py-sm">
              <div>Delivery Fee:</div>
              <div>₱{{ deliveryFee.toFixed(2) }}</div>
            </div>
            <div class="row justify-between q-py-sm">
              <div>Platform Fee:</div>
              <div>₱{{ platformFee.toFixed(2) }}</div>
            </div>

            <q-separator class="q-my-md" />

            <div class="row justify-between q-py-sm text-weight-bold">
              <div>Total:</div>
              <div class="text-primary text-h6">₱{{ total.toFixed(2) }}</div>
            </div>

            <div class="q-pt-md">
              <q-input
                v-model="specialInstructions"
                outlined
                type="textarea"
                label="Special Instructions"
                hint="Any special requests for your order?"
                rows="3"
              />
            </div>

            <div class="q-pt-md">
              <q-radio
                v-model="paymentMethod"
                val="cod"
                label="Cash on Delivery"
              />
              <q-radio
                v-model="paymentMethod"
                val="card"
                label="Credit/Debit Card"
              />
              <q-radio v-model="paymentMethod" val="gcash" label="GCash" />
            </div>

            <div class="q-pt-lg">
              <q-btn
                color="primary"
                class="full-width"
                size="lg"
                label="Place Order"
                @click="proceedToCheckout"
                :loading="checkingOut"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Address Modal -->
    <q-dialog v-model="addressDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Delivery Address</div>
        </q-card-section>

        <q-card-section>
          <q-input
            v-model="deliveryAddress"
            outlined
            label="Full Address"
            :rules="[(val) => !!val || 'Address is required']"
            autofocus
          />

          <q-input
            v-model="contactNumber"
            outlined
            label="Contact Number"
            class="q-mt-md"
            :rules="[(val) => !!val || 'Contact number is required']"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="grey-7" v-close-popup />
          <q-btn
            flat
            label="Confirm"
            color="primary"
            @click="confirmOrder"
            :disable="!deliveryAddress || !contactNumber"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { defineComponent, ref, computed, onMounted } from "vue";
import { useQuasar } from "quasar";
import { useRouter } from "vue-router";

export default defineComponent({
  name: "CartPage",

  setup() {
    const $q = useQuasar();
    const router = useRouter();

    const loading = ref(true);
    const cartItems = ref([]);
    const specialInstructions = ref("");
    const paymentMethod = ref("cod");
    const deliveryAddress = ref("");
    const contactNumber = ref("");
    const addressDialog = ref(false);
    const checkingOut = ref(false);

    // Computed properties
    const subtotal = computed(() => {
      return cartItems.value.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );
    });

    const deliveryFee = computed(() => {
      // Example logic: Delivery fee is 50 pesos, free for orders over 500
      return subtotal.value > 500 ? 0 : 50;
    });

    const platformFee = computed(() => {
      // Example logic: Platform fee is 5% of subtotal
      return subtotal.value * 0.05;
    });

    const total = computed(() => {
      return subtotal.value + deliveryFee.value + platformFee.value;
    });

    // Load cart data
    const loadCart = async () => {
      loading.value = true;

      try {
        // This would be an API call in a real app
        // const response = await api.get('/customer/cart')

        // Using mock data for now
        setTimeout(() => {
          cartItems.value = [
            {
              id: "item1",
              name: "Adobo Rice Bowl",
              price: 180.5,
              quantity: 2,
              storeName: "Juan's Filipino Cuisine",
              imageUrl: "https://via.placeholder.com/100x100?text=Adobo",
              specialInstructions: "Extra sauce please",
            },
            {
              id: "item2",
              name: "Halo-Halo Special",
              price: 95.75,
              quantity: 1,
              storeName: "Juan's Filipino Cuisine",
              imageUrl: "https://via.placeholder.com/100x100?text=Halo+Halo",
            },
            {
              id: "item3",
              name: "Pancit Canton",
              price: 150.0,
              quantity: 1,
              storeName: "Juan's Filipino Cuisine",
              imageUrl: "https://via.placeholder.com/100x100?text=Pancit",
            },
          ];
          loading.value = false;
        }, 1000);
      } catch (error) {
        console.error("Error loading cart:", error);
        $q.notify({
          color: "negative",
          message: "Failed to load cart",
          icon: "error",
        });
        loading.value = false;
      }
    };

    // Cart operations
    const increaseQuantity = (index) => {
      cartItems.value[index].quantity++;
      updateCart();
    };

    const decreaseQuantity = (index) => {
      if (cartItems.value[index].quantity > 1) {
        cartItems.value[index].quantity--;
        updateCart();
      }
    };

    const removeItem = (index) => {
      $q.dialog({
        title: "Remove Item",
        message: "Are you sure you want to remove this item from your cart?",
        cancel: true,
        persistent: true,
      }).onOk(() => {
        cartItems.value.splice(index, 1);
        updateCart();

        $q.notify({
          color: "negative",
          message: "Item removed from cart",
          icon: "delete",
        });
      });
    };

    const confirmClearCart = () => {
      $q.dialog({
        title: "Clear Cart",
        message: "Are you sure you want to clear your entire cart?",
        cancel: true,
        persistent: true,
      }).onOk(() => {
        cartItems.value = [];
        updateCart();

        $q.notify({
          color: "negative",
          message: "Cart cleared",
          icon: "delete_sweep",
        });
      });
    };

    const updateCart = async () => {
      // This would be an API call in a real app
      // await api.put('/customer/cart', { items: cartItems.value })

      // For now, we're just using local state
      console.log("Cart updated:", cartItems.value);
    };

    // Checkout process
    const proceedToCheckout = () => {
      if (cartItems.value.length === 0) {
        $q.notify({
          color: "negative",
          message: "Your cart is empty",
          icon: "error",
        });
        return;
      }

      addressDialog.value = true;
    };

    const confirmOrder = async () => {
      checkingOut.value = true;
      addressDialog.value = false;

      try {
        // This would be an API call in a real app
        // const orderData = {
        //   items: cartItems.value,
        //   deliveryAddress: deliveryAddress.value,
        //   contactNumber: contactNumber.value,
        //   specialInstructions: specialInstructions.value,
        //   paymentMethod: paymentMethod.value,
        //   subtotal: subtotal.value,
        //   deliveryFee: deliveryFee.value,
        //   platformFee: platformFee.value,
        //   total: total.value
        // }
        // const response = await api.post('/customer/orders', orderData)

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Clear cart after successful order
        cartItems.value = [];

        $q.notify({
          color: "positive",
          message: "Order placed successfully!",
          icon: "check_circle",
        });

        // Redirect to orders page
        router.push("/customer/orders");
      } catch (error) {
        console.error("Error placing order:", error);
        $q.notify({
          color: "negative",
          message: "Failed to place order",
          icon: "error",
        });
      } finally {
        checkingOut.value = false;
      }
    };

    onMounted(() => {
      loadCart();
    });

    return {
      loading,
      cartItems,
      specialInstructions,
      paymentMethod,
      deliveryAddress,
      contactNumber,
      addressDialog,
      checkingOut,
      subtotal,
      deliveryFee,
      platformFee,
      total,
      increaseQuantity,
      decreaseQuantity,
      removeItem,
      confirmClearCart,
      proceedToCheckout,
      confirmOrder,
    };
  },
});
</script>

<style lang="scss" scoped>
.order-summary {
  position: sticky;
  top: 20px;
}
</style>
