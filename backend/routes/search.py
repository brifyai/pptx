"""
Ruta de búsqueda web real
Usa DuckDuckGo para búsquedas sin necesidad de API key
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import requests
from bs4 import BeautifulSoup
from typing import List, Optional
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

class SearchRequest(BaseModel):
    query: str
    num_results: Optional[int] = 5

class SearchResult(BaseModel):
    title: str
    url: str
    snippet: str
    content: Optional[str] = None

@router.post("/api/search")
async def search_web(request: SearchRequest):
    """
    Búsqueda web real usando DuckDuckGo
    No requiere API key
    """
    try:
        logger.info(f"🔍 Búsqueda web: {request.query}")
        
        # Usar DuckDuckGo
        results = search_duckduckgo(request.query, request.num_results)
        
        # Enriquecer resultados con contenido
        enriched_results = []
        for result in results[:request.num_results]:
            content = fetch_page_content(result['url'])
            enriched_results.append({
                'title': result['title'],
                'url': result['url'],
                'snippet': result['snippet'],
                'content': content[:2000] if content else result['snippet']
            })
        
        logger.info(f"✅ Encontrados {len(enriched_results)} resultados")
        
        return {
            'query': request.query,
            'results': enriched_results,
            'count': len(enriched_results)
        }
        
    except Exception as e:
        logger.error(f"❌ Error en búsqueda: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

def search_duckduckgo(query: str, num: int) -> List[dict]:
    """Búsqueda usando DuckDuckGo HTML (sin API)"""
    try:
        from duckduckgo_search import DDGS
        
        results = []
        with DDGS() as ddgs:
            for r in ddgs.text(query, max_results=num):
                results.append({
                    'title': r.get('title', ''),
                    'url': r.get('href', ''),
                    'snippet': r.get('body', '')
                })
        
        return results
        
    except ImportError:
        logger.warning("⚠️ duckduckgo-search no instalado, usando fallback")
        return search_fallback(query, num)
    except Exception as e:
        logger.error(f"Error en DuckDuckGo: {e}")
        return search_fallback(query, num)

def search_fallback(query: str, num: int) -> List[dict]:
    """Fallback si DuckDuckGo falla"""
    # Búsqueda básica con requests
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        
        # Usar DuckDuckGo HTML directamente
        url = f"https://html.duckduckgo.com/html/?q={query}"
        response = requests.get(url, headers=headers, timeout=10)
        
        soup = BeautifulSoup(response.text, 'html.parser')
        results = []
        
        for result in soup.find_all('div', class_='result')[:num]:
            title_elem = result.find('a', class_='result__a')
            snippet_elem = result.find('a', class_='result__snippet')
            
            if title_elem:
                results.append({
                    'title': title_elem.get_text(strip=True),
                    'url': title_elem.get('href', ''),
                    'snippet': snippet_elem.get_text(strip=True) if snippet_elem else ''
                })
        
        return results
        
    except Exception as e:
        logger.error(f"Error en fallback: {e}")
        return []

def fetch_page_content(url: str) -> str:
    """Extraer contenido de una página web"""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Remover elementos no deseados
        for element in soup(['script', 'style', 'nav', 'footer', 'header', 'aside']):
            element.decompose()
        
        # Extraer texto
        text = soup.get_text(separator=' ', strip=True)
        
        # Limpiar espacios múltiples
        text = ' '.join(text.split())
        
        return text
        
    except Exception as e:
        logger.warning(f"No se pudo extraer contenido de {url}: {e}")
        return ""

@router.get("/api/search/test")
async def test_search():
    """Endpoint de prueba"""
    return {
        "status": "ok",
        "message": "Servicio de búsqueda web activo",
        "features": ["DuckDuckGo", "Content extraction", "Fallback"]
    }
