// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://technovatechnologies.in/api'
    : 'http://localhost:5000');

// Payment Configuration
export const RAZORPAY_KEY_ID = process.env.REACT_APP_RAZORPAY_KEY_ID;

// Order Status
export const ORDER_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED'
};

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  FAILED: 'FAILED'
};

// Payment Methods
export const PAYMENT_METHODS = {
  COD: 'cod'
};

// Shipping Cost Configuration
export const SHIPPING_CONFIG = {
  FREE_SHIPPING_THRESHOLD: 1000,
  STANDARD_SHIPPING_COST: 100
};

// Tax Configuration
export const TAX_CONFIG = {
  GST_RATE: 0.18 // 18% GST
};

// Pagination Configuration
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100]
};

// Date Ranges for Filtering
export const DATE_RANGES = {
  ALL: 'all',
  TODAY: 'today',
  WEEK: 'week',
  MONTH: 'month'
};

// API Request Configuration
export const API_CONFIG = {
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your internet connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNAUTHORIZED: 'Please login to continue.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  ORDER_FAILED: 'Failed to create order. Please try again.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  ORDER_CREATED: 'Order placed successfully',
  ORDER_UPDATED: 'Order updated successfully',
  ORDER_CANCELLED: 'Order cancelled successfully',
  PAYMENT_SUCCESSFUL: 'Payment successful'
};

// Currency Configuration
export const CURRENCY_CONFIG = {
  INR: {
    symbol: '₹',
    shipping: 50,
    tax: 0.18
  },
  USD: {
    symbol: '$',
    shipping: 17,
    tax: 0
  }
}; 