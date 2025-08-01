const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const db = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const createReportPDF = require('../scripts/createReportPDF');
const sendReportEmail = require('../scripts/sendReportEmail');
const fetch = require('node-fetch'); 

// Configure multer for image upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/reports';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'report-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, PNG and JPG are allowed.'));
        }
    }
});

// Submit a new disaster report
router.post('/', authenticateToken, upload.array('images', 5), async (req, res) => {
    let client;
    try {
        console.log('Starting report submission...');
        client = await db.getClient();
        console.log('Got database client');

        await client.query('BEGIN');
        console.log('Started transaction');

        const {
            type,
            title,
            location,
            district,
            description,
            severity,
            contactNumber,
            latitude,
            longitude
        } = req.body;

        // Validate required fields (removed location since it's no longer in the form)
        if (!type || !title || !district || !description || !severity) {
            throw new Error('Missing required fields');
        }

        // Get image URLs if any images were uploaded
        const imageUrls = req.files ? req.files.map(file => `/uploads/reports/${file.filename}`) : [];
        console.log('Processed images:', imageUrls);

        // Insert the report
        const result = await client.query(
            `INSERT INTO disaster_reports (
                type, title, location, district, description, severity,
                reported_by, contact_number, images, latitude, longitude
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING *`,
            [
                type,
                title,
                location,
                district,
                description,
                severity,
                req.user.userId,
                contactNumber,
                imageUrls,
                latitude,
                longitude
            ]
        );
        console.log('Report inserted successfully');

        // Generate PDF and send email to admin
        try {
            const reportData = result.rows[0];
            // Send push notification to the reporting user
            const userResult = await db.query('SELECT expo_push_token FROM users WHERE id = $1', [req.user.userId]);
            const expoPushToken = userResult.rows[0]?.expo_push_token;
            if (expoPushToken) {
                await fetch('https://exp.host/--/api/v2/push/send', {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Accept-encoding': 'gzip, deflate',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        to: expoPushToken,
                        sound: 'default',
                        title: 'Disaster Reported',
                        body: 'Help is on the way please stay calm till rescue arrives',
                        data: { reportId: reportData.id },
                    }),
                });
            }
            // Existing email logic
            const pdfBuffer = await createReportPDF(reportData);
            await sendReportEmail(pdfBuffer, reportData);
            console.log('Admin notified with PDF report');
        } catch (emailErr) {
            console.error('Failed to send admin email or push notification:', emailErr);
        }

        await client.query('COMMIT');
        console.log('Transaction committed');

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error in report submission:', error);
        
        if (client) {
            try {
                await client.query('ROLLBACK');
                console.log('Transaction rolled back');
            } catch (rollbackError) {
                console.error('Error rolling back transaction:', rollbackError);
            }
        }

        // Handle specific error types
        if (error.message === 'Missing required fields') {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        if (error.code === '23505') { // Unique violation
            return res.status(400).json({ error: 'A report with this information already exists' });
        }

        if (error.code === '23503') { // Foreign key violation
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        res.status(500).json({ 
            error: 'Failed to submit report',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        if (client) {
            client.release();
            console.log('Database client released');
        }
    }
});

// Get all reports (admin only)
router.get('/admin', authenticateToken, async (req, res) => {
    try {
        // Check if user is admin
        const userResult = await db.query(
            'SELECT is_admin FROM users WHERE id = $1',
            [req.user.userId]
        );

        if (!userResult.rows[0] || !userResult.rows[0].is_admin) {
            return res.status(403).json({ error: 'Unauthorized access' });
        }

        const result = await db.query(
            `SELECT r.*, 
                    u.username as reporter_name,
                    v.username as verifier_name
             FROM disaster_reports r
             LEFT JOIN users u ON r.reported_by = u.id
             LEFT JOIN users v ON r.verified_by = v.id
             ORDER BY r.created_at DESC`
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching reports:', error);
        res.status(500).json({ error: 'Failed to fetch reports' });
    }
});

// Get reports for the authenticated user
router.get('/my-reports', authenticateToken, async (req, res) => {
    try {
        const result = await db.query(
            `SELECT r.*, 
                    u.username as reporter_name,
                    v.username as verifier_name
             FROM disaster_reports r
             LEFT JOIN users u ON r.reported_by = u.id
             LEFT JOIN users v ON r.verified_by = v.id
             WHERE r.reported_by = $1
             ORDER BY r.created_at DESC`,
            [req.user.userId]
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching user reports:', error);
        res.status(500).json({ error: 'Failed to fetch reports' });
    }
});

// Update report status (admin only)
router.patch('/:id/status', authenticateToken, async (req, res) => {
    const client = await db.getClient();
    try {
        // Check if user is admin
        const userResult = await client.query(
            'SELECT is_admin FROM users WHERE id = $1',
            [req.user.userId]
        );

        if (!userResult.rows[0] || !userResult.rows[0].is_admin) {
            return res.status(403).json({ error: 'Unauthorized access' });
        }

        const { id } = req.params;
        const { status } = req.body;

        if (!status || !['pending', 'verified', 'rejected'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status value' });
        }

        await client.query('BEGIN');

        // Get the report details first to get the reporter's user ID
        const reportResult = await client.query(
            'SELECT * FROM disaster_reports WHERE id = $1',
            [id]
        );

        if (reportResult.rows.length === 0) {
            throw new Error('Report not found');
        }

        const report = reportResult.rows[0];

        const result = await client.query(
            `UPDATE disaster_reports 
             SET status = $1, 
                 verified_by = $2,
                 verified_at = CURRENT_TIMESTAMP
             WHERE id = $3
             RETURNING *`,
            [status, req.user.userId, id]
        );

        // Send push notification if report is verified
        if (status === 'verified') {
            try {
                // Get the reporter's Expo push token
                const userResult = await client.query(
                    'SELECT expo_push_token FROM users WHERE id = $1',
                    [report.reported_by]
                );
                
                const expoPushToken = userResult.rows[0]?.expo_push_token;
                if (expoPushToken) {
                    await fetch('https://exp.host/--/api/v2/push/send', {
                        method: 'POST',
                        headers: {
                            Accept: 'application/json',
                            'Accept-encoding': 'gzip, deflate',
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            to: expoPushToken,
                            sound: 'default',
                            title: 'Report Verified',
                            body: 'Your report is verified and help is on the way',
                            data: { 
                                reportId: report.id,
                                status: 'verified',
                                type: 'report_verification'
                            },
                        }),
                    });
                    console.log('Push notification sent to user for report verification');
                }
            } catch (notificationError) {
                console.error('Failed to send push notification for report verification:', notificationError);
                // Don't fail the entire request if notification fails
            }
        }

        await client.query('COMMIT');
        res.json(result.rows[0]);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error updating report status:', error);
        
        if (error.message === 'Report not found') {
            return res.status(404).json({ error: 'Report not found' });
        }
        
        res.status(500).json({ error: 'Failed to update report status' });
    } finally {
        client.release();
    }
});

// Get a single report
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await db.query(
            `SELECT r.*, 
                    u.username as reporter_name,
                    v.username as verifier_name
             FROM disaster_reports r
             LEFT JOIN users u ON r.reported_by = u.id
             LEFT JOIN users v ON r.verified_by = v.id
             WHERE r.id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Report not found' });
        }

        // Check if user is admin or the report owner
        if (!req.user.isAdmin && result.rows[0].reported_by !== req.user.userId) {
            return res.status(403).json({ error: 'Unauthorized access' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching report:', error);
        res.status(500).json({ error: 'Failed to fetch report' });
    }
});

// Public: Get all reports (for testing)
router.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM disaster_reports ORDER BY created_at DESC');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching reports:', error);
        res.status(500).json({ error: 'Failed to fetch reports' });
    }
});

module.exports = router; 