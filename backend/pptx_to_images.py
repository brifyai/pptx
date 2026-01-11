"""
Conversor de PPT a imágenes de alta calidad
Usa LibreOffice en modo headless (gratis, sin marcas de agua, calidad profesional)
"""
import subprocess
import os
import tempfile
import base64
from PIL import Image
import io
from typing import List
import shutil

def find_libreoffice():
    """Encuentra la ruta de LibreOffice en el sistema"""
    possible_paths = [
        r"C:\Program Files\LibreOffice\program\soffice.exe",
        r"C:\Program Files (x86)\LibreOffice\program\soffice.exe",
        r"C:\Program Files\LibreOffice\program\soffice.com",
        "/usr/bin/libreoffice",
        "/usr/bin/soffice",
        "/Applications/LibreOffice.app/Contents/MacOS/soffice"
    ]
    
    for path in possible_paths:
        if os.path.exists(path):
            return path
    
    # Intentar encontrar en PATH
    result = shutil.which("soffice") or shutil.which("libreoffice")
    return result

LIBREOFFICE_PATH = find_libreoffice()

def convert_pptx_to_images(pptx_path: str) -> List[str]:
    """
    Convierte cada slide del PPT a imagen base64 usando LibreOffice
    Calidad profesional, sin marcas de agua
    """
    if not LIBREOFFICE_PATH:
        print("❌ LibreOffice no encontrado")
        return []
    
    print(f"📍 LibreOffice encontrado en: {LIBREOFFICE_PATH}")
    
    try:
        # Crear directorio temporal para las imágenes
        with tempfile.TemporaryDirectory() as temp_dir:
            # Copiar el archivo PPTX al directorio temporal
            pptx_basename = os.path.basename(pptx_path)
            temp_pptx = os.path.join(temp_dir, pptx_basename)
            shutil.copy2(pptx_path, temp_pptx)
            
            print(f"📂 Directorio temporal: {temp_dir}")
            
            # Ejecutar LibreOffice para convertir a PNG
            cmd = [
                LIBREOFFICE_PATH,
                "--headless",
                "--invisible",
                "--convert-to", "png",
                "--outdir", temp_dir,
                temp_pptx
            ]
            
            print(f"🚀 Ejecutando: {' '.join(cmd)}")
            
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=120,
                cwd=temp_dir
            )
            
            if result.returncode != 0:
                print(f"⚠️ LibreOffice stderr: {result.stderr}")
            
            # LibreOffice genera un solo PNG, necesitamos usar PDF como intermedio
            # Intentar método alternativo: convertir a PDF primero
            pdf_path = os.path.join(temp_dir, pptx_basename.replace('.pptx', '.pdf').replace('.ppt', '.pdf'))
            
            # Convertir a PDF
            cmd_pdf = [
                LIBREOFFICE_PATH,
                "--headless",
                "--invisible", 
                "--convert-to", "pdf",
                "--outdir", temp_dir,
                temp_pptx
            ]
            
            print(f"🚀 Convirtiendo a PDF...")
            subprocess.run(cmd_pdf, capture_output=True, timeout=120, cwd=temp_dir)
            
            if os.path.exists(pdf_path):
                print(f"✅ PDF generado: {pdf_path}")
                # Convertir PDF a imágenes usando pdf2image o Pillow
                return convert_pdf_to_images(pdf_path)
            
            # Buscar imágenes PNG generadas directamente
            png_files = sorted([f for f in os.listdir(temp_dir) if f.endswith('.png')])
            
            if not png_files:
                print("⚠️ No se generaron imágenes PNG")
                return []
            
            base64_images = []
            for png_file in png_files:
                png_path = os.path.join(temp_dir, png_file)
                with open(png_path, 'rb') as f:
                    img_data = f.read()
                    img_str = base64.b64encode(img_data).decode()
                    base64_images.append(f"data:image/png;base64,{img_str}")
                    print(f"✅ Imagen convertida: {png_file}")
            
            return base64_images
            
    except subprocess.TimeoutExpired:
        print("❌ Timeout al ejecutar LibreOffice")
        return []
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return []

def convert_pdf_to_images(pdf_path: str) -> List[str]:
    """Convierte PDF a imágenes usando pdf2image o PyMuPDF"""
    try:
        # Intentar con PyMuPDF (fitz) - más ligero
        import fitz  # PyMuPDF
        
        doc = fitz.open(pdf_path)
        base64_images = []
        
        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            # Renderizar a alta resolución (3x para mejor calidad)
            # IMPORTANTE: alpha=False para fondo blanco en lugar de transparente/negro
            mat = fitz.Matrix(3, 3)
            pix = page.get_pixmap(matrix=mat, alpha=False)
            
            img_data = pix.tobytes("png")
            img_str = base64.b64encode(img_data).decode()
            base64_images.append(f"data:image/png;base64,{img_str}")
            print(f"✅ Página {page_num + 1} convertida")
        
        doc.close()
        return base64_images
        
    except ImportError:
        print("⚠️ PyMuPDF no instalado, intentando pdf2image...")
        
        try:
            from pdf2image import convert_from_path
            
            images = convert_from_path(pdf_path, dpi=200)
            base64_images = []
            
            for i, img in enumerate(images):
                img_byte_arr = io.BytesIO()
                img.save(img_byte_arr, format='PNG')
                img_byte_arr.seek(0)
                img_str = base64.b64encode(img_byte_arr.getvalue()).decode()
                base64_images.append(f"data:image/png;base64,{img_str}")
                print(f"✅ Página {i + 1} convertida")
            
            return base64_images
            
        except ImportError:
            print("❌ Ni PyMuPDF ni pdf2image están instalados")
            return []

def generate_placeholder_image(slide_number: int) -> str:
    """Genera una imagen placeholder para slides sin preview"""
    from PIL import Image, ImageDraw, ImageFont
    
    # Crear imagen con aspecto de slide (16:9)
    width, height = 1920, 1080
    img = Image.new('RGB', (width, height), color='#f0f0f0')
    draw = ImageDraw.Draw(img)
    
    # Dibujar borde
    draw.rectangle([10, 10, width-10, height-10], outline='#cccccc', width=2)
    
    # Texto centrado
    text = f"Slide {slide_number}"
    try:
        font = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 72)
    except:
        font = ImageFont.load_default()
    
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    x = (width - text_width) // 2
    y = (height - text_height) // 2
    
    draw.text((x, y), text, fill='#666666', font=font)
    
    # Convertir a base64
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='PNG')
    img_byte_arr.seek(0)
    img_str = base64.b64encode(img_byte_arr.getvalue()).decode()
    
    return f"data:image/png;base64,{img_str}"
