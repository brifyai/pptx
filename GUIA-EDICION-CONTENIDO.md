# Guía: Edición y Control de Contenido

## Nuevas Funcionalidades

### 1. Editor de Contenido Inline

Ahora puedes **editar manualmente** el contenido de cada lámina con un editor visual completo.

#### Cómo Acceder

1. En el visor principal de la lámina (centro)
2. Click en el botón **"Editar"** (icono de lápiz) en la esquina superior derecha
3. Se abre el modal de edición

#### Características del Editor

**Campos Disponibles** (según el tipo de lámina):
- ✅ **Título** - Para láminas tipo "title"
- ✅ **Subtítulo** - Para láminas tipo "title"
- ✅ **Encabezado** - Para láminas de contenido
- ✅ **Puntos Clave** - Lista de bullets editable

**Funcionalidades**:
- ✅ Contador de caracteres en tiempo real
- ✅ Límites de caracteres basados en el template
- ✅ Agregar/eliminar bullets dinámicamente
- ✅ Vista previa en tiempo real
- ✅ Validación automática
- ✅ Botón "Limpiar Todo" para eliminar contenido

#### Límites de Caracteres

El editor muestra automáticamente los límites de caracteres detectados del template:
- `50/100` - Indica que has usado 50 de 100 caracteres permitidos
- Se pone **rojo** si excedes el límite
- Los límites vienen del análisis del template (textAreas)

#### Agregar/Eliminar Bullets

**Agregar**:
1. Click en "Agregar punto"
2. Escribe el contenido
3. Repite para más puntos

**Eliminar**:
1. Click en el icono "X" al lado del bullet
2. El punto se elimina inmediatamente

**Reordenar**:
- Los bullets se numeran automáticamente (1, 2, 3...)
- Puedes copiar/pegar entre campos para reordenar

### 2. Limpiar Contenido

Dos formas de eliminar contenido:

#### Opción A: Desde el Editor
1. Abrir editor de contenido
2. Click en botón **"Limpiar Todo"** (rojo, abajo izquierda)
3. Confirmar en el diálogo
4. Todo el contenido se elimina

#### Opción B: Edición Manual
1. Abrir editor
2. Borrar manualmente cada campo
3. Guardar cambios

### 3. Mostrar/Ocultar Contenido

El botón de **"ojo"** en la esquina superior derecha permite:
- ✅ **Mostrar** contenido sobre el preview (overlay activo)
- ✅ **Ocultar** contenido para ver solo el template original

**Útil para**:
- Comparar template vacío vs con contenido
- Ver el diseño original
- Verificar posicionamiento

## Flujos de Trabajo

### Flujo 1: Generar con IA y Ajustar Manualmente

```
1. Chat: "@all Genera presentación sobre [tema]"
   ↓
2. IA genera contenido para todas las láminas
   ↓
3. Preview modal → "Aplicar Cambios"
   ↓
4. Contenido visible en todas las láminas
   ↓
5. Navegar a lámina específica
   ↓
6. Click "Editar" (botón lápiz)
   ↓
7. Ajustar título, bullets, etc.
   ↓
8. "Guardar Cambios"
   ↓
9. Repetir para otras láminas si necesario
```

### Flujo 2: Discriminar Contenido por Lámina

**Problema**: La IA generó contenido para todas las láminas, pero quieres usar solo algunas.

**Solución**:

```
1. Aplicar cambios generados por IA
   ↓
2. Navegar a lámina que NO quieres usar
   ↓
3. Click "Editar"
   ↓
4. Click "Limpiar Todo"
   ↓
5. Confirmar
   ↓
6. Lámina queda vacía
   ↓
7. Repetir para otras láminas no deseadas
```

### Flujo 3: Crear Contenido Manualmente

```
1. Subir template
   ↓
2. Navegar a lámina deseada
   ↓
3. Click "Editar"
   ↓
4. Llenar campos manualmente:
   - Título
   - Subtítulo
   - Bullets
   ↓
5. Ver preview en tiempo real
   ↓
6. "Guardar Cambios"
   ↓
7. Contenido visible en la lámina
```

### Flujo 4: Mezclar IA + Manual

```
1. Generar contenido con IA para toda la presentación
   ↓
2. Aplicar cambios
   ↓
3. Lámina 1: Dejar como está (IA)
   ↓
4. Lámina 2: Editar manualmente para ajustar
   ↓
5. Lámina 3: Limpiar y crear desde cero
   ↓
6. Lámina 4: Dejar como está (IA)
   ↓
7. Exportar presentación final
```

## Casos de Uso

### Caso 1: Contenido Demasiado Largo

**Problema**: La IA generó bullets muy largos que no caben.

**Solución**:
1. Abrir editor
2. Ver contador de caracteres en rojo
3. Acortar cada bullet manualmente
4. El contador se actualiza en tiempo real
5. Guardar cuando esté dentro del límite

