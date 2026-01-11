@echo off
REM Script de prueba de integración end-to-end para Windows
REM Verifica que todos los componentes estén funcionando correctamente

echo 🧪 Iniciando pruebas de integración...
echo.

set PASSED=0
set FAILED=0

REM Test 1: Backend Health Check
echo 📡 Testing Backend...
echo Testing Health Check...
curl -s http://localhost:8000/health | findstr "healthy" >nul
if %errorlevel% equ 0 (
    echo ✅ PASS - Health Check
    set /a PASSED+=1
) else (
    echo ❌ FAIL - Health Check
    set /a FAILED+=1
)

REM Test 2: Backend Root
echo Testing Root Endpoint...
curl -s http://localhost:8000/ | findstr "AI Presentation API" >nul
if %errorlevel% equ 0 (
    echo ✅ PASS - Root Endpoint
    set /a PASSED+=1
) else (
    echo ❌ FAIL - Root Endpoint
    set /a FAILED+=1
)

REM Test 3: Frontend
echo.
echo 🌐 Testing Frontend...
echo Testing Frontend Server...
curl -s -o nul -w "%%{http_code}" http://localhost:5173 | findstr "200" >nul
if %errorlevel% equ 0 (
    echo ✅ PASS - Frontend Server
    set /a PASSED+=1
) else (
    echo ❌ FAIL - Frontend Server
    set /a FAILED+=1
)

REM Test 4: Verificar archivos críticos
echo.
echo 📁 Testing File Structure...

set files=.env backend\main.py backend\pptx_analyzer.py backend\pptx_generator.py backend\database.py src\App.jsx src\services\aiService.js src\services\visionService.js src\services\exportService.js src\components\SlideViewer.jsx src\components\ChatPanel.jsx

for %%f in (%files%) do (
    echo Checking %%f...
    if exist "%%f" (
        echo ✅ EXISTS - %%f
        set /a PASSED+=1
    ) else (
        echo ❌ MISSING - %%f
        set /a FAILED+=1
    )
)

REM Test 5: Verificar variables de entorno
echo.
echo 🔐 Testing Environment Variables...

if exist .env (
    echo Checking VITE_CHUTES_API_KEY...
    findstr "VITE_CHUTES_API_KEY=" .env >nul
    if %errorlevel% equ 0 (
        findstr "tu_chutes_api_key_aqui" .env >nul
        if %errorlevel% neq 0 (
            echo ✅ CONFIGURED - VITE_CHUTES_API_KEY
            set /a PASSED+=1
        ) else (
            echo ⚠️  NOT CONFIGURED - VITE_CHUTES_API_KEY
            set /a FAILED+=1
        )
    ) else (
        echo ❌ NOT FOUND - VITE_CHUTES_API_KEY
        set /a FAILED+=1
    )
    
    echo Checking VITE_BACKEND_URL...
    findstr "VITE_BACKEND_URL=" .env >nul
    if %errorlevel% equ 0 (
        echo ✅ CONFIGURED - VITE_BACKEND_URL
        set /a PASSED+=1
    ) else (
        echo ❌ NOT CONFIGURED - VITE_BACKEND_URL
        set /a FAILED+=1
    )
) else (
    echo ❌ .env file not found
    set /a FAILED+=2
)

REM Resumen
echo.
echo ================================
echo 📊 TEST SUMMARY
echo ================================
echo Passed: %PASSED%
echo Failed: %FAILED%
echo ================================

if %FAILED% equ 0 (
    echo ✅ All tests passed!
    echo.
    echo 🎉 Your application is fully integrated and working!
    exit /b 0
) else (
    echo ❌ Some tests failed
    echo.
    echo 📖 Check TROUBLESHOOTING.md for solutions
    exit /b 1
)
