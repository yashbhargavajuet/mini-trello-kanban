const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Workspace = require('../models/Workspace');
const Board = require('../models/Board');
const List = require('../models/List');
const Card = require('../models/Card');
const Activity = require('../models/Activity');

const seedData = async () => {
  try {
    console.log('🌱 Starting database seed...');
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📦 Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Workspace.deleteMany({}),
      Board.deleteMany({}),
      List.deleteMany({}),
      Card.deleteMany({}),
      Activity.deleteMany({})
    ]);
    console.log('🗑️  Cleared existing data');

    // Create sample users
    const users = await User.create([
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123',
        avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=0079bf&color=fff'
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'Password123',
        avatar: 'https://ui-avatars.com/api/?name=Jane+Smith&background=d63384&color=fff'
      },
      {
        name: 'Bob Wilson',
        email: 'bob@example.com',
        password: 'Password123',
        avatar: 'https://ui-avatars.com/api/?name=Bob+Wilson&background=198754&color=fff'
      }
    ]);
    console.log('👥 Created sample users');

    // Create sample workspace
    const workspace = await Workspace.create({
      name: 'Acme Corporation',
      description: 'Main workspace for Acme Corp projects',
      owner: users[0]._id,
      members: [
        {
          user: users[1]._id,
          role: 'admin',
          invitedBy: users[0]._id
        },
        {
          user: users[2]._id,
          role: 'member',
          invitedBy: users[0]._id
        }
      ]
    });
    console.log('🏢 Created sample workspace');

    // Create sample board
    const board = await Board.create({
      title: 'Project Alpha',
      description: 'Main project board for tracking tasks',
      workspace: workspace._id,
      owner: users[0]._id,
      members: [
        {
          user: users[1]._id,
          role: 'admin',
          addedBy: users[0]._id
        },
        {
          user: users[2]._id,
          role: 'editor',
          addedBy: users[0]._id
        }
      ],
      labels: [
        { name: 'Bug', color: 'red' },
        { name: 'Feature', color: 'blue' },
        { name: 'Enhancement', color: 'green' },
        { name: 'Documentation', color: 'yellow' },
        { name: 'High Priority', color: 'orange' }
      ]
    });
    console.log('📋 Created sample board');

    // Create sample lists
    const lists = await List.create([
      {
        title: 'To Do',
        board: board._id,
        position: 1024
      },
      {
        title: 'In Progress',
        board: board._id,
        position: 2048
      },
      {
        title: 'Review',
        board: board._id,
        position: 3072
      },
      {
        title: 'Done',
        board: board._id,
        position: 4096
      }
    ]);
    console.log('📝 Created sample lists');

    // Create sample cards
    const cards = await Card.create([
      {
        title: 'Set up project structure',
        description: 'Create initial folder structure and configuration files',
        list: lists[3]._id, // Done
        board: board._id,
        position: 1024,
        assignees: [users[0]._id],
        createdBy: users[0]._id,
        completed: true
      },
      {
        title: 'Design user authentication',
        description: 'Create login, signup, and password reset functionality',
        list: lists[2]._id, // Review
        board: board._id,
        position: 1024,
        assignees: [users[1]._id],
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        createdBy: users[0]._id
      },
      {
        title: 'Implement drag and drop',
        description: 'Add drag and drop functionality for cards and lists',
        list: lists[1]._id, // In Progress
        board: board._id,
        position: 1024,
        assignees: [users[2]._id],
        createdBy: users[1]._id
      },
      {
        title: 'Write API documentation',
        description: 'Document all API endpoints with examples',
        list: lists[0]._id, // To Do
        board: board._id,
        position: 1024,
        assignees: [users[1]._id],
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        createdBy: users[0]._id
      },
      {
        title: 'Set up CI/CD pipeline',
        description: 'Configure automated testing and deployment',
        list: lists[0]._id, // To Do
        board: board._id,
        position: 2048,
        createdBy: users[0]._id
      }
    ]);
    console.log('🎴 Created sample cards');

    // Update lists with cards
    for (let i = 0; i < lists.length; i++) {
      const listCards = cards.filter(card => card.list.toString() === lists[i]._id.toString());
      lists[i].cards = listCards.map(card => card._id);
      await lists[i].save();
    }

    // Update board with lists
    board.lists = lists.map(list => list._id);
    await board.save();

    // Update workspace with board
    workspace.boards = [board._id];
    await workspace.save();

    // Create sample activities
    await Activity.create([
      {
        type: 'board_created',
        actor: users[0]._id,
        workspace: workspace._id,
        board: board._id,
        data: { boardTitle: board.title }
      },
      {
        type: 'card_created',
        actor: users[0]._id,
        workspace: workspace._id,
        board: board._id,
        list: lists[0]._id,
        card: cards[0]._id,
        data: { cardTitle: cards[0].title }
      },
      {
        type: 'card_assigned',
        actor: users[0]._id,
        workspace: workspace._id,
        board: board._id,
        list: lists[1]._id,
        card: cards[1]._id,
        targetUser: users[1]._id,
        data: { 
          cardTitle: cards[1].title,
          userName: users[1].name
        }
      }
    ]);
    console.log('📊 Created sample activities');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📋 Sample data created:');
    console.log(`👥 Users: ${users.length}`);
    console.log(`🏢 Workspaces: 1`);
    console.log(`📋 Boards: 1`);
    console.log(`📝 Lists: ${lists.length}`);
    console.log(`🎴 Cards: ${cards.length}`);
    
    console.log('\n🔐 Login credentials:');
    console.log('Email: john@example.com, Password: Password123');
    console.log('Email: jane@example.com, Password: Password123');
    console.log('Email: bob@example.com, Password: Password123');

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed script if called directly
if (require.main === module) {
  seedData();
}

module.exports = seedData;