"""
MappingCache - Gestiona caché de mappings de templates en SQLite

Este módulo proporciona persistencia para los mappings de templates PPTX,
permitiendo reconocimiento instantáneo de templates previamente analizados.

Requirements: 4.1, 4.2, 2.5
"""

import sqlite3
import hashlib
import json
import secrets
from datetime import datetime
from typing import Dict, List, Optional, Any


class MappingCache:
    """Gestiona caché de mappings en SQLite"""
    
    def __init__(self, db_path: str = 'presentations.db'):
        """
        Inicializa el MappingCache.
        
        Args:
            db_path: Ruta al archivo de base de datos SQLite
        """
        self.db_path = db_path
        self._init_tables()
    
    def _init_tables(self) -> None:
        """Asegura que las tablas necesarias existan"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Tabla de templates corporativos
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS corporate_templates (
                id TEXT PRIMARY KEY,
                hash TEXT UNIQUE NOT NULL,
                name TEXT,
                file_path TEXT,
                thumbnail_url TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Tabla de mappings (la "memoria" de la IA)
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS template_mappings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                template_hash TEXT NOT NULL,
                element_id TEXT NOT NULL,
                shape_id INTEGER,
                purpose TEXT NOT NULL,
                coordinates TEXT,
                original_style TEXT,
                user_corrected BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (template_hash) REFERENCES corporate_templates(hash),
                UNIQUE(template_hash, element_id)
            )
        ''')
        
        # Índice para búsqueda rápida por hash
        cursor.execute('''
            CREATE INDEX IF NOT EXISTS idx_mappings_hash 
            ON template_mappings(template_hash)
        ''')
        
        # Índice para búsqueda por hash en corporate_templates
        cursor.execute('''
            CREATE INDEX IF NOT EXISTS idx_templates_hash 
            ON corporate_templates(hash)
        ''')
        
        conn.commit()
        conn.close()
    
    def generate_template_hash(self, pptx_bytes: bytes) -> str:
        """
        Genera hash único del archivo PPTX.
        
        Usa SHA-256 para generar un hash determinístico del contenido
        del archivo, permitiendo identificar templates duplicados.
        
        Args:
            pptx_bytes: Contenido binario del archivo PPTX
            
        Returns:
            Hash hexadecimal de 64 caracteres
            
        Requirements: 4.2
        """
        return hashlib.sha256(pptx_bytes).hexdigest()
    
    def get_cached_mapping(self, template_hash: str) -> Optional[Dict[str, Any]]:
        """
        Recupera mapping desde caché si existe.
        
        Args:
            template_hash: Hash del template a buscar
            
        Returns:
            Diccionario con el mapping completo o None si no existe
            
        Requirements: 4.3, 4.4
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            # Verificar si existe el template
            cursor.execute('''
                SELECT id, name, file_path, thumbnail_url, created_at
                FROM corporate_templates
                WHERE hash = ?
            ''', (template_hash,))
            
            template_row = cursor.fetchone()
            if not template_row:
                return None
            
            # Obtener todos los mappings para este template
            cursor.execute('''
                SELECT element_id, shape_id, purpose, coordinates, 
                       original_style, user_corrected, created_at, updated_at
                FROM template_mappings
                WHERE template_hash = ?
            ''', (template_hash,))
            
            mapping_rows = cursor.fetchall()
            
            elements = []
            shape_mapping = {}
            
            for row in mapping_rows:
                element = {
                    'id': row[0],
                    'shapeId': row[1],
                    'type': row[2],
                    'coordinates': json.loads(row[3]) if row[3] else None,
                    'style': json.loads(row[4]) if row[4] else None,
                    'userCorrected': bool(row[5]),
                    'createdAt': row[6],
                    'updatedAt': row[7]
                }
                elements.append(element)
                
                # Construir shape_mapping: tipo -> shape_id
                if row[1] is not None:  # shape_id
                    shape_mapping[row[2]] = row[1]  # purpose -> shape_id
            
            return {
                'templateHash': template_hash,
                'templateId': template_row[0],
                'templateName': template_row[1],
                'filePath': template_row[2],
                'thumbnailUrl': template_row[3],
                'elements': elements,
                'shapeMapping': shape_mapping,
                'analyzedAt': template_row[4],
                'source': 'cache'
            }
            
        finally:
            conn.close()
    
    def save_mapping(
        self, 
        template_hash: str, 
        mapping: Dict[str, Any],
        template_name: Optional[str] = None,
        file_path: Optional[str] = None,
        thumbnail_url: Optional[str] = None
    ) -> None:
        """
        Guarda mapping en caché.
        
        Args:
            template_hash: Hash único del template
            mapping: Diccionario con elementos y sus mappings
            template_name: Nombre opcional del template
            file_path: Ruta opcional al archivo
            thumbnail_url: URL opcional del thumbnail
            
        Requirements: 4.1
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            # Generar ID único para el template
            template_id = secrets.token_urlsafe(12)
            now = datetime.now().isoformat()
            
            # Insertar o actualizar template
            cursor.execute('''
                INSERT OR REPLACE INTO corporate_templates 
                (id, hash, name, file_path, thumbnail_url, created_at)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (template_id, template_hash, template_name, file_path, thumbnail_url, now))
            
            # Insertar mappings de elementos
            elements = mapping.get('elements', [])
            for element in elements:
                coordinates = element.get('coordinates')
                style = element.get('style')
                
                cursor.execute('''
                    INSERT OR REPLACE INTO template_mappings
                    (template_hash, element_id, shape_id, purpose, coordinates, 
                     original_style, user_corrected, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    template_hash,
                    element.get('id'),
                    element.get('shapeId'),
                    element.get('type', 'UNKNOWN'),
                    json.dumps(coordinates) if coordinates else None,
                    json.dumps(style) if style else None,
                    element.get('userCorrected', False),
                    now,
                    now
                ))
            
            conn.commit()
            
        finally:
            conn.close()
    
    def update_element_type(
        self, 
        template_hash: str, 
        element_id: str, 
        new_type: str
    ) -> bool:
        """
        Actualiza tipo de elemento (corrección manual del usuario).
        
        Cuando el usuario corrige una clasificación incorrecta,
        esta corrección se persiste para futuros usos del mismo template.
        
        Args:
            template_hash: Hash del template
            element_id: ID del elemento a actualizar
            new_type: Nuevo tipo de contenido (TITLE, BODY, etc.)
            
        Returns:
            True si la actualización fue exitosa, False si no se encontró
            
        Requirements: 2.5
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            now = datetime.now().isoformat()
            
            cursor.execute('''
                UPDATE template_mappings
                SET purpose = ?, user_corrected = TRUE, updated_at = ?
                WHERE template_hash = ? AND element_id = ?
            ''', (new_type, now, template_hash, element_id))
            
            rows_affected = cursor.rowcount
            conn.commit()
            
            return rows_affected > 0
            
        finally:
            conn.close()
    
    def delete_mapping(self, template_hash: str) -> bool:
        """
        Elimina un mapping completo de la caché.
        
        Args:
            template_hash: Hash del template a eliminar
            
        Returns:
            True si se eliminó, False si no existía
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            # Eliminar mappings primero (foreign key)
            cursor.execute('''
                DELETE FROM template_mappings
                WHERE template_hash = ?
            ''', (template_hash,))
            
            # Eliminar template
            cursor.execute('''
                DELETE FROM corporate_templates
                WHERE hash = ?
            ''', (template_hash,))
            
            rows_affected = cursor.rowcount
            conn.commit()
            
            return rows_affected > 0
            
        finally:
            conn.close()
    
    def template_exists(self, template_hash: str) -> bool:
        """
        Verifica si un template existe en caché.
        
        Args:
            template_hash: Hash del template a verificar
            
        Returns:
            True si existe, False si no
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                SELECT 1 FROM corporate_templates WHERE hash = ?
            ''', (template_hash,))
            
            return cursor.fetchone() is not None
            
        finally:
            conn.close()
    
    def get_all_templates(self) -> List[Dict[str, Any]]:
        """
        Obtiene lista de todos los templates en caché.
        
        Returns:
            Lista de diccionarios con información básica de cada template
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                SELECT id, hash, name, file_path, thumbnail_url, created_at
                FROM corporate_templates
                ORDER BY created_at DESC
            ''')
            
            rows = cursor.fetchall()
            
            return [
                {
                    'id': row[0],
                    'hash': row[1],
                    'name': row[2],
                    'filePath': row[3],
                    'thumbnailUrl': row[4],
                    'createdAt': row[5]
                }
                for row in rows
            ]
            
        finally:
            conn.close()
