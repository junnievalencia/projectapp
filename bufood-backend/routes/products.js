const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const upload = require("../middleware/upload");
const { authenticateToken } = require("../controllers/authController");

// Public product routes
router.get("/", productController.getAllProducts);
router.get("/:id", productController.getProductById);

// Seller-specific product routes (protected)
router.post("/", authenticateToken, upload.single("image"), productController.addProduct);
router.patch("/:id", authenticateToken, productController.updateProduct);
router.delete("/:id", authenticateToken, productController.deleteProduct);

// New seller-specific routes
router.get("/seller/:sellerId", productController.getProductsBySellerId);
router.patch("/:productId/stock", authenticateToken, productController.updateProductStock);

module.exports = router;
