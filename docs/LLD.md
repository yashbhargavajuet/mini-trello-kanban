# Low Level Design (LLD) - Mini-Trello Kanban Application

## Database Schema

### ERD Overview
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    User     │    │ Workspace   │    │   Board     │
│             │    │             │    │             │
│ - _id       │◄──┐│ - _id       │◄──┐│ - _id       │
│ - name      │   ││ - name      │   ││ - title     │
│ - email     │   ││ - owner     ├───┘│ - workspace ├───┘
│ - password  │   ││ - members[] │    │ - owner     │
│ - avatar    │   │└─────────────┘    │ - members[] │
│ - createdAt │   │                   │ - visibility│
└─────────────┘   │                   │ - background│
                  │                   └──────┬──────┘
                  │                          │
                  │   ┌─────────────┐        │
                  │   │    List     │        │
                  │   │             │        │
                  │   │ - _id       │        │
                  │   │ - title     │        │
                  │   │ - board     ├────────┘
                  │   │ - position  │
                  │   │ - createdAt │
                  │   └──────┬──────┘
                  │          │
                  │   ┌──────┴──────┐
                  │   │    Card     │
                  │   │             │
                  │   │ - _id       │
                  │   │ - title     │
                  │   │ - description│
                  │   │ - list      │
                  │   │ - position  │
                  │   │ - assignees[]│──┐
                  │   │ - labels[]  │  │
                  │   │ - dueDate   │  │
                  │   │ - createdBy ├──┼─────┘
                  │   │ - createdAt │  │
                  │   └──────┬──────┘  │
                  │          │         │
                  │   ┌──────┴──────┐  │
                  │   │   Comment   │  │
                  │   │             │  │
                  │   │ - _id       │  │
                  │   │ - text      │  │
                  │   │ - card      ├──┘
                  │   │ - author    ├────────┘
                  │   │ - createdAt │
                  │   └─────────────┘
                  │
                  │   ┌─────────────┐
                  │   │  Activity   │
                  │   │             │
                  │   │ - _id       │
                  │   │ - type      │
                  │   │ - board     │
                  │   │ - user      ├────────┘
                  │   │ - data      │
                  │   │ - createdAt │
                  │   └─────────────┘
