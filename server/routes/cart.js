const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/authMiddleware');
const cartController = require('../controllers/cartController');

// Get user's cart
router.get('/', auth, cartController.getCart);

// Add item to cart
router.post('/add', auth, cartController.addToCart);

// Update cart item quantity
router.put('/update/:productId', auth, cartController.updateCartItem);

// Remove item from cart
router.delete('/remove/:productId', auth, cartController.removeFromCart);

// Clear cart
router.delete('/clear', auth, cartController.clearCart);

module.exports = router; 