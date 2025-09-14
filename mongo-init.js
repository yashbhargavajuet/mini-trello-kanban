// MongoDB initialization script for Docker
db = db.getSiblingDB('minitrello');

// Create a user for the application
db.createUser({
  user: 'minitrello',
  pwd: 'password123',
  roles: [
    {
      role: 'readWrite',
      db: 'minitrello'
    }
  ]
});

console.log('MongoDB initialized for Mini-Trello application');