const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

async function createPaymentReceiptPDF(payment) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));

    // Subtle background engraving (light watermark text)
    doc.save();
    doc.fontSize(60)
      .fillColor('#f0f1f6')
      .rotate(-30, { origin: [doc.page.width / 2, doc.page.height / 2] })
      .text('Sajilo Sahayog', doc.page.width / 4, doc.page.height / 2, {
        align: 'center',
        opacity: 0.2,
      });
    doc.restore();

    // Border
    doc.save();
    doc.lineWidth(3)
      .rect(20, 20, doc.page.width - 40, doc.page.height - 40)
      .stroke('#1FA2FF');
    doc.restore();

    // Circular logo at the top center
    const logoPath = path.join(__dirname, '../../assets/images/icon.png');
    const logoSize = 80;
    const logoX = doc.page.width / 2 - logoSize / 2;
    const logoY = 40;
    if (fs.existsSync(logoPath)) {
      doc.save();
      doc.circle(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2);
      doc.clip();
      doc.image(logoPath, logoX, logoY, { width: logoSize, height: logoSize });
      doc.restore();
      // Circular border
      doc.save();
      doc.lineWidth(2)
        .strokeColor('#1FA2FF')
        .circle(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2)
        .stroke();
      doc.restore();
    }

    // Title with flourish, centered below logo
    const titleY = logoY + logoSize + 18;
    doc.fontSize(28)
      .fillColor('#1FA2FF')
      .font('Times-Bold')
      .text('Payment Receipt', 0, titleY, { align: 'center', underline: false });
    const centerX = doc.page.width / 2;
    doc.save();
    doc.moveTo(centerX - 60, titleY + 32)
      .bezierCurveTo(centerX - 30, titleY + 22, centerX + 30, titleY + 22, centerX + 60, titleY + 32)
      .stroke('#1FA2FF');
    doc.restore();

    // Transaction details table, centered
    const detailsY = titleY + 60;
    const labelX = doc.page.width / 2 - 120;
    const valueX = doc.page.width / 2 + 10;
    const rowHeight = 28;
    doc.fontSize(16).fillColor('#222f3e').font('Times-Roman');
    const details = [
      ['Transaction ID:', payment.id],
      ['Amount:', `NPR ${payment.amount}`],
      ['Date:', new Date(payment.created_at).toLocaleString()],
      ['Status:', 'Success'],
      ['Paid by User ID:', payment.user_id],
    ];
    details.forEach(([label, value], i) => {
      const y = detailsY + i * rowHeight;
      doc.font('Times-Roman').text(label, labelX, y, { align: 'right', width: 130 });
      doc.font('Times-Bold').text(value, valueX, y, { align: 'left', width: 180 });
    });

    // Engraved line
    doc.save();
    doc.moveTo(doc.page.width / 2 - 120, detailsY + details.length * rowHeight + 10)
      .lineTo(doc.page.width / 2 + 120, detailsY + details.length * rowHeight + 10)
      .dash(4, { space: 4 }).stroke('#b2bec3');
    doc.undash();
    doc.restore();

    // Thank you note, centered
    doc.fontSize(16)
      .fillColor('#636e72')
      .font('Times-Italic')
      .text('Thank you for your generous support!', 0, detailsY + details.length * rowHeight + 30, { align: 'center' });

    // Branding at the bottom, centered
    doc.fontSize(12)
      .fillColor('#1FA2FF')
      .font('Times-Bold')
      .text('Sajilo Sahayog', 0, doc.page.height - 60, { align: 'center' });

    doc.end();
  });
}
module.exports = createPaymentReceiptPDF; 