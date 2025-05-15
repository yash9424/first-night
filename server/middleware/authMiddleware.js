const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    try {
        console.log('Auth Headers:', req.headers);
        const authHeader = req.header('Authorization');
        if (!authHeader) {
            console.error('No Authorization header found');
            return res.status(401).json({ message: 'No Authorization header found' });
        }

        const token = authHeader.replace('Bearer ', '');
        if (!token) {
            console.error('No token found in Authorization header');
            return res.status(401).json({ message: 'No token found in Authorization header' });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            console.log('Authenticated user:', decoded);
            next();
        } catch (jwtError) {
            console.error('JWT verification failed:', jwtError.message);
            return res.status(401).json({ message: 'Token is not valid: ' + jwtError.message });
        }
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({ message: 'Authentication failed: ' + error.message });
    }
};

const adminAuth = (req, res, next) => {
    try {
        console.log('Checking admin rights for user:', req.user);
        if (!req.user) {
            console.error('No user found in request');
            return res.status(401).json({ message: 'User not authenticated' });
        }

        if (req.user.role !== 'admin') {
            console.error('User is not an admin:', req.user.role);
            return res.status(403).json({ message: 'Access denied. Admin rights required.' });
        }

        console.log('Admin access granted');
        next();
    } catch (error) {
        console.error('Admin auth middleware error:', error);
        res.status(403).json({ message: 'Admin authorization failed: ' + error.message });
    }
};

module.exports = { auth, adminAuth }; 