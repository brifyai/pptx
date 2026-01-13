@echo off
echo 🚀 Iniciando Backend Python...
echo.

cd backend

REM Verificar si existe el entorno virtual
if not exist "venv" (
    echo 📦 Creando entorno virtual...
    python -m venv venv
    echo.
)

REM Activar entorno virtual
call venv\Scripts\activate

REM Instalar/actualizar dependencias
echo 📥 Instalando dependencias...
pip install -r requirements.txt --quiet
echo.

REM Verificar dependencias críticas
echo 🔍 Verificando dependencias...
python -c "import requests; from bs4 import BeautifulSoup; from duckduckgo_search import DDGS; print('✅ Todas las dependencias OK')" 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️ Instalando dependencias faltantes...
    pip install requests beautifulsoup4 duckduckgo-search
)
echo.

REM Iniciar servidor
echo ✅ Backend listo en http://localhost:8000
echo 📝 Presiona Ctrl+C para detener
echo.
python main.py
