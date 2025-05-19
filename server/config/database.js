const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Get MongoDB URI from environment variable or use default
        const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/jewelry_shop';
        
        // Log connection attempt (but not the full URI in production)
        console.log('Attempting to connect to MongoDB...');
        
        const options = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            maxPoolSize: 50,
            minPoolSize: 10,
            keepAlive: true,
            keepAliveInitialDelay: 300000
        };

        const conn = await mongoose.connect(uri, options);

        console.log(`MongoDB Connected: ${conn.connection.host}`);
        
        // Set up connection error handlers
        mongoose.connection.on('error', err => {
            console.error('MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
        });

        mongoose.connection.on('reconnected', () => {
            console.log('MongoDB reconnected');
        });

        // Handle process termination
        process.on('SIGINT', async () => {
            try {
                await mongoose.connection.close();
                console.log('MongoDB connection closed through app termination');
                process.exit(0);
            } catch (err) {
                console.error('Error closing MongoDB connection:', err);
                process.exit(1);
            }
        });

        return conn;
    } catch (error) {
        console.error('MongoDB connection error:', {
            message: error.message,
            code: error.code,
            name: error.name
        });
        // In production, you might want to handle this differently
        process.exit(1);
    }
};

module.exports = connectDB; 