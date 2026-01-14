"""
Extractor de SmartArt para PPTX
Extrae texto de diagramas SmartArt para permitir modificación con IA
"""
import zipfile
import os
import tempfile
import re
from typing import Dict, List, Any, Optional
from lxml import etree


def extract_smartart_from_pptx(pptx_path: str) -> List[Dict[str, Any]]:
    """
    Extrae todo el SmartArt de un PPTX.
    
    Args:
        pptx_path: Ruta al archivo PPTX
    
    Returns:
        Lista de diccionarios con información de SmartArt
    """
    smartart_items = []
    
    try:
        # Extraer PPTX temporalmente
        temp_dir = tempfile.mkdtemp()
        with zipfile.ZipFile(pptx_path, 'r') as zip_ref:
            zip_ref.extractall(temp_dir)
        
        # Buscar todos los archivos de slides
        slides_dir = os.path.join(temp_dir, 'ppt', 'slides')
        if not os.path.exists(slides_dir):
            return []
        
        slide_files = [f for f in os.listdir(slides_dir) 
                      if f.startswith('slide') and f.endswith('.xml')]
        
        for slide_file in sorted(slide_files):
            slide_path = os.path.join(slides_dir, slide_file)
            slide_num = int(slide_file.replace('slide', '').replace('.xml', ''))
            
            # Extraer SmartArt de este slide
            slide_smartart = extract_smartart_from_xml(slide_path, slide_num)
            smartart_items.extend(slide_smartart)
        
        # Limpiar
        import shutil
        shutil.rmtree(temp_dir)
        
    except Exception as e:
        print(f"⚠️ Error extrayendo SmartArt: {e}")
    
    return smartart_items


def extract_smartart_from_xml(slide_path: str, slide_num: int) -> List[Dict[str, Any]]:
    """
    Extrae SmartArt de un archivo XML de slide.
    
    Args:
        slide_path: Ruta al archivo XML del slide
        slide_num: Número del slide (para referencia)
    
    Returns:
        Lista de diccionarios con SmartArt
    """
    smartart_items = []
    
    try:
        tree = etree.parse(slide_path)
        root = tree.getroot()
        
        namespaces = {
            'p': 'http://schemas.openxmlformats.org/presentationml/2006/main',
            'a': 'http://schemas.openxmlformats.org/drawingml/2006/main',
            'dgm': 'http://schemas.openxmlformats.org/drawingml/2006/diagram',
        }
        
        # Buscar elementos de diagramas (SmartArt)
        # Los SmartArt se almacenan como graphicFrame con datos de diagrama
        graphic_frames = root.findall('.//p:graphicFrame', namespaces)
        
        for idx, gf in enumerate(graphic_frames):
            # Verificar si es un diagrama
            graphic = gf.find('.//a:graphic', namespaces)
            if graphic is None:
                continue
            
            graphic_data = graphic.find('.//a:graphicData', namespaces)
            if graphic_data is None:
                continue
            
            # Verificar si es un diagrama (SmartArt)
            diagram_data = graphic_data.find('.//dgm:diagramData', namespaces)
            if diagram_data is None:
                continue
            
            # Es SmartArt - extraer información
            smartart = {
                'slide_number': slide_num,
                'graphic_frame_id': idx,
                'type': 'smartart',
                'text_content': [],
                'structure': {}
            }
            
            # Extraer texto de los nodos del diagrama
            text_content = extract_diagram_text(diagram_data, namespaces)
            smartart['text_content'] = text_content
            
            # Extraer estructura del diagrama
            structure = extract_diagram_structure(diagram_data, namespaces)
            smartart['structure'] = structure
            
            if text_content:
                smartart_items.append(smartart)
                print(f"   📊 SmartArt encontrado en slide {slide_num}: {len(text_content)} nodos de texto")
        
        # También buscar diagramas en otras ubicaciones
        # Buscar por elementos dgm:*
        for elem in root.iter():
            if 'diagramData' in elem.tag or 'diagram' in elem.tag.lower():
                tag_name = elem.tag.split('}')[-1] if '}' in elem.tag else elem.tag
                print(f"   📊 Elemento diagrama encontrado: {tag_name}")
        
    except Exception as e:
        print(f"⚠️ Error extrayendo SmartArt del slide {slide_num}: {e}")
    
    return smartart_items


