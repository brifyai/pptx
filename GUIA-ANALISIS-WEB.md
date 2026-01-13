# Guía: Análisis de Sitios Web con IA

## Funcionalidad

La IA puede **analizar el contenido de sitios web** y usarlo para generar presentaciones o responder preguntas.

## Cómo Usar

### Método 1: Proporcionar URL Directamente

Simplemente escribe la URL en el chat:

```
https://ejemplo.com
```

```
www.miempresa.com
```

```
ejemplo.com/productos
```

La IA detectará automáticamente la URL y analizará el sitio.

### Método 2: Pedir Análisis Explícito

```
Analiza el sitio https://ejemplo.com
```

```
Investiga la página www.miempresa.com
```

```
Busca información en ejemplo.com/about
```

### Método 3: Generar Presentación desde Web

```
@all Genera una presentación sobre la empresa en https://miempresa.com
```

```
@all Crea slides basados en el contenido de www.ejemplo.com/servicios
```

## Ejemplos de Uso

### Ejemplo 1: Analizar Empresa

**Usuario**:
```
Analiza https://apple.com y dime qué productos principales tienen
```

**IA**:
```
🌐 Analizando sitio web...

ANÁLISIS DE https://apple.com:
Título: Apple
Descripción: Discover the innovative world of Apple...

ENCABEZADOS PRINCIPALES:
• iPhone 15 Pro
• MacBook Air
• Apple Watch Series 9
• AirPods Pro

CONTENIDO:
[Contenido extraído del sitio...]

Productos principales de Apple:
1. iPhone 15 Pro - Smartphone con chip A17 Pro
2. MacBook Air - Laptop ultradelgada con chip M2
3. Apple Watch Series 9 - Smartwatch avanzado
4. AirPods Pro - Auriculares con cancelación de ruido
```

### Ejemplo 2: Generar Presentación desde Web

**Usuario**:
```
@all Genera una presentación sobre los servicios en https://miempresa.com/servicios
```

**IA**:
```
🌐 Analizando sitio web...
📊 Generando presentación...

He generado una presentación de 5 slides basada en el contenido de miempresa.com:

Slide 1: Servicios de MiEmpresa
Slide 2: Consultoría Estratégica
Slide 3: Desarrollo de Software
Slide 4: Marketing Digital
Slide 5: Soporte y Mantenimiento

✅ 5 láminas actualizadas
```

### Ejemplo 3: Comparar Sitios

**Usuario**:
```
Compara los servicios de https://empresa1.com y https://empresa2.com
```

**IA**:
```
🌐 Analizando empresa1.com...
🌐 Analizando empresa2.com...

COMPARACIÓN:

Empresa 1:
- Servicios: Consultoría, Desarrollo, Soporte
- Enfoque: Empresas grandes
- Precios: Premium

Empresa 2:
- Servicios: Desarrollo, Marketing, Diseño
- Enfoque: Startups y PyMEs
- Precios: Competitivos
```

## Información Extraída

La IA extrae automáticamente:

✅ **Título** del sitio
✅ **Descripción** (meta description)
✅ **Encabezados** principales (H1, H2, H3)
✅ **Contenido** textual (hasta 5000 caracteres)
✅ **Estructura** de la página
✅ **Palabras clave** principales

## Comandos Útiles

### Análisis General
```
Analiza https://ejemplo.com
```

### Análisis Específico
```
Analiza los productos en https://ejemplo.com/productos
```

### Generar Presentación
```
@all Crea una presentación sobre https://ejemplo.com
```

### Extraer Información
```
¿Qué servicios ofrece https://ejemplo.com?
```

### Comparación
```
Compara https://sitio1.com con https://sitio2.com
```

## Redes Sociales (Limitado)

### ⚠️ Limitaciones Importantes

Las redes sociales tienen restricciones técnicas:

❌ **No se puede extraer contenido automáticamente** de:
- Facebook
- Instagram
- TikTok
- Twitter/X
- LinkedIn

**Razones**:
1. Requieren login/autenticación
2. Contenido cargado con JavaScript
3. Protección anti-scraping
4. APIs requieren permisos especiales

### ✅ Lo Que SÍ Funciona

Cuando pegas una URL de red social, la IA:
1. **Detecta la plataforma** (Facebook, Instagram, TikTok, etc.)
2. **Extrae información de la URL** (usuario, tipo de post, ID)
3. **Proporciona guía** de cómo obtener el contenido manualmente

### Cómo Usar con Redes Sociales

#### Paso 1: Pega la URL
```
https://instagram.com/p/ABC123/
```

#### Paso 2: La IA Te Guía
```
📱 ANÁLISIS DE INSTAGRAM

⚠️ El contenido requiere extracción manual

URL: https://instagram.com/p/ABC123/
Plataforma: Instagram
Tipo: post

Para analizar este contenido:
1. Abre el enlace en tu navegador
2. Copia el texto de la publicación
3. Pégalo en el chat con contexto
```

#### Paso 3: Proporciona el Contenido
```
Analiza este post de Instagram:

"Lanzamos nuestro nuevo producto! 🚀
Características principales:
- Diseño innovador
- Tecnología de punta
- Precio accesible

#producto #innovación #tecnología"
```

