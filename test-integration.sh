#!/bin/bash

# Script de prueba de integración end-to-end
# Verifica que todos los componentes estén funcionando correctamente

echo "🧪 Iniciando pruebas de integración..."
echo ""

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASSED=0
FAILED=0

# Función para test
test_endpoint() {
    local name=$1
    local url=$2
    local expected=$3
    
    echo -n "Testing $name... "
    
    response=$(curl -s "$url")
    
    if echo "$response" | grep -q "$expected"; then
        echo -e "${GREEN}✅ PASS${NC}"
        ((PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC}"
        echo "  Expected: $expected"
        echo "  Got: $response"
        ((FAILED++))
    fi
}

# Test 1: Backend Health Check
echo "📡 Testing Backend..."
test_endpoint "Health Check" "http://localhost:8000/health" "healthy"

# Test 2: Backend Root
test_endpoint "Root Endpoint" "http://localhost:8000/" "AI Presentation API"

# Test 3: Frontend (verificar que responde)
echo ""
echo "🌐 Testing Frontend..."
echo -n "Testing Frontend Server... "

frontend_response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5173)

if [ "$frontend_response" = "200" ]; then
    echo -e "${GREEN}✅ PASS${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ FAIL${NC}"
    echo "  Expected: 200"
    echo "  Got: $frontend_response"
    ((FAILED++))
fi

# Test 4: Verificar archivos críticos
echo ""
echo "📁 Testing File Structure..."

critical_files=(
    ".env"
    "backend/main.py"
    "backend/pptx_analyzer.py"
    "backend/pptx_generator.py"
    "backend/database.py"
    "src/App.jsx"
    "src/services/aiService.js"
    "src/services/visionService.js"
    "src/services/exportService.js"
    "src/components/SlideViewer.jsx"
    "src/components/ChatPanel.jsx"
)

for file in "${critical_files[@]}"; do
    echo -n "Checking $file... "
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ EXISTS${NC}"
        ((PASSED++))
    else
        echo -e "${RED}❌ MISSING${NC}"
        ((FAILED++))
    fi
done

# Test 5: Verificar variables de entorno
echo ""
echo "🔐 Testing Environment Variables..."

if [ -f ".env" ]; then
    echo -n "Checking VITE_CHUTES_API_KEY... "
    if grep -q "VITE_CHUTES_API_KEY=" .env && ! grep -q "tu_chutes_api_key_aqui" .env; then
        echo -e "${GREEN}✅ CONFIGURED${NC}"
        ((PASSED++))
    else
        echo -e "${YELLOW}⚠️  NOT CONFIGURED${NC}"
        ((FAILED++))
    fi
    
    echo -n "Checking VITE_BACKEND_URL... "
    if grep -q "VITE_BACKEND_URL=" .env; then
        echo -e "${GREEN}✅ CONFIGURED${NC}"
        ((PASSED++))
    else
        echo -e "${RED}❌ NOT CONFIGURED${NC}"
        ((FAILED++))
    fi
else
    echo -e "${RED}❌ .env file not found${NC}"
    ((FAILED+=2))
fi

# Resumen
echo ""
echo "================================"
echo "📊 TEST SUMMARY"
echo "================================"
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
echo "================================"

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed!${NC}"
    echo ""
    echo "🎉 Your application is fully integrated and working!"
    exit 0
else
    echo -e "${RED}❌ Some tests failed${NC}"
    echo ""
    echo "📖 Check TROUBLESHOOTING.md for solutions"
    exit 1
fi
