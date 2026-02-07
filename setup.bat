@echo off
echo ==========================================
echo Setting up ElectroRecover Marketplace...
echo ==========================================

echo [1/4] Installing Backend Dependencies...
cd backend
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo Failed to install backend dependencies.
    pause
    exit /b %errorlevel%
)
cd ..

echo [2/4] Installing Frontend Dependencies...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo Failed to install frontend dependencies. Is Node.js installed?
    pause
    exit /b %errorlevel%
)
cd ..

echo ==========================================
echo Setup Complete! 
echo Run 'run_app.bat' to start the application.
echo ==========================================
pause
