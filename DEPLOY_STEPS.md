# 🚀 Mini-Trello Deployment Steps

## Phase 1: Install Git and Set Up Repository (10 minutes)

### Step 1: Install Git
1. **Download Git**: Go to https://git-scm.com/download/win
2. **Install**: Run the downloaded .exe file with default settings
3. **Restart PowerShell**: Close and reopen your PowerShell terminal
4. **Verify**: Run `git --version` (should show version number)

### Step 2: Configure Git (First time setup)
```powershell
# Set your name and email (use your actual info)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### Step 3: Initialize Git Repository
```powershell
# Make sure you're in the Mini Trello directory
cd "C:\Users\ASUS\OneDrive\Desktop\Mini Trello"

# Initialize Git
git init

# Add all files to staging
git add .

# Make first commit
git commit -m "Initial commit: Complete Mini-Trello Kanban Application

✅ Backend: Node.js + Express + MongoDB + Socket.IO
✅ Frontend: React + TypeScript + Tailwind + @dnd-kit  
✅ Features: Real-time collaboration, drag-and-drop, authentication
✅ Documentation: HLD, LLD, API docs, deployment guides
✅ Testing: Comprehensive testing completed
✅ Ready for production deployment"
```

## Phase 2: Create GitHub Repository (5 minutes)

### Step 4: Create GitHub Repository
1. **Go to GitHub**: https://github.com/new
2. **Repository name**: `mini-trello-kanban`
3. **Description**: "A full-stack Trello-like Kanban application with real-time collaboration"
4. **Visibility**: Public (recommended for free deployment)
5. **Don't initialize with README** (we already have files)
6. **Click "Create repository"**

### Step 5: Connect Local Repository to GitHub
```powershell
# Add GitHub repository as remote (replace with your actual repository URL)
git remote add origin https://github.com/YOUR_USERNAME/mini-trello-kanban.git

# Rename branch to main (if needed)
git branch -M main

# Push code to GitHub
git push -u origin main
```

## Phase 3: Set Up Cloud Database (10 minutes)

### Step 6: Create MongoDB Atlas Account
1. **Go to**: https://www.mongodb.com/cloud/atlas
2. **Sign up**: Create a free account
3. **Create Organization**: Name it "Mini-Trello"
4. **Create Project**: Name it "mini-trello-production"

### Step 7: Create Database Cluster
1. **Build a Database** → Choose **FREE** M0 tier
2. **Cloud Provider**: AWS (default)
3. **Region**: Choose closest to your users
4. **Cluster Name**: `mini-trello-cluster`
5. **Create Cluster** (takes 3-5 minutes)

### Step 8: Configure Database Access
1. **Database Access** → **Add New Database User**:
   - Username: `minitrello`
   - Password: Generate strong password (save it!)
   - Database User Privileges: "Read and write to any database"
2. **Network Access** → **Add IP Address**:
   - Add `0.0.0.0/0` (Allow access from anywhere)
   - Note: For production, restrict to specific IPs

### Step 9: Get Connection String
1. **Databases** → **Connect** → **Connect your application**
2. **Copy connection string**
3. **Save it** - looks like: `mongodb+srv://minitrello:PASSWORD@mini-trello-cluster.xxxxx.mongodb.net/minitrello`

## Phase 4: Deploy Backend to Railway (10 minutes)

### Step 10: Create Railway Account
1. **Go to**: https://railway.app
2. **Sign in with GitHub** (recommended)
3. **Authorize Railway** to access your repositories

### Step 11: Deploy Backend
1. **New Project** → **Deploy from GitHub repo**
2. **Select**: Your `mini-trello-kanban` repository
3. **Root Directory**: `/backend` (important!)
4. **Deploy** (Railway will auto-detect Node.js)

