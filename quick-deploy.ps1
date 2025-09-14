# Mini-Trello Quick Deployment Script
param(
    [string]$GitHubUsername,
    [string]$RepositoryName = "mini-trello-kanban"
)

Write-Host "🚀 Mini-Trello Quick Deployment Script" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""

# Function to check if Git is installed
function Test-GitInstallation {
    try {
        $gitVersion = git --version 2>$null
        if ($gitVersion) {
            Write-Host "✅ Git is installed: $gitVersion" -ForegroundColor Green
            return $true
        }
    }
    catch {
        Write-Host "❌ Git is not installed or not in PATH" -ForegroundColor Red
        return $false
    }
    return $false
}

# Function to check if directory is a Git repository
function Test-GitRepository {
    return Test-Path ".git"
}

# Check if Git is installed
if (-not (Test-GitInstallation)) {
    Write-Host ""
    Write-Host "🔧 Git Installation Required" -ForegroundColor Yellow
    Write-Host "1. Download Git from: https://git-scm.com/download/win" -ForegroundColor White
    Write-Host "2. Install with default settings" -ForegroundColor White
    Write-Host "3. Restart PowerShell" -ForegroundColor White
    Write-Host "4. Run this script again" -ForegroundColor White
    Write-Host ""
    
    $openDownload = Read-Host "Open Git download page? (y/n)"
    if ($openDownload -eq 'y' -or $openDownload -eq 'Y') {
        Start-Process "https://git-scm.com/download/win"
    }
    exit 1
}

# Check if already a Git repository
if (-not (Test-GitRepository)) {
    Write-Host "📁 Initializing Git repository..." -ForegroundColor Blue
    
    # Initialize Git repository
    git init
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to initialize Git repository" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ Git repository initialized" -ForegroundColor Green
}
else {
    Write-Host "✅ Git repository already exists" -ForegroundColor Green
}

# Check Git configuration
$gitUserName = git config --global user.name 2>$null
$gitUserEmail = git config --global user.email 2>$null

if (-not $gitUserName -or -not $gitUserEmail) {
    Write-Host ""
    Write-Host "🔧 Git Configuration Required" -ForegroundColor Yellow
    
    if (-not $gitUserName) {
        $userName = Read-Host "Enter your full name for Git commits"
        git config --global user.name "$userName"
    }
    
    if (-not $gitUserEmail) {
        $userEmail = Read-Host "Enter your email address for Git commits"
        git config --global user.email "$userEmail"
    }
    
    Write-Host "✅ Git configuration completed" -ForegroundColor Green
}
else {
    Write-Host "✅ Git is configured for $gitUserName ($gitUserEmail)" -ForegroundColor Green
}

# Ask for GitHub username if not provided
if (-not $GitHubUsername) {
    Write-Host ""
    $GitHubUsername = Read-Host "Enter your GitHub username"
}

# Check if remote origin exists
$remoteOrigin = git remote get-url origin 2>$null
if (-not $remoteOrigin) {
    Write-Host ""
    Write-Host "🔗 Setting up GitHub repository..." -ForegroundColor Blue
    
    $repositoryUrl = "https://github.com/$GitHubUsername/$RepositoryName.git"
    
    Write-Host "Repository URL: $repositoryUrl" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🌐 Please create a GitHub repository:" -ForegroundColor Yellow
    Write-Host "1. Go to: https://github.com/new" -ForegroundColor White
    Write-Host "2. Repository name: $RepositoryName" -ForegroundColor White
    Write-Host "3. Description: 'A full-stack Trello-like Kanban application with real-time collaboration'" -ForegroundColor White
    Write-Host "4. Make it Public (for free deployment)" -ForegroundColor White
    Write-Host "5. Don't initialize with README (we have files already)" -ForegroundColor White
    Write-Host "6. Click 'Create repository'" -ForegroundColor White
    Write-Host ""
    
    $openGitHub = Read-Host "Open GitHub to create repository? (y/n)"
    if ($openGitHub -eq 'y' -or $openGitHub -eq 'Y') {
        Start-Process "https://github.com/new"
    }
    
    Write-Host ""
    Read-Host "Press Enter after creating the GitHub repository"
    
    # Add remote origin
    git remote add origin $repositoryUrl
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to add remote origin" -ForegroundColor Red
        Write-Host "Please check if the repository exists and you have access" -ForegroundColor Yellow
        exit 1
    }
    
    Write-Host "✅ Remote origin added: $repositoryUrl" -ForegroundColor Green
}
else {
    Write-Host "✅ Remote origin already configured: $remoteOrigin" -ForegroundColor Green
}

