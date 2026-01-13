@echo off
echo ========================================
echo Instalando dependencias del backend
echo ========================================
echo.

cd backend

echo [1/3] Instalando dependencias principales...
pip install -r requirements.txt

echo.
echo [2/3] Verificando instalacion...
python -c "import requests; import bs4; from duckduckgo_search import DDGS; print('✅ Todas las dependencias instaladas correctamente')"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Error: Algunas dependencias no se instalaron correctamente
    echo Intentando instalacion individual...
    pip install requests beautifulsoup4 duckduckgo-search
)

echo.
echo [3/3] Iniciando backend...
cd ..
call start-backend.bat
