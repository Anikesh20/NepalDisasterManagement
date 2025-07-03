const express = require('express');
const router = express.Router();
const User = require('../models/user');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const db = require('../db');

// Get all users (admin only)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
    try {
        console.log('[Users Route] Getting all users, admin ID:', req.user.userId);
        
        const result = await db.query(
            'SELECT id, email, username, full_name, phone_number, district, blood_group, is_volunteer, is_admin, created_at FROM users ORDER BY created_at DESC'
        );
        
        console.log('[Users Route] Query result:', {
            rowCount: result.rowCount,
            hasRows: result.rows.length > 0
        });
        
        // Remove sensitive information
        const users = result.rows.map(user => ({
            ...user,
            password: undefined
        }));
        
        console.log('[Users Route] Sending response with users:', {
            count: users.length,
            firstUser: users[0] ? {
                id: users[0].id,
                email: users[0].email,
                username: users[0].username
            } : null
        });
        
        res.json({ users });
    } catch (error) {
        console.error('[Users Route] Error fetching users:', error);
        console.error('[Users Route] Error details:', {
            message: error.message,
            stack: error.stack
        });
        res.status(500).json({ 
            error: 'Internal server error',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Get user profile
router.get('/:userId', authenticateToken, async (req, res) => {
    try {
        // Only allow users to access their own profile
        if (String(req.user.userId) !== String(req.params.userId)) {
            return res.status(403).json({ error: 'Not authorized to view this profile' });
        }
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Remove sensitive information
        delete user.password;
        
        res.json(user);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update user profile
router.put('/:userId', authenticateToken, async (req, res) => {
    try {
        const {
            full_name,
            phone_number,
            emergency_number,
            blood_group,
            district,
            skills,
            profile_image
        } = req.body;

        // Only allow users to update their own profile
        if (String(req.user.userId) !== String(req.params.userId)) {
            return res.status(403).json({ error: 'Not authorized to update this profile' });
        }

        const updatedUser = await User.updateProfile(req.params.userId, {
            full_name,
            phone_number,
            emergency_number,
            blood_group,
            district,
            skills,
            profile_image
        });

        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Remove sensitive information
        delete updatedUser.password;

        res.json(updatedUser);
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update Expo push token
router.put('/:userId/expo-push-token', authenticateToken, async (req, res) => {
    try {
        const { expoPushToken } = req.body;
        if (!expoPushToken) {
            return res.status(400).json({ error: 'expoPushToken is required' });
        }
        // Only allow users to update their own token
        if (String(req.user.userId) !== String(req.params.userId)) {
            return res.status(403).json({ error: 'Not authorized to update this token' });
        }
        const updatedUser = await User.updateExpoPushToken(req.params.userId, expoPushToken);
        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating Expo push token:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router; 