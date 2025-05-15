// Validate order data
exports.validateOrder = (orderData) => {
  // Check required fields
  if (!orderData.user) return 'User ID is required';
  if (!orderData.products || !Array.isArray(orderData.products) || orderData.products.length === 0) {
    return 'Products array is required and must not be empty';
  }

  // Validate shipping address
  const { shippingAddress } = orderData;
  if (!shippingAddress) return 'Shipping address is required';

  if (!shippingAddress.name || shippingAddress.name.trim().length === 0) {
    return 'Name is required in shipping address';
  }

  if (!shippingAddress.email || !isValidEmail(shippingAddress.email)) {
    return 'Valid email is required in shipping address';
  }

  if (!shippingAddress.mobileNo || !isValidMobileNo(shippingAddress.mobileNo)) {
    return 'Valid mobile number is required in shipping address';
  }

  if (!shippingAddress.address || shippingAddress.address.trim().length === 0) {
    return 'Address is required in shipping address';
  }

  if (!shippingAddress.city || shippingAddress.city.trim().length === 0) {
    return 'City is required in shipping address';
  }

  if (!shippingAddress.state || shippingAddress.state.trim().length === 0) {
    return 'State is required in shipping address';
  }

  if (!shippingAddress.pincode || !isValidPincode(shippingAddress.pincode)) {
    return 'Valid pincode is required in shipping address';
  }

  // Validate payment method
  if (!orderData.paymentMethod || orderData.paymentMethod !== 'cod') {
    return 'Valid payment method (cod) is required';
  }

  // Validate total amount
  if (!orderData.totalAmount || orderData.totalAmount <= 0) {
    return 'Valid total amount is required';
  }

  return null;
};

// Helper functions for validation
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidMobileNo = (mobileNo) => {
  const mobileRegex = /^[6-9]\d{9}$/;
  return mobileRegex.test(mobileNo);
};

const isValidPincode = (pincode) => {
  const pincodeRegex = /^\d{6}$/;
  return pincodeRegex.test(pincode);
};

// Order number format validation
const isValidOrderNumber = (orderNumber) => {
  const orderNumberRegex = /^BO-\d{6}-\d{4}-\d{3}-[A-F0-9]{8}$/;
  return orderNumberRegex.test(orderNumber);
};

module.exports = {
  isValidOrderNumber,
  isValidEmail
}; 