# Check if there are uncommitted changes
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host ""
    Write-Host "📝 Committing changes..." -ForegroundColor Blue
    
    # Add all files
    git add .
    
    # Commit with detailed message
    $commitMessage = @"
Initial commit: Complete Mini-Trello Kanban Application

✅ Backend: Node.js + Express + MongoDB + Socket.IO
✅ Frontend: React + TypeScript + Tailwind + @dnd-kit  
✅ Features: Real-time collaboration, drag-and-drop, authentication
✅ Documentation: HLD, LLD, API docs, deployment guides
✅ Testing: Comprehensive testing completed
✅ Ready for production deployment

Architecture:
- REST API with Socket.IO for real-time features
- JWT-based authentication
- MongoDB with optimized schemas
- Responsive React frontend
- Drag & drop with accessibility support
- Comprehensive error handling
- Production deployment configurations

Deployment ready for:
- Backend: Railway/Render
- Frontend: Vercel/Netlify  
- Database: MongoDB Atlas
"@
    
    git commit -m "$commitMessage"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to commit changes" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ Changes committed" -ForegroundColor Green
}

# Push to GitHub
Write-Host ""
Write-Host "📤 Pushing to GitHub..." -ForegroundColor Blue

# Ensure we're on main branch
git branch -M main

# Push to origin
git push -u origin main
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to push to GitHub" -ForegroundColor Red
    Write-Host "Please check your GitHub credentials and repository access" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Code pushed to GitHub successfully!" -ForegroundColor Green

# Display next steps
Write-Host ""
Write-Host "🎉 Git Setup Complete!" -ForegroundColor Green
Write-Host "=====================" -ForegroundColor Green
Write-Host ""
Write-Host "Your code is now on GitHub at:" -ForegroundColor Cyan
Write-Host "https://github.com/$GitHubUsername/$RepositoryName" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Next Steps for Deployment:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. 🗄️  Set up MongoDB Atlas:" -ForegroundColor White
Write-Host "   https://www.mongodb.com/cloud/atlas" -ForegroundColor Gray
Write-Host ""
Write-Host "2. 🚂 Deploy Backend to Railway:" -ForegroundColor White
Write-Host "   https://railway.app" -ForegroundColor Gray
Write-Host "   - Deploy from GitHub repo" -ForegroundColor Gray
Write-Host "   - Root directory: /backend" -ForegroundColor Gray
Write-Host ""
Write-Host "3. ▲ Deploy Frontend to Vercel:" -ForegroundColor White
Write-Host "   https://vercel.com" -ForegroundColor Gray
Write-Host "   - Import project from GitHub" -ForegroundColor Gray
Write-Host "   - Root directory: /frontend" -ForegroundColor Gray
Write-Host ""
Write-Host "📖 Detailed instructions: See DEPLOY_STEPS.md" -ForegroundColor Cyan
Write-Host ""

$openDeploySteps = Read-Host "Open detailed deployment steps? (y/n)"
if ($openDeploySteps -eq 'y' -or $openDeploySteps -eq 'Y') {
    if (Get-Command code -ErrorAction SilentlyContinue) {
        code "DEPLOY_STEPS.md"
    } else {
        notepad "DEPLOY_STEPS.md"
    }
}

Write-Host ""
Write-Host "✨ Your Mini-Trello app is ready for deployment!" -ForegroundColor Green