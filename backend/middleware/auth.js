const jwt = require('jsonwebtoken');
// require('dotenv').config();

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    console.log('Token received by backend:', token); // Debug log

    if (!token) {
        return res.status(401).json({ error: 'Authentication token required' });
    }

    jwt.verify(token, 'nepal_disaster_management_secret_key_2024', (err, user) => {
        if (err) {
            console.error('Token verification error:', err);
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

const requireAdmin = (req, res, next) => {
    if (!req.user || !req.user.isAdmin) {
        console.log('Admin check failed:', { user: req.user });
        return res.status(403).json({ error: 'Admin privileges required' });
    }
    next();
};

module.exports = {
    authenticateToken,
    requireAdmin
}; 