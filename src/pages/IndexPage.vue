<template>
  <q-page class="bg-grey-1">
    <!-- Header Section -->
    <div class="q-pa-md bg-primary text-white">
      <div class="text-h5 q-mb-md">Welcome to BUsinessHub</div>
      <div class="text-subtitle2">Manage your food orders efficiently</div>
    </div>

    <!-- Quick Stats Cards -->
    <div class="q-pa-md row q-col-gutter-md">
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="bg-positive text-white">
          <q-card-section>
            <div class="text-h6">Today's Orders</div>
            <div class="text-h4">25</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="bg-warning text-white">
          <q-card-section>
            <div class="text-h6">Pending</div>
            <div class="text-h4">8</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="bg-info text-white">
          <q-card-section>
            <div class="text-h6">Completed</div>
            <div class="text-h4">17</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="bg-purple text-white">
          <q-card-section>
            <div class="text-h6">Revenue</div>
            <div class="text-h4">$850</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Recent Orders Table -->
    <div class="q-pa-md">
      <q-table
        title="Recent Orders"
        :rows="orders"
        :columns="columns"
        row-key="id"
        :pagination="{ rowsPerPage: 5 }"
      >
        <template v-slot:body-cell-status="props">
          <q-td :props="props">
            <q-chip :color="getStatusColor(props.value)" text-color="white" dense>
              {{ props.value }}
            </q-chip>
          </q-td>
        </template>
        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <q-btn-group spread flat>
              <q-btn color="primary" icon="visibility" dense flat />
              <q-btn color="positive" icon="check" dense flat />
              <q-btn color="negative" icon="close" dense flat />
            </q-btn-group>
          </q-td>
        </template>
      </q-table>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'IndexPage',
  setup () {
    const columns = [
      { name: 'id', label: 'Order ID', field: 'id', sortable: true },
      { name: 'customer', label: 'Customer', field: 'customer', sortable: true },
      { name: 'items', label: 'Items', field: 'items' },
      { name: 'total', label: 'Total', field: 'total', sortable: true },
      { name: 'status', label: 'Status', field: 'status', sortable: true },
      { name: 'actions', label: 'Actions', field: 'actions' }
    ]

    const orders = ref([
      {
        id: '#1234',
        customer: 'John Doe',
        items: '2x Burger, 1x Fries',
        total: '$25.99',
        status: 'Pending'
      },
      {
        id: '#1235',
        customer: 'Jane Smith',
        items: '1x Pizza, 2x Coke',
        total: '$18.50',
        status: 'Completed'
      },
      {
        id: '#1236',
        customer: 'Mike Johnson',
        items: '3x Tacos, 1x Sprite',
        total: '$15.99',
        status: 'Processing'
      }
    ])

    const getStatusColor = (status) => {
      switch (status.toLowerCase()) {
        case 'pending':
          return 'warning'
        case 'completed':
          return 'positive'
        case 'processing':
          return 'info'
        case 'cancelled':
          return 'negative'
        default:
          return 'grey'
      }
    }

    return {
      columns,
      orders,
      getStatusColor
    }
  }
})
</script>
