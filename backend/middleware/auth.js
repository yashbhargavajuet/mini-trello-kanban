const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT token
const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        message: 'Access denied. No token provided.' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user || !user.isActive) {
      return res.status(401).json({ 
        message: 'Access denied. User not found or inactive.' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Access denied. Token expired.' 
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: 'Access denied. Invalid token.' 
      });
    } else {
      console.error('Authentication error:', error);
      return res.status(500).json({ 
        message: 'Internal server error during authentication.' 
      });
    }
  }
};

// Middleware for optional authentication (token not required)
const optionalAuthenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (user && user.isActive) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // For optional auth, we don't return error, just continue without user
    next();
  }
};

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { 
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      issuer: 'mini-trello-api',
      audience: 'mini-trello-client'
    }
  );
};

// Generate refresh token (longer expiry)
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { 
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
      issuer: 'mini-trello-api',
      audience: 'mini-trello-client'
    }
  );
};

// Verify refresh token
const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
};

// Middleware to check if user has required role in workspace
const requireWorkspaceRole = (roles) => {
  return async (req, res, next) => {
    try {
      const { workspaceId } = req.params;
      const userId = req.user._id;

      const Workspace = require('../models/Workspace');
      const workspace = await Workspace.findById(workspaceId);

      if (!workspace) {
        return res.status(404).json({ message: 'Workspace not found' });
      }

      const userRole = workspace.getMemberRole(userId);
      
      if (!userRole || !roles.includes(userRole)) {
        return res.status(403).json({ 
          message: 'Access denied. Insufficient permissions.' 
        });
      }

      req.workspace = workspace;
      req.userRole = userRole;
      next();
    } catch (error) {
      console.error('Workspace role check error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
};

// Middleware to check if user has required role in board
const requireBoardRole = (roles) => {
  return async (req, res, next) => {
    try {
      const { boardId } = req.params;
      const userId = req.user._id;

      const Board = require('../models/Board');
      const board = await Board.findById(boardId);

      if (!board) {
        return res.status(404).json({ message: 'Board not found' });
      }

      const userRole = board.getMemberRole(userId);
      
      if (!userRole || !roles.includes(userRole)) {
        return res.status(403).json({ 
          message: 'Access denied. Insufficient permissions.' 
        });
      }

      req.board = board;
      req.userRole = userRole;
      next();
    } catch (error) {
      console.error('Board role check error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
};

// Middleware to check if user can view board
const canViewBoard = async (req, res, next) => {
  try {
    const { boardId } = req.params;
    const userId = req.user?._id;

    const Board = require('../models/Board');
    const board = await Board.findById(boardId);

    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    if (!board.canUserView(userId)) {
      return res.status(403).json({ 
        message: 'Access denied. You do not have permission to view this board.' 
      });
    }

    req.board = board;
    next();
  } catch (error) {
    console.error('Board view check error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Middleware to check if user can edit board
const canEditBoard = async (req, res, next) => {
  try {
    const { boardId } = req.params;
    const userId = req.user._id;

    const Board = require('../models/Board');
    const board = await Board.findById(boardId);

    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    if (!board.canUserEdit(userId)) {
      return res.status(403).json({ 
        message: 'Access denied. You do not have permission to edit this board.' 
      });
    }

    req.board = board;
    next();
  } catch (error) {
    console.error('Board edit check error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Middleware to check if user can comment on board
const canCommentBoard = async (req, res, next) => {
  try {
    const { boardId } = req.params;
    const userId = req.user._id;

    const Board = require('../models/Board');
    const board = await Board.findById(boardId);

    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    if (!board.canUserComment(userId)) {
      return res.status(403).json({ 
        message: 'Access denied. Comments are not allowed on this board or you do not have permission.' 
      });
    }

    req.board = board;
    next();
  } catch (error) {
    console.error('Board comment check error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  authenticate,
  optionalAuthenticate,
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
  requireWorkspaceRole,
  requireBoardRole,
  canViewBoard,
  canEditBoard,
  canCommentBoard
};