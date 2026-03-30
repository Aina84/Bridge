@echo off
echo starting frontend server...
cd frontend

echo node js required...
echo verification si dist exit...
if not exist "dist" (
    echo Warning: dist/ directory not found!
    echo Current directory: %CD%
    echo.
    echo Installing dependencies...
    call npm install
    echo.
    echo Building project...
    call npm run build
    echo.
    echo Serving dist folder...
    npx serve dist/
    pause
    exit /b 0
)

REM Servir le dossier dist
echo Serving dist folder...
npx serve dist/

pause