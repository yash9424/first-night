const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    priceINR: {
        type: Number,
        required: true,
        min: 0
    },
    priceUSD: {
        type: Number,
        required: true,
        min: 0
    },
    stock: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },
    mainImage: {
        type: String,
        required: true
    },
    hoverImage: {
        type: String
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    discountedPriceINR: {
        type: Number,
        min: 0
    },
    discountedPriceUSD: {
        type: Number,
        min: 0
    },
    discountPercentage: {
        type: Number,
        min: 0,
        max: 100
    },
    type: {
        type: String
    },
    material: {
        type: String
    },
    inStock: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Product', productSchema); 