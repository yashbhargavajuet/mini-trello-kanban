const jwt = require('jsonwebtoken');
const User = require('../models/User');

const socketHandler = (io) => {
  // Middleware for socket authentication
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`👤 User ${socket.user.name} connected: ${socket.id}`);

    // Join user to their personal room
    socket.join(socket.userId);

    // Handle joining board rooms
    socket.on('join-board', (boardId) => {
      socket.join(`board-${boardId}`);
      console.log(`🏠 User ${socket.user.name} joined board ${boardId}`);
      
      // Notify others in the board about user presence
      socket.to(`board-${boardId}`).emit('user-joined', {
        userId: socket.userId,
        userName: socket.user.name,
        userAvatar: socket.user.avatar
      });
    });

    // Handle leaving board rooms
    socket.on('leave-board', (boardId) => {
      socket.leave(`board-${boardId}`);
      console.log(`🚪 User ${socket.user.name} left board ${boardId}`);
      
      // Notify others in the board about user leaving
      socket.to(`board-${boardId}`).emit('user-left', {
        userId: socket.userId,
        userName: socket.user.name
      });
    });

    // Handle card movements
    socket.on('card-moved', (data) => {
      socket.to(`board-${data.boardId}`).emit('card-moved', {
        ...data,
        movedBy: {
          id: socket.userId,
          name: socket.user.name,
          avatar: socket.user.avatar
        }
      });
    });

    // Handle card updates
    socket.on('card-updated', (data) => {
      socket.to(`board-${data.boardId}`).emit('card-updated', {
        ...data,
        updatedBy: {
          id: socket.userId,
          name: socket.user.name,
          avatar: socket.user.avatar
        }
      });
    });

    // Handle new comments
    socket.on('comment-added', (data) => {
      socket.to(`board-${data.boardId}`).emit('comment-added', {
        ...data,
        author: {
          id: socket.userId,
          name: socket.user.name,
          avatar: socket.user.avatar
        }
      });
    });

    // Handle typing indicators for comments
    socket.on('typing-comment', (data) => {
      socket.to(`board-${data.boardId}`).emit('user-typing-comment', {
        cardId: data.cardId,
        user: {
          id: socket.userId,
          name: socket.user.name
        }
      });
    });

    socket.on('stop-typing-comment', (data) => {
      socket.to(`board-${data.boardId}`).emit('user-stop-typing-comment', {
        cardId: data.cardId,
        userId: socket.userId
      });
    });

    // Handle cursor movements (bonus feature)
    socket.on('cursor-move', (data) => {
      socket.to(`board-${data.boardId}`).emit('cursor-move', {
        ...data,
        user: {
          id: socket.userId,
          name: socket.user.name,
          avatar: socket.user.avatar
        }
      });
    });

    // Handle list updates
    socket.on('list-updated', (data) => {
      socket.to(`board-${data.boardId}`).emit('list-updated', {
        ...data,
        updatedBy: {
          id: socket.userId,
          name: socket.user.name
        }
      });
    });

    // Handle board updates
    socket.on('board-updated', (data) => {
      socket.to(`board-${data.boardId}`).emit('board-updated', {
        ...data,
        updatedBy: {
          id: socket.userId,
          name: socket.user.name
        }
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`👋 User ${socket.user.name} disconnected: ${socket.id}`);
      
      // Notify all boards this user was in about their disconnection
      // This could be optimized by tracking which boards the user was in
      socket.broadcast.emit('user-disconnected', {
        userId: socket.userId,
        userName: socket.user.name
      });
    });

    // Error handling
    socket.on('error', (error) => {
      console.error(`Socket error for user ${socket.user.name}:`, error);
    });
  });
};

module.exports = socketHandler;