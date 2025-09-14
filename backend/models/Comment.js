const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, 'Comment text is required'],
    trim: true,
    maxlength: [10000, 'Comment cannot be more than 10000 characters']
  },
  card: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Card',
    required: true
  },
  board: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Board',
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mentions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    position: {
      start: Number,
      end: Number
    }
  }],
  edited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date,
    default: null
  },
  reactions: [{
    emoji: {
      type: String,
      required: true,
      maxlength: 4
    },
    users: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  }],
  attachments: [{
    filename: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    mimetype: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    url: {
      type: String,
      required: true
    }
  }],
  archived: {
    type: Boolean,
    default: false
  },
  archivedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for better performance
commentSchema.index({ card: 1, createdAt: -1 });
commentSchema.index({ board: 1, createdAt: -1 });
commentSchema.index({ author: 1 });
commentSchema.index({ 'mentions.user': 1 });
commentSchema.index({ archived: 1 });

// Virtual for reaction count
commentSchema.virtual('reactionCount').get(function() {
  return this.reactions.reduce((total, reaction) => total + reaction.users.length, 0);
});

// Virtual for attachment count
commentSchema.virtual('attachmentCount').get(function() {
  return this.attachments.length;
});

// Methods
commentSchema.methods.addReaction = function(emoji, userId) {
  const existingReaction = this.reactions.find(reaction => reaction.emoji === emoji);
  
  if (existingReaction) {
    // Check if user already reacted with this emoji
    if (!existingReaction.users.includes(userId)) {
      existingReaction.users.push(userId);
    }
  } else {
    // Create new reaction
    this.reactions.push({
      emoji,
      users: [userId]
    });
  }
  
  return this.save();
};

commentSchema.methods.removeReaction = function(emoji, userId) {
  const reactionIndex = this.reactions.findIndex(reaction => reaction.emoji === emoji);
  
  if (reactionIndex !== -1) {
    const reaction = this.reactions[reactionIndex];
    reaction.users = reaction.users.filter(id => id.toString() !== userId.toString());
    
    // Remove reaction if no users left
    if (reaction.users.length === 0) {
      this.reactions.splice(reactionIndex, 1);
    }
  }
  
  return this.save();
};

commentSchema.methods.updateText = function(newText) {
  this.text = newText;
  this.edited = true;
  this.editedAt = new Date();
  return this.save();
};

commentSchema.methods.addAttachment = function(attachmentData) {
  this.attachments.push(attachmentData);
  return this.save();
};

commentSchema.methods.removeAttachment = function(attachmentId) {
  this.attachments.id(attachmentId).remove();
  return this.save();
};

commentSchema.methods.archive = function() {
  this.archived = true;
  this.archivedAt = new Date();
  return this.save();
};

commentSchema.methods.restore = function() {
  this.archived = false;
  this.archivedAt = null;
  return this.save();
};

// Static methods
commentSchema.statics.findByCard = function(cardId, includeArchived = false) {
  const query = { card: cardId };
  if (!includeArchived) {
    query.archived = false;
  }
  
  return this.find(query)
    .populate('author', 'name avatar')
    .populate('mentions.user', 'name')
    .populate('reactions.users', 'name avatar')
    .sort({ createdAt: 1 });
};

commentSchema.statics.findByBoard = function(boardId, limit = 20) {
  return this.find({ 
    board: boardId, 
    archived: false 
  })
    .populate('author', 'name avatar')
    .populate('card', 'title')
    .sort({ createdAt: -1 })
    .limit(limit);
};

commentSchema.statics.findMentions = function(userId, limit = 20) {
  return this.find({ 
    'mentions.user': userId,
    archived: false 
  })
    .populate('author', 'name avatar')
    .populate('card', 'title')
    .populate('board', 'title')
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Pre-save middleware to extract mentions
commentSchema.pre('save', function(next) {
  if (this.isModified('text')) {
    // Extract @mentions from comment text
    // This is a simple regex pattern - you might want to use a more sophisticated approach
    const mentionRegex = /@([a-zA-Z0-9._-]+)/g;
    const mentions = [];
    let match;
    
    while ((match = mentionRegex.exec(this.text)) !== null) {
      mentions.push({
        username: match[1],
        position: {
          start: match.index,
          end: match.index + match[0].length
        }
      });
    }
    
    // Note: In a real application, you'd want to resolve usernames to user IDs here
    // For now, we'll leave this as a placeholder
  }
  
  next();
});

module.exports = mongoose.model('Comment', commentSchema);