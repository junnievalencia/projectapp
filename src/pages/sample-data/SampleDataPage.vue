<template>
  <q-page class="sample-data-page q-pa-md">
    <div class="page-header q-mb-md">
      <q-btn
        icon="arrow_back"
        flat
        round
        color="primary"
        @click="goBack"
        class="q-mr-sm"
      />
      <div class="text-h6">Sample Data</div>
    </div>

    <div class="sample-data-container">
      <q-card class="q-mb-md">
        <q-card-section>
          <div class="text-h6">Sample Orders</div>
          <div class="text-subtitle2 text-grey">Add sample pending orders to the database</div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn
            color="primary"
            label="Add Sample Orders"
            :loading="loading"
            @click="addSampleOrders"
          />
          <q-btn
            color="secondary"
            label="View Pending Orders"
            @click="navigateToPendingOrders"
            class="q-ml-sm"
          />
        </q-card-actions>
      </q-card>

      <q-card v-if="ordersAdded.length > 0" class="q-mb-md">
        <q-card-section>
          <div class="text-h6">Recently Added Orders</div>
          <q-list bordered separator>
            <q-item v-for="(order, index) in ordersAdded" :key="index">
              <q-item-section>
                <q-item-label>Order #{{ index + 1 }}</q-item-label>
                <q-item-label caption>ID: {{ order }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </div>

    <!-- Custom loading dialog -->
    <q-dialog v-model="showLoadingDialog" persistent>
      <q-card style="min-width: 300px">
        <q-card-section class="row items-center justify-center q-pb-none">
          <div class="text-h6">Adding Sample Orders</div>
        </q-card-section>
        <q-card-section class="row items-center justify-center">
          <q-spinner-dots color="primary" size="40px" />
        </q-card-section>
        <q-card-section class="text-center">
          <p>Creating orders in the database...</p>
          <p class="text-caption">You'll be redirected to Pending Orders when complete</p>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { defineComponent, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { addSampleOrders } from '../pending-orders/sample-orders'

export default defineComponent({
  name: 'SampleDataPage',
  setup() {
    const $q = useQuasar()
    const router = useRouter()
    const loading = ref(false)
    const showLoadingDialog = ref(false)
    const ordersAdded = ref([])
    const autoNavigate = ref(true)

    const goBack = () => {
      router.push('/dashboard')
    }

    const navigateToPendingOrders = () => {
      // Set a flag to trigger refresh on PendingOrdersPage
      localStorage.setItem('refreshPendingOrders', 'true')
      router.push('/pending-orders')
    }

    const addSampleOrdersHandler = async () => {
      loading.value = true
      showLoadingDialog.value = true
      try {
        const addedOrderIds = await addSampleOrders()
        ordersAdded.value = addedOrderIds
        $q.notify({
          color: 'positive',
          message: `Successfully added ${addedOrderIds.length} sample orders`,
          icon: 'check'
        })
        
        // Automatically navigate to pending orders page
        if (autoNavigate.value) {
          setTimeout(() => {
            showLoadingDialog.value = false
            loading.value = false
            navigateToPendingOrders()
          }, 1500)
        } else {
          showLoadingDialog.value = false
        }
      } catch (error) {
        console.error('Error adding sample orders:', error)
        showLoadingDialog.value = false
        $q.notify({
          color: 'negative',
          message: 'Failed to add sample orders',
          icon: 'error'
        })
      } finally {
        loading.value = false
      }
    }

    return {
      loading,
      showLoadingDialog,
      ordersAdded,
      goBack,
      navigateToPendingOrders,
      addSampleOrders: addSampleOrdersHandler
    }
  }
})
</script>

<style lang="scss" scoped>
.sample-data-page {
  background-color: #f5f5f5;
  min-height: 100vh;
}

.page-header {
  display: flex;
  align-items: center;
}

.sample-data-container {
  max-width: 800px;
  margin: 0 auto;
}
</style> 