#### Paso 4: La IA Analiza
```
Basado en el post de Instagram:

Producto: Nuevo lanzamiento
Características:
- Diseño innovador
- Tecnología de punta
- Precio accesible

Hashtags: #producto #innovación #tecnología
```

### Plataformas Detectadas

✅ **Facebook** - facebook.com
✅ **Instagram** - instagram.com
✅ **TikTok** - tiktok.com
✅ **Twitter/X** - twitter.com, x.com
✅ **LinkedIn** - linkedin.com
✅ **YouTube** - youtube.com, youtu.be

### Información Extraída de la URL

**Instagram**:
- Tipo: profile, post, reel
- Username: @usuario
- Post ID: ABC123

**TikTok**:
- Tipo: profile, video
- Username: @usuario
- Video ID: 123456

**Facebook**:
- Tipo: profile, page, group
- Username/Page name

**YouTube**:
- Tipo: video, channel
- Video ID
- Channel name

### Ejemplo Completo: Instagram

**1. Usuario pega URL**:
```
https://instagram.com/p/CxYz123/
```

**2. IA responde**:
```
📱 ANÁLISIS DE INSTAGRAM

⚠️ LIMITACIÓN: El contenido requiere autenticación

URL: https://instagram.com/p/CxYz123/
Plataforma: Instagram
Tipo: post
Post ID: CxYz123

Para analizar este contenido de Instagram:
1. Abre el enlace en tu navegador
2. Copia el texto de la publicación
3. Pégalo en el chat con contexto

Información útil a copiar:
- Descripción del post
- Hashtags
- Comentarios relevantes
- Número de likes/interacciones
```

**3. Usuario copia contenido**:
```
Analiza este post:

"Nueva colección primavera-verano 2024 ☀️
Descubre nuestros diseños exclusivos.
Disponible en tienda y online.

#moda #fashion #primavera2024 #colección"

Likes: 1,234
Comentarios: 56
```

**4. IA genera presentación**:
```
@all Genera presentación sobre esta colección

Resultado:
- Slide 1: Nueva Colección Primavera-Verano 2024
- Slide 2: Diseños Exclusivos
- Slide 3: Canales de Venta
- Slide 4: Engagement (1,234 likes, 56 comentarios)
```

### Ejemplo: TikTok

**URL**:
```
https://tiktok.com/@usuario/video/123456
```

**Guía de la IA**:
```
📱 ANÁLISIS DE TIKTOK

Usuario: @usuario
Tipo: video
Video ID: 123456

Para analizar:
1. Abre el video
2. Copia la descripción y hashtags
3. Describe el contenido del video
4. Pégalo en el chat
```

**Usuario proporciona**:
```
Video de TikTok sobre:

Descripción: "Tutorial de maquillaje paso a paso 💄"
Hashtags: #makeup #tutorial #beauty
Contenido: Muestra 5 pasos para maquillaje natural
Duración: 60 segundos
Views: 50K
```

### Alternativa: YouTube

YouTube es **más fácil** porque tiene contenido público:

```
https://youtube.com/watch?v=ABC123
```

La IA puede:
- Detectar el video ID
- Sugerir copiar título y descripción
- Analizar transcripción si la proporcionas

### Tips para Redes Sociales

**1. Copia Contenido Relevante**:
✅ Texto de la publicación
✅ Hashtags
✅ Descripción
✅ Métricas (likes, shares, comentarios)

**2. Proporciona Contexto**:
✅ "Post de Instagram sobre..."
✅ "Video de TikTok que muestra..."
✅ "Tweet sobre..."

**3. Describe Multimedia**:
✅ "Imagen muestra..."
✅ "Video de 30 segundos sobre..."
✅ "Carrusel de 5 fotos con..."

**4. Incluye Métricas**:
✅ Número de likes
✅ Comentarios destacados
✅ Shares/retweets
✅ Views

### Limitaciones vs Sitios Web Normales

| Característica | Sitios Web | Redes Sociales |
|----------------|------------|----------------|
| Extracción automática | ✅ Sí | ❌ No |
| Requiere login | ❌ No | ✅ Sí |
| Contenido público | ✅ Sí | ⚠️ Limitado |
| Detección de URL | ✅ Sí | ✅ Sí |
| Guía de extracción | ❌ No necesita | ✅ Sí proporciona |

### Futuras Mejoras

🔜 Integración con APIs oficiales (requiere registro)
🔜 Extracción de imágenes de posts
🔜 Análisis de métricas de engagement
🔜 Comparación de perfiles
🔜 Tendencias y hashtags

### Resumen: Redes Sociales

✅ **Detecta** URLs de redes sociales
✅ **Identifica** plataforma y tipo
✅ **Extrae** información de la URL
✅ **Proporciona guía** de extracción manual
❌ **No extrae** contenido automáticamente
💡 **Solución**: Copiar y pegar contenido manualmente

Para redes sociales, el flujo es:
1. Pega URL → 2. IA te guía → 3. Copias contenido → 4. IA analiza

