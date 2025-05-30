const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { confirmPayment, createPaymentIntent } = require('../stripe');
const twilio = require('twilio');

const router = express.Router();

// Initialize Twilio
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

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
    console.log('Payment confirmation request received:', { paymentIntentId, phoneNumber });
    
    if (!paymentIntentId) {
      return res.status(400).json({ error: 'Payment intent ID is required' });
    }

    const paymentIntent = await confirmPayment(paymentIntentId);
    console.log('Payment intent status:', paymentIntent.status);
    
    if (paymentIntent.status === 'succeeded') {
      // Send SMS notification if phone number is provided
      if (phoneNumber) {
        try {
          console.log('Attempting to send SMS to:', phoneNumber);
          console.log('Using Twilio credentials:', {
            accountSid: process.env.TWILIO_ACCOUNT_SID ? 'Set' : 'Not Set',
            authToken: process.env.TWILIO_AUTH_TOKEN ? 'Set' : 'Not Set',
            fromNumber: process.env.TWILIO_PHONE_NUMBER
          });

          const message = `Thank you for your donation of Rs. ${paymentIntent.amount/100} to Nepal Disaster Management System. Your contribution makes a difference!`;
          
          const formattedNumber = phoneNumber.startsWith('+') ? phoneNumber : `+977${phoneNumber}`;
          console.log('Formatted phone number:', formattedNumber);
          
          const result = await twilioClient.messages.create({
            body: message,
            to: formattedNumber,
            from: process.env.TWILIO_PHONE_NUMBER,
          });
          
          console.log('SMS sent successfully:', {
            sid: result.sid,
            status: result.status,
            to: result.to
          });
        } catch (smsError) {
          console.error('Error sending SMS notification:', {
            error: smsError.message,
            code: smsError.code,
            status: smsError.status,
            moreInfo: smsError.moreInfo
          });
          // Don't fail the payment if SMS fails
        }
      } else {
        console.log('No phone number provided for SMS notification');
      }
      
      res.json({
        success: true,
        paymentIntent,
        notificationSent: !!phoneNumber
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

module.exports = router; 