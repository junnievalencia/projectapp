<template>
  <q-card class="product-card">
    <q-img
      :src="product.image || 'https://placehold.co/300x200?text=Food+Image'"
      :ratio="16/9"
      height="200px"
      class="product-image"
    />

    <q-card-section>
      <div class="row items-center no-wrap">
        <div class="col">
          <div class="text-h6 q-mt-sm q-mb-xs">{{ product.name }}</div>
          <div class="text-caption text-grey">{{ product.category }}</div>
        </div>
        <div class="col-auto text-h6 text-primary">
          ${{ product.price.toFixed(2) }}
        </div>
      </div>
      <q-separator class="q-my-md" />
      <div class="text-body2 product-description">
        {{ product.description || 'No description available' }}
      </div>
    </q-card-section>

    <q-card-actions align="right">
      <q-btn
        flat
        round
        color="grey"
        icon="favorite_border"
      />
      <q-btn
        flat
        color="primary"
        label="Add to Cart"
        @click="addToCart"
        :loading="loading"
      />
    </q-card-actions>
  </q-card>
</template>

<script>
import { ref } from 'vue';
import CartService from 'src/services/CartService';
import { useQuasar } from 'quasar';

export default {
  name: 'ProductCard',

  props: {
    product: {
      type: Object,
      required: true
    }
  },

  setup(props) {
    const loading = ref(false);
    const $q = useQuasar();

    const addToCart = async () => {
      try {
        loading.value = true;
        await CartService.addToCart(props.product.id, 1);
        $q.notify({
          color: 'positive',
          message: `${props.product.name} added to cart`,
          icon: 'shopping_cart'
        });
      } catch (error) {
        $q.notify({
          color: 'negative',
          message: 'Failed to add to cart. Please try again.',
          icon: 'error'
        });
        console.error('Error adding to cart:', error);
      } finally {
        loading.value = false;
      }
    };

    return {
      loading,
      addToCart
    };
  }
};
</script>

<style lang="scss" scoped>
.product-card {
  width: 100%;
  transition: transform 0.3s;

  &:hover {
    transform: translateY(-5px);
  }

  .product-image {
    object-fit: cover;
  }

  .product-description {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
</style>
