<template>
  <q-page class="q-pa-md">
    <div class="q-mb-lg">
      <h1 class="text-h4">Your Cart</h1>
      <q-breadcrumbs class="text-grey">
        <q-breadcrumbs-el label="Home" to="/" />
        <q-breadcrumbs-el label="Cart" />
      </q-breadcrumbs>
    </div>

    <div v-if="loading" class="row justify-center q-py-xl">
      <q-spinner-dots color="primary" size="40px" />
    </div>

    <div v-else-if="cartItems.length === 0" class="empty-cart q-py-xl text-center">
      <q-icon name="shopping_cart" size="100px" color="grey-4" />
      <h4 class="text-h5 q-mt-md">Your cart is empty</h4>
      <p class="text-grey">Looks like you haven't added anything to your cart yet.</p>
      <q-btn color="primary" label="Start Shopping" to="/" class="q-mt-md" />
    </div>

    <div v-else class="row q-col-gutter-lg">
      <div class="col-12 col-md-8">
        <q-card flat bordered class="cart-items">
          <q-list separator>
            <q-item v-for="item in cartItems" :key="item.productId" class="q-py-md">
              <q-item-section avatar>
                <q-img
                  :src="item.image || 'https://placehold.co/100?text=Food'"
                  width="90px"
                  height="90px"
                  class="rounded-borders"
                />
              </q-item-section>

              <q-item-section>
                <q-item-label class="text-subtitle1 text-weight-bold">{{ item.name }}</q-item-label>
                <q-item-label caption>{{ item.category }}</q-item-label>
                <q-item-label class="text-primary text-weight-bold q-mt-xs">
                  ${{ (item.price * item.quantity).toFixed(2) }}
                </q-item-label>
              </q-item-section>

              <q-item-section side>
                <div class="row items-center quantity-controls">
                  <q-btn flat round dense icon="remove" color="grey"
                         @click="updateQuantity(item.productId, Math.max(1, item.quantity - 1))"
                         :disable="item.quantity <= 1" />
                  <div class="q-mx-sm text-subtitle1">{{ item.quantity }}</div>
                  <q-btn flat round dense icon="add" color="grey"
                         @click="updateQuantity(item.productId, item.quantity + 1)" />
                </div>
                <q-btn flat round dense icon="delete" color="negative" class="q-mt-sm"
                       @click="updateQuantity(item.productId, 0)" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </div>

      <div class="col-12 col-md-4">
        <q-card flat bordered class="q-pa-md">
          <div class="text-h6 q-mb-md">Order Summary</div>

          <div class="row justify-between q-mb-sm">
            <div class="text-subtitle1">Subtotal</div>
            <div class="text-subtitle1">${{ subtotal.toFixed(2) }}</div>
          </div>

          <div class="row justify-between q-mb-sm">
            <div class="text-subtitle1">Delivery Fee</div>
            <div class="text-subtitle1">${{ deliveryFee.toFixed(2) }}</div>
          </div>

          <div class="row justify-between q-mb-sm">
            <div class="text-subtitle1">Tax</div>
            <div class="text-subtitle1">${{ tax.toFixed(2) }}</div>
          </div>

          <q-separator class="q-my-md" />

          <div class="row justify-between q-mb-lg">
            <div class="text-h6">Total</div>
            <div class="text-h6">${{ total.toFixed(2) }}</div>
          </div>

          <q-btn color="primary" label="Checkout" class="full-width q-py-sm" :loading="checkoutLoading" />

          <q-separator class="q-my-md" />

          <div class="row q-mb-md">
            <q-input
              v-model="promoCode"
              outlined
              dense
              placeholder="Promo Code"
              class="col"
            >
              <template v-slot:append>
                <q-btn color="primary" outline label="Apply" />
              </template>
            </q-input>
          </div>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import CartService from 'src/services/CartService';
import AuthService from 'src/services/AuthService';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'CartPage',

  setup() {
    const $q = useQuasar();
    const router = useRouter();
    const cartItems = ref([]);
    const loading = ref(true);
    const checkoutLoading = ref(false);
    const promoCode = ref('');

    // Fixed delivery fee
    const deliveryFee = ref(5.99);
    // Tax rate (10%)
    const taxRate = 0.1;

    const subtotal = computed(() => {
      return cartItems.value.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    });

    const tax = computed(() => {
      return subtotal.value * taxRate;
    });

    const total = computed(() => {
      return subtotal.value + deliveryFee.value + tax.value;
    });

    const loadCart = async () => {
      try {
        loading.value = true;

        // Check if user is authenticated
        if (!AuthService.isAuthenticated()) {
          router.push('/login');
          return;
        }

        const response = await CartService.getUserCart();
        cartItems.value = response.data || [];
      } catch (error) {
        console.error('Error loading cart:', error);
        $q.notify({
          color: 'negative',
          message: 'Failed to load your cart. Please try again.',
          icon: 'error'
        });
      } finally {
        loading.value = false;
      }
    };

    const updateQuantity = async (productId, quantity) => {
      try {
        // If quantity is 0, remove item from cart
        if (quantity === 0) {
          await CartService.updateQuantity(productId, 0);
          cartItems.value = cartItems.value.filter(item => item.productId !== productId);
          $q.notify({
            color: 'positive',
            message: 'Item removed from cart',
            icon: 'check_circle'
          });
          return;
        }

        await CartService.updateQuantity(productId, quantity);

        // Update local cart item quantity
        const itemIndex = cartItems.value.findIndex(item => item.productId === productId);
        if (itemIndex !== -1) {
          cartItems.value[itemIndex].quantity = quantity;
        }

        $q.notify({
          color: 'positive',
          message: 'Cart updated',
          icon: 'check_circle'
        });
      } catch (error) {
        console.error('Error updating cart:', error);
        $q.notify({
          color: 'negative',
          message: 'Failed to update cart. Please try again.',
          icon: 'error'
        });
      }
    };

    onMounted(loadCart);

    return {
      cartItems,
      loading,
      checkoutLoading,
      promoCode,
      subtotal,
      deliveryFee,
      tax,
      total,
      updateQuantity
    };
  }
});
</script>

<style lang="scss" scoped>
.empty-cart {
  padding: 40px 0;
}

.quantity-controls {
  padding: 0 10px;
  border-radius: 4px;
}
</style>
