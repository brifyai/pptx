@echo off
echo 🚀 Iniciando Frontend React...
echo.

REM Instalar dependencias si es necesario
if not exist "node_modules" (
    echo 📦 Instalando dependencias...
    npm install
    echo.
)

REM Iniciar servidor de desarrollo
echo ✅ Frontend listo en http://localhost:3006
echo.
npm run dev
