const Order = require('../models/order');
const Product = require('../models/product');
const mongoose = require('mongoose');
const crypto = require('crypto');
const { validateOrder, isValidOrderNumber, isValidEmail } = require('../utils/validation');

// Generate unique order number
const generateOrderNumber = async () => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hour = date.getHours().toString().padStart(2, '0');
  const minute = date.getMinutes().toString().padStart(2, '0');
  const milliseconds = date.getMilliseconds().toString().padStart(3, '0');
  let random = crypto.randomBytes(4).toString('hex').toUpperCase();
  
  // Format: BO-YYMMDD-HHMM-MSS-RRRR
  const orderNumber = `BO-${year}${month}${day}-${hour}${minute}-${milliseconds}-${random}`;
  
  // Check if order number exists with retries
  let retries = 3;
  while (retries > 0) {
    const existingOrder = await Order.findOne({ orderNumber });
    if (!existingOrder) {
      return orderNumber;
    }
    random = crypto.randomBytes(4).toString('hex').toUpperCase();
    retries--;
  }
  return null;
};

// Create new order
exports.createOrder = async (req, res) => {
  try {
    console.log('Received order creation request:', {
      body: req.body,
      user: req.user?.id
    });

    const {
      products,
      shippingAddress,
      billingAddress,
      paymentMethod,
      currency,
      subtotal,
      shippingCost,
      tax,
      totalAmount,
      specialInstructions,
      giftWrap,
      giftMessage,
      couponCode,
      orderNotes
    } = req.body;

    // Check user authentication
    if (!req.user || !req.user.id) {
      console.error('User not authenticated');
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Enhanced validation with detailed logging
    if (!products || !Array.isArray(products) || products.length === 0) {
      console.error('Invalid products array:', products);
      return res.status(400).json({ message: 'Invalid or empty products array' });
    }

    if (!shippingAddress || !shippingAddress.name || !shippingAddress.email || !shippingAddress.address) {
      console.error('Invalid shipping address:', shippingAddress);
      return res.status(400).json({ message: 'Invalid or incomplete shipping address' });
    }

    // Validate currency
    if (!currency || !['INR', 'USD'].includes(currency)) {
      console.error('Invalid currency:', currency);
      return res.status(400).json({ message: 'Invalid currency. Must be INR or USD' });
    }

    // Validate amounts
    if (typeof subtotal !== 'number' || subtotal <= 0) {
      console.error('Invalid subtotal:', subtotal);
      return res.status(400).json({ message: 'Invalid subtotal amount' });
    }

    if (typeof totalAmount !== 'number' || totalAmount <= 0) {
      console.error('Invalid total amount:', totalAmount);
      return res.status(400).json({ message: 'Invalid total amount' });
    }

    // Verify products and calculate totals with enhanced error handling
    let calculatedTotal = 0;
    const orderProducts = [];
    const productUpdates = [];
    const productErrors = [];
    

    // First verify all products and collect updates
    console.log('Verifying products...');
    for (const item of products) {
      try {
        const product = await Product.findById(item.product);
      if (!product) {
          const error = `Product not found: ${item.product}`;
          console.error(error);
          productErrors.push(error);
          continue;
        }

        if (product.stock < item.quantity) {
          const error = `Insufficient stock for product: ${product.name} (requested: ${item.quantity}, available: ${product.stock})`;
          console.error(error);
          productErrors.push(error);
          continue;
        }
                
        const itemPrice = item.price;
        if (isNaN(itemPrice) || itemPrice <= 0) {
          const error = `Invalid price for product: ${product.name}`;
          console.error(error);
          productErrors.push(error);
          continue;
        }

        calculatedTotal += itemPrice * item.quantity;
      
      orderProducts.push({
          product: item.product,
        quantity: item.quantity,
          price: itemPrice,
          size: item.size || '',
          color: item.color || '',
        name: product.name
      });

        productUpdates.push({
          updateOne: {
            filter: { _id: product._id },
            update: { $inc: { stock: -item.quantity } }
          }
        });
      } catch (error) {
        console.error('Error processing product:', error);
        productErrors.push(`Error processing product ${item.product}: ${error.message}`);
      }
    }

    if (productErrors.length > 0) {
      return res.status(400).json({ 
        message: 'Product validation failed', 
        errors: productErrors 
      });
    }

    // Verify total amount matches calculated total
    const calculatedTotalWithTax = calculatedTotal + shippingCost + tax;
    if (Math.abs(calculatedTotalWithTax - totalAmount) > 0.01) {
      console.error('Total amount mismatch:', {
        calculated: calculatedTotalWithTax,
        received: totalAmount
      });
      return res.status(400).json({ 
        message: 'Order total amount does not match calculated amount' 
      });
    }

    // Generate unique order number with retries
    console.log('Generating order number...');
    let orderNumber = null;
    let maxRetries = 5;
    while (maxRetries > 0 && !orderNumber) {
      orderNumber = await generateOrderNumber();
      maxRetries--;
    }

    if (!orderNumber) {
      console.error('Failed to generate unique order number after maximum retries');
      return res.status(500).json({ message: 'Could not generate unique order number after maximum retries' });
    }

    console.log('Creating order with number:', orderNumber);

    // Create order with the generated order number
    const isPrepaid = paymentMethod && paymentMethod !== 'cod';
    const order = new Order({
      orderNumber,
      user: req.user.id,
      products: orderProducts,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      paymentMethod: paymentMethod || 'cod',
      currency,
      subtotal,
      shippingCost,
      tax,
      totalAmount,
      specialInstructions,
      giftWrap,
      giftMessage,
      couponCode,
      orderNotes,
      paymentStatus: isPrepaid ? 'PAID' : 'PENDING',
      orderStatus: isPrepaid ? 'PENDING_VERIFICATION' : 'PENDING',
      estimatedDeliveryDate: calculateEstimatedDeliveryDate()
    });

    // Save order first
    console.log('Saving order...');
    await order.save();

    try {
      // Then update product stock
      console.log('Updating product stock...');
      const bulkWriteResult = await Product.bulkWrite(productUpdates);
      
      // Verify all updates were successful
      if (bulkWriteResult.modifiedCount !== productUpdates.length) {
        // Rollback order creation
        console.error('Stock update failed, rolling back order creation');
        await Order.findByIdAndDelete(order._id);
        throw new Error('Failed to update all product stocks');
      }
    } catch (error) {
      // If stock update fails, delete the order and throw error
      console.error('Stock update error, rolling back order:', error);
      await Order.findByIdAndDelete(order._id);
      throw new Error(`Failed to update product stock: ${error.message}`);
    }

    console.log('Order created successfully:', order);

    res.status(201).json({
      message: 'Order created successfully',
      order: {
        _id: order._id,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
        estimatedDeliveryDate: order.estimatedDeliveryDate
      }
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ 
      message: 'Failed to create order',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Helper function to calculate estimated delivery date
const calculateEstimatedDeliveryDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 5); // Default 5 days delivery estimate
  return date;
};

// Get all orders
exports.getOrders = async (req, res) => {
  try {
    let query = {};
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // If not admin, only show user's orders
    if (req.user.role !== 'admin') {
      query.user = req.user.id;
    } else {
      // Admin filters
      // Filter by order status
      if (req.query.status) {
        query.orderStatus = req.query.status;
      }

      // Filter by payment method
      if (req.query.paymentMethod) {
        query.paymentMethod = req.query.paymentMethod;
      }

      // Filter by date range
      if (req.query.dateRange && req.query.dateRange !== 'all') {
        const now = new Date();
        let startDate;
        
        switch (req.query.dateRange) {
          case 'today':
            startDate = new Date(now.setHours(0, 0, 0, 0));
            break;
          case 'week':
            startDate = new Date(now.setDate(now.getDate() - 7));
            break;
          case 'month':
            startDate = new Date(now.setMonth(now.getMonth() - 1));
            break;
          default:
            startDate = null;
        }
        
        if (startDate) {
          query.createdAt = { $gte: startDate };
        }
      }

      // Search functionality
      if (req.query.search) {
        const searchRegex = new RegExp(req.query.search, 'i');
        
        // Use $or to search across multiple fields
        query = {
          ...query,
          $or: [
            { orderNumber: searchRegex },
            { 'shippingAddress.name': searchRegex },
            { 'shippingAddress.email': searchRegex },
            { 'shippingAddress.mobileNo': searchRegex }
          ]
        };
      }
    }

    // Count total matching orders for pagination
    const total = await Order.countDocuments(query);
    
    // Get orders with pagination
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('products.product')
      .populate('user', 'name email');

    res.json({
      orders,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('products.product')
      .populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user is admin or order owner
    if (req.user.role !== 'admin' && order.user._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Failed to fetch order details' });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, trackingNumber, courierProvider, trackingUrl, note } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Only admin can update order status
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update order status' });
    }

    // Validate status transition
    const validTransitions = {
      'PENDING': ['CONFIRMED', 'CANCELLED'],
      'CONFIRMED': ['SHIPPED', 'CANCELLED'],
      'SHIPPED': ['DELIVERED', 'CANCELLED'],
      'DELIVERED': [], // No further transitions allowed
      'CANCELLED': [] // No further transitions allowed
    };

    if (!validTransitions[order.orderStatus]?.includes(status)) {
      return res.status(400).json({
        message: `Invalid status transition from ${order.orderStatus} to ${status}`
      });
    }

    // Update order status
    order.orderStatus = status;
    order.statusUpdates = order.statusUpdates || {};
    order.statusUpdates[status] = {
      timestamp: new Date(),
      updatedBy: req.user.id,
      note: note || ''
    };

    // Update tracking information if provided
    if (status === 'SHIPPED') {
      if (!trackingNumber || !courierProvider) {
        return res.status(400).json({
          message: 'Tracking number and courier provider are required for shipped status'
        });
      }
      order.trackingNumber = trackingNumber;
      order.courierProvider = courierProvider;
      if (trackingUrl) order.trackingUrl = trackingUrl;
    }

    // Add note to order history
    if (note) {
      order.orderNotes.push({
        note,
        addedBy: req.user.id
      });
    }

    await order.save();

    // Send notification to user based on status
    try {
      switch (status) {
        case 'CONFIRMED':
          await sendOrderConfirmationEmail(order);
          break;
        case 'SHIPPED':
          await sendOrderShippedEmail(order);
          break;
        case 'DELIVERED':
          await sendOrderDeliveredEmail(order);
          break;
        case 'CANCELLED':
          await sendOrderCancelledEmail(order);
          break;
      }
    } catch (error) {
      console.error('Failed to send status notification:', error);
    }

    res.json({ 
      message: 'Order status updated successfully',
      order: {
        _id: order._id,
        orderNumber: order.orderNumber,
        status: order.orderStatus,
        statusUpdate: order.statusUpdates[status],
        trackingNumber: order.trackingNumber,
        courierProvider: order.courierProvider,
        trackingUrl: order.trackingUrl
      }
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Failed to update order status' });
  }
};

// Confirm order
exports.confirmOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.orderStatus !== 'PENDING') {
      return res.status(400).json({
        message: 'Order can only be confirmed when in PENDING status'
      });
    }

    order.orderStatus = 'CONFIRMED';
    order.statusUpdates = order.statusUpdates || {};
    order.statusUpdates['CONFIRMED'] = {
      timestamp: new Date(),
      updatedBy: req.user.id,
      note: 'Order confirmed by admin'
    };

    await order.save();

    // Send confirmation email
    try {
      await sendOrderConfirmationEmail(order);
    } catch (error) {
      console.error('Failed to send confirmation email:', error);
    }

    res.json({
      message: 'Order confirmed successfully',
      order: {
        _id: order._id,
        orderNumber: order.orderNumber,
        status: order.orderStatus,
        statusUpdate: order.statusUpdates['CONFIRMED']
      }
    });
  } catch (error) {
    console.error('Confirm order error:', error);
    res.status(500).json({ message: 'Failed to confirm order' });
  }
};

// Mark order as shipped
exports.shipOrder = async (req, res) => {
  try {
    const { trackingNumber, courierProvider, trackingUrl } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.orderStatus !== 'CONFIRMED') {
      return res.status(400).json({
        message: 'Order can only be shipped when in CONFIRMED status'
      });
    }

    if (!trackingNumber || !courierProvider) {
      return res.status(400).json({
        message: 'Tracking number and courier provider are required'
      });
    }

    order.orderStatus = 'SHIPPED';
    order.trackingNumber = trackingNumber;
    order.courierProvider = courierProvider;
    if (trackingUrl) order.trackingUrl = trackingUrl;

    order.statusUpdates = order.statusUpdates || {};
    order.statusUpdates['SHIPPED'] = {
      timestamp: new Date(),
      updatedBy: req.user.id,
      note: `Shipped via ${courierProvider} with tracking number ${trackingNumber}`
    };

    await order.save();

    // Send shipping notification
    try {
      await sendOrderShippedEmail(order);
    } catch (error) {
      console.error('Failed to send shipping notification:', error);
    }

    res.json({
      message: 'Order marked as shipped successfully',
      order: {
        _id: order._id,
        orderNumber: order.orderNumber,
        status: order.orderStatus,
        statusUpdate: order.statusUpdates['SHIPPED'],
        trackingNumber: order.trackingNumber,
        courierProvider: order.courierProvider,
        trackingUrl: order.trackingUrl
      }
    });
  } catch (error) {
    console.error('Ship order error:', error);
    res.status(500).json({ message: 'Failed to mark order as shipped' });
  }
};

// Mark order as delivered
exports.markAsDelivered = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.orderStatus !== 'SHIPPED') {
      return res.status(400).json({
        message: 'Order can only be marked as delivered when in SHIPPED status'
      });
    }

    order.orderStatus = 'DELIVERED';
    order.statusUpdates = order.statusUpdates || {};
    order.statusUpdates['DELIVERED'] = {
      timestamp: new Date(),
      updatedBy: req.user.id,
      note: 'Order marked as delivered'
    };

    // If it's a COD order, update payment status
    if (order.paymentMethod === 'cod') {
      order.paymentStatus = 'PAID';
    }

    await order.save();

    // Send delivery confirmation
    try {
      await sendOrderDeliveredEmail(order);
    } catch (error) {
      console.error('Failed to send delivery confirmation:', error);
    }

    res.json({
      message: 'Order marked as delivered successfully',
      order: {
        _id: order._id,
        orderNumber: order.orderNumber,
        status: order.orderStatus,
        statusUpdate: order.statusUpdates['DELIVERED'],
        paymentStatus: order.paymentStatus
      }
    });
  } catch (error) {
    console.error('Mark as delivered error:', error);
    res.status(500).json({ message: 'Failed to mark order as delivered' });
  }
};

