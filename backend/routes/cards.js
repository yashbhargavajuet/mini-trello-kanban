const express = require('express');
const router = express.Router();
const Card = require('../models/Card');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, async (req, res) => {
  try {
    res.json({ cards: [] });
  } catch (error) {
    console.error('Get cards error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;