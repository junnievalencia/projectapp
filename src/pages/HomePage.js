import { ref } from 'vue'

export default function useHomePage () {
  const search = ref('')
  const tab = ref('home')
  const slide = ref('1')
  const autoplay = ref(true)

  const categories = [
    { id: 1, name: 'Burgers', icon: 'lunch_dining' },
    { id: 2, name: 'Snacks', icon: 'local_pizza' },
    { id: 3, name: 'Meal', icon: 'set_meal' },
    { id: 4, name: 'Desserts', icon: 'icecream' },
    { id: 5, name: 'Drinks', icon: 'local_bar' }
  ]

  const popularItems = [
    {
      id: 1,
      name: 'Chicken With Rice',
      restaurant: 'Store Name',
      price: 4.9, // P49
      rating: 4.5,
      time: 25,
      image: 'https://cdn.quasar.dev/img/mountains.jpg'
    },
    {
      id: 2,
      name: 'Fries Buy 1 Take 2',
      restaurant: 'Store Name',
      price: 5.0, // P50
      rating: 4.3,
      time: 15,
      image: 'https://cdn.quasar.dev/img/parallax2.jpg'
    },
    {
      id: 3,
      name: 'Milktea Medium',
      restaurant: 'Store Name',
      price: 6.9, // P69
      rating: 4.7,
      time: 10,
      image: 'https://cdn.quasar.dev/img/parallax1.jpg'
    },
    {
      id: 4,
      name: 'Beef Cheesy Burger',
      restaurant: 'Store Name',
      price: 4.9, // P49
      rating: 4.2,
      time: 20,
      image: 'https://cdn.quasar.dev/img/quasar.jpg'
    }
  ]

  const specialOffers = [
    {
      id: 1,
      title: '30% OFF on First Order',
      description: 'Use code: WELCOME30'
    },
    {
      id: 2,
      title: 'Free Delivery on Orders Above $20',
      description: 'Limited time offer'
    },
    {
      id: 3,
      title: 'Buy 1 Get 1 Free',
      description: 'On selected items'
    }
  ]

  const recentItems = [
    {
      id: 1,
      name: 'Chicken Wings',
      restaurant: 'Wing Stop',
      price: 9.99,
      image: 'https://cdn.quasar.dev/img/mountains.jpg'
    },
    {
      id: 2,
      name: 'Pasta Carbonara',
      restaurant: 'Italian Bistro',
      price: 13.50,
      image: 'https://cdn.quasar.dev/img/parallax1.jpg'
    },
    {
      id: 3,
      name: 'Chocolate Cake',
      restaurant: 'Sweet Treats',
      price: 6.99,
      image: 'https://cdn.quasar.dev/img/quasar.jpg'
    }
  ]

  return {
    search,
    tab,
    slide,
    autoplay,
    categories,
    popularItems,
    specialOffers,
    recentItems
  }
}
