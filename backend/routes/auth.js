const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/user');
require('dotenv').config();

// Signup route
router.post('/signup', async (req, res) => {
    try {
        console.log('Signup request received:', { ...req.body, password: '***' });
        
        const {
            email,
            username,
            full_name,
            phone_number,
            emergency_number,
            district,
            current_location,
            blood_group,
            password,
            is_volunteer
        } = req.body;
        
        // Validate required fields
        if (!email || !username || !full_name || !phone_number || !district || !password) {
            const missingFields = [];
            if (!email) missingFields.push('email');
            if (!username) missingFields.push('username');
            if (!full_name) missingFields.push('full_name');
            if (!phone_number) missingFields.push('phone_number');
            if (!district) missingFields.push('district');
            if (!password) missingFields.push('password');
            
            console.error('Missing required fields:', missingFields);
            return res.status(400).json({ 
                error: 'Missing required fields',
                details: `The following fields are required: ${missingFields.join(', ')}`
            });
        }

        // Check if user already exists
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            console.error('User already exists:', email);
            return res.status(400).json({ error: 'User already exists' });
        }

        // Create new user
        try {
            const user = await User.createUser({
                email,
                username,
                full_name,
                phone_number,
                emergency_number,
                district,
                current_location,
                blood_group,
                password,
                is_volunteer
            });
            
            console.log('User created successfully:', user);
            res.status(201).json(user);
        } catch (error) {
            console.error('Error creating user:', error);
            if (error.code === '23502') { // PostgreSQL not-null violation
                return res.status(400).json({ 
                    error: 'Database error',
                    details: `Missing required field: ${error.column}`
                });
            }
            res.status(500).json({ 
                error: 'Internal server error',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Login route
router.post('/login', async (req, res) => {
    try {
        console.log('Login request received:', { ...req.body, password: '***' });
        
        const { email, password } = req.body;
        
        if (!email || !password) {
            console.error('Missing email or password');
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find user by email
        const user = await User.findByEmail(email);
        if (!user) {
            console.error('User not found:', email);
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Verify password
        const isValidPassword = await User.verifyPassword(user, password);
        if (!isValidPassword) {
            console.error('Invalid password for user:', email);
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        console.log('Login successful for user:', email);

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            'nepal_disaster_management_secret_key_2024',
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                full_name: user.full_name
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = router; 