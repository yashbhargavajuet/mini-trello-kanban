const mongoose = require('mongoose');

const listSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'List title is required'],
    trim: true,
    maxlength: [100, 'List title cannot be more than 100 characters']
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
  cards: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Card'
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
listSchema.index({ board: 1, position: 1 });
listSchema.index({ board: 1, archived: 1 });

// Virtual for card count
listSchema.virtual('cardCount').get(function() {
  return this.cards.length;
});

// Pre-save middleware to handle position
listSchema.pre('save', async function(next) {
  if (this.isNew && this.position === 0) {
    try {
      const lastList = await this.constructor
        .findOne({ board: this.board, archived: false })
        .sort({ position: -1 });
      
      this.position = lastList ? lastList.position + 1024 : 1024;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Methods
listSchema.methods.addCard = function(cardId) {
  if (!this.cards.includes(cardId)) {
    this.cards.push(cardId);
    return this.save();
  }
  return Promise.resolve(this);
};

listSchema.methods.removeCard = function(cardId) {
  this.cards = this.cards.filter(id => id.toString() !== cardId.toString());
  return this.save();
};

listSchema.methods.moveCard = function(cardId, newPosition) {
  const cardIndex = this.cards.findIndex(id => id.toString() === cardId.toString());
  
  if (cardIndex === -1) {
    throw new Error('Card not found in this list');
  }

  // Remove card from current position
  this.cards.splice(cardIndex, 1);
  
  // Insert at new position
  this.cards.splice(newPosition, 0, cardId);
  
  return this.save();
};

listSchema.methods.archive = function() {
  this.archived = true;
  this.archivedAt = new Date();
  return this.save();
};

listSchema.methods.restore = function() {
  this.archived = false;
  this.archivedAt = null;
  return this.save();
};

// Static methods
listSchema.statics.findByBoard = function(boardId, includeArchived = false) {
  const query = { board: boardId };
  if (!includeArchived) {
    query.archived = false;
  }
  
  return this.find(query)
    .populate({
      path: 'cards',
      match: { archived: false },
      options: { sort: { position: 1 } },
      populate: {
        path: 'assignees labels',
        select: 'name avatar color'
      }
    })
    .sort({ position: 1 });
};

listSchema.statics.reorderLists = async function(boardId, listPositions) {
  const operations = listPositions.map(({ listId, position }) => ({
    updateOne: {
      filter: { _id: listId, board: boardId },
      update: { position }
    }
  }));
  
  return this.bulkWrite(operations);
};

listSchema.statics.getNextPosition = async function(boardId) {
  const lastList = await this.findOne({ 
    board: boardId, 
    archived: false 
  }).sort({ position: -1 });
  
  return lastList ? lastList.position + 1024 : 1024;
};

// Calculate position between two positions (for drag and drop)
listSchema.statics.calculatePosition = function(prevPosition, nextPosition) {
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

module.exports = mongoose.model('List', listSchema);