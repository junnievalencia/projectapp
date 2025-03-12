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

      <q-form @submit="onSubmit" class="q-mb-xl">
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
import { defineComponent } from 'vue'
import { useCheckoutPage } from './CheckoutPage.js'

export default defineComponent({
  name: 'CheckoutPage',

  setup () {
    const {
      formData,
      subtotal,
      deliveryCharge,
      total,
      onSubmit
    } = useCheckoutPage()

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
