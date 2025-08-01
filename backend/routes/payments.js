const express = require('express');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { confirmPayment, createPaymentIntent } = require('../stripe');
const Payment = require('../models/payment');
const User = require('../models/user');
// const twilio = require('twilio');
const nodemailer = require('nodemailer');
const createPaymentReceiptPDF = require('../scripts/createPaymentReceiptPDF');

const router = express.Router();

// Initialize Twilio - temporarily disabled
// const twilioClient = twilio(
//   process.env.TWILIO_ACCOUNT_SID,
//   process.env.TWILIO_AUTH_TOKEN
// );

function generateOTP(length = 6) {
  return Math.floor(100000 + Math.random() * 900000).toString().substring(0, length);
}

function generatePaymentIntentId() {
  return 'pi_' + Math.random().toString(36).substr(2, 16);
}

// Payment initiation endpoint (example, adjust as needed)
router.post('/initiate', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const { amount, payment_method } = req.body;
  try {
    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min
    const payment_intent_id = generatePaymentIntentId();
    const status = 'pending';
    const paymentResult = await require('../db').pool.query(
      `INSERT INTO payments (user_id, amount, payment_method, payment_intent_id, status, otp, otp_expires_at, is_verified) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [userId, amount, payment_method, payment_intent_id, status, otp, otpExpiresAt, false]
    );
    const payment = paymentResult.rows[0];
    // Get user email
    const userResult = await require('../db').pool.query('SELECT email, full_name FROM users WHERE id = $1', [userId]);
    const user = userResult.rows[0];
    // Send OTP email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    try {
      await transporter.sendMail({
        from: `Sajilo Sahayog <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: 'Your Payment OTP - Sajilo Sahayog',
        text: `Your OTP for payment is: ${otp}. It is valid for 5 minutes.`,
        html: `<p>Your OTP for payment is: <b>${otp}</b>. It is valid for 5 minutes.</p>`,
      });
      console.log('OTP email sent to:', user.email);
    } catch (emailErr) {
      console.error('Error sending OTP email:', emailErr);
    }
    res.json({ success: true, paymentId: payment.id, message: 'OTP sent to email.' });
  } catch (err) {
    console.error('Error initiating payment:', err);
    res.status(500).json({ error: 'Failed to initiate payment' });
  }
});

// OTP verification endpoint
router.post('/verify-otp', async (req, res) => {
  const { paymentId, otp } = req.body;
  try {
    const paymentResult = await require('../db').pool.query('SELECT * FROM payments WHERE id = $1', [paymentId]);
    const payment = paymentResult.rows[0];
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    if (payment.is_verified) return res.status(400).json({ error: 'Payment already verified' });
    if (payment.otp !== otp) return res.status(400).json({ error: 'Invalid OTP' });
    if (new Date(payment.otp_expires_at) < new Date()) return res.status(400).json({ error: 'OTP expired' });
    // Mark payment as verified
    await require('../db').pool.query('UPDATE payments SET is_verified = TRUE, status = $2 WHERE id = $1', [paymentId, 'succeeded']);
    // Generate PDF receipt
    const pdfBuffer = await createPaymentReceiptPDF(payment);
    // Get user email
    const userResult = await require('../db').pool.query('SELECT email, full_name FROM users WHERE id = $1', [payment.user_id]);
    const user = userResult.rows[0];
    // Send PDF receipt email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    await transporter.sendMail({
      from: `Sajilo Sahayog <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Payment Receipt - Sajilo Sahayog',
      text: `Dear ${user.full_name},\n\nThank you for your payment. Please find your receipt attached.\n\nTransaction ID: ${payment.id}`,
      html: `<p>Dear <b>${user.full_name}</b>,</p><p>Thank you for your payment. Please find your receipt attached.</p><p>Transaction ID: <b>${payment.id}</b></p>`,
      attachments: [
        {
          filename: `Payment_Receipt_${payment.id}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    });
    res.json({ success: true, message: 'Payment verified and receipt sent.' });
  } catch (err) {
    console.error('Error verifying payment OTP:', err);
    res.status(500).json({ error: 'Failed to verify payment OTP' });
  }
});

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
      // Save payment record to database
      const paymentRecord = await Payment.createPayment({
        user_id: userId,
        payment_intent_id: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        payment_method: paymentIntent.payment_method_types?.[0] || 'card'
      });

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
        paymentRecord,
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