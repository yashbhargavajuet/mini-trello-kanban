const express = require('express');
const router = express.Router();
const List = require('../models/List');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, async (req, res) => {
  try {
    res.json({ lists: [] });
  } catch (error) {
    console.error('Get lists error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;