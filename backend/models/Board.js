const mongoose = require('mongoose');

const boardSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Board title is required'],
    trim: true,
    maxlength: [100, 'Board title cannot be more than 100 characters']
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot be more than 1000 characters'],
    trim: true
  },
  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  visibility: {
    type: String,
    enum: ['private', 'workspace', 'public'],
    default: 'workspace'
  },
  background: {
    type: {
      type: String,
      enum: ['color', 'image'],
      default: 'color'
    },
    value: {
      type: String,
      default: '#0079bf' // Default Trello blue
    }
  },
  starred: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['admin', 'editor', 'commenter', 'viewer'],
      default: 'editor'
    },
    addedAt: {
      type: Date,
      default: Date.now
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  lists: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'List'
  }],
  labels: [{
    name: {
      type: String,
      trim: true,
      maxlength: [50, 'Label name cannot be more than 50 characters']
    },
    color: {
      type: String,
      enum: ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 'sky', 'lime', 'gray'],
      required: true
    }
  }],
  settings: {
    allowComments: {
      type: Boolean,
      default: true
    },
    allowVoting: {
      type: Boolean,
      default: false
    },
    cardCover: {
      type: Boolean,
      default: true
    },
    permissionLevel: {
      type: String,
      enum: ['org', 'team', 'board'],
      default: 'board'
    }
  },
  closed: {
    type: Boolean,
    default: false
  },
  closedAt: {
    type: Date,
    default: null
  },
  archivedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for better performance
boardSchema.index({ workspace: 1 });
boardSchema.index({ owner: 1 });
boardSchema.index({ 'members.user': 1 });
boardSchema.index({ title: 'text', description: 'text' });
boardSchema.index({ starred: 1 });

// Virtual for member count
boardSchema.virtual('memberCount').get(function() {
  return this.members.length;
});

// Virtual for list count
boardSchema.virtual('listCount').get(function() {
  return this.lists.length;
});

// Virtual to check if board is active
boardSchema.virtual('isActive').get(function() {
  return !this.closed && !this.archivedAt;
});

// Methods
boardSchema.methods.addMember = function(userId, role = 'editor', addedBy = null) {
  // Check if user is already a member
  const existingMember = this.members.find(member => 
    member.user.toString() === userId.toString()
  );
  
  if (existingMember) {
    throw new Error('User is already a member of this board');
  }

  this.members.push({
    user: userId,
    role,
    addedBy
  });

  return this.save();
};

boardSchema.methods.removeMember = function(userId) {
  this.members = this.members.filter(member => 
    member.user.toString() !== userId.toString()
  );
  return this.save();
};

boardSchema.methods.updateMemberRole = function(userId, newRole) {
  const member = this.members.find(member => 
    member.user.toString() === userId.toString()
  );
  
  if (!member) {
    throw new Error('User is not a member of this board');
  }

  member.role = newRole;
  return this.save();
};

boardSchema.methods.getMemberRole = function(userId) {
  // Check if user is owner
  if (this.owner.toString() === userId.toString()) {
    return 'owner';
  }

  // Check if user is member
  const member = this.members.find(member => 
    member.user.toString() === userId.toString()
  );

  return member ? member.role : null;
};

boardSchema.methods.toggleStar = function(userId) {
  const isStarred = this.starred.includes(userId);
  
  if (isStarred) {
    this.starred = this.starred.filter(id => id.toString() !== userId.toString());
  } else {
    this.starred.push(userId);
  }
  
  return this.save();
};

boardSchema.methods.addLabel = function(name, color) {
  // Check if label already exists
  const existingLabel = this.labels.find(label => 
    label.name.toLowerCase() === name.toLowerCase() && label.color === color
  );
  
  if (existingLabel) {
    throw new Error('Label with this name and color already exists');
  }

  this.labels.push({ name, color });
  return this.save();
};

boardSchema.methods.updateLabel = function(labelId, name, color) {
  const label = this.labels.id(labelId);
  if (!label) {
    throw new Error('Label not found');
  }

  if (name !== undefined) label.name = name;
  if (color !== undefined) label.color = color;

  return this.save();
};

boardSchema.methods.removeLabel = function(labelId) {
  this.labels.id(labelId).remove();
  return this.save();
};

boardSchema.methods.canUserView = function(userId) {
  if (this.visibility === 'public') return true;
  if (this.owner.toString() === userId.toString()) return true;
  
  const member = this.members.find(member => 
    member.user.toString() === userId.toString()
  );
  
  return !!member;
};

boardSchema.methods.canUserEdit = function(userId) {
  if (this.owner.toString() === userId.toString()) return true;
  
  const member = this.members.find(member => 
    member.user.toString() === userId.toString()
  );
  
  return member && ['admin', 'editor'].includes(member.role);
};

boardSchema.methods.canUserComment = function(userId) {
  if (!this.settings.allowComments) return false;
  
  if (this.owner.toString() === userId.toString()) return true;
  
  const member = this.members.find(member => 
    member.user.toString() === userId.toString()
  );
  
  return member && ['admin', 'editor', 'commenter'].includes(member.role);
};

// Static methods
boardSchema.statics.findUserBoards = function(userId) {
  return this.find({
    $or: [
      { owner: userId },
      { 'members.user': userId }
    ],
    closed: false,
    archivedAt: null
  }).populate('workspace', 'name')
    .populate('owner', 'name email avatar')
    .populate('members.user', 'name email avatar')
    .select('-lists');
};

boardSchema.statics.findStarredBoards = function(userId) {
  return this.find({
    starred: userId,
    closed: false,
    archivedAt: null
  }).populate('workspace', 'name')
    .populate('owner', 'name email avatar')
    .select('-lists -members');
};

module.exports = mongoose.model('Board', boardSchema);