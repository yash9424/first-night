// Format order ID to be consistent across the application
export const formatOrderId = (orderId) => {
    if (!orderId) return 'N/A';
    return `FNT${orderId.slice(-6).toUpperCase()}`; // FNT prefix for First Night + last 6 characters
};

// Format currency based on user's preferred currency
export const formatPrice = (priceINR, priceUSD, currency = 'INR') => {
    if (!priceINR && !priceUSD) return currency === 'INR' ? '₹0.00' : '$0.00';
    
    if (currency === 'INR') {
        return `₹${Number(priceINR).toFixed(2)}`;
    }
    return `$${Number(priceUSD).toFixed(2)}`;
};

// Format discounted price based on user's preferred currency
export const formatDiscountedPrice = (discountedPriceINR, discountedPriceUSD, currency = 'INR') => {
    if (!discountedPriceINR && !discountedPriceUSD) return currency === 'INR' ? '₹0.00' : '$0.00';
    
    if (currency === 'INR') {
        return `₹${Number(discountedPriceINR).toFixed(2)}`;
    }
    return `$${Number(discountedPriceUSD).toFixed(2)}`;
};

// Get user's preferred currency
export const getUserCurrency = () => {
    const userCountry = localStorage.getItem('userCountry');
    return userCountry === 'India' ? 'INR' : 'USD';
};

// Format date consistently
export const formatDate = (dateString) => {
    try {
        const options = { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
        };
        return new Date(dateString).toLocaleDateString('en-US', options);
    } catch (error) {
        return 'Invalid date';
    }
}; 