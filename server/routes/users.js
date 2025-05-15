const express = require('express');
const router = express.Router();
const User = require('../models/user');
const { auth, adminAuth } = require('../middleware/authMiddleware');
const bcrypt = require('bcryptjs');

// Health check endpoint
router.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Users service is running' });
});

// Get all users (admin only)
router.get('/', auth, adminAuth, async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get user profile
router.get('/profile', auth, async (req, res) => {
    try {
        console.log('Fetching profile for user:', req.user.id);
        
        if (!req.user || !req.user.id) {
            console.error('No user ID found in request');
            return res.status(400).json({ message: 'User ID is required' });
        }

        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            console.error('User not found:', req.user.id);
            return res.status(404).json({ message: 'User not found' });
        }

        console.log('Profile fetched successfully for user:', req.user.id);
        res.json(user);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ 
            message: 'Error fetching user profile',
            error: error.message 
        });
    }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
    try {
        console.log('Updating profile for user:', req.user.id);
        console.log('Update data received');

        const { name, email, phone, address, currentPassword, newPassword } = req.body;
        
        // Find user and update
        const user = await User.findById(req.user.id);
        if (!user) {
            console.error('User not found for update:', req.user.id);
            return res.status(404).json({ message: 'User not found' });
        }

        // If password change is requested
        if (newPassword) {
            // Verify current password
            if (!currentPassword) {
                return res.status(400).json({ message: 'Current password is required to change password' });
            }

            const isMatch = await user.matchPassword(currentPassword);
            if (!isMatch) {
                return res.status(401).json({ message: 'Current password is incorrect' });
            }

            // Hash new password
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
            console.log('Password updated successfully');
        }

        // Update other fields if provided
        if (name) user.name = name;
        if (email) user.email = email;
        if (phone) user.phone = phone;
        if (address) user.address = address;

        // Save the updated user
        const updatedUser = await user.save();
        
        // Return user without password
        const userResponse = updatedUser.toObject();
        delete userResponse.password;
        
        console.log('Profile updated successfully for user:', req.user.id);
        res.json(userResponse);
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ 
            message: 'Error updating user profile',
            error: error.message 
        });
    }
});

// Update user (admin only)
router.put('/:id', [auth, adminAuth], async (req, res) => {
    try {
        const { name, email, role, phone, address, country, preferredCurrency } = req.body;
        
        // Find user
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prevent changing the role of the last admin
        if (user.role === 'admin' && role === 'user') {
            const adminCount = await User.countDocuments({ role: 'admin' });
            if (adminCount <= 1) {
                return res.status(400).json({ message: 'Cannot demote the last admin user' });
            }
        }

        // Update fields
        user.name = name || user.name;
        user.email = email || user.email;
        user.role = role || user.role;
        user.phone = phone || user.phone;
        user.address = address || user.address;
        user.country = country || user.country;
        user.preferredCurrency = preferredCurrency || user.preferredCurrency;

        const updatedUser = await user.save();
        
        // Return user without password
        const userResponse = updatedUser.toObject();
        delete userResponse.password;
        
        res.json(userResponse);
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: error.message });
    }
});

// Delete user (admin only)
router.delete('/:id', [auth, adminAuth], async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prevent deleting the last admin user
        if (user.role === 'admin') {
            const adminCount = await User.countDocuments({ role: 'admin' });
            if (adminCount <= 1) {
                return res.status(400).json({ message: 'Cannot delete the last admin user' });
            }
        }

        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 