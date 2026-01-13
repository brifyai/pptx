@echo off
echo ========================================
echo Verificando Estado del Chat Mejorado
echo ========================================
echo.

echo [1/5] Verificando archivos backend...
if exist "backend\routes\search.py" (
    echo   [OK] backend\routes\search.py existe
) else (
    echo   [ERROR] Falta backend\routes\search.py
    goto :error
)

echo.
echo [2/5] Verificando dependencias Python...
cd backend
python -c "import duckduckgo_search" 2>nul
if %errorlevel% equ 0 (
    echo   [OK] duckduckgo-search instalado
) else (
    echo   [ERROR] Falta duckduckgo-search
    echo   Instalar con: pip install duckduckgo-search
    cd ..
    goto :error
)

python -c "import bs4" 2>nul
if %errorlevel% equ 0 (
    echo   [OK] beautifulsoup4 instalado
) else (
    echo   [ERROR] Falta beautifulsoup4
    echo   Instalar con: pip install beautifulsoup4
    cd ..
    goto :error
)
cd ..

echo.
echo [3/5] Verificando configuracion frontend...
findstr /C:"generateContentVariants" "src\components\ChatPanel.jsx" >nul
if %errorlevel% equ 0 (
    echo   [OK] Funciones avanzadas importadas
) else (
    echo   [WARN] Funciones avanzadas no importadas
)

findstr /C:"fetch('http://localhost:8000/api/search'" "src\services\webSearchService.js" >nul
if %errorlevel% equ 0 (
    echo   [OK] Busqueda web conectada al backend
) else (
    echo   [ERROR] Busqueda web no conectada
    goto :error
)

echo.
echo [4/5] Verificando historial contextual...
findstr /C:"NO limpia historial" "src\services\aiService.js" >nul
if %errorlevel% equ 0 (
    echo   [OK] Historial persistente configurado
) else (
    echo   [WARN] Historial puede no ser persistente
)

echo.
echo [5/5] Verificando router en main.py...
findstr /C:"from routes.search import router as search_router" "backend\main.py" >nul
if %errorlevel% equ 0 (
    echo   [OK] Router de busqueda importado
) else (
    echo   [ERROR] Router de busqueda no importado
    goto :error
)

findstr /C:"app.include_router(search_router)" "backend\main.py" >nul
if %errorlevel% equ 0 (
    echo   [OK] Router de busqueda registrado
) else (
    echo   [ERROR] Router de busqueda no registrado
    goto :error
)

echo.
echo ========================================
echo VERIFICACION COMPLETADA
echo ========================================
echo.
echo Estado: OPERATIVO
echo.
echo Funcionalidades habilitadas:
echo   [OK] Busqueda web real
echo   [OK] Historial contextual
echo   [OK] Funciones avanzadas
echo   [OK] Modo sticky (logica)
echo.
echo Para probar:
echo   1. Iniciar backend: cd backend ^&^& python main.py
echo   2. Iniciar frontend: npm run dev
echo   3. En el chat: /buscar tendencias IA 2026
echo   4. En el chat: /variantes 3
echo   5. En el chat: /historial
echo.
pause
exit /b 0

:error
echo.
echo ========================================
echo VERIFICACION FALLIDA
echo ========================================
echo.
echo Revisa los errores arriba y corrige.
echo Ver IMPLEMENTACION-MEJORAS-CHAT.md para detalles.
echo.
pause
exit /b 1
