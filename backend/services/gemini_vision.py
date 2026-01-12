"""
Gemini Vision API service for template analysis.
"""
import os
import json
import re
import asyncio
import httpx
from typing import Any, Dict
from fastapi import HTTPException

from utils.logging_utils import logger

# Gemini Vision API configuration
GEMINI_API_KEY = os.environ.get('VITE_GEMINI_API_KEY', os.environ.get('GEMINI_API_KEY', ''))
GEMINI_MODEL = os.environ.get('VITE_GEMINI_MODEL', 'gemini-1.5-flash')
GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models'

# Valid element types
VALID_ELEMENT_TYPES = ['TITLE', 'SUBTITLE', 'BODY', 'FOOTER', 'IMAGE_HOLDER', 'CHART_AREA', 'UNKNOWN']

# Technical prompt for template layout analysis
TEMPLATE_ANALYSIS_PROMPT = """Actúa como un analizador experto de XML de PowerPoint.

Tarea: Analiza la imagen adjunta e identifica todos los contenedores de contenido (placeholders).

Instrucciones de Extracción:
1. Identifica el propósito de cada área: TITLE, SUBTITLE, BODY, FOOTER, IMAGE_HOLDER, o CHART_AREA
2. Devuelve las coordenadas en formato normalizado (0-1000) para top, left, width, height
3. Identifica atributos visuales: font_color (hex), text_alignment (left, center, right), y background_color
4. Estima el "Z-index" (orden de capas) si hay elementos superpuestos

Formato de salida: JSON puro. No agregues explicaciones.

{
  "slide_metadata": { "aspect_ratio": "16:9" },
  "elements": [
    {
      "id": "element_1",
      "type": "TITLE",
      "coordinates": {"top": 50, "left": 100, "width": 800, "height": 100},
      "style": {"color": "#2C3E50", "align": "center"},
      "confidence": 0.95
    }
  ]
}"""


async def call_gemini_vision_api(base64_data: str) -> dict:
    """
    Make a single Gemini Vision API call.
    
    Args:
        base64_data: Base64 encoded image data (without prefix)
        
    Returns:
        Raw JSON response from Gemini
        
    Raises:
        Exception if API call fails
    """
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY not configured")
    
    url = f"{GEMINI_API_URL}/{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}"
    
    payload = {
        "contents": [
            {
                "parts": [
                    {"text": TEMPLATE_ANALYSIS_PROMPT},
                    {
                        "inline_data": {
                            "mime_type": "image/png",
                            "data": base64_data
                        }
                    }
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.2,
            "maxOutputTokens": 4096,
            "responseMimeType": "application/json"
        }
    }
    
    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(url, json=payload)
        
        if response.status_code != 200:
            error_data = response.json() if response.content else {}
            error_msg = error_data.get('error', {}).get('message', 'Unknown error')
            raise Exception(f"Gemini API Error: {response.status_code} - {error_msg}")
        
        data = response.json()
        text_content = data.get('candidates', [{}])[0].get('content', {}).get('parts', [{}])[0].get('text', '{}')
        
        json_match = re.search(r'\{[\s\S]*\}', text_content)
        if not json_match:
            raise Exception('No valid JSON found in Gemini response')
        
        return json.loads(json_match.group(0))


def normalize_coordinate(value: Any) -> int:
    """Normalize a coordinate value to the range [0, 1000]"""
    if not isinstance(value, (int, float)):
        return 0
    return max(0, min(1000, round(value)))


def validate_element_type(element_type: str) -> str:
    """Validate and normalize element type"""
    if not isinstance(element_type, str):
        return 'UNKNOWN'
    upper_type = element_type.upper().strip()
    return upper_type if upper_type in VALID_ELEMENT_TYPES else 'UNKNOWN'


def parse_vision_response(raw_response: dict) -> dict:
    """
    Parse and validate Gemini Vision response for template analysis.
    Normalizes coordinates to range [0, 1000] and validates element types.
    """
    if not raw_response or not isinstance(raw_response, dict):
        return {
            'slide_metadata': {'aspect_ratio': '16:9'},
            'elements': []
        }
    
    slide_metadata = {
        'aspect_ratio': raw_response.get('slide_metadata', {}).get('aspect_ratio', '16:9')
    }
    
    raw_elements = raw_response.get('elements', [])
    if not isinstance(raw_elements, list):
        raw_elements = []
    
    elements = []
    for idx, element in enumerate(raw_elements):
        if not isinstance(element, dict):
            continue
            
        coords = element.get('coordinates', {})
        normalized_coords = {
            'top': normalize_coordinate(coords.get('top')),
            'left': normalize_coordinate(coords.get('left')),
            'width': normalize_coordinate(coords.get('width')),
            'height': normalize_coordinate(coords.get('height'))
        }
        
        validated_type = validate_element_type(element.get('type', 'UNKNOWN'))
        
        style = element.get('style', {})
        normalized_style = {
            'color': style.get('color', '#000000') if isinstance(style.get('color'), str) else '#000000',
            'align': style.get('align', 'left') if style.get('align') in ['left', 'center', 'right'] else 'left',
            'backgroundColor': style.get('backgroundColor') if isinstance(style.get('backgroundColor'), str) else None
        }
        
        confidence = element.get('confidence', 0.5)
        if not isinstance(confidence, (int, float)):
            confidence = 0.5
        confidence = max(0, min(1, confidence))
        
        elements.append({
            'id': element.get('id', f'element_{idx + 1}'),
            'type': validated_type,
            'coordinates': normalized_coords,
            'style': normalized_style,
            'confidence': confidence,
            'shapeId': None
        })
    
    return {
        'slide_metadata': slide_metadata,
        'elements': elements
    }


async def analyze_with_retry(image_base64: str, max_retries: int = 2) -> dict:
    """
    Analyze template layout with retry logic and exponential backoff.
    
    Args:
        image_base64: Base64 encoded image of the slide
        max_retries: Maximum number of retries (default: 2)
        
    Returns:
        Parsed vision response with elements
        
    Raises:
        HTTPException if all retries fail
    """
    base64_data = image_base64
    if image_base64.startswith('data:'):
        base64_data = image_base64.split(',', 1)[1] if ',' in image_base64 else image_base64
    
    last_error = None
    
    for attempt in range(max_retries + 1):
        try:
            if attempt > 0:
                backoff_ms = 1000 * attempt
                logger.info(f"⏳ Retry attempt {attempt}/{max_retries} after {backoff_ms}ms backoff...")
                await asyncio.sleep(backoff_ms / 1000)
            
            raw_result = await call_gemini_vision_api(base64_data)
            logger.info('📄 Raw Gemini response received')
            
            parsed = parse_vision_response(raw_result)
            
            if len(parsed['elements']) == 0 and attempt < max_retries:
                logger.warning('⚠️ Empty elements array, retrying...')
                last_error = Exception('Gemini returned empty elements array')
                continue
            
            logger.info(f"✅ Template analysis completed with {len(parsed['elements'])} elements")
            return parsed
            
        except Exception as e:
            last_error = e
            logger.error(f"❌ Attempt {attempt + 1}/{max_retries + 1} failed: {str(e)}")
            
            if attempt == max_retries:
                break
    
    raise HTTPException(
        status_code=500, 
        detail=f"Gemini Vision analysis failed after {max_retries + 1} attempts: {str(last_error)}"
    )
