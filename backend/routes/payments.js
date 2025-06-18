const express = require('express');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { confirmPayment, createPaymentIntent } = require('../stripe');
<<<<<<< HEAD
const Payment = require('../models/payment');
const User = require('../models/user');
=======
>>>>>>> 19a0bbb3b476ee1d5a05fb6e2360ed67e8cde768
// const twilio = require('twilio');

const router = express.Router();

// Initialize Twilio - temporarily disabled
// const twilioClient = twilio(
//   process.env.TWILIO_ACCOUNT_SID,
//   process.env.TWILIO_AUTH_TOKEN
// );

// Create a payment intent
router.post('/create-payment-intent', authenticateToken, async (req, res) => {
  try {
    const { amount } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const paymentIntent = await createPaymentIntent(amount);
    
    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Payment intent creation error:', error);
    res.status(500).json({ 
      error: 'Failed to create payment intent',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Confirm a payment
router.post('/confirm-payment', authenticateToken, async (req, res) => {
  try {
    const { paymentIntentId, phoneNumber } = req.body;
    const userId = req.user.userId; // Get user ID from auth token (JWT payload)
    
    console.log('Payment confirmation request received:', { paymentIntentId, phoneNumber, userId });
    
    if (!paymentIntentId) {
      return res.status(400).json({ error: 'Payment intent ID is required' });
    }

    const paymentIntent = await confirmPayment(paymentIntentId);
    console.log('Payment intent status:', paymentIntent.status);
    
    if (paymentIntent.status === 'succeeded') {
<<<<<<< HEAD
      // Save payment record to database
      const paymentRecord = await Payment.createPayment({
        user_id: userId,
        payment_intent_id: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        payment_method: paymentIntent.payment_method_types?.[0] || 'card'
      });

=======
>>>>>>> 19a0bbb3b476ee1d5a05fb6e2360ed67e8cde768
      // SMS notification temporarily disabled
      // if (phoneNumber) {
      //   try {
      //     console.log('Attempting to send SMS to:', phoneNumber);
      //     const message = `Thank you for your donation of Rs. ${paymentIntent.amount/100} to Nepal Disaster Management System. Your contribution makes a difference!`;
      //     const formattedNumber = phoneNumber.startsWith('+') ? phoneNumber : `+977${phoneNumber}`;
      //     const result = await twilioClient.messages.create({
      //       body: message,
      //       to: formattedNumber,
      //       from: process.env.TWILIO_PHONE_NUMBER,
      //     });
      //     console.log('SMS sent successfully:', {
      //       sid: result.sid,
      //       status: result.status,
      //       to: result.to
      //     });
      //   } catch (smsError) {
      //     console.error('Error sending SMS notification:', smsError);
      //   }
      // }
      
      res.json({
        success: true,
        paymentIntent,
<<<<<<< HEAD
        paymentRecord,
=======
>>>>>>> 19a0bbb3b476ee1d5a05fb6e2360ed67e8cde768
        notificationSent: false // SMS notifications disabled
      });
    } else {
      console.log('Payment not successful:', paymentIntent.status);
      res.status(400).json({
        success: false,
        error: 'Payment not successful',
        status: paymentIntent.status
      });
    }
  } catch (error) {
    console.error('Payment confirmation error:', {
      message: error.message,
      code: error.code,
      status: error.status
    });
    res.status(500).json({ 
      error: 'Failed to confirm payment',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get payment history for the current user
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    console.log("Fetching donation history for user id:", userId);
    const client = await require('../db').pool.connect();
    try {
      const query = `
        SELECT * FROM payments 
        WHERE user_id = $1 
        ORDER BY created_at DESC
      `;
      const result = await client.query(query, [userId]);
      console.log("Raw query result (rows):", result.rows);
      res.json(result.rows.map(payment => ({ ...payment, amount: payment.amount / 100 })));
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error fetching donation history (raw query):", error);
    res.status(500).json({ error: "Failed to fetch donation history", details: error instanceof Error ? error.message : "Unknown error" });
  }
});

// Get all payments (admin only)
router.get('/all', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Join payments with user info
    const client = await require('../db').pool.connect();
    try {
      const result = await client.query(`
        SELECT p.*, u.email, u.full_name
        FROM payments p
        LEFT JOIN users u ON p.user_id = u.id
        ORDER BY p.created_at DESC
      `);
      res.json(result.rows);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching all payments:', error);
    res.status(500).json({
      error: 'Failed to fetch all payments',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

module.exports = router; 