def extract_diagram_text(diagram_data, namespaces) -> List[Dict[str, str]]:
    """
    Extrae el texto de los nodos de un diagrama.
    
    Args:
        diagram_data: Elemento XML del diagrama
        namespaces: Diccionario de namespaces
    
    Returns:
        Lista de diccionarios con texto y tipo de nodo
    """
    text_nodes = []
    
    try:
        # Buscar nodos de datos del diagrama
        # Los nodos pueden estar en diferentes estructuras
        
        # Método 1: Buscar pt (point nodes)
        points = diagram_data.findall('.//dgm:pt', namespaces)
        for pt in points:
            node_data = {}
            
            # ID del nodo
            node_id = pt.get('id')
            if node_id:
                node_data['id'] = node_id
            
            # Tipo de nodo (si está disponible)
            type_attr = pt.get('type')
            if type_attr:
                node_data['type'] = type_attr
            
            # Texto del nodo
            txBody = pt.find('.//a:txBody', namespaces)
            if txBody is not None:
                paragraphs = txBody.findall('.//a:p', namespaces)
                texts = []
                for para in paragraphs:
                    # Concatenar todo el texto del párrafo
                    para_text = ''.join(t.text for t in para.findall('.//a:t', namespaces) if t.text)
                    if para_text:
                        texts.append(para_text)
                
                if texts:
                    node_data['text'] = ' '.join(texts)
            
            if 'text' in node_data:
                text_nodes.append(node_data)
        
        # Método 2: Buscar en otras estructuras de diagrama
        # Buscar elementos con texto directamente
        for elem in diagram_data.iter():
            if 'txBody' in elem.tag or 't' in elem.tag:
                # Ya procesado arriba
                pass
            
            # Buscar elementos con属性 de texto
            for child in elem:
                tag = child.tag.split('}')[-1] if '}' in child.tag else child.tag
                if tag in ['t', 'txBody', 'p']:
                    text = ''.join(t.text for t in child.findall('.//a:t') if t.text) if hasattr(child, 'findall') else ''
                    if text and len(text) > 2:
                        # Evitar duplicados
                        if not any(n.get('text') == text for n in text_nodes):
                            text_nodes.append({'text': text, 'type': 'node'})
        
    except Exception as e:
        print(f"⚠️ Error extrayendo texto del diagrama: {e}")
    
    return text_nodes


def extract_diagram_structure(diagram_data, namespaces) -> Dict[str, Any]:
    """
    Extrae la estructura jerárquica de un diagrama.
    
    Args:
        diagram_data: Elemento XML del diagrama
        namespaces: Diccionario de namespaces
    
    Returns:
        Diccionario con la estructura del diagrama
    """
    structure = {
        'nodes': {},
        'relationships': []
    }
    
    try:
        # Extraer nodos
        points = diagram_data.findall('.//dgm:pt', namespaces)
        for pt in points:
            node_id = pt.get('id')
            if node_id:
                node_type = pt.get('type', 'unknown')
                structure['nodes'][node_id] = {
                    'type': node_type,
                    'parent': None,
                    'children': []
                }
        
        # Extraer relaciones (cuáles nodos son padres de cuáles)
        cxnNodes = diagram_data.findall('.//dgm:cxnNode', namespaces)
        for cxn in cxnNodes:
            src_id = cxn.get('srcId')
            dst_id = cxn.get('dstId')
            if src_id and dst_id:
                relationship = {'from': src_id, 'to': dst_id}
                structure['relationships'].append(relationship)
                
                # Actualizar estructura de nodos
                if src_id in structure['nodes']:
                    structure['nodes'][src_id]['children'].append(dst_id)
                if dst_id in structure['nodes']:
                    structure['nodes'][dst_id]['parent'] = src_id
        
    except Exception as e:
        print(f"⚠️ Error extrayendo estructura del diagrama: {e}")
    
    return structure


def modify_smartart_text(smartart_item: Dict[str, Any], 
                         new_content: Dict[str, str]) -> Dict[str, Any]:
    """
    Prepara modificaciones de texto para SmartArt.
    
    Args:
        smartart_item: Item de SmartArt extraído
        new_content: Diccionario con nuevo contenido {node_id: new_text}
    
    Returns:
        Diccionario con modificaciones preparadas
    """
    modification = {
        'slide_number': smartart_item['slide_number'],
        'graphic_frame_id': smartart_item['graphic_frame_id'],
        'changes': []
    }
    
    for node_id, new_text in new_content.items():
        modification['changes'].append({
            'node_id': node_id,
            'new_text': new_text
        })
    
    return modification


