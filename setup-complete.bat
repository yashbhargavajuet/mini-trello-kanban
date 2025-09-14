@echo off
echo 🚀 Setting up Mini-Trello Application (Complete Setup)...

echo.
echo 🔧 Adding Node.js and MongoDB to PATH...
setx PATH "%PATH%;C:\Program Files\nodejs;C:\Program Files\MongoDB\Server\8.0\bin" > nul

echo.
echo 📁 Creating MongoDB data directory...
if not exist "C:\data\db" mkdir "C:\data\db"

echo.
echo 🔄 Starting MongoDB...
start "MongoDB" mongod --dbpath "C:\data\db"
echo MongoDB is starting in background...

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
echo ⏳ Waiting for MongoDB to start (10 seconds)...
timeout /t 10 > nul

echo.
echo 🌱 Seeding Database with Sample Data...
cd ..\backend
call npm run seed
if errorlevel 1 (
    echo ❌ Database seeding failed! 
    echo Make sure MongoDB is running and try again.
    pause
    exit /b 1
)

cd ..
echo.
echo ✅ Setup completed successfully!
echo.
echo 📋 Your Mini-Trello is ready!
echo.
echo 🚀 To start the application:
echo 1. Open TWO PowerShell windows
echo 2. In first window: cd backend ^&^& npm run dev
echo 3. In second window: cd frontend ^&^& npm run dev
echo 4. Open http://localhost:3000 in browser
echo 5. Login: john@example.com / Password123
echo.
echo 🔗 Useful URLs:
echo - Frontend: http://localhost:3000
echo - Backend API: http://localhost:5000
echo - API Documentation: http://localhost:5000/api-docs
echo.
pause