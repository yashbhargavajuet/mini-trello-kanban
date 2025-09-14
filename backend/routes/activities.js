const express = require('express');
const router = express.Router();
const Activity = require('../models/Activity');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, async (req, res) => {
  try {
    res.json({ activities: [] });
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;