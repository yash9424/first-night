const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/authMiddleware');
const {
  createOrder,
  getOrders,
  getOrderById,
  getOrderByNumber,
  updateOrderStatus,
  confirmOrder,
  shipOrder,
  markAsDelivered,
  deleteOrder,
  validateStock,
  requestCancellation,
  processCancellationRequest,
  trackOrder
} = require('../controllers/orderController');

// Track order (no auth required)
router.post('/track', trackOrder);

// Create new order
router.post('/', auth, createOrder);

// Get all orders (admin only)
router.get('/', [auth, adminAuth], getOrders);

// Get user's orders
router.get('/my-orders', auth, getOrders);

// Validate stock availability
router.post('/validate-stock', validateStock);

// Get order by order number
router.get('/by-number/:orderNumber', auth, getOrderByNumber);

// Get single order details
router.get('/:id', auth, getOrderById);

// Update order status (admin only)
router.patch('/:id/status', [auth, adminAuth], updateOrderStatus);

// Request order cancellation
router.post('/:id/cancel-request', auth, requestCancellation);

// Process cancellation request (admin only)
router.patch('/:id/cancel-request', [auth, adminAuth], processCancellationRequest);

// Confirm order (admin only)
router.patch('/:id/confirm', [auth, adminAuth], confirmOrder);

// Mark order as shipped (admin only)
router.patch('/:id/ship', [auth, adminAuth], shipOrder);

// Mark order as delivered (admin only)
router.patch('/:id/deliver', [auth, adminAuth], markAsDelivered);

// Update payment status (admin only)
router.patch('/:id/payment-status', [auth, adminAuth], require('../controllers/orderController').updatePaymentStatus);

// Cancel order
router.patch('/:orderNumber/cancel', auth, async (req, res) => {
  try {
    const order = await Order.findOne({ orderNumber: req.params.orderNumber });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user is admin or order owner
    if (req.user.role !== 'admin' && order.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to cancel this order' });
    }

    // Check if order can be cancelled
    if (!['PENDING', 'CONFIRMED'].includes(order.orderStatus)) {
      return res.status(400).json({
        message: 'Order cannot be cancelled in its current status'
      });
    }

    order.orderStatus = 'CANCELLED';
    order.statusUpdates = order.statusUpdates || {};
    order.statusUpdates['CANCELLED'] = {
      timestamp: new Date(),
      updatedBy: req.user.id,
      note: req.body.note || 'Order cancelled by user'
    };

    // Add cancellation note
    order.orderNotes.push({
      note: req.body.note || 'Order cancelled by user',
      addedBy: req.user.id
    });

    await order.save();

    // Send cancellation notification
    try {
      await sendOrderCancellationEmail(order);
    } catch (error) {
      console.error('Failed to send cancellation notification:', error);
    }

    res.json({ 
      message: 'Order cancelled successfully',
      order: {
        orderNumber: order.orderNumber,
        status: order.orderStatus,
        statusUpdate: order.statusUpdates['CANCELLED']
      }
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ message: 'Failed to cancel order' });
  }
});

// Delete order (admin only)
router.delete('/:id', [auth, adminAuth], deleteOrder);

module.exports = router; 