def create_smartart_replacement_xml(smartart_item: Dict[str, Any],
                                    modifications: List[Dict[str, str]]) -> str:
    """
    Crea XML modificado para SmartArt con nuevo contenido.
    
    Args:
        smartart_item: Item de SmartArt original
        modifications: Lista de modificaciones
    
    Returns:
        String con XML modificado (para usar en el clonador)
    """
    # Esta función genera las modificaciones necesarias
    # para aplicar al XML del slide
    
    xml_modifications = []
    
    for mod in modifications:
        node_id = mod['node_id']
        new_text = mod['new_text']
        
        # Buscar el nodo en el texto original
        for text_node in smartart_item['text_content']:
            if text_node.get('id') == node_id:
                xml_modifications.append({
                    'xpath': f".//dgm:pt[@id='{node_id}']//a:t",
                    'old_text': text_node.get('text', ''),
                    'new_text': new_text
                })
                break
    
    return xml_modifications


def analyze_smartart_for_ai(smartart_data: Dict[str, Any]) -> str:
    """
    Genera una descripción del SmartArt para enviar a la IA.
    
    Args:
        smartart_data: Datos del SmartArt extraído
    
    Returns:
        Descripción textual del SmartArt
    """
    description = []
    
    slide = smartart_data.get('slide_number', 0)
    text_content = smartart_data.get('text_content', [])
    structure = smartart_data.get('structure', {})
    
    description.append(f"SmartArt en slide {slide}:")
    description.append(f"Nodos de texto: {len(text_content)}")
    
    # Contenido de texto
    if text_content:
        description.append("\nContenido de nodos:")
        for idx, node in enumerate(text_content[:5]):
            text = node.get('text', '')[:40]
            node_type = node.get('type', 'node')
            description.append(f"  {idx+1}. [{node_type}] {text}")
        
        if len(text_content) > 5:
            description.append(f"  ... y {len(text_content) - 5} nodos más")
    
    # Estructura
    nodes = structure.get('nodes', {})
    relationships = structure.get('relationships', [])
    
    if nodes:
        description.append(f"\nEstructura: {len(nodes)} nodos, {len(relationships)} relaciones")
        
        # Contar tipos de nodos
        node_types = {}
        for node_id, node_info in nodes.items():
            node_type = node_info.get('type', 'unknown')
            node_types[node_type] = node_types.get(node_type, 0) + 1
        
        if node_types:
            description.append("Tipos de nodos:")
            for ntype, count in node_types.items():
                description.append(f"  - {ntype}: {count}")
    
    return '\n'.join(description)


def extract_process_steps(diagram_data, namespaces) -> List[Dict[str, str]]:
    """
    Extrae pasos de un diagrama de proceso.
    
    Args:
        diagram_data: Elemento XML del diagrama
        namespaces: Diccionario de namespaces
    
    Returns:
        Lista de pasos del proceso
    """
    steps = []
    
    try:
        # Buscar nodos en orden
        points = diagram_data.findall('.//dgm:pt', namespaces)
        
        for pt in points:
            step_data = {}
            
            # ID del paso
            step_id = pt.get('id')
            if step_id:
                step_data['id'] = step_id
            
            # Orden (si está disponible)
            order = pt.get('orderId')
            if order:
                step_data['order'] = order
            
            # Texto del paso
            txBody = pt.find('.//a:txBody', namespaces)
            if txBody is not None:
                paragraphs = txBody.findall('.//a:p', namespaces)
                texts = []
                for para in paragraphs:
                    para_text = ''.join(t.text for t in para.findall('.//a:t', namespaces) if t.text)
                    if para_text:
                        texts.append(para_text)
                
                if texts:
                    step_data['text'] = ' '.join(texts)
            
            if 'text' in step_data:
                steps.append(step_data)
    
    except Exception as e:
        print(f"⚠️ Error extrayendo pasos del proceso: {e}")
    
    return steps


