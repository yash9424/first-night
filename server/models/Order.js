const mongoose = require('mongoose');
const crypto = require('crypto');

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    orderNumber: {
        type: String,
        unique: true,
        required: true
    },
    currency: {
        type: String,
        enum: ['INR', 'USD'],
        required: true
    },
    products: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        name: String,
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        price: {
            type: Number,
            required: true
        },
        size: String,
        color: String
    }],
    shippingAddress: {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        mobileNo: {
            type: String,
            required: true
        },
        alternatePhone: {
            type: String
        },
        address: {
            type: String,
            required: true
        },
        apartment: String,
        landmark: String,
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        country: {
            type: String,
            required: true
        },
        pincode: {
            type: String,
            required: true
        },
        addressType: {
            type: String,
            enum: ['Home', 'Office', 'Other'],
            default: 'Home'
        }
    },
    billingAddress: {
        sameAsShipping: {
            type: Boolean,
            default: true
        },
        name: String,
        email: String,
        address: String,
        apartment: String,
        landmark: String,
        city: String,
        state: String,
        country: String,
        pincode: String
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['cod']
    },
    paymentStatus: {
        type: String,
        enum: ['PENDING', 'PAID', 'FAILED'],
        default: 'PENDING'
    },
    paymentId: {
        type: String
    },
    orderStatus: {
        type: String,
        enum: ['PENDING', 'PENDING_VERIFICATION', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'CANCELLATION_REQUESTED'],
        default: 'PENDING'
    },
    cancellationRequest: {
        status: {
            type: String,
            enum: ['PENDING', 'APPROVED', 'REJECTED'],
            default: 'PENDING'
        },
        reason: {
            type: String,
            required: function() {
                return this.orderStatus === 'CANCELLATION_REQUESTED';
            }
        },
        requestedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        requestedAt: Date,
        processedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        processedAt: Date,
        adminNote: String
    },
    totalAmount: {
        type: Number,
        required: true
    },
    subtotal: {
        type: Number,
        required: true
    },
    shippingCost: {
        type: Number,
        default: function() {
            return this.shippingAddress.country === 'India' ? 50 : 17;
        }
    },
    tax: {
        type: Number,
        default: function() {
            return this.shippingAddress.country === 'India' ? this.subtotal * 0.18 : 0;
        }
    },
    discount: {
        type: Number,
        default: 0
    },
    couponCode: String,
    specialInstructions: String,
    giftWrap: {
        type: Boolean,
        default: false
    },
    giftMessage: String,
    estimatedDeliveryDate: Date,
    trackingNumber: String,
    courierProvider: String,
    orderNotes: [{
        note: String,
        addedBy: String,
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    orderDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Pre-save middleware to calculate total amount
orderSchema.pre('save', function(next) {
    if (this.isModified('subtotal') || this.isModified('shippingCost') || this.isModified('tax') || this.isModified('discount')) {
        this.totalAmount = this.subtotal + this.shippingCost + this.tax - this.discount;
    }
    next();
});

<<<<<<< HEAD
const Order = mongoose.model('Order', orderSchema);
=======
const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
>>>>>>> e640c03 (Initial push or updated code)
module.exports = Order; 