@echo off
echo ========================================
echo Instalando Mejoras del Chat
echo ========================================
echo.

echo [1/3] Instalando dependencias de Python...
cd backend
pip install duckduckgo-search beautifulsoup4
if %errorlevel% neq 0 (
    echo ERROR: No se pudieron instalar las dependencias
    pause
    exit /b 1
)
cd ..

echo.
echo [2/3] Verificando archivos...
if not exist "backend\routes\search.py" (
    echo ERROR: Falta backend\routes\search.py
    pause
    exit /b 1
)

echo.
echo [3/3] Verificando configuracion...
echo.
echo ========================================
echo INSTALACION COMPLETADA
echo ========================================
echo.
echo Proximos pasos:
echo 1. Reiniciar el backend: cd backend ^&^& python main.py
echo 2. Probar busqueda: /buscar tendencias IA 2026
echo 3. Probar historial: Enviar varios mensajes y usar referencias
echo 4. Probar comandos: /variantes, /sugerencias, /historial
echo.
echo Ver IMPLEMENTACION-MEJORAS-CHAT.md para mas detalles
echo.
pause