// Delete order
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Only admin can delete orders
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete orders' });
    }

    await order.deleteOne();
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({ message: 'Failed to delete order' });
  }
};

// Validate stock availability
exports.validateStock = async (req, res) => {
  try {
    const { products } = req.body;
    
    for (const item of products) {
      const product = await Product.findById(item.id);
      if (!product) {
        return res.status(404).json({ 
          valid: false, 
          message: `Product not found: ${item.id}` 
        });
      }
      
      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          valid: false, 
          message: `Insufficient stock for product: ${product.name}` 
        });
      }
    }
    
    res.json({ valid: true });
  } catch (error) {
    console.error('Stock validation error:', error);
    res.status(500).json({ 
      valid: false, 
      message: 'Failed to validate stock' 
    });
  }
};

// Get order by order number
exports.getOrderByNumber = async (req, res) => {
  try {
    const order = await Order.findOne({ orderNumber: req.params.orderNumber })
      .populate('products.product')
      .populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user is admin or order owner
    if (req.user.role !== 'admin' && order.user._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Failed to fetch order details' });
  }
};

// Request order cancellation
exports.requestCancellation = async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user is order owner
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to cancel this order' });
    }

    // Check if order can be cancelled
    if (!['PENDING', 'CONFIRMED'].includes(order.orderStatus)) {
      return res.status(400).json({
        message: 'Order cannot be cancelled in its current status'
      });
    }

    // Check if there's already a pending cancellation request
    if (order.orderStatus === 'CANCELLATION_REQUESTED') {
      return res.status(400).json({
        message: 'Cancellation request already pending'
      });
    }

    if (!reason) {
      return res.status(400).json({
        message: 'Cancellation reason is required'
      });
    }

    // Update order status and create cancellation request
    order.orderStatus = 'CANCELLATION_REQUESTED';
    order.cancellationRequest = {
      status: 'PENDING',
      reason: reason,
      requestedBy: req.user.id,
      requestedAt: new Date()
    };

    // Add note to order history
    order.orderNotes.push({
      note: `Cancellation requested: ${reason}`,
      addedBy: req.user.id
    });

    await order.save();

    // Notify admin about cancellation request
    try {
      await sendCancellationRequestEmail(order);
    } catch (error) {
      console.error('Failed to send cancellation request notification:', error);
    }

    res.json({ 
      message: 'Cancellation request submitted successfully',
      order: {
        orderNumber: order.orderNumber,
        status: order.orderStatus,
        cancellationRequest: {
          status: order.cancellationRequest.status,
          reason: order.cancellationRequest.reason,
          requestedAt: order.cancellationRequest.requestedAt
        }
      }
    });
  } catch (error) {
    console.error('Request cancellation error:', error);
    res.status(500).json({ message: 'Failed to submit cancellation request' });
  }
};

