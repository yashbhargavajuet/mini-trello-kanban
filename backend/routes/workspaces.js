const express = require('express');
const router = express.Router();
const Workspace = require('../models/Workspace');
const { authenticate } = require('../middleware/auth');
const { validateWorkspaceCreation } = require('../middleware/validation');

// Get user's workspaces
router.get('/', authenticate, async (req, res) => {
  try {
    const workspaces = await Workspace.findUserWorkspaces(req.user._id);
    res.json({ workspaces });
  } catch (error) {
    console.error('Get workspaces error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create workspace
router.post('/', authenticate, validateWorkspaceCreation, async (req, res) => {
  try {
    const workspace = new Workspace({
      ...req.body,
      owner: req.user._id
    });
    
    await workspace.save();
    
    res.status(201).json({
      message: 'Workspace created successfully',
      workspace
    });
  } catch (error) {
    console.error('Create workspace error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;