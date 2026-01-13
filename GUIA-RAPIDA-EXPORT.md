# 🚀 Guía Rápida: Solucionar Problema de Exportación

## ⚡ Solución en 3 Pasos

### 1️⃣ Ejecuta el Script de Debug

```bash
python test-export-debug.py tu_template.pptx
```

Este script te mostrará:
- ✅ Qué textos tiene tu template
- ✅ Qué tipos se detectan (title, subtitle, body)
- ✅ Si el contenido se aplica correctamente
- ✅ Dónde está el problema si falla

### 2️⃣ Revisa los Logs

Busca esta sección:

```
📦 Shape 1 (ID: 2): tipo detectado = 'title'
   📄 1 párrafos encontrados
      Párrafo 1: 1 runs
         Run 1: 'Título Original'
   ✅ Reemplazando TITLE: 'Título Original' -> 'Mi Nuevo Título'

📊 Total de reemplazos: 3
```

**✅ Si ves reemplazos > 0**: ¡Funciona! El contenido se está aplicando.

**❌ Si ves reemplazos = 0**: Los tipos no coinciden. Ve al paso 3.

### 3️⃣ Soluciona Según el Problema

#### Problema A: Tipos No Coinciden

**Ejemplo de log**:
```
📝 Contenido disponible:
   - title: Mi Título
   - bullets: 3 items

📦 Shape 1: tipo detectado = 'body'  ← ❌ Debería ser 'title'
⏭️ No hay contenido para tipo 'body'
📊 Total de reemplazos: 0
```

**Solución Rápida** (temporal):
Cambia el tipo de contenido en el chat para que coincida:

```javascript
// En lugar de generar:
{ title: 'Mi Título' }

// Genera:
{ heading: 'Mi Título' }  // heading se mapea a 'body'
```

**Solución Permanente**:
Ajusta las heurísticas en `backend/pptx_xml_cloner.py`:

```python
def _detect_text_type(self, shape) -> str:
    # ... código existente ...
    
    # AJUSTA ESTOS VALORES según tu template:
    
    # Si títulos están más abajo en el slide
    if y_pos < 3000000:  # Aumenta este número
        return 'title'
    
    # Si títulos usan fuentes más pequeñas
    if size_pt > 24:  # Reduce este número
        return 'title'
```

#### Problema B: Template Sin Placeholders

Algunos templates no usan placeholders estándar de PowerPoint.

**Solución**: Las mejoras ya implementadas usan posición y tamaño de fuente como fallback. Debería funcionar automáticamente.

#### Problema C: Template Muy Personalizado

**Solución**: Mapeo manual por ID de shape:

```python
def _detect_text_type(self, shape) -> str:
    shape_id = self._get_shape_id(shape)
    
    # Mapeo manual para tu template específico
    if shape_id == 2:  # El shape 2 es siempre el título
        return 'title'
    elif shape_id == 3:  # El shape 3 es siempre el subtítulo
        return 'subtitle'
    elif shape_id in [4, 5, 6]:  # Estos son bullets
        return 'body'
    
    # ... resto del código ...
```

---

## 🎯 Verificación Rápida

### ✅ Checklist de Funcionamiento

- [ ] Script de debug ejecutado sin errores
- [ ] Logs muestran tipos detectados correctamente
- [ ] Logs muestran "Total de reemplazos: X" (X > 0)
- [ ] PPTX generado contiene el contenido
- [ ] Al abrir el PPTX, el texto es visible

### ❌ Si Algo Falla

1. **Copia los logs completos**
2. **Toma captura del template** (para ver estructura)
3. **Anota qué contenido intentas aplicar**
4. **Comparte esta información** para ayuda específica

---

## 🔧 Comandos Útiles

### Ejecutar Backend con Logs Visibles
```bash
cd backend
python main.py
```

### Ejecutar Frontend
```bash
npm run dev
```

### Probar Exportación
```bash
python test-export-debug.py mi_template.pptx
```

### Ver Estructura del Template
```bash
python backend/pptx_xml_cloner.py mi_template.pptx --analyze
```

---

## 📚 Documentación Completa

- **SOLUCION-EXPORT-CONTENIDO.md**: Explicación detallada del problema y solución
- **RESUMEN-CONTINUACION.md**: Resumen de todos los cambios implementados
- **test-export-debug.py**: Script de debug con logging detallado

---

## 💡 Tips

1. **Siempre ejecuta el backend con logs visibles** cuando pruebes exportación
2. **Usa el script de debug primero** antes de probar desde la app
3. **Los logs son tu mejor amigo** para diagnosticar problemas
4. **Si cambias heurísticas**, reinicia el backend para que tome efecto

---

## 🎓 Entendiendo los Tipos

- **title**: Título principal del slide (fuente grande, arriba)
- **subtitle**: Subtítulo (fuente mediana, debajo del título)
- **body**: Contenido del cuerpo (bullets, texto normal)
- **heading**: Encabezado de sección (se mapea a body)

El contenido se mapea así:
```
Contenido IA          →  Tipo Detectado
-----------------        ---------------
title / heading      →  'title'
subtitle             →  'subtitle'
bullets / body       →  'body'
```

Si los tipos no coinciden, no hay reemplazo.

---

## ⚡ Solución Ultra-Rápida

Si solo quieres que funcione YA:

1. Ejecuta: `python test-export-debug.py tu_template.pptx`
2. Si falla, cambia en `backend/pptx_xml_cloner.py` línea ~420:
   ```python
   # Cambiar de:
   if y_pos < 2000000:
       return 'title'
   
   # A:
   if y_pos < 5000000:  # Más permisivo
       return 'title'
   ```
3. Reinicia backend y prueba de nuevo

Esto hace que más shapes se detecten como 'title', aumentando las probabilidades de coincidencia.
