const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const db = require('../db');

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
            FROM disasters
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
                COALESCE(SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END), 0) as total_amount
            FROM donations
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

module.exports = router; 