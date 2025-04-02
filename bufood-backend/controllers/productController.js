const { db } = require("../firebase");
const Product = require("../models/Product"); 
const { auth } = require("../firebase");
const collection = db.collection("products");

// Get all products with optional filtering
exports.getAllProducts = async (req, res) => {
  try {
    let query = collection;
    
    if (req.query.category) {
      query = query.where("category", "==", req.query.category);
    }
    
    if (req.query.sellerId) {
      query = query.where("sellerId", "==", req.query.sellerId);
    }
    
    const snapshot = await query.get();
    const products = [];
    
    snapshot.forEach((doc) => {
      products.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    
    return res.status(200).json(products);
  } catch (error) {
    console.error("Error getting products:", error);
    return res.status(500).json({ message: "Failed to get products", error });
  }
};

// Get products by seller ID
exports.getProductsBySellerId = async (req, res) => {
  try {
    const { sellerId } = req.params;
    
    if (!sellerId) {
      return res.status(400).json({ message: "Seller ID is required" });
    }
    
    const snapshot = await collection.where("sellerId", "==", sellerId).get();
    
    const products = [];
    
    snapshot.forEach((doc) => {
      products.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    
    return res.status(200).json(products);
  } catch (error) {
    console.error("Error getting seller products:", error);
    return res.status(500).json({ message: "Failed to get seller products", error });
  }
};

// Get a product by ID
exports.getProductById = async (req, res) => {
  try {
    const productDoc = await collection.doc(req.params.id).get();
    
    if (!productDoc.exists) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    const productData = productDoc.data();
    
    return res.status(200).json({
      id: productDoc.id,
      ...productData,
    });
  } catch (error) {
    console.error("Error getting product by ID:", error);
    return res.status(500).json({ message: "Failed to get product", error });
  }
};

// Add a new product
exports.addProduct = async (req, res) => {
  try {
    const { name, description, price, category, sellerId, stock } = req.body;
    
    // Validate required fields
    if (!name || !description || !price || !category || !sellerId) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    
    let image = "";
    
    // Handle image upload
    if (req.file) {
      const bucket = admin.storage().bucket();
      const fileExtension = req.file.originalname.split(".").pop();
      const fileName = `products/${Date.now()}.${fileExtension}`;
      
      const file = bucket.file(fileName);
      const fileStream = file.createWriteStream({
        metadata: {
          contentType: req.file.mimetype,
        },
      });
      
      fileStream.on("error", (error) => {
        console.error("Error uploading image:", error);
        return res.status(500).json({ message: "Failed to upload image", error });
      });
      
      fileStream.on("finish", async () => {
        // Make the file publicly accessible
        await file.makePublic();
        
        // Get the public URL
        image = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
        
        // Create product with image URL
        const newProduct = new Product(name, description, price, image, category, sellerId, Number(stock) || 0);
        
        const productRef = await collection.add(newProduct.toFirestore());
        
        return res.status(201).json({
          id: productRef.id,
          ...newProduct.toFirestore(),
        });
      });
      
      fileStream.end(req.file.buffer);
    } else {
      // Create product without image
      const newProduct = new Product(name, description, price, image, category, sellerId, Number(stock) || 0);
      
      const productRef = await collection.add(newProduct.toFirestore());
      
      return res.status(201).json({
        id: productRef.id,
        ...newProduct.toFirestore(),
      });
    }
  } catch (error) {
    console.error("Error adding product:", error);
    return res.status(500).json({ message: "Failed to add product", error });
  }
};

// Update a product
exports.updateProduct = async (req, res) => {
  try {
    const { name, description, price, category, sellerId, stock } = req.body;
    const productId = req.params.id;
    
    // Validate seller owns the product
    const productDoc = await collection.doc(productId).get();
    
    if (!productDoc.exists) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    const productData = productDoc.data();
    
    if (productData.sellerId !== sellerId) {
      return res.status(403).json({ message: "Unauthorized: You can only update your own products" });
    }
    
    // Prepare update data
    const updateData = {};
    
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (price) updateData.price = Number(price);
    if (category) updateData.category = category;
    if (stock !== undefined) updateData.stock = Number(stock);
    
    updateData.updatedAt = new Date();
    
    // Handle image update
    if (req.file) {
      const bucket = admin.storage().bucket();
      const fileExtension = req.file.originalname.split(".").pop();
      const fileName = `products/${Date.now()}.${fileExtension}`;
      
      const file = bucket.file(fileName);
      const fileStream = file.createWriteStream({
        metadata: {
          contentType: req.file.mimetype,
        },
      });
      
      fileStream.on("error", (error) => {
        console.error("Error uploading image:", error);
        return res.status(500).json({ message: "Failed to upload image", error });
      });
      
      fileStream.on("finish", async () => {
        // Make the file publicly accessible
        await file.makePublic();
        
        // Get the public URL
        updateData.image = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
        
        // Update product with new data including image
        await collection.doc(productId).update(updateData);
        
        return res.status(200).json({
          id: productId,
          ...updateData,
        });
      });
      
      fileStream.end(req.file.buffer);
    } else {
      // Update product without changing image
      await collection.doc(productId).update(updateData);
      
      return res.status(200).json({
        id: productId,
        ...updateData,
      });
    }
  } catch (error) {
    console.error("Error updating product:", error);
    return res.status(500).json({ message: "Failed to update product", error });
  }
};

// Update product stock
exports.updateProductStock = async (req, res) => {
  try {
    const productId = req.params.productId;
    const { stock, sellerId } = req.body;
    
    // Validate required fields
    if (stock === undefined || !sellerId) {
      return res.status(400).json({ message: "Stock quantity and seller ID are required" });
    }
    
    // Validate stock is a non-negative number
    const stockNum = Number(stock);
    if (isNaN(stockNum) || stockNum < 0) {
      return res.status(400).json({ message: "Stock must be a non-negative number" });
    }
    
    // Validate seller owns the product
    const productDoc = await collection.doc(productId).get();
    
    if (!productDoc.exists) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    const productData = productDoc.data();
    
    if (productData.sellerId !== sellerId) {
      return res.status(403).json({ message: "Unauthorized: You can only update your own products" });
    }
    
    // Update product stock
    const updateData = {
      stock: stockNum,
      updatedAt: new Date()
    };
    
    await collection.doc(productId).update(updateData);
    
    return res.status(200).json({
      message: "Product stock updated successfully",
      product: {
        id: productId,
        ...productData,
        ...updateData,
      }
    });
  } catch (error) {
    console.error("Error updating product stock:", error);
    return res.status(500).json({ message: "Failed to update product stock", error });
  }
};

// Delete a product
exports.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const sellerId = req.query.sellerId;
    
    if (!sellerId) {
      return res.status(400).json({ message: "Seller ID is required" });
    }
    
    // Validate seller owns the product
    const productDoc = await collection.doc(productId).get();
    
    if (!productDoc.exists) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    const productData = productDoc.data();
    
    if (productData.sellerId !== sellerId) {
      return res.status(403).json({ message: "Unauthorized: You can only delete your own products" });
    }
    
    // If there's an image URL, delete it from storage
    if (productData.image && productData.image.includes("storage.googleapis.com")) {
      try {
        const bucket = admin.storage().bucket();
        const imageUrl = productData.image;
        const fileName = imageUrl.split("/").pop();
        const file = bucket.file(`products/${fileName}`);
        
        await file.delete();
        console.log(`Deleted image file: products/${fileName}`);
      } catch (error) {
        console.warn("Failed to delete image file:", error);
        // Continue with product deletion even if image deletion fails
      }
    }
    
    // Delete product from Firestore
    await collection.doc(productId).delete();
    
    return res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return res.status(500).json({ message: "Failed to delete product", error });
  }
};
