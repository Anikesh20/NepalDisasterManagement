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

module.exports = router; 