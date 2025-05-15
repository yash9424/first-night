const User = require('../models/user');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Please provide an email address'
            });
        }

        console.log('Processing forgot password request for email:', email);

        const user = await User.findOne({ email });

        if (!user) {
            console.log('No user found with email:', email);
            return res.status(404).json({
                success: false,
                message: 'No user found with that email'
            });
        }

        // Check if there's an existing valid token
        if (user.resetPasswordToken && user.resetPasswordExpire > Date.now()) {
            console.log('User already has a valid reset token');
            return res.status(429).json({
                success: false,
                message: 'A password reset link has already been sent. Please check your email or wait 10 minutes before requesting another.'
            });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        // Set token expiration (1 minute)
        const tokenExpiration = Date.now() + 1 * 60 * 1000;

        console.log('Generated reset token for user:', user._id);

        // Save hashed token and expiration to user
        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpire = tokenExpiration;
        await user.save({ validateBeforeSave: false });

        // Create reset URL
        const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
        console.log('Reset URL generated:', resetUrl);

        // Create email message
        const message = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                <h1 style="color: #333; text-align: center; margin-bottom: 30px;">Password Reset Request</h1>
                <p style="color: #666; font-size: 16px;">Hello ${user.name},</p>
                <p style="color: #666; font-size: 16px;">We received a request to reset your password. Please click the button below to reset your password:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}" 
                       style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-size: 16px;">
                        Reset Password
                    </a>
                </div>
                <p style="color: #666; font-size: 14px;">This link will expire in 1 minute.</p>
                <p style="color: #666; font-size: 14px;">If you did not request this password reset, please ignore this email or contact support if you have concerns.</p>
                <hr style="border: 1px solid #eee; margin: 20px 0;">
                <p style="color: #999; font-size: 12px; text-align: center;">
                    This is an automated message, please do not reply to this email.
                </p>
            </div>
        `;

        try {
            console.log('Attempting to send reset email to:', user.email);
            await sendEmail({
                email: user.email,
                subject: 'Password Reset Request - First Night',
                html: message
            });
            console.log('Reset email sent successfully to:', user.email);

            res.status(200).json({
                success: true,
                message: 'Password reset email sent successfully'
            });
        } catch (err) {
            console.error('Failed to send reset email:', err);
            
            // Clear reset token if email fails
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save({ validateBeforeSave: false });

            return res.status(500).json({
                success: false,
                message: 'Email could not be sent. Please try again later.'
            });
        }
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error. Please try again later.'
        });
    }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:resetToken
// @access  Public
exports.resetPassword = async (req, res) => {
    try {
        const { resetToken } = req.params;
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a new password'
            });
        }

        // Hash the token from params
        const hashedToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        // Find user with valid token
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token'
            });
        }

        // Update password
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        // Generate new JWT token
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE }
        );

        res.status(200).json({
            success: true,
            message: 'Password has been reset successfully',
            token
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error. Please try again later.'
        });
    }
}; 