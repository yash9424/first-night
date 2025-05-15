const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);
        
        // Test the connection
        await mongoose.connection.db.admin().ping();
        console.log('Database ping successful');
        
        // Set up mongoose debug mode for development
        mongoose.set('debug', process.env.NODE_ENV === 'development');
        
        return conn;
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

// Handle connection errors after initial connection
mongoose.connection.on('error', err => {
    console.error('MongoDB error after initial connection:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
});

module.exports = connectDB;
