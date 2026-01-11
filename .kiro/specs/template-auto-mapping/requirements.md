# Requirements Document

## Introduction

Este documento define los requisitos para el sistema de Auto-Mapping de Templates, que permite detectar automáticamente los placeholders y elementos de diseño en archivos PPTX corporativos usando Gemini Vision, eliminando la necesidad de configuración manual por parte del usuario.

## Glossary

- **Template_Analyzer**: Componente que coordina el análisis visual de templates PPTX
- **Vision_Service**: Servicio que interactúa con Gemini 1.5 Flash para análisis de imágenes
- **Shape_Matcher**: Módulo que vincula las detecciones de IA con los objetos reales del XML de PowerPoint
- **Mapping_Cache**: Sistema de persistencia que almacena los mapeos para evitar re-análisis
- **Placeholder**: Área detectada en un slide destinada a contener contenido específico (título, cuerpo, imagen, etc.)
- **EMU**: English Metric Units - unidad de medida interna de PowerPoint
- **Bounding_Box**: Coordenadas rectangulares que delimitan un elemento detectado

## Requirements

### Requirement 1: Análisis Automático de Templates

**User Story:** Como usuario, quiero que al subir un archivo PPTX corporativo, el sistema detecte automáticamente las áreas de contenido sin que yo tenga que configurar nada manualmente.

#### Acceptance Criteria

1. WHEN un usuario sube un archivo PPTX, THE Template_Analyzer SHALL convertir el primer Slide Master a imagen PNG en menos de 3 segundos
2. WHEN la imagen del slide está lista, THE Vision_Service SHALL enviar la imagen a Gemini 1.5 Flash con el prompt técnico de análisis de layouts
3. WHEN Gemini responde, THE Vision_Service SHALL parsear el JSON de respuesta y extraer las coordenadas normalizadas (0-1000) de cada elemento detectado
4. IF Gemini devuelve un JSON inválido o vacío, THEN THE Vision_Service SHALL reintentar la solicitud hasta 2 veces antes de reportar error
5. WHEN el análisis completa exitosamente, THE Template_Analyzer SHALL mostrar los bounding boxes superpuestos sobre la imagen del template

### Requirement 2: Clasificación de Propósitos de Elementos

**User Story:** Como usuario, quiero que el sistema identifique automáticamente qué tipo de contenido va en cada área (título, cuerpo, imagen, footer) para que la IA genere contenido apropiado.

#### Acceptance Criteria

1. THE Vision_Service SHALL clasificar cada elemento detectado en uno de estos tipos: TITLE, SUBTITLE, BODY, FOOTER, IMAGE_HOLDER, CHART_AREA, o UNKNOWN
2. WHEN un elemento tiene metadata nativa de PowerPoint (placeholder_type), THE Shape_Matcher SHALL usar esa información como fuente primaria de clasificación
3. WHEN un elemento no tiene metadata nativa, THE Shape_Matcher SHALL aplicar heurísticas geométricas basadas en posición y tamaño relativo
4. WHEN la clasificación automática se completa, THE Template_Analyzer SHALL permitir al usuario corregir manualmente cualquier clasificación incorrecta
5. WHEN el usuario corrige una clasificación, THE Mapping_Cache SHALL persistir la corrección para futuros usos del mismo template

### Requirement 3: Vinculación con Objetos XML de PowerPoint

**User Story:** Como desarrollador del sistema, necesito que las detecciones visuales de Gemini se vinculen con los shape_ids reales del archivo PPTX para poder inyectar contenido sin romper el diseño.

#### Acceptance Criteria

1. WHEN el análisis visual completa, THE Shape_Matcher SHALL recorrer todos los shapes del slide y calcular la distancia entre cada shape y cada detección de Gemini
2. THE Shape_Matcher SHALL convertir las coordenadas de Gemini (0-1000) a EMUs usando las dimensiones reales del slide
3. WHEN la distancia entre un shape y una detección es menor al 10% del ancho del slide, THE Shape_Matcher SHALL considerar ese shape como match
4. IF múltiples shapes coinciden con una detección, THEN THE Shape_Matcher SHALL seleccionar el shape con menor distancia
5. WHEN el matching completa, THE Shape_Matcher SHALL generar un diccionario que mapee cada tipo de contenido (TITLE, BODY, etc.) a su shape_id correspondiente

### Requirement 4: Persistencia y Caché de Mappings

**User Story:** Como usuario frecuente, quiero que cuando suba el mismo template por segunda vez, el sistema lo reconozca instantáneamente sin volver a analizarlo.

#### Acceptance Criteria

1. WHEN un template es analizado por primera vez, THE Mapping_Cache SHALL almacenar el mapping completo en la base de datos SQLite
2. THE Mapping_Cache SHALL generar un hash único del archivo PPTX para identificar templates duplicados
3. WHEN un usuario sube un PPTX, THE Mapping_Cache SHALL verificar primero si existe un mapping previo para ese hash
4. IF existe un mapping previo, THEN THE Template_Analyzer SHALL cargar el mapping desde caché en menos de 100ms sin llamar a Gemini
5. WHEN un mapping es cargado desde caché, THE Template_Analyzer SHALL mostrar un indicador visual de "Template reconocido"

### Requirement 5: Visualización de Bounding Boxes

**User Story:** Como usuario, quiero ver visualmente qué áreas detectó la IA en mi template para poder validar que entendió correctamente la estructura antes de generar contenido.

#### Acceptance Criteria

1. WHEN el análisis completa, THE Template_Analyzer SHALL renderizar rectángulos semitransparentes sobre cada área detectada
2. THE Template_Analyzer SHALL mostrar una etiqueta con el tipo de contenido (TITLE, BODY, etc.) en la esquina superior de cada bounding box
3. THE Template_Analyzer SHALL usar colores distintos para cada tipo de contenido para facilitar la identificación visual
4. WHEN el usuario hace hover sobre un bounding box, THE Template_Analyzer SHALL resaltar el área y mostrar información adicional (dimensiones, confianza)
5. WHEN el usuario hace clic en un bounding box, THE Template_Analyzer SHALL permitir cambiar el tipo de contenido asignado mediante un dropdown

### Requirement 6: Manejo de Errores y Fallbacks

**User Story:** Como usuario, quiero que el sistema maneje graciosamente los casos donde la IA no puede analizar correctamente mi template.

#### Acceptance Criteria

1. IF la conversión de PPTX a imagen falla, THEN THE Template_Analyzer SHALL mostrar un mensaje de error específico y sugerir verificar el formato del archivo
2. IF Gemini no detecta ningún elemento, THEN THE Template_Analyzer SHALL ofrecer un modo de mapeo manual donde el usuario puede dibujar las áreas
3. IF el matching de shapes no encuentra correspondencias, THEN THE Shape_Matcher SHALL registrar el evento y notificar al usuario que el template puede tener una estructura no estándar
4. WHEN ocurre cualquier error, THE Template_Analyzer SHALL preservar el archivo original sin modificaciones
5. THE Template_Analyzer SHALL registrar todos los errores en un log para diagnóstico posterior
