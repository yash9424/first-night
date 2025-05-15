const nodemailer = require('nodemailer');
const config = require('../config');

// Create nodemailer transporter
const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.secure,
  auth: {
    user: config.email.user,
    pass: config.email.password
  }
});

// Send order confirmation email
const sendOrderConfirmationEmail = async (order) => {
  const mailOptions = {
    from: config.email.from,
    to: order.shippingAddress.email,
    subject: `Order Confirmed - ${order.orderNumber}`,
    html: `
      <h1>Order Confirmation</h1>
      <p>Dear ${order.shippingAddress.name},</p>
      <p>Your order has been confirmed and is being processed.</p>
      <p><strong>Order Number:</strong> ${order.orderNumber}</p>
      <p><strong>Order Date:</strong> ${new Date(order.orderDate).toLocaleDateString()}</p>
      <p><strong>Total Amount:</strong> ₹${order.totalAmount.toFixed(2)}</p>
      <p><strong>Payment Method:</strong> ${order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</p>
      <p><strong>Estimated Delivery:</strong> ${new Date(order.estimatedDeliveryDate).toLocaleDateString()}</p>
      <h2>Shipping Address</h2>
      <p>${order.shippingAddress.name}<br>
      ${order.shippingAddress.address}<br>
      ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.pincode}<br>
      Phone: ${order.shippingAddress.mobileNo}</p>
      <h2>Order Items</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <th style="border: 1px solid #ddd; padding: 8px;">Product</th>
          <th style="border: 1px solid #ddd; padding: 8px;">Quantity</th>
          <th style="border: 1px solid #ddd; padding: 8px;">Price</th>
        </tr>
        ${order.products.map(item => `
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px;">${item.name}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${item.quantity}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">₹${item.price.toFixed(2)}</td>
          </tr>
        `).join('')}
      </table>
      <p>Thank you for shopping with us!</p>
    `
  };

  await transporter.sendMail(mailOptions);
};

// Send order shipped email
const sendOrderShippedEmail = async (order) => {
  const mailOptions = {
    from: config.email.from,
    to: order.shippingAddress.email,
    subject: `Order Shipped - ${order.orderNumber}`,
    html: `
      <h1>Order Shipped</h1>
      <p>Dear ${order.shippingAddress.name},</p>
      <p>Your order has been shipped and is on its way!</p>
      <p><strong>Order Number:</strong> ${order.orderNumber}</p>
      <p><strong>Tracking Number:</strong> ${order.trackingNumber}</p>
      <p><strong>Courier:</strong> ${order.courierProvider}</p>
      ${order.trackingUrl ? `<p><a href="${order.trackingUrl}">Track Your Order</a></p>` : ''}
      <p><strong>Estimated Delivery:</strong> ${new Date(order.estimatedDeliveryDate).toLocaleDateString()}</p>
      <h2>Shipping Address</h2>
      <p>${order.shippingAddress.name}<br>
      ${order.shippingAddress.address}<br>
      ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.pincode}<br>
      Phone: ${order.shippingAddress.mobileNo}</p>
      <p>Thank you for shopping with us!</p>
    `
  };

  await transporter.sendMail(mailOptions);
};

// Send order delivered email
const sendOrderDeliveredEmail = async (order) => {
  const mailOptions = {
    from: config.email.from,
    to: order.shippingAddress.email,
    subject: `Order Delivered - ${order.orderNumber}`,
    html: `
      <h1>Order Delivered</h1>
      <p>Dear ${order.shippingAddress.name},</p>
      <p>Your order has been delivered successfully!</p>
      <p><strong>Order Number:</strong> ${order.orderNumber}</p>
      <p><strong>Delivery Date:</strong> ${new Date().toLocaleDateString()}</p>
      <p>We hope you enjoy your purchase. If you have any questions or concerns, please don't hesitate to contact us.</p>
      <p>Thank you for shopping with us!</p>
    `
  };

  await transporter.sendMail(mailOptions);
};

// Send order cancelled email
const sendOrderCancelledEmail = async (order) => {
  const mailOptions = {
    from: config.email.from,
    to: order.shippingAddress.email,
    subject: `Order Cancelled - ${order.orderNumber}`,
    html: `
      <h1>Order Cancelled</h1>
      <p>Dear ${order.shippingAddress.name},</p>
      <p>Your order has been cancelled as requested.</p>
      <p><strong>Order Number:</strong> ${order.orderNumber}</p>
      <p><strong>Cancellation Date:</strong> ${new Date().toLocaleDateString()}</p>
      <p>If you did not request this cancellation or have any questions, please contact us immediately.</p>
      <p>We hope to serve you again soon!</p>
    `
  };

  await transporter.sendMail(mailOptions);
};

// Send cancellation request email to admin
const sendCancellationRequestEmail = async (order) => {
  const subject = `Order Cancellation Request - ${order.orderNumber}`;
  const html = `
    <h2>New Order Cancellation Request</h2>
    <p>Order Number: ${order.orderNumber}</p>
    <p>Customer: ${order.shippingAddress.name}</p>
    <p>Reason: ${order.cancellationRequest.reason}</p>
    <p>Requested At: ${new Date(order.cancellationRequest.requestedAt).toLocaleString()}</p>
    <p>Please review the cancellation request in the admin panel.</p>
  `;
  
  await sendEmail(process.env.ADMIN_EMAIL, subject, html);
};

// Send cancellation approved email to customer
const sendOrderCancellationEmail = async (order) => {
  const subject = `Order Cancellation Approved - ${order.orderNumber}`;
  const html = `
    <h2>Order Cancellation Approved</h2>
    <p>Dear ${order.shippingAddress.name},</p>
    <p>Your request to cancel order ${order.orderNumber} has been approved.</p>
    <p>Reason for cancellation: ${order.cancellationRequest.reason}</p>
    ${order.cancellationRequest.adminNote ? `<p>Admin note: ${order.cancellationRequest.adminNote}</p>` : ''}
    <p>If you have already paid for this order, a refund will be processed within 5-7 business days.</p>
    <p>Thank you for shopping with us!</p>
  `;
  
  await sendEmail(order.shippingAddress.email, subject, html);
};

// Send cancellation rejected email to customer
const sendCancellationRejectedEmail = async (order) => {
  const subject = `Order Cancellation Request Update - ${order.orderNumber}`;
  const html = `
    <h2>Order Cancellation Request Update</h2>
    <p>Dear ${order.shippingAddress.name},</p>
    <p>Your request to cancel order ${order.orderNumber} could not be approved.</p>
    ${order.cancellationRequest.adminNote ? `<p>Reason: ${order.cancellationRequest.adminNote}</p>` : ''}
    <p>Your order will continue to be processed as normal.</p>
    <p>If you have any questions, please contact our customer support.</p>
    <p>Thank you for your understanding.</p>
  `;
  
  await sendEmail(order.shippingAddress.email, subject, html);
};

module.exports = {
  sendOrderConfirmationEmail,
  sendOrderShippedEmail,
  sendOrderDeliveredEmail,
  sendOrderCancelledEmail,
  sendCancellationRequestEmail,
  sendOrderCancellationEmail,
  sendCancellationRejectedEmail
}; 