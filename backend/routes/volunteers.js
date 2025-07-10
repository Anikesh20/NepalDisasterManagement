const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

// Update volunteer profile for a user
router.put('/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    // Only allow these fields to be updated by the user
    const { skills, availability, profile_image, weekly_availability } = req.body;
    const result = await db.query(
      `UPDATE volunteers SET skills = $1, availability = $2, profile_image = $3, weekly_availability = $4 WHERE user_id = $5 RETURNING *`,
      [skills, availability, profile_image, weekly_availability, userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Volunteer profile not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating volunteer profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 