def extract_hierarchy_text(diagram_data, namespaces) -> Dict[str, Any]:
    """
    Extrae texto de una jerarquía (organigrama).
    
    Args:
        diagram_data: Elemento XML del diagrama
        namespaces: Diccionario de namespaces
    
    Returns:
        Diccionario con niveles jerárquicos
    """
    hierarchy = {
        'levels': {},
        'root': None,
        'children': {}
    }
    
    try:
        # Extraer nodos
        points = diagram_data.findall('.//dgm:pt', namespaces)
        
        for pt in points:
            node_id = pt.get('id')
            if not node_id:
                continue
            
            # Determinar nivel (aproximado por posición en el documento)
            node_type = pt.get('type', 'unknown')
            
            # Extraer texto
            txBody = pt.find('.//a:txBody', namespaces)
            text = ''
            if txBody is not None:
                paragraphs = txBody.findall('.//a:p', namespaces)
                texts = []
                for para in paragraphs:
                    para_text = ''.join(t.text for t in para.findall('.//a:t', namespaces) if t.text)
                    if para_text:
                        texts.append(para_text)
                text = ' '.join(texts)
            
            if text:
                hierarchy['levels'][node_id] = {
                    'text': text,
                    'type': node_type
                }
        
        # Extraer relaciones padre-hijo
        cxnNodes = diagram_data.findall('.//dgm:cxnNode', namespaces)
        for cxn in cxnNodes:
            src_id = cxn.get('srcId')
            dst_id = cxn.get('dstId')
            if src_id and dst_id:
                if src_id not in hierarchy['children']:
                    hierarchy['children'][src_id] = []
                hierarchy['children'][src_id].append(dst_id)
        
        # Encontrar nodo raíz (el que no es hijo de nadie)
        all_children = set()
        for children in hierarchy['children'].values():
            all_children.update(children)
        
        for node_id in hierarchy['levels']:
            if node_id not in all_children:
                hierarchy['root'] = node_id
                break
    
    except Exception as e:
        print(f"⚠️ Error extrayendo jerarquía: {e}")
    
    return hierarchy


def extract_relationship_text(diagram_data, namespaces) -> List[Dict[str, str]]:
    """
    Extrae texto de un diagrama de relaciones.
    
    Args:
        diagram_data: Elemento XML del diagrama
        namespaces: Diccionario de namespaces
    
    Returns:
        Lista de elementos relacionados
    """
    relationships = []
    
    try:
        points = diagram_data.findall('.//dgm:pt', namespaces)
        
        for pt in points:
            rel_data = {}
            
            rel_id = pt.get('id')
            if rel_id:
                rel_data['id'] = rel_id
            
            # Posición en el diagrama
            x = pt.get('x')
            y = pt.get('y')
            if x and y:
                rel_data['position'] = {'x': x, 'y': y}
            
            # Texto
            txBody = pt.find('.//a:txBody', namespaces)
            if txBody is not None:
                paragraphs = txBody.findall('.//a:p', namespaces)
                texts = []
                for para in paragraphs:
                    para_text = ''.join(t.text for t in para.findall('.//a:t', namespaces) if t.text)
                    if para_text:
                        texts.append(para_text)
                
                if texts:
                    rel_data['text'] = ' '.join(texts)
            
            if 'text' in rel_data:
                relationships.append(rel_data)
    
    except Exception as e:
        print(f"⚠️ Error extrayendo relaciones: {e}")
    
    return relationships


# Función de prueba
if __name__ == '__main__':
    import sys
    
    if len(sys.argv) < 2:
        print("Uso: python smartart_extractor.py <archivo.pptx>")
        sys.exit(1)
    
    pptx_path = sys.argv[1]
    
    print(f"📊 Extrayendo SmartArt de: {pptx_path}")
    smartart = extract_smartart_from_pptx(pptx_path)
    
    print(f"\n📊 Total de elementos SmartArt encontrados: {len(smartart)}")
    
    for idx, sa in enumerate(smartart):
        print(f"\n--- SmartArt {idx + 1} (Slide {sa['slide_number']}) ---")
        print(f"   Nodos de texto: {len(sa['text_content'])}")
        for node in sa['text_content'][:5]:  # Mostrar max 5
            print(f"   - [{node.get('id', 'N/A')}] {node.get('text', '')[:50]}...")
        
        if len(sa['text_content']) > 5:
            print(f"   ... y {len(sa['text_content']) - 5} más")