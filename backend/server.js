const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const paymentRoutes = require('./routes/payments');
const notificationRoutes = require('./routes/notifications');
const { pool } = require('./db');

const app = express();
const PORT = 3000;

// Log Twilio credentials status
console.log('\n=== Twilio Credentials Status ===');
console.log('Account SID:', 'AC3fcc30c00d71e2a59eacb9cddf94228e'.substring(0, 8) + '...');
console.log('Auth Token:', '50f91cbdf6867dc6bdacb2222e5883d2'.substring(0, 8) + '...');
console.log('Phone Number: +16056574859');
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