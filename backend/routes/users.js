const express = require('express');
const router = express.Router();
const User = require('../models/user');
const { authenticateToken } = require('../middleware/auth');

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

module.exports = router; 