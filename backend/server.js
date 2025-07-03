const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const paymentRoutes = require('./routes/payments');
const notificationRoutes = require('./routes/notifications');
const reportsRouter = require('./routes/reports');
const { pool } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Twilio credentials from environment variables
console.log('\n=== Twilio Credentials Status ===');
console.log('Account SID:', (process.env.TWILIO_ACCOUNT_SID || '').substring(0, 8) + '...');
console.log('Auth Token:', (process.env.TWILIO_AUTH_TOKEN || '').substring(0, 8) + '...');
console.log('Phone Number:', process.env.TWILIO_PHONE_NUMBER || 'Not set');
console.log('===============================\n');

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportsRouter);

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('Successfully connected to the database');
});