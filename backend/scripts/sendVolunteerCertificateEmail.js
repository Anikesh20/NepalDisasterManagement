const nodemailer = require('nodemailer');

/**
 * Sends a volunteer certificate PDF to the volunteer's email.
 * @param {Buffer} pdfBuffer - The PDF buffer to attach.
 * @param {string} fullName - The volunteer's full name.
 * @param {string} email - The volunteer's email address.
 * @returns {Promise<void>}
 */
async function sendVolunteerCertificateEmail(pdfBuffer, fullName, email) {
  // Configure the transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'sajilosahayog@gmail.com',
      pass: process.env.EMAIL_PASS || 'ftsr ixym htyf dtbm',
    },
  });

  const fromEmail = process.env.EMAIL_USER || 'anikesh99996@gmail.com';

  const mailOptions = {
    from: `Nepal Disaster Management <${fromEmail}>`,
    to: email,
    subject: 'Your Volunteer Certificate',
    text: `Dear ${fullName},\n\nCongratulations! Please find attached your official Volunteer Certificate.\n\nThank you for your service!`,
    html: `<p>Dear <b>${fullName}</b>,</p><p>Congratulations! Please find attached your official <b>Volunteer Certificate</b>.</p><p>Thank you for your service!</p>`,
    attachments: [
      {
        filename: 'Volunteer_Certificate.pdf',
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
    ],
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Certificate email sent to ${email}`);
  } catch (err) {
    console.error('Error sending certificate email:', err);
    throw err;
  }
}

module.exports = sendVolunteerCertificateEmail; 