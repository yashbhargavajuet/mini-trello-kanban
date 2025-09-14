# High Level Design (HLD) - Mini-Trello Kanban Application

## Architecture Overview

### System Architecture Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Browser   │    │   Web Browser   │    │   Web Browser   │
│   (Client 1)    │    │   (Client 2)    │    │   (Client N)    │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          │              ┌───────┴────────┐             │
          │              │  Load Balancer │             │
          │              │   (Optional)   │             │
          │              └───────┬────────┘             │
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                      ┌──────────┴──────────┐
                      │                     │
                HTTP  │    Socket.IO        │
                      │                     │
          ┌───────────┴─────────────────────┴──────────┐
          │         Node.js Express Server             │
          │                                            │
          │  ┌─────────────┐  ┌─────────────────────┐  │
          │  │   REST API  │  │   Socket.IO Server │  │
          │  │             │  │   (Real-time)       │  │
          │  │ - Auth      │  │                     │  │
          │  │ - Users     │  │ - Board events      │  │
          │  │ - Workspaces│  │ - Card movements    │  │
          │  │ - Boards    │  │ - Comments          │  │
          │  │ - Lists     │  │ - Activity logs     │  │
          │  │ - Cards     │  │                     │  │
          │  │ - Comments  │  │                     │  │
          │  └─────────────┘  └─────────────────────┘  │
          │                                            │
          │  ┌─────────────────────────────────────────┐  │
          │  │          Middleware Layer               │  │
          │  │                                         │  │
          │  │ - Authentication (JWT)                  │  │
          │  │ - Authorization                         │  │
          │  │ - Rate Limiting                         │  │
          │  │ - CORS                                  │  │
          │  │ - Security Headers                      │  │
          │  │ - Request Validation                    │  │
          │  └─────────────────────────────────────────┘  │
          └─────────────────┬──────────────────────────┘
                            │
                   ┌────────┴────────┐
                   │   MongoDB       │
                   │   Database      │
                   │                 │
                   │ Collections:    │
                   │ - users         │
                   │ - workspaces    │
                   │ - boards        │
                   │ - lists         │
                   │ - cards         │
                   │ - comments      │
                   │ - activities    │
                   └─────────────────┘
```

## Major Components

### 1. Frontend (React.js + TypeScript)
- **Component Architecture**: Modular React components with TypeScript for type safety
- **State Management**: Zustand for global state management
- **Routing**: React Router for navigation
- **Drag & Drop**: @dnd-kit library for accessible drag-and-drop functionality
- **Real-time**: Socket.IO client for live updates
- **UI Framework**: Tailwind CSS for responsive design

### 2. Backend (Node.js + Express)
- **API Layer**: RESTful APIs with Express.js
- **Authentication**: JWT-based authentication system
- **Authorization**: Role-based access control (board owners vs members)
- **Real-time Engine**: Socket.IO server for live collaboration
- **Database Layer**: MongoDB with Mongoose ODM
- **Security**: Helmet, CORS, rate limiting, input validation

### 3. Database (MongoDB)
- **Document Store**: Flexible schema for Kanban data structures
- **Collections**: Users, Workspaces, Boards, Lists, Cards, Comments, Activities
- **Indexing**: Optimized queries with compound indexes
- **Aggregation**: Efficient data retrieval with MongoDB aggregation pipeline

## Data Flow

### 1. Authentication Flow
```
Client → Login Request → Express Server → JWT Validation → MongoDB User Lookup → JWT Token Response
```

### 2. Board Operations Flow
```
Client → API Request → Auth Middleware → Authorization Check → Controller → Model → MongoDB → Response
```

### 3. Real-time Updates Flow
```
Client Action → API Update → MongoDB → Socket.IO Broadcast → All Connected Clients → UI Update
```

## Real-time Architecture Choice: Socket.IO vs SSE

**Chosen: Socket.IO**

### Rationale:
1. **Bidirectional Communication**: Full-duplex communication enables instant updates in both directions
2. **Automatic Fallbacks**: Gracefully falls back to polling if WebSockets are not available
3. **Room Management**: Built-in room functionality perfect for board-specific channels
4. **Event-based**: Natural fit for discrete events like card moves, comments, etc.
5. **Client Library**: Robust client library with automatic reconnection

### Alternative Considered: Server-Sent Events (SSE)
- **Pros**: Simpler implementation, HTTP-based, automatic reconnection
- **Cons**: One-way communication, limited browser connection pool, no built-in room management

## Scaling Considerations

### Current Scale (MVP): 
- Up to 5,000 boards
- 200 concurrent users on a busy board
- 20 events/sec peak

### Scaling Strategy:
1. **Horizontal Scaling**: Multiple Node.js instances behind load balancer
2. **Database Sharding**: Shard by workspace/board for better distribution
3. **Caching Layer**: Redis for session management and frequent queries
4. **CDN**: Static asset delivery for frontend
5. **Socket.IO Adapter**: Redis adapter for multi-instance Socket.IO

## Security Architecture

### 1. Authentication & Authorization
- JWT tokens with expiration
- Role-based permissions (owner, member)
- Board-level access control

### 2. Input Validation
- Express-validator for request validation
- Mongoose schema validation
- XSS protection through sanitization

### 3. Rate Limiting
- API endpoint rate limiting
- Socket.IO event rate limiting
- IP-based restrictions

## Deployment Architecture

### Development Environment
```
Local MongoDB → Node.js Server (Port 5000) → React Dev Server (Port 3000)
```

### Production Environment
```
MongoDB Atlas → Node.js (Railway/Render) → React Build (Vercel/Netlify)
                     ↓
               Socket.IO Server
```

### Deployment Components:
1. **Database**: MongoDB Atlas (managed MongoDB)
2. **Backend**: Railway/Render with auto-deployments
3. **Frontend**: Vercel/Netlify with automatic builds
4. **Environment**: Separate staging and production environments

## Performance Optimizations

### 1. Database Optimizations
- Compound indexes on frequently queried fields
- Aggregation pipelines for complex queries
- Connection pooling for database connections

### 2. API Optimizations
- Pagination for large datasets
- Field selection to reduce payload size
- Caching for frequently accessed data

### 3. Real-time Optimizations
- Room-based event broadcasting
- Event debouncing for rapid updates
- Connection state management

## Error Handling & Monitoring

### 1. Error Handling Strategy
- Centralized error handling middleware
- Consistent error response format
- Graceful degradation for real-time features

### 2. Monitoring & Logging
- Application logs for debugging
- Performance metrics tracking
- Real-time connection monitoring
- Database query performance tracking

## Technology Rationale

### Backend: Node.js + Express
- **JavaScript Ecosystem**: Unified language across stack
- **Performance**: Non-blocking I/O perfect for real-time applications
- **Socket.IO Integration**: Native support for WebSocket-based real-time features
- **Rich Ecosystem**: Extensive npm packages for rapid development

### Database: MongoDB
- **Flexible Schema**: Perfect for evolving Kanban data structures
- **Document Storage**: Natural fit for nested card/comment data
- **Aggregation Framework**: Powerful querying capabilities
- **Atlas Integration**: Managed cloud database with global deployment

### Frontend: React + TypeScript
- **Component Reusability**: Modular architecture for maintainable UI
- **Type Safety**: TypeScript catches errors at compile time
- **Performance**: Virtual DOM for efficient updates
- **Ecosystem**: Rich ecosystem for drag-and-drop and real-time features