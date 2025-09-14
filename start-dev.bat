@echo off
echo 🚀 Starting Mini-Trello Development Environment...

echo.
echo 📋 Checking prerequisites...

REM Check if MongoDB is running
tasklist /fi "imagename eq mongod.exe" 2>nul | find /i "mongod.exe" >nul
if errorlevel 1 (
    echo 🔄 Starting MongoDB...
    start "MongoDB" mongod --dbpath "C:\data\db"
    echo ⏳ Waiting for MongoDB to start...
    timeout /t 5 >nul
) else (
    echo ✅ MongoDB is already running
)

echo.
echo 🖥️  Starting Backend Server...
start "Backend API" cmd /k "cd /d \"%~dp0backend\" && echo Backend starting on http://localhost:5000 && npm run dev"

echo ⏳ Waiting for backend to start...
timeout /t 10 >nul

echo.
echo 🌐 Starting Frontend Server...
start "Frontend App" cmd /k "cd /d \"%~dp0frontend\" && echo Frontend starting on http://localhost:3000 && npm run dev"

echo.
echo ✅ Both servers are starting!
echo.
echo 📱 Application URLs:
echo    Frontend: http://localhost:3000
echo    Backend:  http://localhost:5000
echo    API Docs: http://localhost:5000/api-docs
echo.
echo 🔐 Demo Login:
echo    Email: john@example.com
echo    Password: Password123
echo.
echo ⚡ The application will open in separate windows.
echo    Wait about 30 seconds for both servers to fully start,
echo    then open http://localhost:3000 in your browser.
echo.
echo Press any key to close this window...
pause >nul