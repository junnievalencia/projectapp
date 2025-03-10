import { ref } from 'vue'

export default function useFavoritesPage () {
  const search = ref('')
  const tab = ref('favorites')

  // Sample favorite items data
  // In a real application, this would be fetched from an API or local storage
  const favoriteItems = ref([
    {
      id: 1,
      name: 'Chicken With Rice',
      restaurant: 'Store Name',
      price: 4.9,
      rating: 4.5,
      time: 25,
      image: require('../assets/chicken.png'),
      isFavorite: true
    },
    {
      id: 2,
      name: 'Beef Cheesy Burger',
      restaurant: 'Burger Joint',
      price: 5.9,
      rating: 4.7,
      time: 20,
      image: require('../assets/burger.png'),
      isFavorite: true
    },
    {
      id: 3,
      name: 'Milktea Medium',
      restaurant: 'Tea House',
      price: 3.5,
      rating: 4.3,
      time: 10,
      image: require('../assets/milktea.png'),
      isFavorite: true
    }
  ])

  // Function to remove item from favorites
  const removeFromFavorites = (itemId) => {
    const index = favoriteItems.value.findIndex(item => item.id === itemId)
    if (index !== -1) {
      favoriteItems.value.splice(index, 1)
      // In a real app, you would also update this in your backend or local storage
    }
  }

  // Function to check if favorites list is empty
  const hasFavorites = () => {
    return favoriteItems.value.length > 0
  }

  return {
    search,
    tab,
    favoriteItems,
    removeFromFavorites,
    hasFavorites
  }
}
