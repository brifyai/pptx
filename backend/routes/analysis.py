"""
Analysis routes - PPTX analysis, fonts, content extraction.
"""
from fastapi import APIRouter, UploadFile, File, HTTPException
import tempfile
import os
import json

from pptx import Presentation
from pptx_analyzer import analyze_presentation
from font_detector import analyze_fonts as analyze_pptx_fonts
from utils.logging_utils import logger

router = APIRouter(prefix="/api", tags=["analysis"])


@router.post("/analyze")
async def analyze_ppt(file: UploadFile = File(...)):
    """
    Analiza un archivo PowerPoint y extrae toda su estructura de diseño.
    """
    if not file.filename.endswith(('.pptx', '.ppt')):
        raise HTTPException(status_code=400, detail="Solo se aceptan archivos .pptx")
    
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pptx') as tmp:
            content = await file.read()
            tmp.write(content)
            tmp_path = tmp.name
        
        logger.info(f"📄 Archivo guardado en: {tmp_path}")
        
        analysis = analyze_presentation(tmp_path)
        
        logger.info(f"✅ Análisis completado: {len(analysis['slides'])} slides")
        
        os.unlink(tmp_path)
        
        return {
            "success": True,
            "analysis": analysis,
            "message": f"Análisis completado: {len(analysis['slides'])} diapositivas detectadas"
        }
    
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error al analizar: {str(e)}")


@router.post("/analyze-fonts")
async def analyze_fonts_endpoint(file: UploadFile = File(...)):
    """
    Analiza las fuentes usadas en un PPTX y detecta cuáles faltan.
    """
    if not file.filename.endswith(('.pptx', '.ppt')):
        raise HTTPException(status_code=400, detail="Solo se aceptan archivos .pptx")
    
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pptx') as tmp:
            content = await file.read()
            tmp.write(content)
            tmp_path = tmp.name
        
        logger.info(f"🔤 Analizando fuentes de: {file.filename}")
        
        font_analysis = analyze_pptx_fonts(tmp_path)
        
        os.unlink(tmp_path)
        
        logger.info(f"✅ Análisis de fuentes completado: {font_analysis['summary']}")
        
        return {
            "success": True,
            "fileName": file.filename,
            **font_analysis
        }
    
    except Exception as e:
        logger.error(f"❌ Error analizando fuentes: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error al analizar fuentes: {str(e)}")


@router.post("/extract-content")
async def extract_content(file: UploadFile = File(...)):
    """
    Extrae solo el contenido de texto de un PPTX (sin diseño).
    """
    if not file.filename.endswith(('.pptx', '.ppt')):
        raise HTTPException(status_code=400, detail="Solo se aceptan archivos .pptx")
    
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pptx') as tmp:
            content = await file.read()
            tmp.write(content)
            tmp_path = tmp.name
        
        logger.info(f"📄 Extrayendo contenido de: {tmp_path}")
        
        prs = Presentation(tmp_path)
        
        extracted_slides = []
        
        for slide_idx, slide in enumerate(prs.slides):
            slide_content = {
                "slideNumber": slide_idx + 1,
                "type": "content",
                "texts": []
            }
            
            for shape in slide.shapes:
                if shape.has_text_frame:
                    text = shape.text_frame.text.strip()
                    if text:
                        text_type = "body"
                        if shape.is_placeholder:
                            placeholder_type = shape.placeholder_format.type
                            if placeholder_type == 1:
                                text_type = "title"
                            elif placeholder_type == 2:
                                text_type = "subtitle"
                        
                        if '\n' in text and text_type == "body":
                            bullets = [line.strip() for line in text.split('\n') if line.strip()]
                            slide_content["texts"].append({
                                "type": "bullets",
                                "content": bullets
                            })
                        else:
                            slide_content["texts"].append({
                                "type": text_type,
                                "content": text
                            })
            
            if slide_idx == 0 or any(t["type"] == "title" for t in slide_content["texts"]):
                slide_content["type"] = "title"
            
            extracted_slides.append(slide_content)
        
        os.unlink(tmp_path)
        
        logger.info(f"✅ Contenido extraído: {len(extracted_slides)} slides")
        
        return {
            "success": True,
            "fileName": file.filename,
            "slideCount": len(extracted_slides),
            "slides": extracted_slides
        }
    
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error al extraer contenido: {str(e)}")
