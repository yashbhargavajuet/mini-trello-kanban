# API Reference - Mini-Trello Kanban Application

## Overview

This document provides comprehensive API documentation for the Mini-Trello Kanban application. The API follows REST principles and returns JSON responses.

**Base URL:** `http://localhost:5000/api` (Development)  
**Authentication:** Bearer Token (JWT)  
**Content-Type:** `application/json`

## Authentication

### Register User
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "64a1b2c3d4e5f6789abcdef0",
      "name": "John Doe",
      "email": "john@example.com",
      "avatar": null
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Login User
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "64a1b2c3d4e5f6789abcdef0",
      "name": "John Doe",
      "email": "john@example.com",
      "avatar": "https://example.com/avatar.jpg"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Get Current User Profile
```http
GET /api/auth/me
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "64a1b2c3d4e5f6789abcdef0",
      "name": "John Doe",
      "email": "john@example.com",
      "avatar": "https://example.com/avatar.jpg",
      "createdAt": "2023-07-01T10:00:00.000Z"
    }
  }
}
```

## Users

### Get User by ID
```http
GET /api/users/:id
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "64a1b2c3d4e5f6789abcdef0",
      "name": "John Doe",
      "email": "john@example.com",
      "avatar": "https://example.com/avatar.jpg"
    }
  }
}
```

### Update User Profile
```http
PUT /api/users/:id
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "John Smith",
  "avatar": "https://example.com/new-avatar.jpg"
}
```

## Workspaces

### Get User Workspaces
```http
GET /api/workspaces
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "workspaces": [
      {
        "id": "64a1b2c3d4e5f6789abcdef1",
        "name": "My Workspace",
        "description": "Personal workspace for projects",
        "owner": {
          "id": "64a1b2c3d4e5f6789abcdef0",
          "name": "John Doe"
        },
        "members": [
          {
            "id": "64a1b2c3d4e5f6789abcdef0",
            "name": "John Doe",
            "email": "john@example.com"
          }
        ],
        "visibility": "private",
        "createdAt": "2023-07-01T10:00:00.000Z"
      }
    ]
  }
}
```

### Create Workspace
```http
POST /api/workspaces
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Project Workspace",
  "description": "Workspace for team collaboration",
  "visibility": "private"
}
```

### Add Member to Workspace
```http
POST /api/workspaces/:id/members
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "email": "member@example.com"
}
```

## Boards

### Get User Boards
```http
GET /api/boards
Authorization: Bearer <token>
```

**Query Parameters:**
- `workspace` (optional): Filter by workspace ID
- `starred` (optional): Filter starred boards only

**Response:**
```json
{
  "success": true,
  "data": {
    "boards": [
      {
        "id": "64a1b2c3d4e5f6789abcdef2",
        "title": "Project Alpha",
        "description": "Main project board",
        "workspace": {
          "id": "64a1b2c3d4e5f6789abcdef1",
          "name": "My Workspace"
        },
        "owner": {
          "id": "64a1b2c3d4e5f6789abcdef0",
          "name": "John Doe"
        },
        "members": [
          {
            "id": "64a1b2c3d4e5f6789abcdef0",
            "name": "John Doe",
            "email": "john@example.com",
            "avatar": null
          }
        ],
        "visibility": "workspace",
        "background": {
          "type": "color",
          "value": "#0079bf"
        },
        "labels": [
          {
            "name": "Bug",
            "color": "#eb5a46"
          },
          {
            "name": "Feature",
            "color": "#61bd4f"
          }
        ],
        "starred": false,
        "createdAt": "2023-07-01T11:00:00.000Z"
      }
    ]
  }
}
```

### Create Board
```http
POST /api/boards
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "New Project Board",
  "description": "Description of the project",
  "workspaceId": "64a1b2c3d4e5f6789abcdef1",
  "visibility": "workspace",
  "background": {
    "type": "color",
    "value": "#026aa7"
  }
}
```

