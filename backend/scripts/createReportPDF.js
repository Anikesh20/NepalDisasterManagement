const PDFDocument = require('pdfkit');
const fs = require('fs');

/**
 * Generates a PDF buffer for a disaster report.
 * @param {Object} report - The report data.
 * @returns {Promise<Buffer>} - Resolves with the PDF buffer.
 */
async function createReportPDF(report) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      doc.fontSize(20).text('Disaster Report', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12);
      doc.text(`Type: ${report.type || ''}`);
      doc.text(`Title: ${report.title || ''}`);
      doc.text(`Location: ${report.location || ''}`);
      doc.text(`District: ${report.district || ''}`);
      doc.text(`Description: ${report.description || ''}`);
      doc.text(`Severity: ${report.severity || ''}`);
      doc.text(`Contact Number: ${report.contact_number || ''}`);
      doc.text(`Reported By (User ID): ${report.reported_by || ''}`);
      doc.text(`Date: ${report.created_at || new Date().toISOString()}`);
      doc.moveDown();
      // Coordinates
      if (report.latitude && report.longitude) {
        const coords = `${report.latitude}, ${report.longitude}`;
        const mapsUrl = `https://www.google.com/maps?q=${report.latitude},${report.longitude}`;
        doc.text('Coordinates: ', { continued: true });
        doc.fillColor('blue').text(coords, {
          link: mapsUrl,
          underline: true
        });
        doc.fillColor('black');
      }
      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = createReportPDF; 