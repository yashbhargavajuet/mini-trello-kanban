@echo off
echo 🚀 Setting up Mini-Trello Application...

echo.
echo 📦 Installing Backend Dependencies...
cd backend
call npm install
if errorlevel 1 (
    echo ❌ Backend dependency installation failed!
    pause
    exit /b 1
)

echo.
echo 📦 Installing Frontend Dependencies...
cd ..\frontend
call npm install
if errorlevel 1 (
    echo ❌ Frontend dependency installation failed!
    pause
    exit /b 1
)

echo.
echo 🌱 Seeding Database with Sample Data...
cd ..\backend
call npm run seed
if errorlevel 1 (
    echo ❌ Database seeding failed! Make sure MongoDB is running.
    pause
    exit /b 1
)

cd ..
echo.
echo ✅ Setup completed successfully!
echo.
echo 📋 Next Steps:
echo 1. Make sure MongoDB is running
echo 2. Run 'start.bat' to start both servers
echo 3. Open http://localhost:3000 in your browser
echo 4. Login with: john@example.com / Password123
echo.
pause