// Process cancellation request (admin only)
exports.processCancellationRequest = async (req, res) => {
  try {
    const { action, adminNote } = req.body;
    const order = await Order.findById(req.params.id).populate('products.product');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Verify order has a pending cancellation request
    if (order.orderStatus !== 'CANCELLATION_REQUESTED') {
      return res.status(400).json({
        message: 'No pending cancellation request for this order'
      });
    }

    if (!['APPROVED', 'REJECTED'].includes(action)) {
      return res.status(400).json({
        message: 'Invalid action. Must be either APPROVED or REJECTED'
      });
    }

    if (!adminNote) {
      return res.status(400).json({
        message: 'Admin note is required to process the cancellation request'
      });
    }

    // Update cancellation request
    order.cancellationRequest.status = action;
    order.cancellationRequest.processedBy = req.user.id;
    order.cancellationRequest.processedAt = new Date();
    order.cancellationRequest.adminNote = adminNote;

    // If approved, cancel the order
    if (action === 'APPROVED') {
      order.orderStatus = 'CANCELLED';
      
      // If products have already been reserved, restore stock
      const productsToRestore = order.products.filter(item => item.product && item.quantity);
      for (const item of productsToRestore) {
        try {
          const product = await Product.findById(item.product._id || item.product);
          if (product) {
            product.stock += item.quantity;
            await product.save();
            console.log(`Restored ${item.quantity} units to product ${product._id}`);
          }
        } catch (err) {
          console.error(`Failed to restore stock for product: ${item.product._id || item.product}`, err);
        }
      }
    } else {
      // If rejected, revert status to previous state (PENDING or CONFIRMED)
      if (order.statusUpdates && order.statusUpdates.CONFIRMED) {
        order.orderStatus = 'CONFIRMED';
      } else {
        order.orderStatus = 'PENDING';
      }
    }

    // Add note to order history
    order.orderNotes.push({
      note: `Cancellation request ${action.toLowerCase()}: ${adminNote || ''}`,
      addedBy: req.user.id
    });

    await order.save();

    // Send notification to user
    try {
      if (action === 'APPROVED') {
        await sendOrderCancellationEmail(order);
      } else {
        await sendCancellationRejectedEmail(order);
      }
    } catch (error) {
      console.error('Failed to send cancellation notification:', error);
    }

    res.json({
      message: `Cancellation request ${action.toLowerCase()} successfully`,
      order: {
        orderNumber: order.orderNumber,
        status: order.orderStatus,
        cancellationRequest: {
          status: order.cancellationRequest.status,
          processedAt: order.cancellationRequest.processedAt,
          adminNote: order.cancellationRequest.adminNote
        }
      }
    });
  } catch (error) {
    console.error('Process cancellation request error:', error);
    res.status(500).json({ message: 'Failed to process cancellation request' });
  }
};