### Get Board Details
```http
GET /api/boards/:id
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "board": {
      "id": "64a1b2c3d4e5f6789abcdef2",
      "title": "Project Alpha",
      "description": "Main project board",
      "workspace": {
        "id": "64a1b2c3d4e5f6789abcdef1",
        "name": "My Workspace"
      },
      "owner": {
        "id": "64a1b2c3d4e5f6789abcdef0",
        "name": "John Doe"
      },
      "members": [...],
      "visibility": "workspace",
      "background": {...},
      "labels": [...],
      "createdAt": "2023-07-01T11:00:00.000Z"
    },
    "lists": [
      {
        "id": "64a1b2c3d4e5f6789abcdef3",
        "title": "To Do",
        "board": "64a1b2c3d4e5f6789abcdef2",
        "position": 1024,
        "archived": false,
        "createdAt": "2023-07-01T11:05:00.000Z"
      }
    ],
    "cards": [
      {
        "id": "64a1b2c3d4e5f6789abcdef4",
        "title": "Implement user authentication",
        "description": "Add JWT-based authentication system",
        "list": "64a1b2c3d4e5f6789abcdef3",
        "position": 1024,
        "assignees": [
          {
            "id": "64a1b2c3d4e5f6789abcdef0",
            "name": "John Doe",
            "email": "john@example.com",
            "avatar": null
          }
        ],
        "labels": ["Feature"],
        "dueDate": "2023-07-15T09:00:00.000Z",
        "completed": false,
        "checklist": [
          {
            "text": "Set up JWT middleware",
            "completed": false,
            "createdAt": "2023-07-01T11:10:00.000Z"
          }
        ],
        "createdBy": "64a1b2c3d4e5f6789abcdef0",
        "createdAt": "2023-07-01T11:10:00.000Z"
      }
    ],
    "members": [...]
  }
}
```

### Update Board
```http
PUT /api/boards/:id
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Updated Board Title",
  "description": "Updated description",
  "background": {
    "type": "color",
    "value": "#519839"
  }
}
```

### Add Member to Board
```http
POST /api/boards/:id/members
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "userId": "64a1b2c3d4e5f6789abcdef5"
}
```

### Search Cards in Board
```http
GET /api/boards/:id/search
Authorization: Bearer <token>
```

**Query Parameters:**
- `q`: Search query (searches title and description)
- `assignee`: Filter by assignee user ID
- `label`: Filter by label name
- `dueDate`: Filter by due date (format: YYYY-MM-DD)
- `completed`: Filter by completion status (true/false)

**Response:**
```json
{
  "success": true,
  "data": {
    "cards": [
      {
        "id": "64a1b2c3d4e5f6789abcdef4",
        "title": "Implement user authentication",
        "description": "Add JWT-based authentication system",
        "list": {
          "id": "64a1b2c3d4e5f6789abcdef3",
          "title": "To Do"
        },
        "assignees": [...],
        "labels": ["Feature"],
        "dueDate": "2023-07-15T09:00:00.000Z",
        "completed": false
      }
    ],
    "totalCount": 1
  }
}
```

## Lists

### Create List
```http
POST /api/lists
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "In Progress",
  "boardId": "64a1b2c3d4e5f6789abcdef2",
  "position": 2048
}
```

### Update List
```http
PUT /api/lists/:id
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Done",
  "position": 3072
}
```

### Archive List
```http
PUT /api/lists/:id/archive
Authorization: Bearer <token>
```

### Delete List
```http
DELETE /api/lists/:id
Authorization: Bearer <token>
```

## Cards

### Create Card
```http
POST /api/cards
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Fix login bug",
  "description": "Users cannot log in with special characters in password",
  "listId": "64a1b2c3d4e5f6789abcdef3",
  "position": 2048,
  "assignees": ["64a1b2c3d4e5f6789abcdef0"],
  "labels": ["Bug"],
  "dueDate": "2023-07-10T17:00:00.000Z"
}
```

