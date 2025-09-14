const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Card title is required'],
    trim: true,
    maxlength: [500, 'Card title cannot be more than 500 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [10000, 'Description cannot be more than 10000 characters']
  },
  list: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'List',
    required: true
  },
  board: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Board',
    required: true
  },
  position: {
    type: Number,
    required: true,
    default: 0
  },
  assignees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  labels: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Label'
  }],
  dueDate: {
    type: Date,
    default: null
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date,
    default: null
  },
  cover: {
    type: {
      type: String,
      enum: ['color', 'image', 'attachment'],
      default: null
    },
    value: {
      type: String,
      default: null
    }
  },
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
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  checklists: [{
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [200, 'Checklist title cannot be more than 200 characters']
    },
    items: [{
      text: {
        type: String,
        required: true,
        trim: true,
        maxlength: [500, 'Checklist item cannot be more than 500 characters']
      },
      completed: {
        type: Boolean,
        default: false
      },
      completedAt: {
        type: Date,
        default: null
      },
      assignee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }]
  }],
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  watchers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  archived: {
    type: Boolean,
    default: false
  },
  archivedAt: {
    type: Date,
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes for better performance
cardSchema.index({ list: 1, position: 1 });
cardSchema.index({ board: 1, archived: 1 });
cardSchema.index({ assignees: 1 });
cardSchema.index({ dueDate: 1 });
cardSchema.index({ title: 'text', description: 'text' });
cardSchema.index({ createdAt: -1 });

// Virtual for comment count
cardSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

// Virtual for attachment count
cardSchema.virtual('attachmentCount').get(function() {
  return this.attachments.length;
});

// Virtual for checklist progress
cardSchema.virtual('checklistProgress').get(function() {
  let totalItems = 0;
  let completedItems = 0;

  this.checklists.forEach(checklist => {
    totalItems += checklist.items.length;
    completedItems += checklist.items.filter(item => item.completed).length;
  });

  return {
    total: totalItems,
    completed: completedItems,
    percentage: totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0
  };
});

// Virtual to check if card is overdue
cardSchema.virtual('isOverdue').get(function() {
  return this.dueDate && !this.completed && new Date() > this.dueDate;
});

// Virtual to check if card is due soon (within 24 hours)
cardSchema.virtual('isDueSoon').get(function() {
  if (!this.dueDate || this.completed) return false;
  const now = new Date();
  const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  return this.dueDate <= twentyFourHoursFromNow && this.dueDate > now;
});

// Pre-save middleware to handle position
cardSchema.pre('save', async function(next) {
  if (this.isNew && this.position === 0) {
    try {
      const lastCard = await this.constructor
        .findOne({ list: this.list, archived: false })
        .sort({ position: -1 });
      
      this.position = lastCard ? lastCard.position + 1024 : 1024;
    } catch (error) {
      return next(error);
    }
  }

  // Set completedAt when card is marked as completed
  if (this.isModified('completed')) {
    this.completedAt = this.completed ? new Date() : null;
  }

  next();
});

// Methods
cardSchema.methods.addAssignee = function(userId) {
  if (!this.assignees.includes(userId)) {
    this.assignees.push(userId);
    return this.save();
  }
  return Promise.resolve(this);
};

cardSchema.methods.removeAssignee = function(userId) {
  this.assignees = this.assignees.filter(id => id.toString() !== userId.toString());
  return this.save();
};

cardSchema.methods.addLabel = function(labelId) {
  if (!this.labels.includes(labelId)) {
    this.labels.push(labelId);
    return this.save();
  }
  return Promise.resolve(this);
};

cardSchema.methods.removeLabel = function(labelId) {
  this.labels = this.labels.filter(id => id.toString() !== labelId.toString());
  return this.save();
};

cardSchema.methods.addWatcher = function(userId) {
  if (!this.watchers.includes(userId)) {
    this.watchers.push(userId);
    return this.save();
  }
  return Promise.resolve(this);
};

cardSchema.methods.removeWatcher = function(userId) {
  this.watchers = this.watchers.filter(id => id.toString() !== userId.toString());
  return this.save();
};

cardSchema.methods.addAttachment = function(attachmentData) {
  this.attachments.push(attachmentData);
  return this.save();
};

cardSchema.methods.removeAttachment = function(attachmentId) {
  this.attachments.id(attachmentId).remove();
  return this.save();
};

cardSchema.methods.addChecklist = function(title) {
  this.checklists.push({ title, items: [] });
  return this.save();
};

cardSchema.methods.removeChecklist = function(checklistId) {
  this.checklists.id(checklistId).remove();
  return this.save();
};

cardSchema.methods.addChecklistItem = function(checklistId, text, assignee = null) {
  const checklist = this.checklists.id(checklistId);
  if (!checklist) {
    throw new Error('Checklist not found');
  }

  checklist.items.push({ text, assignee });
  return this.save();
};

cardSchema.methods.updateChecklistItem = function(checklistId, itemId, updates) {
  const checklist = this.checklists.id(checklistId);
  if (!checklist) {
    throw new Error('Checklist not found');
  }

  const item = checklist.items.id(itemId);
  if (!item) {
    throw new Error('Checklist item not found');
  }

  Object.assign(item, updates);
  
  // Set completedAt when item is marked as completed
  if (updates.completed !== undefined) {
    item.completedAt = updates.completed ? new Date() : null;
  }

  return this.save();
};

cardSchema.methods.removeChecklistItem = function(checklistId, itemId) {
  const checklist = this.checklists.id(checklistId);
  if (!checklist) {
    throw new Error('Checklist not found');
  }

  checklist.items.id(itemId).remove();
  return this.save();
};

cardSchema.methods.archive = function() {
  this.archived = true;
  this.archivedAt = new Date();
  return this.save();
};

cardSchema.methods.restore = function() {
  this.archived = false;
  this.archivedAt = null;
  return this.save();
};

// Static methods
cardSchema.statics.findByBoard = function(boardId, filters = {}) {
  const query = { board: boardId, archived: false };

  if (filters.assignee) {
    query.assignees = filters.assignee;
  }

  if (filters.labels && filters.labels.length > 0) {
    query.labels = { $in: filters.labels };
  }

  if (filters.dueDate) {
    const now = new Date();
    switch (filters.dueDate) {
      case 'overdue':
        query.dueDate = { $lt: now };
        query.completed = false;
        break;
      case 'due-soon':
        const twentyFourHours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        query.dueDate = { $gte: now, $lte: twentyFourHours };
        query.completed = false;
        break;
      case 'no-due-date':
        query.dueDate = null;
        break;
    }
  }

  if (filters.search) {
    query.$text = { $search: filters.search };
  }

  return this.find(query)
    .populate('assignees', 'name avatar')
    .populate('labels', 'name color')
    .populate('createdBy', 'name avatar')
    .sort({ position: 1 });
};

cardSchema.statics.reorderCards = async function(listId, cardPositions) {
  const operations = cardPositions.map(({ cardId, position }) => ({
    updateOne: {
      filter: { _id: cardId, list: listId },
      update: { position }
    }
  }));
  
  return this.bulkWrite(operations);
};

cardSchema.statics.getNextPosition = async function(listId) {
  const lastCard = await this.findOne({ 
    list: listId, 
    archived: false 
  }).sort({ position: -1 });
  
  return lastCard ? lastCard.position + 1024 : 1024;
};

// Calculate position between two positions (for drag and drop)
cardSchema.statics.calculatePosition = function(prevPosition, nextPosition) {
  if (!prevPosition && !nextPosition) {
    return 1024;
  }
  
  if (!prevPosition) {
    return nextPosition / 2;
  }
  
  if (!nextPosition) {
    return prevPosition + 1024;
  }
  
  return (prevPosition + nextPosition) / 2;
};

module.exports = mongoose.model('Card', cardSchema);