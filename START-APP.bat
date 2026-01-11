@echo off
title Slide AI
color 0A

echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║                                                        ║
echo ║        🎨 SLIDE AI 🎨                                 ║
echo ║                                                        ║
echo ║        Powered by Chutes AI + python-pptx             ║
echo ║                                                        ║
echo ╚════════════════════════════════════════════════════════╝
echo.
echo.
echo 📋 Iniciando servicios...
echo.

REM Iniciar backend en una nueva ventana
start "Backend Python" cmd /k "start-backend.bat"

REM Esperar 3 segundos
timeout /t 3 /nobreak >nul

REM Iniciar frontend en una nueva ventana
start "Frontend React" cmd /k "start-frontend.bat"

echo.
echo ✅ Servicios iniciados:
echo.
echo    🔧 Backend:  http://localhost:8000
echo    🎨 Frontend: http://localhost:3006
echo.
echo 💡 Presiona cualquier tecla para cerrar este mensaje...
pause >nul
