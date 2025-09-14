const mongoose = require('mongoose');

const workspaceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Workspace name is required'],
    trim: true,
    maxlength: [50, 'Workspace name cannot be more than 50 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters'],
    trim: true
  },
  website: {
    type: String,
    validate: {
      validator: function(v) {
        if (!v) return true;
        return /^https?:\/\/.+\..+/.test(v);
      },
      message: 'Please enter a valid URL'
    }
  },
  logo: {
    type: String,
    default: null
  },
  visibility: {
    type: String,
    enum: ['private', 'workspace', 'public'],
    default: 'workspace'
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['admin', 'member', 'viewer'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  boards: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Board'
  }],
  settings: {
    allowMembersToCreateBoards: {
      type: Boolean,
      default: true
    },
    allowMembersToInviteOthers: {
      type: Boolean,
      default: false
    },
    boardCreationRestriction: {
      type: String,
      enum: ['none', 'admin-only', 'members-only'],
      default: 'members-only'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better performance
workspaceSchema.index({ owner: 1 });
workspaceSchema.index({ 'members.user': 1 });
workspaceSchema.index({ name: 'text', description: 'text' });

// Virtual for member count
workspaceSchema.virtual('memberCount').get(function() {
  return this.members.length;
});

// Virtual for board count
workspaceSchema.virtual('boardCount').get(function() {
  return this.boards.length;
});

// Methods
workspaceSchema.methods.addMember = function(userId, role = 'member', invitedBy = null) {
  // Check if user is already a member
  const existingMember = this.members.find(member => 
    member.user.toString() === userId.toString()
  );
  
  if (existingMember) {
    throw new Error('User is already a member of this workspace');
  }

  this.members.push({
    user: userId,
    role,
    invitedBy
  });

  return this.save();
};

workspaceSchema.methods.removeMember = function(userId) {
  this.members = this.members.filter(member => 
    member.user.toString() !== userId.toString()
  );
  return this.save();
};

workspaceSchema.methods.updateMemberRole = function(userId, newRole) {
  const member = this.members.find(member => 
    member.user.toString() === userId.toString()
  );
  
  if (!member) {
    throw new Error('User is not a member of this workspace');
  }

  member.role = newRole;
  return this.save();
};

workspaceSchema.methods.getMemberRole = function(userId) {
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

workspaceSchema.methods.canUserCreateBoard = function(userId) {
  const memberRole = this.getMemberRole(userId);
  
  if (!memberRole) return false;
  if (memberRole === 'owner' || memberRole === 'admin') return true;
  if (this.settings.allowMembersToCreateBoards && memberRole === 'member') return true;
  
  return false;
};

// Static methods
workspaceSchema.statics.findUserWorkspaces = function(userId) {
  return this.find({
    $or: [
      { owner: userId },
      { 'members.user': userId }
    ],
    isActive: true
  }).populate('owner', 'name email avatar')
    .populate('members.user', 'name email avatar')
    .select('-boards');
};

module.exports = mongoose.model('Workspace', workspaceSchema);