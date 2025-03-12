import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import useHomePage from './HomePage.js'

export function useCategoryPage () {
  const router = useRouter()
  const route = useRoute()
  const homePageData = useHomePage()
  const tab = ref('category')

  // Get categories from HomePage.js
  const categories = ref([...homePageData.categories])

  // Sample store data with categories
  const stores = ref([
    {
      id: 1,
      name: 'CANTEEN',
      category: 'Meal',
      cuisine: 'Filipino',
      isFavorite: true,
      image: '../assets/burger.png'
    },
    {
      id: 2,
      name: 'Coffee Shope',
      category: 'Drinks',
      cuisine: 'Beverages',
      isFavorite: false,
      image: '../assets/burger.png'
    },
    {
      id: 3,
      name: 'Burger King',
      category: 'Burgers',
      cuisine: 'Fast Food',
      isFavorite: false,
      image: '../assets/burger.png'
    },
    {
      id: 4,
      name: 'MILKTEA SHOP',
      category: 'Drinks',
      cuisine: 'Beverages',
      isFavorite: false,
      image: '../assets/burger.png'
    },
    {
      id: 5,
      name: 'Sario Eatery',
      category: 'Meal',
      cuisine: 'Filipino',
      isFavorite: false,
      image: '../assets/burger.png'
    }
  ])

  // Get store count for each category
  const getStoreCount = (category) => {
    return stores.value.filter(store =>
      store.category.toLowerCase() === category.name.toLowerCase()
    ).length
  }

  // Navigate by category (same function as in HomePage)
  const navigateToCategory = (category) => {
    // Store the selected category in localStorage
    localStorage.setItem('selectedCategory', category.name)
    // Navigate to the stores page
    router.push('/stores')
  }

  onMounted(() => {
    // Set active tab
    const path = route.path.substring(1) // Remove the leading slash
    if (['home', 'category', 'favorites', 'cart', 'profile'].includes(path)) {
      tab.value = path
    }
  })

  return {
    tab,
    categories,
    navigateToCategory,
    getStoreCount
  }
}
