@echo off
echo Starting GradGuide 3-in-1 Platform...

echo Starting FastAPI Backend...
start "GradGuide API" cmd /k "cd server && py -3.11 -m venv venv && call venv\Scripts\activate.bat && pip install -r requirements.txt && uvicorn app.main:app --reload --port 8000"

echo Starting Vite React Frontend...
start "GradGuide Web UI" cmd /k "cd client && npm install && npm run dev"

echo.
echo ==============================================================
echo Applications are starting in separate windows.
echo - Backend API will be available at http://localhost:8000
echo - Frontend UI will be available at http://localhost:5173
echo ==============================================================
echo.
pause
