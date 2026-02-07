@echo off
echo Starting ElectroRecover...

echo Starting Backend (FastAPI)...
start cmd /k "cd backend && uvicorn main:app --reload --port 8000"

echo Starting Frontend (Vite)...
start cmd /k "cd frontend && npm run dev"

echo ===================================================
echo App is running!
echo Frontend: http://localhost:5173
echo Backend: http://localhost:8000/docs
echo ===================================================