### Caso 2: Cambiar Orden de Bullets

**Problema**: Los bullets están en orden incorrecto.

**Solución**:
1. Abrir editor
2. Copiar contenido del bullet 3
3. Pegar en bullet 1
4. Ajustar los demás
5. Guardar

### Caso 3: Agregar Más Información

**Problema**: La IA generó 3 bullets pero necesitas 5.

**Solución**:
1. Abrir editor
2. Click "Agregar punto" (2 veces)
3. Escribir los nuevos bullets
4. Guardar

### Caso 4: Presentación Parcial

**Problema**: Template tiene 10 láminas pero solo necesitas 5.

**Solución**:
1. Generar contenido con IA
2. Aplicar a todas
3. Limpiar las 5 láminas que no usarás
4. Al exportar, las láminas vacías se pueden omitir

## Atajos y Tips

### Tips de Edición

1. **Vista Previa**: Usa la sección de preview en el editor para ver cómo quedará
2. **Límites**: Respeta los límites de caracteres para que el contenido quepa
3. **Bullets Vacíos**: Se eliminan automáticamente al guardar
4. **Cancelar**: Click fuera del modal o botón "Cancelar" para descartar cambios

### Tips de Navegación

1. **Thumbnails**: Click en miniatura izquierda para cambiar de lámina
2. **Flechas**: Usa flechas del teclado para navegar
3. **Edición Rápida**: Editar → Guardar → Siguiente lámina

### Tips de Contenido

1. **Consistencia**: Mantén un estilo similar en todas las láminas
2. **Brevedad**: Bullets cortos son más efectivos
3. **Jerarquía**: Usa título → subtítulo → bullets para estructura clara

## Interfaz del Editor

```
┌─────────────────────────────────────────────────┐
│  Editar Contenido - Lámina 2              [X]   │
├─────────────────────────────────────────────────┤
│                                                  │
│  Título                              50/100     │
│  [________________________________]              │
│                                                  │
│  Subtítulo                           30/80      │
│  [________________________________]              │
│                                                  │
│  Encabezado                          25/60      │
│  [________________________________]              │
│                                                  │
│  Puntos Clave                  Máx. 500 chars   │
│  ① [_____________________________] [X]          │
│  ② [_____________________________] [X]          │
│  ③ [_____________________________] [X]          │
│  [+ Agregar punto]                               │
│                                                  │
│  ┌─ Vista Previa: ─────────────────────────┐   │
│  │  Título Grande y Centrado               │   │
│  │  Subtítulo más pequeño                  │   │
│  │                                          │   │
│  │  Encabezado de Sección                  │   │
│  │  • Primer punto clave                   │   │
│  │  • Segundo punto clave                  │   │
│  │  • Tercer punto clave                   │   │
│  └──────────────────────────────────────────┘   │
│                                                  │
├─────────────────────────────────────────────────┤
│  [🗑️ Limpiar Todo]    [Cancelar] [✓ Guardar]   │
└─────────────────────────────────────────────────┘
```

## Botones de Control

En la esquina superior derecha del visor principal:

```
┌──────────────────────────────────┐
│                        [👁️] [✏️]  │  ← Botones de control
│                                   │
│     [Contenido del Slide]        │
│                                   │
└──────────────────────────────────┘
```

- **👁️ (Ojo)**: Mostrar/ocultar overlay de contenido
- **✏️ (Lápiz)**: Abrir editor de contenido

## Preguntas Frecuentes

**P: ¿Puedo editar múltiples láminas a la vez?**
R: No, debes editar una por una. Pero puedes usar IA para generar contenido para todas y luego ajustar individualmente.

**P: ¿Se pierden los cambios si cierro el editor sin guardar?**
R: Sí, debes hacer click en "Guardar Cambios" para aplicar las modificaciones.

**P: ¿Puedo deshacer cambios después de guardar?**
R: Sí, simplemente abre el editor de nuevo y modifica el contenido. También puedes usar "Limpiar Todo" para empezar de cero.

**P: ¿El contenido editado se exporta al PPTX?**
R: Sí, todo el contenido visible (en el overlay) se exporta al archivo PPTX final.

**P: ¿Qué pasa si excedo el límite de caracteres?**
R: El contador se pone rojo como advertencia. Puedes guardar de todos modos, pero el contenido puede no caber bien en el template.

**P: ¿Puedo copiar contenido entre láminas?**
R: Sí, abre el editor de la lámina origen, copia el texto, navega a la lámina destino, abre su editor y pega.

## Resumen

✅ **Editor completo** para modificar contenido manualmente
✅ **Limpiar contenido** con un click
✅ **Discriminar** qué láminas usar
✅ **Mezclar** contenido de IA con edición manual
✅ **Control total** sobre el contenido final
✅ **Vista previa** en tiempo real
✅ **Límites de caracteres** automáticos
