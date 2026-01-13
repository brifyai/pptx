"""
Web search and URL fetching routes.
Bypasses CORS restrictions by fetching from server-side.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import requests
from bs4 import BeautifulSoup
import re
from utils.logging_utils import logger

router = APIRouter(prefix="/api", tags=["web"])


class WebSearchRequest(BaseModel):
    url: str


@router.post("/fetch-url")
async def fetch_url(request: WebSearchRequest):
    """
    Fetch content from a URL (bypasses CORS).
    """
    try:
        url = request.url
        
        # Agregar https:// si no tiene protocolo
        if not url.startswith(('http://', 'https://')):
            url = f'https://{url}'
        
        logger.info(f"🌐 Fetching URL: {url}")
        
        # Hacer request con headers de navegador
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
        }
        
        response = requests.get(url, headers=headers, timeout=10, allow_redirects=True)
        response.raise_for_status()
        
        # Parsear HTML
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Extraer título
        title = soup.find('title')
        title_text = title.get_text().strip() if title else url
        
        # Extraer meta description
        meta_desc = soup.find('meta', attrs={'name': 'description'})
        description = meta_desc.get('content', '').strip() if meta_desc else ''
        
        # Extraer meta keywords
        meta_keywords = soup.find('meta', attrs={'name': 'keywords'})
        keywords = meta_keywords.get('content', '').strip() if meta_keywords else ''
        
        # Extraer Open Graph data
        og_title = soup.find('meta', property='og:title')
        og_description = soup.find('meta', property='og:description')
        og_image = soup.find('meta', property='og:image')
        
        og_data = {
            'title': og_title.get('content', '') if og_title else '',
            'description': og_description.get('content', '') if og_description else '',
            'image': og_image.get('content', '') if og_image else ''
        }
        
        # Extraer texto principal (párrafos)
        paragraphs = soup.find_all('p')
        main_text = ' '.join([p.get_text().strip() for p in paragraphs[:10]])  # Primeros 10 párrafos
        
        # Limpiar texto
        main_text = re.sub(r'\s+', ' ', main_text).strip()
        
        # Extraer headings
        headings = []
        for tag in ['h1', 'h2', 'h3']:
            for heading in soup.find_all(tag):
                text = heading.get_text().strip()
                if text:
                    headings.append({'level': tag, 'text': text})
        
        logger.info(f"✅ Fetched {len(main_text)} chars from {url}")
        
        return {
            "success": True,
            "url": url,
            "title": title_text,
            "description": description or og_data['description'],
            "keywords": keywords,
            "og": og_data,
            "headings": headings[:10],  # Primeros 10 headings
            "content": main_text[:2000],  # Primeros 2000 caracteres
            "fullText": main_text[:5000]  # Primeros 5000 caracteres para análisis
        }
        
    except requests.exceptions.Timeout:
        logger.error(f"⏱️ Timeout fetching {url}")
        raise HTTPException(status_code=408, detail="Request timeout")
    
    except requests.exceptions.RequestException as e:
        logger.error(f"❌ Error fetching {url}: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching URL: {str(e)}")
    
    except Exception as e:
        logger.error(f"❌ Unexpected error: {e}")
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")
