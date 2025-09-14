# Deployment Guide - Mini-Trello Kanban Application

This guide covers deploying the Mini-Trello application using various cloud platforms.

## Architecture Overview

```
Frontend (React/Vite)    →    Vercel/Netlify
Backend (Node.js/Express)  →    Railway/Render/Fly.io
Database (MongoDB)        →    MongoDB Atlas
```

## Prerequisites

1. Git repository (GitHub, GitLab, or Bitbucket)
2. MongoDB Atlas account (free tier available)
3. Platform accounts (Vercel, Netlify, Railway, or Render)

## Database Setup (MongoDB Atlas)

### Step 1: Create MongoDB Atlas Account

1. Visit [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account
3. Create a new project called "Mini-Trello"

### Step 2: Create a Database Cluster

1. Click "Build a Database"
2. Choose "FREE" shared cluster
3. Select your preferred cloud provider and region
4. Name your cluster "mini-trello-cluster"

### Step 3: Configure Database Access

1. Go to "Database Access" in the sidebar
2. Add a new database user:
   - Username: `minitrello`
   - Password: Generate a secure password (save it!)
   - Database User Privileges: "Read and write to any database"

### Step 4: Configure Network Access

1. Go to "Network Access" in the sidebar
2. Add IP address: `0.0.0.0/0` (Allow access from anywhere)
   - Note: For production, restrict to specific IPs

### Step 5: Get Connection String

1. Go to "Databases" and click "Connect"
2. Choose "Connect your application"
3. Copy the connection string (looks like: `mongodb+srv://minitrello:<password>@mini-trello-cluster.xyz.mongodb.net/minitrello`)
4. Replace `<password>` with your database user password

## Backend Deployment

### Option 1: Railway (Recommended)

1. **Create Railway Account**
   - Visit [Railway](https://railway.app)
   - Sign in with GitHub

2. **Deploy Backend**
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Choose the `backend` directory as root

3. **Configure Environment Variables**
   ```
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://minitrello:<password>@mini-trello-cluster.xyz.mongodb.net/minitrello
   JWT_SECRET=your-super-secret-jwt-key-here
   CLIENT_URL=https://your-frontend-url.vercel.app
   PORT=5000
   ```

4. **Deploy**
   - Railway will automatically build and deploy
   - Your backend will be available at: `https://your-app.railway.app`

### Option 2: Render

1. **Create Render Account**
   - Visit [Render](https://render.com)
   - Sign in with GitHub

2. **Create Web Service**
   - Click "New" → "Web Service"
   - Connect your repository
   - Configure:
     - Name: `mini-trello-api`
     - Environment: `Node`
     - Build Command: `npm install`
     - Start Command: `npm start`

3. **Environment Variables**
   ```
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://minitrello:<password>@mini-trello-cluster.xyz.mongodb.net/minitrello
   JWT_SECRET=your-super-secret-jwt-key-here
   CLIENT_URL=https://your-frontend-url.vercel.app
   ```

4. **Deploy**
   - Render will build and deploy automatically
   - Backend available at: `https://your-service.onrender.com`

### Option 3: Fly.io

1. **Install Fly CLI**
   ```bash
   # Windows (PowerShell)
   iwr https://fly.io/install.ps1 -useb | iex
   
   # macOS/Linux
   curl -L https://fly.io/install.sh | sh
   ```

2. **Login and Initialize**
   ```bash
   fly auth login
   cd backend
   fly launch
   ```

3. **Configure Environment Variables**
   ```bash
   fly secrets set NODE_ENV=production
   fly secrets set MONGODB_URI="mongodb+srv://minitrello:<password>@mini-trello-cluster.xyz.mongodb.net/minitrello"
   fly secrets set JWT_SECRET="your-super-secret-jwt-key-here"
   fly secrets set CLIENT_URL="https://your-frontend-url.vercel.app"
   ```

4. **Deploy**
   ```bash
   fly deploy
   ```

## Frontend Deployment

### Option 1: Vercel (Recommended)

1. **Create Vercel Account**
   - Visit [Vercel](https://vercel.com)
   - Sign in with GitHub

2. **Import Project**
   - Click "New Project"
   - Import your repository
   - Set root directory to `frontend`

3. **Configure Build Settings**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **Environment Variables**
   ```
   VITE_API_URL=https://your-backend.railway.app/api
   VITE_SOCKET_URL=https://your-backend.railway.app
   ```

5. **Deploy**
   - Vercel will build and deploy automatically
   - Frontend available at: `https://your-project.vercel.app`

### Option 2: Netlify

1. **Create Netlify Account**
   - Visit [Netlify](https://netlify.com)
   - Sign in with GitHub

2. **Import Project**
   - Click "New site from Git"
   - Choose your repository
   - Set base directory to `frontend`

3. **Configure Build Settings**
   - Build Command: `npm run build`
   - Publish Directory: `frontend/dist`

4. **Environment Variables**
   ```
   VITE_API_URL=https://your-backend.railway.app/api
   VITE_SOCKET_URL=https://your-backend.railway.app
   ```

5. **Deploy**
   - Netlify will build and deploy automatically
   - Frontend available at: `https://your-site.netlify.app`

## Post-Deployment Setup

### 1. Update CORS Settings

Update your backend environment variables to include your frontend URL:

```
CLIENT_URL=https://your-frontend-domain.com
```

### 2. Seed Database (Optional)

SSH into your backend deployment and run:

```bash
npm run seed
```

Or create an endpoint to seed data via API call.

### 3. Custom Domain (Optional)

Both Vercel and Netlify support custom domains:

1. **Vercel**: Project Settings → Domains → Add Domain
2. **Netlify**: Site Settings → Domain management → Add custom domain

### 4. SSL/HTTPS

All recommended platforms provide automatic HTTPS certificates.

## Environment Variables Reference

### Backend Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | JWT signing secret | `your-secret-key` |
| `CLIENT_URL` | Frontend URL for CORS | `https://app.vercel.app` |

### Frontend Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `https://api.railway.app/api` |
| `VITE_SOCKET_URL` | Backend WebSocket URL | `https://api.railway.app` |

## Monitoring and Maintenance

### Health Checks

All platforms monitor your application health automatically using:
- **Backend**: `GET /health` endpoint
- **Frontend**: HTTP status codes

### Logs

Access logs through platform dashboards:
- **Railway**: View logs in project dashboard
- **Render**: Services → Logs tab
- **Vercel**: Project → Functions tab → View Function Logs
- **Netlify**: Site → Deploys → Logs

### Scaling

- **Railway**: Auto-scaling based on traffic
- **Render**: Manual scaling in service settings
- **Vercel**: Automatic scaling for serverless functions
- **Netlify**: CDN auto-scaling

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure `CLIENT_URL` environment variable is set correctly
   - Check that frontend URL matches exactly (including https/http)

2. **Database Connection Issues**
   - Verify MongoDB Atlas connection string
   - Check Network Access settings (whitelist IPs)
   - Ensure database user has correct permissions

3. **WebSocket Connection Issues**
   - Verify `VITE_SOCKET_URL` points to backend domain
   - Check if platform supports WebSocket connections

4. **Build Failures**
   - Check build logs for specific error messages
   - Verify Node.js version compatibility
   - Ensure all dependencies are in package.json

### Getting Help

1. Check platform-specific documentation
2. Review application logs
3. Test API endpoints manually
4. Verify environment variables are set correctly

## Cost Optimization

### Free Tier Limits

- **MongoDB Atlas**: 512MB storage, shared cluster
- **Railway**: $5 credit per month, then pay-as-you-go
- **Render**: 750 hours/month free tier
- **Vercel**: 100GB bandwidth, 6000 serverless hours/month
- **Netlify**: 100GB bandwidth, 300 build minutes/month

### Tips to Stay Within Free Limits

1. Use MongoDB Atlas free tier (M0)
2. Optimize images and assets to reduce bandwidth
3. Implement proper caching strategies
4. Monitor usage dashboards regularly
5. Consider upgrading only when necessary

## Security Considerations

1. **Environment Variables**: Never commit secrets to git
2. **HTTPS**: Always use HTTPS in production
3. **CORS**: Restrict CORS origins to specific domains
4. **Database**: Use dedicated database users with minimal permissions
5. **JWT Secrets**: Use strong, randomly generated secrets
6. **Rate Limiting**: Configure appropriate rate limits
7. **Updates**: Keep dependencies updated

## Conclusion

This deployment guide provides multiple options for hosting your Mini-Trello application. The recommended combination is:

- **Database**: MongoDB Atlas (Free)
- **Backend**: Railway (Easy setup, good free tier)
- **Frontend**: Vercel (Excellent performance, generous free tier)

All platforms offer good developer experience, automatic deployments, and built-in monitoring.