<template>
  <q-page class="bg-grey-1">
    <!-- Header -->
    <div class="q-pa-md bg-white">
      <div class="row items-center">
        <div class="text-h6 text-weight-bold q-ml-sm">CHECKOUT</div>
      </div>
    </div>

    <!-- Success Message -->
    <div class="q-pa-md text-center">
      <div class="text-h5 text-weight-bold q-mt-xl">YOUR ORDER PLACED</div>

      <!-- Success Icon -->
      <div class="success-icon q-my-xl">
        <q-icon name="check" color="white" size="64px" />
      </div>

      <div class="text-subtitle1 text-grey q-mb-xl">
        Please wait as we prepare<br>
        and deliver your order
      </div>

      <!-- Track Order Button -->
      <q-btn
        label="TRACK MY ORDER"
        color="orange"
        class="full-width q-mt-lg"
        size="lg"
        :to="'/track-order/' + orderId"
      />
    </div>
  </q-page>
</template>

<script>
import { defineComponent } from 'vue'
import { useOrderSuccessPage } from './OrderSuccessPage.js'

export default defineComponent({
  name: 'OrderSuccessPage',

  setup () {
    const { orderId } = useOrderSuccessPage()

    return {
      orderId
    }
  }
})
</script>

<style lang="scss" scoped>
.success-icon {
  width: 120px;
  height: 120px;
  background-color: #ff9800;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  animation: scale-in 0.3s ease-out;
}

.q-btn {
  margin-top: 350px;
}

@keyframes scale-in {
  0% {
    transform: scale(0);
  }
  70% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}
</style>
