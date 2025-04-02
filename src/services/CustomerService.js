import { api } from "boot/axios";

export default {
  // Get customer profile
  getProfile() {
    return api.get("/customer/profile");
  },

  // Update customer profile
  updateProfile(profileData) {
    return api.put("/customer/profile", profileData);
  },

  // Change password
  changePassword(passwordData) {
    return api.put("/customer/change-password", passwordData);
  },

  // Get customer addresses
  getAddresses() {
    return api.get("/customer/addresses");
  },

  // Add a new address
  addAddress(address) {
    return api.post("/customer/addresses", address);
  },

  // Update an address
  updateAddress(addressId, address) {
    return api.put(`/customer/addresses/${addressId}`, address);
  },

  // Delete an address
  deleteAddress(addressId) {
    return api.delete(`/customer/addresses/${addressId}`);
  },

  // Set default address
  setDefaultAddress(addressId) {
    return api.put(`/customer/addresses/${addressId}/default`);
  },

  // Get favorite items
  getFavorites() {
    return api.get("/customer/favorites");
  },

  // Add an item to favorites
  addFavorite(menuItemId) {
    return api.post("/customer/favorites", { menuItemId });
  },

  // Remove an item from favorites
  removeFavorite(menuItemId) {
    return api.delete(`/customer/favorites/${menuItemId}`);
  },

  // Get stores
  getStores() {
    return api.get("/customer/stores");
  },

  // Get store details
  getStoreDetails(storeId) {
    return api.get(`/customer/stores/${storeId}`);
  },

  // Get store menu
  getStoreMenu(storeId) {
    return api.get(`/customer/stores/${storeId}/menu`);
  },

  // Submit store review
  submitStoreReview(storeId, review) {
    return api.post(`/customer/stores/${storeId}/reviews`, review);
  },

  // Get store reviews
  getStoreReviews(storeId) {
    return api.get(`/customer/stores/${storeId}/reviews`);
  },

  // Mock data for when backend is unavailable
  getMockProfile() {
    console.log("Using mock customer profile");
    return Promise.resolve({
      data: {
        id: "cust1",
        name: "John Doe",
        email: "john.doe@example.com",
        phone: "09123456789",
        defaultAddressId: "addr1",
      },
    });
  },

  getMockAddresses() {
    console.log("Using mock customer addresses");
    return Promise.resolve({
      data: [
        {
          id: "addr1",
          label: "Home",
          address: "123 Main St, Barangay 1, Manila",
          isDefault: true,
          coordinates: { lat: 14.5995, lng: 120.9842 },
        },
        {
          id: "addr2",
          label: "Office",
          address: "456 Work Ave, Barangay 2, Quezon City",
          isDefault: false,
          coordinates: { lat: 14.6376, lng: 121.0008 },
        },
      ],
    });
  },

  getMockFavorites() {
    console.log("Using mock favorites");
    return Promise.resolve({
      data: [
        {
          id: "fav1",
          menuItem: {
            id: "item1",
            name: "Adobo Rice Bowl",
            description: "Classic Filipino adobo served with steamed rice",
            price: 120,
            image: "https://via.placeholder.com/300x200?text=Adobo",
            store: {
              id: "store1",
              name: "Filipino Classics",
            },
          },
        },
        {
          id: "fav2",
          menuItem: {
            id: "item2",
            name: "Pancit Canton",
            description: "Stir-fried noodles with vegetables and meat",
            price: 100,
            image: "https://via.placeholder.com/300x200?text=Pancit",
            store: {
              id: "store1",
              name: "Filipino Classics",
            },
          },
        },
      ],
    });
  },

  getMockStores() {
    console.log("Using mock stores");
    return Promise.resolve({
      data: [
        {
          id: "store1",
          name: "Filipino Classics",
          description: "Authentic Filipino cuisine made with love",
          rating: 4.5,
          reviewCount: 120,
          image: "https://via.placeholder.com/300x200?text=Filipino",
          address: "123 Food St, Manila",
          distance: 1.2,
          isOpen: true,
          categories: ["Rice Meals", "Noodles", "Desserts"],
        },
        {
          id: "store2",
          name: "Burger Express",
          description: "Fast and delicious burgers for everyone",
          rating: 4.2,
          reviewCount: 85,
          image: "https://via.placeholder.com/300x200?text=Burgers",
          address: "456 Burger Ave, Quezon City",
          distance: 2.5,
          isOpen: true,
          categories: ["Burgers", "Sides", "Beverages"],
        },
        {
          id: "store3",
          name: "Caffeine Corner",
          description: "Quality coffee and pastries to brighten your day",
          rating: 4.7,
          reviewCount: 150,
          image: "https://via.placeholder.com/300x200?text=Coffee",
          address: "789 Coffee Rd, Makati",
          distance: 3.0,
          isOpen: false,
          categories: ["Coffee", "Pastries", "Snacks"],
        },
      ],
    });
  },

  getMockStoreDetails(storeId) {
    console.log(`Using mock store details for ${storeId}`);
    return Promise.resolve({
      data: {
        id: "store1",
        name: "Filipino Classics",
        description:
          "Authentic Filipino cuisine made with love. We use only the freshest ingredients and traditional recipes passed down through generations.",
        rating: 4.5,
        reviewCount: 120,
        image: "https://via.placeholder.com/800x400?text=Filipino+Classics",
        logo: "https://via.placeholder.com/200x200?text=FC",
        coverImage:
          "https://via.placeholder.com/1200x300?text=Filipino+Cuisine",
        address: "123 Food St, Barangay 3, Manila",
        coordinates: { lat: 14.5995, lng: 120.9842 },
        phone: "09123456789",
        email: "contact@filipinoclassics.com",
        distance: 1.2,
        isOpen: true,
        storeHours: [
          { day: "Monday", open: "08:00", close: "20:00", isOpen: true },
          { day: "Tuesday", open: "08:00", close: "20:00", isOpen: true },
          { day: "Wednesday", open: "08:00", close: "20:00", isOpen: true },
          { day: "Thursday", open: "08:00", close: "20:00", isOpen: true },
          { day: "Friday", open: "08:00", close: "22:00", isOpen: true },
          { day: "Saturday", open: "10:00", close: "22:00", isOpen: true },
          { day: "Sunday", open: "10:00", close: "18:00", isOpen: true },
        ],
        categories: ["Rice Meals", "Noodles", "Desserts", "Beverages"],
        deliveryInfo: {
          fee: 50,
          minOrder: 200,
          estimatedTime: "30-45 min",
        },
      },
    });
  },

  getMockStoreMenu(storeId) {
    console.log(`Using mock store menu for ${storeId}`);
    return Promise.resolve({
      data: {
        categories: [
          {
            id: "cat1",
            name: "Rice Meals",
            items: [
              {
                id: "item1",
                name: "Adobo Rice Bowl",
                description: "Classic Filipino adobo served with steamed rice",
                price: 120,
                image: "https://via.placeholder.com/300x200?text=Adobo",
                available: true,
                popular: true,
              },
              {
                id: "item5",
                name: "Sisig Rice Bowl",
                description: "Sizzling sisig on top of garlic rice",
                price: 130,
                image: "https://via.placeholder.com/300x200?text=Sisig",
                available: true,
                popular: true,
              },
            ],
          },
          {
            id: "cat2",
            name: "Noodles",
            items: [
              {
                id: "item2",
                name: "Pancit Canton",
                description: "Stir-fried noodles with vegetables and meat",
                price: 100,
                image: "https://via.placeholder.com/300x200?text=Pancit",
                available: true,
                popular: false,
              },
              {
                id: "item6",
                name: "Palabok",
                description:
                  "Rice noodles with shrimp sauce, topped with eggs, shrimp, and chicharon",
                price: 110,
                image: "https://via.placeholder.com/300x200?text=Palabok",
                available: true,
                popular: false,
              },
            ],
          },
          {
            id: "cat3",
            name: "Beverages",
            items: [
              {
                id: "item3",
                name: "Mango Shake",
                description: "Fresh mango blended with milk and ice",
                price: 80,
                image: "https://via.placeholder.com/300x200?text=Shake",
                available: true,
                popular: false,
              },
              {
                id: "item7",
                name: "Buko Juice",
                description: "Fresh coconut water served with coconut meat",
                price: 70,
                image: "https://via.placeholder.com/300x200?text=Buko",
                available: false,
                popular: false,
              },
            ],
          },
          {
            id: "cat4",
            name: "Desserts",
            items: [
              {
                id: "item4",
                name: "Halo-halo",
                description:
                  "Mixed dessert with shaved ice and various toppings",
                price: 95,
                image: "https://via.placeholder.com/300x200?text=Halo-halo",
                available: true,
                popular: true,
              },
              {
                id: "item8",
                name: "Leche Flan",
                description: "Creamy caramel custard dessert",
                price: 85,
                image: "https://via.placeholder.com/300x200?text=Flan",
                available: true,
                popular: false,
              },
            ],
          },
        ],
      },
    });
  },

  getMockStoreReviews(storeId) {
    console.log(`Using mock store reviews for ${storeId}`);
    return Promise.resolve({
      data: [
        {
          id: "rev1",
          rating: 5,
          comment: "Amazing food! The adobo rice bowl is a must-try.",
          user: {
            name: "Maria Santos",
            avatar: "https://via.placeholder.com/50x50?text=MS",
          },
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
        {
          id: "rev2",
          rating: 4,
          comment:
            "Great taste and reasonable prices. Delivery was a bit slow though.",
          user: {
            name: "Juan dela Cruz",
            avatar: "https://via.placeholder.com/50x50?text=JC",
          },
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        },
        {
          id: "rev3",
          rating: 5,
          comment: "The best Filipino food in the area! Highly recommended.",
          user: {
            name: "Ana Reyes",
            avatar: "https://via.placeholder.com/50x50?text=AR",
          },
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        },
      ],
    });
  },
};
