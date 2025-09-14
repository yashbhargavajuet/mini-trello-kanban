const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: [
      // Card activities
      'card_created', 'card_updated', 'card_moved', 'card_archived', 'card_restored',
      'card_completed', 'card_uncompleted', 'card_due_date_added', 'card_due_date_changed',
      'card_due_date_removed', 'card_assigned', 'card_unassigned', 'card_labeled',
      'card_unlabeled', 'card_attachment_added', 'card_attachment_removed',
      'card_checklist_added', 'card_checklist_removed', 'card_checklist_item_added',
      'card_checklist_item_completed', 'card_checklist_item_uncompleted',
      
      // List activities
      'list_created', 'list_updated', 'list_moved', 'list_archived', 'list_restored',
      
      // Board activities
      'board_created', 'board_updated', 'board_closed', 'board_reopened',
      'board_starred', 'board_unstarred', 'board_member_added', 'board_member_removed',
      'board_member_role_changed', 'board_label_created', 'board_label_updated',
      'board_label_deleted',
      
      // Comment activities
      'comment_added', 'comment_updated', 'comment_deleted',
      
      // Workspace activities
      'workspace_created', 'workspace_updated', 'workspace_member_added',
      'workspace_member_removed', 'workspace_member_role_changed'
    ]
  },
  actor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    required: true
  },
  board: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Board',
    required: true
  },
  list: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'List',
    default: null
  },
  card: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Card',
    default: null
  },
  comment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  },
  targetUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  data: {
    // Flexible field to store activity-specific data
    // Examples:
    // - For card_moved: { from: { list: 'listId', position: 1 }, to: { list: 'listId', position: 3 } }
    // - For card_labeled: { labelId: 'labelId', labelName: 'Bug', labelColor: 'red' }
    // - For card_assigned: { userId: 'userId', userName: 'John Doe' }
    // - For board_member_role_changed: { oldRole: 'member', newRole: 'admin' }
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  metadata: {
    // Additional context information
    ipAddress: String,
    userAgent: String,
    source: {
      type: String,
      enum: ['web', 'mobile', 'api', 'webhook'],
      default: 'web'
    }
  }
}, {
  timestamps: true
});

// Indexes for better performance
activitySchema.index({ board: 1, createdAt: -1 });
activitySchema.index({ workspace: 1, createdAt: -1 });
activitySchema.index({ actor: 1, createdAt: -1 });
activitySchema.index({ card: 1, createdAt: -1 });
activitySchema.index({ list: 1, createdAt: -1 });
activitySchema.index({ type: 1, createdAt: -1 });
activitySchema.index({ targetUser: 1, createdAt: -1 });

// Virtual for human-readable activity description
activitySchema.virtual('description').get(function() {
  // This would generate human-readable descriptions based on activity type and data
  // For example: "John moved 'Fix bug' from To Do to In Progress"
  return this.generateDescription();
});

// Methods
activitySchema.methods.generateDescription = function() {
  const actorName = this.actor?.name || 'Someone';
  
  switch (this.type) {
    case 'card_created':
      return `${actorName} created card "${this.data.cardTitle}"`;
      
    case 'card_moved':
      const fromList = this.data.from?.listTitle || 'unknown list';
      const toList = this.data.to?.listTitle || 'unknown list';
      return `${actorName} moved "${this.data.cardTitle}" from ${fromList} to ${toList}`;
      
    case 'card_assigned':
      const assigneeName = this.data.userName || 'unknown user';
      return `${actorName} assigned "${this.data.cardTitle}" to ${assigneeName}`;
      
    case 'card_labeled':
      const labelName = this.data.labelName || 'unknown label';
      return `${actorName} added ${labelName} label to "${this.data.cardTitle}"`;
      
    case 'comment_added':
      return `${actorName} commented on "${this.data.cardTitle}"`;
      
    case 'list_created':
      return `${actorName} created list "${this.data.listTitle}"`;
      
    case 'board_member_added':
      const memberName = this.data.memberName || 'unknown user';
      return `${actorName} added ${memberName} to the board`;
      
    case 'board_created':
      return `${actorName} created this board`;
      
    case 'card_due_date_added':
      const dueDate = new Date(this.data.dueDate).toLocaleDateString();
      return `${actorName} set due date of "${this.data.cardTitle}" to ${dueDate}`;
      
    case 'card_completed':
      return `${actorName} marked "${this.data.cardTitle}" as complete`;
      
    case 'card_archived':
      return `${actorName} archived "${this.data.cardTitle}"`;
      
    case 'list_moved':
      return `${actorName} moved list "${this.data.listTitle}"`;
      
    case 'board_starred':
      return `${actorName} starred this board`;
      
    case 'card_checklist_added':
      return `${actorName} added checklist "${this.data.checklistTitle}" to "${this.data.cardTitle}"`;
      
    case 'card_attachment_added':
      return `${actorName} attached ${this.data.attachmentName} to "${this.data.cardTitle}"`;
      
    default:
      return `${actorName} performed ${this.type.replace(/_/g, ' ')}`;
  }
};

