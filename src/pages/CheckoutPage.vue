<template>
  <q-page class="bg-grey-1">
    <!-- Header -->
    <div class="q-pa-md bg-white">
      <div class="row items-center">
        <q-btn flat round icon="arrow_back" color="black" @click="$router.go(-1)" />
        <div class="text-h6 text-weight-bold q-ml-sm">CHECKOUT</div>
      </div>
    </div>

    <!-- Checkout Form -->
    <div class="q-pa-md">
      <div class="text-subtitle1 q-mb-sm">Estimated delivery</div>
      <div class="text-subtitle1 text-weight-bold q-mb-lg">Standard Delivery (5-20mins)</div>

      <q-form @submit="onSubmit" class="q-gutter-md">
        <!-- Name -->
        <q-input
          v-model="formData.name"
          label="Name"
          outlined
          :rules="[val => !!val || 'Name is required']"
        />

        <!-- Department & Room -->
        <q-input
          v-model="formData.department"
          label="Department & Room no."
          outlined
          :rules="[val => !!val || 'Department & Room is required']"
        />

        <!-- Number -->
        <q-input
          v-model="formData.number"
          label="Number"
          outlined
          type="tel"
          :rules="[val => !!val || 'Number is required']"
        />

        <!-- Payment Method -->
        <div>
          <div class="text-subtitle1 q-mb-sm">Payment Method</div>
          <q-option-group
            v-model="formData.paymentMethod"
            :options="[
              { label: 'Cash On Delivery', value: 'cod' },
              { label: 'GCash', value: 'gcash' }
            ]"
            type="radio"
            color="orange"
          />
        </div>

        <!-- Other Details -->
        <q-input
          v-model="formData.otherDetails"
          label="Other Details to Locate you"
          outlined
          type="textarea"
          rows="3"
        />

        <!-- Order Summary -->
        <q-card flat bordered class="q-pa-md q-mt-lg">
          <div class="row justify-between q-mb-sm">
            <div>Subtotal:</div>
            <div>₱{{ subtotal.toFixed(2) }}</div>
          </div>
          <div class="row justify-between q-mb-sm">
            <div>Delivery Charge:</div>
            <div>₱{{ deliveryCharge.toFixed(2) }}</div>
          </div>
          <q-separator class="q-my-sm" />
          <div class="row justify-between text-weight-bold">
            <div>Total:</div>
            <div>₱{{ total.toFixed(2) }}</div>
          </div>
        </q-card>

        <!-- Place Order Button -->
        <q-btn
          label="PLACE MY ORDER"
          color="orange"
          class="full-width"
          size="lg"
          type="submit"
        />
      </q-form>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

export default defineComponent({
  name: 'CheckoutPage',

  setup () {
    const router = useRouter()
    const cartItems = ref([])
    const formData = ref({
      name: '',
      department: '',
      number: '',
      paymentMethod: 'cod',
      otherDetails: ''
    })

    // Load cart items and calculate totals
    onMounted(() => {
      const cartString = localStorage.getItem('cart')
      if (cartString) {
        cartItems.value = JSON.parse(cartString)
      } else {
        // Redirect to cart if no items
        router.push('/cart')
      }
    })

    const subtotal = computed(() => {
      return cartItems.value.reduce((total, item) => {
        return total + (item.price * item.quantity)
      }, 0)
    })

    const deliveryCharge = ref(10.00)

    const total = computed(() => {
      return subtotal.value + deliveryCharge.value
    })

    const onSubmit = () => {
      try {
        // Generate a unique order ID
        const orderId = 'ORD-' + Date.now()

        // Set payment status based on payment method
        const paymentStatus = formData.value.paymentMethod === 'gcash'
          ? 'Paid'
          : 'Cash On Delivery'

        // Create order object
        const order = {
          id: orderId,
          ...formData.value,
          items: cartItems.value,
          subtotal: subtotal.value,
          deliveryCharge: deliveryCharge.value,
          total: total.value,
          orderDate: new Date().toISOString(),
          status: 'Preparing',
          storeNumber: '09XX XXX XXXX',
          deliveryNumber: '09XX XXX XXXX',
          paymentStatus
        }

        // Save order to localStorage
        const orders = JSON.parse(localStorage.getItem('orders') || '[]')
        orders.push(order)
        localStorage.setItem('orders', JSON.stringify(orders))

        // Clear cart
        localStorage.removeItem('cart')

        // Navigate to success page
        router.push('/order-success')
      } catch (error) {
        console.error('Error submitting order:', error)
        alert('Failed to place order. Please try again.')
      }
    }

    return {
      formData,
      subtotal,
      deliveryCharge,
      total,
      onSubmit
    }
  }
})
</script>

<style lang="scss" scoped>
.q-form {
  max-width: 600px;
  margin: 0 auto;
}
</style>