### Step 12: Configure Backend Environment Variables
In Railway dashboard → Your service → **Variables** tab:
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://minitrello:YOUR_PASSWORD@mini-trello-cluster.xxxxx.mongodb.net/minitrello
JWT_SECRET=super-secure-random-string-min-32-characters-long
CLIENT_URL=https://your-frontend-url.vercel.app
PORT=5000
```

### Step 13: Get Backend URL
- **Copy your Railway app URL** (e.g., `https://mini-trello-api.railway.app`)
- **Test**: Visit `https://your-app.railway.app/health` (should show OK status)

## Phase 5: Deploy Frontend to Vercel (5 minutes)

### Step 14: Create Vercel Account
1. **Go to**: https://vercel.com
2. **Sign in with GitHub**
3. **Import Project** → Select your repository
4. **Root Directory**: `/frontend`
5. **Framework**: Vite (auto-detected)

### Step 15: Configure Frontend Environment Variables
In Vercel → Project Settings → **Environment Variables**:
```
VITE_API_URL=https://your-backend-url.railway.app/api
VITE_SOCKET_URL=https://your-backend-url.railway.app
```

### Step 16: Deploy Frontend
- **Click Deploy** (Vercel will build and deploy)
- **Copy your Vercel URL** (e.g., `https://mini-trello-kanban.vercel.app`)

## Phase 6: Update CORS and Final Configuration (5 minutes)

### Step 17: Update Backend CORS
1. **Go back to Railway** → Your backend service → **Variables**
2. **Update CLIENT_URL**: `https://your-actual-vercel-url.vercel.app`
3. **Redeploy**: Railway will automatically redeploy

### Step 18: Seed Production Database
1. **Railway Dashboard** → Your service → **Deployments**
2. **View Logs** to see if deployment succeeded
3. **Optionally**: Add seed endpoint or manual seed via Railway CLI

## Phase 7: Test Your Live Application! 🎉

### Step 19: Test Your Deployed App
1. **Visit your Vercel URL**: `https://your-app.vercel.app`
2. **Create account** or use seeded data:
   - Email: `john@example.com`
   - Password: `Password123`
3. **Test features**:
   - Create boards and lists
   - Drag and drop cards
   - Open multiple browser tabs to test real-time features
   - Add comments and see live updates

### Step 20: Update README with Live URLs
Update your GitHub repository README.md:
```markdown
## 🚀 Live Demo
- **Frontend**: https://your-actual-app.vercel.app
- **Backend API**: https://your-actual-backend.railway.app
- **API Docs**: https://your-actual-backend.railway.app/api-docs
```

## 🎯 Success Checklist

- ✅ Git installed and repository created
- ✅ Code pushed to GitHub
- ✅ MongoDB Atlas database created and configured
- ✅ Backend deployed to Railway with environment variables
- ✅ Frontend deployed to Vercel with environment variables
- ✅ CORS updated with actual frontend URL
- ✅ Application tested and working live
- ✅ README updated with live URLs

## 🚨 Troubleshooting

### Backend Issues:
- **503 Error**: Check Railway logs for database connection issues
- **CORS Error**: Ensure CLIENT_URL in Railway matches your Vercel URL exactly
- **Environment Variables**: Double-check all variables are set in Railway

### Frontend Issues:
- **API Connection**: Verify VITE_API_URL points to your Railway backend
- **Build Errors**: Check Vercel deployment logs for missing dependencies
- **WebSocket Issues**: Ensure VITE_SOCKET_URL matches your Railway backend

### Database Issues:
- **Connection Failed**: Check MongoDB Atlas network access (0.0.0.0/0)
- **Authentication**: Verify database username/password in connection string

## 📞 Support

If you encounter issues:
1. Check deployment logs in Railway/Vercel dashboards
2. Test API endpoints directly: `https://your-backend.railway.app/health`
3. Verify environment variables are set correctly
4. Check network access in MongoDB Atlas

---

**🎉 Once completed, you'll have a fully deployed, production-ready Mini-Trello application!**