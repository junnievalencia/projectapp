import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { db } from 'boot/firebase'
import { collection, getDocs, query, where, orderBy, getCountFromServer } from 'firebase/firestore'
import { ensureSampleOrderData, ensureSampleFoodItems } from 'src/utils/sampleData'

export function useDashboardPage() {
  const $q = useQuasar()
  const router = useRouter()
  
  // Admin info
  const adminUser = ref(null)
  const adminName = computed(() => adminUser.value?.name || 'Admin')
  
  // Dashboard stats
  const totalItems = ref(0)
  const pendingOrders = ref(0)
  const completedOrders = ref(0)
  const dispatchOrders = ref(0)
  const totalEarnings = ref('0')
  const loading = ref(false)
  
  // Navigation function
  const navigateTo = (route) => {
    router.push(`/${route}`)
  }
  
  // Load dashboard data
  const fetchDashboardData = async () => {
    loading.value = true
    try {
      // Ensure sample data exists (only adds if no data)
      await ensureSampleOrderData()
      await ensureSampleFoodItems()

      // Fetch pending orders count
      const pendingOrdersQuery = query(
        collection(db, 'orders'),
        where('status', '==', 'pending')
      )
      const pendingSnapshot = await getCountFromServer(pendingOrdersQuery)
      pendingOrders.value = pendingSnapshot.data().count

      // Fetch completed orders count
      const completedOrdersQuery = query(
        collection(db, 'orders'),
        where('status', '==', 'completed')
      )
      const completedSnapshot = await getCountFromServer(completedOrdersQuery)
      completedOrders.value = completedSnapshot.data().count

      // Fetch dispatch orders count
      const dispatchOrdersQuery = query(
        collection(db, 'orders'),
        where('status', '==', 'dispatched')
      )
      const dispatchSnapshot = await getCountFromServer(dispatchOrdersQuery)
      dispatchOrders.value = dispatchSnapshot.data().count

      // Calculate total earnings from completed orders
      let earnings = 0
      const completedOrdersDataQuery = query(
        collection(db, 'orders'),
        where('status', '==', 'completed')
      )
      const completedOrdersDataSnapshot = await getDocs(completedOrdersDataQuery)
      
      completedOrdersDataSnapshot.forEach(doc => {
        const orderData = doc.data()
        if (orderData.totalAmount) {
          earnings += parseFloat(orderData.totalAmount)
        }
      })
      
      totalEarnings.value = earnings.toLocaleString()

      // Count total menu items
      const itemsQuery = query(collection(db, 'foodItems'))
      const itemsSnapshot = await getCountFromServer(itemsQuery)
      totalItems.value = itemsSnapshot.data().count
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      $q.notify({
        color: 'negative',
        message: 'Failed to load dashboard data',
        icon: 'error'
      })
      
      // Fallback to sample data if fetch fails
      pendingOrders.value = 0
      completedOrders.value = 0
      dispatchOrders.value = 0
      totalEarnings.value = '0'
      totalItems.value = 0
    } finally {
      loading.value = false
    }
  }
  
  // Load admin data on mount
  onMounted(() => {
    // Get admin info from localStorage
    const storedAdmin = localStorage.getItem('adminUser')
    if (storedAdmin) {
      adminUser.value = JSON.parse(storedAdmin)
    }
    
    // Fetch dashboard data
    fetchDashboardData()
  })
  
  return {
    adminName,
    totalItems,
    pendingOrders,
    completedOrders,
    dispatchOrders,
    totalEarnings,
    loading,
    navigateTo,
    fetchDashboardData
  }
} 