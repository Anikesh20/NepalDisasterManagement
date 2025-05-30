const express = require('express');
const router = express.Router();
const sgMail = require('@sendgrid/mail');
const twilio = require('twilio');
const { authenticateToken } = require('../middleware/auth');

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Twilio credentials
const TWILIO_ACCOUNT_SID = 'AC3fcc30c00d71e2a59eacb9cddf94228e';
const TWILIO_AUTH_TOKEN = '50f91cbdf6867dc6bdacb2222e5883d2';
const TWILIO_PHONE_NUMBER = '+16056574859';

// Initialize Twilio client
const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

// Log Twilio client status
console.log('\n=== Twilio Client Status ===');
console.log('Client initialized:', !!twilioClient);
console.log('Account SID:', TWILIO_ACCOUNT_SID);
console.log('Auth Token:', TWILIO_AUTH_TOKEN);
console.log('Phone Number:', TWILIO_PHONE_NUMBER);
console.log('===========================\n');

// Email endpoint
router.post('/email', authenticateToken, async (req, res) => {
  try {
    const { to, from, subject, text, html } = req.body;
    
    const msg = {
      to,
      from: {
        email: from.email,
        name: from.name,
      },
      subject,
      text,
      html,
    };

    await sgMail.send(msg);
    res.json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send email',
    });
  }
});

// SMS endpoint - temporarily removed authentication for testing
router.post('/sms', async (req, res) => {
  try {
    const { to, message } = req.body;
    console.log('Attempting to send SMS to:', to);
    console.log('Using Twilio credentials:', {
      accountSid: TWILIO_ACCOUNT_SID,
      authToken: TWILIO_AUTH_TOKEN,
      fromNumber: TWILIO_PHONE_NUMBER
    });

    const result = await twilioClient.messages.create({
      body: message,
      to,
      from: TWILIO_PHONE_NUMBER
    });

    console.log('SMS sent successfully:', {
      sid: result.sid,
      status: result.status,
      to: result.to
    });
    res.json({ success: true, message: 'SMS sent successfully', sid: result.sid });
  } catch (error) {
    console.error('Error sending SMS notification:', {
      error: error.message,
      code: error.code,
      status: error.status,
      moreInfo: error.moreInfo
    });
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send SMS',
      details: error
    });
  }
});

module.exports = router; 