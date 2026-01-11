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

REM Instalar dependencias
echo 📥 Instalando dependencias...
pip install -r requirements.txt
echo.

REM Iniciar servidor
echo ✅ Backend listo en http://localhost:8000
echo.
python main.py
