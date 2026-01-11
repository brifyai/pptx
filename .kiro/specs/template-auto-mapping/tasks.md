# Implementation Plan: Template Auto-Mapping

## Overview

Este plan implementa el sistema de Auto-Mapping de Templates en fases incrementales, comenzando con la infraestructura de caché, seguido del algoritmo de matching, y finalmente la integración con el frontend.

## Tasks

- [x] 1. Configurar infraestructura de base de datos para mappings
  - [x] 1.1 Crear tablas corporate_templates y template_mappings en SQLite
    - Extender backend/database.py con las nuevas tablas
    - Agregar índices para búsqueda por hash
    - _Requirements: 4.1, 4.2_

  - [x] 1.2 Implementar clase MappingCache en backend/mapping_cache.py
    - Método generate_template_hash() usando hashlib
    - Método get_cached_mapping() para recuperar mappings
    - Método save_mapping() para persistir mappings
    - Método update_element_type() para correcciones manuales
    - _Requirements: 4.1, 4.2, 2.5_

  - [x] 1.3 Write property test for hash uniqueness
    - **Property 7: Template Hash Uniqueness and Cache Persistence**
    - **Validates: Requirements 4.1, 4.2**

- [x] 2. Implementar algoritmo de Shape Matching
  - [x] 2.1 Crear módulo backend/shape_matcher.py
    - Clase ShapeMatcher con constructor que recibe dimensiones del slide
    - Constante MATCH_THRESHOLD = 0.10 (10% del ancho)
    - _Requirements: 3.1, 3.2, 3.3_

  - [x] 2.2 Implementar método normalize_to_emu()
    - Convertir coordenadas normalizadas (0-1000) a EMUs
    - Fórmula: (coord / 1000) * dimension
    - _Requirements: 3.2_

  - [x] 2.3 Write property test for EMU conversion
    - **Property 5: EMU Conversion Proportionality**
    - **Validates: Requirements 3.2**

  - [x] 2.4 Implementar método calculate_distance()
    - Calcular distancia Manhattan entre shape y detección
    - Usar coordenadas convertidas a EMUs
    - _Requirements: 3.1_

  - [x] 2.5 Implementar método match_detections_to_shapes()
    - Iterar sobre todas las detecciones de Gemini
    - Para cada detección, encontrar el shape más cercano
    - Aplicar umbral del 10% para validar match
    - Retornar diccionario {tipo: shape_id}
    - _Requirements: 3.3, 3.4, 3.5_

  - [x] 2.6 Write property test for optimal shape matching
    - **Property 6: Optimal Shape Matching**
    - **Validates: Requirements 3.1, 3.3, 3.4, 3.5**

  - [x] 2.7 Implementar método classify_by_geometry()
    - Clasificar shapes sin metadata por posición/tamaño
    - Reglas: top < 20% → TITLE, bottom > 80% → FOOTER, etc.
    - _Requirements: 2.3_

  - [x] 2.8 Write property test for classification
    - **Property 2: Valid Element Classification**
    - **Property 3: Metadata Priority in Classification**
    - **Validates: Requirements 2.1, 2.2, 2.3**

- [x] 3. Checkpoint - Verificar módulos backend
  - Ejecutar tests de propiedades
  - Verificar que MappingCache y ShapeMatcher funcionan correctamente
  - Preguntar al usuario si hay dudas

- [x] 4. Extender servicio de Gemini Vision
  - [x] 4.1 Actualizar geminiVisionService.js con nuevo prompt técnico
    - Usar el prompt de análisis de layouts del diseño
    - Configurar respuesta JSON estructurada
    - _Requirements: 1.2_

  - [x] 4.2 Implementar función parseVisionResponse()
    - Extraer elementos del JSON de Gemini
    - Normalizar coordenadas al rango 0-1000
    - Validar tipos de elementos
    - _Requirements: 1.3, 2.1_

  - [x] 4.3 Write property test for coordinate normalization
    - **Property 1: Coordinate Normalization Bounds**
    - **Validates: Requirements 1.3**

  - [x] 4.4 Implementar retry logic con backoff exponencial
    - Máximo 2 reintentos
    - Backoff: 1s, 2s
    - _Requirements: 1.4_

- [x] 5. Crear endpoint de análisis de templates
  - [x] 5.1 Implementar endpoint POST /api/analyze-template
    - Recibir archivo PPTX
    - Verificar caché por hash
    - Si no existe, convertir a imagen y llamar a Gemini
    - Vincular detecciones con shapes usando ShapeMatcher
    - Guardar en caché y retornar
    - _Requirements: 1.1, 1.2, 4.3_

  - [x] 5.2 Implementar endpoint POST /api/update-mapping
    - Recibir template_hash, element_id, new_type
    - Actualizar en MappingCache
    - _Requirements: 2.4, 2.5_

  - [x] 5.3 Write property test for user correction persistence
    - **Property 4: User Correction Persistence**
    - **Validates: Requirements 2.5**

- [x] 6. Checkpoint - Verificar API endpoints
  - Probar endpoints con Postman/curl
  - Verificar flujo completo: upload → analyze → cache
  - Preguntar al usuario si hay dudas

- [x] 7. Implementar hook useVisionAnalysis
  - [x] 7.1 Crear src/hooks/useVisionAnalysis.js
    - Estado: elements, isAnalyzing, isCached, error
    - Función analyzeTemplate() que llama al endpoint
    - Función updateElementType() para correcciones
    - _Requirements: 1.5, 2.4_

  - [x] 7.2 Integrar con TemplateAnalyzer.jsx existente
    - Usar el hook para gestionar el análisis
    - Mostrar indicador de "Template reconocido" si viene de caché
    - _Requirements: 4.5_

- [x] 8. Implementar visualización de Bounding Boxes
  - [x] 8.1 Crear componente BoundingBoxRenderer
    - Renderizar rectángulos semitransparentes sobre imagen
    - Mostrar etiqueta con tipo en esquina superior
    - Usar colores distintos por tipo de contenido
    - _Requirements: 5.1, 5.2, 5.3_

  - [x] 8.2 Implementar interacciones de usuario
    - Hover: resaltar área y mostrar info adicional
    - Click: dropdown para cambiar tipo de contenido
    - _Requirements: 5.4, 5.5_

  - [x] 8.3 Conectar correcciones con backend
    - Al cambiar tipo, llamar a /api/update-mapping
    - Actualizar estado local
    - _Requirements: 2.4, 2.5_

- [x] 9. Implementar manejo de errores y fallbacks
  - [x] 9.1 Agregar mensajes de error específicos en frontend
    - Error de conversión: sugerir verificar formato
    - Sin detecciones: ofrecer modo manual
    - _Requirements: 6.1, 6.2_

  - [x] 9.2 Implementar logging de errores en backend
    - Registrar todos los errores con contexto
    - _Requirements: 6.5_

  - [x] 9.3 Write property test for file preservation on error
    - **Property 8: Original File Preservation on Error**
    - **Validates: Requirements 6.4**

- [x] 10. Final checkpoint - Integración completa
  - Ejecutar todos los tests de propiedades
  - Probar flujo end-to-end: upload → analyze → visualize → correct → reload
  - Verificar que el caché funciona correctamente
  - Preguntar al usuario si hay dudas

## Notes

- All tasks including property-based tests are required for robust implementation
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests use `hypothesis` (Python) and `fast-check` (JavaScript)
- El sistema debe integrarse con los componentes existentes sin romper funcionalidad
