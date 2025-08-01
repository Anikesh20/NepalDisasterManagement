const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const db = require('../db');
const { fetchBipadDisasterReports } = require('../scripts/sendDisasterPushNotifications');
const createVolunteerCertificate = require('../scripts/createVolunteerCertificate');
const sendVolunteerCertificateEmail = require('../scripts/sendVolunteerCertificateEmail');
const User = require('../models/user');

// Get admin dashboard statistics
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
    try {
        console.log('[Admin Route] Getting admin stats, admin ID:', req.user.userId);
        
        // Get total users
        const usersResult = await db.query('SELECT COUNT(*) as count FROM users');
        const totalUsers = parseInt(usersResult.rows[0].count);

        // Get total volunteers
        const volunteersResult = await db.query('SELECT COUNT(*) as count FROM users WHERE is_volunteer = true');
        const totalVolunteers = parseInt(volunteersResult.rows[0].count);

        // Get disaster statistics
        const disastersResult = await db.query(`
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN status = 'active' THEN 1 END) as active
            FROM disaster_reports
        `);
        const totalDisasters = parseInt(disastersResult.rows[0].total);
        const activeDisasters = parseInt(disastersResult.rows[0].active);

        // Get report statistics
        const reportsResult = await db.query(`
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending
            FROM disaster_reports
        `);
        const totalReports = parseInt(reportsResult.rows[0].total);
        const pendingReports = parseInt(reportsResult.rows[0].pending);

        // Get donation statistics
        const donationsResult = await db.query(`
            SELECT 
                COUNT(*) as total,
                COALESCE(SUM(amount), 0) as total_amount
            FROM payments
        `);
        const totalDonations = parseInt(donationsResult.rows[0].total);
        const totalDonationAmount = parseFloat(donationsResult.rows[0].total_amount);

        console.log('[Admin Route] Stats calculated:', {
            totalUsers,
            totalVolunteers,
            totalDisasters,
            activeDisasters,
            totalReports,
            pendingReports,
            totalDonations,
            totalDonationAmount
        });

        res.json({
            totalUsers,
            totalVolunteers,
            totalDisasters,
            activeDisasters,
            totalReports,
            pendingReports,
            totalDonations,
            totalDonationAmount
        });
    } catch (error) {
        console.error('[Admin Route] Error fetching admin stats:', error);
        console.error('[Admin Route] Error details:', {
            message: error.message,
            stack: error.stack
        });
        res.status(500).json({ 
            error: 'Internal server error',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// List all pending volunteers
router.get('/volunteers/pending', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const result = await db.query(`
            SELECT v.*, u.full_name, u.email, u.username
            FROM volunteers v
            JOIN users u ON v.user_id = u.id
            WHERE v.status = 'pending'
            ORDER BY v.created_at ASC
        `);
        res.json({ volunteers: result.rows });
    } catch (error) {
        console.error('Error fetching pending volunteers:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Verify (approve) a volunteer
router.patch('/volunteers/:id/verify', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query(
            `UPDATE volunteers SET status = 'active' WHERE id = $1 RETURNING *`,
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Volunteer not found' });
        }
        res.json({ volunteer: result.rows[0] });
    } catch (error) {
        console.error('Error verifying volunteer:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Reject a volunteer
router.patch('/volunteers/:id/reject', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query(
            `UPDATE volunteers SET status = 'inactive' WHERE id = $1 RETURNING *`,
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Volunteer not found' });
        }
        res.json({ volunteer: result.rows[0] });
    } catch (error) {
        console.error('Error rejecting volunteer:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// List all volunteers (for admin dashboard)
router.get('/volunteers', authenticateToken, requireAdmin, async (req, res) => {
  console.log('GET /api/admin/volunteers called');
  try {
    const result = await db.query(`
      SELECT v.*, u.full_name, u.email, u.username
      FROM volunteers v
      JOIN users u ON v.user_id = u.id
      ORDER BY v.created_at ASC
    `);
    console.log('Fetched volunteers:', result.rows.length);
    res.json({ volunteers: result.rows });
  } catch (error) {
    console.error('Error fetching volunteers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Send volunteer certificate
router.post('/volunteers/:id/send-certificate', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    // Find volunteer and user info
    const volunteerResult = await db.query('SELECT * FROM volunteers WHERE id = $1', [id]);
    if (volunteerResult.rows.length === 0) {
      return res.status(404).json({ error: 'Volunteer not found' });
    }
    const volunteer = volunteerResult.rows[0];
    const user = await User.findById(volunteer.user_id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    // Generate certificate
    const pdfBuffer = await createVolunteerCertificate(user.full_name);
    // Send email
    await sendVolunteerCertificateEmail(pdfBuffer, user.full_name, user.email);
    res.json({ success: true, message: 'Certificate sent successfully' });
  } catch (error) {
    console.error('Error sending volunteer certificate:', error);
    res.status(500).json({ error: 'Failed to send certificate', details: error.message });
  }
});

// GET /api/analytics/bipad-reports-per-month
router.get('/analytics/bipad-reports-per-month', async (req, res) => {
  try {
    const reports = await fetchBipadDisasterReports();
    // Aggregate by month
    const counts = {};
    for (const r of reports) {
      const date = new Date(r.startedOn);
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      counts[month] = (counts[month] || 0) + 1;
    }
    const result = Object.entries(counts).map(([month, count]) => ({ month, count }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch BIPAD analytics' });
  }
});

// GET /api/analytics/donations-per-month
router.get('/analytics/donations-per-month', async (req, res) => {
  try {
    const result = await db.query(`SELECT to_char(created_at, 'YYYY-MM') as month, SUM(amount) as total FROM payments GROUP BY month ORDER BY month`);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch donation analytics' });
  }
});

// GET /api/analytics/users-per-month
router.get('/analytics/users-per-month', async (req, res) => {
  try {
    const result = await db.query(`SELECT to_char(created_at, 'YYYY-MM') as month, COUNT(*) as total FROM users GROUP BY month ORDER BY month`);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user analytics' });
  }
});

// GET /api/analytics/reports-per-month
router.get('/analytics/reports-per-month', async (req, res) => {
  try {
    const result = await db.query(`SELECT to_char(created_at, 'YYYY-MM') as month, COUNT(*) as total FROM disaster_reports GROUP BY month ORDER BY month`);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch report analytics' });
  }
});

// GET /api/analytics/bipad-alerts-latest
router.get('/analytics/bipad-alerts-latest', async (req, res) => {
  try {
    const alerts = await fetchBipadDisasterReports();
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch latest BIPAD alerts' });
  }
});

// POST /api/admin/send-alert
router.post('/send-alert', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { fetchBipadDisasterReports, getAllExpoPushTokens, sendPushNotification } = require('../scripts/sendDisasterPushNotifications');
    console.log('[Send Alert] Fetching BIPAD alerts...');
    const alerts = await fetchBipadDisasterReports();
    console.log(`[Send Alert] Number of alerts fetched: ${alerts.length}`);
    if (!alerts.length) {
      console.error('[Send Alert] No alerts available');
      return res.status(404).json({ error: 'No alerts available' });
    }
    const latest = alerts[0];
    console.log('[Send Alert] Latest alert:', latest);
    const users = await getAllExpoPushTokens();
    console.log(`[Send Alert] Number of users with push tokens: ${users.length}`);
    let sent = 0;
    for (const user of users) {
      try {
        await sendPushNotification(user.expo_push_token, latest.title, { alert: latest });
        sent++;
      } catch (err) {
        console.error(`[Send Alert] Failed to send to token ${user.expo_push_token}:`, err);
      }
    }
    console.log(`[Send Alert] Total notifications sent: ${sent}`);
    res.json({ success: true, sent, alert: latest });
  } catch (err) {
    console.error('[Send Alert] Error:', err);
    res.status(500).json({ error: 'Failed to send alert', details: err.message });
  }
});

module.exports = router; 