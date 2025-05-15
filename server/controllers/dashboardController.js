const User = require('../models/user');
const Product = require('../models/product');
const Order = require('../models/order');

// Get dashboard statistics
exports.getStats = async (req, res) => {
    try {
        // Get user statistics
        const totalUsers = await User.countDocuments();
        const adminUsers = await User.countDocuments({ role: 'admin' });
        const customerUsers = totalUsers - adminUsers;

        // Get product statistics
        const totalProducts = await Product.countDocuments();
        const outOfStockProducts = await Product.countDocuments({ stock: 0 });
        const lowStockProducts = await Product.countDocuments({ stock: { $gt: 0, $lte: 10 } });
        const inStockProducts = totalProducts - outOfStockProducts;

        // Get order statistics
        const totalOrders = await Order.countDocuments();
        const pendingOrders = await Order.countDocuments({ orderStatus: 'PENDING' });
        const confirmedOrders = await Order.countDocuments({ orderStatus: 'CONFIRMED' });
        const shippedOrders = await Order.countDocuments({ orderStatus: 'SHIPPED' });
        const deliveredOrders = await Order.countDocuments({ orderStatus: 'DELIVERED' });
        const cancelledOrders = await Order.countDocuments({ orderStatus: 'CANCELLED' });
        const cancellationRequests = await Order.countDocuments({ orderStatus: 'CANCELLATION_REQUESTED' });

        // Calculate revenue metrics
        const allOrders = await Order.find({ orderStatus: { $nin: ['CANCELLED', 'CANCELLATION_REQUESTED'] } });
        
        // Total revenue
        const totalRevenue = allOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        
        // Total products sold
        const totalProductsSold = allOrders.reduce((sum, order) => {
            return sum + order.products.reduce((productSum, product) => productSum + (product.quantity || 0), 0);
        }, 0);

        // Calculate today's statistics
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const todayOrders = await Order.countDocuments({ 
            createdAt: { $gte: today }
        });
        
        const todayRevenue = (await Order.find({ 
            createdAt: { $gte: today },
            orderStatus: { $nin: ['CANCELLED', 'CANCELLATION_REQUESTED'] }
        })).reduce((sum, order) => sum + (order.totalAmount || 0), 0);

        const todayCancellations = await Order.countDocuments({
            $or: [
                { orderStatus: 'CANCELLED', 'statusUpdates.CANCELLED.timestamp': { $gte: today } },
                { orderStatus: 'CANCELLATION_REQUESTED', createdAt: { $gte: today } }
            ]
        });

        // Online payment orders (removing COD stats)
        const onlinePaymentOrders = await Order.countDocuments({ paymentMethod: { $ne: 'cod' } });

        // Currency conversion (approximate)
        const usdRate = 0.012; // 1 INR = 0.012 USD (approx.)
        
        // Get recent orders
        const recentOrders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('user', 'name email')
            .select('orderNumber totalAmount orderStatus createdAt shippingAddress');

        // Get low stock products
        const lowStockProductsList = await Product.find({ stock: { $gt: 0, $lte: 10 } })
            .limit(10)
            .select('name stock price mainImage');

        // Get out of stock products
        const outOfStockProductsList = await Product.find({ stock: 0 })
            .limit(10)
            .select('name stock price mainImage');

        // Top selling products
        const topSellingProductsAggregation = await Order.aggregate([
            { $match: { orderStatus: { $nin: ['CANCELLED', 'CANCELLATION_REQUESTED'] } } },
            { $unwind: "$products" },
            { $group: {
                _id: "$products.product",
                totalSold: { $sum: "$products.quantity" },
                revenue: { $sum: { $multiply: ["$products.quantity", "$products.price"] } }
            }},
            { $sort: { totalSold: -1 } },
            { $limit: 5 }
        ]);

        // Populate product details for top selling products
        const topSellingProducts = [];
        for (const item of topSellingProductsAggregation) {
            const product = await Product.findById(item._id).select('name price mainImage');
            if (product) {
                topSellingProducts.push({
                    ...item,
                    name: product.name,
                    price: product.price,
                    mainImage: product.mainImage
                });
            }
        }

        res.json({
            stats: {
                // User stats
                totalUsers,
                adminUsers,
                customerUsers,
                
                // Product stats
                totalProducts,
                inStockProducts,
                outOfStockProducts,
                lowStockProducts,
                
                // Order stats
                totalOrders,
                pendingOrders,
                confirmedOrders,
                shippedOrders,
                deliveredOrders,
                cancelledOrders,
                cancellationRequests,
                
                // Revenue stats
                totalRevenue,
                totalRevenueUSD: totalRevenue * usdRate,
                totalProductsSold,
                
                // Payment stats
                onlinePaymentOrders,
                
                // Today's stats
                todayOrders,
                todayRevenue,
                todayRevenueUSD: todayRevenue * usdRate,
                todayCancellations
            },
            recentOrders,
            lowStockProductsList,
            outOfStockProductsList,
            topSellingProducts
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ message: 'Failed to fetch dashboard statistics' });
    }
}; 