// Static methods
activitySchema.statics.createActivity = async function(activityData) {
  // Helper method to create activities with proper data structure
  const activity = new this(activityData);
  return await activity.save();
};

activitySchema.statics.findByBoard = function(boardId, limit = 50, skip = 0) {
  return this.find({ board: boardId })
    .populate('actor', 'name avatar')
    .populate('targetUser', 'name avatar')
    .populate('card', 'title')
    .populate('list', 'title')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

activitySchema.statics.findByWorkspace = function(workspaceId, limit = 50, skip = 0) {
  return this.find({ workspace: workspaceId })
    .populate('actor', 'name avatar')
    .populate('targetUser', 'name avatar')
    .populate('board', 'title')
    .populate('card', 'title')
    .populate('list', 'title')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

activitySchema.statics.findByUser = function(userId, limit = 50, skip = 0) {
  return this.find({ actor: userId })
    .populate('board', 'title')
    .populate('workspace', 'name')
    .populate('card', 'title')
    .populate('list', 'title')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

activitySchema.statics.findByCard = function(cardId, limit = 20) {
  return this.find({ card: cardId })
    .populate('actor', 'name avatar')
    .populate('targetUser', 'name avatar')
    .sort({ createdAt: -1 })
    .limit(limit);
};

activitySchema.statics.findRecentByType = function(boardId, types, limit = 10) {
  return this.find({ 
    board: boardId, 
    type: { $in: types } 
  })
    .populate('actor', 'name avatar')
    .populate('card', 'title')
    .populate('list', 'title')
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static helper methods for common activity creation
activitySchema.statics.logCardActivity = async function(type, actorId, card, data = {}) {
  return this.createActivity({
    type,
    actor: actorId,
    workspace: card.workspace || data.workspace,
    board: card.board,
    list: card.list,
    card: card._id,
    data: {
      cardTitle: card.title,
      ...data
    }
  });
};

activitySchema.statics.logListActivity = async function(type, actorId, list, data = {}) {
  return this.createActivity({
    type,
    actor: actorId,
    workspace: data.workspace,
    board: list.board,
    list: list._id,
    data: {
      listTitle: list.title,
      ...data
    }
  });
};

activitySchema.statics.logBoardActivity = async function(type, actorId, board, data = {}) {
  return this.createActivity({
    type,
    actor: actorId,
    workspace: board.workspace,
    board: board._id,
    data: {
      boardTitle: board.title,
      ...data
    }
  });
};

activitySchema.statics.logCommentActivity = async function(type, actorId, comment, data = {}) {
  return this.createActivity({
    type,
    actor: actorId,
    workspace: data.workspace,
    board: comment.board,
    card: comment.card,
    comment: comment._id,
    data: {
      cardTitle: data.cardTitle,
      commentText: comment.text.substring(0, 100) + (comment.text.length > 100 ? '...' : ''),
      ...data
    }
  });
};

module.exports = mongoose.model('Activity', activitySchema);