"""
Script de prueba para verificar que el backend funciona correctamente
"""
import requests
import time

def test_backend():
    print("🧪 Probando Backend...")
    print()
    
    # Test 1: Health Check
    print("[1/3] Health Check...")
    try:
        response = requests.get('http://localhost:8000/health', timeout=5)
        if response.status_code == 200:
            print(f"✅ Health Check OK: {response.json()}")
        else:
            print(f"❌ Health Check falló: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error conectando al backend: {e}")
        return False
    
    print()
    
    # Test 2: Root Endpoint
    print("[2/3] Root Endpoint...")
    try:
        response = requests.get('http://localhost:8000/', timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Root OK - Version: {data.get('version')}")
        else:
            print(f"❌ Root falló: {response.status_code}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    print()
    
    # Test 3: Search Test Endpoint
    print("[3/3] Search Test Endpoint...")
    try:
        response = requests.get('http://localhost:8000/api/search/test', timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Search Test OK: {data.get('message')}")
            print(f"   Features: {', '.join(data.get('features', []))}")
        else:
            print(f"❌ Search Test falló: {response.status_code}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    print()
    print("=" * 50)
    print("✅ BACKEND FUNCIONANDO CORRECTAMENTE")
    print("=" * 50)
    return True

if __name__ == "__main__":
    test_backend()
