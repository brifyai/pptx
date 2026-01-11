import sqlite3
import json
import secrets
from datetime import datetime
from typing import Dict, List, Optional, Any

class PresentationDB:
    def __init__(self, db_path='presentations.db'):
        self.db_path = db_path
        self.init_db()
    
    def init_db(self):
        """Inicializar base de datos"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Tabla de presentaciones
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS presentations (
                id TEXT PRIMARY KEY,
                owner TEXT,
                title TEXT,
                template_data TEXT,
                slides_data TEXT,
                extracted_assets TEXT,
                permissions TEXT,
                created_at TEXT,
                last_modified TEXT
            )
        ''')
        
        # Tabla de cambios en tiempo real (para sincronización)
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS changes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                presentation_id TEXT,
                user TEXT,
                change_type TEXT,
                change_data TEXT,
                timestamp TEXT,
                FOREIGN KEY (presentation_id) REFERENCES presentations(id)
            )
        ''')
        
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
        print("✅ Base de datos inicializada")
    
    def generate_id(self) -> str:
        """Generar ID único para presentación"""
        return secrets.token_urlsafe(12)
    
    def create_presentation(
        self, 
        owner: str,
        title: str,
        template_data: Dict,
        slides_data: List[Dict],
        extracted_assets: Optional[Dict] = None,
        permissions: Optional[Dict] = None
    ) -> str:
        """Crear nueva presentación compartida"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        presentation_id = self.generate_id()
        now = datetime.now().isoformat()
        
        if permissions is None:
            permissions = {
                "view": ["anyone"],
                "edit": [owner]
            }
        
        cursor.execute('''
            INSERT INTO presentations 
            (id, owner, title, template_data, slides_data, extracted_assets, permissions, created_at, last_modified)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            presentation_id,
            owner,
            title,
            json.dumps(template_data),
            json.dumps(slides_data),
            json.dumps(extracted_assets) if extracted_assets else None,
            json.dumps(permissions),
            now,
            now
        ))
        
        conn.commit()
        conn.close()
        
        print(f"✅ Presentación creada: {presentation_id}")
        return presentation_id
    
    def get_presentation(self, presentation_id: str) -> Optional[Dict]:
        """Obtener presentación por ID"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, owner, title, template_data, slides_data, extracted_assets, 
                   permissions, created_at, last_modified
            FROM presentations
            WHERE id = ?
        ''', (presentation_id,))
        
        row = cursor.fetchone()
        conn.close()
        
        if not row:
            return None
        
        return {
            "id": row[0],
            "owner": row[1],
            "title": row[2],
            "templateData": json.loads(row[3]),
            "slidesData": json.loads(row[4]),
            "extractedAssets": json.loads(row[5]) if row[5] else None,
            "permissions": json.loads(row[6]),
            "createdAt": row[7],
            "lastModified": row[8]
        }
    
    def update_presentation(
        self,
        presentation_id: str,
        slides_data: List[Dict],
        user: str
    ) -> bool:
        """Actualizar slides de presentación"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        now = datetime.now().isoformat()
        
        cursor.execute('''
            UPDATE presentations
            SET slides_data = ?, last_modified = ?
            WHERE id = ?
        ''', (json.dumps(slides_data), now, presentation_id))
        
        # Registrar cambio
        cursor.execute('''
            INSERT INTO changes (presentation_id, user, change_type, change_data, timestamp)
            VALUES (?, ?, ?, ?, ?)
        ''', (presentation_id, user, 'update_slides', json.dumps(slides_data), now))
        
        conn.commit()
        conn.close()
        
        return True
    
    def update_slide(
        self,
        presentation_id: str,
        slide_index: int,
        slide_data: Dict,
        user: str
    ) -> bool:
        """Actualizar un slide específico"""
        presentation = self.get_presentation(presentation_id)
        if not presentation:
            return False
        
        slides = presentation['slidesData']
        if slide_index < 0 or slide_index >= len(slides):
            return False
        
        slides[slide_index] = slide_data
        
        return self.update_presentation(presentation_id, slides, user)
    
    def get_recent_changes(self, presentation_id: str, since: Optional[str] = None) -> List[Dict]:
        """Obtener cambios recientes para sincronización"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        if since:
            cursor.execute('''
                SELECT id, user, change_type, change_data, timestamp
                FROM changes
                WHERE presentation_id = ? AND timestamp > ?
                ORDER BY timestamp ASC
            ''', (presentation_id, since))
        else:
            cursor.execute('''
                SELECT id, user, change_type, change_data, timestamp
                FROM changes
                WHERE presentation_id = ?
                ORDER BY timestamp DESC
                LIMIT 50
            ''', (presentation_id,))
        
        rows = cursor.fetchall()
        conn.close()
        
        return [
            {
                "id": row[0],
                "user": row[1],
                "changeType": row[2],
                "changeData": json.loads(row[3]),
                "timestamp": row[4]
            }
            for row in rows
        ]
    
    def check_permission(self, presentation_id: str, user: str, permission_type: str) -> bool:
        """Verificar si usuario tiene permiso"""
        presentation = self.get_presentation(presentation_id)
        if not presentation:
            return False
        
        permissions = presentation['permissions']
        
        # Owner siempre tiene todos los permisos
        if user == presentation['owner']:
            return True
        
        # Verificar permiso específico
        if permission_type in permissions:
            allowed_users = permissions[permission_type]
            return 'anyone' in allowed_users or user in allowed_users
        
        return False
    
    def update_permissions(
        self,
        presentation_id: str,
        permissions: Dict,
        user: str
    ) -> bool:
        """Actualizar permisos de presentación"""
        presentation = self.get_presentation(presentation_id)
        if not presentation or presentation['owner'] != user:
            return False
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            UPDATE presentations
            SET permissions = ?
            WHERE id = ?
        ''', (json.dumps(permissions), presentation_id))
        
        conn.commit()
        conn.close()
        
        return True