// Track order without login
exports.trackOrder = async (req, res) => {
  try {
    const { orderNumber, email } = req.body;

    // Validate required fields
    if (!orderNumber || !email) {
      return res.status(400).json({
        message: 'Order number and email are required'
      });
    }

    // Validate order number format
    if (!isValidOrderNumber(orderNumber)) {
      return res.status(400).json({
        message: 'Invalid order number format. Please check and try again.'
      });
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return res.status(400).json({
        message: 'Invalid email format. Please check and try again.'
      });
    }

    const order = await Order.findOne({
      orderNumber,
      'shippingAddress.email': email
    }).select('-__v -updatedAt');

    if (!order) {
      return res.status(404).json({
        message: 'No order found with the provided details. Please check your order number and email.'
      });
    }

    // Return limited order information for security
    const orderInfo = {
      orderNumber: order.orderNumber,
      orderStatus: order.orderStatus,
      createdAt: order.createdAt,
      totalAmount: order.totalAmount,
      currency: order.currency,
      paymentStatus: order.paymentStatus,
      trackingNumber: order.trackingNumber,
      courierProvider: order.courierProvider,
      trackingUrl: order.trackingUrl
    };

    res.json({
      order: orderInfo
    });
  } catch (error) {
    console.error('Track order error:', error);
    res.status(500).json({ 
      message: 'Failed to track order. Please try again.'
    });
  }
};

// Update payment status only
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Only admin can update payment status
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update payment status' });
    }

    // Validate paymentStatus
    const allowed = ['PENDING', 'PAID', 'FAILED', 'REFUNDED'];
    if (!allowed.includes(paymentStatus)) {
      return res.status(400).json({ message: 'Invalid payment status' });
    }

    order.paymentStatus = paymentStatus;
    await order.save();

    res.json({
      message: 'Payment status updated successfully',
      order: {
        _id: order._id,
        orderNumber: order.orderNumber,
        paymentStatus: order.paymentStatus
      }
    });
  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({ message: 'Failed to update payment status' });
  }
};