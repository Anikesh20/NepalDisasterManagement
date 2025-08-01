const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generates a PDF buffer for a volunteer certificate.
 * @param {string} fullName - The volunteer's full name.
 * @returns {Promise<Buffer>} - Resolves with the PDF buffer.
 */
async function createVolunteerCertificate(fullName) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 40 });
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      // Background gradient abstract lines
      doc.save();
      // Top left gradient lines
      for (let i = 0; i < 5; i++) {
        const alpha = 0.1 - (i * 0.02);
        doc.strokeColor(`rgba(41, 128, 185, ${alpha})`)
          .lineWidth(2)
          .moveTo(30 + i * 20, 30 + i * 15)
          .lineTo(150 + i * 30, 80 + i * 20)
          .stroke();
      }
      
      // Top right gradient lines
      for (let i = 0; i < 5; i++) {
        const alpha = 0.1 - (i * 0.02);
        doc.strokeColor(`rgba(155, 89, 182, ${alpha})`)
          .lineWidth(2)
          .moveTo(doc.page.width - 30 - i * 20, 30 + i * 15)
          .lineTo(doc.page.width - 150 - i * 30, 80 + i * 20)
          .stroke();
      }
      doc.restore();

      // Border
      doc.save();
      doc.lineWidth(3)
        .rect(20, 20, doc.page.width - 40, doc.page.height - 40)
        .stroke('#2980b9');
      doc.restore();

      // Decorative corners (bottom left and right)
      doc.save();
      doc.moveTo(22, doc.page.height - 22)
        .bezierCurveTo(40, doc.page.height - 40, 80, doc.page.height - 10, 120, doc.page.height - 22)
        .stroke('#b2bec3');
      doc.moveTo(doc.page.width - 22, doc.page.height - 22)
        .bezierCurveTo(doc.page.width - 40, doc.page.height - 40, doc.page.width - 80, doc.page.height - 10, doc.page.width - 120, doc.page.height - 22)
        .stroke('#b2bec3');
      doc.restore();

      // Circular logo with bigger size
      const logoPath = path.join(__dirname, '../../assets/images/icon.png');
      if (fs.existsSync(logoPath)) {
        const logoSize = 120;
        const logoX = doc.page.width / 2 - logoSize / 2;
        const logoY = 25;
        
        // Create circular mask for logo
        doc.save();
        doc.circle(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2);
        doc.clip();
        doc.image(logoPath, logoX, logoY, { width: logoSize, height: logoSize });
        doc.restore();
        
        // Add circular border around logo
        doc.save();
        doc.lineWidth(3)
          .strokeColor('#2980b9')
          .circle(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2)
          .stroke();
        doc.restore();
      }

      // Space below logo
      doc.moveDown(6);

      // Decorative flourish above title
      doc.save();
      const centerX = doc.page.width / 2;
      doc.moveTo(centerX - 60, 170)
        .bezierCurveTo(centerX - 30, 160, centerX + 30, 160, centerX + 60, 170)
        .stroke('#2980b9');
      doc.restore();

      // Title
      doc.fontSize(30)
        .fillColor('#2980b9')
        .font('Times-Bold')
        .text('Certificate of Appreciation', 0, 180, { align: 'center' });

      // Decorative flourish below title
      doc.save();
      doc.moveTo(centerX - 50, 215)
        .bezierCurveTo(centerX - 20, 225, centerX + 20, 225, centerX + 50, 215)
        .stroke('#2980b9');
      doc.restore();

      // Subtitle
      doc.fontSize(16)
        .fillColor('#636e72')
        .font('Times-Roman')
        .text('This certificate is proudly presented to', 0, 230, { align: 'center' });

      // Name
      doc.fontSize(24)
        .fillColor('#222f3e')
        .font('Times-Bold')
        .text(fullName, 0, 260, { align: 'center', underline: true });

      // Body
      doc.fontSize(15)
        .fillColor('#636e72')
        .font('Times-Roman')
        .text(
          'In recognition of your outstanding dedication and service as a verified volunteer. Your commitment and efforts have made a significant impact in disaster management and community support.\n\nThank you for being a true hero!',
          80, 310, { align: 'center', width: doc.page.width - 160, lineGap: 6 }
        );

      // Signature area
      const y = doc.page.height - 140;
      // Draw a wavy line for signature
      doc.save();
      doc.moveTo(60, y + 18);
      for (let i = 0; i < 80; i += 8) {
        doc.bezierCurveTo(60 + i, y + 18, 64 + i, y + 10, 68 + i, y + 18);
      }
      doc.stroke('#b23c17');
      doc.restore();

      // Signature text (script style if possible, else italic)
      doc.font('Times-Italic')
        .fontSize(18)
        .fillColor('#b23c17')
        .text('Sajilo Sahayog', 60, y + 22, { align: 'left' });

      // Admin title
      doc.font('Times-Roman')
        .fontSize(12)
        .fillColor('#636e72')
        .text('Admin, Sajilo Sahayog', 60, y + 40, { align: 'left' });

      // Date
      const dateStr = new Date().toLocaleDateString();
      doc.font('Times-Roman')
        .fontSize(12)
        .fillColor('#636e72')
        .text(`Date: ${dateStr}`, doc.page.width - 200, y + 40, { align: 'left' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = createVolunteerCertificate; 