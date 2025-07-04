const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { auth } = require('../middleware/authMiddleware');
const { forgotPassword, resetPassword } = require('../controllers/authController');

// Register a new user
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, phone, country, address, role } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create new user
        const user = await User.create({
            name,
            email,
            password,
            phone,
            country,
            address,
            role: role || 'user'
        });

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            country: user.country,
            token
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

<<<<<<< HEAD
=======
// Register a new admin (only if no admin exists)
router.post('/register-admin', async (req, res) => {
    try {
        const { name, email, password, phone, country, address, secret } = req.body;
        // Security: require a secret key to create admin
        if (secret !== process.env.ADMIN_CREATION_SECRET) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        // Only allow if no admin exists
        const adminExists = await User.findOne({ role: 'admin' });
        if (adminExists) {
            return res.status(400).json({ message: 'Admin already exists' });
        }
        // Create admin user
        const user = await User.create({
            name,
            email,
            password,
            phone,
            country,
            address,
            role: 'admin'
        });
        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            country: user.country,
            token
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

>>>>>>> e640c03 (Initial push or updated code)
// Login user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Check password
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            country: user.country,
            token
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Forgot password route
router.post('/forgot-password', forgotPassword);

// Reset password route
router.put('/reset-password/:resetToken', resetPassword);

module.exports = router; 