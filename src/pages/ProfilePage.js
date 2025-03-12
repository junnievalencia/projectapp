import { ref } from 'vue'
// Import the authentication service
import { authService } from '../services'
import { useRouter } from 'vue-router'

export function useProfilePage () {
  const activeSection = ref('personal')
  const isLoading = ref(false)
  const error = ref(null)
  const showAddAddressDialog = ref(false)
  const router = useRouter()

  // User profile information
  const userProfile = ref({
    name: '',
    email: '',
    phone: '',
    avatar: 'https://cdn.quasar.dev/img/boy-avatar.png'
  })

  // TO DO: Backend Integration - Fetch user orders from API
  // Sample order history
  const orderHistory = ref([
    {
      id: 'ORD-001',
      date: '2023-10-15',
      restaurant: 'Store Name',
      items: ['Whopper Meal', 'Onion Rings'],
      total: 350.00,
      status: 'Delivered'
    },
    {
      id: 'ORD-002',
      date: '2023-10-10',
      restaurant: 'Store Name',
      items: ['Chickenjoy', 'Spaghetti'],
      total: 275.50,
      status: 'Delivered'
    },
    {
      id: 'ORD-003',
      date: '2023-10-05',
      restaurant: 'Store Name',
      items: ['Supreme Pizza', 'Garlic Bread'],
      total: 450.75,
      status: 'Delivered'
    }
  ])

  // Payment methods
  const paymentMethods = ref([
    {
      id: 1,
      type: 'GCash',
      details: '+63 912 *** 6789',
      isDefault: true
    },
    {
      id: 2,
      type: 'Cash on Delivery',
      details: 'Pay when food arrives',
      isDefault: false
    }
  ])

  // Saved addresses
  const savedAddresses = ref([
    {
      id: 2,
      name: 'Bicol University Foodshit',
      address: 'University Campus, Polangui',
      isDefault: false
    }
  ])

  // Account settings
  const accountSettings = ref([
    { id: 1, name: 'Notifications', icon: 'notifications', enabled: true },
    { id: 2, name: 'Dark Mode', icon: 'dark_mode', enabled: false },
    { id: 3, name: 'Location Services', icon: 'location_on', enabled: true },
    { id: 4, name: 'Language', icon: 'language', value: 'English' }
  ])

  // Methods for future API integration
  const updateProfile = async (profileData) => {
    isLoading.value = true
    error.value = null
    try {
      // TO DO: Backend Integration - Update user profile
      // Example: await authService.updateProfile(profileData)
      userProfile.value = { ...userProfile.value, ...profileData }
    } catch (err) {
      error.value = 'Failed to update profile: ' + err.message
    } finally {
      isLoading.value = false
    }
  }

  const fetchUserProfile = async () => {
    isLoading.value = true
    error.value = null
    try {
      // Try to get user from localStorage first
      const userStr = localStorage.getItem('user')
      if (userStr) {
        const user = JSON.parse(userStr)
        userProfile.value = {
          ...userProfile.value,
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || ''
        }
      }
      // Then try to fetch from API
      try {
        const response = await authService.getCurrentUser()
        if (response.data && response.data.user) {
          userProfile.value = {
            ...userProfile.value,
            name: response.data.user.name || '',
            email: response.data.user.email || '',
            phone: response.data.user.phone || ''
          }
          // Update localStorage
          localStorage.setItem('user', JSON.stringify(response.data.user))
        }
      } catch (apiError) {
        console.warn('Could not fetch user from API:', apiError)
        // Continue with localStorage data if available
      }
    } catch (err) {
      error.value = 'Failed to fetch profile: ' + err.message
    } finally {
      isLoading.value = false
    }
  }

  const logout = async () => {
    try {
      // Logout user
      await authService.logout()
      // Clear local storage
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      // Use router to navigate to login
      router.push('/login')
    } catch (err) {
      error.value = 'Logout failed: ' + err.message
    }
  }

  const fetchOrders = async () => {
    isLoading.value = true
    error.value = null
    try {
      // This will be replaced with an actual API call
      // const response = await api.getOrders()
      // orderHistory.value = response.data
    } catch (err) {
      error.value = 'Failed to fetch orders: ' + err.message
    } finally {
      isLoading.value = false
    }
  }

  const addPaymentMethod = async (paymentData) => {
    isLoading.value = true
    error.value = null
    try {
      // This will be replaced with an actual API call
      // const response = await api.addPaymentMethod(paymentData)
      const newPayment = {
        id: paymentMethods.value.length + 1,
        ...paymentData,
        isDefault: false
      }
      paymentMethods.value.push(newPayment)
    } catch (err) {
      error.value = 'Failed to add payment method: ' + err.message
    } finally {
      isLoading.value = false
    }
  }

  const updateSettings = async (settingId, value) => {
    isLoading.value = true
    error.value = null
    try {
      // This will be replaced with an actual API call
      // await api.updateSetting(settingId, value)
      const setting = accountSettings.value.find(s => s.id === settingId)
      if (setting) {
        if ('enabled' in setting) {
          setting.enabled = value
        } else if ('value' in setting) {
          setting.value = value
        }
      }
    } catch (err) {
      error.value = 'Failed to update setting: ' + err.message
    } finally {
      isLoading.value = false
    }
  }

  return {
    activeSection,
    userProfile,
    orderHistory,
    paymentMethods,
    accountSettings,
    isLoading,
    error,
    updateProfile,
    fetchOrders,
    addPaymentMethod,
    updateSettings,
    savedAddresses,
    showAddAddressDialog,
    fetchUserProfile,
    logout
  }
}
