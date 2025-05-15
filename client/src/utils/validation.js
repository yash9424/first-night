// Order number format: BO-YYMMDD-HHMM-MSS-RRRR
export const isValidOrderNumber = (orderNumber) => {
  const orderNumberRegex = /^BO-\d{6}-\d{4}-\d{3}-[A-F0-9]{8}$/;
  return orderNumberRegex.test(orderNumber);
};

export const getOrderNumberFormat = () => {
  return 'BO-YYMMDD-HHMM-MSS-RRRR (e.g., BO-230915-1430-123-A1B2C3D4)';
}; 