```

### Detailed Schema Definitions

#### 1. User Collection
```javascript
{
  _id: ObjectId,
  name: String (required, max 50 chars),
  email: String (required, unique, lowercase),
  password: String (required, hashed with bcrypt),
  avatar: String (URL, optional),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `{ email: 1 }` (unique)
- `{ createdAt: -1 }`

#### 2. Workspace Collection
```javascript
{
  _id: ObjectId,
  name: String (required, max 100 chars),
  description: String (optional, max 500 chars),
  owner: ObjectId (ref: User, required),
  members: [ObjectId] (ref: User),
  visibility: String (enum: ['private', 'public'], default: 'private'),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `{ owner: 1, createdAt: -1 }`
- `{ members: 1 }`
- `{ name: 'text' }` (text search)

#### 3. Board Collection
```javascript
{
  _id: ObjectId,
  title: String (required, max 100 chars),
  description: String (optional, max 1000 chars),
  workspace: ObjectId (ref: Workspace, required),
  owner: ObjectId (ref: User, required),
  members: [ObjectId] (ref: User),
  visibility: String (enum: ['private', 'workspace', 'public'], default: 'workspace'),
  background: {
    type: String (enum: ['color', 'image']),
    value: String
  },
  labels: [{
    name: String,
    color: String
  }],
  starred: [ObjectId] (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `{ workspace: 1, createdAt: -1 }`
- `{ owner: 1, createdAt: -1 }`
- `{ members: 1 }`
- `{ title: 'text', description: 'text' }` (text search)

#### 4. List Collection
```javascript
{
  _id: ObjectId,
  title: String (required, max 100 chars),
  board: ObjectId (ref: Board, required),
  position: Number (fractional positioning),
  archived: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `{ board: 1, position: 1 }`
- `{ board: 1, archived: 1, position: 1 }`

#### 5. Card Collection
```javascript
{
  _id: ObjectId,
  title: String (required, max 200 chars),
  description: String (optional, max 5000 chars),
  list: ObjectId (ref: List, required),
  position: Number (fractional positioning),
  assignees: [ObjectId] (ref: User),
  labels: [String] (references Board.labels.name),
  dueDate: Date (optional),
  completed: Boolean (default: false),
  checklist: [{
    text: String,
    completed: Boolean (default: false),
    createdAt: Date
  }],
  attachments: [{
    filename: String,
    url: String,
    size: Number,
    uploadedBy: ObjectId (ref: User),
    uploadedAt: Date
  }],
  createdBy: ObjectId (ref: User, required),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `{ list: 1, position: 1 }`
- `{ assignees: 1 }`
- `{ labels: 1 }`
- `{ dueDate: 1 }`
- `{ title: 'text', description: 'text' }` (text search)

#### 6. Comment Collection
```javascript
{
  _id: ObjectId,
  text: String (required, max 2000 chars),
  card: ObjectId (ref: Card, required),
  author: ObjectId (ref: User, required),
  mentions: [ObjectId] (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `{ card: 1, createdAt: -1 }`
- `{ author: 1, createdAt: -1 }`

#### 7. Activity Collection
```javascript
{
  _id: ObjectId,
  type: String (enum: ['card_created', 'card_moved', 'card_updated', 'comment_added', 'member_added', etc.]),
  board: ObjectId (ref: Board, required),
  user: ObjectId (ref: User, required),
  data: {
    cardId: ObjectId,
    cardTitle: String,
    fromList: String,
    toList: String,
    // ... other contextual data
  },
  createdAt: Date
}
```

**Indexes:**
- `{ board: 1, createdAt: -1 }`
- `{ user: 1, createdAt: -1 }`
- `{ createdAt: -1 }` (TTL index for cleanup)

## API Definitions

### Authentication Endpoints

#### POST /api/auth/register
```javascript
Request: {
  name: String,
  email: String,
  password: String
}

Response: {
  success: Boolean,
  data: {
    user: {
      id: String,
      name: String,
      email: String
    },
    token: String
  }
}
```

#### POST /api/auth/login
```javascript
Request: {
  email: String,
  password: String
}

Response: {
  success: Boolean,
  data: {
    user: {
      id: String,
      name: String,
      email: String,
      avatar: String
    },
    token: String
  }
}
```

### Board Management Endpoints

#### GET /api/boards
```javascript
Headers: { Authorization: "Bearer <token>" }

Response: {
  success: Boolean,
  data: {
    boards: [{
      id: String,
      title: String,
      description: String,
      workspace: {
        id: String,
        name: String
      },
      owner: {
        id: String,
        name: String
      },
      members: [User],
      visibility: String,
      background: Object,
      starred: Boolean,
      createdAt: Date
    }]
  }
}
```

#### POST /api/boards
```javascript
Headers: { Authorization: "Bearer <token>" }
Request: {
  title: String,
  description: String (optional),
  workspaceId: String,
  visibility: String,
  background: Object (optional)
}

Response: {
  success: Boolean,
  data: {
    board: BoardObject
  }
}
```

#### GET /api/boards/:id
```javascript
Headers: { Authorization: "Bearer <token>" }

Response: {
  success: Boolean,
  data: {
    board: BoardObject,
    lists: [ListObject],
    cards: [CardObject],
    members: [UserObject]
  }
}
```

### Card Management Endpoints

#### POST /api/cards
```javascript
Headers: { Authorization: "Bearer <token>" }
Request: {
  title: String,
  description: String (optional),
  listId: String,
  position: Number (optional)
}

Response: {
  success: Boolean,
  data: {
    card: CardObject
  }
}
```

#### PUT /api/cards/:id/move
```javascript
Headers: { Authorization: "Bearer <token>" }
Request: {
  listId: String,
  position: Number
}

Response: {
  success: Boolean,
  data: {
    card: CardObject
  }
}
```

#### GET /api/boards/:id/search
```javascript
Headers: { Authorization: "Bearer <token>" }
Query: {
  q: String (search query),
  assignee: String (optional),
  label: String (optional),
  dueDate: String (optional)
}

Response: {
  success: Boolean,
  data: {
    cards: [CardObject],
    totalCount: Number
  }
}
```

## Main Classes & Modules

### Backend Architecture

#### 1. Controllers
```javascript
// controllers/authController.js
class AuthController {
  async register(req, res)
  async login(req, res)
  async logout(req, res)
  async getProfile(req, res)
}

// controllers/boardController.js
class BoardController {
  async getBoards(req, res)
  async createBoard(req, res)
  async getBoardDetails(req, res)
  async updateBoard(req, res)
  async deleteBoard(req, res)
  async addMember(req, res)
  async removeMember(req, res)
  async searchCards(req, res)
}

// controllers/cardController.js
class CardController {
  async createCard(req, res)
  async updateCard(req, res)
  async deleteCard(req, res)
  async moveCard(req, res)
  async assignUser(req, res)
  async addLabel(req, res)
  async setDueDate(req, res)
}
```

#### 2. Models (Mongoose Schemas)
```javascript
// models/User.js
class User extends mongoose.Model {
  static async findByEmail(email)
  static async createUser(userData)
  async validatePassword(password)
  async generateAuthToken()
}

// models/Board.js
class Board extends mongoose.Model {
  static async findUserBoards(userId)
  static async findByIdWithDetails(boardId)
  async addMember(userId)
  async removeMember(userId)
  async checkMemberAccess(userId)
}

// models/Card.js
class Card extends mongoose.Model {
  static async findByBoard(boardId)
  static async searchInBoard(boardId, query, filters)
  async moveToList(newListId, newPosition)
  async assignUser(userId)
  async addLabel(labelName)
}
```

#### 3. Middleware
```javascript
// middleware/auth.js
function authenticate(req, res, next)
function authorize(roles)(req, res, next)

// middleware/validation.js
function validateBoardCreation(req, res, next)
function validateCardCreation(req, res, next)
function validateCardMove(req, res, next)

// middleware/errorHandler.js
function errorHandler(err, req, res, next)
function notFound(req, res, next)
```

#### 4. Socket.IO Handler
```javascript
// config/socket.js
class SocketHandler {
  constructor(io)
  
  handleConnection(socket)
  handleJoinBoard(socket, boardId)
  handleLeaveBoard(socket, boardId)
  handleCardMove(socket, data)
  handleCardUpdate(socket, data)
  handleCommentAdd(socket, data)
  handleDisconnect(socket)
  
  broadcastToBoard(boardId, event, data)
}
```

### Frontend Architecture

#### 1. Pages
```javascript
// pages/DashboardPage.jsx
function DashboardPage() {
  // User's boards overview
  // Create new board
  // Recent activity
}

// pages/BoardPage.jsx
function BoardPage() {
  // Kanban board view
  // Lists and cards
  // Drag and drop functionality
  // Real-time updates
}

// pages/LoginPage.jsx
function LoginPage() {
  // Authentication form
  // Registration form
}
```

#### 2. Components
```javascript
// components/Board/Board.jsx
function Board({ boardId }) {
  // Main board container
  // Socket.IO connection
  // Drag and drop context
}

// components/Board/List.jsx
function List({ list, cards }) {
  // List container
  // Card creation
  // Sortable cards
}

// components/Board/Card.jsx
function Card({ card }) {
  // Card display
  // Quick edit
  // Drag handle
}

// components/Modals/CardModal.jsx
function CardModal({ cardId, isOpen, onClose }) {
  // Card details
  // Comments
  // Attachments
  // Activity history
}
```

#### 3. State Management (Zustand)
```javascript
// store/authStore.js
const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  
  login: async (credentials) => {},
  logout: () => {},
  register: async (userData) => {}
}))

// store/boardStore.js
const useBoardStore = create((set, get) => ({
  currentBoard: null,
  lists: [],
  cards: [],
  members: [],
  
  setBoard: (board) => {},
  addCard: (card) => {},
  updateCard: (cardId, updates) => {},
  moveCard: (cardId, listId, position) => {},
  reorderLists: (listOrder) => {}
}))
```

## Ordering Strategy

### Fractional Positioning System
To avoid expensive reindexing when reordering items, we use fractional positioning:

```javascript
// Initial positions
List 1: position = 1024
List 2: position = 2048
List 3: position = 3072

// Inserting between List 1 and List 2
New List: position = (1024 + 2048) / 2 = 1536

// Position calculation utility
function calculateNewPosition(prevPosition, nextPosition) {
  if (!prevPosition && !nextPosition) {
    return 1024; // First item
  }
  
  if (!prevPosition) {
    return nextPosition / 2; // Insert at beginning
  }
  
  if (!nextPosition) {
    return prevPosition + 1024; // Insert at end
  }
  
  return (prevPosition + nextPosition) / 2; // Insert between
}

// Position rebalancing (when positions get too close)
function rebalancePositions(items) {
  const step = 1024;
  return items.map((item, index) => ({
    ...item,
    position: (index + 1) * step
  }));
}
```

### Database Indexing Strategy

#### Compound Indexes
```javascript
// For efficient list retrieval with ordering
{ board: 1, position: 1 }

// For efficient card retrieval with ordering
{ list: 1, position: 1 }

// For efficient board member queries
{ workspace: 1, members: 1 }

// For text search across boards
{ title: 'text', description: 'text' }

// For activity log queries
{ board: 1, createdAt: -1 }

// For user-specific queries
{ assignees: 1, dueDate: 1 }
```

## Error Handling Model

### Error Response Format
```javascript
{
  success: false,
  error: {
    code: String, // Error code for client handling
    message: String, // Human-readable message
    details: Object, // Additional error details
    timestamp: Date,
    path: String // API endpoint that caused error
  }
}
```

### Error Types
```javascript
// Authentication Errors
AUTH_TOKEN_MISSING: {
  statusCode: 401,
  code: 'AUTH_TOKEN_MISSING',
  message: 'Authentication token is required'
}

AUTH_TOKEN_INVALID: {
  statusCode: 401,
  code: 'AUTH_TOKEN_INVALID',
  message: 'Invalid authentication token'
}

// Authorization Errors
ACCESS_DENIED: {
  statusCode: 403,
  code: 'ACCESS_DENIED',
  message: 'You do not have permission to access this resource'
}

// Validation Errors
VALIDATION_ERROR: {
  statusCode: 400,
  code: 'VALIDATION_ERROR',
  message: 'Request validation failed',
  details: {
    field: 'Specific validation message'
  }
}

// Resource Errors
RESOURCE_NOT_FOUND: {
  statusCode: 404,
  code: 'RESOURCE_NOT_FOUND',
  message: 'The requested resource was not found'
}

RESOURCE_CONFLICT: {
  statusCode: 409,
  code: 'RESOURCE_CONFLICT',
  message: 'The request conflicts with the current state of the resource'
}

// Server Errors
INTERNAL_SERVER_ERROR: {
  statusCode: 500,
  code: 'INTERNAL_SERVER_ERROR',
  message: 'An internal server error occurred'
}
```

### Error Handler Middleware
```javascript
function errorHandler(err, req, res, next) {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error(err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { statusCode: 404, code: 'RESOURCE_NOT_FOUND', message };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = { statusCode: 400, code: 'DUPLICATE_RESOURCE', message };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = { statusCode: 400, code: 'VALIDATION_ERROR', message };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: {
      code: error.code || 'INTERNAL_SERVER_ERROR',
      message: error.message || 'Server Error',
      timestamp: new Date().toISOString(),
      path: req.originalUrl
    }
  });
}
```

## Real-time Event Schema

### Socket.IO Events
```javascript
// Client → Server Events
'join-board': { boardId: String }
'leave-board': { boardId: String }
'card-move': { cardId: String, listId: String, position: Number }
'card-update': { cardId: String, updates: Object }
'comment-add': { cardId: String, text: String }

// Server → Client Events
'card-moved': { cardId: String, listId: String, position: Number, user: Object }
'card-updated': { cardId: String, updates: Object, user: Object }
'comment-added': { comment: Object, user: Object }
'user-joined': { user: Object }
'user-left': { userId: String }
'board-updated': { updates: Object }
```

### Concurrency Handling
```javascript
// Optimistic locking for card moves
async function moveCard(cardId, newListId, newPosition) {
  const session = await mongoose.startSession();
  
  try {
    await session.withTransaction(async () => {
      const card = await Card.findById(cardId).session(session);
      
      if (!card) {
        throw new Error('Card not found');
      }
      
      // Update card position
      card.list = newListId;
      card.position = newPosition;
      card.updatedAt = new Date();
      
      await card.save({ session });
      
      // Log activity
      await Activity.create([{
        type: 'card_moved',
        board: card.boardId,
        user: req.user._id,
        data: {
          cardId: card._id,
          cardTitle: card.title,
          fromList: card.previousListId,
          toList: newListId
        }
      }], { session });
    });
    
  } catch (error) {
    throw error;
  } finally {
    await session.endSession();
  }
}
```