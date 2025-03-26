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

export function usePendingOrdersPage() {
  const $q = useQuasar()
  const router = useRouter()
  
  // Orders data
  const pendingOrders = ref([])
  const loading = ref(false)
  const search = ref('')
  const pagination = ref({
    page: 1,
    rowsPerPage: 10,
    rowsNumber: 0
  })

  // Filtered orders based on search
  const filteredOrders = computed(() => {
    if (!search.value) return pendingOrders.value
    
    const searchLower = search.value.toLowerCase()
    return pendingOrders.value.filter(order => 
      order.id.includes(searchLower) ||
      order.customerName.toLowerCase().includes(searchLower) ||
      order.orderDate.toLowerCase().includes(searchLower)
    )
  })

  // Get order status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'orange'
      case 'processing': return 'blue'
      case 'dispatched': return 'green'
      case 'ready': return 'green'
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

  // Fetch pending orders from Firestore
  const fetchPendingOrders = async () => {
    loading.value = true
    try {
      // Query orders with status pending or processing
      const ordersQuery = query(
        collection(db, 'orders'),
        where('status', 'in', ['pending', 'processing']),
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
          items: data.items || [],
          total: parseFloat(data.totalAmount) || 0,
          status: data.status || 'pending',
          paymentMethod: data.paymentMethod || 'Cash'
        })
      })
      
      pendingOrders.value = orders
      pagination.value.rowsNumber = orders.length
    } catch (error) {
      console.error('Error fetching pending orders:', error)
      if ($q && typeof $q.notify === 'function') {
        $q.notify({
          color: 'negative',
          message: 'Failed to load pending orders',
          icon: 'error'
        })
      }
    } finally {
      loading.value = false
    }
  }

  // Process an order (update to dispatched status)
  const processOrder = async (order) => {
    try {
      if ($q && $q.loading) {
        $q.loading.show()
      }
      
      // Update order status in Firestore
      const orderRef = doc(db, 'orders', order.id)
      await updateDoc(orderRef, {
        status: 'dispatched',
        updatedAt: serverTimestamp()
      })
      
      // Update local state
      const index = pendingOrders.value.findIndex(o => o.id === order.id)
      if (index !== -1) {
        pendingOrders.value[index].status = 'dispatched'
        // Remove from the list after a short delay to show the user the status change
        setTimeout(() => {
          pendingOrders.value = pendingOrders.value.filter(o => o.id !== order.id)
        }, 1500)
      }
      
      if ($q && typeof $q.notify === 'function') {
        $q.notify({
          color: 'positive',
          message: `Order #${order.orderNumber} has been dispatched`,
          icon: 'check'
        })
      }
    } catch (error) {
      console.error('Error processing order:', error)
      if ($q && typeof $q.notify === 'function') {
        $q.notify({
          color: 'negative',
          message: 'Failed to process order: ' + error.message,
          icon: 'error'
        })
      }
    } finally {
      if ($q && $q.loading) {
        $q.loading.hide()
      }
    }
  }

  // Mark order as ready
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
      const index = pendingOrders.value.findIndex(o => o.id === order.id)
      if (index !== -1) {
        pendingOrders.value[index].status = 'ready'
        // Remove from the list after a short delay
        setTimeout(() => {
          pendingOrders.value = pendingOrders.value.filter(o => o.id !== order.id)
        }, 1500)
      }
      
      if ($q && typeof $q.notify === 'function') {
        $q.notify({
          color: 'positive',
          message: `Order #${order.orderNumber} is now ready for pickup`,
          icon: 'check'
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
      const index = pendingOrders.value.findIndex(o => o.id === order.id);
      if (index !== -1) {
        pendingOrders.value[index].status = 'cancelled';
        // Remove from the list after a short delay
        setTimeout(() => {
          pendingOrders.value = pendingOrders.value.filter(o => o.id !== order.id);
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
    fetchPendingOrders()
  }

  // Setup initial data load
  onMounted(() => {
    fetchPendingOrders()
    
    // Check if coming from sample data page with refresh flag
    const shouldRefresh = localStorage.getItem('refreshPendingOrders')
    if (shouldRefresh === 'true') {
      // Clear the flag
      localStorage.removeItem('refreshPendingOrders')
      // Add a slight delay to ensure Firestore has updated
      setTimeout(() => {
        console.log('Auto-refreshing pending orders after sample data added')
        fetchPendingOrders()
      }, 1000)
    }
  })

  return {
    pendingOrders,
    filteredOrders,
    loading,
    search,
    pagination,
    getStatusColor,
    processOrder,
    markAsReady,
    cancelOrder,
    calculateOrderTotal,
    goBack,
    refreshData
  }
} 