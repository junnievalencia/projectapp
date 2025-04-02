<template>
  <q-page class="q-pa-md">
    <div v-if="loading" class="row justify-center q-py-xl">
      <q-spinner-dots color="primary" size="40px" />
    </div>

    <div v-else-if="!product" class="text-center q-py-xl">
      <q-icon name="error_outline" size="100px" color="grey-4" />
      <h4 class="text-h5 q-mt-md">Product not found</h4>
      <p class="text-grey">The product you're looking for does not exist or has been removed.</p>
      <q-btn color="primary" label="Back to Products" to="/" class="q-mt-md" />
    </div>

    <div v-else class="row q-col-gutter-xl">
      <div class="col-12 col-md-6">
        <q-img
          :src="product.image || 'https://placehold.co/600x400?text=Food+Image'"
          style="height: 400px; width: 100%"
          fit="cover"
          class="rounded-borders product-image"
        />
      </div>

      <div class="col-12 col-md-6">
        <div class="q-mb-md">
          <q-breadcrumbs class="text-grey">
            <q-breadcrumbs-el label="Home" to="/" />
            <q-breadcrumbs-el label="Products" to="/" />
            <q-breadcrumbs-el :label="product.name" />
          </q-breadcrumbs>
        </div>

        <h1 class="text-h4 q-mb-xs">{{ product.name }}</h1>
        <div class="text-subtitle1 text-grey q-mb-sm">{{ product.category }}</div>

        <div class="text-h5 text-primary q-mb-md">${{ product.price.toFixed(2) }}</div>

        <p class="text-body1 q-mb-lg">{{ product.description || 'No description available for this product.' }}</p>

        <div class="row q-col-gutter-sm q-mb-lg">
          <div class="col-6 col-sm-4">
            <div class="quantity-selector">
              <span class="text-subtitle1 q-mr-md">Quantity:</span>
              <div class="row items-center">
                <q-btn flat round dense icon="remove" color="grey"
                       @click="quantity = Math.max(1, quantity - 1)"
                       :disable="quantity <= 1" />
                <div class="q-mx-sm text-subtitle1">{{ quantity }}</div>
                <q-btn flat round dense icon="add" color="grey"
                       @click="quantity++" />
              </div>
            </div>
          </div>
        </div>

        <div class="row q-col-gutter-md">
          <div class="col-12 col-sm-6">
            <q-btn color="primary" class="full-width q-py-sm"
                   label="Add to Cart" @click="addToCart" :loading="addingToCart"
                   icon="shopping_cart" />
          </div>
          <div class="col-12 col-sm-6">
            <q-btn outline color="primary" class="full-width q-py-sm"
                   label="Buy Now" icon="credit_card" />
          </div>
        </div>

        <q-separator class="q-my-lg" />

        <div class="row q-col-gutter-md">
          <div class="col-12 col-sm-6">
            <div class="flex items-center">
              <q-icon name="local_shipping" color="positive" size="24px" class="q-mr-sm" />
              <span>Free delivery on orders over $50</span>
            </div>
          </div>
          <div class="col-12 col-sm-6">
            <div class="flex items-center">
              <q-icon name="schedule" color="info" size="24px" class="q-mr-sm" />
              <span>Delivery within 30 minutes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import ProductService from 'src/services/ProductService';
import CartService from 'src/services/CartService';
import AuthService from 'src/services/AuthService';

export default defineComponent({
  name: 'ProductDetailPage',

  setup() {
    const $q = useQuasar();
    const route = useRoute();
    const router = useRouter();

    const product = ref(null);
    const loading = ref(true);
    const quantity = ref(1);
    const addingToCart = ref(false);

    const fetchProduct = async () => {
      try {
        loading.value = true;
        const productId = route.params.id;

        if (!productId) {
          router.push('/');
          return;
        }

        const response = await ProductService.getProduct(productId);
        product.value = response.data;
      } catch (error) {
        console.error('Error fetching product:', error);
        $q.notify({
          color: 'negative',
          message: 'Failed to load product details',
          icon: 'error'
        });
      } finally {
        loading.value = false;
      }
    };

    const addToCart = async () => {
      try {
        // Check if user is authenticated
        if (!AuthService.isAuthenticated()) {
          // Store the intended product and action for after login
          localStorage.setItem('pendingCartAction', JSON.stringify({
            productId: product.value.id,
            quantity: quantity.value
          }));

          $q.notify({
            message: 'Please log in to add items to your cart',
            color: 'info',
            icon: 'info'
          });

          router.push('/login');
          return;
        }

        addingToCart.value = true;
        await CartService.addToCart(product.value.id, quantity.value);

        $q.notify({
          color: 'positive',
          message: `${product.value.name} added to cart`,
          icon: 'shopping_cart'
        });
      } catch (error) {
        console.error('Error adding to cart:', error);
        $q.notify({
          color: 'negative',
          message: 'Failed to add to cart. Please try again.',
          icon: 'error'
        });
      } finally {
        addingToCart.value = false;
      }
    };

    onMounted(fetchProduct);

    return {
      product,
      loading,
      quantity,
      addingToCart,
      addToCart
    };
  }
});
</script>

<style lang="scss" scoped>
.product-image {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;

  &:hover {
    transform: scale(1.02);
  }
}

.quantity-selector {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}
</style>
