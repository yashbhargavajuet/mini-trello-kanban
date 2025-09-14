const express = require('express');
const router = express.Router();
const Board = require('../models/Board');
const { authenticate } = require('../middleware/auth');
const { validateBoardCreation } = require('../middleware/validation');

// Get user's boards
router.get('/', authenticate, async (req, res) => {
  try {
    const boards = await Board.findUserBoards(req.user._id);
    res.json({ boards });
  } catch (error) {
    console.error('Get boards error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create board
router.post('/', authenticate, validateBoardCreation, async (req, res) => {
  try {
    const board = new Board({
      ...req.body,
      owner: req.user._id
    });
    
    await board.save();
    
    res.status(201).json({
      message: 'Board created successfully',
      board
    });
  } catch (error) {
    console.error('Create board error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;