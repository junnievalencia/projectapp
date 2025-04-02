import { api } from "boot/axios";

// Generate mock orders for fallback
const generateMockOrders = (type = "customer", count = 5) => {
  return Array(count)
    .fill()
    .map((_, index) => ({
      id: `ORD${10000 + index}`,
      customerName: `Customer ${index + 1}`,
      customerAddress: `123 Street ${index + 1}, City`,
      customerPhone: `09${Math.floor(Math.random() * 1000000000)}`,
      items: [
        {
          id: `ITEM${index}1`,
          name: `Food Item ${index * 2 + 1}`,
          price: Math.floor(Math.random() * 200) + 50,
          quantity: Math.floor(Math.random() * 3) + 1,
        },
        {
          id: `ITEM${index}2`,
          name: `Food Item ${index * 2 + 2}`,
          price: Math.floor(Math.random() * 150) + 50,
          quantity: Math.floor(Math.random() * 2) + 1,
        },
      ],
      status: ["pending", "processing", "ready", "delivering", "completed"][
        Math.floor(Math.random() * 5)
      ],
      total: 0,
      createdAt: new Date(
        Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000
      ),
      updatedAt: new Date(),
    }))
    .map((order) => {
      // Calculate total
      order.total = order.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      return order;
    });
};

export default {
  // Customer endpoints

  // Get all orders for the current customer
  async getCustomerOrders() {
    try {
      // Check for mock mode
      const urlParams = new URLSearchParams(window.location.search);
      const mockMode = urlParams.get("mock") === "true";

      if (mockMode) {
        console.log("MOCK MODE: Using mock customer orders");
        return Promise.resolve({ data: generateMockOrders("customer") });
      }

      // Try to get data from the backend
      return await api.get("/orders/customer");
    } catch (error) {
      console.error("Error fetching customer orders:", error);
      // Fallback to mock data if backend request fails
      console.log("Using mock customer orders as fallback");
      return Promise.resolve({ data: generateMockOrders("customer") });
    }
  },

  // Get specific order details
  async getOrderDetails(orderId) {
    try {
      // Check for mock mode
      const urlParams = new URLSearchParams(window.location.search);
      const mockMode = urlParams.get("mock") === "true";

      if (mockMode) {
        console.log(
          `MOCK MODE: Fetching mock order details for ID: ${orderId}`
        );
        const mockOrders = generateMockOrders("all", 10);
        const order = mockOrders.find((o) => o.id === orderId);

        if (order) {
          return Promise.resolve({ data: order });
        } else {
          return Promise.reject(new Error("Order not found"));
        }
      }

      // Try to get data from the backend
      return await api.get(`/orders/${orderId}`);
    } catch (error) {
      console.error(`Error fetching order details for ${orderId}:`, error);
      // Only use fallback for network or server errors (not for 404)
      if (error.response && error.response.status === 404) {
        return Promise.reject(new Error("Order not found"));
      }

      // For other errors, try fallback
      console.log(`Using mock order details as fallback for order ${orderId}`);
      const mockOrders = generateMockOrders("all", 10);
      const order = mockOrders.find((o) => o.id === orderId);

      if (order) {
        return Promise.resolve({ data: order });
      } else {
        return Promise.reject(new Error("Order not found"));
      }
    }
  },

  // Create a new order from cart
  async createOrder(orderData) {
    try {
      // Check for mock mode
      const urlParams = new URLSearchParams(window.location.search);
      const mockMode = urlParams.get("mock") === "true";

      if (mockMode) {
        console.log("MOCK MODE: Creating mock order");
        // Simulate successful order creation
        return Promise.resolve({
          data: {
            id: `ORD${10000 + Math.floor(Math.random() * 1000)}`,
            ...orderData,
            status: "pending",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
      }

      // Send data to the backend
      return await api.post("/orders", orderData);
    } catch (error) {
      console.error("Error creating order:", error);
      throw error; // Don't fallback to mock for write operations
    }
  },

  // Cancel an order (if still possible)
  async cancelOrder(orderId) {
    try {
      // Check for mock mode
      const urlParams = new URLSearchParams(window.location.search);
      const mockMode = urlParams.get("mock") === "true";

      if (mockMode) {
        console.log(`MOCK MODE: Cancelling mock order: ${orderId}`);
        return Promise.resolve({
          data: {
            success: true,
            message: "Order cancelled successfully",
          },
        });
      }

      // Send cancellation request to the backend
      return await api.post(`/orders/${orderId}/cancel`);
    } catch (error) {
      console.error(`Error cancelling order ${orderId}:`, error);
      throw error; // Don't fallback to mock for write operations
    }
  },

  // Seller endpoints

  // Get all orders for the seller
  async getSellerOrders() {
    try {
      // Check for mock mode
      const urlParams = new URLSearchParams(window.location.search);
      const mockMode = urlParams.get("mock") === "true";

      // Import AuthService to check if this is a new account
      const AuthService = await import("./AuthService").then(m => m.default);
      const userData = AuthService.getUserData();
      const isNewAccount = userData && userData.firstLogin;
      
      // Return empty orders list for new accounts
      if (isNewAccount) {
        console.log("New seller account detected, returning empty orders list");
        return Promise.resolve({ data: [] });
      }

      if (mockMode) {
        console.log("MOCK MODE: Using mock seller orders");
        return Promise.resolve({ data: generateMockOrders("seller") });
      }

      // Try to get data from the backend
      return await api.get("/orders/seller");
    } catch (error) {
      console.error("Error fetching seller orders:", error);
      
      // Check again if this is a new account
      try {
        const AuthService = await import("./AuthService").then(m => m.default);
        const userData = AuthService.getUserData();
        if (userData && userData.firstLogin) {
          return Promise.resolve({ data: [] });
        }
      } catch (e) {
        console.error("Error checking user data:", e);
      }
      
      // Fallback to mock data if backend request fails
      console.log("Using mock seller orders as fallback");
      return Promise.resolve({ data: generateMockOrders("seller") });
    }
  },

  // Get pending orders for the seller
  async getPendingOrders() {
    try {
      // Check for mock mode
      const urlParams = new URLSearchParams(window.location.search);
      const mockMode = urlParams.get("mock") === "true";

      // Import AuthService to check if this is a new account
      const AuthService = await import("./AuthService").then(m => m.default);
      const userData = AuthService.getUserData();
      const isNewAccount = userData && userData.firstLogin;
      
      // Return empty orders list for new accounts
      if (isNewAccount) {
        console.log("New seller account detected, returning empty pending orders list");
        return Promise.resolve({ data: [] });
      }

      if (mockMode) {
        console.log("MOCK MODE: Using mock pending orders");
        const mockOrders = generateMockOrders("seller");
        const pendingOrders = mockOrders.filter((o) => o.status === "pending");
        return Promise.resolve({ data: pendingOrders });
      }

      // Try to get data from the backend
      return await api.get("/orders/seller/pending");
    } catch (error) {
      console.error("Error fetching pending orders:", error);
      
      // Check again if this is a new account
      try {
        const AuthService = await import("./AuthService").then(m => m.default);
        const userData = AuthService.getUserData();
        if (userData && userData.firstLogin) {
          return Promise.resolve({ data: [] });
        }
      } catch (e) {
        console.error("Error checking user data:", e);
      }
      
      // Fallback to mock data if backend request fails
      console.log("Using mock pending orders as fallback");
      const mockOrders = generateMockOrders("seller");
      const pendingOrders = mockOrders.filter((o) => o.status === "pending");
      return Promise.resolve({ data: pendingOrders });
    }
  },

  // Update order status
  async updateOrderStatus(orderId, status) {
    try {
      // Check for mock mode
      const urlParams = new URLSearchParams(window.location.search);
      const mockMode = urlParams.get("mock") === "true";

      if (mockMode) {
        console.log(
          `MOCK MODE: Updating mock order ${orderId} status to ${status}`
        );
        return Promise.resolve({
          data: {
            success: true,
            message: `Order status updated to ${status}`,
          },
        });
      }

      // Send update request to the backend
      return await api.put(`/orders/${orderId}/status`, { status });
    } catch (error) {
      console.error(`Error updating order ${orderId} status:`, error);
      throw error; // Don't fallback to mock for write operations
    }
  },

  // Mark order as ready for pickup/delivery
  async markOrderReady(orderId) {
    try {
      // Check for mock mode
      const urlParams = new URLSearchParams(window.location.search);
      const mockMode = urlParams.get("mock") === "true";

      if (mockMode) {
        console.log(`MOCK MODE: Marking mock order ${orderId} as ready`);
        return Promise.resolve({
          data: {
            success: true,
            message: "Order marked as ready for pickup/delivery",
          },
        });
      }

      // Send request to the backend
      return await api.put(`/orders/${orderId}/ready`);
    } catch (error) {
      console.error(`Error marking order ${orderId} as ready:`, error);
      throw error; // Don't fallback to mock for write operations
    }
  },

  // Start delivery process
  async startDelivery(orderId) {
    try {
      // Check for mock mode
      const urlParams = new URLSearchParams(window.location.search);
      const mockMode = urlParams.get("mock") === "true";

      if (mockMode) {
        console.log(`MOCK MODE: Starting delivery for mock order ${orderId}`);
        return Promise.resolve({
          data: {
            success: true,
            message: "Delivery started successfully",
          },
        });
      }

      // Send request to the backend
      return await api.put(`/orders/${orderId}/start-delivery`);
    } catch (error) {
      console.error(`Error starting delivery for order ${orderId}:`, error);
      throw error; // Don't fallback to mock for write operations
    }
  },

  // Mark order as delivered/completed
  async completeOrder(orderId) {
    try {
      // Check for mock mode
      const urlParams = new URLSearchParams(window.location.search);
      const mockMode = urlParams.get("mock") === "true";

      if (mockMode) {
        console.log(`MOCK MODE: Completing mock order ${orderId}`);
        return Promise.resolve({
          data: {
            success: true,
            message: "Order marked as delivered/completed",
          },
        });
      }

      // Send request to the backend
      return await api.put(`/orders/${orderId}/complete`);
    } catch (error) {
      console.error(`Error completing order ${orderId}:`, error);
      throw error; // Don't fallback to mock for write operations
    }
  },

  // Reject an order with reason
  async rejectOrder(orderId, reason) {
    try {
      // Check for mock mode
      const urlParams = new URLSearchParams(window.location.search);
      const mockMode = urlParams.get("mock") === "true";

      if (mockMode) {
        console.log(
          `MOCK MODE: Rejecting mock order ${orderId} with reason: ${reason}`
        );
        return Promise.resolve({
          data: {
            success: true,
            message: "Order rejected successfully",
          },
        });
      }

      // Send request to the backend
      return await api.post(`/orders/${orderId}/reject`, { reason });
    } catch (error) {
      console.error(`Error rejecting order ${orderId}:`, error);
      throw error; // Don't fallback to mock for write operations
    }
  },

  // Get order statistics (for dashboard)
  async getOrderStats() {
    try {
      // Check for mock mode
      const urlParams = new URLSearchParams(window.location.search);
      const mockMode = urlParams.get("mock") === "true";

      // Import AuthService to check if this is a new account
      const AuthService = await import("./AuthService").then(m => m.default);
      const userData = AuthService.getUserData();
      const isNewAccount = userData && userData.firstLogin;
      
      // Return empty stats for new accounts
      if (isNewAccount) {
        console.log("New seller account detected, returning empty order statistics");
        return Promise.resolve({
          data: {
            totalOrders: 0,
            pendingOrders: 0,
            processingOrders: 0,
            completedOrders: 0,
            totalRevenue: 0,
            averageOrderValue: 0,
          },
        });
      }

      if (mockMode) {
        console.log("MOCK MODE: Using mock order statistics");
        return Promise.resolve({
          data: {
            totalOrders: 45,
            pendingOrders: 5,
            processingOrders: 8,
            completedOrders: 32,
            totalRevenue: 12450,
            averageOrderValue: 276.67,
          },
        });
      }

      // Try to get data from the backend
      return await api.get("/orders/stats");
    } catch (error) {
      console.error("Error fetching order statistics:", error);
      
      // Check again if this is a new account
      try {
        const AuthService = await import("./AuthService").then(m => m.default);
        const userData = AuthService.getUserData();
        if (userData && userData.firstLogin) {
          return Promise.resolve({
            data: {
              totalOrders: 0,
              pendingOrders: 0,
              processingOrders: 0,
              completedOrders: 0,
              totalRevenue: 0,
              averageOrderValue: 0,
            },
          });
        }
      } catch (e) {
        console.error("Error checking user data:", e);
      }
      
      // Fallback to mock data if backend request fails
      console.log("Using mock order statistics as fallback");
      return Promise.resolve({
        data: {
          totalOrders: 45,
          pendingOrders: 5,
          processingOrders: 8,
          completedOrders: 32,
          totalRevenue: 12450,
          averageOrderValue: 276.67,
        },
      });
    }
  },
};
