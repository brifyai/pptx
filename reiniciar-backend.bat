@echo off
echo ========================================
echo   REINICIANDO BACKEND
echo ========================================
echo.

echo Deteniendo procesos de Python...
taskkill /F /IM python.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo Iniciando backend...
cd backend
start cmd /k "python main.py"

echo.
echo ========================================
echo   Backend reiniciado
echo ========================================
echo.
echo El backend se esta ejecutando en otra ventana.
echo Presiona cualquier tecla para cerrar esta ventana...
pause >nul
