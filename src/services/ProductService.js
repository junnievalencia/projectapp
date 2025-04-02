import { api } from "boot/axios";
import { useQuasar } from "quasar";
import AuthService from "./AuthService";

// Create mock products for fallback
const mockProducts = [
  {
    id: "prod1",
    name: "Adobo Rice Bowl",
    description: "Classic Filipino adobo served with steamed rice",
    price: 120,
    category: "Rice Meals",
    image: "https://via.placeholder.com/300x200?text=Adobo",
    sellerId: "seller1",
    stock: 10,
    createdAt: new Date(),
  },
  {
    id: "prod2",
    name: "Pancit Canton",
    description: "Stir-fried noodles with vegetables and meat",
    price: 100,
    category: "Noodles",
    image: "https://via.placeholder.com/300x200?text=Pancit",
    sellerId: "seller1",
    stock: 15,
    createdAt: new Date(),
  },
  {
    id: "prod3",
    name: "Mango Shake",
    description: "Fresh mango blended with milk and ice",
    price: 80,
    category: "Beverages",
    image: "https://via.placeholder.com/300x200?text=Shake",
    sellerId: "seller2",
    stock: 20,
    createdAt: new Date(),
  },
];

// Product categories for dropdown lists
const productCategories = [
  "Rice Meals",
  "Noodles",
  "Beverages",
  "Desserts",
  "Snacks",
  "Set Meals",
  "Sides",
  "Breakfast",
  "Lunch",
  "Dinner"
];

