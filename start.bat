@echo off
echo Starting Mini-Trello Application...

echo.
echo 1. Starting Backend Server...
start "Backend" cmd /k "cd backend && npm run dev"

timeout /t 3

echo.
echo 2. Starting Frontend Development Server...
start "Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ✅ Both servers are starting!
echo.
echo Backend will be available at: http://localhost:5000
echo Frontend will be available at: http://localhost:3000
echo API Documentation: http://localhost:5000/api-docs
echo.
echo Press any key to exit this script (servers will continue running)...
pause > nul