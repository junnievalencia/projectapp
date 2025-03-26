import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { db, storage } from 'src/boot/firebase'
import { collection, getDocs, doc, deleteDoc, updateDoc, getDoc } from 'firebase/firestore'
import { ref as storageRef, deleteObject } from 'firebase/storage'

export function useViewItemsPage() {
  const $q = useQuasar()
  const router = useRouter()
  
  // Items data
  const allItems = ref([])
  const loading = ref(false)
  const search = ref('')
  const selectedCategory = ref('all')
  const categories = ref([])
  const sortBy = ref('name')
  const sortDirection = ref('asc')
  const pagination = ref({
    page: 1,
    rowsPerPage: 12,
    rowsNumber: 0
  })
  
  // Fetch all categories and items from Firestore
  const fetchData = async () => {
    loading.value = true
    try {
      // Fetch categories
      const categoriesSnapshot = await getDocs(collection(db, 'categories'))
      const categoriesData = []
      
      categoriesSnapshot.forEach((doc) => {
        categoriesData.push({
          id: doc.id,
          name: doc.data().name
        })
      })
      
      categories.value = categoriesData
      
      // Fetch all food items across all categories
      const items = []
      
      for (const category of categoriesData) {
        const foodItemsSnapshot = await getDocs(collection(db, 'categories', category.id, 'foodItems'))
        
        foodItemsSnapshot.forEach((doc) => {
          items.push({
            id: doc.id,
            categoryId: category.id,
            categoryName: category.name,
            ...doc.data(),
            // Convert Firestore timestamp to Date object
            createdAt: doc.data().createdAt ? doc.data().createdAt.toDate() : new Date()
          })
        })
      }
      
      allItems.value = items
      pagination.value.rowsNumber = items.length
    } catch (error) {
      console.error('Error fetching items:', error)
      $q.notify({
        color: 'negative',
        message: 'Failed to load menu items',
        icon: 'error'
      })
    } finally {
      loading.value = false
    }
  }

  // Filter and sort items
  const filteredAndSortedItems = computed(() => {
    // First, filter by category
    let result = [...allItems.value]
    if (selectedCategory.value !== 'all') {
      result = result.filter(item => item.categoryId === selectedCategory.value)
    }
    
    // Then, filter by search term
    if (search.value.trim()) {
      const searchLower = search.value.toLowerCase()
      result = result.filter(item => 
        item.name.toLowerCase().includes(searchLower) ||
        item.description?.toLowerCase().includes(searchLower) ||
        item.categoryName.toLowerCase().includes(searchLower)
      )
    }
    
    // Finally, sort the results
    result.sort((a, b) => {
      let comparison = 0
      
      switch (sortBy.value) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'price':
          comparison = a.price - b.price
          break
        case 'category':
          comparison = a.categoryName.localeCompare(b.categoryName)
          break
        case 'date':
          comparison = new Date(a.createdAt) - new Date(b.createdAt)
          break
        default:
          comparison = 0
      }
      
      return sortDirection.value === 'asc' ? comparison : -comparison
    })
    
    return result
  })
  
  // Get items for current page
  const paginatedItems = computed(() => {
    const { page, rowsPerPage } = pagination.value
    const startIndex = (page - 1) * rowsPerPage
    const endIndex = Math.min(startIndex + rowsPerPage, filteredAndSortedItems.value.length)
    
    return filteredAndSortedItems.value.slice(startIndex, endIndex)
  })
  
  // Toggle sort direction
  const toggleSort = (field) => {
    if (sortBy.value === field) {
      sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
    } else {
      sortBy.value = field
      sortDirection.value = 'asc'
    }
  }
  
  // Toggle food item availability
  const toggleItemAvailability = async (item) => {
    try {
      $q.loading.show()
      
      // Update in Firestore
      await updateDoc(
        doc(db, 'categories', item.categoryId, 'foodItems', item.id),
        { isAvailable: !item.isAvailable }
      )
      
      // Update in local state
      const index = allItems.value.findIndex(i => i.id === item.id && i.categoryId === item.categoryId)
      if (index !== -1) {
        allItems.value[index].isAvailable = !item.isAvailable
      }
      
      $q.loading.hide()
      $q.notify({
        color: 'positive',
        message: `${item.name} is now ${item.isAvailable ? 'unavailable' : 'available'}`,
        icon: 'check'
      })
    } catch (error) {
      console.error('Error updating item availability:', error)
      $q.notify({
        color: 'negative',
        message: 'Failed to update item',
        icon: 'error'
      })
      $q.loading.hide()
    }
  }
  
  // Delete food item
  const deleteItem = async (item) => {
    try {
      $q.dialog({
        title: 'Confirm Deletion',
        message: `Are you sure you want to delete "${item.name}"?`,
        cancel: true,
        persistent: true
      }).onOk(async () => {
        $q.loading.show()
        
        // Delete image if exists
        if (item.imageUrl) {
          try {
            const imageRef = storageRef(storage, item.imageUrl)
            await deleteObject(imageRef)
          } catch (error) {
            console.error('Error deleting item image:', error)
          }
        }
        
        // Delete from Firestore
        await deleteDoc(doc(db, 'categories', item.categoryId, 'foodItems', item.id))
        
        // Remove from local state
        allItems.value = allItems.value.filter(i => !(i.id === item.id && i.categoryId === item.categoryId))
        
        $q.loading.hide()
        $q.notify({
          color: 'positive',
          message: `${item.name} deleted successfully`,
          icon: 'check'
        })
      })
    } catch (error) {
      console.error('Error deleting item:', error)
      $q.notify({
        color: 'negative',
        message: 'Failed to delete item',
        icon: 'error'
      })
      $q.loading.hide()
    }
  }
  
  // View item details
  const viewItemDetails = (item) => {
    $q.dialog({
      title: item.name,
      component: 'div',
      message: `
        <div>
          <img src="${item.imageUrl || 'https://cdn.quasar.dev/img/parallax2.jpg'}" 
               style="max-width: 100%; max-height: 200px; object-fit: cover; margin-bottom: 16px;" />
          
          <p><strong>Category:</strong> ${item.categoryName}</p>
          <p><strong>Price:</strong> ₱${item.price.toFixed(2)}</p>
          <p><strong>Description:</strong> ${item.description || 'No description'}</p>
          <p><strong>Status:</strong> ${item.isAvailable ? 'Available' : 'Unavailable'}</p>
          <p><strong>Date Added:</strong> ${new Date(item.createdAt).toLocaleDateString()}</p>
        </div>
      `,
      html: true,
      style: 'min-width: 300px'
    })
  }
  
  // Edit item - navigate to add menu with focus on specific category
  const editItem = (item) => {
    router.push({
      name: 'add-menu',
      query: { category: item.categoryId, edit: true }
    })
  }

  // Navigation function to go back
  const goBack = () => {
    router.push('/dashboard')
  }
  
  // Navigation to Add Menu page
  const goToAddMenu = () => {
    router.push('/add-menu')
  }
  
  // Fetch data on component mount
  onMounted(() => {
    fetchData()
  })
  
  return {
    allItems,
    filteredAndSortedItems,
    paginatedItems,
    loading,
    search,
    selectedCategory,
    categories,
    sortBy,
    sortDirection,
    pagination,
    fetchData,
    toggleSort,
    toggleItemAvailability,
    deleteItem,
    viewItemDetails,
    editItem,
    goBack,
    goToAddMenu
  }
} 