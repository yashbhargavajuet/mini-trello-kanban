# Mini-Trello One-Click Deployment Script
# Run this script after installing Git and creating accounts

Write-Host "🚀 Mini-Trello Deployment Script" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

# Check if Git is installed
try {
    git --version
    Write-Host "✅ Git is installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Git is not installed. Please install Git first:" -ForegroundColor Red
    Write-Host "   Download from: https://git-scm.com/download/win" -ForegroundColor Yellow
    exit 1
}

# Initialize Git repository
if (-not (Test-Path ".git")) {
    Write-Host "📁 Initializing Git repository..." -ForegroundColor Blue
    git init
    
    # Create .gitignore
    @"
# Dependencies
node_modules/
/.pnp
.pnp.js

# Production builds
/backend/dist
/frontend/dist
/frontend/build

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# nyc test coverage
.nyc_output

# Dependency directories
node_modules/
jspm_packages/

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# Next.js build output
.next

# Nuxt.js build / generate output
.nuxt
dist

# Storybook build outputs
.out
.storybook-out

# Temporary folders
tmp/
temp/

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# MongoDB
data/db/
*.mongodb

# Logs
logs
*.log

# Screenshots (keep directory but ignore files)
screenshots/*.png
screenshots/*.jpg
screenshots/*.jpeg
!screenshots/README.md
"@ | Out-File -FilePath ".gitignore" -Encoding UTF8

    git add .
    git commit -m "Initial commit: Complete Mini-Trello Kanban Application"
    Write-Host "✅ Git repository initialized" -ForegroundColor Green
}

Write-Host ""
Write-Host "🔗 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Create a GitHub repository at: https://github.com/new" -ForegroundColor White
Write-Host "2. Add remote origin: git remote add origin YOUR_REPO_URL" -ForegroundColor White
Write-Host "3. Push code: git push -u origin main" -ForegroundColor White
Write-Host ""
Write-Host "4. Deploy Backend to Railway:" -ForegroundColor White
Write-Host "   - Visit: https://railway.app" -ForegroundColor White
Write-Host "   - Click 'Deploy from GitHub repo'" -ForegroundColor White
Write-Host "   - Select your repository and 'backend' folder" -ForegroundColor White
Write-Host ""
Write-Host "5. Deploy Frontend to Vercel:" -ForegroundColor White
Write-Host "   - Visit: https://vercel.com" -ForegroundColor White
Write-Host "   - Click 'New Project'" -ForegroundColor White
Write-Host "   - Select your repository and 'frontend' folder" -ForegroundColor White
Write-Host ""
Write-Host "📖 Full deployment guide: DEPLOYMENT.md" -ForegroundColor Cyan