### URLs Soportadas
✅ `https://ejemplo.com`
✅ `http://ejemplo.com`
✅ `www.ejemplo.com`
✅ `ejemplo.com`
✅ Dominios: .com, .net, .org, .io, .ai, .co, .es, .mx, etc.

### Contenido Accesible
✅ Sitios públicos
✅ Páginas HTML estáticas
✅ Contenido textual
❌ Contenido detrás de login
❌ JavaScript dinámico complejo
❌ Archivos PDF/documentos
❌ Contenido multimedia (videos, audio)

### Cantidad de Contenido
- **Máximo**: 5000 caracteres por sitio
- **Encabezados**: Primeros 10
- **Descripción**: Meta description completa

## Casos de Uso

### 1. Presentación de Empresa

```
Usuario: @all Genera presentación sobre https://miempresa.com

Resultado:
- Slide 1: Portada con nombre de empresa
- Slide 2: Misión y Visión
- Slide 3: Servicios Principales
- Slide 4: Equipo
- Slide 5: Contacto
```

### 2. Análisis de Competencia

```
Usuario: Analiza https://competidor.com y dime sus fortalezas

IA: Analiza el sitio y extrae:
- Productos/servicios
- Propuesta de valor
- Ventajas competitivas
- Público objetivo
```

### 3. Investigación de Mercado

```
Usuario: Investiga https://industria.com y resume las tendencias

IA: Extrae información sobre:
- Tendencias actuales
- Tecnologías emergentes
- Desafíos del sector
- Oportunidades
```

### 4. Preparación de Reunión

```
Usuario: Analiza https://cliente.com para preparar reunión

IA: Proporciona:
- Información de la empresa
- Productos/servicios
- Noticias recientes
- Puntos de conversación
```

## Detección Automática

La IA detecta automáticamente URLs en:

✅ Mensajes con URLs completas
✅ Mensajes con dominios
✅ Comandos con palabras clave:
   - "analiza"
   - "investiga"
   - "busca"
   - "revisa"
   - "consulta"
   - "página web"
   - "sitio web"

## Indicadores Visuales

Cuando la IA está analizando un sitio web, verás:

```
🌐 Analizando sitio web...
📥 Obteniendo contenido...
✅ Análisis completado
```

## Formato de Respuesta

La IA formatea la información así:

```
═══════════════════════════════════════════════════
ANÁLISIS DE SITIO WEB
═══════════════════════════════════════════════════

URL: https://ejemplo.com
Título: Ejemplo Corp
Descripción: Empresa líder en tecnología
Palabras: 1,234

ENCABEZADOS PRINCIPALES:
• Inicio
  • Productos
  • Servicios
    • Consultoría
    • Desarrollo

CONTENIDO:
[Contenido extraído...]

═══════════════════════════════════════════════════
```

## Tips y Mejores Prácticas

### 1. URLs Específicas
✅ `https://ejemplo.com/productos` - Página específica
❌ `https://ejemplo.com` - Página principal (menos específico)

### 2. Instrucciones Claras
✅ "Analiza los servicios en https://ejemplo.com/servicios"
❌ "Mira esto https://ejemplo.com"

### 3. Contexto
✅ "@all Genera presentación sobre los productos en https://ejemplo.com/productos"
❌ "@all https://ejemplo.com"

### 4. Múltiples URLs
Puedes analizar varios sitios en una conversación:
```
1. Analiza https://sitio1.com
2. Ahora analiza https://sitio2.com
3. Compara ambos
```

## Solución de Problemas

### "No se pudo acceder al sitio"

**Causas**:
- Sitio requiere login
- Bloqueo CORS
- Sitio caído
- URL incorrecta

**Solución**:
- Verifica que la URL sea correcta
- Intenta con la página principal
- Proporciona información manualmente

### "Contenido limitado"

**Causa**: Sitio usa JavaScript para cargar contenido

**Solución**:
- Proporciona información específica
- Usa páginas HTML estáticas
- Copia/pega contenido relevante

### "Análisis incompleto"

**Causa**: Sitio muy grande o complejo

**Solución**:
- Usa URLs específicas de secciones
- Proporciona contexto adicional
- Divide en múltiples análisis

## Privacidad y Seguridad

✅ **No se almacena** contenido de sitios web
✅ **No se comparte** información con terceros
✅ **Solo lectura** - No se modifica ningún sitio
✅ **Análisis temporal** - Se descarta después de usar

## Próximas Mejoras

🔜 Búsqueda web real (Google, Bing)
🔜 Análisis de PDFs
🔜 Extracción de imágenes
🔜 Análisis de redes sociales
🔜 Scraping avanzado
🔜 Cache de sitios analizados

## Resumen

✅ **Analiza sitios web** automáticamente
✅ **Extrae contenido** relevante
✅ **Genera presentaciones** desde web
✅ **Compara sitios** múltiples
✅ **Detección automática** de URLs
✅ **Formato estructurado** de información
✅ **Fácil de usar** - Solo pega la URL

La IA ahora puede investigar sitios web y usar esa información para crear presentaciones más informadas y precisas.
