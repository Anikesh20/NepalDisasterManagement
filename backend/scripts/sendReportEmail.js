const nodemailer = require('nodemailer');

/**
 * Sends an email with a PDF attachment to the admin.
 * @param {Buffer} pdfBuffer - The PDF buffer to attach.
 * @param {Object} report - The report data for email content.
 * @returns {Promise<void>}
 */
async function sendReportEmail(pdfBuffer, report) {
  // Log the report data being sent
  console.log('Preparing to send report email. Report data:', JSON.stringify(report, null, 2));

  // Configure the transporter (use your SMTP credentials or a test account)
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'sajilosahayog@gmail.com',
      pass: process.env.EMAIL_PASS || 'ftsr ixym htyf dtbm',
    },
  });

  const adminEmail = process.env.EMAIL_USER || 'anikesh99996@gmail.com';

  // Build Google Maps link if coordinates are present
  let locationLink = '';
  if (report.latitude && report.longitude) {
    locationLink = `<a href="https://www.google.com/maps?q=${report.latitude},${report.longitude}" target="_blank">${report.latitude}, ${report.longitude}</a>`;
  } else {
    locationLink = 'N/A';
  }

  // Build HTML table for report data
  let imagesHtml = 'None';
  if (report.images && report.images.length > 0) {
    imagesHtml = report.images.map((url, idx) => `<a href="${url}" target="_blank">Image ${idx + 1}</a>`).join('<br/>');
  }
  const htmlTable = `
    <h2>New Disaster Reported</h2>
    <table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;">
      <tr><th align="left">Title</th><td>${report.title || ''}</td></tr>
      <tr><th align="left">Type</th><td>${report.type || ''}</td></tr>
      <tr><th align="left">District</th><td>${report.district || ''}</td></tr>
      <tr><th align="left">Severity</th><td>${report.severity || ''}</td></tr>
      <tr><th align="left">Description</th><td>${report.description || ''}</td></tr>
      <tr><th align="left">Contact Number</th><td>${report.contact_number || report.contactNumber || ''}</td></tr>
      <tr><th align="left">Coordinates</th><td>${locationLink}</td></tr>
      <tr><th align="left">Images</th><td>${imagesHtml}</td></tr>
    </table>
  `;

  const mailOptions = {
    from: `Nepal Disaster Management <${adminEmail}>`,
    to: adminEmail,
    subject: 'New Disaster Reported',
    text: `A new disaster has been reported.\n\nTitle: ${report.title}\nType: ${report.type}\nLocation: ${report.location}\nDistrict: ${report.district}\nSeverity: ${report.severity}\n`,
    html: htmlTable,
  };

  try {
    console.log('Sending email to admin...');
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully to admin.');
  } catch (err) {
    console.error('Error sending report email:', err);
    // Optionally, log the mailOptions for debugging
    console.error('Mail options used:', JSON.stringify(mailOptions, null, 2));
    throw err;
  }
}

module.exports = sendReportEmail; 