### Get Card Details
```http
GET /api/cards/:id
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "card": {
      "id": "64a1b2c3d4e5f6789abcdef4",
      "title": "Implement user authentication",
      "description": "Add JWT-based authentication system",
      "list": {
        "id": "64a1b2c3d4e5f6789abcdef3",
        "title": "To Do"
      },
      "position": 1024,
      "assignees": [...],
      "labels": ["Feature"],
      "dueDate": "2023-07-15T09:00:00.000Z",
      "completed": false,
      "checklist": [...],
      "attachments": [],
      "createdBy": {
        "id": "64a1b2c3d4e5f6789abcdef0",
        "name": "John Doe"
      },
      "createdAt": "2023-07-01T11:10:00.000Z"
    },
    "comments": [
      {
        "id": "64a1b2c3d4e5f6789abcdef6",
        "text": "Started working on this task",
        "author": {
          "id": "64a1b2c3d4e5f6789abcdef0",
          "name": "John Doe",
          "avatar": null
        },
        "mentions": [],
        "createdAt": "2023-07-01T12:00:00.000Z"
      }
    ]
  }
}
```

### Update Card
```http
PUT /api/cards/:id
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Updated card title",
  "description": "Updated description",
  "assignees": ["64a1b2c3d4e5f6789abcdef0", "64a1b2c3d4e5f6789abcdef5"],
  "labels": ["Bug", "Priority"],
  "dueDate": "2023-07-20T17:00:00.000Z",
  "completed": false
}
```

### Move Card
```http
PUT /api/cards/:id/move
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "listId": "64a1b2c3d4e5f6789abcdef7",
  "position": 1536
}
```

### Add Checklist Item
```http
POST /api/cards/:id/checklist
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "text": "Write unit tests"
}
```

### Update Checklist Item
```http
PUT /api/cards/:id/checklist/:checklistId
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "text": "Write comprehensive unit tests",
  "completed": true
}
```

### Delete Card
```http
DELETE /api/cards/:id
Authorization: Bearer <token>
```

## Comments

### Create Comment
```http
POST /api/comments
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "text": "This looks good to me! @john let's review this together.",
  "cardId": "64a1b2c3d4e5f6789abcdef4",
  "mentions": ["64a1b2c3d4e5f6789abcdef0"]
}
```

### Update Comment
```http
PUT /api/comments/:id
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "text": "Updated comment text"
}
```

### Delete Comment
```http
DELETE /api/comments/:id
Authorization: Bearer <token>
```

## Activities

### Get Board Activities
```http
GET /api/activities/board/:boardId
Authorization: Bearer <token>
```

**Query Parameters:**
- `limit` (optional): Number of activities to return (default: 20)
- `page` (optional): Page number for pagination (default: 1)

**Response:**
```json
{
  "success": true,
  "data": {
    "activities": [
      {
        "id": "64a1b2c3d4e5f6789abcdef8",
        "type": "card_moved",
        "board": "64a1b2c3d4e5f6789abcdef2",
        "user": {
          "id": "64a1b2c3d4e5f6789abcdef0",
          "name": "John Doe",
          "avatar": null
        },
        "data": {
          "cardId": "64a1b2c3d4e5f6789abcdef4",
          "cardTitle": "Implement user authentication",
          "fromList": "To Do",
          "toList": "In Progress"
        },
        "createdAt": "2023-07-01T14:30:00.000Z"
      },
      {
        "id": "64a1b2c3d4e5f6789abcdef9",
        "type": "comment_added",
        "board": "64a1b2c3d4e5f6789abcdef2",
        "user": {
          "id": "64a1b2c3d4e5f6789abcdef0",
          "name": "John Doe",
          "avatar": null
        },
        "data": {
          "cardId": "64a1b2c3d4e5f6789abcdef4",
          "cardTitle": "Implement user authentication",
          "commentText": "Started working on this task"
        },
        "createdAt": "2023-07-01T12:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalCount": 2,
      "limit": 20
    }
  }
}
```

### Get User Activities
```http
GET /api/activities/user
Authorization: Bearer <token>
```

## Error Responses

