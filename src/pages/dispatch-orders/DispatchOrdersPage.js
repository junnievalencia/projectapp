import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { db } from 'boot/firebase'
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  doc, 
  updateDoc,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore'

export function useDispatchOrdersPage() {
  const $q = useQuasar()
  const router = useRouter()
  
  // Orders data
  const dispatchOrders = ref([])
  const loading = ref(false)
  const search = ref('')
  const pagination = ref({
    page: 1,
    rowsPerPage: 10,
    rowsNumber: 0
  })

  // Filtered orders based on search
  const filteredOrders = computed(() => {
    if (!search.value) return dispatchOrders.value
    
    const searchLower = search.value.toLowerCase()
    return dispatchOrders.value.filter(order => 
      order.id.includes(searchLower) ||
      order.customerName.toLowerCase().includes(searchLower) ||
      order.orderDate.toLowerCase().includes(searchLower) ||
      (order.deliveryAddress && order.deliveryAddress.toLowerCase().includes(searchLower))
    )
  })

  // Get order status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'dispatched': return 'orange'
      case 'ready': return 'green'
      case 'out_for_delivery': return 'blue'
      case 'delivered': return 'positive'
      case 'cancelled': return 'red'
      default: return 'grey'
    }
  }

  // Format Firestore timestamp to readable date
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A'
    
    // Handle both Firestore Timestamp objects and JavaScript Date objects
    const date = timestamp instanceof Timestamp ? 
      timestamp.toDate() : 
      (timestamp instanceof Date ? timestamp : new Date())
    
    return date.toLocaleString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    })
  }

  // Fetch dispatch orders from Firestore
  const fetchDispatchOrders = async () => {
    loading.value = true
    try {
      // Query orders with status dispatched, ready, or out_for_delivery
      const ordersQuery = query(
        collection(db, 'orders'),
        where('status', 'in', ['dispatched', 'ready', 'out_for_delivery']),
        orderBy('createdAt', 'desc')
      )
      
      const querySnapshot = await getDocs(ordersQuery)
      
      const orders = []
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        orders.push({
          id: doc.id,
          orderNumber: doc.id.substring(0, 8).toUpperCase(),
          customerName: data.customerName || 'Unknown',
          orderDate: formatDate(data.createdAt),
          deliveryAddress: data.deliveryAddress || 'Pickup',
          deliveryContact: data.customerPhone || 'N/A',
          items: data.items || [],
          total: parseFloat(data.totalAmount) || 0,
          status: data.status || 'dispatched',
          paymentMethod: data.paymentMethod || 'Cash',
          rider: data.rider || null
        })
      })
      
      dispatchOrders.value = orders
      pagination.value.rowsNumber = orders.length
    } catch (error) {
      console.error('Error fetching dispatch orders:', error)
      if ($q && typeof $q.notify === 'function') {
        $q.notify({
          color: 'negative',
          message: 'Failed to load dispatch orders',
          icon: 'error'
        })
      }
    } finally {
      loading.value = false
    }
  }

  // Mark order as out for delivery
  const markOutForDelivery = async (order) => {
    if ($q && typeof $q.dialog === 'function') {
      $q.dialog({
        title: 'Assign Rider',
        message: 'Enter the name of the rider:',
        prompt: {
          model: '',
          type: 'text'
        },
        cancel: true,
        persistent: true
      }).onOk(async (riderName) => {
        await processDeliveryAssignment(order, riderName);
      });
    } else {
      console.warn('Quasar dialog component is not available. Using default rider name.');
      // If dialog isn't available, use a default rider name
      const defaultRider = "Delivery Staff";
      await processDeliveryAssignment(order, defaultRider);
    }
  };

  // Process the delivery assignment separately
  const processDeliveryAssignment = async (order, riderName) => {
    try {
      if ($q && $q.loading) {
        $q.loading.show();
      }
      
      // Update order status in Firestore
      const orderRef = doc(db, 'orders', order.id);
      await updateDoc(orderRef, {
        status: 'out_for_delivery',
        rider: riderName,
        updatedAt: serverTimestamp()
      });
      
      // Update local state
      const index = dispatchOrders.value.findIndex(o => o.id === order.id);
      if (index !== -1) {
        dispatchOrders.value[index].status = 'out_for_delivery';
        dispatchOrders.value[index].rider = riderName;
      }
      
      if ($q && typeof $q.notify === 'function') {
        $q.notify({
          color: 'positive',
          message: `Order #${order.orderNumber} is now out for delivery with ${riderName}`,
          icon: 'directions_bike'
        });
      }
    } catch (error) {
      console.error('Error dispatching order:', error);
      if ($q && typeof $q.notify === 'function') {
        $q.notify({
          color: 'negative',
          message: 'Failed to update order status: ' + error.message,
          icon: 'error'
        });
      }
    } finally {
      if ($q && $q.loading) {
        $q.loading.hide();
      }
    }
  };

  // Mark order as delivered
  const markAsDelivered = async (order) => {
    try {
      if ($q && $q.loading) {
        $q.loading.show()
      }
      
      // Update order status in Firestore
      const orderRef = doc(db, 'orders', order.id)
      await updateDoc(orderRef, {
        status: 'delivered',
        deliveredAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      
      // Update local state
      const index = dispatchOrders.value.findIndex(o => o.id === order.id)
      if (index !== -1) {
        dispatchOrders.value[index].status = 'delivered'
        // Remove from the list after a short delay
        setTimeout(() => {
          dispatchOrders.value = dispatchOrders.value.filter(o => o.id !== order.id)
        }, 1500)
      }
      
      if ($q && typeof $q.notify === 'function') {
        $q.notify({
          color: 'positive',
          message: `Order #${order.orderNumber} has been delivered successfully`,
          icon: 'check_circle'
        })
      }
    } catch (error) {
      console.error('Error marking order as delivered:', error)
      if ($q && typeof $q.notify === 'function') {
        $q.notify({
          color: 'negative',
          message: 'Failed to update order status: ' + error.message,
          icon: 'error'
        })
      }
    } finally {
      if ($q && $q.loading) {
        $q.loading.hide()
      }
    }
  }

  // Mark order as ready for pickup
  const markAsReady = async (order) => {
    try {
      if ($q && $q.loading) {
        $q.loading.show()
      }
      
      // Update order status in Firestore
      const orderRef = doc(db, 'orders', order.id)
      await updateDoc(orderRef, {
        status: 'ready',
        updatedAt: serverTimestamp()
      })
      
      // Update local state
      const index = dispatchOrders.value.findIndex(o => o.id === order.id)
      if (index !== -1) {
        dispatchOrders.value[index].status = 'ready'
      }
      
      if ($q && typeof $q.notify === 'function') {
        $q.notify({
          color: 'positive',
          message: `Order #${order.orderNumber} is now ready for pickup`,
          icon: 'check_circle'
        })
      }
    } catch (error) {
      console.error('Error marking order as ready:', error)
      if ($q && typeof $q.notify === 'function') {
        $q.notify({
          color: 'negative',
          message: 'Failed to update order status: ' + error.message,
          icon: 'error'
        })
      }
    } finally {
      if ($q && $q.loading) {
        $q.loading.hide()
      }
    }
  }

  // Cancel an order
  const cancelOrder = async (order) => {
    try {
      // If dialog is available, use it for confirmation
      if ($q && typeof $q.dialog === 'function') {
        $q.dialog({
          title: 'Confirm Cancellation',
          message: `Are you sure you want to cancel order #${order.orderNumber}?`,
          cancel: true,
          persistent: true
        }).onOk(async () => {
          await processCancellation(order);
        });
      } else {
        // If dialog isn't available, proceed directly with cancellation
        console.warn('Quasar dialog component is not available. Proceeding with direct cancellation.');
        await processCancellation(order);
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      if ($q && typeof $q.notify === 'function') {
        $q.notify({
          color: 'negative',
          message: 'Failed to cancel order: ' + error.message,
          icon: 'error'
        });
      }
      if ($q && $q.loading) {
        $q.loading.hide();
      }
    }
  };

  // Process the actual cancellation separately to avoid code duplication
  const processCancellation = async (order) => {
    try {
      if ($q && $q.loading) {
        $q.loading.show();
      }
      
      // Update order status in Firestore
      const orderRef = doc(db, 'orders', order.id);
      await updateDoc(orderRef, {
        status: 'cancelled',
        updatedAt: serverTimestamp()
      });
      
      // Update local state
      const index = dispatchOrders.value.findIndex(o => o.id === order.id);
      if (index !== -1) {
        dispatchOrders.value[index].status = 'cancelled';
        // Remove from the list after a short delay
        setTimeout(() => {
          dispatchOrders.value = dispatchOrders.value.filter(o => o.id !== order.id);
        }, 1500);
      }
      
      if ($q && typeof $q.notify === 'function') {
        $q.notify({
          color: 'info',
          message: `Order #${order.orderNumber} has been cancelled`,
          icon: 'info'
        });
      }
    } finally {
      if ($q && $q.loading) {
        $q.loading.hide();
      }
    }
  };

  // Calculate total from order items
  const calculateOrderTotal = (items) => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  // Navigation function to go back
  const goBack = () => {
    router.push('/dashboard')
  }

  // Refresh data
  const refreshData = () => {
    fetchDispatchOrders()
  }

  // Fetch data on component mount
  onMounted(() => {
    fetchDispatchOrders()
  })

  return {
    dispatchOrders,
    filteredOrders,
    loading,
    search,
    pagination,
    getStatusColor,
    markOutForDelivery,
    markAsDelivered,
    markAsReady,
    cancelOrder,
    calculateOrderTotal,
    goBack,
    refreshData
  }
} 