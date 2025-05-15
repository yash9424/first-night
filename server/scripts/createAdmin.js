const mongoose = require('mongoose');
const User = require('../models/user');
require('dotenv').config();

const createAdminUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        // Check if admin already exists
        const adminExists = await User.findOne({ email: 'admin@brantamain.com' });
        
        if (adminExists) {
            console.log('Admin user already exists');
            process.exit(0);
        }

        // Create admin user
        const adminUser = await User.create({
            name: 'Admin',
            email: 'admin@brantamain.com',
            password: 'admin123',
            phone: '1234567890',
            address: 'Admin Address',
            role: 'admin'
        });

        console.log('Admin user created successfully:', adminUser.email);
        process.exit(0);
    } catch (error) {
        console.error('Error creating admin user:', error.message);
        process.exit(1);
    }
};

createAdminUser(); 