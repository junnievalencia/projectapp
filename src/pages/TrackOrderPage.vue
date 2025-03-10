<template>
  <q-page class="bg-grey-1">
    <!-- Header -->
    <div class="q-pa-md bg-white">
      <div class="row items-center">
        <q-btn flat round icon="arrow_back" color="black" @click="$router.go(-1)" />
        <div class="text-h6 text-weight-bold q-ml-sm">TRACK ORDER</div>
      </div>
    </div>

    <div class="q-pa-md">
      <!-- Delivery Info -->
      <div class="text-subtitle1 text-grey">Estimated delivery</div>
      <div class="text-subtitle1 text-weight-bold q-mb-lg">Standard Delivery (5-20mins)</div>

      <!-- Order Status -->
      <div class="row items-center q-mb-lg">
        <div class="text-subtitle1 text-weight-bold">Status</div>
        <div class="text-subtitle1 text-orange q-ml-auto">{{ order.status || 'Out for delivery' }}</div>
      </div>

      <!-- Order Items -->
      <div class="q-mb-lg">
        <q-card v-for="item in order.items" :key="item.id" flat bordered class="q-mb-md">
          <q-card-section>
            <div class="row items-center">
              <q-img :src="item.image" width="60px" height="60px" class="rounded-borders" />
              <div class="col q-ml-md">
                <div class="text-subtitle1">{{ item.name }}</div>
                <div class="text-caption text-grey">{{ item.restaurant }}</div>
              </div>
              <div class="col-auto">
                <div class="row items-center">
                  <q-btn flat round dense color="grey" icon="remove" @click="void 0" disabled />
                  <div class="text-subtitle1 q-mx-sm">{{ item.quantity }}</div>
                  <q-btn flat round dense color="grey" icon="add" @click="void 0" disabled />
                </div>
                <div class="text-subtitle1 text-weight-bold q-mt-sm">₱{{ (item.price * item.quantity).toFixed(2) }}</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Store and Delivery Info -->
      <div class="text-body1 q-mb-md">
        <div class="text-weight-bold">Store number:</div>
        <div>{{ order.storeNumber || '09XX XXX XXXX' }}</div>
      </div>

      <div class="text-body1 q-mb-lg">
        <div class="text-weight-bold">Delivery number:</div>
        <div>{{ order.deliveryNumber || '09XX XXX XXXX' }}</div>
      </div>

      <!-- Order Summary -->
      <q-card flat bordered class="q-pa-md q-mt-lg">
        <div class="row justify-between q-mb-sm">
          <div>Subtotal:</div>
          <div>₱{{ order.subtotal?.toFixed(2) }}</div>
        </div>
        <div class="row justify-between q-mb-sm">
          <div>Delivery Charge:</div>
          <div>₱{{ order.deliveryCharge?.toFixed(2) }}</div>
        </div>
        <q-separator class="q-my-sm" />
        <div class="row justify-between text-weight-bold">
          <div>Total:</div>
          <div>₱{{ order.total?.toFixed(2) }}</div>
        </div>
        <div class="row justify-between text-weight-bold q-mt-md">
          <div>Payment:</div>
          <div>
            <template v-if="order.paymentStatus === 'Paid'">
              <div class="text-green">{{ order.paymentStatus }}</div>
            </template>
            <template v-else>
              <div class="text-orange">Cash On Delivery</div>
              <div class="text-red text-caption">Please prepare exact amount</div>
            </template>
          </div>
        </div>
      </q-card>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export default defineComponent({
  name: 'TrackOrderPage',

  setup () {
    const route = useRoute()
    const router = useRouter()
    const order = ref({})

    onMounted(() => {
      // Get orders from localStorage
      const orders = JSON.parse(localStorage.getItem('orders') || '[]')
      const orderId = route.params.id

      // Find the specific order
      const foundOrder = orders.find(o => o.id === orderId)
      if (foundOrder) {
        order.value = foundOrder

        // Set status to "Out for delivery" if it's "Preparing"
        if (order.value.status === 'Preparing') {
          order.value.status = 'Out for delivery'
        }
      } else {
        // If order not found, redirect to home
        router.push('/home')
      }
    })

    return {
      order
    }
  }
})
</script>

<style lang="scss" scoped>
.status-badge {
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 500;
}
</style>
