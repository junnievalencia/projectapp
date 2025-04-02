import { api } from "boot/axios";

export default {
  // Get seller profile
  getProfile() {
    return api.get("/seller/profile");
  },

  // Update seller profile
  updateProfile(profileData) {
    return api.put("/seller/profile", profileData);
  },

  // Update store hours
  updateStoreHours(hours) {
    return api.put("/seller/store-hours", { hours });
  },

  // Upload store logo
  uploadLogo(file) {
    const formData = new FormData();
    formData.append("logo", file);

    return api.post("/seller/upload-logo", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // Change password
  changePassword(passwordData) {
    return api.put("/seller/change-password", passwordData);
  },

  // Toggle store open/closed status
  toggleStoreStatus(isOpen) {
    return api.put("/seller/toggle-status", { isOpen });
  },

  // Get seller menu categories
  getCategories() {
    return api.get("/seller/categories");
  },

  // Add a new category
  addCategory(category) {
    return api.post("/seller/categories", { category });
  },

  // Delete a category
  deleteCategory(categoryId) {
    return api.delete(`/seller/categories/${categoryId}`);
  },

  // Get seller menu items
  getMenuItems() {
    return api.get("/seller/menu-items");
  },

  // Add a menu item
  addMenuItem(menuItem) {
    // Use FormData for uploading files
    const formData = new FormData();
    for (const key in menuItem) {
      if (key === "image" && menuItem[key] instanceof File) {
        formData.append("image", menuItem[key]);
      } else {
        formData.append(key, menuItem[key]);
      }
    }

    return api.post("/seller/menu-items", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // Update a menu item
  updateMenuItem(itemId, menuItem) {
    // Use FormData for uploading files
    const formData = new FormData();
    for (const key in menuItem) {
      if (key === "image" && menuItem[key] instanceof File) {
        formData.append("image", menuItem[key]);
      } else {
        formData.append(key, menuItem[key]);
      }
    }

    return api.put(`/seller/menu-items/${itemId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // Delete a menu item
  deleteMenuItem(itemId) {
    return api.delete(`/seller/menu-items/${itemId}`);
  },

  // Toggle menu item availability
  toggleItemAvailability(itemId, isAvailable) {
    return api.put(`/seller/menu-items/${itemId}/availability`, {
      isAvailable,
    });
  },

  // Get seller dashboard statistics
  getDashboardStats() {
    return api.get("/seller/dashboard-stats");
  },

  // Mock data for when backend is unavailable
  getMockCategories() {
    console.log("Using mock categories");
    return Promise.resolve({
      data: [
        { id: "cat1", name: "Rice Meals" },
        { id: "cat2", name: "Noodles" },
        { id: "cat3", name: "Beverages" },
        { id: "cat4", name: "Desserts" },
      ],
    });
  },

  getMockMenuItems() {
    console.log("Using mock menu items");
    return Promise.resolve({
      data: [
        {
          id: "item1",
          name: "Adobo Rice Bowl",
          description: "Classic Filipino adobo served with steamed rice",
          price: 120,
          categoryId: "cat1",
          available: true,
          image: "https://via.placeholder.com/300x200?text=Adobo",
        },
        {
          id: "item2",
          name: "Pancit Canton",
          description: "Stir-fried noodles with vegetables and meat",
          price: 100,
          categoryId: "cat2",
          available: true,
          image: "https://via.placeholder.com/300x200?text=Pancit",
        },
        {
          id: "item3",
          name: "Mango Shake",
          description: "Fresh mango blended with milk and ice",
          price: 80,
          categoryId: "cat3",
          available: true,
          image: "https://via.placeholder.com/300x200?text=Shake",
        },
        {
          id: "item4",
          name: "Halo-halo",
          description: "Mixed dessert with shaved ice and various toppings",
          price: 95,
          categoryId: "cat4",
          available: false,
          image: "https://via.placeholder.com/300x200?text=Halo-halo",
        },
      ],
    });
  },

  getMockDashboardStats() {
    console.log("Using mock dashboard stats");

    // Generate today's date
    const today = new Date();
    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    // Generate last 7 days for chart data
    const last7Days = Array(7)
      .fill()
      .map((_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return {
          date: date.toISOString().split("T")[0],
          day: dayNames[date.getDay()],
          orders: Math.floor(Math.random() * 15) + 5,
          sales: Math.floor(Math.random() * 2000) + 1000,
        };
      })
      .reverse();

    return Promise.resolve({
      data: {
        totalSalesToday: 4350,
        totalOrdersToday: 12,
        pendingOrders: 3,
        completedOrders: 9,
        topSellingItems: [
          { name: "Adobo Rice Bowl", count: 8, amount: 960 },
          { name: "Pancit Canton", count: 6, amount: 600 },
          { name: "Halo-halo", count: 5, amount: 475 },
        ],
        salesByDay: last7Days,
      },
    });
  },
};