export default {
  // Get product categories
  getProductCategories() {
    return productCategories;
  },
  
  // Get all products
  async getProducts(params = {}) {
    try {
      // Check for mock mode via URL parameter
      const urlParams = new URLSearchParams(window.location.search);
      const mockMode = urlParams.get("mock") === "true";

      if (mockMode) {
        console.log("MOCK MODE: Using mock product data");
        
        // Filter mock products if sellerId provided
        if (params.sellerId) {
          const filtered = mockProducts.filter(p => p.sellerId === params.sellerId);
          return Promise.resolve({ data: filtered });
        }
        
        return Promise.resolve({ data: mockProducts });
      }

      // Try to get data from the backend
      const response = await api.get("/products", { params });
      return response;
    } catch (error) {
      console.error("Error fetching products:", error);
      
      // Fall back to mock data
      return Promise.resolve({ 
        data: params.sellerId 
          ? mockProducts.filter(p => p.sellerId === params.sellerId) 
          : mockProducts 
      });
    }
  },

  // Get a product by ID
  async getProduct(id) {
    try {
      // Check for mock mode
      const urlParams = new URLSearchParams(window.location.search);
      const mockMode = urlParams.get("mock") === "true";

      if (mockMode) {
        console.log("MOCK MODE: Using mock product data");
        const product = mockProducts.find((p) => p.id === id);
        
        if (product) {
          return Promise.resolve({ data: product });
        } else {
          return Promise.reject({ response: { status: 404 } });
        }
      }

      // Try to get data from the backend
      const response = await api.get(`/products/${id}`);
      return response;
    } catch (error) {
      console.error("Error fetching product:", error);
      
      // Check if mock fallback is possible
      const mockProduct = mockProducts.find((p) => p.id === id);
      if (mockProduct) {
        return Promise.resolve({ data: mockProduct });
      }
      
      return Promise.reject(error);
    }
  },

  // Add a new product (requires auth token)
  async addProduct(product) {
    try {
      // Check for mock mode
      const urlParams = new URLSearchParams(window.location.search);
      const mockMode = urlParams.get("mock") === "true";

      // Get seller ID from AuthService
      const userData = AuthService.getUserData();
      if (!userData || !userData.uid) {
        return Promise.reject(new Error("User not authenticated"));
      }
      
      // Add sellerId to product data
      const productWithSeller = {
        ...product,
        sellerId: userData.uid,
      };

      if (mockMode) {
        console.log("MOCK MODE: Adding mock product", productWithSeller);
        const newProduct = {
          ...productWithSeller,
          id: `prod${mockProducts.length + 1}`,
          createdAt: new Date(),
        };
        mockProducts.push(newProduct);
        return Promise.resolve({ data: newProduct });
      }

      // Form data for file upload
      const formData = new FormData();
      Object.keys(productWithSeller).forEach((key) => {
        if (key === 'image' && productWithSeller[key] instanceof File) {
          formData.append('image', productWithSeller[key]);
        } else {
          formData.append(key, productWithSeller[key]);
        }
      });

      const response = await api.post("/products", formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
      return response;
    } catch (error) {
      console.error("Error adding product:", error);
      return Promise.reject(error);
    }
  },

  // Update a product
  async updateProduct(id, product) {
    try {
      // Check for mock mode
      const urlParams = new URLSearchParams(window.location.search);
      const mockMode = urlParams.get("mock") === "true";

      // Get seller ID from AuthService
      const userData = AuthService.getUserData();
      if (!userData || !userData.uid) {
        return Promise.reject(new Error("User not authenticated"));
      }
      
      // Add sellerId to product data
      const productWithSeller = {
        ...product,
        sellerId: userData.uid,
      };

      if (mockMode) {
        console.log("MOCK MODE: Updating mock product", id, productWithSeller);
        const index = mockProducts.findIndex((p) => p.id === id);
        if (index !== -1) {
          mockProducts[index] = {
            ...mockProducts[index],
            ...productWithSeller,
            updatedAt: new Date(),
          };
          return Promise.resolve({ data: mockProducts[index] });
        } else {
          return Promise.reject({ response: { status: 404 } });
        }
      }

      // Form data for file upload if image is provided
      if (product.image instanceof File) {
        const formData = new FormData();
        Object.keys(productWithSeller).forEach((key) => {
          if (key === 'image') {
            formData.append('image', productWithSeller[key]);
          } else {
            formData.append(key, productWithSeller[key]);
          }
        });

        const response = await api.patch(`/products/${id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        return response;
      } else {
        // Regular JSON update if no new image
        const response = await api.patch(`/products/${id}`, productWithSeller);
        return response;
      }
    } catch (error) {
      console.error("Error updating product:", error);
      return Promise.reject(error);
    }
  },

  // Delete a product
  async deleteProduct(id) {
    try {
      // Check for mock mode
      const urlParams = new URLSearchParams(window.location.search);
      const mockMode = urlParams.get("mock") === "true";

      // Get seller ID from AuthService
      const userData = AuthService.getUserData();
      if (!userData || !userData.uid) {
        return Promise.reject(new Error("User not authenticated"));
      }

      const sellerId = userData.uid;

      if (mockMode) {
        console.log("MOCK MODE: Deleting mock product", id);
        const index = mockProducts.findIndex((p) => p.id === id);
        if (index !== -1) {
          // Check if the product belongs to this seller
          if (mockProducts[index].sellerId !== sellerId) {
            return Promise.reject(new Error("Unauthorized: You can only delete your own products"));
          }
          mockProducts.splice(index, 1);
          return Promise.resolve({ data: { message: "Product deleted successfully" } });
        } else {
          return Promise.reject({ response: { status: 404 } });
        }
      }

      // Send sellerId as query parameter for verification
      const response = await api.delete(`/products/${id}`, {
        params: { sellerId }
      });
      return response;
    } catch (error) {
      console.error("Error deleting product:", error);
      return Promise.reject(error);
    }
  },

  // Get products by seller ID
  async getProductsBySeller(sellerId) {
    try {
      // Check for mock mode
      const urlParams = new URLSearchParams(window.location.search);
      const mockMode = urlParams.get("mock") === "true";

      // Check if this is a new seller account
      const userData = AuthService.getUserData();
      const isNewAccount = userData && userData.firstLogin;
      
      // Return empty array for new accounts
      if (isNewAccount) {
        console.log("New seller account detected, returning empty products list");
        return Promise.resolve({ data: [] });
      }

      if (mockMode) {
        console.log("MOCK MODE: Getting products for seller", sellerId);
        const sellerProducts = mockProducts.filter((p) => p.sellerId === sellerId);
        return Promise.resolve({ data: sellerProducts });
      }

      // Try both endpoints - dedicated seller endpoint and filtered general endpoint
      try {
        // First try the dedicated seller endpoint
        const response = await api.get(`/products/seller/${sellerId}`);
        return response;
      } catch (innerError) {
        // Fall back to the general endpoint with filter
        console.log("Falling back to general endpoint with filter");
        return await this.getProducts({ sellerId });
      }
    } catch (error) {
      console.error("Error fetching seller products:", error);
      // Fall back to mock data
      const sellerProducts = mockProducts.filter((p) => p.sellerId === sellerId);
      return Promise.resolve({ data: sellerProducts });
    }
  },
  
  // Update product stock
  async updateProductStock(productId, stock) {
    try {
      // Check for mock mode
      const urlParams = new URLSearchParams(window.location.search);
      const mockMode = urlParams.get("mock") === "true";

      // Get seller ID from AuthService
      const userData = AuthService.getUserData();
      if (!userData || !userData.uid) {
        return Promise.reject(new Error("User not authenticated"));
      }
      
      const sellerId = userData.uid;

      if (mockMode) {
        console.log("MOCK MODE: Updating stock for product", productId, stock);
        const index = mockProducts.findIndex((p) => p.id === productId);
        if (index !== -1) {
          // Check if the product belongs to this seller
          if (mockProducts[index].sellerId !== sellerId) {
            return Promise.reject(new Error("Unauthorized: You can only update your own products"));
          }
          mockProducts[index].stock = Number(stock);
          mockProducts[index].updatedAt = new Date();
          return Promise.resolve({ 
            data: { 
              message: "Product stock updated successfully",
              product: mockProducts[index]
            } 
          });
        } else {
          return Promise.reject({ response: { status: 404 } });
        }
      }

      const response = await api.patch(`/products/${productId}/stock`, { 
        stock: Number(stock),
        sellerId
      });
      return response;
    } catch (error) {
      console.error("Error updating product stock:", error);
      return Promise.reject(error);
    }
  },
  
  // Check if seller has any products
  async hasProducts() {
    try {
      // Get seller ID from AuthService
      const userData = AuthService.getUserData();
      if (!userData || !userData.uid) {
        return false;
      }
      
      const sellerId = userData.uid;
      
      // Get products for this seller
      const response = await this.getProductsBySeller(sellerId);
      
      // Return true if seller has at least one product
      return response.data && response.data.length > 0;
    } catch (error) {
      console.error("Error checking if seller has products:", error);
      return false;
    }
  }
};
