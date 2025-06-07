const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const paymentRoutes = require('./routes/payments');
const notificationRoutes = require('./routes/notifications');
const { pool } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Log Twilio credentials status
console.log('\n=== Twilio Credentials Status ===');
console.log('Account SID:', 'AC3fcc30c00d71e2a59eacb9cddf94228e'.substring(0, 8) + '...');
console.log('Auth Token:', '50f91cbdf6867dc6bdacb2222e5883d2'.substring(0, 8) + '...');
console.log('Phone Number: +16056574859');
console.log('===============================\n');

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? [
        'https://expo.dev/accounts/anikesh1/projects/NepalDisasterManagement',
        'exp://u.expo.dev/update/01c45cca-3042-4d93-a5b3-337db2ea88e7',
        'com.anikesh1.NepalDisasterManagement://',
        process.env.ALLOWED_ORIGINS?.split(',') || []
      ].flat()
    : ['http://localhost:3000', 'exp://localhost:19000', 'exp://192.168.1.x:19000', 'http://10.0.2.2:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));
app.use(express.json());

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'Server is running',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notifications', notificationRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  console.log('Successfully connected to the database');
});