All API endpoints return consistent error responses in the following format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": {
      "title": "Title is required"
    },
    "timestamp": "2023-07-01T10:00:00.000Z",
    "path": "/api/boards"
  }
}
```

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `AUTH_TOKEN_MISSING` | 401 | Authentication token is required |
| `AUTH_TOKEN_INVALID` | 401 | Invalid authentication token |
| `ACCESS_DENIED` | 403 | Insufficient permissions |
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `RESOURCE_NOT_FOUND` | 404 | Resource not found |
| `RESOURCE_CONFLICT` | 409 | Resource conflict |
| `RATE_LIMIT_EXCEEDED` | 429 | Rate limit exceeded |
| `INTERNAL_SERVER_ERROR` | 500 | Internal server error |

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Authentication endpoints**: 5 requests per minute per IP
- **General API endpoints**: 100 requests per minute per user
- **Real-time Socket.IO events**: 50 events per minute per connection

Rate limit headers are included in all responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1625140800
```

## Socket.IO Events

The application uses Socket.IO for real-time features. Connect to the WebSocket endpoint and join board rooms for live updates.

**WebSocket URL:** `ws://localhost:5000` (Development)

### Client → Server Events

```javascript
// Join a board room
socket.emit('join-board', { boardId: '64a1b2c3d4e5f6789abcdef2' });

// Leave a board room
socket.emit('leave-board', { boardId: '64a1b2c3d4e5f6789abcdef2' });

// Real-time card move
socket.emit('card-move', {
  cardId: '64a1b2c3d4e5f6789abcdef4',
  listId: '64a1b2c3d4e5f6789abcdef7',
  position: 1536
});

// Real-time comment
socket.emit('comment-add', {
  cardId: '64a1b2c3d4e5f6789abcdef4',
  text: 'Great work on this!'
});
```

### Server → Client Events

```javascript
// Card was moved by another user
socket.on('card-moved', (data) => {
  // data: { cardId, listId, position, user }
});

// Comment was added by another user
socket.on('comment-added', (data) => {
  // data: { comment, user }
});

// User joined the board
socket.on('user-joined', (data) => {
  // data: { user }
});

// User left the board
socket.on('user-left', (data) => {
  // data: { userId }
});
```

## Postman Collection

Import this collection into Postman for easy API testing:

```json
{
  "info": {
    "name": "Mini-Trello API",
    "description": "Complete API collection for Mini-Trello Kanban application",
    "version": "1.0.0"
  },
  "auth": {
    "type": "bearer",
    "bearer": [
      {
        "key": "token",
        "value": "{{authToken}}",
        "type": "string"
      }
    ]
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:5000/api",
      "type": "string"
    },
    {
      "key": "authToken",
      "value": "",
      "type": "string"
    }
  ],
  "item": [
    {
      "name": "Authentication",
      "item": [
        {
          "name": "Register User",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"name\": \"John Doe\",\n  \"email\": \"john@example.com\",\n  \"password\": \"securepassword123\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/auth/register",
              "host": ["{{baseUrl}}"],
              "path": ["auth", "register"]
            }
          }
        },
        {
          "name": "Login User",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"john@example.com\",\n  \"password\": \"securepassword123\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/auth/login",
              "host": ["{{baseUrl}}"],
              "path": ["auth", "login"]
            }
          },
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "if (pm.response.code === 200) {",
                  "    const response = pm.response.json();",
                  "    pm.collectionVariables.set('authToken', response.data.token);",
                  "}"
                ]
              }
            }
          ]
        }
      ]
    },
    {
      "name": "Boards",
      "item": [
        {
          "name": "Get User Boards",
          "request": {
            "method": "GET",
            "url": {
              "raw": "{{baseUrl}}/boards",
              "host": ["{{baseUrl}}"],
              "path": ["boards"]
            }
          }
        },
        {
          "name": "Create Board",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"title\": \"Test Board\",\n  \"description\": \"A test board for API testing\",\n  \"workspaceId\": \"{{workspaceId}}\",\n  \"visibility\": \"workspace\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/boards",
              "host": ["{{baseUrl}}"],
              "path": ["boards"]
            }
          }
        }
      ]
    }
  ]
}
```

Save this as a `.json` file and import it into Postman to get started with API testing immediately.